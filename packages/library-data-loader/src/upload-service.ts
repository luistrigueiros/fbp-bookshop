import { extractBook, type Book as ExtractedBook } from 'library-excel-extractor'
import { createRepositories, loaderLogger, type DB, UploadStatus } from 'library-data-layer'
import type { R2Bucket, Queue } from '@cloudflare/workers-types'

export interface ProcessUploadResult {
  message: string
  key: string
}

export interface UploadQueueMessage {
  key: string
  filename: string
}

export interface BookQueueMessage {
  uploadKey: string
  book: ExtractedBook
  isLast: boolean
}

/**
 * Handles the initial upload by storing the file in R2 and creating a status record.
 */
export async function handleUpload(
  file: File,
  bucket: R2Bucket,
  queue: Queue<UploadQueueMessage>,
  db: DB
): Promise<ProcessUploadResult> {
  const key = `uploads/${Date.now()}-${file.name}`;
  const repos = createRepositories(db);
  
  // Create initial status record
  await repos.uploads.create({
    key,
    filename: file.name,
    status: UploadStatus.UPLOADED,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  loaderLogger.info("Storing upload in R2: {key}", { key });
  await bucket.put(key, await file.arrayBuffer());
  
  loaderLogger.info("Sending message to queue for processing: {key}", { key });
  await queue.send({ key, filename: file.name });

  return {
    message: 'File upload accepted and queued for processing',
    key
  }
}

/**
 * Processes the Excel file from R2 and splits it into individual book messages.
 */
export async function processExcelQueueMessage(
  key: string,
  bucket: R2Bucket,
  bookQueue: Queue<BookQueueMessage>,
  db: DB
): Promise<void> {
  loaderLogger.info("Processing Excel queue message for key: {key}", { key });
  const repos = createRepositories(db);

  try {
    // Update status to PROCESSING
    await repos.uploads.update(key, { status: UploadStatus.PROCESSING });

    const object = await bucket.get(key);
    if (!object) {
      throw new Error(`Object not found in R2: ${key}`);
    }

    const arrayBuffer = await object.arrayBuffer();
    const result = extractBook(arrayBuffer);
    loaderLogger.info("Extracted {count} books from Excel file", { count: result.count });

    // Update expected books count
    await repos.uploads.update(key, { booksCount: result.count });

    if (result.count === 0) {
      await repos.uploads.update(key, { status: UploadStatus.PROCESSED_SUCCESSFULLY });
      return;
    }

    // Send each book to the book queue
    for (let i = 0; i < result.items.length; i++) {
      const isLast = i === result.items.length - 1;
      await bookQueue.send({
        uploadKey: key,
        book: result.items[i],
        isLast
      });
    }

    loaderLogger.info("Queued {count} books for individual processing from key: {key}", { 
      count: result.count,
      key 
    });

  } catch (error) {
    const errorMessage = (error as Error).message;
    loaderLogger.error("Failed to process Excel upload {key}: {error}", { key, error: errorMessage });
    
    // Mark as PROCESSED_FAILED
    await repos.uploads.update(key, { 
      status: UploadStatus.PROCESSED_FAILED,
      error: errorMessage
    });
    
    throw error;
  }
}

/**
 * Processes a single book from the book queue.
 */
export async function processBookQueueMessage(
  message: BookQueueMessage,
  db: DB
): Promise<void> {
  const { uploadKey, book, isLast } = message;
  const repos = createRepositories(db);

  try {
    // 1. Handle Genre and Publisher (ensure they exist)
    const genreIds: number[] = [];
    for (const g of book.genres) {
      let genre = await repos.genres.findByName(g.name);
      if (!genre) {
        genre = await repos.genres.create({ name: g.name });
      }
      genreIds.push(genre.id);
    }

    let publisherId: number | null = null;
    if (book.publisher) {
      let publisher = await repos.publishers.findByName(book.publisher.name);
      if (!publisher) {
        publisher = await repos.publishers.create({ name: book.publisher.name });
      }
      publisherId = publisher.id;
    }

    // 2. Insert or update book
    const bookData = {
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      barcode: book.barcode,
      price: book.price,
      language: book.language,
      genreIds,
      publisherId,
    };

    const existingBook = await repos.books.findByUniqueCriteria(
      bookData.title,
      bookData.author,
      bookData.isbn
    );

    if (existingBook) {
      loaderLogger.debug("Updating existing book: {title} (ID: {id})", { 
        title: bookData.title, 
        id: existingBook.id 
      });
      await repos.books.update(existingBook.id, bookData);
    } else {
      loaderLogger.debug("Creating new book: {title}", { title: bookData.title });
      await repos.books.create(bookData);
    }

    // 3. Update status
    // Use an atomic-like increment for processedCount
    // Since D1 doesn't have an easy "increment" in the repository pattern here without custom SQL,
    // we'll fetch and update, which is slightly risky for race conditions but better than processing all at once.
    const upload = await repos.uploads.findByKey(uploadKey);
    if (upload) {
      const newProcessedCount = (upload.processedCount || 0) + 1;
      
      const updateData: any = { processedCount: newProcessedCount };
      
      if (isLast || newProcessedCount >= (upload.booksCount || 0)) {
        updateData.status = UploadStatus.PROCESSED_SUCCESSFULLY;
        loaderLogger.info("Finished processing all books for upload: {key}", { key: uploadKey });
      }

      await repos.uploads.update(uploadKey, updateData);
    }

  } catch (error) {
    const errorMessage = (error as Error).message;
    loaderLogger.error("Failed to process book for upload {key}: {error}", { 
      key: uploadKey, 
      error: errorMessage,
      book: book.title
    });
    
    // If one book fails, we might want to mark the whole upload as failed or just log it.
    // Given the requirement "if there is an error in the middle it does not process the remaining records",
    // processing them individually ALREADY helps.
    // We update the error field but keep going for other books.
    await repos.uploads.update(uploadKey, { 
      error: `Partial failure: ${errorMessage}`
    });
    
    throw error;
  }
}

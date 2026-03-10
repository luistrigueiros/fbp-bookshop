import { extractBook } from 'library-excel-extractor'
import { createRepositories, loaderLogger, type DB, UploadStatus } from 'library-data-layer'
import type { R2Bucket } from '@cloudflare/workers-types'

export interface ProcessUploadResult {
  message: string
  key: string
}

/**
 * Handles the initial upload by storing the file in R2 and creating a status record.
 */
export async function handleUpload(
  file: File,
  bucket: R2Bucket,
  queue: Queue<any>,
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
 * Processes a message from the queue by fetching the file from R2 and inserting data into D1.
 */
export async function processQueueMessage(
  key: string,
  bucket: R2Bucket,
  db: DB
): Promise<void> {
  loaderLogger.info("Processing queue message for key: {key}", { key });
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

    const genreMap = new Map<string, number>();
    const publisherMap = new Map<string, number>();

    // Extract unique genres and publishers first
    const uniqueGenres = Array.from(new Set(result.items.flatMap(i => i.genres.map(g => g.name)).filter(Boolean)));
    const uniquePublishers = Array.from(new Set(result.items.map(i => i.publisher?.name).filter(Boolean))) as string[];

    for (const name of uniqueGenres) {
      let genre = await repos.genres.findByName(name);
      if (!genre) {
        genre = await repos.genres.create({ name });
      }
      genreMap.set(name, genre.id);
    }

    for (const name of uniquePublishers) {
      let publisher = await repos.publishers.findByName(name);
      if (!publisher) {
        publisher = await repos.publishers.create({ name });
      }
      publisherMap.set(name, publisher.id);
    }

    // Insert or update books
    let processedCount = 0;
    for (const item of result.items) {
      const bookData = {
        title: item.title,
        author: item.author,
        isbn: item.isbn,
        barcode: item.barcode,
        price: item.price,
        language: item.language,
        genreIds: item.genres.map(g => genreMap.get(g.name)).filter((id): id is number => id !== undefined),
        publisherId: item.publisher ? publisherMap.get(item.publisher.name) : null,
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
      
      processedCount++;
      
      // Update processed count in DB every 10 books
      if (processedCount % 10 === 0 || processedCount === result.items.length) {
        await repos.uploads.update(key, { processedCount });
        loaderLogger.debug("Processed {total} books", { total: processedCount });
      }
    }

    // Mark as PROCESSED_SUCCESSFULLY
    await repos.uploads.update(key, { status: UploadStatus.PROCESSED_SUCCESSFULLY });
    loaderLogger.info("Successfully processed upload with {count} books from key: {key}", { 
      count: result.count,
      key 
    });

  } catch (error) {
    const errorMessage = (error as Error).message;
    loaderLogger.error("Failed to process upload {key}: {error}", { key, error: errorMessage });
    
    // Mark as PROCESSED_FAILED
    await repos.uploads.update(key, { 
      status: UploadStatus.PROCESSED_FAILED,
      error: errorMessage
    });
    
    throw error;
  }
}

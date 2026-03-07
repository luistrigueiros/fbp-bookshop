import { extractBook } from 'library-excel-extractor'
import { createRepositories, loaderLogger, type DB } from 'library-data-layer'
import type { R2Bucket } from '@cloudflare/workers-types'

export interface ProcessUploadResult {
  message: string
  key: string
}

/**
 * Handles the initial upload by storing the file in R2.
 * The actual processing happens asynchronously via a Queue.
 */
export async function handleUpload(
  file: File,
  bucket: R2Bucket,
  queue: Queue<any>
): Promise<ProcessUploadResult> {
  const key = `uploads/${Date.now()}-${file.name}`;
  
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

  const object = await bucket.get(key);
  if (!object) {
    throw new Error(`Object not found in R2: ${key}`);
  }

  const arrayBuffer = await object.arrayBuffer();
  const result = extractBook(arrayBuffer);
  loaderLogger.info("Extracted {count} books from Excel file", { count: result.count });

  const repos = createRepositories(db);

  const genderMap = new Map<string, number>();
  const publisherMap = new Map<string, number>();

  // Extract unique genders and publishers first to minimize DB calls
  const uniqueGenders = Array.from(new Set(result.items.map(i => i.gender?.name).filter(Boolean))) as string[];
  const uniquePublishers = Array.from(new Set(result.items.map(i => i.publisher?.name).filter(Boolean))) as string[];

  loaderLogger.debug("Ensuring {gCount} genders and {pCount} publishers exist", { 
    gCount: uniqueGenders.length, 
    pCount: uniquePublishers.length 
  });

  for (const name of uniqueGenders) {
    let gender = await repos.genders.findByName(name);
    if (!gender) {
      gender = await repos.genders.create({ name });
    }
    genderMap.set(name, gender.id);
  }

  for (const name of uniquePublishers) {
    let publisher = await repos.publishers.findByName(name);
    if (!publisher) {
      publisher = await repos.publishers.create({ name });
    }
    publisherMap.set(name, publisher.id);
  }

  // Batch insert books in chunks of 10 to avoid D1 limits (100 placeholders)
  const BATCH_SIZE = 10;
  for (let i = 0; i < result.items.length; i += BATCH_SIZE) {
    const chunk = result.items.slice(i, i + BATCH_SIZE).map(item => ({
      title: item.title,
      author: item.author,
      isbn: item.isbn,
      barcode: item.barcode,
      price: item.price,
      language: item.language,
      genderId: item.gender ? genderMap.get(item.gender.name) : null,
      publisherId: item.publisher ? publisherMap.get(item.publisher.name) : null,
    }));
    
    await repos.books.createMany(chunk);
    loaderLogger.debug("Inserted batch of {count} books", { count: chunk.length });
  }

  loaderLogger.info("Successfully processed upload with {count} books from key: {key}", { 
    count: result.count,
    key 
  });

  // Optionally delete the object from R2 after processing
  // await bucket.delete(key);
}

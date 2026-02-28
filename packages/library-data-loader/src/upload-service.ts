import { extractBook } from 'library-excel-extractor'
import { initDB, createRepositories } from 'library-data-layer'
import { D1Database } from "@cloudflare/workers-types";

export interface ProcessUploadResult {
  message: string
  booksCount: number
}

export async function processUpload(
  file: File,
  db: D1Database
): Promise<ProcessUploadResult> {
  const arrayBuffer = await file.arrayBuffer()
  const result = extractBook(arrayBuffer as any)

  const d1 = initDB(db)
  const repos = createRepositories(d1)

  const genderMap = new Map<string, number>()
  const publisherMap = new Map<string, number>()

  for (const item of result.items) {
    if (item.gender && !genderMap.has(item.gender.name)) {
      let gender = await repos.genders.findByName(item.gender.name)
      if (!gender) {
        gender = await repos.genders.create({ name: item.gender.name })
      }
      genderMap.set(item.gender.name, gender.id)
    }

    if (item.publisher && !publisherMap.has(item.publisher.name)) {
      let publisher = await repos.publishers.findByName(item.publisher.name)
      if (!publisher) {
        publisher = await repos.publishers.create({ name: item.publisher.name })
      }
      publisherMap.set(item.publisher.name, publisher.id)
    }

    await repos.books.create({
      title: item.title,
      author: item.author,
      isbn: item.isbn,
      barcode: item.barcode,
      price: item.price,
      language: item.language,
      genderId: item.gender ? genderMap.get(item.gender.name) : null,
      publisherId: item.publisher ? publisherMap.get(item.publisher.name) : null,
    })
  }

  return {
    message: 'File processed and data stored successfully',
    booksCount: result.count
  }
}

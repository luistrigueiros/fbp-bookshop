
## Recommended Database Schema

```typescript
// Book media table
export const bookMedia = sqliteTable(
  "book_media",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    bookId: integer("book_id").notNull().references(() => book.id, {
      onDelete: "cascade",
    }),
    
    // Media metadata
    mediaType: text("media_type", { length: 20 }).notNull(), // 'image', 'video', 'audio'
    mediaCategory: text("media_category", { length: 30 }).notNull(), // 'cover', 'back_cover', 'promotional', 'interview', 'event'
    
    // R2 storage info
    r2Key: text("r2_key", { length: 255 }).notNull(), // Unique key in R2 bucket
    fileName: text("file_name", { length: 255 }).notNull(),
    fileSize: integer("file_size"), // in bytes
    mimeType: text("mime_type", { length: 100 }),
    
    // Image specific (for optimization)
    width: integer("width"),
    height: integer("height"),
    thumbnailKey: text("thumbnail_key", { length: 255 }), // For thumbnails
    
    // Display settings
    displayOrder: integer("display_order").default(0),
    isPrimary: integer("is_primary", { mode: 'boolean' }).default(false),
    
    // Metadata
    description: text("description"),
    uploadedAt: integer("uploaded_at", { mode: 'timestamp' }).notNull(),
    
    // For videos
    duration: integer("duration"), // in seconds
  },
  (t) => ({
    bookIdx: index("book_media_book_idx").on(t.bookId),
    categoryIdx: index("book_media_category_idx").on(t.mediaCategory),
    r2KeyIdx: uniqueIndex("book_media_r2key_idx").on(t.r2Key),
    primaryIdx: index("book_media_primary_idx").on(t.bookId, t.isPrimary),
  })
);
```

## R2 Storage Structure

Instead of folders (which R2 doesn't actually have - they're just prefixes), use a structured key naming convention:

```
books/{bookId}/{category}/{timestamp}-{filename}
```

Examples:
- `books/123/cover/1649234567890-front_cover.jpg`
- `books/123/cover/1649234567890-front_cover-thumbnail.jpg`
- `books/123/promotional/1649234567890-author_event.mp4`
- `books/123/interview/1649234567890-interview.mp3`

## Implementation Code

### 1. Media Upload Service

```typescript
// services/mediaService.ts
interface UploadOptions {
  bookId: number;
  mediaCategory: 'cover' | 'back_cover' | 'promotional' | 'interview' | 'event';
  file: File;
  description?: string;
  isPrimary?: boolean;
}

export async function uploadBookMedia(options: UploadOptions, env: Env) {
  const { bookId, mediaCategory, file, description, isPrimary } = options;
  
  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const r2Key = `books/${bookId}/${mediaCategory}/${timestamp}-${sanitizedFilename}`;
  
  // Process image if it's an image
  let processedBuffer = await file.arrayBuffer();
  let metadata: any = { mimeType: file.type };
  
  if (file.type.startsWith('image/')) {
    // Get image dimensions
    const dimensions = await getImageDimensions(processedBuffer);
    metadata.width = dimensions.width;
    metadata.height = dimensions.height;
    
    // Optimize image
    processedBuffer = await optimizeImage(processedBuffer, {
      maxWidth: 1200,
      quality: 85
    });
    
    // Create and upload thumbnail
    const thumbnailBuffer = await createThumbnail(processedBuffer, {
      width: 300,
      height: 300,
      fit: 'cover'
    });
    
    const thumbnailKey = `books/${bookId}/${mediaCategory}/${timestamp}-thumb-${sanitizedFilename}`;
    await env.MY_BUCKET.put(thumbnailKey, thumbnailBuffer, {
      httpMetadata: { contentType: 'image/jpeg' },
      customMetadata: { type: 'thumbnail' }
    });
    
    metadata.thumbnailKey = thumbnailKey;
  }
  
  // Upload to R2
  await env.MY_BUCKET.put(r2Key, processedBuffer, {
    httpMetadata: { 
      contentType: file.type,
      contentDisposition: `inline; filename="${sanitizedFilename}"`
    },
    customMetadata: {
      bookId: bookId.toString(),
      category: mediaCategory,
      ...metadata
    }
  });
  
  // Save to D1
  const db = drizzle(env.DB);
  await db.insert(bookMedia).values({
    bookId,
    mediaType: file.type.split('/')[0], // 'image', 'video', etc.
    mediaCategory,
    r2Key,
    fileName: file.name,
    fileSize: processedBuffer.byteLength,
    mimeType: file.type,
    width: metadata.width,
    height: metadata.height,
    thumbnailKey: metadata.thumbnailKey,
    displayOrder: await getNextDisplayOrder(bookId, mediaCategory, env),
    isPrimary: isPrimary || false,
    description,
    uploadedAt: new Date(),
  });
  
  return { r2Key, thumbnailKey: metadata.thumbnailKey };
}
```

### 2. Image Optimization Functions

```typescript
// utils/imageOptimizer.ts
async function optimizeImage(
  buffer: ArrayBuffer, 
  options: { maxWidth: number; quality: number }
): Promise<ArrayBuffer> {
  // Using a library like sharp or jimp would be ideal
  // For Cloudflare Workers, consider using @jsquash/xxx libraries
  
  // This is a placeholder - implement actual optimization
  // Return optimized image buffer
  return buffer;
}

async function createThumbnail(
  buffer: ArrayBuffer,
  options: { width: number; height: number; fit: 'cover' | 'contain' }
): Promise<ArrayBuffer> {
  // Generate thumbnail
  // Return thumbnail buffer
  return buffer;
}
```

### 3. Fetch Media for a Book

```typescript
// services/mediaService.ts
export async function getBookMedia(
  bookId: number, 
  category?: string,
  env: Env
) {
  const db = drizzle(env.DB);
  
  let query = db.select().from(bookMedia)
    .where(eq(bookMedia.bookId, bookId));
  
  if (category) {
    query = query.where(eq(bookMedia.mediaCategory, category));
  }
  
  const mediaRecords = await query.orderBy(
    bookMedia.displayOrder
  );
  
  // Generate signed URLs for each media file
  const mediaWithUrls = await Promise.all(
    mediaRecords.map(async (record) => ({
      ...record,
      url: await generateSignedUrl(record.r2Key, env),
      thumbnailUrl: record.thumbnailKey 
        ? await generateSignedUrl(record.thumbnailKey, env)
        : null
    }))
  );
  
  return mediaWithUrls;
}

async function generateSignedUrl(key: string, env: Env): Promise<string> {
  // Generate a signed URL valid for 1 hour
  return await env.MY_BUCKET.createSignedUrl(key, {
    expiresIn: 3600
  });
}
```

### 4. API Endpoints

```typescript
// routes/books.ts
export async function handleBookMediaUpload(request: Request, env: Env) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const bookId = parseInt(formData.get('bookId') as string);
  const category = formData.get('category') as string;
  
  if (!file || !bookId || !category) {
    return new Response('Missing required fields', { status: 400 });
  }
  
  try {
    const result = await uploadBookMedia({
      bookId,
      mediaCategory: category,
      file,
      description: formData.get('description') as string,
      isPrimary: formData.get('isPrimary') === 'true'
    }, env);
    
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response('Upload failed: ' + error.message, { status: 500 });
  }
}

export async function handleGetBookMedia(request: Request, env: Env) {
  const url = new URL(request.url);
  const bookId = parseInt(url.searchParams.get('bookId') || '0');
  const category = url.searchParams.get('category') || undefined;
  
  if (!bookId) {
    return new Response('Book ID required', { status: 400 });
  }
  
  const media = await getBookMedia(bookId, category, env);
  return new Response(JSON.stringify(media), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

## Answers to Your Specific Questions

### 1. Is this a good design?
**Yes, absolutely.** This is a scalable pattern that:
- Keeps metadata separate from the actual files
- Allows efficient querying by book ID
- Supports multiple media types per book
- Maintains referential integrity with foreign keys

### 2. Too many files in one R2 folder?
R2 doesn't actually have folders - it's a flat namespace with key prefixes. Performance doesn't degrade with many files. The key prefix approach (`books/{bookId}/...`) provides natural organization and makes it easy to list all files for a specific book.

### 3. How to pick up all media files for a book?
Two approaches:
1. **Database-first** (recommended): Query the `bookMedia` table to get all R2 keys, then fetch from R2
2. **R2 listing**: Use R2's list operation with prefix `books/{bookId}/`

The database approach is more efficient as you get metadata without additional R2 calls.

### 4. Should I use zip files?
**No, avoid zip files** because:
- You'd need to unzip to display individual images
- Can't stream individual images efficiently
- CDN caching becomes less effective
- Updates require re-uploading the entire zip

### 5. Image optimization for storage savings

Implement these strategies:

```typescript
// 1. On-the-fly optimization
app.get('/images/:key', async (request, env) => {
  const key = request.params.key;
  const width = request.query.width; // Optional resize parameter
  
  const object = await env.MY_BUCKET.get(key);
  if (!object) return new Response('Not found', { status: 404 });
  
  if (width && object.httpMetadata.contentType?.startsWith('image/')) {
    // Resize image on the fly using Cloudflare's Image Resizing
    const resized = await fetch(object.body, {
      cf: { image: { width: parseInt(width), quality: 85 } }
    });
    return new Response(resized.body);
  }
  
  return new Response(object.body);
});

// 2. Store multiple variants
async function uploadWithVariants(file: File, bookId: number, category: string) {
  const variants = [
    { size: 'original', maxWidth: 2000, quality: 90 },
    { size: 'large', maxWidth: 1200, quality: 85 },
    { size: 'medium', maxWidth: 800, quality: 80 },
    { size: 'thumbnail', maxWidth: 300, quality: 75 }
  ];
  
  for (const variant of variants) {
    const optimized = await optimizeImage(await file.arrayBuffer(), variant);
    const key = `books/${bookId}/${category}/${variant.size}-${file.name}`;
    await env.MY_BUCKET.put(key, optimized);
  }
}

// 3. Use modern formats
async function convertToWebP(buffer: ArrayBuffer): Promise<ArrayBuffer> {
  // Convert to WebP for better compression
  return buffer; // Placeholder
}
```

## Additional Considerations

1. **Caching Strategy**: Use Cloudflare's cache for images to reduce R2 reads
2. **Access Control**: Implement signed URLs for private images
3. **CDN Integration**: R2 integrates seamlessly with Cloudflare's CDN
4. **Cost Optimization**: Store thumbnails separately to reduce bandwidth for list views

This design provides a robust, scalable solution for managing book media in your bookshop application.
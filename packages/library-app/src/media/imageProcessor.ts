import * as jpeg from '@jsquash/jpeg';
import * as png from '@jsquash/png';
import resize from '@jsquash/resize';

const THUMBNAIL_MAX_PX = 200;

/**
 * Process an image buffer: decode, extract dimensions, generate thumbnail, re-encode both as JPEG.
 */
export async function processImage(
  buffer: ArrayBuffer,
  mimeType: string,
): Promise<{
  optimised: ArrayBuffer;
  thumbnail: ArrayBuffer;
  width: number;
  height: number;
}> {
  // Decode based on MIME type
  let imageData: ImageData;
  if (mimeType === 'image/jpeg' || mimeType === 'image/jpg') {
    imageData = await jpeg.decode(buffer);
  } else if (mimeType === 'image/png') {
    imageData = await png.decode(buffer);
  } else {
    throw new Error(`Unsupported image MIME type: ${mimeType}`);
  }

  const { width, height } = imageData;

  // Calculate thumbnail dimensions preserving aspect ratio
  let thumbWidth: number;
  let thumbHeight: number;
  if (width >= height) {
    thumbWidth = Math.min(width, THUMBNAIL_MAX_PX);
    thumbHeight = Math.round((height / width) * thumbWidth);
  } else {
    thumbHeight = Math.min(height, THUMBNAIL_MAX_PX);
    thumbWidth = Math.round((width / height) * thumbHeight);
  }

  // Generate thumbnail
  const thumbnailData = await resize(imageData, { width: thumbWidth, height: thumbHeight });

  // Re-encode both as JPEG with lossy compression (quality 0–100)
  const optimised = await jpeg.encode(imageData, { quality: 82 });
  const thumbnail = await jpeg.encode(thumbnailData, { quality: 75 });

  return { optimised, thumbnail, width, height };
}

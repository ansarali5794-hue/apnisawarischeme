/**
 * High-Performance Image Compressor & In-Memory Cache
 * - Converts high-resolution images into optimized WebP/JPEG format
 * - Automatically bounds dimensions to prevent memory bloat
 * - Provides lightweight in-memory cache to prevent redundant re-decoding
 */

const imageCache = new Map<string, string>();
const MAX_CACHE_SIZE = 100;

export async function compressImageToDataUrl(
  fileOrBlob: File | Blob,
  maxWidth = 480,
  maxHeight = 480,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Generate cache key for files
    const cacheKey = fileOrBlob instanceof File
      ? `${fileOrBlob.name}_${fileOrBlob.size}_${fileOrBlob.lastModified}_${maxWidth}x${maxHeight}`
      : null;

    if (cacheKey && imageCache.has(cacheKey)) {
      resolve(imageCache.get(cacheKey)!);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(fileOrBlob);
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) {
        resolve('');
        return;
      }

      const img = new Image();
      img.decoding = 'async';
      img.src = src;
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        // Calculate proportional scale
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) {
          resolve(src);
          return;
        }

        // Draw image with smooth filtering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first, fallback to JPEG
        let compressed = '';
        try {
          compressed = canvas.toDataURL('image/webp', quality);
          if (!compressed.startsWith('data:image/webp')) {
            compressed = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          compressed = canvas.toDataURL('image/jpeg', quality);
        }

        // Store in LRU cache
        if (cacheKey) {
          if (imageCache.size >= MAX_CACHE_SIZE) {
            const firstKey = imageCache.keys().next().value;
            if (firstKey) imageCache.delete(firstKey);
          }
          imageCache.set(cacheKey, compressed);
        }

        resolve(compressed);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

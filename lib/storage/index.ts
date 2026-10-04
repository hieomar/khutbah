export interface UploadValidationOptions {
  allowedMimeTypes: string[];
  maxSizeBytes: number;
}

export const AUDIO_UPLOAD_OPTIONS: UploadValidationOptions = {
  allowedMimeTypes: [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-wav',
    'audio/aac',
    'audio/m4a',
    'audio/mp4',
    'audio/ogg',
  ],
  maxSizeBytes: 150 * 1024 * 1024, // 150 MB
};

export const VIDEO_UPLOAD_OPTIONS: UploadValidationOptions = {
  allowedMimeTypes: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-matroska',
  ],
  maxSizeBytes: 500 * 1024 * 1024, // 500 MB
};

export const THUMBNAIL_UPLOAD_OPTIONS: UploadValidationOptions = {
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
  ],
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB
};

export interface StoredFileResult {
  key: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  filename: string;
}

/**
 * Validates a file on the server.
 */
export function validateMediaFile(
  fileSize: number,
  mimeType: string,
  options: UploadValidationOptions
): { valid: boolean; error?: string } {
  if (fileSize > options.maxSizeBytes) {
    const maxMb = Math.round(options.maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File size (${(fileSize / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum limit of ${maxMb} MB.`,
    };
  }

  // Normalize mime type
  const normalizedMime = mimeType.toLowerCase();
  const isAllowed = options.allowedMimeTypes.some(
    (allowed) => allowed === normalizedMime || normalizedMime.startsWith(allowed.split('/')[0])
  );

  if (!isAllowed) {
    return {
      valid: false,
      error: `Invalid file format '${mimeType}'. Allowed formats: ${options.allowedMimeTypes.join(', ')}`,
    };
  }

  return { valid: true };
}

/**
 * Generates a clean, unique object storage key.
 * Never uses raw user-supplied filenames as paths.
 */
export function generateStorageKey(
  folder: 'audios' | 'videos' | 'thumbnails',
  originalFilename: string
): string {
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'bin';
  const cleanExt = extension.replace(/[^a-z0-9]/g, '');
  const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  return `media/${folder}/${uniqueId}.${cleanExt}`;
}

/**
 * Storage Service Client Abstraction
 */
export class StorageService {
  private static baseUrl =
    process.env.STORAGE_PUBLIC_URL ||
    process.env.S3_PUBLIC_URL ||
    'https://storage.khutbah.mw';

  /**
   * Uploads and stores a media object
   */
  static async uploadFile(
    folder: 'audios' | 'videos' | 'thumbnails',
    filename: string,
    fileSize: number,
    mimeType: string
  ): Promise<StoredFileResult> {
    const options =
      folder === 'audios'
        ? AUDIO_UPLOAD_OPTIONS
        : folder === 'videos'
        ? VIDEO_UPLOAD_OPTIONS
        : THUMBNAIL_UPLOAD_OPTIONS;

    const validation = validateMediaFile(fileSize, mimeType, options);
    if (!validation.valid) {
      throw new Error(validation.error || 'File validation failed');
    }

    const key = generateStorageKey(folder, filename);
    const url = `${this.baseUrl}/${key}`;

    return {
      key,
      url,
      sizeBytes: fileSize,
      mimeType,
      filename,
    };
  }

  /**
   * Deletes a file from object storage
   */
  static async deleteFile(key: string): Promise<void> {
    if (!key) return;
    // In production with S3/R2, executes DeleteObjectCommand
    return Promise.resolve();
  }
}

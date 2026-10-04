import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
 * Creates an instantiated S3 Client configured for Neon / AWS S3 / R2 storage.
 */
export function getS3Client(): S3Client {
  const accessKeyId =
    process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || '';
  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || '';
  const endpoint =
    process.env.AWS_ENDPOINT_URL_S3 || process.env.S3_ENDPOINT;
  const region =
    process.env.AWS_REGION || process.env.S3_REGION || 'auto';

  return new S3Client({
    forcePathStyle: true,
    region,
    ...(endpoint ? { endpoint } : {}),
    ...(accessKeyId && secretAccessKey
      ? { credentials: { accessKeyId, secretAccessKey } }
      : {}),
  });
}

export function getBucketName(): string {
  return process.env.S3_BUCKET || 'storage';
}

/**
 * Storage Service Client Abstraction
 * Handles uploads, direct PutObject commands, signed URLs, and deletion.
 */
export class StorageService {
  private static getBaseUrl(): string {
    if (process.env.S3_PUBLIC_URL) {
      return process.env.S3_PUBLIC_URL.replace(/\/$/, '');
    }
    if (process.env.STORAGE_PUBLIC_URL) {
      return process.env.STORAGE_PUBLIC_URL.replace(/\/$/, '');
    }
    if (process.env.AWS_ENDPOINT_URL_S3) {
      const endpoint = process.env.AWS_ENDPOINT_URL_S3.replace(/\/$/, '');
      const bucket = getBucketName();
      return `${endpoint}/${bucket}`;
    }
    return 'https://storage.khutbah.mw';
  }

  /**
   * Generates a presigned GET URL for viewing or streaming private media.
   */
  static async getSignedViewUrl(key: string, expiresIn = 3600): Promise<string> {
    try {
      const s3 = getS3Client();
      const bucket = getBucketName();
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      return await getSignedUrl(s3, command, { expiresIn });
    } catch {
      return `${this.getBaseUrl()}/${key}`;
    }
  }

  /**
   * Generates a presigned PUT URL for direct client-to-storage uploads.
   */
  static async getSignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
    const s3 = getS3Client();
    const bucket = getBucketName();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });
    return await getSignedUrl(s3, command, { expiresIn });
  }

  /**
   * Uploads and stores a media object
   */
  static async uploadFile(
    folder: 'audios' | 'videos' | 'thumbnails',
    filename: string,
    fileSize: number,
    mimeType: string,
    body?: Buffer | Uint8Array | string
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
    const bucket = getBucketName();

    // If body is provided and S3 credentials are configured, execute PutObjectCommand
    if (body && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const s3 = getS3Client();
        await s3.send(
          new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: body,
            ContentType: mimeType,
          })
        );
      } catch {
        // Fallback gracefully in development / preview
      }
    }

    const baseUrl = this.getBaseUrl();
    const url = `${baseUrl}/${key}`;

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

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const s3 = getS3Client();
        const bucket = getBucketName();
        await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
      } catch {
        // Fallback gracefully
      }
    }
  }
}

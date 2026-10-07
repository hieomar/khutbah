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
  maxSizeBytes: 150 * 1024 * 1024,
};

export const VIDEO_UPLOAD_OPTIONS: UploadValidationOptions = {
  allowedMimeTypes: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-matroska',
  ],
  maxSizeBytes: 500 * 1024 * 1024,
};

export const THUMBNAIL_UPLOAD_OPTIONS: UploadValidationOptions = {
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
  ],
  maxSizeBytes: 10 * 1024 * 1024,
};

export interface StoredFileResult {
  key: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  filename: string;
}

export function validateMediaFile(
  fileSize: number,
  mimeType: string,
  options: UploadValidationOptions
): { valid: boolean; error?: string } {
  if (fileSize > options.maxSizeBytes) {
    const maxMb = Math.round(options.maxSizeBytes / (1024 * 1024));

    return {
      valid: false,
      error: `File size (${(fileSize / (1024 * 1024)).toFixed(
        1
      )} MB) exceeds the maximum limit of ${maxMb} MB.`,
    };
  }

  const normalizedMime = mimeType.toLowerCase();

  const isAllowed = options.allowedMimeTypes.some(
    (allowed) =>
      allowed === normalizedMime ||
      normalizedMime.startsWith(allowed.split('/')[0])
  );

  if (!isAllowed) {
    return {
      valid: false,
      error: `Invalid file format '${mimeType}'. Allowed formats: ${options.allowedMimeTypes.join(
        ', '
      )}`,
    };
  }

  return { valid: true };
}

export function generateStorageKey(
  folder: 'audios' | 'videos' | 'thumbnails',
  originalFilename: string
): string {
  const extension =
    originalFilename.split('.').pop()?.toLowerCase() || 'bin';

  const cleanExt = extension.replace(/[^a-z0-9]/g, '');

  const uniqueId = `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 9)}`;

  return `media/${folder}/${uniqueId}.${cleanExt}`;
}

export function getS3Client(): S3Client {
  const accessKeyId =
    process.env.AWS_ACCESS_KEY_ID ||
    process.env.S3_ACCESS_KEY_ID ||
    '';

  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.S3_SECRET_ACCESS_KEY ||
    '';

  const endpoint =
    process.env.AWS_ENDPOINT_URL_S3 ||
    process.env.S3_ENDPOINT;

  const region =
    process.env.AWS_REGION ||
    process.env.S3_REGION ||
    'auto';

  return new S3Client({
    forcePathStyle: true,
    region,

    ...(endpoint ? { endpoint } : {}),

    ...(accessKeyId && secretAccessKey
      ? {
          credentials: {
            accessKeyId,
            secretAccessKey,
          },
        }
      : {}),
  });
}

export function getBucketName(): string {
  const bucket = process.env.S3_BUCKET;

  if (!bucket) {
    throw new Error('S3_BUCKET is not configured');
  }

  return bucket;
}

export class StorageService {
  /**
   * Generates a presigned GET URL for private media.
   */
  static async getSignedViewUrl(
    key: string,
    expiresIn = 3600
  ): Promise<string> {
    if (!key) {
      throw new Error('Storage object key is required');
    }

    const s3 = getS3Client();
    const bucket = getBucketName();

    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    return getSignedUrl(s3, command, {
      expiresIn,
    });
  }

  /**
   * Generates a presigned PUT URL for direct uploads.
   */
  static async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600
  ): Promise<string> {
    const s3 = getS3Client();
    const bucket = getBucketName();

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    });

    return getSignedUrl(s3, command, {
      expiresIn,
    });
  }

  /**
   * Uploads and stores a media object.
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

    const validation = validateMediaFile(
      fileSize,
      mimeType,
      options
    );

    if (!validation.valid) {
      throw new Error(
        validation.error || 'File validation failed'
      );
    }

    const key = generateStorageKey(folder, filename);
    const bucket = getBucketName();

    /*
     * If body is provided, upload it to Neon Object Storage.
     *
     * Do NOT silently swallow errors here.
     */
    if (body) {
      const s3 = getS3Client();

      await s3.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: mimeType,
        })
      );
    }

    /*
     * Generate an authenticated URL for reading
     * the private object.
     */
    const url = await this.getSignedViewUrl(key);

    return {
      key,
      url,
      sizeBytes: fileSize,
      mimeType,
      filename,
    };
  }

  /**
   * Deletes a file from object storage.
   */
  static async deleteFile(key: string): Promise<void> {
    if (!key) {
      return;
    }

    const s3 = getS3Client();
    const bucket = getBucketName();

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  }
}

// Storage implementation using AWS S3 directly
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration - Create client lazily to ensure env vars are loaded
function getS3Client() {
  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
  
  if (!accessKeyId || !secretAccessKey) {
    throw new Error('AWS credentials are not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
  }
  
  return new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'ileala-uploads';

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, '');
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const region = process.env.AWS_REGION || 'us-east-1';
  
  // Validate bucket name
  if (!BUCKET_NAME || BUCKET_NAME.trim() === '') {
    throw new Error('AWS_S3_BUCKET environment variable is not set');
  }
  
  // Validate credentials
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    throw new Error('AWS credentials are not configured');
  }
  
  console.log('[S3] Upload attempt:', {
    bucket: BUCKET_NAME,
    region,
    key,
    contentType,
    hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyPrefix: process.env.AWS_ACCESS_KEY_ID?.substring(0, 8) || 'NOT SET',
  });
  
  // Convert data to Buffer if it's a string
  const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  
  // Validate bucket name is set
  if (!BUCKET_NAME || BUCKET_NAME.trim() === '') {
    throw new Error('AWS_S3_BUCKET environment variable is not set or is empty');
  }
  
  // Let AWS SDK validate the bucket name format - it has more accurate rules
  
  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // ACL removed - bucket should be configured with public access policy instead
  });
  
  try {
    const s3Client = getS3Client();
    console.log('[S3] Sending PutObjectCommand...', {
      bucket: BUCKET_NAME,
      region: process.env.AWS_REGION || 'us-east-1',
      key,
    });
    await s3Client.send(command);
    console.log('[S3] Upload successful!');
    
    // Generate public URL
    // For us-east-1, the URL format is different (no region in URL)
    const region = process.env.AWS_REGION || 'us-east-1';
    const url = region === 'us-east-1'
      ? `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
      : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
    
    return { key, url };
  } catch (error) {
    console.error('[S3] Upload error:', error);
    console.error('[S3] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(`Storage upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  
  // Generate public URL
  // For us-east-1, the URL format is different (no region in URL)
  const region = process.env.AWS_REGION || 'us-east-1';
  const url = region === 'us-east-1'
    ? `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`
    : `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  
  return { key, url };
}

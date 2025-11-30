// Storage implementation using AWS S3 directly
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

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
  
  // Convert data to Buffer if it's a string
  const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  
  // Upload to S3
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // ACL removed - bucket should be configured with public access policy instead
  });
  
  try {
    await s3Client.send(command);
    
    // Generate public URL
    const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    
    return { key, url };
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(`Storage upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  
  // Generate public URL
  const url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
  
  return { key, url };
}

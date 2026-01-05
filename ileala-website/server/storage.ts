// Storage implementation using AWS S3 directly
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration - Create client lazily to ensure env vars are loaded
function getS3Client() {
  const region = process.env.AWS_REGION || 'us-east-1';
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || '';
  
  console.log('[S3] Creating S3Client with config:', {
    region,
    hasAccessKey: !!accessKeyId,
    accessKeyPrefix: accessKeyId ? accessKeyId.substring(0, 8) + '...' : 'NOT SET',
    hasSecretKey: !!secretAccessKey,
    secretKeyLength: secretAccessKey ? secretAccessKey.length : 0,
  });
  
  if (!accessKeyId || !secretAccessKey) {
    console.error('[S3] Missing credentials:', {
      hasAccessKey: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
    });
    throw new Error('AWS credentials are not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.');
  }
  
  if (accessKeyId.length < 16 || secretAccessKey.length < 20) {
    console.error('[S3] Invalid credential lengths:', {
      accessKeyLength: accessKeyId.length,
      secretKeyLength: secretAccessKey.length,
    });
    throw new Error('AWS credentials appear to be invalid. Access Key should be ~20 chars, Secret Key should be ~40 chars.');
  }
  
  const client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
  
  console.log('[S3] S3Client created successfully');
  return client;
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
  
  // Validate bucket name is set
  if (!BUCKET_NAME || BUCKET_NAME.trim() === '') {
    throw new Error('AWS_S3_BUCKET environment variable is not set or is empty');
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
  
  // Let AWS SDK validate the bucket name format - it has the correct rules
  
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
      bucketLength: BUCKET_NAME.length,
      region: process.env.AWS_REGION || 'us-east-1',
      key,
      keyLength: key.length,
      bufferSize: buffer.length,
      contentType,
    });
    
    // Try to send the command
    const startTime = Date.now();
    await s3Client.send(command);
    const duration = Date.now() - startTime;
    
    console.log('[S3] Upload successful!', {
      duration: `${duration}ms`,
      bucket: BUCKET_NAME,
      key,
    });
    
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
      code: (error as any)?.Code || (error as any)?.code || 'N/A',
      requestId: (error as any)?.requestId || (error as any)?.$metadata?.requestId || 'N/A',
      region: process.env.AWS_REGION || 'us-east-1',
      bucket: BUCKET_NAME,
      accessKeyPrefix: process.env.AWS_ACCESS_KEY_ID?.substring(0, 8) || 'NOT SET',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Provide more helpful error messages
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('bucket is not valid')) {
      throw new Error(`Bucket '${BUCKET_NAME}' is not valid. Please verify: 1) Bucket exists in region '${process.env.AWS_REGION || 'us-east-1'}', 2) Bucket name is correct, 3) AWS credentials have access to this bucket.`);
    }
    if (errorMessage.includes('InvalidAccessKeyId')) {
      throw new Error(`Invalid AWS Access Key. Please verify AWS_ACCESS_KEY_ID in Railway variables.`);
    }
    if (errorMessage.includes('SignatureDoesNotMatch')) {
      throw new Error(`Invalid AWS Secret Key. Please verify AWS_SECRET_ACCESS_KEY in Railway variables.`);
    }
    if (errorMessage.includes('Access Denied')) {
      throw new Error(`Access Denied to bucket '${BUCKET_NAME}'. Please verify IAM User has S3 permissions.`);
    }
    
    throw new Error(`Storage upload failed: ${errorMessage}`);
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

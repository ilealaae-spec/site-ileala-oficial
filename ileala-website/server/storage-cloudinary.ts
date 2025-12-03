// Storage implementation using Cloudinary
import { v2 as cloudinary } from 'cloudinary';

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
});

function normalizeKey(relKey: string): string {
  // Remove leading slashes and file extension for Cloudinary public_id
  return relKey.replace(/^\/+/, '').replace(/\.[^/.]+$/, '');
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<{ key: string; url: string }> {
  const publicId = normalizeKey(relKey);
  
  console.log('[Cloudinary] Upload attempt:', {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    publicId,
    contentType,
    hasApiKey: !!process.env.CLOUDINARY_API_KEY,
    hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
  });
  
  // Convert data to base64 for Cloudinary upload
  const buffer = typeof data === 'string' ? Buffer.from(data) : Buffer.from(data);
  const base64Data = `data:${contentType};base64,${buffer.toString('base64')}`;
  
  try {
    console.log('[Cloudinary] Uploading...');
    
    // Determine resource type based on content type
    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';
    if (contentType.startsWith('image/')) {
      resourceType = 'image';
    } else if (contentType.startsWith('video/')) {
      resourceType = 'video';
    }
    
    const result = await cloudinary.uploader.upload(base64Data, {
      public_id: publicId,
      resource_type: resourceType,
      folder: 'ileala', // Store all files in 'ileala' folder
      overwrite: true,
    });
    
    console.log('[Cloudinary] Upload successful!', {
      publicId: result.public_id,
      url: result.secure_url,
    });
    
    return {
      key: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error('[Cloudinary] Upload error:', error);
    console.error('[Cloudinary] Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    throw new Error(`Storage upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const publicId = normalizeKey(relKey);
  
  // Generate Cloudinary URL
  const url = cloudinary.url(publicId, {
    secure: true,
    resource_type: 'auto',
  });
  
  return { key: publicId, url };
}

// Helper function to upload image from URL
export async function uploadFromUrl(imageUrl: string, publicId?: string): Promise<{ key: string; url: string }> {
  try {
    console.log('[Cloudinary] Uploading from URL:', imageUrl);
    
    const result = await cloudinary.uploader.upload(imageUrl, {
      public_id: publicId,
      folder: 'ileala',
      resource_type: 'auto',
      overwrite: true,
    });
    
    console.log('[Cloudinary] Upload from URL successful!', {
      publicId: result.public_id,
      url: result.secure_url,
    });
    
    return {
      key: result.public_id,
      url: result.secure_url,
    };
  } catch (error) {
    console.error('[Cloudinary] Upload from URL error:', error);
    throw new Error(`Failed to upload from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Helper function to delete image
export async function storageDelete(publicId: string): Promise<void> {
  try {
    console.log('[Cloudinary] Deleting:', publicId);
    await cloudinary.uploader.destroy(publicId);
    console.log('[Cloudinary] Delete successful!');
  } catch (error) {
    console.error('[Cloudinary] Delete error:', error);
    throw new Error(`Failed to delete: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Upload Validator for Security
 * Validates file uploads to prevent malicious files
 */

// Allowed MIME types for images
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
];

// Maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

// Maximum image dimensions
const MAX_IMAGE_WIDTH = 4096;
const MAX_IMAGE_HEIGHT = 4096;

interface ValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

/**
 * Validate file upload
 * @param file - File object or buffer
 * @param filename - Original filename
 * @param mimeType - MIME type from upload
 * @param size - File size in bytes
 */
export function validateUpload(
  filename: string,
  mimeType: string,
  size: number
): ValidationResult {
  // 1. Check file size
  if (size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    };
  }

  // 2. Check MIME type
  if (!ALLOWED_IMAGE_TYPES.includes(mimeType.toLowerCase())) {
    return {
      valid: false,
      error: `File type ${mimeType} is not allowed. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  // 3. Check file extension
  const ext = getFileExtension(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `File extension ${ext} is not allowed. Allowed extensions: ${ALLOWED_EXTENSIONS.join(', ')}`,
    };
  }

  // 4. Sanitize filename
  const sanitizedFilename = sanitizeFilename(filename);

  // 5. Check for dangerous patterns
  if (containsDangerousPatterns(filename)) {
    return {
      valid: false,
      error: 'Filename contains dangerous patterns',
    };
  }

  return {
    valid: true,
    sanitizedFilename,
  };
}

/**
 * Get file extension from filename
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.substring(lastDot);
}

/**
 * Sanitize filename to prevent path traversal and other attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path separators
  let sanitized = filename.replace(/[\/\\]/g, '');
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  // Remove control characters
  sanitized = sanitized.replace(/[\x00-\x1f\x7f]/g, '');
  
  // Remove leading dots
  sanitized = sanitized.replace(/^\.+/, '');
  
  // Replace spaces and special characters with underscores
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');
  
  // Limit length
  if (sanitized.length > 255) {
    const ext = getFileExtension(sanitized);
    const nameWithoutExt = sanitized.substring(0, sanitized.length - ext.length);
    sanitized = nameWithoutExt.substring(0, 255 - ext.length) + ext;
  }
  
  // Ensure filename is not empty
  if (!sanitized || sanitized === '.') {
    sanitized = 'upload_' + Date.now() + '.jpg';
  }
  
  return sanitized;
}

/**
 * Check for dangerous patterns in filename
 */
function containsDangerousPatterns(filename: string): boolean {
  const dangerousPatterns = [
    /\.\./,           // Path traversal
    /\0/,             // Null byte
    /<script/i,       // Script tags
    /javascript:/i,   // JavaScript protocol
    /data:/i,         // Data protocol
    /\.exe$/i,        // Executable
    /\.bat$/i,        // Batch file
    /\.cmd$/i,        // Command file
    /\.sh$/i,         // Shell script
    /\.php$/i,        // PHP file
    /\.jsp$/i,        // JSP file
    /\.asp$/i,        // ASP file
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(filename));
}

/**
 * Validate image buffer (for additional security)
 * This checks the actual file content, not just the extension
 */
export function validateImageBuffer(buffer: Buffer): ValidationResult {
  // Check file signatures (magic numbers)
  const signatures = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    gif: [0x47, 0x49, 0x46],
    webp: [0x52, 0x49, 0x46, 0x46], // RIFF (WebP starts with RIFF)
  };
  
  // Check JPEG
  if (buffer[0] === signatures.jpeg[0] && 
      buffer[1] === signatures.jpeg[1] && 
      buffer[2] === signatures.jpeg[2]) {
    return { valid: true };
  }
  
  // Check PNG
  if (buffer[0] === signatures.png[0] && 
      buffer[1] === signatures.png[1] && 
      buffer[2] === signatures.png[2] && 
      buffer[3] === signatures.png[3]) {
    return { valid: true };
  }
  
  // Check GIF
  if (buffer[0] === signatures.gif[0] && 
      buffer[1] === signatures.gif[1] && 
      buffer[2] === signatures.gif[2]) {
    return { valid: true };
  }
  
  // Check WebP
  if (buffer[0] === signatures.webp[0] && 
      buffer[1] === signatures.webp[1] && 
      buffer[2] === signatures.webp[2] && 
      buffer[3] === signatures.webp[3]) {
    return { valid: true };
  }
  
  return {
    valid: false,
    error: 'File content does not match allowed image formats',
  };
}

/**
 * Generate safe filename with timestamp
 */
export function generateSafeFilename(originalFilename: string): string {
  const ext = getFileExtension(originalFilename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `upload_${timestamp}_${random}${ext}`;
}

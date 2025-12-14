/**
 * URL validation utilities to prevent XSS attacks via malicious URLs
 */

// Safe URL patterns - only allow HTTPS URLs from trusted domains
const SAFE_URL_PATTERNS = [
  /^https:\/\/[a-zA-Z0-9-]+\.supabase\.co\//,  // Supabase storage
  /^https:\/\/obredzilkakymvbsvild\.supabase\.co\//,  // Project-specific Supabase
  /^data:image\/(jpeg|png|gif|webp);base64,/,  // Safe base64 images only
];

// Dangerous URL schemes that should never be allowed
const DANGEROUS_SCHEMES = [
  'javascript:',
  'vbscript:',
  'data:text/html',
  'data:application/javascript',
];

/**
 * Validates if a URL is safe for use in href attributes or image sources
 */
export function isValidAttachmentUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Check for dangerous schemes
  const lowerUrl = url.toLowerCase().trim();
  for (const scheme of DANGEROUS_SCHEMES) {
    if (lowerUrl.startsWith(scheme)) {
      console.warn('Blocked dangerous URL scheme:', scheme);
      return false;
    }
  }
  
  // Must match at least one safe pattern
  return SAFE_URL_PATTERNS.some(pattern => pattern.test(url));
}

/**
 * Sanitizes a filename for display to prevent XSS
 * Removes potentially dangerous characters while keeping readability
 */
export function sanitizeFilename(filename: string | null | undefined): string {
  if (!filename) return 'Unnamed file';
  
  // Remove HTML entities and script tags
  return filename
    .replace(/[<>'"]/g, '') // Remove HTML special chars
    .replace(/&/g, '&amp;') // Encode ampersands
    .substring(0, 100); // Limit length
}

/**
 * Gets a safe URL or returns null if validation fails
 */
export function getSafeUrl(url: string | null | undefined): string | null {
  if (isValidAttachmentUrl(url)) {
    return url as string;
  }
  console.warn('Blocked unsafe URL:', url);
  return null;
}

import { headers } from 'next/headers';

/**
 * Gets the base URL for the application, taking into account proxies like ngrok
 * @returns The base URL (e.g., http://localhost:3000 or https://abc123.ngrok.io)
 */
export function getBaseUrl(req?: Request): string {
  // Check for server-side rendering
  if (typeof window === 'undefined') {
    try {
      // Server-side: try to get from headers
      if (req) {
        const headers = new Headers(req.headers);
        
        // Check for X-Forwarded-Host (set by ngrok and other proxies)
        const forwardedHost = headers.get('x-forwarded-host');
        const forwardedProto = headers.get('x-forwarded-proto');
        
        if (forwardedHost && forwardedProto) {
          return `${forwardedProto}://${forwardedHost}`;
        }
        
        // Check for Host header
        const host = headers.get('host');
        if (host) {
          // Determine protocol (assume https for ngrok and vercel domains)
          const isSecure = host.includes('ngrok.io') || 
                          host.includes('ngrok-free.app') || 
                          host.includes('vercel.app');
          const protocol = isSecure ? 'https' : 'http';
          return `${protocol}://${host}`;
        }
      }
      
      // Check for VERCEL_URL environment variable (set in Vercel deployments)
      if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
      }
      
      // Check for custom domain in environment variables
      if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
      }
    } catch (error) {
      console.error('Error getting headers:', error);
    }
    
    // Fallback to default
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  }
  
  // Client-side: use the current window location
  return window.location.origin;
}

/**
 * Updates URLs in SAML metadata to use the correct base URL
 * @param metadata The original metadata XML
 * @param baseUrl The base URL to use
 * @returns Updated metadata XML
 */
export function updateMetadataUrls(metadata: string, baseUrl: string): string {
  // Remove trailing slash if present
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  
  // Log the URL replacement for debugging
  console.log(`Replacing placeholder URLs with: ${normalizedBaseUrl}`);
  
  // Replace example.com URLs with the actual base URL
  return metadata
    .replace(/https:\/\/samlator\.example\.com/g, normalizedBaseUrl)
    .replace(/http:\/\/samlator\.example\.com/g, normalizedBaseUrl);
}

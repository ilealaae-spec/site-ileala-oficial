/**
 * Simple in-memory cache for frequently accessed data
 * For production, consider using Redis or similar
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class SimpleCache {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 1000; // Maximum number of entries

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, ttl: number = 60000): void {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Delete value from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Clear expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton instance
const cache = new SimpleCache();

// Cleanup expired entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cache.cleanup();
  }, 5 * 60 * 1000);
}

/**
 * Cache keys
 */
export const CacheKeys = {
  products: (filters?: string) => `products:${filters || 'all'}`,
  product: (id: number) => `product:${id}`,
  productBySlug: (slug: string) => `product:slug:${slug}`,
  featuredProducts: () => 'products:featured',
  collections: () => 'collections:all',
  coupons: () => 'coupons:all',
  coupon: (code: string) => `coupon:${code}`,
  newsletterStats: () => 'newsletter:stats',
} as const;

/**
 * Cache helper functions
 */
export function getCached<T>(key: string): T | null {
  return cache.get<T>(key);
}

export function setCached<T>(key: string, data: T, ttl: number = 60000): void {
  cache.set(key, data, ttl);
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}

export function invalidateCachePattern(pattern: string): void {
  // Simple pattern matching - for production, use a proper cache with pattern support
  for (const key of cache['cache'].keys()) {
    if (key.includes(pattern)) {
      cache.delete(key);
    }
  }
}

export function clearAllCache(): void {
  cache.clear();
}

/**
 * Cache middleware for tRPC procedures
 * Usage: .use(cacheMiddleware({ ttl: 60000 }))
 */
export function createCacheMiddleware(options: { ttl?: number; key?: (input: any) => string }) {
  return async ({ ctx, next, path, input }: any) => {
    const cacheKey = options.key 
      ? `${path}:${options.key(input)}`
      : `${path}:${JSON.stringify(input)}`;
    
    // Try to get from cache
    const cached = getCached(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    // Execute procedure
    const result = await next();
    
    // Cache result (only for queries, not mutations)
    if (ctx.req?.method === 'GET' || !ctx.req?.method) {
      setCached(cacheKey, result, options.ttl || 60000);
    }
    
    return result;
  };
}

export default cache;




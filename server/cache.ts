
interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AICache {
  private cache = new Map<string, CacheItem<any>>();

  set<T>(key: string, data: T, ttlMinutes: number = 10): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMinutes * 60 * 1000,
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const aiCache = new AICache();

// Clean up cache every 5 minutes
setInterval(() => {
  aiCache.cleanup();
}, 5 * 60 * 1000);

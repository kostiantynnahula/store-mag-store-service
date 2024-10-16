import { Injectable } from '@nestjs/common';

type CacheValue<T> = {
  value: T;
  expiry: number;
};

@Injectable()
export class LocalCache<T> {
  private cache: Record<string, CacheValue<T>> = {};

  set(key: string, value: T, ttl: number): void {
    const expiry = Date.now() + ttl * 1000;
    this.cache[key] = { value, expiry };

    // Automatically remove the cache after the ttl (in milliseconds)
    setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);
  }

  get(key: string): T | null {
    const cachedItem = this.cache[key];
    if (!cachedItem) {
      return null;
    }

    if (Date.now() > cachedItem.expiry) {
      this.delete(key);
      return null;
    }

    return cachedItem.value;
  }

  delete(key: string): void {
    delete this.cache[key];
  }

  clear(): void {
    this.cache = {};
  }
}

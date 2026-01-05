"use client";

import type { ICacheService, CacheItem } from "./types";
import { CACHE_CONFIG } from "./types";

export class LocalStorageService implements ICacheService {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = typeof window !== "undefined" && typeof window.localStorage !== "undefined";
  }

  get<T>(key: string): T | null {
    if (!this.isAvailable) return null;

    try {
      const item = window.localStorage.getItem(key);
      if (!item) return null;

      const parsedItem: CacheItem<T> = JSON.parse(item);

      // Check version compatibility
      if (parsedItem.version !== CACHE_CONFIG.VERSION) {
        this.remove(key);
        return null;
      }

      // Check for expiration
      if (Date.now() > parsedItem.expiry) {
        this.remove(key);
        return null;
      }

      return parsedItem.data;
    } catch (error) {
      console.error(`Error reading from cache key "${key}":`, error);
      return null;
    }
  }

  set<T>(key: string, data: T, ttl: number = CACHE_CONFIG.DEFAULT_TTL): void {
    if (!this.isAvailable) return;

    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + ttl,
        version: CACHE_CONFIG.VERSION,
      };

      window.localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error writing to cache key "${key}":`, error);
    }
  }

  remove(key: string): void {
    if (!this.isAvailable) return;
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from cache key "${key}":`, error);
    }
  }

  clear(): void {
    if (!this.isAvailable) return;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("goalshare:")) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  }
}

export const localStorageService = new LocalStorageService();

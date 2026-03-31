import { CouponMetadata } from '../types';

class CouponMetadataCache {
  private cache: CouponMetadata | null = null;
  private expiresAt = 0;
  private readonly ttlMs: number;

  constructor(ttlMs = 5000) {
    this.ttlMs = ttlMs;
  }

  get(): CouponMetadata | null {
    if (this.cache && Date.now() < this.expiresAt) {
      return this.cache;
    }
    this.cache = null;
    return null;
  }

  set(metadata: CouponMetadata): void {
    this.cache = metadata;
    this.expiresAt = Date.now() + this.ttlMs;
  }

  invalidate(): void {
    this.cache = null;
    this.expiresAt = 0;
  }
}

export default CouponMetadataCache;

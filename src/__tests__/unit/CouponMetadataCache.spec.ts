import CouponMetadataCache from '../../services/CouponMetadataCache';

describe('CouponMetadataCache', () => {
  let cache: CouponMetadataCache;

  beforeEach(() => {
    cache = new CouponMetadataCache(100);
  });

  it('캐시가 비어있으면 null을 반환한다', () => {
    expect(cache.get()).toBeNull();
  });

  it('set 후 get으로 값을 가져온다', () => {
    const metadata = { startTime: '2024-01-01', endTime: '2024-12-31', quantity: 100 };
    cache.set(metadata);
    expect(cache.get()).toEqual(metadata);
  });

  it('TTL 만료 후 null을 반환한다', async () => {
    const shortCache = new CouponMetadataCache(10);
    shortCache.set({ startTime: '2024-01-01', endTime: '2024-12-31', quantity: 100 });
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(shortCache.get()).toBeNull();
  });

  it('invalidate 후 null을 반환한다', () => {
    cache.set({ startTime: '2024-01-01', endTime: '2024-12-31', quantity: 100 });
    cache.invalidate();
    expect(cache.get()).toBeNull();
  });

  it('기본 TTL은 5000ms', () => {
    const defaultCache = new CouponMetadataCache();
    const metadata = { startTime: '2024-01-01', endTime: '2024-12-31', quantity: 100 };
    defaultCache.set(metadata);
    expect(defaultCache.get()).toEqual(metadata);
  });
});

import createRedisClient from '../../loaders/ioredis';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation((opts) => ({
    ...opts,
    quit: jest.fn().mockResolvedValue('OK'),
  }));
});

describe('createRedisClient', () => {
  it('Redis 클라이언트를 생성한다', () => {
    const client = createRedisClient();
    expect(client).toBeDefined();
  });

  it('retryStrategy는 횟수에 따라 지연을 반환한다', () => {
    const Redis = jest.requireMock('ioredis');
    createRedisClient();
    const opts = Redis.mock.calls[Redis.mock.calls.length - 1][0];
    expect(opts.retryStrategy(1)).toBe(200);
    expect(opts.retryStrategy(5)).toBe(1000);
    expect(opts.retryStrategy(10)).toBe(2000);
    expect(opts.retryStrategy(11)).toBeNull();
  });
});

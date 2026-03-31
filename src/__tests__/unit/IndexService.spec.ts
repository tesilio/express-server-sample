import IndexService from '../../services/IndexService';

describe('IndexService', () => {
  let indexService: IndexService;

  beforeEach(() => {
    indexService = new IndexService();
  });

  describe('helloWorld', () => {
    it('Hello World 메시지를 반환한다', async () => {
      const result = await indexService.helloWorld();
      expect(result).toEqual({ message: 'Hello World!' });
    });

    it('반환값은 message 프로퍼티를 포함한다', async () => {
      const result = await indexService.helloWorld();
      expect(result).toHaveProperty('message');
      expect(typeof result.message).toBe('string');
    });
  });
});

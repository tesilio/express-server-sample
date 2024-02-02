import { ResponseIndex } from '@types';

/**
 * 인덱스 서비스
 */
export class IndexService {
  async exec(): Promise<ResponseIndex> {
    return {
      message: 'Hello World!',
    };
  }
}

export default new IndexService();

import { ResponseIndex } from '@types';

/**
 * 인덱스 서비스
 */
export default class IndexService {
  async exec(): Promise<ResponseIndex> {
    return {
      message: 'Hello World!',
    };
  }
}

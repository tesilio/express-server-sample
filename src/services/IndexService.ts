import { ResponseIndexHelloWorld } from '@types';
import { Service } from 'typedi';

/**
 * 인덱스 서비스
 */
@Service()
export default class IndexService {
  /**
   * 생성자
   */
  constructor() {}

  /**
   * Hello World!
   * @returns {Promise<ResponseIndexHelloWorld>}
   */
  async helloWorld(): Promise<ResponseIndexHelloWorld> {
    return {
      message: 'Hello World!',
    };
  }
}

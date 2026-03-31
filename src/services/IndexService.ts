import { ResponseIndexHelloWorld } from '../types';

class IndexService {
  async helloWorld(): Promise<ResponseIndexHelloWorld> {
    return {
      message: 'Hello World!',
    };
  }
}

export default IndexService;

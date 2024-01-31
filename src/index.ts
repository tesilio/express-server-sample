import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import Routes from './routes';

/**
 * 서버
 */
export default class Server {
  /**
   * 서버 생성자
   * @param {e.Express} app
   */
  constructor(app: Express) {
    this.config(app);
    new Routes(app);
  }

  /**
   * 서버 설정
   * @param {e.Express} app
   * @private
   */
  private config(app: Express): void {
    app.use(express.json());
    app.use(cors());
    app.use(express.urlencoded({ extended: true }));
    app.use((error: any, _request: Request, response: Response, _next: NextFunction) => {
      console.error(error);
      response.status(500).json({ message: 'Internal Server Error' });
    });
  }
}

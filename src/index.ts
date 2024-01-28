import express, { Express, Request, Response, NextFunction } from 'express';
import Routes from './routes';

export default class Server {
  constructor(app: Express) {
    this.config(app);
    new Routes(app);
  }

  private config(app: Express): void {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use((error: any, _request: Request, response: Response, _next: NextFunction) => {
      console.error(error);
      response.status(500).json({ message: 'Internal Server Error' });
    });
  }
}

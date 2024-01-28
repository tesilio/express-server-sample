import express, { Express } from 'express';
import Routes from './routes';

export default class Server {
  constructor(app: Express) {
    this.config(app);
    new Routes(app);
  }

  private config(app: Express): void {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
  }
}

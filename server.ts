import express, { Express } from 'express';
import Server from './src/index';

const app: Express = express();
const server = new Server(app);
const HOST: string = process.env.HOST || 'localhost';
const PORT: number = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app
  .listen(PORT, HOST, () => {
    console.log(`Server is running on port ${PORT}.`);
  })
  .on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.log('Error: address already in use');
    } else {
      console.log(err);
    }
  });

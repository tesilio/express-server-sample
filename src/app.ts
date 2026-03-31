import express from 'express';
import initApp from './loaders';

const app = express();
const deps = initApp(app);

export { deps };
export default app;

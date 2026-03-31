import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import express from 'express';

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Express Server Sample API',
      version: '1.0.0',
      description: '선착순 쿠폰 발급 API 예제',
    },
    servers: [{ url: 'http://localhost:3000' }],
  },
  apis: ['./src/api/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const setupSwagger = (app: express.Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

export default setupSwagger;

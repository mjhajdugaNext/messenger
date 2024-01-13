import express, { Express } from 'express';
import http, { Server } from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import "express-async-errors";
import router from './routes';
import { errorHandler } from './middlewares';

export default function initServer(serverPort: number): {
  server: Server;
  app: Express;
} {
  const app: express.Express = express();

  app.use(
    cors({
      credentials: true,
    })
  );

  app.use(compression());
  app.use(cookieParser());
  app.use(bodyParser.json());
  app.use(router());
  app.use(errorHandler);

  const server: http.Server = http.createServer(app);

  server.listen(serverPort, () => {
    console.log(`Server running on port ${serverPort}`);
  });

  return { server, app };
}

import express, { Express } from 'express';
import http, { Server as HttpServer } from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { Server as SocketIOServer } from 'socket.io';
import compression from 'compression';
import cors from 'cors';
import "express-async-errors";
import router from './routes';
import { errorHandler } from './middlewares';
import socketRoutes from './socketRoutes';

export default function initServer(serverPort: number): {
  server: HttpServer;
  app: Express;
  socketServer: SocketIOServer,
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

  const server: HttpServer = http.createServer(app);
  const socketServer: SocketIOServer = new SocketIOServer(server);

  server.listen(serverPort, () => {
    console.log(`Server running on port ${serverPort}`);
  });

  socketRoutes(socketServer);

  return { server, app, socketServer };
}

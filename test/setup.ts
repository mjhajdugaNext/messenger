import { afterAll, afterEach } from '@jest/globals';
import mongoose from 'mongoose';
import initServer from '../src/server/initServer';
import { Server } from 'http';
import { Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import initDatabaseConnection from '../src/database/initDatabaseConnection';

const MONGO_USER = 'root';
const MONGO_PASSWORD = 'password';
const MONGO_DB_NAME = 'api_test_db';
const MONGO_PORT = 27017;
const SERVER_PORT = 8081;

export function functionalTestSetup(): {
  server: Server;
  app: Express;
  socketIOServer: SocketIOServer;
  SERVER_PORT: number;
} {
  let app: Express;
  let server: Server;
  let socketIOServer: SocketIOServer;

  try {
    const values = initServer(SERVER_PORT);
    app = values.app;
    server = values.server;
    socketIOServer = values.socketServer;
    
    initDatabaseConnection(MONGO_USER, MONGO_PASSWORD, MONGO_DB_NAME, MONGO_PORT);
  } catch (error) {
    console.error('Error when starting functional tests server ', error);
    throw error;
  }

  afterEach(async () => {
    try {
      if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.listCollections().toArray();
        await Promise.all(collections.map((collection) => mongoose.connection.collections[collection.name].drop()));
      }
    } catch (error) {
      console.error('Error during database cleanup after test ', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await server.close();
      socketIOServer.close();
      await mongoose.connection.close();
    } catch (error) {
      console.error('Error when shutting down functional tests server ', error);
      throw error;
    }
  });

  return { server, app, socketIOServer, SERVER_PORT };
}


export function integrationTestSetup(): void {
  try {
    initDatabaseConnection(MONGO_USER, MONGO_PASSWORD, MONGO_DB_NAME, MONGO_PORT);
  } catch (error) {
    console.error('Error when starting functional tests server ', error);
    throw error;
  }

  afterEach(async () => {
    try {
      if (mongoose.connection.db) {
        const collections = await mongoose.connection.db.listCollections().toArray();
        await Promise.all(collections.map((collection) => mongoose.connection.collections[collection.name].drop()));
      }
    } catch (error) {
      console.error('Error during database cleanup after test ', error);
      throw error;
    }
  });

  afterAll(async () => {
    try {
      await mongoose.connection.close();
    } catch (error) {
      console.error('Error when shutting down functional tests server ', error);
      throw error;
    }
  });
}

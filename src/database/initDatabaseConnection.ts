import mongoose from 'mongoose';

export default function initDatabaseConnection(
  mongoUser: string,
  mongoPassword: string,
  mongoDbName: string,
  mongoPort: number
): void {
  const mongoConnectionOptions = {
    user: mongoUser,
    pass: mongoPassword,
  };
  const mongoUrl = `mongodb://localhost:${mongoPort}/${mongoDbName}?authSource=admin`;

  mongoose.Promise = Promise;
  mongoose.connect(mongoUrl, mongoConnectionOptions);
  mongoose.connection.on('error', (error: Error) => console.error(error));
}

import initDatabaseConnection from './database/initDatabaseConnection';
import initServer from './server/initServer';

const MONGO_USER = 'root';
const MONGO_PASSWORD = 'password';
const MONGO_DB_NAME = 'api_prod_db'
const MONGO_PORT = 27017;
const SERVER_PORT = 8080

initServer(SERVER_PORT);
initDatabaseConnection(MONGO_USER, MONGO_PASSWORD, MONGO_DB_NAME, MONGO_PORT)

import express from 'express';
import * as userController from '../modules/users/user.controller';

const router = express.Router();

const authenticationRouter = (router: express.Router) => {
  router.post('/auth/register', userController.register);
  router.post('/auth/login', userController.login)
};

export default (): express.Router => {
  authenticationRouter(router);
  return router;
};

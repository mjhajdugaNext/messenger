import express, { type Router } from 'express';
import * as userController from '../modules/users/user.controller';
import { authenticate } from './middlewares';

const router = express.Router();

const authenticationRouter = (router: Router) => {
  router.post('/auth/register', userController.register);
  router.post('/auth/login', userController.login)
  router.get('/users', authenticate, (req, res) => {
    res.status(200).json({ message: 'middleware working' }).end();
  })
};

export default (): Router => {
  authenticationRouter(router);
  return router;
};

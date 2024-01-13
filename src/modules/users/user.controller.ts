import { IUser, IUserLogin } from './user.interface';
import * as userService from './user.service';
import express from 'express';

export const register = async (req: express.Request, res: express.Response) => {
    const { email, password, username }: IUser = req.body;

    const user = await userService.register({
      email,
      username,
      password,
    });

    return res.status(200).json(user).end();
};

export const login = async (req: express.Request, res: express.Response) => {
  const { email, password }: IUserLogin = req.body;

  const user = await userService.login({
    email,
    password,
  });

  return res.status(200).json(user).end();
};


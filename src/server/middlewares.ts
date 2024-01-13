import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';
import { NextFunction, Request, Response } from 'express';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  res.status(500).send({ message: 'Something went wrong' });
};

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decode = jwt.verify(token, JWT_SECRET);
    req.body.identity = decode;
    next();
  } catch (error) {
    res.status(401).send({ message: 'Unable to authenticate' });
  }
};

export const handler = () => {}

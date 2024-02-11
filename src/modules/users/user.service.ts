import { omit } from 'ramda';
import Joi, { Schema } from 'joi';
import { EncodeResult, IUser, IUserLogin, User } from './user.interface';
import UserModel from './user.model';
import { ApiError, validate } from '../../shared/errors';
import { encodeSession } from './jwt.utils';

export const getUsers = () => UserModel.find();

export const getUserByEmail = (email: string) => UserModel.findOne({ email });

export const getUsersBySessionToken = (sessionToken: string) =>
  UserModel.findOne({ 'authentication.sessionToken': sessionToken });

export const getUsersById = (id: string) => UserModel.findById(id);

export const createUser = (values: Record<string, any>): Promise<any> =>
  new UserModel(values).save().then((user) => omit(['password'], user.toObject()));

export const deleteUserById = (id: string) => UserModel.findOneAndDelete({ _id: id });

export const updateUserById = (id: string, values: Record<string, any>) => UserModel.findByIdAndUpdate(id, values);

export const register = async (user: IUser): Promise<User> => {
  await validate(registerValidationSchema, user);

  const existingUser = await getUserByEmail(user.email);

  if (existingUser) {
    throw new ApiError({ message: 'User already exist', httpCode: 409 });
  }

  return createUser(user);
};

export const login = async (userLogin: IUserLogin): Promise<EncodeResult> => {
  await validate(loginValidationSchema, userLogin);

  const { email, password }: IUserLogin = userLogin;

  const user: any = await getUserByEmail(email);

  if (!user) throw new ApiError({ message: 'User not exist', httpCode: 401 });

  const passowordMatching = await user.comparePassword(password);
  if (!passowordMatching) throw new ApiError({ message: 'Password is invalid', httpCode: 401 });

  const session: EncodeResult = encodeSession({
    _id: user._id,
    username: user.username,
    email: user.email,
  });

  return session;
};

const registerValidationSchema: Schema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
}).unknown(true);

const loginValidationSchema: Schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).unknown(true);

import jwt from 'jsonwebtoken';
import { IUser, IUserLogin } from './user.interface';
import UserModel from './user.model';
import { JWT_SECRET } from '../../config';

export const getUsers = () => UserModel.find();

export const getUserByEmail = (email: string) => UserModel.findOne({ email });

export const getUsersBySessionToken = (sessionToken: string) =>
  UserModel.findOne({ 'authentication.sessionToken': sessionToken });

export const getUsersById = (id: string) => UserModel.findById(id);

export const createUser = (values: Record<string, any>) =>
  new UserModel(values).save().then((user) => user.toObject());

export const deleteUserById = (id: string) =>
  UserModel.findOneAndDelete({ _id: id });

export const updateUserById = (id: string, values: Record<string, any>) =>
  UserModel.findByIdAndUpdate(id, values);

export const register = async (user: IUser) => {
  const existingUser = await getUserByEmail(user.email);

  if (existingUser) {
    throw new Error('User already exist');
  }

  const userObj = new UserModel(user);
  await userObj.save();

  return user;
};

export const login = async (userLogin: IUserLogin) => {
  const { email, password }: IUserLogin = userLogin;

  const user: any = await getUserByEmail(email);

  if (!user) throw new Error('User not found');

  const passowordMatching = await user.comparePassword(password);
  if (!passowordMatching) {
    throw new Error('Password is invalid');
  }

  const token = await jwt.sign({ id: user._id }, JWT_SECRET);
  
  return { token, user };
};

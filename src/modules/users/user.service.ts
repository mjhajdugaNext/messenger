import { EncodeResult, IUser, IUserLogin, User } from './user.interface';
import UserModel from './user.model';
import { ApiError } from '../../shared/errors';
import { encodeSession } from './jwt.utils';

export const getUsers = () => UserModel.find();

export const getUserByEmail = (email: string) => UserModel.findOne({ email });

export const getUsersBySessionToken = (sessionToken: string) =>
  UserModel.findOne({ 'authentication.sessionToken': sessionToken });

export const getUsersById = (id: string) => UserModel.findById(id);

export const createUser = (values: Record<string, any>): Promise<User> => new UserModel(values).save().then((user) => user.toObject());

export const deleteUserById = (id: string) => UserModel.findOneAndDelete({ _id: id });

export const updateUserById = (id: string, values: Record<string, any>) => UserModel.findByIdAndUpdate(id, values);

export const register = async (user: IUser): Promise<User> => {
  const existingUser = await getUserByEmail(user.email);

  if (existingUser) {
    throw new ApiError({ message: 'User already exist', httpCode: 401 });
  }

  return createUser(user);
};

export const login = async (userLogin: IUserLogin): Promise<EncodeResult> => {
  const { email, password }: IUserLogin = userLogin;

  const user: any = await getUserByEmail(email);

  if (!user) throw new ApiError({ message: 'User not exist', httpCode: 401 });

  const passowordMatching = await user.comparePassword(password);
  if (!passowordMatching) throw new ApiError({ message: 'Password is invalid', httpCode: 401 });

  const session: EncodeResult = encodeSession({
    _id: user._id,
    username: user.username,
    email: user.email,
  })

  return session;
};

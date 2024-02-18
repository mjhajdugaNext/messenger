import bcrypt from 'bcrypt';
import Joi, { Schema } from 'joi';
import {
  EncodeResult,
  IUser,
  IUserLogin,
  PUBLIC_USER_DATA_TO_OMIT,
  PartialUser,
  PartialUserPublic,
  USER_DATA_TO_OMIT,
  User,
  UserToSave,
} from './user.interface';
import UserModel from './user.model';
import { ApiError, ValidationError, validate } from '../../shared/errors';
import { encodeSession } from './jwt.utils';
import { mongooseDbOperation } from '../../shared/mongoose.helpers';
import mongoose from 'mongoose';

export const getUsers = async (filter: any = undefined, toOmit: string[] = []): Promise<PartialUser[]> => {
  return mongooseDbOperation(() => UserModel.find(filter), [...USER_DATA_TO_OMIT, ...toOmit]) as Promise<PartialUser[]>;
};

export const getUserByEmail = (email: string): Promise<User | undefined> => {
  return mongooseDbOperation(() => UserModel.findOne({ email })) as Promise<User>;
};

export const getUserById = (id: string): Promise<PartialUser> => {
  return mongooseDbOperation(
    () => UserModel.findById(new mongoose.Types.ObjectId(id)),
    USER_DATA_TO_OMIT
  ) as Promise<PartialUser>;
};

const createUserValidationSchema: Schema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required(),
  username: Joi.string().required(),
  friends: Joi.array().items(Joi.string()).optional(),
  friendsWaitingRoom: Joi.array().items(Joi.string()).optional(),
  inSomeoneWaitingRoom: Joi.array().items(Joi.string()).optional(),
  active: Joi.bool().optional(),
});

export const createUser = async (user: IUser): Promise<PartialUser> => {
  await validate(createUserValidationSchema, user);

  const userToSave: UserToSave = {
    email: user.email,
    username: user.username,
    password: user.password,
    active: !!user.active,
    lastActive: user.lastActive || null,
    friends: user.friends || [],
    friendsWaitingRoom: user.friendsWaitingRoom || [],
    inSomeoneWaitingRoom: user.inSomeoneWaitingRoom || [],
  };

  return mongooseDbOperation(() => new UserModel(userToSave).save(), USER_DATA_TO_OMIT) as Promise<PartialUser>;
};

export const deleteUserById = (id: string): Promise<PartialUser> => {
  return mongooseDbOperation(() => UserModel.findOneAndDelete({ _id: id }), USER_DATA_TO_OMIT) as Promise<PartialUser>;
};

const updateUserValidationSchema: Schema = Joi.object()
  .keys({
    email: Joi.string().optional(),
    password: Joi.string().optional(),
    username: Joi.string().optional(),
    active: Joi.bool().optional(),
    lastActive: Joi.number().optional(),
    friends: Joi.array().items(Joi.string()).optional(),
    friendsWaitingRoom: Joi.array().items(Joi.string()).optional(),
    inSomeoneWaitingRoom: Joi.array().items(Joi.string()).optional(),
  })
  .required()
  .min(1);

export const updateUserById = async (id: string, user: IUser): Promise<PartialUser> => {
  await validate(updateUserValidationSchema, user);

  const operation = async () => {
    const dbUser = await UserModel.findOne({ _id: id });

    dbUser.email = user.email || dbUser.email;
    dbUser.username = user.username || dbUser.username;
    dbUser.password = user.password || dbUser.password;
    dbUser.active = user.active || dbUser.active;
    dbUser.lastActive = user.lastActive || dbUser.lastActive;
    dbUser.friends = user.friends || dbUser.friends;
    dbUser.friendsWaitingRoom = user.friendsWaitingRoom || dbUser.friendsWaitingRoom;
    dbUser.inSomeoneWaitingRoom = user.inSomeoneWaitingRoom || dbUser.inSomeoneWaitingRoom;

    return dbUser.save();
  };

  return mongooseDbOperation(operation, USER_DATA_TO_OMIT) as Promise<PartialUser>;
};

const validateFriends = async (friends: string[]): Promise<void> => {
  try {
    await Promise.all(friends.map((friend) => getUserById(friend)));
  } catch (error) {
    throw new ValidationError({ message: 'One of passed friends is not an user', httpCode: 422 });
  }
};

export const addFriends = async (
  userId: string,
  friends: string[]
): Promise<{ updatedUser: PartialUser; updatedFriends: PartialUser[] }> => {
  await validateFriends(friends);

  const updatedFriends: PartialUser[] = [];
  for (const friend of friends) {
    // TODO: execute in parallel for optimization
    const friendUser: PartialUser = await getUserById(friend);
    const newFriendsList = Array.from(new Set([...friendUser.friendsWaitingRoom, userId]));

    const updatedFriend = await updateUserById(friend, { friendsWaitingRoom: newFriendsList });
    updatedFriends.push(updatedFriend);
  }

  const user: PartialUser = await getUserById(userId);
  const newInSomeoneWaitingRoom = Array.from(new Set([...user.inSomeoneWaitingRoom, ...friends]));
  const updatedUser: PartialUser = await updateUserById(userId, { inSomeoneWaitingRoom: newInSomeoneWaitingRoom });

  return {
    updatedUser,
    updatedFriends,
  };
};

export const acceptFriends = async (
  userId: string,
  friends: string[]
): Promise<{ updatedUser: PartialUser; updatedFriends: PartialUser[] }> => {
  await validateFriends(friends);

  const updatedFriends: PartialUser[] = [];
  for (const friend of friends) {
    const friendUser: PartialUser = await getUserById(friend);
    const newFriendsList = Array.from(new Set([...friendUser.friends, userId]));
    const newFriendsInSomeoneWaitingRoomList = friendUser.inSomeoneWaitingRoom.filter(
      (userFriend) => friends.includes(userFriend)
    );

    const updatedFriend = await updateUserById(friend, {
      friends: newFriendsList,
      inSomeoneWaitingRoom: newFriendsInSomeoneWaitingRoomList,
    });
    updatedFriends.push(updatedFriend);
  }

  const user = await getUserById(userId);
  const newFriendsList = Array.from(new Set([...user.friends, ...friends]));
  const newFriendsInWaitingRoom = user.friendsWaitingRoom.filter((userFriend) => !friends.includes(userFriend));
  const updatedUser = await updateUserById(user._id, {
    friends: newFriendsList,
    friendsWaitingRoom: newFriendsInWaitingRoom,
  });

  return { updatedUser, updatedFriends };
};

export const removeFriends = async (userId: string, friends: string[]): Promise<{ updatedUser: PartialUser, updatedFriends: PartialUser[] }> => {
  await validateFriends(friends);

  const updatedFriends: PartialUser[] = [];
  for (const friend of friends) {
    const friendUser: PartialUser = await getUserById(friend);
    const newFriendsList = friendUser.friends.filter((userFriend) => userFriend !== userId);
  
    const updatedFriend: PartialUser = await  updateUserById(friendUser._id, { friends: newFriendsList });
    updatedFriends.push(updatedFriend);
  }

  const user = await getUserById(userId);
  const newFriendsList = user.friends.filter(userFriend => !friends.includes(userFriend))
  const updatedUser = await updateUserById(userId, { friends: newFriendsList })

  return { updatedUser, updatedFriends }
};

export const getActiveFriends = async (userId: string): Promise<PartialUserPublic[]> => {
  const { friends } = await getUserById(userId);

  return getUsers({ active: true, _id: { $in: friends } }, PUBLIC_USER_DATA_TO_OMIT) as Promise<PartialUserPublic[]>;
};

export const getFriends = async (userId: string): Promise<PartialUserPublic[]> => {
  const { friends } = await getUserById(userId);

  return getUsers({ _id: { $in: friends } }, PUBLIC_USER_DATA_TO_OMIT) as Promise<PartialUserPublic[]>;
};

const registerValidationSchema: Schema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
  email: Joi.string().email().required(),
}).unknown(true);

export const register = async (user: IUser): Promise<PartialUser> => {
  await validate(registerValidationSchema, user);

  const existingUser: User | undefined = await getUserByEmail(user.email);

  if (existingUser) {
    throw new ApiError({ message: 'User already exist', httpCode: 409 });
  }

  return createUser(user);
};

const comparePassword = async (candidatePassword: string, userPassword: string): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, userPassword);
};

const loginValidationSchema: Schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
}).unknown(true);

export const login = async (userLogin: IUserLogin): Promise<EncodeResult> => {
  await validate(loginValidationSchema, userLogin);

  const { email, password }: IUserLogin = userLogin;

  const user: User = await getUserByEmail(email);

  if (!user) throw new ApiError({ message: 'User not exist', httpCode: 401 });

  const passowordMatching = await comparePassword(password, user.password);
  if (!passowordMatching) throw new ApiError({ message: 'Password is invalid', httpCode: 401 });

  const session: EncodeResult = encodeSession({
    _id: user._id,
    username: user.username,
    email: user.email,
  });

  return session;
};

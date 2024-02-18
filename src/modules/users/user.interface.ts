export interface IUser {
  _id?: string;
  username?: string;
  email?: string;
  password?: string;
  lastActive?: number;
  active?: boolean;
  friends?: string[];
  friendsWaitingRoom?: string[];
  inSomeoneWaitingRoom?: string[];
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  email: string;
  username: string;
  password: string;
  lastActive: number;
  active: boolean;
  friends: string[];
  friendsWaitingRoom: string[];
  inSomeoneWaitingRoom: string[];
}

export const USER_DATA_TO_OMIT: string[] = ['password'];

export const PUBLIC_USER_DATA_TO_OMIT: string[] = ['password', 'friends', 'friendsWaitingRoom', 'inSomeoneWaitingRoom'];

export type PartialUser = Omit<User, 'password'>;

export type PartialUserPublic = Omit<User, 'password' | 'friends' | 'friendsWaitingRoom' | 'inSomeoneWaitingRoom'>;

export type UserToSave = Omit<User, '_id'>;

export interface Session {
  _id: string;
  email: string;
  username: string;
  /**
   * Timestamp indicating when the session was created, in Unix milliseconds.
   */
  issued: number;
  /**
   * Timestamp indicating when the session should expire, in Unix milliseconds.
   */
  expires: number;
}

/**
 * Identical to the Session type, but without the `issued` and `expires` properties.
 */
export type PartialSession = Omit<Session, 'issued' | 'expires'>;

export interface EncodeResult {
  token: string;
  expires: number;
  issued: number;
}

export type DecodeResult =
  | {
      type: 'valid';
      session: Session;
    }
  | {
      type: 'integrity-error';
    }
  | {
      type: 'invalid-token';
    };

export type ExpirationStatus = 'expired' | 'active' | 'grace';

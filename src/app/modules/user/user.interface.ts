import { Model } from 'mongoose';

export type ILoginUser = {
  phoneNumber: string;
  password: string;
};

export type ILoginUserResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type IRefreshTokenResponse = {
  accessToken: string;
};

export type UserName = {
  firstName: string;
  lastName: string;
};

export type IUserRole = 'buyer' | 'seller';

export type IUser = {
  _id: string;
  phoneNumber: string;
  role: IUserRole;
  password: string;
  name: UserName;
  address: string;
  budget: number;
  income: number;
};

export type IUserMethods = {
  isUserExist(_id: string): Promise<Partial<IUser> | null>;
  isPasswordMatched(
    givenPassword: string,
    savedPassword: string
  ): Promise<boolean>;
};

export type UserModel = Model<IUser, Record<string, unknown>, IUserMethods>;

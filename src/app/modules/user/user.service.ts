import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiError';
import {
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
  IUser,
} from './user.interface';
import { User } from './user.model';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';

// createUser
const createUser = async (user: IUser): Promise<IUser | null> => {
  const newUser = await User.create(user);

  return newUser;
};

// login user
const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { email, password } = payload;

  // Create an instance of the user
  const user = new User();

  // Check if the user exists
  const isUserExist = await user.isUserExist(email);

  // Check if the user exists
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }

  // Match password
  const isPasswordMatched = isUserExist?.password
    ? await user.isPasswordMatched(password, isUserExist.password)
    : false;

  if (!isPasswordMatched) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect password');
  }

  // Create access token
  const { _id } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { _id, email },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  // Create refresh token
  const refreshToken = jwtHelpers.createToken(
    { _id },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string): Promise<IRefreshTokenResponse> => {
  // verify token
  let verifiedToken = null;
  try {
    verifiedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_secret as Secret
    );
  } catch (err) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid Refresh Token');
  }

  const { _id } = verifiedToken;

  // Refresh Token
  const user = new User();
  const isUserExist = await user.isUserExist(_id);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User does not exist');
  }
  // generate new token
  const newAccessToken = jwtHelpers.createToken(
    {
      id: isUserExist._id,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

export const UserService = {
  createUser,
  loginUser,
  refreshToken,
};

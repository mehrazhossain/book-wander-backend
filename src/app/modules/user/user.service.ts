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
  const { phoneNumber, password } = payload;

  // Create an instance of the user
  const user = new User();

  // Check if the user exists
  const isUserExist = await user.isUserExist(phoneNumber);

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
  const { _id, role } = isUserExist;
  const accessToken = jwtHelpers.createToken(
    { _id, role },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  // Create refresh token
  const refreshToken = jwtHelpers.createToken(
    { _id, role },
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
  // invalid token - synchronous
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
      role: isUserExist.role,
    },
    config.jwt.secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

// getAllUsers
const getAllUsers = async (): Promise<IUser[]> => {
  const result = await User.find({});

  return result;
};

// getMyProfile
const getMyProfile = async (accessToken: string): Promise<IUser> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decodedToken: any = jwtHelpers.verifyToken(
    accessToken,
    config.jwt.secret as Secret
  );

  const { _id, role } = decodedToken;

  try {
    if (role === 'buyer') {
      const profile = await User.findOne({ _id }).exec();
      if (!profile) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
      }
      return profile.toObject() as IUser;
    } else if (role === 'seller') {
      const profile = await User.findOne({ _id }).exec();
      console.log(profile);

      if (!profile) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
      }
      return profile.toObject() as IUser;
    } else {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Unauthorized access');
    }
  } catch (error) {
    throw new Error('Failed to retrieve user profile');
  }
};

// updateMyProfile
const updateMyProfile = async (
  _id: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  const { ...profileData } = payload;

  const updatedProfileData: Partial<IUser> = { ...profileData };

  const result = await User.findOneAndUpdate({ _id }, updatedProfileData, {
    new: true,
  });

  return result;
};

// getSingleUser
const getSingleUser = async (id: string): Promise<IUser[]> => {
  const result = await User.find({ id });

  return result;
};

// updateUser
const updateUser = async (
  id: string,
  payload: Partial<IUser>
): Promise<IUser | null> => {
  const { name, ...userData } = payload;

  const updatedUserData: Partial<IUser> = { ...userData };

  // dynamically handling
  if (name && Object.keys(name).length > 0) {
    Object.keys(name).forEach(key => {
      const nameKey = `name.${key}` as keyof Partial<IUser>;
      (updatedUserData as any)[nameKey] = name[key as keyof typeof name];
    });
  }

  const result = await User.findOneAndUpdate({ _id: id }, updatedUserData, {
    new: true,
  });

  return result;
};

// deleteUser
const deleteUser = async (id: string): Promise<IUser | null> => {
  const result = await User.findByIdAndDelete({ _id: id });

  return result;
};

export const UserService = {
  createUser,
  loginUser,
  refreshToken,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
};

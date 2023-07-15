import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import {
  ILoginUserResponse,
  IRefreshTokenResponse,
  IUser,
} from './user.interface';
import { UserService } from './user.service';
import config from '../../../config';
import { IApiResponse } from '../order/order.interface';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import { Secret } from 'jsonwebtoken';

// createUser
const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req.body);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'user created successfully!',
    data: result,
  });
});

// loginUser
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { ...loginData } = req.body;
  const result = await UserService.loginUser(loginData);
  const { refreshToken, ...others } = result;

  // set refresh token into cookie
  const cookieOptions = {
    secret: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<ILoginUserResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully!',
    data: others,
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await UserService.refreshToken(refreshToken);

  // set refresh token into cookie
  const cookieOptions = {
    secret: config.env === 'production',
    httpOnly: true,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  sendResponse<IRefreshTokenResponse>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully!',
    data: result,
  });
});

// getAllUsers
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers();

  sendResponse<IUser[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users retrieved successfully !',
    data: result,
  });
});

// getSingleUser
const getSingleUser = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.query;
  const result = await UserService.getSingleUser(id as string);

  sendResponse<IUser | null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User retrieved successfully!',
    data: result.length ? result[0] : null,
  });
});

// getMyProfile
const getMyProfile = async (req: Request, res: Response): Promise<void> => {
  const accessToken = req.headers.authorization || '';

  try {
    const profile = await UserService.getMyProfile(accessToken);

    // Create the response data
    const responseData: IApiResponse<IUser> = {
      statusCode: httpStatus.OK,
      success: true,
      message: 'Profile data retrieved successfully',
      data: profile,
    };

    // Send the response
    sendResponse(res, responseData);
  } catch (error) {
    console.error('Error retrieving profile', error);
    // Handle any errors
    const responseData: IApiResponse<null> = {
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Error retrieving profile',
      data: null,
    };

    // Send the error response
    sendResponse(res, responseData);
  }
};

// updateMyProfile
const updateMyProfile = async (req: Request, res: Response): Promise<void> => {
  const accessToken = req.headers.authorization || '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const decodedToken: any = jwtHelpers.verifyToken(
    accessToken,
    config.jwt.secret as Secret
  );

  const { _id } = decodedToken;

  const updatedProfile = req.body;

  const result = await UserService.updateMyProfile(_id, updatedProfile);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile updated successfully !',
    data: result,
  });
};

// updateUser
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;
  const updatedData = req.body;

  const result = await UserService.updateUser(id, updatedData);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User updated successfully !',
    data: result,
  });
});

// deleteUser
const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.params.id;

  const result = await UserService.deleteUser(id);

  sendResponse<IUser>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User deleted successfully !',
    data: result,
  });
});

export const UserController = {
  createUser,
  refreshToken,
  loginUser,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
};

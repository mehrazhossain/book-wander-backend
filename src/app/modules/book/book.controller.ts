import { Request, Response } from 'express';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import { BookService } from './book.service';
import { IBook } from './book.interface';
import { Book } from './book.model.ts';
import { jwtHelpers } from '../../../helpers/jwtHelpers';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';

// createBook
const createBook = catchAsync(async (req: Request, res: Response) => {
  const result = await BookService.createBook(req.body);

  sendResponse<IBook>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book added successfully!',
    data: result,
  });
});

// get all books
const getAllBooks = catchAsync(async (req: Request, res: Response) => {
  const result = await BookService.getAllBooks();

  sendResponse<IBook[]>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Books retrieved successfully!',
    data: result,
  });
});

// getSingleUser
const getSingleBook = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await BookService.getSingleBook(id as string);

  sendResponse<IBook | null>(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book retrieved successfully!',
    data: result,
  });
});

// update book
const updateBook = async (req: Request, res: Response) => {
  const bookId = req.params.id;
  const updatedData = req.body;
  const token = req.headers.authorization;

  if (!token) {
    return res.status(httpStatus.UNAUTHORIZED).json({
      success: false,
      message: 'Missing authorization token',
    });
  }

  try {
    // Verify and decode the token to retrieve the user ID
    const decodedToken = jwtHelpers.verifyToken(
      token,
      config.jwt.secret as Secret
    );

    const userId = decodedToken._id;

    // Check if the book exists
    const existingBook = await BookService.getSingleBook(bookId);
    if (!existingBook) {
      return res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'Book not found',
      });
    }
    // Check if the book was created by the current user
    const createdBy =
      existingBook.createdBy !== undefined
        ? existingBook.createdBy.toString()
        : undefined;
    if (createdBy !== userId) {
      return res.status(httpStatus.FORBIDDEN).json({
        success: false,
        message: 'You are not authorized to update this book',
      });
    }

    // Update the book with the provided data
    const updatedBook = await BookService.updateBook(bookId, updatedData);

    return res.status(httpStatus.OK).json({
      success: true,
      message: 'Book updated successfully!',
      data: updatedBook,
    });
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to update book',
    });
  }
};

export const BookController = {
  createBook,
  getAllBooks,
  getSingleBook,
  updateBook,
};

import { SortOrder } from 'mongoose';
import { paginationHelpers } from '../../../helpers/paginationHelper';
import { IGenericResponse } from '../../../interfaces/common';
import { IPaginationOptions } from '../../../interfaces/pagination';
import { bookSearchableFields } from './book.constants';
import { IBook, IBookFilters } from './book.interface';
import { Book } from './book.model.ts';

// createUser
const createBook = async (book: IBook): Promise<IBook | null> => {
  const newBook = await Book.create(book);

  return newBook;
};

// getAllBooks
const getAllBooks = async (
  filters: IBookFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IBook[]>> => {
  const { searchTerm, ...filtersData } = filters;

  const { page, limit, skip, sortBy, sortOrder } =
    paginationHelpers.calculatePagination(paginationOptions);

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: bookSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $options: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const sortConditions: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }
  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Book.find(whereConditions)
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await Book.countDocuments();

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

// getSingleBook
const getSingleBook = async (id: string): Promise<IBook | null> => {
  const result = await Book.findById(id);

  return result;
};

// updateBook
const updateBook = async (
  id: string,
  updatedData: Partial<IBook>
): Promise<IBook | null> => {
  const updatedBook = await Book.findByIdAndUpdate(id, updatedData, {
    new: true,
  });

  return updatedBook;
};

// deleteBook
const deleteBook = async (id: string) => {
  const deleteBook = await Book.findByIdAndDelete(id, {
    new: true,
  });

  return deleteBook;
};

export const BookService = {
  createBook,
  getAllBooks,
  getSingleBook,
  updateBook,
  deleteBook,
};

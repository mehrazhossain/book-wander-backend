import { IBook } from './book.interface';
import { Book } from './book.model.ts';

// createUser
const createBook = async (book: IBook): Promise<IBook | null> => {
  const newBook = await Book.create(book);

  return newBook;
};

// getAllBooks
const getAllBooks = async (): Promise<IBook[]> => {
  const result = await Book.find({});

  return result;
};

export const BookService = {
  createBook,
  getAllBooks,
};

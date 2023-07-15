import { IBook } from './book.interface';
import { Book } from './book.model.ts';

// createUser
const createBook = async (book: IBook): Promise<IBook | null> => {
  const newBook = await Book.create(book);

  return newBook;
};

export const BookService = {
  createBook,
};

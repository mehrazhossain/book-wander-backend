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

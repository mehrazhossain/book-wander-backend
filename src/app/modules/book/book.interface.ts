import { Model } from 'mongoose';

export type IBook = {
  title: string;
  author: string;
  genre: string;
  publicationDate: string;
  createdBy: string | undefined;
};

export type IBookFilters = {
  searchTerm?: string;
};

export type BookModel = Model<IBook, Record<string, unknown>>;

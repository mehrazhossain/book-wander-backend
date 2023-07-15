import express from 'express';
import { BookController } from './book.controller';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post('/', auth, BookController.createBook);

export const BookRoutes = router;

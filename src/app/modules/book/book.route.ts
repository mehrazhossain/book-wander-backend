import express from 'express';
import { BookController } from './book.controller';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post('/', auth, BookController.createBook);
router.get('/', BookController.getAllBooks);
router.get('/:id', BookController.getSingleBook);
router.put('/:id', auth, BookController.updateBook);

export const BookRoutes = router;

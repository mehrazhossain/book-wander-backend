"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookRoutes = void 0;
const express_1 = __importDefault(require("express"));
const book_controller_1 = require("./book.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.post('/', auth_1.default, book_controller_1.BookController.createBook);
router.get('/:id', book_controller_1.BookController.getSingleBook);
router.put('/:id', auth_1.default, book_controller_1.BookController.updateBook);
router.delete('/:id', auth_1.default, book_controller_1.BookController.deleteBook);
router.get('/', book_controller_1.BookController.getAllBooks);
exports.BookRoutes = router;

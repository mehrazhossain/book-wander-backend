"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookController = void 0;
const catchAsync_1 = __importDefault(require("../../../shared/catchAsync"));
const http_status_1 = __importDefault(require("http-status"));
const book_service_1 = require("./book.service");
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const config_1 = __importDefault(require("../../../config"));
const pick_1 = __importDefault(require("../../../shared/pick"));
const book_constants_1 = require("./book.constants");
const pagination_1 = require("../../../constants/pagination");
const sendResponse_1 = __importDefault(require("../../../shared/sendResponse"));
// createBook
const createBook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield book_service_1.BookService.createBook(req.body);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Book added successfully!',
        data: result,
    });
}));
// get all books
const getAllBooks = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const filters = (0, pick_1.default)(req.query, book_constants_1.bookFilterableFields);
    const paginationOptions = (0, pick_1.default)(req.query, pagination_1.paginationFields);
    const result = yield book_service_1.BookService.getAllBooks(filters, paginationOptions);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Books retrieved successfully!',
        data: result.data,
    });
}));
// getSingleUser
const getSingleBook = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const result = yield book_service_1.BookService.getSingleBook(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Book retrieved successfully!',
        data: result,
    });
}));
// update book
const updateBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookId = req.params.id;
    const updatedData = req.body;
    const token = req.headers.authorization;
    if (!token) {
        return res.status(http_status_1.default.UNAUTHORIZED).json({
            success: false,
            message: 'Missing authorization token',
        });
    }
    try {
        // Verify and decode the token to retrieve the user ID
        const decodedToken = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.secret);
        const userId = decodedToken._id;
        // Check if the book exists
        const existingBook = yield book_service_1.BookService.getSingleBook(bookId);
        if (!existingBook) {
            return res.status(http_status_1.default.NOT_FOUND).json({
                success: false,
                message: 'Book not found',
            });
        }
        // Check if the book was created by the current user
        const createdBy = existingBook.createdBy !== undefined
            ? existingBook.createdBy.toString()
            : undefined;
        if (createdBy !== userId) {
            return res.status(http_status_1.default.FORBIDDEN).json({
                success: false,
                message: 'You are not authorized to update this book',
            });
        }
        // Update the book with the provided data
        const updatedBook = yield book_service_1.BookService.updateBook(bookId, updatedData);
        return res.status(http_status_1.default.OK).json({
            success: true,
            message: 'Book updated successfully!',
            data: updatedBook,
        });
    }
    catch (error) {
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to update book',
        });
    }
});
// deleteBook
const deleteBook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const bookId = req.params.id;
    const token = req.headers.authorization;
    if (!token) {
        return res.status(http_status_1.default.UNAUTHORIZED).json({
            success: false,
            message: 'Missing authorization token',
        });
    }
    try {
        // Verify and decode the token to retrieve the user ID
        const decodedToken = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.secret);
        const userId = decodedToken._id;
        // Check if the book exists
        const existingBook = yield book_service_1.BookService.getSingleBook(bookId);
        if (!existingBook) {
            return res.status(http_status_1.default.NOT_FOUND).json({
                success: false,
                message: 'Book not found',
            });
        }
        // Check if the book was created by the current user
        const createdBy = existingBook.createdBy !== undefined
            ? existingBook.createdBy.toString()
            : undefined;
        if (createdBy !== userId) {
            return res.status(http_status_1.default.FORBIDDEN).json({
                success: false,
                message: 'You are not authorized to delete this book',
            });
        }
        yield book_service_1.BookService.deleteBook(bookId);
        return res.status(http_status_1.default.OK).json({
            success: true,
            message: 'Book deleted successfully!',
            data: null,
        });
    }
    catch (error) {
        return res.status(http_status_1.default.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to update book',
        });
    }
});
exports.BookController = {
    createBook,
    getAllBooks,
    getSingleBook,
    updateBook,
    deleteBook,
};

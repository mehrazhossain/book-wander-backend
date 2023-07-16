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
exports.UserService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("./user.model");
const jwtHelpers_1 = require("../../../helpers/jwtHelpers");
const config_1 = __importDefault(require("../../../config"));
// createUser
const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const newUser = yield user_model_1.User.create(user);
    return newUser;
});
// login user
const loginUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = payload;
    // Create an instance of the user
    const user = new user_model_1.User();
    // Check if the user exists
    const isUserExist = yield user.isUserExist(email);
    // Check if the user exists
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist');
    }
    // Match password
    const isPasswordMatched = (isUserExist === null || isUserExist === void 0 ? void 0 : isUserExist.password)
        ? yield user.isPasswordMatched(password, isUserExist.password)
        : false;
    if (!isPasswordMatched) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, 'Incorrect password');
    }
    // Create access token
    const { _id } = isUserExist;
    const accessToken = jwtHelpers_1.jwtHelpers.createToken({ _id, email }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    // Create refresh token
    const refreshToken = jwtHelpers_1.jwtHelpers.createToken({ _id }, config_1.default.jwt.refresh_secret, config_1.default.jwt.refresh_expires_in);
    return {
        accessToken,
        refreshToken,
    };
});
const refreshToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    // verify token
    let verifiedToken = null;
    try {
        verifiedToken = jwtHelpers_1.jwtHelpers.verifyToken(token, config_1.default.jwt.refresh_secret);
    }
    catch (err) {
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, 'Invalid Refresh Token');
    }
    const { _id } = verifiedToken;
    // Refresh Token
    const user = new user_model_1.User();
    const isUserExist = yield user.isUserExist(_id);
    if (!isUserExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, 'User does not exist');
    }
    // generate new token
    const newAccessToken = jwtHelpers_1.jwtHelpers.createToken({
        id: isUserExist._id,
    }, config_1.default.jwt.secret, config_1.default.jwt.expires_in);
    return {
        accessToken: newAccessToken,
    };
});
const logoutUser = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //
    }
    catch (error) {
        throw new Error('Failed to logout user');
    }
});
exports.UserService = {
    createUser,
    loginUser,
    refreshToken,
    logoutUser,
};

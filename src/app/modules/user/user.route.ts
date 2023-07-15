import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post('/register', UserController.createUser);
router.post('/login', UserController.loginUser);
router.post('/refresh-token', UserController.refreshToken);

export const UserRoutes = router;

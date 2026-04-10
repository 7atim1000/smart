import express from 'express' ;
import * as AuthController from './auth.controller';
import { protectRoute } from '../../middleware/authentication';
import upload from '../../middleware/multer';

const router = express.Router();

router.post('/register', AuthController.registerController);
router.post('/login', AuthController.loginController);
router.get('/data', protectRoute, AuthController.getUserData);
router.post('/update-profile', upload.single('image'), protectRoute,AuthController.UpdateProfileController);

export default router ; 
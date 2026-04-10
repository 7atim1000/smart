"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileService = exports.loginSerivce = exports.RegisterService = void 0;
const generateToken_1 = require("../../utils/generateToken");
const auth_model_1 = __importDefault(require("./auth.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
const RegisterService = async (userData) => {
    const { fullName, email, password } = userData;
    // check if user is already exists
    const existingUser = await auth_model_1.default.findOne({ email });
    if (existingUser) {
        throw new Error(`Sorry this email ${email} is already token`);
    }
    // hash password
    const salt = await bcryptjs_1.default.genSalt(10);
    const hashedPassword = await bcryptjs_1.default.hash(password, salt);
    // create a new user and generat a token 
    const newUser = await auth_model_1.default.create({
        fullName,
        email,
        password: hashedPassword
    });
    const token = (0, generateToken_1.generateToken)(newUser._id);
    return { user: newUser.toObject(), token };
};
exports.RegisterService = RegisterService;
const loginSerivce = async (loginData) => {
    const { email, password } = loginData;
    // find user by email 
    const userData = await auth_model_1.default.findOne({ email });
    if (!userData) {
        throw new Error('Sorry user not found');
    }
    // check Passoword 
    const isPasswordCorrect = await bcryptjs_1.default.compare(password, userData.password);
    if (!isPasswordCorrect) {
        throw new Error('Invalid Credentials');
    }
    const token = (0, generateToken_1.generateToken)(userData._id);
    return { user: userData.toObject(), token };
};
exports.loginSerivce = loginSerivce;
const UpdateProfileService = async (userId, updateData) => {
    try {
        const { fullName, email, password, imageFile } = updateData;
        // Create update object
        const updateFields = { fullName, email };
        // Encrypt password if provided
        if (password) {
            const saltRounds = 10;
            updateFields.password = await bcryptjs_1.default.hash(password, saltRounds);
        }
        // Update basic user info
        await auth_model_1.default.findByIdAndUpdate(userId, updateFields);
        // Handle image upload if provided
        if (imageFile) {
            const imageUpload = await cloudinary_1.default.uploader.upload(imageFile.path, {
                resource_type: 'image'
            });
            const imageURL = imageUpload.secure_url;
            await auth_model_1.default.findByIdAndUpdate(userId, { image: imageURL });
        }
        return { success: true, message: 'Profile updated' };
    }
    catch (error) {
        console.error('Profile update error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return { success: false, message: errorMessage };
    }
};
exports.UpdateProfileService = UpdateProfileService;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protectRoute = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_model_1 = require("../modules/auth/auth.model");
const protectRoute = async (req, res, next) => {
    try {
        const token = req.headers.token;
        // Check if token exists
        if (!token) {
            res.status(401).json({ success: false, message: 'Access token required' });
            return;
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Find user by ID
        const user = await auth_model_1.Auth.findById(decoded.userId).select("-password");
        if (!user) {
            res.status(200).json({ sucess: true, message: 'Welecome' });
            return;
        }
        ;
        // if(!user) res.json({ success: false, message: "User not found" })
        // Attach user to request object
        req.user = user;
        next();
    }
    catch (error) {
        console.log(error.message);
        let errorMessage = "Authentication failed";
        // Specific error messages based on JWT error type
        if (error.name === 'JsonWebTokenError') {
            errorMessage = "Invalid token";
        }
        else if (error.name === 'TokenExpiredError') {
            errorMessage = "Token expired";
        }
        else if (error.name === 'NotBeforeError') {
            errorMessage = "Token not active";
        }
        res.status(401).json({ success: false, message: errorMessage });
    }
};
exports.protectRoute = protectRoute;

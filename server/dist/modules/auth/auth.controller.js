"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateProfileController = exports.getUserData = exports.loginController = exports.registerController = void 0;
const AuthService = __importStar(require("./auth.service"));
const registerController = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            res.status(401).json({ success: false, message: 'All fields are required' });
        }
        // call service 
        const { user, token } = await AuthService.RegisterService({
            fullName,
            email,
            password
        });
        res.status(201).json({ success: true, userData: user, token, message: 'Account created successfully' });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.registerController = registerController;
const loginController = async (req, res) => {
    try {
        // req.body
        const { email, password } = req.body;
        // connect service 
        const { user, token } = await AuthService.loginSerivce({
            email,
            password
        });
        res.status(201).json({ success: true, userData: user, token, message: 'Login Successfully' });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.loginController = loginController;
const getUserData = async (req, res) => {
    try {
        const user = req.user; // using type assertion 
        //const user = req.user;
        if (!user) {
            res.json({ success: false, message: 'User not found' });
            return;
        }
        ;
        res.json({ success: true, user: user });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getUserData = getUserData;
// interface AuthenticatedRequest extends Request {
//   user: {
//     _id: string;
//   };
// }
const UpdateProfileController = async (req, res) => {
    try {
        // const userId = req.user!._id;  // Use non-null assertion since protectRoute ensures user exists
        const userId = req.user._id.toString(); // Non-null assertion and convert to string
        //const userId = (req as any).user._id;
        const { fullName, email, password } = req.body;
        const imageFile = req.file;
        const updateData = {
            fullName,
            email,
            password,
            imageFile
        };
        const result = await AuthService.UpdateProfileService(userId, updateData);
        res.json(result);
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.UpdateProfileController = UpdateProfileController;
// in case on Interface IAuth consist ield id?:string
// export const updateProfile = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // Check if user and _id exist
//     if (!req.user || !req.user._id) {
//       res.status(401).json({ success: false, message: 'User not authenticated or missing user ID' });
//       return;
//     }
//     const userId = req.user._id; // No need for toString() if _id is already string
//     const { fullName, email, password } = req.body;
//     const imageFile = req.file;
//     const updateData: UpdateProfileData = {
//       fullName,
//       email,
//       password,
//       imageFile
//     };
//     const result = await updateProfileService(userId, updateData);
//     res.json(result);
//   } catch (error) {
//     console.error('Controller error:', error);
//     const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//     res.json({ success: false, message: errorMessage });
//   }
// };

import { Request, Response } from 'express';
import * as AuthService from './auth.service';
import { UpdateProfileRequest } from './auth.interface';

export const registerController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            res.status(401).json({ success: false, message: 'All fields are required' })
        }

        // call service 
        const { user, token } = await AuthService.RegisterService({
            fullName,
            email,
            password
        });

        res.status(201).json({ success: true, userData: user, token, message: 'Account created successfully' });

    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
};



export const loginController = async (req: Request, res: Response): Promise<void> => {
    try {
        // req.body
        const { email, password } = req.body;

        // connect service 
        const { user, token } = await AuthService.loginSerivce({
            email,
            password
        })

        res.status(201).json({ success: true, userData: user, token, message: 'Login Successfully' })

    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ success: false, message: error.message })
    }
};


export const getUserData = async (req: Request, res: Response): Promise<void> => {

    try {
        const user = (req as any).user; // using type assertion 
        //const user = req.user;

        if (!user) {
            res.json({ success: false, message: 'User not found' })

            return;
        };

        res.json({ success: true, user: user })


    } catch (error: any) {
        console.log((error as Error).message)
        res.status(500).json({ success: false, message: error.message })
    }
};


// interface AuthenticatedRequest extends Request {
//   user: {
//     _id: string;
//   };
// }
export const UpdateProfileController = async (req: Request, res: Response): Promise<void> => {
    try {
        // const userId = req.user!._id;  // Use non-null assertion since protectRoute ensures user exists
        const userId = req.user!._id.toString(); // Non-null assertion and convert to string
        //const userId = (req as any).user._id;
        const { fullName, email, password } = req.body;
        const imageFile = req.file;

        const updateData: UpdateProfileRequest = {
            fullName,
            email,
            password,
            imageFile
        };

        const result = await AuthService.UpdateProfileService(userId, updateData);
        res.json(result);

        } catch (error: any) {
            console.log((error as Error).message)
            res.status(500).json({ success: false, message: error.message })
        }
    };

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
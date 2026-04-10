import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Auth } from '@/modules/auth/auth.model';
import { JwtPayload } from '@/modules/auth/auth.interface';

// types/express.d.ts
import { IAuth } from '../modules/auth/auth.interface';

declare global {
  namespace Express {
    interface Request {
      user?: IAuth;
    }
  }
}

export const protectRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const token = req.headers.token as string;
        // Check if token exists
        if (!token) {
            res.status(401).json({ success: false, message: 'Access token required' })
            return;
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
        
        // Find user by ID
        const user = await Auth.findById(decoded.userId).select("-password");

        if (!user) {
            res.status(200).json({ sucess: true, message: 'Welecome' });
            return;
        };

        // if(!user) res.json({ success: false, message: "User not found" })
        // Attach user to request object
        req.user = user ;
        next();
    
    } catch (error: any) {
        console.log(error.message);
        
        let errorMessage = "Authentication failed";
        
        // Specific error messages based on JWT error type
        if (error.name === 'JsonWebTokenError') {
            errorMessage = "Invalid token";
        } else if (error.name === 'TokenExpiredError') {
            errorMessage = "Token expired";
        } else if (error.name === 'NotBeforeError') {
            errorMessage = "Token not active";
        }

        res.status(401).json({success: false, message: errorMessage});
     
    }
};


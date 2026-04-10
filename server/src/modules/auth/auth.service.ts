import { generateToken } from "../../utils/generateToken";
import { IAuth, RegisterRequest, LoginRequest, UpdateProfileRequest } from './auth.interface';
import Auth from './auth.model';
import bcrypt from 'bcryptjs';
import cloudinary from '../../config/cloudinary';


export const RegisterService = async (userData: RegisterRequest): Promise<{user: IAuth, token: string}> => {
    const { fullName , email, password } = userData ;

    // check if user is already exists
    const existingUser = await Auth.findOne({email});
    if (existingUser) {
        throw new Error(`Sorry this email ${email} is already token`)
    }
    
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // create a new user and generat a token 
    const newUser = await Auth.create({
        fullName ,
        email ,
        password: hashedPassword
    });

    const token = generateToken(newUser._id);
    
    
    return {user: newUser.toObject(), token};
};



export const loginSerivce = async(loginData: LoginRequest): Promise<{user: IAuth, token: string}> => {
    const { email, password } = loginData ;
    
    // find user by email 
    const userData = await Auth.findOne({ email })
    if (!userData) {
        throw new Error('Sorry user not found')
    } 

    // check Passoword 
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
        throw new Error('Invalid Credentials')
    }

    const token = generateToken(userData._id);
    return { user: userData.toObject(), token }
};



export const UpdateProfileService = async(
  userId: string, 
  updateData: UpdateProfileRequest
): Promise<{success: boolean; message: string}> => {
    try {
        const { fullName, email, password, imageFile } = updateData;
        
        // Create update object
        const updateFields: any = { fullName, email };
        
        // Encrypt password if provided
        if (password) {
            const saltRounds = 10;
            updateFields.password = await bcrypt.hash(password, saltRounds);
        }

        // Update basic user info
        await Auth.findByIdAndUpdate(userId, updateFields);

        // Handle image upload if provided
        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
                resource_type: 'image'
            });
            const imageURL = imageUpload.secure_url;

            await Auth.findByIdAndUpdate(userId, { image: imageURL });
        }

        return { success: true, message: 'Profile updated' };
           
    } catch (error) {
        console.error('Profile update error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return { success: false, message: errorMessage };
    }
};
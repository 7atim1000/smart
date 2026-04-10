export interface IAuth {
    _id: string,
    email: string,
    password: string,
    fullName: string,
    image: string, 
};

export interface RegisterRequest{
    fullName: string,
    email: string,
    password: string,
};

export interface LoginRequest{
    email: string,
    password: string
};

export  interface UpdateProfileRequest {
    fullName?: string,
    email: string,
    password: string,
    imageFile?: Express.Multer.File;
}

export interface JwtPayload {
    userId: string;
    iat?: number;
    exp?: number;
};
import jwt from 'jsonwebtoken' ;

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key' ;

export const generateToken = (userId: string): string => {
    // return jwt.sign({ userId }, JWT_SECRET, { expiredIn: '7d' });
     const token = jwt.sign({userId}, JWT_SECRET);
    return token;
};
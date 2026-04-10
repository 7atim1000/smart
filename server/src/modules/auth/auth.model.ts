import mongoose from 'mongoose';
import {IAuth} from './auth.interface';

const authSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true},
    password: { type: String, required: true },
    image: { type: String, default: 'https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOe7UEwnLxGSqJOX0dvlIMCB5a4NghyVLW61RD' }
}, {
    timestamps: true
});



export const Auth = mongoose.model<IAuth>('Auth', authSchema);
export default Auth ;
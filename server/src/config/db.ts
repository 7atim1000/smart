import mongoose from 'mongoose' ;
import 'colors' ;

import 'colors';
import { config } from './config';

const connectDB = async () => {
    try {
        // await mongoose.connect(config.databaseUrl as string);
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to database successfully' .bgYellow)
    } catch (error) {
        console.log('Faild to connect to database', error);
        process.exit(1) ;
    }
};


export default connectDB;
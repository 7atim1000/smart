import express from 'express' ;
import {Request, Response} from 'express';
import colors from 'colors';
import cors from 'cors'
import "dotenv/config" ;
import 'colors' ;
import connectDB from './config/db' ;
import router from './routes';



const app = express();
app.use(express.json({limit: "4mb"}));
app.use(cors({
    origin: "*",
    credentials: true,

}));


app.get('/', (req: Request, res: Response) => res.send("Server is running"));
app.use('/v1/api/', router);

connectDB();
const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`.bgBlue)
});
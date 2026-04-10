"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
require("colors");
require("colors");
const connectDB = async () => {
    try {
        // await mongoose.connect(config.databaseUrl as string);
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log('Connected to database successfully'.bgYellow);
    }
    catch (error) {
        console.log('Faild to connect to database', error);
        process.exit(1);
    }
};
exports.default = connectDB;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const authSchema = new mongoose_1.default.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String, default: 'https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOe7UEwnLxGSqJOX0dvlIMCB5a4NghyVLW61RD' }
}, {
    timestamps: true
});
exports.Auth = mongoose_1.default.model('Auth', authSchema);
exports.default = exports.Auth;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const transactionSchema = new mongoose_1.default.Schema({
    transactionNumber: { type: String, required: 'true' },
    shift: { type: String, enum: ['Morning', 'Evening'], required: true },
    amount: { type: Number, required: [true, 'Amount field is required'] },
    type: { type: String, required: [true, 'Type field is required'] },
    account: { type: String, required: [true, 'Account field is required'] },
    refrence: { type: String, required: [true, 'Refrence field is required'] },
    description: { type: String, required: [true, 'Description field is required'] },
    status: { type: String, default: '-' },
    paymentMethod: { type: String, required: true },
    currency: { type: String, required: true },
    date: { type: Date, required: [true, 'Date field is required'] },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "User" }
}, {
    timestamps: true
});
exports.Transaction = mongoose_1.default.model('Transaction', transactionSchema);
exports.default = exports.Transaction;

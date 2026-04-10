"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Invoice = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const invoiceSchema = new mongoose_1.default.Schema({
    type: { type: String },
    shift: { type: String, enum: ['Morning', 'Evening'], required: true },
    invoiceNumber: { type: String },
    invoiceType: { type: String, required: [true, 'Invoice type field is required'] },
    invoiceStatus: { type: String, required: [true, 'Invoice status field is required'] },
    status: { type: String }, // 'RFQ' | 'Purchase Order' | 'Quotation' | 'Sales Order' | 'Bill';
    customer: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Contacts' },
    customerName: { type: String }, customerEmail: { type: String }, customerContact: { type: String },
    supplier: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Contacts' },
    supplierName: { type: String }, supplierEmail: { type: String }, supplierContact: { type: String },
    items: [],
    saleBills: {
        total: { type: Number },
        tax: { type: Number },
        totalWithTax: { type: Number },
        payed: { type: Number },
        balance: { type: Number },
        currency: { type: String },
    },
    buyBills: {
        total: { type: Number },
        tax: { type: Number },
        totalWithTax: { type: Number },
        payed: { type: Number },
        balance: { type: Number },
        currency: { type: String },
    },
    bills: {
        total: { type: Number },
        tax: { type: Number },
        totalWithTax: { type: Number },
        payed: { type: Number },
        balance: { type: Number },
        currency: { type: String },
    },
    paymentMethod: { type: String },
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "Auth" },
    invoiceDate: { type: Date, default: Date.now() },
    date: { type: Date, default: Date.now() },
}, { timestamps: true });
exports.Invoice = mongoose_1.default.model("Invoice", invoiceSchema);
exports.default = exports.Invoice;

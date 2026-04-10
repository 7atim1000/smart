"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contacts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const contactsSchema = new mongoose_1.default.Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    isReceivable: { type: Boolean, required: true },
    isPayable: { type: Boolean, required: true },
    accReceivableName: { type: String, },
    accReceivableNameArb: { type: String, },
    accReceivableGroup: { type: String, },
    accReceivableGroupArb: { type: String, },
    accReceivableClass: { type: String, },
    accReceivableClassArb: { type: String, },
    accReceivableLevel: { type: String, },
    accReceivableLevelArb: { type: String, },
    accReceivableChart: { type: String, },
    accReceivableChartArb: { type: String, },
    accReceivableType: { type: String, },
    accPayableName: { type: String, },
    accPayableNameArb: { type: String, },
    accPayableGroup: { type: String, },
    accPayableGroupArb: { type: String, },
    accPayableClass: { type: String, },
    accPayableClassArb: { type: String, },
    accPayableLevel: { type: String, },
    accPayableLevelArb: { type: String, },
    accPayableChart: { type: String, },
    accPayableChartArb: { type: String, },
    accPayableType: { type: String, },
    balance: { type: Number, default: 0 },
    balanceCurrency: { type: String, default: 'AED' },
}, { timestamps: true });
exports.Contacts = mongoose_1.default.model('Contacts', contactsSchema);
exports.default = exports.Contacts;

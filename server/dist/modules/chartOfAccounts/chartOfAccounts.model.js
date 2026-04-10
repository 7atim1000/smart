"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartOfAccounts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
// Account Schema (Level 4)
const accountSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    nameArb: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, required: true },
}, {
    _id: true,
    timestamps: false
});
// Group Schema (Level 3)
const groupSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    nameArb: { type: String, required: true },
    code: { type: String, required: true },
    account: [accountSchema], // ✅ Changed from 'accounts' to 'account'
}, {
    _id: true,
    timestamps: false
});
// Class Schema (Level 2)
const classSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    nameArb: { type: String, required: true },
    code: { type: String, required: true },
    group: [groupSchema], // ✅ Array of groups
}, {
    _id: true,
    timestamps: false
});
// Level Schema (Level 1)
const levelSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    nameArb: { type: String, required: true },
    code: { type: String, required: true },
    class: [classSchema], // ✅ Array of classes
}, {
    _id: true,
    timestamps: false
});
// Chart of Accounts Schema (Root)
const chartOfAccountsSchema = new mongoose_1.default.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    nameArb: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    level: [levelSchema], // ✅ Changed from 'groups' to 'level'
}, {
    timestamps: true
});
exports.ChartOfAccounts = mongoose_1.default.model('ChartOfAccounts', chartOfAccountsSchema);

import mongoose from 'mongoose';
import { IChartOfAccounts, ILevel, IClass, IGroup, IAccount } from './chartOfAccounts.interface';

// Account Schema (Level 4)
const accountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameArb: { type: String, required: true },
    code: { type: String, required: true },
    type: { type: String, required: true },
}, {
    _id: true, 
    timestamps: false
});

// Group Schema (Level 3)
const groupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameArb: { type: String, required: true },
    code: { type: String, required: true },
    account: [accountSchema], // ✅ Changed from 'accounts' to 'account'
}, {
    _id: true, 
    timestamps: false
});

// Class Schema (Level 2)
const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameArb: { type: String, required: true },
    code: { type: String, required: true },
    group: [groupSchema], // ✅ Array of groups
}, {
    _id: true, 
    timestamps: false
});

// Level Schema (Level 1)
const levelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    nameArb: { type: String, required: true },
    code: { type: String, required: true },
    class: [classSchema], // ✅ Array of classes
}, {
    _id: true, 
    timestamps: false
});

// Chart of Accounts Schema (Root)
const chartOfAccountsSchema = new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    nameArb: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    level: [levelSchema], // ✅ Changed from 'groups' to 'level'
}, {
    timestamps: true 
});


export const ChartOfAccounts = mongoose.model<IChartOfAccounts>('ChartOfAccounts', chartOfAccountsSchema);
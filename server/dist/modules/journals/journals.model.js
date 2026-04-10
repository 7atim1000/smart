"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Journal = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const journalEntrySchema = new mongoose_1.default.Schema({
    date: { type: Date, required: true, index: true }, // ← Keep this
    reference: { type: String, required: true },
    description: { type: String },
    descriptionArb: { type: String },
    // Account Information
    accName: { type: String, required: true },
    accNameArb: { type: String, required: true },
    accGroup: { type: String, required: true },
    accGroupArb: { type: String, required: true },
    accClass: { type: String, required: true },
    accClassArb: { type: String, required: true },
    accLevel: { type: String, required: true },
    accLevelArb: { type: String, required: true },
    accChart: { type: String, required: true },
    accChartArb: { type: String, required: true },
    accType: { type: String, required: true },
    // Partner Information (optional)
    partnerId: { type: String },
    partnerName: { type: String },
    partnerNameArb: { type: String },
    // Financial
    debit: { type: Number, required: true, min: 0, default: 0 },
    credit: { type: Number, required: true, min: 0, default: 0 },
    balance: { type: Number, required: true },
    currency: { type: String, required: true },
    // Metadata
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    _id: true
});
const journalSchema = new mongoose_1.default.Schema({
    // Journal Header
    journalsNameId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'JournalsName' }, // Add reference
    journalName: { type: String, required: true },
    status: { type: String, default: "draft" },
    reference: { type: String, required: true },
    journalNameArb: { type: String, required: true },
    code: { type: String, required: true }, // ← This creates an index - unique: true
    // Period Information
    fiscalYear: { type: Number, required: true },
    period: { type: String, required: true },
    // Financial Summary
    openingBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },
    totalDebit: { type: Number, default: 0 },
    totalCredit: { type: Number, default: 0 },
    netChange: { type: Number, default: 0 },
    currency: { type: String, required: true },
    // Entries
    entries: [journalEntrySchema],
    // Status
    isActive: { type: Boolean, default: true },
    isClosed: { type: Boolean, default: false },
    closedAt: { type: Date },
    lastEntryDate: { type: Date }
}, {
    timestamps: true
});
// ✅ Keep ONLY these indexes - they are for compound/complex queries
journalSchema.index({ fiscalYear: 1, period: 1 });
journalSchema.index({ isActive: 1, isClosed: 1 });
// ❌ REMOVE these - they duplicate field-level indexes
// journalSchema.index({ code: 1 });  // ← Remove (duplicate of unique:true)
// journalSchema.index({ 'entries.date': 1 });  // ← Remove (duplicate of field index)
// ✅ Keep if you need these compound indexes
journalSchema.index({ 'entries.accChart': 1, 'entries.accLevel': 1, 'entries.accGroup': 1, 'entries.accClass': 1 });
journalSchema.index({ 'entries.partnerId': 1 });
// Pre-save middleware
journalSchema.pre('save', async function () {
    if (this.entries && this.entries.length > 0) {
        let runningBalance = this.openingBalance;
        let totalDebit = 0;
        let totalCredit = 0;
        for (let i = 0; i < this.entries.length; i++) {
            const entry = this.entries[i];
            runningBalance += (entry.debit - entry.credit);
            entry.balance = runningBalance;
            totalDebit += entry.debit;
            totalCredit += entry.credit;
        }
        this.totalDebit = totalDebit;
        this.totalCredit = totalCredit;
        this.netChange = totalDebit - totalCredit;
        this.currentBalance = this.openingBalance + this.netChange;
        this.lastEntryDate = this.entries[this.entries.length - 1].date;
    }
});
exports.Journal = mongoose_1.default.model('Journal', journalSchema);

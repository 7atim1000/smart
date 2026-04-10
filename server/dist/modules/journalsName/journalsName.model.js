"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JournalsName = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const journalsNameSchema = new mongoose_1.default.Schema({
    journalName: { type: String, required: true },
    journalNameArb: { type: String, required: true },
    accName: { type: String, required: true },
    accNameArb: { type: String, required: true },
    code: { type: String, required: true },
    accGroup: { type: String, required: true },
    accGroupArb: { type: String, required: true },
    accLevel: { type: String, required: true },
    accLevelArb: { type: String, required: true },
    accChart: { type: String, required: true },
    accChartArb: { type: String, required: true },
    balance: { type: Number, default: 0 },
}, {
    timestamps: true
});
exports.JournalsName = mongoose_1.default.model('JournalsName', journalsNameSchema);

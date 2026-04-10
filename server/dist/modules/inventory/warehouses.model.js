"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Warehouse = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const locationSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    // Metadata
    createdBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    _id: true
});
const warehouseSchema = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    // Entries
    locations: [locationSchema],
}, {
    timestamps: true
});
exports.Warehouse = mongoose_1.default.model('Wharehouse', warehouseSchema);

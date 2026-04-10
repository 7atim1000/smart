import mongoose from 'mongoose';
import { IWarehouse, ILocation } from './warehouses.interface';

const locationSchema = new mongoose.Schema({

    name: { type: String, required: true },
    
    
    // Metadata
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    _id: true
});


const warehouseSchema = new mongoose.Schema({
    name: {type: String, required: true},
    
    // Entries
    locations: [locationSchema],
    
}, {
    timestamps: true
});


export const Warehouse = mongoose.model<IWarehouse>('Wharehouse', warehouseSchema);

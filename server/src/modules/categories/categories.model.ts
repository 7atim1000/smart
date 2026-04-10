import mongoose from 'mongoose';
import { ICategory, ICategoryEntry } from './categories.interface';

const categoryEntrySchema = new mongoose.Schema({

    name: { type: String, required: true },
    barcode: { type: String },

    qty: { type: String, required: true },
    unit: { type: String, required: true },
    salePrice: { type: Number, required: true },
    saleCurrency: { type: String } ,
    costPrice: { type: Number, required: true },
    costCurrency: { type: String } ,
    
    sales: { type: Boolean, required: true },
    purchase: { type: Boolean, required: true },
    goods: { type: Boolean, required: true },
    service: { type: Boolean, required: true },

    // Account Information
    accName: { type: String, },
    accNameArb: { type: String, },
    accGroup: { type: String, },
    accGroupArb: { type: String, },
    accClass: { type: String, },
    accClassArb: { type: String,  },
    accLevel: { type: String,  },
    accLevelArb: { type: String,  },
    accChart: { type: String, },
    accChartArb: { type: String, },
    accType: { type: String,  },
    
    
    
    // Metadata
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: { createdAt: true, updatedAt: false },
    _id: true
});


const categorySchema = new mongoose.Schema({
    name: {type: String, required: true},
    
    // Entries
    products: [categoryEntrySchema],
    
}, {
    timestamps: true
});


export const Category = mongoose.model<ICategory>('Category', categorySchema);

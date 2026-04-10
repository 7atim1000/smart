import { Document } from 'mongoose';
import mongoose from 'mongoose' ;

export interface ICategoryEntry {
    _id?: string;
   
    name: string;
    barcode?: string;
    
    qty: string;
    unit: string;
    salePrice: number;
    saleCurrency?: string;
    
    costPrice: number;
    costCurrency?: string;

    sales: boolean;
    purchase: boolean;

    goods: boolean;
    service: boolean;
    
    // Account Information (per entry)
    accSalesName: string;
    accSalesNameArb: string;
    accSalesGroup: string;
    accSalesGroupArb: string;
    accSalesClass: string;
    accSalesClassArb: string;
    accSalesLevel: string;
    accSalesLevelArb: string;
    accSalesChart: string;
    accSalesChartArb: string;
    accSalesType: string;

    accPurchaseName: string;
    accPurchaseNameArb: string;
    accPurchaseGroup: string;
    accPurchaseGroupArb: string;
    accPurchaseClass: string;
    accPurchaseClassArb: string;
    accPurchaseLevel: string;
    accPurchaseLevelArb: string;
    accPurchaseChart: string;
    accPurchaseChartArb: string;
    accPurchaseType: string;
 
    // Metadata
    createdBy?: string;
    createdAt?: Date;
}

// Add this interface for products with category info
export interface ProductWithCategory extends ICategoryEntry {
    categoryId: string;
    categoryName: string;
}


export interface ICategory extends Document {
    // Category Header
    name: string;
    
    // Entries
    products: ICategoryEntry[];
    
    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}


export interface AddCategoryRequest {
    name: string;
    products?: AddCategoryEntryRequest[];
}

export interface AddCategoryEntryRequest {
    name: string;
    barcode?: string;
    qty: string;
    unit: string;

    salePrice: number;
    saleCurrency?: string;
    costPrice: number;
    costCurrency?: string
    
    sales: boolean;
    purchase: boolean;
    goods: boolean;
    service: boolean;
    
    accSalesName: string;
    accSalesNameArb: string;
    accSalesGroup: string;
    accSalesGroupArb: string;
    accSalesClass: string;
    accSalesClassArb: string;
    accSalesLevel: string;
    accSalesLevelArb: string;
    accSalesChart: string;
    accSalesChartArb: string;
    accSalesType: string;

    accPurchaseName: string;
    accPurchaseNameArb: string;
    accPurchaseGroup: string;
    accPurchaseGroupArb: string;
    accPurchaseClass: string;
    accPurchaseClassArb: string;
    accPurchaseLevel: string;
    accPurchaseLevelArb: string;
    accPurchaseChart: string;
    accPurchaseChartArb: string;
    accPurchaseType: string;
}

export interface UpdateCategoryRequest {
    name?: string;
}

export interface UpdateCategoryEntryRequest {
    name?: string;
    barcode?: string;

    qty?: string;
    unit?: string;
    salePrice?: number;
    saleCurrency?: string;

    costPrice?: number;
    costCurrency?: string;

    sales?: boolean;
    purchase?: boolean;
    goods: boolean;
    service: boolean;
    
    accSalesName?: string;
    accSalesNameArb?: string;
    accSalesGroup?: string;
    accSalesGroupArb?: string;
    accSalesClass?: string;
    accSalesClassArb?: string;
    accSalesLevel?: string;
    accSalesLevelArb?: string;
    accSalesChart?: string;
    accSalesChartArb?: string;
    accSalesType?: string;

    accPurchaseName?: string;
    accPurchaseNameArb?: string;
    accPurchaseGroup?: string;
    accPurchaseGroupArb?: string;
    accPurchaseClass?: string;
    accPurchaseClassArb?: string;
    accPurchaseLevel?: string;
    accPurchaseLevelArb?: string;
    accPurchaseChart?: string;
    accPurchaseChartArb?: string;
    accPurchaseType?: string;
}

export interface CategoryFilterRequest {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
}

export interface CategoryEntryFilterRequest {
    search?: string;
    sales?: boolean;
    purchase?: boolean;
}
import { Document } from 'mongoose';
import mongoose from 'mongoose' ;

export interface ILocation {
    _id?: string;
    name : string;
   
    // Metadata
    createdBy?: string;
    createdAt?: Date;
}



export interface IWarehouse extends Document {
    // Warehouse Header
    name: string;
    
    // Locations
    locations: ILocation[];
    
    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}


export interface AddWarehouseRequest {
    name: string;
    locations?: AddLocationRequest[];
}

export interface AddLocationRequest {
    name: string;
   
}

export interface UpdateWarehouseRequest {
    name?: string;
}

export interface UpdateLocationRequest {
    name?: string;
 
}

export interface WarehouseFilterRequest {
    search?: string;
    page?: number;
    limit?: number;
    sort?: string;
}

export interface LocationFilterRequest {
    search?: string;
   
}


// Add this interface for products with category info
export interface LocationsWithWarehouse extends ILocation {
    warehouseId: string;
    warehouseName: string;
}

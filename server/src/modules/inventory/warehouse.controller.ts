import { Request, Response } from 'express';
import * as WarehouseService from './warehouses.service';
import { 
    AddWarehouseRequest, 
    AddLocationRequest,
    UpdateWarehouseRequest,
    UpdateLocationRequest,
    WarehouseFilterRequest,
    LocationFilterRequest
} from './warehouses.interface';

// Helper function to get string param
const getStringParam = (param: any): string | undefined => {
    return param ? String(param) : undefined;
};

// Helper function to parse boolean from query string
const parseBoolean = (value: any): boolean | undefined => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return undefined;
};

// ============================================
// ADD Warehouse CONTROLLER
// ============================================
export const addWarehouseController = async (req: Request, res: Response): Promise<void> => {
    try {
        const warehouseData: AddWarehouseRequest = req.body;

        // Validate required fields
        if (!warehouseData.name) {
            res.status(400).json({
                success: false,
                message: 'Warehouse name is required'
            });
            return;
        }

        const warehouse = await WarehouseService.addWarehouseService(warehouseData);

        res.status(201).json({
            success: true,
            warehouse,
            message: 'Warehouse created successfully'
        });
    } catch (error: any) {
        console.error('Error adding warehouse:', error);
        
        if (error.message.includes('already exists')) {
            res.status(409).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to create warehouse' 
        });
    }
};

// ============================================
// ADD Warehouse Locations CONTROLLER
// ============================================
export const addWarehouseLocationsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const warehouseId = getStringParam(req.params.warehouseId);
        const entryData: AddLocationRequest = req.body;

        if (!warehouseId) {
            res.status(400).json({ success: false, message: 'Warehouse ID is required' });
            return;
        }

        const requiredFields = [
            'name'
        ];

        const missingFields = requiredFields.filter(field => {
            const value = entryData[field as keyof AddLocationRequest];
            return value === undefined || value === null || value === '';
        });

        if (missingFields.length > 0) {
            res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
            return;
        }


        const warehouse = await WarehouseService.addLocationService(warehouseId, entryData);

        res.status(201).json({
            success: true,
            warehouse,
            message: 'Location added successfully'
        });
    } catch (error: any) {
        console.error('Error adding warehouse location:', error);
        
        if (error.message === 'Warehouse not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to add warehouse locations' 
        });
    }
};

// ============================================
// GET ALL Warehouses CONTROLLER
// ============================================
export const getwarehousesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, page, limit, sort } = req.query;

        const filter: WarehouseFilterRequest = {
            ...(search && { search: search as string }),
            ...(page && { page: Number(page) }),
            ...(limit && { limit: Number(limit) }),
            ...(sort && { sort: sort as string })
        };

        const result = await WarehouseService.getWarehouseService(filter);

        res.status(200).json({
            success: true,
            warehouses: result.warehouses,
            pagination: {
                total: result.total,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 10,
                totalPages: Math.ceil(result.total / (limit ? Number(limit) : 10))
            },
            message: 'Warehouses fetched successfully'
        });
    } catch (error: any) {
        console.error('Error fetching warehouses:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch warehouses' 
        });
    }
};

// ============================================
// GET Warehouse BY ID CONTROLLER
// ============================================
export const getWarehouseByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = getStringParam(req.params.id);

        if (!id) {
            res.status(400).json({ success: false, message: 'Category ID is required' });
            return;
        }

        const warehouse = await WarehouseService.getWarehouseByIdService(id);

        if (!warehouse) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }

        res.status(200).json({
            success: true,
            warehouse,
            message: 'Warehouse fetched successfully'
        });
    } catch (error: any) {
        console.error('Error fetching warehouse:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch warehouse' 
        });
    }
};

// ============================================
// SEARCH WAREHOUSE LOCATIONS CONTROLLER
// ============================================
export const searchLocationsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const warehouseId = getStringParam(req.params.warehouseId);
        const { search } = req.query;

        if (!warehouseId) {
            res.status(400).json({ success: false, message: 'Warehouse ID is required' });
            return;
        }

        const filter: LocationFilterRequest = {
            ...(search && { search: search as string }),
           
        };

        const result = await WarehouseService.searchLocationsService(warehouseId, filter);

        res.status(200).json({
            success: true,
            entries: result.entries,
            total: result.total,
            message: 'Warehouse locations fetched successfully'
        });
    } catch (error: any) {
        console.error('Error searching warehouse locations:', error);
        
        if (error.message === 'Warehouse not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to search warehouse locations' 
        });
    }
};

// ============================================
// UPDATE WAREHOUSE CONTROLLER  00971505451178
// ============================================
export const updateWarehouseController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = getStringParam(req.params.id);
        const updateData: UpdateWarehouseRequest = req.body;

        if (!id) {
            res.status(400).json({ success: false, message: 'Warehouse ID is required' });
            return;
        }

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ 
                success: false, 
                message: 'At least one field must be provided for update' 
            });
            return;
        }

        const warehouse = await WarehouseService.updateWarehouseService(id, updateData);

        res.status(200).json({
            success: true,
            warehouse,
            message: 'Warehouse updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating warehouse:', error);
        
        if (error.message === 'Warehouse not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        if (error.message.includes('already exists')) {
            res.status(409).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to update warehouse' 
        });
    }
};

// ============================================
// UPDATE WAREHOSUE ENTRY CONTROLLER
// ============================================
export const updateLocationController = async (req: Request, res: Response): Promise<void> => {
    try {
        const warehouseId = getStringParam(req.params.warehouseId);
        const entryId = getStringParam(req.params.entryId);
        const updateData: UpdateLocationRequest = req.body;

        if (!warehouseId || !entryId) {
            res.status(400).json({ 
                success: false, 
                message: 'Warehouse ID and Entry ID are required' 
            });
            return;
        }

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ 
                success: false, 
                message: 'At least one field must be provided for update' 
            });
            return;
        }

        const warehouse = await WarehouseService.updateLocationService(warehouseId, entryId, updateData);

        res.status(200).json({
            success: true,
            warehouse,
            message: 'Warehouse locations updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating warehouse location:', error);
        
        if (error.message === 'Warehouse not found' || error.message === 'Warehouse locations not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to update warehouse locations' 
        });
    }
};

// ============================================
// DELETE WAREHOUSE CONTROLLER
// ============================================
export const deleteWarehouseController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = getStringParam(req.params.id);

        if (!id) {
            res.status(400).json({ success: false, message: 'Warehouse ID is required' });
            return;
        }

        const result = await WarehouseService.deleteWarehouseService(id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Error deleting warehouse:', error);
        
        if (error.message === 'Category not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        if (error.message.includes('existing products')) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to delete warehouse' 
        });
    }
};

// ============================================
// DELETE Warehouse Controllers CONTROLLER
// ============================================
export const deleteWarehouseLocationsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const warehouseId = getStringParam(req.params.warehouseId);
        const entryId = getStringParam(req.params.entryId);

        if (!warehouseId || !entryId) {
            res.status(400).json({ 
                success: false, 
                message: 'Warehouse ID and Entry ID are required' 
            });
            return;
        }

        const warehouse = await WarehouseService.deleteLocationService(warehouseId, entryId);

        res.status(200).json({
            success: true,
            warehouse,
            message: 'Warehouse location deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting warehouse location:', error);
        
        if (error.message === 'Category not found' || error.message === 'Warehouse location not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to delete warehouse location' 
        });
    }
};

// ============================================
// BULK DELETE WAREHOUSE LOCATION CONTROLLER
// ============================================
export const bulkDeleteWarehouseLocationsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const warehouseId = getStringParam(req.params.warehouseId);
        const { entryIds } = req.body;

        if (!warehouseId) {
            res.status(400).json({ success: false, message: 'Warehouse ID is required' });
            return;
        }

        if (!entryIds || !Array.isArray(entryIds) || entryIds.length === 0) {
            res.status(400).json({ 
                success: false, 
                message: 'Entry IDs array is required' 
            });
            return;
        }

        const warehouse = await WarehouseService.bulkDeleteWarehouseLocationsService(warehouseId, entryIds);

        res.status(200).json({
            success: true,
            warehouse,
            message: `${entryIds.length} warehouse locations deleted successfully`
        });
    } catch (error: any) {
        console.error('Error bulk deleting warehouse locations:', error);
        
        if (error.message === 'Warehouse not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to delete warehouse locations' 
        });
    }
};


// Fetch locations with out HEARARCHY
export const getAllLocations = async (req: Request, res: Response): Promise<void> => {
    try {
        const searchTerm = req.query.search as string || '';
        // const type = req.query.type as string || 'all';
        
        // Validate type parameter
        // if (!['all', 'sales', 'purchase'].includes(type)) {
        //     res.status(400).json({
        //         success: false,
        //         message: 'Invalid type parameter. Must be "all", "sales", or "purchase"'
        //     });
        //     return;
        // }
        
        const result = await WarehouseService.getAllLocationsService({ 
            searchTerm, 
            // type: type as 'all' | 'sales' | 'purchase' 
        });
        
        res.status(200).json({
            success: true,
            message: 'Locations fetched successfully',
            data: result.data,
            count: result.count
        });
    } catch (error) {
        console.error('Error in getAllLocations:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
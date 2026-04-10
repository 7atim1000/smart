"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLocations = exports.bulkDeleteWarehouseLocationsController = exports.deleteWarehouseLocationsController = exports.deleteWarehouseController = exports.updateLocationController = exports.updateWarehouseController = exports.searchLocationsController = exports.getWarehouseByIdController = exports.getwarehousesController = exports.addWarehouseLocationsController = exports.addWarehouseController = void 0;
const WarehouseService = __importStar(require("./warehouses.service"));
// Helper function to get string param
const getStringParam = (param) => {
    return param ? String(param) : undefined;
};
// Helper function to parse boolean from query string
const parseBoolean = (value) => {
    if (value === 'true' || value === '1')
        return true;
    if (value === 'false' || value === '0')
        return false;
    return undefined;
};
// ============================================
// ADD Warehouse CONTROLLER
// ============================================
const addWarehouseController = async (req, res) => {
    try {
        const warehouseData = req.body;
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
    }
    catch (error) {
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
exports.addWarehouseController = addWarehouseController;
// ============================================
// ADD Warehouse Locations CONTROLLER
// ============================================
const addWarehouseLocationsController = async (req, res) => {
    try {
        const warehouseId = getStringParam(req.params.warehouseId);
        const entryData = req.body;
        if (!warehouseId) {
            res.status(400).json({ success: false, message: 'Warehouse ID is required' });
            return;
        }
        const requiredFields = [
            'name'
        ];
        const missingFields = requiredFields.filter(field => {
            const value = entryData[field];
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
    }
    catch (error) {
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
exports.addWarehouseLocationsController = addWarehouseLocationsController;
// ============================================
// GET ALL Warehouses CONTROLLER
// ============================================
const getwarehousesController = async (req, res) => {
    try {
        const { search, page, limit, sort } = req.query;
        const filter = {
            ...(search && { search: search }),
            ...(page && { page: Number(page) }),
            ...(limit && { limit: Number(limit) }),
            ...(sort && { sort: sort })
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
    }
    catch (error) {
        console.error('Error fetching warehouses:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch warehouses'
        });
    }
};
exports.getwarehousesController = getwarehousesController;
// ============================================
// GET Warehouse BY ID CONTROLLER
// ============================================
const getWarehouseByIdController = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching warehouse:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch warehouse'
        });
    }
};
exports.getWarehouseByIdController = getWarehouseByIdController;
// ============================================
// SEARCH WAREHOUSE LOCATIONS CONTROLLER
// ============================================
const searchLocationsController = async (req, res) => {
    try {
        const warehouseId = getStringParam(req.params.warehouseId);
        const { search } = req.query;
        if (!warehouseId) {
            res.status(400).json({ success: false, message: 'Warehouse ID is required' });
            return;
        }
        const filter = {
            ...(search && { search: search }),
        };
        const result = await WarehouseService.searchLocationsService(warehouseId, filter);
        res.status(200).json({
            success: true,
            entries: result.entries,
            total: result.total,
            message: 'Warehouse locations fetched successfully'
        });
    }
    catch (error) {
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
exports.searchLocationsController = searchLocationsController;
// ============================================
// UPDATE WAREHOUSE CONTROLLER  00971505451178
// ============================================
const updateWarehouseController = async (req, res) => {
    try {
        const id = getStringParam(req.params.id);
        const updateData = req.body;
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
    }
    catch (error) {
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
exports.updateWarehouseController = updateWarehouseController;
// ============================================
// UPDATE WAREHOSUE ENTRY CONTROLLER
// ============================================
const updateLocationController = async (req, res) => {
    try {
        const warehouseId = getStringParam(req.params.warehouseId);
        const entryId = getStringParam(req.params.entryId);
        const updateData = req.body;
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
    }
    catch (error) {
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
exports.updateLocationController = updateLocationController;
// ============================================
// DELETE WAREHOUSE CONTROLLER
// ============================================
const deleteWarehouseController = async (req, res) => {
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
    }
    catch (error) {
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
exports.deleteWarehouseController = deleteWarehouseController;
// ============================================
// DELETE Warehouse Controllers CONTROLLER
// ============================================
const deleteWarehouseLocationsController = async (req, res) => {
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
    }
    catch (error) {
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
exports.deleteWarehouseLocationsController = deleteWarehouseLocationsController;
// ============================================
// BULK DELETE WAREHOUSE LOCATION CONTROLLER
// ============================================
const bulkDeleteWarehouseLocationsController = async (req, res) => {
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
    }
    catch (error) {
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
exports.bulkDeleteWarehouseLocationsController = bulkDeleteWarehouseLocationsController;
// Fetch locations with out HEARARCHY
const getAllLocations = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
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
    }
    catch (error) {
        console.error('Error in getAllLocations:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getAllLocations = getAllLocations;

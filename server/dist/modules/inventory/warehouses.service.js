"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLocationsService = exports.bulkDeleteWarehouseLocationsService = exports.deleteLocationService = exports.deleteWarehouseService = exports.updateLocationService = exports.updateWarehouseService = exports.searchLocationsService = exports.getWarehouseByIdService = exports.getWarehouseService = exports.addLocationService = exports.addWarehouseService = void 0;
const warehouses_model_1 = require("./warehouses.model");
// ============================================
// ADD CATEGORY SERVICE
// ============================================
const addWarehouseService = async (warehouseData) => {
    try {
        // Check if warehouse with same name already exists
        const existingWarehouse = await warehouses_model_1.Warehouse.findOne({ name: warehouseData.name });
        if (existingWarehouse) {
            throw new Error('Warehouse with this name already exists');
        }
        const warehouse = new warehouses_model_1.Warehouse({
            name: warehouseData.name,
            locations: warehouseData.locations || []
        });
        await warehouse.save();
        return warehouse;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to create warehouse');
    }
};
exports.addWarehouseService = addWarehouseService;
// ============================================
// ADD Location SERVICE
// ============================================
const addLocationService = async (warehouseId, entryData) => {
    try {
        const warehouse = await warehouses_model_1.Warehouse.findById(warehouseId);
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }
        // Add new entry to products array
        warehouse.locations.push(entryData);
        await warehouse.save();
        return warehouse;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to add location');
    }
};
exports.addLocationService = addLocationService;
// ============================================
// GET ALL Warehouse SERVICE
// ============================================
const getWarehouseService = async (filter) => {
    try {
        const { search, page = 1, limit = 10, sort = '-createdAt' } = filter || {};
        // Build query
        const query = {};
        // Search by warehouse name
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } }
            ];
        }
        // Calculate pagination
        const skip = (page - 1) * limit;
        // Execute query
        const warehouses = await warehouses_model_1.Warehouse.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        // Get total count
        const total = await warehouses_model_1.Warehouse.countDocuments(query);
        return { warehouses, total };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch warehouses');
    }
};
exports.getWarehouseService = getWarehouseService;
// ============================================
// GET Warehouse BY ID SERVICE
// ============================================
const getWarehouseByIdService = async (id) => {
    try {
        const warehouse = await warehouses_model_1.Warehouse.findById(id);
        return warehouse;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch warehouse');
    }
};
exports.getWarehouseByIdService = getWarehouseByIdService;
// ============================================
// SEARCH Warehouse Locations SERVICE
// ============================================
const searchLocationsService = async (warehouseId, filter) => {
    try {
        const { search } = filter || {};
        const warehouse = await warehouses_model_1.Warehouse.findById(warehouseId);
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }
        // Filter entries
        let entries = warehouse.locations;
        // Filter by search term
        if (search) {
            entries = entries.filter(entry => entry.name.toLowerCase().includes(search.toLowerCase()));
        }
        return {
            entries,
            total: entries.length
        };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to search locations');
    }
};
exports.searchLocationsService = searchLocationsService;
// ============================================
// UPDATE Warehouse SERVICE
// ============================================
const updateWarehouseService = async (id, updateData) => {
    try {
        const warehouse = await warehouses_model_1.Warehouse.findById(id);
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }
        // If name is being updated, check for duplicates
        if (updateData.name && updateData.name !== warehouse.name) {
            const existingWarehouse = await warehouses_model_1.Warehouse.findOne({
                name: updateData.name,
                _id: { $ne: id }
            });
            if (existingWarehouse) {
                throw new Error('Warehouse with this name already exists');
            }
        }
        const updatedWarehouse = await warehouses_model_1.Warehouse.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
        return updatedWarehouse;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to update warehouse');
    }
};
exports.updateWarehouseService = updateWarehouseService;
// ============================================
// UPDATE Warehouse locations SERVICE
// ============================================
const updateLocationService = async (warehouseId, entryId, updateData) => {
    try {
        const warehouse = await warehouses_model_1.Warehouse.findById(warehouseId);
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }
        // Find the entry index
        const entryIndex = warehouse.locations.findIndex((entry) => entry._id.toString() === entryId);
        if (entryIndex === -1) {
            throw new Error('Warehouse locations not found');
        }
        // Get the existing entry
        const existingEntry = warehouse.locations[entryIndex];
        // Create a plain object from the existing entry
        // Since existingEntry is already a plain object (from the schema), we can spread it directly
        const existingEntryObject = {
            _id: existingEntry._id,
            name: existingEntry.name,
            createdBy: existingEntry.createdBy,
            createdAt: existingEntry.createdAt
        };
        // Update the entry by merging existing data with update data
        warehouse.locations[entryIndex] = {
            ...existingEntryObject,
            ...updateData,
            _id: existingEntry._id // Preserve the original _id
        };
        // Mark the products array as modified to ensure save works
        warehouse.markModified('locations');
        await warehouse.save();
        return warehouse;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to update warehouse locations');
    }
};
exports.updateLocationService = updateLocationService;
// ============================================
// DELETE Warehouse SERVICE
// ============================================
const deleteWarehouseService = async (id) => {
    try {
        const warehouse = await warehouses_model_1.Warehouse.findById(id);
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }
        // Check if warehouse has locations before deleting
        if (warehouse.locations && warehouse.locations.length > 0) {
            throw new Error('Cannot delete warehouse with existing locations. Delete locations first.');
        }
        await warehouses_model_1.Warehouse.findByIdAndDelete(id);
        return {
            success: true,
            message: 'Warehouse deleted successfully'
        };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to delete warehouse');
    }
};
exports.deleteWarehouseService = deleteWarehouseService;
// ============================================
// DELETE Warehouse ENTRY SERVICE
// ============================================
const deleteLocationService = async (warehouseId, entryId) => {
    try {
        const warehouse = await warehouses_model_1.Warehouse.findById(warehouseId);
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }
        // Remove the entry
        warehouse.locations = warehouse.locations.filter((entry) => entry._id.toString() !== entryId);
        await warehouse.save();
        return warehouse;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to delete warehouse location');
    }
};
exports.deleteLocationService = deleteLocationService;
// ============================================
// BULK DELETE Warehouse Locations SERVICE
// ============================================
const bulkDeleteWarehouseLocationsService = async (warehouseId, entryIds) => {
    try {
        const warehouse = await warehouses_model_1.Warehouse.findById(warehouseId);
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }
        // Remove multiple entries
        warehouse.locations = warehouse.locations.filter((entry) => !entryIds.includes(entry._id.toString()));
        await warehouse.save();
        return warehouse;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to delete warehouse locations');
    }
};
exports.bulkDeleteWarehouseLocationsService = bulkDeleteWarehouseLocationsService;
const getAllLocationsService = async (params = {}) => {
    try {
        const { searchTerm = '' } = params;
        // Build search query for categories that have matching products
        const searchQuery = searchTerm
            ? {
                'locations.name': { $regex: searchTerm, $options: 'i' }
            }
            : {};
        // Fetch warehouse with their locations
        const warehouses = await warehouses_model_1.Warehouse.find(searchQuery)
            .select('name locations')
            .lean();
        // Extract all products from categories
        let allLocations = [];
        warehouses.forEach((warehouse) => {
            if (warehouse.locations && warehouse.locations.length > 0) {
                // Filter locations based on type
                let filteredLocations = warehouse.locations;
                const locationsWithWarehouse = filteredLocations.map((location) => ({
                    _id: location._id?.toString(),
                    name: location.name,
                }));
                allLocations = [...allLocations, ...locationsWithWarehouse];
            }
        });
        // Additional search filtering if needed (searches across all fields)
        if (searchTerm) {
            allLocations = allLocations.filter(location => location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (location.name && location.name.toLowerCase().includes(searchTerm.toLowerCase())));
        }
        return {
            success: true,
            data: allLocations,
            count: allLocations.length
        };
    }
    catch (error) {
        console.error('Error in getAllLocationsService:', error);
        throw error;
    }
};
exports.getAllLocationsService = getAllLocationsService;

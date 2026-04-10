import { Warehouse } from './warehouses.model';
import { 
    IWarehouse, 
    LocationsWithWarehouse,
    AddWarehouseRequest, 
    AddLocationRequest,
    UpdateWarehouseRequest,
    UpdateLocationRequest,
    WarehouseFilterRequest,
    LocationFilterRequest
} from './warehouses.interface';

// ============================================
// ADD CATEGORY SERVICE
// ============================================
export const addWarehouseService = async (warehouseData: AddWarehouseRequest): Promise<IWarehouse> => {
    try {
        // Check if warehouse with same name already exists
        const existingWarehouse = await Warehouse.findOne({ name: warehouseData.name });
        if (existingWarehouse) {
            throw new Error('Warehouse with this name already exists');
        }

        const warehouse = new Warehouse({
            name: warehouseData.name,
            locations: warehouseData.locations || []
        });

        await warehouse.save();
        return warehouse;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to create warehouse');
    }
};

// ============================================
// ADD Location SERVICE
// ============================================
export const addLocationService = async (
    warehouseId: string, 
    entryData: AddLocationRequest
): Promise<IWarehouse | null> => {
    try {
        const warehouse = await Warehouse.findById(warehouseId);
        
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        // Add new entry to products array
        warehouse.locations.push(entryData as any);
        await warehouse.save();

        return warehouse;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to add location');
    }
};

// ============================================
// GET ALL Warehouse SERVICE
// ============================================
export const getWarehouseService = async (filter?: WarehouseFilterRequest): Promise<{ warehouses: IWarehouse[]; total: number }> => {
    try {
        const { search, page = 1, limit = 10, sort = '-createdAt' } = filter || {};

        // Build query
        const query: any = {};

        // Search by warehouse name
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query
        const warehouses = await Warehouse.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Get total count
        const total = await Warehouse.countDocuments(query);

        return { warehouses, total };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch warehouses');
    }
};

// ============================================
// GET Warehouse BY ID SERVICE
// ============================================
export const getWarehouseByIdService = async (id: string): Promise<IWarehouse | null> => {
    try {
        const warehouse = await Warehouse.findById(id);
        return warehouse;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch warehouse');
    }
};

// ============================================
// SEARCH Warehouse Locations SERVICE
// ============================================
export const searchLocationsService = async (
    warehouseId: string,
    filter?: LocationFilterRequest
): Promise<{ entries: any[]; total: number }> => {
    try {
        const { search } = filter || {};

        const warehouse = await Warehouse.findById(warehouseId);
        
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        // Filter entries
        let entries = warehouse.locations;

        // Filter by search term
        if (search) {
            entries = entries.filter(entry => 
                entry.name.toLowerCase().includes(search.toLowerCase())
            );
        }

    

        return {
            entries,
            total: entries.length
        };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to search locations');
    }
};

// ============================================
// UPDATE Warehouse SERVICE
// ============================================
export const updateWarehouseService = async (
    id: string, 
    updateData: UpdateWarehouseRequest
): Promise<IWarehouse | null> => {
    try {
        const warehouse = await Warehouse.findById(id);
        
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        // If name is being updated, check for duplicates
        if (updateData.name && updateData.name !== warehouse.name) {
            const existingWarehouse = await Warehouse.findOne({ 
                name: updateData.name,
                _id: { $ne: id }
            });
            
            if (existingWarehouse) {
                throw new Error('Warehouse with this name already exists');
            }
        }

        const updatedWarehouse = await Warehouse.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return updatedWarehouse;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update warehouse');
    }
};

// ============================================
// UPDATE Warehouse locations SERVICE
// ============================================
export const updateLocationService = async (
    warehouseId: string,
    entryId: string,
    updateData: UpdateLocationRequest
): Promise<IWarehouse | null> => {
    try {
        const warehouse = await Warehouse.findById(warehouseId);
        
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        // Find the entry index
        const entryIndex = warehouse.locations.findIndex(
            (entry: any) => entry._id.toString() === entryId
        );

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
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update warehouse locations');
    }
};

// ============================================
// DELETE Warehouse SERVICE
// ============================================
export const deleteWarehouseService = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        const warehouse = await Warehouse.findById(id);
        
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        // Check if warehouse has locations before deleting
        if (warehouse.locations && warehouse.locations.length > 0) {
            throw new Error('Cannot delete warehouse with existing locations. Delete locations first.');
        }

        await Warehouse.findByIdAndDelete(id);

        return {
            success: true,
            message: 'Warehouse deleted successfully'
        };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to delete warehouse');
    }
};

// ============================================
// DELETE Warehouse ENTRY SERVICE
// ============================================
export const deleteLocationService = async (
    warehouseId: string,
    entryId: string
): Promise<IWarehouse | null> => {
    try {
        const warehouse = await Warehouse.findById(warehouseId);
        
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        // Remove the entry
        warehouse.locations = warehouse.locations.filter(
            (entry: any) => entry._id.toString() !== entryId
        );

        await warehouse.save();
        return warehouse;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to delete warehouse location');
    }
};

// ============================================
// BULK DELETE Warehouse Locations SERVICE
// ============================================
export const bulkDeleteWarehouseLocationsService = async (
    warehouseId: string,
    entryIds: string[]
): Promise<IWarehouse | null> => {
    try {
        const warehouse = await Warehouse.findById(warehouseId);
        
        if (!warehouse) {
            throw new Error('Warehouse not found');
        }

        // Remove multiple entries
        warehouse.locations = warehouse.locations.filter(
            (entry: any) => !entryIds.includes(entry._id.toString())
        );

        await warehouse.save();
        return warehouse;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to delete warehouse locations');
    }
};


// fetch locations Directory with out HIERARCHY

interface GetAllLocationsResponse {
    success: boolean;
    data: LocationsWithWarehouse[];
    count: number;
}

interface GetAllLocationsParams {
    searchTerm?: string;
    type?: 'sales' | 'purchase' | 'all';
}

export const getAllLocationsService = async (params: GetAllLocationsParams = {}): Promise<GetAllLocationsResponse> => {
    try {
        const { searchTerm = '' } = params;

        // Build search query for categories that have matching products
        const searchQuery = searchTerm 
            ? { 
                'locations.name': { $regex: searchTerm, $options: 'i' } 
              }
            : {};

        // Fetch warehouse with their locations
        const warehouses = await Warehouse.find(searchQuery)
            .select('name locations')
            .lean();

        // Extract all products from categories
        let allLocations: LocationsWithWarehouse[] = [];
        
        warehouses.forEach((warehouse: any) => {
            if (warehouse.locations && warehouse.locations.length > 0) {
                // Filter locations based on type
                let filteredLocations = warehouse.locations;
                
                
                const locationsWithWarehouse = filteredLocations.map((location: any) => ({
                    _id: location._id?.toString(),
                    name: location.name,
                    
                }));
                
                allLocations = [...allLocations, ...locationsWithWarehouse];
            }
        });

        // Additional search filtering if needed (searches across all fields)
        if (searchTerm) {
            allLocations = allLocations.filter(location => 
                location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (location.name && location.name.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return {
            success: true,
            data: allLocations,
            count: allLocations.length
        };
    } catch (error) {
        console.error('Error in getAllLocationsService:', error);
        throw error;
    }
};
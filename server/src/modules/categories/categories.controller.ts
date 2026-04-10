import { Request, Response } from 'express';
import * as CategoriesService from './categories.service';
import { 
    AddCategoryRequest, 
    AddCategoryEntryRequest,
    UpdateCategoryRequest,
    UpdateCategoryEntryRequest,
    CategoryFilterRequest,
    CategoryEntryFilterRequest
} from './categories.interface';

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
// ADD CATEGORY CONTROLLER
// ============================================
export const addCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const categoryData: AddCategoryRequest = req.body;

        // Validate required fields
        if (!categoryData.name) {
            res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
            return;
        }

        const category = await CategoriesService.addCategoryService(categoryData);

        res.status(201).json({
            success: true,
            category,
            message: 'Category created successfully'
        });
    } catch (error: any) {
        console.error('Error adding category:', error);
        
        if (error.message.includes('already exists')) {
            res.status(409).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to create category' 
        });
    }
};

// ============================================
// ADD CATEGORY ENTRY CONTROLLER
// ============================================
export const addCategoryEntryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const categoryId = getStringParam(req.params.categoryId);
        const entryData: AddCategoryEntryRequest = req.body;

        if (!categoryId) {
            res.status(400).json({ success: false, message: 'Category ID is required' });
            return;
        }

        // Validate required fields for entry
        // const requiredFields = [
        //     'name', 'qty', 'unit', 'salePrice', 'saleUnit', 'costUnit', 'costPrice', 'sales', 'purchase',
        //     'accSalesName', 'accSalesNameArb', 'accSalesGroup', 'accSalesGroupArb',
        //     'accSalesClass', 'accSalesClassArb', 'accSalesLevel', 'accSalesLevelArb',
        //     'accSalesChart', 'accSalesChartArb', 'accSalesType',
        //     'accPurchaseName', 'accPurchaseNameArb', 'accPurchaseGroup', 'accPurchaseGroupArb',
        //     'accPurchaseClass', 'accPurchaseClassArb', 'accPurchaseLevel', 'accPurchaseLevelArb',
        //     'accPurchaseChart', 'accPurchaseChartArb', 'accPurchaseType'
        // ];
        const requiredFields = [
            'name', 'qty', 'unit', 'salePrice', 'saleCurrency',  'costPrice', 'costCurrency', 'sales', 'purchase', 'goods', 'service'
        ];

        const missingFields = requiredFields.filter(field => {
            const value = entryData[field as keyof AddCategoryEntryRequest];
            return value === undefined || value === null || value === '';
        });

        if (missingFields.length > 0) {
            res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
            return;
        }

        // Validate boolean fields
        if (typeof entryData.sales !== 'boolean') {
            res.status(400).json({
                success: false,
                message: 'sales must be a boolean'
            });
            return;
        }

        if (typeof entryData.purchase !== 'boolean') {
            res.status(400).json({
                success: false,
                message: 'purchase must be a boolean'
            });
            return;
        }

        const category = await CategoriesService.addCategoryEntryService(categoryId, entryData);

        res.status(201).json({
            success: true,
            category,
            message: 'Product added successfully'
        });
    } catch (error: any) {
        console.error('Error adding category entry:', error);
        
        if (error.message === 'Category not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to add category entry' 
        });
    }
};

// ============================================
// GET ALL CATEGORIES CONTROLLER
// ============================================
export const getCategoriesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, page, limit, sort } = req.query;

        const filter: CategoryFilterRequest = {
            ...(search && { search: search as string }),
            ...(page && { page: Number(page) }),
            ...(limit && { limit: Number(limit) }),
            ...(sort && { sort: sort as string })
        };

        const result = await CategoriesService.getCategoriesService(filter);

        res.status(200).json({
            success: true,
            categories: result.categories,
            pagination: {
                total: result.total,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 10,
                totalPages: Math.ceil(result.total / (limit ? Number(limit) : 10))
            },
            message: 'Categories fetched successfully'
        });
    } catch (error: any) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch categories' 
        });
    }
};

// ============================================
// GET CATEGORY BY ID CONTROLLER
// ============================================
export const getCategoryByIdController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = getStringParam(req.params.id);

        if (!id) {
            res.status(400).json({ success: false, message: 'Category ID is required' });
            return;
        }

        const category = await CategoriesService.getCategoryByIdService(id);

        if (!category) {
            res.status(404).json({ success: false, message: 'Category not found' });
            return;
        }

        res.status(200).json({
            success: true,
            category,
            message: 'Category fetched successfully'
        });
    } catch (error: any) {
        console.error('Error fetching category:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch category' 
        });
    }
};

// ============================================
// SEARCH CATEGORY ENTRIES CONTROLLER
// ============================================
export const searchCategoryEntriesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const categoryId = getStringParam(req.params.categoryId);
        const { search, sales, purchase } = req.query;

        if (!categoryId) {
            res.status(400).json({ success: false, message: 'Category ID is required' });
            return;
        }

        const filter: CategoryEntryFilterRequest = {
            ...(search && { search: search as string }),
            ...(sales !== undefined && { sales: parseBoolean(sales) }),
            ...(purchase !== undefined && { purchase: parseBoolean(purchase) })
        };

        const result = await CategoriesService.searchCategoryEntriesService(categoryId, filter);

        res.status(200).json({
            success: true,
            entries: result.entries,
            total: result.total,
            message: 'Category entries fetched successfully'
        });
    } catch (error: any) {
        console.error('Error searching category entries:', error);
        
        if (error.message === 'Category not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to search category entries' 
        });
    }
};

// ============================================
// UPDATE CATEGORY CONTROLLER
// ============================================
export const updateCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = getStringParam(req.params.id);
        const updateData: UpdateCategoryRequest = req.body;

        if (!id) {
            res.status(400).json({ success: false, message: 'Category ID is required' });
            return;
        }

        if (Object.keys(updateData).length === 0) {
            res.status(400).json({ 
                success: false, 
                message: 'At least one field must be provided for update' 
            });
            return;
        }

        const category = await CategoriesService.updateCategoryService(id, updateData);

        res.status(200).json({
            success: true,
            category,
            message: 'Category updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating category:', error);
        
        if (error.message === 'Category not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        if (error.message.includes('already exists')) {
            res.status(409).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to update category' 
        });
    }
};

// ============================================
// UPDATE CATEGORY ENTRY CONTROLLER
// ============================================
export const updateCategoryEntryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const categoryId = getStringParam(req.params.categoryId);
        const entryId = getStringParam(req.params.entryId);
        const updateData: UpdateCategoryEntryRequest = req.body;

        if (!categoryId || !entryId) {
            res.status(400).json({ 
                success: false, 
                message: 'Category ID and Entry ID are required' 
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

        const category = await CategoriesService.updateCategoryEntryService(categoryId, entryId, updateData);

        res.status(200).json({
            success: true,
            category,
            message: 'Category entry updated successfully'
        });
    } catch (error: any) {
        console.error('Error updating category entry:', error);
        
        if (error.message === 'Category not found' || error.message === 'Category entry not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to update category entry' 
        });
    }
};

// ============================================
// DELETE CATEGORY CONTROLLER
// ============================================
export const deleteCategoryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = getStringParam(req.params.id);

        if (!id) {
            res.status(400).json({ success: false, message: 'Category ID is required' });
            return;
        }

        const result = await CategoriesService.deleteCategoryService(id);

        res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error: any) {
        console.error('Error deleting category:', error);
        
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
            message: error.message || 'Failed to delete category' 
        });
    }
};

// ============================================
// DELETE CATEGORY ENTRY CONTROLLER
// ============================================
export const deleteCategoryEntryController = async (req: Request, res: Response): Promise<void> => {
    try {
        const categoryId = getStringParam(req.params.categoryId);
        const entryId = getStringParam(req.params.entryId);

        if (!categoryId || !entryId) {
            res.status(400).json({ 
                success: false, 
                message: 'Category ID and Entry ID are required' 
            });
            return;
        }

        const category = await CategoriesService.deleteCategoryEntryService(categoryId, entryId);

        res.status(200).json({
            success: true,
            category,
            message: 'Category entry deleted successfully'
        });
    } catch (error: any) {
        console.error('Error deleting category entry:', error);
        
        if (error.message === 'Category not found' || error.message === 'Category entry not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to delete category entry' 
        });
    }
};

// ============================================
// BULK DELETE CATEGORY ENTRIES CONTROLLER
// ============================================
export const bulkDeleteCategoryEntriesController = async (req: Request, res: Response): Promise<void> => {
    try {
        const categoryId = getStringParam(req.params.categoryId);
        const { entryIds } = req.body;

        if (!categoryId) {
            res.status(400).json({ success: false, message: 'Category ID is required' });
            return;
        }

        if (!entryIds || !Array.isArray(entryIds) || entryIds.length === 0) {
            res.status(400).json({ 
                success: false, 
                message: 'Entry IDs array is required' 
            });
            return;
        }

        const category = await CategoriesService.bulkDeleteCategoryEntriesService(categoryId, entryIds);

        res.status(200).json({
            success: true,
            category,
            message: `${entryIds.length} category entries deleted successfully`
        });
    } catch (error: any) {
        console.error('Error bulk deleting category entries:', error);
        
        if (error.message === 'Category not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }

        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to delete category entries' 
        });
    }
};


// Fetch products with out HEARARCHY
export const getAllProducts = async (req: Request, res: Response): Promise<void> => {
    try {
        const searchTerm = req.query.search as string || '';
        const type = req.query.type as string || 'all';
        
        // Validate type parameter
        if (!['all', 'sales', 'purchase'].includes(type)) {
            res.status(400).json({
                success: false,
                message: 'Invalid type parameter. Must be "all", "sales", or "purchase"'
            });
            return;
        }
        
        const result = await CategoriesService.getAllProductsService({ 
            searchTerm, 
            type: type as 'all' | 'sales' | 'purchase' 
        });
        
        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: result.data,
            count: result.count
        });
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
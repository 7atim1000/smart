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
exports.getAllProducts = exports.bulkDeleteCategoryEntriesController = exports.deleteCategoryEntryController = exports.deleteCategoryController = exports.updateCategoryEntryController = exports.updateCategoryController = exports.searchCategoryEntriesController = exports.getCategoryByIdController = exports.getCategoriesController = exports.addCategoryEntryController = exports.addCategoryController = void 0;
const CategoriesService = __importStar(require("./categories.service"));
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
// ADD CATEGORY CONTROLLER
// ============================================
const addCategoryController = async (req, res) => {
    try {
        const categoryData = req.body;
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
    }
    catch (error) {
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
exports.addCategoryController = addCategoryController;
// ============================================
// ADD CATEGORY ENTRY CONTROLLER
// ============================================
const addCategoryEntryController = async (req, res) => {
    try {
        const categoryId = getStringParam(req.params.categoryId);
        const entryData = req.body;
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
            'name', 'qty', 'unit', 'salePrice', 'saleCurrency', 'costPrice', 'costCurrency', 'sales', 'purchase', 'goods', 'service'
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
    }
    catch (error) {
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
exports.addCategoryEntryController = addCategoryEntryController;
// ============================================
// GET ALL CATEGORIES CONTROLLER
// ============================================
const getCategoriesController = async (req, res) => {
    try {
        const { search, page, limit, sort } = req.query;
        const filter = {
            ...(search && { search: search }),
            ...(page && { page: Number(page) }),
            ...(limit && { limit: Number(limit) }),
            ...(sort && { sort: sort })
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
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch categories'
        });
    }
};
exports.getCategoriesController = getCategoriesController;
// ============================================
// GET CATEGORY BY ID CONTROLLER
// ============================================
const getCategoryByIdController = async (req, res) => {
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
    }
    catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch category'
        });
    }
};
exports.getCategoryByIdController = getCategoryByIdController;
// ============================================
// SEARCH CATEGORY ENTRIES CONTROLLER
// ============================================
const searchCategoryEntriesController = async (req, res) => {
    try {
        const categoryId = getStringParam(req.params.categoryId);
        const { search, sales, purchase } = req.query;
        if (!categoryId) {
            res.status(400).json({ success: false, message: 'Category ID is required' });
            return;
        }
        const filter = {
            ...(search && { search: search }),
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
    }
    catch (error) {
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
exports.searchCategoryEntriesController = searchCategoryEntriesController;
// ============================================
// UPDATE CATEGORY CONTROLLER
// ============================================
const updateCategoryController = async (req, res) => {
    try {
        const id = getStringParam(req.params.id);
        const updateData = req.body;
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
    }
    catch (error) {
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
exports.updateCategoryController = updateCategoryController;
// ============================================
// UPDATE CATEGORY ENTRY CONTROLLER
// ============================================
const updateCategoryEntryController = async (req, res) => {
    try {
        const categoryId = getStringParam(req.params.categoryId);
        const entryId = getStringParam(req.params.entryId);
        const updateData = req.body;
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
    }
    catch (error) {
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
exports.updateCategoryEntryController = updateCategoryEntryController;
// ============================================
// DELETE CATEGORY CONTROLLER
// ============================================
const deleteCategoryController = async (req, res) => {
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
    }
    catch (error) {
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
exports.deleteCategoryController = deleteCategoryController;
// ============================================
// DELETE CATEGORY ENTRY CONTROLLER
// ============================================
const deleteCategoryEntryController = async (req, res) => {
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
    }
    catch (error) {
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
exports.deleteCategoryEntryController = deleteCategoryEntryController;
// ============================================
// BULK DELETE CATEGORY ENTRIES CONTROLLER
// ============================================
const bulkDeleteCategoryEntriesController = async (req, res) => {
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
    }
    catch (error) {
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
exports.bulkDeleteCategoryEntriesController = bulkDeleteCategoryEntriesController;
// Fetch products with out HEARARCHY
const getAllProducts = async (req, res) => {
    try {
        const searchTerm = req.query.search || '';
        const type = req.query.type || 'all';
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
            type: type
        });
        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: result.data,
            count: result.count
        });
    }
    catch (error) {
        console.error('Error in getAllProducts:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};
exports.getAllProducts = getAllProducts;

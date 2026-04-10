"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllProductsService = exports.bulkDeleteCategoryEntriesService = exports.deleteCategoryEntryService = exports.deleteCategoryService = exports.updateCategoryEntryService = exports.updateCategoryService = exports.searchCategoryEntriesService = exports.getCategoryByIdService = exports.getCategoriesService = exports.addCategoryEntryService = exports.addCategoryService = void 0;
const categories_model_1 = require("./categories.model");
// ============================================
// ADD CATEGORY SERVICE
// ============================================
const addCategoryService = async (categoryData) => {
    try {
        // Check if category with same name already exists
        const existingCategory = await categories_model_1.Category.findOne({ name: categoryData.name });
        if (existingCategory) {
            throw new Error('Category with this name already exists');
        }
        const category = new categories_model_1.Category({
            name: categoryData.name,
            products: categoryData.products || []
        });
        await category.save();
        return category;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to create category');
    }
};
exports.addCategoryService = addCategoryService;
// ============================================
// ADD CATEGORY ENTRY SERVICE
// ============================================
const addCategoryEntryService = async (categoryId, entryData) => {
    try {
        const category = await categories_model_1.Category.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        // Add new entry to products array
        category.products.push(entryData);
        await category.save();
        return category;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to add category entry');
    }
};
exports.addCategoryEntryService = addCategoryEntryService;
// ============================================
// GET ALL CATEGORIES SERVICE
// ============================================
const getCategoriesService = async (filter) => {
    try {
        const { search, page = 1, limit = 10, sort = '-createdAt' } = filter || {};
        // Build query
        const query = {};
        // Search by category name
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } }
            ];
        }
        // Calculate pagination
        const skip = (page - 1) * limit;
        // Execute query
        const categories = await categories_model_1.Category.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        // Get total count
        const total = await categories_model_1.Category.countDocuments(query);
        return { categories, total };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch categories');
    }
};
exports.getCategoriesService = getCategoriesService;
// ============================================
// GET CATEGORY BY ID SERVICE
// ============================================
const getCategoryByIdService = async (id) => {
    try {
        const category = await categories_model_1.Category.findById(id);
        return category;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch category');
    }
};
exports.getCategoryByIdService = getCategoryByIdService;
// ============================================
// SEARCH CATEGORY ENTRIES SERVICE
// ============================================
const searchCategoryEntriesService = async (categoryId, filter) => {
    try {
        const { search, sales, purchase } = filter || {};
        const category = await categories_model_1.Category.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        // Filter entries
        let entries = category.products;
        // Filter by search term
        if (search) {
            entries = entries.filter(entry => entry.name.toLowerCase().includes(search.toLowerCase()));
        }
        // Filter by sales boolean
        if (sales !== undefined) {
            entries = entries.filter(entry => entry.sales === sales);
        }
        // Filter by purchase boolean
        if (purchase !== undefined) {
            entries = entries.filter(entry => entry.purchase === purchase);
        }
        return {
            entries,
            total: entries.length
        };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to search category entries');
    }
};
exports.searchCategoryEntriesService = searchCategoryEntriesService;
// ============================================
// UPDATE CATEGORY SERVICE
// ============================================
const updateCategoryService = async (id, updateData) => {
    try {
        const category = await categories_model_1.Category.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }
        // If name is being updated, check for duplicates
        if (updateData.name && updateData.name !== category.name) {
            const existingCategory = await categories_model_1.Category.findOne({
                name: updateData.name,
                _id: { $ne: id }
            });
            if (existingCategory) {
                throw new Error('Category with this name already exists');
            }
        }
        const updatedCategory = await categories_model_1.Category.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
        return updatedCategory;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to update category');
    }
};
exports.updateCategoryService = updateCategoryService;
// ============================================
// UPDATE CATEGORY ENTRY SERVICE
// ============================================
const updateCategoryEntryService = async (categoryId, entryId, updateData) => {
    try {
        const category = await categories_model_1.Category.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        // Find the entry index
        const entryIndex = category.products.findIndex((entry) => entry._id.toString() === entryId);
        if (entryIndex === -1) {
            throw new Error('Category entry not found');
        }
        // Get the existing entry
        const existingEntry = category.products[entryIndex];
        // Create a plain object from the existing entry
        // Since existingEntry is already a plain object (from the schema), we can spread it directly
        const existingEntryObject = {
            _id: existingEntry._id,
            name: existingEntry.name,
            barcode: existingEntry.barcode,
            qty: existingEntry.qty,
            unit: existingEntry.unit,
            salePrice: existingEntry.salePrice,
            saleCurrency: existingEntry.saleCurrency,
            costPrice: existingEntry.costPrice,
            costCurrency: existingEntry.costCurrency,
            sales: existingEntry.sales,
            purchase: existingEntry.purchase,
            goods: existingEntry.goods,
            service: existingEntry.service,
            accSalesName: existingEntry.accSalesName,
            accSalesNameArb: existingEntry.accSalesNameArb,
            accSalesGroup: existingEntry.accSalesGroup,
            accSalesGroupArb: existingEntry.accSalesGroupArb,
            accSalesClass: existingEntry.accSalesClass,
            accSalesClassArb: existingEntry.accSalesClassArb,
            accSalesLevel: existingEntry.accSalesLevel,
            accSalesLevelArb: existingEntry.accSalesLevelArb,
            accSalesChart: existingEntry.accSalesChart,
            accSalesChartArb: existingEntry.accSalesChartArb,
            accSalesType: existingEntry.accSalesType,
            accPurchaseName: existingEntry.accPurchaseName,
            accPurchaseNameArb: existingEntry.accPurchaseNameArb,
            accPurchaseGroup: existingEntry.accPurchaseGroup,
            accPurchaseGroupArb: existingEntry.accPurchaseGroupArb,
            accPurchaseClass: existingEntry.accPurchaseClass,
            accPurchaseClassArb: existingEntry.accPurchaseClassArb,
            accPurchaseLevel: existingEntry.accPurchaseLevel,
            accPurchaseLevelArb: existingEntry.accPurchaseLevelArb,
            accPurchaseChart: existingEntry.accPurchaseChart,
            accPurchaseChartArb: existingEntry.accPurchaseChartArb,
            accPurchaseType: existingEntry.accPurchaseType,
            createdBy: existingEntry.createdBy,
            createdAt: existingEntry.createdAt
        };
        // Update the entry by merging existing data with update data
        category.products[entryIndex] = {
            ...existingEntryObject,
            ...updateData,
            _id: existingEntry._id // Preserve the original _id
        };
        // Mark the products array as modified to ensure save works
        category.markModified('products');
        await category.save();
        return category;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to update category entry');
    }
};
exports.updateCategoryEntryService = updateCategoryEntryService;
// ============================================
// DELETE CATEGORY SERVICE
// ============================================
const deleteCategoryService = async (id) => {
    try {
        const category = await categories_model_1.Category.findById(id);
        if (!category) {
            throw new Error('Category not found');
        }
        // Check if category has products before deleting
        if (category.products && category.products.length > 0) {
            throw new Error('Cannot delete category with existing products. Delete products first.');
        }
        await categories_model_1.Category.findByIdAndDelete(id);
        return {
            success: true,
            message: 'Category deleted successfully'
        };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to delete category');
    }
};
exports.deleteCategoryService = deleteCategoryService;
// ============================================
// DELETE CATEGORY ENTRY SERVICE
// ============================================
const deleteCategoryEntryService = async (categoryId, entryId) => {
    try {
        const category = await categories_model_1.Category.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        // Remove the entry
        category.products = category.products.filter((entry) => entry._id.toString() !== entryId);
        await category.save();
        return category;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to delete category entry');
    }
};
exports.deleteCategoryEntryService = deleteCategoryEntryService;
// ============================================
// BULK DELETE CATEGORY ENTRIES SERVICE
// ============================================
const bulkDeleteCategoryEntriesService = async (categoryId, entryIds) => {
    try {
        const category = await categories_model_1.Category.findById(categoryId);
        if (!category) {
            throw new Error('Category not found');
        }
        // Remove multiple entries
        category.products = category.products.filter((entry) => !entryIds.includes(entry._id.toString()));
        await category.save();
        return category;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to delete category entries');
    }
};
exports.bulkDeleteCategoryEntriesService = bulkDeleteCategoryEntriesService;
const getAllProductsService = async (params = {}) => {
    try {
        const { searchTerm = '', type = 'all' } = params;
        // Build search query for categories that have matching products
        const searchQuery = searchTerm
            ? {
                'products.name': { $regex: searchTerm, $options: 'i' }
            }
            : {};
        // Fetch categories with their products
        const categories = await categories_model_1.Category.find(searchQuery)
            .select('name products')
            .lean();
        // Extract all products from categories
        let allProducts = [];
        categories.forEach((category) => {
            if (category.products && category.products.length > 0) {
                // Filter products based on type
                let filteredProducts = category.products;
                if (type === 'sales') {
                    filteredProducts = category.products.filter((product) => product.sales === true);
                }
                else if (type === 'purchase') {
                    filteredProducts = category.products.filter((product) => product.purchase === true);
                }
                const productsWithCategory = filteredProducts.map((product) => ({
                    _id: product._id?.toString(),
                    name: product.name,
                    barcode: product.barcode,
                    qty: product.qty,
                    unit: product.unit,
                    salePrice: product.salePrice,
                    saleCurrency: product.saleCurrency,
                    costPrice: product.costPrice,
                    costCurrency: product.costCurrency,
                    sales: product.sales,
                    purchase: product.purchase,
                    goods: product.goods,
                    service: product.service,
                    accSalesName: product.accSalesName,
                    accSalesNameArb: product.accSalesNameArb,
                    accSalesGroup: product.accSalesGroup,
                    accSalesGroupArb: product.accSalesGroupArb,
                    accSalesClass: product.accSalesClass,
                    accSalesClassArb: product.accSalesClassArb,
                    accSalesLevel: product.accSalesLevel,
                    accSalesLevelArb: product.accSalesLevelArb,
                    accSalesChart: product.accSalesChart,
                    accSalesChartArb: product.accSalesChartArb,
                    accSalesType: product.accSalesType,
                    accPurchaseName: product.accPurchaseName,
                    accPurchaseNameArb: product.accPurchaseNameArb,
                    accPurchaseGroup: product.accPurchaseGroup,
                    accPurchaseGroupArb: product.accPurchaseGroupArb,
                    accPurchaseClass: product.accPurchaseClass,
                    accPurchaseClassArb: product.accPurchaseClassArb,
                    accPurchaseLevel: product.accPurchaseLevel,
                    accPurchaseLevelArb: product.accPurchaseLevelArb,
                    accPurchaseChart: product.accPurchaseChart,
                    accPurchaseChartArb: product.accPurchaseChartArb,
                    accPurchaseType: product.accPurchaseType,
                    createdBy: product.createdBy?.toString(),
                    createdAt: product.createdAt,
                    categoryId: category._id.toString(),
                    categoryName: category.name
                }));
                allProducts = [...allProducts, ...productsWithCategory];
            }
        });
        // Additional search filtering if needed (searches across all fields)
        if (searchTerm) {
            allProducts = allProducts.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase())));
        }
        return {
            success: true,
            data: allProducts,
            count: allProducts.length
        };
    }
    catch (error) {
        console.error('Error in getAllProductsService:', error);
        throw error;
    }
};
exports.getAllProductsService = getAllProductsService;

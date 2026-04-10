import { Category } from './categories.model';
import { 
    ICategory, 
    ProductWithCategory,
    AddCategoryRequest, 
    AddCategoryEntryRequest,
    UpdateCategoryRequest,
    UpdateCategoryEntryRequest,
    CategoryFilterRequest,
    CategoryEntryFilterRequest
} from './categories.interface';

// ============================================
// ADD CATEGORY SERVICE
// ============================================
export const addCategoryService = async (categoryData: AddCategoryRequest): Promise<ICategory> => {
    try {
        // Check if category with same name already exists
        const existingCategory = await Category.findOne({ name: categoryData.name });
        if (existingCategory) {
            throw new Error('Category with this name already exists');
        }

        const category = new Category({
            name: categoryData.name,
            products: categoryData.products || []
        });

        await category.save();
        return category;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to create category');
    }
};

// ============================================
// ADD CATEGORY ENTRY SERVICE
// ============================================
export const addCategoryEntryService = async (
    categoryId: string, 
    entryData: AddCategoryEntryRequest
): Promise<ICategory | null> => {
    try {
        const category = await Category.findById(categoryId);
        
        if (!category) {
            throw new Error('Category not found');
        }

        // Add new entry to products array
        category.products.push(entryData as any);
        await category.save();

        return category;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to add category entry');
    }
};

// ============================================
// GET ALL CATEGORIES SERVICE
// ============================================
export const getCategoriesService = async (filter?: CategoryFilterRequest): Promise<{ categories: ICategory[]; total: number }> => {
    try {
        const { search, page = 1, limit = 10, sort = '-createdAt' } = filter || {};

        // Build query
        const query: any = {};

        // Search by category name
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query
        const categories = await Category.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Get total count
        const total = await Category.countDocuments(query);

        return { categories, total };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch categories');
    }
};

// ============================================
// GET CATEGORY BY ID SERVICE
// ============================================
export const getCategoryByIdService = async (id: string): Promise<ICategory | null> => {
    try {
        const category = await Category.findById(id);
        return category;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch category');
    }
};

// ============================================
// SEARCH CATEGORY ENTRIES SERVICE
// ============================================
export const searchCategoryEntriesService = async (
    categoryId: string,
    filter?: CategoryEntryFilterRequest
): Promise<{ entries: any[]; total: number }> => {
    try {
        const { search, sales, purchase } = filter || {};

        const category = await Category.findById(categoryId);
        
        if (!category) {
            throw new Error('Category not found');
        }

        // Filter entries
        let entries = category.products;

        // Filter by search term
        if (search) {
            entries = entries.filter(entry => 
                entry.name.toLowerCase().includes(search.toLowerCase())
            );
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
    } catch (error: any) {
        throw new Error(error.message || 'Failed to search category entries');
    }
};

// ============================================
// UPDATE CATEGORY SERVICE
// ============================================
export const updateCategoryService = async (
    id: string, 
    updateData: UpdateCategoryRequest
): Promise<ICategory | null> => {
    try {
        const category = await Category.findById(id);
        
        if (!category) {
            throw new Error('Category not found');
        }

        // If name is being updated, check for duplicates
        if (updateData.name && updateData.name !== category.name) {
            const existingCategory = await Category.findOne({ 
                name: updateData.name,
                _id: { $ne: id }
            });
            
            if (existingCategory) {
                throw new Error('Category with this name already exists');
            }
        }

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return updatedCategory;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update category');
    }
};

// ============================================
// UPDATE CATEGORY ENTRY SERVICE
// ============================================
export const updateCategoryEntryService = async (
    categoryId: string,
    entryId: string,
    updateData: UpdateCategoryEntryRequest
): Promise<ICategory | null> => {
    try {
        const category = await Category.findById(categoryId);
        
        if (!category) {
            throw new Error('Category not found');
        }

        // Find the entry index
        const entryIndex = category.products.findIndex(
            (entry: any) => entry._id.toString() === entryId
        );

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
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update category entry');
    }
};

// ============================================
// DELETE CATEGORY SERVICE
// ============================================
export const deleteCategoryService = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        const category = await Category.findById(id);
        
        if (!category) {
            throw new Error('Category not found');
        }

        // Check if category has products before deleting
        if (category.products && category.products.length > 0) {
            throw new Error('Cannot delete category with existing products. Delete products first.');
        }

        await Category.findByIdAndDelete(id);

        return {
            success: true,
            message: 'Category deleted successfully'
        };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to delete category');
    }
};

// ============================================
// DELETE CATEGORY ENTRY SERVICE
// ============================================
export const deleteCategoryEntryService = async (
    categoryId: string,
    entryId: string
): Promise<ICategory | null> => {
    try {
        const category = await Category.findById(categoryId);
        
        if (!category) {
            throw new Error('Category not found');
        }

        // Remove the entry
        category.products = category.products.filter(
            (entry: any) => entry._id.toString() !== entryId
        );

        await category.save();
        return category;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to delete category entry');
    }
};

// ============================================
// BULK DELETE CATEGORY ENTRIES SERVICE
// ============================================
export const bulkDeleteCategoryEntriesService = async (
    categoryId: string,
    entryIds: string[]
): Promise<ICategory | null> => {
    try {
        const category = await Category.findById(categoryId);
        
        if (!category) {
            throw new Error('Category not found');
        }

        // Remove multiple entries
        category.products = category.products.filter(
            (entry: any) => !entryIds.includes(entry._id.toString())
        );

        await category.save();
        return category;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to delete category entries');
    }
};


// fetch products Directory with out HIERARCHY

interface GetAllProductsResponse {
    success: boolean;
    data: ProductWithCategory[];
    count: number;
}

interface GetAllProductsParams {
    searchTerm?: string;
    type?: 'sales' | 'purchase' | 'all';
}

export const getAllProductsService = async (params: GetAllProductsParams = {}): Promise<GetAllProductsResponse> => {
    try {
        const { searchTerm = '', type = 'all' } = params;

        // Build search query for categories that have matching products
        const searchQuery = searchTerm 
            ? { 
                'products.name': { $regex: searchTerm, $options: 'i' } 
              }
            : {};

        // Fetch categories with their products
        const categories = await Category.find(searchQuery)
            .select('name products')
            .lean();

        // Extract all products from categories
        let allProducts: ProductWithCategory[] = [];
        
        categories.forEach((category: any) => {
            if (category.products && category.products.length > 0) {
                // Filter products based on type
                let filteredProducts = category.products;
                
                if (type === 'sales') {
                    filteredProducts = category.products.filter((product: any) => product.sales === true);
                } else if (type === 'purchase') {
                    filteredProducts = category.products.filter((product: any) => product.purchase === true);
                }
                
                const productsWithCategory = filteredProducts.map((product: any) => ({
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
            allProducts = allProducts.filter(product => 
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (product.barcode && product.barcode.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        return {
            success: true,
            data: allProducts,
            count: allProducts.length
        };
    } catch (error) {
        console.error('Error in getAllProductsService:', error);
        throw error;
    }
};
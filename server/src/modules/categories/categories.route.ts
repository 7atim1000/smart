import express from 'express';
import * as CategoriesController from './categories.controller';
import { protectRoute } from '../../middleware/authentication';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protectRoute);

// ============================================
// CATEGORY ROUTES
// ============================================

// GET routes
router.get('/', CategoriesController.getCategoriesController);
router.get('/:id', CategoriesController.getCategoryByIdController);

// POST routes
router.post('/', CategoriesController.addCategoryController);

// PUT routes
router.put('/:id', CategoriesController.updateCategoryController);

// DELETE routes
router.delete('/:id', CategoriesController.deleteCategoryController);

// ============================================
// CATEGORY ENTRY ROUTES (Nested)
// ============================================

// GET - Search entries within a category
router.get('/:categoryId/entries/search', CategoriesController.searchCategoryEntriesController);

// POST - Add entry to category
router.post('/:categoryId/entries', CategoriesController.addCategoryEntryController);

// PUT - Update entry
router.put('/:categoryId/entries/:entryId', CategoriesController.updateCategoryEntryController);

// DELETE - Delete entry
router.delete('/:categoryId/entries/:entryId', CategoriesController.deleteCategoryEntryController);

// POST - Bulk delete entries
router.post('/:categoryId/entries/bulk-delete', CategoriesController.bulkDeleteCategoryEntriesController);

// Products with out HIEARARCHY
router.get('/products/all', CategoriesController.getAllProducts);

export default router;
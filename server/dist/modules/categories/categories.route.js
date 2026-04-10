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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const CategoriesController = __importStar(require("./categories.controller"));
const authentication_1 = require("../../middleware/authentication");
const router = express_1.default.Router();
// Apply authentication middleware to all routes
router.use(authentication_1.protectRoute);
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
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStatsService = void 0;
// services/dashboardService.ts
const categories_model_1 = require("../categories/categories.model");
const contacts_models_1 = require("../contacts/contacts.models");
const invoice_model_1 = __importDefault(require("../invoices/invoice.model"));
const getDashboardStatsService = async () => {
    try {
        // Get total products count from Category model
        // Assuming products are stored within categories
        const categoriesWithProducts = await categories_model_1.Category.aggregate([
            {
                $project: {
                    productCount: { $size: { $ifNull: ["$products", []] } }
                }
            },
            {
                $group: {
                    _id: null,
                    totalProducts: { $sum: "$productCount" }
                }
            }
        ]);
        const totalProducts = categoriesWithProducts.length > 0 ? categoriesWithProducts[0].totalProducts : 0;
        // Get total customers (isReceivable = true)
        const totalCustomers = await contacts_models_1.Contacts.countDocuments({ isReceivable: true });
        // Get total suppliers (isPayable = true)
        const totalSuppliers = await contacts_models_1.Contacts.countDocuments({ isPayable: true });
        // Get total sale invoices (invoiceType = 'Sale invoice' or type = 'sale')
        const totalSaleInvoices = await invoice_model_1.default.countDocuments({
            $or: [
                { invoiceType: 'Sale invoice' },
                { type: 'sale' }
            ]
        });
        // Get total purchase invoices (invoiceType = 'Buy invoice' or type = 'buy')
        const totalPurchaseInvoices = await invoice_model_1.default.countDocuments({
            $or: [
                { invoiceType: 'Buy invoice' },
                { type: 'buy' }
            ]
        });
        // Get last 5 sale invoices with customer details
        const recentSaleInvoices = await invoice_model_1.default.find({
            $or: [
                { invoiceType: 'Sale invoice' },
                { type: 'sale' }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('customer', 'name email phone address')
            .lean();
        // Get last 5 purchase invoices with supplier details
        const recentPurchaseInvoices = await invoice_model_1.default.find({
            $or: [
                { invoiceType: 'Buy invoice' },
                { type: 'buy' }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('supplier', 'name email phone address')
            .lean();
        return {
            totalProducts,
            totalCustomers,
            totalSuppliers,
            totalSaleInvoices,
            totalPurchaseInvoices,
            recentSaleInvoices,
            recentPurchaseInvoices
        };
    }
    catch (error) {
        console.error('Error in getDashboardStatsService:', error);
        throw error;
    }
};
exports.getDashboardStatsService = getDashboardStatsService;

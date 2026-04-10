"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStatsDirectController = exports.getDashboardStatsController = void 0;
const dash_service_1 = require("./dash.service");
const categories_model_1 = require("../categories/categories.model");
const contacts_models_1 = require("../contacts/contacts.models");
const invoice_model_1 = __importDefault(require("../invoices/invoice.model"));
const getDashboardStatsController = async (req, res) => {
    try {
        const stats = await (0, dash_service_1.getDashboardStatsService)();
        res.status(200).json({
            success: true,
            message: 'Dashboard statistics fetched successfully',
            data: stats
        });
    }
    catch (error) {
        console.error('Error in getDashboardStatsController:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};
exports.getDashboardStatsController = getDashboardStatsController;
// Alternative: Direct implementation without service layer
const getDashboardStatsDirectController = async (req, res) => {
    try {
        // Execute all queries in parallel for better performance
        const [categoriesWithProducts, totalCustomers, totalSuppliers, totalSaleInvoices, totalPurchaseInvoices, recentSaleInvoices, recentPurchaseInvoices] = await Promise.all([
            // Total products from categories
            categories_model_1.Category.aggregate([
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
            ]),
            // Total customers (isReceivable = true)
            contacts_models_1.Contacts.countDocuments({ isReceivable: true }),
            // Total suppliers (isPayable = true)
            contacts_models_1.Contacts.countDocuments({ isPayable: true }),
            // Total sale invoices
            invoice_model_1.default.countDocuments({
                $or: [
                    { invoiceType: 'Sale invoice' },
                    { type: 'sale' }
                ]
            }),
            // Total purchase invoices
            invoice_model_1.default.countDocuments({
                $or: [
                    { invoiceType: 'Buy invoice' },
                    { type: 'buy' }
                ]
            }),
            // Last 5 sale invoices
            invoice_model_1.default.find({
                $or: [
                    { invoiceType: 'Sale invoice' },
                    { type: 'sale' }
                ]
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('customer', 'name email phone address')
                .lean(),
            // Last 5 purchase invoices
            invoice_model_1.default.find({
                $or: [
                    { invoiceType: 'Buy invoice' },
                    { type: 'buy' }
                ]
            })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('supplier', 'name email phone address')
                .lean()
        ]);
        const totalProducts = categoriesWithProducts.length > 0 ? categoriesWithProducts[0].totalProducts : 0;
        res.status(200).json({
            success: true,
            message: 'Dashboard statistics fetched successfully',
            data: {
                totalProducts,
                totalCustomers,
                totalSuppliers,
                totalSaleInvoices,
                totalPurchaseInvoices,
                recentSaleInvoices,
                recentPurchaseInvoices
            }
        });
    }
    catch (error) {
        console.error('Error in getDashboardStatsController:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};
exports.getDashboardStatsDirectController = getDashboardStatsDirectController;

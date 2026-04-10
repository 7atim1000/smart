// services/dashboardService.ts
import { Category } from '../categories/categories.model';
import { Contacts } from '../contacts/contacts.models';
import Invoice from '../invoices/invoice.model';
import mongoose from 'mongoose';

interface DashboardStats {
    totalProducts: number;
    totalCustomers: number;
    totalSuppliers: number;
    totalSaleInvoices: number;
    totalPurchaseInvoices: number;
    recentSaleInvoices: any[];
    recentPurchaseInvoices: any[];
}

export const getDashboardStatsService = async (): Promise<DashboardStats> => {
    try {
        // Get total products count from Category model
        // Assuming products are stored within categories
        const categoriesWithProducts = await Category.aggregate([
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
        const totalCustomers = await Contacts.countDocuments({ isReceivable: true });

        // Get total suppliers (isPayable = true)
        const totalSuppliers = await Contacts.countDocuments({ isPayable: true });

        // Get total sale invoices (invoiceType = 'Sale invoice' or type = 'sale')
        const totalSaleInvoices = await Invoice.countDocuments({
            $or: [
                { invoiceType: 'Sale invoice' },
                { type: 'sale' }
            ]
        });

        // Get total purchase invoices (invoiceType = 'Buy invoice' or type = 'buy')
        const totalPurchaseInvoices = await Invoice.countDocuments({
            $or: [
                { invoiceType: 'Buy invoice' },
                { type: 'buy' }
            ]
        });

        // Get last 5 sale invoices with customer details
        const recentSaleInvoices = await Invoice.find({
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
        const recentPurchaseInvoices = await Invoice.find({
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
    } catch (error) {
        console.error('Error in getDashboardStatsService:', error);
        throw error;
    }
};
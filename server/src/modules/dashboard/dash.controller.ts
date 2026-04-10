// controllers/dashboardController.ts
import { Request, Response } from 'express';
import { getDashboardStatsService } from './dash.service'
import { Category } from '../categories/categories.model';
import { Contacts } from '../contacts/contacts.models';
import Invoice from '../invoices/invoice.model';

export const getDashboardStatsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const stats = await getDashboardStatsService();

        res.status(200).json({
            success: true,
            message: 'Dashboard statistics fetched successfully',
            data: stats
        });
    } catch (error: any) {
        console.error('Error in getDashboardStatsController:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};

// Alternative: Direct implementation without service layer
export const getDashboardStatsDirectController = async (req: Request, res: Response): Promise<void> => {
    try {
        // Execute all queries in parallel for better performance
        const [
            categoriesWithProducts,
            totalCustomers,
            totalSuppliers,
            totalSaleInvoices,
            totalPurchaseInvoices,
            recentSaleInvoices,
            recentPurchaseInvoices
        ] = await Promise.all([
            // Total products from categories
            Category.aggregate([
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
            Contacts.countDocuments({ isReceivable: true }),
            
            // Total suppliers (isPayable = true)
            Contacts.countDocuments({ isPayable: true }),
            
            // Total sale invoices
            Invoice.countDocuments({
                $or: [
                    { invoiceType: 'Sale invoice' },
                    { type: 'sale' }
                ]
            }),
            
            // Total purchase invoices
            Invoice.countDocuments({
                $or: [
                    { invoiceType: 'Buy invoice' },
                    { type: 'buy' }
                ]
            }),
            
            // Last 5 sale invoices
            Invoice.find({
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
            Invoice.find({
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
    } catch (error: any) {
        console.error('Error in getDashboardStatsController:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch dashboard statistics',
            error: error.message
        });
    }
};
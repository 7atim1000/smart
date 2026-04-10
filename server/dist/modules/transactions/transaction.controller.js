"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionStatsController = exports.deleteTransactionController = exports.getTransactionByIdController = exports.getTransactionsController = exports.addTransactionController = void 0;
const transaction_service_1 = require("./transaction.service");
// Add Transaction Controller
const addTransactionController = async (req, res) => {
    try {
        // 1. Basic validation
        const { amount, type, account, paymentMethod, currency } = req.body;
        if (!amount || !type || !account || !paymentMethod || !currency) {
            res.status(400).json({
                success: false,
                message: 'Missing required fields: amount, type, account, paymentMethod'
            });
            return;
        }
        if (amount <= 0) {
            res.status(400).json({
                success: false,
                message: 'Amount must be greater than 0'
            });
            return;
        }
        // 2. Get user ID (from auth middleware)
        const userId = req.user?._id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized'
            });
            return;
        }
        // 3. Prepare transaction data
        const transactionData = {
            amount: Number(amount),
            type,
            account,
            currency,
            refrence: req.body.refrence,
            description: req.body.description,
            status: req.body.status || 'Pending',
            paymentMethod,
            date: req.body.date ? new Date(req.body.date) : new Date(),
            user: userId
        };
        // 4. Call service
        const result = await (0, transaction_service_1.AddTransactionService)(transactionData);
        // 5. Send success response
        res.status(201).json({
            success: true,
            message: 'Transaction added successfully',
            data: result
        });
    }
    catch (error) {
        console.error('Error in addTransactionController:', error);
        // Simplified error handling
        const statusCode = error.message.includes('already exists') ? 409 :
            error.message.includes('Invalid') || error.message.includes('Missing') ? 400 :
                error.message.includes('Unauthorized') ? 401 : 500;
        const message = error.message.includes('already exists') ? 'Transaction already exists' :
            error.message.includes('Invalid') || error.message.includes('Missing') ? error.message :
                error.message.includes('Unauthorized') ? 'Unauthorized access' :
                    'Failed to add transaction';
        res.status(statusCode).json({
            success: false,
            message
        });
    }
};
exports.addTransactionController = addTransactionController;
// Update Transaction Controller
// export const updateTransactionController = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const transactionId = req.params.id;
//         const userId = (req as any).user?._id; // Get user from auth middleware
//         // Validate transaction ID
//         if (!transactionId) {
//             res.status(400).json({ 
//                 success: false, 
//                 message: 'Transaction ID is required' 
//             });
//             return;
//         }
//         // Validate required fields
//         const requiredFields = ['transactionNumber', 'amount', 'type', 'account', 'paymentMethod'];
//         const missingFields = requiredFields.filter(field => !req.body[field]);
//         if (missingFields.length > 0) {
//             res.status(400).json({ 
//                 success: false, 
//                 message: `Missing required fields: ${missingFields.join(', ')}` 
//             });
//             return;
//         }
//         // Validate amount
//         if (req.body.amount <= 0) {
//             res.status(400).json({ 
//                 success: false, 
//                 message: 'Amount must be greater than 0' 
//             });
//             return;
//         }
//         // Validate transaction type
//         if (!['Credit', 'Debit'].includes(req.body.type)) {
//             res.status(400).json({ 
//                 success: false, 
//                 message: 'Transaction type must be either Credit or Debit' 
//             });
//             return;
//         }
//         // Validate status if provided
//         if (req.body.status && !['Completed', 'Pending', 'Failed'].includes(req.body.status)) {
//             res.status(400).json({ 
//                 success: false, 
//                 message: 'Status must be one of: Completed, Pending, Failed' 
//             });
//             return;
//         }
//         // Prepare update data
//         // Prepare update data with default date
//         const updateData = {
//             transactionNumber: req.body.transactionNumber,
//             shift: req.body.shift,
//             amount: Number(req.body.amount),
//             currency: req.body.currency,
//             type: req.body.type,
//             account: req.body.account,
//             refrence: req.body.refrence,
//             description: req.body.description,
//             status: req.body.status,
//             paymentMethod: req.body.paymentMethod,
//             date: req.body.date ? new Date(req.body.date) : new Date(), // Default to now
//             user: userId || req.body.user
//         };
//         // Call service to update transaction
//         const result = await updateTransactionService(transactionId, updateData);
//         res.status(200).json({
//             success: true,
//             message: 'Transaction updated successfully',
//             data: result
//         });
//     } catch (error: any) {
//         console.error('Update Transaction Controller Error:', error);
//         // Handle specific errors with appropriate status codes
//         let statusCode = 500;
//         let message = 'Failed to update transaction';
//         if (error.message.includes('not found')) {
//             statusCode = 404;
//             message = error.message;
//         } else if (error.message.includes('already exists') || 
//                    error.message.includes('Invalid') || 
//                    error.message.includes('required')) {
//             statusCode = 400;
//             message = error.message;
//         } else if (error.message.includes('CastError') || 
//                    error.message.includes('Invalid transaction ID')) {
//             statusCode = 400;
//             message = 'Invalid transaction ID format';
//         }
//         res.status(statusCode).json({
//             success: false,
//             message,
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };
// Get Transactions Implementation (with pagination and search)
const getTransactionsController = async (req, res) => {
    try {
        // Extract query parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        // Extract filter parameters
        const status = req.query.status;
        const type = req.query.type;
        const account = req.query.account;
        const currency = req.query.currency;
        const shift = req.query.shift;
        const paymentMethod = req.query.paymentMethod;
        const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
        // Validate pagination parameters
        if (page < 1) {
            res.status(400).json({
                success: false,
                message: 'Page number must be greater than 0'
            });
            return;
        }
        if (limit < 1 || limit > 100) {
            res.status(400).json({
                success: false,
                message: 'Limit must be between 1 and 100'
            });
            return;
        }
        // Validate dates
        if (startDate && isNaN(startDate.getTime())) {
            res.status(400).json({
                success: false,
                message: 'Invalid start date format'
            });
            return;
        }
        if (endDate && isNaN(endDate.getTime())) {
            res.status(400).json({
                success: false,
                message: 'Invalid end date format'
            });
            return;
        }
        // Prepare filters object
        const filters = {
            ...(status && { status }),
            ...(type && { type }),
            ...(account && { account }),
            ...(currency && { currency }),
            ...(shift && { shift }),
            ...(paymentMethod && { paymentMethod }),
            ...(startDate && { startDate }),
            ...(endDate && { endDate })
        };
        // Call service to get transactions with filters
        const result = await (0, transaction_service_1.getTransactionService)(page, limit, search, filters);
        res.status(200).json({
            success: true,
            message: 'Transactions fetched successfully',
            data: {
                transactions: result.transactions,
                pagination: {
                    totalTransactions: result.totalTransactions,
                    totalPages: result.totalPages,
                    currentPage: result.currentPage,
                    limit: limit,
                    hasNextPage: page < result.totalPages,
                    hasPrevPage: page > 1
                }
            }
        });
    }
    catch (error) {
        console.error('Get Transactions Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch transactions',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.getTransactionsController = getTransactionsController;
// Get Single Transaction by ID Controller
const getTransactionByIdController = async (req, res) => {
    try {
        const transactionId = req.params.id;
        if (!transactionId) {
            res.status(400).json({
                success: false,
                message: 'Transaction ID is required'
            });
            return;
        }
        // You'll need to implement this function in your service
        // For now, I'll create a simple version
        const transaction = await require('./transaction.model').default.findById(transactionId).lean();
        if (!transaction) {
            res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Transaction fetched successfully',
            data: {
                _id: transaction._id.toString(),
                transactionNumber: transaction.transactionNumber,
                shift: transaction.shift,
                amount: transaction.amount,
                type: transaction.type,
                category: transaction.category,
                refrence: transaction.refrence,
                description: transaction.description,
                status: transaction.status,
                paymentMethod: transaction.paymentMethod,
                date: transaction.date,
                user: transaction.user,
                createdAt: transaction.createdAt,
                updatedAt: transaction.updatedAt
            }
        });
    }
    catch (error) {
        console.error('Get Transaction by ID Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch transaction',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.getTransactionByIdController = getTransactionByIdController;
// Delete Transaction Controller
const deleteTransactionController = async (req, res) => {
    try {
        const transactionId = req.params.id;
        if (!transactionId) {
            res.status(400).json({
                success: false,
                message: 'Transaction ID is required'
            });
            return;
        }
        // Find and delete transaction
        const Transaction = require('./transaction.model').default;
        const deletedTransaction = await Transaction.findByIdAndDelete(transactionId);
        if (!deletedTransaction) {
            res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully',
            data: {
                _id: deletedTransaction._id.toString(),
                transactionNumber: deletedTransaction.transactionNumber
            }
        });
    }
    catch (error) {
        console.error('Delete Transaction Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete transaction',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.deleteTransactionController = deleteTransactionController;
// Get Transaction Statistics Controller (optional)
const getTransactionStatsController = async (req, res) => {
    try {
        const Transaction = require('./transaction.model').default;
        // Get total transactions count
        const totalTransactions = await Transaction.countDocuments();
        // Get total amount
        const totalAmountResult = await Transaction.aggregate([
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" }
                }
            }
        ]);
        // Get transactions by type
        const transactionsByType = await Transaction.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            },
            { $sort: { count: -1 } }
        ]);
        // Get recent transactions
        const recentTransactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('transactionNumber type amount date')
            .lean();
        res.status(200).json({
            success: true,
            message: 'Transaction statistics fetched successfully',
            data: {
                totalTransactions,
                totalAmount: totalAmountResult[0]?.totalAmount || 0,
                transactionsByType,
                recentTransactions
            }
        });
    }
    catch (error) {
        console.error('Get Transaction Stats Error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch transaction statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
exports.getTransactionStatsController = getTransactionStatsController;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionService = exports.updateTransactionService = exports.AddTransactionService = void 0;
const transaction_model_1 = __importDefault(require("./transaction.model"));
// Helper function to get current shift
const getCurrentShift = () => {
    const hour = new Date().getHours();
    return (hour >= 6 && hour < 18) ? 'Morning' : 'Evening';
};
// Helper function to generate transaction number
const generateTransactionNumber = async () => {
    // Get current date components for prefix
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2); // Last 2 digits of year
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Month with leading zero
    const day = now.getDate().toString().padStart(2, '0'); // Day with leading zero
    const prefix = `TRX-${year}${month}${day}-`;
    // Find the highest transaction number with today's prefix
    const todayTransactions = await transaction_model_1.default.find({
        transactionNumber: { $regex: `^${prefix}` }
    }).sort({ transactionNumber: -1 }).limit(1);
    let nextNumber = 1;
    if (todayTransactions.length > 0) {
        const lastTransactionNumber = todayTransactions[0].transactionNumber;
        const lastNumber = parseInt(lastTransactionNumber.split('-')[2] || '0');
        nextNumber = lastNumber + 1;
    }
    return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
};
const AddTransactionService = async (transactionData) => {
    try {
        // Generate shift and transaction number automatically
        const shift = getCurrentShift();
        const transactionNumber = await generateTransactionNumber();
        // Check for duplicate transaction number (just in case)
        const existingTransaction = await transaction_model_1.default.findOne({ transactionNumber });
        if (existingTransaction) {
            // This should rarely happen, but handle it
            throw new Error(`Transaction number ${transactionNumber} already exists. Please try again.`);
        }
        // Destructure transactionData (excluding shift and transactionNumber)
        const { amount, currency, type, account, refrence, description, status, paymentMethod, date, user } = transactionData;
        // Create new transaction with auto-generated values
        const newTransaction = await transaction_model_1.default.create({
            transactionNumber, // Auto-generated
            shift, // Auto-generated
            amount,
            currency,
            type,
            account,
            refrence,
            description,
            status,
            paymentMethod,
            date,
            user
        });
        // Convert to plain object
        const transactionObj = newTransaction.toObject();
        return {
            transaction: transactionObj
        };
    }
    catch (error) {
        // Log the error for debugging
        console.error('Error in AddTransactionService:', error);
        throw new Error(error.message || 'Failed to add transaction');
    }
};
exports.AddTransactionService = AddTransactionService;
const updateTransactionService = async (transactionId, updateTransaction) => {
    try {
        const { transactionNumber, shift, amount, currency, type, account, refrence, description, status, paymentMethod, date, user } = updateTransaction;
        // Validate input 
        if (!transactionNumber || transactionNumber.trim() === '') {
            throw new Error('Transaction number is required');
        }
        if (!amount || amount <= 0) {
            throw new Error('Valid amount is required');
        }
        if (!type || !['Credit', 'Debit'].includes(type)) {
            throw new Error('Valid transaction type is required (Credit/Debit)');
        }
        if (!account || account.trim() === '') {
            throw new Error('Account is required');
        }
        if (!paymentMethod || paymentMethod.trim() === '') {
            throw new Error('Payment method is required');
        }
        // Find the Transaction by ID 
        const transaction = await transaction_model_1.default.findById(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        // Check for duplicate transactionNumber (if transactionNumber should be unique)
        const existingTransaction = await transaction_model_1.default.findOne({
            transactionNumber: transactionNumber.trim(),
            _id: { $ne: transactionId }
        });
        if (existingTransaction) {
            throw new Error(`Transaction number '${transactionNumber}' already exists`);
        }
        // In the update logic, handle optional date:
        if (updateTransaction.date) {
            transaction.date = updateTransaction.date;
        }
        // Update the transaction fields
        transaction.transactionNumber = transactionNumber.trim();
        transaction.shift = shift?.trim() || transaction.shift; // Optional field
        transaction.amount = amount;
        transaction.currency = currency;
        transaction.type = type.trim();
        transaction.account = account.trim();
        transaction.refrence = refrence?.trim() || ''; // Handle optional field
        transaction.description = description?.trim() || ''; // Handle optional field
        transaction.status = status?.trim() || transaction.status;
        transaction.paymentMethod = paymentMethod.trim();
        transaction.date = date || transaction.date;
        transaction.user = user || transaction.user; // Keep existing user if not provided
        await transaction.save();
        // Convert to plain object and cast to ITransaction
        const transactionObj = transaction.toObject();
        return {
            transaction: {
                _id: transactionObj._id.toString(),
                transactionNumber: transactionObj.transactionNumber,
                shift: transactionObj.shift,
                amount: transactionObj.amount,
                currency: transactionObj.currency,
                type: transactionObj.type,
                account: transactionObj.account,
                refrence: transactionObj.refrence,
                description: transactionObj.description,
                status: transactionObj.status,
                paymentMethod: transactionObj.paymentMethod,
                date: transactionObj.date,
                user: transactionObj.user,
                createdAt: transactionObj.createdAt,
                updatedAt: transactionObj.updatedAt
            }
        };
    }
    catch (error) {
        console.error('Update Transaction Service Error:', error);
        // Handle specific MongoDB errors
        if (error.name === 'CastError') {
            throw new Error('Invalid transaction ID format');
        }
        if (error.code === 11000) { // Duplicate key error
            throw new Error('Transaction number already exists');
        }
        throw new Error(error.message || 'Failed to update transaction');
    }
};
exports.updateTransactionService = updateTransactionService;
const getTransactionService = async (page = 1, limit = 10, search = '', filters = {}) => {
    try {
        const skip = (page - 1) * limit;
        // Build query with filters
        let query = {};
        // Search by multiple fields
        if (search.trim()) {
            query.$or = [
                { transactionNumber: { $regex: search, $options: 'i' } },
                { type: { $regex: search, $options: 'i' } },
                { account: { $regex: search, $options: 'i' } },
                { currency: { $regex: search, $options: 'i' } },
                { refrence: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { paymentMethod: { $regex: search, $options: 'i' } }
            ];
        }
        // Apply filters
        if (filters.status) {
            query.status = filters.status;
        }
        if (filters.type) {
            query.type = filters.type;
        }
        if (filters.account) {
            query.account = filters.account;
        }
        if (filters.shift) {
            query.shift = filters.shift;
        }
        if (filters.paymentMethod) {
            query.paymentMethod = filters.paymentMethod;
        }
        if (filters.currency) {
            query.currency = filters.currency;
        }
        // Date range filter
        if (filters.startDate || filters.endDate) {
            query.date = {};
            if (filters.startDate) {
                query.date.$gte = new Date(filters.startDate);
            }
            if (filters.endDate) {
                query.date.$lte = new Date(filters.endDate);
            }
        }
        console.log('Query:', JSON.stringify(query, null, 2)); // Debug log
        // Get transactions with pagination 
        const transactions = await transaction_model_1.default.find(query)
            .sort({ date: -1, createdAt: -1 }) // Sort by date then creation time
            .skip(skip)
            .limit(limit)
            .select('-__v')
            .lean();
        // Get total count for pagination
        const totalTransactions = await transaction_model_1.default.countDocuments(query);
        const totalPages = Math.ceil(totalTransactions / limit);
        // Transform transactions
        const transformedTransactions = transactions.map(transaction => ({
            _id: transaction._id.toString(),
            transactionNumber: transaction.transactionNumber,
            shift: transaction.shift,
            amount: transaction.amount,
            currency: transaction.currency,
            type: transaction.type,
            account: transaction.account,
            refrence: transaction.refrence,
            description: transaction.description,
            status: transaction.status,
            paymentMethod: transaction.paymentMethod,
            date: transaction.date,
            user: transaction.user,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt
        }));
        return {
            transactions: transformedTransactions,
            totalTransactions,
            totalPages,
            currentPage: page
        };
    }
    catch (error) {
        console.error('Service Error:', error);
        throw new Error(error.message || 'Failed to fetch transactions');
    }
};
exports.getTransactionService = getTransactionService;

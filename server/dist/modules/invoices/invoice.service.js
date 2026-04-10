"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoicesService = exports.addInvoiceService = void 0;
const invoice_model_1 = __importDefault(require("./invoice.model"));
const moment_1 = __importDefault(require("moment"));
//simpler version that's closer to your original JavaScript function
const addInvoiceService = async (invoiceData) => {
    try {
        const getCurrentShift = () => {
            const hour = new Date().getHours();
            return (hour >= 6 && hour < 18) ? 'Morning' : 'Evening';
        };
        const invoice = new invoice_model_1.default({
            ...invoiceData,
            shift: getCurrentShift(),
        });
        const savedInvoice = await invoice.save();
        return savedInvoice;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.addInvoiceService = addInvoiceService;
const getInvoicesService = async (params) => {
    try {
        const { frequency, type, invoiceType, invoiceStatus, status, shift, customer, supplier, sort = '-createdAt', search, page = 1, limit = 10 } = params;
        // Build query
        const query = {};
        // Date filter based on frequency
        if (frequency) {
            query.invoiceDate = {
                $gt: (0, moment_1.default)().subtract(Number(frequency), "d").toDate(),
            };
        }
        // Add filters if not 'all'
        if (type && type !== 'all')
            query.type = type;
        if (invoiceType && invoiceType !== 'all')
            query.invoiceType = invoiceType;
        if (invoiceStatus && invoiceStatus !== 'all')
            query.invoiceStatus = invoiceStatus;
        if (status && status !== 'all')
            query.status = status;
        if (shift && shift !== 'all')
            query.shift = shift;
        if (customer && customer !== 'all')
            query.customer = customer;
        if (supplier && supplier !== 'all')
            query.supplier = supplier;
        // Search across multiple fields
        if (search) {
            query.$or = [
                { shift: { $regex: search, $options: 'i' } },
                { invoiceNumber: { $regex: search, $options: 'i' } },
                { customerName: { $regex: search, $options: 'i' } },
                { supplierName: { $regex: search, $options: 'i' } },
                { invoiceStatus: { $regex: search, $options: 'i' } },
                { status: { $regex: search, $options: 'i' } },
                { invoiceType: { $regex: search, $options: 'i' } },
            ];
        }
        // Sort options
        let sortOption = {};
        if (sort === '-createdAt') {
            sortOption = { createdAt: -1 }; // Newest first
        }
        else if (sort === 'createdAt') {
            sortOption = { createdAt: 1 }; // Oldest first
        }
        // Pagination
        const startIndex = (page - 1) * limit;
        // Get total count
        const total = await invoice_model_1.default.countDocuments(query);
        // Get invoices with pagination and population
        const invoices = await invoice_model_1.default.find(query)
            .populate([
            { path: "customer", select: ["email", "name", "phone", "accReceivableName", "accReceivableNameArb", "accReceivableGroup",
                    "accReceivableGroupArb", "accReceivableClass", "accReceivableClassArb", "accReceivableLevel", "accReceivableLevelArb",
                    "accReceivableChart", "accReceivableChartArb", "accReceivableType", "balance"] },
            { path: "supplier", select: ["email", "name", "phone", "accPayableName", "accPayableNameArb", "accPayableGroup",
                    "accPayableGroupArb", "accPayableClass", "accPayableClassArb", "accPayableLevel", "accPayableLevelArb",
                    "accPayableChart", "accPayableChartArb", "accPayableType", "balance"] },
            { path: "user", select: "name" },
        ])
            .sort(sortOption)
            .skip(startIndex)
            .limit(limit);
        return {
            invoices,
            pagination: {
                currentPage: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    catch (error) {
        console.error('Error in getInvoicesService:', error.message);
        throw new Error(error.message);
    }
};
exports.getInvoicesService = getInvoicesService;

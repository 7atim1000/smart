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
exports.updateInvoiceStatusController = exports.getInvoiceByIdController = exports.getStatementSupplier = exports.getStatementCustomer = exports.getInvoicesController = exports.addInvoiceController = void 0;
const InvoiceService = __importStar(require("./invoice.service"));
const invoice_model_1 = __importDefault(require("./invoice.model"));
const addInvoiceController = async (req, res) => {
    try {
        const invoice = await InvoiceService.addInvoiceService(req.body);
        res.status(201).json({
            success: true,
            message: 'Invoice created successfully!',
            data: invoice
        });
    }
    catch (error) {
        console.error('Error adding invoice:', error.message);
        // Pass error to Express error handler
        res.status(500).json({
            success: false,
            message: 'Failed to create invoice',
            error: error.message
        });
    }
};
exports.addInvoiceController = addInvoiceController;
const getInvoicesController = async (req, res) => {
    try {
        const { frequency, type, invoiceType, invoiceStatus, status, shift, customer, supplier, sort = '-createdAt', search, page = 1, limit = 10 } = req.query; // Change from req.body to req.query
        // Call service to get invoices
        const result = await InvoiceService.getInvoicesService({
            frequency: frequency,
            type: type,
            invoiceType: invoiceType,
            invoiceStatus: invoiceStatus,
            status: status,
            shift: shift,
            customer: customer,
            supplier: supplier,
            sort: sort,
            search: search,
            page: Number(page),
            limit: Number(limit)
        });
        // Return success response
        res.status(200).json({
            message: 'All invoices fetched successfully',
            success: true,
            data: result.invoices,
            invoices: result.invoices,
            pagination: result.pagination
        });
    }
    catch (error) {
        console.error('Error in getInvoicesController:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoices',
            error: error.message
        });
    }
};
exports.getInvoicesController = getInvoicesController;
// Contact-Customer > statement
const getStatementCustomer = async (req, res) => {
    try {
        const { customer } = req.body;
        // Validate customer ID
        if (!customer) {
            res.status(400).json({
                success: false,
                message: "Customer ID is required"
            });
            return;
        }
        // Find orders for this specific customer
        const orders = await invoice_model_1.default.find({
            customer: customer
        }).sort({ createdAt: -1 }); // Optional: sort by newest first
        // Return success response
        res.status(200).json({
            success: true,
            message: "Customer statement fetched successfully",
            data: orders,
            count: orders.length
        });
    }
    catch (error) {
        console.log("Error fetching customer orders:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.getStatementCustomer = getStatementCustomer;
// In your backend controller
const getStatementSupplier = async (req, res) => {
    try {
        const { supplier } = req.body;
        // Validate supplier ID
        if (!supplier) {
            res.status(400).json({
                success: false,
                message: "Supplier ID is required"
            });
            return;
        }
        // Find orders for this specific supplier
        const orders = await invoice_model_1.default.find({
            supplier: supplier
        }).sort({ createdAt: -1 });
        // Return success response
        res.status(200).json({
            success: true,
            message: "Supplier statement fetched successfully",
            data: orders,
            count: orders.length
        });
    }
    catch (error) {
        console.log("Error fetching supplier orders:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};
exports.getStatementSupplier = getStatementSupplier;
// Get Invoice BY ID : 
// controllers/invoice.controller.ts
const getInvoiceByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate ID
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Invoice ID is required'
            });
            return;
        }
        // Find invoice by ID with populated fields
        const invoice = await invoice_model_1.default.findById(id)
            .populate([
            {
                path: "customer",
                select: ["email", "name", "phone", "accReceivableName", "accReceivableNameArb", "accReceivableGroup",
                    "accReceivableGroupArb", "accReceivableClass", "accReceivableClassArb", "accReceivableLevel", "accReceivableLevelArb",
                    "accReceivableChart", "accReceivableChartArb", "accReceivableType", "balance"]
            },
            {
                path: "supplier",
                select: ["email", "name", "phone", "accPayableName", "accPayableNameArb", "accPayableGroup",
                    "accPayableGroupArb", "accPayableClass", "accPayableClassArb", "accPayableLevel", "accPayableLevelArb",
                    "accPayableChart", "accPayableChartArb", "accPayableType", "balance"]
            },
            {
                path: "user",
                select: "name"
            },
            {
                path: "items.product",
                select: "name barcode salePrice costPrice"
            }
        ]);
        // Check if invoice exists
        if (!invoice) {
            res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
            return;
        }
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Invoice fetched successfully',
            data: invoice
        });
    }
    catch (error) {
        console.error('Error in getInvoiceByIdController:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch invoice',
            error: error.message
        });
    }
};
exports.getInvoiceByIdController = getInvoiceByIdController;
// controllers/invoice.controller.ts
const updateInvoiceStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Validate ID
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Invoice ID is required'
            });
            return;
        }
        // Validate status
        if (!status) {
            res.status(400).json({
                success: false,
                message: 'Status field is required'
            });
            return;
        }
        // Optional: Validate if status is one of allowed values
        const allowedStatuses = ['Quotation', 'Order', 'Bill', 'Completed', 'Pending', 'Cancelled', 'Refunded'];
        if (!allowedStatuses.includes(status)) {
            res.status(400).json({
                success: false,
                message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
            });
            return;
        }
        // Find and update the invoice status
        const updatedInvoice = await invoice_model_1.default.findByIdAndUpdate(id, {
            status: status,
            // Also update invoiceStatus if you want to keep them in sync
            invoiceStatus: status
        }, {
            new: true, // Return the updated document
            runValidators: true // Run schema validators
        }).populate([
            { path: "customer", select: "name email phone balance" },
            { path: "supplier", select: "name email phone balance" },
            { path: "user", select: "name" }
        ]);
        // Check if invoice exists
        if (!updatedInvoice) {
            res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
            return;
        }
        // Return success response
        res.status(200).json({
            success: true,
            message: 'Invoice status updated successfully',
            data: updatedInvoice
        });
    }
    catch (error) {
        console.error('Error in updateInvoiceStatusController:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to update invoice status',
            error: error.message
        });
    }
};
exports.updateInvoiceStatusController = updateInvoiceStatusController;

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
exports.deleteContactController = exports.updateContactController = exports.getContactByIdController = exports.getContactsController = exports.addContactController = exports.updateCustomerBalance = void 0;
const ContactsService = __importStar(require("./contacts.service"));
const mongoose_1 = __importDefault(require("mongoose"));
const contacts_models_1 = __importDefault(require("./contacts.models"));
// Helper function to get string param
const getStringParam = (param) => {
    return param ? String(param) : undefined;
};
// Helper function to parse boolean from query string
const parseBoolean = (value) => {
    if (value === 'true' || value === '1')
        return true;
    if (value === 'false' || value === '0')
        return false;
    return undefined;
};
// ============================================
// Update Balance
// ============================================
const updateCustomerBalance = async (req, res, next) => {
    try {
        const { balance, balanceCurrency } = req.body;
        const { id } = req.params;
        // Validate that at least one field is provided
        if (balance === undefined && balanceCurrency === undefined) {
            res.status(400).json({
                success: false,
                message: "At least one field (balance or balanceCurrency) is required"
            });
            return;
        }
        // Validate balance if provided
        if (balance !== undefined) {
            if (typeof balance !== 'number') {
                res.status(400).json({
                    success: false,
                    message: "Balance must be a number"
                });
                return;
            }
        }
        // Validate balanceCurrency if provided
        if (balanceCurrency !== undefined) {
            if (typeof balanceCurrency !== 'string') {
                res.status(400).json({
                    success: false,
                    message: "Balance currency must be a string"
                });
                return;
            }
            // Optional: Validate currency code format (e.g., AED, USD, etc.)
            const validCurrencyRegex = /^[A-Z]{3}$/;
            if (!validCurrencyRegex.test(balanceCurrency)) {
                res.status(400).json({
                    success: false,
                    message: "Balance currency must be a valid 3-letter currency code (e.g., AED, USD)"
                });
                return;
            }
        }
        // Convert id to string if it's an array and validate
        const contactId = Array.isArray(id) ? id[0] : id;
        if (!contactId) {
            res.status(400).json({
                success: false,
                message: "Contact ID is required"
            });
            return;
        }
        // Validate MongoDB ID
        if (!mongoose_1.default.Types.ObjectId.isValid(contactId)) {
            res.status(400).json({
                success: false,
                message: "Invalid contact ID format"
            });
            return;
        }
        // Prepare update object with only provided fields
        const updateData = {};
        if (balance !== undefined)
            updateData.balance = balance;
        if (balanceCurrency !== undefined)
            updateData.balanceCurrency = balanceCurrency;
        // Update contact balance and/or currency
        const contact = await contacts_models_1.default.findByIdAndUpdate(contactId, // Use contactId instead of id
        updateData, { new: true, runValidators: true });
        if (!contact) {
            res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            message: 'Contact balance updated successfully',
            data: contact
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomerBalance = updateCustomerBalance;
// ============================================
// ADD CONTACT CONTROLLER
// ============================================
const addContactController = async (req, res) => {
    try {
        const contactData = req.body;
        // Validate required fields
        const requiredFields = [
            'email', 'name', 'phone', 'address',
            'isReceivable', 'isPayable',
            // 'accReceivableName', 'accReceivableNameArb', 'accReceivableGroup', 'accReceivableGroupArb',
            // 'accReceivableClass', 'accReceivableClassArb', 'accReceivableLevel', 'accReceivableLevelArb',
            // 'accReceivableChart', 'accReceivableChartArb', 'accReceivableType',
            // 'accPayableName', 'accPayableNameArb', 'accPayableGroup', 'accPayableGroupArb',
            // 'accPayableClass', 'accPayableClassArb', 'accPayableLevel', 'accPayableLevelArb',
            // 'accPayableChart', 'accPayableChartArb', 'accPayableType'
        ];
        const missingFields = requiredFields.filter(field => {
            const value = contactData[field];
            return value === undefined || value === null || value === '';
        });
        if (missingFields.length > 0) {
            res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
            return;
        }
        // Validate boolean fields
        if (typeof contactData.isReceivable !== 'boolean') {
            res.status(400).json({
                success: false,
                message: 'isReceivable must be a boolean'
            });
            return;
        }
        if (typeof contactData.isPayable !== 'boolean') {
            res.status(400).json({
                success: false,
                message: 'isPayable must be a boolean'
            });
            return;
        }
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactData.email)) {
            res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
            return;
        }
        const contact = await ContactsService.addContactService(contactData);
        res.status(201).json({
            success: true,
            contact,
            message: 'Contact created successfully'
        });
    }
    catch (error) {
        console.error('Error adding contact:', error);
        if (error.message.includes('already exists')) {
            res.status(409).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create contact'
        });
    }
};
exports.addContactController = addContactController;
// ============================================
// GET ALL CONTACTS CONTROLLER
// ============================================
const getContactsController = async (req, res) => {
    try {
        const { search, isReceivable, isPayable, page, limit, sort } = req.query;
        const filter = {
            ...(search && { search: search }),
            ...(isReceivable !== undefined && { isReceivable: parseBoolean(isReceivable) }),
            ...(isPayable !== undefined && { isPayable: parseBoolean(isPayable) }),
            ...(page && { page: Number(page) }),
            ...(limit && { limit: Number(limit) }),
            ...(sort && { sort: sort })
        };
        const result = await ContactsService.getContactsService(filter);
        res.status(200).json({
            success: true,
            contacts: result.contacts,
            pagination: {
                total: result.total,
                page: page ? Number(page) : 1,
                limit: limit ? Number(limit) : 10,
                totalPages: Math.ceil(result.total / (limit ? Number(limit) : 10))
            },
            message: 'Contacts fetched successfully'
        });
    }
    catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch contacts'
        });
    }
};
exports.getContactsController = getContactsController;
// ============================================
// GET CONTACT BY ID CONTROLLER
// ============================================
const getContactByIdController = async (req, res) => {
    try {
        const id = getStringParam(req.params.id);
        if (!id) {
            res.status(400).json({ success: false, message: 'Contact ID is required' });
            return;
        }
        const contact = await ContactsService.getContactByIdService(id);
        if (!contact) {
            res.status(404).json({ success: false, message: 'Contact not found' });
            return;
        }
        res.status(200).json({
            success: true,
            contact,
            message: 'Contact fetched successfully'
        });
    }
    catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch contact'
        });
    }
};
exports.getContactByIdController = getContactByIdController;
// ============================================
// UPDATE CONTACT CONTROLLER
// ============================================
const updateContactController = async (req, res) => {
    try {
        const id = getStringParam(req.params.id);
        const updateData = req.body;
        if (!id) {
            res.status(400).json({ success: false, message: 'Contact ID is required' });
            return;
        }
        // Validate that at least one field is being updated
        if (Object.keys(updateData).length === 0) {
            res.status(400).json({
                success: false,
                message: 'At least one field must be provided for update'
            });
            return;
        }
        // Validate boolean fields if provided
        if (updateData.isReceivable !== undefined && typeof updateData.isReceivable !== 'boolean') {
            res.status(400).json({
                success: false,
                message: 'isReceivable must be a boolean'
            });
            return;
        }
        if (updateData.isPayable !== undefined && typeof updateData.isPayable !== 'boolean') {
            res.status(400).json({
                success: false,
                message: 'isPayable must be a boolean'
            });
            return;
        }
        // Validate email format if provided
        if (updateData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(updateData.email)) {
                res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
                return;
            }
        }
        const contact = await ContactsService.updateContactService(id, updateData);
        res.status(200).json({
            success: true,
            contact,
            message: 'Contact updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating contact:', error);
        if (error.message === 'Contact not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        if (error.message.includes('already exists')) {
            res.status(409).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update contact'
        });
    }
};
exports.updateContactController = updateContactController;
// ============================================
// DELETE CONTACT CONTROLLER
// ============================================
const deleteContactController = async (req, res) => {
    try {
        const id = getStringParam(req.params.id);
        if (!id) {
            res.status(400).json({ success: false, message: 'Contact ID is required' });
            return;
        }
        const result = await ContactsService.deleteContactService(id);
        res.status(200).json({
            success: true,
            message: result.message
        });
    }
    catch (error) {
        console.error('Error deleting contact:', error);
        if (error.message === 'Contact not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        if (error.message.includes('non-zero balance')) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete contact'
        });
    }
};
exports.deleteContactController = deleteContactController;

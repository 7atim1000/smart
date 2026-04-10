import { Request, Response, NextFunction } from 'express';
import * as ContactsService from './contacts.service';
import { AddContactRequest, UpdateContactRequest, ContactFilterRequest } from './contacts.interface';

import mongoose from 'mongoose';
import Contacts from './contacts.models';

// Helper function to get string param
const getStringParam = (param: any): string | undefined => {
    return param ? String(param) : undefined;
};

// Helper function to parse boolean from query string
const parseBoolean = (value: any): boolean | undefined => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return undefined;
};



// ============================================
// Update Balance
// ============================================

export const updateCustomerBalance = async (
    req: Request, 
    res: Response, 
    next: NextFunction
): Promise<void> => {
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
        if (!mongoose.Types.ObjectId.isValid(contactId)) {
            res.status(400).json({ 
                success: false, 
                message: "Invalid contact ID format" 
            });
            return;
        }

        // Prepare update object with only provided fields
        const updateData: any = {};
        if (balance !== undefined) updateData.balance = balance;
        if (balanceCurrency !== undefined) updateData.balanceCurrency = balanceCurrency;

        // Update contact balance and/or currency
        const contact = await Contacts.findByIdAndUpdate(
            contactId, // Use contactId instead of id
            updateData,
            { new: true, runValidators: true }
        );

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
        
    } catch (error) {
        next(error);
    }
};


// ============================================
// ADD CONTACT CONTROLLER
// ============================================
export const addContactController = async (req: Request, res: Response): Promise<void> => {
    try {
        const contactData: AddContactRequest = req.body;

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
            const value = contactData[field as keyof AddContactRequest];
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
    } catch (error: any) {
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

// ============================================
// GET ALL CONTACTS CONTROLLER
// ============================================
export const getContactsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search, isReceivable, isPayable, page, limit, sort } = req.query;

        const filter: ContactFilterRequest = {
            ...(search && { search: search as string }),
            ...(isReceivable !== undefined && { isReceivable: parseBoolean(isReceivable) }),
            ...(isPayable !== undefined && { isPayable: parseBoolean(isPayable) }),
            ...(page && { page: Number(page) }),
            ...(limit && { limit: Number(limit) }),
            ...(sort && { sort: sort as string })
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
    } catch (error: any) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch contacts' 
        });
    }
};

// ============================================
// GET CONTACT BY ID CONTROLLER
// ============================================
export const getContactByIdController = async (req: Request, res: Response): Promise<void> => {
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
    } catch (error: any) {
        console.error('Error fetching contact:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch contact' 
        });
    }
};

// ============================================
// UPDATE CONTACT CONTROLLER
// ============================================
export const updateContactController = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = getStringParam(req.params.id);
        const updateData: UpdateContactRequest = req.body;

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
    } catch (error: any) {
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

// ============================================
// DELETE CONTACT CONTROLLER
// ============================================
export const deleteContactController = async (req: Request, res: Response): Promise<void> => {
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
    } catch (error: any) {
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


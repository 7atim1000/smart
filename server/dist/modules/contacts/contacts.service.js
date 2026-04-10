"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateContactBalanceService = exports.deleteContactService = exports.updateContactService = exports.getContactByIdService = exports.getContactsService = exports.addContactService = void 0;
const contacts_models_1 = require("./contacts.models");
// ============================================
// ADD CONTACT SERVICE
// ============================================
const addContactService = async (contactData) => {
    try {
        // Check if contact with same email already exists
        const existingContact = await contacts_models_1.Contacts.findOne({ email: contactData.email });
        if (existingContact) {
            throw new Error('Contact with this email already exists');
        }
        const contact = new contacts_models_1.Contacts(contactData);
        await contact.save();
        return contact;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to create contact');
    }
};
exports.addContactService = addContactService;
// ============================================
// GET ALL CONTACTS SERVICE
// ============================================
const getContactsService = async (filter) => {
    try {
        const { search, isReceivable, isPayable, page = 1, limit = 10, sort = '-createdAt' } = filter || {};
        // Build query
        const query = {};
        // Search by name, email, or phone
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }
        // Filter by receivable/payable status (boolean)
        if (isReceivable !== undefined)
            query.isReceivable = isReceivable;
        if (isPayable !== undefined)
            query.isPayable = isPayable;
        // Calculate pagination
        const skip = (page - 1) * limit;
        // Execute query
        const contacts = await contacts_models_1.Contacts.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);
        // Get total count
        const total = await contacts_models_1.Contacts.countDocuments(query);
        return { contacts, total };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch contacts');
    }
};
exports.getContactsService = getContactsService;
// ============================================
// GET CONTACT BY ID SERVICE
// ============================================
const getContactByIdService = async (id) => {
    try {
        const contact = await contacts_models_1.Contacts.findById(id);
        return contact;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch contact');
    }
};
exports.getContactByIdService = getContactByIdService;
// ============================================
// UPDATE CONTACT SERVICE
// ============================================
const updateContactService = async (id, updateData) => {
    try {
        const contact = await contacts_models_1.Contacts.findById(id);
        if (!contact) {
            throw new Error('Contact not found');
        }
        // If email is being updated, check for duplicates
        if (updateData.email && updateData.email !== contact.email) {
            const existingContact = await contacts_models_1.Contacts.findOne({
                email: updateData.email,
                _id: { $ne: id }
            });
            if (existingContact) {
                throw new Error('Contact with this email already exists');
            }
        }
        const updatedContact = await contacts_models_1.Contacts.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
        return updatedContact;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to update contact');
    }
};
exports.updateContactService = updateContactService;
// ============================================
// DELETE CONTACT SERVICE
// ============================================
const deleteContactService = async (id) => {
    try {
        const contact = await contacts_models_1.Contacts.findById(id);
        if (!contact) {
            throw new Error('Contact not found');
        }
        // Check if contact has balance before deleting
        if (contact.balance && contact.balance !== 0) {
            throw new Error('Cannot delete contact with non-zero balance');
        }
        await contacts_models_1.Contacts.findByIdAndDelete(id);
        return {
            success: true,
            message: 'Contact deleted successfully'
        };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to delete contact');
    }
};
exports.deleteContactService = deleteContactService;
// ============================================
// UPDATE CONTACT BALANCE SERVICE
// ============================================
const updateContactBalanceService = async (id, amount, type) => {
    try {
        const contact = await contacts_models_1.Contacts.findById(id);
        if (!contact) {
            throw new Error('Contact not found');
        }
        // Update balance based on transaction type
        if (type === 'receivable') {
            contact.balance = (contact.balance || 0) + amount;
        }
        else {
            contact.balance = (contact.balance || 0) - amount;
        }
        await contact.save();
        return contact;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to update contact balance');
    }
};
exports.updateContactBalanceService = updateContactBalanceService;
/*
// ============================================
// BULK UPDATE CONTACTS SERVICE
// ============================================
export const bulkUpdateContactsService = async (
    ids: string[],
    updateData: Partial<UpdateContactRequest>
): Promise<{ updatedCount: number; failedIds: string[] }> => {
    try {
        const result = await Contacts.updateMany(
            { _id: { $in: ids } },
            { $set: updateData }
        );

        return {
            updatedCount: result.modifiedCount,
            failedIds: result.modifiedCount < ids.length ? ids : []
        };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to bulk update contacts');
    }
};
*/ 

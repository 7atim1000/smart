import { Contacts } from './contacts.models';
import { IContacts, AddContactRequest, UpdateContactRequest, ContactFilterRequest } from './contacts.interface';

// ============================================
// ADD CONTACT SERVICE
// ============================================
export const addContactService = async (contactData: AddContactRequest): Promise<IContacts> => {
    try {
        // Check if contact with same email already exists
        const existingContact = await Contacts.findOne({ email: contactData.email });
        if (existingContact) {
            throw new Error('Contact with this email already exists');
        }

        const contact = new Contacts(contactData);
        await contact.save();
        return contact;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to create contact');
    }
};

// ============================================
// GET ALL CONTACTS SERVICE
// ============================================
export const getContactsService = async (filter?: ContactFilterRequest): Promise<{ contacts: IContacts[]; total: number }> => {
    try {
        const { search, isReceivable, isPayable, page = 1, limit = 10, sort = '-createdAt' } = filter || {};

        // Build query
        const query: any = {};

        // Search by name, email, or phone
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by receivable/payable status (boolean)
        if (isReceivable !== undefined) query.isReceivable = isReceivable;
        if (isPayable !== undefined) query.isPayable = isPayable;

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query
        const contacts = await Contacts.find(query)
            .sort(sort)
            .skip(skip)
            .limit(limit);

        // Get total count
        const total = await Contacts.countDocuments(query);

        return { contacts, total };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch contacts');
    }
};


// ============================================
// GET CONTACT BY ID SERVICE
// ============================================
export const getContactByIdService = async (id: string): Promise<IContacts | null> => {
    try {
        const contact = await Contacts.findById(id);
        return contact;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch contact');
    }
};

// ============================================
// UPDATE CONTACT SERVICE
// ============================================
export const updateContactService = async (id: string, updateData: UpdateContactRequest): Promise<IContacts | null> => {
    try {
        const contact = await Contacts.findById(id);
        
        if (!contact) {
            throw new Error('Contact not found');
        }

        // If email is being updated, check for duplicates
        if (updateData.email && updateData.email !== contact.email) {
            const existingContact = await Contacts.findOne({ 
                email: updateData.email,
                _id: { $ne: id }
            });
            
            if (existingContact) {
                throw new Error('Contact with this email already exists');
            }
        }

        const updatedContact = await Contacts.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return updatedContact;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update contact');
    }
};

// ============================================
// DELETE CONTACT SERVICE
// ============================================
export const deleteContactService = async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
        const contact = await Contacts.findById(id);
        
        if (!contact) {
            throw new Error('Contact not found');
        }

        // Check if contact has balance before deleting
        if (contact.balance && contact.balance !== 0) {
            throw new Error('Cannot delete contact with non-zero balance');
        }

        await Contacts.findByIdAndDelete(id);

        return {
            success: true,
            message: 'Contact deleted successfully'
        };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to delete contact');
    }
};

// ============================================
// UPDATE CONTACT BALANCE SERVICE
// ============================================
export const updateContactBalanceService = async (
    id: string,
    amount: number,
    type: 'receivable' | 'payable'
): Promise<IContacts | null> => {
    try {
        const contact = await Contacts.findById(id);
        
        if (!contact) {
            throw new Error('Contact not found');
        }

        // Update balance based on transaction type
        if (type === 'receivable') {
            contact.balance = (contact.balance || 0) + amount;
        } else {
            contact.balance = (contact.balance || 0) - amount;
        }

        await contact.save();
        return contact;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update contact balance');
    }
};


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
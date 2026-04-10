import { JournalsName } from './journalsName.model';
import { IJournalsName, AddJournalsNameRequest } from './journalsName.interface';

// BALANCE 
// journalsName.service.ts
import mongoose from 'mongoose';

export const updateJournalNameBalanceService = async (
    journalsNameId: string | mongoose.Types.ObjectId, // Accept both string and ObjectId
    amount: number,
    type: 'debit' | 'credit',
    operation: 'add' | 'subtract' = 'add'
): Promise<void> => {
    try {
        // Convert to string if it's ObjectId
        const id = typeof journalsNameId === 'string' ? journalsNameId : journalsNameId.toString();
        
        const journalName = await JournalsName.findById(id);
        if (!journalName) {
            throw new Error('Journal name not found');
        }

        // Calculate balance change
        let balanceChange = amount;
        if (type === 'credit') {
            balanceChange = -amount; // Credit decreases balance
        }

        // Apply operation
        if (operation === 'subtract') {
            balanceChange = -balanceChange;
        }

        // Update balance
        journalName.balance = (journalName.balance || 0) + balanceChange;
        await journalName.save();
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update journal name balance');
    }
};


// Get journal name balance
export const getJournalNameBalanceService = async (id: string): Promise<number> => {
    try {
        const journalName = await JournalsName.findById(id);
        if (!journalName) {
            throw new Error('Journal name not found');
        }
        return journalName.balance || 0;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch journal name balance');
    }
};


// ============================================
// GET ALL JOURNALS NAMES
// ============================================
export const getJournalsNameService = async (): Promise<IJournalsName[]> => {
    try {
        const journals = await JournalsName.find().sort({ createdAt: -1 });
        return journals;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch journals names');
    }
};

// ============================================
// GET SINGLE JOURNAL NAME BY ID
// ============================================
export const getJournalNameByIdService = async (id: string): Promise<IJournalsName> => {
    try {
        const journal = await JournalsName.findById(id);
        if (!journal) {
            throw new Error('Journal name not found');
        }
        return journal;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch journal name');
    }
};

// ============================================
// ADD NEW JOURNAL NAME
// ============================================
export const addJournalsNameService = async (journalData: AddJournalsNameRequest): Promise<{ journal: IJournalsName }> => {
    try {
        const { 
            journalName, 
            journalNameArb, 
            accName, 
            accNameArb, 
            code,
            accGroup, 
            accGroupArb, 
            accLevel, 
            accLevelArb, 
            accChart, 
            accChartArb 
        } = journalData;

        // Check if journal with same code already exists
        const existingJournal = await JournalsName.findOne({ code });
        if (existingJournal) {
            throw new Error(`Journal with code ${code} already exists`);
        }

        // Check if journal with same name exists (optional)
        const existingJournalByName = await JournalsName.findOne({ 
            $or: [
                { journalName: journalName },
                { journalNameArb: journalNameArb }
            ] 
        });
        
        if (existingJournalByName) {
            throw new Error('Journal with this name already exists');
        }

        const newJournal = await JournalsName.create({
            journalName,
            journalNameArb,
            accName,
            accNameArb,
            code,
            accGroup,
            accGroupArb,
            accLevel,
            accLevelArb,
            accChart,
            accChartArb,
            balance: 0 // Default balance
        });

        return { journal: newJournal.toObject() };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to add journal name');
    }
};

// ============================================
// UPDATE JOURNAL NAME
// ============================================
export const updateJournalNameService = async (
    id: string, 
    updateData: Partial<AddJournalsNameRequest>
): Promise<{ journal: IJournalsName }> => {
    try {
        const journal = await JournalsName.findById(id);
        if (!journal) {
            throw new Error('Journal name not found');
        }

        // If code is being updated, check for duplicates
        if (updateData.code && updateData.code !== journal.code) {
            const existingJournal = await JournalsName.findOne({ 
                code: updateData.code,
                _id: { $ne: id }
            });
            if (existingJournal) {
                throw new Error(`Journal with code ${updateData.code} already exists`);
            }
        }

        const updatedJournal = await JournalsName.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!updatedJournal) {
            throw new Error('Journal name not found');
        }

        return { journal: updatedJournal.toObject() };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update journal name');
    }
};

// ============================================
// DELETE JOURNAL NAME
// ============================================
export const deleteJournalNameService = async (id: string): Promise<{ message: string }> => {
    try {
        const journal = await JournalsName.findByIdAndDelete(id);
        if (!journal) {
            throw new Error('Journal name not found');
        }
        return { message: 'Journal name deleted successfully' };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to delete journal name');
    }
};

// ============================================
// GET JOURNALS BY FILTER
// ============================================
export const getJournalsByFilterService = async (filter: {
    accChart?: string;
    accLevel?: string;
    accGroup?: string;
    search?: string;
}): Promise<IJournalsName[]> => {
    try {
        const query: any = {};

        if (filter.accChart) {
            query.accChart = filter.accChart;
        }
        if (filter.accLevel) {
            query.accLevel = filter.accLevel;
        }
        if (filter.accGroup) {
            query.accGroup = filter.accGroup;
        }
        if (filter.search) {
            query.$or = [
                { journalName: { $regex: filter.search, $options: 'i' } },
                { journalNameArb: { $regex: filter.search, $options: 'i' } },
                { code: { $regex: filter.search, $options: 'i' } }
            ];
        }

        const journals = await JournalsName.find(query).sort({ createdAt: -1 });
        return journals;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch journals');
    }
};
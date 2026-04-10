import { Journal } from './journals.model';
import { IJournal, AddJournalRequest, JournalFilterRequest, UpdateJournalRequest } from './journals.interface';
import { updateJournalNameBalanceService } from '../journalsName/journalsName.service' ;


export const addJournalService = async (journalData: Partial<IJournal>): Promise<IJournal> => {
    try {
        // Generate a unique code based on timestamp and random number
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        const baseCode = journalData.code || journalData.journalName?.substring(0, 3).toUpperCase() || 'JNL';
        const uniqueCode = `${baseCode}-${timestamp}-${random}`;

        // Set default status to draft for new journals
        const journalWithDefaults = {
            ...journalData,
            code: uniqueCode, // Always use the generated unique code
            status: 'draft',
            isActive: true,
            isClosed: false
        };

        const journal = new Journal(journalWithDefaults);
        await journal.save();

        // Update JournalsName balance based on journal entries
        if (journal.entries && journal.entries.length > 0) {
            const journalsNameId = journalData.journalsNameId;
            
            if (journalsNameId) {
                const netBalance = journal.totalDebit - journal.totalCredit;
                
                await updateJournalNameBalanceService(
                    journalsNameId.toString(),
                    Math.abs(netBalance),
                    netBalance > 0 ? 'debit' : 'credit',
                    'add'
                );
            }
        }

        return journal;
    } catch (error: any) {
        console.error('Error in addJournalService:', error);
        throw new Error(error.message || 'Failed to create journal');
    }
};



// ============================================
// ADD JOURNAL SERVICE
// ============================================

// export const addJournalService = async (journalData: Partial<IJournal>): Promise<IJournal> => {
//     try {
//         // Set default status to draft for new journals
//         const journalWithDefaults = {
//             ...journalData,
//             status: 'draft',
//             isActive: true,
//             isClosed: false
//         };

//         const journal = new Journal(journalWithDefaults);
//         await journal.save();

//         // Update JournalsName balance based on journal entries
//         if (journal.entries && journal.entries.length > 0) {
//             // You need to link the journal to a JournalsName
//             // This could be passed in journalData or derived from journalName
//             const journalsNameId = journalData.journalsNameId; // This is ObjectId type
            
//             if (journalsNameId) {
//                 // Calculate net effect on balance
//                 const netBalance = journal.totalDebit - journal.totalCredit;
                
//                 // Convert ObjectId to string when passing to the service
//                 await updateJournalNameBalanceService(
//                     journalsNameId.toString(), // Convert ObjectId to string
//                     Math.abs(netBalance),
//                     netBalance > 0 ? 'debit' : 'credit',
//                     'add'
//                 );
//             }
//         }

//         return journal;
//     } catch (error: any) {
//         throw new Error(error.message || 'Failed to create journal');
//     }
// };





// ============================================
// GET ALL JOURNALS SERVICE
// ============================================
export const getJournalsService = async (filter?: JournalFilterRequest): Promise<IJournal[]> => {
    try {
        const query: any = { isActive: true };
        
        if (filter) {
            if (filter.fiscalYear) query.fiscalYear = filter.fiscalYear;
            if (filter.period) query.period = filter.period;
            if (filter.currency) query.currency = filter.currency;
            if (filter.isActive !== undefined) query.isActive = filter.isActive;
            if (filter.status) query.status = filter.status; // NEW: Add status filter
            
            // Partner filter
            if (filter.partnerId) {
                query['entries.partnerId'] = filter.partnerId;
            }
            
            // Date range filter
            if (filter.startDate || filter.endDate) {
                query['entries.date'] = {};
                if (filter.startDate) query['entries.date'].$gte = filter.startDate;
                if (filter.endDate) query['entries.date'].$lte = filter.endDate;
            }
        }
        
        const journals = await Journal.find(query)
            .sort({ createdAt: -1 });

        return journals;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch journals');
    }
};
// ============================================
// GET JOURNAL BY ID SERVICE
// ============================================
export const getJournalByIdService = async (id: string): Promise<IJournal | null> => {
    try {
        const journal = await Journal.findById(id);
        return journal;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch journal by ID');
    }
};
// ============================================
// GET JOURNAL BY Journal Name
// ============================================
export const getJournalsByJournalNameService = async (searchTerm: string): Promise<IJournal[]> => {
    try {
        // Search in both English and Arabic names (case insensitive)
        const journals = await Journal.find({
            $or: [
                { journalName: { $regex: searchTerm, $options: 'i' } },
                { journalNameArb: { $regex: searchTerm, $options: 'i' } }
            ],
            isActive: true
        }).sort({ createdAt: -1 });

        return journals;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch journals by name');
    }
};

export const searchJournalsByNameService = async (
    searchTerm: string,
    page: number = 1,
    limit: number = 10
): Promise<{ journals: IJournal[]; total: number; pages: number }> => {
    try {
        const query = {
            $or: [
                { journalName: { $regex: searchTerm, $options: 'i' } },
                { journalNameArb: { $regex: searchTerm, $options: 'i' } }
            ],
            isActive: true
        };

        const total = await Journal.countDocuments(query);
        const pages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        const journals = await Journal.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        return { journals, total, pages };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to search journals by name');
    }
};
// ============================================
// GET JOURNAL BY CODE SERVICE
// ============================================
export const getJournalByCodeService = async (code: string): Promise<IJournal | null> => {
    try {
        const journal = await Journal.findOne({ 
            code: code.toUpperCase(),
            isActive: true 
        });
        return journal;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch journal by code');
    }
};
// ============================================
// GET JOURNALS BY ACCOUNT SERVICE
// ============================================
export const getJournalsByAccountService = async (accChart: string, accLevel?: string, accGroup?: string, accClass?: string): Promise<IJournal[]> => {
    try {
        const query: any = { isActive: true };
        
        query['entries.accChart'] = accChart;
        if (accLevel) query['entries.accLevel'] = accLevel;
        if (accGroup) query['entries.accGroup'] = accGroup;
        if (accClass) query['entries.accClass'] = accClass;
        
        const journals = await Journal.find(query).sort({ createdAt: -1 });
        return journals;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch journals by account');
    }
};
// ============================================
// GET JOURNALS BY PARTNER SERVICE
// ============================================
export const getJournalsByPartnerService = async (partnerId: string): Promise<IJournal[]> => {
    try {
        const journals = await Journal.find({
            'entries.partnerId': partnerId,
            isActive: true
        }).sort({ createdAt: -1 });
        
        return journals;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch journals by partner');
    }
};




// ============================================
// UPDATE JOURNAL SERVICE
//=============================================
export const updateJournalService = async (
    id: string, 
    updateData: UpdateJournalRequest
): Promise<{ journal: IJournal }> => {
    try {
        const journal = await Journal.findById(id);
        if (!journal) {
            throw new Error('Journal not found');
        }

        // Check if journal can be updated based on status
        if (journal.status && !['draft', 'rejected'].includes(journal.status)) {
            throw new Error(`Cannot update journal with status: ${journal.status}. Only draft or rejected journals can be updated.`);
        }

        // If journal is closed, prevent updates
        if (journal.isClosed) {
            throw new Error('Cannot update a closed journal');
        }

        // If code is being updated, check for duplicates
        if (updateData.code && updateData.code.toUpperCase() !== journal.code) {
            const existingJournal = await Journal.findOne({ 
                code: updateData.code.toUpperCase(),
                _id: { $ne: id }
            });
            if (existingJournal) {
                throw new Error(`Journal with code ${updateData.code} already exists`);
            }
            updateData.code = updateData.code.toUpperCase();
        }

        // If status is being updated, validate it's a valid status
        if (updateData.status) {
            const validStatuses = ['draft', 'posted', 'approved', 'rejected', 'cancelled'];
            if (!validStatuses.includes(updateData.status)) {
                throw new Error(`Invalid status: ${updateData.status}. Must be one of: ${validStatuses.join(', ')}`);
            }
        }

        // If trying to close the journal
        if (updateData.isClosed && !journal.isClosed) {
            // Validate that journal can be closed
            if (journal.status !== 'approved' && journal.status !== 'posted') {
                throw new Error('Only approved or posted journals can be closed');
            }
            // Add closedAt timestamp
            (updateData as any).closedAt = new Date();
        }

        // If trying to reopen a closed journal
        if (updateData.isClosed === false && journal.isClosed) {
            throw new Error('Cannot reopen a closed journal. Create a reversal entry instead.');
        }

        // Prepare update object with only allowed fields
        const allowedUpdates: Partial<UpdateJournalRequest> = {};
        const allowedFields: (keyof UpdateJournalRequest)[] = [
            'journalName', 
            'journalNameArb', 
            'code', 
            'fiscalYear', 
            'period', 
            'isActive', 
            'isClosed',
            'status'
        ];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                (allowedUpdates as any)[field] = updateData[field];
            }
        });

        // Add closedAt to allowedUpdates if it was set
        if ((updateData as any).closedAt) {
            (allowedUpdates as any).closedAt = (updateData as any).closedAt;
        }

        const updatedJournal = await Journal.findByIdAndUpdate(
            id,
            { $set: allowedUpdates },
            { new: true, runValidators: true }
        );

        if (!updatedJournal) {
            throw new Error('Journal not found');
        }

        return { journal: updatedJournal.toObject() };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to update journal');
    }
};



// ============================================
// CLOSE JOURNAL SERVICE
// ============================================
export const closeJournalService = async (id: string): Promise<{ journal: IJournal }> => {
    try {
        const journal = await Journal.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    isClosed: true,
                    closedAt: new Date()
                } 
            },
            { new: true }
        );
        
        if (!journal) {
            throw new Error('Journal not found');
        }
        
        return { journal: journal.toObject() };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to close journal');
    }
};

// ============================================
// DELETE JOURNAL SERVICE
// ============================================
export const deleteJournalService = async (id: string): Promise<{ message: string }> => {
    try {
        const journal = await Journal.findByIdAndDelete(id);
        if (!journal) {
            throw new Error('Journal not found');
        }
        return { message: 'Journal deleted successfully' };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to delete journal');
    }
};


/////////////////////////////////////////REPORTING////////////////////////////////////////////////////////////////

// ============================================
// GET JOURNAL FILTERS SERVICE
// ============================================
export const getJournalFiltersService = async (): Promise<{
    years: number[];
    periods: string[];
    dateRange: { earliest: Date | null; latest: Date | null };
    currencies: string[];
    statuses: string[];
}> => {
    try {
        // Get distinct fiscal years
        const years = await Journal.distinct('fiscalYear');
        
        // Get distinct periods
        const periods = await Journal.distinct('period');
        
        // Get distinct currencies
        const currencies = await Journal.distinct('currency');
        
        // Get distinct statuses
        const statuses = await Journal.distinct('status');
        
        // Get date range for all journals
        const dateRangeResult = await Journal.aggregate([
            {
                $group: {
                    _id: null,
                    earliestDate: { $min: '$createdAt' },
                    latestDate: { $max: '$createdAt' }
                }
            }
        ]);

        // Get entry date range
        const entryDateRangeResult = await Journal.aggregate([
            { $unwind: '$entries' },
            {
                $group: {
                    _id: null,
                    earliestEntryDate: { $min: '$entries.date' },
                    latestEntryDate: { $max: '$entries.date' }
                }
            }
        ]);

        // Format the response
        const filters = {
            // Filter and sort years (remove null/undefined, sort descending)
            years: years
                .filter(year => year != null)
                .map(year => Number(year))
                .sort((a, b) => b - a),
            
            // Filter and sort periods (remove null/undefined, sort descending)
            periods: periods
                .filter(period => period != null)
                .sort((a, b) => b.localeCompare(a)),
            
            // Date range for journal creation
            dateRange: {
                earliest: dateRangeResult[0]?.earliestDate || null,
                latest: dateRangeResult[0]?.latestDate || null,
                earliestEntry: entryDateRangeResult[0]?.earliestEntryDate || null,
                latestEntry: entryDateRangeResult[0]?.latestEntryDate || null
            },
            
            // Currencies
            currencies: currencies
                .filter(currency => currency != null)
                .sort(),
            
            // Statuses
            statuses: statuses
                .filter(status => status != null)
                .sort()
        };

        return filters;
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch journal filters');
    }
};

// ============================================
// GET FILTER OPTIONS WITH COUNTS SERVICE
// ============================================
export const getJournalFilterOptionsWithCountsService = async (): Promise<{
    years: Array<{ value: number; count: number; label: string }>;
    periods: Array<{ value: string; count: number; label: string }>;
    statuses: Array<{ value: string; count: number; label: string; color: string }>;
    currencies: Array<{ value: string; count: number; label: string; flag: string }>;
}> => {
    try {
        // Get years with counts
        const yearsAgg = await Journal.aggregate([
            {
                $group: {
                    _id: '$fiscalYear',
                    count: { $sum: 1 }
                }
            },
            { $match: { _id: { $ne: null } } },
            { $sort: { _id: -1 } }
        ]);

        // Get periods with counts
        const periodsAgg = await Journal.aggregate([
            {
                $group: {
                    _id: '$period',
                    count: { $sum: 1 }
                }
            },
            { $match: { _id: { $ne: null } } },
            { $sort: { _id: -1 } }
        ]);

        // Get statuses with counts
        const statusesAgg = await Journal.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            { $match: { _id: { $ne: null } } }
        ]);

        // Get currencies with counts
        const currenciesAgg = await Journal.aggregate([
            {
                $group: {
                    _id: '$currency',
                    count: { $sum: 1 }
                }
            },
            { $match: { _id: { $ne: null } } }
        ]);

        // Status color mapping
        const statusColorMap: Record<string, string> = {
            draft: 'bg-yellow-100 text-yellow-600',
            posted: 'bg-green-100 text-green-600',
            approved: 'bg-blue-100 text-blue-600',
            rejected: 'bg-red-100 text-red-600',
            cancelled: 'bg-gray-100 text-gray-600'
        };

        // Currency flag mapping (you can expand this)
        const currencyFlagMap: Record<string, string> = {
            AED: '🇦🇪',
            SD: '🇸🇩',
            USD: '🇺🇸',
            EUR: '🇪🇺',
            GBP: '🇬🇧',
            SAR: '🇸🇦',
            QAR: '🇶🇦',
            KWD: '🇰🇼',
            JOD: '🇯🇴',
            EGP: '🇪🇬'
        };

        return {
            years: yearsAgg.map(item => ({
                value: item._id,
                count: item.count,
                label: item._id.toString()
            })),
            periods: periodsAgg.map(item => ({
                value: item._id,
                count: item.count,
                label: item._id
            })),
            statuses: statusesAgg.map(item => ({
                value: item._id,
                count: item.count,
                label: item._id.charAt(0).toUpperCase() + item._id.slice(1),
                color: statusColorMap[item._id] || 'bg-gray-100 text-gray-600'
            })),
            currencies: currenciesAgg.map(item => ({
                value: item._id,
                count: item.count,
                label: item._id,
                flag: currencyFlagMap[item._id] || '💵'
            }))
        };
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch filter options with counts');
    }
};
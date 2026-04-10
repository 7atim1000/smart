"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJournalFilterOptionsWithCountsService = exports.getJournalFiltersService = exports.deleteJournalService = exports.closeJournalService = exports.updateJournalService = exports.getJournalsByPartnerService = exports.getJournalsByAccountService = exports.getJournalByCodeService = exports.searchJournalsByNameService = exports.getJournalsByJournalNameService = exports.getJournalByIdService = exports.getJournalsService = exports.addJournalService = void 0;
const journals_model_1 = require("./journals.model");
const journalsName_service_1 = require("../journalsName/journalsName.service");
const addJournalService = async (journalData) => {
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
        const journal = new journals_model_1.Journal(journalWithDefaults);
        await journal.save();
        // Update JournalsName balance based on journal entries
        if (journal.entries && journal.entries.length > 0) {
            const journalsNameId = journalData.journalsNameId;
            if (journalsNameId) {
                const netBalance = journal.totalDebit - journal.totalCredit;
                await (0, journalsName_service_1.updateJournalNameBalanceService)(journalsNameId.toString(), Math.abs(netBalance), netBalance > 0 ? 'debit' : 'credit', 'add');
            }
        }
        return journal;
    }
    catch (error) {
        console.error('Error in addJournalService:', error);
        throw new Error(error.message || 'Failed to create journal');
    }
};
exports.addJournalService = addJournalService;
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
const getJournalsService = async (filter) => {
    try {
        const query = { isActive: true };
        if (filter) {
            if (filter.fiscalYear)
                query.fiscalYear = filter.fiscalYear;
            if (filter.period)
                query.period = filter.period;
            if (filter.currency)
                query.currency = filter.currency;
            if (filter.isActive !== undefined)
                query.isActive = filter.isActive;
            if (filter.status)
                query.status = filter.status; // NEW: Add status filter
            // Partner filter
            if (filter.partnerId) {
                query['entries.partnerId'] = filter.partnerId;
            }
            // Date range filter
            if (filter.startDate || filter.endDate) {
                query['entries.date'] = {};
                if (filter.startDate)
                    query['entries.date'].$gte = filter.startDate;
                if (filter.endDate)
                    query['entries.date'].$lte = filter.endDate;
            }
        }
        const journals = await journals_model_1.Journal.find(query)
            .sort({ createdAt: -1 });
        return journals;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch journals');
    }
};
exports.getJournalsService = getJournalsService;
// ============================================
// GET JOURNAL BY ID SERVICE
// ============================================
const getJournalByIdService = async (id) => {
    try {
        const journal = await journals_model_1.Journal.findById(id);
        return journal;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch journal by ID');
    }
};
exports.getJournalByIdService = getJournalByIdService;
// ============================================
// GET JOURNAL BY Journal Name
// ============================================
const getJournalsByJournalNameService = async (searchTerm) => {
    try {
        // Search in both English and Arabic names (case insensitive)
        const journals = await journals_model_1.Journal.find({
            $or: [
                { journalName: { $regex: searchTerm, $options: 'i' } },
                { journalNameArb: { $regex: searchTerm, $options: 'i' } }
            ],
            isActive: true
        }).sort({ createdAt: -1 });
        return journals;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch journals by name');
    }
};
exports.getJournalsByJournalNameService = getJournalsByJournalNameService;
const searchJournalsByNameService = async (searchTerm, page = 1, limit = 10) => {
    try {
        const query = {
            $or: [
                { journalName: { $regex: searchTerm, $options: 'i' } },
                { journalNameArb: { $regex: searchTerm, $options: 'i' } }
            ],
            isActive: true
        };
        const total = await journals_model_1.Journal.countDocuments(query);
        const pages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;
        const journals = await journals_model_1.Journal.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return { journals, total, pages };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to search journals by name');
    }
};
exports.searchJournalsByNameService = searchJournalsByNameService;
// ============================================
// GET JOURNAL BY CODE SERVICE
// ============================================
const getJournalByCodeService = async (code) => {
    try {
        const journal = await journals_model_1.Journal.findOne({
            code: code.toUpperCase(),
            isActive: true
        });
        return journal;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch journal by code');
    }
};
exports.getJournalByCodeService = getJournalByCodeService;
// ============================================
// GET JOURNALS BY ACCOUNT SERVICE
// ============================================
const getJournalsByAccountService = async (accChart, accLevel, accGroup, accClass) => {
    try {
        const query = { isActive: true };
        query['entries.accChart'] = accChart;
        if (accLevel)
            query['entries.accLevel'] = accLevel;
        if (accGroup)
            query['entries.accGroup'] = accGroup;
        if (accClass)
            query['entries.accClass'] = accClass;
        const journals = await journals_model_1.Journal.find(query).sort({ createdAt: -1 });
        return journals;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch journals by account');
    }
};
exports.getJournalsByAccountService = getJournalsByAccountService;
// ============================================
// GET JOURNALS BY PARTNER SERVICE
// ============================================
const getJournalsByPartnerService = async (partnerId) => {
    try {
        const journals = await journals_model_1.Journal.find({
            'entries.partnerId': partnerId,
            isActive: true
        }).sort({ createdAt: -1 });
        return journals;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch journals by partner');
    }
};
exports.getJournalsByPartnerService = getJournalsByPartnerService;
// ============================================
// UPDATE JOURNAL SERVICE
//=============================================
const updateJournalService = async (id, updateData) => {
    try {
        const journal = await journals_model_1.Journal.findById(id);
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
            const existingJournal = await journals_model_1.Journal.findOne({
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
            updateData.closedAt = new Date();
        }
        // If trying to reopen a closed journal
        if (updateData.isClosed === false && journal.isClosed) {
            throw new Error('Cannot reopen a closed journal. Create a reversal entry instead.');
        }
        // Prepare update object with only allowed fields
        const allowedUpdates = {};
        const allowedFields = [
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
                allowedUpdates[field] = updateData[field];
            }
        });
        // Add closedAt to allowedUpdates if it was set
        if (updateData.closedAt) {
            allowedUpdates.closedAt = updateData.closedAt;
        }
        const updatedJournal = await journals_model_1.Journal.findByIdAndUpdate(id, { $set: allowedUpdates }, { new: true, runValidators: true });
        if (!updatedJournal) {
            throw new Error('Journal not found');
        }
        return { journal: updatedJournal.toObject() };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to update journal');
    }
};
exports.updateJournalService = updateJournalService;
// ============================================
// CLOSE JOURNAL SERVICE
// ============================================
const closeJournalService = async (id) => {
    try {
        const journal = await journals_model_1.Journal.findByIdAndUpdate(id, {
            $set: {
                isClosed: true,
                closedAt: new Date()
            }
        }, { new: true });
        if (!journal) {
            throw new Error('Journal not found');
        }
        return { journal: journal.toObject() };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to close journal');
    }
};
exports.closeJournalService = closeJournalService;
// ============================================
// DELETE JOURNAL SERVICE
// ============================================
const deleteJournalService = async (id) => {
    try {
        const journal = await journals_model_1.Journal.findByIdAndDelete(id);
        if (!journal) {
            throw new Error('Journal not found');
        }
        return { message: 'Journal deleted successfully' };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to delete journal');
    }
};
exports.deleteJournalService = deleteJournalService;
/////////////////////////////////////////REPORTING////////////////////////////////////////////////////////////////
// ============================================
// GET JOURNAL FILTERS SERVICE
// ============================================
const getJournalFiltersService = async () => {
    try {
        // Get distinct fiscal years
        const years = await journals_model_1.Journal.distinct('fiscalYear');
        // Get distinct periods
        const periods = await journals_model_1.Journal.distinct('period');
        // Get distinct currencies
        const currencies = await journals_model_1.Journal.distinct('currency');
        // Get distinct statuses
        const statuses = await journals_model_1.Journal.distinct('status');
        // Get date range for all journals
        const dateRangeResult = await journals_model_1.Journal.aggregate([
            {
                $group: {
                    _id: null,
                    earliestDate: { $min: '$createdAt' },
                    latestDate: { $max: '$createdAt' }
                }
            }
        ]);
        // Get entry date range
        const entryDateRangeResult = await journals_model_1.Journal.aggregate([
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
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch journal filters');
    }
};
exports.getJournalFiltersService = getJournalFiltersService;
// ============================================
// GET FILTER OPTIONS WITH COUNTS SERVICE
// ============================================
const getJournalFilterOptionsWithCountsService = async () => {
    try {
        // Get years with counts
        const yearsAgg = await journals_model_1.Journal.aggregate([
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
        const periodsAgg = await journals_model_1.Journal.aggregate([
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
        const statusesAgg = await journals_model_1.Journal.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            },
            { $match: { _id: { $ne: null } } }
        ]);
        // Get currencies with counts
        const currenciesAgg = await journals_model_1.Journal.aggregate([
            {
                $group: {
                    _id: '$currency',
                    count: { $sum: 1 }
                }
            },
            { $match: { _id: { $ne: null } } }
        ]);
        // Status color mapping
        const statusColorMap = {
            draft: 'bg-yellow-100 text-yellow-600',
            posted: 'bg-green-100 text-green-600',
            approved: 'bg-blue-100 text-blue-600',
            rejected: 'bg-red-100 text-red-600',
            cancelled: 'bg-gray-100 text-gray-600'
        };
        // Currency flag mapping (you can expand this)
        const currencyFlagMap = {
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
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch filter options with counts');
    }
};
exports.getJournalFilterOptionsWithCountsService = getJournalFilterOptionsWithCountsService;

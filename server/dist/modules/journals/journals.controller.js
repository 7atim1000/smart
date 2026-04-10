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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJournalFiltersController = exports.getBalanceSheetController = exports.getTrialBalanceController = exports.deleteJournalController = exports.closeJournalController = exports.getJournalsByPartnerController = exports.getJournalsByAccountController = exports.getJournalByCodeController = exports.getJournalsByJournalNameController = exports.getJournalByIdController = exports.getJournalsController = exports.addJournalController = exports.updateJournalController = void 0;
const journals_model_1 = require("./journals.model");
const JournalsService = __importStar(require("./journals.service"));
// Helper function to get string param (if you don't have it in utils)
const getStringParam = (param) => {
    return param ? String(param) : undefined;
};
// ============================================
// UPDATE JOURNAL CONTROLLER
// ============================================
const updateJournalController = async (req, res) => {
    try {
        const id = getStringParam(req.params.id);
        const updateData = req.body;
        if (!id) {
            res.status(400).json({ success: false, message: 'Journal ID is required' });
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
        // Validate status if provided
        if (updateData.status) {
            const validStatuses = ['draft', 'posted', 'approved', 'rejected', 'cancelled'];
            if (!validStatuses.includes(updateData.status)) {
                res.status(400).json({
                    success: false,
                    message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
                });
                return;
            }
        }
        // Validate fiscal year if provided
        if (updateData.fiscalYear) {
            const year = updateData.fiscalYear;
            if (year < 2000 || year > 2100) {
                res.status(400).json({
                    success: false,
                    message: 'Fiscal year must be between 2000 and 2100'
                });
                return;
            }
        }
        // Validate period format if provided
        if (updateData.period) {
            const periodRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
            if (!periodRegex.test(updateData.period)) {
                res.status(400).json({
                    success: false,
                    message: 'Period must be in format YYYY-MM (e.g., 2024-01)'
                });
                return;
            }
        }
        const result = await JournalsService.updateJournalService(id, updateData);
        res.status(200).json({
            success: true,
            journal: result.journal,
            message: 'Journal updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating journal:', error);
        // Handle specific error cases
        if (error.message === 'Journal not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        if (error.message.includes('Cannot update journal with status')) {
            res.status(403).json({ success: false, message: error.message });
            return;
        }
        if (error.message.includes('Cannot update a closed journal')) {
            res.status(403).json({ success: false, message: error.message });
            return;
        }
        if (error.message.includes('Only approved or posted journals can be closed')) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        if (error.message.includes('Cannot reopen a closed journal')) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        if (error.message.includes('Invalid status')) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }
        if (error.message.includes('already exists')) {
            res.status(409).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update journal'
        });
    }
};
exports.updateJournalController = updateJournalController;
// ============================================
// ADD JOURNAL CONTROLLER
// ============================================
const addJournalController = async (req, res) => {
    try {
        const { status, reference, journalName, journalNameArb, 
        // code is now optional - service will generate it
        currency, fiscalYear, period, openingBalance, journalsNameId, entries } = req.body;
        // Log received data for debugging
        console.log('Received journal data:', {
            journalName,
            journalNameArb,
            currency,
            fiscalYear,
            period,
            journalsNameId,
            entriesCount: entries?.length
        });
        if (entries && entries.length > 0) {
            console.log('First entry sample:', entries[0]);
        }
        // Validate required journal header fields (code is now optional)
        if (!journalName || !journalNameArb || !fiscalYear || !period || !currency || !reference) {
            res.status(400).json({
                success: false,
                message: 'Missing required journal header fields'
            });
            return;
        }
        // Validate journalsNameId is provided
        if (!journalsNameId) {
            res.status(400).json({
                success: false,
                message: 'JournalsName ID is required to link journal to journal name'
            });
            return;
        }
        // Validate entries
        if (!entries || !Array.isArray(entries) || entries.length === 0) {
            res.status(400).json({
                success: false,
                message: 'At least one journal entry is required'
            });
            return;
        }
        // Calculate totals for validation
        let totalDebit = 0;
        let totalCredit = 0;
        // Validate each entry
        for (const [index, entry] of entries.entries()) {
            const requiredEntryFields = [
                'date', 'reference', 'description', 'descriptionArb',
                'accName', 'accNameArb', 'accGroup', 'accGroupArb',
                'accClass', 'accClassArb', 'accLevel', 'accLevelArb',
                'accChart', 'accChartArb', 'accType'
            ];
            const missingFields = requiredEntryFields.filter(field => {
                const value = entry[field];
                return value === undefined || value === null || value === '';
            });
            if (missingFields.length > 0) {
                console.log(`Entry ${index + 1} missing fields:`, missingFields);
                console.log('Entry data:', entry);
                res.status(400).json({
                    success: false,
                    message: `Entry ${index + 1}: Missing fields: ${missingFields.join(', ')}`
                });
                return;
            }
            const debit = Number(entry.debit) || 0;
            const credit = Number(entry.credit) || 0;
            if (debit === 0 && credit === 0) {
                res.status(400).json({
                    success: false,
                    message: `Entry ${index + 1}: Either debit or credit must be greater than 0`
                });
                return;
            }
            if (debit > 0 && credit > 0) {
                res.status(400).json({
                    success: false,
                    message: `Entry ${index + 1}: Cannot have both debit and credit`
                });
                return;
            }
            totalDebit += debit;
            totalCredit += credit;
        }
        // Validate that total debit equals total credit
        if (totalDebit !== totalCredit) {
            res.status(400).json({
                success: false,
                message: `Total debit (${totalDebit.toFixed(2)}) must equal total credit (${totalCredit.toFixed(2)})`
            });
            return;
        }
        // Prepare journal data WITHOUT code (service will generate it)
        const journalData = {
            status, reference,
            journalName: journalName.trim(),
            journalNameArb: journalNameArb.trim(),
            // code is not included - service will generate it
            currency,
            fiscalYear: Number(fiscalYear),
            period: period.trim(),
            openingBalance: openingBalance || 0,
            journalsNameId,
            entries: entries.map((entry) => {
                const mappedEntry = {
                    date: new Date(entry.date),
                    reference: entry.reference,
                    description: entry.description,
                    descriptionArb: entry.descriptionArb,
                    debit: Number(entry.debit) || 0,
                    credit: Number(entry.credit) || 0,
                    balance: Number(entry.balance) || 0,
                    currency: entry.currency || currency,
                    accName: entry.accName,
                    accNameArb: entry.accNameArb,
                    accGroup: entry.accGroup,
                    accGroupArb: entry.accGroupArb,
                    accClass: entry.accClass,
                    accClassArb: entry.accClassArb,
                    accLevel: entry.accLevel,
                    accLevelArb: entry.accLevelArb,
                    accChart: entry.accChart,
                    accChartArb: entry.accChartArb,
                    accType: entry.accType,
                    partnerId: entry.partnerId,
                    partnerName: entry.partnerName,
                    partnerNameArb: entry.partnerNameArb
                };
                return mappedEntry;
            })
        };
        console.log('Sending to service (code will be generated):', {
            ...journalData,
            entries: journalData.entries.map(e => ({
                accName: e.accName,
                accType: e.accType,
                debit: e.debit,
                credit: e.credit
            }))
        });
        const result = await JournalsService.addJournalService(journalData);
        res.status(201).json({
            success: true,
            journal: result,
            message: 'Journal added successfully'
        });
    }
    catch (error) {
        console.error('Error adding journal:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add journal'
        });
    }
};
exports.addJournalController = addJournalController;
// ============================================
// GET ALL JOURNALS CONTROLLER
// ============================================
const getJournalsController = async (req, res) => {
    try {
        // Query Parameters
        const { fiscalYear, period, currency, partnerId, startDate, endDate } = req.query;
        const filter = {
            ...(fiscalYear && { fiscalYear: Number(fiscalYear) }),
            ...(period && { period: period }),
            ...(currency && { currency: currency }), // NEW
            ...(partnerId && { partnerId: partnerId }),
            ...(startDate && { startDate: new Date(startDate) }),
            ...(endDate && { endDate: new Date(endDate) })
        };
        const journals = await JournalsService.getJournalsService(filter);
        res.status(200).json({
            success: true,
            journals,
            count: journals.length,
            message: 'Journals fetched successfully'
        });
    }
    catch (error) {
        console.error('Error fetching journals:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch journals' });
    }
};
exports.getJournalsController = getJournalsController;
// ============================================
// GET JOURNAL BY ID CONTROLLER
// ============================================
const getJournalByIdController = async (req, res) => {
    try {
        const id = getStringParam(req.params.id);
        if (!id) {
            res.status(400).json({ success: false, message: 'Journal ID is required' });
            return;
        }
        const journal = await JournalsService.getJournalByIdService(id);
        if (!journal) {
            res.status(404).json({ success: false, message: 'Journal not found' });
            return;
        }
        res.status(200).json({ success: true, journal });
    }
    catch (error) {
        console.error('Error fetching journal:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch journal' });
    }
};
exports.getJournalByIdController = getJournalByIdController;
// ============================================
// GET JOURNALS BY JOURNAL NAME CONTROLLER
// ============================================
const getJournalsByJournalNameController = async (req, res) => {
    try {
        const { searchTerm } = req.query;
        const { page, limit } = req.query;
        if (!searchTerm) {
            res.status(400).json({
                success: false,
                message: 'Search term is required'
            });
            return;
        }
        // If pagination params are provided, use paginated search
        if (page || limit) {
            const currentPage = parseInt(page) || 1;
            const itemsPerPage = parseInt(limit) || 10;
            const result = await JournalsService.searchJournalsByNameService(searchTerm, currentPage, itemsPerPage);
            res.status(200).json({
                success: true,
                journals: result.journals,
                pagination: {
                    currentPage,
                    itemsPerPage,
                    total: result.total,
                    totalPages: result.pages
                },
                message: 'Journals fetched successfully'
            });
            return;
        }
        // Otherwise return all matching journals
        const journals = await JournalsService.getJournalsByJournalNameService(searchTerm);
        res.status(200).json({
            success: true,
            journals,
            count: journals.length,
            message: 'Journals fetched successfully'
        });
    }
    catch (error) {
        console.error('Error fetching journals by name:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch journals by name'
        });
    }
};
exports.getJournalsByJournalNameController = getJournalsByJournalNameController;
// ============================================
// GET JOURNAL BY CODE CONTROLLER
// ============================================
const getJournalByCodeController = async (req, res) => {
    try {
        const code = getStringParam(req.params.code);
        if (!code) {
            res.status(400).json({ success: false, message: 'Journal code is required' });
            return;
        }
        const journal = await JournalsService.getJournalByCodeService(code);
        if (!journal) {
            res.status(404).json({ success: false, message: 'Journal not found' });
            return;
        }
        res.status(200).json({ success: true, journal });
    }
    catch (error) {
        console.error('Error fetching journal by code:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch journal' });
    }
};
exports.getJournalByCodeController = getJournalByCodeController;
// ============================================
// GET JOURNALS BY ACCOUNT CONTROLLER
// ============================================
const getJournalsByAccountController = async (req, res) => {
    try {
        const { accChart, accLevel, accGroup, accClass } = req.query;
        if (!accChart) {
            res.status(400).json({ success: false, message: 'Account chart is required' });
            return;
        }
        const journals = await JournalsService.getJournalsByAccountService(accChart, accLevel, accGroup, accClass);
        res.status(200).json({
            success: true,
            journals,
            count: journals.length
        });
    }
    catch (error) {
        console.error('Error fetching journals by account:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch journals' });
    }
};
exports.getJournalsByAccountController = getJournalsByAccountController;
// ============================================
// GET JOURNALS BY PARTNER CONTROLLER
// ============================================
const getJournalsByPartnerController = async (req, res) => {
    try {
        const partnerId = getStringParam(req.params.partnerId);
        if (!partnerId) {
            res.status(400).json({ success: false, message: 'Partner ID is required' });
            return;
        }
        const journals = await JournalsService.getJournalsByPartnerService(partnerId);
        res.status(200).json({
            success: true,
            journals,
            count: journals.length
        });
    }
    catch (error) {
        console.error('Error fetching journals by partner:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to fetch journals' });
    }
};
exports.getJournalsByPartnerController = getJournalsByPartnerController;
// ============================================
// CLOSE JOURNAL CONTROLLER
// ============================================
const closeJournalController = async (req, res) => {
    try {
        const id = getStringParam(req.params.id);
        if (!id) {
            res.status(400).json({ success: false, message: 'Journal ID is required' });
            return;
        }
        const result = await JournalsService.closeJournalService(id);
        res.status(200).json({
            success: true,
            journal: result.journal,
            message: 'Journal closed successfully'
        });
    }
    catch (error) {
        console.error('Error closing journal:', error);
        if (error.message === 'Journal not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: error.message || 'Failed to close journal' });
    }
};
exports.closeJournalController = closeJournalController;
// ============================================
// DELETE JOURNAL CONTROLLER
// ============================================
const deleteJournalController = async (req, res) => {
    try {
        const id = getStringParam(req.params.id);
        if (!id) {
            res.status(400).json({ success: false, message: 'Journal ID is required' });
            return;
        }
        const result = await JournalsService.deleteJournalService(id);
        res.status(200).json({ success: true, message: result.message });
    }
    catch (error) {
        console.error('Error deleting journal:', error);
        if (error.message === 'Journal not found') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({ success: false, message: error.message || 'Failed to delete journal' });
    }
};
exports.deleteJournalController = deleteJournalController;
/////////////////////////////////////////////////REPORTING/////////////////////////////////////////////////////////
// Trial Balance
const getTrialBalanceController = async (req, res) => {
    try {
        const { fiscalYear, period, asOfDate } = req.query;
        // Build base query - start with all journals
        let query = {};
        // Add filters only if they're provided and valid
        if (fiscalYear && !isNaN(Number(fiscalYear))) {
            query.fiscalYear = Number(fiscalYear);
        }
        if (period && period !== 'all' && period !== 'undefined' && period !== 'null') {
            query.period = period;
        }
        console.log('Trial balance query:', JSON.stringify(query, null, 2));
        // First, get all journals that match the criteria
        const journals = await journals_model_1.Journal.find(query).lean();
        console.log(`Found ${journals.length} journals matching query`);
        if (journals.length === 0) {
            // If no journals found with filters, try without filters
            console.log('No journals found with filters, trying without filters...');
            const allJournals = await journals_model_1.Journal.find({}).lean();
            console.log(`Total journals in database: ${allJournals.length}`);
            if (allJournals.length > 0) {
                // Use all journals instead
                journals.push(...allJournals);
                console.log(`Using all ${journals.length} journals`);
            }
            else {
                // Return empty result - FIXED: Just return without returning the res.json
                res.status(200).json({
                    success: true,
                    data: [],
                    totals: { initial: 0, debit: 0, credit: 0, balance: 0 },
                    message: 'No journals found'
                });
                return; // Just return, don't return the res.json
            }
        }
        // Extract and process all entries
        const accountMap = new Map();
        let totalInitial = 0;
        let totalDebit = 0;
        let totalCredit = 0;
        let totalBalance = 0;
        journals.forEach(journal => {
            // Check if this is an opening balance journal
            const isOpeningJournal = journal.journalName === 'Opening Balance' ||
                journal.journalNameArb === 'الارصده الافتتاحيه' ||
                journal.code?.includes('OPE') ||
                journal.journalName?.includes('Opening');
            console.log(`Processing journal: ${journal.journalName}, isOpening: ${isOpeningJournal}`);
            if (journal.entries && Array.isArray(journal.entries)) {
                journal.entries.forEach(entry => {
                    // Check if this entry is from an opening balance
                    const isOpeningEntry = isOpeningJournal ||
                        entry.reference?.includes('ENT-') ||
                        entry.reference === 'ENT-1' ||
                        entry.reference === 'ENT-2' ||
                        entry.description?.includes('Opening') ||
                        entry.descriptionArb?.includes('افتتاحية');
                    console.log(`  Entry: ${entry.accName}, ref: ${entry.reference}, isOpening: ${isOpeningEntry}`);
                    // Create a unique key based on full hierarchy
                    const key = `${entry.accChart || ''}|${entry.accLevel || ''}|${entry.accClass || ''}|${entry.accGroup || ''}|${entry.accName || ''}`;
                    if (!accountMap.has(key)) {
                        accountMap.set(key, {
                            chart: entry.accChart || '',
                            chartArb: entry.accChartArb || '',
                            level: entry.accLevel || '',
                            levelArb: entry.accLevelArb || '',
                            class: entry.accClass || '',
                            classArb: entry.accClassArb || '',
                            group: entry.accGroup || '',
                            groupArb: entry.accGroupArb || '',
                            name: entry.accName || '',
                            nameArb: entry.accNameArb || '',
                            initialBalance: 0,
                            debit: 0,
                            credit: 0,
                            balance: 0,
                            entryCount: 0
                        });
                    }
                    const account = accountMap.get(key);
                    // Add to totals
                    if (isOpeningEntry) {
                        account.initialBalance += (entry.credit || entry.debit || 0);
                        totalInitial += (entry.credit || entry.debit || 0);
                    }
                    account.debit += entry.debit || 0;
                    account.credit += entry.credit || 0;
                    account.balance += entry.balance || (entry.debit - entry.credit) || 0;
                    account.entryCount++;
                    totalDebit += entry.debit || 0;
                    totalCredit += entry.credit || 0;
                    totalBalance += entry.balance || (entry.debit - entry.credit) || 0;
                });
            }
        });
        // Convert map to array and add display names
        const trialBalance = Array.from(accountMap.values()).map(account => ({
            ...account,
            displayName: `${account.chart} > ${account.level} > ${account.class} > ${account.group} > ${account.name}`,
            displayNameArb: `${account.chartArb} > ${account.levelArb} > ${account.classArb} > ${account.groupArb} > ${account.nameArb}`
        })).sort((a, b) => {
            if (a.chart !== b.chart)
                return a.chart.localeCompare(b.chart);
            if (a.level !== b.level)
                return a.level.localeCompare(b.level);
            if (a.class !== b.class)
                return a.class.localeCompare(b.class);
            if (a.group !== b.group)
                return a.group.localeCompare(b.group);
            return a.name.localeCompare(b.name);
        });
        console.log(`Processed ${trialBalance.length} accounts`);
        console.log('Sample account:', trialBalance[0]);
        // FIXED: Just call res.json and then return (don't return the res.json itself)
        res.status(200).json({
            success: true,
            data: trialBalance,
            totals: {
                initial: totalInitial,
                debit: totalDebit,
                credit: totalCredit,
                balance: totalBalance
            },
            message: 'Trial balance fetched successfully'
        });
        return;
    }
    catch (error) {
        console.error('Error fetching trial balance:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch trial balance'
        });
        return;
    }
};
exports.getTrialBalanceController = getTrialBalanceController;
// Balance sheet
const getBalanceSheetController = async (req, res) => {
    try {
        const { fiscalYear, period, asOfDate } = req.query;
        // Build base query - start with all journals
        let query = {};
        // Add filters only if they're provided and valid
        if (fiscalYear && !isNaN(Number(fiscalYear))) {
            query.fiscalYear = Number(fiscalYear);
        }
        if (period && period !== 'all' && period !== 'undefined' && period !== 'null') {
            query.period = period;
        }
        console.log('Balance Sheet query:', JSON.stringify(query, null, 2));
        // First, get all journals that match the criteria
        const journals = await journals_model_1.Journal.find(query).lean();
        console.log(`Found ${journals.length} journals matching query`);
        if (journals.length === 0) {
            // If no journals found with filters, try without filters
            console.log('No journals found with filters, trying without filters...');
            const allJournals = await journals_model_1.Journal.find({}).lean();
            console.log(`Total journals in database: ${allJournals.length}`);
            if (allJournals.length > 0) {
                // Use all journals instead
                journals.push(...allJournals);
                console.log(`Using all ${journals.length} journals`);
            }
            else {
                // Return empty result
                res.status(200).json({
                    success: true,
                    data: {
                        assets: [],
                        liabilities: [],
                        equity: [],
                        totals: {
                            assets: 0,
                            liabilities: 0,
                            equity: 0,
                            liabilitiesEquity: 0
                        }
                    },
                    message: 'No journals found'
                });
                return;
            }
        }
        // Separate accounts by chart type (Assets, Liabilities, Equity)
        const assetsMap = new Map();
        const liabilitiesMap = new Map();
        const equityMap = new Map();
        let totalAssets = 0;
        let totalLiabilities = 0;
        let totalEquity = 0;
        journals.forEach(journal => {
            // Check if this is an opening balance journal
            const isOpeningJournal = journal.journalName === 'Opening Balance' ||
                journal.journalNameArb === 'الارصده الافتتاحيه' ||
                journal.code?.includes('OPE') ||
                journal.journalName?.includes('Opening');
            console.log(`Processing journal: ${journal.journalName}, isOpening: ${isOpeningJournal}`);
            if (journal.entries && Array.isArray(journal.entries)) {
                journal.entries.forEach(entry => {
                    // Determine chart type (Assets, Liabilities, Equity) from accChart field
                    const chartType = entry.accChart || entry.accChartArb || 'Unknown';
                    // Check if this entry is from an opening balance
                    const isOpeningEntry = isOpeningJournal ||
                        entry.reference?.includes('ENT-') ||
                        entry.reference === 'ENT-1' ||
                        entry.reference === 'ENT-2' ||
                        entry.description?.includes('Opening') ||
                        entry.descriptionArb?.includes('افتتاحية');
                    console.log(`  Entry: ${entry.accName}, chart: ${chartType}, isOpening: ${isOpeningEntry}`);
                    // Create a unique key based on full hierarchy matching your schema
                    const key = `${entry.accChart || ''}|${entry.accLevel || ''}|${entry.accClass || ''}|${entry.accGroup || ''}|${entry.accName || ''}`;
                    // Determine which map to use based on chart type
                    let targetMap;
                    if (chartType.toLowerCase().includes('asset') || chartType === 'Assets' || chartType === 'الاصول') {
                        targetMap = assetsMap;
                    }
                    else if (chartType.toLowerCase().includes('liabilit') || chartType === 'Liabilities' || chartType === 'الالتزامات') {
                        targetMap = liabilitiesMap;
                    }
                    else if (chartType.toLowerCase().includes('equity') || chartType === 'Equity' || chartType === 'حقوق الملكيه') {
                        targetMap = equityMap;
                    }
                    else {
                        // Skip accounts that don't belong to balance sheet
                        return;
                    }
                    if (!targetMap.has(key)) {
                        targetMap.set(key, {
                            // Chart level (from accChart)
                            chart: entry.accChart || '',
                            chartArb: entry.accChartArb || '',
                            // Level (from accLevel)
                            level: entry.accLevel || '',
                            levelArb: entry.accLevelArb || '',
                            // Class (from accClass)
                            class: entry.accClass || '',
                            classArb: entry.accClassArb || '',
                            // Group (from accGroup)
                            group: entry.accGroup || '',
                            groupArb: entry.accGroupArb || '',
                            // Account (from accName)
                            name: entry.accName || '',
                            nameArb: entry.accNameArb || '',
                            // Account type
                            type: entry.accType || '',
                            openingBalance: 0,
                            debit: 0,
                            credit: 0,
                            balance: 0,
                            entryCount: 0
                        });
                    }
                    const account = targetMap.get(key);
                    // Calculate balance (debit - credit)
                    const entryBalance = (entry.debit || 0) - (entry.credit || 0);
                    // For opening entries, add to opening balance
                    if (isOpeningEntry) {
                        account.openingBalance += entryBalance;
                    }
                    account.debit += entry.debit || 0;
                    account.credit += entry.credit || 0;
                    account.balance += entryBalance;
                    account.entryCount++;
                    // Add to category totals based on chart type
                    if (targetMap === assetsMap) {
                        totalAssets += entryBalance;
                    }
                    else if (targetMap === liabilitiesMap) {
                        totalLiabilities += entryBalance;
                    }
                    else if (targetMap === equityMap) {
                        totalEquity += entryBalance;
                    }
                });
            }
        });
        // Helper function to convert map to sorted array with full hierarchy
        const mapToArray = (map) => {
            return Array.from(map.values())
                .map((account) => ({
                ...account,
                fullHierarchy: `${account.chart} > ${account.level} > ${account.class} > ${account.group} > ${account.name}`,
                fullHierarchyArb: `${account.chartArb} > ${account.levelArb} > ${account.classArb} > ${account.groupArb} > ${account.nameArb}`
            }))
                .sort((a, b) => {
                if (a.chart !== b.chart)
                    return (a.chart || '').localeCompare(b.chart || '');
                if (a.level !== b.level)
                    return (a.level || '').localeCompare(b.level || '');
                if (a.class !== b.class)
                    return (a.class || '').localeCompare(b.class || '');
                if (a.group !== b.group)
                    return (a.group || '').localeCompare(b.group || '');
                return (a.name || '').localeCompare(b.name || '');
            });
        };
        // Convert maps to arrays
        const assets = mapToArray(assetsMap);
        const liabilities = mapToArray(liabilitiesMap);
        const equity = mapToArray(equityMap);
        // Calculate Liabilities + Equity total
        const totalLiabilitiesEquity = totalLiabilities + totalEquity;
        console.log(`Processed accounts - Assets: ${assets.length}, Liabilities: ${liabilities.length}, Equity: ${equity.length}`);
        console.log(`Totals - Assets: ${totalAssets}, Liabilities: ${totalLiabilities}, Equity: ${totalEquity}, Liabilities+Equity: ${totalLiabilitiesEquity}`);
        // Group accounts by their hierarchy levels for better organization
        const groupByLevel = (accounts) => {
            const grouped = {};
            accounts.forEach((account) => {
                if (!grouped[account.level]) {
                    grouped[account.level] = {
                        levelName: account.level,
                        levelNameArb: account.levelArb,
                        classes: {}
                    };
                }
                if (!grouped[account.level].classes[account.class]) {
                    grouped[account.level].classes[account.class] = {
                        className: account.class,
                        classNameArb: account.classArb,
                        groups: {}
                    };
                }
                if (!grouped[account.level].classes[account.class].groups[account.group]) {
                    grouped[account.level].classes[account.class].groups[account.group] = {
                        groupName: account.group,
                        groupNameArb: account.groupArb,
                        accounts: []
                    };
                }
                grouped[account.level].classes[account.class].groups[account.group].accounts.push({
                    name: account.name,
                    nameArb: account.nameArb,
                    balance: account.balance,
                    openingBalance: account.openingBalance,
                    type: account.type
                });
            });
            return grouped;
        };
        // Prepare response data with hierarchical structure matching your schema
        const balanceSheetData = {
            assets: {
                total: totalAssets,
                byLevel: groupByLevel(assets),
                accounts: assets.map(account => ({
                    chart: account.chart,
                    chartArb: account.chartArb,
                    level: account.level,
                    levelArb: account.levelArb,
                    class: account.class,
                    classArb: account.classArb,
                    group: account.group,
                    groupArb: account.groupArb,
                    name: account.name,
                    nameArb: account.nameArb,
                    balance: account.balance,
                    openingBalance: account.openingBalance,
                    type: account.type
                }))
            },
            liabilities: {
                total: totalLiabilities,
                byLevel: groupByLevel(liabilities),
                accounts: liabilities.map(account => ({
                    chart: account.chart,
                    chartArb: account.chartArb,
                    level: account.level,
                    levelArb: account.levelArb,
                    class: account.class,
                    classArb: account.classArb,
                    group: account.group,
                    groupArb: account.groupArb,
                    name: account.name,
                    nameArb: account.nameArb,
                    balance: account.balance,
                    openingBalance: account.openingBalance,
                    type: account.type
                }))
            },
            equity: {
                total: totalEquity,
                byLevel: groupByLevel(equity),
                accounts: equity.map(account => ({
                    chart: account.chart,
                    chartArb: account.chartArb,
                    level: account.level,
                    levelArb: account.levelArb,
                    class: account.class,
                    classArb: account.classArb,
                    group: account.group,
                    groupArb: account.groupArb,
                    name: account.name,
                    nameArb: account.nameArb,
                    balance: account.balance,
                    openingBalance: account.openingBalance,
                    type: account.type
                }))
            },
            totals: {
                assets: totalAssets,
                liabilities: totalLiabilities,
                equity: totalEquity,
                liabilitiesEquity: totalLiabilitiesEquity
            }
        };
        res.status(200).json({
            success: true,
            data: balanceSheetData,
            message: 'Balance sheet fetched successfully'
        });
        return;
    }
    catch (error) {
        console.error('Error fetching balance sheet:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch balance sheet'
        });
        return;
    }
};
exports.getBalanceSheetController = getBalanceSheetController;
const getJournalFiltersController = async (req, res) => {
    try {
        const filters = await JournalsService.getJournalFiltersService();
        res.status(200).json({
            success: true,
            years: filters.years,
            periods: filters.periods,
            dateRange: filters.dateRange,
            currencies: filters.currencies,
            statuses: filters.statuses,
            message: 'Journal filters fetched successfully'
        });
    }
    catch (error) {
        console.error('Error fetching journal filters:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch journal filters'
        });
    }
};
exports.getJournalFiltersController = getJournalFiltersController;
// TEMPORARY DEBUG ENDPOINT - Add this to your routes
// export const debugJournalsController = async (req: Request, res: Response): Promise<void> => {
//     try {
//         // Get all journals without any filters
//         const journals = await Journal.find({}).lean();
//         // Get count of journals
//         const totalJournals = journals.length;
//         // Get journals with opening balance
//         const openingJournals = journals.filter(j => 
//             j.journalName === 'Opening Balance' || 
//             j.journalNameArb === 'الارصده الافتتاحيه' ||
//             j.code?.includes('OPE')
//         );
//         // Extract all entries
//         const allEntries = [];
//         journals.forEach(journal => {
//             if (journal.entries && Array.isArray(journal.entries)) {
//                 journal.entries.forEach(entry => {
//                     allEntries.push({
//                         journalId: journal._id,
//                         journalName: journal.journalName,
//                         journalCode: journal.code,
//                         ...entry
//                     });
//                 });
//             }
//         });
//         // Get entries that might be opening balances
//         const openingEntries = allEntries.filter(e => 
//             e.reference?.includes('ENT-') || 
//             e.reference === 'ENT-1' || 
//             e.reference === 'ENT-2' ||
//             e.description?.includes('Opening') ||
//             e.descriptionArb?.includes('افتتاحية')
//         );
//         res.status(200).json({
//             success: true,
//             data: {
//                 totalJournals,
//                 journals: journals.map(j => ({
//                     id: j._id,
//                     name: j.journalName,
//                     nameArb: j.journalNameArb,
//                     code: j.code,
//                     fiscalYear: j.fiscalYear,
//                     period: j.period,
//                     entriesCount: j.entries?.length || 0
//                 })),
//                 openingJournals: openingJournals.map(j => ({
//                     id: j._id,
//                     name: j.journalName,
//                     code: j.code
//                 })),
//                 totalEntries: allEntries.length,
//                 openingEntries: openingEntries.map(e => ({
//                     reference: e.reference,
//                     description: e.description,
//                     accName: e.accName,
//                     debit: e.debit,
//                     credit: e.credit
//                 }))
//             },
//             message: 'Debug data fetched successfully'
//         });
//     } catch (error: any) {
//         console.error('Error in debug endpoint:', error);
//         res.status(500).json({ 
//             success: false, 
//             message: error.message || 'Debug endpoint failed' 
//         });
//     }
// };

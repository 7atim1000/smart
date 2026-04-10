"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJournalsByFilterService = exports.deleteJournalNameService = exports.updateJournalNameService = exports.addJournalsNameService = exports.getJournalNameByIdService = exports.getJournalsNameService = exports.getJournalNameBalanceService = exports.updateJournalNameBalanceService = void 0;
const journalsName_model_1 = require("./journalsName.model");
const updateJournalNameBalanceService = async (journalsNameId, // Accept both string and ObjectId
amount, type, operation = 'add') => {
    try {
        // Convert to string if it's ObjectId
        const id = typeof journalsNameId === 'string' ? journalsNameId : journalsNameId.toString();
        const journalName = await journalsName_model_1.JournalsName.findById(id);
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
    }
    catch (error) {
        throw new Error(error.message || 'Failed to update journal name balance');
    }
};
exports.updateJournalNameBalanceService = updateJournalNameBalanceService;
// Get journal name balance
const getJournalNameBalanceService = async (id) => {
    try {
        const journalName = await journalsName_model_1.JournalsName.findById(id);
        if (!journalName) {
            throw new Error('Journal name not found');
        }
        return journalName.balance || 0;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch journal name balance');
    }
};
exports.getJournalNameBalanceService = getJournalNameBalanceService;
// ============================================
// GET ALL JOURNALS NAMES
// ============================================
const getJournalsNameService = async () => {
    try {
        const journals = await journalsName_model_1.JournalsName.find().sort({ createdAt: -1 });
        return journals;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch journals names');
    }
};
exports.getJournalsNameService = getJournalsNameService;
// ============================================
// GET SINGLE JOURNAL NAME BY ID
// ============================================
const getJournalNameByIdService = async (id) => {
    try {
        const journal = await journalsName_model_1.JournalsName.findById(id);
        if (!journal) {
            throw new Error('Journal name not found');
        }
        return journal;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch journal name');
    }
};
exports.getJournalNameByIdService = getJournalNameByIdService;
// ============================================
// ADD NEW JOURNAL NAME
// ============================================
const addJournalsNameService = async (journalData) => {
    try {
        const { journalName, journalNameArb, accName, accNameArb, code, accGroup, accGroupArb, accLevel, accLevelArb, accChart, accChartArb } = journalData;
        // Check if journal with same code already exists
        const existingJournal = await journalsName_model_1.JournalsName.findOne({ code });
        if (existingJournal) {
            throw new Error(`Journal with code ${code} already exists`);
        }
        // Check if journal with same name exists (optional)
        const existingJournalByName = await journalsName_model_1.JournalsName.findOne({
            $or: [
                { journalName: journalName },
                { journalNameArb: journalNameArb }
            ]
        });
        if (existingJournalByName) {
            throw new Error('Journal with this name already exists');
        }
        const newJournal = await journalsName_model_1.JournalsName.create({
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
    }
    catch (error) {
        throw new Error(error.message || 'Failed to add journal name');
    }
};
exports.addJournalsNameService = addJournalsNameService;
// ============================================
// UPDATE JOURNAL NAME
// ============================================
const updateJournalNameService = async (id, updateData) => {
    try {
        const journal = await journalsName_model_1.JournalsName.findById(id);
        if (!journal) {
            throw new Error('Journal name not found');
        }
        // If code is being updated, check for duplicates
        if (updateData.code && updateData.code !== journal.code) {
            const existingJournal = await journalsName_model_1.JournalsName.findOne({
                code: updateData.code,
                _id: { $ne: id }
            });
            if (existingJournal) {
                throw new Error(`Journal with code ${updateData.code} already exists`);
            }
        }
        const updatedJournal = await journalsName_model_1.JournalsName.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
        if (!updatedJournal) {
            throw new Error('Journal name not found');
        }
        return { journal: updatedJournal.toObject() };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to update journal name');
    }
};
exports.updateJournalNameService = updateJournalNameService;
// ============================================
// DELETE JOURNAL NAME
// ============================================
const deleteJournalNameService = async (id) => {
    try {
        const journal = await journalsName_model_1.JournalsName.findByIdAndDelete(id);
        if (!journal) {
            throw new Error('Journal name not found');
        }
        return { message: 'Journal name deleted successfully' };
    }
    catch (error) {
        throw new Error(error.message || 'Failed to delete journal name');
    }
};
exports.deleteJournalNameService = deleteJournalNameService;
// ============================================
// GET JOURNALS BY FILTER
// ============================================
const getJournalsByFilterService = async (filter) => {
    try {
        const query = {};
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
        const journals = await journalsName_model_1.JournalsName.find(query).sort({ createdAt: -1 });
        return journals;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch journals');
    }
};
exports.getJournalsByFilterService = getJournalsByFilterService;

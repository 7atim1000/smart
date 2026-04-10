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
exports.getJournalsByFilterController = exports.addJournalsNameController = exports.getJournalsNameController = exports.getJournalNameBalanceController = exports.updateJournalNameBalanceController = void 0;
const JournalsNameService = __importStar(require("./journalsName.service"));
// Helper function to get string param (updated to throw error)
const getStringParam = (param) => {
    if (!param) {
        throw new Error('Parameter is required');
    }
    return String(param);
};
// BALANCE CONTROLLER
const updateJournalNameBalanceController = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type, operation } = req.body;
        // Validate required fields
        if (!id) {
            res.status(400).json({
                success: false,
                message: 'Journal name ID is required'
            });
            return;
        }
        if (amount === undefined || amount === null) {
            res.status(400).json({
                success: false,
                message: 'Amount is required'
            });
            return;
        }
        if (!type || !['debit', 'credit'].includes(type)) {
            res.status(400).json({
                success: false,
                message: 'Type must be either "debit" or "credit"'
            });
            return;
        }
        if (operation && !['add', 'subtract'].includes(operation)) {
            res.status(400).json({
                success: false,
                message: 'Operation must be either "add" or "subtract"'
            });
            return;
        }
        const journalsNameId = getStringParam(id); // Now guaranteed to be string
        await JournalsNameService.updateJournalNameBalanceService(journalsNameId, Number(amount), type, operation || 'add');
        // Fetch updated journal name to return
        const updatedJournalName = await JournalsNameService.getJournalNameByIdService(journalsNameId);
        res.status(200).json({
            success: true,
            journalName: updatedJournalName,
            message: 'Journal name balance updated successfully'
        });
    }
    catch (error) {
        console.error('Error updating journal name balance:', error);
        if (error.message === 'Journal name not found' || error.message === 'Parameter is required') {
            res.status(404).json({ success: false, message: error.message });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update journal name balance'
        });
    }
};
exports.updateJournalNameBalanceController = updateJournalNameBalanceController;
const getJournalNameBalanceController = async (req, res) => {
    try {
        const { id } = req.params;
        // Ensure id is a string, not an array
        if (!id || Array.isArray(id)) {
            res.status(400).json({
                success: false,
                message: 'Invalid journal name ID format'
            });
            return;
        }
        const balance = await JournalsNameService.getJournalNameBalanceService(id);
        res.status(200).json({
            success: true,
            balance,
            message: 'Journal name balance fetched successfully'
        });
    }
    catch (error) {
        console.error('Error fetching journal name balance:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch journal name balance'
        });
    }
};
exports.getJournalNameBalanceController = getJournalNameBalanceController;
// ============================================
// GET ALL JOURNALS NAMES
// ============================================
const getJournalsNameController = async (req, res) => {
    try {
        const journals = await JournalsNameService.getJournalsNameService();
        res.status(200).json({
            success: true,
            journals,
            count: journals.length,
            message: 'Journals fetched successfully'
        });
    }
    catch (error) {
        console.error('Error fetching journals:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch journals'
        });
    }
};
exports.getJournalsNameController = getJournalsNameController;
// ============================================
// GET SINGLE JOURNAL BY ID
// ============================================
// export const getJournalNameByIdController = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { id } = req.params;
//         if (!id) {
//             res.status(400).json({
//                 success: false,
//                 message: 'Journal ID is required'
//             });
//             return;
//         }
//         const journal = await JournalsService.getJournalNameByIdService(id);
//         res.status(200).json({
//             success: true,
//             journal,
//             message: 'Journal fetched successfully'
//         });
//     } catch (error: any) {
//         console.error('Error fetching journal:', error);
//         if (error.message === 'Journal name not found') {
//             res.status(404).json({
//                 success: false,
//                 message: error.message
//             });
//             return;
//         }
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Failed to fetch journal'
//         });
//     }
// };
// ============================================
// ADD NEW JOURNAL NAME
// ============================================
const addJournalsNameController = async (req, res) => {
    try {
        const { journalName, journalNameArb, accName, accNameArb, code, accGroup, accGroupArb, accLevel, accLevelArb, accChart, accChartArb } = req.body;
        // Validate required fields
        const requiredFields = {
            journalName, journalNameArb, accName, accNameArb, code,
            accGroup, accGroupArb, accLevel, accLevelArb, accChart, accChartArb
        };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([key]) => key);
        if (missingFields.length > 0) {
            res.status(400).json({
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
            return;
        }
        const result = await JournalsNameService.addJournalsNameService({
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
        });
        res.status(201).json({
            success: true,
            journal: result.journal,
            message: 'Journal name added successfully'
        });
    }
    catch (error) {
        console.error('Error adding journal:', error);
        if (error.message.includes('already exists')) {
            res.status(409).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to add journal name'
        });
    }
};
exports.addJournalsNameController = addJournalsNameController;
// ============================================
// UPDATE JOURNAL NAME
// ============================================
// export const updateJournalNameController = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { id } = req.params;
//         const updateData = req.body;
//         if (!id) {
//             res.status(400).json({
//                 success: false,
//                 message: 'Journal ID is required'
//             });
//             return;
//         }
//         if (Object.keys(updateData).length === 0) {
//             res.status(400).json({
//                 success: false,
//                 message: 'No update data provided'
//             });
//             return;
//         }
//         const result = await JournalsService.updateJournalNameService(id, updateData);
//         res.status(200).json({
//             success: true,
//             journal: result.journal,
//             message: 'Journal name updated successfully'
//         });
//     } catch (error: any) {
//         console.error('Error updating journal:', error);
//         if (error.message === 'Journal name not found') {
//             res.status(404).json({
//                 success: false,
//                 message: error.message
//             });
//             return;
//         }
//         if (error.message.includes('already exists')) {
//             res.status(409).json({
//                 success: false,
//                 message: error.message
//             });
//             return;
//         }
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Failed to update journal name'
//         });
//     }
// };
// ============================================
// DELETE JOURNAL NAME
// ============================================
// export const deleteJournalNameController = async (req: Request, res: Response): Promise<void> => {
//     try {
//         const { id } = req.params;
//         if (!id) {
//             res.status(400).json({
//                 success: false,
//                 message: 'Journal ID is required'
//             });
//             return;
//         }
//         const result = await JournalsService.deleteJournalNameService(id);
//         res.status(200).json({
//             success: true,
//             message: result.message
//         });
//     } catch (error: any) {
//         console.error('Error deleting journal:', error);
//         if (error.message === 'Journal name not found') {
//             res.status(404).json({
//                 success: false,
//                 message: error.message
//             });
//             return;
//         }
//         res.status(500).json({
//             success: false,
//             message: error.message || 'Failed to delete journal name'
//         });
//     }
// };
// ============================================
// GET JOURNALS BY FILTER
// ============================================
const getJournalsByFilterController = async (req, res) => {
    try {
        const { accChart, accLevel, accGroup, search } = req.query;
        const filter = {
            ...(accChart && { accChart: accChart }),
            ...(accLevel && { accLevel: accLevel }),
            ...(accGroup && { accGroup: accGroup }),
            ...(search && { search: search })
        };
        const journals = await JournalsNameService.getJournalsByFilterService(filter);
        res.status(200).json({
            success: true,
            journals,
            count: journals.length,
            message: 'Journals fetched successfully'
        });
    }
    catch (error) {
        console.error('Error fetching journals by filter:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch journals'
        });
    }
};
exports.getJournalsByFilterController = getJournalsByFilterController;

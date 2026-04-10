import { Request, Response } from 'express';
import * as JournalsNameService from './journalsName.service';

// Helper function to get string param (updated to throw error)
const getStringParam = (param: any): string => {
    if (!param) {
        throw new Error('Parameter is required');
    }
    return String(param);
};

// BALANCE CONTROLLER
export const updateJournalNameBalanceController = async (req: Request, res: Response): Promise<void> => {
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
        
        await JournalsNameService.updateJournalNameBalanceService(
            journalsNameId,
            Number(amount),
            type,
            operation || 'add'
        );

        // Fetch updated journal name to return
        const updatedJournalName = await JournalsNameService.getJournalNameByIdService(journalsNameId);

        res.status(200).json({
            success: true,
            journalName: updatedJournalName,
            message: 'Journal name balance updated successfully'
        });
    } catch (error: any) {
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


export const getJournalNameBalanceController = async (req: Request, res: Response): Promise<void> => {
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
    } catch (error: any) {
        console.error('Error fetching journal name balance:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message || 'Failed to fetch journal name balance' 
        });
    }
};

// ============================================
// GET ALL JOURNALS NAMES
// ============================================
export const getJournalsNameController = async (req: Request, res: Response): Promise<void> => {
    try {
        const journals = await JournalsNameService.getJournalsNameService();

        res.status(200).json({
            success: true,
            journals,
            count: journals.length,
            message: 'Journals fetched successfully'
        });
    } catch (error: any) {
        console.error('Error fetching journals:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch journals'
        });
    }
};

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
export const addJournalsNameController = async (req: Request, res: Response): Promise<void> => {
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
        } = req.body;

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
    } catch (error: any) {
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
export const getJournalsByFilterController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { accChart, accLevel, accGroup, search } = req.query;

        const filter = {
            ...(accChart && { accChart: accChart as string }),
            ...(accLevel && { accLevel: accLevel as string }),
            ...(accGroup && { accGroup: accGroup as string }),
            ...(search && { search: search as string })
        };

        const journals = await JournalsNameService.getJournalsByFilterService(filter);

        res.status(200).json({
            success: true,
            journals,
            count: journals.length,
            message: 'Journals fetched successfully'
        });
    } catch (error: any) {
        console.error('Error fetching journals by filter:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch journals'
        });
    }
};
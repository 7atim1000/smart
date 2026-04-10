/*
The issue is that your dynamic routes with /:id are placed BEFORE your specific routes like /trial-balance and /filters. This causes Express to interpret "trial-balance" and "filters" as ID parameters.
*/

import express from 'express';
import * as JournalsController from './journals.controller';
import { protectRoute } from '../../middleware/authentication';



const router = express.Router();

// Apply protection to all routes
router.use(protectRoute);

// ============================================
// REPORTING ROUTES - MUST COME FIRST (most specific)
// ============================================
router.get('/trial-balance', JournalsController.getTrialBalanceController);
router.get('/filters', JournalsController.getJournalFiltersController);

router.get('/balance-sheet', JournalsController.getBalanceSheetController);

// ============================================
// SEARCH/QUERY ROUTES - COME NEXT (specific queries)
// ============================================
router.get('/search/by-name', JournalsController.getJournalsByJournalNameController);
router.get('/by-account', JournalsController.getJournalsByAccountController);
router.get('/code/:code', JournalsController.getJournalByCodeController);
router.get('/partner/:partnerId', JournalsController.getJournalsByPartnerController);

// ============================================
// COLLECTION ROUTES
// ============================================
router.get('/', JournalsController.getJournalsController);
router.post('/', JournalsController.addJournalController);

// ============================================
// SINGLE RESOURCE ROUTES (with :id) - MUST COME LAST
// ============================================
router.get('/:id', JournalsController.getJournalByIdController);
router.put('/:id', JournalsController.updateJournalController);
router.put('/:id/close', JournalsController.closeJournalController);
router.delete('/:id', JournalsController.deleteJournalController);

export default router;

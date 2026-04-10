import express from 'express';
import * as JournalsNameController from './journalsName.controller';
import { protectRoute } from '../../middleware/authentication';

const router = express.Router();

// BALANCE
router.get('/:id/balance', JournalsNameController.getJournalNameBalanceController);
// GET routes
router.get('/', protectRoute, JournalsNameController.getJournalsNameController);
// router.get('/filter', JournalsController.getJournalsByFilterController);
// router.get('/:id', JournalsController.getJournalNameByIdController);

// POST routes
router.post('/', protectRoute, JournalsNameController.addJournalsNameController);

// PUT routes
// router.put('/:id', JournalsController.updateJournalNameController);

// DELETE routes
// router.delete('/:id', JournalsController.deleteJournalNameController);

export default router;
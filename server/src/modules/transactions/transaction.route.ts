import express from 'express';
import * as TransactionController from './transaction.controller';
import { protectRoute } from '../../middleware/authentication';

const router = express.Router();

// All transaction routes require authentication
router.use(protectRoute);

// Transaction CRUD operations
router.post('/', TransactionController.addTransactionController);
router.get('/', TransactionController.getTransactionsController); // Get all with pagination

router.get('/stats', TransactionController.getTransactionStatsController); // Statistics
router.get('/:transactionId', TransactionController.getTransactionByIdController); // Get single
// router.put('/:transactionId', TransactionController.updateTransactionController); // Update
router.delete('/:transactionId', TransactionController.deleteTransactionController); // Delete


export default router;



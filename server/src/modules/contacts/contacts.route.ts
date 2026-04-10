import express from 'express';
import * as ContactsController from './contacts.controller';
import { protectRoute } from '../../middleware/authentication';


const router = express.Router();

// Apply authentication middleware to all routes
router.use(protectRoute);

// ============================================
// CONTACT ROUTES
// ============================================

router.patch('/:id/balance', ContactsController.updateCustomerBalance);


// GET routes
router.get('/', ContactsController.getContactsController);
router.get('/:id', ContactsController.getContactByIdController);

// POST routes
router.post('/', ContactsController.addContactController);

// PUT routes
router.put('/:id', ContactsController.updateContactController);

// PATCH routes (for bulk operations)
// router.patch('/bulk', ContactsController.bulkUpdateContactsController);

// DELETE routes
router.delete('/:id', ContactsController.deleteContactController);

export default router;
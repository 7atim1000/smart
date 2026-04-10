import * as InvoiceController from './invoice.controller';
import express from 'express' ;
import { protectRoute } from '../../middleware/authentication';



const router = express.Router();

// Apply authentication middleware to all routes
router.use(protectRoute);

router.post('/', InvoiceController.addInvoiceController) ;
router.get('/', InvoiceController.getInvoicesController) ;
router.get('/:id', InvoiceController.getInvoiceByIdController);
router.patch('/:id/status', InvoiceController.updateInvoiceStatusController);


router.post('/orderCustomer', InvoiceController.getStatementCustomer);
router.post('/orderSupplier', InvoiceController.getStatementSupplier);


export default router ;
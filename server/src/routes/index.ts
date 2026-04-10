import express from 'express' ;
import authRoute from '../modules/auth/auth.route';
import chartRoute from '../modules/chartOfAccounts/chartOfAccounts.route';
import journalsNameRoute from '../modules/journalsName/journalsName.route' ;
import journalsRoute from '../modules/journals/journals.route' ;
import contactsRoute from '../modules/contacts/contacts.route';
import categoriesRoute from '../modules/categories/categories.route';
import invoicesRoute from '../modules/invoices/invoice.route'
import transactionsRoute from '../modules/transactions/transaction.route'
import dashboardRoute from '../modules/dashboard/dash.route' ;

const router = express.Router();

router.use('/auth', authRoute);
router.use('/chart', chartRoute);
router.use('/journalsName', journalsNameRoute);
router.use('/journals', journalsRoute);

router.use('/contacts', contactsRoute);
router.use('/categories', categoriesRoute);

router.use('/invoices', invoicesRoute);
router.use('/transactions', transactionsRoute);

router.use('/dashboard', dashboardRoute);

export default router ;
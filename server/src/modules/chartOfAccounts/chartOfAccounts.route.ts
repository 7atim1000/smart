import express from 'express';
import * as ChartController from './chartOfAccounts.controller';

const router = express.Router();

// ============================================
// INSERT ROUTES (POST)
// ============================================

// Chart routes
router.post('/', ChartController.insertChartOfAccountsController); // POST /api/chart-of-accounts

// Level routes
router.post('/:chartId/level', ChartController.addLevelController); // POST /api/chart-of-accounts/:chartId/level

// Class routes
router.post('/:chartId/level/:levelId/class', ChartController.addClassController); // POST /api/chart-of-accounts/:chartId/level/:levelId/class

// Group routes
router.post('/:chartId/level/:levelId/class/:classId/group', ChartController.addGroupController); // POST /api/chart-of-accounts/:chartId/level/:levelId/class/:classId/group

// Account routes
router.post('/:chartId/level/:levelId/class/:classId/group/:groupId/account', ChartController.addAccountController); // POST /api/chart-of-accounts/:chartId/level/:levelId/class/:classId/group/:groupId/account


// ============================================
// GET ROUTES (FETCH)
// ============================================

// Chart routes
router.get('/', ChartController.getAllChartsController); // GET /api/chart-of-accounts
router.get('/:chartId', ChartController.getChartByIdController); // GET /api/chart-of-accounts/:chartId
router.get('/:chartId/full', ChartController.getFullChartHierarchyController); // GET /api/chart-of-accounts/:chartId/full

// Level routes
router.get('/:chartId/levels', ChartController.getLevelsController); // GET /api/chart-of-accounts/:chartId/levels
router.get('/:chartId/levels/:levelId', ChartController.getLevelByIdController); // GET /api/chart-of-accounts/:chartId/levels/:levelId

// Class routes
router.get('/:chartId/levels/:levelId/classes', ChartController.getClassesController); // GET /api/chart-of-accounts/:chartId/levels/:levelId/classes
router.get('/:chartId/levels/:levelId/classes/:classId', ChartController.getClassByIdController); // GET /api/chart-of-accounts/:chartId/levels/:levelId/classes/:classId

// Group routes
router.get('/:chartId/levels/:levelId/classes/:classId/groups', ChartController.getGroupsController); // GET /api/chart-of-accounts/:chartId/levels/:levelId/classes/:classId/groups
router.get('/:chartId/levels/:levelId/classes/:classId/groups/:groupId', ChartController.getGroupByIdController); // GET /api/chart-of-accounts/:chartId/levels/:levelId/classes/:classId/groups/:groupId

// Account routes
router.get('/:chartId/levels/:levelId/classes/:classId/groups/:groupId/accounts', ChartController.getAccountsController); // GET /api/chart-of-accounts/:chartId/levels/:levelId/classes/:classId/groups/:groupId/accounts
router.get('/:chartId/levels/:levelId/classes/:classId/groups/:groupId/accounts/:accountId', ChartController.getAccountByIdController); // GET /api/chart-of-accounts/:chartId/levels/:levelId/classes/:classId/groups/:groupId/accounts/:accountId

// Add this route
router.get('/accounts/all', ChartController.getAllAccountsController); // GET /api/chart/accounts/all

// ============================================
// UPDATE ROUTES (PUT)
// ============================================

// Chart routes
// router.put('/:chartId', ChartController.updateChartController);

// Level routes
// router.put('/:chartId/levels/:levelId', ChartController.updateLevelController);

// Class routes
// router.put('/:chartId/levels/:levelId/classes/:classId', ChartController.updateClassController);

// Group routes
// router.put('/:chartId/levels/:levelId/classes/:classId/groups/:groupId', ChartController.updateGroupController);

// Account routes
// router.put('/:chartId/levels/:levelId/classes/:classId/groups/:groupId/accounts/:accountId', ChartController.updateAccountController);


// ============================================
// DELETE ROUTES (DELETE)
// ============================================

// Chart routes
// router.delete('/:chartId', ChartController.deleteChartController);

// Level routes
// router.delete('/:chartId/levels/:levelId', ChartController.deleteLevelController);

// Class routes
// router.delete('/:chartId/levels/:levelId/classes/:classId', ChartController.deleteClassController);

// Group routes
// router.delete('/:chartId/levels/:levelId/classes/:classId/groups/:groupId', ChartController.deleteGroupController);

// Account routes
// router.delete('/:chartId/levels/:levelId/classes/:classId/groups/:groupId/accounts/:accountId', ChartController.deleteAccountController);

export default router;


/*
Why URL Parameters are Better
Aspect	URL Parameters	Request Body
RESTful Standard	✅ Follows REST	❌ Violates REST
Resource Identification	✅ URL identifies exact resource	❌ Unclear from URL alone
Self-documenting	✅ URL tells the full story	❌ Need to read body
Caching	✅ URLs can be cached	❌ Body not cached
*/



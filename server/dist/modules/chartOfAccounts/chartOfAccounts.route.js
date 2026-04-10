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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ChartController = __importStar(require("./chartOfAccounts.controller"));
const router = express_1.default.Router();
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
exports.default = router;
/*
Why URL Parameters are Better
Aspect	URL Parameters	Request Body
RESTful Standard	✅ Follows REST	❌ Violates REST
Resource Identification	✅ URL identifies exact resource	❌ Unclear from URL alone
Self-documenting	✅ URL tells the full story	❌ Need to read body
Caching	✅ URLs can be cached	❌ Body not cached
*/

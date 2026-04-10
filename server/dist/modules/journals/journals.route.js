"use strict";
/*
The issue is that your dynamic routes with /:id are placed BEFORE your specific routes like /trial-balance and /filters. This causes Express to interpret "trial-balance" and "filters" as ID parameters.
*/
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
const JournalsController = __importStar(require("./journals.controller"));
const authentication_1 = require("../../middleware/authentication");
const router = express_1.default.Router();
// Apply protection to all routes
router.use(authentication_1.protectRoute);
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
exports.default = router;

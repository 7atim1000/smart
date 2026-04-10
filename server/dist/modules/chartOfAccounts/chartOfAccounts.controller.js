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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAccountsController = exports.getFullChartHierarchyController = exports.getAccountByIdController = exports.getAccountsController = exports.getGroupByIdController = exports.getGroupsController = exports.getClassByIdController = exports.getClassesController = exports.getLevelByIdController = exports.getLevelsController = exports.getChartByIdController = exports.getAllChartsController = exports.addAccountController = exports.addGroupController = exports.addClassController = exports.addLevelController = exports.insertChartOfAccountsController = void 0;
const ChartService = __importStar(require("./chartOfAccounts.service"));
// ============================================
// INSERT CHART OF ACCOUNTS (ROOT)
// ============================================
const insertChartOfAccountsController = async (req, res) => {
    try {
        const { name, nameArb, code, type } = req.body;
        // Validate required fields
        if (!name || !nameArb || !code || !type) {
            res.status(400).json({
                success: false,
                message: 'All fields (name, nameArb, code, type) are required'
            });
            return;
        }
        // Connect service
        const { chart } = await ChartService.insertChartOfAccountsService({
            name,
            nameArb,
            code,
            type
        });
        res.status(201).json({
            success: true,
            chartData: chart,
            message: 'Chart added successfully'
        });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.insertChartOfAccountsController = insertChartOfAccountsController;
// ============================================
// ADD LEVEL (LEVEL 1)
// ============================================
const addLevelController = async (req, res) => {
    try {
        // ✅ Cast params to string
        const chartId = req.params.chartId;
        const { name, nameArb, code } = req.body;
        // Validate required fields
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        if (!name || !nameArb || !code) {
            res.status(400).json({
                success: false,
                message: 'All fields (name, nameArb, code) are required'
            });
            return;
        }
        // Connect service
        const { chart } = await ChartService.addLevelToChartService({
            chartOfAccountId: chartId,
            name,
            nameArb,
            code
        });
        res.status(201).json({
            success: true,
            chartData: chart,
            message: 'Level added successfully'
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.addLevelController = addLevelController;
// ============================================
// ADD CLASS (LEVEL 2)
// ============================================
// The same TypeScript error occurs because req.params returns string | string[]. Here's the fixed controller with proper type casting:
const addClassController = async (req, res) => {
    try {
        // ✅ Cast params to string
        const chartId = req.params.chartId;
        const levelId = req.params.levelId;
        const { name, nameArb, code } = req.body;
        // Validate required fields
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        if (!levelId) {
            res.status(400).json({
                success: false,
                message: 'Level ID is required in URL'
            });
            return;
        }
        if (!name || !nameArb || !code) {
            res.status(400).json({
                success: false,
                message: 'All fields (name, nameArb, code) are required'
            });
            return;
        }
        // Connect service
        const { chart } = await ChartService.addClassToLevelService({
            chartOfAccountId: chartId,
            levelId,
            name,
            nameArb,
            code
        });
        res.status(201).json({
            success: true,
            chartData: chart,
            message: 'Class added successfully'
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found' || error.message === 'Level not found in this chart') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.addClassController = addClassController;
// ============================================
// ADD GROUP (LEVEL 3)
// ============================================
const addGroupController = async (req, res) => {
    try {
        // ✅ Extract params and ensure they are strings
        const chartId = req.params.chartId;
        const levelId = req.params.levelId;
        const classId = req.params.classId;
        const { name, nameArb, code } = req.body;
        // Validate required fields
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        if (!levelId) {
            res.status(400).json({
                success: false,
                message: 'Level ID is required in URL'
            });
            return;
        }
        if (!classId) {
            res.status(400).json({
                success: false,
                message: 'Class ID is required in URL'
            });
            return;
        }
        if (!name || !nameArb || !code) {
            res.status(400).json({
                success: false,
                message: 'All fields (name, nameArb, code) are required'
            });
            return;
        }
        // Connect service
        const { chart } = await ChartService.addGroupToClassService({
            chartOfAccountId: chartId,
            levelId,
            classId,
            name,
            nameArb,
            code
        });
        res.status(201).json({
            success: true,
            chartData: chart,
            message: 'Group added successfully'
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found' ||
            error.message === 'Level not found in this chart' ||
            error.message === 'Class not found in this level') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.addGroupController = addGroupController;
// ============================================
// ADD ACCOUNT (LEVEL 4)
// ============================================
const addAccountController = async (req, res) => {
    try {
        // ✅ Cast params to string
        const chartId = req.params.chartId;
        const levelId = req.params.levelId;
        const classId = req.params.classId;
        const groupId = req.params.groupId;
        const { name, nameArb, code, type } = req.body;
        // Validate required fields
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        if (!levelId) {
            res.status(400).json({
                success: false,
                message: 'Level ID is required in URL'
            });
            return;
        }
        if (!classId) {
            res.status(400).json({
                success: false,
                message: 'Class ID is required in URL'
            });
            return;
        }
        if (!groupId) {
            res.status(400).json({
                success: false,
                message: 'Group ID is required in URL'
            });
            return;
        }
        if (!name || !nameArb || !code || !type) {
            res.status(400).json({
                success: false,
                message: 'All fields (name, nameArb, code, type) are required'
            });
            return;
        }
        // Connect service
        const { chart } = await ChartService.addAccountToGroupService({
            chartOfAccountId: chartId,
            levelId,
            classId,
            groupId,
            name,
            nameArb,
            code,
            type
        });
        res.status(201).json({
            success: true,
            chartData: chart,
            message: 'Account added successfully'
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found' ||
            error.message === 'Level not found in this chart' ||
            error.message === 'Class not found in this level' ||
            error.message === 'Group not found in this class') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.addAccountController = addAccountController;
// ============================================
// GET ALL CHARTS
// ============================================
const getAllChartsController = async (req, res) => {
    try {
        const charts = await ChartService.getChartOfAccountsService();
        res.status(200).json({
            success: true,
            charts,
            count: charts.length
        });
    }
    catch (error) {
        console.log(error.message);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getAllChartsController = getAllChartsController;
// ============================================
// GET SINGLE CHART BY ID
// ============================================
const getChartByIdController = async (req, res) => {
    try {
        const chartId = req.params.chartId;
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        const chart = await ChartService.getChartByIdService(chartId);
        res.status(200).json({
            success: true,
            chart
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getChartByIdController = getChartByIdController;
// ============================================
// GET ALL LEVELS IN A CHART
// ============================================
const getLevelsController = async (req, res) => {
    try {
        const chartId = req.params.chartId;
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        const levels = await ChartService.getLevelsByChartIdService(chartId);
        res.status(200).json({
            success: true,
            levels,
            count: levels.length
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getLevelsController = getLevelsController;
// ============================================
// GET SINGLE LEVEL BY ID
// ============================================
const getLevelByIdController = async (req, res) => {
    try {
        const chartId = req.params.chartId;
        const levelId = req.params.levelId;
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        if (!levelId) {
            res.status(400).json({
                success: false,
                message: 'Level ID is required in URL'
            });
            return;
        }
        const level = await ChartService.getLevelByIdService(chartId, levelId);
        res.status(200).json({
            success: true,
            level
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found' || error.message === 'Level not found') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getLevelByIdController = getLevelByIdController;
// ============================================
// GET ALL CLASSES IN A LEVEL
// ============================================
const getClassesController = async (req, res) => {
    try {
        const chartId = req.params.chartId;
        const levelId = req.params.levelId;
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        if (!levelId) {
            res.status(400).json({
                success: false,
                message: 'Level ID is required in URL'
            });
            return;
        }
        const classes = await ChartService.getClassesByLevelIdService(chartId, levelId);
        res.status(200).json({
            success: true,
            classes,
            count: classes.length
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found' || error.message === 'Level not found') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getClassesController = getClassesController;
// ============================================
// GET SINGLE CLASS BY ID
// ============================================
const getClassByIdController = async (req, res) => {
    try {
        const chartId = req.params.chartId;
        const levelId = req.params.levelId;
        const classId = req.params.classId;
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        if (!levelId) {
            res.status(400).json({
                success: false,
                message: 'Level ID is required in URL'
            });
            return;
        }
        if (!classId) {
            res.status(400).json({
                success: false,
                message: 'Class ID is required in URL'
            });
            return;
        }
        const classObj = await ChartService.getClassByIdService(chartId, levelId, classId);
        res.status(200).json({
            success: true,
            class: classObj
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found' ||
            error.message === 'Level not found' ||
            error.message === 'Class not found') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getClassByIdController = getClassByIdController;
// ============================================
// GET ALL GROUPS IN A CLASS
// ============================================
const getGroupsController = async (req, res) => {
    try {
        const chartId = req.params.chartId;
        const levelId = req.params.levelId;
        const classId = req.params.classId;
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        if (!levelId) {
            res.status(400).json({
                success: false,
                message: 'Level ID is required in URL'
            });
            return;
        }
        if (!classId) {
            res.status(400).json({
                success: false,
                message: 'Class ID is required in URL'
            });
            return;
        }
        const groups = await ChartService.getGroupsByClassIdService(chartId, levelId, classId);
        res.status(200).json({
            success: true,
            groups,
            count: groups.length
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found' ||
            error.message === 'Level not found' ||
            error.message === 'Class not found') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getGroupsController = getGroupsController;
// ============================================
// GET SINGLE GROUP BY ID
// ============================================
const getGroupByIdController = async (req, res) => {
    try {
        const chartId = req.params.chartId;
        const levelId = req.params.levelId;
        const classId = req.params.classId;
        const groupId = req.params.groupId;
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        if (!levelId) {
            res.status(400).json({
                success: false,
                message: 'Level ID is required in URL'
            });
            return;
        }
        if (!classId) {
            res.status(400).json({
                success: false,
                message: 'Class ID is required in URL'
            });
            return;
        }
        if (!groupId) {
            res.status(400).json({
                success: false,
                message: 'Group ID is required in URL'
            });
            return;
        }
        const group = await ChartService.getGroupByIdService(chartId, levelId, classId, groupId);
        res.status(200).json({
            success: true,
            group
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found' ||
            error.message === 'Level not found' ||
            error.message === 'Class not found' ||
            error.message === 'Group not found') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getGroupByIdController = getGroupByIdController;
// ============================================
// GET ALL ACCOUNTS IN A GROUP
// ============================================
const getAccountsController = async (req, res) => {
    try {
        const chartId = req.params.chartId;
        const levelId = req.params.levelId;
        const classId = req.params.classId;
        const groupId = req.params.groupId;
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        if (!levelId) {
            res.status(400).json({
                success: false,
                message: 'Level ID is required in URL'
            });
            return;
        }
        if (!classId) {
            res.status(400).json({
                success: false,
                message: 'Class ID is required in URL'
            });
            return;
        }
        if (!groupId) {
            res.status(400).json({
                success: false,
                message: 'Group ID is required in URL'
            });
            return;
        }
        const accounts = await ChartService.getAccountsByGroupIdService(chartId, levelId, classId, groupId);
        res.status(200).json({
            success: true,
            accounts,
            count: accounts.length
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found' ||
            error.message === 'Level not found' ||
            error.message === 'Class not found' ||
            error.message === 'Group not found') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getAccountsController = getAccountsController;
// ============================================
// GET SINGLE ACCOUNT BY ID
// ============================================
const getAccountByIdController = async (req, res) => {
    try {
        const chartId = req.params.chartId;
        const levelId = req.params.levelId;
        const classId = req.params.classId;
        const groupId = req.params.groupId;
        const accountId = req.params.accountId;
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        if (!levelId) {
            res.status(400).json({
                success: false,
                message: 'Level ID is required in URL'
            });
            return;
        }
        if (!classId) {
            res.status(400).json({
                success: false,
                message: 'Class ID is required in URL'
            });
            return;
        }
        if (!groupId) {
            res.status(400).json({
                success: false,
                message: 'Group ID is required in URL'
            });
            return;
        }
        if (!accountId) {
            res.status(400).json({
                success: false,
                message: 'Account ID is required in URL'
            });
            return;
        }
        const account = await ChartService.getAccountByIdService(chartId, levelId, classId, groupId, accountId);
        res.status(200).json({
            success: true,
            account
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found' ||
            error.message === 'Level not found' ||
            error.message === 'Class not found' ||
            error.message === 'Group not found' ||
            error.message === 'Account not found') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getAccountByIdController = getAccountByIdController;
// ============================================
// GET FULL CHART HIERARCHY
// ============================================
const getFullChartHierarchyController = async (req, res) => {
    try {
        const chartId = req.params.chartId;
        if (!chartId) {
            res.status(400).json({
                success: false,
                message: 'Chart ID is required in URL'
            });
            return;
        }
        const chart = await ChartService.getFullChartHierarchyService(chartId);
        res.status(200).json({
            success: true,
            chart
        });
    }
    catch (error) {
        console.log(error.message);
        if (error.message === 'Chart not found') {
            res.status(404).json({
                success: false,
                message: error.message
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
exports.getFullChartHierarchyController = getFullChartHierarchyController;
// can create a single function to fetch all accounts directly without going through the hierarchy step-by-step. Here's how:
// ============================================
// GET ALL ACCOUNTS CONTROLLER
// ============================================
const getAllAccountsController = async (req, res) => {
    try {
        const { search } = req.query;
        let accounts;
        if (search) {
            accounts = await ChartService.searchAccountsService(search);
        }
        else {
            accounts = await ChartService.getAllAccountsService();
        }
        res.status(200).json({
            success: true,
            accounts,
            count: accounts.length,
            message: 'Accounts fetched successfully'
        });
    }
    catch (error) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch accounts'
        });
    }
};
exports.getAllAccountsController = getAllAccountsController;

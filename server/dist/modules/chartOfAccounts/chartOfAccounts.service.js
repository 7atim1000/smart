"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAccountsService = exports.getAllAccountsService = exports.getFullChartHierarchyService = exports.getAccountByIdService = exports.getAccountsByGroupIdService = exports.getGroupByIdService = exports.getGroupsByClassIdService = exports.getClassByIdService = exports.getClassesByLevelIdService = exports.getLevelByIdService = exports.getLevelsByChartIdService = exports.getChartByIdService = exports.getChartOfAccountsService = exports.addAccountToGroupService = exports.addGroupToClassService = exports.addClassToLevelService = exports.addLevelToChartService = exports.insertChartOfAccountsService = void 0;
const chartOfAccounts_model_1 = require("./chartOfAccounts.model");
// ============================================
// INSERT CHART OF ACCOUNTS (ROOT)
// ============================================
const insertChartOfAccountsService = async (chartData) => {
    const { name, nameArb, code, type } = chartData;
    // Check if chart name already exists
    const existingChart = await chartOfAccounts_model_1.ChartOfAccounts.findOne({ name });
    if (existingChart) {
        throw new Error(`Chart "${name}" already exists`);
    }
    const newChart = await chartOfAccounts_model_1.ChartOfAccounts.create({
        name,
        nameArb,
        code,
        type,
        level: [] // Initialize empty levels array
    });
    return { chart: newChart.toObject() };
};
exports.insertChartOfAccountsService = insertChartOfAccountsService;
// ============================================
// INSERT LEVEL (LEVEL 1)
// ============================================
const addLevelToChartService = async (levelData) => {
    const { chartOfAccountId, name, nameArb, code } = levelData;
    // Find the chart
    const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartOfAccountId);
    if (!chart) {
        throw new Error('Chart not found');
    }
    // Check if level name already exists in this chart
    const existingLevel = chart.level?.find((l) => l.name === name);
    if (existingLevel) {
        throw new Error(`Level "${name}" already exists in this chart`);
    }
    // Create new level
    const newLevel = {
        name,
        nameArb,
        code,
        class: [] // Initialize empty classes array
    };
    // Initialize levels array if it doesn't exist
    if (!chart.level) {
        chart.level = [];
    }
    // Add level to chart
    chart.level.push(newLevel);
    await chart.save();
    return { chart: chart.toObject() };
};
exports.addLevelToChartService = addLevelToChartService;
// ============================================
// INSERT CLASS (LEVEL 2)
// ============================================
const addClassToLevelService = async (classData) => {
    const { chartOfAccountId, levelId, name, nameArb, code } = classData;
    // Find the chart
    const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartOfAccountId);
    if (!chart) {
        throw new Error('Chart not found');
    }
    // Find the level
    const level = chart.level?.find((l) => l._id?.toString() === levelId);
    if (!level) {
        throw new Error('Level not found in this chart');
    }
    // Check if class name already exists in this level
    const existingClass = level.class?.find((c) => c.name === name);
    if (existingClass) {
        throw new Error(`Class "${name}" already exists in this level`);
    }
    // Create new class
    const newClass = {
        name,
        nameArb,
        code,
        group: [] // Initialize empty groups array
    };
    // Initialize classes array if it doesn't exist
    if (!level.class) {
        level.class = [];
    }
    // Add class to level
    level.class.push(newClass);
    await chart.save();
    return { chart: chart.toObject() };
};
exports.addClassToLevelService = addClassToLevelService;
// ============================================
// INSERT GROUP (LEVEL 3)
// ============================================
const addGroupToClassService = async (groupData) => {
    const { chartOfAccountId, levelId, classId, name, nameArb, code } = groupData;
    // Find the chart
    const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartOfAccountId);
    if (!chart) {
        throw new Error('Chart not found');
    }
    // Find the level
    const level = chart.level?.find((l) => l._id?.toString() === levelId);
    if (!level) {
        throw new Error('Level not found in this chart');
    }
    // Find the class
    const classObj = level.class?.find((c) => c._id?.toString() === classId);
    if (!classObj) {
        throw new Error('Class not found in this level');
    }
    // Check if group name already exists in this class
    const existingGroup = classObj.group?.find((g) => g.name === name);
    if (existingGroup) {
        throw new Error(`Group "${name}" already exists in this class`);
    }
    // Create new group
    const newGroup = {
        name,
        nameArb,
        code,
        account: [] // Initialize empty accounts array
    };
    // Initialize groups array if it doesn't exist
    if (!classObj.group) {
        classObj.group = [];
    }
    // Add group to class
    classObj.group.push(newGroup);
    await chart.save();
    return { chart: chart.toObject() };
};
exports.addGroupToClassService = addGroupToClassService;
// ============================================
// INSERT ACCOUNT (LEVEL 4)
// ============================================
const addAccountToGroupService = async (accountData) => {
    const { chartOfAccountId, levelId, classId, groupId, name, nameArb, code, type } = accountData;
    // Find the chart
    const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartOfAccountId);
    if (!chart) {
        throw new Error('Chart not found');
    }
    // Find the level
    const level = chart.level?.find((l) => l._id?.toString() === levelId);
    if (!level) {
        throw new Error('Level not found in this chart');
    }
    // Find the class
    const classObj = level.class?.find((c) => c._id?.toString() === classId);
    if (!classObj) {
        throw new Error('Class not found in this level');
    }
    // Find the group
    const group = classObj.group?.find((g) => g._id?.toString() === groupId);
    if (!group) {
        throw new Error('Group not found in this class');
    }
    // Check if account name already exists in this group
    const existingAccount = group.account?.find((a) => a.name === name);
    if (existingAccount) {
        throw new Error(`Account "${name}" already exists in this group`);
    }
    // Create new account
    const newAccount = {
        name,
        nameArb,
        code,
        type
    };
    // Initialize accounts array if it doesn't exist
    if (!group.account) {
        group.account = [];
    }
    // Add account to group
    group.account.push(newAccount);
    await chart.save();
    return { chart: chart.toObject() };
};
exports.addAccountToGroupService = addAccountToGroupService;
// ============================================
// GET ALL CHARTS
// ============================================
const getChartOfAccountsService = async () => {
    try {
        const chartOfAccounts = await chartOfAccounts_model_1.ChartOfAccounts.find().sort({ createdAt: 1 });
        return chartOfAccounts;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getChartOfAccountsService = getChartOfAccountsService;
// ============================================
// GET SINGLE CHART BY ID
// ============================================
const getChartByIdService = async (chartId) => {
    try {
        const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        return chart;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getChartByIdService = getChartByIdService;
// ============================================
// GET ALL LEVELS IN A CHART
// ============================================
const getLevelsByChartIdService = async (chartId) => {
    try {
        const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        return chart.level || [];
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getLevelsByChartIdService = getLevelsByChartIdService;
// ============================================
// GET SINGLE LEVEL BY ID
// ============================================
const getLevelByIdService = async (chartId, levelId) => {
    try {
        const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        const level = chart.level?.find(l => l._id?.toString() === levelId);
        if (!level) {
            throw new Error('Level not found');
        }
        return level;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getLevelByIdService = getLevelByIdService;
// ============================================
// GET ALL CLASSES IN A LEVEL
// ============================================
const getClassesByLevelIdService = async (chartId, levelId) => {
    try {
        const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        const level = chart.level?.find(l => l._id?.toString() === levelId);
        if (!level) {
            throw new Error('Level not found');
        }
        return level.class || [];
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getClassesByLevelIdService = getClassesByLevelIdService;
// ============================================
// GET SINGLE CLASS BY ID
// ============================================
const getClassByIdService = async (chartId, levelId, classId) => {
    try {
        const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        const level = chart.level?.find(l => l._id?.toString() === levelId);
        if (!level) {
            throw new Error('Level not found');
        }
        const classObj = level.class?.find(c => c._id?.toString() === classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        return classObj;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getClassByIdService = getClassByIdService;
// ============================================
// GET ALL GROUPS IN A CLASS
// ============================================
const getGroupsByClassIdService = async (chartId, levelId, classId) => {
    try {
        const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        const level = chart.level?.find(l => l._id?.toString() === levelId);
        if (!level) {
            throw new Error('Level not found');
        }
        const classObj = level.class?.find(c => c._id?.toString() === classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        return classObj.group || [];
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getGroupsByClassIdService = getGroupsByClassIdService;
// ============================================
// GET SINGLE GROUP BY ID
// ============================================
const getGroupByIdService = async (chartId, levelId, classId, groupId) => {
    try {
        const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        const level = chart.level?.find(l => l._id?.toString() === levelId);
        if (!level) {
            throw new Error('Level not found');
        }
        const classObj = level.class?.find(c => c._id?.toString() === classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        const group = classObj.group?.find(g => g._id?.toString() === groupId);
        if (!group) {
            throw new Error('Group not found');
        }
        return group;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getGroupByIdService = getGroupByIdService;
// ============================================
// GET ALL ACCOUNTS IN A GROUP
// ============================================
const getAccountsByGroupIdService = async (chartId, levelId, classId, groupId) => {
    try {
        const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        const level = chart.level?.find(l => l._id?.toString() === levelId);
        if (!level) {
            throw new Error('Level not found');
        }
        const classObj = level.class?.find(c => c._id?.toString() === classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        const group = classObj.group?.find(g => g._id?.toString() === groupId);
        if (!group) {
            throw new Error('Group not found');
        }
        return group.account || [];
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getAccountsByGroupIdService = getAccountsByGroupIdService;
// ============================================
// GET SINGLE ACCOUNT BY ID
// ============================================
const getAccountByIdService = async (chartId, levelId, classId, groupId, accountId) => {
    try {
        const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        const level = chart.level?.find(l => l._id?.toString() === levelId);
        if (!level) {
            throw new Error('Level not found');
        }
        const classObj = level.class?.find(c => c._id?.toString() === classId);
        if (!classObj) {
            throw new Error('Class not found');
        }
        const group = classObj.group?.find(g => g._id?.toString() === groupId);
        if (!group) {
            throw new Error('Group not found');
        }
        const account = group.account?.find(a => a._id?.toString() === accountId);
        if (!account) {
            throw new Error('Account not found');
        }
        return account;
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getAccountByIdService = getAccountByIdService;
// ============================================
// GET FULL HIERARCHY (Chart with all nested data)
// ============================================
const getFullChartHierarchyService = async (chartId) => {
    try {
        const chart = await chartOfAccounts_model_1.ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        return chart; // Returns full nested structure
    }
    catch (error) {
        throw new Error(error.message);
    }
};
exports.getFullChartHierarchyService = getFullChartHierarchyService;
// can create a single function to fetch all accounts directly without going through the hierarchy step-by-step. Here's how:
// ============================================
// GET ALL ACCOUNTS (FLATTENED)
// ============================================
const getAllAccountsService = async () => {
    try {
        const charts = await chartOfAccounts_model_1.ChartOfAccounts.find();
        const allAccounts = [];
        charts.forEach(chart => {
            chart.level?.forEach(level => {
                level.class?.forEach(classObj => {
                    classObj.group?.forEach(group => {
                        group.account?.forEach(account => {
                            allAccounts.push({
                                _id: account._id,
                                name: account.name,
                                nameArb: account.nameArb,
                                code: account.code,
                                type: account.type,
                                // Include parent hierarchy
                                group: {
                                    _id: group._id,
                                    name: group.name,
                                    nameArb: group.nameArb,
                                    code: group.code
                                },
                                class: {
                                    _id: classObj._id,
                                    name: classObj.name,
                                    nameArb: classObj.nameArb,
                                    code: classObj.code
                                },
                                level: {
                                    _id: level._id,
                                    name: level.name,
                                    nameArb: level.nameArb,
                                    code: level.code
                                },
                                chart: {
                                    _id: chart._id,
                                    name: chart.name,
                                    nameArb: chart.nameArb,
                                    code: chart.code,
                                    type: chart.type
                                }
                            });
                        });
                    });
                });
            });
        });
        return allAccounts;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to fetch accounts');
    }
};
exports.getAllAccountsService = getAllAccountsService;
// ============================================
// GET ACCOUNTS WITH SEARCH
// ============================================
const searchAccountsService = async (searchTerm) => {
    try {
        const charts = await chartOfAccounts_model_1.ChartOfAccounts.find();
        const allAccounts = [];
        const searchLower = searchTerm.toLowerCase();
        charts.forEach(chart => {
            chart.level?.forEach(level => {
                level.class?.forEach(classObj => {
                    classObj.group?.forEach(group => {
                        group.account?.forEach(account => {
                            // Apply search filter
                            if (searchTerm === '' ||
                                account.name.toLowerCase().includes(searchLower) ||
                                account.nameArb.includes(searchTerm) ||
                                account.code.toLowerCase().includes(searchLower)) {
                                allAccounts.push({
                                    _id: account._id,
                                    name: account.name,
                                    nameArb: account.nameArb,
                                    code: account.code,
                                    type: account.type,
                                    // Include parent hierarchy
                                    group: {
                                        _id: group._id,
                                        name: group.name,
                                        nameArb: group.nameArb,
                                        code: group.code
                                    },
                                    class: {
                                        _id: classObj._id,
                                        name: classObj.name,
                                        nameArb: classObj.nameArb,
                                        code: classObj.code
                                    },
                                    level: {
                                        _id: level._id,
                                        name: level.name,
                                        nameArb: level.nameArb,
                                        code: level.code
                                    },
                                    chart: {
                                        _id: chart._id,
                                        name: chart.name,
                                        nameArb: chart.nameArb,
                                        code: chart.code,
                                        type: chart.type
                                    }
                                });
                            }
                        });
                    });
                });
            });
        });
        return allAccounts;
    }
    catch (error) {
        throw new Error(error.message || 'Failed to search accounts');
    }
};
exports.searchAccountsService = searchAccountsService;

// Business Logic
import mongoose from 'mongoose' ;
import { ChartOfAccounts } from './chartOfAccounts.model';
import {
 
    IChartOfAccounts,
    ILevel, IClass, IGroup, IAccount,
    AddChartOfAccountsRequest,
    AddLevelRequest,
    AddClassRequest,
    AddGroupRequest,
    AddAccountRequest,

} from './chartOfAccounts.interface'


// ============================================
// INSERT CHART OF ACCOUNTS (ROOT)
// ============================================
export const insertChartOfAccountsService = async(chartData: AddChartOfAccountsRequest):
    Promise<{chart: IChartOfAccounts}> => {

    const { name, nameArb, code, type } = chartData;
    
    // Check if chart name already exists
    const existingChart = await ChartOfAccounts.findOne({ name });
    if (existingChart) {
        throw new Error(`Chart "${name}" already exists`);
    }

    const newChart = await ChartOfAccounts.create({
        name,
        nameArb,
        code,
        type,
        level: [] // Initialize empty levels array
    });

    return { chart: newChart.toObject() };
};

// ============================================
// INSERT LEVEL (LEVEL 1)
// ============================================
export const addLevelToChartService = async(levelData: AddLevelRequest):
    Promise<{chart: IChartOfAccounts}> => {
    
    const { chartOfAccountId, name, nameArb, code } = levelData;
    
    // Find the chart
    const chart = await ChartOfAccounts.findById(chartOfAccountId);
    if (!chart) {
        throw new Error('Chart not found');
    }

    // Check if level name already exists in this chart
    const existingLevel = chart.level?.find((l: ILevel) => l.name === name);
    if (existingLevel) {
        throw new Error(`Level "${name}" already exists in this chart`);
    }

    // Create new level
    const newLevel: ILevel = {
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

// ============================================
// INSERT CLASS (LEVEL 2)
// ============================================
export const addClassToLevelService = async(classData: AddClassRequest):
    Promise<{chart: IChartOfAccounts}> => {
    
    const { chartOfAccountId, levelId, name, nameArb, code } = classData;
    
    // Find the chart
    const chart = await ChartOfAccounts.findById(chartOfAccountId);
    if (!chart) {
        throw new Error('Chart not found');
    }

    // Find the level
    const level = chart.level?.find((l: ILevel) => l._id?.toString() === levelId);
    if (!level) {
        throw new Error('Level not found in this chart');
    }

    // Check if class name already exists in this level
    const existingClass = level.class?.find((c: IClass) => c.name === name);
    if (existingClass) {
        throw new Error(`Class "${name}" already exists in this level`);
    }

    // Create new class
    const newClass: IClass = {
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

// ============================================
// INSERT GROUP (LEVEL 3)
// ============================================
export const addGroupToClassService = async(groupData: AddGroupRequest):
    Promise<{chart: IChartOfAccounts}> => {
    
    const { chartOfAccountId, levelId, classId, name, nameArb, code } = groupData;
    
    // Find the chart
    const chart = await ChartOfAccounts.findById(chartOfAccountId);
    if (!chart) {
        throw new Error('Chart not found');
    }

    // Find the level
    const level = chart.level?.find((l: ILevel) => l._id?.toString() === levelId);
    if (!level) {
        throw new Error('Level not found in this chart');
    }

    // Find the class
    const classObj = level.class?.find((c: IClass) => c._id?.toString() === classId);
    if (!classObj) {
        throw new Error('Class not found in this level');
    }

    // Check if group name already exists in this class
    const existingGroup = classObj.group?.find((g: IGroup) => g.name === name);
    if (existingGroup) {
        throw new Error(`Group "${name}" already exists in this class`);
    }

    // Create new group
    const newGroup: IGroup = {
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

// ============================================
// INSERT ACCOUNT (LEVEL 4)
// ============================================
export const addAccountToGroupService = async(accountData: AddAccountRequest):
    Promise<{chart: IChartOfAccounts}> => {
    
    const { chartOfAccountId, levelId, classId, groupId, name, nameArb, code, type } = accountData;
    
    // Find the chart
    const chart = await ChartOfAccounts.findById(chartOfAccountId);
    if (!chart) {
        throw new Error('Chart not found');
    }

    // Find the level
    const level = chart.level?.find((l: ILevel) => l._id?.toString() === levelId);
    if (!level) {
        throw new Error('Level not found in this chart');
    }

    // Find the class
    const classObj = level.class?.find((c: IClass) => c._id?.toString() === classId);
    if (!classObj) {
        throw new Error('Class not found in this level');
    }

    // Find the group
    const group = classObj.group?.find((g: IGroup) => g._id?.toString() === groupId);
    if (!group) {
        throw new Error('Group not found in this class');
    }

    // Check if account name already exists in this group
    const existingAccount = group.account?.find((a: IAccount) => a.name === name);
    if (existingAccount) {
        throw new Error(`Account "${name}" already exists in this group`);
    }

    // Create new account
    const newAccount: IAccount = {
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



// ============================================
// GET ALL CHARTS
// ============================================
export const getChartOfAccountsService = async(): Promise<IChartOfAccounts[]> => {
    try {
        const chartOfAccounts = await ChartOfAccounts.find().sort({createdAt: 1});
        return chartOfAccounts;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// ============================================
// GET SINGLE CHART BY ID
// ============================================
export const getChartByIdService = async(chartId: string): Promise<IChartOfAccounts> => {
    try {
        const chart = await ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        return chart;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// ============================================
// GET ALL LEVELS IN A CHART
// ============================================
export const getLevelsByChartIdService = async(chartId: string): Promise<ILevel[]> => {
    try {
        const chart = await ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        return chart.level || [];
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// ============================================
// GET SINGLE LEVEL BY ID
// ============================================
export const getLevelByIdService = async(chartId: string, levelId: string): Promise<ILevel> => {
    try {
        const chart = await ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }

        const level = chart.level?.find(l => l._id?.toString() === levelId);
        if (!level) {
            throw new Error('Level not found');
        }

        return level;
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// ============================================
// GET ALL CLASSES IN A LEVEL
// ============================================
export const getClassesByLevelIdService = async(chartId: string, levelId: string): Promise<IClass[]> => {
    try {
        const chart = await ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }

        const level = chart.level?.find(l => l._id?.toString() === levelId);
        if (!level) {
            throw new Error('Level not found');
        }

        return level.class || [];
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// ============================================
// GET SINGLE CLASS BY ID
// ============================================
export const getClassByIdService = async(chartId: string, levelId: string, classId: string): Promise<IClass> => {
    try {
        const chart = await ChartOfAccounts.findById(chartId);
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
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// ============================================
// GET ALL GROUPS IN A CLASS
// ============================================
export const getGroupsByClassIdService = async(chartId: string, levelId: string, classId: string): Promise<IGroup[]> => {
    try {
        const chart = await ChartOfAccounts.findById(chartId);
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
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// ============================================
// GET SINGLE GROUP BY ID
// ============================================
export const getGroupByIdService = async(chartId: string, levelId: string, classId: string, groupId: string): Promise<IGroup> => {
    try {
        const chart = await ChartOfAccounts.findById(chartId);
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
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// ============================================
// GET ALL ACCOUNTS IN A GROUP
// ============================================
export const getAccountsByGroupIdService = async(chartId: string, levelId: string, classId: string, groupId: string): Promise<IAccount[]> => {
    try {
        const chart = await ChartOfAccounts.findById(chartId);
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
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// ============================================
// GET SINGLE ACCOUNT BY ID
// ============================================
export const getAccountByIdService = async(
    chartId: string, 
    levelId: string, 
    classId: string, 
    groupId: string, 
    accountId: string
): Promise<IAccount> => {
    try {
        const chart = await ChartOfAccounts.findById(chartId);
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
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// ============================================
// GET FULL HIERARCHY (Chart with all nested data)
// ============================================
export const getFullChartHierarchyService = async(chartId: string): Promise<IChartOfAccounts> => {
    try {
        const chart = await ChartOfAccounts.findById(chartId);
        if (!chart) {
            throw new Error('Chart not found');
        }
        return chart; // Returns full nested structure
    } catch (error: any) {
        throw new Error(error.message);
    }
};


// can create a single function to fetch all accounts directly without going through the hierarchy step-by-step. Here's how:

// ============================================
// GET ALL ACCOUNTS (FLATTENED)
// ============================================
export const getAllAccountsService = async (): Promise<any[]> => {
    try {
        const charts = await ChartOfAccounts.find();
        const allAccounts: any[] = [];

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
    } catch (error: any) {
        throw new Error(error.message || 'Failed to fetch accounts');
    }
};

// ============================================
// GET ACCOUNTS WITH SEARCH
// ============================================
export const searchAccountsService = async (searchTerm: string): Promise<any[]> => {
    try {
        const charts = await ChartOfAccounts.find();
        const allAccounts: any[] = [];
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
    } catch (error: any) {
        throw new Error(error.message || 'Failed to search accounts');
    }
};






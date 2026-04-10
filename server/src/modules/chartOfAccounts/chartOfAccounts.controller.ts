// HTTP handling
import { Request, Response } from 'express' ;
import * as ChartService from './chartOfAccounts.service' ;


// ============================================
// INSERT CHART OF ACCOUNTS (ROOT)
// ============================================
export const insertChartOfAccountsController = async(req: Request, res: Response): Promise<void> => {
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

    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// ============================================
// ADD LEVEL (LEVEL 1)
// ============================================
export const addLevelController = async(req: Request, res: Response): Promise<void> => {
    try {
        // ✅ Cast params to string
        const chartId = req.params.chartId as string;
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

    } catch (error: any) {
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

// ============================================
// ADD CLASS (LEVEL 2)
// ============================================

// The same TypeScript error occurs because req.params returns string | string[]. Here's the fixed controller with proper type casting:
export const addClassController = async(req: Request, res: Response): Promise<void> => {
    try {
        // ✅ Cast params to string
        const chartId = req.params.chartId as string;
        const levelId = req.params.levelId as string;
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

    } catch (error: any) {
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

// ============================================
// ADD GROUP (LEVEL 3)
// ============================================
export const addGroupController = async(req: Request, res: Response): Promise<void> => {
    try {
        // ✅ Extract params and ensure they are strings
        const chartId = req.params.chartId as string;
        const levelId = req.params.levelId as string;
        const classId = req.params.classId as string;
        
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

    } catch (error: any) {
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
// ============================================
// ADD ACCOUNT (LEVEL 4)
// ============================================
export const addAccountController = async(req: Request, res: Response): Promise<void> => {
    try {
        // ✅ Cast params to string
        const chartId = req.params.chartId as string;
        const levelId = req.params.levelId as string;
        const classId = req.params.classId as string;
        const groupId = req.params.groupId as string;
        
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

    } catch (error: any) {
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



// ============================================
// GET ALL CHARTS
// ============================================
export const getAllChartsController = async(req: Request, res: Response): Promise<void> => {
    try {
        const charts = await ChartService.getChartOfAccountsService();

        res.status(200).json({ 
            success: true, 
            charts,
            count: charts.length
        });

    } catch (error: any) {
        console.log(error.message);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// ============================================
// GET SINGLE CHART BY ID
// ============================================
export const getChartByIdController = async(req: Request, res: Response): Promise<void> => {
    try {
        const chartId = req.params.chartId as string;

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

    } catch (error: any) {
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

// ============================================
// GET ALL LEVELS IN A CHART
// ============================================
export const getLevelsController = async(req: Request, res: Response): Promise<void> => {
    try {
        const chartId = req.params.chartId as string;

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

    } catch (error: any) {
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

// ============================================
// GET SINGLE LEVEL BY ID
// ============================================
export const getLevelByIdController = async(req: Request, res: Response): Promise<void> => {
    try {
        const chartId = req.params.chartId as string;
        const levelId = req.params.levelId as string;

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

    } catch (error: any) {
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

// ============================================
// GET ALL CLASSES IN A LEVEL
// ============================================
export const getClassesController = async(req: Request, res: Response): Promise<void> => {
    try {
        const chartId = req.params.chartId as string;
        const levelId = req.params.levelId as string;

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

    } catch (error: any) {
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

// ============================================
// GET SINGLE CLASS BY ID
// ============================================
export const getClassByIdController = async(req: Request, res: Response): Promise<void> => {
    try {
        const chartId = req.params.chartId as string;
        const levelId = req.params.levelId as string;
        const classId = req.params.classId as string;

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

    } catch (error: any) {
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

// ============================================
// GET ALL GROUPS IN A CLASS
// ============================================
export const getGroupsController = async(req: Request, res: Response): Promise<void> => {
    try {
        const chartId = req.params.chartId as string;
        const levelId = req.params.levelId as string;
        const classId = req.params.classId as string;

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

    } catch (error: any) {
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

// ============================================
// GET SINGLE GROUP BY ID
// ============================================
export const getGroupByIdController = async(req: Request, res: Response): Promise<void> => {
    try {
        const chartId = req.params.chartId as string;
        const levelId = req.params.levelId as string;
        const classId = req.params.classId as string;
        const groupId = req.params.groupId as string;

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

    } catch (error: any) {
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

// ============================================
// GET ALL ACCOUNTS IN A GROUP
// ============================================
export const getAccountsController = async(req: Request, res: Response): Promise<void> => {
    try {
        const chartId = req.params.chartId as string;
        const levelId = req.params.levelId as string;
        const classId = req.params.classId as string;
        const groupId = req.params.groupId as string;

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

    } catch (error: any) {
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

// ============================================
// GET SINGLE ACCOUNT BY ID
// ============================================
export const getAccountByIdController = async(req: Request, res: Response): Promise<void> => {
    try {
        const chartId = req.params.chartId as string;
        const levelId = req.params.levelId as string;
        const classId = req.params.classId as string;
        const groupId = req.params.groupId as string;
        const accountId = req.params.accountId as string;

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

    } catch (error: any) {
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

// ============================================
// GET FULL CHART HIERARCHY
// ============================================
export const getFullChartHierarchyController = async(req: Request, res: Response): Promise<void> => {
    try {
        const chartId = req.params.chartId as string;

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

    } catch (error: any) {
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

// can create a single function to fetch all accounts directly without going through the hierarchy step-by-step. Here's how:
// ============================================
// GET ALL ACCOUNTS CONTROLLER
// ============================================
export const getAllAccountsController = async (req: Request, res: Response): Promise<void> => {
    try {
        const { search } = req.query;
        
        let accounts;
        if (search) {
            accounts = await ChartService.searchAccountsService(search as string);
        } else {
            accounts = await ChartService.getAllAccountsService();
        }

        res.status(200).json({
            success: true,
            accounts,
            count: accounts.length,
            message: 'Accounts fetched successfully'
        });
    } catch (error: any) {
        console.error('Error fetching accounts:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch accounts'
        });
    }
};
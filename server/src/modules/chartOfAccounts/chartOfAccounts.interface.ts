import mongoose from 'mongoose';

// Make sure your interface matches your schema
export interface IChartOfAccounts extends Document {
    type: string;
    name: string;
    nameArb: string;
    code: string; 
    level: ILevel[];  // ✅ Changed from 'groups' to 'level'
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ILevel {
    _id?: string;
    name: string; 
    nameArb: string; 
    code: string;
    class: IClass[];  // ✅ Array of classes
}

export interface IClass {
    _id?: string;
    name: string; 
    nameArb: string; 
    code: string;
    group: IGroup[];  // ✅ Array of groups
}

export interface IGroup {
    _id?: string;
    name: string;
    nameArb: string;
    code: string;
    account: IAccount[];  // ✅ Array of accounts
}

export interface IAccount {
    _id?: string;
    name: string;
    nameArb: string;
    code: string;
    type: string;
}


// Insert
// ============================================
// REQUEST INTERFACES FOR ADD OPERATIONS
// ============================================

// Add a new Chart of Accounts (Root)
export interface AddChartOfAccountsRequest {
    name: string;
    nameArb: string;
    code: string;
    type: string;  // 'Balance Sheet' or 'Profit & Loss'
}

// Add a new Level under a Chart
export interface AddLevelRequest {
    chartOfAccountId: string;
    name: string;
    nameArb: string;
    code: string;
}

// Add a new Class under a Level
export interface AddClassRequest {
    chartOfAccountId: string;
    levelId: string;
    name: string;
    nameArb: string;
    code: string;
}

// Add a new Group under a Class
export interface AddGroupRequest {
    chartOfAccountId: string;
    levelId: string;
    classId: string;
    name: string;
    nameArb: string;
    code: string;
}

// Add a new Account under a Group
export interface AddAccountRequest {
    chartOfAccountId: string;
    levelId: string;
    classId: string;
    groupId: string;
    name: string;
    nameArb: string;
    code: string;
    type: string;  // Account type (asset, liability, equity, income, expense)
}




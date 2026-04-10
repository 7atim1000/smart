import { Document } from 'mongoose';
import mongoose from 'mongoose' ;

export interface IJournalEntry {
    _id?: string;
    date: Date;
    reference: string;
    description: string;
    descriptionArb: string;
    
    // Account Information (per entry)
    accName: string;
    accNameArb: string;
    accGroup: string;
    accGroupArb: string;
    accClass: string;
    accClassArb: string;
    accLevel: string;
    accLevelArb: string;
    accChart: string;
    accChartArb: string;
    accType: string;
    
    // Partner Information (optional - for customer/supplier)
    partnerId?: string;  // Reference to customer/supplier
    partnerName?: string;
    partnerNameArb?: string;
    
    // Financial
    debit: number;
    credit: number;
    balance: number;  // Running balance after this entry
    currency: string;
    
    // Metadata
    createdBy?: string;
    createdAt?: Date;
}

export interface IJournal extends Document {
    // Journal Header
    journalsNameId?: mongoose.Types.ObjectId; // Add this to link to JournalsName
    status: string;
    reference: string;
    journalName: string;
    journalNameArb: string;
    code: string;
    
    // Period Information
    fiscalYear: number;
    period: string;  // Format: YYYY-MM
    
    // Financial Summary
    openingBalance: number;
    currentBalance: number;
    totalDebit: number;
    totalCredit: number;
    netChange: number;
    currency: string;
    
    // Entries
    entries: IJournalEntry[];
    
    // Status
    isActive: boolean;
    isClosed: boolean;
    closedAt?: Date;
    lastEntryDate?: Date;
    
    // Timestamps
    createdAt?: Date;
    updatedAt?: Date;
}

// ============================================
// REQUEST INTERFACES
// ============================================

export interface AddJournalEntryRequest {
    date: Date;
    reference: string;
    description: string;
    descriptionArb: string;
    
    // Account Information
    accName: string;
    accNameArb: string;
    accGroup: string;
    accGroupArb: string;
    accClass: string;
    accClassArb: string;
    accLevel: string;
    accLevelArb: string;
    accChart: string;
    accChartArb: string;
    accType: string; 
    
    // Partner Information (optional)
    partnerId?: string;
    partnerName?: string;
    partnerNameArb?: string;
    
    // Financial
    debit?: number;
    credit?: number;
    currency?: string; 
}

export interface AddJournalRequest {
    // Journal Header
    status: string;
    reference: string;
    journalName: string;
    journalNameArb: string;
    code: string;
    
    // Period
    fiscalYear: number;
    period: string;
    
    // Optional opening balance
    openingBalance?: number;
    currency: string;
    
    // Entries
    entries: AddJournalEntryRequest[];
}


export interface UpdateJournalRequest {
    journalName?: string;
    journalNameArb?: string;
    code?: string;
    fiscalYear?: number;
    period?: string;
    isActive?: boolean;
    isClosed?: boolean;
    status?: string;
    reference: string;
}

// journals.interface.ts
export interface JournalFilterRequest {
    fiscalYear?: number;     // Make optional with ?
    period?: string;         // Make optional with ?
    currency?: string;       // Make optional with ?
    accChart?: string;       // Make optional with ?
    accLevel?: string;       // Make optional with ?
    accGroup?: string;       // Make optional with ?
    accClass?: string;       // Make optional with ?
    partnerId?: string;      // Make optional with ?
    startDate?: Date;        // Make optional with ?
    endDate?: Date;          // Make optional with ?
    isActive?: boolean;      // Make optional with ?
    status?: string; // NEW: Add status field
}
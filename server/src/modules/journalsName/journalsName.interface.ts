export interface IJournalsName {
    _id?: string;
    journalName: string; 
    journalNameArb: string; 
    accName: string; 
    accNameArb: string;
    code: string;

    accGroup: string;
    accGroupArb: string;
    accLevel: string;
    accLevelArb: string;
    accChart: string;
    accChartArb: string;
    createdAt?: Date;
    updatedAt?: Date;
    balance: number;
};

export interface AddJournalsNameRequest {
    journalName: string; 
    journalNameArb: string; 
    accName: string; 
    accNameArb: string;
    code: string;
    
    accGroup: string;
    accGroupArb: string;
    accLevel: string;
    accLevelArb: string;
    accChart: string;
    accChartArb: string;
}
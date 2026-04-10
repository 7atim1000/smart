export interface IContacts {
    _id: string,
    email: string,
    name: string,
    phone: string; 
    address: string; 
    isReceivable: boolean;
    isPayable: boolean;

    // Account Information
    accReceivableName: string;
    accReceivableNameArb: string;
    accReceivableGroup: string;
    accReceivableGroupArb: string;
    accReceivableClass: string;
    accReceivableClassArb: string;
    accReceivableLevel: string;
    accReceivableLevelArb: string;
    accReceivableChart: string;
    accReceivableChartArb: string;
    accReceivableType: string; 

    accPayableName: string;
    accPayableNameArb: string;
    accPayableGroup: string;
    accPayableGroupArb: string;
    accPayableClass: string;
    accPayableClassArb: string;
    accPayableLevel: string;
    accPayableLevelArb: string;
    accPayableChart: string;
    accPayableChartArb: string;
    accPayableType: string; 

    balance?: number;
    balanceCurrency?: string;
    createdAt?: Date;
    updatedAt?: Date;
    
}


export interface AddContactRequest {
    email: string;
    name: string;
    phone: string;
    address: string;

    isReceivable: boolean;
    isPayable: boolean;

    accReceivableName: string;
    accReceivableNameArb: string;
    accReceivableGroup: string;
    accReceivableGroupArb: string;
    accReceivableClass: string;
    accReceivableClassArb: string;
    accReceivableLevel: string;
    accReceivableLevelArb: string;
    accReceivableChart: string;
    accReceivableChartArb: string;
    accReceivableType: string;

    accPayableName: string;
    accPayableNameArb: string;
    accPayableGroup: string;
    accPayableGroupArb: string;
    accPayableClass: string;
    accPayableClassArb: string;
    accPayableLevel: string;
    accPayableLevelArb: string;
    accPayableChart: string;
    accPayableChartArb: string;
    accPayableType: string;

    balance?: number;
}

export interface UpdateContactRequest {
    email?: string;
    name?: string;
    phone?: string;
    address?: string;

    isReceivable?: boolean;
    isPayable?: boolean;

    accReceivableName?: string;
    accReceivableNameArb?: string;
    accReceivableGroup?: string;
    accReceivableGroupArb?: string;
    accReceivableClass?: string;
    accReceivableClassArb?: string;
    accReceivableLevel?: string;
    accReceivableLevelArb?: string;
    accReceivableChart?: string;
    accReceivableChartArb?: string;
    accReceivableType?: string;

    accPayableName?: string;
    accPayableNameArb?: string;
    accPayableGroup?: string;
    accPayableGroupArb?: string;
    accPayableClass?: string;
    accPayableClassArb?: string;
    accPayableLevel?: string;
    accPayableLevelArb?: string;
    accPayableChart?: string;
    accPayableChartArb?: string;
    accPayableType?: string;

    balance?: number;
    
}

export interface ContactFilterRequest {
    search?: string;
    isReceivable?: boolean;
    isPayable?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
}
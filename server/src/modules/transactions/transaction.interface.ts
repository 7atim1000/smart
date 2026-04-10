export interface ITransaction {
    _id: string;
    transactionNumber: string;
    shift: string;
    amount: number;
    type: string;
    account: string;
    refrence: string;
    description: string;
    status?: string;
    paymentMethod: string;
    currency: string;
    date: Date;
    user: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface AddTransactionRequest {
    transactionNumber: string;
    shift: string;
    amount: number;
    type: string;
    account: string;
    refrence: string;
    description: string;
    status?: string;
    paymentMethod: string;
    currency: string;
    date: Date;
    user: string;
   
};
export interface UpdateTransactionRequest {
    transactionId: string;
    transactionNumber: string;
    shift: string;
    amount: number;
    type: string;
    account: string;
    refrence: string;
    description: string;
    currency: string;
    status?: string;
    paymentMethod: string;
    date: Date;
    user: string;
};
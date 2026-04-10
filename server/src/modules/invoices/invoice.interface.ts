import { Types } from 'mongoose';

export interface IInvoiceItem {
  productId: Types.ObjectId;
  productName: string;
  category: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
  tax?: number;
  currency: string;
}

export interface IInvoice {
  _id: Types.ObjectId;
  type?: string;
  shift: 'Morning' | 'Evening';
  // status: 'RFQ' | 'Purchase Order' | 'Quotation' | 'Sales Order' | 'Bill';
  status?: string;
  invoiceNumber?: string;
  invoiceType: string;
  invoiceStatus: string;
  
  customer?: Types.ObjectId;
  customerName?: string;
  customerEmail?: string;
  customerContact?: string;

  supplier?: Types.ObjectId;
  supplierName?: string;
  supplierEmail?: string;
  supplierContact?: string;

  items: IInvoiceItem[];
  saleBills?: {
    total: number;
    tax: number;
    totalWithTax: number;
    payed: number;
    balance: number;
    currency: string;
  };
  buyBills?: {
    total: number;
    tax: number;
    totalWithTax: number;
    payed: number;
    balance: number;
    currency: string;
  };
  bills?: {
    total: number;
    tax: number;
    totalWithTax: number;
    payed: number;
    balance: number;
    currency: string;
  };
  paymentMethod?: string;
  user: Types.ObjectId;
  invoiceDate: Date;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}
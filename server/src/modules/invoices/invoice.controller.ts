import { Request, Response } from 'express';
import * as InvoiceService from './invoice.service' ;
import Invoice from './invoice.model';

export const addInvoiceController = async (req: Request, res: Response): Promise<void> => {
  try {
    const invoice = await InvoiceService.addInvoiceService(req.body);
    
    res.status(201).json({ 
      success: true, 
      message: 'Invoice created successfully!', 
      data: invoice 
    });

  } catch (error: any) {
    console.error('Error adding invoice:', error.message);
    
    // Pass error to Express error handler
    res.status(500).json({
      success: false,
      message: 'Failed to create invoice',
      error: error.message
    });
  }
};



export const getInvoicesController = async (req: Request, res: Response): Promise<void> => {
  
  try {
   
    const {
      frequency,
      type,
      invoiceType,
      invoiceStatus,
      status,
      shift,
      customer,
      supplier,
      sort = '-createdAt',
      search,
      page = 1,
      limit = 10
    } = req.query; // Change from req.body to req.query

    // Call service to get invoices
    const result = await InvoiceService.getInvoicesService({
      frequency: frequency as string,
      type: type as string,
      invoiceType: invoiceType as string,
      invoiceStatus: invoiceStatus as string,
      status: status as string,
      shift: shift as string,
      customer: customer as string,
      supplier: supplier as string,
      sort: sort as string,
      search: search as string,
      page: Number(page),
      limit: Number(limit)
    });

    // Return success response
    res.status(200).json({
      message: 'All invoices fetched successfully',
      success: true,
      data: result.invoices,
      invoices: result.invoices,
      pagination: result.pagination
    });

  } catch (error: any) {
    console.error('Error in getInvoicesController:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoices',
      error: error.message
    });
  }
};

// Contact-Customer > statement

export const getStatementCustomer = async (req: Request, res: Response): Promise<void> => {
    try {
        const { customer } = req.body;

        // Validate customer ID
        if (!customer) {
            res.status(400).json({
                success: false,
                message: "Customer ID is required"
            });
            return;
        }

        // Find orders for this specific customer
        const orders = await Invoice.find({
            customer: customer
        }).sort({ createdAt: -1 }); // Optional: sort by newest first

        // Return success response
        res.status(200).json({
            success: true,
            message: "Customer statement fetched successfully",
            data: orders,
            count: orders.length
        });

    } catch (error) {
        console.log("Error fetching customer orders:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// In your backend controller
export const getStatementSupplier = async (req: Request, res: Response): Promise<void> => {
    try {
        const { supplier } = req.body;

        // Validate supplier ID
        if (!supplier) {
            res.status(400).json({
                success: false,
                message: "Supplier ID is required"
            });
            return;
        }

        // Find orders for this specific supplier
        const orders = await Invoice.find({
            supplier: supplier
        }).sort({ createdAt: -1 });

        // Return success response
        res.status(200).json({
            success: true,
            message: "Supplier statement fetched successfully",
            data: orders,
            count: orders.length
        });

    } catch (error) {
        console.log("Error fetching supplier orders:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error instanceof Error ? error.message : "Unknown error"
        });
    }
};

// Get Invoice BY ID : 
// controllers/invoice.controller.ts

export const getInvoiceByIdController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Invoice ID is required'
      });
      return;
    }

    // Find invoice by ID with populated fields
    const invoice = await Invoice.findById(id)
      .populate([
        { 
          path: "customer", 
          select: ["email", "name", "phone", "accReceivableName", "accReceivableNameArb", "accReceivableGroup",
            "accReceivableGroupArb", "accReceivableClass", "accReceivableClassArb", "accReceivableLevel", "accReceivableLevelArb",
            "accReceivableChart", "accReceivableChartArb", "accReceivableType", "balance"] 
        },
        { 
          path: "supplier", 
          select: ["email", "name", "phone", "accPayableName", "accPayableNameArb", "accPayableGroup",
            "accPayableGroupArb", "accPayableClass", "accPayableClassArb", "accPayableLevel", "accPayableLevelArb",
            "accPayableChart", "accPayableChartArb", "accPayableType", "balance"] 
        },
        { 
          path: "user", 
          select: "name" 
        },
        {
          path: "items.product",
          select: "name barcode salePrice costPrice"
        }
      ]);

    // Check if invoice exists
    if (!invoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
      return;
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Invoice fetched successfully',
      data: invoice
    });

  } catch (error: any) {
    console.error('Error in getInvoiceByIdController:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch invoice',
      error: error.message
    });
  }
};


// controllers/invoice.controller.ts

export const updateInvoiceStatusController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate ID
    if (!id) {
      res.status(400).json({
        success: false,
        message: 'Invoice ID is required'
      });
      return;
    }

    // Validate status
    if (!status) {
      res.status(400).json({
        success: false,
        message: 'Status field is required'
      });
      return;
    }

    // Optional: Validate if status is one of allowed values
    const allowedStatuses = ['Quotation', 'Order', 'Bill', 'Completed', 'Pending', 'Cancelled', 'Refunded'];
    if (!allowedStatuses.includes(status)) {
      res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}`
      });
      return;
    }

    // Find and update the invoice status
    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { 
        status: status,
        // Also update invoiceStatus if you want to keep them in sync
        invoiceStatus: status 
      },
      { 
        new: true, // Return the updated document
        runValidators: true // Run schema validators
      }
    ).populate([
      { path: "customer", select: "name email phone balance" },
      { path: "supplier", select: "name email phone balance" },
      { path: "user", select: "name" }
    ]);

    // Check if invoice exists
    if (!updatedInvoice) {
      res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
      return;
    }

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Invoice status updated successfully',
      data: updatedInvoice
    });

  } catch (error: any) {
    console.error('Error in updateInvoiceStatusController:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update invoice status',
      error: error.message
    });
  }
};


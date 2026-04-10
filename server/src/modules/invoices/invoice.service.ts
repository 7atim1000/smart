import Invoice from './invoice.model'
import moment from 'moment';
//simpler version that's closer to your original JavaScript function

export const addInvoiceService = async (invoiceData: any): Promise<any> => {
  
  try {
    const getCurrentShift = (): 'Morning' | 'Evening' => {
      const hour = new Date().getHours();
      return (hour >= 6 && hour < 18) ? 'Morning' : 'Evening';
    };

    const invoice = new Invoice({
      ...invoiceData,
      shift: getCurrentShift(),
    });

    const savedInvoice = await invoice.save();
    return savedInvoice;

  } catch (error: any) {
    throw new Error(error.message);
  }
};


interface GetInvoicesParams {
  frequency?: string;
  type?: string;
  invoiceType?: string;
  invoiceStatus?: string;
  status?: string;
  shift?: string;
  customer?: string;
  supplier?: string;
  sort?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const getInvoicesService = async (params: GetInvoicesParams): Promise<any> => {
 
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
    } = params;

    // Build query
    const query: any = {};
    
    // Date filter based on frequency
    if (frequency) {
      query.invoiceDate = {
        $gt: moment().subtract(Number(frequency), "d").toDate(),
      };
    }

    // Add filters if not 'all'
    if (type && type !== 'all') query.type = type;
    if (invoiceType && invoiceType !== 'all') query.invoiceType = invoiceType;
    if (invoiceStatus && invoiceStatus !== 'all') query.invoiceStatus = invoiceStatus;
    if (status && status !== 'all') query.status = status;

    if (shift && shift !== 'all') query.shift = shift;
    if (customer && customer !== 'all') query.customer = customer;
    if (supplier && supplier !== 'all') query.supplier = supplier;

    // Search across multiple fields
    if (search) {
      query.$or = [
        { shift: { $regex: search, $options: 'i' } },
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
        { invoiceStatus: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } },
        { invoiceType: { $regex: search, $options: 'i' } },
      ];
    }

    // Sort options
    let sortOption: any = {};
    if (sort === '-createdAt') {
      sortOption = { createdAt: -1 }; // Newest first
    } else if (sort === 'createdAt') {
      sortOption = { createdAt: 1 };  // Oldest first
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    
    // Get total count
    const total = await Invoice.countDocuments(query);
    
    // Get invoices with pagination and population
    const invoices = await Invoice.find(query)

      .populate([
        { path: "customer", select: ["email", "name", "phone", "accReceivableName", "accReceivableNameArb", "accReceivableGroup",
            "accReceivableGroupArb", "accReceivableClass", "accReceivableClassArb", "accReceivableLevel", "accReceivableLevelArb",
            "accReceivableChart", "accReceivableChartArb", "accReceivableType", "balance"] },

        { path: "supplier", select: ["email", "name", "phone", "accPayableName", "accPayableNameArb", "accPayableGroup",
            "accPayableGroupArb", "accPayableClass", "accPayableClassArb", "accPayableLevel", "accPayableLevelArb",
            "accPayableChart", "accPayableChartArb", "accPayableType", "balance"] },

        { path: "user", select: "name" },
      ])
      .sort(sortOption)
      .skip(startIndex)
      .limit(limit);

    return {
      invoices,
      pagination: {
        currentPage: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

  } catch (error: any) {
    console.error('Error in getInvoicesService:', error.message);
    throw new Error(error.message);
  }
};
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { 
    FaFileInvoice, FaUser, FaBuilding, FaCalendar, 
    FaArrowLeft, FaEdit, FaPrint, FaDownload,
    FaCheckCircle, FaTimesCircle, FaClock, FaBoxes
} from 'react-icons/fa';
import { MdOutlinePayment } from 'react-icons/md';
import { toast } from 'react-hot-toast';

const InvDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { axios } = useContext(AuthContext);
    const printRef = useRef();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Fetch invoice details
    const fetchInvoiceDetails = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/v1/api/invoices/${id}`);
            
            if (response.data.success) {
                setInvoice(response.data.data);
            } else {
                toast.error('فشل جلب تفاصيل الفاتورة');
            }
        } catch (error) {
            console.error('Error fetching invoice:', error);
            toast.error('خطأ في تحميل تفاصيل الفاتورة');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchInvoiceDetails();
        }
    }, [id]);

    // Handle print
    const handlePrint = (e, invoice) => {
        e.stopPropagation(); // Prevent row click when clicking print button
        setSelectedInvoice(invoice);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    //Start Update invoice status --------------------------------------------------------------------------------
    const updateStatus = async (newStatus) => {
        setUpdating(true);
        let journalCreated = false;

        try {
            // First update the status
            const response = await axios.patch(`/v1/api/invoices/${id}/status`, {
                status: newStatus
            });

            if (response.data.success) {
                const updatedInvoice = response.data.data;
                setInvoice(updatedInvoice);

                // Handle different status changes
                if (newStatus.toLowerCase() === 'order') {
                    toast.success('تم انشاءالطلب بنجاح');

                } else if (newStatus.toLowerCase() === 'bill') {

                    // Check if it's a Sale invoice (has customer) or Purchase invoice (has supplier)
                    if (updatedInvoice.customer) {
                        // ==================== SALE INVOICE ====================
                        try {
                            // Journal header information for sale invoices
                            const journalName = 'Sale invoices';
                            const journalNameArb = 'فواتير المبيعات';
                            const journalsNameId = '69b6ea8e43efca2922efdd93';

                            // Set reference
                            const journalReference = 'Sale invoices';

                            // Prepare journal entries
                            const journalEntries = [];

                            // Get current date for entry date
                            const entryDate = new Date();
                            const entryReference1 = 'ENT-1';
                            const entryReference2 = 'ENT-2';

                            // Debit entry for receivable account (customer account) - WITH PARTNER INFO
                            journalEntries.push({
                                date: entryDate,
                                reference: entryReference1,
                                description: `Sale invoice for customer ${updatedInvoice.customer?.name}`,
                                descriptionArb: `فاتورة مبيعات للعميل ${updatedInvoice.customer?.nameArb || updatedInvoice.customer?.name}`,
                                debit: updatedInvoice.bills?.totalWithTax || 0,
                                credit: 0,
                                balance: updatedInvoice.bills?.totalWithTax || 0,
                                currency: updatedInvoice.bills?.currency || 'AED',
                                accName: updatedInvoice.customer?.accReceivableName || 'Receivable account',
                                accNameArb: updatedInvoice.customer?.accReceivableNameArb || 'حساب العملاء',
                                accGroup: updatedInvoice.customer?.accReceivableGroup || 'Receivable',
                                accGroupArb: updatedInvoice.customer?.accReceivableGroupArb || 'العملاء',
                                accClass: updatedInvoice.customer?.accReceivableClass || 'Debts with debtor relationships',
                                accClassArb: updatedInvoice.customer?.accReceivableClassArb || 'ذمم ذات علاقات مدينة',
                                accLevel: updatedInvoice.customer?.accReceivableLevel || 'Current Assets',
                                accLevelArb: updatedInvoice.customer?.accReceivableLevelArb || 'الاصول المتداولة',
                                accChart: updatedInvoice.customer?.accReceivableChart || 'Assets',
                                accChartArb: updatedInvoice.customer?.accReceivableChartArb || 'الاصول',
                                accType: updatedInvoice.customer?.accReceivableType || 'Balance Sheet',
                                partnerId: updatedInvoice.customer?._id,
                                partnerName: updatedInvoice.customer?.name,
                                partnerNameArb: updatedInvoice.customer?.nameArb || updatedInvoice.customer?.name
                            });

                            // Credit entry for sales income account - NO PARTNER INFO
                            journalEntries.push({
                                date: entryDate,
                                reference: entryReference2,
                                description: `Sale invoice ${updatedInvoice.customer?.name}`,
                                descriptionArb: `فاتورة مبيعات ${updatedInvoice.customer?.nameArb || updatedInvoice.customer?.name}`,
                                debit: 0,
                                credit: updatedInvoice.bills?.totalWithTax || 0,
                                balance: -(updatedInvoice.bills?.totalWithTax || 0),
                                currency: updatedInvoice.bills?.currency || 'AED',
                                accName: 'Sales Income',
                                accNameArb: 'ايرادات المبيعات',
                                accGroup: 'Sales Income',
                                accGroupArb: 'ايرادات المبيعات',
                                accClass: 'Sales Income',
                                accClassArb: 'ايرادات المبيعات',
                                accLevel: 'Sales Income',
                                accLevelArb: 'ايرادات المبيعات',
                                accChart: 'Income',
                                accChartArb: 'الايرادات',
                                accType: 'Profit & Loss',
                                partnerId: null,
                                partnerName: null,
                                partnerNameArb: null
                            });

                            // Calculate totals
                            const totalDebit = journalEntries.reduce((sum, entry) => sum + entry.debit, 0);
                            const totalCredit = journalEntries.reduce((sum, entry) => sum + entry.credit, 0);

                            // Get current period (month/year) from date
                            const currentDate = new Date();
                            const year = currentDate.getFullYear();
                            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                            const period = `${year}-${month}`;

                            // Determine journal code
                            const journalCode = `SALE-${Date.now()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

                            const journalData = {
                                journalsNameId: journalsNameId,
                                journalName: journalName,
                                journalNameArb: journalNameArb,
                                reference: journalReference,
                                status: 'draft',
                                code: journalCode,
                                fiscalYear: year,
                                period: period,
                                openingBalance: 0,
                                currentBalance: 0,
                                totalDebit: totalDebit,
                                totalCredit: totalCredit,
                                netChange: totalDebit - totalCredit,
                                currency: updatedInvoice.bills?.currency || 'AED',
                                entries: journalEntries,
                                isActive: true,
                                isClosed: false,
                                closedAt: null,
                                lastEntryDate: currentDate
                            };

                            console.log('Sale Invoice Journal Data:', JSON.stringify(journalData, null, 2));

                            // Create journal entry
                            const journalResponse = await axios.post('/v1/api/journals', journalData);

                            if (journalResponse.data.success) {
                                journalCreated = true;
                                toast.success('Create a new bill and new journal successfully');
                            } else {
                                console.error('Journal response error:', journalResponse.data);
                                toast.error('Sale invoice journal entry creation failed');
                            }

                        } catch (journalError) {
                            console.error('Journal error details:', journalError.response?.data || journalError);
                            toast.error('Sale invoice journal entry could not be created');
                        }

                        // Update customer balance
                        if (updatedInvoice.customer) {
                            const balanceUpdated = await updateContactBalance(
                                updatedInvoice.customer,
                                updatedInvoice.bills?.totalWithTax || 0,
                                updatedInvoice.bills?.currency || 'AED',
                                true
                            );
                            if (balanceUpdated) {
                                toast.success('تم تحديث رصيد العميل بنجاح');
                            } else {
                                toast.error('Failed to update customer balance');
                            }
                        }

                    } else if (updatedInvoice.supplier) {
                        // ==================== PURCHASE INVOICE ====================
                        try {
                            // Journal header information for purchase invoices
                            const journalName = 'Purchase invoices';
                            const journalNameArb = 'فواتير المشتروات';
                            const journalsNameId = '69d5186eca0b49f8e4e098ef';

                            // Set reference
                            const journalReference = 'Purchase invoices';

                            // Prepare journal entries
                            const journalEntries = [];

                            // Get current date for entry date
                            const entryDate = new Date();
                            const entryReference1 = 'ENT-1';
                            const entryReference2 = 'ENT-2';

                            // Debit entry for Cost of Goods Sold - NO PARTNER INFO
                            journalEntries.push({
                                date: entryDate,
                                reference: entryReference1,
                                description: `Purchase invoice for supplier ${updatedInvoice.supplier?.name}`,
                                descriptionArb: `فاتورة مشتروات للمورد ${updatedInvoice.supplier?.nameArb || updatedInvoice.supplier?.name}`,
                                debit: updatedInvoice.bills?.totalWithTax || 0,
                                credit: 0,
                                balance: updatedInvoice.bills?.totalWithTax || 0,
                                currency: updatedInvoice.bills?.currency || 'AED',
                                accName: 'Cost of goods sold',
                                accNameArb: 'تكلفة البضاعة المباعة',
                                accGroup: 'Costs of goods',
                                accGroupArb: 'تكاليف البضاعة',
                                accClass: 'Costs of goods',
                                accClassArb: 'تكاليف البضاعة',
                                accLevel: 'Operating expenses',
                                accLevelArb: 'مصروفات تشغيلية',
                                accChart: 'Expenses',
                                accChartArb: 'المصروفات',
                                accType: 'Profit & Loss',
                                partnerId: null,
                                partnerName: null,
                                partnerNameArb: null
                            });

                            // Credit entry for payable account (supplier account) - WITH PARTNER INFO
                            journalEntries.push({
                                date: entryDate,
                                reference: entryReference2,
                                description: `Purchase invoice for supplier ${updatedInvoice.supplier?.name}`,
                                descriptionArb: `فاتورة مشتروات للمورد ${updatedInvoice.supplier?.nameArb || updatedInvoice.supplier?.name}`,
                                debit: 0,
                                credit: updatedInvoice.bills?.totalWithTax || 0,
                                balance: -(updatedInvoice.bills?.totalWithTax || 0),
                                currency: updatedInvoice.bills?.currency || 'AED',
                                accName: updatedInvoice.supplier?.accPayableName || 'Payable account',
                                accNameArb: updatedInvoice.supplier?.accPayableNameArb || 'حساب الموردين',
                                accGroup: updatedInvoice.supplier?.accPayableGroup || 'Payable',
                                accGroupArb: updatedInvoice.supplier?.accPayableGroupArb || 'الموردين',
                                accClass: updatedInvoice.supplier?.accPayableClass || 'Debts with creditor relationships',
                                accClassArb: updatedInvoice.supplier?.accPayableClassArb || 'ذمم ذات علاقات دائنة',
                                accLevel: updatedInvoice.supplier?.accPayableLevel || 'Current Liabilities',
                                accLevelArb: updatedInvoice.supplier?.accPayableLevelArb || 'الخصوم المتداولة',
                                accChart: updatedInvoice.supplier?.accPayableChart || 'Liabilities',
                                accChartArb: updatedInvoice.supplier?.accPayableChartArb || 'الخصوم',
                                accType: updatedInvoice.supplier?.accPayableType || 'Balance Sheet',
                                partnerId: updatedInvoice.supplier?._id,
                                partnerName: updatedInvoice.supplier?.name,
                                partnerNameArb: updatedInvoice.supplier?.nameArb || updatedInvoice.supplier?.name
                            });

                            // Calculate totals
                            const totalDebit = journalEntries.reduce((sum, entry) => sum + entry.debit, 0);
                            const totalCredit = journalEntries.reduce((sum, entry) => sum + entry.credit, 0);

                            // Get current period (month/year) from date
                            const currentDate = new Date();
                            const year = currentDate.getFullYear();
                            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
                            const period = `${year}-${month}`;

                            // Determine journal code
                            const journalCode = `PURCHASE-${Date.now()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

                            const journalData = {
                                journalsNameId: journalsNameId,
                                journalName: journalName,
                                journalNameArb: journalNameArb,
                                reference: journalReference,
                                status: 'draft',
                                code: journalCode,
                                fiscalYear: year,
                                period: period,
                                openingBalance: 0,
                                currentBalance: 0,
                                totalDebit: totalDebit,
                                totalCredit: totalCredit,
                                netChange: totalDebit - totalCredit,
                                currency: updatedInvoice.bills?.currency || 'AED',
                                entries: journalEntries,
                                isActive: true,
                                isClosed: false,
                                closedAt: null,
                                lastEntryDate: currentDate
                            };

                            console.log('Purchase Invoice Journal Data:', JSON.stringify(journalData, null, 2));

                            // Create journal entry
                            const journalResponse = await axios.post('/v1/api/journals', journalData);

                            if (journalResponse.data.success) {
                                journalCreated = true;
                                toast.success('تم حفظ الفاتوره وترحيل بيانات الفاتوره للحسابات');
                            } else {
                                console.error('Journal response error:', journalResponse.data);
                                toast.error('Purchase invoice journal entry creation failed');
                            }

                        } catch (journalError) {
                            console.error('Journal error details:', journalError.response?.data || journalError);
                            toast.error('Purchase invoice journal entry could not be created');
                        }

                        // Update supplier balance
                        if (updatedInvoice.supplier) {
                            const balanceUpdated = await updateContactBalance(
                                updatedInvoice.supplier,
                                updatedInvoice.bills?.totalWithTax || 0,
                                updatedInvoice.bills?.currency || 'AED',
                                false
                            );
                            if (balanceUpdated) {
                                toast.success('تم تحديث رصيد المورد');
                            } else {
                                toast.error('Failed to update supplier balance');
                            }
                        }
                    }
                }

                setShowStatusDropdown(false);

            } else {
                toast.error('Failed to update status');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || 'Error updating status');
        } finally {
            setUpdating(false);
        }
    };    
    
    // End Update invoice status ---------------------------------------------------------------------------------

    // Get status badge with appropriate color
    const getStatusBadge = (status) => {
        const statusStr = String(status || '').toLowerCase();
        
        const statusMap = {
            'quotation': 'bg-orange-100 text-orange-700 border-orange-300',
            'order': 'bg-blue-100 text-blue-700 border-blue-300',
            'bill': 'bg-green-100 text-green-700 border-green-300',
            'completed': 'bg-green-100 text-green-700 border-green-300',
            'pending': 'bg-yellow-100 text-yellow-700 border-yellow-300',
            'cancelled': 'bg-red-100 text-red-700 border-red-300',
            'refunded': 'bg-purple-100 text-purple-700 border-purple-300'
        };
        
        if (statusStr.includes('quotation')) {
            return statusMap.quotation;
        } else if (statusStr.includes('order')) {
            return statusMap.order;
        } else if (statusStr.includes('bill')) {
            return statusMap.bill;
        }
        
        return statusMap[statusStr] || 'bg-gray-100 text-gray-700 border-gray-300';
    };

    // Get status icon
    const getStatusIcon = (status) => {
        const statusStr = String(status || '').toLowerCase();
        
        if (statusStr.includes('quotation')) {
            return <FaFileInvoice className="text-orange-600" />;
        } else if (statusStr.includes('order')) {
            return <FaCheckCircle className="text-blue-600" />;
        } else if (statusStr.includes('bill')) {
            return <FaCheckCircle className="text-green-600" />;
        } else if (statusStr.includes('completed')) {
            return <FaCheckCircle className="text-green-600" />;
        } else if (statusStr.includes('pending')) {
            return <FaClock className="text-yellow-600" />;
        } else if (statusStr.includes('cancelled')) {
            return <FaTimesCircle className="text-red-600" />;
        }
        return <FaFileInvoice className="text-gray-600" />;
    };

    // Get status text in Arabic
    const getStatusText = (status) => {
        const statusStr = String(status || '').toLowerCase();
        
        const statusMap = {
            'quotation': 'عرض سعر',
            'order': 'طلب',
            'bill': 'فاتورة',
            'completed': 'مكتمل',
            'pending': 'قيد الانتظار',
            'cancelled': 'ملغي',
            'refunded': 'مسترجع'
        };
        
        if (statusStr.includes('quotation')) {
            return statusMap.quotation;
        } else if (statusStr.includes('order')) {
            return statusMap.order;
        } else if (statusStr.includes('bill')) {
            return statusMap.bill;
        }
        
        return statusMap[statusStr] || status || 'N/A';
    };

    // Available status options
    const statusOptions = ['Quotation', 'Order', 'Bill'];

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return d.toLocaleDateString('ar-AE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">جاري تحميل تفاصيل الفاتورة...</p>
                </div>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center" dir="rtl">
                <div className="text-center">
                    <FaFileInvoice className="mx-auto text-5xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">الفاتورة غير موجودة</h3>
                    <button
                        onClick={handleBack}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        العودة
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-gray-50" dir="rtl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all duration-200 text-white"
                            >
                                <FaArrowLeft size={20} className="transform rotate-180" />
                            </button>
                            <div className="bg-white/20 p-3 rounded-xl">
                                <FaFileInvoice className="text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">تفاصيل الفاتورة</h1>
                                <p className="text-blue-200 text-sm">{invoice.invoiceNumber}</p>
                            </div>
                        </div>

                        {/* Status Badge with Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => !(invoice.status?.toLowerCase() === 'bill') && setShowStatusDropdown(!showStatusDropdown)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${getStatusBadge(invoice.status || invoice.invoiceStatus)} ${invoice.status?.toLowerCase() === 'bill' ? 'opacity-100 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                                    }`}
                                disabled={updating || invoice.status?.toLowerCase() === 'bill'}
                            >
                                {getStatusIcon(invoice.status || invoice.invoiceStatus)}
                                <span>{getStatusText(invoice.status || invoice.invoiceStatus)}</span>
                                {invoice.status?.toLowerCase() !== 'bill' && <span className="text-xs">▼</span>}
                            </button>

                            {/* Status Dropdown - Only show if not bill */}
                            {showStatusDropdown && invoice.status?.toLowerCase() !== 'bill' && (
                                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-20">
                                    {statusOptions.map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => updateStatus(status)}
                                            disabled={updating}
                                            className="w-full text-right px-4 py-2 text-sm hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {status === 'Quotation' ? 'عرض سعر' : status === 'Order' ? 'طلب' : 'فاتورة'}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Right Column - Invoice Info (was left) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Customer/Supplier Info Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                {invoice.customer ? <FaUser className="text-blue-600" /> : <FaBuilding className="text-blue-600" />}
                                {invoice.customer ? 'معلومات العميل' : 'معلومات المورد'}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">الاسم</p>
                                    <p className="font-medium text-gray-800">
                                        {invoice.customer?.name || invoice.supplier?.name || 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                                    <p className="font-medium text-gray-800">{invoice.customer?.email || invoice.supplier?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">الهاتف</p>
                                    <p className="font-medium text-gray-800">{invoice.customer?.phone || invoice.supplier?.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">الرصيد</p>
                                    <p className={`font-medium ${
                                        (invoice.customer?.balance || invoice.supplier?.balance) > 0 
                                            ? 'text-red-600' 
                                            : (invoice.customer?.balance || invoice.supplier?.balance) < 0 
                                                ? 'text-green-600' 
                                                : 'text-gray-600'
                                    }`}>
                                        {(invoice.customer?.balance || invoice.supplier?.balance || 0).toFixed(2)} {invoice.bills?.currency}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Items Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaBoxes className="text-blue-600" />
                                بنود الفاتورة
                            </h3>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">المنتج</th>
                                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">الكمية</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">سعر الوحدة</th>
                                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">الإجمالي</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {invoice.items && invoice.items.length > 0 ? (
                                            invoice.items.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-gray-700">
                                                        {item.name || item.product?.name || 'N/A'}
                                                    </td>
                                                    <td className="px-4 py-3 text-center text-sm text-gray-700">
                                                        {item.quantity}
                                                    </td>
                                                    <td className="px-4 py-3 text-left text-sm text-gray-700">
                                                        {item.price?.toFixed(2)} {invoice.bills?.currency}
                                                    </td>
                                                    <td className="px-4 py-3 text-left text-sm font-medium text-gray-900">
                                                        {invoice.bills?.totalWithTax}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                                    لا توجد بنود
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Left Column - Summary & Payment (was right) */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Invoice Summary Card */}
                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 sticky top-24">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">ملخص الفاتورة</h3>
                            
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">رقم الفاتورة:</span>
                                    <span className="font-medium text-blue-600">{invoice.invoiceNumber}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">التاريخ:</span>
                                    <span className="font-medium">{formatDate(invoice.invoiceDate || invoice.createdAt)}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">النوع:</span>
                                    <span className="font-medium">{invoice.invoiceType === 'sale' ? 'مبيعات' : invoice.invoiceType === 'purchase' ? 'مشتريات' : invoice.invoiceType}</span>
                                </div>
                            </div>

                            {/* Payment Summary */}
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium text-gray-700">المجموع الفرعي:</span>
                                    <span className="text-gray-900">{invoice.bills?.total?.toFixed(2)} {invoice.bills?.currency}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium text-gray-700">الضريبة:</span>
                                    <span className="text-gray-900">{invoice.bills?.tax?.toFixed(2)} {invoice.bills?.currency}</span>
                                </div>
                                <div className="flex justify-between mb-2 border-t border-gray-200 pt-2">
                                    <span className="font-bold text-gray-800">الإجمالي:</span>
                                    <span className="font-bold text-lg text-blue-600">{invoice.bills?.totalWithTax?.toFixed(2)} {invoice.bills?.currency}</span>
                                </div>
                                <div className="flex justify-between mb-2 text-green-600">
                                    <span className="font-medium">المدفوع:</span>
                                    <span>{invoice.bills?.payed?.toFixed(2)} {invoice.bills?.currency}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span className="font-medium">الرصيد:</span>
                                    <span>{(invoice.bills?.totalWithTax - invoice.bills?.payed)?.toFixed(2)} {invoice.bills?.currency}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="mt-6 space-y-2">
                                <button
                                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaEdit />
                                    تعديل الفاتورة
                                </button>
                                <button
                                    onClick={(e) => handlePrint(e, invoice)}
                                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaPrint />
                                    طباعة الفاتورة
                                </button>
                                <button
                                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaDownload />
                                    تحميل PDF
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Template - Hidden by default */}
            {selectedInvoice && (
                <div id="print-template" style={{ display: 'none' }}>
                    <div ref={printRef} className="p-8" dir="rtl">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">فاتورة</h1>
                            <h2 className="text-xl text-gray-600 mb-4">{selectedInvoice.invoiceNumber}</h2>
                            <div className="border-b-2 border-gray-300 pb-4">
                                <p className="text-gray-600">التاريخ: {formatDate(selectedInvoice.invoiceDate || selectedInvoice.createdAt)}</p>
                            </div>
                        </div>

                        {/* Customer/Supplier Info */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-gray-700 mb-2">معلومات العميل/المورد:</h3>
                            <p className="text-gray-600">
                                {selectedInvoice.customer?.name || selectedInvoice.supplier?.name || 'N/A'}
                            </p>
                            {selectedInvoice.customer?.email && (
                                <p className="text-gray-600">البريد الإلكتروني: {selectedInvoice.customer.email}</p>
                            )}
                            {selectedInvoice.customer?.phone && (
                                <p className="text-gray-600">الهاتف: {selectedInvoice.customer.phone}</p>
                            )}
                        </div>

                        {/* Invoice Items */}
                        {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                            <div className="mb-6">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-gray-100">
                                            <th className="border p-2 text-right">المنتج</th>
                                            <th className="border p-2 text-center">الكمية</th>
                                            <th className="border p-2 text-left">السعر</th>
                                            <th className="border p-2 text-left">الإجمالي</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedInvoice.items.map((item, idx) => (
                                            <tr key={idx}>
                                                <td className="border p-2">{item.name || item.product?.name || 'N/A'}</td>
                                                <td className="border p-2 text-center">{item.quantity || 0}</td>
                                                <td className="border p-2 text-left">{item.price || 0} {selectedInvoice.bills?.currency}</td>
                                                <td className="border p-2 text-left">{(item.price * item.quantity) || 0} {selectedInvoice.bills?.currency}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Payment Summary */}
                        <div className="flex justify-start mt-8">
                            <div className="w-64">
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium">المجموع الفرعي:</span>
                                    <span>{selectedInvoice.bills?.total?.toFixed(2)} {selectedInvoice.bills?.currency}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium">الضريبة:</span>
                                    <span>{selectedInvoice.bills?.tax?.toFixed(2)} {selectedInvoice.bills?.currency}</span>
                                </div>
                                <div className="flex justify-between mb-2 border-t pt-2">
                                    <span className="font-bold">الإجمالي:</span>
                                    <span className="font-bold text-lg">{selectedInvoice.bills?.totalWithTax?.toFixed(2)} {selectedInvoice.bills?.currency}</span>
                                </div>
                                <div className="flex justify-between mb-2 text-green-600">
                                    <span className="font-medium">المدفوع:</span>
                                    <span>{selectedInvoice.bills?.payed?.toFixed(2)} {selectedInvoice.bills?.currency}</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span className="font-medium">الرصيد:</span>
                                    <span>{(selectedInvoice.bills?.totalWithTax - selectedInvoice.bills?.payed)?.toFixed(2)} {selectedInvoice.bills?.currency}</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-12 text-center text-gray-500 text-sm">
                            <p>شكراً لتعاملكم معنا</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Print Styles */}
            <style jsx>{`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #print-template,
                    #print-template * {
                        visibility: visible;
                    }
                    #print-template {
                        display: block !important;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                    button, .sticky, .bg-gradient-to-r {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default InvDetails;

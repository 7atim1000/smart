import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuPrinterCheck } from "react-icons/lu";
import { FaPlus, FaShoppingCart, FaTruck, FaSearch, FaFilter, FaCalendar, FaFileInvoice, FaUser, FaBuilding, FaDownload, FaChartLine } from "react-icons/fa";
import { MdOutlinePayment, MdOutlineShoppingCart, MdOutlineReceipt } from "react-icons/md";
import { BsThreeDotsVertical, BsEye, BsPrinter } from "react-icons/bs";
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/AuthContext';

const Invoices = () => {
    const { axios } = useContext(AuthContext);
    const navigate = useNavigate();
    const printRef = useRef();

    // State
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totals, setTotals] = useState({
        totalSale: 0,
        totalPurchase: 0,
        netBalance: 0
    });
    const [filters, setFilters] = useState({
        frequency: '',
        type: 'bills',
        invoiceType: '',
        invoiceStatus: '',
        status: '',
        shift: '',
        customer: '',
        supplier: '',
        search: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });
    const [showFilters, setShowFilters] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    // Calculate totals from invoices
    const calculateTotals = (invoicesList) => {
        const totals = invoicesList.reduce((acc, invoice) => {
            const amount = invoice.bills?.totalWithTax || 0;
            
            // Check if it's a sale invoice (customer exists)
            if (invoice.customer) {
                acc.totalSale += amount;
            } 
            // Check if it's a purchase invoice (supplier exists)
            else if (invoice.supplier) {
                acc.totalPurchase += amount;
            }
            
            return acc;
        }, { totalSale: 0, totalPurchase: 0 });
        
        return {
            ...totals,
            netBalance: totals.totalSale - totals.totalPurchase
        };
    };

    // Fetch invoices
    const fetchInvoices = async () => {
        setLoading(true);
        try {
            // Create a clean copy of filters
            const requestBody = { ...filters };
            
            // Handle ObjectId fields - convert empty strings to undefined
            if (requestBody.customer === '') requestBody.customer = undefined;
            if (requestBody.supplier === '') requestBody.supplier = undefined;
            
            // Handle other fields - convert empty strings to undefined
            if (requestBody.invoiceType === '') requestBody.invoiceType = undefined;
            if (requestBody.invoiceStatus === '') requestBody.invoiceStatus = undefined;
            if (requestBody.status === '') requestBody.status = undefined;
            if (requestBody.shift === '') requestBody.shift = undefined;
            if (requestBody.frequency === '') requestBody.frequency = undefined;
            if (requestBody.search === '') requestBody.search = undefined;
            
            // IMPORTANT: Do NOT delete the type field when it's 'bills'
            // Just ensure it's not empty
            if (requestBody.type === '') {
                requestBody.type = undefined;
            }
            // If it's 'bills', keep it - don't delete it!
            
            // Ensure page and limit are numbers
            requestBody.page = Number(requestBody.page) || 1;
            requestBody.limit = Number(requestBody.limit) || 10;
            
            console.log('Sending request for type=bills:', requestBody); // For debugging
            
            // For GET requests, we need to use params, not data
            const response = await axios.get('/v1/api/invoices/', { 
                params: requestBody 
            });
            
            if (response.data.success) {
                const fetchedInvoices = response.data.data || [];
                setInvoices(fetchedInvoices);
                setPagination(response.data.pagination || {
                    page: filters.page,
                    limit: filters.limit,
                    total: fetchedInvoices.length || 0,
                    pages: 1
                });
                
                // Calculate totals from fetched invoices
                const calculatedTotals = calculateTotals(fetchedInvoices);
                setTotals(calculatedTotals);
                
                console.log(`✅ Found ${fetchedInvoices.length} invoices with type='bills'`);
            } else {
                toast.error('فشل جلب الفواتير');
            }
        } catch (error) {
            console.error('Error fetching invoices:', error);
            toast.error('خطأ في تحميل الفواتير');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchInvoices();
    }, [filters.page, filters.limit]);

    // Handle filter change
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1 // Reset to first page on filter change
        }));
    };

    // Handle search
    const handleSearch = () => {
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchInvoices();
    };

    // Handle print
    const handlePrint = (e, invoice) => {
        e.stopPropagation(); // Prevent row click when clicking print button
        setSelectedInvoice(invoice);
        setTimeout(() => {
            window.print();
        }, 100);
    };

    // Handle row click - navigate to invoice details
    const handleRowClick = (invoiceId) => {
        navigate(`/ar/invdetails/${invoiceId}`);
    };

    // Handle options click
    const handleOptionsClick = (e, invoice) => {
        e.stopPropagation(); // Prevent row click
        // Add your options menu logic here
        console.log('Options for invoice:', invoice);
    };

    // Handle download click
    const handleDownloadClick = (e, invoice) => {
        e.stopPropagation(); // Prevent row click
        // Add your download logic here
        console.log('Download invoice:', invoice);
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, '0')}/${
            (d.getMonth() + 1).toString().padStart(2, '0')}/${
            d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${
            d.getMinutes().toString().padStart(2, '0')}`;
    };

    // Get status badge with updated colors
    const getStatusBadge = (status) => {
        const statusStr = String(status || '').toLowerCase();
        
        const statusMap = {
            'quotation': 'bg-orange-100 text-orange-700 border-orange-200', // Orange for Quotation
            'order': 'bg-blue-100 text-blue-700 border-blue-200', // Blue for Order
            'bill': 'bg-green-100 text-green-700 border-green-200', // Green for Bill
            'completed': 'bg-green-100 text-green-700 border-green-200',
            'pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'cancelled': 'bg-red-100 text-red-700 border-red-200',
            'refunded': 'bg-purple-100 text-purple-700 border-purple-200'
        };
        
        // Check for specific status values
        if (statusStr.includes('quotation')) {
            return statusMap.quotation;
        } else if (statusStr.includes('order')) {
            return statusMap.order;
        } else if (statusStr.includes('bill')) {
            return statusMap.bill;
        }
        
        // Default mapping for other statuses
        return statusMap[statusStr] || 'bg-gray-100 text-gray-700 border-gray-200';
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

    // Get invoice type icon
    const getInvoiceTypeIcon = (type) => {
        if (type === 'sale' || type?.includes('sale') || type === 'customersPayment') {
            return <FaShoppingCart className="text-blue-600" />;
        } else if (type === 'purchase' || type?.includes('purchase') || type === 'supplierPayement') {
            return <FaTruck className="text-green-600" />;
        } else if (type === 'payment' || type?.includes('payment')) {
            return <MdOutlinePayment className="text-purple-600" />;
        }
        return <FaFileInvoice className="text-gray-600" />;
    };

    // Get invoice type text in Arabic
    const getInvoiceTypeText = (type) => {
        if (type === 'sale' || type === 'customersPayment') return 'مبيعات';
        if (type === 'purchase' || type === 'supplierPayement') return 'مشتريات';
        if (type === 'payment') return 'دفعة';
        return type || 'N/A';
    };

    return (
        <div className="w-full min-h-screen bg-gray-50" dir="rtl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        {/* Title */}
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-3 rounded-xl">
                                <FaFileInvoice className="text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">الفواتير</h1>
                                <p className="text-blue-200 text-sm">عرض وإدارة جميع الفواتير</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/ar/sales')}
                                className="flex items-center gap-2 bg-gradient-to-br from-white to-white/70 text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md"
                            >
                                <FaShoppingCart />
                                <span>فاتورة مبيعات جديدة</span>
                            </button>
                            <button
                                onClick={() => navigate('/ar/purchases')} 
                                className="flex items-center gap-2 bg-gradient-to-br from-orange-500 to-orange-100 hover:bg-orange-500 text-blue-700 px-6 py-3 rounded-xl transition-all duration-200 font-medium"
                            >
                                <FaTruck />
                                <span>فاتورة مشتريات جديدة</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Total Sale Card */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-green-700 mb-1 font-medium">إجمالي المبيعات</p>
                                <p className="text-3xl font-bold text-green-800">
                                    {totals.totalSale.toFixed(2)} <span className="text-sm font-normal text-green-600">درهم</span>
                                </p>
                            </div>
                            <div className="bg-green-500 p-3 rounded-xl">
                                <FaShoppingCart className="text-white text-2xl" />
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-green-600">
                            إجمالي جميع فواتير المبيعات
                        </div>
                    </div>

                    {/* Total Purchase Card */}
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-orange-700 mb-1 font-medium">إجمالي المشتريات</p>
                                <p className="text-3xl font-bold text-orange-800">
                                    {totals.totalPurchase.toFixed(2)} <span className="text-sm font-normal text-orange-600">درهم</span>
                                </p>
                            </div>
                            <div className="bg-orange-500 p-3 rounded-xl">
                                <FaTruck className="text-white text-2xl" />
                            </div>
                        </div>
                        <div className="mt-2 text-xs text-orange-600">
                            إجمالي جميع فواتير المشتريات
                        </div>
                    </div>

                    {/* Net Balance Card */}
                    <div className={`bg-gradient-to-br rounded-2xl p-6 border shadow-lg ${
                        totals.netBalance >= 0 
                            ? 'from-blue-50 to-blue-100 border-blue-200' 
                            : 'from-red-50 to-red-100 border-red-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className={`text-sm mb-1 font-medium ${
                                    totals.netBalance >= 0 ? 'text-blue-700' : 'text-red-700'
                                }`}>
                                    صافي الرصيد (المبيعات - المشتريات)
                                </p>
                                <p className={`text-3xl font-bold ${
                                    totals.netBalance >= 0 ? 'text-blue-800' : 'text-red-800'
                                }`}>
                                    {Math.abs(totals.netBalance).toFixed(2)} <span className={`text-sm font-normal ${
                                        totals.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'
                                    }`}>درهم</span>
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${
                                totals.netBalance >= 0 ? 'bg-blue-500' : 'bg-red-500'
                            }`}>
                                <FaChartLine className="text-white text-2xl" />
                            </div>
                        </div>
                        <div className={`mt-2 text-xs ${
                            totals.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'
                        }`}>
                            {totals.netBalance >= 0 
                                ? 'المبيعات تفوق المشتريات' 
                                : 'المشتريات تفوق المبيعات'}
                        </div>
                    </div>
                </div>

                {/* Filters Card */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
                    <div 
                        className="px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between cursor-pointer"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <div className="flex items-center gap-2">
                            <FaFilter />
                            <span className="font-medium">خيارات البحث والتصفية</span>
                        </div>
                        <span>{showFilters ? '▲' : '▼'}</span>
                    </div>
                    
                    {showFilters && (
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Search */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        بحث
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="search"
                                            value={filters.search}
                                            onChange={handleFilterChange}
                                            placeholder="رقم الفاتورة، العميل..."
                                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <FaSearch className="absolute right-3 top-3 text-gray-400" />
                                    </div>
                                </div>

                                {/* Invoice Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        نوع الفاتورة
                                    </label>
                                    <select
                                        name="invoiceType"
                                        value={filters.invoiceType}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">الكل</option>
                                        <option value="sale">مبيعات</option>
                                        <option value="purchase">مشتريات</option>
                                        <option value="payment">مدفوعات</option>
                                    </select>
                                </div>

                                {/* Status */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الحالة
                                    </label>
                                    <select
                                        name="status"
                                        value={filters.status}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">الكل</option>
                                        <option value="quotation">عرض سعر</option>
                                        <option value="order">طلب</option>
                                        <option value="bill">فاتورة</option>
                                    </select>
                                </div>

                                {/* Date Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الفترة
                                    </label>
                                    <select
                                        name="frequency"
                                        value={filters.frequency}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">الكل</option>
                                        <option value="today">اليوم</option>
                                        <option value="week">هذا الأسبوع</option>
                                        <option value="month">هذا الشهر</option>
                                        <option value="year">هذه السنة</option>
                                    </select>
                                </div>
                            </div>

                            {/* Search Button */}
                            <div className="mt-4 flex justify-start">
                                <button
                                    onClick={handleSearch}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-all duration-200"
                                >
                                    <FaSearch />
                                    <span>بحث</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Invoices Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">#</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">نوع الفاتورة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">رقم الفاتورة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">العميل/المورد</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الإجمالي</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">المدفوع</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                            <p className="mt-2 text-gray-500">جاري التحميل...</p>
                                        </td>
                                    </tr>
                                ) : invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan="9" className="px-6 py-12 text-center">
                                            <FaFileInvoice className="mx-auto text-5xl text-gray-400 mb-3" />
                                            <p className="text-gray-500">لا توجد فواتير</p>
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((invoice, index) => (
                                        <tr 
                                            key={invoice._id} 
                                            className="hover:bg-blue-50 transition-colors cursor-pointer"
                                            onClick={() => handleRowClick(invoice._id)}
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {(pagination.page - 1) * pagination.limit + index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {getInvoiceTypeIcon(invoice.invoiceType)}
                                                    <span className="text-sm text-gray-700">
                                                        {getInvoiceTypeText(invoice.invoiceType)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-blue-600">
                                                    {invoice.invoiceNumber || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {invoice.customer ? <FaUser className="text-gray-400" /> : <FaBuilding className="text-gray-400" />}
                                                    <span className="text-sm text-gray-700">
                                                        {invoice.customer?.name || invoice.supplier?.name || 'N/A'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {formatDate(invoice.invoiceDate || invoice.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-gray-900">
                                                    {invoice.bills?.totalWithTax?.toFixed(2) || '0.00'} 
                                                    <span className="text-xs text-gray-500 mr-1">
                                                        {invoice.bills?.currency || 'AED'}
                                                    </span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-green-600 font-medium">
                                                    {invoice.bills?.payed?.toFixed(2) || '0.00'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadge(invoice.status || invoice.invoiceStatus)}`}>
                                                    {getStatusText(invoice.status || invoice.invoiceStatus)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {/* <button
                                                        onClick={(e) => handlePrint(e, invoice)}
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="طباعة"
                                                    >
                                                        <LuPrinterCheck size={18} />
                                                    </button> */}
                                                    <button
                                                        onClick={(e) => handleDownloadClick(e, invoice)}
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="تحميل"
                                                    >
                                                        <FaDownload size={18} />
                                                    </button>
                                                    <button
                                                        // onClick={(e) => handleOptionsClick(e, invoice)}
                                                        onClick={() => handleRowClick(invoice._id)}
                                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                        title="خيارات"
                                                    >
                                                        <BsThreeDotsVertical size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            {/* Table Footer with Totals */}
                            {!loading && invoices.length > 0 && (
                                <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                                    <tr>
                                        <td colSpan="5" className="px-6 py-4 text-left font-bold text-gray-700">
                                            إجمالي الصفحة:
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-gray-900">
                                                {invoices.reduce((sum, inv) => sum + (inv.bills?.totalWithTax || 0), 0).toFixed(2)} درهم
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-green-600">
                                                {invoices.reduce((sum, inv) => sum + (inv.bills?.payed || 0), 0).toFixed(2)} درهم
                                            </span>
                                        </td>
                                        <td colSpan="2"></td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                عرض {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} من {pagination.total}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                    disabled={pagination.page === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    السابق
                                </button>
                                <span className="px-4 py-1 bg-blue-600 text-white rounded-lg">
                                    {pagination.page}
                                </span>
                                <button
                                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                    disabled={pagination.page === pagination.pages}
                                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    )}
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

export default Invoices;


import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { 
    FaPlus, FaSearch, FaFilter, FaFileInvoice, 
    FaUser, FaBuilding, FaCalendar, FaMoneyBillWave,
    FaEye, FaPrint, FaDownload, FaArrowLeft
} from 'react-icons/fa';
import { MdOutlinePayment } from 'react-icons/md';
import { BsThreeDotsVertical } from 'react-icons/bs';
import AddTransaction from '../components/transactions/AddTransaction';

// Currency options
const currencies = [
    { code: 'AED', name: 'درهم إماراتي', flag: '🇦🇪' },
    { code: 'USD', name: 'دولار أمريكي', flag: '🇺🇸' },
    { code: 'SDG', name: 'جنيه سوداني', flag: '🇸🇩' },
    { code: 'EGP', name: 'جنيه مصري', flag: '🇪🇬' },
    { code: 'EUR', name: 'يورو', flag: '🇪🇺' },
    { code: 'GBP', name: 'جنيه إسترليني', flag: '🇬🇧' },
    { code: 'SAR', name: 'ريال سعودي', flag: '🇸🇦' },
    { code: 'QAR', name: 'ريال قطري', flag: '🇶🇦' },
    { code: 'KWD', name: 'دينار كويتي', flag: '🇰🇼' },
    { code: 'JOD', name: 'دينار أردني', flag: '🇯🇴' }
];

const Transactions = () => {
    const { axios } = useContext(AuthContext);
    const navigate = useNavigate();

    // State
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        account: '',
        currency: '',
        shift: '',
        paymentMethod: '',
        startDate: '',
        endDate: '',
        search: '',
        page: 1,
        limit: 10
    });
    const [pagination, setPagination] = useState({
        currentPage: 1,
        limit: 10,
        totalTransactions: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false
    });
    const [showFilters, setShowFilters] = useState(false);

    // Fetch transactions
    const fetchTransactions = async () => {
        setLoading(true);
        try {
            // Build query parameters
            const params = new URLSearchParams();
            
            // Add pagination
            params.append('page', filters.page.toString());
            params.append('limit', filters.limit.toString());
            
            // Add search if exists
            if (filters.search) {
                params.append('search', filters.search);
            }
            
            // Add filters if they have values
            if (filters.type) params.append('type', filters.type);
            if (filters.status) params.append('status', filters.status);
            if (filters.account) params.append('account', filters.account);
            if (filters.currency) params.append('currency', filters.currency);
            if (filters.shift) params.append('shift', filters.shift);
            if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
            if (filters.startDate) params.append('startDate', filters.startDate);
            if (filters.endDate) params.append('endDate', filters.endDate);
            
            console.log('Fetching transactions with params:', params.toString());
            
            const response = await axios.get(`/v1/api/transactions?${params.toString()}`);
            
            if (response.data.success) {
                // Access transactions from data.data.transactions (nested structure)
                const transactionsData = response.data.data?.transactions || [];
                const paginationData = response.data.data?.pagination || {};
                
                setTransactions(transactionsData);
                setPagination({
                    currentPage: paginationData.currentPage || filters.page,
                    limit: paginationData.limit || filters.limit,
                    totalTransactions: paginationData.totalTransactions || 0,
                    totalPages: paginationData.totalPages || 1,
                    hasNextPage: paginationData.hasNextPage || false,
                    hasPrevPage: paginationData.hasPrevPage || false
                });
                
                console.log(`✅ Found ${transactionsData.length} transactions`);
            } else {
                toast.error('فشل في جلب المعاملات');
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('خطأ في تحميل المعاملات');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchTransactions();
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
        fetchTransactions();
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setFilters(prev => ({ ...prev, page: newPage }));
        }
    };

    // Handle back navigation
    const handleBack = () => {
        navigate(-1);
    };

    // Format date in Arabic format
    const formatDate = (date) => {
        if (!date) return 'غير متوفر';
        const d = new Date(date);
        return d.toLocaleDateString('ar-SA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format currency
    const formatCurrency = (amount, currency = 'AED') => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Get currency name in Arabic
    const getCurrencyName = (code) => {
        const currency = currencies.find(c => c.code === code);
        return currency ? currency.name : code;
    };

    // Get transaction type badge
    const getTransactionTypeBadge = (type) => {
        const typeMap = {
            'Credit': 'bg-green-100 text-green-700 border-green-200',
            'Debit': 'bg-red-100 text-red-700 border-red-200'
        };
        return typeMap[type] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // Get transaction type in Arabic
    const getTransactionTypeArabic = (type) => {
        const typeMap = {
            'Credit': 'دائن',
            'Debit': 'مدين'
        };
        return typeMap[type] || type;
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusMap = {
            'Completed': 'bg-green-100 text-green-700 border-green-200',
            'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Failed': 'bg-red-100 text-red-700 border-red-200'
        };
        return statusMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    // Get status in Arabic
    const getStatusArabic = (status) => {
        const statusMap = {
            'Completed': 'مكتمل',
            'Pending': 'قيد الانتظار',
            'Failed': 'فشل'
        };
        return statusMap[status] || status;
    };

    return (
        <div className="min-h-screen bg-gray-50" dir="rtl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        {/* Title and Back Button */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all duration-200 text-white"
                                title="رجوع"
                            >
                                <FaArrowLeft size={20} />
                            </button>
                            <div className="bg-white/20 p-3 rounded-xl">
                                <FaMoneyBillWave className="text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">المعاملات المالية</h1>
                                <p className="text-blue-200 text-sm">عرض وإدارة جميع المعاملات المالية</p>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl transition-all duration-200 font-medium shadow-md"
                            >
                                <FaPlus />
                                <span>إضافة معاملة</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
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
                                            placeholder="رقم المعاملة، الوصف..."
                                            className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <FaSearch className="absolute right-3 top-3 text-gray-400" />
                                    </div>
                                </div>

                                {/* Transaction Type */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        نوع المعاملة
                                    </label>
                                    <select
                                        name="type"
                                        value={filters.type}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">الكل</option>
                                        <option value="Credit">دائن</option>
                                        <option value="Debit">مدين</option>
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
                                        <option value="Completed">مكتمل</option>
                                        <option value="Pending">قيد الانتظار</option>
                                        <option value="Failed">فشل</option>
                                    </select>
                                </div>

                                {/* Currency - Updated with all currencies */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        العملة
                                    </label>
                                    <select
                                        name="currency"
                                        value={filters.currency}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">الكل</option>
                                        {currencies.map(currency => (
                                            <option key={currency.code} value={currency.code}>
                                                {currency.flag} {currency.code} - {currency.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Payment Method */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        طريقة الدفع
                                    </label>
                                    <select
                                        name="paymentMethod"
                                        value={filters.paymentMethod}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">الكل</option>
                                        <option value="Cash">نقدي</option>
                                        <option value="Bank Transfer">تحويل بنكي</option>
                                        <option value="Cheque">شيك</option>
                                        <option value="Credit Card">بطاقة ائتمان</option>
                                    </select>
                                </div>

                                {/* Shift */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        الوردية
                                    </label>
                                    <select
                                        name="shift"
                                        value={filters.shift}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">الكل</option>
                                        <option value="Morning">صباحية</option>
                                        <option value="Evening">مسائية</option>
                                    </select>
                                </div>

                                {/* Date Range - Start */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        من تاريخ
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        value={filters.startDate}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Date Range - End */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        إلى تاريخ
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        value={filters.endDate}
                                        onChange={handleFilterChange}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
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

                {/* Transactions Table */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">#</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">رقم المعاملة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">النوع</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الحالة</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">الوصف</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">المبلغ</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">طريقة الدفع</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">العملة</th>
                                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center">
                                            <div className="flex justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            </div>
                                            <p className="mt-2 text-gray-500">جاري التحميل...</p>
                                        </td>
                                    </tr>
                                ) : transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="10" className="px-6 py-12 text-center">
                                            <FaMoneyBillWave className="mx-auto text-5xl text-gray-400 mb-3" />
                                            <p className="text-gray-500">لا توجد معاملات</p>
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.map((transaction, index) => (
                                        <tr 
                                            key={transaction._id} 
                                            className="hover:bg-blue-50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {((pagination.currentPage - 1) * pagination.limit) + index + 1}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-blue-600">
                                                    {transaction.transactionNumber || 'غير متوفر'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-600">
                                                    {formatDate(transaction.date || transaction.createdAt)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs rounded-full border ${getTransactionTypeBadge(transaction.type)}`}>
                                                    {getTransactionTypeArabic(transaction.type)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 text-xs rounded-full border ${getStatusBadge(transaction.status)}`}>
                                                    {getStatusArabic(transaction.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700 truncate max-w-xs">
                                                    {transaction.description || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-left">
                                                <span className={`text-sm font-bold ${
                                                    transaction.type === 'Credit' 
                                                        ? 'text-green-600' 
                                                        : 'text-red-600'
                                                }`}>
                                                    {formatCurrency(transaction.amount, transaction.currency)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">
                                                    {transaction.paymentMethod || 'نقدي'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">
                                                    {getCurrencyName(transaction.currency)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="عرض"
                                                    >
                                                        <FaEye size={18} />
                                                    </button>
                                                    <button
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="طباعة"
                                                    >
                                                        <FaPrint size={18} />
                                                    </button>
                                                    <button
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
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <div className="text-sm text-gray-600">
                                عرض {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalTransactions)} من {pagination.totalTransactions}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                                    disabled={!pagination.hasPrevPage}
                                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    السابق
                                </button>
                                <span className="px-4 py-1 bg-blue-600 text-white rounded-lg">
                                    {pagination.currentPage}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                                    disabled={!pagination.hasNextPage}
                                    className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                >
                                    التالي
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Transaction Modal */}
            {showAddModal && (
                <AddTransaction
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        fetchTransactions();
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default Transactions;

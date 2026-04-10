import React, { useState, useContext, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IoCloseCircle } from 'react-icons/io5';
import { FaMoneyBillWave, FaSave, FaTimes, FaSearch } from 'react-icons/fa';
import { AuthContext } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';

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

const AddTransaction = ({ onClose, onSuccess }) => {
    const { axios } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedPaymentAccount, setSelectedPaymentAccount] = useState(null);
    
    // Search states
    const [accountSearchTerm, setAccountSearchTerm] = useState('');
    const [paymentAccountSearchTerm, setPaymentAccountSearchTerm] = useState('');
    
    const [formData, setFormData] = useState({
        amount: '',
        type: 'Income',
        account: '',
        paymentAccount: '', // Changed from paymentMethod to paymentAccount
        currency: 'AED',
        refrence: '',
        description: '',
        status: 'Completed',
        date: new Date().toISOString().split('T')[0]
    });

    // RTL and Arabic text
    const isRTL = true;
    const arabicText = {
        selectAccount: 'اختر الحساب',
        selectPaymentAccount: 'اختر حساب الدفع',
        searchAccount: 'بحث عن حساب',
        searchPaymentAccount: 'بحث عن حساب الدفع',
        loading: 'جاري التحميل...',
        noAccounts: 'لا توجد حسابات متاحة'
    };

    // Fetch all accounts from chart of accounts
    const fetchAllAccounts = async (search = '') => {
        setLoadingAccounts(true);
        try {
            const url = search 
                ? `/v1/api/chart/accounts/all?search=${encodeURIComponent(search)}`
                : '/v1/api/chart/accounts/all';
            
            const response = await axios.get(url);
            if (response.data.success) {
                setAccounts(response.data.accounts || []);
                console.log('All accounts fetched:', response.data.accounts);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error(isRTL ? 'فشل تحميل الحسابات' : 'Failed to load accounts');
        } finally {
            setLoadingAccounts(false);
        }
    };

    // Fetch accounts on component mount
    useEffect(() => {
        fetchAllAccounts();
    }, []);

    // Filter accounts based on search term for main account
    const filteredAccounts = accounts.filter(account => {
        if (!accountSearchTerm) return true;
        
        const searchLower = accountSearchTerm.toLowerCase();
        const accountCode = account.code?.toLowerCase() || '';
        const accountName = account.name?.toLowerCase() || '';
        const accountNameArb = account.nameArb || '';
        
        return accountCode.includes(searchLower) ||
               accountName.includes(searchLower) ||
               accountNameArb.includes(accountSearchTerm);
    });

    // Filter accounts based on search term for payment account
    const filteredPaymentAccounts = accounts.filter(account => {
        if (!paymentAccountSearchTerm) return true;
        
        const searchLower = paymentAccountSearchTerm.toLowerCase();
        const accountCode = account.code?.toLowerCase() || '';
        const accountName = account.name?.toLowerCase() || '';
        const accountNameArb = account.nameArb || '';
        
        return accountCode.includes(searchLower) ||
               accountName.includes(searchLower) ||
               accountNameArb.includes(paymentAccountSearchTerm);
    });

    // Handle account selection
    const handleAccountSelect = (account) => {
        setSelectedAccount(account);
        setFormData(prev => ({ ...prev, account: account._id }));
    };

    // Handle payment account selection
    const handlePaymentAccountSelect = (account) => {
        setSelectedPaymentAccount(account);
        setFormData(prev => ({ ...prev, paymentAccount: account._id }));
    };

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle number input change
    const handleNumberChange = (e) => {
        const { name, value } = e.target;
        if (value === '' || /^\d*\.?\d*$/.test(value)) {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle submit
    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error('الرجاء إدخال مبلغ صحيح');
            return;
        }

        if (!formData.account) {
            toast.error('الرجاء اختيار الحساب الرئيسي');
            return;
        }

        if (!formData.paymentAccount) {
            toast.error('الرجاء اختيار حساب الدفع');
            return;
        }

        setLoading(true);

        try {
            // Prepare transaction data - sending both fields to satisfy backend
            const transactionData = {
                amount: parseFloat(formData.amount),
                type: formData.type,
                account: formData.account,
                paymentAccount: formData.paymentAccount, // Keep this for your reference
                paymentMethod: 'Cash', // Add default paymentMethod for backend
                currency: formData.currency,
                refrence: formData.refrence || undefined,
                description: formData.description || '-',
                status: formData.status,
                date: formData.date
            };

            console.log('Sending transaction data:', transactionData);

            // Send to API
            const response = await axios.post('/v1/api/transactions/', transactionData);

            if (response.data.success) {
                toast.success('تم إضافة المعاملة بنجاح');
                if (onSuccess) onSuccess();
            } else {
                toast.error(response.data.message || 'فشل في إضافة المعاملة');
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
            toast.error(error.response?.data?.message || 'خطأ في إضافة المعاملة');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-2xl border border-blue-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-lg">
                            <FaMoneyBillWave className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">إضافة معاملة جديدة</h2>
                            <p className="text-blue-100 text-sm">أدخل تفاصيل المعاملة المالية</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer"
                        aria-label="إغلاق"
                    >
                        <IoCloseCircle size={28} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Amount and Type Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    المبلغ <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="amount"
                                    value={formData.amount}
                                    onChange={handleNumberChange}
                                    placeholder="0.00"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Transaction Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    نوع المعاملة <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="Income">دخل</option>
                                    <option value="Expense">مصروف</option>
                                </select>
                            </div>
                        </div>

                        {/* Main Account Selection with Search */}
                        <div className="space-y-3">
                            {/* Main Account Search */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {arabicText.searchAccount}
                                </label>
                                <input
                                    type="text"
                                    value={accountSearchTerm}
                                    onChange={(e) => setAccountSearchTerm(e.target.value)}
                                    placeholder={isRTL ? 'بحث عن حساب...' : 'Search accounts...'}
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <FaSearch className="absolute left-3 top-9 transform -translate-y-1/2 text-gray-400" />
                            </div>

                            {/* Main Account Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {arabicText.selectAccount} <span className="text-red-500">*</span>
                                </label>
                                {loadingAccounts ? (
                                    <div className="text-center py-3 border border-gray-300 rounded-xl">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-xs text-gray-500 mt-1">{arabicText.loading}</p>
                                    </div>
                                ) : (
                                    <select
                                        value={selectedAccount?._id || ''}
                                        onChange={(e) => {
                                            const account = filteredAccounts.find(a => a._id === e.target.value);
                                            if (account) handleAccountSelect(account);
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">
                                            {filteredAccounts.length === 0 ? arabicText.noAccounts : arabicText.selectAccount}
                                        </option>
                                        {filteredAccounts.map(account => (
                                            <option key={account._id} value={account._id}>
                                                {account.code ? `${account.code} - ` : ''}
                                                {isRTL ? (account.nameArb || account.name) : account.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {filteredAccounts.length === 0 && !loadingAccounts && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {arabicText.noAccounts}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Reference Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                المرجع
                            </label>
                            <input
                                type="text"
                                name="refrence"
                                value={formData.refrence}
                                onChange={handleChange}
                                placeholder="رقم المرجع (اختياري)"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Payment Account Selection with Search */}
                        <div className="space-y-3">
                            {/* Payment Account Search */}
                            <div className="relative">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {arabicText.searchPaymentAccount}
                                </label>
                                <input
                                    type="text"
                                    value={paymentAccountSearchTerm}
                                    onChange={(e) => setPaymentAccountSearchTerm(e.target.value)}
                                    placeholder={isRTL ? 'بحث عن حساب الدفع...' : 'Search payment accounts...'}
                                    className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <FaSearch className="absolute left-3 top-9 transform -translate-y-1/2 text-gray-400" />
                            </div>

                            {/* Payment Account Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {arabicText.selectPaymentAccount} <span className="text-red-500">*</span>
                                </label>
                                {loadingAccounts ? (
                                    <div className="text-center py-3 border border-gray-300 rounded-xl">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                                        <p className="text-xs text-gray-500 mt-1">{arabicText.loading}</p>
                                    </div>
                                ) : (
                                    <select
                                        value={selectedPaymentAccount?._id || ''}
                                        onChange={(e) => {
                                            const account = filteredPaymentAccounts.find(a => a._id === e.target.value);
                                            if (account) handlePaymentAccountSelect(account);
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">
                                            {filteredPaymentAccounts.length === 0 ? arabicText.noAccounts : arabicText.selectPaymentAccount}
                                        </option>
                                        {filteredPaymentAccounts.map(account => (
                                            <option key={account._id} value={account._id}>
                                                {account.code ? `${account.code} - ` : ''}
                                                {isRTL ? (account.nameArb || account.name) : account.name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                                {filteredPaymentAccounts.length === 0 && !loadingAccounts && (
                                    <p className="text-xs text-red-500 mt-1">
                                        {arabicText.noAccounts}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Currency */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                العملة <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="currency"
                                value={formData.currency}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                {currencies.map(currency => (
                                    <option key={currency.code} value={currency.code}>
                                        {currency.flag} {currency.code} - {currency.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status and Date Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    الحالة
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="Completed">مكتمل</option>
                                    <option value="Pending">قيد الانتظار</option>
                                    <option value="Failed">فشل</option>
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    التاريخ
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                الوصف
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="أدخل وصف المعاملة..."
                                rows="3"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Summary */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                            <h3 className="font-semibold text-blue-800 mb-3">ملخص المعاملة</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">النوع:</span>
                                    <span className="mr-2 font-medium text-gray-800">
                                        {formData.type === 'Income' ? 'دخل' : 'مصروف'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">المبلغ:</span>
                                    <span className="mr-2 font-medium text-blue-600">
                                        {formData.amount || '0'} {formData.currency}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">الحساب الرئيسي:</span>
                                    <span className="mr-2 font-medium text-gray-800">
                                        {selectedAccount ? (selectedAccount.nameArb || selectedAccount.name) : 'غير محدد'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-600">حساب الدفع:</span>
                                    <span className="mr-2 font-medium text-gray-800">
                                        {selectedPaymentAccount ? (selectedPaymentAccount.nameArb || selectedPaymentAccount.name) : 'غير محدد'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading || loadingAccounts}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        جاري الحفظ...
                                    </>
                                ) : (
                                    <>
                                        <FaSave />
                                        حفظ المعاملة
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FaTimes />
                                إلغاء
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-white">
                    <p className="text-xs text-gray-500 text-center">
                        الحقول المميزة بعلامة <span className="text-red-500">*</span> مطلوبة
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AddTransaction;

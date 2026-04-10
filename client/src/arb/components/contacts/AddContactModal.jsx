import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { IoCloseCircle } from 'react-icons/io5';
import { 
    FaPlus, FaSave, FaTimes, FaUser, FaEnvelope, 
    FaPhone, FaMapMarkerAlt, FaSearch, FaCheck,
    FaShoppingCart, FaMoneyBillWave, FaBalanceScale,
    FaUserTie, FaBuilding
} from 'react-icons/fa';
import { BiPurchaseTag, BiUser, BiBuilding } from 'react-icons/bi';
import { MdEmail, MdPhone, MdLocationOn, MdAccountBalance } from 'react-icons/md';
import { GiTakeMyMoney, GiPayMoney, GiReceiveMoney } from 'react-icons/gi';

const AddContactModal = ({ setIsAddModalOpen, fetchContacts }) => {
    const { axios } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'receivable', 'payable'
    
    // Accounts list
    const [accounts, setAccounts] = useState([]);
    const [accountSearchTerm, setAccountSearchTerm] = useState('');
    const [selectedReceivableAccount, setSelectedReceivableAccount] = useState(null);
    const [selectedPayableAccount, setSelectedPayableAccount] = useState(null);
    
    const [formData, setFormData] = useState({
        // Basic Information
        email: '',
        name: '',
        phone: '',
        address: '',
        isReceivable: true,
        isPayable: true,
        
        // Receivable Account Information (English)
        accReceivableName: '',
        accReceivableGroup: '',
        accReceivableClass: '',
        accReceivableLevel: '',
        accReceivableChart: '',
        accReceivableType: '',
        
        // Receivable Account Information (Arabic)
        accReceivableNameArb: '',
        accReceivableGroupArb: '',
        accReceivableClassArb: '',
        accReceivableLevelArb: '',
        accReceivableChartArb: '',
        
        // Payable Account Information (English)
        accPayableName: '',
        accPayableGroup: '',
        accPayableClass: '',
        accPayableLevel: '',
        accPayableChart: '',
        accPayableType: '',
        
        // Payable Account Information (Arabic)
        accPayableNameArb: '',
        accPayableGroupArb: '',
        accPayableClassArb: '',
        accPayableLevelArb: '',
        accPayableChartArb: ''
    });

    const [formErrors, setFormErrors] = useState({});
    const inputRef = useRef(null);

    // Focus on first input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Fetch all accounts
    const fetchAllAccounts = async (search = '') => {
        setLoadingAccounts(true);
        try {
            const url = search 
                ? `/v1/api/chart/accounts/all?search=${encodeURIComponent(search)}`
                : '/v1/api/chart/accounts/all';
            
            const response = await axios.get(url);
            if (response.data.success) {
                setAccounts(response.data.accounts || []);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error('فشل تحميل الحسابات');
        } finally {
            setLoadingAccounts(false);
        }
    };

    // Fetch accounts on mount
    useEffect(() => {
        fetchAllAccounts();
    }, []);

    // Debounced search for accounts
    useEffect(() => {
        const timer = setTimeout(() => {
            if (accountSearchTerm) {
                fetchAllAccounts(accountSearchTerm);
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [accountSearchTerm]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        
        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handle receivable account selection - Arabic first
    const handleReceivableAccountSelect = (account) => {
        setSelectedReceivableAccount(account);
        setFormData(prev => ({
            ...prev,
            // English fields
            accReceivableName: account.name,
            accReceivableGroup: account.group?.name || '',
            accReceivableClass: account.class?.name || account.group?.class?.name || '',
            accReceivableLevel: account.level?.name || '',
            accReceivableChart: account.chart?.name || '',
            accReceivableType: account.type || determineAccountType(account),
            
            // Arabic fields - using account's Arabic names
            accReceivableNameArb: account.nameArb || account.name,
            accReceivableGroupArb: account.group?.nameArb || account.group?.name || '',
            accReceivableClassArb: account.class?.nameArb || account.group?.class?.nameArb || account.class?.name || '',
            accReceivableLevelArb: account.level?.nameArb || account.level?.name || '',
            accReceivableChartArb: account.chart?.nameArb || account.chart?.name || ''
        }));
        setAccountSearchTerm('');
    };

    // Handle payable account selection - Arabic first
    const handlePayableAccountSelect = (account) => {
        setSelectedPayableAccount(account);
        setFormData(prev => ({
            ...prev,
            // English fields
            accPayableName: account.name,
            accPayableGroup: account.group?.name || '',
            accPayableClass: account.class?.name || account.group?.class?.name || '',
            accPayableLevel: account.level?.name || '',
            accPayableChart: account.chart?.name || '',
            accPayableType: account.type || determineAccountType(account),
            
            // Arabic fields - using account's Arabic names
            accPayableNameArb: account.nameArb || account.name,
            accPayableGroupArb: account.group?.nameArb || account.group?.name || '',
            accPayableClassArb: account.class?.nameArb || account.group?.class?.nameArb || account.class?.name || '',
            accPayableLevelArb: account.level?.nameArb || account.level?.name || '',
            accPayableChartArb: account.chart?.nameArb || account.chart?.name || ''
        }));
        setAccountSearchTerm('');
    };

    // Determine account type based on chart
    const determineAccountType = (account) => {
        const chartName = account.chart?.name || '';
        if (chartName.includes('Asset')) return 'Asset';
        if (chartName.includes('Liability')) return 'Liability';
        if (chartName.includes('Equity')) return 'Equity';
        if (chartName.includes('Revenue')) return 'Revenue';
        if (chartName.includes('Expense')) return 'Expense';
        return 'General';
    };

    const validateForm = () => {
        const errors = {};
        
        // Basic Information validation
        if (!formData.name.trim()) {
            errors.name = 'الاسم مطلوب';
        }
        
        if (!formData.email.trim()) {
            errors.email = 'البريد الإلكتروني مطلوب';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = 'صيغة البريد الإلكتروني غير صالحة';
            }
        }
        
        if (!formData.phone.trim()) {
            errors.phone = 'رقم الهاتف مطلوب';
        }
        
        if (!formData.address.trim()) {
            errors.address = 'العنوان مطلوب';
        }
        
        // Boolean validation
        if (typeof formData.isReceivable !== 'boolean') {
            errors.isReceivable = 'حالة القبض مطلوبة';
        }
        
        if (typeof formData.isPayable !== 'boolean') {
            errors.isPayable = 'حالة الدفع مطلوبة';
        }
        
        // Receivable Account validation (if receivable is enabled)
        if (formData.isReceivable) {
            // English fields
            if (!formData.accReceivableName.trim()) errors.accReceivableName = 'اسم حساب القبض مطلوب';
            if (!formData.accReceivableGroup.trim()) errors.accReceivableGroup = 'مجموعة حساب القبض مطلوبة';
            if (!formData.accReceivableClass.trim()) errors.accReceivableClass = 'تصنيف حساب القبض مطلوب';
            if (!formData.accReceivableLevel.trim()) errors.accReceivableLevel = 'مستوى حساب القبض مطلوب';
            if (!formData.accReceivableChart.trim()) errors.accReceivableChart = 'دليل حساب القبض مطلوب';
            if (!formData.accReceivableType.trim()) errors.accReceivableType = 'نوع حساب القبض مطلوب';
            
            // Arabic fields
            if (!formData.accReceivableNameArb.trim()) errors.accReceivableNameArb = 'اسم حساب القبض بالعربية مطلوب';
            if (!formData.accReceivableGroupArb.trim()) errors.accReceivableGroupArb = 'مجموعة حساب القبض بالعربية مطلوبة';
            if (!formData.accReceivableClassArb.trim()) errors.accReceivableClassArb = 'تصنيف حساب القبض بالعربية مطلوب';
            if (!formData.accReceivableLevelArb.trim()) errors.accReceivableLevelArb = 'مستوى حساب القبض بالعربية مطلوب';
            if (!formData.accReceivableChartArb.trim()) errors.accReceivableChartArb = 'دليل حساب القبض بالعربية مطلوب';
        }
        
        // Payable Account validation (if payable is enabled)
        if (formData.isPayable) {
            // English fields
            if (!formData.accPayableName.trim()) errors.accPayableName = 'اسم حساب الدفع مطلوب';
            if (!formData.accPayableGroup.trim()) errors.accPayableGroup = 'مجموعة حساب الدفع مطلوبة';
            if (!formData.accPayableClass.trim()) errors.accPayableClass = 'تصنيف حساب الدفع مطلوب';
            if (!formData.accPayableLevel.trim()) errors.accPayableLevel = 'مستوى حساب الدفع مطلوب';
            if (!formData.accPayableChart.trim()) errors.accPayableChart = 'دليل حساب الدفع مطلوب';
            if (!formData.accPayableType.trim()) errors.accPayableType = 'نوع حساب الدفع مطلوب';
            
            // Arabic fields
            if (!formData.accPayableNameArb.trim()) errors.accPayableNameArb = 'اسم حساب الدفع بالعربية مطلوب';
            if (!formData.accPayableGroupArb.trim()) errors.accPayableGroupArb = 'مجموعة حساب الدفع بالعربية مطلوبة';
            if (!formData.accPayableClassArb.trim()) errors.accPayableClassArb = 'تصنيف حساب الدفع بالعربية مطلوب';
            if (!formData.accPayableLevelArb.trim()) errors.accPayableLevelArb = 'مستوى حساب الدفع بالعربية مطلوب';
            if (!formData.accPayableChartArb.trim()) errors.accPayableChartArb = 'دليل حساب الدفع بالعربية مطلوب';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('الرجاء تصحيح الأخطاء قبل الإرسال');
            return;
        }
        
        setIsLoading(true);

        try {
            const contactData = {
                email: formData.email.trim(),
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                address: formData.address.trim(),
                isReceivable: formData.isReceivable,
                isPayable: formData.isPayable,
                
                // Receivable Account Information (English)
                accReceivableName: formData.accReceivableName.trim(),
                accReceivableGroup: formData.accReceivableGroup.trim(),
                accReceivableClass: formData.accReceivableClass.trim(),
                accReceivableLevel: formData.accReceivableLevel.trim(),
                accReceivableChart: formData.accReceivableChart.trim(),
                accReceivableType: formData.accReceivableType.trim(),
                
                // Receivable Account Information (Arabic)
                accReceivableNameArb: formData.accReceivableNameArb.trim(),
                accReceivableGroupArb: formData.accReceivableGroupArb.trim(),
                accReceivableClassArb: formData.accReceivableClassArb.trim(),
                accReceivableLevelArb: formData.accReceivableLevelArb.trim(),
                accReceivableChartArb: formData.accReceivableChartArb.trim(),
                
                // Payable Account Information (English)
                accPayableName: formData.accPayableName.trim(),
                accPayableGroup: formData.accPayableGroup.trim(),
                accPayableClass: formData.accPayableClass.trim(),
                accPayableLevel: formData.accPayableLevel.trim(),
                accPayableChart: formData.accPayableChart.trim(),
                accPayableType: formData.accPayableType.trim(),
                
                // Payable Account Information (Arabic)
                accPayableNameArb: formData.accPayableNameArb.trim(),
                accPayableGroupArb: formData.accPayableGroupArb.trim(),
                accPayableClassArb: formData.accPayableClassArb.trim(),
                accPayableLevelArb: formData.accPayableLevelArb.trim(),
                accPayableChartArb: formData.accPayableChartArb.trim()
            };

            const response = await axios.post('/v1/api/contacts', contactData);

            if (response.data.success) {
                toast.success('تم إضافة جهة الاتصال بنجاح!');
                setIsAddModalOpen(false);
                if (fetchContacts) fetchContacts();
            }
        } catch (error) {
            console.error('Error adding contact:', error);
            
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error('فشل إضافة جهة الاتصال');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsAddModalOpen(false);
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={handleClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
                dir="rtl"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <FaUser className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    إضافة جهة اتصال جديدة
                                </h2>
                                <p className="text-blue-100 text-xs mt-1">
                                    إنشاء عميل، مورد، أو شريك جديد
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={handleClose} 
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <IoCloseCircle size={28} />
                        </button>
                    </div>
                </div>

                {/* Contact Type Toggles - MOVED TO TOP */}
                <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                            <input
                                type="checkbox"
                                name="isReceivable"
                                checked={formData.isReceivable}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                                <label className="font-medium text-green-800">جهة قبض</label>
                                <p className="text-xs text-green-600">عميل / مدين</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <input
                                type="checkbox"
                                name="isPayable"
                                checked={formData.isPayable}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                                <label className="font-medium text-blue-800">جهة دفع</label>
                                <p className="text-xs text-blue-600">مورد / دائن</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 px-6 pt-4">
                    <div className="flex gap-4 overflow-x-auto pb-1">
                        <button
                            onClick={() => setActiveTab('basic')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap
                                ${activeTab === 'basic' 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            المعلومات الأساسية
                        </button>
                        {formData.isReceivable && (
                            <button
                                onClick={() => setActiveTab('receivable')}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap
                                    ${activeTab === 'receivable' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <GiReceiveMoney className="inline ml-1" size={14} />
                                حساب القبض
                            </button>
                        )}
                        {formData.isPayable && (
                            <button
                                onClick={() => setActiveTab('payable')}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap
                                    ${activeTab === 'payable' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <GiPayMoney className="inline ml-1" size={14} />
                                حساب الدفع
                            </button>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {/* Basic Information Tab */}
                    {activeTab === 'basic' && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        الاسم الكامل <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="مثال: محمد أحمد، شركة ABC"
                                            className={`w-full pr-10 pl-4 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all text-right
                                                     ${formErrors.name ? 'border-red-500' : 'border-gray-200'}`}
                                            autoComplete="off"
                                        />
                                    </div>
                                    {formErrors.name && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        البريد الإلكتروني <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                                            <MdEmail className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="example@domain.com"
                                            className={`w-full pr-10 pl-4 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all text-right
                                                     ${formErrors.email ? 'border-red-500' : 'border-gray-200'}`}
                                            autoComplete="off"
                                        />
                                    </div>
                                    {formErrors.email && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        رقم الهاتف <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                                            <FaPhone className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="+971 50 123 4567"
                                            className={`w-full pr-10 pl-4 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all text-right
                                                     ${formErrors.phone ? 'border-red-500' : 'border-gray-200'}`}
                                            autoComplete="off"
                                        />
                                    </div>
                                    {formErrors.phone && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>
                                    )}
                                </div>

                                {/* Address */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        العنوان <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                                            <FaMapMarkerAlt className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="مثال: شارع الرئيسي، دبي، الإمارات"
                                            className={`w-full pr-10 pl-4 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all text-right
                                                     ${formErrors.address ? 'border-red-500' : 'border-gray-200'}`}
                                            autoComplete="off"
                                        />
                                    </div>
                                    {formErrors.address && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.address}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Receivable Account Tab */}
                    {activeTab === 'receivable' && formData.isReceivable && (
                        <div className="space-y-5">
                            <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <GiReceiveMoney className="text-blue-600" />
                                    إعدادات حساب القبض
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    اختر حساب لملء معلومات حساب القبض تلقائياً
                                </p>
                            </div>

                            {/* Account Search - Arabic first */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    بحث واختيار حساب القبض <span className="text-blue-600">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={accountSearchTerm}
                                        onChange={(e) => setAccountSearchTerm(e.target.value)}
                                        placeholder="ابحث عن حساب بالاسم أو الرمز..."
                                        className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl
                                                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                 focus:border-transparent text-right"
                                    />
                                </div>

                                {/* Accounts List - Display Arabic names first */}
                                {accountSearchTerm && (
                                    <div className="mt-2 border-2 border-gray-200 rounded-xl max-h-60 overflow-y-auto">
                                        {loadingAccounts ? (
                                            <div className="text-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                            </div>
                                        ) : accounts.length > 0 ? (
                                            accounts.map((account) => (
                                                <div
                                                    key={account._id}
                                                    onClick={() => handleReceivableAccountSelect(account)}
                                                    className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0
                                                             transition-colors text-right"
                                                >
                                                    <div className="font-medium">{account.nameArb || account.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        <span className="ml-2">الرمز: {account.code}</span>
                                                        <span className="ml-2">النوع: {account.type || 'غير محدد'}</span>
                                                        <span>المجموعة: {account.group?.nameArb || account.group?.name || 'غير محدد'}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                لا توجد حسابات
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Selected Account Info - Arabic first */}
                            {selectedReceivableAccount && (
                                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                    <h4 className="font-medium text-green-800 mb-2">الحساب المحدد</h4>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-medium">الاسم:</span> {selectedReceivableAccount.nameArb || selectedReceivableAccount.name}
                                    </p>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-medium">الرمز:</span> {selectedReceivableAccount.code}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">النوع:</span> {selectedReceivableAccount.type || 'غير محدد'}
                                    </p>
                                </div>
                            )}

                            {/* Account Fields - English and Arabic with RTL for Arabic */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">الحقول العربية</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            اسم الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accReceivableNameArb"
                                            value={formData.accReceivableNameArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="اسم حساب المدين"
                                        />
                                        {formErrors.accReceivableNameArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accReceivableNameArb}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            مجموعة الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accReceivableGroupArb"
                                            value={formData.accReceivableGroupArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="مجموعة حساب المدين"
                                        />
                                        {formErrors.accReceivableGroupArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accReceivableGroupArb}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            تصنيف الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accReceivableClassArb"
                                            value={formData.accReceivableClassArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="تصنيف حساب المدين"
                                        />
                                        {formErrors.accReceivableClassArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accReceivableClassArb}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            مستوى الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accReceivableLevelArb"
                                            value={formData.accReceivableLevelArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="مستوى حساب المدين"
                                        />
                                        {formErrors.accReceivableLevelArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accReceivableLevelArb}</p>
                                        )}
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            دليل الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accReceivableChartArb"
                                            value={formData.accReceivableChartArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="دليل حساب المدين"
                                        />
                                        {formErrors.accReceivableChartArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accReceivableChartArb}</p>
                                        )}
                                    </div>
                                </div>

                                <h4 className="font-medium text-gray-700 mt-4">English Fields</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Name <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accReceivableName"
                                            value={formData.accReceivableName}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accReceivableName && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accReceivableName}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Group <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accReceivableGroup"
                                            value={formData.accReceivableGroup}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accReceivableGroup && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accReceivableGroup}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Class <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accReceivableClass"
                                            value={formData.accReceivableClass}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accReceivableClass && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accReceivableClass}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Level <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accReceivableLevel"
                                            value={formData.accReceivableLevel}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accReceivableLevel && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accReceivableLevel}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Chart <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accReceivableChart"
                                            value={formData.accReceivableChart}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accReceivableChart && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accReceivableChart}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Type <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accReceivableType"
                                            value={formData.accReceivableType}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accReceivableType && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accReceivableType}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Payable Account Tab */}
                    {activeTab === 'payable' && formData.isPayable && (
                        <div className="space-y-5">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <GiPayMoney className="text-blue-600" />
                                    إعدادات حساب الدفع
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    اختر حساب لملء معلومات حساب الدفع تلقائياً
                                </p>
                            </div>

                            {/* Account Search - Arabic first */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    بحث واختيار حساب الدفع <span className="text-blue-600">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={accountSearchTerm}
                                        onChange={(e) => setAccountSearchTerm(e.target.value)}
                                        placeholder="ابحث عن حساب بالاسم أو الرمز..."
                                        className="w-full pr-10 pl-4 py-3 border-2 border-gray-200 rounded-xl
                                                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                 focus:border-transparent text-right"
                                    />
                                </div>

                                {/* Accounts List - Display Arabic names first */}
                                {accountSearchTerm && (
                                    <div className="mt-2 border-2 border-gray-200 rounded-xl max-h-60 overflow-y-auto">
                                        {loadingAccounts ? (
                                            <div className="text-center py-4">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                            </div>
                                        ) : accounts.length > 0 ? (
                                            accounts.map((account) => (
                                                <div
                                                    key={account._id}
                                                    onClick={() => handlePayableAccountSelect(account)}
                                                    className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0
                                                             transition-colors text-right"
                                                >
                                                    <div className="font-medium">{account.nameArb || account.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        <span className="ml-2">الرمز: {account.code}</span>
                                                        <span className="ml-2">النوع: {account.type || 'غير محدد'}</span>
                                                        <span>المجموعة: {account.group?.nameArb || account.group?.name || 'غير محدد'}</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                لا توجد حسابات
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Selected Account Info - Arabic first */}
                            {selectedPayableAccount && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                    <h4 className="font-medium text-blue-800 mb-2">الحساب المحدد</h4>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-medium">الاسم:</span> {selectedPayableAccount.nameArb || selectedPayableAccount.name}
                                    </p>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-medium">الرمز:</span> {selectedPayableAccount.code}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">النوع:</span> {selectedPayableAccount.type || 'غير محدد'}
                                    </p>
                                </div>
                            )}

                            {/* Account Fields - English and Arabic with RTL for Arabic */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">الحقول العربية</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            اسم الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPayableNameArb"
                                            value={formData.accPayableNameArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="اسم حساب الدائن"
                                        />
                                        {formErrors.accPayableNameArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accPayableNameArb}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            مجموعة الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPayableGroupArb"
                                            value={formData.accPayableGroupArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="مجموعة حساب الدائن"
                                        />
                                        {formErrors.accPayableGroupArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accPayableGroupArb}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            تصنيف الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPayableClassArb"
                                            value={formData.accPayableClassArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="تصنيف حساب الدائن"
                                        />
                                        {formErrors.accPayableClassArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accPayableClassArb}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            مستوى الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPayableLevelArb"
                                            value={formData.accPayableLevelArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="مستوى حساب الدائن"
                                        />
                                        {formErrors.accPayableLevelArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accPayableLevelArb}</p>
                                        )}
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            دليل الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPayableChartArb"
                                            value={formData.accPayableChartArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="دليل حساب الدائن"
                                        />
                                        {formErrors.accPayableChartArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accPayableChartArb}</p>
                                        )}
                                    </div>
                                </div>

                                <h4 className="font-medium text-gray-700 mt-4">English Fields</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Name <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPayableName"
                                            value={formData.accPayableName}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accPayableName && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accPayableName}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Group <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPayableGroup"
                                            value={formData.accPayableGroup}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accPayableGroup && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accPayableGroup}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Class <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPayableClass"
                                            value={formData.accPayableClass}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accPayableClass && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accPayableClass}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Level <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPayableLevel"
                                            value={formData.accPayableLevel}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accPayableLevel && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accPayableLevel}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Chart <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPayableChart"
                                            value={formData.accPayableChart}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accPayableChart && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accPayableChart}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Type <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPayableType"
                                            value={formData.accPayableType}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accPayableType && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accPayableType}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-start gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg 
                                     hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <FaTimes size={14} />
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-sky-600 
                                     text-white rounded-lg hover:from-blue-700 hover:to-sky-700 
                                     transition-all flex items-center gap-2 disabled:opacity-50 
                                     disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    <span>جاري الحفظ...</span>
                                </>
                            ) : (
                                <>
                                    <FaSave size={14} />
                                    <span>إضافة جهة اتصال</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddContactModal;
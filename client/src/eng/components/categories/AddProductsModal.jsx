import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { IoCloseCircle } from 'react-icons/io5';
import { 
    FaPlus, FaSave, FaTimes, FaBox, FaTag, 
    FaDollarSign, FaShoppingCart, FaBoxOpen, 
    FaBalanceScale, FaPercentage, FaChartLine,
    FaChartPie, FaLayerGroup, FaSitemap, FaSearch,
    FaMoneyBillWave, FaBarcode, FaCog, FaCube
} from 'react-icons/fa';
import { BiPurchaseTag, BiCategory, BiMoney } from 'react-icons/bi';
import { MdCategory, MdInventory, MdAttachMoney, MdAccountBalance, MdCurrencyExchange } from 'react-icons/md';
import { GiTakeMyMoney, GiPayMoney, GiReceiveMoney } from 'react-icons/gi';

// Currency options
const currencies = [
    { code: 'AED', name: 'UAE Dirham', nameArb: 'درهم إماراتي', symbol: 'AED', flag: '🇦🇪' },
    { code: 'USD', name: 'US Dollar', nameArb: 'دولار أمريكي', symbol: '$', flag: '🇺🇸' },
    { code: 'SDG', name: 'Sudanese Pound', nameArb: 'جنيه سوداني', symbol: 'SDG', flag: '🇸🇩' },
    { code: 'EGP', name: 'Egyptian Pound', nameArb: 'جنيه مصري', symbol: 'EGP', flag: '🇪🇬' },
    
    { code: 'EUR', name: 'Euro', nameArb: 'يورو', symbol: '€', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', nameArb: 'جنيه إسترليني', symbol: '£', flag: '🇬🇧' },
    { code: 'SAR', name: 'Saudi Riyal', nameArb: 'ريال سعودي', symbol: 'SAR', flag: '🇸🇦' },
    { code: 'QAR', name: 'Qatari Riyal', nameArb: 'ريال قطري', symbol: 'QAR', flag: '🇶🇦' },
    { code: 'KWD', name: 'Kuwaiti Dinar', nameArb: 'دينار كويتي', symbol: 'KWD', flag: '🇰🇼' },
    { code: 'JOD', name: 'Jordanian Dinar', nameArb: 'دينار أردني', symbol: 'JOD', flag: '🇯🇴' },
   
];

const AddProductsModal = ({ setIsAddProductModalOpen, categoryId, categoryName, fetchCategories }) => {
    const { axios } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'sales', 'purchase'
    
    // Accounts list
    const [accounts, setAccounts] = useState([]);
    const [accountSearchTerm, setAccountSearchTerm] = useState('');
    const [selectedSalesAccount, setSelectedSalesAccount] = useState(null);
    const [selectedPurchaseAccount, setSelectedPurchaseAccount] = useState(null);
    
    const [formData, setFormData] = useState({
        // Basic Information
        name: '',
        barcode: '',
        qty: '',
        unit: '',
        salePrice: '',
        saleCurrency: 'AED',
        costCurrency: 'AED',
        costPrice: '',
        
        // Type checkboxes
        sales: true,
        purchase: true,
        service: false,
        goods: true,
        
        // Sales Account Information (English)
        accSalesName: '',
        accSalesGroup: '',
        accSalesClass: '',
        accSalesLevel: '',
        accSalesChart: '',
        accSalesType: '',
        
        // Sales Account Information (Arabic)
        accSalesNameArb: '',
        accSalesGroupArb: '',
        accSalesClassArb: '',
        accSalesLevelArb: '',
        accSalesChartArb: '',
        
        // Purchase Account Information (English)
        accPurchaseName: '',
        accPurchaseGroup: '',
        accPurchaseClass: '',
        accPurchaseLevel: '',
        accPurchaseChart: '',
        accPurchaseType: '',
        
        // Purchase Account Information (Arabic)
        accPurchaseNameArb: '',
        accPurchaseGroupArb: '',
        accPurchaseClassArb: '',
        accPurchaseLevelArb: '',
        accPurchaseChartArb: ''
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
            toast.error('Failed to load accounts');
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

    // Handle sales account selection with Arabic fields
    const handleSalesAccountSelect = (account) => {
        setSelectedSalesAccount(account);
        setFormData(prev => ({
            ...prev,
            // English fields
            accSalesName: account.name,
            accSalesGroup: account.group?.name || '',
            accSalesClass: account.class?.name || account.group?.class?.name || '',
            accSalesLevel: account.level?.name || '',
            accSalesChart: account.chart?.name || '',
            accSalesType: account.type || determineAccountType(account),
            
            // Arabic fields
            accSalesNameArb: account.nameArb || account.name,
            accSalesGroupArb: account.group?.nameArb || account.group?.name || '',
            accSalesClassArb: account.class?.nameArb || account.group?.class?.nameArb || account.class?.name || '',
            accSalesLevelArb: account.level?.nameArb || account.level?.name || '',
            accSalesChartArb: account.chart?.nameArb || account.chart?.name || ''
        }));
        setAccountSearchTerm('');
    };

    // Handle purchase account selection with Arabic fields
    const handlePurchaseAccountSelect = (account) => {
        setSelectedPurchaseAccount(account);
        setFormData(prev => ({
            ...prev,
            // English fields
            accPurchaseName: account.name,
            accPurchaseGroup: account.group?.name || '',
            accPurchaseClass: account.class?.name || account.group?.class?.name || '',
            accPurchaseLevel: account.level?.name || '',
            accPurchaseChart: account.chart?.name || '',
            accPurchaseType: account.type || determineAccountType(account),
            
            // Arabic fields
            accPurchaseNameArb: account.nameArb || account.name,
            accPurchaseGroupArb: account.group?.nameArb || account.group?.name || '',
            accPurchaseClassArb: account.class?.nameArb || account.group?.class?.nameArb || account.class?.name || '',
            accPurchaseLevelArb: account.level?.nameArb || account.level?.name || '',
            accPurchaseChartArb: account.chart?.nameArb || account.chart?.name || ''
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
            errors.name = 'Product name is required';
        }
        
        // Barcode is optional - no validation needed
        
        if (!formData.qty) {
            errors.qty = 'Quantity is required';
        } else if (isNaN(formData.qty) || Number(formData.qty) < 0) {
            errors.qty = 'Quantity must be a positive number';
        }
        
        if (!formData.unit.trim()) {
            errors.unit = 'Unit is required';
        }
        
        if (!formData.salePrice) {
            errors.salePrice = 'Sale price is required';
        } else if (isNaN(formData.salePrice) || Number(formData.salePrice) < 0) {
            errors.salePrice = 'Sale price must be a positive number';
        }
        
        if (!formData.saleCurrency) {
            errors.saleCurrency = 'Sale currency is required';
        }
        
        if (!formData.costCurrency) {
            errors.costCurrency = 'Cost currency is required';
        }
        
        if (!formData.costPrice) {
            errors.costPrice = 'Cost price is required';
        } else if (isNaN(formData.costPrice) || Number(formData.costPrice) < 0) {
            errors.costPrice = 'Cost price must be a positive number';
        }
        
        // Sales Account validation - Only if sales is checked
        if (formData.sales) {
            if (!formData.accSalesName.trim()) errors.accSalesName = 'Sales account is required';
            if (!formData.accSalesGroup.trim()) errors.accSalesGroup = 'Sales account group is required';
            if (!formData.accSalesClass.trim()) errors.accSalesClass = 'Sales account class is required';
            if (!formData.accSalesLevel.trim()) errors.accSalesLevel = 'Sales account level is required';
            if (!formData.accSalesChart.trim()) errors.accSalesChart = 'Sales account chart is required';
            if (!formData.accSalesType.trim()) errors.accSalesType = 'Sales account type is required';
            
            // Sales Account validation - Arabic fields
            if (!formData.accSalesNameArb.trim()) errors.accSalesNameArb = 'اسم حساب المبيعات مطلوب';
            if (!formData.accSalesGroupArb.trim()) errors.accSalesGroupArb = 'مجموعة حساب المبيعات مطلوبة';
            if (!formData.accSalesClassArb.trim()) errors.accSalesClassArb = 'تصنيف حساب المبيعات مطلوب';
            if (!formData.accSalesLevelArb.trim()) errors.accSalesLevelArb = 'مستوى حساب المبيعات مطلوب';
            if (!formData.accSalesChartArb.trim()) errors.accSalesChartArb = 'دليل حساب المبيعات مطلوب';
        }
        
        // Purchase Account validation - Only if purchase is checked
        if (formData.purchase) {
            if (!formData.accPurchaseName.trim()) errors.accPurchaseName = 'Purchase account is required';
            if (!formData.accPurchaseGroup.trim()) errors.accPurchaseGroup = 'Purchase account group is required';
            if (!formData.accPurchaseClass.trim()) errors.accPurchaseClass = 'Purchase account class is required';
            if (!formData.accPurchaseLevel.trim()) errors.accPurchaseLevel = 'Purchase account level is required';
            if (!formData.accPurchaseChart.trim()) errors.accPurchaseChart = 'Purchase account chart is required';
            if (!formData.accPurchaseType.trim()) errors.accPurchaseType = 'Purchase account type is required';
            
            // Purchase Account validation - Arabic fields
            if (!formData.accPurchaseNameArb.trim()) errors.accPurchaseNameArb = 'اسم حساب المشتريات مطلوب';
            if (!formData.accPurchaseGroupArb.trim()) errors.accPurchaseGroupArb = 'مجموعة حساب المشتريات مطلوبة';
            if (!formData.accPurchaseClassArb.trim()) errors.accPurchaseClassArb = 'تصنيف حساب المشتريات مطلوب';
            if (!formData.accPurchaseLevelArb.trim()) errors.accPurchaseLevelArb = 'مستوى حساب المشتريات مطلوب';
            if (!formData.accPurchaseChartArb.trim()) errors.accPurchaseChartArb = 'دليل حساب المشتريات مطلوب';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    

    // In the handleSubmit function, add a check for categoryId
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }

        // Add this check
        if (!categoryId) {
            toast.error('Category ID is missing');
            console.error('Category ID is undefined or null');
            return;
        }

        setIsLoading(true);

        try {
            const productData = {
                name: formData.name.trim(),
                barcode: formData.barcode ? formData.barcode.trim() : undefined,
                qty: formData.qty.toString(),
                unit: formData.unit.trim(),
                salePrice: Number(formData.salePrice),
                saleCurrency: formData.saleCurrency,
                costCurrency: formData.costCurrency,
                costPrice: Number(formData.costPrice),
                sales: formData.sales,
                purchase: formData.purchase,
                service: formData.service,
                goods: formData.goods,

                // Sales Account Information (English) - Only include if sales is checked
                ...(formData.sales && {
                    accSalesName: formData.accSalesName.trim(),
                    accSalesGroup: formData.accSalesGroup.trim(),
                    accSalesClass: formData.accSalesClass.trim(),
                    accSalesLevel: formData.accSalesLevel.trim(),
                    accSalesChart: formData.accSalesChart.trim(),
                    accSalesType: formData.accSalesType.trim(),

                    // Sales Account Information (Arabic)
                    accSalesNameArb: formData.accSalesNameArb.trim(),
                    accSalesGroupArb: formData.accSalesGroupArb.trim(),
                    accSalesClassArb: formData.accSalesClassArb.trim(),
                    accSalesLevelArb: formData.accSalesLevelArb.trim(),
                    accSalesChartArb: formData.accSalesChartArb.trim(),
                }),

                // Purchase Account Information (English) - Only include if purchase is checked
                ...(formData.purchase && {
                    accPurchaseName: formData.accPurchaseName.trim(),
                    accPurchaseGroup: formData.accPurchaseGroup.trim(),
                    accPurchaseClass: formData.accPurchaseClass.trim(),
                    accPurchaseLevel: formData.accPurchaseLevel.trim(),
                    accPurchaseChart: formData.accPurchaseChart.trim(),
                    accPurchaseType: formData.accPurchaseType.trim(),

                    // Purchase Account Information (Arabic)
                    accPurchaseNameArb: formData.accPurchaseNameArb.trim(),
                    accPurchaseGroupArb: formData.accPurchaseGroupArb.trim(),
                    accPurchaseClassArb: formData.accPurchaseClassArb.trim(),
                    accPurchaseLevelArb: formData.accPurchaseLevelArb.trim(),
                    accPurchaseChartArb: formData.accPurchaseChartArb.trim(),
                })
            };

            console.log('Submitting to category ID:', categoryId); // Debug log
            console.log('Product data:', productData); // Debug log

            const response = await axios.post(`/v1/api/categories/${categoryId}/entries`, productData);

            if (response.data.success) {
                toast.success('Product added successfully!');
                setIsAddProductModalOpen(false);
                if (fetchCategories) fetchCategories();
            }
        } catch (error) {
            console.error('Error adding product:', error);

            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error('Failed to add product');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsAddProductModalOpen(false);
    };

    // Calculate profit margin
    const calculateMargin = () => {
        const salePrice = Number(formData.salePrice) || 0;
        const costPrice = Number(formData.costPrice) || 0;
        if (salePrice > 0) {
            return ((salePrice - costPrice) / salePrice * 100).toFixed(1);
        }
        return '0.0';
    };

    // Get currency display name
    const getCurrencyDisplay = (currencyCode) => {
        const currency = currencies.find(c => c.code === currencyCode);
        return currency ? `${currency.flag} ${currency.code} - ${currency.name}` : currencyCode;
    };

    // Determine which tabs to show based on checkbox selections
    const shouldShowSalesTab = formData.sales;
    const shouldShowPurchaseTab = formData.purchase;

    // Set active tab to basic if current active tab is no longer available
    useEffect(() => {
        if (activeTab === 'sales' && !shouldShowSalesTab) {
            setActiveTab('basic');
        } else if (activeTab === 'purchase' && !shouldShowPurchaseTab) {
            setActiveTab('basic');
        }
    }, [formData.sales, formData.purchase, activeTab, shouldShowSalesTab, shouldShowPurchaseTab]);

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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[150vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <FaBoxOpen className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Add New Product
                                </h2>
                                <p className="text-blue-100 text-xs mt-1">
                                    Category: <span className="font-medium">{categoryName || 'Selected Category'}</span>
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

                {/* Checkboxes Row */}
                <div className="px-6 pt-4 pb-2 border-b border-gray-200">
                    <div className="grid grid-cols-4 gap-4">
                        {/* Sales Enabled */}
                        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                            <input
                                type="checkbox"
                                name="sales"
                                checked={formData.sales}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                                <label className="font-medium text-green-800">Sales</label>
                                <p className="text-xs text-green-600">Can be sold</p>
                            </div>
                        </div>

                        {/* Purchase Enabled */}
                        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <input
                                type="checkbox"
                                name="purchase"
                                checked={formData.purchase}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <div>
                                <label className="font-medium text-blue-800">Purchase</label>
                                <p className="text-xs text-blue-600">Can be purchased</p>
                            </div>
                        </div>

                        {/* Service */}
                        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-200">
                            <input
                                type="checkbox"
                                name="service"
                                checked={formData.service}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <div>
                                <label className="font-medium text-purple-800">Service</label>
                                <p className="text-xs text-purple-600">Is a service</p>
                            </div>
                        </div>

                        {/* Goods */}
                        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-200">
                            <input
                                type="checkbox"
                                name="goods"
                                checked={formData.goods}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                            />
                            <div>
                                <label className="font-medium text-amber-800">Goods</label>
                                <p className="text-xs text-amber-600">Physical goods</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs - Conditionally rendered based on checkbox selections */}
                <div className="border-b border-gray-200 px-6 pt-4">
                    <div className="flex gap-4 overflow-x-auto pb-1">
                        {/* Basic Information Tab - Always visible */}
                        <button
                            onClick={() => setActiveTab('basic')}
                            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap
                                ${activeTab === 'basic' 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Basic Information
                        </button>

                        {/* Sales Account Tab - Only visible if sales is checked */}
                        {shouldShowSalesTab && (
                            <button
                                onClick={() => setActiveTab('sales')}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap
                                    ${activeTab === 'sales' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <FaShoppingCart className="inline mr-1" size={14} />
                                Sales Account
                            </button>
                        )}

                        {/* Purchase Account Tab - Only visible if purchase is checked */}
                        {shouldShowPurchaseTab && (
                            <button
                                onClick={() => setActiveTab('purchase')}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap
                                    ${activeTab === 'purchase' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <BiPurchaseTag className="inline mr-1" size={14} />
                                Purchase Account
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
                                {/* Product Name */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Product Name <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaTag className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Premium Coffee, T-Shirt, Laptop"
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all
                                                     ${formErrors.name ? 'border-red-500' : 'border-gray-200'}`}
                                            autoComplete="off"
                                        />
                                    </div>
                                    {formErrors.name && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                                    )}
                                </div>

                                {/* Barcode */}
                                <div className="space-y-2 md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Barcode <span className="text-gray-400 text-xs">(Optional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaBarcode className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            name="barcode"
                                            value={formData.barcode}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 123456789012"
                                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all"
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                {/* Quantity */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Quantity <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MdInventory className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            type="number"
                                            name="qty"
                                            value={formData.qty}
                                            onChange={handleInputChange}
                                            placeholder="0"
                                            min="0"
                                            step="0.01"
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all
                                                     ${formErrors.qty ? 'border-red-500' : 'border-gray-200'}`}
                                        />
                                    </div>
                                    {formErrors.qty && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.qty}</p>
                                    )}
                                </div>

                                {/* Unit */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Unit <span className="text-blue-600">*</span>
                                    </label>
                                    <select
                                        name="unit"
                                        value={formData.unit}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-3 border-2 rounded-xl 
                                                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                 focus:border-transparent transition-all
                                                 ${formErrors.unit ? 'border-red-500' : 'border-gray-200'}`}
                                    >
                                        <option value="">Select Unit</option>
                                        <option value="piece">Piece</option>
                                        <option value="kg">Kilogram</option>
                                        <option value="g">Gram</option>
                                        <option value="liter">Liter</option>
                                        <option value="ml">Milliliter</option>
                                        <option value="box">Box</option>
                                        <option value="pack">Pack</option>
                                        <option value="dozen">Dozen</option>
                                    </select>
                                    {formErrors.unit && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.unit}</p>
                                    )}
                                </div>

                                {/* Sale Price */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Sale Price <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <GiReceiveMoney className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            type="number"
                                            name="salePrice"
                                            value={formData.salePrice}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all
                                                     ${formErrors.salePrice ? 'border-red-500' : 'border-gray-200'}`}
                                        />
                                    </div>
                                    {formErrors.salePrice && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.salePrice}</p>
                                    )}
                                </div>

                                {/* Sale Currency */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Sale Currency <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MdCurrencyExchange className="text-gray-400" size={16} />
                                        </div>
                                        <select
                                            name="saleCurrency"
                                            value={formData.saleCurrency}
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all
                                                     ${formErrors.saleCurrency ? 'border-red-500' : 'border-gray-200'}`}
                                        >
                                            {currencies.map(currency => (
                                                <option key={currency.code} value={currency.code}>
                                                    {currency.flag} {currency.code} - {currency.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {formErrors.saleCurrency && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.saleCurrency}</p>
                                    )}
                                </div>

                                {/* Cost Price */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Cost Price <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <GiPayMoney className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            type="number"
                                            name="costPrice"
                                            value={formData.costPrice}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all
                                                     ${formErrors.costPrice ? 'border-red-500' : 'border-gray-200'}`}
                                        />
                                    </div>
                                    {formErrors.costPrice && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.costPrice}</p>
                                    )}
                                </div>

                                {/* Cost Currency */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Cost Currency <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaMoneyBillWave className="text-gray-400" size={16} />
                                        </div>
                                        <select
                                            name="costCurrency"
                                            value={formData.costCurrency}
                                            onChange={handleInputChange}
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all
                                                     ${formErrors.costCurrency ? 'border-red-500' : 'border-gray-200'}`}
                                        >
                                            {currencies.map(currency => (
                                                <option key={currency.code} value={currency.code}>
                                                    {currency.flag} {currency.code} - {currency.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {formErrors.costCurrency && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.costCurrency}</p>
                                    )}
                                </div>
                            </div>

                            {/* Margin Calculator */}
                            {formData.salePrice && formData.costPrice && (
                                <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-200">
                                    <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                                        <FaPercentage className="text-blue-600" size={14} />
                                        Profit Margin
                                    </h3>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Gross Profit:</span>
                                        <span className="font-semibold text-blue-700">
                                            {(Number(formData.salePrice) - Number(formData.costPrice)).toFixed(2)} {formData.saleCurrency}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-sm text-gray-600">Margin:</span>
                                        <span className="font-bold text-lg text-blue-600">
                                            {calculateMargin()}%
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Currency Info Banner */}
                            {formData.saleCurrency && formData.costCurrency && (
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-center gap-2">
                                    <FaMoneyBillWave className="text-blue-600" />
                                    <p className="text-sm text-blue-700">
                                        Sale Currency: <span className="font-bold">{getCurrencyDisplay(formData.saleCurrency)}</span> | 
                                        Cost Currency: <span className="font-bold">{getCurrencyDisplay(formData.costCurrency)}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Sales Account Tab - Only rendered when active and sales is checked */}
                    {activeTab === 'sales' && shouldShowSalesTab && (
                        <div className="space-y-5">
                            <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <FaShoppingCart className="text-blue-600" />
                                    Sales Account Configuration
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Select an account to auto-fill all account information (English & Arabic)
                                </p>
                            </div>

                            {/* Account Search */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Search and Select Sales Account <span className="text-blue-600">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={accountSearchTerm}
                                        onChange={(e) => setAccountSearchTerm(e.target.value)}
                                        placeholder="Search accounts by name or code..."
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl
                                                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                 focus:border-transparent"
                                    />
                                </div>

                                {/* Accounts List */}
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
                                                    onClick={() => handleSalesAccountSelect(account)}
                                                    className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0
                                                             transition-colors"
                                                >
                                                    <div className="font-medium">{account.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        <span className="mr-2">Code: {account.code}</span>
                                                        <span className="mr-2">Type: {account.type || 'N/A'}</span>
                                                        <span>Group: {account.group?.name || 'N/A'}</span>
                                                    </div>
                                                    {account.nameArb && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Arabic: {account.nameArb}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                No accounts found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Selected Account Info */}
                            {selectedSalesAccount && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                    <h4 className="font-medium text-blue-800 mb-2">Selected Account</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">English</p>
                                            <p className="text-sm text-gray-700 mb-1">
                                                <span className="font-medium">Name:</span> {selectedSalesAccount.name}
                                            </p>
                                            <p className="text-sm text-gray-700 mb-1">
                                                <span className="font-medium">Group:</span> {selectedSalesAccount.group?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">العربية</p>
                                            <p className="text-sm text-gray-700 mb-1">
                                                <span className="font-medium">الاسم:</span> {selectedSalesAccount.nameArb || selectedSalesAccount.name}
                                            </p>
                                            <p className="text-sm text-gray-700 mb-1">
                                                <span className="font-medium">المجموعة:</span> {selectedSalesAccount.group?.nameArb || selectedSalesAccount.group?.name || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Account Fields - English and Arabic */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">English Fields</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Name <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accSalesName"
                                            value={formData.accSalesName}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accSalesName && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accSalesName}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Group <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accSalesGroup"
                                            value={formData.accSalesGroup}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accSalesGroup && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accSalesGroup}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Class <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accSalesClass"
                                            value={formData.accSalesClass}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accSalesClass && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accSalesClass}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Level <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accSalesLevel"
                                            value={formData.accSalesLevel}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accSalesLevel && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accSalesLevel}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Chart <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accSalesChart"
                                            value={formData.accSalesChart}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accSalesChart && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accSalesChart}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Type <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accSalesType"
                                            value={formData.accSalesType}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accSalesType && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accSalesType}</p>
                                        )}
                                    </div>
                                </div>

                                <h4 className="font-medium text-gray-700 mt-4">الحقول العربية</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            اسم الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accSalesNameArb"
                                            value={formData.accSalesNameArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="اسم حساب المبيعات"
                                        />
                                        {formErrors.accSalesNameArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accSalesNameArb}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            مجموعة الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accSalesGroupArb"
                                            value={formData.accSalesGroupArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="مجموعة حساب المبيعات"
                                        />
                                        {formErrors.accSalesGroupArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accSalesGroupArb}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            تصنيف الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accSalesClassArb"
                                            value={formData.accSalesClassArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="تصنيف حساب المبيعات"
                                        />
                                        {formErrors.accSalesClassArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accSalesClassArb}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            مستوى الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accSalesLevelArb"
                                            value={formData.accSalesLevelArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="مستوى حساب المبيعات"
                                        />
                                        {formErrors.accSalesLevelArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accSalesLevelArb}</p>
                                        )}
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            دليل الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accSalesChartArb"
                                            value={formData.accSalesChartArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="دليل حساب المبيعات"
                                        />
                                        {formErrors.accSalesChartArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accSalesChartArb}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Purchase Account Tab - Only rendered when active and purchase is checked */}
                    {activeTab === 'purchase' && shouldShowPurchaseTab && (
                        <div className="space-y-5">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <BiPurchaseTag className="text-blue-600" />
                                    Purchase Account Configuration
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Select an account to auto-fill all account information (English & Arabic)
                                </p>
                            </div>

                            {/* Account Search */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Search and Select Purchase Account <span className="text-blue-600">*</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FaSearch className="text-gray-400" size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        value={accountSearchTerm}
                                        onChange={(e) => setAccountSearchTerm(e.target.value)}
                                        placeholder="Search accounts by name or code..."
                                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl
                                                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                 focus:border-transparent"
                                    />
                                </div>

                                {/* Accounts List */}
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
                                                    onClick={() => handlePurchaseAccountSelect(account)}
                                                    className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0
                                                             transition-colors"
                                                >
                                                    <div className="font-medium">{account.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        <span className="mr-2">Code: {account.code}</span>
                                                        <span className="mr-2">Type: {account.type || 'N/A'}</span>
                                                        <span>Group: {account.group?.name || 'N/A'}</span>
                                                    </div>
                                                    {account.nameArb && (
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            Arabic: {account.nameArb}
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-4 text-gray-500">
                                                No accounts found
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Selected Account Info */}
                            {selectedPurchaseAccount && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                    <h4 className="font-medium text-blue-800 mb-2">Selected Account</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">English</p>
                                            <p className="text-sm text-gray-700 mb-1">
                                                <span className="font-medium">Name:</span> {selectedPurchaseAccount.name}
                                            </p>
                                            <p className="text-sm text-gray-700 mb-1">
                                                <span className="font-medium">Group:</span> {selectedPurchaseAccount.group?.name || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">العربية</p>
                                            <p className="text-sm text-gray-700 mb-1">
                                                <span className="font-medium">الاسم:</span> {selectedPurchaseAccount.nameArb || selectedPurchaseAccount.name}
                                            </p>
                                            <p className="text-sm text-gray-700 mb-1">
                                                <span className="font-medium">المجموعة:</span> {selectedPurchaseAccount.group?.nameArb || selectedPurchaseAccount.group?.name || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Account Fields - English and Arabic */}
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">English Fields</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Name <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPurchaseName"
                                            value={formData.accPurchaseName}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accPurchaseName && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accPurchaseName}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Group <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPurchaseGroup"
                                            value={formData.accPurchaseGroup}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accPurchaseGroup && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accPurchaseGroup}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Class <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPurchaseClass"
                                            value={formData.accPurchaseClass}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accPurchaseClass && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accPurchaseClass}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Level <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPurchaseLevel"
                                            value={formData.accPurchaseLevel}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accPurchaseLevel && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accPurchaseLevel}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Chart <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPurchaseChart"
                                            value={formData.accPurchaseChart}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accPurchaseChart && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accPurchaseChart}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Account Type <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPurchaseType"
                                            value={formData.accPurchaseType}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {formErrors.accPurchaseType && (
                                            <p className="text-red-500 text-xs mt-1">{formErrors.accPurchaseType}</p>
                                        )}
                                    </div>
                                </div>

                                <h4 className="font-medium text-gray-700 mt-4">الحقول العربية</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            اسم الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPurchaseNameArb"
                                            value={formData.accPurchaseNameArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="اسم حساب المشتريات"
                                        />
                                        {formErrors.accPurchaseNameArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accPurchaseNameArb}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            مجموعة الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPurchaseGroupArb"
                                            value={formData.accPurchaseGroupArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="مجموعة حساب المشتريات"
                                        />
                                        {formErrors.accPurchaseGroupArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accPurchaseGroupArb}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            تصنيف الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPurchaseClassArb"
                                            value={formData.accPurchaseClassArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="تصنيف حساب المشتريات"
                                        />
                                        {formErrors.accPurchaseClassArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accPurchaseClassArb}</p>
                                        )}
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            مستوى الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPurchaseLevelArb"
                                            value={formData.accPurchaseLevelArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="مستوى حساب المشتريات"
                                        />
                                        {formErrors.accPurchaseLevelArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accPurchaseLevelArb}</p>
                                        )}
                                    </div>
                                    
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1 text-right">
                                            دليل الحساب <span className="text-blue-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accPurchaseChartArb"
                                            value={formData.accPurchaseChartArb}
                                            onChange={handleInputChange}
                                            readOnly
                                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-right
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="دليل حساب المشتريات"
                                        />
                                        {formErrors.accPurchaseChartArb && (
                                            <p className="text-red-500 text-xs mt-1 text-right">{formErrors.accPurchaseChartArb}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg 
                                     hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                            <FaTimes size={14} />
                            Cancel
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
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <FaSave size={14} />
                                    <span>Add Product</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default AddProductsModal;
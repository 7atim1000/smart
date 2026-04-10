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

    // Handle receivable account selection
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
            
            // Arabic fields (you may need to map these from your account data)
            accReceivableNameArb: account.nameArb || '',
            accReceivableGroupArb: account.group?.nameArb || '',
            accReceivableClassArb: account.class?.nameArb || account.group?.class?.nameArb || '',
            accReceivableLevelArb: account.level?.nameArb || '',
            accReceivableChartArb: account.chart?.nameArb || ''
        }));
        setAccountSearchTerm('');
    };

    // Handle payable account selection
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
            
            // Arabic fields
            accPayableNameArb: account.nameArb || '',
            accPayableGroupArb: account.group?.nameArb || '',
            accPayableClassArb: account.class?.nameArb || account.group?.class?.nameArb || '',
            accPayableLevelArb: account.level?.nameArb || '',
            accPayableChartArb: account.chart?.nameArb || ''
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
            errors.name = 'Name is required';
        }
        
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) {
                errors.email = 'Invalid email format';
            }
        }
        
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        }
        
        if (!formData.address.trim()) {
            errors.address = 'Address is required';
        }
        
        // Boolean validation
        if (typeof formData.isReceivable !== 'boolean') {
            errors.isReceivable = 'Receivable status is required';
        }
        
        if (typeof formData.isPayable !== 'boolean') {
            errors.isPayable = 'Payable status is required';
        }
        
        // Receivable Account validation (if receivable is enabled)
        if (formData.isReceivable) {
            // English fields
            if (!formData.accReceivableName.trim()) errors.accReceivableName = 'Receivable account name is required';
            if (!formData.accReceivableGroup.trim()) errors.accReceivableGroup = 'Receivable account group is required';
            if (!formData.accReceivableClass.trim()) errors.accReceivableClass = 'Receivable account class is required';
            if (!formData.accReceivableLevel.trim()) errors.accReceivableLevel = 'Receivable account level is required';
            if (!formData.accReceivableChart.trim()) errors.accReceivableChart = 'Receivable account chart is required';
            if (!formData.accReceivableType.trim()) errors.accReceivableType = 'Receivable account type is required';
            
            // Arabic fields
            if (!formData.accReceivableNameArb.trim()) errors.accReceivableNameArb = 'Receivable account name (Arabic) is required';
            if (!formData.accReceivableGroupArb.trim()) errors.accReceivableGroupArb = 'Receivable account group (Arabic) is required';
            if (!formData.accReceivableClassArb.trim()) errors.accReceivableClassArb = 'Receivable account class (Arabic) is required';
            if (!formData.accReceivableLevelArb.trim()) errors.accReceivableLevelArb = 'Receivable account level (Arabic) is required';
            if (!formData.accReceivableChartArb.trim()) errors.accReceivableChartArb = 'Receivable account chart (Arabic) is required';
        }
        
        // Payable Account validation (if payable is enabled)
        if (formData.isPayable) {
            // English fields
            if (!formData.accPayableName.trim()) errors.accPayableName = 'Payable account name is required';
            if (!formData.accPayableGroup.trim()) errors.accPayableGroup = 'Payable account group is required';
            if (!formData.accPayableClass.trim()) errors.accPayableClass = 'Payable account class is required';
            if (!formData.accPayableLevel.trim()) errors.accPayableLevel = 'Payable account level is required';
            if (!formData.accPayableChart.trim()) errors.accPayableChart = 'Payable account chart is required';
            if (!formData.accPayableType.trim()) errors.accPayableType = 'Payable account type is required';
            
            // Arabic fields
            if (!formData.accPayableNameArb.trim()) errors.accPayableNameArb = 'Payable account name (Arabic) is required';
            if (!formData.accPayableGroupArb.trim()) errors.accPayableGroupArb = 'Payable account group (Arabic) is required';
            if (!formData.accPayableClassArb.trim()) errors.accPayableClassArb = 'Payable account class (Arabic) is required';
            if (!formData.accPayableLevelArb.trim()) errors.accPayableLevelArb = 'Payable account level (Arabic) is required';
            if (!formData.accPayableChartArb.trim()) errors.accPayableChartArb = 'Payable account chart (Arabic) is required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
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
                toast.success('Contact added successfully!');
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
                toast.error('Failed to add contact');
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
                                    Add New Contact
                                </h2>
                                <p className="text-blue-100 text-xs mt-1">
                                    Create a new customer, supplier, or partner
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
                                <label className="font-medium text-green-800">Receivable Contact</label>
                                <p className="text-xs text-green-600">Customer / Debtor</p>
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
                                <label className="font-medium text-blue-800">Payable Contact</label>
                                <p className="text-xs text-blue-600">Supplier / Creditor</p>
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
                            Basic Information
                        </button>
                        {formData.isReceivable && (
                            <button
                                onClick={() => setActiveTab('receivable')}
                                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors whitespace-nowrap
                                    ${activeTab === 'receivable' 
                                        ? 'border-blue-500 text-blue-600' 
                                        : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                <GiReceiveMoney className="inline mr-1" size={14} />
                                Receivable Account
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
                                <GiPayMoney className="inline mr-1" size={14} />
                                Payable Account
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
                                        Full Name <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaUser className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            ref={inputRef}
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="e.g., John Doe, ABC Company"
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

                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Email Address <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <MdEmail className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="e.g., john@example.com"
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all
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
                                        Phone Number <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaPhone className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="e.g., +971 50 123 4567"
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all
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
                                        Address <span className="text-blue-600">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FaMapMarkerAlt className="text-gray-400" size={16} />
                                        </div>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 123 Main Street, Dubai, UAE"
                                            className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl 
                                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                     focus:border-transparent transition-all
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
                                    Receivable Account Configuration
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Select an account to auto-fill all receivable account information
                                </p>
                            </div>

                            {/* Account Search */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Search and Select Receivable Account <span className="text-blue-600">*</span>
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
                                                    onClick={() => handleReceivableAccountSelect(account)}
                                                    className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-b-0
                                                             transition-colors"
                                                >
                                                    <div className="font-medium">{account.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        <span className="mr-2">Code: {account.code}</span>
                                                        <span className="mr-2">Type: {account.type || 'N/A'}</span>
                                                        <span>Group: {account.group?.name || 'N/A'}</span>
                                                    </div>
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
                            {selectedReceivableAccount && (
                                <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                                    <h4 className="font-medium text-green-800 mb-2">Selected Account</h4>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-medium">Name:</span> {selectedReceivableAccount.name}
                                    </p>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-medium">Code:</span> {selectedReceivableAccount.code}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">Type:</span> {selectedReceivableAccount.type || 'N/A'}
                                    </p>
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

                                <h4 className="font-medium text-gray-700 mt-4">Arabic Fields</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
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
                            </div>
                        </div>
                    )}

                    {/* Payable Account Tab */}
                    {activeTab === 'payable' && formData.isPayable && (
                        <div className="space-y-5">
                            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <GiPayMoney className="text-blue-600" />
                                    Payable Account Configuration
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Select an account to auto-fill all payable account information
                                </p>
                            </div>

                            {/* Account Search */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Search and Select Payable Account <span className="text-blue-600">*</span>
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
                                                    onClick={() => handlePayableAccountSelect(account)}
                                                    className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0
                                                             transition-colors"
                                                >
                                                    <div className="font-medium">{account.name}</div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        <span className="mr-2">Code: {account.code}</span>
                                                        <span className="mr-2">Type: {account.type || 'N/A'}</span>
                                                        <span>Group: {account.group?.name || 'N/A'}</span>
                                                    </div>
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
                            {selectedPayableAccount && (
                                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                                    <h4 className="font-medium text-blue-800 mb-2">Selected Account</h4>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-medium">Name:</span> {selectedPayableAccount.name}
                                    </p>
                                    <p className="text-sm text-gray-700 mb-1">
                                        <span className="font-medium">Code:</span> {selectedPayableAccount.code}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                        <span className="font-medium">Type:</span> {selectedPayableAccount.type || 'N/A'}
                                    </p>
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

                                <h4 className="font-medium text-gray-700 mt-4">Arabic Fields</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
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
                                    <span>Add Contact</span>
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
import { AuthContext } from '../../../../context/AuthContext';
import { useContext, useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { IoCloseCircle } from 'react-icons/io5';
import { LuSquareCheckBig } from "react-icons/lu";
import { FaPlus, FaEdit, FaSearch } from "react-icons/fa";
import { MdAccountBalance } from "react-icons/md";

const AddJournalName = ({ setIsAddModalOpen, fetchJournals, mode = 'add', journalData = null, isRTL = true }) => {
    const { axios } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccount, setSelectedAccount] = useState(null);
    
    // Form state
    const [formData, setFormData] = useState({
        journalName: journalData?.journalName || '',
        journalNameArb: journalData?.journalNameArb || '',
        code: journalData?.code || '',
        accName: journalData?.accName || '',
        accNameArb: journalData?.accNameArb || '',
        accGroup: journalData?.accGroup || '',
        accGroupArb: journalData?.accGroupArb || '',
        accLevel: journalData?.accLevel || '',
        accLevelArb: journalData?.accLevelArb || '',
        accChart: journalData?.accChart || '',
        accChartArb: journalData?.accChartArb || '',
        balance: journalData?.balance || 0
    });

    const [formErrors, setFormErrors] = useState({});

    // RTL Helper Classes
    const textAlign = isRTL ? 'text-right' : 'text-left';
    const flexDirection = isRTL ? 'flex-row-reverse' : 'flex-row';
    const iconPosition = isRTL ? 'right-3' : 'left-3';
    const searchIconPosition = isRTL ? 'right-3' : 'left-3';
    const buttonJustify = isRTL ? 'justify-start' : 'justify-end';
    const marginIcon = isRTL ? 'ml-2' : 'mr-2';

    // Focus on first input
    const inputRef = useRef(null);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Fetch all accounts on mount
    useEffect(() => {
        fetchAllAccounts();
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
            toast.error(isRTL ? 'فشل في تحميل الحسابات' : 'Failed to load accounts');
        } finally {
            setLoadingAccounts(false);
        }
    };

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm) {
                fetchAllAccounts(searchTerm);
            } else {
                fetchAllAccounts();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Handle account selection
    const handleAccountSelect = (account) => {
        setSelectedAccount(account);
        setFormData(prev => ({
            ...prev,
            accName: account.name,
            accNameArb: account.nameArb,
            code: account.code,
            accGroup: account.group.name,
            accGroupArb: account.group.nameArb,
            accLevel: account.level.name,
            accLevelArb: account.level.nameArb,
            accChart: account.chart.name,
            accChartArb: account.chart.nameArb
        }));
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        
        if (!formData.journalName?.trim()) errors.journalName = isRTL ? 'اسم اليومية مطلوب' : 'Journal name is required';
        if (!formData.journalNameArb?.trim()) errors.journalNameArb = isRTL ? 'الاسم العربي مطلوب' : 'Arabic name is required';
        if (!selectedAccount) errors.account = isRTL ? 'الرجاء اختيار حساب' : 'Please select an account';
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error(isRTL ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill in all required fields');
            return;
        }
        
        setIsLoading(true);

        try {
            let response;
            if (mode === 'edit') {
                response = await axios.put(`/v1/api/journalsName/${journalData._id}`, formData);
            } else {
                response = await axios.post('/v1/api/journalsName', formData);
            }

            if (response.data.success) {
                toast.success(mode === 'edit' 
                    ? (isRTL ? 'تم تحديث اليومية بنجاح' : 'Journal updated successfully!') 
                    : (isRTL ? 'تم إضافة اليومية بنجاح' : 'Journal added successfully!'));
                setIsAddModalOpen(false);
                if (fetchJournals) fetchJournals();
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || (isRTL ? 'فشلت العملية' : `Failed to ${mode} journal`));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => setIsAddModalOpen(false);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <div 
                className="fixed inset-0 bg-opacity-50" 
                onClick={handleClose}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            />
            
            <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <div className={`flex items-center justify-between ${flexDirection}`}>
                            <h2 className="text-xl font-semibold text-white">
                                {mode === 'edit' 
                                    ? (isRTL ? 'تعديل اليومية' : 'Edit Journal') 
                                    : (isRTL ? 'إضافة يومية جديدة' : 'Add New Journal')}
                            </h2>
                            <button onClick={handleClose} className="text-white hover:text-blue-100">
                                <IoCloseCircle size={28} />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmitHandler} className="p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
                        {/* Journal Information */}
                        <div className="space-y-4">
                            <h3 className={`text-lg font-semibold text-gray-700 ${textAlign}`}>
                                {isRTL ? 'معلومات اليومية' : 'Journal Information'}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${textAlign}`}>
                                        {isRTL ? 'الاسم بالعربية' : 'Arabic Name'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.journalNameArb}
                                        onChange={(e) => setFormData({...formData, journalNameArb: e.target.value})}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${textAlign}`}
                                        placeholder={isRTL ? 'اسم اليومية' : 'اسم اليومية'}
                                    />
                                    {formErrors.journalNameArb && <p className="text-red-500 text-xs mt-1">{formErrors.journalNameArb}</p>}
                                </div>
                                
                                <div>
                                    <label className={`block text-sm font-medium text-gray-700 mb-1 ${textAlign}`}>
                                        {isRTL ? 'اسم اليومية' : 'Journal Name'} <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={formData.journalName}
                                        onChange={(e) => setFormData({...formData, journalName: e.target.value})}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${textAlign}`}
                                        placeholder={isRTL ? 'مثال: يومية المبيعات' : 'e.g., Sales Journal'}
                                    />
                                    {formErrors.journalName && <p className="text-red-500 text-xs mt-1">{formErrors.journalName}</p>}
                                </div>
                                
                            </div>
                        </div>

                        {/* Account Selection */}
                        <div className="space-y-4">
                            <h3 className={`text-lg font-semibold text-gray-700 ${textAlign}`}>
                                {isRTL ? 'اختر الحساب' : 'Select Account'}
                            </h3>
                            
                            {/* Search */}
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={isRTL ? 'البحث عن حسابات بالاسم أو الكود...' : 'Search accounts by name or code...'}
                                    className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${textAlign}`}
                                />
                                <FaSearch className={`absolute ${searchIconPosition} top-1/2 transform -translate-y-1/2 text-gray-400`} />
                            </div>

                            {/* Accounts List */}
                            {loadingAccounts ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-2 text-gray-500">{isRTL ? 'جاري تحميل الحسابات...' : 'Loading accounts...'}</p>
                                </div>
                            ) : (
                                <div className="border rounded-lg max-h-60 overflow-y-auto">
                                    {accounts.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            {isRTL ? 'لا توجد حسابات' : 'No accounts found'}
                                        </div>
                                    ) : (
                                        accounts.map((account) => (
                                            <div
                                                key={account._id}
                                                onClick={() => handleAccountSelect(account)}
                                                className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-blue-50 transition-colors ${
                                                    selectedAccount?._id === account._id ? 'bg-blue-100 border-blue-300' : ''
                                                }`}
                                            >
                                                <div className={`flex items-center justify-between ${flexDirection}`}>
                                                    <div className={textAlign}>
                                                        <p className="font-medium text-gray-800">{account.name}</p>
                                                        <p className="text-sm text-gray-500">{account.nameArb}</p>
                                                    </div>
                                                    <div className={isRTL ? 'text-left' : 'text-right'}>
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                            {account.code}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`mt-1 text-xs text-gray-500 ${textAlign}`}>
                                                    {account.chart.name} → {account.level.name} → {account.class.name} → {account.group.name}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                            {formErrors.account && <p className="text-red-500 text-xs mt-1">{formErrors.account}</p>}
                        </div>

                        {/* Selected Account Summary */}
                        {selectedAccount && (
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className={`font-medium text-blue-800 mb-2 ${textAlign}`}>
                                    {isRTL ? 'تفاصيل الحساب المحدد' : 'Selected Account Details'}
                                </h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className={textAlign}>
                                        <p className="text-gray-600">{isRTL ? 'الحساب:' : 'Account:'}</p>
                                        <p className="font-medium">{selectedAccount.name} / {selectedAccount.nameArb}</p>
                                    </div>
                                    <div className={textAlign}>
                                        <p className="text-gray-600">{isRTL ? 'الكود:' : 'Code:'}</p>
                                        <p className="font-medium">{selectedAccount.code}</p>
                                    </div>
                                    <div className={textAlign}>
                                        <p className="text-gray-600">{isRTL ? 'المجموعة:' : 'Group:'}</p>
                                        <p className="font-medium">{selectedAccount.group.name} / {selectedAccount.group.nameArb}</p>
                                    </div>
                                    <div className={textAlign}>
                                        <p className="text-gray-600">{isRTL ? 'المستوى:' : 'Level:'}</p>
                                        <p className="font-medium">{selectedAccount.level.name} / {selectedAccount.level.nameArb}</p>
                                    </div>
                                    <div className="col-span-2 textAlign">
                                        <p className="text-gray-600">{isRTL ? 'دليل الحسابات:' : 'Chart:'}</p>
                                        <p className="font-medium">{selectedAccount.chart.name} / {selectedAccount.chart.nameArb}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Balance Input */}
                        <div>
                            <label className={`block text-sm font-medium text-gray-700 mb-1 ${textAlign}`}>
                                {isRTL ? 'الرصيد' : 'Balance'}
                            </label>
                            <input
                                type="number"
                                value={formData.balance}
                                onChange={(e) => setFormData({...formData, balance: parseFloat(e.target.value) || 0})}
                                step="0.01"
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${textAlign}`}
                                placeholder={isRTL ? '0.00' : '0.00'}
                            />
                        </div>

                        {/* Buttons */}
                        <div className={`flex gap-3 ${buttonJustify} pt-4 border-t ${flexDirection}`}>
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                {isRTL ? 'إلغاء' : 'Cancel'}
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !selectedAccount}
                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>{mode === 'edit' 
                                            ? (isRTL ? 'جاري التحديث...' : 'Updating...') 
                                            : (isRTL ? 'جاري الإنشاء...' : 'Creating...')}</span>
                                    </>
                                ) : (
                                    <>
                                        {mode === 'edit' ? <FaEdit className={marginIcon} /> : <FaPlus className={marginIcon} />}
                                        <span>{mode === 'edit' 
                                            ? (isRTL ? 'تحديث اليومية' : 'Update Journal') 
                                            : (isRTL ? 'إضافة اليومية' : 'Add Journal')}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AddJournalName;
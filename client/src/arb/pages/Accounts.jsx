import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { MdDelete, MdClose, MdAccountBalance } from "react-icons/md";
import { FaPlus, FaFolder, FaEdit, FaArrowLeft } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { IoMdArrowBack } from "react-icons/io";
import AccountAdd from '../components/chartofaccounts/AccountAdd';

const Accounts = ({ 
    chartId, 
    chartType, // Add chartType prop
    levelId, 
    classId, 
    groupId, 
    groupName, 
    groupCode,
    onBack,
    isRTL = true 
}) => {
    const { axios } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Construct the correct URL with plural forms
    const getAccountsUrl = () => {
        return `/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups/${groupId}/accounts`;
    };

    // Fetch accounts for the group
    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const url = getAccountsUrl();
            console.log('📡 Fetching accounts from:', url);
            
            const response = await axios.get(url);
            console.log('📡 Response:', response.data);
            
            if (response.data.success) {
                setAccounts(response.data.accounts || []);
            } else {
                toast.error('فشل في جلب الحسابات');
            }
        } catch (error) {
            console.error('❌ Error fetching accounts:', error);
            console.error('❌ URL attempted:', getAccountsUrl());
            toast.error('خطأ في تحميل الحسابات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chartId && levelId && classId && groupId) {
            console.log('📡 Fetching with IDs:', { chartId, levelId, classId, groupId });
            fetchAccounts();
        } else {
            console.warn('⚠️ Missing required IDs:', { chartId, levelId, classId, groupId });
        }
    }, [chartId, levelId, classId, groupId]);

    // Handle delete account
    const handleDeleteAccount = async (accountId) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
            try {
                const url = `/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups/${groupId}/accounts/${accountId}`;
                console.log('🗑️ Deleting account from:', url);
                
                const response = await axios.delete(url);
                if (response.data.success) {
                    toast.success('تم حذف الحساب بنجاح');
                    fetchAccounts();
                } else {
                    toast.error('فشل في حذف الحساب');
                }
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('خطأ في حذف الحساب');
            }
        }
    };

    // Handle edit account
    const handleEditAccount = (account) => {
        setSelectedAccount(account);
        setIsEditModalOpen(true);
    };

    // Handle edit account submission
    const handleEditSubmit = async (accountData) => {
        try {
            const url = `/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups/${groupId}/accounts/${selectedAccount._id}`;
            console.log('✏️ Updating account at:', url);
            
            const response = await axios.put(url, {
                name: accountData.name.trim(),
                nameArb: accountData.nameArb.trim(),
                code: accountData.code.trim(),
                type: accountData.type
            });

            if (response.data.success) {
                toast.success('تم تحديث الحساب بنجاح');
                fetchAccounts();
                setIsEditModalOpen(false);
                setSelectedAccount(null);
            }
        } catch (error) {
            console.error('Error updating account:', error);
            toast.error(error.response?.data?.message || 'فشل في تحديث الحساب');
        }
    };

    // Account type badge colors with Arabic labels
    const getTypeBadge = (type) => {
        const types = {
            'Assets': { bg: 'bg-green-100', text: 'text-green-700', label: 'أصول' },
            'Liabilities': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'خصوم' },
            'Equity': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'حقوق ملكية' },
            'Income': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'إيرادات' },
            'Expense': { bg: 'bg-red-100', text: 'text-red-700', label: 'مصروفات' }
        };
        return types[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type };
    };

    return (
        <div 
            dir="rtl" 
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mt-4 w-full"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
                            title="العودة إلى المجموعات"
                        >
                            <IoMdArrowBack size={20} className="transform rotate-180" />
                        </button>
                        <div>
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <MdAccountBalance />
                                الحسابات في {groupName}
                            </h2>
                            <p className="text-sm text-blue-100 mt-0.5">
                                المجموعة: {groupName} {groupCode && <span className="font-bold">({groupCode})</span>}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md"
                    >
                        <FaPlus size={14} />
                        إضافة حساب
                    </button>
                </div>

                {/* Hierarchy Path Display with group code */}
                <div className="flex items-center gap-2 mt-2 text-xs text-blue-200">
                    <span>المستوى الرئيسي</span>
                    <span>/</span>
                    <span>المستوى</span>
                    <span>/</span>
                    <span>التصنيف</span>
                    <span>/</span>
                    <span className="font-bold text-white">
                        {groupName} {groupCode && `(${groupCode})`}
                    </span>
                </div>
            </div>

            {/* Accounts List */}
            <div className="p-4 sm:p-6">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-3 text-sm text-gray-600">جاري تحميل الحسابات...</p>
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <MdAccountBalance className="text-blue-600" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد حسابات</h3>
                        <p className="text-gray-500 mb-6">
                            لا توجد حسابات في مجموعة {groupName} {groupCode && `(${groupCode})`}
                        </p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                        >
                            <FaPlus size={14} />
                            إضافة أول حساب
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {accounts.map((account) => {
                            const badge = getTypeBadge(account.type);
                            return (
                                <motion.div
                                    key={account._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-blue-300"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                        {/* Account Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-800 text-lg">
                                                    {account.nameArb}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                <span className="text-gray-600">
                                                    الكود: <span className="font-mono font-medium">{account.code}</span>
                                                </span>
                                                {account.type && (
                                                    <span className="text-gray-500">
                                                        النوع: {account.type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditAccount(account)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="تعديل الحساب"
                                            >
                                                <FiEdit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAccount(account._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="حذف الحساب"
                                            >
                                                <MdDelete size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer with summary */}
            {accounts.length > 0 && (
                <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">إجمالي الحسابات:</span>
                        <span className="font-bold text-blue-600 bg-white px-3 py-1 rounded-full shadow-sm">
                            {accounts.length}
                        </span>
                    </div>
                </div>
            )}

            {/* Add Account Modal */}
            {isAddModalOpen && (
                <AccountAdd
                    setIsAddModalOpen={setIsAddModalOpen}
                    chartId={chartId}
                    chartType={chartType} // Use chartType prop
                    levelId={levelId}
                    classId={classId}
                    groupId={groupId}
                    groupName={groupName}
                    groupCode={groupCode}
                    fetchAccounts={fetchAccounts}
                    mode="add"
                    isRTL={isRTL}
                />
            )}

            {/* Edit Account Modal */}
            {isEditModalOpen && selectedAccount && (
                <AccountAdd
                    setIsAddModalOpen={setIsEditModalOpen}
                    chartId={chartId}
                    chartType={chartType} // Use chartType prop
                    levelId={levelId}
                    classId={classId}
                    groupId={groupId}
                    groupName={groupName}
                    groupCode={groupCode}
                    accountData={selectedAccount}
                    fetchAccounts={fetchAccounts}
                    mode="edit"
                    onSubmit={handleEditSubmit}
                    isRTL={isRTL}
                />
            )}
        </div>
    );
};

export default Accounts;


// import React, { useContext, useState, useEffect } from 'react';
// import { AuthContext } from '../../../context/AuthContext';
// import { toast } from 'react-hot-toast';
// import { motion, AnimatePresence } from 'framer-motion';
// import { MdDelete, MdClose, MdAccountBalance } from "react-icons/md";
// import { FaPlus, FaFolder, FaEdit, FaArrowLeft } from "react-icons/fa";
// import { FiEdit3 } from "react-icons/fi";
// import { IoMdArrowBack } from "react-icons/io";
// import AccountAdd from '../components/chartofaccounts/AccountAdd';

// const Accounts = ({ 
//     chartId, 
//     levelId, 
//     classId, 
//     groupId, 
//     groupName, 
//     groupCode,
//     onBack,
//     isRTL = true 
// }) => {
//     const { axios } = useContext(AuthContext);
//     const [accounts, setAccounts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//     const [selectedAccount, setSelectedAccount] = useState(null);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);

//     // Construct the correct URL with plural forms
//     const getAccountsUrl = () => {
//         return `/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups/${groupId}/accounts`;
//     };

//     // Fetch accounts for the group
//     const fetchAccounts = async () => {
//         setLoading(true);
//         try {
//             const url = getAccountsUrl();
//             console.log('📡 Fetching accounts from:', url);
            
//             const response = await axios.get(url);
//             console.log('📡 Response:', response.data);
            
//             if (response.data.success) {
//                 setAccounts(response.data.accounts || []);
//             } else {
//                 toast.error('فشل في جلب الحسابات');
//             }
//         } catch (error) {
//             console.error('❌ Error fetching accounts:', error);
//             console.error('❌ URL attempted:', getAccountsUrl());
//             toast.error('خطأ في تحميل الحسابات');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (chartId && levelId && classId && groupId) {
//             console.log('📡 Fetching with IDs:', { chartId, levelId, classId, groupId });
//             fetchAccounts();
//         } else {
//             console.warn('⚠️ Missing required IDs:', { chartId, levelId, classId, groupId });
//         }
//     }, [chartId, levelId, classId, groupId]);

//     // Handle delete account
//     const handleDeleteAccount = async (accountId) => {
//         if (window.confirm('هل أنت متأكد من حذف هذا الحساب؟')) {
//             try {
//                 const url = `/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups/${groupId}/accounts/${accountId}`;
//                 console.log('🗑️ Deleting account from:', url);
                
//                 const response = await axios.delete(url);
//                 if (response.data.success) {
//                     toast.success('تم حذف الحساب بنجاح');
//                     fetchAccounts();
//                 } else {
//                     toast.error('فشل في حذف الحساب');
//                 }
//             } catch (error) {
//                 console.error('Delete error:', error);
//                 toast.error('خطأ في حذف الحساب');
//             }
//         }
//     };

//     // Handle edit account
//     const handleEditAccount = (account) => {
//         setSelectedAccount(account);
//         setIsEditModalOpen(true);
//     };

//     // Handle edit account submission
//     const handleEditSubmit = async (accountData) => {
//         try {
//             const url = `/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups/${groupId}/accounts/${selectedAccount._id}`;
//             console.log('✏️ Updating account at:', url);
            
//             const response = await axios.put(url, {
//                 name: accountData.name.trim(),
//                 nameArb: accountData.nameArb.trim(),
//                 code: accountData.code.trim(),
//                 type: accountData.type
//             });

//             if (response.data.success) {
//                 toast.success('تم تحديث الحساب بنجاح');
//                 fetchAccounts();
//                 setIsEditModalOpen(false);
//                 setSelectedAccount(null);
//             }
//         } catch (error) {
//             console.error('Error updating account:', error);
//             toast.error(error.response?.data?.message || 'فشل في تحديث الحساب');
//         }
//     };

//     // Account type badge colors with Arabic labels
//     const getTypeBadge = (type) => {
//         const types = {
//             'asset': { bg: 'bg-green-100', text: 'text-green-700', label: 'أصل' },
//             'liability': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'خصم' },
//             'equity': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'حقوق ملكية' },
//             'income': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'إيراد' },
//             'expense': { bg: 'bg-red-100', text: 'text-red-700', label: 'مصروف' }
//         };
//         return types[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type };
//     };

//     return (
//         <div 
//             dir="rtl" 
//             className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mt-4 w-full"
//         >
//             {/* Header */}
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4">
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                         <button
//                             onClick={onBack}
//                             className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
//                             title="العودة إلى المجموعات"
//                         >
//                             <IoMdArrowBack size={20} className="transform rotate-180" />
//                         </button>
//                         <div>
//                             <h2 className="text-xl font-semibold text-white flex items-center gap-2">
//                                 <MdAccountBalance />
//                                 الحسابات في {groupName}
//                             </h2>
//                             <p className="text-sm text-blue-100 mt-0.5">
//                                 {/* ✅ Display group name and code together */}
//                                 المجموعة: {groupName} {groupCode && <span className="font-bold">({groupCode})</span>}
//                             </p>
//                         </div>
//                     </div>
//                     <button
//                         onClick={() => setIsAddModalOpen(true)}
//                         className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md"
//                     >
//                         <FaPlus size={14} />
//                         إضافة حساب
//                     </button>
//                 </div>

//                 {/* Hierarchy Path Display with group code */}
//                 <div className="flex items-center gap-2 mt-2 text-xs text-blue-200">
//                     <span>المستوى الرئيسي</span>
//                     <span>/</span>
//                     <span>المستوى</span>
//                     <span>/</span>
//                     <span>التصنيف</span>
//                     <span>/</span>
//                     <span className="font-bold text-white">
//                         {groupName} {groupCode && `(${groupCode})`}
//                     </span>
//                 </div>
//             </div>

//             {/* Accounts List */}
//             <div className="p-4 sm:p-6">
//                 {loading ? (
//                     <div className="text-center py-8">
//                         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
//                         <p className="mt-3 text-sm text-gray-600">جاري تحميل الحسابات...</p>
//                     </div>
//                 ) : accounts.length === 0 ? (
//                     <div className="text-center py-12">
//                         <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
//                             <MdAccountBalance className="text-blue-600" size={32} />
//                         </div>
//                         <h3 className="text-lg font-semibold text-gray-800 mb-2">لا توجد حسابات</h3>
//                         <p className="text-gray-500 mb-6">
//                             لا توجد حسابات في مجموعة {groupName} {groupCode && `(${groupCode})`}
//                         </p>
//                         <button
//                             onClick={() => setIsAddModalOpen(true)}
//                             className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
//                         >
//                             <FaPlus size={14} />
//                             إضافة أول حساب
//                         </button>
//                     </div>
//                 ) : (
//                     <div className="grid grid-cols-1 gap-3">
//                         {accounts.map((account) => {
//                             const badge = getTypeBadge(account.type);
//                             return (
//                                 <motion.div
//                                     key={account._id}
//                                     initial={{ opacity: 0, y: 10 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:border-blue-300"
//                                 >
//                                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
//                                         {/* Account Info */}
//                                         <div className="flex-1">
//                                             <div className="flex items-center gap-3 mb-2">
//                                                 <h3 className="font-semibold text-gray-800 text-lg">
//                                                     {account.nameArb}
//                                                 </h3>
//                                                 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
//                                                     {badge.label}
//                                                 </span>
//                                             </div>
//                                             <div className="flex flex-wrap gap-3 text-sm">
//                                                 <span className="text-gray-600">
//                                                     الكود: <span className="font-mono font-medium">{account.code}</span>
//                                                 </span>
//                                                 {account.type && (
//                                                     <span className="text-gray-500">
//                                                         النوع: {account.type}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </div>

//                                         {/* Action Buttons */}
//                                         <div className="flex items-center gap-2">
//                                             <button
//                                                 onClick={() => handleEditAccount(account)}
//                                                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                                                 title="تعديل الحساب"
//                                             >
//                                                 <FiEdit3 size={18} />
//                                             </button>
//                                             <button
//                                                 onClick={() => handleDeleteAccount(account._id)}
//                                                 className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                                                 title="حذف الحساب"
//                                             >
//                                                 <MdDelete size={18} />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </motion.div>
//                             );
//                         })}
//                     </div>
//                 )}
//             </div>

//             {/* Footer with summary */}
//             {accounts.length > 0 && (
//                 <div className="bg-gray-50 px-4 sm:px-6 py-3 border-t border-gray-200">
//                     <div className="flex justify-between items-center text-sm">
//                         <span className="text-gray-600">إجمالي الحسابات:</span>
//                         <span className="font-bold text-blue-600 bg-white px-3 py-1 rounded-full shadow-sm">
//                             {accounts.length}
//                         </span>
//                     </div>
//                 </div>
//             )}

//             {/* Add Account Modal */}
//             {isAddModalOpen && (
//                 <AccountAdd
//                     setIsAddModalOpen={setIsAddModalOpen}
//                     chartId={chartId}
                   
//                     levelId={levelId}
//                     classId={classId}
//                     groupId={groupId}
//                     groupName={groupName}
//                     groupCode={groupCode}
//                     fetchAccounts={fetchAccounts}
//                     mode="add"
//                     isRTL={isRTL}
//                 />
//             )}

//             {/* Edit Account Modal */}
//             {isEditModalOpen && selectedAccount && (
//                 <AccountAdd
//                     setIsAddModalOpen={setIsEditModalOpen}
//                     chartId={chartId}
                    
//                     levelId={levelId}
//                     classId={classId}
//                     groupId={groupId}
//                     groupName={groupName}
//                     groupCode={groupCode}
//                     accountData={selectedAccount}
//                     fetchAccounts={fetchAccounts}
//                     mode="edit"
//                     onSubmit={handleEditSubmit}
//                     isRTL={isRTL}
//                 />
//             )}
//         </div>
//     );
// };

// export default Accounts;


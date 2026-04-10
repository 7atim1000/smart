import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { MdDelete, MdAccountBalance } from "react-icons/md";
import { FaPlus, FaFolder } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { IoMdArrowBack } from "react-icons/io";
import AccountAdd from '../components/chartofaccounts/AccountAdd';

const Accounts = ({ chartId, chartType, levelId, classId, groupId, groupName, groupCode, onBack }) => {
    const { axios } = useContext(AuthContext);
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // Fetch accounts for the group
    const fetchAccounts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups/${groupId}/accounts`);
            if (response.data.success) {
                setAccounts(response.data.accounts || []);
            } else {
                toast.error('Failed to fetch accounts');
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error('Error loading accounts');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (chartId && levelId && classId && groupId) {
            fetchAccounts();
        }
    }, [chartId, levelId, classId, groupId]);

    // Handle delete account
    const handleDeleteAccount = async (accountId) => {
        if (window.confirm('Are you sure you want to delete this account?')) {
            try {
                const response = await axios.delete(`/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups/${groupId}/accounts/${accountId}`);
                if (response.data.success) {
                    toast.success('Account deleted successfully');
                    fetchAccounts();
                } else {
                    toast.error('Failed to delete account');
                }
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Error deleting account');
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
            const response = await axios.put(`/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups/${groupId}/accounts/${selectedAccount._id}`, {
                name: accountData.name.trim(),
                nameArb: accountData.nameArb.trim(),
                code: accountData.code.trim(),
                type: accountData.type
            });

            if (response.data.success) {
                toast.success('Account updated successfully');
                fetchAccounts();
                setIsEditModalOpen(false);
                setSelectedAccount(null);
            }
        } catch (error) {
            console.error('Error updating account:', error);
            toast.error(error.response?.data?.message || 'Failed to update account');
        }
    };

    // Account type badge colors
    const getTypeBadge = (type) => {
        const types = {
            'asset': { bg: 'bg-green-100', text: 'text-green-700', label: 'Asset' },
            'liability': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Liability' },
            'equity': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Equity' },
            'income': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Income' },
            'expense': { bg: 'bg-red-100', text: 'text-red-700', label: 'Expense' }
        };
        return types[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type };
    };

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mt-4 w-full">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onBack}
                            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
                            title="Back to groups"
                        >
                            <IoMdArrowBack size={20} />
                        </button>
                        <div>
                            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                <MdAccountBalance />
                                Accounts in {groupName} {groupCode && `(${groupCode})`}
                            </h2>
                            <p className="text-sm text-blue-100 mt-0.5">
                                Manage accounts in this group
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md"
                    >
                        <FaPlus size={14} />
                        Add Account
                    </button>
                </div>
            </div>

            {/* Accounts List */}
            <div className="p-4 sm:p-6">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-3 text-sm text-gray-600">Loading accounts...</p>
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                            <MdAccountBalance className="text-blue-600" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">No Accounts Found</h3>
                        <p className="text-gray-500 mb-6">This group doesn't have any accounts yet.</p>
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
                        >
                            <FaPlus size={14} />
                            Add First Account
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
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-800">
                                                    {account.name}
                                                </h3>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                                                    {badge.label}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-3 text-sm">
                                                <span className="text-gray-600">
                                                    Code: <span className="font-mono font-medium">{account.code}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => handleEditAccount(account)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit account"
                                            >
                                                <FiEdit3 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteAccount(account._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete account"
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
                        <span className="text-gray-600">Total Accounts:</span>
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
                    chartType={chartType} // Pass the chart type
                    levelId={levelId}
                    classId={classId}
                    groupId={groupId}
                    groupName={groupName}
                    groupCode={groupCode}
                    fetchAccounts={fetchAccounts}
                    mode="add"
                />
            )}

            {/* Edit Account Modal */}
            {isEditModalOpen && selectedAccount && (
                <AccountAdd
                    setIsAddModalOpen={setIsEditModalOpen}
                    chartId={chartId}
                    chartType={chartType} // Pass the chart type
                    levelId={levelId}
                    classId={classId}
                    groupId={groupId}
                    groupName={groupName}
                    groupCode={groupCode}
                    accountData={selectedAccount}
                    fetchAccounts={fetchAccounts}
                    mode="edit"
                    onSubmit={handleEditSubmit}
                />
            )}
        </div>
    );
};

export default Accounts;


// import React, { useContext, useState, useEffect } from 'react';
// import { AuthContext } from '../../../context/AuthContext';
// import { toast } from 'react-hot-toast';
// import { motion } from 'framer-motion';
// import { MdDelete, MdAccountBalance } from "react-icons/md";
// import { FaPlus, FaFolder } from "react-icons/fa";
// import { FiEdit3 } from "react-icons/fi";
// import { IoMdArrowBack } from "react-icons/io";
// import AccountAdd from '../components/chartofaccounts/AccountAdd';

// const Accounts = ({ chartId, levelId, classId, groupId, groupName, groupCode, onBack }) => {
//     const { axios } = useContext(AuthContext);
//     const [accounts, setAccounts] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//     const [selectedAccount, setSelectedAccount] = useState(null);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);

//     // Fetch accounts for the group
//     const fetchAccounts = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(`/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups/${groupId}/accounts`);
//             if (response.data.success) {
//                 setAccounts(response.data.accounts || []);
//             } else {
//                 toast.error('Failed to fetch accounts');
//             }
//         } catch (error) {
//             console.error('Error fetching accounts:', error);
//             toast.error('Error loading accounts');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         if (chartId && levelId && classId && groupId) {
//             fetchAccounts();
//         }
//     }, [chartId, levelId, classId, groupId]);

//     // Handle delete account
//     const handleDeleteAccount = async (accountId) => {
//         if (window.confirm('Are you sure you want to delete this account?')) {
//             try {
//                 const response = await axios.delete(`/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups/${groupId}/accounts/${accountId}`);
//                 if (response.data.success) {
//                     toast.success('Account deleted successfully');
//                     fetchAccounts();
//                 } else {
//                     toast.error('Failed to delete account');
//                 }
//             } catch (error) {
//                 console.error('Delete error:', error);
//                 toast.error('Error deleting account');
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
//             const response = await axios.put(`/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups/${groupId}/accounts/${selectedAccount._id}`, {
//                 name: accountData.name.trim(),
//                 nameArb: accountData.nameArb.trim(),
//                 code: accountData.code.trim(),
//                 type: accountData.type
//             });

//             if (response.data.success) {
//                 toast.success('Account updated successfully');
//                 fetchAccounts();
//                 setIsEditModalOpen(false);
//                 setSelectedAccount(null);
//             }
//         } catch (error) {
//             console.error('Error updating account:', error);
//             toast.error(error.response?.data?.message || 'Failed to update account');
//         }
//     };

//     // Account type badge colors
//     const getTypeBadge = (type) => {
//         const types = {
//             'asset': { bg: 'bg-green-100', text: 'text-green-700', label: 'Asset' },
//             'liability': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Liability' },
//             'equity': { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Equity' },
//             'income': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Income' },
//             'expense': { bg: 'bg-red-100', text: 'text-red-700', label: 'Expense' }
//         };
//         return types[type] || { bg: 'bg-gray-100', text: 'text-gray-700', label: type };
//     };

//     return (
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mt-4 w-full">
//             {/* Header */}
//             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4">
//                 <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                         <button
//                             onClick={onBack}
//                             className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
//                             title="Back to groups"
//                         >
//                             <IoMdArrowBack size={20} />
//                         </button>
//                         <div>
//                             <h2 className="text-xl font-semibold text-white flex items-center gap-2">
//                                 <MdAccountBalance />
//                                 Accounts in {groupName} - {groupCode && `(${groupCode})`}
//                             </h2>
//                             <p className="text-sm text-blue-100 mt-0.5">
//                                 Manage accounts in this group
//                             </p>
//                         </div>
//                     </div>
//                     <button
//                         onClick={() => setIsAddModalOpen(true)}
//                         className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md"
//                     >
//                         <FaPlus size={14} />
//                         Add Account
//                     </button>
//                 </div>
//             </div>

//             {/* Accounts List */}
//             <div className="p-4 sm:p-6">
//                 {loading ? (
//                     <div className="text-center py-8">
//                         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
//                         <p className="mt-3 text-sm text-gray-600">Loading accounts...</p>
//                     </div>
//                 ) : accounts.length === 0 ? (
//                     <div className="text-center py-12">
//                         <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
//                             <MdAccountBalance className="text-blue-600" size={32} />
//                         </div>
//                         <h3 className="text-lg font-semibold text-gray-800 mb-2">No Accounts Found</h3>
//                         <p className="text-gray-500 mb-6">This group doesn't have any accounts yet.</p>
//                         <button
//                             onClick={() => setIsAddModalOpen(true)}
//                             className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
//                         >
//                             <FaPlus size={14} />
//                             Add First Account
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
//                                         <div className="flex-1">
//                                             <div className="flex items-center gap-3 mb-2">
//                                                 <h3 className="font-semibold text-gray-800">
//                                                     {account.name}
//                                                 </h3>
//                                                 <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
//                                                     {badge.label}
//                                                 </span>
//                                             </div>
//                                             <div className="flex flex-wrap gap-3 text-sm">
//                                                 <span className="text-gray-600">
//                                                     Code: <span className="font-mono font-medium">{account.code}</span>
//                                                 </span>
//                                             </div>
//                                         </div>
//                                         <div className="flex items-center gap-2">
//                                             <button
//                                                 onClick={() => handleEditAccount(account)}
//                                                 className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
//                                                 title="Edit account"
//                                             >
//                                                 <FiEdit3 size={18} />
//                                             </button>
//                                             <button
//                                                 onClick={() => handleDeleteAccount(account._id)}
//                                                 className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
//                                                 title="Delete account"
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
//                         <span className="text-gray-600">Total Accounts:</span>
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
//                 />
//             )}
//         </div>
//     );
// };

// export default Accounts;

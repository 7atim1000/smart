import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
    FaTimes, FaEdit, FaPrint, FaDownload, FaCheckCircle, 
    FaBan, FaArrowLeft, FaFilePdf, FaFileExcel, FaEnvelope,
    FaCheck, FaTimesCircle, FaClock, FaTrash, FaEye,
    FaShare, FaHistory
} from 'react-icons/fa';
import { MdDateRange, MdAccountBalance, MdWarning } from 'react-icons/md';

// Currency symbols mapping
const currencySymbols = {
    'SD': 'SD',
    'AED': 'AED',
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'SAR': 'ر.س',
    'QAR': 'ر.ق',
    'KWD': 'د.ك',
    'JOD': 'د.ا',
    'EGP': 'ج.م'
};

// Currency flags mapping
const currencyFlags = {
    'SD': '🇸🇩',
    'AED': '🇦🇪',
    'USD': '🇺🇸',
    'EUR': '🇪🇺',
    'GBP': '🇬🇧',
    'SAR': '🇸🇦',
    'QAR': '🇶🇦',
    'KWD': '🇰🇼',
    'JOD': '🇯🇴',
    'EGP': '🇪🇬'
};

const JournalDetails = ({ journal, onClose, onEdit, onRefresh, isRTL = false }) => {
    const { axios } = useContext(AuthContext);
    const [updating, setUpdating] = useState(false);
    const [activeTab, setActiveTab] = useState('entries');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null);
    const [reason, setReason] = useState('');

    // Format currency
    const formatCurrency = (amount, currency) => {
        const symbol = currencySymbols[currency] || currency;
        return `${Number(amount || 0).toFixed(2)} ${symbol}`;
    };

    // Get currency flag
    const getCurrencyFlag = (currency) => {
        return currencyFlags[currency] || '💵';
    };

    // Get status badge
    const getStatusBadge = (status) => {
        const statusConfig = {
            draft: { color: 'bg-yellow-100 text-yellow-600', icon: <FaClock size={14} />, label: 'Draft' },
            posted: { color: 'bg-green-100 text-green-600', icon: <FaCheckCircle size={14} />, label: 'Posted' },
            approved: { color: 'bg-blue-100 text-blue-600', icon: <FaCheck size={14} />, label: 'Approved' },
            rejected: { color: 'bg-red-100 text-red-600', icon: <FaTimesCircle size={14} />, label: 'Rejected' },
            cancelled: { color: 'bg-gray-100 text-gray-600', icon: <FaBan size={14} />, label: 'Cancelled' }
        };
        
        const config = statusConfig[status] || statusConfig.draft;
        
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 ${config.color} text-sm rounded-full`}>
                {config.icon}
                {config.label}
            </span>
        );
    };

    // Handle status update using PUT /:id
    const handleStatusUpdate = async (newStatus) => {
        setUpdating(true);
        try {
            // Prepare update data
            const updateData = {
                status: newStatus
            };
            
            // Add reason for rejection or cancellation
            if ((newStatus === 'rejected' || newStatus === 'cancelled') && reason) {
                updateData.statusReason = reason; // You might want to add this field to your schema
            }
            
            // Use the PUT update endpoint
            const response = await axios.put(`/v1/api/journals/${journal._id}`, updateData);
            
            if (response.data.success) {
                toast.success(`Journal ${newStatus} successfully`);
                if (onRefresh) onRefresh();
                onClose();
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error(error.response?.data?.message || `Failed to ${newStatus} journal`);
        } finally {
            setUpdating(false);
            setShowConfirmDialog(false);
            setReason('');
            setConfirmAction(null);
        }
    };

    // Handle specific status actions
    const handlePost = () => handleStatusUpdate('posted');
    const handleApprove = () => handleStatusUpdate('approved');
    
    const handleReject = () => {
        if (!reason.trim()) {
            toast.error('Please provide a reason for rejection');
            return;
        }
        handleStatusUpdate('rejected');
    };
    
    const handleCancel = () => {
        if (!reason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }
        handleStatusUpdate('cancelled');
    };

    // Show confirmation dialog
    const showConfirmation = (action) => {
        setConfirmAction(action);
        setShowConfirmDialog(true);
    };

    // Get balance color
    const getBalanceColor = (balance) => {
        if (balance > 0) return 'text-green-600';
        if (balance < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    // Available actions based on current status
    const getAvailableActions = () => {
        const actions = [];
        
        switch (journal.status) {
            case 'draft':
                actions.push(
                    { label: 'Post', action: handlePost, icon: <FaCheckCircle />, color: 'green', primary: true },
                    { label: 'Edit', action: onEdit, icon: <FaEdit />, color: 'blue', primary: false },
                    { label: 'Reject', action: () => showConfirmation('reject'), icon: <FaTimesCircle />, color: 'red', primary: false }
                );
                break;
            case 'posted':
                actions.push(
                    { label: 'Approve', action: handleApprove, icon: <FaCheck />, color: 'blue', primary: true },
                    { label: 'Reject', action: () => showConfirmation('reject'), icon: <FaTimesCircle />, color: 'red', primary: false },
                    { label: 'Cancel', action: () => showConfirmation('cancel'), icon: <FaBan />, color: 'gray', primary: false }
                );
                break;
            case 'approved':
                actions.push(
                    { label: 'Cancel', action: () => showConfirmation('cancel'), icon: <FaBan />, color: 'red', primary: true }
                );
                break;
            case 'rejected':
                actions.push(
                    { label: 'Edit', action: onEdit, icon: <FaEdit />, color: 'blue', primary: true }
                );
                break;
            case 'cancelled':
                // No actions for cancelled journals
                break;
        }
        
        return actions;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
            
            <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header with Action Buttons at Top */}
                    <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={onClose}
                                    className="text-white hover:text-blue-100 transition-colors"
                                >
                                    <FaArrowLeft size={20} />
                                </button>
                                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                    Journal Details
                                    <span className="text-sm bg-blue-500 px-2 py-1 rounded">
                                        {journal.code}
                                    </span>
                                </h2>
                                {getStatusBadge(journal.status)}
                            </div>
                            
                            {/* Action Buttons - Top Right */}
                            <div className="flex items-center gap-2">
                                {/* Utility Buttons */}
                                <button
                                    onClick={() => window.print()}
                                    className="p-2 text-white hover:bg-blue-500 rounded-lg transition-colors"
                                    title="Print"
                                >
                                    <FaPrint size={18} />
                                </button>
                                <button
                                    className="p-2 text-white hover:bg-blue-500 rounded-lg transition-colors"
                                    title="Export PDF"
                                >
                                    <FaDownload size={18} />
                                </button>
                                
                                {/* Status Action Buttons */}
                                {getAvailableActions().map((btn, index) => (
                                    <button
                                        key={index}
                                        onClick={btn.action}
                                        disabled={updating}
                                        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                                            btn.primary 
                                                ? `bg-${btn.color}-500 text-white hover:bg-${btn.color}-600 shadow-md`
                                                : `bg-white text-${btn.color}-600 hover:bg-${btn.color}-50 border border-${btn.color}-200`
                                        } disabled:opacity-50`}
                                    >
                                        {btn.icon}
                                        {btn.label}
                                    </button>
                                ))}
                                
                                <button
                                    onClick={onClose}
                                    className="p-2 text-white hover:bg-blue-500 rounded-lg"
                                >
                                    <FaTimes size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Dialog */}
                    {showConfirmDialog && (
                        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-20">
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
                            >
                                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                                    <MdWarning className="text-yellow-500" size={24} />
                                    Confirm {confirmAction}
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Are you sure you want to {confirmAction} this journal?
                                </p>
                                
                                {(confirmAction === 'reject' || confirmAction === 'cancel') && (
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Reason for {confirmAction}:
                                        </label>
                                        <textarea
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            rows="3"
                                            placeholder={`Enter reason for ${confirmAction}...`}
                                            autoFocus
                                        />
                                    </div>
                                )}
                                
                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => {
                                            setShowConfirmDialog(false);
                                            setReason('');
                                            setConfirmAction(null);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmAction === 'reject' ? handleReject : 
                                                confirmAction === 'cancel' ? handleCancel : 
                                                confirmAction === 'post' ? handlePost :
                                                confirmAction === 'approve' ? handleApprove : null}
                                        disabled={updating || (confirmAction !== 'post' && confirmAction !== 'approve' && !reason.trim())}
                                        className={`px-4 py-2 ${
                                            confirmAction === 'reject' || confirmAction === 'cancel'
                                                ? 'bg-red-600 hover:bg-red-700'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        } text-white rounded-lg disabled:opacity-50`}
                                    >
                                        {updating ? 'Processing...' : `Confirm ${confirmAction}`}
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}

                    {/* Content - Keep the same as before */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                        {/* Journal Header Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            {/* Basic Info */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Basic Information</h3>
                                <div className="space-y-2">
                                    <div>
                                        <p className="text-xs text-gray-400">Journal Name</p>
                                        <p className="font-medium">{journal.journalName}</p>
                                        <p className="text-sm text-gray-500">{journal.journalNameArb}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-xs text-gray-400">Code</p>
                                            <p className="font-mono font-medium">{journal.code}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Currency</p>
                                            <p className="flex items-center gap-1">
                                                {getCurrencyFlag(journal.currency)} {journal.currency}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Period Info */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Period Information</h3>
                                <div className="space-y-2">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <p className="text-xs text-gray-400">Fiscal Year</p>
                                            <p className="font-medium">{journal.fiscalYear}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Period</p>
                                            <p className="font-medium">{journal.period}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Last Entry Date</p>
                                        <p>{journal.lastEntryDate ? new Date(journal.lastEntryDate).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Financial Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm">Total Debit</span>
                                        <span className="font-medium text-green-600">
                                            {formatCurrency(journal.totalDebit, journal.currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm">Total Credit</span>
                                        <span className="font-medium text-red-600">
                                            {formatCurrency(journal.totalCredit, journal.currency)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between pt-2 border-t">
                                        <span className="text-sm font-medium">Current Balance</span>
                                        <span className={`font-bold ${getBalanceColor(journal.currentBalance)}`}>
                                            {formatCurrency(journal.currentBalance, journal.currency)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="border-b border-gray-200 mb-6">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setActiveTab('entries')}
                                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                        activeTab === 'entries'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Journal Entries ({journal.entries?.length || 0})
                                </button>
                                <button
                                    onClick={() => setActiveTab('summary')}
                                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                                        activeTab === 'summary'
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                    }`}
                                >
                                    Account Summary
                                </button>
                            </div>
                        </div>

                        {/* Tab Content - Keep the same as before */}
                        {activeTab === 'entries' ? (
                            <div className="border rounded-lg overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {journal.entries?.map((entry, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm">
                                                    {new Date(entry.date).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium">{entry.accName}</div>
                                                    <div className="text-xs text-gray-500">{entry.accNameArb}</div>
                                                    <div className="text-xs text-gray-400">{entry.accGroup}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">{entry.reference}</td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm">{entry.description}</div>
                                                    <div className="text-xs text-gray-500">{entry.descriptionArb}</div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    {entry.partnerName || '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-green-600">
                                                    {entry.debit > 0 ? formatCurrency(entry.debit, journal.currency) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm text-red-600">
                                                    {entry.credit > 0 ? formatCurrency(entry.credit, journal.currency) : '-'}
                                                </td>
                                                <td className="px-4 py-3 text-right text-sm font-medium">
                                                    {formatCurrency(entry.balance, journal.currency)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-gray-50 font-medium">
                                        <tr>
                                            <td colSpan="5" className="px-4 py-3 text-sm">
                                                Totals
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-green-600">
                                                {formatCurrency(journal.totalDebit, journal.currency)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-red-600">
                                                {formatCurrency(journal.totalCredit, journal.currency)}
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm">
                                                {formatCurrency(journal.currentBalance, journal.currency)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        ) : (
                            <div className="border rounded-lg p-6">
                                <h3 className="text-lg font-semibold mb-4">Account Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.values(journal.entries?.reduce((acc, entry) => {
                                        const accountName = entry.accName;
                                        if (!acc[accountName]) {
                                            acc[accountName] = {
                                                name: accountName,
                                                nameArb: entry.accNameArb,
                                                group: entry.accGroup,
                                                totalDebit: 0,
                                                totalCredit: 0,
                                                entries: 0
                                            };
                                        }
                                        acc[accountName].totalDebit += entry.debit;
                                        acc[accountName].totalCredit += entry.credit;
                                        acc[accountName].entries += 1;
                                        return acc;
                                    }, {})).map((account, index) => (
                                        <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                                            <h4 className="font-medium">{account.name}</h4>
                                            <p className="text-sm text-gray-500">{account.nameArb}</p>
                                            <p className="text-xs text-gray-400 mb-2">{account.group}</p>
                                            <div className="flex justify-between text-sm">
                                                <span>Debit:</span>
                                                <span className="text-green-600">{formatCurrency(account.totalDebit, journal.currency)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Credit:</span>
                                                <span className="text-red-600">{formatCurrency(account.totalCredit, journal.currency)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm mt-1 pt-1 border-t">
                                                <span>Net:</span>
                                                <span className={getBalanceColor(account.totalDebit - account.totalCredit)}>
                                                    {formatCurrency(account.totalDebit - account.totalCredit, journal.currency)}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">{account.entries} entries</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default JournalDetails;
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaTimes, 
    FaFileInvoice, 
    FaCalendar, 
    FaUser, 
    FaBuilding,
    FaMoneyBillWave,
    FaReceipt,
    FaPrint,
    FaDownload
} from 'react-icons/fa';
import { MdAccountBalance, MdDescription } from 'react-icons/md';
import { toast } from 'react-hot-toast';

const JournalEntriesModal = ({ setIsModalOpen, journalName, journalId }) => {
    const { axios } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [journals, setJournals] = useState([]);
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [entries, setEntries] = useState([]);
    const [summary, setSummary] = useState({
        totalDebit: 0,
        totalCredit: 0,
        netBalance: 0
    });

    // Fetch journals by name
    const fetchJournalsByName = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/v1/api/journals/search/by-name?searchTerm=${encodeURIComponent(journalName)}`);
            
            if (response.data.success) {
                setJournals(response.data.journals || []);
                if (response.data.journals && response.data.journals.length > 0) {
                    // Select the first journal by default
                    setSelectedJournal(response.data.journals[0]);
                    setEntries(response.data.journals[0].entries || []);
                    calculateSummary(response.data.journals[0].entries || []);
                }
            } else {
                toast.error('فشل في جلب قيود اليومية');
            }
        } catch (error) {
            console.error('Error fetching journals:', error);
            toast.error('خطأ في تحميل قيود اليومية');
        } finally {
            setLoading(false);
        }
    };

    // Calculate summary totals
    const calculateSummary = (entriesList) => {
        const totalDebit = entriesList.reduce((sum, entry) => sum + (entry.debit || 0), 0);
        const totalCredit = entriesList.reduce((sum, entry) => sum + (entry.credit || 0), 0);
        setSummary({
            totalDebit,
            totalCredit,
            netBalance: totalDebit - totalCredit
        });
    };

    // Handle journal selection change
    const handleJournalSelect = (journal) => {
        setSelectedJournal(journal);
        setEntries(journal.entries || []);
        calculateSummary(journal.entries || []);
    };

    useEffect(() => {
        if (journalName) {
            fetchJournalsByName();
        }
    }, [journalName]);

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('ar-EG', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format currency
    const formatCurrency = (amount) => {
        return (amount || 0).toFixed(2);
    };

    // Handle print
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" dir="rtl">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <FaFileInvoice className="text-white" />
                            قيود اليومية
                        </h2>
                        <p className="text-blue-200 text-sm mt-1">
                            {journalName}
                        </p>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">جاري تحميل قيود اليومية...</p>
                        </div>
                    ) : journals.length === 0 ? (
                        <div className="text-center py-12">
                            <MdAccountBalance className="mx-auto text-5xl text-gray-400 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد قيود يومية</h3>
                            <p className="text-gray-500">لم يتم العثور على قيود يومية لـ "{journalName}"</p>
                        </div>
                    ) : (
                        <>
                            {/* Journal Selection Tabs */}
                            {journals.length > 1 && (
                                <div className="mb-6 border-b border-gray-200">
                                    <div className="flex gap-2 overflow-x-auto pb-2">
                                        {journals.map((journal) => (
                                            <button
                                                key={journal._id}
                                                onClick={() => handleJournalSelect(journal)}
                                                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                                                    selectedJournal?._id === journal._id
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                            >
                                                {journal.code || journal.journalName}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Journal Header Info */}
                            {selectedJournal && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <FaFileInvoice className="text-blue-600" />
                                                <span className="font-semibold text-gray-700">تفاصيل اليومية:</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mr-6">
                                                <span className="font-medium">الكود:</span> {selectedJournal.code || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-600 mr-6">
                                                <span className="font-medium">المرجع:</span> {selectedJournal.reference || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-600 mr-6">
                                                <span className="font-medium">الفترة:</span> {selectedJournal.period || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-600 mr-6">
                                                <span className="font-medium">السنة المالية:</span> {selectedJournal.fiscalYear || 'N/A'}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <FaCalendar className="text-blue-600" />
                                                <span className="font-semibold text-gray-700">التواريخ:</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mr-6">
                                                <span className="font-medium">تاريخ الإنشاء:</span> {formatDate(selectedJournal.createdAt)}
                                            </p>
                                            <p className="text-sm text-gray-600 mr-6">
                                                <span className="font-medium">آخر قيد:</span> {formatDate(selectedJournal.lastEntryDate)}
                                            </p>
                                            <p className="text-sm text-gray-600 mr-6">
                                                <span className="font-medium">الحالة:</span> 
                                                <span className={`mr-2 px-2 py-1 rounded-full text-xs ${
                                                    selectedJournal.status === 'posted' 
                                                        ? 'bg-green-100 text-green-700'
                                                        : selectedJournal.status === 'draft'
                                                        ? 'bg-yellow-100 text-yellow-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {selectedJournal.status === 'posted' ? 'مرحل' : 
                                                     selectedJournal.status === 'draft' ? 'مسودة' : 
                                                     selectedJournal.status || 'N/A'}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Entries Table */}
                            {entries.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border p-3 text-right text-sm font-semibold text-gray-700">التاريخ</th>
                                                <th className="border p-3 text-right text-sm font-semibold text-gray-700">المرجع</th>
                                                <th className="border p-3 text-right text-sm font-semibold text-gray-700">الوصف</th>
                                                <th className="border p-3 text-right text-sm font-semibold text-gray-700">اسم الحساب</th>
                                                <th className="border p-3 text-left text-sm font-semibold text-gray-700">مدين</th>
                                                <th className="border p-3 text-left text-sm font-semibold text-gray-700">دائن</th>
                                                <th className="border p-3 text-left text-sm font-semibold text-gray-700">الرصيد</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {entries.map((entry, index) => (
                                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                                    <td className="border p-3 text-sm text-gray-700">
                                                        {formatDate(entry.date)}
                                                    </td>
                                                    <td className="border p-3 text-sm text-gray-700">
                                                        {entry.reference || '-'}
                                                    </td>
                                                    <td className="border p-3 text-sm text-gray-700">
                                                        <div>
                                                            <p>{entry.descriptionArb || entry.description}</p>
                                                            {entry.description && !entry.descriptionArb && (
                                                                <p className="text-xs text-gray-500">{entry.description}</p>
                                                            )}
                                                        </div>
                                                     </td>
                                                    <td className="border p-3 text-sm text-gray-700">
                                                        <div>
                                                            <p className="font-medium">{entry.accNameArb || entry.accName}</p>
                                                            {entry.accName && !entry.accNameArb && (
                                                                <p className="text-xs text-gray-500">{entry.accName}</p>
                                                            )}
                                                        </div>
                                                        {entry.partnerNameArb || entry.partnerName ? (
                                                            <p className="text-xs text-blue-600 mt-1">
                                                                الشريك: {entry.partnerNameArb || entry.partnerName}
                                                            </p>
                                                        ) : null}
                                                     </td>
                                                    <td className="border p-3 text-left text-sm font-medium text-green-600">
                                                        {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                                                     </td>
                                                    <td className="border p-3 text-left text-sm font-medium text-red-600">
                                                        {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                                                     </td>
                                                    <td className="border p-3 text-left text-sm font-medium text-gray-700">
                                                        {formatCurrency(entry.balance)}
                                                     </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-100 font-semibold">
                                            <tr>
                                                <td colSpan="4" className="border p-3 text-left font-bold text-gray-800">
                                                    الإجماليات:
                                                </td>
                                                <td className="border p-3 text-left text-green-700 font-bold">
                                                    {formatCurrency(summary.totalDebit)}
                                                </td>
                                                <td className="border p-3 text-left text-red-700 font-bold">
                                                    {formatCurrency(summary.totalCredit)}
                                                </td>
                                                <td className="border p-3 text-left font-bold text-gray-800">
                                                    {formatCurrency(summary.netBalance)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FaReceipt className="mx-auto text-4xl text-gray-400 mb-3" />
                                    <p className="text-gray-500">لا توجد قيود لهذه اليومية</p>
                                </div>
                            )}

                            {/* Summary Cards */}
                            {entries.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                        <div className="flex items-center gap-2">
                                            <FaMoneyBillWave className="text-green-600" />
                                            <span className="font-semibold text-gray-700">إجمالي المدين</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-700 mt-2">
                                            {formatCurrency(summary.totalDebit)}
                                        </p>
                                    </div>
                                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                                        <div className="flex items-center gap-2">
                                            <FaMoneyBillWave className="text-red-600" />
                                            <span className="font-semibold text-gray-700">إجمالي الدائن</span>
                                        </div>
                                        <p className="text-2xl font-bold text-red-700 mt-2">
                                            {formatCurrency(summary.totalCredit)}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                        <div className="flex items-center gap-2">
                                            <MdAccountBalance className="text-blue-600" />
                                            <span className="font-semibold text-gray-700">صافي الرصيد</span>
                                        </div>
                                        <p className={`text-2xl font-bold mt-2 ${
                                            summary.netBalance > 0 ? 'text-green-700' : 
                                            summary.netBalance < 0 ? 'text-red-700' : 'text-gray-700'
                                        }`}>
                                            {formatCurrency(summary.netBalance)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex justify-start gap-3">
                    <button
                        onClick={handlePrint}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <FaPrint />
                        طباعة
                    </button>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        إغلاق
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default JournalEntriesModal;
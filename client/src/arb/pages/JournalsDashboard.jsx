import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaChartPie } from 'react-icons/fa';
import { MdAccountBalance, MdRefresh } from 'react-icons/md';
import AddJournalName from '../components/journalsName/AddJournalName';
import JournalEntriesModal from '../components/journalsName/JournalEntriesModal';
import { HiOutlineDotsHorizontal } from "react-icons/hi";

const JournalsDashboard = ({ isRTL = true }) => {
    const { axios } = useContext(AuthContext);
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // RTL Helper Classes
    const textAlign = isRTL ? 'text-right' : 'text-left';
    const flexDirection = isRTL ? 'flex-row-reverse' : 'flex-row';
    const iconPosition = isRTL ? 'right-3' : 'left-3';
    const borderSide = isRTL ? 'border-l-2' : 'border-r-2';
    const marginIcon = isRTL ? 'ml-2' : 'mr-2';

    
    const [isEntriesModalOpen, setIsEntriesModalOpen] = useState(false);
    const [selectedJournalName, setSelectedJournalName] = useState('');
    const [selectedJournalId, setSelectedJournalId] = useState('');


    // Fetch all journals
    const fetchJournals = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/v1/api/journalsName');
            if (response.data.success) {
                setJournals(response.data.journals || []);
            } else {
                toast.error(isRTL ? 'فشل في جلب اليوميات' : 'Failed to fetch journals');
            }
        } catch (error) {
            console.error('Error fetching journals:', error);
            toast.error(isRTL ? 'خطأ في تحميل اليوميات' : 'Error loading journals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJournals();
    }, []);

    // Handle delete journal
    const handleDeleteJournal = async (id) => {
        if (window.confirm(isRTL ? 'هل أنت متأكد من حذف هذه اليومية؟' : 'Are you sure you want to delete this journal?')) {
            try {
                const response = await axios.delete(`/api/journalsName/${id}`);
                if (response.data.success) {
                    toast.success(isRTL ? 'تم حذف اليومية بنجاح' : 'Journal deleted successfully');
                    fetchJournals();
                } else {
                    toast.error(isRTL ? 'فشل في حذف اليومية' : 'Failed to delete journal');
                }
            } catch (error) {
                console.error('Delete error:', error);
                toast.error(isRTL ? 'خطأ في حذف اليومية' : 'Error deleting journal');
            }
        }
    };

    // Handle edit journal
    const handleEditJournal = (journal) => {
        setSelectedJournal(journal);
        setIsEditModalOpen(true);
    };

    // Filter journals based on search
    const filteredJournals = journals.filter(journal => {
        const searchLower = searchTerm.toLowerCase();
        return (
            journal.journalName?.toLowerCase().includes(searchLower) ||
            journal.journalNameArb?.includes(searchTerm) ||
            journal.code?.toLowerCase().includes(searchLower) ||
            journal.accName?.toLowerCase().includes(searchLower) ||
            journal.accNameArb?.includes(searchTerm)
        );
    });

    // Get balance color based on value
    const getBalanceColor = (balance) => {
        if (balance > 0) return 'text-green-600 bg-green-50';
        if (balance < 0) return 'text-red-600 bg-red-50';
        return 'text-gray-600 bg-gray-50';
    };

    // Handle view journal entries
    const handleViewEntries = (journal) => {
        setSelectedJournalName(journal.journalName);
        setSelectedJournalId(journal._id);
        setIsEntriesModalOpen(true);
    };

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            {/* Header Section */}
            <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 ${flexDirection}`}>
                <div className={textAlign}>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <MdAccountBalance className="text-blue-600" />
                        {isRTL ? 'لوحة تحكم اليوميات' : 'Journals Dashboard'}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        {isRTL ? 'إدارة اليوميات وأرصدتها' : 'Manage your journals and their balances'}
                    </p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className={`flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-3 rounded-lg font-medium transition-all hover:bg-blue-700 shadow-md hover:shadow-lg ${flexDirection}`}
                >
                    <FaPlus size={16} className={marginIcon} />
                    {isRTL ? 'إضافة يومية جديدة' : 'Add New Journal'}
                </button>
            </div>

            {/* Stats Summary */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <p className={`text-sm text-blue-600 mb-1 ${textAlign}`}>
                        {isRTL ? 'إجمالي اليوميات' : 'Total Journals'}
                    </p>
                    <p className={`text-2xl font-bold text-blue-800 ${textAlign}`}>{journals.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <p className={`text-sm text-green-600 mb-1 ${textAlign}`}>
                        {isRTL ? 'اليوميات النشطة' : 'Active Journals'}
                    </p>
                    <p className={`text-2xl font-bold text-green-800 ${textAlign}`}>
                        {journals.filter(j => j.balance !== 0).length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <p className={`text-sm text-purple-600 mb-1 ${textAlign}`}>
                        {isRTL ? 'إجمالي الرصيد' : 'Total Balance'}
                    </p>
                    <p className={`text-2xl font-bold text-purple-800 ${textAlign}`}>
                        {journals.reduce((sum, j) => sum + (j.balance || 0), 0).toFixed(2)}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <p className={`text-sm text-amber-600 mb-1 ${textAlign}`}>
                        {isRTL ? 'رصيد صفري' : 'Zero Balance'}
                    </p>
                    <p className={`text-2xl font-bold text-amber-800 ${textAlign}`}>
                        {journals.filter(j => j.balance === 0).length}
                    </p>
                </div>
            </div> */}

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={isRTL ? 'البحث باسم اليومية أو الكود أو الحساب...' : 'Search by journal name, code, or account...'}
                        className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all ${textAlign}`}
                    />
                    <FaSearch className={`absolute ${iconPosition} top-1/2 transform -translate-y-1/2 text-gray-400`} size={18} />
                </div>
            </div>

            {/* Journals Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{isRTL ? 'جاري تحميل اليوميات...' : 'Loading journals...'}</p>
                </div>
            ) : filteredJournals.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <MdAccountBalance className="mx-auto text-5xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {isRTL ? 'لا توجد يوميات' : 'No Journals Found'}
                    </h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm 
                            ? (isRTL ? 'لا توجد يوميات تطابق بحثك' : 'No journals match your search')
                            : (isRTL ? 'ابدأ بإضافة أول يومية' : 'Get started by adding your first journal')}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className={`inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors ${flexDirection}`}
                        >
                            <FaPlus size={16} className={marginIcon} />
                            {isRTL ? 'إضافة يومية' : 'Add Journal'}
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJournals.map((journal) => (
                        <motion.div
                            key={journal._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                        >
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                                {/* <div className={`flex items-center justify-between ${flexDirection}`}> */}
                                 <div className="flex items-center justify-between">
                                    
                                    <button
                                        onClick={() => handleViewEntries(journal)}
                                        className="p-1.5 bg-green/20 rounded-lg hover:bg-white/30 transition-colors text-[#f6b100]"
                                        title="Edit Journal"
                                    >
                                        <HiOutlineDotsHorizontal size={30} />
                                    </button>

                                    {/* <div className={`flex gap-2 ${flexDirection}`}> */}
                                    {/* <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditJournal(journal)}
                                            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
                                            title={isRTL ? 'تعديل اليومية' : 'Edit Journal'}
                                        >
                                            <FaEdit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteJournal(journal._id)}
                                            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
                                            title={isRTL ? 'حذف اليومية' : 'Delete Journal'}
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div> */}
                                    <span className="text-white font-mono font-bold text-sm bg-blue-800/30 px-2 py-1 rounded">
                                        {/* {journal.code} */}
                                    </span>
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4">
                                {/* Journal Names */}
                                <div className="mb-3">
                                    <h3 className={`text-lg font-bold text-gray-800 mb-1 ${textAlign}`}>
                                        {journal.journalNameArb}
                                    </h3>
                                    <p className={`text-sm text-gray-600 ${borderSide} border-blue-200 ${isRTL ? 'pl-2' : 'pr-2'} ${textAlign}`}>
                                        {journal.journalName}
                                    </p>
                                </div>

                                {/* Account Info */}
                                <div className="space-y-2 mb-4">
                                    <div className={`flex items-center gap-2 text-sm `}>
                                        <span className="font-medium text-gray-600 min-w-[80px]">
                                            {isRTL ? 'الحساب:' : 'Account:'}
                                        </span>
                                        <div className={textAlign}>
                                            <p className="text-gray-800">{journal.accNameArb}</p>
                                            <p className="text-xs text-gray-500">{journal.accName}</p>
                                        </div>
                                    </div>
                                    
                                    <div className={`flex items-center gap-2 text-sm `}>
                                        <span className="font-medium text-gray-600 min-w-[80px]">
                                            {isRTL ? 'المجموعة:' : 'Group:'}
                                        </span>
                                        <div className={textAlign}>
                                            <p className="text-gray-800">{journal.accGroupArb}</p>
                                            <p className="text-xs text-gray-500">{journal.accGroup}</p>
                                        </div>
                                    </div>

                                    {/* <div className={`flex items-center gap-2 text-sm ${flexDirection}`}>
                                        <span className="font-medium text-gray-600 min-w-[80px]">
                                            {isRTL ? 'المستوى:' : 'Level:'}
                                        </span>
                                        <div className={textAlign}>
                                            <p className="text-gray-800">{journal.accLevel}</p>
                                            <p className="text-xs text-gray-500">{journal.accLevelArb}</p>
                                        </div>
                                    </div>

                                    <div className={`flex items-center gap-2 text-sm ${flexDirection}`}>
                                        <span className="font-medium text-gray-600 min-w-[80px]">
                                            {isRTL ? 'دليل الحسابات:' : 'Chart:'}
                                        </span>
                                        <div className={textAlign}>
                                            <p className="text-gray-800">{journal.accChart}</p>
                                            <p className="text-xs text-gray-500">{journal.accChartArb}</p>
                                        </div>
                                    </div> */}
                                </div>

                                {/* Balance Footer */}
                                {/* <div className={`flex items-center justify-between p-3 rounded-lg ${getBalanceColor(journal.balance)} `}>
                                    <span className="font-medium">{isRTL ? 'الرصيد' : 'Balance'}</span>
                                    <span className="font-bold text-lg">
                                        {journal.balance?.toFixed(2) || '0.00'}
                                    </span>
                                </div> */}

                                {/* Timestamps */}
                                <div className={`mt-3 text-xs text-gray-400 flex justify-between ${flexDirection}`}>
                                    <span>{isRTL ? 'تاريخ الإنشاء:' : 'Created:'} {new Date(journal.createdAt).toLocaleDateString(isRTL ? 'ar' : 'en')}</span>
                                    <span>{isRTL ? 'تاريخ التحديث:' : 'Updated:'} {new Date(journal.updatedAt).toLocaleDateString(isRTL ? 'ar' : 'en')}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add Journal Modal */}
            {isAddModalOpen && (
                <AddJournalName
                    setIsAddModalOpen={setIsAddModalOpen}
                    fetchJournals={fetchJournals}
                    mode="add"
                    isRTL={isRTL}
                />
            )}

            {/* Edit Journal Modal */}
            {isEditModalOpen && selectedJournal && (
                <AddJournalName
                    setIsAddModalOpen={setIsEditModalOpen}
                    journalData={selectedJournal}
                    fetchJournals={fetchJournals}
                    mode="edit"
                    isRTL={isRTL}
                />
            )}

            {/* Journal Entries Modal */}
            {isEntriesModalOpen && (
                <JournalEntriesModal
                    setIsModalOpen={setIsEntriesModalOpen}
                    journalName={selectedJournalName}
                    journalId={selectedJournalId}
                />
            )}
        </div>
    );
};

export default JournalsDashboard;
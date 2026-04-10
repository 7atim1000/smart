import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaChartPie, FaEye } from 'react-icons/fa';
import { MdAccountBalance, MdRefresh } from 'react-icons/md';
import AddJournalName from '../components/journalsName/AddJournalName';
import JournalEntriesModal from '../components/journalsName/JournalEntriesModal';
import { HiOutlineDotsHorizontal } from "react-icons/hi";

const JournalsDashboard = () => {
    const { axios } = useContext(AuthContext);
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
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
                toast.error('Failed to fetch journals');
            }
        } catch (error) {
            console.error('Error fetching journals:', error);
            toast.error('Error loading journals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJournals();
    }, []);

    // Handle delete journal
    const handleDeleteJournal = async (id) => {
        if (window.confirm('Are you sure you want to delete this journal?')) {
            try {
                const response = await axios.delete(`/api/journalsName/${id}`);
                if (response.data.success) {
                    toast.success('Journal deleted successfully');
                    fetchJournals();
                } else {
                    toast.error('Failed to delete journal');
                }
            } catch (error) {
                console.error('Delete error:', error);
                toast.error('Error deleting journal');
            }
        }
    };

    // Handle edit journal
    const handleEditJournal = (journal) => {
        setSelectedJournal(journal);
        setIsEditModalOpen(true);
    };

    // Handle view journal entries
    const handleViewEntries = (journal) => {
        setSelectedJournalName(journal.journalName);
        setSelectedJournalId(journal._id);
        setIsEntriesModalOpen(true);
    };

    // Filter journals based on search
    const filteredJournals = journals.filter(journal => {
        const searchLower = searchTerm.toLowerCase();
        return (
            journal.journalName?.toLowerCase().includes(searchLower) ||
            journal.journalNameArb?.includes(searchTerm) ||
            journal.code?.toLowerCase().includes(searchLower) ||
            journal.accName?.toLowerCase().includes(searchLower)
        );
    });

    // Get balance color based on value
    const getBalanceColor = (balance) => {
        if (balance > 0) return 'text-green-600 bg-green-50';
        if (balance < 0) return 'text-red-600 bg-red-50';
        return 'text-gray-600 bg-gray-50';
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <MdAccountBalance className="text-blue-600" />
                        Journals Dashboard
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Manage your journals and their balances
                    </p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-3 rounded-lg font-medium transition-all hover:bg-blue-700 shadow-md hover:shadow-lg"
                >
                    <FaPlus size={16} />
                    Add New Journal
                </button>
            </div>

            {/* Stats Summary */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">Total Journals</p>
                    <p className="text-2xl font-bold text-blue-800">{journals.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-green-600 mb-1">Active Journals</p>
                    <p className="text-2xl font-bold text-green-800">{journals.filter(j => j.balance !== 0).length}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <p className="text-sm text-purple-600 mb-1">Total Balance</p>
                    <p className="text-2xl font-bold text-purple-800">
                        {journals.reduce((sum, j) => sum + (j.balance || 0), 0).toFixed(2)}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm text-amber-600 mb-1">Zero Balance</p>
                    <p className="text-2xl font-bold text-amber-800">{journals.filter(j => j.balance === 0).length}</p>
                </div>
            </div> */}

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by journal name, code, or account..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            {/* Journals Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading journals...</p>
                </div>
            ) : filteredJournals.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <MdAccountBalance className="mx-auto text-5xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Journals Found</h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm ? 'No journals match your search' : 'Get started by adding your first journal'}
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus size={16} />
                            Add Journal
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
                                <div className="flex items-center justify-between">
                                    {/* <button
                                        onClick={() => handleViewEntries(journal)}
                                        className="text-white font-mono font-bold text-sm bg-blue-800/30 px-2 py-1 rounded hover:bg-blue-800/50 transition-colors cursor-pointer"
                                    >
                                        {journal.code || 'View Entries'}
                                    </button> */}
                                    <button
                                        onClick={() => handleViewEntries(journal)}
                                        className="p-1.5 bg-green/20 rounded-lg hover:bg-white/30 transition-colors text-[#f6b100]"
                                        title="Edit Journal"
                                    >
                                        <HiOutlineDotsHorizontal size={30} />
                                    </button>
                                    {/* <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditJournal(journal)}
                                            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
                                            title="Edit Journal"
                                        >
                                            <FaEdit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteJournal(journal._id)}
                                            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
                                            title="Delete Journal"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div> */}
                                </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-4">
                                {/* Journal Names - Make them clickable */}
                                <div className="mb-3">
                                    <button
                                        onClick={() => handleViewEntries(journal)}
                                        className="w-full text-left hover:bg-blue-50 p-2 rounded-lg transition-colors -mx-2"
                                    >
                                        <h3 className="text-lg font-bold text-gray-800 mb-1 hover:text-blue-600 transition-colors">
                                            {journal.journalName}
                                            <FaEye className="inline ml-2 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                                        </h3>
                                        <p className="text-sm text-gray-600 border-r-2 border-blue-200 pr-2">
                                            {journal.journalNameArb}
                                        </p>
                                    </button>
                                </div>

                                {/* Account Info */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-gray-600 min-w-[80px]">Account:</span>
                                        <div>
                                            <p className="text-gray-800">{journal.accName}</p>
                                            <p className="text-xs text-gray-500">{journal.accNameArb}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-gray-600 min-w-[80px]">Group:</span>
                                        <div>
                                            <p className="text-gray-800">{journal.accGroup}</p>
                                            <p className="text-xs text-gray-500">{journal.accGroupArb}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Timestamps */}
                                <div className="mt-3 text-xs text-gray-400 flex justify-between">
                                    <span>Created: {new Date(journal.createdAt).toLocaleDateString()}</span>
                                    <span>Updated: {new Date(journal.updatedAt).toLocaleDateString()}</span>
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
                />
            )}

            {/* Edit Journal Modal */}
            {isEditModalOpen && selectedJournal && (
                <AddJournalName
                    setIsAddModalOpen={setIsEditModalOpen}
                    journalData={selectedJournal}
                    fetchJournals={fetchJournals}
                    mode="edit"
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



// import React, { useContext, useState, useEffect } from 'react';
// import { AuthContext } from '../../../context/AuthContext';
// import { toast } from 'react-hot-toast';
// import { motion, AnimatePresence } from 'framer-motion';
// import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaChartPie } from 'react-icons/fa';
// import { MdAccountBalance, MdRefresh } from 'react-icons/md';
// import AddJournalName from '../components/journalsName/AddJournalName';

// const JournalsDashboard = () => {
//     const { axios } = useContext(AuthContext);
//     const [journals, setJournals] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedJournal, setSelectedJournal] = useState(null);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);

//     // Fetch all journals
//     const fetchJournals = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get('/v1/api/journalsName');
//             if (response.data.success) {
//                 setJournals(response.data.journals || []);
//             } else {
//                 toast.error('Failed to fetch journals');
//             }
//         } catch (error) {
//             console.error('Error fetching journals:', error);
//             toast.error('Error loading journals');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchJournals();
//     }, []);

//     // Handle delete journal
//     const handleDeleteJournal = async (id) => {
//         if (window.confirm('Are you sure you want to delete this journal?')) {
//             try {
//                 const response = await axios.delete(`/api/journalsName/${id}`);
//                 if (response.data.success) {
//                     toast.success('Journal deleted successfully');
//                     fetchJournals();
//                 } else {
//                     toast.error('Failed to delete journal');
//                 }
//             } catch (error) {
//                 console.error('Delete error:', error);
//                 toast.error('Error deleting journal');
//             }
//         }
//     };

//     // Handle edit journal
//     const handleEditJournal = (journal) => {
//         setSelectedJournal(journal);
//         setIsEditModalOpen(true);
//     };

//     // Filter journals based on search
//     const filteredJournals = journals.filter(journal => {
//         const searchLower = searchTerm.toLowerCase();
//         return (
//             journal.journalName?.toLowerCase().includes(searchLower) ||
//             journal.journalNameArb?.includes(searchTerm) ||
//             journal.code?.toLowerCase().includes(searchLower) ||
//             journal.accName?.toLowerCase().includes(searchLower)
//         );
//     });

//     // Get balance color based on value
//     const getBalanceColor = (balance) => {
//         if (balance > 0) return 'text-green-600 bg-green-50';
//         if (balance < 0) return 'text-red-600 bg-red-50';
//         return 'text-gray-600 bg-gray-50';
//     };

//     return (
//         <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
//             {/* Header Section */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//                 <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
//                         <MdAccountBalance className="text-blue-600" />
//                         Journals Dashboard
//                     </h1>
//                     <p className="text-sm sm:text-base text-gray-600 mt-1">
//                         Manage your journals and their balances
//                     </p>
//                 </div>

//                 <button
//                     onClick={() => setIsAddModalOpen(true)}
//                     className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-3 rounded-lg font-medium transition-all hover:bg-blue-700 shadow-md hover:shadow-lg"
//                 >
//                     <FaPlus size={16} />
//                     Add New Journal
//                 </button>
//             </div>

//             {/* Stats Summary */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//                 <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
//                     <p className="text-sm text-blue-600 mb-1">Total Journals</p>
//                     <p className="text-2xl font-bold text-blue-800">{journals.length}</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
//                     <p className="text-sm text-green-600 mb-1">Active Journals</p>
//                     <p className="text-2xl font-bold text-green-800">{journals.filter(j => j.balance !== 0).length}</p>
//                 </div>
//                 <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
//                     <p className="text-sm text-purple-600 mb-1">Total Balance</p>
//                     <p className="text-2xl font-bold text-purple-800">
//                         {journals.reduce((sum, j) => sum + (j.balance || 0), 0).toFixed(2)}
//                     </p>
//                 </div>
//                 <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
//                     <p className="text-sm text-amber-600 mb-1">Zero Balance</p>
//                     <p className="text-2xl font-bold text-amber-800">{journals.filter(j => j.balance === 0).length}</p>
//                 </div>
//             </div>

//             {/* Search Bar */}
//             <div className="mb-6">
//                 <div className="relative">
//                     <input
//                         type="text"
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         placeholder="Search by journal name, code, or account..."
//                         className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
//                     />
//                     <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
//                 </div>
//             </div>

//             {/* Journals Grid */}
//             {loading ? (
//                 <div className="text-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">Loading journals...</p>
//                 </div>
//             ) : filteredJournals.length === 0 ? (
//                 <div className="text-center py-12 bg-gray-50 rounded-xl">
//                     <MdAccountBalance className="mx-auto text-5xl text-gray-400 mb-4" />
//                     <h3 className="text-xl font-semibold text-gray-700 mb-2">No Journals Found</h3>
//                     <p className="text-gray-500 mb-4">
//                         {searchTerm ? 'No journals match your search' : 'Get started by adding your first journal'}
//                     </p>
//                     {!searchTerm && (
//                         <button
//                             onClick={() => setIsAddModalOpen(true)}
//                             className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
//                         >
//                             <FaPlus size={16} />
//                             Add Journal
//                         </button>
//                     )}
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                     {filteredJournals.map((journal) => (
//                         <motion.div
//                             key={journal._id}
//                             initial={{ opacity: 0, y: 20 }}
//                             animate={{ opacity: 1, y: 0 }}
//                             exit={{ opacity: 0, y: -20 }}
//                             className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
//                         >
//                             {/* Card Header */}
//                             <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
//                                 <div className="flex items-center justify-between">
//                                     <span className="text-white font-mono font-bold text-sm bg-blue-800/30 px-2 py-1 rounded">
//                                         {/* {journal.code} */}
//                                     </span>
//                                     <div className="flex gap-2">
//                                         <button
//                                             onClick={() => handleEditJournal(journal)}
//                                             className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
//                                             title="Edit Journal"
//                                         >
//                                             <FaEdit size={14} />
//                                         </button>
//                                         <button
//                                             onClick={() => handleDeleteJournal(journal._id)}
//                                             className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
//                                             title="Delete Journal"
//                                         >
//                                             <FaTrash size={14} />
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Card Body */}
//                             <div className="p-4">
//                                 {/* Journal Names */}
//                                 <div className="mb-3">
//                                     <h3 className="text-lg font-bold text-gray-800 mb-1">
//                                         {journal.journalName}
//                                     </h3>
//                                     <p className="text-sm text-gray-600 border-r-2 border-blue-200 pr-2">
//                                         {journal.journalNameArb}
//                                     </p>
//                                 </div>

//                                 {/* Account Info */}
//                                 <div className="space-y-2 mb-4">
//                                     <div className="flex items-center gap-2 text-sm">
//                                         <span className="font-medium text-gray-600 min-w-[80px]">Account:</span>
//                                         <div>
//                                             <p className="text-gray-800">{journal.accName}</p>
//                                             <p className="text-xs text-gray-500">{journal.accNameArb}</p>
//                                         </div>
//                                     </div>
                                    
//                                    <div className="flex items-center gap-2 text-sm">
//                                         <span className="font-medium text-gray-600 min-w-[80px]">Group:</span>
//                                         <div>
//                                             <p className="text-gray-800">{journal.accGroup}</p>
//                                             <p className="text-xs text-gray-500">{journal.accGroupArb}</p>
//                                         </div>
//                                     </div>
                                   
//                                      {/* 
//                                     <div className="flex items-center gap-2 text-sm">
//                                         <span className="font-medium text-gray-600 min-w-[80px]">Level:</span>
//                                         <div>
//                                             <p className="text-gray-800">{journal.accLevel}</p>
//                                             <p className="text-xs text-gray-500">{journal.accLevelArb}</p>
//                                         </div>
//                                     </div>

//                                     <div className="flex items-center gap-2 text-sm">
//                                         <span className="font-medium text-gray-600 min-w-[80px]">Chart:</span>
//                                         <div>
//                                             <p className="text-gray-800">{journal.accChart}</p>
//                                             <p className="text-xs text-gray-500">{journal.accChartArb}</p>
//                                         </div>
//                                     </div> */}
//                                 </div>

//                                 {/* Balance Footer */}
//                                 {/* <div className={`flex items-center justify-between p-3 rounded-lg ${getBalanceColor(journal.balance)}`}>
//                                     <span className="font-medium">Balance</span>
//                                     <span className="font-bold text-lg">
//                                         {journal.balance?.toFixed(2) || '0.00'}
//                                     </span>
//                                 </div> */}

//                                 {/* Timestamps */}
//                                 <div className="mt-3 text-xs text-gray-400 flex justify-between">
//                                     <span>Created: {new Date(journal.createdAt).toLocaleDateString()}</span>
//                                     <span>Updated: {new Date(journal.updatedAt).toLocaleDateString()}</span>
//                                 </div>
//                             </div>
//                         </motion.div>
//                     ))}
//                 </div>
//             )}

//             {/* Add Journal Modal */}
//             {isAddModalOpen && (
//                 <AddJournalName
//                     setIsAddModalOpen={setIsAddModalOpen}
//                     fetchJournals={fetchJournals}
//                     mode="add"
//                 />
//             )}

//             {/* Edit Journal Modal */}
//             {isEditModalOpen && selectedJournal && (
//                 <AddJournalName
//                     setIsAddModalOpen={setIsEditModalOpen}
//                     journalData={selectedJournal}
//                     fetchJournals={fetchJournals}
//                     mode="edit"
//                 />
//             )}
//         </div>
//     );
// };

// export default JournalsDashboard;
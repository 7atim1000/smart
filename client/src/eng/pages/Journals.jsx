import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaFileInvoice, 
    FaCalendarAlt, FaChevronDown, FaChevronUp, FaMoneyBillWave, FaFilter,
    FaArrowLeft, FaPrint, FaDownload, FaTimes, FaCheckCircle, FaBan
} from 'react-icons/fa';
import { MdAccountBalance, MdRefresh, MdDateRange } from 'react-icons/md';
import { IoMdArrowForward, IoMdArrowBack } from 'react-icons/io';
import AddJournal from '../components/journals/AddJournal';
import JournalDetails from '../components/journals/JournalDetails'; // New import

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

// Status options
const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'posted', label: 'Posted' },
    // { value: 'approved', label: 'Approved' },
    // { value: 'rejected', label: 'Rejected' },
    // { value: 'cancelled', label: 'Cancelled' }
];

const Journals = ({ isRTL = false }) => {
    const { axios } = useContext(AuthContext);
    const [journals, setJournals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedJournal, setSelectedJournal] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); // New state for details modal
    const [viewMode, setViewMode] = useState('list');
    const [expandedJournals, setExpandedJournals] = useState({});
    const [statusFilter, setStatusFilter] = useState('all');
    const [periodFilter, setPeriodFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('all');

    // Get unique currencies from journals
    const availableCurrencies = [...new Set(journals.map(j => j.currency))];
    
    // Get unique years from journals
    const availableYears = [...new Set(journals.map(j => j.fiscalYear))].sort((a, b) => b - a);

    // Get unique periods from journals
    const availablePeriods = [...new Set(journals.map(j => j.period))].sort((a, b) => b.localeCompare(a));

    // Fetch all journals
    const fetchJournals = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/v1/api/journals');
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

    // Handle view journal details
    const handleViewJournal = (journal) => {
        setSelectedJournal(journal);
        setIsDetailsModalOpen(true);
    };

    // Handle edit journal
    const handleEditJournal = (journal, e) => {
        e.stopPropagation(); // Prevent triggering row click
        setSelectedJournal(journal);
        setIsEditModalOpen(true);
    };

    // Handle delete journal
    const handleDeleteJournal = async (id, e) => {
        e.stopPropagation(); // Prevent triggering row click
        if (window.confirm('Are you sure you want to delete this journal?')) {
            try {
                const response = await axios.delete(`/v1/api/journals/${id}`);
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

    // Toggle expanded entries
    const toggleEntries = (journalId, e) => {
        e.stopPropagation(); // Prevent triggering row click
        setExpandedJournals(prev => ({
            ...prev,
            [journalId]: !prev[journalId]
        }));
    };

    // Filter journals based on search, status, period, and year
    const filteredJournals = journals.filter(journal => {
        const searchLower = searchTerm.toLowerCase();
        
        // Apply status filter
        if (statusFilter !== 'all' && journal.status !== statusFilter) {
            return false;
        }
        
        // Apply period filter
        if (periodFilter !== 'all' && journal.period !== periodFilter) {
            return false;
        }
        
        // Apply year filter
        if (yearFilter !== 'all' && journal.fiscalYear !== parseInt(yearFilter)) {
            return false;
        }
        
        // Search in journal header
        const headerMatch = 
            journal.journalName?.toLowerCase().includes(searchLower) ||
            journal.journalNameArb?.includes(searchTerm) ||
            journal.code?.toLowerCase().includes(searchLower) ||
            journal.period?.includes(searchTerm) ||
            journal.currency?.toLowerCase().includes(searchLower) ||
            journal.status?.toLowerCase().includes(searchLower);
        
        if (headerMatch) return true;
        
        // Search in entries
        return journal.entries?.some(entry => 
            entry.description?.toLowerCase().includes(searchLower) ||
            entry.descriptionArb?.includes(searchTerm) ||
            entry.reference?.toLowerCase().includes(searchLower) ||
            entry.accName?.toLowerCase().includes(searchLower) ||
            entry.accNameArb?.includes(searchTerm) ||
            entry.partnerName?.toLowerCase().includes(searchLower)
        );
    });

    // Get status badge
    const getStatusBadge = (journal) => {
        if (journal.isClosed) {
            return <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Closed</span>;
        }
        if (!journal.isActive) {
            return <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">Inactive</span>;
        }
        
        // Show status field if available
        if (journal.status) {
            const statusColors = {
                draft: 'bg-yellow-100 text-yellow-600',
                posted: 'bg-green-100 text-green-600',
                approved: 'bg-blue-100 text-blue-600',
                rejected: 'bg-red-100 text-red-600',
                cancelled: 'bg-gray-100 text-gray-600'
            };
            const colorClass = statusColors[journal.status] || 'bg-green-100 text-green-600';
            return <span className={`px-2 py-1 ${colorClass} text-xs rounded-full capitalize`}>{journal.status}</span>;
        }
        
        return <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full">Active</span>;
    };

    // Get balance color
    const getBalanceColor = (balance) => {
        if (balance > 0) return 'text-green-600';
        if (balance < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    // Format currency with symbol
    const formatCurrency = (amount, currency) => {
        const symbol = currencySymbols[currency] || currency;
        return `${Number(amount || 0).toFixed(2)} ${symbol}`;
    };

    // Get currency flag
    const getCurrencyFlag = (currency) => {
        return currencyFlags[currency] || '💵';
    };

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('all');
        setPeriodFilter('all');
        setYearFilter('all');
    };

    return (
        <div dir="ltr" className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <FaFileInvoice className="text-blue-600" />
                        Journals Management
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        Manage, add and track accounting journals
                    </p>
                </div>

                <div className="flex gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                                viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
                            }`}
                            title="Grid view"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-3 py-2 rounded-lg transition-colors ${
                                viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-800'
                            }`}
                            title="List view"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-2 rounded-lg font-medium transition-all hover:bg-blue-700 shadow-md hover:shadow-lg"
                    >
                        <FaPlus size={16} />
                        Add Journal
                    </button>
                </div>
            </div>

            {/* Stats Summary - Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                    <p className="text-sm text-blue-600 mb-1">Total Journals</p>
                    <p className="text-2xl font-bold text-blue-800">{journals.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-green-600 mb-1">Active Journals</p>
                    <p className="text-2xl font-bold text-green-800">
                        {journals.filter(j => j.isActive && !j.isClosed).length}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                    <p className="text-sm text-purple-600 mb-1">Total Balance</p>
                    <p className="text-2xl font-bold text-purple-800">
                        {journals.reduce((sum, j) => sum + (j.currentBalance || 0), 0).toFixed(2)}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm text-amber-600 mb-1">Total Entries</p>
                    <p className="text-2xl font-bold text-amber-800">
                        {journals.reduce((sum, j) => sum + (j.entries?.length || 0), 0)}
                    </p>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
                    <p className="text-sm text-indigo-600 mb-1">Status Types</p>
                    <p className="text-2xl font-bold text-indigo-800">
                        {[...new Set(journals.map(j => j.status || 'active'))].length}
                    </p>
                </div>
            </div>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {/* Search Bar */}
                <div className="relative md:col-span-1">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search journals..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none bg-white"
                    >
                        {statusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <FaFilter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>

                {/* Period Filter */}
                <div className="relative">
                    <select
                        value={periodFilter}
                        onChange={(e) => setPeriodFilter(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none bg-white"
                    >
                        <option value="all">All Periods</option>
                        {availablePeriods.map(period => (
                            <option key={period} value={period}>
                                {period}
                            </option>
                        ))}
                    </select>
                    <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>

                {/* Year Filter */}
                <div className="relative">
                    <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 appearance-none bg-white"
                    >
                        <option value="all">All Years</option>
                        {availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                </div>
            </div>

            {/* Active Filters and Results count */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                        Showing {filteredJournals.length} of {journals.length} journals
                    </span>
                    
                    {/* Active filters display */}
                    {(statusFilter !== 'all' || periodFilter !== 'all' || yearFilter !== 'all' || searchTerm) && (
                        <button
                            onClick={resetFilters}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                            <MdRefresh size={14} />
                            Clear filters
                        </button>
                    )}
                </div>
                
                {/* Currency info */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaMoneyBillWave className="text-blue-500" />
                    <span>Currencies: {availableCurrencies.map(c => getCurrencyFlag(c)).join(' ')}</span>
                </div>
            </div>

            {/* Journals Display */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading journals...</p>
                </div>
            ) : filteredJournals.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <FaFileInvoice className="mx-auto text-5xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Journals Found</h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm || statusFilter !== 'all' || periodFilter !== 'all' || yearFilter !== 'all'
                            ? 'No journals match your filters'
                            : 'Get started by adding your first journal'}
                    </p>
                    {!searchTerm && statusFilter === 'all' && periodFilter === 'all' && yearFilter === 'all' && (
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <FaPlus size={16} />
                            Add Journal
                        </button>
                    )}
                </div>
            ) : viewMode === 'grid' ? (
                /* Grid View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJournals.map((journal) => (
                        <motion.div
                            key={journal._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 cursor-pointer"
                            onClick={() => handleViewJournal(journal)}
                        >
                            {/* Card Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-mono font-bold text-sm bg-blue-800/30 px-2 py-1 rounded">
                                            {journal.code}
                                        </span>
                                        <span className="text-white text-sm" title={journal.currency}>
                                            {getCurrencyFlag(journal.currency)} {journal.currency}
                                        </span>
                                        {getStatusBadge(journal)}
                                    </div>
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => handleEditJournal(journal, e)}
                                            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
                                            title="Edit"
                                        >
                                            <FaEdit size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteJournal(journal._id, e)}
                                            className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors text-white"
                                            title="Delete"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Card Body (same as before) */}
                            <div className="p-4">
                                {/* Journal Header Info */}
                                <div className="mb-3">
                                    <h3 className="text-lg font-bold text-gray-800">
                                        {journal.journalName}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {journal.journalNameArb}
                                    </p>
                                </div>

                                {/* Period Info */}
                                <div className="flex items-center justify-between text-sm bg-blue-50 p-2 rounded-lg mb-3">
                                    <span className="text-gray-600">Period:</span>
                                    <span className="font-medium text-blue-800">{journal.period}</span>
                                    <span className="text-gray-600">Year:</span>
                                    <span className="font-medium text-blue-800">{journal.fiscalYear}</span>
                                </div>

                                {/* Financial Summary */}
                                <div className="grid grid-cols-3 gap-2 mb-3">
                                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                                        <p className="text-xs text-blue-600">Debit</p>
                                        <p className="font-bold text-blue-800">{formatCurrency(journal.totalDebit, journal.currency)}</p>
                                    </div>
                                    <div className="text-center p-2 bg-orange-50 rounded-lg">
                                        <p className="text-xs text-orange-600">Credit</p>
                                        <p className="font-bold text-orange-800">{formatCurrency(journal.totalCredit, journal.currency)}</p>
                                    </div>
                                    <div className="text-center p-2 bg-purple-50 rounded-lg">
                                        <p className="text-xs text-purple-600">Net</p>
                                        <p className={`font-bold ${getBalanceColor(journal.netChange)}`}>
                                            {formatCurrency(journal.netChange, journal.currency)}
                                        </p>
                                    </div>
                                </div>

                                {/* Current Balance */}
                                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 mb-3">
                                    <span className="font-medium text-gray-700">Current Balance</span>
                                    <span className={`font-bold text-lg ${getBalanceColor(journal.currentBalance)}`}>
                                        {formatCurrency(journal.currentBalance, journal.currency)}
                                    </span>
                                </div>

                                {/* Footer with view details hint */}
                                <div className="mt-2 text-center text-xs text-blue-600 hover:text-blue-800">
                                    Click to view full details
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* List View - Default */
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Code / Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Period
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Currency
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Debit / Credit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Balance
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Entries
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredJournals.map((journal) => (
                                <tr 
                                    key={journal._id} 
                                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => handleViewJournal(journal)}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="font-medium text-gray-900">{journal.code}</div>
                                            <div className="text-sm text-gray-500">{journal.journalName}</div>
                                            <div className="text-xs text-gray-400">{journal.journalNameArb}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {getStatusBadge(journal)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm text-gray-900">{journal.period}</div>
                                            <div className="text-xs text-gray-500">{journal.fiscalYear}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                                            {getCurrencyFlag(journal.currency)} {journal.currency}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm text-green-600">D: {formatCurrency(journal.totalDebit, journal.currency)}</div>
                                            <div className="text-sm text-red-600">C: {formatCurrency(journal.totalCredit, journal.currency)}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`font-bold ${getBalanceColor(journal.currentBalance)}`}>
                                            {formatCurrency(journal.currentBalance, journal.currency)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={(e) => toggleEntries(journal._id, e)}
                                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                        >
                                            <span>{journal.entries?.length || 0}</span>
                                            {expandedJournals[journal._id] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
                                        </button>
                                        {expandedJournals[journal._id] && (
                                            <div className="absolute z-10 mt-2 p-2 bg-white shadow-lg rounded-lg border w-64">
                                                {journal.entries?.map((entry, idx) => (
                                                    <div key={idx} className="text-xs p-1 border-b last:border-b-0">
                                                        <div className="font-medium">{entry.accName}</div>
                                                        <div className="flex justify-between text-gray-600">
                                                            <span>D: {formatCurrency(entry.debit, journal.currency)}</span>
                                                            <span>C: {formatCurrency(entry.credit, journal.currency)}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={(e) => handleEditJournal(journal, e)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Edit"
                                            >
                                                <FaEdit size={16} />
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteJournal(journal._id, e)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Delete"
                                            >
                                                <FaTrash size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Journal Modal */}
            {isAddModalOpen && (
                <AddJournal
                    setIsAddModalOpen={setIsAddModalOpen}
                    fetchJournals={fetchJournals}
                    mode="add"
                    isRTL={false}
                />
            )}

            {/* Edit Journal Modal */}
            {isEditModalOpen && selectedJournal && (
                <AddJournal
                    setIsAddModalOpen={setIsEditModalOpen}
                    journalData={selectedJournal}
                    fetchJournals={fetchJournals}
                    mode="edit"
                    isRTL={false}
                />
            )}

            {/* Journal Details Modal */}
            {isDetailsModalOpen && selectedJournal && (
                <JournalDetails
                    journal={selectedJournal}
                    onClose={() => setIsDetailsModalOpen(false)}
                    onEdit={() => {
                        setIsDetailsModalOpen(false);
                        setIsEditModalOpen(true);
                    }}
                    onRefresh={fetchJournals}
                    isRTL={isRTL}
                />
            )}
        </div>
    );
};

export default Journals;

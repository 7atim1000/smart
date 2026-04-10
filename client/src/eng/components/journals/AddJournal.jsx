import { AuthContext } from '../../../../context/AuthContext';
import { useContext, useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { IoCloseCircle } from 'react-icons/io5';
import { LuSquareCheckBig } from "react-icons/lu";
import { FaPlus, FaEdit, FaSearch, FaTrash, FaBalanceScale, FaUser, FaMoneyBillWave, FaHashtag, FaFileInvoice } from "react-icons/fa";
import { MdAccountBalance } from "react-icons/md";

// Currency symbols mapping for display

const currencySymbols = [
    { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
    { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
    { code: 'SDG', name: 'Sudanese Pound', flag: '🇸🇩' },
    { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
    { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
    { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
    { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
    { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦' },
    { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
    { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴' }
];

const AddJournal = ({ setIsAddModalOpen, fetchJournals, mode = 'add', journalData = null, isRTL = false }) => {
    
    const { axios } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [loadingJournals, setLoadingJournals] = useState(false);
    const [loadingContacts, setLoadingContacts] = useState(false);
    const [loadingCodeGeneration, setLoadingCodeGeneration] = useState(false);
    
    // State for journal balance
    const [journalBalance, setJournalBalance] = useState(0);
    const [loadingBalance, setLoadingBalance] = useState(false);
    
    // Currency options - AED first
    const currencies = [
        { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
        { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
        { code: 'SDG', name: 'Sudanese Pound', flag: '🇸🇩' },
        { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
        { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
        { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
        { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
        { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦' },
        { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
        { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴' }
    ];
    
    // Status options
    const statusOptions = [
        { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-600' },
        { value: 'posted', label: 'Posted', color: 'bg-green-100 text-green-600' },
        { value: 'approved', label: 'Approved', color: 'bg-blue-100 text-blue-600' },
        { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-600' },
        { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-600' }
    ];
    
    // Journal names from JournalsName collection
    const [journalNames, setJournalNames] = useState([]);
    const [selectedJournalName, setSelectedJournalName] = useState(null);
    
    // Contacts list (customers/suppliers)
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    
    // Form state - now with reference field and AED as default currency
    const [formData, setFormData] = useState({
        journalName: journalData?.journalName || '',
        journalNameArb: journalData?.journalNameArb || '',
        code: journalData?.code || '',
        reference: journalData?.reference || '', // New reference field
        status: journalData?.status || 'draft',
        currency: journalData?.currency || 'AED',
        fiscalYear: journalData?.fiscalYear || new Date().getFullYear(),
        period: journalData?.period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
        journalsNameId: journalData?.journalsNameId || '',
        entries: journalData?.entries || []
    });

    // Account selection and entries
    const [accounts, setAccounts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [debitAmount, setDebitAmount] = useState('');
    const [creditAmount, setCreditAmount] = useState('');
    const [description, setDescription] = useState('');
    const [descriptionArb, setDescriptionArb] = useState('');
    const [reference, setReference] = useState('');
    
    // Entries list
    const [entries, setEntries] = useState([]);
    
    // Totals
    const [totalDebit, setTotalDebit] = useState(0);
    const [totalCredit, setTotalCredit] = useState(0);
    
    const [formErrors, setFormErrors] = useState({});

    // Pagination state for contacts
    const [contactPagination, setContactPagination] = useState({
        currentPage: 1,
        itemsPerPage: 50,
        total: 0,
        totalPages: 0
    });

    // Focus on first input
    const inputRef = useRef(null);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Fetch data on mount
    useEffect(() => {
        fetchJournalNames();
        fetchAllAccounts();
        fetchContacts();
    }, []);

    // Update totals when entries change
    useEffect(() => {
        const debit = entries.reduce((sum, entry) => sum + entry.debit, 0);
        const credit = entries.reduce((sum, entry) => sum + entry.credit, 0);
        setTotalDebit(debit);
        setTotalCredit(credit);
    }, [entries]);

    // Generate code when period changes and journal is selected
    useEffect(() => {
        if (mode === 'add' && selectedJournalName && formData.period) {
            generateJournalCode();
        }
    }, [formData.period, selectedJournalName]);

    // Format currency helper function
    const formatCurrency = (amount, currency) => {
        const symbol = currencySymbols[currency] || currency;
        return `${Number(amount || 0).toFixed(2)} ${symbol}`;
    };

    // Fetch journal balance when journal name is selected
    const fetchJournalBalance = async (journalId) => {
        setLoadingBalance(true);
        try {
            const response = await axios.get(`/v1/api/journalsName/${journalId}/balance`);
            if (response.data.success) {
                setJournalBalance(response.data.balance);
            }
        } catch (error) {
            console.error('Error fetching journal balance:', error);
        } finally {
            setLoadingBalance(false);
        }
    };

    // Generate journal code automatically
    const generateJournalCode = async () => {
        if (!selectedJournalName || !formData.period) return;
        
        setLoadingCodeGeneration(true);
        try {
            const periodCode = formData.period.replace('-', '');
            const journalPrefix = selectedJournalName.code || selectedJournalName.journalName.substring(0, 3).toUpperCase();
            
            const response = await axios.get('/v1/api/journals/next-code', {
                params: {
                    prefix: journalPrefix,
                    period: periodCode
                }
            }).catch(error => {
                if (error.response?.status === 404) {
                    console.log('Next-code endpoint not implemented yet, using client-side generation');
                    return null;
                }
                throw error;
            });
            
            if (response?.data?.success) {
                const nextNumber = response.data.nextNumber;
                const generatedCode = `${journalPrefix}-${periodCode}-${String(nextNumber).padStart(3, '0')}`;
                
                setFormData(prev => ({
                    ...prev,
                    code: generatedCode
                }));
            } else {
                useClientSideCodeGeneration(journalPrefix, periodCode);
            }
        } catch (error) {
            console.error('Error generating code:', error);
            const periodCode = formData.period.replace('-', '');
            const journalPrefix = selectedJournalName.code || selectedJournalName.journalName.substring(0, 3).toUpperCase();
            useClientSideCodeGeneration(journalPrefix, periodCode);
        } finally {
            setLoadingCodeGeneration(false);
        }
    };

    // Client-side code generation function
    const useClientSideCodeGeneration = (journalPrefix, periodCode) => {
        const timestamp = Date.now().toString().slice(-5);
        const sequence = timestamp.slice(-3);
        const generatedCode = `${journalPrefix}-${periodCode}-${sequence}`;
        
        setFormData(prev => ({
            ...prev,
            code: generatedCode
        }));
        
        console.log('Using client-side code generation');
    };

    // Fetch journal names from JournalsName collection
    const fetchJournalNames = async () => {
        setLoadingJournals(true);
        try {
            const response = await axios.get('/v1/api/journalsName');
            if (response.data.success) {
                setJournalNames(response.data.journals || []);
            }
        } catch (error) {
            console.error('Error fetching journal names:', error);
            toast.error('Failed to load journal names');
        } finally {
            setLoadingJournals(false);
        }
    };

    // Fetch all contacts (customers/suppliers)
    const fetchContacts = async (page = 1) => {
        setLoadingContacts(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: contactPagination.itemsPerPage,
                sort: 'name'
            });

            const response = await axios.get(`/v1/api/contacts?${params}`);
            
            if (response.data.success) {
                setContacts(response.data.contacts);
                setContactPagination({
                    currentPage: response.data.pagination.page,
                    itemsPerPage: response.data.pagination.limit,
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages
                });
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Failed to load contacts');
        } finally {
            setLoadingContacts(false);
        }
    };

    // Handle journal name selection
    const handleJournalNameSelect = (e) => {
        const journalId = e.target.value;
        const journal = journalNames.find(j => j._id === journalId);
        
        if (journal) {
            setSelectedJournalName(journal);
            setFormData(prev => ({
                ...prev,
                journalName: journal.journalName,
                journalNameArb: journal.journalNameArb,
                code: '',
                journalsNameId: journal._id
            }));
            
            fetchJournalBalance(journalId);
        }
    };

    // Handle currency selection
    const handleCurrencySelect = (e) => {
        setFormData(prev => ({
            ...prev,
            currency: e.target.value
        }));
    };

    // Handle status selection (for edit mode)
    const handleStatusSelect = (e) => {
        setFormData(prev => ({
            ...prev,
            status: e.target.value
        }));
    };

    // Handle reference change
    const handleReferenceChange = (e) => {
        setFormData(prev => ({
            ...prev,
            reference: e.target.value
        }));
    };

    // Handle period change
    const handlePeriodChange = (period) => {
        setFormData(prev => ({
            ...prev,
            period
        }));
    };

    // Fetch all accounts from chart of accounts
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

    // Debounced search for accounts
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
        
        // Reset amounts when new account selected
        setDebitAmount('');
        setCreditAmount('');
        setDescription('');
        setDescriptionArb('');
        setReference('');
        setSelectedContact(null);
    };

    // Handle contact selection
    const handleContactSelect = (e) => {
        const contactId = e.target.value;
        const contact = contacts.find(c => c._id === contactId);
        setSelectedContact(contact || null);
    };

    // Add entry to journal
    const handleAddEntry = () => {
        // Validate
        if (!selectedAccount) {
            toast.error('Please select an account');
            return;
        }

        const debit = parseFloat(debitAmount) || 0;
        const credit = parseFloat(creditAmount) || 0;

        if (debit === 0 && credit === 0) {
            toast.error('Please enter either debit or credit amount');
            return;
        }

        if (debit > 0 && credit > 0) {
            toast.error('Cannot have both debit and credit. Please enter only one');
            return;
        }

        // Description validation removed - now optional

        // Calculate running balance
        const lastEntry = entries[entries.length - 1];
        const lastBalance = lastEntry ? lastEntry.balance : 0;
        const newBalance = lastBalance + (debit - credit);

        const newEntry = {
            _id: Date.now().toString(),
            date: new Date(),
            reference: reference || `ENT-${entries.length + 1}`,
            description: description.trim() || '-', // Default value if empty
            descriptionArb: descriptionArb.trim() || '-', // Default value if empty
            debit,
            credit,
            balance: newBalance,
            currency: formData.currency,
            // Account information per entry
            accName: selectedAccount.name,
            accNameArb: selectedAccount.nameArb,
            accGroup: selectedAccount.group.name,
            accGroupArb: selectedAccount.group.nameArb,
            accClass: selectedAccount.class?.name || selectedAccount.group.class?.name || '',
            accClassArb: selectedAccount.class?.nameArb || selectedAccount.group.class?.nameArb || '',
            accLevel: selectedAccount.level.name,
            accLevelArb: selectedAccount.level.nameArb,
            accChart: selectedAccount.chart.name,
            accChartArb: selectedAccount.chart.nameArb,
            accType: selectedAccount.type || selectedAccount.accType || 'Unknown',
            // Partner information (optional)
            partnerId: selectedContact?._id || null,
            partnerName: selectedContact?.name || null,
            partnerNameArb: selectedContact?.nameArb || selectedContact?.name || null
        };

        setEntries([...entries, newEntry]);
        
        // Reset form
        setSelectedAccount(null);
        setSelectedContact(null);
        setDebitAmount('');
        setCreditAmount('');
        setDescription('');
        setDescriptionArb('');
        setReference('');
        setSearchTerm('');
    };

    // Remove entry from journal
    const handleRemoveEntry = (entryId) => {
        setEntries(entries.filter(entry => entry._id !== entryId));
    };

    // Validate form before submission
    const validateForm = () => {
        const errors = {};
        
        if (!selectedJournalName) {
            errors.journalName = 'Please select a journal name';
        }
        
        if (!formData.currency) {
            errors.currency = 'Please select a currency';
        }
        
        if (!formData.fiscalYear) {
            errors.fiscalYear = 'Fiscal year is required';
        }
        
        if (!formData.period?.trim()) {
            errors.period = 'Period is required';
        }
        
        // Validate reference field - required
        if (!formData.reference?.trim()) {
            errors.reference = 'Reference is required';
        }
        
        const periodRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
        if (formData.period && !periodRegex.test(formData.period)) {
            errors.period = 'Period must be in format YYYY-MM (e.g., 2024-01)';
        }
        
        if (entries.length === 0) {
            errors.entries = 'At least one entry is required';
        }
        
        if (totalDebit !== totalCredit) {
            errors.balance = `Total debit (${totalDebit.toFixed(2)}) must equal total credit (${totalCredit.toFixed(2)})`;
        }
        
        if (!formData.journalsNameId) {
            errors.journalsNameId = 'Journal name selection is required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle form submission
    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }
        
        setIsLoading(true);

        try {
            // Prepare journal data with all required fields including accType and reference
            const journalDataToSend = {
                journalName: formData.journalName,
                journalNameArb: formData.journalNameArb,
                code: formData.code,
                reference: formData.reference, // Reference field
                status: formData.status,
                currency: formData.currency,
                fiscalYear: formData.fiscalYear,
                period: formData.period,
                journalsNameId: formData.journalsNameId,
                openingBalance: 0,
                entries: entries.map(entry => ({
                    date: entry.date,
                    reference: entry.reference,
                    description: entry.description,
                    descriptionArb: entry.descriptionArb,
                    debit: entry.debit,
                    credit: entry.credit,
                    balance: entry.balance,
                    currency: entry.currency,
                    accName: entry.accName,
                    accNameArb: entry.accNameArb,
                    accGroup: entry.accGroup,
                    accGroupArb: entry.accGroupArb,
                    accClass: entry.accClass,
                    accClassArb: entry.accClassArb,
                    accLevel: entry.accLevel,
                    accLevelArb: entry.accLevelArb,
                    accChart: entry.accChart,
                    accChartArb: entry.accChartArb,
                    accType: entry.accType,
                    partnerId: entry.partnerId,
                    partnerName: entry.partnerName,
                    partnerNameArb: entry.partnerNameArb
                }))
            };

            console.log('Submitting journal data:', journalDataToSend); // For debugging

            let response;
            if (mode === 'edit') {
                response = await axios.put(`/v1/api/journals/${journalData._id}`, journalDataToSend);
            } else {
                response = await axios.post('/v1/api/journals', journalDataToSend);
            }

            if (response.data.success) {
                toast.success(mode === 'edit' ? 'Journal updated successfully!' : 'Journal added successfully!');
                setIsAddModalOpen(false);
                if (fetchJournals) fetchJournals();
            }
        } catch (error) {
            console.error('Error:', error);
            
            // Log the full error response for debugging
            if (error.response) {
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
            }
            
            toast.error(error.response?.data?.message || `Failed to ${mode} journal`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => setIsAddModalOpen(false);

    const months = [
        '01', '02', '03', '04', '05', '06',
        '07', '08', '09', '10', '11', '12'
    ];

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
            <div 
                className="fixed inset-0 bg-black/50 bg-opacity-50" 
                onClick={handleClose}
            />
            
            <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-white">
                                {mode === 'edit' ? 'Edit Journal' : 'Add New Journal'}
                            </h2>
                            <button onClick={handleClose} className="text-white hover:text-blue-100">
                                <IoCloseCircle size={28} />
                            </button>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={onSubmitHandler} className="p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
                        {/* Journal Header Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Journal Information</h3>
                            
                            {/* Status and Code Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    {mode === 'edit' ? (
                                        <select
                                            value={formData.status}
                                            onChange={handleStatusSelect}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            {statusOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-2 bg-yellow-100 text-yellow-600 rounded-lg text-sm font-medium">
                                                Draft (Default)
                                            </span>
                                            <input
                                                type="hidden"
                                                value="draft"
                                                name="status"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Journal Code
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.code}
                                            readOnly
                                            className="w-full pl-10 pr-4 py-2 border bg-gray-50 rounded-lg text-gray-600 font-mono"
                                            placeholder="Auto-generated"
                                        />
                                        <FaHashtag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        {loadingCodeGeneration && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Automatically generated based on period and journal type
                                    </p>
                                </div>
                            </div>

                            {/* Reference Field - Required */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Reference <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={formData.reference}
                                            onChange={handleReferenceChange}
                                            className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                                formErrors.reference ? 'border-red-500' : ''
                                            }`}
                                            placeholder="e.g., INV-2024-001"
                                        />
                                        <FaFileInvoice className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                    {formErrors.reference ? (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.reference}</p>
                                    ) : (
                                        <p className="text-xs text-gray-500 mt-1">
                                            External reference number (invoice, receipt, etc.)
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Journal Name <span className="text-red-500">*</span>
                                    </label>
                                    {loadingJournals ? (
                                        <div className="text-center py-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                                        </div>
                                    ) : (
                                        <select
                                            ref={inputRef}
                                            value={selectedJournalName?._id || ''}
                                            onChange={handleJournalNameSelect}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Journal Name</option>
                                            {journalNames.map(journal => (
                                                <option key={journal._id} value={journal._id}>
                                                    {journal.journalName} - {journal.code}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {formErrors.journalName && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.journalName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Arabic Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.journalNameArb}
                                        readOnly
                                        className="w-full px-3 py-2 border bg-gray-50 rounded-lg text-gray-600"
                                        placeholder="Auto-filled from selection"
                                    />
                                </div>
                            </div>

                            {/* Journal Balance Display */}
                            {selectedJournalName && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-blue-600 font-medium">Current Journal Balance:</span>
                                        {loadingBalance ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                        ) : (
                                            <span className="font-bold text-blue-800">
                                                {formatCurrency(journalBalance, formData.currency)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-blue-500 mt-1">
                                        This balance will be updated when the journal is posted
                                    </p>
                                </div>
                            )}

                            {/* Currency Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Currency <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={formData.currency}
                                            onChange={handleCurrencySelect}
                                            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
                                        >
                                            {currencies.map(currency => (
                                                <option key={currency.code} value={currency.code}>
                                                    {currency.flag} {currency.code} - {currency.name}
                                                </option>
                                            ))}
                                        </select>
                                        <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    </div>
                                    {formErrors.currency && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.currency}</p>
                                    )}
                                </div>

                                <div className="flex items-end">
                                    <div className="w-full p-3 bg-blue-50 rounded-lg border border-blue-200">
                                        <p className="text-xs text-blue-600 mb-1">Selected Currency</p>
                                        <p className="text-lg font-bold text-blue-800">
                                            {currencies.find(c => c.code === formData.currency)?.flag} {formData.currency} - {currencies.find(c => c.code === formData.currency)?.name}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Period Information */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fiscal Year <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.fiscalYear}
                                        onChange={(e) => {
                                            const newYear = parseInt(e.target.value);
                                            setFormData({...formData, fiscalYear: newYear});
                                            const currentPeriod = formData.period;
                                            if (currentPeriod && currentPeriod.includes('-')) {
                                                const month = currentPeriod.split('-')[1];
                                                handlePeriodChange(`${newYear}-${month}`);
                                            }
                                        }}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                    {formErrors.fiscalYear && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.fiscalYear}</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Period <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={formData.period}
                                            onChange={(e) => handlePeriodChange(e.target.value)}
                                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                                formErrors.period ? 'border-red-500' : ''
                                            }`}
                                            placeholder="YYYY-MM"
                                        />
                                        <select
                                            value={formData.period?.split('-')[1] || ''}
                                            onChange={(e) => {
                                                const year = formData.fiscalYear;
                                                handlePeriodChange(`${year}-${e.target.value}`);
                                            }}
                                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Month</option>
                                            {months.map(month => (
                                                <option key={month} value={month}>{month}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {formErrors.period && (
                                        <p className="text-red-500 text-xs mt-1">{formErrors.period}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Journal Entries Section */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-700">Journal Entries</h3>
                            
                            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-center gap-2">
                                <FaMoneyBillWave className="text-blue-600" />
                                <p className="text-sm text-blue-700">
                                    All entries will be in <span className="font-bold">{formData.currency}</span> currency
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="relative lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Search Account
                                    </label>
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search accounts..."
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <FaSearch className="absolute left-3 top-9 transform -translate-y-1/2 text-gray-400" />
                                </div>

                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Account <span className="text-red-500">*</span>
                                    </label>
                                    {loadingAccounts ? (
                                        <div className="text-center py-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedAccount?._id || ''}
                                            onChange={(e) => {
                                                const account = accounts.find(a => a._id === e.target.value);
                                                if (account) handleAccountSelect(account);
                                            }}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                        >
                                            <option value="">Select Account</option>
                                            {accounts.map(account => (
                                                <option key={account._id} value={account._id}>
                                                    {account.code} - {account.name}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>

                                <div className="lg:col-span-1">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Contact (Optional)
                                    </label>
                                    {loadingContacts ? (
                                        <div className="text-center py-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                                        </div>
                                    ) : (
                                        <select
                                            value={selectedContact?._id || ''}
                                            onChange={handleContactSelect}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                            disabled={!selectedAccount}
                                        >
                                            <option value="">No Contact</option>
                                            {contacts.map(contact => (
                                                <option key={contact._id} value={contact._id}>
                                                    {contact.name} 
                                                    {contact.isReceivable && contact.isPayable ? ' (Customer/Supplier)' : 
                                                     contact.isReceivable ? ' (Customer)' : 
                                                     contact.isPayable ? ' (Supplier)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                    {contacts.length === 0 && !loadingContacts && (
                                        <p className="text-xs text-amber-600 mt-1">
                                            No contacts found. <button type="button" onClick={() => fetchContacts()} className="text-blue-600 underline">Refresh</button>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {selectedAccount && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                    <h4 className="font-medium text-blue-800 mb-3">Entry Details</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Debit Amount ({formData.currency})
                                            </label>
                                            <input
                                                type="number"
                                                value={debitAmount}
                                                onChange={(e) => {
                                                    setDebitAmount(e.target.value);
                                                    setCreditAmount('0');
                                                }}
                                                step="0.01"
                                                min="0"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Credit Amount ({formData.currency})
                                            </label>
                                            <input
                                                type="number"
                                                value={creditAmount}
                                                onChange={(e) => {
                                                    setCreditAmount(e.target.value);
                                                    setDebitAmount('0');
                                                }}
                                                step="0.01"
                                                min="0"
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="0.00"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Description <span className="text-gray-400">(Optional)</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                placeholder="Description"
                                            />
                                        </div>

                                        {/* Hidden Arabic Description field */}
                                        <input type="hidden" value={descriptionArb} onChange={(e) => setDescriptionArb(e.target.value)} />

                                        <div className="md:col-span-2 flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleAddEntry}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                                            >
                                                <FaPlus size={14} />
                                                Add Entry
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Entries Table */}
                        {entries.length > 0 && (
                            <div className="space-y-4">
                                <h4 className="font-medium text-gray-700">Entries List</h4>
                                <div className="border rounded-lg overflow-hidden">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Account</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Contact</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Debit</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Credit</th>
                                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Balance</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Action</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {entries.map((entry) => (
                                                <tr key={entry._id}>
                                                    <td className="px-4 py-2 text-sm">
                                                        <div className="font-medium">{entry.accName}</div>
                                                        <div className="text-xs text-gray-500">{entry.accNameArb}</div>
                                                        <div className="text-xs text-gray-400">{entry.accGroup}</div>
                                                        <div className="text-xs text-emerald-600">{entry.accType}</div>
                                                    </td>
                                                    <td className="px-4 py-2 text-sm">
                                                        {entry.partnerName ? (
                                                            <>
                                                                <div className="font-medium">{entry.partnerName}</div>
                                                                <div className="text-xs text-gray-500">{entry.partnerNameArb}</div>
                                                            </>
                                                        ) : (
                                                            <span className="text-gray-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2 text-sm">
                                                        <div>{entry.description}</div>
                                                        <div className="text-xs text-gray-500">{entry.descriptionArb}</div>
                                                        <div className="text-xs text-gray-400">{entry.reference}</div>
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-sm text-green-600">
                                                        {entry.debit > 0 ? entry.debit.toFixed(2) : '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-sm text-red-600">
                                                        {entry.credit > 0 ? entry.credit.toFixed(2) : '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-right text-sm font-medium">
                                                        {entry.balance.toFixed(2)}
                                                    </td>
                                                    <td className="px-4 py-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveEntry(entry._id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Remove Entry"
                                                        >
                                                            <FaTrash size={14} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-gray-50 font-medium">
                                            <tr>
                                                <td colSpan="3" className="px-4 py-2 text-sm">
                                                    Totals ({formData.currency})
                                                </td>
                                                <td className="px-4 py-2 text-right text-sm text-green-600">
                                                    {totalDebit.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-2 text-right text-sm text-red-600">
                                                    {totalCredit.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-2 text-right text-sm">
                                                    {(totalDebit - totalCredit).toFixed(2)}
                                                </td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                                
                                {totalDebit !== totalCredit && (
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-700 flex items-center gap-2">
                                            <FaBalanceScale className="text-yellow-600" />
                                            Total debit ({totalDebit.toFixed(2)} {formData.currency}) must equal total credit ({totalCredit.toFixed(2)} {formData.currency})
                                        </p>
                                    </div>
                                )}
                                {formErrors.entries && (
                                    <p className="text-red-500 text-sm">{formErrors.entries}</p>
                                )}
                            </div>
                        )}

                        <input type="hidden" name="journalsNameId" value={formData.journalsNameId} />

                        {/* Submit Button */}
                        <div className="flex gap-3 justify-end pt-4 border-t">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || totalDebit !== totalCredit || entries.length === 0 || !selectedJournalName}
                                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        <span>{mode === 'edit' ? 'Updating...' : 'Creating...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {mode === 'edit' ? <FaEdit size={16} /> : <FaPlus size={16} />}
                                        <span>{mode === 'edit' ? 'Update Journal' : `Add Journal in ${formData.currency}`}</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {mode === 'add' && (
                            <div className="text-xs text-gray-500 text-center">
                                <span className="inline-flex items-center gap-1">
                                    <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                    New journals are created with "Draft" status by default
                                </span>
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AddJournal;


// import { AuthContext } from '../../../../context/AuthContext';
// import { useContext, useState, useRef, useEffect } from 'react';
// import { toast } from 'react-hot-toast';
// import { motion } from 'framer-motion';
// import { IoCloseCircle } from 'react-icons/io5';
// import { LuSquareCheckBig } from "react-icons/lu";
// import { FaPlus, FaEdit, FaSearch, FaTrash, FaBalanceScale, FaUser, FaMoneyBillWave, FaHashtag, FaFileInvoice } from "react-icons/fa";
// import { MdAccountBalance } from "react-icons/md";

// // Currency symbols mapping for display

// const currencySymbols = [
//     { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
//     { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
//     { code: 'SDG', name: 'Sudanese Pound', flag: '🇸🇩' },
//     { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
//     { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
//     { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
//     { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
//     { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦' },
//     { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
//     { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴' }
// ];

// // Currency flags mapping
// const currencyFlags = {
//     'AED': '🇦🇪',
//     'SD': '🇸🇩',
//     'USD': '🇺🇸',
//     'EUR': '🇪🇺',
//     'GBP': '🇬🇧',
//     'SAR': '🇸🇦',
//     'QAR': '🇶🇦',
//     'KWD': '🇰🇼',
//     'JOD': '🇯🇴',
//     'EGP': '🇪🇬'
// };

// const AddJournal = ({ setIsAddModalOpen, fetchJournals, mode = 'add', journalData = null, isRTL = false }) => {
    
//     const { axios } = useContext(AuthContext);
//     const [isLoading, setIsLoading] = useState(false);
//     const [loadingAccounts, setLoadingAccounts] = useState(false);
//     const [loadingJournals, setLoadingJournals] = useState(false);
//     const [loadingPartners, setLoadingPartners] = useState(false);
//     const [loadingCodeGeneration, setLoadingCodeGeneration] = useState(false);
    
//     // State for journal balance
//     const [journalBalance, setJournalBalance] = useState(0);
//     const [loadingBalance, setLoadingBalance] = useState(false);
    
//     // Currency options - AED first
//     const currencies = [
//         { code: 'AED', name: 'UAE Dirham', flag: '🇦🇪' },
//         { code: 'USD', name: 'US Dollar', flag: '🇺🇸' },
//         { code: 'SDG', name: 'Sudanese Pound', flag: '🇸🇩' },
//         { code: 'EGP', name: 'Egyptian Pound', flag: '🇪🇬' },
//         { code: 'EUR', name: 'Euro', flag: '🇪🇺' },
//         { code: 'GBP', name: 'British Pound', flag: '🇬🇧' },
//         { code: 'SAR', name: 'Saudi Riyal', flag: '🇸🇦' },
//         { code: 'QAR', name: 'Qatari Riyal', flag: '🇶🇦' },
//         { code: 'KWD', name: 'Kuwaiti Dinar', flag: '🇰🇼' },
//         { code: 'JOD', name: 'Jordanian Dinar', flag: '🇯🇴' }
//     ];
    
//     // Status options
//     const statusOptions = [
//         { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-600' },
//         { value: 'posted', label: 'Posted', color: 'bg-green-100 text-green-600' },
//         { value: 'approved', label: 'Approved', color: 'bg-blue-100 text-blue-600' },
//         { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-600' },
//         { value: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-600' }
//     ];
    
//     // Journal names from JournalsName collection
//     const [journalNames, setJournalNames] = useState([]);
//     const [selectedJournalName, setSelectedJournalName] = useState(null);
    
//     // Partners list
//     const [partners, setPartners] = useState([]);
//     const [selectedPartner, setSelectedPartner] = useState(null);
    
//     // Form state - now with reference field and AED as default currency
//     const [formData, setFormData] = useState({
//         journalName: journalData?.journalName || '',
//         journalNameArb: journalData?.journalNameArb || '',
//         code: journalData?.code || '',
//         reference: journalData?.reference || '', // New reference field
//         status: journalData?.status || 'draft',
//         currency: journalData?.currency || 'AED',
//         fiscalYear: journalData?.fiscalYear || new Date().getFullYear(),
//         period: journalData?.period || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
//         journalsNameId: journalData?.journalsNameId || '',
//         entries: journalData?.entries || []
//     });

//     // Account selection and entries
//     const [accounts, setAccounts] = useState([]);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [selectedAccount, setSelectedAccount] = useState(null);
//     const [debitAmount, setDebitAmount] = useState('');
//     const [creditAmount, setCreditAmount] = useState('');
//     const [description, setDescription] = useState('');
//     const [descriptionArb, setDescriptionArb] = useState('');
//     const [reference, setReference] = useState('');
    
//     // Entries list
//     const [entries, setEntries] = useState([]);
    
//     // Totals
//     const [totalDebit, setTotalDebit] = useState(0);
//     const [totalCredit, setTotalCredit] = useState(0);
    
//     const [formErrors, setFormErrors] = useState({});

//     // Focus on first input
//     const inputRef = useRef(null);
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             if (inputRef.current) inputRef.current.focus();
//         }, 100);
//         return () => clearTimeout(timer);
//     }, []);

//     // Fetch data on mount
//     useEffect(() => {
//         fetchJournalNames();
//         fetchAllAccounts();
//         fetchPartners();
//     }, []);

//     // Update totals when entries change
//     useEffect(() => {
//         const debit = entries.reduce((sum, entry) => sum + entry.debit, 0);
//         const credit = entries.reduce((sum, entry) => sum + entry.credit, 0);
//         setTotalDebit(debit);
//         setTotalCredit(credit);
//     }, [entries]);

//     // Generate code when period changes and journal is selected
//     useEffect(() => {
//         if (mode === 'add' && selectedJournalName && formData.period) {
//             generateJournalCode();
//         }
//     }, [formData.period, selectedJournalName]);

//     // Format currency helper function
//     const formatCurrency = (amount, currency) => {
//         const symbol = currencySymbols[currency] || currency;
//         return `${Number(amount || 0).toFixed(2)} ${symbol}`;
//     };

//     // Fetch journal balance when journal name is selected
//     const fetchJournalBalance = async (journalId) => {
//         setLoadingBalance(true);
//         try {
//             const response = await axios.get(`/v1/api/journalsName/${journalId}/balance`);
//             if (response.data.success) {
//                 setJournalBalance(response.data.balance);
//             }
//         } catch (error) {
//             console.error('Error fetching journal balance:', error);
//         } finally {
//             setLoadingBalance(false);
//         }
//     };

//     // Generate journal code automatically
//     const generateJournalCode = async () => {
//         if (!selectedJournalName || !formData.period) return;
        
//         setLoadingCodeGeneration(true);
//         try {
//             const periodCode = formData.period.replace('-', '');
//             const journalPrefix = selectedJournalName.code || selectedJournalName.journalName.substring(0, 3).toUpperCase();
            
//             const response = await axios.get('/v1/api/journals/next-code', {
//                 params: {
//                     prefix: journalPrefix,
//                     period: periodCode
//                 }
//             }).catch(error => {
//                 if (error.response?.status === 404) {
//                     console.log('Next-code endpoint not implemented yet, using client-side generation');
//                     return null;
//                 }
//                 throw error;
//             });
            
//             if (response?.data?.success) {
//                 const nextNumber = response.data.nextNumber;
//                 const generatedCode = `${journalPrefix}-${periodCode}-${String(nextNumber).padStart(3, '0')}`;
                
//                 setFormData(prev => ({
//                     ...prev,
//                     code: generatedCode
//                 }));
//             } else {
//                 useClientSideCodeGeneration(journalPrefix, periodCode);
//             }
//         } catch (error) {
//             console.error('Error generating code:', error);
//             const periodCode = formData.period.replace('-', '');
//             const journalPrefix = selectedJournalName.code || selectedJournalName.journalName.substring(0, 3).toUpperCase();
//             useClientSideCodeGeneration(journalPrefix, periodCode);
//         } finally {
//             setLoadingCodeGeneration(false);
//         }
//     };

//     // Client-side code generation function
//     const useClientSideCodeGeneration = (journalPrefix, periodCode) => {
//         const timestamp = Date.now().toString().slice(-5);
//         const sequence = timestamp.slice(-3);
//         const generatedCode = `${journalPrefix}-${periodCode}-${sequence}`;
        
//         setFormData(prev => ({
//             ...prev,
//             code: generatedCode
//         }));
        
//         console.log('Using client-side code generation');
//     };

//     // Fetch journal names from JournalsName collection
//     const fetchJournalNames = async () => {
//         setLoadingJournals(true);
//         try {
//             const response = await axios.get('/v1/api/journalsName');
//             if (response.data.success) {
//                 setJournalNames(response.data.journals || []);
//             }
//         } catch (error) {
//             console.error('Error fetching journal names:', error);
//             toast.error('Failed to load journal names');
//         } finally {
//             setLoadingJournals(false);
//         }
//     };

//     // Fetch partners (customers/suppliers)
//     const fetchPartners = async () => {
//         setLoadingPartners(true);
//         try {
//             const response = await axios.get('/v1/api/customers'); 
//             if (response.data.success) {
//                 setPartners(response.data.customers || []);
//             }
//         } catch (error) {
//             console.error('Error fetching partners:', error);
//         } finally {
//             setLoadingPartners(false);
//         }
//     };

//     // Handle journal name selection
//     const handleJournalNameSelect = (e) => {
//         const journalId = e.target.value;
//         const journal = journalNames.find(j => j._id === journalId);
        
//         if (journal) {
//             setSelectedJournalName(journal);
//             setFormData(prev => ({
//                 ...prev,
//                 journalName: journal.journalName,
//                 journalNameArb: journal.journalNameArb,
//                 code: '',
//                 journalsNameId: journal._id
//             }));
            
//             fetchJournalBalance(journalId);
//         }
//     };

//     // Handle currency selection
//     const handleCurrencySelect = (e) => {
//         setFormData(prev => ({
//             ...prev,
//             currency: e.target.value
//         }));
//     };

//     // Handle status selection (for edit mode)
//     const handleStatusSelect = (e) => {
//         setFormData(prev => ({
//             ...prev,
//             status: e.target.value
//         }));
//     };

//     // Handle reference change
//     const handleReferenceChange = (e) => {
//         setFormData(prev => ({
//             ...prev,
//             reference: e.target.value
//         }));
//     };

//     // Handle period change
//     const handlePeriodChange = (period) => {
//         setFormData(prev => ({
//             ...prev,
//             period
//         }));
//     };

//     // Fetch all accounts from chart of accounts
//     const fetchAllAccounts = async (search = '') => {
//         setLoadingAccounts(true);
//         try {
//             const url = search 
//                 ? `/v1/api/chart/accounts/all?search=${encodeURIComponent(search)}`
//                 : '/v1/api/chart/accounts/all';
            
//             const response = await axios.get(url);
//             if (response.data.success) {
//                 setAccounts(response.data.accounts || []);
//             }
//         } catch (error) {
//             console.error('Error fetching accounts:', error);
//             toast.error('Failed to load accounts');
//         } finally {
//             setLoadingAccounts(false);
//         }
//     };

//     // Debounced search for accounts
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             if (searchTerm) {
//                 fetchAllAccounts(searchTerm);
//             } else {
//                 fetchAllAccounts();
//             }
//         }, 500);
//         return () => clearTimeout(timer);
//     }, [searchTerm]);

//     // Handle account selection
//     const handleAccountSelect = (account) => {
//         setSelectedAccount(account);
        
//         // Reset amounts when new account selected
//         setDebitAmount('');
//         setCreditAmount('');
//         setDescription('');
//         setDescriptionArb('');
//         setReference('');
//         setSelectedPartner(null);
//     };

//     // Add entry to journal
//     const handleAddEntry = () => {
//         // Validate
//         if (!selectedAccount) {
//             toast.error('Please select an account');
//             return;
//         }

//         const debit = parseFloat(debitAmount) || 0;
//         const credit = parseFloat(creditAmount) || 0;

//         if (debit === 0 && credit === 0) {
//             toast.error('Please enter either debit or credit amount');
//             return;
//         }

//         if (debit > 0 && credit > 0) {
//             toast.error('Cannot have both debit and credit. Please enter only one');
//             return;
//         }

//         // if (!description.trim()) {
//         //     toast.error('Please enter a description');
//         //     return;
//         // }

//         // Calculate running balance
//         const lastEntry = entries[entries.length - 1];
//         const lastBalance = lastEntry ? lastEntry.balance : 0;
//         const newBalance = lastBalance + (debit - credit);

        

//         const newEntry = {
//             _id: Date.now().toString(),
//             date: new Date(),
//             reference: reference || `ENT-${entries.length + 1}`,
//             description: description.trim(),
//             descriptionArb: descriptionArb.trim(),
//             debit,
//             credit,
//             balance: newBalance,
//             currency: formData.currency,
//             // Account information per entry
//             accName: selectedAccount.name,
//             accNameArb: selectedAccount.nameArb,
//             accGroup: selectedAccount.group.name,
//             accGroupArb: selectedAccount.group.nameArb,
//             accClass: selectedAccount.class?.name || selectedAccount.group.class?.name || '',
//             accClassArb: selectedAccount.class?.nameArb || selectedAccount.group.class?.nameArb || '',
//             accLevel: selectedAccount.level.name,
//             accLevelArb: selectedAccount.level.nameArb,
//             accChart: selectedAccount.chart.name,
//             accChartArb: selectedAccount.chart.nameArb,
//             accType: selectedAccount.type || selectedAccount.accType || 'Unknown', // New field added
//             // Partner information (optional)
//             partnerId: selectedPartner?._id || null,
//             partnerName: selectedPartner?.name || null,
//             partnerNameArb: selectedPartner?.nameArb || null
//         };

//         setEntries([...entries, newEntry]);
        
//         // Reset form
//         setSelectedAccount(null);
//         setSelectedPartner(null);
//         setDebitAmount('');
//         setCreditAmount('');
//         setDescription('');
//         setDescriptionArb('');
//         setReference('');
//         setSearchTerm('');
//     };

//     // Remove entry from journal
//     const handleRemoveEntry = (entryId) => {
//         setEntries(entries.filter(entry => entry._id !== entryId));
//     };

//     // Validate form before submission
//     const validateForm = () => {
//         const errors = {};
        
//         if (!selectedJournalName) {
//             errors.journalName = 'Please select a journal name';
//         }
        
//         if (!formData.reference) {
//             errors.reference = 'Please enter reference';
//         }
        
//         if (!formData.currency) {
//             errors.currency = 'Please select a currency';
//         }
        
//         if (!formData.fiscalYear) {
//             errors.fiscalYear = 'Fiscal year is required';
//         }
        
//         if (!formData.period?.trim()) {
//             errors.period = 'Period is required';
//         }
        
//         const periodRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
//         if (formData.period && !periodRegex.test(formData.period)) {
//             errors.period = 'Period must be in format YYYY-MM (e.g., 2024-01)';
//         }
        
//         if (entries.length === 0) {
//             errors.entries = 'At least one entry is required';
//         }
        
//         if (totalDebit !== totalCredit) {
//             errors.balance = `Total debit (${totalDebit.toFixed(2)}) must equal total credit (${totalCredit.toFixed(2)})`;
//         }
        
//         if (!formData.journalsNameId) {
//             errors.journalsNameId = 'Journal name selection is required';
//         }
        
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     };

//     // Handle form submission
//     const onSubmitHandler = async (e) => {
//         e.preventDefault();
        
//         if (!validateForm()) {
//             toast.error('Please fix the errors before submitting');
//             return;
//         }
        
//         setIsLoading(true);

//         try {
//             // Prepare journal data with all required fields including accType and reference
//             const journalDataToSend = {
//                 journalName: formData.journalName,
//                 journalNameArb: formData.journalNameArb,
//                 code: formData.code,
//                 reference: formData.reference, // New reference field
//                 status: formData.status,
//                 currency: formData.currency,
//                 fiscalYear: formData.fiscalYear,
//                 period: formData.period,
//                 journalsNameId: formData.journalsNameId,
//                 openingBalance: 0,
//                 entries: entries.map(entry => ({
//                     date: entry.date,
//                     reference: entry.reference,
//                     description: entry.description,
//                     descriptionArb: entry.descriptionArb,
//                     debit: entry.debit,
//                     credit: entry.credit,
//                     balance: entry.balance,
//                     currency: entry.currency,
//                     accName: entry.accName,
//                     accNameArb: entry.accNameArb,
//                     accGroup: entry.accGroup,
//                     accGroupArb: entry.accGroupArb,
//                     accClass: entry.accClass,
//                     accClassArb: entry.accClassArb,
//                     accLevel: entry.accLevel,
//                     accLevelArb: entry.accLevelArb,
//                     accChart: entry.accChart,
//                     accChartArb: entry.accChartArb,
//                     accType: entry.accType, // New field added
//                     partnerId: entry.partnerId,
//                     partnerName: entry.partnerName,
//                     partnerNameArb: entry.partnerNameArb
//                 }))
//             };

//             console.log('Submitting journal data:', journalDataToSend); // For debugging

//             let response;
//             if (mode === 'edit') {
//                 response = await axios.put(`/v1/api/journals/${journalData._id}`, journalDataToSend);
//             } else {
//                 response = await axios.post('/v1/api/journals', journalDataToSend);
//             }

//             if (response.data.success) {
//                 toast.success(mode === 'edit' ? 'Journal updated successfully!' : 'Journal added successfully!');
//                 setIsAddModalOpen(false);
//                 if (fetchJournals) fetchJournals();
//             }
//         } catch (error) {
//             console.error('Error:', error);
            
//             // Log the full error response for debugging
//             if (error.response) {
//                 console.error('Error response data:', error.response.data);
//                 console.error('Error response status:', error.response.status);
//             }
            
//             toast.error(error.response?.data?.message || `Failed to ${mode} journal`);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleClose = () => setIsAddModalOpen(false);

//     const months = [
//         '01', '02', '03', '04', '05', '06',
//         '07', '08', '09', '10', '11', '12'
//     ];

//     const currentYear = new Date().getFullYear();
//     const years = Array.from({ length: 5 }, (_, i) => currentYear + i);

//     return (
//         <div className="fixed inset-0 z-50 overflow-y-auto" dir={isRTL ? 'rtl' : 'ltr'}>
//             <div 
//                 className="fixed inset-0 bg-black bg-opacity-50" 
//                 onClick={handleClose}
//             />
            
//             <div className="flex items-center justify-center min-h-screen p-4">
//                 <motion.div
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     exit={{ opacity: 0, scale: 0.9 }}
//                     className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
//                 >
//                     {/* Header */}
//                     <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
//                         <div className="flex items-center justify-between">
//                             <h2 className="text-xl font-semibold text-white">
//                                 {mode === 'edit' ? 'Edit Journal' : 'Add New Journal'}
//                             </h2>
//                             <button onClick={handleClose} className="text-white hover:text-blue-100">
//                                 <IoCloseCircle size={28} />
//                             </button>
//                         </div>
//                     </div>

//                     {/* Form */}
//                     <form onSubmit={onSubmitHandler} className="p-6 space-y-6 max-h-[calc(90vh-80px)] overflow-y-auto">
//                         {/* Journal Header Section */}
//                         <div className="space-y-4">
//                             <h3 className="text-lg font-semibold text-gray-700">Journal Information</h3>
                            
//                             {/* Status and Code Row */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Status
//                                     </label>
//                                     {mode === 'edit' ? (
//                                         <select
//                                             value={formData.status}
//                                             onChange={handleStatusSelect}
//                                             className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                         >
//                                             {statusOptions.map(option => (
//                                                 <option key={option.value} value={option.value}>
//                                                     {option.label}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     ) : (
//                                         <div className="flex items-center gap-2">
//                                             <span className="px-3 py-2 bg-yellow-100 text-yellow-600 rounded-lg text-sm font-medium">
//                                                 Draft (Default)
//                                             </span>
//                                             <input
//                                                 type="hidden"
//                                                 value="draft"
//                                                 name="status"
//                                             />
//                                         </div>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Journal Code
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type="text"
//                                             value={formData.code}
//                                             readOnly
//                                             className="w-full pl-10 pr-4 py-2 border bg-gray-50 rounded-lg text-gray-600 font-mono"
//                                             placeholder="Auto-generated"
//                                         />
//                                         <FaHashtag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                                         {loadingCodeGeneration && (
//                                             <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                                                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
//                                             </div>
//                                         )}
//                                     </div>
//                                     <p className="text-xs text-gray-500 mt-1">
//                                         Automatically generated based on period and journal type
//                                     </p>
//                                 </div>
//                             </div>

//                             {/* Reference Field - New */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Reference <span className="text-gray-400">(Optional)</span>
//                                     </label>
//                                     <div className="relative">
//                                         <input
//                                             type="text"
//                                             value={formData.reference}
//                                             onChange={handleReferenceChange}
//                                             className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                             placeholder="e.g., INV-2024-001"
//                                         />
//                                         <FaFileInvoice className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                                     </div>
//                                     <p className="text-xs text-gray-500 mt-1">
//                                         External reference number (invoice, receipt, etc.)
//                                     </p>
//                                 </div>
//                             </div>

//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Journal Name <span className="text-red-500">*</span>
//                                     </label>
//                                     {loadingJournals ? (
//                                         <div className="text-center py-2">
//                                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
//                                         </div>
//                                     ) : (
//                                         <select
//                                             ref={inputRef}
//                                             value={selectedJournalName?._id || ''}
//                                             onChange={handleJournalNameSelect}
//                                             className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                         >
//                                             <option value="">Select Journal Name</option>
//                                             {journalNames.map(journal => (
//                                                 <option key={journal._id} value={journal._id}>
//                                                     {journal.journalName} - {journal.code}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     )}
//                                     {formErrors.journalName && (
//                                         <p className="text-red-500 text-xs mt-1">{formErrors.journalName}</p>
//                                     )}
//                                 </div>

//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Arabic Name
//                                     </label>
//                                     <input
//                                         type="text"
//                                         value={formData.journalNameArb}
//                                         readOnly
//                                         className="w-full px-3 py-2 border bg-gray-50 rounded-lg text-gray-600"
//                                         placeholder="Auto-filled from selection"
//                                     />
//                                 </div>
//                             </div>

//                             {/* Journal Balance Display */}
//                             {selectedJournalName && (
//                                 <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                                     <div className="flex justify-between items-center">
//                                         <span className="text-sm text-blue-600 font-medium">Current Journal Balance:</span>
//                                         {loadingBalance ? (
//                                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
//                                         ) : (
//                                             <span className="font-bold text-blue-800">
//                                                 {formatCurrency(journalBalance, formData.currency)}
//                                             </span>
//                                         )}
//                                     </div>
//                                     <p className="text-xs text-blue-500 mt-1">
//                                         This balance will be updated when the journal is posted
//                                     </p>
//                                 </div>
//                             )}

//                             {/* Currency Selection */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Currency <span className="text-red-500">*</span>
//                                     </label>
//                                     <div className="relative">
//                                         <select
//                                             value={formData.currency}
//                                             onChange={handleCurrencySelect}
//                                             className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none"
//                                         >
//                                             {currencies.map(currency => (
//                                                 <option key={currency.code} value={currency.code}>
//                                                     {currency.flag} {currency.code} - {currency.name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                         <FaMoneyBillWave className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                                     </div>
//                                     {formErrors.currency && (
//                                         <p className="text-red-500 text-xs mt-1">{formErrors.currency}</p>
//                                     )}
//                                 </div>

//                                 <div className="flex items-end">
//                                     <div className="w-full p-3 bg-blue-50 rounded-lg border border-blue-200">
//                                         <p className="text-xs text-blue-600 mb-1">Selected Currency</p>
//                                         <p className="text-lg font-bold text-blue-800">
//                                             {currencies.find(c => c.code === formData.currency)?.flag} {formData.currency} - {currencies.find(c => c.code === formData.currency)?.name}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Period Information */}
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Fiscal Year <span className="text-red-500">*</span>
//                                     </label>
//                                     <select
//                                         value={formData.fiscalYear}
//                                         onChange={(e) => {
//                                             const newYear = parseInt(e.target.value);
//                                             setFormData({...formData, fiscalYear: newYear});
//                                             const currentPeriod = formData.period;
//                                             if (currentPeriod && currentPeriod.includes('-')) {
//                                                 const month = currentPeriod.split('-')[1];
//                                                 handlePeriodChange(`${newYear}-${month}`);
//                                             }
//                                         }}
//                                         className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                     >
//                                         {years.map(year => (
//                                             <option key={year} value={year}>{year}</option>
//                                         ))}
//                                     </select>
//                                     {formErrors.fiscalYear && (
//                                         <p className="text-red-500 text-xs mt-1">{formErrors.fiscalYear}</p>
//                                     )}
//                                 </div>
//                                 <div>
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Period <span className="text-red-500">*</span>
//                                     </label>
//                                     <div className="flex gap-2">
//                                         <input
//                                             type="text"
//                                             value={formData.period}
//                                             onChange={(e) => handlePeriodChange(e.target.value)}
//                                             className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                             placeholder="YYYY-MM"
//                                         />
//                                         <select
//                                             value={formData.period?.split('-')[1] || ''}
//                                             onChange={(e) => {
//                                                 const year = formData.fiscalYear;
//                                                 handlePeriodChange(`${year}-${e.target.value}`);
//                                             }}
//                                             className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                         >
//                                             <option value="">Month</option>
//                                             {months.map(month => (
//                                                 <option key={month} value={month}>{month}</option>
//                                             ))}
//                                         </select>
//                                     </div>
//                                     {formErrors.period && (
//                                         <p className="text-red-500 text-xs mt-1">{formErrors.period}</p>
//                                     )}
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Journal Entries Section */}
//                         <div className="space-y-4">
//                             <h3 className="text-lg font-semibold text-gray-700">Journal Entries</h3>
                            
//                             <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex items-center gap-2">
//                                 <FaMoneyBillWave className="text-blue-600" />
//                                 <p className="text-sm text-blue-700">
//                                     All entries will be in <span className="font-bold">{formData.currency}</span> currency
//                                 </p>
//                             </div>
                            
//                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
//                                 <div className="relative lg:col-span-1">
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Search Account
//                                     </label>
//                                     <input
//                                         type="text"
//                                         value={searchTerm}
//                                         onChange={(e) => setSearchTerm(e.target.value)}
//                                         placeholder="Search accounts..."
//                                         className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                     />
//                                     <FaSearch className="absolute left-3 top-9 transform -translate-y-1/2 text-gray-400" />
//                                 </div>

//                                 <div className="lg:col-span-1">
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Select Account <span className="text-red-500">*</span>
//                                     </label>
//                                     {loadingAccounts ? (
//                                         <div className="text-center py-2">
//                                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
//                                         </div>
//                                     ) : (
//                                         <select
//                                             value={selectedAccount?._id || ''}
//                                             onChange={(e) => {
//                                                 const account = accounts.find(a => a._id === e.target.value);
//                                                 if (account) handleAccountSelect(account);
//                                             }}
//                                             className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                         >
//                                             <option value="">Select Account</option>
//                                             {accounts.map(account => (
//                                                 <option key={account._id} value={account._id}>
//                                                     {account.code} - {account.name}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     )}
//                                 </div>

//                                 <div className="lg:col-span-1">
//                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Partner (Optional)
//                                     </label>
//                                     {loadingPartners ? (
//                                         <div className="text-center py-2">
//                                             <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
//                                         </div>
//                                     ) : (
//                                         <select
//                                             value={selectedPartner?._id || ''}
//                                             onChange={(e) => {
//                                                 const partner = partners.find(p => p._id === e.target.value);
//                                                 setSelectedPartner(partner || null);
//                                             }}
//                                             className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                             disabled={!selectedAccount}
//                                         >
//                                             <option value="">No Partner</option>
//                                             {partners.map(partner => (
//                                                 <option key={partner._id} value={partner._id}>
//                                                     {partner.name} {partner.code ? `- ${partner.code}` : ''}
//                                                 </option>
//                                             ))}
//                                         </select>
//                                     )}
//                                 </div>
//                             </div>

//                             {selectedAccount && (
//                                 <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//                                     <h4 className="font-medium text-blue-800 mb-3">Entry Details</h4>
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                                 Debit Amount ({formData.currency})
//                                             </label>
//                                             <input
//                                                 type="number"
//                                                 value={debitAmount}
//                                                 onChange={(e) => {
//                                                     setDebitAmount(e.target.value);
//                                                     setCreditAmount('0');
//                                                 }}
//                                                 step="0.01"
//                                                 min="0"
//                                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                                 placeholder="0.00"
//                                             />
//                                         </div>

//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                                 Credit Amount ({formData.currency})
//                                             </label>
//                                             <input
//                                                 type="number"
//                                                 value={creditAmount}
//                                                 onChange={(e) => {
//                                                     setCreditAmount(e.target.value);
//                                                     setDebitAmount('0');
//                                                 }}
//                                                 step="0.01"
//                                                 min="0"
//                                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                                 placeholder="0.00"
//                                             />
//                                         </div>

//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                                 Reference
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={reference}
//                                                 onChange={(e) => setReference(e.target.value)}
//                                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                                 placeholder="e.g., INV-001"
//                                             />
//                                         </div>

//                                         <div>
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                                 Description <span className="text-red-500">*</span>
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={description}
//                                                 onChange={(e) => setDescription(e.target.value)}
//                                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                                 placeholder="Description"
//                                             />
//                                         </div>

//                                         <div className="md:col-span-2">
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                                 Arabic Description
//                                             </label>
//                                             <input
//                                                 type="text"
//                                                 value={descriptionArb}
//                                                 onChange={(e) => setDescriptionArb(e.target.value)}
//                                                 className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                                                 placeholder="الوصف بالعربية"
//                                             />
//                                         </div>

//                                         <div className="md:col-span-2 flex justify-end">
//                                             <button
//                                                 type="button"
//                                                 onClick={handleAddEntry}
//                                                 className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
//                                             >
//                                                 <FaPlus size={14} />
//                                                 Add Entry
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>

//                         {/* Entries Table */}
//                         {entries.length > 0 && (
//                             <div className="space-y-4">
//                                 <h4 className="font-medium text-gray-700">Entries List</h4>
//                                 <div className="border rounded-lg overflow-hidden">
//                                     <table className="min-w-full divide-y divide-gray-200">
//                                         <thead className="bg-gray-50">
//                                             <tr>
//                                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Account</th>
//                                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Partner</th>
//                                                 <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Description</th>
//                                                 <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Debit</th>
//                                                 <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Credit</th>
//                                                 <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Balance</th>
//                                                 <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Action</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="bg-white divide-y divide-gray-200">
//                                             {entries.map((entry) => (
//                                                 <tr key={entry._id}>
//                                                     <td className="px-4 py-2 text-sm">
//                                                         <div className="font-medium">{entry.accName}</div>
//                                                         <div className="text-xs text-gray-500">{entry.accNameArb}</div>
//                                                         <div className="text-xs text-gray-400">{entry.accGroup}</div>
//                                                         <div className="text-xs text-emerald-600">{entry.accType}</div>
//                                                     </td>
//                                                     <td className="px-4 py-2 text-sm">
//                                                         {entry.partnerName ? (
//                                                             <>
//                                                                 <div className="font-medium">{entry.partnerName}</div>
//                                                                 <div className="text-xs text-gray-500">{entry.partnerNameArb}</div>
//                                                             </>
//                                                         ) : (
//                                                             <span className="text-gray-400">-</span>
//                                                         )}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-sm">
//                                                         <div>{entry.description}</div>
//                                                         <div className="text-xs text-gray-500">{entry.descriptionArb}</div>
//                                                         <div className="text-xs text-gray-400">{entry.reference}</div>
//                                                     </td>
//                                                     <td className="px-4 py-2 text-right text-sm text-green-600">
//                                                         {entry.debit > 0 ? entry.debit.toFixed(2) : '-'}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-right text-sm text-red-600">
//                                                         {entry.credit > 0 ? entry.credit.toFixed(2) : '-'}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-right text-sm font-medium">
//                                                         {entry.balance.toFixed(2)}
//                                                     </td>
//                                                     <td className="px-4 py-2 text-center">
//                                                         <button
//                                                             type="button"
//                                                             onClick={() => handleRemoveEntry(entry._id)}
//                                                             className="text-red-600 hover:text-red-800"
//                                                             title="Remove Entry"
//                                                         >
//                                                             <FaTrash size={14} />
//                                                         </button>
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                         </tbody>
//                                         <tfoot className="bg-gray-50 font-medium">
//                                             <tr>
//                                                 <td colSpan="3" className="px-4 py-2 text-sm">
//                                                     Totals ({formData.currency})
//                                                 </td>
//                                                 <td className="px-4 py-2 text-right text-sm text-green-600">
//                                                     {totalDebit.toFixed(2)}
//                                                 </td>
//                                                 <td className="px-4 py-2 text-right text-sm text-red-600">
//                                                     {totalCredit.toFixed(2)}
//                                                 </td>
//                                                 <td className="px-4 py-2 text-right text-sm">
//                                                     {(totalDebit - totalCredit).toFixed(2)}
//                                                 </td>
//                                                 <td></td>
//                                             </tr>
//                                         </tfoot>
//                                     </table>
//                                 </div>
                                
//                                 {totalDebit !== totalCredit && (
//                                     <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//                                         <p className="text-sm text-yellow-700 flex items-center gap-2">
//                                             <FaBalanceScale className="text-yellow-600" />
//                                             Total debit ({totalDebit.toFixed(2)} {formData.currency}) must equal total credit ({totalCredit.toFixed(2)} {formData.currency})
//                                         </p>
//                                     </div>
//                                 )}
//                                 {formErrors.entries && (
//                                     <p className="text-red-500 text-sm">{formErrors.entries}</p>
//                                 )}
//                             </div>
//                         )}

//                         <input type="hidden" name="journalsNameId" value={formData.journalsNameId} />

//                         {/* Submit Button */}
//                         <div className="flex gap-3 justify-end pt-4 border-t">
//                             <button
//                                 type="button"
//                                 onClick={handleClose}
//                                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={isLoading || totalDebit !== totalCredit || entries.length === 0 || !selectedJournalName}
//                                 className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 disabled:opacity-50"
//                             >
//                                 {isLoading ? (
//                                     <>
//                                         <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
//                                         <span>{mode === 'edit' ? 'Updating...' : 'Creating...'}</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         {mode === 'edit' ? <FaEdit size={16} /> : <FaPlus size={16} />}
//                                         <span>{mode === 'edit' ? 'Update Journal' : `Add Journal in ${formData.currency}`}</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>

//                         {mode === 'add' && (
//                             <div className="text-xs text-gray-500 text-center">
//                                 <span className="inline-flex items-center gap-1">
//                                     <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
//                                     New journals are created with "Draft" status by default
//                                 </span>
//                             </div>
//                         )}
//                     </form>
//                 </motion.div>
//             </div>
//         </div>
//     );
// };

// export default AddJournal;


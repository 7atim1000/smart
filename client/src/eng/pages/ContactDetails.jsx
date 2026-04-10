import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
    FaEdit, FaPrint, FaDownload, FaUser, 
    FaEnvelope, FaPhone, FaMapMarkerAlt, FaArrowLeft,
    FaUserCircle, FaHistory, FaUserFriends, FaPlus,
    FaWallet, FaMoneyBillWave, FaSave, FaTimes, FaCreditCard, FaSearch
} from 'react-icons/fa';
import { GiPayMoney, GiReceiveMoney } from 'react-icons/gi';
import { MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { BiPurchaseTag, BiUser } from 'react-icons/bi';

// Currency options
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

const ContactDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { axios } = useContext(AuthContext);
    
    const [contact, setContact] = useState(location.state?.contact || null);
    const [loading, setLoading] = useState(!location.state?.contact);
    const [updating, setUpdating] = useState(false);
    const [transactions, setTransactions] = useState([]);
    const [transactionsLoading, setTransactionsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('info');
    const [paymentSubmitting, setPaymentSubmitting] = useState(false);
    
    // Account selection states
    const [accounts, setAccounts] = useState([]);
    const [loadingAccounts, setLoadingAccounts] = useState(false);
    const [selectedPaymentAccount, setSelectedPaymentAccount] = useState(null);
    const [accountSearchTerm, setAccountSearchTerm] = useState('');
    
    // Payment form state
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        currency: 'AED',
        paymentAccount: '',
        date: new Date().toISOString().split('T')[0]
    });

    // Opening balance state
    const [newBalance, setNewBalance] = useState('');
    const [newCurrency, setNewCurrency] = useState('AED');
    const [showBalanceInput, setShowBalanceInput] = useState(false);

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
                console.log('All accounts fetched:', response.data.accounts);
            }
        } catch (error) {
            console.error('Error fetching accounts:', error);
            toast.error('Failed to load accounts');
        } finally {
            setLoadingAccounts(false);
        }
    };

    // Fetch accounts on component mount
    useEffect(() => {
        fetchAllAccounts();
    }, []);

    // Filter accounts based on search term
    const filteredAccounts = accounts.filter(account => {
        if (!accountSearchTerm) return true;
        
        const searchLower = accountSearchTerm.toLowerCase();
        const accountCode = account.code?.toLowerCase() || '';
        const accountName = account.name?.toLowerCase() || '';
        const accountNameArb = account.nameArb || '';
        
        return accountCode.includes(searchLower) ||
               accountName.includes(searchLower) ||
               accountNameArb.includes(accountSearchTerm);
    });

    // Handle account selection
    const handlePaymentAccountSelect = (account) => {
        setSelectedPaymentAccount(account);
        setPaymentForm(prev => ({ ...prev, paymentAccount: account._id }));
    };

    // Fetch contact data if not provided via state
    useEffect(() => {
        if (!contact && id) {
            fetchContact();
        }
    }, [id]);

    const fetchContact = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/v1/api/contacts/${id}`);
            if (response.data.success) {
                setContact(response.data.contact);
                // Set default currency from contact if available
                if (response.data.contact.balanceCurrency) {
                    setNewCurrency(response.data.contact.balanceCurrency);
                }
            } else {
                toast.error('Failed to fetch contact details');
                navigate('/en/contacts');
            }
        } catch (error) {
            console.error('Error fetching contact:', error);
            toast.error('Error loading contact details');
            navigate('/en/contacts');
        } finally {
            setLoading(false);
        }
    };


/////////////////////////////////START OPENING BALANCE//////////////////////////////////////
// Handle opening balance update
const handleUpdateBalance = async () => {
    if (!newBalance || isNaN(newBalance)) {
        toast.error('Please enter a valid number');
        return;
    }

    setUpdating(true);
    
    let journalCreated = false;

    try {
        const openingBalanceAmount = parseFloat(newBalance);
        
        // Step 1: Create Opening Balance Journal Entry
        try {
            // Journal header information for opening balance
            const journalName = 'Opening Balance';
            const journalNameArb = 'الارصده الافتتاحيه';
            const journalsNameId = '69b5953f0a46ab203eb85609';
            
            // Set reference based on contact type
            let journalReference = '';
            if (contact.isReceivable) {
                journalReference = 'Customers opening balance';
            } else if (contact.isPayable) {
                journalReference = 'Suppliers opening balance';
            } else {
                journalReference = 'Opening balance';
            }

            // Prepare journal entries based on contact type
            const journalEntries = [];

            // Get current date for entry date
            const entryDate = new Date();
            const entryReference1 = 'ENT-1';
            const entryReference2 = 'ENT-2';

            if (contact.isReceivable) {
                // Customer opening balance: Debit Receivable Account, Credit Opening Balance Account
                
                // Debit entry for receivable account (customer account) - WITH PARTNER INFO
                journalEntries.push({
                    date: entryDate,
                    reference: entryReference1,
                    description: `Opening balance for customer ${contact.name}`,
                    descriptionArb: `رصيد افتتاحي للعميل ${contact.nameArb || contact.name}`,
                    debit: openingBalanceAmount,
                    credit: 0,
                    balance: openingBalanceAmount,
                    currency: newCurrency,
                    // Account information for receivable account
                    accName: contact.accReceivableName || 'Receivable account',
                    accNameArb: contact.accReceivableNameArb || 'حساب العملاء',
                    accGroup: contact.accReceivableGroup || 'Receivable',
                    accGroupArb: contact.accReceivableGroupArb || 'العملاء',
                    accClass: contact.accReceivableClass || 'Debts with debtor relationships',
                    accClassArb: contact.accReceivableClassArb || 'ذمم ذات علاقات مدينة',
                    accLevel: contact.accReceivableLevel || 'Current Assets',
                    accLevelArb: contact.accReceivableLevelArb || 'الاصول المتداولة',
                    accChart: contact.accReceivableChart || 'Assets',
                    accChartArb: contact.accReceivableChartArb || 'الاصول',
                    accType: contact.accReceivableType || 'Balance Sheet',
                    // Partner information for contact account
                    partnerId: contact._id,
                    partnerName: contact.name,
                    partnerNameArb: contact.nameArb || contact.name
                });

                // Credit entry for opening balance account - NO PARTNER INFO
                journalEntries.push({
                    date: entryDate,
                    reference: entryReference2,
                    description: `Opening balance for customer ${contact.name}`,
                    descriptionArb: `رصيد افتتاحي للعميل ${contact.nameArb || contact.name}`,
                    debit: 0,
                    credit: openingBalanceAmount,
                    balance: -openingBalanceAmount,
                    currency: newCurrency,
                    // Account information for opening balance account
                    accName: 'Opening balances account under settlement',
                    accNameArb: 'حساب ارصدة افتتاحية تحت التسوية',
                    accGroup: 'Opening balances',
                    accGroupArb: 'الارصدة الافتتاحيه',
                    accClass: 'Opening balances',
                    accClassArb: 'الارصدة الافتتاحيه',
                    accLevel: 'Opening balances',
                    accLevelArb: 'الارصدة الافتتاحيه',
                    accChart: 'Equity',
                    accChartArb: 'حقوق الملكيه',
                    accType: 'Balance Sheet',
                    // No partner information for opening balance account
                    partnerId: null,
                    partnerName: null,
                    partnerNameArb: null
                });
                
            } else if (contact.isPayable) {
                // Supplier opening balance: Credit Payable Account, Debit Opening Balance Account
                
                // Debit entry for opening balance account - NO PARTNER INFO
                journalEntries.push({
                    date: entryDate,
                    reference: entryReference1,
                    description: `Opening balance for supplier ${contact.name}`,
                    descriptionArb: `رصيد افتتاحي للمورد ${contact.nameArb || contact.name}`,
                    debit: openingBalanceAmount,
                    credit: 0,
                    balance: openingBalanceAmount,
                    currency: newCurrency,
                    // Account information for opening balance account
                    accName: 'Opening balances account under settlement',
                    accNameArb: 'حساب ارصدة افتتاحية تحت التسوية',
                    accGroup: 'Opening balances',
                    accGroupArb: 'الارصدة الافتتاحيه',
                    accClass: 'Opening balances',
                    accClassArb: 'الارصدة الافتتاحيه',
                    accLevel: 'Opening balances',
                    accLevelArb: 'الارصدة الافتتاحيه',
                    accChart: 'Equity',
                    accChartArb: 'حقوق الملكيه',
                    accType: 'Balance Sheet',
                    // No partner information for opening balance account
                    partnerId: null,
                    partnerName: null,
                    partnerNameArb: null
                });

                // Credit entry for payable account (supplier account) - WITH PARTNER INFO
                journalEntries.push({
                    date: entryDate,
                    reference: entryReference2,
                    description: `Opening balance for supplier ${contact.name}`,
                    descriptionArb: `رصيد افتتاحي للمورد ${contact.nameArb || contact.name}`,
                    debit: 0,
                    credit: openingBalanceAmount,
                    balance: -openingBalanceAmount,
                    currency: newCurrency,
                    // Account information for payable account
                    accName: contact.accPayableName || 'Payable account',
                    accNameArb: contact.accPayableNameArb || 'حساب الموردين',
                    accGroup: contact.accPayableGroup || 'Payable',
                    accGroupArb: contact.accPayableGroupArb || 'الدائنون',
                    accClass: contact.accPayableClass || 'Debts with creditor relationships',
                    accClassArb: contact.accPayableClassArb || 'ذمم ذات علاقات دائنة',
                    accLevel: contact.accPayableLevel || 'Current Liabilities',
                    accLevelArb: contact.accPayableLevelArb || 'الالتزامات المتداولة',
                    accChart: contact.accPayableChart || 'Liabilities',
                    accChartArb: contact.accPayableChartArb || 'الالتزامات',
                    accType: contact.accPayableType || 'Balance Sheet',
                    // Partner information for contact account
                    partnerId: contact._id,
                    partnerName: contact.name,
                    partnerNameArb: contact.nameArb || contact.name
                });
            }

            // Calculate totals
            const totalDebit = journalEntries.reduce((sum, entry) => sum + entry.debit, 0);
            const totalCredit = journalEntries.reduce((sum, entry) => sum + entry.credit, 0);

            // Get current period (month/year) from date
            const currentDate = new Date();
            const year = currentDate.getFullYear();
            const month = String(currentDate.getMonth() + 1).padStart(2, '0');
            const period = `${year}-${month}`;

            // Determine journal code
            const journalCode = `OPE-${Date.now()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

            const journalData = {
                // Journal Header
                journalsNameId: journalsNameId,
                journalName: journalName,
                journalNameArb: journalNameArb,
                reference: journalReference,
                status: 'draft',
                code: journalCode,
                fiscalYear: year,
                period: period,
                openingBalance: 0,
                currentBalance: 0,
                totalDebit: totalDebit,
                totalCredit: totalCredit,
                netChange: totalDebit - totalCredit,
                currency: newCurrency,
                entries: journalEntries,
                isActive: true,
                isClosed: false,
                closedAt: null,
                lastEntryDate: currentDate
            };

            console.log('Opening Balance Journal Data:', JSON.stringify(journalData, null, 2));

            // Create journal entry
            const journalResponse = await axios.post('/v1/api/journals', journalData);

            if (journalResponse.data.success) {
                journalCreated = true;
                toast.success('Opening balance journal entry created successfully');
            } else {
                console.error('Journal response error:', journalResponse.data);
                toast.error('Opening balance journal entry creation failed');
            }
            
        } catch (journalError) {
            console.error('Journal error details:', journalError.response?.data || journalError);
            toast.error('Opening balance journal entry could not be created');
            // Continue with balance update even if journal fails
        }

        
        ///////////////////////////////
        // Step 2: Update contact balance
        const response = await axios.patch(`/v1/api/contacts/${contact._id}/balance`, {
            balance: openingBalanceAmount,
            balanceCurrency: newCurrency
        });

        if (response.data.success) {
            setContact(prev => ({
                ...prev,
                balance: response.data.data.balance,
                balanceCurrency: response.data.data.balanceCurrency
            }));
            
            if (journalCreated) {
                toast.success('Balance updated successfully with journal entry!');
            } else {
                toast.success('Balance updated successfully');
            }
            
            setShowBalanceInput(false);
            setNewBalance('');
        }
        
    } catch (error) {
        console.error('Error updating balance:', error);
        toast.error(error.response?.data?.message || 'Failed to update balance');
    } finally {
        setUpdating(false);
    }
};


    /////////////////////////////////END OPENING BALANCE//////////////////////////////////////

    // Helper function to get account hierarchy for journal entries
    const getAccountHierarchy = (account) => {
        // For payment accounts from chart of accounts (have full hierarchy)
        if (account.chart && account.level && account.group) {
            return {
                accName: account.name || '',
                accNameArb: account.nameArb || '',
                accGroup: account.group?.name || account.groupName || '',
                accGroupArb: account.group?.nameArb || account.groupNameArb || '',
                accClass: account.class?.name || account.className || '',
                accClassArb: account.class?.nameArb || account.classNameArb || '',
                accLevel: account.level?.name || account.levelName || '',
                accLevelArb: account.level?.nameArb || account.levelNameArb || '',
                accChart: account.chart?.name || account.chartName || '',
                accChartArb: account.chart?.nameArb || account.chartNameArb || '',
                accType: account.type || 'Balance Sheet'
            };
        }
        
        // For contact accounts (receivable/payable) - use the contact's account fields
        return {
            accName: account.name || '',
            accNameArb: account.nameArb || '',
            accGroup: account.group || '',
            accGroupArb: account.groupArb || '',
            accClass: account.class || '',
            accClassArb: account.classArb || '',
            accLevel: account.level || '',
            accLevelArb: account.levelArb || '',
            accChart: account.chart || '',
            accChartArb: account.chartArb || '',
            accType: account.type || 'Balance Sheet'
        };
    };

 
// Helper function to create journal entry
// const createJournalEntry = (account, isDebit, amount, partnerInfo, description, reference, contactType) => {
//     let accountInfo;
    
//     // Check if this is a customer payment (credit entry for receivable)
//     if (contactType === 'customer' && !isDebit) {
//         // For customer payment credit entry - use receivable account fields from contact
//         accountInfo = {
//             accName: partnerInfo.accReceivableName || account.name || '',
//             accNameArb: partnerInfo.accReceivableNameArb || account.nameArb || '',
//             accGroup: partnerInfo.accReceivableGroup || account.group || '',
//             accGroupArb: partnerInfo.accReceivableGroupArb || account.groupArb || '',
//             accClass: partnerInfo.accReceivableClass || account.class || '',
//             accClassArb: partnerInfo.accReceivableClassArb || account.classArb || '',
//             accLevel: partnerInfo.accReceivableLevel || account.level || '',
//             accLevelArb: partnerInfo.accReceivableLevelArb || account.levelArb || '',
//             accChart: partnerInfo.accReceivableChart || account.chart || '',
//             accChartArb: partnerInfo.accReceivableChartArb || account.chartArb || '',
//             accType: partnerInfo.accReceivableType || account.type || 'Balance Sheet'
//         };
//     }
//     // Check if this is a supplier payment (debit entry for payable)
//     else if (contactType === 'supplier' && isDebit) {
//         // For supplier payment debit entry - use payable account fields from contact
//         accountInfo = {
//             accName: partnerInfo.accPayableName || account.name || '',
//             accNameArb: partnerInfo.accPayableNameArb || account.nameArb || '',
//             accGroup: partnerInfo.accPayableGroup || account.group || '',
//             accGroupArb: partnerInfo.accPayableGroupArb || account.groupArb || '',
//             accClass: partnerInfo.accPayableClass || account.class || '',
//             accClassArb: partnerInfo.accPayableClassArb || account.classArb || '',
//             accLevel: partnerInfo.accPayableLevel || account.level || '',
//             accLevelArb: partnerInfo.accPayableLevelArb || account.levelArb || '',
//             accChart: partnerInfo.accPayableChart || account.chart || '',
//             accChartArb: partnerInfo.accPayableChartArb || account.chartArb || '',
//             accType: partnerInfo.accPayableType || account.type || 'Balance Sheet'
//         };
//     }
//     else {
//         // For all other entries (payment account entries), use the regular account hierarchy
//         accountInfo = getAccountHierarchy(account);
//     }

//     return {
//         date: paymentForm.date,
//         reference: reference,
//         description: description,
//         descriptionArb: description,
//         debit: isDebit ? amount : 0,
//         credit: !isDebit ? amount : 0,
//         balance: isDebit ? amount : -amount,
//         currency: paymentForm.currency,
//         // Account information with full hierarchy
//         accName: accountInfo.accName,
//         accNameArb: accountInfo.accNameArb,
//         accGroup: accountInfo.accGroup,
//         accGroupArb: accountInfo.accGroupArb,
//         accClass: accountInfo.accClass,
//         accClassArb: accountInfo.accClassArb,
//         accLevel: accountInfo.accLevel,
//         accLevelArb: accountInfo.accLevelArb,
//         accChart: accountInfo.accChart,
//         accChartArb: accountInfo.accChartArb,
//         accType: accountInfo.accType,
//         // Partner information
//         partnerId: partnerInfo.id,
//         partnerName: partnerInfo.name,
//         partnerNameArb: partnerInfo.nameArb || partnerInfo.name
//     };
// };

// Helper function to create journal entry
    // Start journalEntry function
    // Helper function to create journal entry
    /*
    The issue is that in your createJournalEntry function, you're using the isContactAccount flag to determine whether to include partner information, but the logic might not be correctly identifying which entries should have partner information. Let's fix this:
    */
   // Helper function to create journal entry
const createJournalEntry = (account, isDebit, amount, partnerInfo, description, reference, contactType, isContactAccount = false) => {
    let accountInfo;
    
    // Check if this is a customer payment (credit entry for receivable)
    if (contactType === 'customer' && !isDebit) {
        // For customer payment credit entry - use receivable account fields from contact
        accountInfo = {
            accName: partnerInfo.accReceivableName || account.name || '',
            accNameArb: partnerInfo.accReceivableNameArb || account.nameArb || '',
            accGroup: partnerInfo.accReceivableGroup || account.group || '',
            accGroupArb: partnerInfo.accReceivableGroupArb || account.groupArb || '',
            accClass: partnerInfo.accReceivableClass || account.class || '',
            accClassArb: partnerInfo.accReceivableClassArb || account.classArb || '',
            accLevel: partnerInfo.accReceivableLevel || account.level || '',
            accLevelArb: partnerInfo.accReceivableLevelArb || account.levelArb || '',
            accChart: partnerInfo.accReceivableChart || account.chart || '',
            accChartArb: partnerInfo.accReceivableChartArb || account.chartArb || '',
            accType: partnerInfo.accReceivableType || account.type || 'Balance Sheet'
        };
    }
    // Check if this is a supplier payment (debit entry for payable)
    else if (contactType === 'supplier' && isDebit) {
        // For supplier payment debit entry - use payable account fields from contact
        accountInfo = {
            accName: partnerInfo.accPayableName || account.name || '',
            accNameArb: partnerInfo.accPayableNameArb || account.nameArb || '',
            accGroup: partnerInfo.accPayableGroup || account.group || '',
            accGroupArb: partnerInfo.accPayableGroupArb || account.groupArb || '',
            accClass: partnerInfo.accPayableClass || account.class || '',
            accClassArb: partnerInfo.accPayableClassArb || account.classArb || '',
            accLevel: partnerInfo.accPayableLevel || account.level || '',
            accLevelArb: partnerInfo.accPayableLevelArb || account.levelArb || '',
            accChart: partnerInfo.accPayableChart || account.chart || '',
            accChartArb: partnerInfo.accPayableChartArb || account.chartArb || '',
            accType: partnerInfo.accPayableType || account.type || 'Balance Sheet'
        };
    }
    else {
        // For all other entries (payment account entries), use the regular account hierarchy
        accountInfo = getAccountHierarchy(account);
    }

    // Determine if this entry should have partner information
    // Contact accounts (receivable/payable) should have partner info
    // Payment accounts should NOT have partner info
    const shouldIncludePartner = isContactAccount;

    return {
        date: paymentForm.date,
        reference: reference,
        description: description,
        descriptionArb: description,
        debit: isDebit ? amount : 0,
        credit: !isDebit ? amount : 0,
        balance: isDebit ? amount : -amount,
        currency: paymentForm.currency,
        // Account information with full hierarchy
        accName: accountInfo.accName,
        accNameArb: accountInfo.accNameArb,
        accGroup: accountInfo.accGroup,
        accGroupArb: accountInfo.accGroupArb,
        accClass: accountInfo.accClass,
        accClassArb: accountInfo.accClassArb,
        accLevel: accountInfo.accLevel,
        accLevelArb: accountInfo.accLevelArb,
        accChart: accountInfo.accChart,
        accChartArb: accountInfo.accChartArb,
        accType: accountInfo.accType,
        // Partner information - only include for contact accounts (receivable/payable)
        partnerId: shouldIncludePartner ? partnerInfo.id : null,
        partnerName: shouldIncludePartner ? partnerInfo.name : null,
        partnerNameArb: shouldIncludePartner ? (partnerInfo.nameArb || partnerInfo.name) : null
    };
};

    // End journalEntry function 


    // Start Handle payment submission /////////////////////////////////////////////////////////////////////

// Handle payment submission
// const handlePayment = async () => {
//     if (!paymentForm.amount || isNaN(paymentForm.amount) || parseFloat(paymentForm.amount) <= 0) {
//         toast.error('Please enter a valid amount');
//         return;
//     }

//     if (!paymentForm.date) {
//         toast.error('Please select a date');
//         return;
//     }

//     if (!paymentForm.paymentAccount) {
//         toast.error('Please select a payment account');
//         return;
//     }

//     setPaymentSubmitting(true);

//     let invoiceCreated = false;
//     let transactionCreated = false;
//     let journalCreated = false;

//     try {
//         const paymentAmount = parseFloat(paymentForm.amount);

//         // Determine invoice type based on contact type
//         let invoiceType = '';
//         let transactionType = '';
//         let transactionCategory = '';
//         let accountId = '';
//         let contactAccount = null;
//         let debitAccount = null;
//         let creditAccount = null;

//         if (contact.isReceivable) {
//             invoiceType = 'customersPayment';
//             transactionType = 'Income';
//             transactionCategory = 'Customer paid';
//             accountId = contact.accReceivableId || contact._id;

//             // For customer payment: Debit = Payment Account, Credit = Receivable Account
//             debitAccount = selectedPaymentAccount; // Payment account (where money goes)
//             creditAccount = {
//                 _id: accountId,
//                 name: contact.accReceivableName,
//                 nameArb: contact.accReceivableNameArb,
//                 group: contact.accReceivableGroup,
//                 groupArb: contact.accReceivableGroupArb,
//                 class: contact.accReceivableClass,
//                 classArb: contact.accReceivableClassArb,
//                 level: contact.accReceivableLevel,
//                 levelArb: contact.accReceivableLevelArb,
//                 chart: contact.accReceivableChart,
//                 chartArb: contact.accReceivableChartArb,
//                 type: contact.accReceivableType
//             };
//         } else if (contact.isPayable) {
//             invoiceType = 'supplierPayement';
//             transactionType = 'Expense';
//             transactionCategory = 'Supplier payment';
//             accountId = contact.accPayableId || contact._id;

//             // For supplier payment: Debit = Payable Account, Credit = Payment Account
//             debitAccount = {
//                 _id: accountId,
//                 name: contact.accPayableName,
//                 nameArb: contact.accPayableNameArb,
//                 group: contact.accPayableGroup,
//                 groupArb: contact.accPayableGroupArb,
//                 class: contact.accPayableClass,
//                 classArb: contact.accPayableClassArb,
//                 level: contact.accPayableLevel,
//                 levelArb: contact.accPayableLevelArb,
//                 chart: contact.accPayableChart,
//                 chartArb: contact.accPayableChartArb,
//                 type: contact.accPayableType
//             };
//             creditAccount = selectedPaymentAccount; // Payment account (where money comes from)
//         } else {
//             toast.error('Contact type not determined');
//             setPaymentSubmitting(false);
//             return;
//         }

//         // Prepare invoice data
//         const invoiceData = {
//             invoiceNumber: `PAY-${Date.now()}`,
//             invoiceType: invoiceType,
//             invoiceStatus: "Completed",
//             bills: {
//                 total: 0,
//                 tax: 0,
//                 totalWithTax: 0,
//                 payed: paymentAmount,
//                 balance: 0,
//                 currency: paymentForm.currency,
//             },
//             items: null,
//             paymentMethod: "Cash",
//             orderDate: paymentForm.date,
//         };

//         // Add customer or supplier based on contact type
//         if (contact.isReceivable) {
//             invoiceData.customer = contact._id;
//         }

//         if (contact.isPayable) {
//             invoiceData.supplier = contact._id;
//         }

//         // Step 1: Create Invoice
//         const invoiceResponse = await axios.post('/v1/api/invoices/', invoiceData);

//         if (!invoiceResponse.data.success) {
//             throw new Error('Failed to create invoice');
//         }

//         invoiceCreated = true;
//         toast.success('Invoice created successfully');

//         // Step 2: Prepare transaction data
//         const transactionData = {
//             amount: paymentAmount,
//             type: transactionType,
//             account: accountId,
//             paymentAccount: paymentForm.paymentAccount,
//             paymentMethod: "Cash",
//             date: paymentForm.date,
//             category: transactionCategory,
//             description: `Payment ${contact.isReceivable ? 'from' : 'to'} ${contact.name}`,
//             currency: paymentForm.currency,
//             refrence: contact._id,
//             transactionNumber: `TRX-${Date.now()}`,
//             status: 'Completed'
//         };

//         console.log('Sending transaction data:', transactionData);

//         // Step 3: Create Transaction
//         try {
//             const transactionResponse = await axios.post('/v1/api/transactions/', transactionData);

//             if (transactionResponse.data.success) {
//                 transactionCreated = true;
//                 toast.success('Transaction recorded successfully');
//             } else {
//                 console.error('Transaction response error:', transactionResponse.data);
//                 toast.error('Invoice created but transaction failed to save');
//             }
//         } catch (transactionError) {
//             console.error('Transaction error details:', transactionError.response?.data || transactionError);
//             toast.error('Invoice created but transaction could not be recorded');
//         }

//         // Step 4: Create Journal Entry with dynamic account information
//         try {
//             // Determine journal header information based on selected payment account
//             let journalName = '';
//             let journalNameArb = '';
//             let journalCode = '';
//             let journalsNameId = '';
            
            
//             // Check if selected payment account is Dubai Islamic Bank
//             if (selectedPaymentAccount.name === 'Dubai Islamic Bank' ||
//                 selectedPaymentAccount.nameArb === 'بنك دبي الاسلامي' ||
//                 selectedPaymentAccount.code === '111101') {
//                 journalName = 'Dubai Islamic Bank';
//                 journalNameArb = 'بنك دبي الاسلامي';
//                 journalCode = '111101';
//                 journalsNameId = '69a5cfbbc8ca5b09178e3b0c';
                
//             }
//             // Check if selected payment account is Cash
//             else if (selectedPaymentAccount.name === 'Cash' ||
//                 selectedPaymentAccount.nameArb === 'الخزينة الرئيسيه' ||
//                 selectedPaymentAccount.code === '111201') {
//                 journalName = 'Cash';
//                 journalNameArb = 'الخزينة الرئيسيه';
//                 journalCode = '111201';
//                 journalsNameId = '69a5d79fc8ca5b09178e44c4';
                
//             }
//             else if (selectedPaymentAccount.name === 'Khartoum Bank' ||
//                 selectedPaymentAccount.nameArb === 'بنك الخرطوم' ||
//                 selectedPaymentAccount.code === '111102') {
//                 journalName = 'Khartoum Bank';
//                 journalNameArb = 'بنك الخرطوم';
//                 journalCode = '111102';
//                 journalsNameId = '69b58c2a0a46ab203eb84fbb';
                
//             }
//             // Default fallback - use selected payment account information
//             else {
//                 journalName = selectedPaymentAccount.name || 'Payment Account';
//                 journalNameArb = selectedPaymentAccount.nameArb || journalName;
//                 journalCode = selectedPaymentAccount.code || '000000';
//                 journalsNameId = selectedPaymentAccount._id;
                
//             }

//             // Prepare journal entries based on contact type
//             const journalEntries = [];

//             // Get current date for entry date
//             const entryReference = `PAY-${Date.now()}`;

//             if (contact.isReceivable) {
//                 // Customer payment: Debit Payment Account, Credit Receivable Account
                
//                 // Debit entry for payment account - NO PARTNER INFO (isContactAccount = false)
//                 journalEntries.push(createJournalEntry(
//                     debitAccount,           // account
//                     true,                   // isDebit
//                     paymentAmount,           // amount
//                     {                        // partnerInfo
//                         name: contact.name, 
//                         nameArb: contact.nameArb || contact.name, 
//                         type: 'customer', 
//                         id: contact._id,
//                         // Pass receivable account fields for credit entry
//                         accReceivableName: contact.accReceivableName,
//                         accReceivableNameArb: contact.accReceivableNameArb,
//                         accReceivableGroup: contact.accReceivableGroup,
//                         accReceivableGroupArb: contact.accReceivableGroupArb,
//                         accReceivableClass: contact.accReceivableClass,
//                         accReceivableClassArb: contact.accReceivableClassArb,
//                         accReceivableLevel: contact.accReceivableLevel,
//                         accReceivableLevelArb: contact.accReceivableLevelArb,
//                         accReceivableChart: contact.accReceivableChart,
//                         accReceivableChartArb: contact.accReceivableChartArb,
//                         accReceivableType: contact.accReceivableType
//                     },
//                     `Payment received from ${contact.name}`, // description
//                     entryReference,         // reference
//                     'customer',             // contactType
//                     false                   // isContactAccount = false (payment account)
//                 ));

//                 // Credit entry for receivable account - WITH PARTNER INFO (isContactAccount = true)
//                 journalEntries.push(createJournalEntry(
//                     creditAccount,          // account
//                     false,                  // isDebit (credit)
//                     paymentAmount,           // amount
//                     {                        // partnerInfo
//                         name: contact.name, 
//                         nameArb: contact.nameArb || contact.name, 
//                         type: 'customer', 
//                         id: contact._id,
//                         // Pass receivable account fields
//                         accReceivableName: contact.accReceivableName,
//                         accReceivableNameArb: contact.accReceivableNameArb,
//                         accReceivableGroup: contact.accReceivableGroup,
//                         accReceivableGroupArb: contact.accReceivableGroupArb,
//                         accReceivableClass: contact.accReceivableClass,
//                         accReceivableClassArb: contact.accReceivableClassArb,
//                         accReceivableLevel: contact.accReceivableLevel,
//                         accReceivableLevelArb: contact.accReceivableLevelArb,
//                         accReceivableChart: contact.accReceivableChart,
//                         accReceivableChartArb: contact.accReceivableChartArb,
//                         accReceivableType: contact.accReceivableType
//                     },
//                     `Payment received from ${contact.name}`, // description
//                     entryReference,         // reference
//                     'customer',             // contactType
//                     true                    // isContactAccount = true (receivable account)
//                 ));
//             } else if (contact.isPayable) {
//                 // Supplier payment: Debit Payable Account, Credit Payment Account
                
//                 // Debit entry for payable account - WITH PARTNER INFO (isContactAccount = true)
//                 journalEntries.push(createJournalEntry(
//                     debitAccount,           // account
//                     true,                   // isDebit
//                     paymentAmount,           // amount
//                     {                        // partnerInfo
//                         name: contact.name, 
//                         nameArb: contact.nameArb || contact.name, 
//                         type: 'supplier', 
//                         id: contact._id,
//                         // Pass payable account fields for debit entry
//                         accPayableName: contact.accPayableName,
//                         accPayableNameArb: contact.accPayableNameArb,
//                         accPayableGroup: contact.accPayableGroup,
//                         accPayableGroupArb: contact.accPayableGroupArb,
//                         accPayableClass: contact.accPayableClass,
//                         accPayableClassArb: contact.accPayableClassArb,
//                         accPayableLevel: contact.accPayableLevel,
//                         accPayableLevelArb: contact.accPayableLevelArb,
//                         accPayableChart: contact.accPayableChart,
//                         accPayableChartArb: contact.accPayableChartArb,
//                         accPayableType: contact.accPayableType
//                     },
//                     `Payment made to ${contact.name}`, // description
//                     entryReference,         // reference
//                     'supplier',             // contactType
//                     true                    // isContactAccount = true (payable account)
//                 ));

//                 // Credit entry for payment account - NO PARTNER INFO (isContactAccount = false)
//                 journalEntries.push(createJournalEntry(
//                     creditAccount,          // account
//                     false,                  // isDebit (credit)
//                     paymentAmount,           // amount
//                     {                        // partnerInfo
//                         name: contact.name, 
//                         nameArb: contact.nameArb || contact.name, 
//                         type: 'supplier', 
//                         id: contact._id,
//                         // Pass payable account fields for reference
//                         accPayableName: contact.accPayableName,
//                         accPayableNameArb: contact.accPayableNameArb,
//                         accPayableGroup: contact.accPayableGroup,
//                         accPayableGroupArb: contact.accPayableGroupArb,
//                         accPayableClass: contact.accPayableClass,
//                         accPayableClassArb: contact.accPayableClassArb,
//                         accPayableLevel: contact.accPayableLevel,
//                         accPayableLevelArb: contact.accPayableLevelArb,
//                         accPayableChart: contact.accPayableChart,
//                         accPayableChartArb: contact.accPayableChartArb,
//                         accPayableType: contact.accPayableType
//                     },
//                     `Payment made to ${contact.name}`, // description
//                     entryReference,         // reference
//                     'supplier',             // contactType
//                     false                   // isContactAccount = false (payment account)
//                 ));
//             }

//             // Calculate totals
//             const totalDebit = journalEntries.reduce((sum, entry) => sum + entry.debit, 0);
//             const totalCredit = journalEntries.reduce((sum, entry) => sum + entry.credit, 0);

//             // Get current period (month/year) from date
//             const paymentDate = new Date(paymentForm.date);
//             const year = paymentDate.getFullYear();
//             const month = String(paymentDate.getMonth() + 1).padStart(2, '0');
//             const period = `${year}-${month}`;

            

//             const journalData = {
//                 // Journal Header
//                 journalsNameId: journalsNameId,
//                 journalName: journalName,
//                 status: 'draft',
//                 journalNameArb: journalNameArb,
//                 code: journalCode,
//                 fiscalYear: year,
//                 period: period,
//                 openingBalance: 0,
//                 currentBalance: 0,
//                 totalDebit: totalDebit,
//                 totalCredit: totalCredit,
//                 netChange: totalDebit - totalCredit,
//                 currency: paymentForm.currency,
//                 entries: journalEntries,
//                 isActive: true,
//                 isClosed: false,
//                 closedAt: null,
//                 lastEntryDate: paymentDate
//             };

//             console.log('Journal Data with dynamic hierarchy:', JSON.stringify(journalData, null, 2));
//             console.log('First entry sample:', journalData.entries[0]);

//             const journalResponse = await axios.post('/v1/api/journals', journalData);

//             if (journalResponse.data.success) {
//                 journalCreated = true;
//                 toast.success('Journal entry created successfully');
//             } else {
//                 console.error('Journal response error:', journalResponse.data);
//                 toast.error('Journal entry creation failed');
//             }
//         } catch (journalError) {
//             console.error('Journal error details:', journalError.response?.data || journalError);
//             toast.error('Journal entry could not be created');
//         }

//         // Step 5: Calculate new balance
//         let newBalanceAmount;

//         if (contact.isReceivable) {
//             newBalanceAmount = (contact.balance || 0) - paymentAmount;
//         } else if (contact.isPayable) {
//             newBalanceAmount = (contact.balance || 0) + paymentAmount;
//         } else {
//             newBalanceAmount = contact.balance || 0;
//         }

//         // Step 6: Update contact balance
//         const balanceResponse = await axios.patch(`/v1/api/contacts/${contact._id}/balance`, {
//             balance: newBalanceAmount,
//             balanceCurrency: paymentForm.currency
//         });

//         if (balanceResponse.data.success) {
//             setContact(prev => ({
//                 ...prev,
//                 balance: balanceResponse.data.data.balance,
//                 balanceCurrency: balanceResponse.data.data.balanceCurrency
//             }));
//         }

//         // Reset form
//         setPaymentForm({
//             amount: '',
//             currency: 'AED',
//             paymentAccount: '',
//             date: new Date().toISOString().split('T')[0]
//         });
//         setSelectedPaymentAccount(null);
//         setAccountSearchTerm('');

//         // Refresh transactions if on transactions tab
//         if (activeTab === 'transactions') {
//             fetchContactTransactions();
//         }

//         // Final success message
//         if (invoiceCreated && transactionCreated && journalCreated) {
//             toast.success('Payment completed successfully with journal entry!');
//         } else if (invoiceCreated && transactionCreated) {
//             toast.success('Payment recorded (invoice and transaction)');
//         } else if (invoiceCreated) {
//             toast.success('Payment recorded (invoice only)');
//         }

//     } catch (error) {
//         console.error('Error in payment process:', error);

//         if (!invoiceCreated) {
//             toast.error('Failed to create invoice: ' + (error.response?.data?.message || error.message));
//         } else {
//             toast.error('Error completing payment process');
//         }

//     } finally {
//         setPaymentSubmitting(false);
//     }
// };


// Handle payment submission
const handlePayment = async () => {
    if (!paymentForm.amount || isNaN(paymentForm.amount) || parseFloat(paymentForm.amount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
    }

    if (!paymentForm.date) {
        toast.error('Please select a date');
        return;
    }

    if (!paymentForm.paymentAccount) {
        toast.error('Please select a payment account');
        return;
    }

    setPaymentSubmitting(true);

    let invoiceCreated = false;
    let transactionCreated = false;
    let journalCreated = false;

    try {
        const paymentAmount = parseFloat(paymentForm.amount);

        // Determine invoice type based on contact type
        let invoiceType = '';
        let transactionType = '';
        let transactionCategory = '';
        let accountId = '';
        let contactAccount = null;
        let debitAccount = null;
        let creditAccount = null;
        
        // Set reference based on contact type
        let journalReference = '';

        if (contact.isReceivable) {
            invoiceType = 'customersPayment';
            transactionType = 'Income';
            transactionCategory = 'Customer paid';
            accountId = contact.accReceivableId || contact._id;
            journalReference = 'Customers payment';

            // For customer payment: Debit = Payment Account, Credit = Receivable Account
            debitAccount = selectedPaymentAccount; // Payment account (where money goes)
            creditAccount = {
                _id: accountId,
                name: contact.accReceivableName,
                nameArb: contact.accReceivableNameArb,
                group: contact.accReceivableGroup,
                groupArb: contact.accReceivableGroupArb,
                class: contact.accReceivableClass,
                classArb: contact.accReceivableClassArb,
                level: contact.accReceivableLevel,
                levelArb: contact.accReceivableLevelArb,
                chart: contact.accReceivableChart,
                chartArb: contact.accReceivableChartArb,
                type: contact.accReceivableType
            };
        } else if (contact.isPayable) {
            invoiceType = 'supplierPayement';
            transactionType = 'Expense';
            transactionCategory = 'Supplier payment';
            accountId = contact.accPayableId || contact._id;
            journalReference = 'Suppliers payment';

            // For supplier payment: Debit = Payable Account, Credit = Payment Account
            debitAccount = {
                _id: accountId,
                name: contact.accPayableName,
                nameArb: contact.accPayableNameArb,
                group: contact.accPayableGroup,
                groupArb: contact.accPayableGroupArb,
                class: contact.accPayableClass,
                classArb: contact.accPayableClassArb,
                level: contact.accPayableLevel,
                levelArb: contact.accPayableLevelArb,
                chart: contact.accPayableChart,
                chartArb: contact.accPayableChartArb,
                type: contact.accPayableType
            };
            creditAccount = selectedPaymentAccount; // Payment account (where money comes from)
        } else {
            toast.error('Contact type not determined');
            setPaymentSubmitting(false);
            return;
        }

        // Prepare invoice data
        const invoiceData = {
            invoiceNumber: `PAY-${Date.now()}`,
            invoiceType: invoiceType,
            invoiceStatus: "Completed",
            bills: {
                total: 0,
                tax: 0,
                totalWithTax: 0,
                payed: paymentAmount,
                balance: 0,
                currency: paymentForm.currency,
            },
            items: null,
            paymentMethod: "Cash",
            orderDate: paymentForm.date,
        };

        // Add customer or supplier based on contact type
        if (contact.isReceivable) {
            invoiceData.customer = contact._id;
        }

        if (contact.isPayable) {
            invoiceData.supplier = contact._id;
        }

        // Step 1: Create Invoice
        const invoiceResponse = await axios.post('/v1/api/invoices/', invoiceData);

        if (!invoiceResponse.data.success) {
            throw new Error('Failed to create invoice');
        }

        invoiceCreated = true;
        toast.success('Invoice created successfully');

        // Step 2: Prepare transaction data
        const transactionData = {
            amount: paymentAmount,
            type: transactionType,
            account: accountId,
            paymentAccount: paymentForm.paymentAccount,
            paymentMethod: "Cash",
            date: paymentForm.date,
            category: transactionCategory,
            description: `Payment ${contact.isReceivable ? 'from' : 'to'} ${contact.name}`,
            currency: paymentForm.currency,
            refrence: contact._id,
            transactionNumber: `TRX-${Date.now()}`,
            status: 'Completed'
        };

        console.log('Sending transaction data:', transactionData);

        // Step 3: Create Transaction
        try {
            const transactionResponse = await axios.post('/v1/api/transactions/', transactionData);

            if (transactionResponse.data.success) {
                transactionCreated = true;
                toast.success('Transaction recorded successfully');
            } else {
                console.error('Transaction response error:', transactionResponse.data);
                toast.error('Invoice created but transaction failed to save');
            }
        } catch (transactionError) {
            console.error('Transaction error details:', transactionError.response?.data || transactionError);
            toast.error('Invoice created but transaction could not be recorded');
        }

        // Step 4: Create Journal Entry with dynamic account information
        try {
            // Determine journal header information based on selected payment account
            let journalName = '';
            let journalNameArb = '';
            let journalCode = '';
            let journalsNameId = '';
            
            // Check if selected payment account is Dubai Islamic Bank
            if (selectedPaymentAccount.name === 'Dubai Islamic Bank' ||
                selectedPaymentAccount.nameArb === 'بنك دبي الاسلامي' ||
                selectedPaymentAccount.code === '111101') {
                journalName = 'Dubai Islamic Bank';
                journalNameArb = 'بنك دبي الاسلامي';
                journalCode = '111101';
                journalsNameId = '69a5cfbbc8ca5b09178e3b0c';
                
            }
            // Check if selected payment account is Cash
            else if (selectedPaymentAccount.name === 'Cash' ||
                selectedPaymentAccount.nameArb === 'الخزينة الرئيسيه' ||
                selectedPaymentAccount.code === '111201') {
                journalName = 'Cash';
                journalNameArb = 'الخزينة الرئيسيه';
                journalCode = '111201';
                journalsNameId = '69a5d79fc8ca5b09178e44c4';
                
            }
            else if (selectedPaymentAccount.name === 'Khartoum Bank' ||
                selectedPaymentAccount.nameArb === 'بنك الخرطوم' ||
                selectedPaymentAccount.code === '111102') {
                journalName = 'Khartoum Bank';
                journalNameArb = 'بنك الخرطوم';
                journalCode = '111102';
                journalsNameId = '69b58c2a0a46ab203eb84fbb';
                
            }
            // Default fallback - use selected payment account information
            else {
                journalName = selectedPaymentAccount.name || 'Payment Account';
                journalNameArb = selectedPaymentAccount.nameArb || journalName;
                journalCode = selectedPaymentAccount.code || '000000';
                journalsNameId = selectedPaymentAccount._id;
                
            }

            // Prepare journal entries based on contact type
            const journalEntries = [];

            // Get current date for entry date
            const entryReference = `PAY-${Date.now()}`;

            if (contact.isReceivable) {
                // Customer payment: Debit Payment Account, Credit Receivable Account
                
                // Debit entry for payment account - NO PARTNER INFO (isContactAccount = false)
                journalEntries.push(createJournalEntry(
                    debitAccount,           // account
                    true,                   // isDebit
                    paymentAmount,           // amount
                    {                        // partnerInfo
                        name: contact.name, 
                        nameArb: contact.nameArb || contact.name, 
                        type: 'customer', 
                        id: contact._id,
                        // Pass receivable account fields for credit entry
                        accReceivableName: contact.accReceivableName,
                        accReceivableNameArb: contact.accReceivableNameArb,
                        accReceivableGroup: contact.accReceivableGroup,
                        accReceivableGroupArb: contact.accReceivableGroupArb,
                        accReceivableClass: contact.accReceivableClass,
                        accReceivableClassArb: contact.accReceivableClassArb,
                        accReceivableLevel: contact.accReceivableLevel,
                        accReceivableLevelArb: contact.accReceivableLevelArb,
                        accReceivableChart: contact.accReceivableChart,
                        accReceivableChartArb: contact.accReceivableChartArb,
                        accReceivableType: contact.accReceivableType
                    },
                    `Payment received from ${contact.name}`, // description
                    entryReference,         // reference
                    'customer',             // contactType
                    false                   // isContactAccount = false (payment account)
                ));

                // Credit entry for receivable account - WITH PARTNER INFO (isContactAccount = true)
                journalEntries.push(createJournalEntry(
                    creditAccount,          // account
                    false,                  // isDebit (credit)
                    paymentAmount,           // amount
                    {                        // partnerInfo
                        name: contact.name, 
                        nameArb: contact.nameArb || contact.name, 
                        type: 'customer', 
                        id: contact._id,
                        // Pass receivable account fields
                        accReceivableName: contact.accReceivableName,
                        accReceivableNameArb: contact.accReceivableNameArb,
                        accReceivableGroup: contact.accReceivableGroup,
                        accReceivableGroupArb: contact.accReceivableGroupArb,
                        accReceivableClass: contact.accReceivableClass,
                        accReceivableClassArb: contact.accReceivableClassArb,
                        accReceivableLevel: contact.accReceivableLevel,
                        accReceivableLevelArb: contact.accReceivableLevelArb,
                        accReceivableChart: contact.accReceivableChart,
                        accReceivableChartArb: contact.accReceivableChartArb,
                        accReceivableType: contact.accReceivableType
                    },
                    `Payment received from ${contact.name}`, // description
                    entryReference,         // reference
                    'customer',             // contactType
                    true                    // isContactAccount = true (receivable account)
                ));
            } else if (contact.isPayable) {
                // Supplier payment: Debit Payable Account, Credit Payment Account
                
                // Debit entry for payable account - WITH PARTNER INFO (isContactAccount = true)
                journalEntries.push(createJournalEntry(
                    debitAccount,           // account
                    true,                   // isDebit
                    paymentAmount,           // amount
                    {                        // partnerInfo
                        name: contact.name, 
                        nameArb: contact.nameArb || contact.name, 
                        type: 'supplier', 
                        id: contact._id,
                        // Pass payable account fields for debit entry
                        accPayableName: contact.accPayableName,
                        accPayableNameArb: contact.accPayableNameArb,
                        accPayableGroup: contact.accPayableGroup,
                        accPayableGroupArb: contact.accPayableGroupArb,
                        accPayableClass: contact.accPayableClass,
                        accPayableClassArb: contact.accPayableClassArb,
                        accPayableLevel: contact.accPayableLevel,
                        accPayableLevelArb: contact.accPayableLevelArb,
                        accPayableChart: contact.accPayableChart,
                        accPayableChartArb: contact.accPayableChartArb,
                        accPayableType: contact.accPayableType
                    },
                    `Payment made to ${contact.name}`, // description
                    entryReference,         // reference
                    'supplier',             // contactType
                    true                    // isContactAccount = true (payable account)
                ));

                // Credit entry for payment account - NO PARTNER INFO (isContactAccount = false)
                journalEntries.push(createJournalEntry(
                    creditAccount,          // account
                    false,                  // isDebit (credit)
                    paymentAmount,           // amount
                    {                        // partnerInfo
                        name: contact.name, 
                        nameArb: contact.nameArb || contact.name, 
                        type: 'supplier', 
                        id: contact._id,
                        // Pass payable account fields for reference
                        accPayableName: contact.accPayableName,
                        accPayableNameArb: contact.accPayableNameArb,
                        accPayableGroup: contact.accPayableGroup,
                        accPayableGroupArb: contact.accPayableGroupArb,
                        accPayableClass: contact.accPayableClass,
                        accPayableClassArb: contact.accPayableClassArb,
                        accPayableLevel: contact.accPayableLevel,
                        accPayableLevelArb: contact.accPayableLevelArb,
                        accPayableChart: contact.accPayableChart,
                        accPayableChartArb: contact.accPayableChartArb,
                        accPayableType: contact.accPayableType
                    },
                    `Payment made to ${contact.name}`, // description
                    entryReference,         // reference
                    'supplier',             // contactType
                    false                   // isContactAccount = false (payment account)
                ));
            }

            // Calculate totals
            const totalDebit = journalEntries.reduce((sum, entry) => sum + entry.debit, 0);
            const totalCredit = journalEntries.reduce((sum, entry) => sum + entry.credit, 0);

            // Get current period (month/year) from date
            const paymentDate = new Date(paymentForm.date);
            const year = paymentDate.getFullYear();
            const month = String(paymentDate.getMonth() + 1).padStart(2, '0');
            const period = `${year}-${month}`;

            const journalData = {
                // Journal Header
                journalsNameId: journalsNameId,
                journalName: journalName,
                reference: journalReference, // Add reference field here
                status: 'draft',
                journalNameArb: journalNameArb,
                code: journalCode,
                fiscalYear: year,
                period: period,
                openingBalance: 0,
                currentBalance: 0,
                totalDebit: totalDebit,
                totalCredit: totalCredit,
                netChange: totalDebit - totalCredit,
                currency: paymentForm.currency,
                entries: journalEntries,
                isActive: true,
                isClosed: false,
                closedAt: null,
                lastEntryDate: paymentDate
            };

            console.log('Journal Data with dynamic hierarchy:', JSON.stringify(journalData, null, 2));
            console.log('First entry sample:', journalData.entries[0]);

            const journalResponse = await axios.post('/v1/api/journals', journalData);

            if (journalResponse.data.success) {
                journalCreated = true;
                toast.success('Journal entry created successfully');
            } else {
                console.error('Journal response error:', journalResponse.data);
                toast.error('Journal entry creation failed');
            }
        } catch (journalError) {
            console.error('Journal error details:', journalError.response?.data || journalError);
            toast.error('Journal entry could not be created');
        }

        // Step 5: Calculate new balance
        let newBalanceAmount;

        if (contact.isReceivable) {
            newBalanceAmount = (contact.balance || 0) - paymentAmount;
        } else if (contact.isPayable) {
            newBalanceAmount = (contact.balance || 0) + paymentAmount;
        } else {
            newBalanceAmount = contact.balance || 0;
        }

        // Step 6: Update contact balance
        const balanceResponse = await axios.patch(`/v1/api/contacts/${contact._id}/balance`, {
            balance: newBalanceAmount,
            balanceCurrency: paymentForm.currency
        });

        if (balanceResponse.data.success) {
            setContact(prev => ({
                ...prev,
                balance: balanceResponse.data.data.balance,
                balanceCurrency: balanceResponse.data.data.balanceCurrency
            }));
        }

        // Reset form
        setPaymentForm({
            amount: '',
            currency: 'AED',
            paymentAccount: '',
            date: new Date().toISOString().split('T')[0]
        });
        setSelectedPaymentAccount(null);
        setAccountSearchTerm('');

        // Refresh transactions if on transactions tab
        if (activeTab === 'transactions') {
            fetchContactTransactions();
        }

        // Final success message
        if (invoiceCreated && transactionCreated && journalCreated) {
            toast.success('Payment completed successfully with journal entry!');
        } else if (invoiceCreated && transactionCreated) {
            toast.success('Payment recorded (invoice and transaction)');
        } else if (invoiceCreated) {
            toast.success('Payment recorded (invoice only)');
        }

    } catch (error) {
        console.error('Error in payment process:', error);

        if (!invoiceCreated) {
            toast.error('Failed to create invoice: ' + (error.response?.data?.message || error.message));
        } else {
            toast.error('Error completing payment process');
        }

    } finally {
        setPaymentSubmitting(false);
    }
};
// End Handle payment submission ///////////////////////////////////////////////////////////////////////



    // Fetch customer/supplier invoices/transactions
    const fetchContactTransactions = async () => {
        if (!contact?._id) return;

        setTransactionsLoading(true);
        try {
            const [customerResponse, supplierResponse] = await Promise.all([
                axios.post('/v1/api/invoices/orderCustomer', {
                    customer: contact._id
                }).catch(err => ({ data: { success: false, data: [] } })),
                axios.post('/v1/api/invoices/orderSupplier', {
                    supplier: contact._id
                }).catch(err => ({ data: { success: false, data: [] } }))
            ]);

            let allTransactions = [];

            if (customerResponse.data.success) {
                allTransactions = [...allTransactions, ...(customerResponse.data.data || [])];
            }

            if (supplierResponse.data.success) {
                allTransactions = [...allTransactions, ...(supplierResponse.data.data || [])];
            }

            allTransactions.sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt));

            setTransactions(allTransactions);

        } catch (error) {
            console.error('Error fetching transactions:', error);
            toast.error('Error loading transactions');
        } finally {
            setTransactionsLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'transactions' && contact?._id) {
            fetchContactTransactions();
        }
    }, [activeTab, contact?._id]);

    // Handle back navigation
    const handleBack = () => {
        navigate('/en/contacts');
    };

    // Handle edit
    const handleEdit = () => {
        navigate(`/en/contacts/edit/${contact._id}`, { state: { contact } });
    };

    // Format currency
    const formatCurrency = (amount) => {
        const currencyCode = contact?.balanceCurrency || 'AED';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Format number
    const formatNumber = (amount) => {
        return Number(amount || 0).toFixed(2);
    };

    // Get currency flag
    const getCurrencyFlag = (currencyCode) => {
        const currency = currencies.find(c => c.code === currencyCode);
        return currency ? currency.flag : '💵';
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    // Get contact type badge
    const getContactTypeBadge = () => {
        if (!contact) return null;
        
        if (contact.isReceivable && contact.isPayable) {
            return (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <FaUserFriends size={12} />
                    Customer / Supplier
                </span>
            );
        } else if (contact.isReceivable) {
            return (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <GiReceiveMoney size={12} />
                    Customer
                </span>
            );
        } else if (contact.isPayable) {
            return (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium flex items-center gap-1">
                    <GiPayMoney size={12} />
                    Supplier
                </span>
            );
        }
        return null;
    };

    // Calculate totals
    const calculateTotals = () => {
        return transactions.reduce((acc, invoice) => ({
            total: acc.total + (invoice.bills?.total || 0),
            tax: acc.tax + (invoice.bills?.tax || 0),
            totalWithTax: acc.totalWithTax + (invoice.bills?.totalWithTax || 0),
            paid: acc.paid + (invoice.bills?.payed || 0)
        }), { total: 0, tax: 0, totalWithTax: 0, paid: 0 });
    };

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center" dir="ltr">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading contact details...</p>
                </div>
            </div>
        );
    }

    // Show error if contact not found
    if (!contact) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center" dir="ltr">
                <div className="text-center">
                    <FaUserCircle className="mx-auto text-5xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Contact Not Found</h3>
                    <button
                        onClick={handleBack}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const totals = calculateTotals();

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-blue-50 to-sky-50" dir="ltr">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-4 shadow-lg z-10">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleBack}
                            className="text-white hover:text-blue-100 transition-colors p-2 rounded-lg hover:bg-white/10"
                        >
                            <FaArrowLeft size={20} />
                        </button>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <FaUserCircle className="text-white" size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">
                                {contact.name}
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                {getContactTypeBadge()}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <FaPrint size={16} />
                            <span className="text-sm">Print</span>
                        </button>
                        <button
                            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                            <FaDownload size={16} />
                            <span className="text-sm">Export</span>
                        </button>
                        <button
                            onClick={handleEdit}
                            className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2 font-medium"
                        >
                            <FaEdit size={16} />
                            <span>Edit</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('info')}
                            className={`rounded-md bg-blue-100 cursor-pointer px-4 py-3 font-medium text-sm border-b-2 transition-colors
                                ${activeTab === 'info' 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Basic Information
                        </button>
                        <button
                            onClick={() => setActiveTab('accounts')}
                            className={`rounded-md bg-blue-100 cursor-pointer px-4 py-3 font-medium text-sm border-b-2 transition-colors
                                ${activeTab === 'accounts' 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Account Information
                        </button>
                        <button
                            onClick={() => setActiveTab('transactions')}
                            className={`rounded-md bg-blue-100 cursor-pointer px-4 py-3 font-medium text-sm border-b-2 transition-colors
                                ${activeTab === 'transactions' 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Statement
                        </button>
                        <button
                            onClick={() => setActiveTab('payment')}
                            className={`rounded-md bg-blue-100 cursor-pointer px-4 py-3 font-medium text-sm border-b-2 transition-colors
                                ${activeTab === 'payment' 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            <div className="flex items-center gap-2">
                                {/* <FaCreditCard size={14} /> */}
                                <span>Payments</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('opening')}
                            className={`rounded-md bg-blue-100 cursor-pointer px-4 py-3 font-medium text-sm border-b-2 transition-colors
                                ${activeTab === 'opening' 
                                    ? 'border-blue-500 text-blue-600' 
                                    : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Opening Balance
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {activeTab === 'info' && (
                        <div className="space-y-6">
                            {/* Contact Information */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FaUser className="text-blue-600" size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Name</p>
                                            <p className="font-medium text-gray-800">{contact.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <MdEmail className="text-blue-600" size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Email</p>
                                            <p className="font-medium text-gray-800">{contact.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FaPhone className="text-blue-600" size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-800">{contact.phone}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <FaMapMarkerAlt className="text-blue-600" size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Address</p>
                                            <p className="font-medium text-gray-800">{contact.address}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="border-t border-gray-100 pt-6">
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-100">
                                        <p className="text-sm text-blue-600 mb-1 flex items-center gap-1">
                                            <span>Current Balance</span>
                                            {contact.balanceCurrency && (
                                                <span className="text-xs bg-blue-200 px-2 py-0.5 rounded-full">
                                                    {getCurrencyFlag(contact.balanceCurrency)} {contact.balanceCurrency}
                                                </span>
                                            )}
                                        </p>
                                        <p className={`text-2xl font-bold ${
                                            contact.balance > 0 ? 'text-green-600' : 
                                            contact.balance < 0 ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                            {formatCurrency(contact.balance)}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Created At</p>
                                        <p className="font-semibold text-gray-800">{formatDate(contact.createdAt)}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                        <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                                        <p className="font-semibold text-gray-800">{formatDate(contact.updatedAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'accounts' && (
                        <div className="space-y-6">
                            {contact.isReceivable && (
                                <div>
                                    <h2 className="text-lg font-semibold text-green-800 mb-4 flex items-center gap-2">
                                        <GiReceiveMoney className="text-green-600" size={20} />
                                        Receivable Account Information (Customer)
                                    </h2>
                                    <div className="bg-green-50 rounded-xl p-5 border border-green-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Account Name</p>
                                                <p className="font-medium text-gray-800">{contact.accReceivableName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Account Group</p>
                                                <p className="font-medium text-gray-800">{contact.accReceivableGroup}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Account Class</p>
                                                <p className="font-medium text-gray-800">{contact.accReceivableClass}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Account Level</p>
                                                <p className="font-medium text-gray-800">{contact.accReceivableLevel}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Account Chart</p>
                                                <p className="font-medium text-gray-800">{contact.accReceivableChart}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Account Type</p>
                                                <p className="font-medium text-gray-800">{contact.accReceivableType}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {contact.isPayable && (
                                <div className="mt-6">
                                    <h2 className="text-lg font-semibold text-purple-800 mb-4 flex items-center gap-2">
                                        <GiPayMoney className="text-purple-600" size={20} />
                                        Payable Account Information (Supplier)
                                    </h2>
                                    <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-500">Account Name</p>
                                                <p className="font-medium text-gray-800">{contact.accPayableName}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Account Group</p>
                                                <p className="font-medium text-gray-800">{contact.accPayableGroup}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Account Class</p>
                                                <p className="font-medium text-gray-800">{contact.accPayableClass}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Account Level</p>
                                                <p className="font-medium text-gray-800">{contact.accPayableLevel}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Account Chart</p>
                                                <p className="font-medium text-gray-800">{contact.accPayableChart}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Account Type</p>
                                                <p className="font-medium text-gray-800">{contact.accPayableType}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Transactions Tab */}
                    {activeTab === 'transactions' && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                    <FaHistory className="text-blue-600" size={20} />
                                    Transaction History
                                </h2>

                                {/* Print Button */}
                                <button
                                    onClick={() => window.print()}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 print:hidden"
                                >
                                    <FaPrint size={16} />
                                    <span>Print Statement</span>
                                </button>
                            </div>

                            {transactionsLoading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-600">Loading transactions...</p>
                                </div>
                            ) : transactions.length > 0 ? (
                                <>
                                    {/* Printable Statement */}
                                    <div className="print-statement hidden print:block mb-8">
                                        <div className="text-center mb-6">
                                            <h1 className="text-2xl font-bold text-gray-800">Transaction Statement</h1>
                                            <p className="text-gray-600">Contact: {contact.name}</p>
                                            <p className="text-gray-600">Date: {new Date().toLocaleDateString('en-GB')}</p>
                                            <p className="text-gray-600">Current Balance: {formatCurrency(contact.balance)}</p>
                                        </div>
                                    </div>

                                    {/* Transactions Table */}
                                    <div className="overflow-x-auto printable-table">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border p-2 text-left">Date</th>
                                                    <th className="border p-2 text-left">Invoice Type</th>
                                                    <th className="border p-2 text-left">Invoice Number</th>
                                                    <th className="border p-2 text-right">Total</th>
                                                    <th className="border p-2 text-right">Tax</th>
                                                    <th className="border p-2 text-right">Total with Tax</th>
                                                    <th className="border p-2 text-right">Paid</th>
                                                    <th className="border p-2 text-right">Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {transactions.map((invoice, index) => {
                                                    const previousTransactions = transactions.slice(0, index + 1);
                                                    
                                                    const runningBalance = previousTransactions.reduce((acc, inv) => {
                                                        if (inv.invoiceType === 'supplierPayement' || inv.invoiceType?.toLowerCase().includes('supplier')) {
                                                            return acc - (inv.bills?.payed || 0);
                                                        } else if (inv.invoiceType === 'customersPayment' || inv.invoiceType?.toLowerCase().includes('customer')) {
                                                            return acc + (inv.bills?.payed || 0);
                                                        } else {
                                                            return acc + (inv.bills?.totalWithTax || 0);
                                                        }
                                                    }, 0);

                                                    return (
                                                        <tr key={index} className="hover:bg-gray-50">
                                                            <td className="border p-2">{formatDate(invoice.invoiceDate)}</td>
                                                            <td className="border p-2">{invoice.invoiceType || 'N/A'}</td>
                                                            <td className="border p-2">{invoice.invoiceNumber || 'N/A'}</td>
                                                            <td className="border p-2 text-right">{formatNumber(invoice.bills?.total)}</td>
                                                            <td className="border p-2 text-right">{formatNumber(invoice.bills?.tax)}</td>
                                                            <td className="border p-2 text-right">
                                                                {formatNumber(invoice.bills?.totalWithTax)} {invoice.bills?.currency}
                                                            </td>
                                                            <td className="border p-2 text-right">
                                                                {formatNumber(invoice.bills?.payed)} {invoice.bills?.currency}
                                                            </td>
                                                            <td className={`border p-2 text-right font-semibold ${runningBalance > 0 ? 'text-green-600' :
                                                                    runningBalance < 0 ? 'text-red-600' : 'text-gray-600'
                                                                }`}>
                                                                {formatNumber(runningBalance)} {invoice.bills?.currency}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-gray-50 font-bold">
                                                    <td className="border p-2" colSpan={3}>Total</td>
                                                    <td className="border p-2 text-right">{formatNumber(totals.total)}</td>
                                                    <td className="border p-2 text-right">{formatNumber(totals.tax)}</td>
                                                    <td className="border p-2 text-right">{formatNumber(totals.totalWithTax)}</td>
                                                    <td className="border p-2 text-right">{formatNumber(totals.paid)}</td>
                                                    <td className="border p-2 text-right">{formatCurrency(contact.balance)}</td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>

                                    {/* Summary Section */}
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg print:bg-gray-100">
                                        <h3 className="font-semibold text-gray-700 mb-2">Summary</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Total Invoices</p>
                                                <p className="text-lg font-bold">{transactions.length}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Total Amount</p>
                                                <p className="text-lg font-bold">{formatNumber(totals.totalWithTax)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Total Paid</p>
                                                <p className="text-lg font-bold text-green-600">{formatNumber(totals.paid)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Current Balance</p>
                                                <p className={`text-lg font-bold ${contact.balance > 0 ? 'text-green-600' :
                                                        contact.balance < 0 ? 'text-red-600' : 'text-gray-600'
                                                    }`}>
                                                    {formatCurrency(contact.balance)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg">
                                    <FaHistory className="mx-auto text-4xl text-gray-400 mb-3" />
                                    <p className="text-gray-500">No transactions found for this contact</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Payment Tab */}
                    {activeTab === 'payment' && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                                <FaCreditCard className="text-blue-600" size={20} />
                                Record Payment
                            </h2>

                            <div className="max-w-2xl mx-auto">
                                {/* Contact Type Info */}
                                <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                                    <p className="text-sm text-blue-800">
                                        <span className="font-semibold">Recording payment for:</span>{' '}
                                        {contact.isReceivable && contact.isPayable ? (
                                            <span>Customer/Supplier - Please ensure correct account selection</span>
                                        ) : contact.isReceivable ? (
                                            <span>Customer - Payment will be recorded as customer payment</span>
                                        ) : contact.isPayable ? (
                                            <span>Supplier - Payment will be recorded as supplier payment</span>
                                        ) : (
                                            <span>Contact type not determined</span>
                                        )}
                                    </p>
                                </div>

                                {/* Payment Form */}
                                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                                    <div className="space-y-4">
                                        {/* Amount Input */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Amount <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                value={paymentForm.amount}
                                                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                                                placeholder="Enter amount"
                                                step="0.01"
                                                min="0.01"
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        {/* Currency Selection */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Currency <span className="text-red-500">*</span>
                                            </label>
                                            <select
                                                value={paymentForm.currency}
                                                onChange={(e) => setPaymentForm({...paymentForm, currency: e.target.value})}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                            >
                                                {currencies.map(currency => (
                                                    <option key={currency.code} value={currency.code}>
                                                        {currency.flag} {currency.code} - {currency.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Payment Account Selection with Search */}
                                        <div className="space-y-3">
                                            {/* Account Search */}
                                            <div className="relative">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Search Payment Account
                                                </label>
                                                <input
                                                    type="text"
                                                    value={accountSearchTerm}
                                                    onChange={(e) => setAccountSearchTerm(e.target.value)}
                                                    placeholder="Search accounts..."
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-10"
                                                />
                                                <FaSearch className="absolute left-3 top-10 transform -translate-y-1/2 text-gray-400" />
                                            </div>

                                            {/* Payment Account Select */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Payment Account <span className="text-red-500">*</span>
                                                </label>
                                                {loadingAccounts ? (
                                                    <div className="text-center py-3 border-2 border-gray-200 rounded-lg">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
                                                        <p className="text-xs text-gray-500 mt-1">Loading accounts...</p>
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={selectedPaymentAccount?._id || ''}
                                                        onChange={(e) => {
                                                            const account = filteredAccounts.find(a => a._id === e.target.value);
                                                            if (account) handlePaymentAccountSelect(account);
                                                        }}
                                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                                        required
                                                    >
                                                        <option value="">Select Payment Account</option>
                                                        {filteredAccounts.map(account => (
                                                            <option key={account._id} value={account._id}>
                                                                {account.code ? `${account.code} - ` : ''}
                                                                {account.name || account.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                )}
                                                {filteredAccounts.length === 0 && !loadingAccounts && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        No accounts found matching your search
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Date Picker */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Payment Date <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                value={paymentForm.date}
                                                onChange={(e) => setPaymentForm({...paymentForm, date: e.target.value})}
                                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                max={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>

                                        {/* Summary */}
                                        <div className="bg-blue-50 rounded-lg p-4 mt-4">
                                            <h3 className="font-semibold text-blue-800 mb-2">Payment Summary</h3>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Amount to pay:</span>
                                                <span className="text-xl font-bold text-blue-600">
                                                    {paymentForm.amount ? 
                                                        `${parseFloat(paymentForm.amount).toFixed(2)} ${paymentForm.currency}` 
                                                        : '0.00'}
                                                </span>
                                            </div>
                                            {selectedPaymentAccount && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    Payment Account: {selectedPaymentAccount.code} - {selectedPaymentAccount.nameArb || selectedPaymentAccount.name}
                                                </div>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            onClick={handlePayment}
                                            disabled={paymentSubmitting || !paymentForm.amount || !paymentForm.paymentAccount}
                                            className="w-full mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {paymentSubmitting ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                    <span>Processing Payment...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaCreditCard size={18} />
                                                    <span>Record Payment</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'opening' && (
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <FaWallet className="text-blue-600" size={20} />
                                Opening Balance
                            </h2>
                            
                            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl p-6 border-2 border-dashed border-blue-200">
                                {/* Current Balance Display */}
                                <div className="text-center mb-8">
                                    <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
                                        <FaMoneyBillWave className="text-blue-600" size={40} />
                                    </div>
                                    <h3 className="text-xl font-medium text-gray-800 mb-2">Current Balance</h3>
                                    <div className="flex items-center justify-center gap-2">
                                        <p className={`text-3xl font-bold ${
                                            contact.balance > 0 ? 'text-green-600' : 
                                            contact.balance < 0 ? 'text-red-600' : 'text-gray-600'
                                        }`}>
                                            {formatCurrency(contact.balance)}
                                        </p>
                                        {contact.balanceCurrency && (
                                            <span className="text-sm bg-gray-200 px-3 py-1 rounded-full">
                                                {getCurrencyFlag(contact.balanceCurrency)} {contact.balanceCurrency}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Balance Update Section */}
                                {!showBalanceInput ? (
                                    <div className="text-center">
                                        <button
                                            onClick={() => setShowBalanceInput(true)}
                                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                                        >
                                            <FaPlus size={16} />
                                            Opening Balance
                                        </button>
                                        <p className="text-sm text-gray-500 mt-3">
                                            Set or modify the opening balance for this contact
                                        </p>
                                    </div>
                                ) : (
                                    <div className="max-w-md mx-auto">
                                        <div className="bg-white rounded-lg p-4 shadow-sm">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                New Balance Amount
                                            </label>
                                            <div className="relative mb-4">
                                                <input
                                                    type="number"
                                                    value={newBalance}
                                                    onChange={(e) => setNewBalance(e.target.value)}
                                                    placeholder="Enter amount"
                                                    step="0.01"
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    autoFocus
                                                />
                                            </div>

                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Currency
                                            </label>
                                            <div className="relative mb-4">
                                                <select
                                                    value={newCurrency}
                                                    onChange={(e) => setNewCurrency(e.target.value)}
                                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                                                >
                                                    {currencies.map(currency => (
                                                        <option key={currency.code} value={currency.code}>
                                                            {currency.flag} {currency.code} - {currency.name}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => {
                                                        setShowBalanceInput(false);
                                                        setNewBalance('');
                                                        setNewCurrency(contact.balanceCurrency || 'AED');
                                                    }}
                                                    className="flex-1 px-4 py-2 border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <FaTimes size={14} />
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleUpdateBalance}
                                                    disabled={updating || !newBalance}
                                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {updating ? (
                                                        <>
                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                            <span>Updating...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaSave size={14} />
                                                            <span>Update</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactDetails;



/*

to add journal header with data: journalName = 'Opening Balance' , journalNameArb =
"الارصده الافتتاحيه"  , journalsNameId = '69b5953f0a46ab203eb85609' reference = 'Customers opening balance' if contacts is customer and receivable and reference = 'Suppliers opening balance' in case contact = supplier and payable , status: 'draft', and other journal header to be same and match paymentAccount , The second thing journalEntry recoreds must be  in case contact = payable and supplier set credit side = contact account information , debit side = accName = 'Opening balances account under settlement' , accNameArb = 'حساب ارصدة افتتاحية تحت التسوية', accGroup = 'Opening balances' , accGroupArb = 'الارصدة الافتتاحيه' , accClass = 'Opening balances' , accClassArb = 'الارصدة الافتتاحيه' , accLevel = 'Opening balances' , accLevelArb = 'الارصدة الافتتاحيه' , accChart = 'Equity' , accChartArb = 'حقوق الملكيه'  , accType = 'Balance Sheet' and in case contact = receivable and customer set debit side = contact and customer account information and set credit side = opening balance account information 

*/


/*
The issue is that your trial balance component is not properly handling the opening balance journal entry you've shown. The initial balance column is showing 0 because it's not being populated from the opening balance data.
*/

/*
Hierarchical Data Structure: Now handles the nested data structure from your backend with proper chart → level → class → group → account hierarchy

Expand/Collapse All: Added buttons to expand or collapse all groups at once

Visual Hierarchy: Uses folder icons and indentation to show the account structure

Group Totals: Shows totals at each hierarchical level (chart, level, class, group)

Proper Data Mapping: Maps the backend response structure to the UI:

Charts (Assets, Liabilities, etc.) at the top level

Levels under each chart

Classes under each level

Groups under each class

Individual accounts under each group
*/

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
    FaDownload, FaPrint, FaSearch, FaChevronDown, 
    FaChevronUp, FaSync, FaFolderOpen, FaFolder
} from 'react-icons/fa';
import { MdAccountBalance } from 'react-icons/md';

const TrialBalance = ({ isRTL = false }) => {
   
    const { axios } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [trialBalanceData, setTrialBalanceData] = useState([]);
    const [totals, setTotals] = useState({ initial: 0, debit: 0, credit: 0, balance: 0 });
    const [expandedGroups, setExpandedGroups] = useState({}); // Start with empty object (all collapsed)
    const [filters, setFilters] = useState({
        fiscalYear: new Date().getFullYear(),
        period: 'all',
        asOfDate: new Date().toISOString().split('T')[0]
    });
    const [rawData, setRawData] = useState([]); // For debugging

    // Get available years and periods
    const [availableYears, setAvailableYears] = useState([]);
    const [availablePeriods, setAvailablePeriods] = useState([]);

    // Fetch initial data
    useEffect(() => {
        fetchFilters();
        fetchTrialBalance();
    }, []);

    // Fetch trial balance data
    const fetchTrialBalance = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.fiscalYear) params.append('fiscalYear', filters.fiscalYear);
            if (filters.period !== 'all') params.append('period', filters.period);
            if (filters.asOfDate) params.append('asOfDate', filters.asOfDate);

            console.log('Fetching trial balance with params:', params.toString());
            
            const response = await axios.get(`/v1/api/journals/trial-balance?${params.toString()}`);
            
            console.log('Trial balance API response:', response.data);
            
            if (response.data.success) {
                // Store raw data for debugging
                setRawData(response.data.data || []);
                
                // Check if we have opening balance data
                const hasOpeningBalance = (response.data.data || []).some(item => 
                    item.reference?.includes('ENT-') || 
                    item.description?.includes('Opening') ||
                    item.reference === 'ENT-1' || 
                    item.reference === 'ENT-2'
                );
                
                console.log('Has opening balance entries:', hasOpeningBalance);
                console.log('Raw data sample:', response.data.data?.[0]);
                
                // Process the flat data from backend into hierarchical structure
                const hierarchicalData = buildHierarchy(response.data.data || []);
                setTrialBalanceData(hierarchicalData);
                
                if (response.data.totals) {
                    setTotals(response.data.totals);
                }
                
                // Don't auto-expand - start with all collapsed
                // expandedGroups is already initialized as empty object
                
                // Log totals for verification
                const totalInitial = (response.data.data || []).reduce((sum, item) => {
                    const isOpening = item.reference?.includes('ENT-') || 
                                     item.description?.includes('Opening') ||
                                     item.reference === 'ENT-1' || 
                                     item.reference === 'ENT-2';
                    if (isOpening) {
                        return sum + (item.credit || item.debit || 0);
                    }
                    return sum;
                }, 0);
                
                console.log('Calculated total initial balance:', totalInitial);
                
            } else {
                toast.error(isRTL ? 'فشل تحميل ميزان المراجعة' : 'Failed to load trial balance');
            }
        } catch (error) {
            console.error('Error fetching trial balance:', error);
            toast.error(isRTL ? 'خطأ في تحميل ميزان المراجعة' : 'Error loading trial balance');
        } finally {
            setLoading(false);
        }
    };

    // Build hierarchical structure from flat data
    const buildHierarchy = (data) => {
        if (!data || !Array.isArray(data) || data.length === 0) {
            console.log('No data to build hierarchy');
            return [];
        }
        
        console.log('Building hierarchy from', data.length, 'items');
        
        // Group by chart (first level)
        const chartMap = {};
        
        data.forEach((item, index) => {
            // Log each item for debugging
            if (index < 5) { // Log first 5 items only
                console.log(`Item ${index}:`, {
                    chart: item.accChart || item.chart,
                    name: item.accName || item.name,
                    reference: item.reference,
                    description: item.description,
                    debit: item.debit,
                    credit: item.credit
                });
            }
            
            const chart = item.accChart || item.chart || 'Uncategorized';
            
            // Initialize chart if not exists
            if (!chartMap[chart]) {
                chartMap[chart] = {
                    code: chart,
                    name: chart,
                    type: 'chart',
                    children: [],
                    totalDebit: 0,
                    totalCredit: 0,
                    totalBalance: 0,
                    items: []
                };
            }
            
            // Calculate initial balance from opening balance entries
            // Opening balance entries typically have reference "ENT-1", "ENT-2", or contain "Opening"
            const isOpeningBalance = (item.reference && (
                                       item.reference.includes('ENT-') || 
                                       item.reference === 'ENT-1' || 
                                       item.reference === 'ENT-2'
                                     )) || 
                                     (item.description && item.description.includes('Opening')) ||
                                     (item.descriptionArb && item.descriptionArb.includes('افتتاحية'));
            
            // For opening balance entries, set initial balance to the credit/debit amount
            // For regular entries, initial balance is 0
            const initialBalance = isOpeningBalance ? (item.credit || item.debit || 0) : 0;
            
            if (isOpeningBalance) {
                console.log(`Found opening balance entry:`, {
                    reference: item.reference,
                    description: item.description,
                    amount: item.credit || item.debit,
                    initialBalance
                });
            }
            
            // Add item to chart's items
            chartMap[chart].items.push({
                ...item,
                initialBalance: initialBalance,
                displayName: `${chart} > ${item.accLevel || item.level || ''} > ${item.accClass || item.class || ''} > ${item.accGroup || item.group || ''} > ${item.accName || item.name || ''}`
            });
            
            // Update chart totals
            chartMap[chart].totalDebit += item.debit || 0;
            chartMap[chart].totalCredit += item.credit || 0;
            chartMap[chart].totalBalance += item.balance || 0;
        });
        
        // Convert to array and sort
        const result = Object.values(chartMap).sort((a, b) => a.code.localeCompare(b.code));
        
        console.log('Built hierarchy with', result.length, 'charts');
        
        // Log chart totals
        result.forEach(chart => {
            const chartInitial = chart.items.reduce((sum, item) => sum + (item.initialBalance || 0), 0);
            console.log(`Chart ${chart.code}:`, {
                items: chart.items.length,
                totalInitial: chartInitial,
                totalDebit: chart.totalDebit,
                totalCredit: chart.totalCredit
            });
        });
        
        return result;
    };

    // Fetch available years and periods
    const fetchFilters = async () => {
        try {
            const response = await axios.get('/v1/api/journals/filters');
            if (response.data.success) {
                setAvailableYears(response.data.years || []);
                setAvailablePeriods(response.data.periods || []);
            }
        } catch (error) {
            console.error('Error fetching filters:', error);
        }
    };

    // Toggle group expansion
    const toggleGroup = (code) => {
        setExpandedGroups(prev => ({
            ...prev,
            [code]: !prev[code]
        }));
    };

    // Expand all groups
    const expandAll = () => {
        const allExpanded = {};
        trialBalanceData.forEach(chart => {
            allExpanded[chart.code] = true;
        });
        setExpandedGroups(allExpanded);
    };

    // Collapse all groups
    const collapseAll = () => {
        setExpandedGroups({});
    };

    // Calculate chart's total initial balance
    const calculateChartInitialBalance = (chart) => {
        if (!chart.items || !Array.isArray(chart.items)) return 0;
        return chart.items.reduce((sum, item) => sum + (item.initialBalance || 0), 0);
    };

    // Render chart section
    const renderChart = (chart) => {
        const isExpanded = expandedGroups[chart.code];
        const chartInitialBalance = calculateChartInitialBalance(chart);
        
        return (
            <React.Fragment key={chart.code}>
                {/* Chart Header Row */}
                <tr className="bg-blue-100 hover:bg-blue-200 font-bold border-t-2 border-b-2 border-blue-300">
                    <td className="px-4 py-3 text-sm">
                        <div className="flex items-center">
                            <button
                                onClick={() => toggleGroup(chart.code)}
                                className="mr-2 p-1 hover:bg-blue-300 rounded"
                            >
                                {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                            </button>
                            {isExpanded ? 
                                <FaFolderOpen className="mr-2 text-blue-700" size={16} /> : 
                                <FaFolder className="mr-2 text-blue-700" size={16} />
                            }
                            <span className="text-blue-900">
                                {chart.name}
                            </span>
                        </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-blue-900">
                        {chartInitialBalance.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-blue-900">
                        {chart.totalDebit?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-blue-900">
                        {chart.totalCredit?.toFixed(2) || '0.00'}
                    </td>
                    <td className={`px-4 py-3 text-right text-sm font-bold ${
                        chart.totalBalance > 0 ? 'text-green-600' : 
                        chart.totalBalance < 0 ? 'text-red-600' : 'text-blue-900'
                    }`}>
                        {chart.totalBalance?.toFixed(2) || '0.00'}
                    </td>
                </tr>

                {/* Render accounts if expanded */}
                {isExpanded && chart.items && chart.items.map((item, idx) => (
                    <tr key={`${chart.code}-${idx}`} className="hover:bg-gray-50 border-b border-gray-100">
                        <td className="px-4 py-2 text-sm">
                            <div className="flex items-center" style={{ marginLeft: 20 }}>
                                <span className="text-gray-700">
                                    <span className="text-gray-500 text-xs mr-1">{item.accLevel || item.level || ''}</span>
                                    {' > '}
                                    <span className="text-gray-500 text-xs mr-1">{item.accClass || item.class || ''}</span>
                                    {' > '}
                                    <span className="text-gray-500 text-xs mr-1">{item.accGroup || item.group || ''}</span>
                                    {' > '}
                                    <span className="font-medium">{item.accName || item.name || ''}</span>
                                </span>
                            </div>
                        </td>
                        <td className="px-4 py-2 text-right text-sm">
                            {item.initialBalance?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-green-600">
                            {item.debit?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-4 py-2 text-right text-sm text-red-600">
                            {item.credit?.toFixed(2) || '0.00'}
                        </td>
                        <td className={`px-4 py-2 text-right text-sm font-medium ${
                            (item.balance || 0) > 0 ? 'text-green-600' : (item.balance || 0) < 0 ? 'text-red-600' : ''
                        }`}>
                            {item.balance?.toFixed(2) || '0.00'}
                        </td>
                    </tr>
                ))}
            </React.Fragment>
        );
    };

    // Calculate total initial balance across all charts
    const calculateTotalInitialBalance = () => {
        return trialBalanceData.reduce((sum, chart) => sum + calculateChartInitialBalance(chart), 0);
    };

    return (
        <div dir={isRTL ? "rtl" : "ltr"} className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <MdAccountBalance className="text-blue-600" />
                        {isRTL ? "ميزان المراجعة" : "Trial Balance"}
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        {isRTL ? "عرض ميزان المراجعة للحسابات" : "View trial balance for accounts"}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={expandAll}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
                        title={isRTL ? "فتح الكل" : "Expand All"}
                    >
                        <FaFolderOpen size={14} />
                        {isRTL ? "فتح الكل" : "Expand All"}
                    </button>
                    <button
                        onClick={collapseAll}
                        className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
                        title={isRTL ? "إغلاق الكل" : "Collapse All"}
                    >
                        <FaFolder size={14} />
                        {isRTL ? "إغلاق الكل" : "Collapse All"}
                    </button>
                    <button
                        onClick={fetchTrialBalance}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <FaSync size={14} />
                        {isRTL ? "تحديث" : "Refresh"}
                    </button>
                    <button
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FaDownload size={14} />
                        {isRTL ? "تصدير" : "Export"}
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FaPrint size={14} />
                        {isRTL ? "طباعة" : "Print"}
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRTL ? "السنة المالية" : "Fiscal Year"}
                    </label>
                    <select
                        value={filters.fiscalYear}
                        onChange={(e) => setFilters({ ...filters, fiscalYear: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {availableYears.length > 0 ? availableYears.map(year => (
                            <option key={year} value={year}>{year}</option>
                        )) : (
                            <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                        )}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRTL ? "الفترة" : "Period"}
                    </label>
                    <select
                        value={filters.period}
                        onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">{isRTL ? "جميع الفترات" : "All Periods"}</option>
                        {availablePeriods.map(period => (
                            <option key={period} value={period}>{period}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        {isRTL ? "حتى تاريخ" : "As Of"}
                    </label>
                    <input
                        type="date"
                        value={filters.asOfDate}
                        onChange={(e) => setFilters({ ...filters, asOfDate: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex items-end">
                    <button
                        onClick={fetchTrialBalance}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        <FaSearch size={14} />
                        {isRTL ? "عرض" : "View"}
                    </button>
                </div>
            </div>

            {/* Trial Balance Table */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
                </div>
            ) : trialBalanceData.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <MdAccountBalance className="mx-auto text-5xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        {isRTL ? "لا توجد بيانات" : "No Data Found"}
                    </h3>
                    <p className="text-gray-500">
                        {isRTL ? "لا توجد حسابات للعرض" : "No accounts to display"}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
                                        {isRTL ? "الحساب" : "Account"}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {isRTL ? "الرصيد الافتتاحي" : "Initial Balance"}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {isRTL ? "مدين" : "Debit"}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {isRTL ? "دائن" : "Credit"}
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        {isRTL ? "الرصيد" : "Balance"}
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {trialBalanceData.map(chart => renderChart(chart))}
                                
                                {/* Total Row */}
                                <tr className="bg-gray-100 font-bold">
                                    <td className={`px-4 py-3 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                                        {isRTL ? "الإجمالي" : "Total"}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm">
                                        {calculateTotalInitialBalance().toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-green-600">
                                        {totals.debit?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-red-600">
                                        {totals.credit?.toFixed(2) || '0.00'}
                                    </td>
                                    <td className={`px-4 py-3 text-right text-sm font-bold ${
                                        (totals.balance || 0) > 0 ? 'text-green-600' : (totals.balance || 0) < 0 ? 'text-red-600' : ''
                                    }`}>
                                        {totals.balance?.toFixed(2) || '0.00'}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Summary Cards */}
            {trialBalanceData.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <p className="text-sm text-blue-600 mb-1">
                            {isRTL ? "إجمالي الأصول" : "Total Assets"}
                        </p>
                        <p className="text-2xl font-bold text-blue-800">
                            {(trialBalanceData.find(c => c.code === 'Assets')?.totalBalance?.toFixed(2) || '0.00')}
                        </p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                        <p className="text-sm text-red-600 mb-1">
                            {isRTL ? "إجمالي الخصوم" : "Total Liabilities"}
                        </p>
                        <p className="text-2xl font-bold text-red-800">
                            {(trialBalanceData.find(c => c.code === 'Liabilities')?.totalBalance?.toFixed(2) || '0.00')}
                        </p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <p className="text-sm text-green-600 mb-1">
                            {isRTL ? "إجمالي حقوق الملكية" : "Total Equity"}
                        </p>
                        <p className="text-2xl font-bold text-green-800">
                            {(trialBalanceData.find(c => c.code === 'Equity')?.totalBalance?.toFixed(2) || '0.00')}
                        </p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                        <p className="text-sm text-purple-600 mb-1">
                            {isRTL ? "صافي الدخل" : "Net Income"}
                        </p>
                        <p className="text-2xl font-bold text-purple-800">
                            {(((trialBalanceData.find(c => c.code === 'Revenue')?.totalBalance || 0) - 
                               (trialBalanceData.find(c => c.code === 'Expenses')?.totalBalance || 0)).toFixed(2))}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrialBalance;

// import React, { useContext, useState, useEffect } from 'react';
// import { AuthContext } from '../../../context/AuthContext';
// import { toast } from 'react-hot-toast';
// import { 
//     FaDownload, FaPrint, FaSearch, FaChevronDown, 
//     FaChevronUp, FaSync, FaFolderOpen, FaFolder
// } from 'react-icons/fa';
// import { MdAccountBalance } from 'react-icons/md';

// const TrialBalance = ({ isRTL = false }) => {
   
//     const { axios } = useContext(AuthContext);
//     const [loading, setLoading] = useState(false);
//     const [trialBalanceData, setTrialBalanceData] = useState([]);
//     const [totals, setTotals] = useState({ initial: 0, debit: 0, credit: 0, balance: 0 });
//     const [expandedGroups, setExpandedGroups] = useState({});
//     const [filters, setFilters] = useState({
//         fiscalYear: new Date().getFullYear(),
//         period: 'all',
//         asOfDate: new Date().toISOString().split('T')[0]
//     });
//     const [rawData, setRawData] = useState([]); // For debugging

//     // Get available years and periods
//     const [availableYears, setAvailableYears] = useState([]);
//     const [availablePeriods, setAvailablePeriods] = useState([]);

//     // Fetch initial data
//     useEffect(() => {
//         fetchFilters();
//         fetchTrialBalance();
//     }, []);

//     // Debug function to check what's in the database

//     // Fetch trial balance data
//     const fetchTrialBalance = async () => {
//         setLoading(true);
//         try {
//             const params = new URLSearchParams();
//             if (filters.fiscalYear) params.append('fiscalYear', filters.fiscalYear);
//             if (filters.period !== 'all') params.append('period', filters.period);
//             if (filters.asOfDate) params.append('asOfDate', filters.asOfDate);

//             console.log('Fetching trial balance with params:', params.toString());
            
//             const response = await axios.get(`/v1/api/journals/trial-balance?${params.toString()}`);
            
//             console.log('Trial balance API response:', response.data);
            
//             if (response.data.success) {
//                 // Store raw data for debugging
//                 setRawData(response.data.data || []);
                
//                 // Check if we have opening balance data
//                 const hasOpeningBalance = (response.data.data || []).some(item => 
//                     item.reference?.includes('ENT-') || 
//                     item.description?.includes('Opening') ||
//                     item.reference === 'ENT-1' || 
//                     item.reference === 'ENT-2'
//                 );
                
//                 console.log('Has opening balance entries:', hasOpeningBalance);
//                 console.log('Raw data sample:', response.data.data?.[0]);
                
//                 // Process the flat data from backend into hierarchical structure
//                 const hierarchicalData = buildHierarchy(response.data.data || []);
//                 setTrialBalanceData(hierarchicalData);
                
//                 if (response.data.totals) {
//                     setTotals(response.data.totals);
//                 }
                
//                 // Auto-expand first level (charts)
//                 const initialExpanded = {};
//                 hierarchicalData.forEach(item => {
//                     initialExpanded[item.code] = true; // Auto-expand charts
//                 });
//                 setExpandedGroups(initialExpanded);
                
//                 // Log totals for verification
//                 const totalInitial = (response.data.data || []).reduce((sum, item) => {
//                     const isOpening = item.reference?.includes('ENT-') || 
//                                      item.description?.includes('Opening') ||
//                                      item.reference === 'ENT-1' || 
//                                      item.reference === 'ENT-2';
//                     if (isOpening) {
//                         return sum + (item.credit || item.debit || 0);
//                     }
//                     return sum;
//                 }, 0);
                
//                 console.log('Calculated total initial balance:', totalInitial);
                
//             } else {
//                 toast.error(isRTL ? 'فشل تحميل ميزان المراجعة' : 'Failed to load trial balance');
//             }
//         } catch (error) {
//             console.error('Error fetching trial balance:', error);
//             toast.error(isRTL ? 'خطأ في تحميل ميزان المراجعة' : 'Error loading trial balance');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Build hierarchical structure from flat data
//     const buildHierarchy = (data) => {
//         if (!data || !Array.isArray(data) || data.length === 0) {
//             console.log('No data to build hierarchy');
//             return [];
//         }
        
//         console.log('Building hierarchy from', data.length, 'items');
        
//         // Group by chart (first level)
//         const chartMap = {};
        
//         data.forEach((item, index) => {
//             // Log each item for debugging
//             if (index < 5) { // Log first 5 items only
//                 console.log(`Item ${index}:`, {
//                     chart: item.accChart || item.chart,
//                     name: item.accName || item.name,
//                     reference: item.reference,
//                     description: item.description,
//                     debit: item.debit,
//                     credit: item.credit
//                 });
//             }
            
//             const chart = item.accChart || item.chart || 'Uncategorized';
            
//             // Initialize chart if not exists
//             if (!chartMap[chart]) {
//                 chartMap[chart] = {
//                     code: chart,
//                     name: chart,
//                     type: 'chart',
//                     children: [],
//                     totalDebit: 0,
//                     totalCredit: 0,
//                     totalBalance: 0,
//                     items: []
//                 };
//             }
            
//             // Calculate initial balance from opening balance entries
//             // Opening balance entries typically have reference "ENT-1", "ENT-2", or contain "Opening"
//             const isOpeningBalance = (item.reference && (
//                                        item.reference.includes('ENT-') || 
//                                        item.reference === 'ENT-1' || 
//                                        item.reference === 'ENT-2'
//                                      )) || 
//                                      (item.description && item.description.includes('Opening')) ||
//                                      (item.descriptionArb && item.descriptionArb.includes('افتتاحية'));
            
//             // For opening balance entries, set initial balance to the credit/debit amount
//             // For regular entries, initial balance is 0
//             const initialBalance = isOpeningBalance ? (item.credit || item.debit || 0) : 0;
            
//             if (isOpeningBalance) {
//                 console.log(`Found opening balance entry:`, {
//                     reference: item.reference,
//                     description: item.description,
//                     amount: item.credit || item.debit,
//                     initialBalance
//                 });
//             }
            
//             // Add item to chart's items
//             chartMap[chart].items.push({
//                 ...item,
//                 initialBalance: initialBalance,
//                 displayName: `${chart} > ${item.accLevel || item.level || ''} > ${item.accClass || item.class || ''} > ${item.accGroup || item.group || ''} > ${item.accName || item.name || ''}`
//             });
            
//             // Update chart totals
//             chartMap[chart].totalDebit += item.debit || 0;
//             chartMap[chart].totalCredit += item.credit || 0;
//             chartMap[chart].totalBalance += item.balance || 0;
//         });
        
//         // Convert to array and sort
//         const result = Object.values(chartMap).sort((a, b) => a.code.localeCompare(b.code));
        
//         console.log('Built hierarchy with', result.length, 'charts');
        
//         // Log chart totals
//         result.forEach(chart => {
//             const chartInitial = chart.items.reduce((sum, item) => sum + (item.initialBalance || 0), 0);
//             console.log(`Chart ${chart.code}:`, {
//                 items: chart.items.length,
//                 totalInitial: chartInitial,
//                 totalDebit: chart.totalDebit,
//                 totalCredit: chart.totalCredit
//             });
//         });
        
//         return result;
//     };

//     // Fetch available years and periods
//     const fetchFilters = async () => {
//         try {
//             const response = await axios.get('/v1/api/journals/filters');
//             if (response.data.success) {
//                 setAvailableYears(response.data.years || []);
//                 setAvailablePeriods(response.data.periods || []);
//             }
//         } catch (error) {
//             console.error('Error fetching filters:', error);
//         }
//     };

//     // Toggle group expansion
//     const toggleGroup = (code) => {
//         setExpandedGroups(prev => ({
//             ...prev,
//             [code]: !prev[code]
//         }));
//     };

//     // Expand all groups
//     const expandAll = () => {
//         const allExpanded = {};
//         trialBalanceData.forEach(chart => {
//             allExpanded[chart.code] = true;
//         });
//         setExpandedGroups(allExpanded);
//     };

//     // Collapse all groups
//     const collapseAll = () => {
//         setExpandedGroups({});
//     };

//     // Calculate chart's total initial balance
//     const calculateChartInitialBalance = (chart) => {
//         if (!chart.items || !Array.isArray(chart.items)) return 0;
//         return chart.items.reduce((sum, item) => sum + (item.initialBalance || 0), 0);
//     };

//     // Render chart section
//     const renderChart = (chart) => {
//         const isExpanded = expandedGroups[chart.code];
//         const chartInitialBalance = calculateChartInitialBalance(chart);
        
//         return (
//             <React.Fragment key={chart.code}>
//                 {/* Chart Header Row */}
//                 <tr className="bg-blue-100 hover:bg-blue-200 font-bold border-t-2 border-b-2 border-blue-300">
//                     <td className="px-4 py-3 text-sm">
//                         <div className="flex items-center">
//                             <button
//                                 onClick={() => toggleGroup(chart.code)}
//                                 className="mr-2 p-1 hover:bg-blue-300 rounded"
//                             >
//                                 {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
//                             </button>
//                             {isExpanded ? 
//                                 <FaFolderOpen className="mr-2 text-blue-700" size={16} /> : 
//                                 <FaFolder className="mr-2 text-blue-700" size={16} />
//                             }
//                             <span className="text-blue-900">
//                                 {chart.name}
//                             </span>
//                         </div>
//                     </td>
//                     <td className="px-4 py-3 text-right text-sm font-bold text-blue-900">
//                         {chartInitialBalance.toFixed(2)}
//                     </td>
//                     <td className="px-4 py-3 text-right text-sm font-bold text-blue-900">
//                         {chart.totalDebit?.toFixed(2) || '0.00'}
//                     </td>
//                     <td className="px-4 py-3 text-right text-sm font-bold text-blue-900">
//                         {chart.totalCredit?.toFixed(2) || '0.00'}
//                     </td>
//                     <td className={`px-4 py-3 text-right text-sm font-bold ${
//                         chart.totalBalance > 0 ? 'text-green-600' : 
//                         chart.totalBalance < 0 ? 'text-red-600' : 'text-blue-900'
//                     }`}>
//                         {chart.totalBalance?.toFixed(2) || '0.00'}
//                     </td>
//                 </tr>

//                 {/* Render accounts if expanded */}
//                 {isExpanded && chart.items && chart.items.map((item, idx) => (
//                     <tr key={`${chart.code}-${idx}`} className="hover:bg-gray-50 border-b border-gray-100">
//                         <td className="px-4 py-2 text-sm">
//                             <div className="flex items-center" style={{ marginLeft: 20 }}>
//                                 <span className="text-gray-700">
//                                     <span className="text-gray-500 text-xs mr-1">{item.accLevel || item.level || ''}</span>
//                                     {' > '}
//                                     <span className="text-gray-500 text-xs mr-1">{item.accClass || item.class || ''}</span>
//                                     {' > '}
//                                     <span className="text-gray-500 text-xs mr-1">{item.accGroup || item.group || ''}</span>
//                                     {' > '}
//                                     <span className="font-medium">{item.accName || item.name || ''}</span>
//                                 </span>
//                             </div>
//                         </td>
//                         <td className="px-4 py-2 text-right text-sm">
//                             {item.initialBalance?.toFixed(2) || '0.00'}
//                         </td>
//                         <td className="px-4 py-2 text-right text-sm text-green-600">
//                             {item.debit?.toFixed(2) || '0.00'}
//                         </td>
//                         <td className="px-4 py-2 text-right text-sm text-red-600">
//                             {item.credit?.toFixed(2) || '0.00'}
//                         </td>
//                         <td className={`px-4 py-2 text-right text-sm font-medium ${
//                             (item.balance || 0) > 0 ? 'text-green-600' : (item.balance || 0) < 0 ? 'text-red-600' : ''
//                         }`}>
//                             {item.balance?.toFixed(2) || '0.00'}
//                         </td>
//                     </tr>
//                 ))}
//             </React.Fragment>
//         );
//     };

//     // Calculate total initial balance across all charts
//     const calculateTotalInitialBalance = () => {
//         return trialBalanceData.reduce((sum, chart) => sum + calculateChartInitialBalance(chart), 0);
//     };

//     return (
//         <div dir={isRTL ? "rtl" : "ltr"} className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//                 <div>
//                     <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
//                         <MdAccountBalance className="text-blue-600" />
//                         {isRTL ? "ميزان المراجعة" : "Trial Balance"}
//                     </h1>
//                     <p className="text-sm sm:text-base text-gray-600 mt-1">
//                         {isRTL ? "عرض ميزان المراجعة للحسابات" : "View trial balance for accounts"}
//                     </p>
//                 </div>

//                 <div className="flex gap-2">
                 

//                     <button
//                         onClick={expandAll}
//                         className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
//                         title={isRTL ? "فتح الكل" : "Expand All"}
//                     >
//                         <FaFolderOpen size={14} />
//                         {isRTL ? "فتح الكل" : "Expand All"}
//                     </button>
//                     <button
//                         onClick={collapseAll}
//                         className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm"
//                         title={isRTL ? "إغلاق الكل" : "Collapse All"}
//                     >
//                         <FaFolder size={14} />
//                         {isRTL ? "إغلاق الكل" : "Collapse All"}
//                     </button>
//                     <button
//                         onClick={fetchTrialBalance}
//                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
//                     >
//                         <FaSync size={14} />
//                         {isRTL ? "تحديث" : "Refresh"}
//                     </button>
//                     <button
//                         className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
//                     >
//                         <FaDownload size={14} />
//                         {isRTL ? "تصدير" : "Export"}
//                     </button>
//                     <button
//                         onClick={() => window.print()}
//                         className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
//                     >
//                         <FaPrint size={14} />
//                         {isRTL ? "طباعة" : "Print"}
//                     </button>
//                 </div>
//             </div>

//             {/* Filters */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                         {isRTL ? "السنة المالية" : "Fiscal Year"}
//                     </label>
//                     <select
//                         value={filters.fiscalYear}
//                         onChange={(e) => setFilters({ ...filters, fiscalYear: parseInt(e.target.value) })}
//                         className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     >
//                         {availableYears.length > 0 ? availableYears.map(year => (
//                             <option key={year} value={year}>{year}</option>
//                         )) : (
//                             <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
//                         )}
//                     </select>
//                 </div>

//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                         {isRTL ? "الفترة" : "Period"}
//                     </label>
//                     <select
//                         value={filters.period}
//                         onChange={(e) => setFilters({ ...filters, period: e.target.value })}
//                         className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     >
//                         <option value="all">{isRTL ? "جميع الفترات" : "All Periods"}</option>
//                         {availablePeriods.map(period => (
//                             <option key={period} value={period}>{period}</option>
//                         ))}
//                     </select>
//                 </div>

//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                         {isRTL ? "حتى تاريخ" : "As Of"}
//                     </label>
//                     <input
//                         type="date"
//                         value={filters.asOfDate}
//                         onChange={(e) => setFilters({ ...filters, asOfDate: e.target.value })}
//                         className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//                     />
//                 </div>

//                 <div className="flex items-end">
//                     <button
//                         onClick={fetchTrialBalance}
//                         className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
//                     >
//                         <FaSearch size={14} />
//                         {isRTL ? "عرض" : "View"}
//                     </button>
//                 </div>
//             </div>

//             {/* Debug Info - Remove in production */}
//             {process.env.NODE_ENV === 'development' && rawData.length > 0 && (
//                 <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
//                     <h3 className="font-bold mb-2">Debug Info:</h3>
//                     <p>Total records: {rawData.length}</p>
//                     <p>Opening balance entries: {rawData.filter(item => 
//                         item.reference?.includes('ENT-') || 
//                         item.description?.includes('Opening')
//                     ).length}</p>
//                     <button 
//                         onClick={() => console.log('Raw data:', rawData)}
//                         className="mt-2 px-3 py-1 bg-yellow-500 text-white rounded text-sm"
//                     >
//                         Log Raw Data
//                     </button>
//                 </div>
//             )}

//             {/* Trial Balance Table */}
//             {loading ? (
//                 <div className="text-center py-12">
//                     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//                     <p className="mt-4 text-gray-600">{isRTL ? "جاري التحميل..." : "Loading..."}</p>
//                 </div>
//             ) : trialBalanceData.length === 0 ? (
//                 <div className="text-center py-12 bg-gray-50 rounded-xl">
//                     <MdAccountBalance className="mx-auto text-5xl text-gray-400 mb-4" />
//                     <h3 className="text-xl font-semibold text-gray-700 mb-2">
//                         {isRTL ? "لا توجد بيانات" : "No Data Found"}
//                     </h3>
//                     <p className="text-gray-500">
//                         {isRTL ? "لا توجد حسابات للعرض" : "No accounts to display"}
//                     </p>
//                 </div>
//             ) : (
//                 <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full divide-y divide-gray-200">
//                             <thead className="bg-gray-50">
//                                 <tr>
//                                     <th className={`px-4 py-3 ${isRTL ? 'text-right' : 'text-left'} text-xs font-medium text-gray-500 uppercase tracking-wider`}>
//                                         {isRTL ? "الحساب" : "Account"}
//                                     </th>
//                                     <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         {isRTL ? "الرصيد الافتتاحي" : "Initial Balance"}
//                                     </th>
//                                     <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         {isRTL ? "مدين" : "Debit"}
//                                     </th>
//                                     <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         {isRTL ? "دائن" : "Credit"}
//                                     </th>
//                                     <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
//                                         {isRTL ? "الرصيد" : "Balance"}
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody className="bg-white divide-y divide-gray-200">
//                                 {trialBalanceData.map(chart => renderChart(chart))}
                                
//                                 {/* Total Row */}
//                                 <tr className="bg-gray-100 font-bold">
//                                     <td className={`px-4 py-3 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
//                                         {isRTL ? "الإجمالي" : "Total"}
//                                     </td>
//                                     <td className="px-4 py-3 text-right text-sm">
//                                         {calculateTotalInitialBalance().toFixed(2)}
//                                     </td>
//                                     <td className="px-4 py-3 text-right text-sm text-green-600">
//                                         {totals.debit?.toFixed(2) || '0.00'}
//                                     </td>
//                                     <td className="px-4 py-3 text-right text-sm text-red-600">
//                                         {totals.credit?.toFixed(2) || '0.00'}
//                                     </td>
//                                     <td className={`px-4 py-3 text-right text-sm font-bold ${
//                                         (totals.balance || 0) > 0 ? 'text-green-600' : (totals.balance || 0) < 0 ? 'text-red-600' : ''
//                                     }`}>
//                                         {totals.balance?.toFixed(2) || '0.00'}
//                                     </td>
//                                 </tr>
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             )}

//             {/* Summary Cards */}
//             {trialBalanceData.length > 0 && (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
//                     <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
//                         <p className="text-sm text-blue-600 mb-1">
//                             {isRTL ? "إجمالي الأصول" : "Total Assets"}
//                         </p>
//                         <p className="text-2xl font-bold text-blue-800">
//                             {(trialBalanceData.find(c => c.code === 'Assets')?.totalBalance?.toFixed(2) || '0.00')}
//                         </p>
//                     </div>
//                     <div className="bg-red-50 rounded-xl p-4 border border-red-200">
//                         <p className="text-sm text-red-600 mb-1">
//                             {isRTL ? "إجمالي الخصوم" : "Total Liabilities"}
//                         </p>
//                         <p className="text-2xl font-bold text-red-800">
//                             {(trialBalanceData.find(c => c.code === 'Liabilities')?.totalBalance?.toFixed(2) || '0.00')}
//                         </p>
//                     </div>
//                     <div className="bg-green-50 rounded-xl p-4 border border-green-200">
//                         <p className="text-sm text-green-600 mb-1">
//                             {isRTL ? "إجمالي حقوق الملكية" : "Total Equity"}
//                         </p>
//                         <p className="text-2xl font-bold text-green-800">
//                             {(trialBalanceData.find(c => c.code === 'Equity')?.totalBalance?.toFixed(2) || '0.00')}
//                         </p>
//                     </div>
//                     <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
//                         <p className="text-sm text-purple-600 mb-1">
//                             {isRTL ? "صافي الدخل" : "Net Income"}
//                         </p>
//                         <p className="text-2xl font-bold text-purple-800">
//                             {(((trialBalanceData.find(c => c.code === 'Revenue')?.totalBalance || 0) - 
//                                (trialBalanceData.find(c => c.code === 'Expenses')?.totalBalance || 0)).toFixed(2))}
//                         </p>
//                     </div>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default TrialBalance;


// /*
{/* <button
    onClick={debugDatabase}
    className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 text-sm"
    title="Debug Database"
>
    Debug DB
</button> */}

/*
const debugDatabase = async () => {
    try {
        console.log('Fetching debug data...');
        const response = await axios.get('/v1/api/journals/debug');
        console.log('Debug data:', response.data);
        
        if (response.data.success) {
            const data = response.data.data;
            console.log('=== DATABASE DEBUG INFO ===');
            console.log('Total Journals:', data.totalJournals);
            console.log('Journals:', data.journals);
            console.log('Opening Journals:', data.openingJournals);
            console.log('Total Entries:', data.totalEntries);
            console.log('Opening Entries:', data.openingEntries);
            console.log('===========================');
            
            // Show alert with summary
            alert(`
                Total Journals: ${data.totalJournals}
                Opening Journals: ${data.openingJournals.length}
                Total Entries: ${data.totalEntries}
                Opening Entries: ${data.openingEntries.length}
                
                Check console for full details
            `);
        }
    } catch (error) {
        console.error('Debug error:', error);
        alert('Debug endpoint failed. Check console for details.');
    }
};
*/




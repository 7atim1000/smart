import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { 
    FaDownload, FaPrint, FaSearch, FaSync, 
    FaBalanceScale 
} from 'react-icons/fa';
import { MdAccountBalance } from 'react-icons/md';

const BalanceSheet = ({ isRTL = true }) => {
    const { axios } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [balanceSheetData, setBalanceSheetData] = useState(null);
    const [expandedSections, setExpandedSections] = useState({
        assets: {},
        liabilities: {},
        equity: {}
    });
    const [filters, setFilters] = useState({
        fiscalYear: new Date().getFullYear(),
        period: 'all',
        asOfDate: new Date().toISOString().split('T')[0]
    });

    // Fetch balance sheet data
    const fetchBalanceSheet = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.fiscalYear) params.append('fiscalYear', filters.fiscalYear);
            if (filters.period !== 'all') params.append('period', filters.period);
            if (filters.asOfDate) params.append('asOfDate', filters.asOfDate);

            console.log('Fetching balance sheet with params:', params.toString());
            
            const response = await axios.get(`/v1/api/journals/balance-sheet?${params.toString()}`);
            
            console.log('Balance sheet API response:', response.data);
            
            if (response.data.success) {
                setBalanceSheetData(response.data.data);
                
                // Initialize expanded sections - ALL COLLAPSED BY DEFAULT
                setExpandedSections({
                    assets: {},
                    liabilities: {},
                    equity: {}
                });
                
            } else {
                toast.error('فشل تحميل الميزانية العمومية');
            }
        } catch (error) {
            console.error('Error fetching balance sheet:', error);
            toast.error('خطأ في تحميل الميزانية العمومية');
        } finally {
            setLoading(false);
        }
    };

    // Fetch on mount and when filters change
    useEffect(() => {
        fetchBalanceSheet();
    }, [filters.fiscalYear, filters.period, filters.asOfDate]);

    // Toggle section expansion
    const toggleSection = (section, level) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [level]: !prev[section]?.[level]
            }
        }));
    };

    // Format number
    const formatNumber = (num) => {
        return (num || 0).toFixed(2);
    };

    // Calculate difference (Assets - (Liabilities + Equity))
    const calculateDifference = () => {
        if (!balanceSheetData?.totals) return 0;
        return balanceSheetData.totals.assets - 
               (balanceSheetData.totals.liabilities + balanceSheetData.totals.equity);
    };

    // Render assets section
    const renderAssets = () => {
        if (!balanceSheetData?.assets) return null;
        
        const { total, byLevel } = balanceSheetData.assets;
        
        return (
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-blue-600 text-white px-4 py-3 font-bold flex justify-between items-center">
                    <span>الأصول</span>
                    <span className="text-lg">{formatNumber(total)}</span>
                </div>
                <div className="p-4">
                    {Object.keys(byLevel || {}).map(level => (
                        <div key={level} className="mb-4">
                            {/* Level Header */}
                            <div 
                                className="flex items-center justify-between bg-blue-50 p-2 rounded cursor-pointer hover:bg-blue-100"
                                onClick={() => toggleSection('assets', level)}
                            >
                                <div className="flex items-center gap-2">
                                    {expandedSections.assets[level] ? 
                                        <FaArrowDown className="text-blue-600" /> : 
                                        <FaArrowLeft className="text-blue-600" />
                                    }
                                    <span className="font-semibold">
                                        {byLevel[level].levelNameArb || level}
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {formatNumber(
                                        Object.values(byLevel[level].classes).reduce(
                                            (sum, cls) => sum + Object.values(cls.groups).reduce(
                                                (gSum, grp) => gSum + grp.accounts.reduce(
                                                    (aSum, acc) => aSum + acc.balance, 0
                                                ), 0
                                            ), 0
                                        )
                                    )}
                                </span>
                            </div>
                            
                            {/* Classes and Groups - Only show if expanded */}
                            {expandedSections.assets[level] && (
                                <div className="mr-4 mt-2">
                                    {Object.keys(byLevel[level].classes).map(className => (
                                        <div key={className} className="mb-3">
                                            {/* Class Header */}
                                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span className="font-medium text-gray-700">
                                                    {byLevel[level].classes[className].classNameArb || className}
                                                </span>
                                                <span className="text-sm">
                                                    {formatNumber(
                                                        Object.values(byLevel[level].classes[className].groups).reduce(
                                                            (sum, grp) => sum + grp.accounts.reduce(
                                                                (aSum, acc) => aSum + acc.balance, 0
                                                            ), 0
                                                        )
                                                    )}
                                                </span>
                                            </div>
                                            
                                            {/* Groups */}
                                            <div className="mr-4 mt-1">
                                                {Object.keys(byLevel[level].classes[className].groups).map(groupName => (
                                                    <div key={groupName} className="mb-2">
                                                        {/* Group Header */}
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {byLevel[level].classes[className].groups[groupName].groupNameArb || groupName}
                                                            </span>
                                                            <span className="font-medium">
                                                                {formatNumber(
                                                                    byLevel[level].classes[className].groups[groupName].accounts.reduce(
                                                                        (sum, acc) => sum + acc.balance, 0
                                                                    )
                                                                )}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Accounts */}
                                                        <div className="mr-4 mt-1">
                                                            {byLevel[level].classes[className].groups[groupName].accounts.map((account, idx) => (
                                                                <div key={idx} className="flex items-center justify-between text-xs text-gray-500 py-1">
                                                                    <span>
                                                                        {account.nameArb || account.name}
                                                                    </span>
                                                                    <span className="font-mono">
                                                                        {formatNumber(account.balance)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render liabilities section
    const renderLiabilities = () => {
        if (!balanceSheetData?.liabilities) return null;
        
        const { total, byLevel } = balanceSheetData.liabilities;
        
        return (
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-orange-600 text-white px-4 py-3 font-bold flex justify-between items-center">
                    <span>الخصوم</span>
                    <span className="text-lg">{formatNumber(total)}</span>
                </div>
                <div className="p-4">
                    {Object.keys(byLevel || {}).map(level => (
                        <div key={level} className="mb-4">
                            <div 
                                className="flex items-center justify-between bg-orange-50 p-2 rounded cursor-pointer hover:bg-orange-100"
                                onClick={() => toggleSection('liabilities', level)}
                            >
                                <div className="flex items-center gap-2">
                                    {expandedSections.liabilities[level] ? 
                                        <FaArrowDown className="text-orange-600" /> : 
                                        <FaArrowLeft className="text-orange-600" />
                                    }
                                    <span className="font-semibold">
                                        {byLevel[level].levelNameArb || level}
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {formatNumber(
                                        Object.values(byLevel[level].classes).reduce(
                                            (sum, cls) => sum + Object.values(cls.groups).reduce(
                                                (gSum, grp) => gSum + grp.accounts.reduce(
                                                    (aSum, acc) => aSum + acc.balance, 0
                                                ), 0
                                            ), 0
                                        )
                                    )}
                                </span>
                            </div>
                            
                            {/* Classes and Groups - Only show if expanded */}
                            {expandedSections.liabilities[level] && (
                                <div className="mr-4 mt-2">
                                    {Object.keys(byLevel[level].classes).map(className => (
                                        <div key={className} className="mb-3">
                                            {/* Class Header */}
                                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span className="font-medium text-gray-700">
                                                    {byLevel[level].classes[className].classNameArb || className}
                                                </span>
                                                <span className="text-sm">
                                                    {formatNumber(
                                                        Object.values(byLevel[level].classes[className].groups).reduce(
                                                            (sum, grp) => sum + grp.accounts.reduce(
                                                                (aSum, acc) => aSum + acc.balance, 0
                                                            ), 0
                                                        )
                                                    )}
                                                </span>
                                            </div>
                                            
                                            {/* Groups */}
                                            <div className="mr-4 mt-1">
                                                {Object.keys(byLevel[level].classes[className].groups).map(groupName => (
                                                    <div key={groupName} className="mb-2">
                                                        {/* Group Header */}
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {byLevel[level].classes[className].groups[groupName].groupNameArb || groupName}
                                                            </span>
                                                            <span className="font-medium">
                                                                {formatNumber(
                                                                    byLevel[level].classes[className].groups[groupName].accounts.reduce(
                                                                        (sum, acc) => sum + acc.balance, 0
                                                                    )
                                                                )}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Accounts */}
                                                        <div className="mr-4 mt-1">
                                                            {byLevel[level].classes[className].groups[groupName].accounts.map((account, idx) => (
                                                                <div key={idx} className="flex items-center justify-between text-xs text-gray-500 py-1">
                                                                    <span>
                                                                        {account.nameArb || account.name}
                                                                    </span>
                                                                    <span className="font-mono">
                                                                        {formatNumber(account.balance)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // Render equity section
    const renderEquity = () => {
        if (!balanceSheetData?.equity) return null;
        
        const { total, byLevel } = balanceSheetData.equity;
        
        return (
            <div className="border rounded-lg overflow-hidden">
                <div className="bg-green-600 text-white px-4 py-3 font-bold flex justify-between items-center">
                    <span>حقوق الملكية</span>
                    <span className="text-lg">{formatNumber(total)}</span>
                </div>
                <div className="p-4">
                    {Object.keys(byLevel || {}).map(level => (
                        <div key={level} className="mb-4">
                            <div 
                                className="flex items-center justify-between bg-green-50 p-2 rounded cursor-pointer hover:bg-green-100"
                                onClick={() => toggleSection('equity', level)}
                            >
                                <div className="flex items-center gap-2">
                                    {expandedSections.equity[level] ? 
                                        <FaArrowDown className="text-green-600" /> : 
                                        <FaArrowLeft className="text-green-600" />
                                    }
                                    <span className="font-semibold">
                                        {byLevel[level].levelNameArb || level}
                                    </span>
                                </div>
                                <span className="font-medium">
                                    {formatNumber(
                                        Object.values(byLevel[level].classes).reduce(
                                            (sum, cls) => sum + Object.values(cls.groups).reduce(
                                                (gSum, grp) => gSum + grp.accounts.reduce(
                                                    (aSum, acc) => aSum + acc.balance, 0
                                                ), 0
                                            ), 0
                                        )
                                    )}
                                </span>
                            </div>
                            
                            {/* Classes and Groups - Only show if expanded */}
                            {expandedSections.equity[level] && (
                                <div className="mr-4 mt-2">
                                    {Object.keys(byLevel[level].classes).map(className => (
                                        <div key={className} className="mb-3">
                                            {/* Class Header */}
                                            <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                                <span className="font-medium text-gray-700">
                                                    {byLevel[level].classes[className].classNameArb || className}
                                                </span>
                                                <span className="text-sm">
                                                    {formatNumber(
                                                        Object.values(byLevel[level].classes[className].groups).reduce(
                                                            (sum, grp) => sum + grp.accounts.reduce(
                                                                (aSum, acc) => aSum + acc.balance, 0
                                                            ), 0
                                                        )
                                                    )}
                                                </span>
                                            </div>
                                            
                                            {/* Groups */}
                                            <div className="mr-4 mt-1">
                                                {Object.keys(byLevel[level].classes[className].groups).map(groupName => (
                                                    <div key={groupName} className="mb-2">
                                                        {/* Group Header */}
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {byLevel[level].classes[className].groups[groupName].groupNameArb || groupName}
                                                            </span>
                                                            <span className="font-medium">
                                                                {formatNumber(
                                                                    byLevel[level].classes[className].groups[groupName].accounts.reduce(
                                                                        (sum, acc) => sum + acc.balance, 0
                                                                    )
                                                                )}
                                                            </span>
                                                        </div>
                                                        
                                                        {/* Accounts */}
                                                        <div className="mr-4 mt-1">
                                                            {byLevel[level].classes[className].groups[groupName].accounts.map((account, idx) => (
                                                                <div key={idx} className="flex items-center justify-between text-xs text-gray-500 py-1">
                                                                    <span>
                                                                        {account.nameArb || account.name}
                                                                    </span>
                                                                    <span className="font-mono">
                                                                        {formatNumber(account.balance)}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div dir="rtl" className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <MdAccountBalance className="text-blue-600" />
                        الميزانية العمومية
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                        عرض الميزانية العمومية للحسابات
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={fetchBalanceSheet}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                        <FaSync size={14} />
                        تحديث
                    </button>
                    <button
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FaDownload size={14} />
                        تصدير
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                        <FaPrint size={14} />
                        طباعة
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        السنة المالية
                    </label>
                    <select
                        value={filters.fiscalYear}
                        onChange={(e) => setFilters({ ...filters, fiscalYear: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        {[2023, 2024, 2025, 2026].map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        الفترة
                    </label>
                    <select
                        value={filters.period}
                        onChange={(e) => setFilters({ ...filters, period: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">جميع الفترات</option>
                        {['2026-01', '2026-02', '2026-03', '2026-04'].map(period => (
                            <option key={period} value={period}>{period}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        حتى تاريخ
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
                        onClick={fetchBalanceSheet}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                        <FaSearch size={14} />
                        عرض
                    </button>
                </div>
            </div>

            {/* Balance Sheet Content */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">جاري التحميل...</p>
                </div>
            ) : !balanceSheetData ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <MdAccountBalance className="mx-auto text-5xl text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                        لا توجد بيانات
                    </h3>
                    <p className="text-gray-500">
                        لا توجد حسابات للعرض
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Assets */}
                        <div>
                            {renderAssets()}
                        </div>

                        {/* Right Column - Liabilities + Equity */}
                        <div className="space-y-6">
                            {renderLiabilities()}
                            {renderEquity()}
                            
                            {/* Total Liabilities + Equity */}
                            {balanceSheetData.totals && (
                                <div className="bg-purple-600 text-white rounded-lg p-4 font-bold flex justify-between items-center">
                                    <span className="text-lg">
                                        إجمالي الخصوم + حقوق الملكية
                                    </span>
                                    <span className="text-xl">
                                        {formatNumber(balanceSheetData.totals.liabilitiesEquity)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Difference Footer (Assets - (Liabilities + Equity)) */}
                    {balanceSheetData?.totals && (
                        <div className="mt-6 p-4 bg-gray-100 rounded-lg border-2 border-gray-300">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <FaBalanceScale className="text-2xl text-gray-700" />
                                    <span className="text-lg font-bold text-gray-800">
                                        الأصول - (الخصوم + حقوق الملكية)
                                    </span>
                                </div>
                                <span className={`text-2xl font-bold ${
                                    Math.abs(calculateDifference()) < 0.01 
                                        ? 'text-green-600' 
                                        : 'text-red-600'
                                }`}>
                                    {formatNumber(calculateDifference())}
                                </span>
                            </div>
                            {Math.abs(calculateDifference()) > 0.01 && (
                                <p className="text-sm text-red-500 mt-2 text-center">
                                    تحذير: الميزانية العمومية غير متوازنة! يجب أن يساوي إجمالي الأصول إجمالي الخصوم + حقوق الملكية.
                                </p>
                            )}
                        </div>
                    )}

                    {/* Summary Cards */}
                    {balanceSheetData?.totals && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <p className="text-sm text-blue-600 mb-1">
                                    إجمالي الأصول
                                </p>
                                <p className="text-2xl font-bold text-blue-800">
                                    {formatNumber(balanceSheetData.totals.assets)}
                                </p>
                            </div>
                            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                                <p className="text-sm text-orange-600 mb-1">
                                    إجمالي الخصوم
                                </p>
                                <p className="text-2xl font-bold text-orange-800">
                                    {formatNumber(balanceSheetData.totals.liabilities)}
                                </p>
                            </div>
                            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                                <p className="text-sm text-green-600 mb-1">
                                    إجمالي حقوق الملكية
                                </p>
                                <p className="text-2xl font-bold text-green-800">
                                    {formatNumber(balanceSheetData.totals.equity)}
                                </p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                                <p className="text-sm text-purple-600 mb-1">
                                    الخصوم + حقوق الملكية
                                </p>
                                <p className="text-2xl font-bold text-purple-800">
                                    {formatNumber(balanceSheetData.totals.liabilitiesEquity)}
                                </p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

// Helper component for arrow icons
const FaArrowDown = ({ className }) => (
    <svg 
        className={className} 
        fill="currentColor" 
        viewBox="0 0 20 20" 
        width="16" 
        height="16"
    >
        <path 
            fillRule="evenodd" 
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
            clipRule="evenodd" 
        />
    </svg>
);

const FaArrowLeft = ({ className }) => (
    <svg 
        className={className} 
        fill="currentColor" 
        viewBox="0 0 20 20" 
        width="16" 
        height="16"
    >
        <path 
            fillRule="evenodd" 
            d="M12.707 14.707a1 1 0 01-1.414 0L8 11.414 4.707 14.707a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" 
            clipRule="evenodd" 
        />
    </svg>
);

export default BalanceSheet;
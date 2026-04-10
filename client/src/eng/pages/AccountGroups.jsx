import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { MdDelete } from "react-icons/md";
import { FaPlus, FaFolder, FaChartPie, FaLayerGroup, FaSitemap } from "react-icons/fa";
import { FiEdit3 } from "react-icons/fi";
import { FaChevronRight, FaChevronDown } from "react-icons/fa6";
import { MdAccountBalance } from "react-icons/md";
import ChartAdd from '../components/chartofaccounts/ChartAdd';
import LevelAdd from '../components/chartofaccounts/LevelAdd';
import ClassAdd from '../components/chartofaccounts/ClassAdd';
import GroupAdd from '../components/chartofaccounts/GroupAdd';
import Accounts from './Accounts';

const AccountGroups = () => {
    // Button configurations
    const Buttons = [
        { label: 'New Chart', icon: <FaPlus className="text-white" size={18} />, action: 'chart' }
    ];

    // Modal states
    const [isChartModalOpen, setIsChartModalOpen] = useState(false);
    const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    
    // Selected IDs for nested operations
    const [selectedChartId, setSelectedChartId] = useState(null);
    const [selectedLevelId, setSelectedLevelId] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    
    // Edit states
    const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editType, setEditType] = useState('');

    // Accounts view states
    const [showAccounts, setShowAccounts] = useState(false);
    const [selectedGroupName, setSelectedGroupName] = useState('');
    const [selectedGroupCode, setSelectedGroupCode] = useState('');
    const [selectedChartType, setSelectedChartType] = useState(''); // Store chart type

    const { axios } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [charts, setCharts] = useState([]);
    
    // Expanded/collapsed states
    const [expandedChart, setExpandedChart] = useState(null);
    const [expandedLevel, setExpandedLevel] = useState(null);
    const [expandedClass, setExpandedClass] = useState(null);
    
    // Data for expanded levels
    const [levels, setLevels] = useState([]);
    const [classes, setClasses] = useState([]);
    const [groups, setGroups] = useState([]);
    
    // Loading states
    const [loadingLevels, setLoadingLevels] = useState(false);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingGroups, setLoadingGroups] = useState(false);

    // Totals state
    const [totals, setTotals] = useState({
        levels: 0,
        classes: 0,
        groups: 0,
        accounts: 0
    });

    // ============================================
    // FETCH FUNCTIONS
    // ============================================

    const fetchCharts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/v1/api/chart');
            if (response.data.success) {
                const chartsData = response.data.charts || [];
                setCharts(chartsData);
                calculateTotalsFromCharts(chartsData);
            } else {
                toast.error('Failed to fetch charts');
            }
        } catch (error) {
            console.error('Error fetching charts:', error);
            toast.error('Error loading charts');
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalsFromCharts = (chartsData) => {
        const newTotals = chartsData.reduce((acc, chart) => {
            const chartLevels = chart.levels?.length || 0;
            const chartClasses = chart.levels?.reduce((sum, level) => 
                sum + (level.classes?.length || 0), 0) || 0;
            const chartGroups = chart.levels?.reduce((sum, level) => 
                sum + (level.classes?.reduce((gSum, cls) => 
                    gSum + (cls.groups?.length || 0), 0) || 0), 0) || 0;
            const chartAccounts = chart.levels?.reduce((sum, level) => 
                sum + (level.classes?.reduce((cSum, cls) => 
                    cSum + (cls.groups?.reduce((gSum, group) => 
                        gSum + (group.accounts?.length || 0), 0) || 0), 0) || 0), 0) || 0;
            
            return {
                levels: acc.levels + chartLevels,
                classes: acc.classes + chartClasses,
                groups: acc.groups + chartGroups,
                accounts: acc.accounts + chartAccounts
            };
        }, { levels: 0, classes: 0, groups: 0, accounts: 0 });
        
        setTotals(newTotals);
    };

    const fetchLevelsByChartId = async (chartId) => {
        setLoadingLevels(true);
        try {
            const response = await axios.get(`/v1/api/chart/${chartId}/levels`);
            if (response.data.success) {
                const levelsData = response.data.levels || [];
                setLevels(levelsData);
                setTotals(prev => ({
                    ...prev,
                    levels: prev.levels + levelsData.length
                }));
            } else {
                toast.error('Failed to fetch levels');
            }
        } catch (error) {
            console.error('Error fetching levels:', error);
            toast.error('Error loading levels');
        } finally {
            setLoadingLevels(false);
        }
    };

    const fetchClassesByLevelId = async (chartId, levelId) => {
        setLoadingClasses(true);
        try {
            const response = await axios.get(`/v1/api/chart/${chartId}/levels/${levelId}/classes`);
            if (response.data.success) {
                const classesData = response.data.classes || [];
                setClasses(classesData);
                setTotals(prev => ({
                    ...prev,
                    classes: prev.classes + classesData.length
                }));
            } else {
                toast.error('Failed to fetch classes');
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            toast.error('Error loading classes');
        } finally {
            setLoadingClasses(false);
        }
    };

    const fetchGroupsByClassId = async (chartId, levelId, classId) => {
        setLoadingGroups(true);
        try {
            const response = await axios.get(`/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups`);
            if (response.data.success) {
                const groupsData = response.data.groups || [];
                setGroups(groupsData);
                setTotals(prev => ({
                    ...prev,
                    groups: prev.groups + groupsData.length
                }));
            } else {
                toast.error('Failed to fetch groups');
            }
        } catch (error) {
            console.error('Error fetching groups:', error);
            toast.error('Error loading groups');
        } finally {
            setLoadingGroups(false);
        }
    };

    useEffect(() => {
        fetchCharts();
    }, []);

    // ============================================
    // HANDLE EXPAND/COLLAPSE
    // ============================================

    const handleChartClick = (chartId) => {
        if (expandedChart === chartId) {
            setExpandedChart(null);
            setLevels([]);
            setExpandedLevel(null);
            setClasses([]);
            setExpandedClass(null);
            setGroups([]);
            setShowAccounts(false);
        } else {
            setExpandedChart(chartId);
            fetchLevelsByChartId(chartId);
            setExpandedLevel(null);
            setClasses([]);
            setExpandedClass(null);
            setGroups([]);
            setShowAccounts(false);
        }
    };

    const handleLevelClick = (levelId) => {
        if (expandedLevel === levelId) {
            setExpandedLevel(null);
            setClasses([]);
            setExpandedClass(null);
            setGroups([]);
        } else {
            setExpandedLevel(levelId);
            fetchClassesByLevelId(expandedChart, levelId);
            setExpandedClass(null);
            setGroups([]);
        }
    };

    const handleClassClick = (classId) => {
        if (expandedClass === classId) {
            setExpandedClass(null);
            setGroups([]);
        } else {
            setExpandedClass(classId);
            fetchGroupsByClassId(expandedChart, expandedLevel, classId);
        }
    };

    // ============================================
    // HANDLE ADD OPERATIONS
    // ============================================

    const handleAddChart = () => {
        setIsChartModalOpen(true);
    };

    const handleAddLevel = (chartId) => {
        setSelectedChartId(chartId);
        setIsLevelModalOpen(true);
    };

    const handleAddClass = (chartId, levelId) => {
        setSelectedChartId(chartId);
        setSelectedLevelId(levelId);
        setIsClassModalOpen(true);
    };

    const handleAddGroup = (chartId, levelId, classId) => {
        setSelectedChartId(chartId);
        setSelectedLevelId(levelId);
        setSelectedClassId(classId);
        setIsGroupModalOpen(true);
    };

    // ============================================
    // HANDLE EDIT OPERATIONS
    // ============================================

    const handleEditLevel = (level) => {
        setSelectedItemForEdit(level);
        setEditType('level');
        setIsEditModalOpen(true);
    };

    const handleEditClass = (classObj) => {
        setSelectedItemForEdit(classObj);
        setEditType('class');
        setIsEditModalOpen(true);
    };

    const handleEditGroup = (group) => {
        setSelectedItemForEdit(group);
        setEditType('group');
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (updatedData) => {
        try {
            let response;
            const { name, nameArb, code } = updatedData;

            if (editType === 'level') {
                response = await axios.put(`/v1/api/chart/${expandedChart}/levels/${selectedItemForEdit._id}`, {
                    name, nameArb, code
                });
            } else if (editType === 'class') {
                response = await axios.put(`/v1/api/chart/${expandedChart}/levels/${expandedLevel}/classes/${selectedItemForEdit._id}`, {
                    name, nameArb, code
                });
            } else if (editType === 'group') {
                response = await axios.put(`/v1/api/chart/${expandedChart}/levels/${expandedLevel}/classes/${expandedClass}/groups/${selectedItemForEdit._id}`, {
                    name, nameArb, code
                });
            }

            if (response?.data.success) {
                toast.success(`${editType} updated successfully`);
                
                if (editType === 'level') {
                    fetchLevelsByChartId(expandedChart);
                } else if (editType === 'class') {
                    fetchClassesByLevelId(expandedChart, expandedLevel);
                } else if (editType === 'group') {
                    fetchGroupsByClassId(expandedChart, expandedLevel, expandedClass);
                }
                
                setIsEditModalOpen(false);
                setSelectedItemForEdit(null);
            }
        } catch (error) {
            console.error('Error updating:', error);
            toast.error(error.response?.data?.message || 'Failed to update');
        }
    };

    // ============================================
    // HANDLE DELETE OPERATIONS
    // ============================================

    const handleDeleteLevel = async (levelId) => {
        if (window.confirm('Are you sure you want to delete this level?')) {
            try {
                const response = await axios.delete(`/v1/api/chart/${expandedChart}/levels/${levelId}`);
                if (response.data.success) {
                    toast.success('Level deleted successfully');
                    setTotals(prev => ({
                        ...prev,
                        levels: prev.levels - 1
                    }));
                    fetchLevelsByChartId(expandedChart);
                }
            } catch (error) {
                toast.error('Error deleting level');
            }
        }
    };

    const handleDeleteClass = async (classId) => {
        if (window.confirm('Are you sure you want to delete this class?')) {
            try {
                const response = await axios.delete(`/v1/api/chart/${expandedChart}/levels/${expandedLevel}/classes/${classId}`);
                if (response.data.success) {
                    toast.success('Class deleted successfully');
                    setTotals(prev => ({
                        ...prev,
                        classes: prev.classes - 1
                    }));
                    fetchClassesByLevelId(expandedChart, expandedLevel);
                }
            } catch (error) {
                toast.error('Error deleting class');
            }
        }
    };

    const handleDeleteGroup = async (groupId) => {
        if (window.confirm('Are you sure you want to delete this group?')) {
            try {
                const response = await axios.delete(`/v1/api/chart/${expandedChart}/levels/${expandedLevel}/classes/${expandedClass}/groups/${groupId}`);
                if (response.data.success) {
                    toast.success('Group deleted successfully');
                    setTotals(prev => ({
                        ...prev,
                        groups: prev.groups - 1
                    }));
                    fetchGroupsByClassId(expandedChart, expandedLevel, expandedClass);
                }
            } catch (error) {
                toast.error('Error deleting group');
            }
        }
    };

    // ============================================
    // HANDLE VIEW ACCOUNTS
    // ============================================

    const handleViewAccounts = (groupId, groupName, groupCode, chartType) => {
        setSelectedGroupId(groupId);
        setSelectedGroupName(groupName);
        setSelectedGroupCode(groupCode);
        setSelectedChartType(chartType); // Store the chart type
        setShowAccounts(true);
    };

    const handleBackFromAccounts = () => {
        setShowAccounts(false);
        setSelectedGroupId(null);
        setSelectedGroupName('');
        setSelectedGroupCode('');
        setSelectedChartType('');
        if (expandedChart && expandedLevel && expandedClass) {
            fetchGroupsByClassId(expandedChart, expandedLevel, expandedClass);
        }
    };

    // ============================================
    // REFRESH FUNCTIONS
    // ============================================

    const refreshLevels = () => {
        if (expandedChart) fetchLevelsByChartId(expandedChart);
    };

    const refreshClasses = () => {
        if (expandedChart && expandedLevel) fetchClassesByLevelId(expandedChart, expandedLevel);
    };

    const refreshGroups = () => {
        if (expandedChart && expandedLevel && expandedClass) fetchGroupsByClassId(expandedChart, expandedLevel, expandedClass);
    };

    return (
        <div className="p-2 sm:p-1 max-w-7xl mx-auto w-full">
            {!showAccounts ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-200 to-white px-4 sm:px-6 py-3 sm:py-4">
                        <div>
                            <h2 className="text-lg sm:text-xl font-semibold text-[#1a1a1a] flex items-center gap-2">
                                <FaChartPie className='text-green-500' />
                                Chart of Accounts
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600">
                                Manage your hierarchy: Charts → Levels → Classes → Groups → Accounts
                            </p>
                        </div>

                        <div className="flex gap-3">
                            {Buttons.map(({ label, icon }) => (
                                <button
                                    key={label}
                                    onClick={handleAddChart}
                                    className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-3 rounded-lg font-medium transition-colors hover:bg-blue-700 shadow-md hover:shadow-lg"
                                >
                                    {label}
                                    {icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Summary Stats */}
                    {charts.length > 0 && (
                        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs sm:text-sm text-blue-800">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold bg-white px-3 py-1 rounded-full shadow-sm">{charts.length}</span>
                                    <span className="font-medium">Charts</span>
                                </div>
                                <span className="text-blue-300">|</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold bg-white px-3 py-1 rounded-full shadow-sm">{totals.levels}</span>
                                    <span className="font-medium">Levels</span>
                                </div>
                                <span className="text-blue-300">|</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold bg-white px-3 py-1 rounded-full shadow-sm">{totals.classes}</span>
                                    <span className="font-medium">Classes</span>
                                </div>
                                <span className="text-blue-300">|</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold bg-white px-3 py-1 rounded-full shadow-sm">{totals.groups}</span>
                                    <span className="font-medium">Groups</span>
                                </div>
                                <span className="text-blue-300">|</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold bg-white px-3 py-1 rounded-full shadow-sm">{totals.accounts}</span>
                                    <span className="font-medium">Accounts</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-3 text-sm text-gray-600">Loading charts...</p>
                        </div>
                    ) : charts.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <FaChartPie className="mx-auto text-4xl text-gray-300 mb-3" />
                            <p className="mb-4">No charts found. Create your first chart to get started.</p>
                            <button 
                                onClick={handleAddChart}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 shadow-md"
                            >
                                <FaPlus size={14} />
                                Add Chart
                            </button>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {charts.map((chart) => (
                                <div key={chart._id} className="hover:bg-gray-50 transition-colors">
                                    
                                    {/* Chart Header */}
                                    <div
                                        className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between cursor-pointer"
                                        onClick={() => handleChartClick(chart._id)}
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="text-gray-700">
                                                {expandedChart === chart._id ? (
                                                    <FaChevronDown size={14} />
                                                ) : (
                                                    <FaChevronRight size={14} />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="text-base sm:text-lg font-semibold text-gray-800">
                                                        {chart.name}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                                        {chart.code}
                                                    </span>
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                        {chart.type}
                                                    </span>
                                                </div>
                                                <div className="text-xs sm:text-sm text-gray-500 mt-1">
                                                    {chart.levels?.length || 0} levels
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddLevel(chart._id);
                                            }}
                                            className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 text-xs sm:text-sm shadow-md hover:shadow-lg"
                                        >
                                            <FaPlus size={12} />
                                            <span className="hidden sm:inline">Add Level</span>
                                        </button>
                                    </div>

                                    {/* Levels Section */}
                                    {expandedChart === chart._id && (
                                        <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200">
                                            {loadingLevels ? (
                                                <div className="text-center py-4">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                                    <p className="mt-2 text-xs sm:text-sm text-gray-500">Loading levels...</p>
                                                </div>
                                            ) : levels.length === 0 ? (
                                                <div className="text-center py-6">
                                                    <FaLayerGroup className="mx-auto text-3xl text-gray-400 mb-3" />
                                                    <p className="text-sm text-gray-500 mb-3">No levels in this chart</p>
                                                    <button
                                                        onClick={() => handleAddLevel(chart._id)}
                                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 text-sm shadow-md"
                                                    >
                                                        <FaPlus size={14} />
                                                        Create First Level
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {levels.map((level) => (
                                                        <div key={level._id} className="mb-3">
                                                            {/* Level Header */}
                                                            <div
                                                                className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                                                                onClick={() => handleLevelClick(level._id)}
                                                            >
                                                                <div className="flex items-center gap-3 flex-1">
                                                                    <div className="text-blue-600">
                                                                        {expandedLevel === level._id ? (
                                                                            <FaChevronDown size={12} />
                                                                        ) : (
                                                                            <FaChevronRight size={12} />
                                                                        )}
                                                                    </div>
                                                                    <FaLayerGroup className="text-blue-500" size={16} />
                                                                    <div>
                                                                        <span className="font-bold text-gray-800">
                                                                            {level.name}
                                                                        </span>
                                                                        <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                                                                            {level.code}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleAddClass(chart._id, level._id);
                                                                        }}
                                                                        className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                                                                        title="Add Class"
                                                                    >
                                                                        <FaPlus size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleEditLevel(level);
                                                                        }}
                                                                        className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                        title="Edit Level"
                                                                    >
                                                                        <FiEdit3 size={14} />
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDeleteLevel(level._id);
                                                                        }}
                                                                        className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                                                        title="Delete Level"
                                                                    >
                                                                        <MdDelete size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Classes Section */}
                                                            {expandedLevel === level._id && (
                                                                <div className="ml-8 mt-2 pl-4 border-l-2 border-blue-200">
                                                                    {loadingClasses ? (
                                                                        <div className="text-center py-2">
                                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                                                        </div>
                                                                    ) : classes.length === 0 ? (
                                                                        <div className="text-center py-4 bg-gray-50 rounded-lg">
                                                                            <p className="text-xs text-gray-500">No classes in this level</p>
                                                                            <button
                                                                                onClick={() => handleAddClass(chart._id, level._id)}
                                                                                className="mt-2 text-xs text-blue-600 hover:underline"
                                                                            >
                                                                                Add Class
                                                                            </button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="space-y-2">
                                                                            {classes.map((classObj) => (
                                                                                <div key={classObj._id} className="mb-2">
                                                                                    {/* Class Header */}
                                                                                    <div
                                                                                        className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                                                                                        onClick={() => handleClassClick(classObj._id)}
                                                                                    >
                                                                                        <div className="flex items-center gap-2 flex-1">
                                                                                            <div className="text-purple-700">
                                                                                                {expandedClass === classObj._id ? (
                                                                                                    <FaChevronDown size={10} />
                                                                                                ) : (
                                                                                                    <FaChevronRight size={10} />
                                                                                                )}
                                                                                            </div>
                                                                                            <FaSitemap className="text-purple-500" size={14} />
                                                                                            <span className="text-sm font-bold text-gray-800">
                                                                                                {classObj.name}
                                                                                            </span>
                                                                                            <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                                                                                                {classObj.code}
                                                                                            </span>
                                                                                        </div>
                                                                                        <div className="flex items-center gap-1">
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleAddGroup(chart._id, level._id, classObj._id);
                                                                                                }}
                                                                                                className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                                                                                                title="Add Group"
                                                                                            >
                                                                                                <FaPlus size={12} />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleEditClass(classObj);
                                                                                                }}
                                                                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                                                title="Edit Class"
                                                                                            >
                                                                                                <FiEdit3 size={12} />
                                                                                            </button>
                                                                                            <button
                                                                                                onClick={(e) => {
                                                                                                    e.stopPropagation();
                                                                                                    handleDeleteClass(classObj._id);
                                                                                                }}
                                                                                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                                                                                title="Delete Class"
                                                                                            >
                                                                                                <MdDelete size={12} />
                                                                                            </button>
                                                                                        </div>
                                                                                    </div>

                                                                                    {/* Groups Section */}
                                                                                    {expandedClass === classObj._id && (
                                                                                        <div className="ml-6 mt-2 pl-4 border-l-2 border-purple-200">
                                                                                            {loadingGroups ? (
                                                                                                <div className="text-center py-2">
                                                                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                                                                                </div>
                                                                                            ) : groups.length === 0 ? (
                                                                                                <div className="text-center py-3 bg-gray-50 rounded-lg">
                                                                                                    <p className="text-xs text-gray-500">No groups in this class</p>
                                                                                                    <button
                                                                                                        onClick={() => handleAddGroup(chart._id, level._id, classObj._id)}
                                                                                                        className="mt-1 text-xs text-blue-600 hover:underline"
                                                                                                    >
                                                                                                        Add Group
                                                                                                    </button>
                                                                                                </div>
                                                                                            ) : (
                                                                                                groups.map((group) => (
                                                                                                    <div
                                                                                                        key={group._id}
                                                                                                        className="bg-white rounded-lg p-2 mb-2 shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow"
                                                                                                    >
                                                                                                        <div className="flex items-center gap-2">
                                                                                                            <FaFolder className="text-yellow-500" size={14} />
                                                                                                            <span className="text-sm font-bold text-gray-800">
                                                                                                                {group.name}
                                                                                                            </span>
                                                                                                            <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                                                                                                                {group.code}
                                                                                                            </span>
                                                                                                        </div>
                                                                                                        <div className="flex items-center gap-1">
                                                                                                            <button
                                                                                                                onClick={() => handleViewAccounts(
                                                                                                                    group._id, 
                                                                                                                    group.name, 
                                                                                                                    group.code,
                                                                                                                    chart.type // Pass the chart type here
                                                                                                                )}
                                                                                                                className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
                                                                                                                title="View Accounts"
                                                                                                            >
                                                                                                                <MdAccountBalance size={14} />
                                                                                                            </button>
                                                                                                            <button
                                                                                                                onClick={() => handleEditGroup(group)}
                                                                                                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                                                                                title="Edit Group"
                                                                                                            >
                                                                                                                <FiEdit3 size={12} />
                                                                                                            </button>
                                                                                                            <button
                                                                                                                onClick={() => handleDeleteGroup(group._id)}
                                                                                                                className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
                                                                                                                title="Delete Group"
                                                                                                            >
                                                                                                                <MdDelete size={12} />
                                                                                                            </button>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ))
                                                                                            )}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                /* Accounts View */
                <Accounts
                    chartId={expandedChart}
                    chartType={selectedChartType} // Pass the chart type
                    levelId={expandedLevel}
                    classId={expandedClass}
                    groupId={selectedGroupId}
                    groupName={selectedGroupName}
                    groupCode={selectedGroupCode}
                    onBack={handleBackFromAccounts}
                />
            )}

            {/* Modals */}
            {isChartModalOpen && (
                <ChartAdd
                    setIsChartModalOpen={setIsChartModalOpen}
                    fetchCharts={fetchCharts}
                />
            )}

            {isLevelModalOpen && selectedChartId && (
                <LevelAdd
                    setIsLevelModalOpen={setIsLevelModalOpen}
                    chartId={selectedChartId}
                    fetchLevels={refreshLevels}
                />
            )}

            {isClassModalOpen && selectedChartId && selectedLevelId && (
                <ClassAdd
                    setIsClassModalOpen={setIsClassModalOpen}
                    chartId={selectedChartId}
                    levelId={selectedLevelId}
                    fetchClasses={refreshClasses}
                />
            )}

            {isGroupModalOpen && selectedChartId && selectedLevelId && selectedClassId && (
                <GroupAdd
                    setIsGroupModalOpen={setIsGroupModalOpen}
                    chartId={selectedChartId}
                    levelId={selectedLevelId}
                    classId={selectedClassId}
                    fetchGroups={refreshGroups}
                />
            )}

            {/* Edit Modals */}
            {isEditModalOpen && selectedItemForEdit && (
                <>
                    {editType === 'level' && (
                        <LevelAdd
                            setIsLevelModalOpen={setIsEditModalOpen}
                            chartId={expandedChart}
                            levelData={selectedItemForEdit}
                            fetchLevels={refreshLevels}
                            mode="edit"
                            onSubmit={handleEditSubmit}
                        />
                    )}
                    {editType === 'class' && (
                        <ClassAdd
                            setIsClassModalOpen={setIsEditModalOpen}
                            chartId={expandedChart}
                            levelId={expandedLevel}
                            classData={selectedItemForEdit}
                            fetchClasses={refreshClasses}
                            mode="edit"
                            onSubmit={handleEditSubmit}
                        />
                    )}
                    {editType === 'group' && (
                        <GroupAdd
                            setIsGroupModalOpen={setIsEditModalOpen}
                            chartId={expandedChart}
                            levelId={expandedLevel}
                            classId={expandedClass}
                            groupData={selectedItemForEdit}
                            fetchGroups={refreshGroups}
                            mode="edit"
                            onSubmit={handleEditSubmit}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default AccountGroups;

// import React, { useContext, useState, useEffect } from 'react';
// import { AuthContext } from '../../../context/AuthContext';
// import { toast } from 'react-hot-toast';
// import { MdDelete } from "react-icons/md";
// import { FaPlus, FaFolder, FaChartPie, FaLayerGroup, FaSitemap } from "react-icons/fa";
// import { FiEdit3 } from "react-icons/fi";
// import { FaChevronRight, FaChevronDown } from "react-icons/fa6";
// import { MdAccountBalance } from "react-icons/md";
// import ChartAdd from '../components/chartofaccounts/ChartAdd';
// import LevelAdd from '../components/chartofaccounts/LevelAdd';
// import ClassAdd from '../components/chartofaccounts/ClassAdd';
// import GroupAdd from '../components/chartofaccounts/GroupAdd';
// import Accounts from './Accounts';

// const AccountGroups = () => {
//     // Button configurations
//     const Buttons = [
//         { label: 'New Chart', icon: <FaPlus className="text-white" size={18} />, action: 'chart' }
//     ];

//     // Modal states
//     const [isChartModalOpen, setIsChartModalOpen] = useState(false);
//     const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
//     const [isClassModalOpen, setIsClassModalOpen] = useState(false);
//     const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    
//     // Selected IDs for nested operations
//     const [selectedChartId, setSelectedChartId] = useState(null);
//     const [selectedLevelId, setSelectedLevelId] = useState(null);
//     const [selectedClassId, setSelectedClassId] = useState(null);
//     const [selectedGroupId, setSelectedGroupId] = useState(null);
    
//     // Edit states
//     const [selectedItemForEdit, setSelectedItemForEdit] = useState(null);
//     const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//     const [editType, setEditType] = useState(''); // 'level', 'class', 'group', 'account'

//     // Accounts view states
//     const [showAccounts, setShowAccounts] = useState(false);
//     const [selectedGroupName, setSelectedGroupName] = useState('');
//     const [selectedGroupCode, setSelectedGroupCode] = useState('');

//     const { axios } = useContext(AuthContext);
//     const [loading, setLoading] = useState(true);
//     const [charts, setCharts] = useState([]);
    
//     // Expanded/collapsed states
//     const [expandedChart, setExpandedChart] = useState(null);
//     const [expandedLevel, setExpandedLevel] = useState(null);
//     const [expandedClass, setExpandedClass] = useState(null);
    
//     // Data for expanded levels
//     const [levels, setLevels] = useState([]);
//     const [classes, setClasses] = useState([]);
//     const [groups, setGroups] = useState([]);
    
//     // Loading states
//     const [loadingLevels, setLoadingLevels] = useState(false);
//     const [loadingClasses, setLoadingClasses] = useState(false);
//     const [loadingGroups, setLoadingGroups] = useState(false);

//     // ============================================
//     // TOTALS STATE - Track all counts
//     // ============================================
//     const [totals, setTotals] = useState({
//         levels: 0,
//         classes: 0,
//         groups: 0,
//         accounts: 0
//     });

//     // ============================================
//     // FETCH FUNCTIONS
//     // ============================================

//     // Fetch all charts
//     const fetchCharts = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get('/v1/api/chart');
//             console.log('📊 Charts API Response:', response.data);
            
//             if (response.data.success) {
//                 const chartsData = response.data.charts || [];
//                 setCharts(chartsData);
                
//                 // Calculate initial totals from chart data if available
//                 calculateTotalsFromCharts(chartsData);
//             } else {
//                 toast.error('Failed to fetch charts');
//             }
//         } catch (error) {
//             console.error('Error fetching charts:', error);
//             toast.error('Error loading charts');
//         } finally {
//             setLoading(false);
//         }
//     };

//     // Calculate totals from charts data (if nested data exists)
//     const calculateTotalsFromCharts = (chartsData) => {
//         const newTotals = chartsData.reduce((acc, chart) => {
//             // Levels
//             const chartLevels = chart.levels?.length || 0;
            
//             // Classes
//             const chartClasses = chart.levels?.reduce((sum, level) => 
//                 sum + (level.classes?.length || 0), 0) || 0;
            
//             // Groups
//             const chartGroups = chart.levels?.reduce((sum, level) => 
//                 sum + (level.classes?.reduce((gSum, cls) => 
//                     gSum + (cls.groups?.length || 0), 0) || 0), 0) || 0;
            
//             // Accounts
//             const chartAccounts = chart.levels?.reduce((sum, level) => 
//                 sum + (level.classes?.reduce((cSum, cls) => 
//                     cSum + (cls.groups?.reduce((gSum, group) => 
//                         gSum + (group.accounts?.length || 0), 0) || 0), 0) || 0), 0) || 0;
            
//             return {
//                 levels: acc.levels + chartLevels,
//                 classes: acc.classes + chartClasses,
//                 groups: acc.groups + chartGroups,
//                 accounts: acc.accounts + chartAccounts
//             };
//         }, { levels: 0, classes: 0, groups: 0, accounts: 0 });
        
//         console.log('📊 Calculated Totals from Charts:', newTotals);
//         setTotals(newTotals);
//     };

//     // Fetch levels for a specific chart
//     const fetchLevelsByChartId = async (chartId) => {
//         setLoadingLevels(true);
//         try {
//             const response = await axios.get(`/v1/api/chart/${chartId}/levels`);
//             console.log('📊 Levels API Response:', response.data);
            
//             if (response.data.success) {
//                 const levelsData = response.data.levels || [];
//                 setLevels(levelsData);
                
//                 // Update totals with new levels
//                 setTotals(prev => {
//                     const newTotals = {
//                         ...prev,
//                         levels: prev.levels + levelsData.length
//                     };
//                     console.log('📊 Updated Totals after Levels fetch:', newTotals);
//                     return newTotals;
//                 });
//             } else {
//                 toast.error('Failed to fetch levels');
//             }
//         } catch (error) {
//             console.error('Error fetching levels:', error);
//             toast.error('Error loading levels');
//         } finally {
//             setLoadingLevels(false);
//         }
//     };

//     // Fetch classes for a specific level
//     const fetchClassesByLevelId = async (chartId, levelId) => {
//         setLoadingClasses(true);
//         try {
//             const response = await axios.get(`/v1/api/chart/${chartId}/levels/${levelId}/classes`);
//             console.log('📊 Classes API Response:', response.data);
            
//             if (response.data.success) {
//                 const classesData = response.data.classes || [];
//                 setClasses(classesData);
                
//                 // Update totals with new classes
//                 setTotals(prev => {
//                     const newTotals = {
//                         ...prev,
//                         classes: prev.classes + classesData.length
//                     };
//                     console.log('📊 Updated Totals after Classes fetch:', newTotals);
//                     return newTotals;
//                 });
//             } else {
//                 toast.error('Failed to fetch classes');
//             }
//         } catch (error) {
//             console.error('Error fetching classes:', error);
//             toast.error('Error loading classes');
//         } finally {
//             setLoadingClasses(false);
//         }
//     };

//     // Fetch groups for a specific class
//     const fetchGroupsByClassId = async (chartId, levelId, classId) => {
//         setLoadingGroups(true);
//         try {
//             const response = await axios.get(`/v1/api/chart/${chartId}/levels/${levelId}/classes/${classId}/groups`);
//             console.log('📊 Groups API Response:', response.data);
            
//             if (response.data.success) {
//                 const groupsData = response.data.groups || [];
//                 setGroups(groupsData);
                
//                 // Update totals with new groups
//                 setTotals(prev => {
//                     const newTotals = {
//                         ...prev,
//                         groups: prev.groups + groupsData.length
//                     };
//                     console.log('📊 Updated Totals after Groups fetch:', newTotals);
//                     return newTotals;
//                 });
//             } else {
//                 toast.error('Failed to fetch groups');
//             }
//         } catch (error) {
//             console.error('Error fetching groups:', error);
//             toast.error('Error loading groups');
//         } finally {
//             setLoadingGroups(false);
//         }
//     };

//     // Load charts on component mount
//     useEffect(() => {
//         fetchCharts();
//     }, []);

//     // ============================================
//     // HANDLE EXPAND/COLLAPSE
//     // ============================================

//     const handleChartClick = (chartId) => {
//         if (expandedChart === chartId) {
//             setExpandedChart(null);
//             setLevels([]);
//             setExpandedLevel(null);
//             setClasses([]);
//             setExpandedClass(null);
//             setGroups([]);
//             setShowAccounts(false);
//         } else {
//             setExpandedChart(chartId);
//             fetchLevelsByChartId(chartId);
//             setExpandedLevel(null);
//             setClasses([]);
//             setExpandedClass(null);
//             setGroups([]);
//             setShowAccounts(false);
//         }
//     };

//     const handleLevelClick = (levelId) => {
//         if (expandedLevel === levelId) {
//             setExpandedLevel(null);
//             setClasses([]);
//             setExpandedClass(null);
//             setGroups([]);
//         } else {
//             setExpandedLevel(levelId);
//             fetchClassesByLevelId(expandedChart, levelId);
//             setExpandedClass(null);
//             setGroups([]);
//         }
//     };

//     const handleClassClick = (classId) => {
//         if (expandedClass === classId) {
//             setExpandedClass(null);
//             setGroups([]);
//         } else {
//             setExpandedClass(classId);
//             fetchGroupsByClassId(expandedChart, expandedLevel, classId);
//         }
//     };

//     // ============================================
//     // HANDLE ADD OPERATIONS (Update totals)
//     // ============================================

//     const handleAddChart = () => {
//         setIsChartModalOpen(true);
//     };

//     const handleAddLevel = (chartId) => {
//         setSelectedChartId(chartId);
//         setIsLevelModalOpen(true);
//     };

//     const handleAddClass = (chartId, levelId) => {
//         setSelectedChartId(chartId);
//         setSelectedLevelId(levelId);
//         setIsClassModalOpen(true);
//     };

//     const handleAddGroup = (chartId, levelId, classId) => {
//         setSelectedChartId(chartId);
//         setSelectedLevelId(levelId);
//         setSelectedClassId(classId);
//         setIsGroupModalOpen(true);
//     };

//     // ============================================
//     // HANDLE EDIT OPERATIONS
//     // ============================================

//     const handleEditLevel = (level) => {
//         setSelectedItemForEdit(level);
//         setEditType('level');
//         setIsEditModalOpen(true);
//     };

//     const handleEditClass = (classObj) => {
//         setSelectedItemForEdit(classObj);
//         setEditType('class');
//         setIsEditModalOpen(true);
//     };

//     const handleEditGroup = (group) => {
//         setSelectedItemForEdit(group);
//         setEditType('group');
//         setIsEditModalOpen(true);
//     };

//     const handleEditSubmit = async (updatedData) => {
//         try {
//             let response;
//             const { name, nameArb, code } = updatedData;

//             if (editType === 'level') {
//                 response = await axios.put(`/v1/api/chart/${expandedChart}/levels/${selectedItemForEdit._id}`, {
//                     name, nameArb, code
//                 });
//             } else if (editType === 'class') {
//                 response = await axios.put(`/v1/api/chart/${expandedChart}/levels/${expandedLevel}/classes/${selectedItemForEdit._id}`, {
//                     name, nameArb, code
//                 });
//             } else if (editType === 'group') {
//                 response = await axios.put(`/v1/api/chart/${expandedChart}/levels/${expandedLevel}/classes/${expandedClass}/groups/${selectedItemForEdit._id}`, {
//                     name, nameArb, code
//                 });
//             }

//             if (response?.data.success) {
//                 toast.success(`${editType} updated successfully`);
                
//                 // Refresh appropriate data
//                 if (editType === 'level') {
//                     fetchLevelsByChartId(expandedChart);
//                 } else if (editType === 'class') {
//                     fetchClassesByLevelId(expandedChart, expandedLevel);
//                 } else if (editType === 'group') {
//                     fetchGroupsByClassId(expandedChart, expandedLevel, expandedClass);
//                 }
                
//                 setIsEditModalOpen(false);
//                 setSelectedItemForEdit(null);
//             }
//         } catch (error) {
//             console.error('Error updating:', error);
//             toast.error(error.response?.data?.message || 'Failed to update');
//         }
//     };

//     // ============================================
//     // HANDLE DELETE OPERATIONS (Update totals)
//     // ============================================

//     const handleDeleteLevel = async (levelId) => {
//         if (window.confirm('Are you sure you want to delete this level?')) {
//             try {
//                 const response = await axios.delete(`/v1/api/chart/${expandedChart}/levels/${levelId}`);
//                 if (response.data.success) {
//                     toast.success('Level deleted successfully');
//                     // Update totals
//                     setTotals(prev => ({
//                         ...prev,
//                         levels: prev.levels - 1
//                     }));
//                     fetchLevelsByChartId(expandedChart);
//                 }
//             } catch (error) {
//                 toast.error('Error deleting level');
//             }
//         }
//     };

//     const handleDeleteClass = async (classId) => {
//         if (window.confirm('Are you sure you want to delete this class?')) {
//             try {
//                 const response = await axios.delete(`/v1/api/chart/${expandedChart}/levels/${expandedLevel}/classes/${classId}`);
//                 if (response.data.success) {
//                     toast.success('Class deleted successfully');
//                     // Update totals
//                     setTotals(prev => ({
//                         ...prev,
//                         classes: prev.classes - 1
//                     }));
//                     fetchClassesByLevelId(expandedChart, expandedLevel);
//                 }
//             } catch (error) {
//                 toast.error('Error deleting class');
//             }
//         }
//     };

//     const handleDeleteGroup = async (groupId) => {
//         if (window.confirm('Are you sure you want to delete this group?')) {
//             try {
//                 const response = await axios.delete(`/v1/api/chart/${expandedChart}/levels/${expandedLevel}/classes/${expandedClass}/groups/${groupId}`);
//                 if (response.data.success) {
//                     toast.success('Group deleted successfully');
//                     // Update totals
//                     setTotals(prev => ({
//                         ...prev,
//                         groups: prev.groups - 1
//                     }));
//                     fetchGroupsByClassId(expandedChart, expandedLevel, expandedClass);
//                 }
//             } catch (error) {
//                 toast.error('Error deleting group');
//             }
//         }
//     };

//     // ============================================
//     // HANDLE VIEW ACCOUNTS
//     // ============================================

//     const handleViewAccounts = (groupId, groupName, groupCode) => {
//         setSelectedGroupId(groupId);
//         setSelectedGroupName(groupName);
//         setSelectedGroupCode(groupCode);
//         setShowAccounts(true);
//     };

//     const handleBackFromAccounts = () => {
//         setShowAccounts(false);
//         setSelectedGroupId(null);
//         setSelectedGroupName('');
//         setSelectedGroupCode('');
//         // Refresh groups when coming back
//         if (expandedChart && expandedLevel && expandedClass) {
//             fetchGroupsByClassId(expandedChart, expandedLevel, expandedClass);
//         }
//     };

//     // ============================================
//     // REFRESH FUNCTIONS
//     // ============================================

//     const refreshLevels = () => {
//         if (expandedChart) {
//             fetchLevelsByChartId(expandedChart);
//         }
//     };

//     const refreshClasses = () => {
//         if (expandedChart && expandedLevel) {
//             fetchClassesByLevelId(expandedChart, expandedLevel);
//         }
//     };

//     const refreshGroups = () => {
//         if (expandedChart && expandedLevel && expandedClass) {
//             fetchGroupsByClassId(expandedChart, expandedLevel, expandedClass);
//         }
//     };

//     return (
//         <div className="p-2 sm:p-1 max-w-7xl mx-auto w-full">
//             {!showAccounts ? (
//                 <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                    
//                     {/* Header Section */}
//                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-200 to-white px-4 sm:px-6 py-3 sm:py-4">
//                         <div>
//                             <h2 className="text-lg sm:text-xl font-semibold text-[#1a1a1a] flex items-center gap-2">
//                                 <FaChartPie className='text-green-500' />
//                                 Chart of Accounts
//                             </h2>
//                             <p className="text-sm sm:text-base text-gray-600">
//                                 Manage your hierarchy: Charts → Levels → Classes → Groups → Accounts
//                             </p>
//                         </div>

//                         <div className="flex gap-3">
//                             {Buttons.map(({ label, icon, action }) => (
//                                 <button
//                                     key={label}
//                                     onClick={() => handleAddChart()}
//                                     className="flex items-center gap-2 bg-blue-600 text-white px-4 md:px-6 py-3 rounded-lg font-medium transition-colors hover:bg-blue-700 shadow-md hover:shadow-lg"
//                                 >
//                                     {label}
//                                     {icon}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>

//                     {/* Summary Stats */}
//                     {charts.length > 0 && (
//                         <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
//                             <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs sm:text-sm text-blue-800">
//                                 <div className="flex items-center gap-2">
//                                     <span className="font-bold bg-white px-3 py-1 rounded-full shadow-sm">{charts.length}</span>
//                                     <span className="font-medium">Charts</span>
//                                 </div>
//                                 <span className="text-blue-300">|</span>
//                                 <div className="flex items-center gap-2">
//                                     <span className="font-bold bg-white px-3 py-1 rounded-full shadow-sm">{totals.levels}</span>
//                                     <span className="font-medium">Levels</span>
//                                 </div>
//                                 <span className="text-blue-300">|</span>
//                                 <div className="flex items-center gap-2">
//                                     <span className="font-bold bg-white px-3 py-1 rounded-full shadow-sm">{totals.classes}</span>
//                                     <span className="font-medium">Classes</span>
//                                 </div>
//                                 <span className="text-blue-300">|</span>
//                                 <div className="flex items-center gap-2">
//                                     <span className="font-bold bg-white px-3 py-1 rounded-full shadow-sm">{totals.groups}</span>
//                                     <span className="font-medium">Groups</span>
//                                 </div>
//                                 <span className="text-blue-300">|</span>
//                                 <div className="flex items-center gap-2">
//                                     <span className="font-bold bg-white px-3 py-1 rounded-full shadow-sm">{totals.accounts}</span>
//                                     <span className="font-medium">Accounts</span>
//                                 </div>
//                             </div>
//                         </div>
//                     )}

//                     {loading ? (
//                         <div className="p-8 text-center">
//                             <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
//                             <p className="mt-3 text-sm text-gray-600">Loading charts...</p>
//                         </div>
//                     ) : charts.length === 0 ? (
//                         <div className="p-8 text-center text-gray-500">
//                             <FaChartPie className="mx-auto text-4xl text-gray-300 mb-3" />
//                             <p className="mb-4">No charts found. Create your first chart to get started.</p>
//                             <button 
//                                 onClick={() => handleAddChart()}
//                                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 shadow-md"
//                             >
//                                 <FaPlus size={14} />
//                                 Add Chart
//                             </button>
//                         </div>
//                     ) : (
//                         <div className="divide-y divide-gray-200">
//                             {charts.map((chart) => (
//                                 <div key={chart._id} className="hover:bg-gray-50 transition-colors">
//                                     {/* Chart Header */}
//                                     <div
//                                         className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between cursor-pointer"
//                                         onClick={() => handleChartClick(chart._id)}
//                                     >
//                                         <div className="flex items-center gap-3 flex-1">
//                                             <div className="text-gray-700">
//                                                 {expandedChart === chart._id ? (
//                                                     <FaChevronDown size={14} />
//                                                 ) : (
//                                                     <FaChevronRight size={14} />
//                                                 )}
//                                             </div>
//                                             <div className="flex-1">
//                                                 <div className="flex flex-wrap items-center gap-2">
//                                                     <span className="text-base sm:text-lg font-semibold text-gray-800">
//                                                         {chart.name}
//                                                     </span>
//                                                     <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
//                                                         {chart.code}
//                                                     </span>
//                                                     <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
//                                                         {chart.type}
//                                                     </span>
//                                                 </div>
//                                                 <div className="text-xs sm:text-sm text-gray-500 mt-1">
//                                                     {chart.levels?.length || 0} levels
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <button
//                                             onClick={(e) => {
//                                                 e.stopPropagation();
//                                                 handleAddLevel(chart._id);
//                                             }}
//                                             className="px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1 text-xs sm:text-sm shadow-md hover:shadow-lg"
//                                         >
//                                             <FaPlus size={12} />
//                                             <span className="hidden sm:inline">Add Level</span>
//                                         </button>
//                                     </div>

//                                     {/* Levels Section */}
//                                     {expandedChart === chart._id && (
//                                         <div className="bg-gray-50 px-4 sm:px-6 py-4 border-t border-gray-200">
//                                             {loadingLevels ? (
//                                                 <div className="text-center py-4">
//                                                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
//                                                     <p className="mt-2 text-xs sm:text-sm text-gray-500">Loading levels...</p>
//                                                 </div>
//                                             ) : levels.length === 0 ? (
//                                                 <div className="text-center py-6">
//                                                     <FaLayerGroup className="mx-auto text-3xl text-gray-400 mb-3" />
//                                                     <p className="text-sm text-gray-500 mb-3">No levels in this chart</p>
//                                                     <button
//                                                         onClick={() => handleAddLevel(chart._id)}
//                                                         className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2 text-sm shadow-md"
//                                                     >
//                                                         <FaPlus size={14} />
//                                                         Create First Level
//                                                     </button>
//                                                 </div>
//                                             ) : (
//                                                 levels.map((level) => (
//                                                     <div key={level._id} className="mb-3">
//                                                         {/* Level Header */}
//                                                         <div
//                                                             className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
//                                                             onClick={() => handleLevelClick(level._id)}
//                                                         >
//                                                             <div className="flex items-center gap-3 flex-1">
//                                                                 <div className="text-blue-600">
//                                                                     {expandedLevel === level._id ? (
//                                                                         <FaChevronDown size={12} />
//                                                                     ) : (
//                                                                         <FaChevronRight size={12} />
//                                                                     )}
//                                                                 </div>
//                                                                 <FaLayerGroup className="text-blue-500" size={16} />
//                                                                 <div>
//                                                                     <span className="font-bold text-gray-800">
//                                                                         {level.name}
//                                                                     </span>
//                                                                     <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
//                                                                         {level.code}
//                                                                     </span>
//                                                                 </div>
//                                                             </div>
//                                                             <div className="flex items-center gap-2">
//                                                                 <button
//                                                                     onClick={(e) => {
//                                                                         e.stopPropagation();
//                                                                         handleAddClass(chart._id, level._id);
//                                                                     }}
//                                                                     className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
//                                                                     title="Add Class"
//                                                                 >
//                                                                     <FaPlus size={14} />
//                                                                 </button>
//                                                                 <button
//                                                                     onClick={(e) => {
//                                                                         e.stopPropagation();
//                                                                         handleEditLevel(level);
//                                                                     }}
//                                                                     className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
//                                                                     title="Edit Level"
//                                                                 >
//                                                                     <FiEdit3 size={14} />
//                                                                 </button>
//                                                                 <button
//                                                                     onClick={(e) => {
//                                                                         e.stopPropagation();
//                                                                         handleDeleteLevel(level._id);
//                                                                     }}
//                                                                     className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
//                                                                     title="Delete Level"
//                                                                 >
//                                                                     <MdDelete size={14} />
//                                                                 </button>
//                                                             </div>
//                                                         </div>

//                                                         {/* Classes Section */}
//                                                         {expandedLevel === level._id && (
//                                                             <div className="ml-8 mt-2 pl-4 border-l-2 border-blue-200">
//                                                                 {loadingClasses ? (
//                                                                     <div className="text-center py-2">
//                                                                         <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
//                                                                     </div>
//                                                                 ) : classes.length === 0 ? (
//                                                                     <div className="text-center py-4 bg-gray-50 rounded-lg">
//                                                                         <p className="text-xs text-gray-500">No classes in this level</p>
//                                                                         <button
//                                                                             onClick={() => handleAddClass(chart._id, level._id)}
//                                                                             className="mt-2 text-xs text-blue-600 hover:underline"
//                                                                         >
//                                                                             Add Class
//                                                                         </button>
//                                                                     </div>
//                                                                 ) : (
//                                                                     classes.map((classObj) => (
//                                                                         <div key={classObj._id} className="mb-2">
//                                                                             {/* Class Header */}
//                                                                             <div
//                                                                                 className="bg-white rounded-lg p-2 shadow-sm border border-gray-200 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
//                                                                                 onClick={() => handleClassClick(classObj._id)}
//                                                                             >
//                                                                                 <div className="flex items-center gap-2 flex-1">
//                                                                                     <div className="text-purple-700">
//                                                                                         {expandedClass === classObj._id ? (
//                                                                                             <FaChevronDown size={10} />
//                                                                                         ) : (
//                                                                                             <FaChevronRight size={10} />
//                                                                                         )}
//                                                                                     </div>
//                                                                                     <FaSitemap className="text-purple-500" size={14} />
//                                                                                     <span className="text-sm font-bold text-gray-800">
//                                                                                         {classObj.name}
//                                                                                     </span>
//                                                                                     <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
//                                                                                         {classObj.code}
//                                                                                     </span>
//                                                                                 </div>
//                                                                                 <div className="flex items-center gap-1">
//                                                                                     <button
//                                                                                         onClick={(e) => {
//                                                                                             e.stopPropagation();
//                                                                                             handleAddGroup(chart._id, level._id, classObj._id);
//                                                                                         }}
//                                                                                         className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
//                                                                                         title="Add Group"
//                                                                                     >
//                                                                                         <FaPlus size={12} />
//                                                                                     </button>
//                                                                                     <button
//                                                                                         onClick={(e) => {
//                                                                                             e.stopPropagation();
//                                                                                             handleEditClass(classObj);
//                                                                                         }}
//                                                                                         className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
//                                                                                         title="Edit Class"
//                                                                                     >
//                                                                                         <FiEdit3 size={12} />
//                                                                                     </button>
//                                                                                     <button
//                                                                                         onClick={(e) => {
//                                                                                             e.stopPropagation();
//                                                                                             handleDeleteClass(classObj._id);
//                                                                                         }}
//                                                                                         className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
//                                                                                         title="Delete Class"
//                                                                                     >
//                                                                                         <MdDelete size={12} />
//                                                                                     </button>
//                                                                                 </div>
//                                                                             </div>

//                                                                             {/* Groups Section */}
//                                                                             {expandedClass === classObj._id && (
//                                                                                 <div className="ml-6 mt-2 pl-4 border-l-2 border-purple-200">
//                                                                                     {loadingGroups ? (
//                                                                                         <div className="text-center py-2">
//                                                                                             <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
//                                                                                         </div>
//                                                                                     ) : groups.length === 0 ? (
//                                                                                         <div className="text-center py-3 bg-gray-50 rounded-lg">
//                                                                                             <p className="text-xs text-gray-500">No groups in this class</p>
//                                                                                             <button
//                                                                                                 onClick={() => handleAddGroup(chart._id, level._id, classObj._id)}
//                                                                                                 className="mt-1 text-xs text-blue-600 hover:underline"
//                                                                                             >
//                                                                                                 Add Group
//                                                                                             </button>
//                                                                                         </div>
//                                                                                     ) : (
//                                                                                         groups.map((group) => (
//                                                                                             <div
//                                                                                                 key={group._id}
//                                                                                                 className="bg-white rounded-lg p-2 mb-2 shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition-shadow"
//                                                                                             >
//                                                                                                 <div className="flex items-center gap-2">
//                                                                                                     <FaFolder className="text-yellow-500" size={14} />
//                                                                                                     <span className="text-sm font-bold text-gray-800">
//                                                                                                         {group.name}
//                                                                                                     </span>
//                                                                                                     <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
//                                                                                                         {group.code}
//                                                                                                     </span>
//                                                                                                 </div>
//                                                                                                 <div className="flex items-center gap-1">
//                                                                                                     <button
//                                                                                                         onClick={() => handleViewAccounts(group._id, group.name, group.code)}
//                                                                                                         className="p-1 text-green-600 hover:bg-green-50 rounded-lg"
//                                                                                                         title="View Accounts"
//                                                                                                     >
//                                                                                                         <MdAccountBalance size={14} />
//                                                                                                     </button>
//                                                                                                     <button
//                                                                                                         onClick={() => handleEditGroup(group)}
//                                                                                                         className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
//                                                                                                         title="Edit Group"
//                                                                                                     >
//                                                                                                         <FiEdit3 size={12} />
//                                                                                                     </button>
//                                                                                                     <button
//                                                                                                         onClick={() => handleDeleteGroup(group._id)}
//                                                                                                         className="p-1 text-red-600 hover:bg-red-50 rounded-lg"
//                                                                                                         title="Delete Group"
//                                                                                                     >
//                                                                                                         <MdDelete size={12} />
//                                                                                                     </button>
//                                                                                                 </div>
//                                                                                             </div>
//                                                                                         ))
//                                                                                     )}
//                                                                                 </div>
//                                                                             )}
//                                                                         </div>
//                                                                     ))
//                                                                 )}
//                                                             </div>
//                                                         )}
//                                                     </div>
//                                                 ))
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </div>
//             ) : (
//                 /* Accounts View */
//                 <Accounts
//                     chartId={expandedChart}
//                     levelId={expandedLevel}
//                     classId={expandedClass}
//                     groupId={selectedGroupId}
//                     groupName={selectedGroupName}
//                     groupCode={selectedGroupCode}
//                     onBack={handleBackFromAccounts}
//                 />
//             )}

//             {/* Add Chart Modal */}
//             {isChartModalOpen && (
//                 <ChartAdd
//                     setIsChartModalOpen={setIsChartModalOpen}
//                     fetchCharts={fetchCharts}
//                 />
//             )}

//             {/* Add Level Modal */}
//             {isLevelModalOpen && selectedChartId && (
//                 <LevelAdd
//                     setIsLevelModalOpen={setIsLevelModalOpen}
//                     chartId={selectedChartId}
//                     fetchLevels={refreshLevels}
//                 />
//             )}

//             {/* Add Class Modal */}
//             {isClassModalOpen && selectedChartId && selectedLevelId && (
//                 <ClassAdd
//                     setIsClassModalOpen={setIsClassModalOpen}
//                     chartId={selectedChartId}
//                     levelId={selectedLevelId}
//                     fetchClasses={refreshClasses}
//                 />
//             )}

//             {/* Add Group Modal */}
//             {isGroupModalOpen && selectedChartId && selectedLevelId && selectedClassId && (
//                 <GroupAdd
//                     setIsGroupModalOpen={setIsGroupModalOpen}
//                     chartId={selectedChartId}
//                     levelId={selectedLevelId}
//                     classId={selectedClassId}
//                     fetchGroups={refreshGroups}
//                 />
//             )}

//             {/* Edit Modal - Reuse existing modals with edit mode */}
//             {isEditModalOpen && selectedItemForEdit && (
//                 <>
//                     {editType === 'level' && (
//                         <LevelAdd
//                             setIsLevelModalOpen={setIsEditModalOpen}
//                             chartId={expandedChart}
//                             levelData={selectedItemForEdit}
//                             fetchLevels={refreshLevels}
//                             mode="edit"
//                             onSubmit={handleEditSubmit}
//                         />
//                     )}
//                     {editType === 'class' && (
//                         <ClassAdd
//                             setIsClassModalOpen={setIsEditModalOpen}
//                             chartId={expandedChart}
//                             levelId={expandedLevel}
//                             classData={selectedItemForEdit}
//                             fetchClasses={refreshClasses}
//                             mode="edit"
//                             onSubmit={handleEditSubmit}
//                         />
//                     )}
//                     {editType === 'group' && (
//                         <GroupAdd
//                             setIsGroupModalOpen={setIsEditModalOpen}
//                             chartId={expandedChart}
//                             levelId={expandedLevel}
//                             classId={expandedClass}
//                             groupData={selectedItemForEdit}
//                             fetchGroups={refreshGroups}
//                             mode="edit"
//                             onSubmit={handleEditSubmit}
//                         />
//                     )}
//                 </>
//             )}
//         </div>
//     );
// };

// export default AccountGroups;

import { AuthContext } from '../../../../context/AuthContext';
import { useContext, useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { IoCloseCircle } from 'react-icons/io5';
import { LuSquareCheckBig } from "react-icons/lu";
import { FaPlus, FaBalanceScale, FaChartLine } from "react-icons/fa";
import { MdOutlineAccountBalance } from "react-icons/md";

const ChartAdd = ({ setIsChartModalOpen, fetchCharts }) => {
    const { axios } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [nameArb, setNameArb] = useState('');
    const [code, setCode] = useState('');
    const [type, setType] = useState(''); // New state for type
    const [formErrors, setFormErrors] = useState({});

    // Focus on input when modal opens
    const inputRef = useRef(null);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Validate form
    const validateForm = () => {
        const errors = {};
        
        if (!name.trim()) {
            errors.name = 'Chart name is required';
        }
        
        if (!code.trim()) {
            errors.code = 'Chart code is required';
        }

        if (!type) {
            errors.type = 'Chart type is required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        // Validate before submission
        if (!validateForm()) {
            toast.error('Please fill in all required fields');
            return;
        }
        
        if (isLoading) return;
        
        setIsLoading(true);

        try {
            const response = await axios.post('/v1/api/chart/', {
                name: name.trim(),
                nameArb: nameArb.trim(),
                code: code.trim(),
                type: type // Send the selected type
            });

            if (response.data) {
                toast.success('Chart added successfully!');
                setName('');
                setNameArb('');
                setCode('');
                setType('');
                setFormErrors({});
                setIsChartModalOpen(false);
                if (fetchCharts) {
                    fetchCharts();
                }
            }
        } catch (error) {
            console.error('Error adding chart:', error);
            toast.error(error.response?.data?.message || 'Failed to add chart');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsChartModalOpen(false);
    };

    const handleInputChange = (e, setter, field) => {
        setter(e.target.value);
        // Clear error for this field when user types
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Get icon based on selected type
    const getTypeIcon = () => {
        if (type === 'Balance Sheet') return <FaBalanceScale className="text-blue-600" size={20} />;
        if (type === 'Profit & Loss') return <FaChartLine className="text-green-600" size={20} />;
        return <MdOutlineAccountBalance className="text-gray-400" size={20} />;
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop with blue tint */}
            <div 
                className="fixed inset-0 bg-opacity-50 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            ></div>
            
            {/* Modal */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all border-2 border-blue-200"
                >
                    {/* Modal Header - Open Blue Theme */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                                    <FaPlus className="text-white" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">
                                        Add New Level
                                    </h3>
                                    <p className="text-sm text-blue-100 mt-0.5">
                                        Create a new level
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white hover:text-blue-100 transition-colors p-1 hover:bg-white/10 rounded-lg"
                                title="Close"
                            >
                                <IoCloseCircle size={28} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Modal Body */}
                    <form onSubmit={onSubmitHandler} className="p-6">
                        {/* Chart Type Selection - New Field */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Level Type <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                                    {getTypeIcon()}
                                </div>
                                <select
                                    value={type}
                                    onChange={(e) => handleInputChange(e, setType, 'type')}
                                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 appearance-none cursor-pointer ${
                                        formErrors.type 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                                >
                                    <option value="" disabled>Select chart type</option>
                                    <option value="Balance Sheet" className="py-2">📊 Balance Sheet</option>
                                    <option value="Profit & Loss" className="py-2">📈 Profit & Loss</option>
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                            {formErrors.type && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                    <span className="text-red-500">⚠️</span>
                                    {formErrors.type}
                                </p>
                            )}
                        </div>

                        {/* Chart Name Input */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Level Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={name}
                                    onChange={(e) => handleInputChange(e, setName, 'name')}
                                    placeholder="e.g., Standard Level Name"
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                                        formErrors.name 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <span className="text-red-500">⚠️</span>
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Arabic Name <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={nameArb}
                                    onChange={(e) => handleInputChange(e, setNameArb, 'nameArb')}
                                    placeholder="e.g., Standard Arabic Name"
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                                        formErrors.nameArb 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <span className="text-red-500">⚠️</span>
                                        {formErrors.nameArb}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {/* Chart Code Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Chart Code <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => handleInputChange(e, setCode, 'code')}
                                    placeholder="e.g., COA-001"
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
                                        formErrors.code 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                                />
                                {formErrors.code && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <span className="text-red-500">⚠️</span>
                                        {formErrors.code}
                                    </p>
                                )}
                                {!formErrors.code && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Code must be unique
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {/* Info Box - Updated with type info */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300 shadow-inner">
                            <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
                                <LuSquareCheckBig className="text-blue-600" size={18} />
                                {/* Chart Information */}
                                <p className="text-xs text-blue-700">Select chart type & Assign a unique code</p>
                            </h4>
                            <div className="space-y-1">
                                {/* <div className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        *
                                    </div>
                                    <p className="text-xs text-blue-700">Select chart type (Balance Sheet or Profit & Loss)</p>
                                   
                                </div> */}
                                {/* <div className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        2
                                    </div>
                                    <p className="text-xs text-blue-700">Enter a descriptive name for your chart</p>
                                </div> */}
                                {/* <div className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                        2
                                    </div>
                                    <p className="text-xs text-blue-700">Assign a unique code following your convention</p>
                                </div> */}
                            </div>
                        </div>
                        
                        {/* Modal Footer - Action Buttons with Open Blue */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-blue-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-3 border-2 border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200 order-2 sm:order-1"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPlus size={16} />
                                        <span>Create Chart</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer Note */}
                    <div className="px-6 pb-4 text-center">
                        <p className="text-xs text-blue-400">
                            <span className="text-red-500">*</span> Required fields
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default ChartAdd;
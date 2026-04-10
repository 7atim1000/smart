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
    const [type, setType] = useState('');
    const [formErrors, setFormErrors] = useState({});

    // RTL flag
    const isRTL = true;

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
            errors.name = 'اسم المستوى مطلوب';
        }
        
        if (!nameArb.trim()) {
            errors.nameArb = 'الاسم العربي للمستوى مطلوب';
        }
        
        if (!code.trim()) {
            errors.code = 'كود المستوى مطلوب';
        }

        if (!type) {
            errors.type = 'نوع المستوى مطلوب';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        // Validate before submission
        if (!validateForm()) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        
        if (isLoading) return;
        
        setIsLoading(true);

        try {
            const response = await axios.post('/v1/api/chart/', {
                name: name.trim(),
                nameArb: nameArb.trim(),
                code: code.trim(),
                type: type
            });

            if (response.data) {
                toast.success('تم إضافة المستوى بنجاح');
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
            toast.error(error.response?.data?.message || 'فشل في إضافة المستوى');
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
        <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
            {/* Backdrop with blue tint */}
            <div 
                className="fixed inset-0  bg-opacity-50 backdrop-blur-sm transition-opacity"
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
                                        إضافة مستوى جديد
                                    </h3>
                                    <p className="text-sm text-blue-100 mt-0.5">
                                        إنشاء مستوى جديد
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="text-white hover:text-blue-100 transition-colors p-1 hover:bg-white/10 rounded-lg"
                                title="إغلاق"
                            >
                                <IoCloseCircle size={28} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Modal Body */}
                    <form onSubmit={onSubmitHandler} className="p-6">
                        {/* Chart Type Selection */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                نوع المستوى <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                                    {getTypeIcon()}
                                </div>
                                <select
                                    value={type}
                                    onChange={(e) => handleInputChange(e, setType, 'type')}
                                    className={`w-full pr-10 pl-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 appearance-none cursor-pointer text-right ${
                                        formErrors.type 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                                >
                                    <option value="" disabled>اختر نوع المستوى</option>
                                    <option value="Balance Sheet" className="py-2">📊 الميزانية العمومية</option>
                                    <option value="Profit & Loss" className="py-2">📈 الأرباح والخسائر</option>
                                </select>
                                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                    </svg>
                                </div>
                            </div>
                            {formErrors.type && (
                                <p className="mt-1 text-sm text-red-600 flex items-center gap-1 justify-end">
                                    <span className="text-red-500">⚠️</span>
                                    {formErrors.type}
                                </p>
                            )}
                        </div>

                        {/* Arabic Name Input (Primary) */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                الاسم العربي <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={nameArb}
                                    onChange={(e) => handleInputChange(e, setNameArb, 'nameArb')}
                                    placeholder="مثال: الأصول المتداولة"
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-right ${
                                        formErrors.nameArb 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                                />
                                {formErrors.nameArb && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 justify-end">
                                        <span className="text-red-500">⚠️</span>
                                        {formErrors.nameArb}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* English Name Input */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                الاسم بالإنجليزية <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => handleInputChange(e, setName, 'name')}
                                    placeholder="e.g., Current Assets"
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-right ${
                                        formErrors.name 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                                />
                                {formErrors.name && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 justify-end">
                                        <span className="text-red-500">⚠️</span>
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {/* Chart Code Input */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                كود المستوى <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => handleInputChange(e, setCode, 'code')}
                                    placeholder="مثال: COA-001"
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-right ${
                                        formErrors.code 
                                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                            : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                    }`}
                                />
                                {formErrors.code && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 justify-end">
                                        <span className="text-red-500">⚠️</span>
                                        {formErrors.code}
                                    </p>
                                )}
                                {!formErrors.code && (
                                    <p className="mt-1 text-xs text-gray-500 text-right">
                                        يجب أن يكون الكود فريداً
                                    </p>
                                )}
                            </div>
                        </div>
                        
                        {/* Info Box */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300 shadow-inner">
                            <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2 justify-end">
                                <LuSquareCheckBig className="text-blue-600" size={18} />
                                معلومات المستوى
                            </h4>
                            <p className="text-xs text-blue-700 text-right">
                                اختر نوع المستوى وأدخل اسماً وكوداً فريداً
                            </p>
                        </div>
                        
                        {/* Modal Footer - Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-start pt-4 border-t border-blue-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-3 border-2 border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200 order-2 sm:order-1"
                                disabled={isLoading}
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>جاري الإنشاء...</span>
                                    </>
                                ) : (
                                    <>
                                        <FaPlus size={16} />
                                        <span>إضافة المستوى</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer Note */}
                    <div className="px-6 pb-4 text-center">
                        <p className="text-xs text-blue-400">
                            <span className="text-red-500">*</span> الحقول المطلوبة
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default ChartAdd;
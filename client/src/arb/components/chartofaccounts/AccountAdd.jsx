import { AuthContext } from '../../../../context/AuthContext';
import { useContext, useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { IoCloseCircle } from 'react-icons/io5';
import { LuSquareCheckBig } from "react-icons/lu";
import { FaPlus, FaEdit } from "react-icons/fa";
import { MdAccountBalance } from "react-icons/md";

const AccountAdd = ({ 
    setIsAddModalOpen, 
    chartId, 
    chartType, // This should be chartOfAccounts.type (e.g., "Balance Sheet", "Income Statement")
    levelId, 
    classId, 
    groupId, 
    groupName, 
    groupCode,
    fetchAccounts, 
    mode = 'add', 
    accountData = null, 
    onSubmit,
    isRTL = true 
}) => {
    const { axios } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(accountData?.name || '');
    const [nameArb, setNameArb] = useState(accountData?.nameArb || '');
    const [code, setCode] = useState(accountData?.code || '');
    
    // Use the chartType directly - this should be the chart's type (Balance Sheet, Income Statement, etc.)
    const accountType = chartType || 'Balance Sheet'; // Default to 'Balance Sheet' if not provided

    const [formErrors, setFormErrors] = useState({});

    // Debug props on mount
    useEffect(() => {
        console.log('📦 AccountAdd - Received props:', {
            chartId,
            chartType,
            levelId,
            classId,
            groupId,
            groupName,
            groupCode,
            mode,
            accountType
        });
    }, [chartId, chartType, levelId, classId, groupId, groupName, groupCode, mode, accountType]);

    // Create refs for form inputs
    const nameArbRef = useRef(null);
    const nameRef = useRef(null);
    const codeRef = useRef(null);
    const submitRef = useRef(null);

    // Focus on first input when modal opens
    useEffect(() => {
        const timer = setTimeout(() => {
            if (nameArbRef.current) {
                nameArbRef.current.focus();
            }
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Handle Enter key to move to next field
    const handleKeyDown = (e, nextRef) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (nextRef && nextRef.current) {
                nextRef.current.focus();
            }
        }
    };

    // Validate form
    const validateForm = () => {
        const errors = {};
        
        if (!nameArb.trim()) {
            errors.nameArb = 'اسم الحساب بالعربية مطلوب';
        }

        if (!name.trim()) {
            errors.name = 'اسم الحساب بالإنجليزية مطلوب';
        }
        
        if (!code.trim()) {
            errors.code = 'كود الحساب مطلوب';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const getAccountUrl = () => {
        return `/v1/api/chart/${chartId}/level/${levelId}/class/${classId}/group/${groupId}/account`;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        
        if (isLoading) return;

        if (mode === 'edit' && onSubmit) {
            await onSubmit({ name, nameArb, code, type: accountType });
            return;
        }
        
        setIsLoading(true);

        try {
            const url = getAccountUrl();
            
            // Prepare the data to send with type from chart
            const dataToSend = {
                name: name.trim(),
                nameArb: nameArb.trim(),
                code: code.trim(),
                type: accountType // This should be "Balance Sheet" or "Income Statement"
            };
            
            console.log('📡 Sending to URL:', url);
            console.log('📡 Data being sent:', JSON.stringify(dataToSend, null, 2));
            
            const response = await axios.post(url, dataToSend);

            if (response.data.success) {
                toast.success(mode === 'edit' ? 'تم تحديث الحساب بنجاح' : 'تم إضافة الحساب بنجاح');
                setName('');
                setNameArb('');
                setCode('');
                setFormErrors({});
                setIsAddModalOpen(false);
                if (fetchAccounts) {
                    fetchAccounts();
                }
            }
        } catch (error) {
            console.error('❌ Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            toast.error(error.response?.data?.message || (mode === 'edit' ? 'فشل في تحديث الحساب' : 'فشل في إضافة الحساب'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsAddModalOpen(false);
    };

    const handleInputChange = (e, setter, field) => {
        setter(e.target.value);
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
            {/* Backdrop */}
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
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                                    {mode === 'edit' ? <FaEdit className="text-white" size={20} /> : <MdAccountBalance className="text-white" size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">
                                        {mode === 'edit' ? 'تعديل الحساب' : 'إضافة حساب جديد'}
                                    </h3>
                                    <p className="text-sm text-blue-100 mt-0.5">
                                        {mode === 'edit' ? 'تحديث معلومات الحساب' : `إنشاء حساب جديد في ${groupName || 'هذه المجموعة'}`}
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
                        {/* Hierarchy Path Display */}
                        <div className="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-600 mb-1">المسار الهرمي:</p>
                            <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
                                <MdAccountBalance size={16} />
                                <span>{groupName}</span>
                                {groupCode && (
                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                                        {groupCode}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Account Arabic Name */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                اسم الحساب بالعربية <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={nameArbRef}
                                type="text"
                                value={nameArb}
                                onChange={(e) => handleInputChange(e, setNameArb, 'nameArb')}
                                onKeyDown={(e) => handleKeyDown(e, nameRef)}
                                placeholder="مثال: نقدية"
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-right ${
                                    formErrors.nameArb 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                        : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                            />
                            {formErrors.nameArb && (
                                <p className="mt-1 text-sm text-red-600 text-right">⚠️ {formErrors.nameArb}</p>
                            )}
                        </div>

                        {/* Account English Name */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                اسم الحساب بالإنجليزية <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={nameRef}
                                type="text"
                                value={name}
                                onChange={(e) => handleInputChange(e, setName, 'name')}
                                onKeyDown={(e) => handleKeyDown(e, codeRef)}
                                placeholder="e.g., Cash on Hand"
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-right ${
                                    formErrors.name 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                        : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-600 text-right">⚠️ {formErrors.name}</p>
                            )}
                        </div>
                        
                        {/* Account Code */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                كود الحساب <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={codeRef}
                                type="text"
                                value={code}
                                onChange={(e) => handleInputChange(e, setCode, 'code')}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (submitRef.current) {
                                            submitRef.current.focus();
                                        }
                                    }
                                }}
                                placeholder="مثال: 1100"
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-right ${
                                    formErrors.code 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                        : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                            />
                            {formErrors.code && (
                                <p className="mt-1 text-sm text-red-600 text-right">⚠️ {formErrors.code}</p>
                            )}
                        </div>

                        {/* Type field - Display chart type */}
                        <div className="mb-5 p-3 bg-blue-100 rounded-lg border border-blue-300">
                            <p className="text-xs text-blue-700 mb-1">نوع القائمة المالية (من المستوى الرئيسي):</p>
                            <p className="text-lg font-bold text-blue-800">{accountType}</p>
                            <p className="text-xs text-blue-600 mt-1">هذا هو نوع القائمة المالية وليس اسم التصنيف</p>
                        </div>

                        {/* Hidden input to ensure type is included in form data */}
                        <input type="hidden" name="type" value={accountType} />
                        
                        {/* Modal Footer */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-start pt-4 border-t border-blue-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-3 border-2 border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors"
                                disabled={isLoading}
                            >
                                إلغاء
                            </button>
                            <button
                                ref={submitRef}
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>{mode === 'edit' ? 'جاري التحديث...' : 'جاري الإنشاء...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {mode === 'edit' ? <FaEdit size={16} /> : <FaPlus size={16} />}
                                        <span>{mode === 'edit' ? 'تحديث الحساب' : 'إضافة الحساب'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </div>
    );
};

export default AccountAdd;

// import { AuthContext } from '../../../../context/AuthContext';
// import { useContext, useState, useRef, useEffect } from 'react';
// import { toast } from 'react-hot-toast';
// import { motion } from 'framer-motion';
// import { IoCloseCircle } from 'react-icons/io5';
// import { LuSquareCheckBig } from "react-icons/lu";
// import { FaPlus, FaEdit } from "react-icons/fa";
// import { MdAccountBalance } from "react-icons/md";

// const AccountAdd = ({ 
//     setIsAddModalOpen, 
//     chartId, 
//     levelId, 
//     classId, 
//     groupId, 
//     groupName, 
//     groupCode,
//     fetchAccounts, 
//     mode = 'add', 
//     accountData = null, 
//     onSubmit,
//     isRTL = true 
// }) => {
//     const { axios } = useContext(AuthContext);
//     const [isLoading, setIsLoading] = useState(false);
//     const [name, setName] = useState(accountData?.name || '');
//     const [nameArb, setNameArb] = useState(accountData?.nameArb || '');
//     const [code, setCode] = useState(accountData?.code || '');
//     const type = groupName || ''; 
//     const [formErrors, setFormErrors] = useState({});

//     // Focus on input when modal opens
//     const inputRef = useRef(null);
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             if (inputRef.current) {
//                 inputRef.current.focus();
//             }
//         }, 100);
//         return () => clearTimeout(timer);
//     }, []);

//     // Validate form
//     const validateForm = () => {
//         const errors = {};
        
//         if (!name.trim()) {
//             errors.name = 'اسم الحساب بالإنجليزية مطلوب';
//         }

//         if (!nameArb.trim()) {
//             errors.nameArb = 'اسم الحساب بالعربية مطلوب';
//         }
        
//         if (!code.trim()) {
//             errors.code = 'كود الحساب مطلوب';
//         }
        
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     };

//     const getAccountUrl = () => {
//         return `/v1/api/chart/${chartId}/level/${levelId}/class/${classId}/group/${groupId}/account`;
//     };

//     const onSubmitHandler = async (e) => {
//         e.preventDefault();
        
//         if (!validateForm()) {
//             toast.error('يرجى ملء جميع الحقول المطلوبة');
//             return;
//         }
        
//         if (isLoading) return;

//         if (mode === 'edit' && onSubmit) {
//             await onSubmit({ name, nameArb, code, type });
//             return;
//         }
        
//         setIsLoading(true);

//         try {
//             const url = getAccountUrl();
//             console.log('📡 Adding account to:', url);
            
//             const response = await axios.post(url, {
//                 name: name.trim(),
//                 nameArb: nameArb.trim(),
//                 code: code.trim(),
//                 type: type
//             });

//             if (response.data.success) {
//                 toast.success(mode === 'edit' ? 'تم تحديث الحساب بنجاح' : 'تم إضافة الحساب بنجاح');
//                 setName('');
//                 setNameArb('');
//                 setCode('');
//                 setFormErrors({});
//                 setIsAddModalOpen(false);
//                 if (fetchAccounts) {
//                     fetchAccounts();
//                 }
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             toast.error(error.response?.data?.message || (mode === 'edit' ? 'فشل في تحديث الحساب' : 'فشل في إضافة الحساب'));
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleClose = () => {
//         setIsAddModalOpen(false);
//     };

//     const handleInputChange = (e, setter, field) => {
//         setter(e.target.value);
//         if (formErrors[field]) {
//             setFormErrors(prev => ({ ...prev, [field]: null }));
//         }
//     };

//     const getModalTitle = () => {
//         if (mode === 'edit') return 'تعديل الحساب';
//         return 'إضافة حساب جديد';
//     };

//     const getModalDescription = () => {
//         if (mode === 'edit') return 'تحديث معلومات الحساب';
//         return `إنشاء حساب جديد في ${groupName || 'هذه المجموعة'}`;
//     };

//     const getButtonText = () => {
//         if (isLoading) return mode === 'edit' ? 'جاري التحديث...' : 'جاري الإنشاء...';
//         return mode === 'edit' ? 'تحديث الحساب' : 'إضافة الحساب';
//     };

//     return (
//         <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
//             {/* Backdrop */}
//             <div 
//                 className="fixed inset-0  bg-opacity-50 backdrop-blur-sm transition-opacity"
//                 onClick={handleClose}
//                 style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
//             ></div>
            
//             {/* Modal */}
//             <div className="flex items-center justify-center min-h-screen p-4">
//                 <motion.div
//                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
//                     transition={{ duration: 0.3, ease: 'easeInOut' }}
//                     className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all border-2 border-blue-200"
//                 >
//                     {/* Modal Header */}
//                     <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 rounded-t-2xl">
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
//                                     {mode === 'edit' ? <FaEdit className="text-white" size={20} /> : <MdAccountBalance className="text-white" size={20} />}
//                                 </div>
//                                 <div>
//                                     <h3 className="text-xl font-semibold text-white">
//                                         {getModalTitle()}
//                                     </h3>
//                                     <p className="text-sm text-blue-100 mt-0.5">
//                                         {getModalDescription()}
//                                     </p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={handleClose}
//                                 className="text-white hover:text-blue-100 transition-colors p-1 hover:bg-white/10 rounded-lg"
//                                 title="إغلاق"
//                             >
//                                 <IoCloseCircle size={28} />
//                             </button>
//                         </div>
//                     </div>
                    
//                     {/* Modal Body */}
//                     <form onSubmit={onSubmitHandler} className="p-6">
//                         {/* Hierarchy Path Display with group code */}
//                         <div className="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-200">
//                             <p className="text-xs text-blue-600 mb-1">المسار الهرمي:</p>
//                             <p className="text-xs text-gray-600 mb-2">
//                                 المستوى الرئيسي / المستوى / التصنيف / المجموعة
//                             </p>
//                             <div className="flex items-center gap-2 text-sm font-semibold text-blue-800">
//                                 <MdAccountBalance size={16} />
//                                 <span>{groupName}</span>
//                                 {groupCode && (
//                                     <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
//                                         {groupCode}
//                                     </span>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Group Info Display with code */}
//                         <div className="mb-5 hidden">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
//                                 المجموعة
//                             </label>
//                             <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 flex items-center gap-2 flex-row-reverse">
//                                 <MdAccountBalance className="text-blue-600" size={20} />
//                                 <div className="flex items-center gap-2">
//                                     <span className="text-blue-800 font-medium">{groupName || 'جاري التحميل...'}</span>
//                                     {groupCode && (
//                                         <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
//                                             {groupCode}
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>
//                             <p className="mt-1 text-xs text-gray-500 text-right">
//                                 نوع الحساب سيتم تعيينه تلقائياً كـ "{groupName}"
//                             </p>
//                         </div>

//                         {/* Account Arabic Name */}
//                         <div className="mb-5">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
//                                 اسم الحساب بالعربية <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 ref={inputRef}
//                                 type="text"
//                                 value={nameArb}
//                                 onChange={(e) => handleInputChange(e, setNameArb, 'nameArb')}
//                                 placeholder="مثال: نقدية"
//                                 className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-right ${
//                                     formErrors.nameArb 
//                                         ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
//                                         : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
//                                 }`}
//                             />
//                             {formErrors.nameArb && (
//                                 <p className="mt-1 text-sm text-red-600 text-right">⚠️ {formErrors.nameArb}</p>
//                             )}
//                         </div>

//                         {/* Account English Name */}
//                         <div className="mb-5">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
//                                 اسم الحساب بالإنجليزية <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 value={name}
//                                 onChange={(e) => handleInputChange(e, setName, 'name')}
//                                 placeholder="e.g., Cash on Hand"
//                                 className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-right ${
//                                     formErrors.name 
//                                         ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
//                                         : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
//                                 }`}
//                             />
//                             {formErrors.name && (
//                                 <p className="mt-1 text-sm text-red-600 text-right">⚠️ {formErrors.name}</p>
//                             )}
//                         </div>
                        
//                         {/* Account Code */}
//                         <div className="mb-6">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
//                                 كود الحساب <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 value={code}
//                                 onChange={(e) => handleInputChange(e, setCode, 'code')}
//                                 placeholder="مثال: 1100"
//                                 className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-right ${
//                                     formErrors.code 
//                                         ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
//                                         : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
//                                 }`}
//                             />
//                             {formErrors.code && (
//                                 <p className="mt-1 text-sm text-red-600 text-right">⚠️ {formErrors.code}</p>
//                             )}
//                             {!formErrors.code && (
//                                 <p className="mt-1 text-xs text-gray-500 text-right">
//                                     يجب أن يكون الكود فريداً داخل هذه المجموعة
//                                 </p>
//                             )}
//                         </div>

//                         {/* Type Display */}
//                         <div className="mb-6 hidden">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
//                                 نوع الحساب
//                             </label>
//                             <div className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-blue-800 font-medium text-right flex items-center gap-2 justify-end">
//                                 <span>{groupName || 'جاري التحميل...'}</span>
//                                 {groupCode && (
//                                     <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
//                                         {groupCode}
//                                     </span>
//                                 )}
//                             </div>
//                             <p className="mt-1 text-xs text-gray-500 text-right">
//                                 يتم تعيين نوع الحساب تلقائياً من اسم المجموعة
//                             </p>
//                         </div>
                        
//                         {/* Info Box */}
//                         <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300 shadow-inner">
//                             <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2 justify-end">
//                                 <LuSquareCheckBig className="text-blue-600" size={18} />
//                                 معلومات الحساب
//                             </h4>
//                             <p className="text-xs text-blue-700 text-right">
//                                 سيتم إنشاء الحساب في مجموعة "{groupName}" {groupCode && `(كود: ${groupCode})`} بنفس نوع المجموعة.
//                             </p>
//                         </div>
                        
//                         {/* Modal Footer */}
//                         <div className="flex flex-col sm:flex-row gap-3 justify-start pt-4 border-t border-blue-200">
//                             <button
//                                 type="button"
//                                 onClick={handleClose}
//                                 className="px-6 py-3 border-2 border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors order-2 sm:order-1"
//                                 disabled={isLoading}
//                             >
//                                 إلغاء
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={isLoading}
//                                 className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 shadow-lg"
//                             >
//                                 {isLoading ? (
//                                     <>
//                                         <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                                         <span>{getButtonText()}</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         {mode === 'edit' ? <FaEdit size={16} /> : <FaPlus size={16} />}
//                                         <span>{mode === 'edit' ? 'تحديث الحساب' : 'إضافة الحساب'}</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </form>

//                     {/* Footer Note */}
//                     <div className="px-6 pb-4 text-center">
//                         <p className="text-xs text-blue-400">
//                             <span className="text-red-500">*</span> الحقول المطلوبة
//                         </p>
//                     </div>
//                 </motion.div>
//             </div>
//         </div>
//     );
// };

// export default AccountAdd;


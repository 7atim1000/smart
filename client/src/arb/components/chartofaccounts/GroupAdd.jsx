import { AuthContext } from '../../../../context/AuthContext';
import { useContext, useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { IoCloseCircle } from 'react-icons/io5';
import { LuSquareCheckBig } from "react-icons/lu";
import { FaPlus, FaFolder, FaEdit } from "react-icons/fa";

const GroupAdd = ({ 
    setIsGroupModalOpen, 
    chartId, 
    levelId, 
    classId, 
    fetchGroups, 
    mode = 'add', 
    groupData = null, 
    onSubmit,
    isRTL = true 
}) => {
    const { axios } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(groupData?.name || '');
    const [nameArb, setNameArb] = useState(groupData?.nameArb || '');
    const [code, setCode] = useState(groupData?.code || '');
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
            errors.name = 'اسم المجموعة بالإنجليزية مطلوب';
        }
        
        if (!nameArb.trim()) {
            errors.nameArb = 'اسم المجموعة بالعربية مطلوب';
        }
        
        if (!code.trim()) {
            errors.code = 'كود المجموعة مطلوب';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('يرجى ملء جميع الحقول المطلوبة');
            return;
        }
        
        if (isLoading) return;

        if (mode === 'edit' && onSubmit) {
            await onSubmit({ name, nameArb, code });
            return;
        }
        
        setIsLoading(true);

        try {
            // POST /:chartId/level/:levelId/class/:classId/group
            const response = await axios.post(`/v1/api/chart/${chartId}/level/${levelId}/class/${classId}/group`, {
                name: name.trim(),
                nameArb: nameArb.trim(),
                code: code.trim()
            });

            if (response.data.success) {
                toast.success(mode === 'edit' ? 'تم تحديث المجموعة بنجاح' : 'تم إضافة المجموعة بنجاح');
                setName('');
                setNameArb('');
                setCode('');
                setFormErrors({});
                setIsGroupModalOpen(false);
                if (fetchGroups) {
                    fetchGroups();
                }
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || (mode === 'edit' ? 'فشل في تحديث المجموعة' : 'فشل في إضافة المجموعة'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsGroupModalOpen(false);
    };

    const handleInputChange = (e, setter, field) => {
        setter(e.target.value);
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Get display text based on mode
    const getModalTitle = () => {
        if (mode === 'edit') return 'تعديل المجموعة';
        return 'إضافة مجموعة جديدة';
    };

    const getModalDescription = () => {
        if (mode === 'edit') return 'تحديث معلومات المجموعة';
        return 'إنشاء مجموعة جديدة في هذا التصنيف';
    };

    const getButtonText = () => {
        if (isLoading) return mode === 'edit' ? 'جاري التحديث...' : 'جاري الإنشاء...';
        return mode === 'edit' ? 'تحديث المجموعة' : 'إضافة المجموعة';
    };

    const getSuccessMessage = () => {
        return mode === 'edit' ? 'تم تحديث المجموعة بنجاح' : 'تم إضافة المجموعة بنجاح';
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
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
                    {/* Modal Header - Blue Theme */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                                    {mode === 'edit' ? <FaEdit className="text-white" size={20} /> : <FaFolder className="text-white" size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">
                                        {getModalTitle()}
                                    </h3>
                                    <p className="text-sm text-blue-100 mt-0.5">
                                        {getModalDescription()}
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
                        {/* Hierarchy Info Display */}
                        <div className="mb-5 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-xs text-blue-600 mb-1">المستوى الرئيسي / التصنيف:</p>
                            <p className="text-sm font-semibold text-blue-800">
                                {chartId && levelId && classId ? 'جاري الإنشاء في التصنيف المحدد' : 'معلومات التسلسل الهرمي'}
                            </p>
                        </div>

                        {/* Group Arabic Name (Primary) */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                اسم المجموعة بالعربية <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={nameArb}
                                onChange={(e) => handleInputChange(e, setNameArb, 'nameArb')}
                                placeholder="مثال: مجموعة النقدية"
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

                        {/* Group English Name */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                اسم المجموعة بالإنجليزية <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => handleInputChange(e, setName, 'name')}
                                placeholder="e.g., Cash Group"
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
                        
                        {/* Group Code */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
                                كود المجموعة <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => handleInputChange(e, setCode, 'code')}
                                placeholder="مثال: 111"
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all text-right ${
                                    formErrors.code 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                        : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                            />
                            {formErrors.code && (
                                <p className="mt-1 text-sm text-red-600 text-right">⚠️ {formErrors.code}</p>
                            )}
                            {!formErrors.code && (
                                <p className="mt-1 text-xs text-gray-500 text-right">
                                    يجب أن يكون الكود فريداً داخل هذا التصنيف
                                </p>
                            )}
                        </div>
                        
                        {/* Info Box */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300 shadow-inner">
                            <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2 justify-end">
                                <LuSquareCheckBig className="text-blue-600" size={18} />
                                معلومات المجموعة
                            </h4>
                            <p className="text-xs text-blue-700 text-right">
                                المجموعات هي المستوى الثالث في التسلسل الهرمي. سيتم إضافة الحسابات تحت المجموعات.
                                تأكد من إدخال اسم وكود فريدين للمجموعة.
                            </p>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-start pt-4 border-t border-blue-200">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-6 py-3 border-2 border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors order-2 sm:order-1"
                                disabled={isLoading}
                            >
                                إلغاء
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 shadow-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>{mode === 'edit' ? 'جاري التحديث...' : 'جاري الإنشاء...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {mode === 'edit' ? <FaEdit size={16} /> : <FaPlus size={16} />}
                                        <span>{mode === 'edit' ? 'تحديث المجموعة' : 'إضافة المجموعة'}</span>
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

export default GroupAdd;


// import { AuthContext } from '../../../../context/AuthContext';
// import { useContext, useState, useRef, useEffect } from 'react';
// import { toast } from 'react-hot-toast';
// import { motion } from 'framer-motion';
// import { IoCloseCircle } from 'react-icons/io5';
// import { LuSquareCheckBig } from "react-icons/lu";
// import { FaPlus, FaFolder } from "react-icons/fa";

// const GroupAdd = ({ setIsGroupModalOpen, chartId, fetchGroups }) => {
//     const { axios } = useContext(AuthContext);
//     const [isLoading, setIsLoading] = useState(false);
//     const [name, setName] = useState('');
//     const [nameArb, setNameArb] = useState('');
//     const [code, setCode] = useState('');
//     const [formErrors, setFormErrors] = useState({});

//     // RTL flag
//     const isRTL = true;

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
//             errors.name = 'اسم المجموعة مطلوب';
//         }
        
//         if (!nameArb.trim()) {
//             errors.nameArb = 'الاسم العربي للمجموعة مطلوب';
//         }
        
//         if (!code.trim()) {
//             errors.code = 'كود المجموعة مطلوب';
//         }
        
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     };

//     const onSubmitHandler = async (e) => {
//         e.preventDefault();
        
//         // Validate before submission
//         if (!validateForm()) {
//             toast.error('يرجى ملء جميع الحقول المطلوبة');
//             return;
//         }
        
//         if (isLoading) return;
        
//         setIsLoading(true);

//         try {
//             // Use the correct endpoint: POST /:chartId/groups
//             const response = await axios.post(`/v1/api/chart/${chartId}/groups`, {
//                 name: name.trim(),
//                 nameArb: nameArb.trim(),
//                 code: code.trim()
//             });

//             if (response.data.success) {
//                 toast.success('تم إضافة المجموعة بنجاح');
//                 setName('');
//                 setNameArb('');
//                 setCode('');
//                 setFormErrors({});
//                 setIsGroupModalOpen(false);
//                 if (fetchGroups) {
//                     fetchGroups(chartId); // Refresh groups list
//                 }
//             }
//         } catch (error) {
//             console.error('Error adding group:', error);
//             toast.error(error.response?.data?.message || 'فشل في إضافة المجموعة');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleClose = () => {
//         setIsGroupModalOpen(false);
//     };

//     const handleInputChange = (e, setter, field) => {
//         setter(e.target.value);
//         // Clear error for this field when user types
//         if (formErrors[field]) {
//             setFormErrors(prev => ({
//                 ...prev,
//                 [field]: null
//             }));
//         }
//     };

//     return (
//         <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
//             {/* Backdrop with blue tint */}
//             <div 
//                 className="fixed inset-0 bg-blue-900 bg-opacity-50 backdrop-blur-sm transition-opacity"
//                 onClick={handleClose}
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
//                     {/* Modal Header - Open Blue Theme */}
//                     <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 rounded-t-2xl">
//                         <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-3">
//                                 <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
//                                     <FaFolder className="text-white" size={20} />
//                                 </div>
//                                 <div>
//                                     <h3 className="text-xl font-semibold text-white">
//                                         إضافة مجموعة جديدة
//                                     </h3>
//                                     <p className="text-sm text-blue-100 mt-0.5">
//                                         إنشاء مجموعة جديدة في هذا المستوى
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
//                         {/* Group Arabic Name Input (Primary for RTL) */}
//                         <div className="mb-5">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
//                                 اسم المجموعة بالعربية <span className="text-red-500">*</span>
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     ref={inputRef}
//                                     type="text"
//                                     value={nameArb}
//                                     onChange={(e) => handleInputChange(e, setNameArb, 'nameArb')}
//                                     placeholder="مثال: الأصول المتداولة"
//                                     className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-right ${
//                                         formErrors.nameArb 
//                                             ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
//                                             : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
//                                     }`}
//                                 />
//                                 {formErrors.nameArb && (
//                                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1 justify-end">
//                                         <span className="text-red-500">⚠️</span>
//                                         {formErrors.nameArb}
//                                     </p>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Group English Name Input */}
//                         <div className="mb-5">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
//                                 اسم المجموعة بالإنجليزية <span className="text-red-500">*</span>
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     type="text"
//                                     value={name}
//                                     onChange={(e) => handleInputChange(e, setName, 'name')}
//                                     placeholder="e.g., Current Assets"
//                                     className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-right ${
//                                         formErrors.name 
//                                             ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
//                                             : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
//                                     }`}
//                                 />
//                                 {formErrors.name && (
//                                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1 justify-end">
//                                         <span className="text-red-500">⚠️</span>
//                                         {formErrors.name}
//                                     </p>
//                                 )}
//                             </div>
//                         </div>
                        
//                         {/* Group Code Input */}
//                         <div className="mb-6">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2 text-right">
//                                 كود المجموعة <span className="text-red-500">*</span>
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     type="text"
//                                     value={code}
//                                     onChange={(e) => handleInputChange(e, setCode, 'code')}
//                                     placeholder="مثال: 1000"
//                                     className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 text-right ${
//                                         formErrors.code 
//                                             ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
//                                             : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
//                                     }`}
//                                 />
//                                 {formErrors.code && (
//                                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1 justify-end">
//                                         <span className="text-red-500">⚠️</span>
//                                         {formErrors.code}
//                                     </p>
//                                 )}
//                                 {!formErrors.code && (
//                                     <p className="mt-1 text-xs text-gray-500 text-right">
//                                         يجب أن يكون الكود فريداً داخل هذا المستوى
//                                     </p>
//                                 )}
//                             </div>
//                         </div>
                        
//                         {/* Info Box */}
//                         <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300 shadow-inner">
//                             <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2 justify-end">
//                                 <LuSquareCheckBig className="text-blue-600" size={18} />
//                                 معلومات المجموعة
//                             </h4>
//                             <p className="text-xs text-blue-700 text-right">
//                                 قم بتعيين اسم وكود فريدين للمجموعة. يمكن إضافة الحسابات إلى هذه المجموعة لاحقاً.
//                             </p>
//                         </div>
                        
//                         {/* Modal Footer - Action Buttons */}
//                         <div className="flex flex-col sm:flex-row gap-3 justify-start pt-4 border-t border-blue-200">
//                             <button
//                                 type="button"
//                                 onClick={handleClose}
//                                 className="px-6 py-3 border-2 border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200 order-2 sm:order-1"
//                                 disabled={isLoading}
//                             >
//                                 إلغاء
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={isLoading}
//                                 className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
//                             >
//                                 {isLoading ? (
//                                     <>
//                                         <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                                         <span>جاري الإنشاء...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <FaPlus size={16} />
//                                         <span>إضافة المجموعة</span>
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
// }

// export default GroupAdd;
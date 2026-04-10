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
    onSubmit 
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
            errors.name = 'Group name is required';
        }
        
        if (!nameArb.trim()) {
            errors.nameArb = 'Arabic name is required';
        }
        
        if (!code.trim()) {
            errors.code = 'Group code is required';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fill in all required fields');
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
                toast.success(mode === 'edit' ? 'Group updated successfully!' : 'Group added successfully!');
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
            toast.error(error.response?.data?.message || `Failed to ${mode} group`);
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

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div 
                className="fixed inset-0 bg-opacity-50 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
            ></div>
            
            <div className="flex items-center justify-center min-h-screen p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-blue-200"
                >
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-5 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shadow-lg">
                                    {mode === 'edit' ? <FaEdit className="text-white" size={20} /> : <FaFolder className="text-white" size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">
                                        {mode === 'edit' ? 'Edit Group' : 'Add New Group'}
                                    </h3>
                                    <p className="text-sm text-blue-100 mt-0.5">
                                        {mode === 'edit' ? 'Update group information' : 'Create a new group in this class'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={handleClose} className="text-white hover:text-blue-100">
                                <IoCloseCircle size={28} />
                            </button>
                        </div>
                    </div>
                    
                    {/* Modal Body */}
                    <form onSubmit={onSubmitHandler} className="p-6">
                       
                        {/* English Name */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                English Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={inputRef}
                                type="text"
                                value={name}
                                onChange={(e) => handleInputChange(e, setName, 'name')}
                                placeholder="e.g., Cash Group"
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    formErrors.name 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                        : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                            />
                            {formErrors.name && (
                                <p className="mt-1 text-sm text-red-600">⚠️ {formErrors.name}</p>
                            )}
                        </div>

                         {/* Arabic Name */}
                        <div className="mb-5">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Arabic Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={nameArb}
                                onChange={(e) => handleInputChange(e, setNameArb, 'nameArb')}
                                placeholder="اسم المجموعة"
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    formErrors.nameArb 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                        : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                            />
                            {formErrors.nameArb && (
                                <p className="mt-1 text-sm text-red-600">⚠️ {formErrors.nameArb}</p>
                            )}
                        </div>

                        
                        {/* Group Code */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Group Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => handleInputChange(e, setCode, 'code')}
                                placeholder="e.g., 111"
                                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    formErrors.code 
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                                        : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                            />
                            {formErrors.code && (
                                <p className="mt-1 text-sm text-red-600">⚠️ {formErrors.code}</p>
                            )}
                            {!formErrors.code && (
                                <p className="mt-1 text-xs text-gray-500">
                                    Code must be unique within this class
                                </p>
                            )}
                        </div>
                        
                        {/* Info Box */}
                        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300">
                            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                <LuSquareCheckBig className="text-blue-600" size={18} />
                                Group Information
                            </h4>
                            <p className="text-xs text-blue-700">
                                Groups are the third level in the hierarchy. Accounts will be added under groups.
                            </p>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-blue-200">
                            <button type="button" onClick={handleClose} className="px-6 py-3 border-2 border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50" disabled={isLoading}>
                                Cancel
                            </button>
                            <button type="submit" disabled={isLoading} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg">
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>{mode === 'edit' ? 'Updating...' : 'Creating...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {mode === 'edit' ? <FaEdit size={16} /> : <FaPlus size={16} />}
                                        <span>{mode === 'edit' ? 'Update Group' : 'Add Group'}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="px-6 pb-4 text-center">
                        <p className="text-xs text-blue-400"><span className="text-red-500">*</span> Required fields</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

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
//             errors.name = 'Group name is required';
//         }
        
//         if (!code.trim()) {
//             errors.code = 'Group code is required';
//         }
        
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     };

//     const onSubmitHandler = async (e) => {
//         e.preventDefault();
        
//         // Validate before submission
//         if (!validateForm()) {
//             toast.error('Please fill in all required fields');
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
//                 toast.success('Group added successfully!');
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
//             toast.error(error.response?.data?.message || 'Failed to add group');
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
//         <div className="fixed inset-0 z-50 overflow-y-auto">
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
//                                         Add New Group
//                                     </h3>
//                                     <p className="text-sm text-blue-100 mt-0.5">
//                                         Create a new group in this chart
//                                     </p>
//                                 </div>
//                             </div>
//                             <button
//                                 onClick={handleClose}
//                                 className="text-white hover:text-blue-100 transition-colors p-1 hover:bg-white/10 rounded-lg"
//                                 title="Close"
//                             >
//                                 <IoCloseCircle size={28} />
//                             </button>
//                         </div>
//                     </div>
                    
//                     {/* Modal Body */}
//                     <form onSubmit={onSubmitHandler} className="p-6">
//                         {/* Group Name Input */}
//                         <div className="mb-5">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Group Name <span className="text-red-500">*</span>
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     ref={inputRef}
//                                     type="text"
//                                     value={name}
//                                     onChange={(e) => handleInputChange(e, setName, 'name')}
//                                     placeholder="e.g., Current Assets"
//                                     className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
//                                         formErrors.name 
//                                             ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
//                                             : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
//                                     }`}
//                                 />
//                                 {formErrors.name && (
//                                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                                         <span className="text-red-500">⚠️</span>
//                                         {formErrors.name}
//                                     </p>
//                                 )}
//                             </div>
//                         </div>
//                         <div className="mb-5">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Group Arabic Name <span className="text-red-500">*</span>
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     ref={inputRef}
//                                     type="text"
//                                     value={nameArb}
//                                     onChange={(e) => handleInputChange(e, setNameArb, 'nameArb')}
//                                     placeholder="e.g., Current Assets"
//                                     className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
//                                         formErrors.nameArb 
//                                             ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
//                                             : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
//                                     }`}
//                                 />
//                                 {formErrors.name && (
//                                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                                         <span className="text-red-500">⚠️</span>
//                                         {formErrors.nameArb}
//                                     </p>
//                                 )}
//                             </div>
//                         </div>
                        
//                         {/* Group Code Input */}
//                         <div className="mb-6">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Group Code <span className="text-red-500">*</span>
//                             </label>
//                             <div className="relative">
//                                 <input
//                                     type="text"
//                                     value={code}
//                                     onChange={(e) => handleInputChange(e, setCode, 'code')}
//                                     placeholder="e.g., 1000"
//                                     className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 ${
//                                         formErrors.code 
//                                             ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
//                                             : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
//                                     }`}
//                                 />
//                                 {formErrors.code && (
//                                     <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                                         <span className="text-red-500">⚠️</span>
//                                         {formErrors.code}
//                                     </p>
//                                 )}
//                                 {!formErrors.code && (
//                                     <p className="mt-1 text-xs text-gray-500">
//                                         Code must be unique within this chart
//                                     </p>
//                                 )}
//                             </div>
//                         </div>
                        
//                         {/* Info Box */}
//                         <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300 shadow-inner">
//                             <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
//                                 <LuSquareCheckBig className="text-blue-600" size={18} />
//                                 {/* Group Information */}
//                                 <p className="text-xs text-blue-700">Assign a unique group name & code</p>
//                             </h4>
//                             {/* <div className="space-y-2">
//                                 <div className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
//                                     <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
//                                         1
//                                     </div>
//                                     <p className="text-xs text-blue-700">Enter a descriptive group name (e.g., "Current Assets")</p>
//                                 </div>
//                                 <div className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
//                                     <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
//                                         2
//                                     </div>
//                                     <p className="text-xs text-blue-700">Assign a unique code following your numbering system</p>
//                                 </div>
//                                 <div className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
//                                     <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
//                                         3
//                                     </div>
//                                     <p className="text-xs text-blue-700">Accounts can be added to this group later</p>
//                                 </div>
//                             </div> */}
//                         </div>
                        
//                         {/* Modal Footer - Action Buttons */}
//                         <div className="flex flex-col sm:flex-row gap-3 justify-end pt-4 border-t border-blue-200">
//                             <button
//                                 type="button"
//                                 onClick={handleClose}
//                                 className="px-6 py-3 border-2 border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-colors duration-200 order-2 sm:order-1"
//                                 disabled={isLoading}
//                             >
//                                 Cancel
//                             </button>
//                             <button
//                                 type="submit"
//                                 disabled={isLoading}
//                                 className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center gap-2 order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
//                             >
//                                 {isLoading ? (
//                                     <>
//                                         <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                                         <span>Creating...</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <FaPlus size={16} />
//                                         <span>Add Group</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </form>

//                     {/* Footer Note */}
//                     <div className="px-6 pb-4 text-center">
//                         <p className="text-xs text-blue-400">
//                             <span className="text-red-500">*</span> Required fields
//                         </p>
//                     </div>
//                 </motion.div>
//             </div>
//         </div>
//     );
// }

// export default GroupAdd;
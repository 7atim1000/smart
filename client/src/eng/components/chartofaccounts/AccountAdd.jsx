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
    chartType, // Add chartType prop
    levelId, 
    classId, 
    groupId, 
    groupName, 
    groupCode,
    fetchAccounts, 
    mode = 'add', 
    accountData = null, 
    onSubmit 
}) => {
    const { axios } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState(accountData?.name || '');
    const [nameArb, setNameArb] = useState(accountData?.nameArb || '');
    const [code, setCode] = useState(accountData?.code || '');
    // Use the chartType passed from parent (this is chart.type, e.g., "Balance Sheet")
    const type = chartType || groupName || '';
    
    const [formErrors, setFormErrors] = useState({});

    // Focus on input
    const inputRef = useRef(null);
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    // Validate form
    const validateForm = () => {
        const errors = {};
        
        if (!name.trim()) errors.name = 'Account name is required';
        if (!nameArb.trim()) errors.nameArb = 'Arabic name is required';
        if (!code.trim()) errors.code = 'Account code is required';
        
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
            await onSubmit({ name, nameArb, code, type });
            return;
        }
        
        setIsLoading(true);

        try {
            // POST /:chartId/level/:levelId/class/:classId/group/:groupId/account
            const response = await axios.post(`/v1/api/chart/${chartId}/level/${levelId}/class/${classId}/group/${groupId}/account`, {
                name: name.trim(),
                nameArb: nameArb.trim(),
                code: code.trim(),
                type // Now using chartType which is the chart's type (Balance Sheet, Income Statement)
            });

            if (response.data.success) {
                toast.success(mode === 'edit' ? 'Account updated successfully!' : 'Account added successfully!');
                setName('');
                setNameArb('');
                setCode('');
                setFormErrors({});
                setIsAddModalOpen(false);
                if (fetchAccounts) fetchAccounts();
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || `Failed to ${mode} account`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => setIsAddModalOpen(false);

    const handleInputChange = (e, setter, field) => {
        setter(e.target.value);
        if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: null }));
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div 
                className="fixed inset-0  bg-opacity-50 backdrop-blur-sm transition-opacity"
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
                                    {mode === 'edit' ? <FaEdit className="text-white" size={20} /> : <MdAccountBalance className="text-white" size={20} />}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white">
                                        {mode === 'edit' ? 'Edit Account' : 'Add New Account'}
                                    </h3>
                                    <p className="text-sm text-blue-100 mt-0.5">
                                        {mode === 'edit' ? 'Update account information' : `Create account in ${groupName || 'this group'}`}
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
                        {/* Group Info Display */}
                        <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-3">
                                <MdAccountBalance className="text-blue-600" size={24} />
                                <div>
                                    <p className="text-xs text-blue-600 mb-1">Group / Account Type</p>
                                    <p className="text-base font-semibold text-blue-800">{groupName || 'Loading...'}</p>
                                    <p className="text-xs text-blue-500 mt-1">
                                        Account type: <span className="font-bold">{chartType || groupName || 'Not set'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

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
                                placeholder="e.g., Petty Cash"
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
                                placeholder="اسم الحساب"
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

                        
                        {/* Account Code */}
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Account Code <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => handleInputChange(e, setCode, 'code')}
                                placeholder="e.g., 11101"
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
                                    Code must be unique within this group
                                </p>
                            )}
                        </div>
                        
                        {/* Type Display (Read-only) */}
                        <div className="hidden mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Account Type
                            </label>
                            <div className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-blue-800 font-medium">
                                {chartType || groupName || 'Not set'}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Type is automatically set from the chart of accounts
                            </p>
                        </div>
                        
                        {/* Info Box */}
                        <div className="mb-6 p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300">
                            <h4 className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-2">
                                <LuSquareCheckBig className="text-blue-600" size={18} />
                                Account Information
                            </h4>
                            <p className="text-xs text-blue-700">
                                Account will be created in group "{groupName}" with type "{chartType || groupName}".
                            </p>
                        </div>
                        
                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2 border-t border-blue-200">
                            <button 
                                type="button" 
                                onClick={handleClose} 
                                className="px-6 py-3 border-2 border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50" 
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                        <span>{mode === 'edit' ? 'Updating...' : 'Creating...'}</span>
                                    </>
                                ) : (
                                    <>
                                        {mode === 'edit' ? <FaEdit size={16} /> : <FaPlus size={16} />}
                                        <span>{mode === 'edit' ? 'Update Account' : 'Add Account'}</span>
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
//     onSubmit 
// }) => {
//     const { axios } = useContext(AuthContext);
//     const [isLoading, setIsLoading] = useState(false);
//     const [name, setName] = useState(accountData?.name || '');
//     const [nameArb, setNameArb] = useState(accountData?.nameArb || '');
//     const [code, setCode] = useState(accountData?.code || '');
//     // type is automatically set to groupName
//     const type = groupName || '';
//     const [formErrors, setFormErrors] = useState({});

//     // Focus on input
//     const inputRef = useRef(null);
//     useEffect(() => {
//         const timer = setTimeout(() => {
//             if (inputRef.current) inputRef.current.focus();
//         }, 100);
//         return () => clearTimeout(timer);
//     }, []);

//     // Validate form
//     const validateForm = () => {
//         const errors = {};
        
//         if (!name.trim()) errors.name = 'Account name is required';
//         if (!nameArb.trim()) errors.nameArb = 'Arabic name is required';
//         if (!code.trim()) errors.code = 'Account code is required';
        
//         setFormErrors(errors);
//         return Object.keys(errors).length === 0;
//     };

//     const onSubmitHandler = async (e) => {
//         e.preventDefault();
        
//         if (!validateForm()) {
//             toast.error('Please fill in all required fields');
//             return;
//         }
        
//         if (isLoading) return;

//         if (mode === 'edit' && onSubmit) {
//             await onSubmit({ name, nameArb, code, type });
//             return;
//         }
        
//         setIsLoading(true);

//         try {
//             // POST /:chartId/level/:levelId/class/:classId/group/:groupId/account
//             const response = await axios.post(`/v1/api/chart/${chartId}/level/${levelId}/class/${classId}/group/${groupId}/account`, {
//                 name: name.trim(),
//                 nameArb: nameArb.trim(),
//                 code: code.trim(),
//                 type // Automatically set to groupName
//             });

//             if (response.data.success) {
//                 toast.success(mode === 'edit' ? 'Account updated successfully!' : 'Account added successfully!');
//                 setName('');
//                 setNameArb('');
//                 setCode('');
//                 setFormErrors({});
//                 setIsAddModalOpen(false);
//                 if (fetchAccounts) fetchAccounts();
//             }
//         } catch (error) {
//             console.error('Error:', error);
//             toast.error(error.response?.data?.message || `Failed to ${mode} account`);
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     const handleClose = () => setIsAddModalOpen(false);

//     const handleInputChange = (e, setter, field) => {
//         setter(e.target.value);
//         if (formErrors[field]) setFormErrors(prev => ({ ...prev, [field]: null }));
//     };

//     return (
//         <div className="fixed inset-0 z-50 overflow-y-auto">
//             <div 
//                 className="fixed inset-0  bg-opacity-50 backdrop-blur-sm transition-opacity"
//                 onClick={handleClose}
//                 style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
//             ></div>
            
//             <div className="flex items-center justify-center min-h-screen p-4">
//                 <motion.div
//                     initial={{ opacity: 0, scale: 0.9, y: 20 }}
//                     animate={{ opacity: 1, scale: 1, y: 0 }}
//                     exit={{ opacity: 0, scale: 0.9, y: 20 }}
//                     transition={{ duration: 0.3, ease: 'easeInOut' }}
//                     className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md border-2 border-blue-200"
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
//                                         {mode === 'edit' ? 'Edit Account' : 'Add New Account'}
//                                     </h3>
//                                     <p className="text-sm text-blue-100 mt-0.5">
//                                         {mode === 'edit' ? 'Update account information' : `Create account in ${groupName || 'this group'} - ${groupCode || 'this group'}`}
//                                     </p>
//                                 </div>
//                             </div>
//                             <button onClick={handleClose} className="text-white hover:text-blue-100">
//                                 <IoCloseCircle size={28} />
//                             </button>
//                         </div>
//                     </div>
                    
//                     {/* Modal Body */}
//                     <form onSubmit={onSubmitHandler} className="p-6">
//                         {/* Group Info Display */}
//                         <div className="mb-5 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
//                             <div className="flex items-center gap-3">
//                                 <MdAccountBalance className="text-blue-600" size={24} />
//                                 <div>
//                                     <p className="text-xs text-blue-600 mb-1">Group / المجموعة</p>
//                                     <p className="text-base font-semibold text-blue-800">{groupName || 'Loading...'}</p>
//                                     <p className="text-xs text-blue-500 mt-1">
//                                         Account type will be set to: <span className="font-bold">{groupName}</span>
//                                     </p>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* English Name */}
//                         <div className="mb-5">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 English Name <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 ref={inputRef}
//                                 type="text"
//                                 value={name}
//                                 onChange={(e) => handleInputChange(e, setName, 'name')}
//                                 placeholder="e.g., Petty Cash"
//                                 className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//                                     formErrors.name 
//                                         ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
//                                         : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
//                                 }`}
//                             />
//                             {formErrors.name && (
//                                 <p className="mt-1 text-sm text-red-600">⚠️ {formErrors.name}</p>
//                             )}
//                         </div>

//                         {/* Arabic Name */}
//                         <div className="mb-5">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Arabic Name <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 value={nameArb}
//                                 onChange={(e) => handleInputChange(e, setNameArb, 'nameArb')}
//                                 placeholder="اسم الحساب"
//                                 className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//                                     formErrors.nameArb 
//                                         ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
//                                         : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
//                                 }`}
//                             />
//                             {formErrors.nameArb && (
//                                 <p className="mt-1 text-sm text-red-600">⚠️ {formErrors.nameArb}</p>
//                             )}
//                         </div>

                        
//                         {/* Account Code */}
//                         <div className="mb-6">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Account Code <span className="text-red-500">*</span>
//                             </label>
//                             <input
//                                 type="text"
//                                 value={code}
//                                 onChange={(e) => handleInputChange(e, setCode, 'code')}
//                                 placeholder="e.g., 11101"
//                                 className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 ${
//                                     formErrors.code 
//                                         ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
//                                         : 'border-blue-200 focus:border-blue-500 focus:ring-blue-200'
//                                 }`}
//                             />
//                             {formErrors.code && (
//                                 <p className="mt-1 text-sm text-red-600">⚠️ {formErrors.code}</p>
//                             )}
//                             {!formErrors.code && (
//                                 <p className="mt-1 text-xs text-gray-500">
//                                     Code must be unique within this group
//                                 </p>
//                             )}
//                         </div>
                        
//                         {/* Type Display (Read-only) */}
//                         <div className="mb-6 hidden">
//                             <label className="block text-sm font-semibold text-gray-700 mb-2">
//                                 Account Type
//                             </label>
//                             <div className="w-full px-4 py-3 bg-blue-50 border-2 border-blue-200 rounded-lg text-blue-800 font-medium">
//                                 {groupName || 'Loading...'}
//                             </div>
//                             <p className="mt-1 text-xs text-gray-500">
//                                 Type is automatically set to the group name
//                             </p>
//                         </div>
                        
//                         {/* Info Box */}
//                         <div className="mb-6 p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-300">
//                             <h4 className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-2">
//                                 <LuSquareCheckBig className="text-blue-600" size={18} />
//                                 Account Information
//                             </h4>
//                             <p className="text-xs text-blue-700">
//                                 Account will be created in group "{groupName}" ".
//                                 {/* Choose a unique name and code for this account. */}
//                             </p>
//                         </div>
                        
//                         {/* Footer */}
//                         <div className="flex flex-col sm:flex-row gap-3 justify-end pt-2 border-t border-blue-200">
//                             <button 
//                                 type="button" 
//                                 onClick={handleClose} 
//                                 className="px-6 py-3 border-2 border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-50" 
//                                 disabled={isLoading}
//                             >
//                                 Cancel
//                             </button>
//                             <button 
//                                 type="submit" 
//                                 disabled={isLoading} 
//                                 className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg"
//                             >
//                                 {isLoading ? (
//                                     <>
//                                         <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
//                                         <span>{mode === 'edit' ? 'Updating...' : 'Creating...'}</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         {mode === 'edit' ? <FaEdit size={16} /> : <FaPlus size={16} />}
//                                         <span>{mode === 'edit' ? 'Update Account' : 'Add Account'}</span>
//                                     </>
//                                 )}
//                             </button>
//                         </div>
//                     </form>

//                     <div className="px-6 pb-4 text-center">
//                         <p className="text-xs text-blue-400"><span className="text-red-500">*</span> Required fields</p>
//                     </div>
//                 </motion.div>
//             </div>
//         </div>
//     );
// };

// export default AccountAdd;

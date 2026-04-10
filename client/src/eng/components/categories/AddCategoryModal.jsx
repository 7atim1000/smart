import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { IoCloseCircle } from 'react-icons/io5';
import { 
    FaPlus, FaSave, FaTimes, FaBox, FaTag, 
    FaFolder, FaFolderOpen, FaLayerGroup 
} from 'react-icons/fa';
import { BiCategory } from 'react-icons/bi';
import { MdCategory, MdInventory } from 'react-icons/md';

const AddCategoryModal = ({ setIsAddModalOpen, fetchCategories }) => {
    const { axios } = useContext(AuthContext);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        name: ''
    });
    
    const [formErrors, setFormErrors] = useState({});
    const inputRef = useRef(null);

    // Focus on first input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputRef.current) inputRef.current.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error for this field when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.name.trim()) {
            errors.name = 'Category name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Category name must be at least 2 characters';
        } else if (formData.name.trim().length > 50) {
            errors.name = 'Category name must be less than 50 characters';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors before submitting');
            return;
        }
        
        setIsLoading(true);

        try {
            const response = await axios.post('/v1/api/categories', {
                name: formData.name.trim()
            });

            if (response.data.success) {
                toast.success('Category added successfully!');
                setIsAddModalOpen(false);
                if (fetchCategories) fetchCategories();
            }
        } catch (error) {
            console.error('Error adding category:', error);
            
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.message) {
                toast.error(error.message);
            } else {
                toast.error('Failed to add category');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setIsAddModalOpen(false);
    };

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            onClick={handleClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - Changed to blue gradient */}
                <div className="bg-gradient-to-r from-blue-600 to-sky-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <BiCategory className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Add New Category
                                </h2>
                                <p className="text-blue-100 text-xs mt-1">
                                    Create a new product category
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={handleClose} 
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <IoCloseCircle size={28} />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Category Name Input - Changed focus ring to blue */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Category Name <span className="text-blue-600">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MdCategory className="text-gray-400" size={18} />
                            </div>
                            <input
                                ref={inputRef}
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="e.g., Electronics, Clothing, Food & Beverage"
                                className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl 
                                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                                         focus:border-transparent transition-all
                                         ${formErrors.name ? 'border-red-500' : 'border-gray-200'}`}
                                autoComplete="off"
                            />
                        </div>
                        {formErrors.name && (
                            <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                                {formErrors.name}
                            </p>
                        )}
                        {!formErrors.name && formData.name && (
                            <p className="text-blue-600 text-xs mt-1 flex items-center gap-1">
                                <span className="w-1 h-1 bg-blue-600 rounded-full"></span>
                                Category name: {formData.name}
                            </p>
                        )}
                    </div>

                    {/* Info Cards - Keep product card green, sub-categories blue */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                            <div className="flex items-center gap-2">
                                <FaBox className="text-green-600" size={16} />
                                <span className="text-xs text-green-700 font-medium">Products</span>
                            </div>
                            <p className="text-lg font-bold text-green-800 mt-1">0</p>
                            <p className="text-xs text-green-600">Will be added later</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                            <div className="flex items-center gap-2">
                                <FaLayerGroup className="text-blue-600" size={16} />
                                <span className="text-xs text-blue-700 font-medium">Sub-categories</span>
                            </div>
                            <p className="text-lg font-bold text-blue-800 mt-1">0</p>
                            <p className="text-xs text-blue-600">Will be added later</p>
                        </div>
                    </div>

                    {/* Preview Section - Changed to blue theme */}
                    {formData.name && (
                        <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl p-4 border border-blue-200">
                            <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                                <span className="w-1 h-4 bg-blue-600 rounded-full"></span>
                                Category Preview
                            </h3>
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-white rounded-lg shadow-sm">
                                    {formData.name ? (
                                        <FaFolderOpen className="text-blue-600" size={24} />
                                    ) : (
                                        <FaFolder className="text-blue-600" size={24} />
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-800">{formData.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        New category ready to be created
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tips Section - Keep as is */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                        <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <FaTag className="text-gray-500" size={12} />
                            Tips for category names:
                        </h4>
                        <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                            <li>Use clear, descriptive names</li>
                            <li>Keep it concise (2-50 characters)</li>
                            <li>Avoid special characters</li>
                            <li>Be consistent with naming convention</li>
                        </ul>
                    </div>

                    {/* Action Buttons - Changed to blue gradient */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl
                                     text-gray-700 font-medium hover:bg-gray-50 
                                     transition-all flex items-center justify-center gap-2
                                     order-2 sm:order-1"
                        >
                            <FaTimes size={16} />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !formData.name.trim()}
                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-sky-600 
                                     text-white font-medium rounded-xl hover:from-blue-700 
                                     hover:to-sky-700 shadow-md hover:shadow-lg 
                                     transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                     flex items-center justify-center gap-2 order-1 sm:order-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent 
                                                    rounded-full animate-spin"></div>
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <FaSave size={16} />
                                    <span>Add Category</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* Footer Note - Keep as is */}
                <div className="px-6 pb-4 text-center">
                    <p className="text-xs text-gray-400">
                        You can add products to this category after creation
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default AddCategoryModal;
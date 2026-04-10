import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaBoxes, 
    FaChevronDown, FaChevronUp, FaFilter, FaSync,
    FaFolder, FaFolderOpen, FaBox, FaTag
} from 'react-icons/fa';
import { MdCategory, MdInventory, MdRefresh } from 'react-icons/md';
import { BiCategory } from 'react-icons/bi';

import AddCategoryModal from '../components/categories/AddCategoryModal';
import AddProductsModal from '../components/categories/AddProductsModal';
import UpdateCategoryModal from '../components/categories/UpdateCategoryModal';
import UpdateProductModal from '../components/categories/UpdateProductModal';
import CategoryDetails from '../components/categories/CategoryDetails';

const Categories = () => {
    
    const { axios } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [isUpdateProductModalOpen, setIsUpdateProductModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    
    // Pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        total: 0,
        totalPages: 1
    });

    // Expanded categories for product list
    const [expandedCategories, setExpandedCategories] = useState({});

    // Fetch all categories
    const fetchCategories = async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: pagination.itemsPerPage,
                ...(searchTerm && { search: searchTerm })
            });

            const response = await axios.get(`/v1/api/categories?${params}`);
            
            if (response.data.success) {
                setCategories(response.data.categories);
                setPagination({
                    currentPage: response.data.pagination.page,
                    itemsPerPage: response.data.pagination.limit,
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages
                });
            } else {
                toast.error('فشل في جلب الفئات');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('خطأ في تحميل الفئات');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, [searchTerm]);

    // Handle view category details
    const handleViewCategory = (category) => {
        setSelectedCategory(category);
        setIsDetailsModalOpen(true);
    };

    // Handle edit category
    const handleEditCategory = (category, e) => {
        e.stopPropagation();
        setSelectedCategory(category);
        setIsUpdateModalOpen(true);
    };

    // Handle delete category
    const handleDeleteCategory = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
            try {
                const response = await axios.delete(`/v1/api/categories/${id}`);
                if (response.data.success) {
                    toast.success('تم حذف الفئة بنجاح');
                    fetchCategories(pagination.currentPage);
                } else {
                    toast.error('فشل حذف الفئة');
                }
            } catch (error) {
                console.error('Delete error:', error);
                toast.error(error.response?.data?.message || 'خطأ في حذف الفئة');
            }
        }
    };

    // Handle add product to category
    const handleAddProduct = (category, e) => {
        e.stopPropagation();
        setSelectedCategory(category);
        setIsAddProductModalOpen(true);
    };
 

    // Handle edit product
    const handleEditProduct = (product, category, e) => {
        e.stopPropagation();
        setSelectedProduct(product);
        setSelectedCategory(category);
        setIsUpdateProductModalOpen(true);
    };

    // Handle delete product
    const handleDeleteProduct = async (categoryId, productId, e) => {
        e.stopPropagation();
        if (window.confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
            try {
                const response = await axios.delete(`/v1/api/categories/${categoryId}/entries/${productId}`);
                if (response.data.success) {
                    toast.success('تم حذف المنتج بنجاح');
                    fetchCategories(pagination.currentPage);
                } else {
                    toast.error('فشل حذف المنتج');
                }
            } catch (error) {
                console.error('Delete error:', error);
                toast.error(error.response?.data?.message || 'خطأ في حذف المنتج');
            }
        }
    };

    // Toggle category expansion
    const toggleCategory = (categoryId, e) => {
        e.stopPropagation();
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('ar-AE', {
            style: 'currency',
            currency: 'AED',
            minimumFractionDigits: 2
        }).format(amount);
    };

    // Pagination controls
    const PaginationControls = () => {
        const handlePageChange = (newPage) => {
            fetchCategories(newPage);
        };

        return (
            <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 py-3 px-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">
                    عرض <span className="font-semibold text-blue-600">{categories.length}</span> من{' '}
                    <span className="font-semibold text-blue-600">{pagination.total}</span> فئة
                </div>
                
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm
                                 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        السابق
                    </button>
                    
                    <span className="px-3 py-1.5 bg-blue-50 rounded-lg text-blue-700 text-sm">
                        صفحة {pagination.currentPage} من {pagination.totalPages}
                    </span>
                    
                    <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm
                                 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        التالي
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div dir="rtl" className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-sky-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100 px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BiCategory className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                إدارة الفئات
                            </h1>
                            <p className="text-sm text-gray-500">
                                إدارة فئات المنتجات والعناصر
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsAddModalOpen(true)}
                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-sky-600 
                                     text-white px-4 py-2 rounded-lg hover:from-blue-700 
                                     hover:to-sky-700 shadow-md hover:shadow-lg transition-all"
                        >
                            <FaPlus size={16} />
                            <span>إضافة فئة</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="px-4 sm:px-6 py-4">
                <div className="relative max-w-md">
                    <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="بحث عن فئات..."
                        className="w-full pr-10 pl-4 py-2.5 border border-gray-200 rounded-lg
                                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                                 focus:border-transparent bg-white text-right"
                    />
                </div>
            </div>

            {/* Categories List */}
            <div className="px-4 sm:px-6 pb-6">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">جاري التحميل...</p>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <MdCategory className="mx-auto text-5xl text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد فئات</h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm ? 'لا توجد فئات تطابق بحثك' : 'ابدأ بإضافة أول فئة'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 
                                         rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaPlus size={16} />
                                إضافة فئة
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {categories.map((category) => (
                            <motion.div
                                key={category._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden
                                         hover:shadow-md transition-all cursor-pointer"
                                onClick={() => handleViewCategory(category)}
                            >
                                {/* Category Header */}
                                <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-sky-50 
                                              border-b border-gray-200 flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1">
                                        <button
                                            onClick={(e) => toggleCategory(category._id, e)}
                                            className="p-1 hover:bg-blue-200 rounded-lg transition-colors"
                                        >
                                            {expandedCategories[category._id] ? 
                                                <FaChevronUp className="text-blue-600" size={16} /> : 
                                                <FaChevronDown className="text-blue-600" size={16} />
                                            }
                                        </button>
                                        <div className="flex items-center gap-2">
                                            {expandedCategories[category._id] ? 
                                                <FaFolderOpen className="text-blue-600" size={20} /> : 
                                                <FaFolder className="text-blue-600" size={20} />
                                            }
                                            <h3 className="font-semibold text-gray-800">{category.name}</h3>
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 
                                                         rounded-full text-xs">
                                                {category.products?.length || 0} منتجات
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={(e) => handleAddProduct(category, e)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg 
                                                     transition-colors"
                                            title="إضافة منتج"
                                        >
                                            <FaPlus size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleEditCategory(category, e)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg 
                                                     transition-colors"
                                            title="تعديل الفئة"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteCategory(category._id, e)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg 
                                                     transition-colors"
                                            title="حذف الفئة"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Products List (Expandable) */}
                                <AnimatePresence>
                                    {expandedCategories[category._id] && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            {category.products && category.products.length > 0 ? (
                                                <div className="divide-y divide-gray-100">
                                                    {category.products.map((product) => (
                                                        <div
                                                            key={product._id}
                                                            className="px-4 py-3 hover:bg-gray-50 flex items-center 
                                                                     justify-between group"
                                                        >
                                                            <div className="flex items-center gap-3 flex-1">
                                                                <FaBox className="text-gray-400" size={14} />
                                                                <div>
                                                                    <p className="font-medium text-gray-800">
                                                                        {product.name}
                                                                    </p>
                                                                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                                        <span>الكمية: {product.qty} {product.unit}</span>
                                                                        <span>•</span>
                                                                        <span>سعر البيع: {formatCurrency(product.salePrice)}</span>
                                                                        <span>•</span>
                                                                        <span>سعر التكلفة: {formatCurrency(product.costPrice)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-2 opacity-0 
                                                                          group-hover:opacity-100 transition-opacity">
                                                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                                    product.sales ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                    {product.sales ? 'مبيعات' : 'بدون مبيعات'}
                                                                </span>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                                                    product.purchase ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                                }`}>
                                                                    {product.purchase ? 'مشتريات' : 'بدون مشتريات'}
                                                                </span>
                                                                <button
                                                                    onClick={(e) => handleEditProduct(product, category, e)}
                                                                    className="p-1 text-blue-600 hover:bg-blue-50 
                                                                             rounded transition-colors"
                                                                    title="تعديل المنتج"
                                                                >
                                                                    <FaEdit size={14} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleDeleteProduct(category._id, product._id, e)}
                                                                    className="p-1 text-red-600 hover:bg-red-50 
                                                                             rounded transition-colors"
                                                                    title="حذف المنتج"
                                                                >
                                                                    <FaTrash size={14} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="px-4 py-6 text-center text-gray-500">
                                                    <FaBox className="mx-auto text-3xl text-gray-300 mb-2" />
                                                    <p className="text-sm">لا توجد منتجات في هذه الفئة</p>
                                                    <button
                                                        onClick={(e) => handleAddProduct(category, e)}
                                                        className="mt-2 text-blue-600 text-sm hover:underline"
                                                    >
                                                        أضف منتجك الأول
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}

                        {/* Pagination */}
                        {categories.length > 0 && <PaginationControls />}
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <AddCategoryModal
                        setIsAddModalOpen={setIsAddModalOpen}
                        fetchCategories={() => fetchCategories(pagination.currentPage)}
                    />
                )}

                {/* In the modal rendering section */}
                {isAddProductModalOpen && selectedCategory && (
                    <AddProductsModal
                        setIsAddProductModalOpen={setIsAddProductModalOpen}
                        categoryId={selectedCategory._id}
                        categoryName={selectedCategory.name}
                        fetchCategories={() => fetchCategories(pagination.currentPage)}
                    />
                )}

                {isUpdateModalOpen && selectedCategory && (
                    <UpdateCategoryModal
                        setIsUpdateModalOpen={setIsUpdateModalOpen}
                        categoryData={selectedCategory}
                        fetchCategories={() => fetchCategories(pagination.currentPage)}
                    />
                )}

                {isUpdateProductModalOpen && selectedProduct && selectedCategory && (
                    <UpdateProductModal
                        setIsUpdateProductModalOpen={setIsUpdateProductModalOpen}
                        productData={selectedProduct}
                        categoryId={selectedCategory._id}
                        fetchCategories={() => fetchCategories(pagination.currentPage)}
                    />
                )}

                {isDetailsModalOpen && selectedCategory && (
                    <CategoryDetails
                        category={selectedCategory}
                        onClose={() => setIsDetailsModalOpen(false)}
                        onEdit={() => {
                            setIsDetailsModalOpen(false);
                            setIsUpdateModalOpen(true);
                        }}
                        onAddProduct={() => {
                            setIsDetailsModalOpen(false);
                            setIsAddProductModalOpen(true);
                        }}
                        onRefresh={() => fetchCategories(pagination.currentPage)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Categories;
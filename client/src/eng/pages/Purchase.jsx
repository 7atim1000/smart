import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { addItems } from '../../redux/slices/buySlice';

import { toast } from 'react-toastify';

import { 
    FaShoppingCart, FaBox, FaFilter, FaUser, FaSearch,
    FaPlusCircle, FaMinusCircle, FaShoppingBasket, FaTrash,
    FaArrowLeft, FaArrowRight, FaUserPlus, FaCheckCircle,
    FaTimesCircle, FaFileInvoice, FaMoneyBillWave
} from "react-icons/fa";

import { FaCircleUser } from "react-icons/fa6";
import { GrRadialSelected } from 'react-icons/gr';
import { BsFillCartCheckFill } from "react-icons/bs";
import { IoMdArrowDropupCircle, IoMdArrowDropdownCircle } from "react-icons/io";
import { MdOutlineCategory, MdOutlineProductionQuantityLimits } from "react-icons/md";

import SelectSupplier from '../components/purchases/SelectSupplier';
import CartInfo from '../components/purchases/CartInfo';
import Bills from '../components/purchases/Bills';

const Purchase = () => {
    const { axios } = useContext(AuthContext);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // State management
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [productsLoading, setProductsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [quantities, setQuantities] = useState({});

    const [isSelectSupplierModalOpen, setIsSelectSupplierModalOpen] = useState(false);

    // Redux state
    const supplierData = useSelector(state => state.supplier);

    // Handle back navigation
    const handleBack = () => {
        navigate(-1); // Go back to previous page
    };

    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch products when category or search term changes
    useEffect(() => {
        fetchPurchaseProducts();
    }, [selectedCategory, searchTerm]);

    // Fetch categories
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/v1/api/categories');
            if (response.data.success) {
                setCategories(response.data.categories || []);
            } else {
                toast.error('Error fetching categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Error fetching categories');
        } finally {
            setLoading(false);
        }
    };

    // Fetch products based on selected category and search term
    const fetchPurchaseProducts = async () => {
        setProductsLoading(true);
        try {
            const params = new URLSearchParams();
            params.append('type', 'purchase');
            
            if (searchTerm) {
                params.append('search', searchTerm);
            }
            
            const response = await axios.get(`/v1/api/categories/products/all?${params}`);

            if (response.data.success) {
                let fetchedProducts = response.data.data || [];
                
                // Filter by category if not 'all'
                if (selectedCategory !== 'all') {
                    fetchedProducts = fetchedProducts.filter(
                        product => product.categoryName === selectedCategory
                    );
                }
                
                setProducts(fetchedProducts);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Error fetching products');
        } finally {
            setProductsLoading(false);
        }
    };

    // Handle category selection
    const handleCategorySelect = (categoryName) => {
        setSelectedCategory(categoryName);
        setSelectedProduct(null); // Reset selected product when category changes
    };

    // Handle product selection
    const handleProductChange = (e) => {
        const productId = e.target.value;
        if (!productId) {
            setSelectedProduct(null);
            return;
        }
        
        const product = products.find(p => p._id === productId);
        setSelectedProduct(product || null);
        
        // Set initial quantity to 1 when product is selected
        if (product) {
            setQuantities(prev => ({
                ...prev,
                [product._id]: 1
            }));
        }
    };

    // Increment quantity
    const incrementQuantity = () => {
        if (!selectedProduct) return;
        
        setQuantities(prev => ({
            ...prev,
            [selectedProduct._id]: (prev[selectedProduct._id] || 1) + 1
        }));
    };

    // Decrement quantity
    const decrementQuantity = () => {
        if (!selectedProduct) return;
        
        const currentQty = quantities[selectedProduct._id] || 1;
        if (currentQty > 1) {
            setQuantities(prev => ({
                ...prev,
                [selectedProduct._id]: currentQty - 1
            }));
        }
    };

    // Get current quantity for selected product
    const getCurrentQuantity = () => {
        if (!selectedProduct) return 1;
        return quantities[selectedProduct._id] || 1;
    };

    // Handle add to cart
    const handleAddToCart = () => {
        if (!selectedProduct) {
            toast.warning('Please select a product first');
            return;
        }

        const currentQuantity = getCurrentQuantity();
        
        if (currentQuantity <= 0) {
            toast.warning('Please specify the required quantity');
            return;
        }

        if (parseInt(selectedProduct.qty) < currentQuantity) {
            toast.error('Sorry, insufficient stock');
            return;
        }

        // Prepare cart item
        const cartItem = {
            id: selectedProduct._id,
            name: selectedProduct.name,
            pricePerQuantity: selectedProduct.costPrice,
            currency: selectedProduct.costCurrency,
            quantity: currentQuantity,
            price: selectedProduct.costPrice * currentQuantity,
            unit: selectedProduct.unit,
            categoryName: selectedProduct.categoryName
        };

        // Add to cart
        dispatch(addItems(cartItem));
        
        toast.success('Product added to cart');

        // Reset quantity for this product
        setQuantities(prev => ({
            ...prev,
            [selectedProduct._id]: 1
        }));
        
        // Optionally reset selected product
        // setSelectedProduct(null);
    };

    // Handle modal open
    const handlePurchaseModalOpen = () => {
        setIsSelectSupplierModalOpen(true);
    };

    // Get background color based on index
    const getBgColor = (index) => {
        const colors = [
            'bg-blue-600 hover:bg-blue-700',
            'bg-indigo-600 hover:bg-indigo-700',
            'bg-purple-600 hover:bg-purple-700',
            'bg-teal-600 hover:bg-teal-700',
            'bg-cyan-600 hover:bg-cyan-700'
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="min-h-screen bg-gray-50" dir="ltr">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 shadow-lg sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        {/* Logo, Title and Back Button */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleBack}
                                className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-all duration-200 text-white"
                                title="Go Back"
                            >
                                <FaArrowLeft size={20} />
                            </button>
                            <div className="bg-white/20 p-3 rounded-xl">
                                <FaShoppingCart className="text-white text-2xl" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Purchase Quotation</h1>
                            </div>
                        </div>

                        {/* Supplier Selection */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
                            <button
                                onClick={handlePurchaseModalOpen}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-200 w-full sm:w-auto justify-center"
                            >
                                <span>Select Supplier</span>
                                <FaArrowRight className="text-white" />
                            </button>

                            {/* Supplier Info Badge */}
                            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl w-full sm:w-auto">
                                <FaCircleUser className="text-blue-200 text-xl flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-blue-200 text-sm">Customer:</span>
                                        <span className="text-white font-medium truncate">
                                            {supplierData.supplierName || 'Supplier name'}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-blue-200 text-sm">Balance:</span>
                                        <span className={`font-medium ${
                                            (supplierData.balance || 0) > 0 ? 'text-green-300' : 
                                            (supplierData.balance || 0) < 0 ? 'text-red-300' : 'text-white'
                                        }`}>
                                            {(Number(supplierData.balance) || 0).toFixed(2)} {supplierData.currency || 'AED'}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/en/contacts/add')}
                                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-200"
                                    title="Add New Customer"
                                >
                                    <FaUserPlus className="text-white" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Categories Sidebar */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 sticky top-24">
                            <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-200">
                                <MdOutlineCategory className="text-blue-600 text-xl" />
                                <h3 className="font-semibold text-gray-800">Categories</h3>
                                <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
                                    {categories.length}
                                </span>
                            </div>

                            <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                {/* All Categories Button */}
                                <button
                                    onClick={() => handleCategorySelect('all')}
                                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                                        selectedCategory === 'all'
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
                                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <FaBox className={selectedCategory === 'all' ? 'text-white' : 'text-gray-400'} />
                                        <span className="font-medium">All Products</span>
                                    </div>
                                    {selectedCategory === 'all' && <GrRadialSelected className="text-white" />}
                                </button>

                                {/* Categories List */}
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </div>
                                ) : (
                                    categories.map((category, index) => (
                                        <button
                                            key={category._id}
                                            onClick={() => handleCategorySelect(category.name)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                                                selectedCategory === category.name
                                                    ? getBgColor(index) + ' text-white shadow-md'
                                                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full ${
                                                    selectedCategory === category.name ? 'bg-white' : 'bg-blue-500'
                                                }`} />
                                                <span className="font-medium truncate">{category.name}</span>
                                            </div>
                                            {selectedCategory === category.name && <GrRadialSelected />}
                                        </button>
                                    ))
                                )}
                            </div>

                            {/* Search Box */}
                            <div className="mt-5 pt-4 border-t border-gray-200">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Products and Cart Section */}
                    <div className="lg:col-span-6 space-y-6">
                        {/* Products Selection */}
                        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                            <h2 className="text-blue-800 font-semibold mb-5 text-lg flex items-center gap-2 pb-3 border-b border-gray-200">
                                <MdOutlineProductionQuantityLimits className="text-blue-600" />
                                Select Product for Purchase
                            </h2>

                            {/* Product Select Dropdown */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Product Name:
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none cursor-pointer"
                                        onChange={handleProductChange}
                                        value={selectedProduct?._id || ''}
                                        disabled={productsLoading}
                                    >
                                        <option value="">-- Select Product --</option>
                                        {products.map((product) => (
                                            <option key={product._id} value={product._id}>
                                                {product.name} - {product.costPrice} {product.costCurrency}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-3 top-3.5 text-gray-400 pointer-events-none">
                                        ▼
                                    </div>
                                </div>
                                {productsLoading && (
                                    <p className="text-sm text-gray-500 mt-2">Loading products...</p>
                                )}
                            </div>

                            {/* Selected Product Details */}
                            {selectedProduct && (
                                <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl p-5 border border-blue-200">
                                    <div className="flex flex-col lg:flex-row justify-between gap-6">
                                        {/* Product Info */}
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-gray-800 mb-3">
                                                {selectedProduct.name}
                                            </h3>
                                            
                                            <div className="grid grid-cols-2 gap-4 mb-4">
                                                <div className="bg-white p-4 rounded-xl border border-blue-100">
                                                    <p className="text-xs text-gray-500 mb-1">Purchase Price</p>
                                                    <p className="text-xl font-bold text-blue-600">
                                                        {selectedProduct.costPrice}
                                                        <span className="text-sm text-gray-500 ml-1">
                                                            {selectedProduct.costCurrency}
                                                        </span>
                                                    </p>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl border border-blue-100">
                                                    <p className="text-xs text-gray-500 mb-1">Available Quantity</p>
                                                    <p className="text-xl font-bold text-green-600">
                                                        {selectedProduct.qty}
                                                        <span className="text-sm text-gray-500 ml-1">
                                                            {selectedProduct.unit}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1.5 rounded-full">
                                                    {selectedProduct.categoryName}
                                                </span>
                                                {selectedProduct.barcode && (
                                                    <span className="bg-gray-100 text-gray-700 text-xs px-3 py-1.5 rounded-full">
                                                        Barcode: {selectedProduct.barcode}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex flex-col items-center gap-4 min-w-[180px]">
                                            <div className="flex items-center gap-4 bg-white px-6 py-3 rounded-xl border border-blue-200 shadow-sm">
                                                <button
                                                    onClick={decrementQuantity}
                                                    className="text-red-500 hover:text-red-600 transition-colors cursor-pointer"
                                                    disabled={getCurrentQuantity() <= 1}
                                                >
                                                    <FaMinusCircle className="w-7 h-7" />
                                                </button>

                                                <span className="text-3xl font-bold text-blue-700 w-12 text-center">
                                                    {getCurrentQuantity()}
                                                </span>

                                                <button
                                                    onClick={incrementQuantity}
                                                    className="text-green-500 hover:text-green-600 transition-colors cursor-pointer"
                                                    disabled={parseInt(selectedProduct.qty) <= getCurrentQuantity()}
                                                >
                                                    <FaPlusCircle className="w-7 h-7" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={handleAddToCart}
                                                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-md font-medium text-lg"
                                            >
                                                <FaShoppingBasket />
                                                <span>Add to Cart</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* No Products Message */}
                            {!productsLoading && products.length === 0 && (
                                <div className="text-center py-12 bg-gray-50 rounded-xl">
                                    <FaBox className="mx-auto text-5xl text-gray-400 mb-3" />
                                    <p className="text-gray-500">No products available</p>
                                </div>
                            )}
                        </div>

                        {/* Cart Information */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                    <FaShoppingCart />
                                    Purchase Products Menu
                                </h3>
                            </div>
                            <div className="p-6">
                                <CartInfo />
                            </div>
                        </div>
                    </div>

                    {/* Right Sidebar - Customer Info & Bills */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Bills Section */}
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden sticky top-24">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                                    <FaFileInvoice />
                                    Invoice
                                </h3>
                            </div>
                            <div className="p-2">
                                <Bills />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Customer Selection Modal */}
            {isSelectSupplierModalOpen && (
                <SelectSupplier
                    setIsSelectSupplierModalOpen={setIsSelectSupplierModalOpen}
                />
            )}

            {/* Custom Scrollbar Styles */}
            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
};

export default Purchase;
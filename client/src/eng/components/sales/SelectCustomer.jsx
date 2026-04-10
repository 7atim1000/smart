import React, { useState, useEffect, useContext, useCallback } from 'react'
import { motion } from 'framer-motion'
import { IoCloseCircle } from 'react-icons/io5';
import { useDispatch } from 'react-redux'
import { PiUserCircleCheckLight } from "react-icons/pi";
import { FaSearch, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaWallet, FaFilter, FaUsers } from 'react-icons/fa';
import { toast } from 'react-toastify'
import { setCustomer } from '../../../redux/slices/customerSlice';
import { AuthContext } from '../../../../context/AuthContext';

const SelectCustomer = ({ setIsSelectCustomerModalOpen }) => {
    const dispatch = useDispatch();
    const { axios } = useContext(AuthContext);

    const handleClose = (customerId, customerName, email, balance, currency) => {
        dispatch(setCustomer({ 
            customerId, 
            customerName, 
            email, 
            balance,
            currency: currency || 'AED'
        }));
        setIsSelectCustomerModalOpen(false);
    };

    // State variables
    const [list, setList] = useState([]);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('-createdAt');
    const [loading, setLoading] = useState(false);
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 12,
        total: 0,
        totalPages: 1
    });
    const [showFilters, setShowFilters] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 400);

        return () => clearTimeout(timer);
    }, [search]);

    // Fetch customers function with useCallback to prevent unnecessary recreations
    const fetchContacts = useCallback(async (page = pagination.currentPage) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: pagination.itemsPerPage,
                sort: sort,
                ...(debouncedSearch && { search: debouncedSearch }),
                // Only fetch customers (isReceivable = true)
                isReceivable: 'true'
            });

            const response = await axios.get(`/v1/api/contacts?${params}`);
            
            if (response.data.success) {
                setList(response.data.contacts);
                setPagination({
                    currentPage: response.data.pagination.page,
                    itemsPerPage: response.data.pagination.limit,
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages
                });
            } else {
                toast.error('Failed to fetch customers');
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Error loading customers');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, sort, pagination.currentPage, pagination.itemsPerPage, axios]);

    // Fetch customers when debounced search or sort changes
    useEffect(() => {
        fetchContacts(1); // Reset to first page when filters change
    }, [fetchContacts, debouncedSearch, sort]);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchContacts(newPage);
        }
    };

    // Toggle sort
    const toggleSort = () => {
        setSort(prev => prev === '-createdAt' ? 'createdAt' : '-createdAt');
    };

    return (
        <div className='fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-1' dir="ltr">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className='bg-gradient-to-b from-white to-blue-50 rounded-2xl shadow-2xl border border-blue-200 w-full max-w-6xl max-h-[90vh] flex flex-col'
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2.5 rounded-lg">
                            <FaUsers className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h2 className='text-white text-lg md:text-xl font-bold'>Select Customer</h2>
                            <p className='text-blue-100 text-sm'>Choose a customer for your sale</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsSelectCustomerModalOpen(false)}
                        className='p-2 text-white hover:bg-white/20 rounded-lg transition-all duration-200 cursor-pointer'
                        aria-label="Close"
                    >
                        <IoCloseCircle size={28} />
                    </button>
                </div>

                {/* Search and Filter Section */}
                <div className='p-6 border-b border-blue-100'>
                    <div className='flex flex-col md:flex-row gap-4'>
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="h-5 w-5 text-blue-400" />
                            </div>
                            <input
                                type='text'
                                placeholder='Search customers by name, email, or phone...'
                                className='w-full pl-10 pr-4 py-3 border border-blue-200 rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition duration-200'
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={toggleSort}
                                className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-200 hover:bg-blue-100 transition duration-200 cursor-pointer"
                            >
                                <FaFilter className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    Sort: {sort === '-createdAt' ? 'Newest' : 'Oldest'}
                                </span>
                            </button>
                            <div className="text-sm text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                                {pagination.total} customers
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                        Showing only customers (receivable accounts)
                    </div>
                </div>

                {/* Loading Indicator */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading Customers...</p>
                        <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the customer list</p>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-hidden">
                    {!loading && list.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                            <div className="mb-6 p-4 bg-blue-50 rounded-full">
                                <FaUsers className="w-12 h-12 text-blue-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                {debouncedSearch ? 'No Customers Found' : 'No Customers Available'}
                            </h3>
                            <p className="text-gray-500 max-w-md">
                                {debouncedSearch
                                    ? `No customers found matching "${debouncedSearch}"`
                                    : 'Your customer list is empty. Start by adding new customers!'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-y-auto h-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
                                {list.map((customer) => (
                                    <motion.div
                                        key={customer._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="group bg-white border border-blue-100 rounded-xl p-5 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                        onClick={() => handleClose(
                                            customer._id, 
                                            customer.name, 
                                            customer.email, 
                                            customer.balance,
                                            customer.balanceCurrency
                                        )}
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                                                    <FaUser className="text-white w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-gray-800 text-lg truncate">
                                                        {customer.name}
                                                    </h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            Number(customer.balance) === 0
                                                                ? 'bg-green-100 text-green-700'
                                                                : Number(customer.balance) > 0
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {Number(customer.balance) === 0 ? 'Balance Clear' : 
                                                             Number(customer.balance) > 0 ? 'Has Balance' : 'In Credit'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <PiUserCircleCheckLight className="w-7 h-7 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                    <FaEnvelope className="w-3.5 h-3.5 text-blue-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500">Email</p>
                                                    <p className="text-sm font-medium text-gray-700 truncate">
                                                        {customer.email || 'Not provided'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                    <FaPhone className="w-3.5 h-3.5 text-blue-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs text-gray-500">Contact</p>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {customer.phone || 'Not provided'}
                                                    </p>
                                                </div>
                                            </div>

                                            {customer.address && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                                        <FaMapMarkerAlt className="w-3.5 h-3.5 text-blue-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs text-gray-500">Address</p>
                                                        <p className="text-sm font-medium text-gray-700 line-clamp-2">
                                                            {customer.address}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-5 pt-4 border-t border-blue-100">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <FaWallet className="w-4 h-4 text-gray-400" />
                                                    <span className="text-sm text-gray-500">Balance</span>
                                                </div>
                                                <span className={`text-lg font-bold ${
                                                    Number(customer.balance) === 0
                                                        ? 'text-green-600'
                                                        : Number(customer.balance) > 0
                                                            ? 'text-red-600'
                                                            : 'text-blue-600'
                                                }`}>
                                                    {Number(customer.balance).toFixed(2)} 
                                                    <span className="text-sm font-normal text-gray-500 ml-1">
                                                        {customer.balanceCurrency || 'AED'}
                                                    </span>
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-4 text-center">
                                            <button className="w-full py-2.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-lg font-medium text-sm hover:from-blue-100 hover:to-blue-200 transition duration-200 cursor-pointer">
                                                Select Customer
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-blue-100 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={pagination.currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <span className="px-4 py-1 bg-blue-600 text-white rounded-lg">
                                {pagination.currentPage}
                            </span>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className='p-4 border-t border-blue-100 bg-gradient-to-r from-blue-50 to-white rounded-b-2xl'>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>Showing <span className="font-semibold text-blue-700">{list.length}</span> customers</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsSelectCustomerModalOpen(false)}
                                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200 cursor-pointer text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <div className="text-xs text-gray-500">
                                Click on a customer card to select
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SelectCustomer;
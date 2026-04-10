// Added useNavigate hook:

import React, { useContext, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaUser, 
    FaUsers, FaEnvelope, FaPhone, FaMapMarkerAlt, 
    FaChevronDown, FaChevronUp, FaFilter, FaSync,
    FaUserTie, FaBuilding, FaUserCircle, FaUserFriends
} from 'react-icons/fa';
import { MdRefresh, MdAccountBalance, MdEmail, MdPhone, MdLocationOn } from 'react-icons/md';
import { BiUser, BiUserPlus, BiCategory } from 'react-icons/bi';
import { IoMdArrowForward, IoMdArrowBack } from 'react-icons/io';
import { GiPayMoney, GiReceiveMoney } from 'react-icons/gi';

import AddContactModal from '../components/contacts/AddContactModal';
import UpdateContactModal from '../components/contacts/UpdateContactModal';
// Remove ContactDetails import as it will be navigated to

const Contacts = () => {
    
    const navigate = useNavigate();
    const { axios } = useContext(AuthContext);
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedContact, setSelectedContact] = useState(null);
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    // Remove isDetailsModalOpen state
    
    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [contactType, setContactType] = useState('all'); // 'all', 'customers', 'suppliers'
    const [isReceivableFilter, setIsReceivableFilter] = useState('');
    const [isPayableFilter, setIsPayableFilter] = useState('');
    const [sortFilter, setSortFilter] = useState('-createdAt');
    
    // Pagination
    const [pagination, setPagination] = useState({
        currentPage: 1,
        itemsPerPage: 10,
        total: 0,
        totalPages: 1
    });

    // Debounce search
    const searchTimeout = useRef(null);

    // Fetch all contacts
    const fetchContacts = async (page = pagination.currentPage) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit: pagination.itemsPerPage,
                sort: sortFilter,
                ...(searchTerm && { search: searchTerm }),
                ...(contactType !== 'all' && { contactType }),
                ...(isReceivableFilter && { isReceivable: isReceivableFilter }),
                ...(isPayableFilter && { isPayable: isPayableFilter })
            });

            const response = await axios.get(`/v1/api/contacts?${params}`);
            
            if (response.data.success) {
                setContacts(response.data.contacts);
                setPagination({
                    currentPage: response.data.pagination.page,
                    itemsPerPage: response.data.pagination.limit,
                    total: response.data.pagination.total,
                    totalPages: response.data.pagination.totalPages
                });
            } else {
                toast.error('Failed to fetch contacts');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            toast.error('Error loading contacts');
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchContacts(1);
    }, []);

    // Debounced search
    useEffect(() => {
        if (searchTimeout.current) {
            clearTimeout(searchTimeout.current);
        }
        
        searchTimeout.current = setTimeout(() => {
            fetchContacts(1);
        }, 500);

        return () => clearTimeout(searchTimeout.current);
    }, [searchTerm]);

    // Filter and sort changes
    useEffect(() => {
        fetchContacts(1);
    }, [contactType, isReceivableFilter, isPayableFilter, sortFilter]);

    // Handle view contact details - Navigate to new route
    const handleViewContact = (contact) => {
        // Navigate to contact details page with contact ID
        navigate(`/en/contactdetails/${contact._id}`, { state: { contact } });
    };

    // Handle edit contact
    const handleEditContact = (contact, e) => {
        e.stopPropagation();
        setSelectedContact(contact);
        setIsUpdateModalOpen(true);
    };

    // Handle delete contact
    const handleDeleteContact = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this contact?')) {
            try {
                const response = await axios.delete(`/v1/api/contacts/${id}`);
                if (response.data.success) {
                    toast.success('Contact deleted successfully');
                    fetchContacts(pagination.currentPage);
                } else {
                    toast.error('Failed to delete contact');
                }
            } catch (error) {
                console.error('Delete error:', error);
                toast.error(error.response?.data?.message || 'Error deleting contact');
            }
        }
    };

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setContactType('all');
        setIsReceivableFilter('');
        setIsPayableFilter('');
        setSortFilter('-createdAt');
    };

    // Count contacts by type
    const customerCount = contacts.filter(c => c.isReceivable).length;
    const supplierCount = contacts.filter(c => c.isPayable).length;

    // Pagination controls
    const PaginationControls = () => {
        const handlePageChange = (newPage) => {
            fetchContacts(newPage);
        };

        const handleItemsPerPageChange = (newItemsPerPage) => {
            setPagination(prev => ({
                ...prev,
                itemsPerPage: newItemsPerPage,
                currentPage: 1
            }));
            fetchContacts(1);
        };

        return (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 py-3 px-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold text-blue-600">{contacts.length}</span> of{' '}
                    <span className="font-semibold text-blue-600">{pagination.total}</span> contacts
                </div>
                
                <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm
                                 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    
                    <span className="px-3 py-1.5 bg-blue-50 rounded-lg text-blue-700 text-sm">
                        Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    
                    <button
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                        className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm
                                 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                    
                    <select
                        value={pagination.itemsPerPage}
                        onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="10">10 per page</option>
                        <option value="20">20 per page</option>
                        <option value="50">50 per page</option>
                        <option value="100">100 per page</option>
                    </select>
                </div>
            </div>
        );
    };

    return (
        <div dir="ltr" className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-sky-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-blue-100 px-4 sm:px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FaUsers className="text-blue-600" size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">
                                Contacts Management
                            </h1>
                            <p className="text-sm text-gray-500">
                                Manage your customers, suppliers, and partners
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
                            <span>Add Contact</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="px-4 sm:px-6 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div 
                        onClick={() => setContactType('all')}
                        className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all
                            ${contactType === 'all' 
                                ? 'border-blue-500 shadow-md' 
                                : 'border-gray-200 hover:border-blue-300'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">All Contacts</p>
                                <p className="text-2xl font-bold text-gray-800">{pagination.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FaUsers className="text-blue-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div 
                        onClick={() => setContactType('customers')}
                        className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all
                            ${contactType === 'customers' 
                                ? 'border-green-500 shadow-md' 
                                : 'border-gray-200 hover:border-green-300'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Customers</p>
                                <p className="text-2xl font-bold text-gray-800">{customerCount}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <GiReceiveMoney className="text-green-600" size={24} />
                            </div>
                        </div>
                    </div>

                    <div 
                        onClick={() => setContactType('suppliers')}
                        className={`bg-white rounded-xl p-4 border-2 cursor-pointer transition-all
                            ${contactType === 'suppliers' 
                                ? 'border-purple-500 shadow-md' 
                                : 'border-gray-200 hover:border-purple-300'}`}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Suppliers</p>
                                <p className="text-2xl font-bold text-gray-800">{supplierCount}</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <GiPayMoney className="text-purple-600" size={24} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="px-4 sm:px-6 py-4">
                <div className="flex flex-col gap-3">
                    {/* Search bar */}
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search contacts by name, email, or phone..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                                     focus:border-transparent bg-white"
                        />
                    </div>

                    {/* Filter toggle for mobile */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="sm:hidden flex items-center gap-2 text-blue-600 font-medium"
                    >
                        <FaFilter size={14} />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                    </button>

                    {/* Filter options */}
                    <div className={`${showFilters ? 'flex' : 'hidden sm:flex'} flex-col sm:flex-row gap-3`}>
                        <select
                            value={isReceivableFilter}
                            onChange={(e) => setIsReceivableFilter(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg
                                     focus:outline-none focus:ring-2 focus:ring-blue-500
                                     bg-white text-sm"
                        >
                            <option value="">All Receivable Status</option>
                            <option value="true">Receivable Only</option>
                            <option value="false">Non-Receivable</option>
                        </select>

                        <select
                            value={isPayableFilter}
                            onChange={(e) => setIsPayableFilter(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg
                                     focus:outline-none focus:ring-2 focus:ring-blue-500
                                     bg-white text-sm"
                        >
                            <option value="">All Payable Status</option>
                            <option value="true">Payable Only</option>
                            <option value="false">Non-Payable</option>
                        </select>

                        <select
                            value={sortFilter}
                            onChange={(e) => setSortFilter(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg
                                     focus:outline-none focus:ring-2 focus:ring-blue-500
                                     bg-white text-sm"
                        >
                            <option value="-createdAt">Newest First</option>
                            <option value="createdAt">Oldest First</option>
                            <option value="name">Name: A to Z</option>
                            <option value="-name">Name: Z to A</option>
                            <option value="email">Email: A to Z</option>
                            <option value="-email">Email: Z to A</option>
                        </select>

                        {(searchTerm || contactType !== 'all' || isReceivableFilter || isPayableFilter || sortFilter !== '-createdAt') && (
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2 text-blue-600 hover:text-blue-700 
                                         font-medium text-sm flex items-center gap-1"
                            >
                                <MdRefresh size={16} />
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Contacts Grid/List */}
            <div className="px-4 sm:px-6 pb-6">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading contacts...</p>
                    </div>
                ) : contacts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <FaUsers className="mx-auto text-5xl text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Contacts Found</h3>
                        <p className="text-gray-500 mb-4">
                            {searchTerm || contactType !== 'all' || isReceivableFilter || isPayableFilter 
                                ? 'No contacts match your filters' 
                                : 'Get started by adding your first contact'}
                        </p>
                        {!searchTerm && contactType === 'all' && !isReceivableFilter && !isPayableFilter && (
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 
                                         rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <FaPlus size={16} />
                                Add Contact
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Grid View - Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {contacts.map((contact) => (
                                <motion.div
                                    key={contact._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-xl shadow-sm border border-gray-200 
                                             hover:shadow-md transition-all cursor-pointer
                                             overflow-hidden group"
                                    onClick={() => handleViewContact(contact)}
                                >
                                    <div className="p-5">
                                        {/* Header with actions */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-full">
                                                    <FaUserCircle className="text-blue-600" size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-800">{contact.name}</h3>
                                                    <p className="text-xs text-gray-500">{contact.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={(e) => handleEditContact(contact, e)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                    title="Edit"
                                                >
                                                    <FaEdit size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => handleDeleteContact(contact._id, e)}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                                    title="Delete"
                                                >
                                                    <FaTrash size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Contact Details */}
                                        <div className="space-y-2 mt-3">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaPhone className="text-gray-400" size={12} />
                                                <span>{contact.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <FaMapMarkerAlt className="text-gray-400" size={12} />
                                                <span className="truncate">{contact.address}</span>
                                            </div>
                                        </div>

                                        {/* Status Badges */}
                                        <div className="flex gap-2 mt-4">
                                            {contact.isReceivable && (
                                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                                    Customer
                                                </span>
                                            )}
                                            {contact.isPayable && (
                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                                    Supplier
                                                </span>
                                            )}
                                        </div>

                                        {/* Balance */}
                                        <div className="mt-4 pt-3 border-t border-gray-100">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Balance</span>
                                                <span className={`font-semibold ${
                                                    contact.balance > 0 ? 'text-green-600' : 
                                                    contact.balance < 0 ? 'text-red-600' : 'text-gray-600'
                                                }`}>
                                                    {contact.balance?.toFixed(2)} AED
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <PaginationControls />
                    </>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <AddContactModal
                        setIsAddModalOpen={setIsAddModalOpen}
                        fetchContacts={() => fetchContacts(pagination.currentPage)}
                    />
                )}

                {isUpdateModalOpen && selectedContact && (
                    <UpdateContactModal
                        setIsUpdateModalOpen={setIsUpdateModalOpen}
                        contactData={selectedContact}
                        fetchContacts={() => fetchContacts(pagination.currentPage)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};



export default Contacts;
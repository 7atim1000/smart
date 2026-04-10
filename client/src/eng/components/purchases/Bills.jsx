import React, { useState, useMemo, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
    FaMoneyBillWave, FaCheckCircle, FaTimesCircle, 
    FaWallet
} from 'react-icons/fa';
import { getTotalPrice } from '../../../redux/slices/buySlice';
import { removeAllItems } from '../../../redux/slices/buySlice';
import { removeSupplier } from '../../../redux/slices/supplierSlice';
import toast from 'react-hot-toast';
import { AuthContext } from '../../../../context/AuthContext';
import PrintQuotation from './PrintQuotation';

const Bills = ({ fetchServices }) => {
    const dispatch = useDispatch();
    const { axios } = useContext(AuthContext);

    // Get data from slices
    const supplierData = useSelector((state) => state.supplier);
    const buyData = useSelector(state => state.buy);
    const userData = useSelector((state) => state.user);

    const total = useSelector(getTotalPrice);
    const taxRate = 0.00;
    
    const calculations = useMemo(() => {
        const tax = (total * taxRate) / 100;
        const totalPriceWithTax = total + tax;
        return { tax, totalPriceWithTax };
    }, [total]);

    // State management
    const [showQuotation, setShowQuotation] = useState(false);
    const [buyInfo, setBuyInfo] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Get currency from saleData or default to AED
    const currency = buyData[0]?.currency || 'AED';
    
    // Balance is the grand total (no payments)
    const balance = calculations.totalPriceWithTax;

    // Handle place order
    const handlePlaceOrder = async () => {
        setIsProcessing(true);

        // Validate supplier
        if (!supplierData.supplierId) {
            toast.error('Please select a supplier');
            setIsProcessing(false);
            return;
        }

        // Validate items
        if (buyData.length === 0) {
            toast.error('Please select items');
            setIsProcessing(false);
            return;
        }

        try {
            // Prepare invoice data - without payment fields
            const invoiceData = {
                type: 'bills',
                invoiceNumber: `QTN-${Date.now()}`,
                supplier: supplierData.supplierId,
                customer: null,
                invoiceStatus: "Completed",
                invoiceType: "Buy invoice",
                status: "Quotation",
                bills: {
                    total: total,
                    tax: calculations.tax,
                    totalWithTax: calculations.totalPriceWithTax,
                    payed: 0, // No payment made
                    balance: balance, // Full amount as balance
                    currency: currency,
                },
                items: buyData.map(item => ({
                    product: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.pricePerQuantity,
                    total: item.price
                })),
                paymentMethod: "Not Paid", // Default payment method
                user: userData?.id || null,
                orderDate: new Date()
            };

            // Send to API
            const response = await axios.post('/v1/api/invoices/', invoiceData);

            if (response.data.success) {
                toast.success('Buy Quotation created successfully!');
                
                // Prepare quotation data
                const quotationData = {
                    ...response.data.data,
                    supplierName: supplierData.supplierName,
                    paymentMethod: "Not Paid"
                };
                
                setBuyInfo(quotationData);
                setShowQuotation(true); // Open quotation modal
                
                // Reset form
                dispatch(removeSupplier());
                dispatch(removeAllItems());
                
                // Refresh services if needed
                if (fetchServices) {
                    fetchServices({ category: 'all', page: 1 });
                }
            } else {
                toast.error('Failed to create quotation');
            }
        } catch (error) {
            console.error('Error creating quotation:', error);
            toast.error(error.response?.data?.message || 'Error creating buy quotation');
        } finally {
            setIsProcessing(false);
        }
    };

    // Cancel order
    const cancelOrder = () => {
        if (buyData.length === 0) {
            toast('No items to cancel', {
                icon: 'ℹ️'
            });
            return;
        }

        if (window.confirm('Are you sure you want to cancel all items?')) {
            dispatch(removeSupplier());
            dispatch(removeAllItems());
            if (fetchServices) {
                fetchServices({ category: 'all', page: 1 });
            }
            toast.success('Order cancelled');
        }
    };

    return (
        <div className='bg-white rounded-xl shadow-lg border border-blue-100 p-4 md:p-1 h-full' dir="ltr">
            {/* Summary Cards */}
            <div className='grid grid-cols-2 gap-3 mb-4'>
                <div className='bg-blue-50 rounded-lg p-3 border border-blue-100'>
                    <p className='text-xs text-blue-600 mb-1'>Items</p>
                    <p className='text-xl font-bold text-blue-800'>{buyData.length}</p>
                    <p className='text-xs text-gray-500'>products</p>
                </div>

                <div className='bg-blue-50 rounded-lg p-3 border border-blue-100'>
                    <p className='text-xs text-blue-600 mb-1'>Subtotal</p>
                    <p className='text-xl font-bold text-blue-800'>{total.toFixed(2)}</p>
                    <p className='text-xs text-gray-500'>{currency}</p>
                </div>
            </div>

            {/* Price Breakdown */}
            <div className='space-y-2 mb-4'>
                <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                    <span className='text-sm text-gray-600'>Subtotal:</span>
                    <span className='font-medium text-gray-800'>{total.toFixed(2)} {currency}</span>
                </div>

                <div className='flex justify-between items-center py-2 border-b border-gray-100'>
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-gray-600'>Tax</span>
                        <span className='text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full'>{taxRate}%</span>
                    </div>
                    <span className='font-medium text-gray-800'>{calculations.tax.toFixed(2)} {currency}</span>
                </div>

                <div className='flex justify-between items-center py-3 bg-blue-50 rounded-lg px-3'>
                    <span className='text-sm font-semibold text-blue-800'>Grand Total:</span>
                    <span className='text-lg font-bold text-blue-800'>{calculations.totalPriceWithTax.toFixed(2)} {currency}</span>
                </div>
            </div>

            {/* Balance Information */}
            <div className='mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200'>
                <div className='flex items-center gap-2 mb-2'>
                    <FaWallet className='text-yellow-600' />
                    <span className='text-sm font-medium text-gray-700'>Balance Due</span>
                </div>
                <div className='flex justify-between items-center'>
                    <span className='text-sm text-gray-600'>Amount to be paid:</span>
                    <span className='text-lg font-bold text-red-600'>
                        {balance.toFixed(2)} {currency}
                    </span>
                </div>
                <p className='text-xs text-gray-500 mt-2'>
                    This is a quotation. Payment will be collected separately.
                </p>
            </div>

            {/* Action Buttons */}
            <div className='space-y-3'>
                <button
                    onClick={handlePlaceOrder}
                    disabled={isProcessing || buyData.length === 0}
                    className={`w-full py-3 rounded-lg font-semibold text-sm transition duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                        isProcessing || buyData.length === 0
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md'
                    }`}
                >
                    {isProcessing ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Processing...
                        </>
                    ) : (
                        <>
                            <FaCheckCircle className='w-5 h-5' />
                            Create Buy Quotation
                        </>
                    )}
                </button>

                <button
                    onClick={cancelOrder}
                    disabled={buyData.length === 0}
                    className={`w-full py-3 rounded-lg font-medium text-sm transition duration-200 cursor-pointer flex items-center justify-center gap-2 ${
                        buyData.length === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                    }`}
                >
                    <FaTimesCircle className='w-4 h-4' />
                    Cancel
                </button>
            </div>

            {/* Status Message */}
            <div className='mt-4 pt-3 border-t border-blue-100'>
                <div className='flex items-center gap-2'>
                    <div className={`w-2 h-2 rounded-full ${
                        buyData.length > 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-300'
                    }`}></div>
                    <span className='text-xs text-gray-600'>
                        {buyData.length > 0
                            ? `Ready to create quotation - ${buyData.length} items`
                            : 'No items to quote'}
                    </span>
                </div>
            </div>

            {/* Quotation Modal */}
            {showQuotation && buyInfo && (
                <PrintQuotation
                    buyInfo={buyInfo}
                    setShowQuotation={setShowQuotation}
                    isTemporary={!buyInfo._id}
                />
            )}
        </div>
    );
};

export default Bills;
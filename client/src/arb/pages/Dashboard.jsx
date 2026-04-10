import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { AuthContext } from '../../../context/AuthContext';
import { 
  FaBox, 
  FaUsers, 
  FaUserTie, 
  FaFileInvoice, 
  FaShoppingCart,
  FaArrowLeft,
  FaArrowRight,
  FaEye,
  FaPrint,
  FaDownload,
  FaDollarSign,
  FaCalendarAlt,
  FaChartLine
} from 'react-icons/fa';
import { MdOutlineProductionQuantityLimits } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const ArbDashboard = () => {
  const { axios } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    totalSaleInvoices: 0,
    totalPurchaseInvoices: 0,
    recentSaleInvoices: [],
    recentPurchaseInvoices: []
  });

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/v1/api/dashboard/stats');
      
      if (response.data.success) {
        setStats(response.data.data);
      } else {
        toast.error('فشل في تحميل إحصائيات لوحة التحكم');
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('خطأ في تحميل إحصائيات لوحة التحكم');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = new Date(date);
    return d.toLocaleDateString('ar-EG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount, currency = 'AED') => {
    return `${amount?.toFixed(2) || '0.00'} ${currency}`;
  };

  // Navigate to invoice details
  const navigateToInvoice = (invoiceId, type) => {
    if (type === 'sale') {
      navigate(`/ar/invdetails/${invoiceId}`);
    } else {
      navigate(`/ar/purchase-invoice/${invoiceId}`);
    }
  };

  // Calculate totals for recent invoices
  const totalRecentSales = stats.recentSaleInvoices.reduce((sum, inv) => sum + (inv.bills?.totalWithTax || 0), 0);
  const totalRecentPurchases = stats.recentPurchaseInvoices.reduce((sum, inv) => sum + (inv.bills?.totalWithTax || 0), 0);

  // Statistics cards data
  const statCards = [
    {
      title: 'إجمالي المنتجات',
      value: stats.totalProducts,
      icon: <MdOutlineProductionQuantityLimits className="w-8 h-8" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'إجمالي العملاء',
      value: stats.totalCustomers,
      icon: <FaUsers className="w-8 h-8" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'إجمالي الموردين',
      value: stats.totalSuppliers,
      icon: <FaUserTie className="w-8 h-8" />,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'فواتير المبيعات',
      value: stats.totalSaleInvoices,
      icon: <FaFileInvoice className="w-8 h-8" />,
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600'
    },
    {
      title: 'فواتير المشتريات',
      value: stats.totalPurchaseInvoices,
      icon: <FaShoppingCart className="w-8 h-8" />,
      color: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600'
    }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaChartLine className="text-blue-600" />
            لوحة التحكم
          </h1>
          <p className="text-gray-600 mt-2">مرحباً بك في لوحة تحكم نظام إدارة الفواتير</p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600 text-lg">جاري تحميل إحصائيات لوحة التحكم...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              {statCards.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-r ${card.color} rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-transform duration-300`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="bg-white/20 p-3 rounded-xl">
                      {card.icon}
                    </div>
                    <span className="text-3xl font-bold">{card.value}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                </motion.div>
              ))}
            </div>

            {/* Sales and Purchase Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-2xl p-6 border border-emerald-200 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-emerald-500 p-3 rounded-xl">
                    <FaDollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-800">ملخص المبيعات</h3>
                </div>
                <p className="text-3xl font-bold text-emerald-700">
                  {formatCurrency(totalRecentSales)}
                </p>
                <p className="text-sm text-emerald-600 mt-2">إجمالي آخر 5 فواتير مبيعات</p>
                <div className="mt-3 pt-3 border-t border-emerald-200">
                  <p className="text-xs text-emerald-600">
                    عدد الفواتير: {stats.recentSaleInvoices.length} فاتورة
                  </p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200 shadow-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-amber-500 p-3 rounded-xl">
                    <FaDollarSign className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-amber-800">ملخص المشتريات</h3>
                </div>
                <p className="text-3xl font-bold text-amber-700">
                  {formatCurrency(totalRecentPurchases)}
                </p>
                <p className="text-sm text-amber-600 mt-2">إجمالي آخر 5 فواتير مشتريات</p>
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <p className="text-xs text-amber-600">
                    عدد الفواتير: {stats.recentPurchaseInvoices.length} فاتورة
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Recent Invoices Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Sale Invoices */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
              >
                <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4">
                  <h2 className="text-white text-xl font-bold flex items-center gap-2">
                    <FaFileInvoice className="text-white" />
                    آخر فواتير المبيعات
                  </h2>
                </div>
                
                <div className="p-6">
                  {stats.recentSaleInvoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد فواتير مبيعات لعرضها
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats.recentSaleInvoices.map((invoice, index) => (
                        <div
                          key={invoice._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigateToInvoice(invoice._id, 'sale')}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="font-semibold text-gray-800">
                                {invoice.invoiceNumber}
                              </span>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                <FaCalendarAlt className="w-3 h-3" />
                                <span>{formatDate(invoice.createdAt)}</span>
                              </div>
                            </div>
                            <div className="text-left">
                              <span className="text-lg font-bold text-emerald-600">
                                {formatCurrency(invoice.bills?.totalWithTax, invoice.bills?.currency)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <FaUsers className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {invoice.customer?.name || 'عميل غير محدد'}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToInvoice(invoice._id, 'sale');
                              }}
                              className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 text-sm"
                            >
                              <FaEye className="w-4 h-4" />
                              عرض
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {stats.totalSaleInvoices > 5 && (
                    <button
                      onClick={() => navigate('/ar/invoices')}
                      className="mt-4 w-full py-2 text-center text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center justify-center gap-2"
                    >
                      عرض جميع الفواتير
                      <FaArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>

              {/* Recent Purchase Invoices */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200"
              >
                <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-4">
                  <h2 className="text-white text-xl font-bold flex items-center gap-2">
                    <FaShoppingCart className="text-white" />
                    آخر فواتير المشتريات
                  </h2>
                </div>
                
                <div className="p-6">
                  {stats.recentPurchaseInvoices.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      لا توجد فواتير مشتريات لعرضها
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stats.recentPurchaseInvoices.map((invoice, index) => (
                        <div
                          key={invoice._id}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => navigateToInvoice(invoice._id, 'purchase')}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <span className="font-semibold text-gray-800">
                                {invoice.invoiceNumber}
                              </span>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                <FaCalendarAlt className="w-3 h-3" />
                                <span>{formatDate(invoice.createdAt)}</span>
                              </div>
                            </div>
                            <div className="text-left">
                              <span className="text-lg font-bold text-amber-600">
                                {formatCurrency(invoice.bills?.totalWithTax, invoice.bills?.currency)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                              <FaUserTie className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {invoice.supplier?.name || 'مورد غير محدد'}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateToInvoice(invoice._id, 'purchase');
                              }}
                              className="flex items-center gap-1 text-amber-600 hover:text-amber-700 text-sm"
                            >
                              <FaEye className="w-4 h-4" />
                              عرض
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {stats.totalPurchaseInvoices > 5 && (
                    <button
                      onClick={() => navigate('/ar/purchases')}
                      className="mt-4 w-full py-2 text-center text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center justify-center gap-2"
                    >
                      عرض جميع فواتير المشتريات
                      <FaArrowLeft className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 bg-white rounded-2xl shadow-xl p-6 border border-gray-200"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-4">إجراءات سريعة</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <button
                  onClick={() => navigate('/ar/sales')}
                  className="flex flex-col items-center gap-2 p-4 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
                >
                  <FaFileInvoice className="w-6 h-6 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-emerald-700">فاتورة مبيعات جديدة</span>
                </button>
                <button
                  onClick={() => navigate('/ar/purchases')}
                  className="flex flex-col items-center gap-2 p-4 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors group"
                >
                  <FaShoppingCart className="w-6 h-6 text-amber-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-amber-700">فاتورة مشتريات جديدة</span>
                </button>
                <button
                  onClick={() => navigate('/ar/contacts')}
                  className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                >
                  <FaUsers className="w-6 h-6 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-blue-700">إدارة العملاء</span>
                </button>
                <button
                  onClick={() => navigate('/ar/categories')}
                  className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group"
                >
                  <FaBox className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-sm font-medium text-purple-700">إدارة المنتجات</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default ArbDashboard;
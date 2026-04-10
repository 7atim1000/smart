import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { FaPrint, FaTimes, FaCheckCircle, FaFileInvoice } from 'react-icons/fa';

const PrintQuotation = ({ saleInfo, setShowQuotation }) => {
    const invoiceRef = useRef(null);
    
    const handlePrint = () => {
        const printContent = invoiceRef.current.innerHTML;
        const WinPrint = window.open("", "", "width=900, height=650");
        
        WinPrint.document.write(` 
            <html>
                <head>
                    <title>عرض سعر</title>
                    <style>
                        @page {
                            size: A4;
                            margin: 1.5cm;
                        }
                        body { 
                            font-family: 'Arial', sans-serif; 
                            padding: 20px; 
                            background: white;
                            color: #333;
                            line-height: 1.5;
                            direction: rtl;
                        }
                        .quotation-container { 
                            max-width: 100%;
                            margin: 0 auto;
                        }
                        h1 {
                            color: #1e3a8a;
                            font-size: 24px;
                            margin-bottom: 5px;
                        }
                        h2 {
                            color: #2563eb;
                            font-size: 20px;
                            border-bottom: 2px solid #2563eb;
                            padding-bottom: 8px;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            border-bottom: 1px solid #e5e7eb;
                            padding-bottom: 15px;
                        }
                        .details {
                            margin-bottom: 20px;
                        }
                        .details p {
                            margin: 5px 0;
                        }
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 20px 0;
                        }
                        th {
                            background-color: #2563eb;
                            color: white;
                            padding: 10px;
                            text-align: center;
                            font-size: 12px;
                        }
                        td {
                            padding: 8px 10px;
                            border-bottom: 1px solid #e5e7eb;
                            font-size: 12px;
                            text-align: center;
                        }
                        .total-section {
                            margin-top: 20px;
                            text-align: left;
                        }
                        .total-line {
                            display: flex;
                            justify-content: flex-start;
                            gap: 20px;
                            margin: 5px 0;
                        }
                        .grand-total {
                            font-size: 16px;
                            font-weight: bold;
                            color: #1e3a8a;
                            border-top: 2px solid #2563eb;
                            padding-top: 10px;
                            margin-top: 10px;
                        }
                        .footer {
                            margin-top: 50px;
                            text-align: center;
                            font-size: 10px;
                            color: #6b7280;
                            border-top: 1px solid #e5e7eb;
                            padding-top: 15px;
                        }
                        .badge {
                            display: inline-block;
                            background-color: #2563eb;
                            color: white;
                            padding: 3px 8px;
                            border-radius: 4px;
                            font-size: 10px;
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="quotation-container">
                        ${printContent}
                    </div>
                </body>
            </html>
        `);
        WinPrint.document.close();
        WinPrint.focus();
        setTimeout(() => {
            WinPrint.print();
            WinPrint.close();
        }, 1000);
    };

    const handleClose = () => {
        setShowQuotation(false);
    };

    // Format date in Arabic format
    const formatDate = (date) => {
        if (!date) return 'غير متوفر';
        const d = new Date(date);
        return d.toLocaleDateString('ar-SA', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" dir="rtl">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                style={{ width: '900px' }} // A4 width approximation
            >
                {/* Modal Header - Blue */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <FaFileInvoice className="text-white w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">عرض سعر</h2>
                            <p className="text-blue-100 text-sm">رقم العرض #{saleInfo?.invoiceNumber}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
                        title="إغلاق"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Scrollable Content - A4 Style */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    <div 
                        ref={invoiceRef} 
                        className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto"
                        style={{ 
                            minHeight: '297mm', // A4 height
                            width: '210mm', // A4 width
                            margin: '0 auto',
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* Header */}
                        <div className="text-center mb-8 border-b-2 border-blue-200 pb-6">
                            <h1 className="text-3xl font-bold text-blue-800 mb-2">عرض سعر</h1>
                            <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-medium">
                                #{saleInfo?.invoiceNumber}
                            </div>
                        </div>

                        {/* Date and Customer Info */}
                        <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">التاريخ:</p>
                                <p className="font-semibold text-gray-800">{formatDate(saleInfo?.invoiceDate || saleInfo?.date)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">العميل:</p>
                                <p className="font-semibold text-gray-800">{saleInfo?.customerName || saleInfo?.customer?.name || 'عميل'}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        {saleInfo?.items && saleInfo.items.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">المنتجات</h3>
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="bg-blue-600 text-white">
                                            <th className="p-3 text-center text-sm">المنتج</th>
                                            <th className="p-3 text-center text-sm">الكمية</th>
                                            <th className="p-3 text-center text-sm">سعر الوحدة</th>
                                            <th className="p-3 text-center text-sm">الإجمالي</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {saleInfo.items.map((item, index) => (
                                            <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                                <td className="p-3 text-sm text-center">{item.name || item.product?.name}</td>
                                                <td className="p-3 text-center text-sm">{item.quantity}</td>
                                                <td className="p-3 text-center text-sm">
                                                    {item.pricePerQuantity || item.price} {saleInfo.bills?.currency}
                                                </td>
                                                <td className="p-3 text-center text-sm font-medium">
                                                    {(item.pricePerQuantity || item.price) * item.quantity} {saleInfo.bills?.currency}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Summary */}
                        <div className="flex justify-start mt-8">
                            <div className="w-80 bg-gray-50 p-5 rounded-lg border border-gray-200">
                                <div className="flex justify-between mb-2 text-sm">
                                    <span className="text-gray-600">المجموع الفرعي:</span>
                                    <span className="font-medium">
                                        {saleInfo.bills?.total?.toFixed(2)} {saleInfo.bills?.currency}
                                    </span>
                                </div>
                                <div className="flex justify-between mb-2 text-sm">
                                    <span className="text-gray-600">الضريبة:</span>
                                    <span className="font-medium">
                                        {saleInfo.bills?.tax?.toFixed(2)} {saleInfo.bills?.currency}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-3 border-t border-gray-300 text-base">
                                    <span className="font-bold text-gray-800">الإجمالي الكلي:</span>
                                    <span className="font-bold text-blue-700">
                                        {saleInfo.bills?.totalWithTax?.toFixed(2)} {saleInfo.bills?.currency}
                                    </span>
                                </div>
                                <div className="flex justify-between mt-2 text-sm">
                                    <span className="text-gray-600">المتبقي:</span>
                                    <span className="font-semibold text-red-600">
                                        {saleInfo.bills?.balance?.toFixed(2)} {saleInfo.bills?.currency}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-12 text-center text-gray-400 text-xs border-t border-gray-200 pt-6">
                            <p>هذا عرض سعر مُنشئ إلكترونياً ولا يحتاج إلى توقيع</p>
                            <p className="mt-1">شكراً لتعاملكم معنا</p>
                        </div>
                    </div>
                </div>

                {/* Footer - Blue */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex justify-between items-center">
                    <div className="text-white text-sm flex items-center gap-2">
                        <FaCheckCircle />
                        <span>تم إنشاء عرض السعر بنجاح</span>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer flex items-center gap-2 shadow-md"
                        >
                            <FaPrint />
                            طباعة عرض السعر
                        </button>
                        <button
                            onClick={handleClose}
                            className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors cursor-pointer"
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PrintQuotation;
import React, {useRef, useEffect} from 'react'
import { MdDeleteForever } from 'react-icons/md';
import { FaShoppingCart, FaTrashAlt, FaBox, FaTag } from 'react-icons/fa';
import { BsFillCartCheckFill } from 'react-icons/bs';
import { useSelector, useDispatch } from 'react-redux'

import { removeItem } from '../../../redux/slices/saleSlice';

const CartInfo = () => {

  // adding Item
  const saleData = useSelector(state => state.sale);

  // Sort saleData in descending order (newest first)
  const sortedSaleData = [...saleData].sort((a, b) => {
    if (a.timestamp && b.timestamp) {
      return new Date(b.timestamp) - new Date(a.timestamp);
    }
    return b.id - a.id;
  });

  // Calculate total
  const totalAmount = sortedSaleData.reduce((sum, item) => sum + (item.price || 0), 0);
  const totalItems = sortedSaleData.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // scrollbar
  const scrolLRef = useRef();
  useEffect(() => {
    if (scrolLRef.current) {
      scrolLRef.current.scrollTo({
        top: scrolLRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [saleData]);

  // Remove item
  const dispatch = useDispatch(); 
  const handleRemove = (itemId) => {
    dispatch(removeItem(itemId))
  }
    

  return (
    <div className='bg-gradient-to-b from-white to-blue-50 rounded-xl shadow-lg border border-blue-100 p-4 h-full' dir="rtl">
      {/* Header */}
      <div className='flex items-center justify-between mb-6 bg-blue-100'>
        <div className='flex items-center gap-3'>
          <div className='bg-gradient-to-r from-blue-500 to-blue-600 p-2.5 rounded-lg shadow-sm'>
            <FaShoppingCart className='text-white w-5 h-5' />
          </div>
          <div>
            <h2 className='text-lg font-bold text-gray-800'>سلة المبيعات</h2>
            <p className='text-xs text-gray-500'>المنتجات المحددة للبيع</p>
          </div>
        </div>

        <div className='flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200'>
          <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse'></div>
          <span className='text-xs font-medium text-blue-700'>{sortedSaleData.length} منتج</span>
        </div>
      </div>

      {/* Cart Items Container */}
      <div className='mb-4 '>
        <div className='flex items-center justify-between mb-3 px-1'>
          <h3 className='text-sm font-semibold text-gray-700'>المنتجات في السلة</h3>
          <div className='flex items-center gap-2'>
            <span className='text-xs text-gray-500'>{totalItems} وحدة</span>
            <div className='w-1 h-1 bg-gray-300 rounded-full'></div>
            <span className='text-xs font-medium text-blue-600'>{sortedSaleData.length} منتج</span>
          </div>
        </div>

        <div
          className='overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 rounded-lg border border-blue-100 bg-white p-1'
          ref={scrolLRef}
          style={{ maxHeight: '400px' }}
        >
          {sortedSaleData.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-12 px-4 text-center'>
              <div className='mb-4 p-4 bg-blue-50 rounded-full'>
                <BsFillCartCheckFill className='w-8 h-8 text-blue-400' />
              </div>
              <h4 className='text-gray-700 font-medium mb-1'>السلة فارغة</h4>
              <p className='text-sm text-gray-500 max-w-xs'>أضف منتجات إلى سلة المبيعات لتظهر هنا</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {sortedSaleData.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className='group bg-gradient-to-r from-white to-blue-200 hover:from-blue-50 hover:to-blue-100 rounded-lg border border-blue-100 p-3 transition-all duration-200 hover:shadow-sm hover:border-blue-200'
                >
                  <div className='flex items-start justify-between '>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1 '>
                        <div className='w-2 h-2 bg-blue-400 rounded-full'></div>
                        <h4 className='text-sm font-semibold text-gray-800 truncate' title={item.name}>
                          {item.name}
                        </h4>
                      </div>

                      <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                          <div className='text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded'>
                            <span className='font-medium text-blue-700'>{item.pricePerQuantity}</span>
                            <span className='text-gray-400 mx-1'>×</span>
                            <span className='font-medium text-blue-700'>{item.quantity}</span>
                            <span className='text-gray-400 mx-1'>=</span>
                          </div>
                          <span className='text-xs text-gray-500'>{item.unit || 'وحدة'}</span>
                        </div>

                        <div className='text-left'>
                          <p className='text-sm font-bold text-blue-800'>
                            {item.price.toFixed(2)} <span className='text-xs font-normal text-gray-500'>{item.currency}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemove(item.id)}
                      className='mr-3 p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100 cursor-pointer'
                      title="حذف المنتج"
                    >
                      <FaTrashAlt className='w-4 h-4' />
                    </button>
                  </div>

                  <div className='mt-2 pt-2 border-t border-blue-100 flex items-center justify-between'>
                    <button
                      onClick={() => handleRemove(item.id)}
                      className='flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 cursor-pointer transition duration-200 md:hidden'
                    >
                      <MdDeleteForever className='w-4 h-4' />
                      حذف
                    </button>

                    <div className='text-xs text-gray-500'>
                      سعر الوحدة: <span className='font-medium text-blue-600'>{item.pricePerQuantity} {item.currency}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Summary Section */}
      {sortedSaleData.length > 0 && (
        <div className='mt-6 pt-4 border-t border-blue-200'>
          <div className='grid grid-cols-2 gap-3 mb-3'>
            <div className='bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-3'>
              <p className='text-xs text-blue-700 mb-1'>إجمالي الوحدات</p>
              <p className='text-xl font-bold text-blue-900'>{totalItems}</p>
              <p className='text-xs text-blue-600'>وحدة</p>
            </div>

            <div className='bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-3'>
              <p className='text-xs text-emerald-700 mb-1'>المبلغ الإجمالي</p>
              <p className='text-xl font-bold text-emerald-900'>{totalAmount.toFixed(2)}</p>
              {/* <p className='text-xs text-emerald-600'>{currency || 'AED'}</p> */}
              <p className='text-xs text-emerald-600'>AED</p> 
              
            </div>
          </div>

          <div className='flex items-center justify-between p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg text-white'>
            <div className='flex items-center gap-2'>
              <BsFillCartCheckFill className='w-4 h-4' />
              <span className='text-sm font-medium'>إجمالي العرض</span>
            </div>
            <div className='text-left'>
              <p className='text-lg font-bold'>{totalAmount.toFixed(2)} </p>
              <p className='text-xs text-blue-200'>{sortedSaleData.length} منتج</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Empty State Footer */}
      {sortedSaleData.length === 0 && (
        <div className='mt-6 pt-4 border-t border-blue-100 text-center'>
          <div className='inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-full'>
            <div className='w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse'></div>
            <span className='text-sm'>أضف منتجات من لوحة الاختيار</span>
          </div>
        </div>
      )}

    </div>
  
);

}


export default CartInfo;
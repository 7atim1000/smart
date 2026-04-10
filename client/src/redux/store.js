import { configureStore } from '@reduxjs/toolkit'

import customerSlice from './slices/customerSlice'
import supplierSlice from './slices/supplierSlice'
import saleSlice from './slices/saleSlice';
import buySlice from './slices/buySlice';

import userSlice from './slices/userSlice';


const store = configureStore({
    
    reducer :{
        customer :customerSlice,
        supplier :supplierSlice,
        sale :saleSlice,
        buy :buySlice,
        user: userSlice,
      
    },

    devTools: import.meta.env.NODE_ENV !== "production",
});


export default store ;


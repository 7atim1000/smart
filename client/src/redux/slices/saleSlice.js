import { createSlice } from '@reduxjs/toolkit' ;

const initialState = [] ;

const saleSlice = createSlice ({
    name :'sale',
    
    initialState, 

    reducers :{

        addItems :(state, action) => {
            state.push(action.payload);
        },
        removeItem :(state, action) => {
            return state.filter(item => item.id != action.payload)
        },
        removeAllItems :(state) => {
            return [];
        }
    }

});

// state.sale.reduce   sale name of reduce "ABOVE"
export const getTotalPrice = (state) => state.sale.reduce((total, item) => total + item.price, 0);

export const { addItems, removeItem, removeAllItems } = saleSlice.actions ;
export default saleSlice.reducer ;
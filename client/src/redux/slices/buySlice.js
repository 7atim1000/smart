import { createSlice } from '@reduxjs/toolkit' ;

const initialState = [] ;

const buySlice = createSlice ({
    name :'buy',
    
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

export const getTotalPrice = (state) => state.buy.reduce((total, item) => total + item.price, 0);

export const { addItems, removeItem, removeAllItems } = buySlice.actions ;
export default buySlice.reducer ;
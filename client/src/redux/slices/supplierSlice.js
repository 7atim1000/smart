import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    
    buyId :"",
    supplierId :"",
    supplierName : "",
    email: "",
    contactNo : "",
    address :"",
    balance : "",

    service: null
}

const supplierSlice = createSlice({
    name :"supplier",

    initialState,

    reducers :{
        
        setSupplier :(state, action) => {
            const { supplierId, supplierName , email, contactNo,  address, balance } = action.payload ;

            state.buyId = `${Date.now()}`;

            state.supplierId = supplierId;
            state.supplierName = supplierName ;
            state.email = email ;
            state.contactNo = contactNo;
            state.address = address;

            state.balance = balance;
        },
        removeSupplier :(state) => {
            state.supplierId = "";
            state.supplierName = "" ;
            state.email = "" ;
            state.contactNo = "";
            state.address = "";
            
            state.balance = "";
            state.service = null;
        },
        
        
        updateService :(state, action) => {
            state.service = action.payload.service;
        }
    }
});

export const { setSupplier, removeSupplier, updateService } = supplierSlice.actions ;
export default supplierSlice.reducer;

import mongoose from 'mongoose' ;
import { ITransaction } from './transaction.interface' ;

const transactionSchema = new mongoose.Schema ({

    transactionNumber : { type: String, required :'true'},
    shift : { type: String, enum :['Morning', 'Evening'], required :true},
    
    amount: {type: Number, required: [true, 'Amount field is required']},
    type: { type: String, required: [true, 'Type field is required']},
    account :{ type: String, required: [true, 'Account field is required']},
    refrence :{ type: String, required: [true, 'Refrence field is required']},
    description :{ type: String, required: [true, 'Description field is required']},
    status : { type: String , default :'-'},
    paymentMethod : { type: String , required : true }, 
    currency: { type: String, required: true},
    
    date :{ type: Date , required: [true, 'Date field is required'] },
    user :{ type : mongoose.Schema.Types.ObjectId, ref: "User" }
}, {
    timestamps: true 
})

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
export default Transaction ;
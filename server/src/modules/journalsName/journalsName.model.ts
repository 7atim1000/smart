import mongoose from 'mongoose' ;
import { IJournalsName, AddJournalsNameRequest } from './journalsName.interface';

const journalsNameSchema = new mongoose.Schema ({
    journalName: { type: String, required : true } ,
    journalNameArb: { type: String, required : true } ,
    accName: { type: String, required : true } ,
    accNameArb: { type: String, required : true } ,
    code: { type: String, required : true } ,
    accGroup: { type: String, required : true } ,
    accGroupArb: { type: String, required : true } ,
    accLevel: { type: String, required : true } ,
    accLevelArb: { type: String, required : true } ,
    accChart: { type: String, required : true } ,
    accChartArb: { type: String, required : true } ,
    balance: { type: Number, default: 0 },
}, {
    timestamps: true
});


export const JournalsName = mongoose.model<IJournalsName>('JournalsName', journalsNameSchema);


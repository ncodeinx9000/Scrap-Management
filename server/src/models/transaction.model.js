import mongoose from 'mongoose'

const {Schema} = mongoose;

const TransactionSchema = new Schema({
    
    scrapItemId: {
        type: Schema.Types.ObjectId,
        ref: 'ScrapItem',
        required: true, // A transaction cannot exist without an item 
    },

    // MongoDB ObjectId Reference - It acts like a foreign key in Relational Database
    organisationId: {
        type: mongoose.Schema.Types.ObjectId, // Defines data type as a MongoDB unique ID
        ref: 'Org', // Links this ID to the Organization model
        required: true // Makes it mandatory every user to belong to an organization
    },

    type: {
        type: String,
        enum: ['sold', 'recycled', 'donated', 'disposed'],
        required: true
    },

    buyerName: {
        type: String,
        trim: true
    },

    amountReceived: {
        type: Number,
        default: 0,
        min: 0
    },

    date: {
        type: Date, 
        default: Date.now,  // no brackets
    },
    performedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    notes: {
        type:String, trim: true
    },  
}, { timestamps: true})

const Transaction = mongoose.model('Transaction', TransactionSchema);

export default Transaction;
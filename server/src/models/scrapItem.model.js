import mongoose from 'mongoose'

const {Schema} = mongoose;

const ScrapItemSchema = new Schema({
    name: {
        type: String, // String is shorthand for {type: String}
        required: true,
        trim: true
    }, 
    
    categoryId: {
        type: Schema.Types.ObjectId, 
        ref: 'Category',
        required: true
    },

    quantity: {
        type: Number, 
        required: true,
        min: 0,
    },

    unit: {type: String, enum: ['kg', 'pcs'], required: true},

    condition: {type: String, enum: ['usable', 'repairable', 'junk'], required: true},

    location: {type: String, trim: true},

    estimatedValue: {type: Number},

    status: {type: String, enum: ['in_stock', 'sold', 'recycled', 'donated', 'disposed'], default: 'in_stock'},

    notes: {
        type: String,
        required: false
    },

    imageUrl: {
        type: String,
        trim: true
    },

    // MongoDB ObjectId Reference - It acts like a foreign key in Relational Database
    organisationId: {
        type: mongoose.Schema.Types.ObjectId, // Defines data type as a MongoDB unique ID
        ref: 'Org', // Links this ID to the Organization model
        required: true // Makes it mandatory every user to belong to an organization
    },

    addedBy: {type: Schema.Types.ObjectId, ref: 'User', required: true},

}, {timestamps: true})

const ScrapItem = mongoose.model('ScrapItem', ScrapItemSchema);

export default ScrapItem;


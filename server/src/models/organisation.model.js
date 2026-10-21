import mongoose from 'mongoose'

const {Schema} = mongoose;

const OrgSchema = new Schema({
    name: {
        type: String, // String is shorthand for {type: String}
        required: true,
        trim: true
    }, 
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    address: {
        street: {type: String, trim: true},
        city: {type: String, trim: true},
        state: {type: String, trim: true},
        zipcode: {type: String, trim: true},
        country: {type: String, trim: true}
    },

    createdAt: {
        type: Date,
        default: Date.now // Automatically sets the current date
    }
})

const Org = mongoose.model('Org', OrgSchema);

export default Org;
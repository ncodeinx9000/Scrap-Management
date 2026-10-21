import mongoose from 'mongoose'

const {Schema} = mongoose;

const UserSchema = new Schema({
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

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['admin', 'staff'],
        default: 'staff' // Optional: sets a default role for new users
    },

    // MongoDB ObjectId Reference - It acts like a foreign key in Relational Database
    organisationId: {
        type: mongoose.Schema.Types.ObjectId, // Defines data type as a MongoDB unique ID
        ref: 'Org', // Links this ID to the Organization model
        required: true // Makes it mandatory every user to belong to an organization
    },

    createdAt: {
        type: Date,
        default: Date.now // Automatically sets the current date
    }
})

const User = mongoose.model('User', UserSchema);

export default User;
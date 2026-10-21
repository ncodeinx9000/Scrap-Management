import mongoose from "mongoose";

const {Schema} = mongoose;

const CategorySchema = new Schema(
    {
        name: {type: String, required: true, trim: true},
        description: {type: String, trim: true},
        organisationId: {
            type: Schema.Types.ObjectId,
            ref: 'Org',
            required: true,
        },
    },
    {timestamps: true}
);

// Same org can't have two categories with the same name,
// but different orgs can both have "Steel"

CategorySchema.index({name: 1, organisationId: 1}, { unique: true});

const Category = mongoose.model('Category', CategorySchema);

export default Category;
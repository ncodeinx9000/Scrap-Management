import Org from "../models/organisation.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt"

export const createOrganisation = async(req, res) => {
    let newOrg = null;
    try {
        const {organisation, admin} = req.body;

        // Basic Validation
        if(!organisation?.name || !organisation?.email){
            return res.status(400).json({
                success: false,
                message: "All rewuired fields must be filled"
            })
        }

        // Basic Validation for admin
        if(!admin?.name || !admin?.email || !admin?.password){
            return res.status(400).json({
                success: false,
                message: "All rewuired fields must be filled"
            })
        }

        // Check for duplicates before creating anything
        const existingOrg = await Org.findOne({email: organisation.email.toLowerCase()});

        // check whether the organisation already exist
        if(existingOrg){
            return res.status(400).json({
                success: false,
                message: "An Organization with this email already exists."
            })
        }

        const existingUser = await User.findOne({email: admin?.email.toLowerCase()});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "A user with this email already exists.",
            });
        }

        // It creates the new organisations
        newOrg = await Org.create({
            name: organisation?.name,
            email: organisation?.email,
            address: organisation?.address,
        });

        // Hash password, then create the admin linked to that org
        const hashedPassword = await bcrypt.hash(admin?.password, 10);
        const newAdmin = await User.create({
            name: admin?.name,
            email: admin?.email,
            password: hashedPassword,
            role: "admin",
            organisationId: newOrg._id
        })

        // respons without the password
        return res.status(201).json({
            success: true,
            message: "Organisation created successfully",
            data: {
                organisation: newOrg,
                admin: {
                    _id: newAdmin._id,
                    name: newAdmin.name,
                    email: newAdmin.email,
                    role: newAdmin.role
                }
            }
        })
    } catch (error) {
        
        // If the org was created but the admin failed, delete the orphan org
        if(newOrg) await Org.findByIdAndDelete(newOrg._id);

        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Something wnet wrong. Please try again",
        });
    }
};
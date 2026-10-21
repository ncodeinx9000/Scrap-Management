import User from "../models/user.model.js";
import bcrypt from "bcrypt";

// Create a staff account for the administrator's organisation.
export const addStaff = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    if (!name?.trim() || !normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: "Name, email and password are required." });
    }
    const existingEmail = await User.findOne({ email: normalizedEmail });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: "A user with this email already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const staff = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "staff",
      organisationId: req.user.organisationId,
    });
    return res.status(201).json({
      success: true,
      data: { _id: staff._id, name: staff.name, email: staff.email, role: staff.role },
    });
  } catch (error) {
    console.error("addStaff error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

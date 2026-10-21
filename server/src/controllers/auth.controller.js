import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const isProd = process.env.NODE_ENV === "production";

// One set of options, used by BOTH login and logout so they always match
const cookieOptions = {
  httpOnly: true,
  secure: isProd,                        // HTTPS only in production
  sameSite: isProd ? "none" : "strict",  // "none" lets the cookie travel from Vercel to Render
  path: "/",
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    const isMatch = user && (await bcrypt.compare(password, user.password));
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    if (!process.env.JWT_SECRET_KEY) throw new Error("JWT_SECRET_KEY is not configured.");

    const token = jwt.sign(
      { userId: user._id.toString(), role: user.role, organisationId: user.organisationId.toString() },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );

    return res
      .status(200)
      .cookie("token", token, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 })
      .json({
        success: true,
        message: `Welcome back, ${user.name}`,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          organisationId: user.organisationId,
        },
      });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};

export const logout = (_req, res) => {
  res.clearCookie("token", cookieOptions); // same options as login, otherwise it won't clear
  return res.status(200).json({ success: true, message: "Logged out." });
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }
    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organisationId: user.organisationId,
      },
    });
  } catch (error) {
    console.error("getMe error:", error);
    return res.status(500).json({ success: false, message: "Something went wrong." });
  }
};
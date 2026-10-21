import jwt from "jsonwebtoken"

export const auth = (req ,res, next) => {
    const token = req.cookies.token;
    if(!token) return res.status(401).json({success: false, message: "Please log in."});

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET_KEY);
        next();
    } catch (error) {
        return res.status(401).json({success: false, message: "Session expired. Please log in again."})
    }
}
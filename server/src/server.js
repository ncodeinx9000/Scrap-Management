import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
dotenv.config();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/scrap_management";
try {
  if(await mongoose.connect(MONGO_URI)){
    console.log("MongoDB connected");
    
  }
  
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
} catch (error) {
  console.error("Could not connect to MongoDB:", error.message);
  process.exit(1);
}

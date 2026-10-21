import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import Org from "./models/organisation.model.js";
import User from "./models/user.model.js";
import Category from "./models/category.model.js";
import ScrapItem from "./models/scrapItem.model.js";
import Transaction from "./models/transaction.model.js";

const ORG_EMAIL = "demo@greentech.com";
const now = new Date();
const monthsAgo = (m, day = 15) => new Date(now.getFullYear(), now.getMonth() - m, day);

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  // Remove old demo data so the script can be re-run safely
  const old = await Org.findOne({ email: ORG_EMAIL });
  if (old) {
    await Transaction.deleteMany({ organisationId: old._id });
    await ScrapItem.deleteMany({ organisationId: old._id });
    await Category.deleteMany({ organisationId: old._id });
    await User.deleteMany({ organisationId: old._id });
    await Org.deleteOne({ _id: old._id });
  }

  // Organisation + users
  const org = await Org.create({
    name: "GreenTech Industries",
    email: ORG_EMAIL,
    address: { street: "12 Industrial Area", city: "Lucknow", state: "Uttar Pradesh", zipcode: "226010", country: "India" },
  });
  const organisationId = org._id;
  const hash = await bcrypt.hash("Admin@123", 10);

  const admin = await User.create({ name: "Demo Admin", email: "admin@greentech.com", password: hash, role: "admin", organisationId });
  const staff = await User.create({ name: "Demo Staff", email: "staff@greentech.com", password: hash, role: "staff", organisationId });

  // Categories
  const [steel, furniture, electronics, plastic] = await Category.create([
    { name: "Steel", description: "Iron and steel scrap", organisationId },
    { name: "Furniture", description: "Chairs, tables, sofas", organisationId },
    { name: "Electronics", description: "Lights, monitors, wires", organisationId },
    { name: "Plastic", description: "Bottles and plastic waste", organisationId },
  ]);

  // Helper to build an item
  const item = (name, category, quantity, unit, condition, location, estimatedValue, addedBy, status = "in_stock") => ({
    name, categoryId: category._id, quantity, unit, condition, location, estimatedValue,
    status, notes: "", addedBy: addedBy._id, organisationId,
  });

  // 7 in-stock items (staff added two of them)
  await ScrapItem.create([
    item("Old steel rods", steel, 120, "kg", "junk", "Store Room A", 6000, admin),
    item("Steel sheets", steel, 80, "kg", "usable", "Workshop", 4800, admin),
    item("Office chairs", furniture, 15, "pcs", "repairable", "Store Room B", 7500, staff),
    item("Sofa set", furniture, 2, "pcs", "usable", "Reception", 12000, admin),
    item("Tube lights", electronics, 30, "pcs", "junk", "Store Room B", 900, staff),
    item("Old monitors", electronics, 10, "pcs", "repairable", "IT Room", 5000, admin),
    item("Plastic bottles", plastic, 50, "kg", "junk", "Canteen", 500, admin),
  ]);

  // 5 closed items, each with a matching transaction
  const closed = [
    { it: item("Iron scrap", steel, 200, "kg", "junk", "Yard", 10000, admin, "sold"),
      tx: { type: "sold", buyerName: "Sharma Scrap Traders", amountReceived: 9500, date: monthsAgo(3) } },
    { it: item("Wooden tables", furniture, 8, "pcs", "repairable", "Store Room B", 6400, admin, "sold"),
      tx: { type: "sold", buyerName: "Verma Furniture Mart", amountReceived: 6000, date: monthsAgo(2) } },
    { it: item("Old CPUs", electronics, 12, "pcs", "junk", "IT Room", 2400, admin, "recycled"),
      tx: { type: "recycled", buyerName: "EcoRecyclers Pvt Ltd", amountReceived: 0, date: monthsAgo(1) } },
    { it: item("Broken benches", furniture, 5, "pcs", "repairable", "Ground", 1500, admin, "donated"),
      tx: { type: "donated", buyerName: "City Public School", amountReceived: 0, date: monthsAgo(1, 20) } },
    { it: item("Copper wires", electronics, 25, "kg", "usable", "Store Room A", 7000, admin, "sold"),
      tx: { type: "sold", buyerName: "Gupta Metals", amountReceived: 7000, date: now } },
  ];

  for (const c of closed) {
    const saved = await ScrapItem.create(c.it);
    await Transaction.create({
      ...c.tx, scrapItemId: saved._id, organisationId, performedBy: admin._id, notes: "Seed data",
    });
  }

  console.log("Seed complete.");
  console.log("Admin: admin@greentech.com / Admin@123");
  console.log("Staff: staff@greentech.com / Admin@123");
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
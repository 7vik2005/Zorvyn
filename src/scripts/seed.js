import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/user.model.js";
import Record from "../models/record.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI is not defined in .env file");
  process.exit(1);
}

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // Create Admin User (if not exists)
    const existingAdmin = await User.findOne({ email: "admin@zorvyn.com" });

    let adminUser;
    if (!existingAdmin) {
      adminUser = await User.create({
        name: "Admin User",
        email: "admin@zorvyn.com",
        password: "admin123",
        role: "admin",
        status: "active",
      });
      console.log("Admin user created: admin@zorvyn.com / admin123");
    } else {
      adminUser = existingAdmin;
      console.log("Admin user already exists, skipping...");
    }

    // Create Analyst User (if not exists)
    const existingAnalyst = await User.findOne({
      email: "analyst@zorvyn.com",
    });

    if (!existingAnalyst) {
      await User.create({
        name: "Analyst User",
        email: "analyst@zorvyn.com",
        password: "analyst123",
        role: "analyst",
        status: "active",
      });
      console.log("Analyst user created: analyst@zorvyn.com / analyst123");
    } else {
      console.log("Analyst user already exists, skipping...");
    }

    // Create Viewer User (if not exists)
    const existingViewer = await User.findOne({ email: "viewer@zorvyn.com" });

    if (!existingViewer) {
      await User.create({
        name: "Viewer User",
        email: "viewer@zorvyn.com",
        password: "viewer123",
        role: "viewer",
        status: "active",
      });
      console.log("Viewer user created: viewer@zorvyn.com / viewer123");
    } else {
      console.log("Viewer user already exists, skipping...");
    }

    // Create Sample Records (for admin user)
    const recordCount = await Record.countDocuments({ user: adminUser._id });

    if (recordCount === 0) {
      const sampleRecords = [
        {
          user: adminUser._id,
          amount: 5000,
          type: "income",
          category: "salary",
          date: new Date("2026-01-15"),
          note: "January salary",
        },
        {
          user: adminUser._id,
          amount: 1200,
          type: "expense",
          category: "rent",
          date: new Date("2026-01-01"),
          note: "Monthly rent payment",
        },
        {
          user: adminUser._id,
          amount: 300,
          type: "expense",
          category: "groceries",
          date: new Date("2026-01-10"),
          note: "Weekly grocery shopping",
        },
        {
          user: adminUser._id,
          amount: 800,
          type: "income",
          category: "freelance",
          date: new Date("2026-02-05"),
          note: "Freelance web development project",
        },
        {
          user: adminUser._id,
          amount: 150,
          type: "expense",
          category: "utilities",
          date: new Date("2026-02-10"),
          note: "Electricity bill",
        },
        {
          user: adminUser._id,
          amount: 5000,
          type: "income",
          category: "salary",
          date: new Date("2026-02-15"),
          note: "February salary",
        },
        {
          user: adminUser._id,
          amount: 200,
          type: "expense",
          category: "entertainment",
          date: new Date("2026-02-20"),
          note: "Movie tickets and dinner",
        },
        {
          user: adminUser._id,
          amount: 450,
          type: "expense",
          category: "groceries",
          date: new Date("2026-03-01"),
          note: "Monthly grocery run",
        },
        {
          user: adminUser._id,
          amount: 5000,
          type: "income",
          category: "salary",
          date: new Date("2026-03-15"),
          note: "March salary",
        },
        {
          user: adminUser._id,
          amount: 1200,
          type: "expense",
          category: "rent",
          date: new Date("2026-03-01"),
          note: "Monthly rent payment",
        },
      ];

      await Record.insertMany(sampleRecords);
      console.log(`${sampleRecords.length} sample records created`);
    } else {
      console.log("Records already exist for admin, skipping...");
    }

    // Done
    console.log("\nSeed completed successfully!");
    console.log("\nTest Credentials:");
    console.log("  Admin:   admin@zorvyn.com   / admin123");
    console.log("  Analyst: analyst@zorvyn.com / analyst123");
    console.log("  Viewer:  viewer@zorvyn.com  / viewer123");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedData();

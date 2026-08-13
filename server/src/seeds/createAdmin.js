require("dotenv").config();

const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");

const createAdmin = async () => {
  await connectDB();

  const existingAdmin = await User.findOne({
    email: process.env.ADMIN_EMAIL,
  });

  if (existingAdmin) {
    console.log("Administrator already exists.");
  } else {
    await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: "admin",
    });

    console.log("Administrator created successfully.");
  }

  await mongoose.disconnect();
};

createAdmin().catch(async (error) => {
  console.error(`Admin creation failed: ${error.message}`);
  await mongoose.disconnect();
  process.exit(1);
});
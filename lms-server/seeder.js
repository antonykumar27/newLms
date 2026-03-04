////1standard create cheyunnu
// const mongoose = require("mongoose");
// const standardsData = require("./seeder/standardSeeder");
// const Standard = require("./models/standardSchema");
// const dotenv = require("dotenv");
// const connectDatabase = require("./config/database");
// const path = require("path");

// dotenv.config({ path: path.join(__dirname, "config/config.env") });
// connectDatabase();

// const seedUsers = async () => {
//   try {
//     const users = await standardsData; // ✅ resolve the hashed users

//     await Standard.deleteMany();
//     await Standard.insertMany(users);

//     console.log("User data seeded successfully.");
//   } catch (error) {
//     console.error("Error while seeding users:", error);
//   }
//   process.exit();
// };

// seedUsers();

//***********************************badge system********************************************** */
// seedBadges.js - FIXED VERSION
const mongoose = require("mongoose");
const badges = require("./seeder/badgeSeeder");
const { BadgeDefinition } = require("./models/StudentBadge");
const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "config/config.env") });
connectDatabase();

const seedBadges = async () => {
  try {
    console.log("🌱 Starting badge seeder...");

    // ✅ First, check if collection exists and drop indexes if needed
    await BadgeDefinition.collection.dropIndexes().catch(() => {});

    // ✅ Delete all existing badges
    await BadgeDefinition.deleteMany({});
    console.log("✅ Old badges deleted");

    // ✅ Insert new badges
    const result = await BadgeDefinition.insertMany(badges);
    console.log(`✅ ${result.length} badges seeded successfully`);

    // ✅ Show seeded badges
    console.log("\n📊 Seeded badges:");
    result.forEach((b) => {
      console.log(
        `   - ${b.name} (${b.criteria.type}${b.criteria.threshold ? ": " + b.criteria.threshold : ""})`,
      );
    });
  } catch (error) {
    console.error("❌ Error while seeding badges:", error);

    // If error is duplicate key, try to fix it
    if (error.code === 11000) {
      console.log(
        "\n🔧 FIX: Your schema has a 'badgeId' field that needs unique values.",
      );
      console.log("   Option 1: Add badgeId to each badge in seeder file");
      console.log(
        "   Option 2: Remove badgeId field from schema (recommended)",
      );
    }
  }

  // Close connection
  setTimeout(() => {
    mongoose.connection.close();
    console.log("📦 Database connection closed");
    process.exit(0);
  }, 1000);
};

seedBadges();

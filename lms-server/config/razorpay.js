const Razorpay = require("razorpay");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables correctly
dotenv.config({ path: path.join(__dirname, "../config/config.env") });

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
  throw new Error("Razorpay API keys are missing! Check your .env file.");
}

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

module.exports = razorpayInstance;

const razorpayInstance = require("../config/razorpay");
const Course = require("../models/course");
const Enrollment = require("../models/enrollment");
const OrderCourse = require("../models/orderCourse");
const User = require("../models/loginUserModel");
const Standard = require("../models/standardSchema");
const Coupon = require("../models/standardSchema");
const crypto = require("crypto");
const mongoose = require("mongoose");
// ✅ Create Order API
// File: controllers/courseController.js
exports.addToCourseOrder = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user._id;

    // 1. Find course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        error: "Course not found",
      });
    }

    // 2. Check if already PAID enrollment exists
    const existingEnrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
      paymentStatus: "paid", // ❌ ONLY check paid enrollments
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        error: "Already enrolled in this course",
        enrollmentId: existingEnrollment._id,
      });
    }

    // 3. Calculate price with GST (18%)
    const basePrice = course.price;
    const gstAmount = (basePrice * 18) / 100;
    const totalAmount = basePrice + gstAmount;

    // 4. Create Order ONLY (NO ENROLLMENT YET)
    const order = await OrderCourse.create({
      user: userId,
      items: [
        {
          course: courseId,
          price: basePrice,
          discount: 0,
          finalPrice: basePrice,
          courseTitle: course.title,
          instructor: course.instructor,
          thumbnail: course.thumbnail,
        },
      ],
      subtotal: basePrice,
      tax: gstAmount,
      total: totalAmount,
      currency: "INR",
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      billingAddress: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || "",
      },
    });

    // ✅ REMOVED: Enrollment creation
    // NO ENROLLMENT CREATED HERE!

    res.json({
      success: true,
      message: "Order created successfully. Proceed to payment.",
      data: {
        orderId: order._id,
        amount: totalAmount,
        currency: "INR",
        // ❌ NO enrollmentId here
        courseTitle: course.title,
        courseId: courseId,
      },
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create order",
    });
  }
};
exports.createCourseOrder = async (req, res) => {
  try {
    const {
      plan,
      // gstAmount,
      standardId,
      taxableAmount,
      gstAmount: gstAmounts,
      totalPrice,
      currency = "INR",
      courseId,
      amount,
      orderId,
      courseData,

      couponCode,
    } = req.body;

    const userId = req.user._id;
    const userData = req.user;
    console.log("standardId", standardId);

    console.log("userData", userData.name);
    // 1️⃣ Validate required fields
    if (!standardId || !taxableAmount || !totalPrice || !userData) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: courseId, amount, userData",
      });
    }

    if (!userData.name || !userData.email || !userData.phoneNumber) {
      return res.status(400).json({
        success: false,
        error: "User data incomplete: name, email, phone required",
      });
    }

    // 2️⃣ Validate course exists
    const standard = await Standard.findById(standardId);
    if (!standard) {
      return res.status(404).json({
        success: false,
        error: "Standard not found",
      });
    }

    // 3️⃣ Check ONLY for PAID enrollments (not pending)
    const paidEnrollment = await Enrollment.findOne({
      student: userId,
      course: courseId,
      paymentStatus: "paid", // ✅ Only block if already PAID
    });

    if (paidEnrollment) {
      return res.status(400).json({
        success: false,
        error: "Already enrolled in this course",
        enrollmentId: paidEnrollment._id,
        status: paidEnrollment.status,
      });
    }
    console.log("userId157", userId);
    console.log("standardId158", standardId);
    // 4️⃣ Check for PENDING payment orders (allow them to proceed)

    const pendingOrder = await OrderCourse.findOne({
      user: userId,
      standardId: new mongoose.Types.ObjectId(standardId),
      paymentStatus: "pending",
      // createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) },
    });

    console.log(
      "pendingOrderpendingOrderpendingOrderpendingOrder",
      pendingOrder,
    );
    if (pendingOrder) {
      // Check if there's already a Razorpay order for this
      if (pendingOrder.gatewayOrderId) {
        // Return existing Razorpay order info
        return res.status(200).json({
          success: true,
          message: "Using existing pending order",
          order: {
            id: pendingOrder.gatewayOrderId,
            amount: Math.round(pendingOrder.pricing.finalAmount * 100),
            currency: pendingOrder.currency,

            receipt: `order_existing_${pendingOrder._id}`,
            status: "created",
          },
          databaseOrder: {
            orderId: pendingOrder._id,
            total: pendingOrder.total,
            courseTitle: `Class ${pendingOrder.standardLevel}`,
          },
          isExistingOrder: true,
        });
      } else {
        // Create new Razorpay order for existing database order
        const razorpayOrder = await razorpayInstance.orders.create({
          amount: Math.round(pendingOrder.pricing.finalAmount * 100),
          currency: pendingOrder.currency,
          receipt: `order_rcptid_${Date.now()}`,
        });
        console.log(
          "razorpayOrderazorpayOrderrazorpayOrderr",
          razorpayOrder.id,
        );
        // Update order with Razorpay ID
        await OrderCourse.findByIdAndUpdate(pendingOrder._id, {
          gatewayOrderId: razorpayOrder.id,
        });

        return res.status(200).json({
          success: true,
          message: "Using existing pending order",
          order: {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            receipt: razorpayOrder.receipt,
            status: razorpayOrder.status,
          },
          databaseOrder: {
            orderId: pendingOrder._id,
            total: pendingOrder.total,
            courseTitle: `Class ${pendingOrder.standardLevel}`,
          },
          isExistingOrder: true,
        });
      }
    }

    // 5️⃣ Calculate actual price with GST (18%)
    const basePrice = taxableAmount;
    const gstAmount = gstAmounts;
    const totalAmount = totalPrice;

    // Validate amount matches calculated total (within 10% tolerance)
    const amountDifference = Math.abs(amount - totalAmount);
    if (amountDifference > totalAmount * 0.1) {
      return res.status(400).json({
        success: false,
        error: "Amount mismatch. Please recalculate with GST.",
        expectedAmount: totalAmount,
        receivedAmount: amount,
      });
    }
    // njan idunnathu

    // 6️⃣ Apply coupon if valid
    let finalAmount = totalAmount;
    let discountApplied = null;

    if (couponCode) {
      const coupon = await Coupon.findOne({
        code: couponCode,
        isActive: true,
        validUntil: { $gte: new Date() },
        $or: [
          { courseId: courseId },
          { courseId: null }, // General coupons
        ],
      });

      if (coupon) {
        const discountAmount = (finalAmount * coupon.percentage) / 100;
        finalAmount = Math.max(0, finalAmount - discountAmount);
        discountApplied = {
          couponId: coupon._id,
          code: coupon.code,
          percentage: coupon.percentage,
          amount: discountAmount,
        };

        // Update coupon usage
        await Coupon.findByIdAndUpdate(coupon._id, {
          $inc: { usedCount: 1 },
          $addToSet: { usedBy: userId },
        });
      }
    }

    // 7️⃣ Create Order in database

    // 8️⃣ ❌ DO NOT CREATE ENROLLMENT HERE (Remove this line!)
    // Enrollment will be created ONLY after successful payment
    // Comment out or delete the enrollment creation

    /* ❌ DELETE THIS BLOCK:
    const enrollment = await Enrollment.create({
      student: userId,
      course: courseId,
      order: order._id,
      paymentStatus: "pending",
      status: "active",
    });
    */

    // 9️⃣ Create Razorpay Order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: Math.round(finalAmount * 100), // Convert INR to paise
      currency: currency,
      receipt: `order_course_${orderId.id}_${Date.now()}`,
      notes: {
        standard: standardId,
        media: req.user.media,
        standard: req.user.standard,
        userId: req.user._id,
        orderId: orderId.id,
        // ❌ Remove enrollmentId from notes
      },
    });

    // 🔟 Update database order with Razorpay order ID
    await OrderCourse.findByIdAndUpdate(orderId.id, {
      gatewayOrderId: razorpayOrder.id,
    });

    // ✅ Success Response
    res.status(201).json({
      success: true,
      message: "Course order created successfully",
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        status: razorpayOrder.status,
      },
      data: {
        orderId: orderId.id,
        amount: finalAmount,
        currency: currency,
        // ❌ NO enrollmentId here

        user: {
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
        },
        pricing: {
          basePrice: basePrice,
          gstAmount: gstAmount,
          discount: discountApplied?.amount || 0,
          finalAmount: finalAmount,
        },
        createdAt: new Date(),
        expiresIn: "30 minutes", // Razorpay orders expire in 30 mins
      },
    });
  } catch (error) {
    console.error("Create Course Order Error:", error);

    // Specific error handling
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to create course order",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ✅ Get Razorpay Key API nammude key nammal access cheyyunnathu anu ingane
exports.getRazorpayKey = async (req, res) => {
  try {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    console.error("Razorpay Key Fetch Error:", error);
    res.status(500).json({ message: "Failed to fetch Razorpay key" });
  }
};

// exports.verifyPayment = async (req, res) => {
//   try {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//       req.body;

//     const secret = process.env.RAZORPAY_SECRET;

//     const hmac = crypto.createHmac("sha256", secret);
//     hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
//     const expectedSignature = hmac.digest("hex");

//     if (expectedSignature === razorpay_signature) {
//       return res.json({ success: true, message: "Payment verified" });
//     } else {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid signature" });
//     }
//   } catch (error) {
//     console.error("Payment verification error:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

exports.verifyPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    // 1️⃣ Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        error: "Invalid payment signature",
      });
    }

    // 2️⃣ Find order
    const order = await OrderCourse.findOne(
      { gatewayOrderId: razorpay_order_id },
      null,
      { session },
    );

    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        error: "Order not found",
      });
    }

    // 3️⃣ Prevent double processing
    if (order.paymentStatus === "paid") {
      await session.commitTransaction();
      session.endSession();
      return res.json({
        success: true,
        message: "Payment already verified",
      });
    }

    // 4️⃣ Update order
    order.paymentStatus = "paid";
    order.status = "confirmed";
    order.gatewayPaymentId = razorpay_payment_id;
    order.paidAt = new Date();
    await order.save({ session });

    // 5️⃣ Activate enrollment
    const enrollment = await Enrollment.findOne({ order: order._id }, null, {
      session,
    });

    if (enrollment) {
      enrollment.paymentStatus = "paid";
      enrollment.status = "active";
      enrollment.isActive = true;
      enrollment.amountPaid = order.pricing.finalAmount;
      enrollment.currency = order.pricing.currency;
      await enrollment.save({ session });
    }

    // 6️⃣ Update course enrolled count
    await Course.findByIdAndUpdate(
      order.standardId,
      { $inc: { enrolledCount: 1 } },
      { session },
    );

    // 7️⃣ Update instructor stats (only if exists safely)
    if (order.instructor) {
      await User.findByIdAndUpdate(
        order.instructor,
        { $inc: { "teacherStats.totalStudents": 1 } },
        { session },
      );
    }
    // 9️⃣ Upgrade user tier to premium
    await User.findByIdAndUpdate(
      order.user, // assuming order has user reference
      { $set: { tier: "premium" } },
      { session },
    );

    // 8️⃣ Commit transaction
    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      message: "Payment verified and enrollment activated",
      data: {
        orderId: order._id,
        enrollmentId: enrollment?._id,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Verify payment error:", error);
    return res.status(500).json({
      success: false,
      error: "Payment verification failed",
    });
  }
};

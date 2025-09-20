import { validationResult } from "express-validator";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/CustomError.js";
import Coupon from "../models/Coupon.js";
import mongoose from "mongoose";
import User from "../models/UserModel.js";

// CREATE => COUPON || POST || PRIVATE || ADMIN
export const createCoupon = asyncErrorHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new CustomError(`Validation errors: ${errors.array()}`, 400));
  const coupon = new Coupon({ ...req.body, createdBy: req.user.id });
  await coupon.save();
  res.status(200).json({
    status: "success",
    data: {
      coupon,
    },
  });
});

// UPDATE || PATCH || PRIVATE || ADMIN
export const updateCoupon = asyncErrorHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new CustomError(`validation error:${errors.array()}`, 400));
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new CustomError("Invalid coupon ID", 400));
  const coupon = await Coupon.findById(id);
  if (!coupon)
    return next(new CustomError(`Coupon with ID:${id} not found`, 404));
  for (const key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      coupon[key] = req.body[key];
      coupon.markModified(key);
    }
  }
  await coupon.save();
  res.status(200).json({
    status: "success",
    data: coupon,
  });
});

// DELETE || DELETE || PRIVATE || ADMIN
export const deleteCoupon = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new CustomError("Invalid Coupon ID", 400));
  const coupon = await Coupon.findById(id);
  if (!coupon)
    return next(new CustomError(`Coupon with ID:${id} not found`, 404));
  await coupon.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Coupon deleted successfully",
    data: { id },
  });
});

// APPLY-COUPON || POST || PRIVATE || CUSTOMER
export const applyCoupon = asyncErrorHandler(async (req, res, next) => {
  const { couponCode = "", cartItems = [], cartTotal = 0 } = req.body || {};
  if (typeof couponCode !== "string" || couponCode.trim() === "")
    return next(new CustomError("Invalid or missing coupon code.", 400));
  if (!Array.isArray(cartItems) || cartItems.length === 0)
    return next(new CustomError("Cart must contain at least one item.", 400));
  if (typeof cartTotal !== "number" || cartTotal <= 0)
    return next(new CustomError("Cart total must be a positive number"));
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (!user) return next(new CustomError("User not found"), 404);
  const coupon = await Coupon.findOne({
    code: couponCode.toUpperCase(),
    isActive: true,
  }).populate("applicableProducts applicableCategories");
  if (!coupon || coupon.isValid())
    return next(new CustomError("Invalid or expired coupon", 400));

  if (!coupon.canUserUse(userId))
    return next(new CustomError("You can not use this coupon.", 400));
  const discountAmount = coupon.calculateDiscount(cartTotal);
  if (discountAmount === 0)
    return next(new CustomError("Coupon dose not apply to your cart.", 400));
  // UPDATE => USAGE COUNT & USER USAGE
  coupon.usageCount += 1;
  const userUsage = coupon.usedBy.find(
    (usage) => usage.user.toString() === userId.toString()
  );
  if (userUsage) {
    userUsage.usedCount += 1;
    userUsage.lastUsed = new Date();
  } else {
    coupon.usedBy.push({
      user: userId,
      usedCount: 1,
      lastUsed: new Date(),
    });
  }
  await coupon.save();
  res.status(200).json({
    status: "success",
    message: "Coupon applied successfully",
    data: {
      coupon: {
        code: coupon.code,
        description: coupon.description,
      },
      discountAmount,
      finalTotal: cartTotal - discountAmount,
    },
  });
});
// GET-COUPON-ANALYTICS || GET || PRIVATE ||  ADMIN
export const getCouponAnalytics = asyncErrorHandler(async (req, res, next) => {
  const { couponId = "" } = req.params || {};
  if (!mongoose.Types.ObjectId.isValid(couponId) || !couponId.trim())
    return next(new CustomError("Invalid or missing coupon ID", 400));
  const coupon = await Coupon.findById(couponId);
  if (!coupon) return next(new CustomError("Coupon not found", 404));
  console.log(coupon.usedBy);
  const totalSavings = coupon.usedBy?.reduce((sum, usgae) => {
    return sum + usgae * coupon.value;
  }, 0);
  const analytics = {
    couponId: coupon._id,
    code: coupon.code,
    totalUsage: coupon.usageCount,
    uniqueUsers: coupon.usedBy.length,
    totalSavings,
    averageSavingsPerUse:
      coupon.usageCount > 0 ? totalSavings / coupon.usageCount : 0,
    usageRate: coupon.usageLimit
      ? (coupon.usageCount / coupon.usageLimit) * 100
      : 0,
    remainingUses: coupon.usageLimit
      ? coupon.usageLimit - coupon.usageCount
      : "Unlimited",
    topUsers: coupon.usedBy
      .sort((a, b) => b.usedCount - a.usedCount)
      .slice(0, 10)
      .map((usage) => ({
        userId: usage.user,
        usedCount: usage.usedCount,
        lastUsed: usage.lastUsed,
      })),
    isActive: coupon.isActive,
    isExpired: coupon.endDate < new Date(),
    createdAt: coupon.createdAt,
  };

  res.json({
    success: true,
    data: analytics,
  });
});

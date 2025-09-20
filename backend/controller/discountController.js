import { validationResult } from "express-validator";
import Discount from "../models/Discount.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/CustomError.js";
import mongoose from "mongoose";

// CREATE || POST || PROTECTED
export const createDiscount = asyncErrorHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new CustomError(`Validation errors: ${errors.array()}`), 400);
  }
  const discount = new Discount({
    ...req.body,
    createdBy: req.user.id,
  });
  await discount.save();
  await discount.populate([
    { path: "applicableProducts", select: "name price" },
    { path: "applicableCategories", select: "name" },
    { path: "createdBy", select: "firstName lastName" },
  ]);

  res.status(201).json({
    success: true,
    message: "Discount created successfully",
    data: discount,
  });
});
// UPDATE || PATCH || PROTECT
export const updateDiscount = asyncErrorHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new CustomError(`validation error:${errors.array()}`, 400));
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new CustomError("Invalid discount id", 400));
  const discount = await Discount.findById(id);
  if (!discount)
    return next(new CustomError(`Discount with ID:${id} not found`, 404));
  for (const key in req.body) {
    if (req.body.hasOwnProperty(key)) {
      discount[key] = req.body[key];
      discount.markModified(key);
    }
  }
  await discount.save();
  res.status(200).json({
    status: "success",
    data: discount,
  });
});

export const deleteDiscount = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new CustomError("Invalid discount ID", 400));
  const discount = await Discount.findById(id);
  if (!discount)
    return next(new CustomError(`Discount with ID:${id} not found`, 404));
  await discount.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Discount deleted successfully",
    data: { id },
  });
});
// GET-COUPON || GET || PUBLIC
export const getActiveDiscount = asyncErrorHandler(async (req, res, next) => {
  const now = new Date();
  const discount = await Discount.find({
    isActive: true,
    showOnStorefront: true,
    startDate: { $lte: now },
    endDate: { $gte: now },
  })
    .populate("applicableProducts", "name price images")
    .populate("applicableCategories", "name")
    .sort("-priority")
    .select("-usedBy -createdBy");
  if (!discount)
    return next(new CustomError("No valid discount available", 404));
  res.status(200).json({
    status: "success",
    countDocument: discount.length,
    data: discount,
  });
});

// VALIDATE-CODE || POST || PRIVATE
export const validateDiscountCode = asyncErrorHandler(
  async (req, res, next) => {
    const { code } = req.params;
    const { cartItems, cartTotal } = req.body;
    const discount = await Discount.findOne({
      code: code.toUpperCase(),
      isActive: true,
    }).populate(
      "applicableProducts applicableCategories excludeProducts excludeCategories"
    );
    if (!discount) return next(new CustomError("Invalid discoount code"));

    // CHECK || CODE-VALID/INVALID
    if (!discount.isValid())
      return next(
        new CustomError(
          "Discount code has expired or is not currently active",
          400
        )
      );

    // CHECK-USER-CAN-USE-CODE
    const userId = req.user.id;
    if (!userId) return next(new CustomError("User not found", 404));
    if (userId && !discount.canUserUse(userId))
      return next(
        new CustomError(
          "You have exceed the usage limit for this discount",
          400
        )
      );

    // CHECK-MINIMUM-ORDER-AMOUNT
    if (cartTotal < discount.minimumOrderAmount)
      return next(
        new CustomError(
          `Minimum order amount of $${discount.minimumOrderAmount} required`
        )
      );

    // CHECK-MAXIMUM -ORDER-AMOUNT
    if (discount.maximumOrderAmount && cartTotal > discount.maximumOrderAmount)
      return next(
        new CustomError(
          `Maximun order amount of $${discount.maximumOrderAmount} required`
        )
      );

    // CHECK-IF-DISCOUNT-APPLIED-TO-CART || NOT
    if (!discount.appliesTo(cartItems))
      return next(
        new CustomError("This discount does not apply to items in your cart")
      );

    // CALCULTE-DISCOUNT-AMOUNT
    const discountAmount = discount.calculateDiscount(cartItems, cartTotal);
    res.status(200).json({
      status: "success",
      message: "Discount code is valid",
      data: {
        discount: {
          id: discount._id,
          name: discount.name,
          code: discount.code,
          description: discount.description,
        },
        discountAmount,
        finalTotal: cartTotal - discountAmount,
      },
    });
  }
);

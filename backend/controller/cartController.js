import { validationResult } from "express-validator";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/CustomError.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

export const addToCart = asyncErrorHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return next(new CustomError(errors.array()[0].msg, 400));
  const { productId, quantity = 1, variant = {} } = req.body || {};
  // CHECK PRODUCT  ISEXIST || ISACTIVE
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product)
    return next(new CustomError("Product not found or inactive", 404));

  // CHECK STOCK AVAILABILITY
  if (product.trackQuantity && product.quantity < quantity)
    return next(new CustomError("Insufficient stock", 400));

  // FIND OR CREATE CART
  let cart = await Cart.findOne({ user: req.user.id });
  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  // CHECK IF ITEM ALREADY EXIST IN CART
  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.toString() === productId &&
      JSON.stringify(item.variant) === JSON.stringify(variant)
  );
  if (existingItemIndex > -1) {
    // Update quantity
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    // Check stock for new quantity
    if (product.trackQuantity && product.quantity < newQuantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock for requested quantity",
      });
    }

    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item
    cart.items.push({
      product: productId,
      quantity,
      price: product.price,
      variant,
    });
  }

  await cart.save();
  await cart.populate({
    path: "items.product",
    select: "name price images sku",
  });

  res.json({
    success: true,
    message: "Item added to cart",
    data: cart,
  });
});

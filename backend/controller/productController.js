import Product from "../models/Product.js";
import { validationResult } from "express-validator";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/CustomError.js";
import mongoose from "mongoose";
import { applyDiscountsToProduct } from "../utils/productDiscount.js";

// CREATE || POST || PRIVATE
export const createProduct = asyncErrorHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array(),
    });
  }
  const product = new Product(req.body);
  await product.save();

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: product,
  });
});

// UPDATE || POST || PRIVATE
export const updateProduct = asyncErrorHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new CustomError(`Validation error: ${errors.array()}`, 400));
  }
  const isProduct = await Product.findById(req.params.id);
  if (!isProduct) return next(new CustomError("Product not found", 404));
  // Use Mongoose set to update fields
  Object.keys(req.body).forEach((key) => {
    isProduct.set(key, req.body[key]);
    isProduct.markModified(key);
  });
  await isProduct.save();
  res.status(200).json({
    status: "success",
    message: "Product updated successfully",
    data: isProduct,
  });
});

// DELETE || DELETE || PRIVATE
export const deleteProduct = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new CustomError("Invalid product ID"), 400);
  const product = await Product.findById(req.params.id);
  if (!product) return next(new CustomError("Product not found"));
  await product.deleteOne();
  res.status(200).json({
    status: "success",
    message: "Product deleted successfully",
    data: { id },
  });
});

// GET PRODUCTS || GET || PUBLIC
export const getProducts = asyncErrorHandler(async (req, res, next) => {
  const {
    page = 1,
    limit = 12,
    sort = "-createdAt",
    category,
    minPrice,
    maxPrice,
    brand,
    rating,
    search,
    inStock,
    featured,
  } = req.query;
  const query = { isActive: true };

  if (category) query.category = category;

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  if (brand) query.brand = new RegExp(brand, "i");

  if (rating) query["ratings.average"] = { $gte: Number(rating) };

  if (search) query.$text = { $search: search };

  if (inStock === "true") {
    query.$or = [
      { trackQuantity: false },
      { trackQuantity: true, quantity: { $gt: 0 } },
    ];
  }

  if (featured === "true") query.isFeatured = true;

  // ✅ 2. Query Database
  const [products, total] = await Promise.all([
    Product.find(query)
      .populate("category", "name slug")
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .select(
        "name price comparePrice images sku ratings isFeatured seo.slug createdAt brand tags inStock quantity trackQuantity"
      ),
    Product.countDocuments(query),
  ]);

  // ✅ 3. Apply Discounts
  const productsWithDiscounts = await Promise.all(
    products.map(applyDiscountsToProduct)
  );

  // ✅ 4. Response
  res.json({
    success: true,
    data: {
      products: productsWithDiscounts,
      pagination: {
        current: Number(page),
        pages: Math.ceil(total / limit),
        total,
        limit: Number(limit),
      },
    },
  });
});

export const getFeaturedProducts = asyncErrorHandler(async (req, res, next) => {
  const products = await Product.find({
    isActive: true,
    isFeatured: true,
  })
    .populate("category", "name slug")
    .sort("-createdAt")
    .limit(8)
    .select("-__v");

  // Apply discount info
  const productWithDiscount = await Promise.all(
    products.map(applyDiscountsToProduct)
  );

  res.json({
    success: true,
    data: productWithDiscount,
  });
});

export const getProduct = asyncErrorHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id))
    return next(new CustomError("Invalid product ID"));
  const product = await Product.findById(id)
    .populate("category", "name slug")
    .populate("seller", "name email");
  if (!product) return next(new CustomError("Product not found"));
  const productWithDiscount = await applyDiscountsToProduct(product);
  res.json({
    status: "success",
    data: productWithDiscount,
  });
});

export const getDealsProducts = asyncErrorHandler(async (req, res, next) => {
  const products = await Product.find({
    isActive: true,
  }).populate("category", "name");
  const deals = [];
  for (const product of products) {
    const pricing = await applyDiscountsToProduct(product);
    if (pricing.overallDiscountPercentage >= 10 && pricing.hasDiscount) {
      deals.push({
        name: product.name,
        pricing,
      });
    }
  }
  res.status(200).json({
    status: "success",
    countDocument: deals.length,
    data: deals,
  });
});

// GET ANALYTICS || GET || PRIVATE || ADMIN
export const getProductAnalytics = asyncErrorHandler(async (req, res, next) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);
  if (!product) return next(new CustomError("Product not found"));
  const analytics = {
    productId: product._id,
    name: product.name,
    totalViews: product.viewCount,
    totalSold: product.soldCount,
    currentStock: product.quantity,
    revenue: product.soldCount * product.price,
    conversionRate:
      product.viewCount > 0 ? (product.soldCount / product.viewCount) * 100 : 0,
    averageRating: product.ratings.average,
    totalReviews: product.ratings.count,
    createdAt: product.createdAt,
  };
  res.json({
    success: true,
    data: analytics,
  });
});

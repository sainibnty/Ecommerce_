import { validationResult } from "express-validator";
import Category from "../models/Category.js";
import { asyncErrorHandler } from "../utils/asyncErrorHandler.js";
import CustomError from "../utils/CustomError.js";

//NOTE -  CREATE CATEGORY || POST || ADMIN
export const createCategory = asyncErrorHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array(),
    });
  }
  const category = await Category.createCategory(req.body);

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: category,
  });
});

export const getCategories = asyncErrorHandler(async (req, res, next) => {
  const { parent, level, featured, active = "true" } = req.body || {};
  const filter = {};
  if (parent !== undefined) {
    filter.parent = parent === "null" ? null : parent;
  }
  if (level !== undefined) {
    filter.level = Number(level);
  }
  if (featured !== undefined) {
    filter.isFeatured = featured === "true";
  }
  if (active !== undefined) {
    filter.isActive = active === "true";
  }

  const categories = await Category.find(filter)
    .populate("parent", "name slug")
    .populate("children", "name slug productCount")
    .sort({ level: 1, sortOrder: 1, name: 1 });
  res.json({
    success: true,
    data: categories,
  });
});

export const getCategory = async (req, res) => {
  try {
    const category = await Category.findOne({
      $or: [{ _id: req.params.id }, { slug: req.params.id }],
    })
      .populate("parent", "name slug")
      .populate("children", "name slug productCount image");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const updateCategory = asyncErrorHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation errors",
      errors: errors.array(),
    });
  }

  const category = await Category.findById(req.params.id);
  if (!category) return next(new CustomError("Category not found", 404));
  if (req.body.name && req.body.name !== category?.name) {
    req.body.slug = await category.generateSlug();
  }

  const updatedCategory = await Category.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  )
    .populate("parent", "name slug")
    .populate("children", "name slug productCount");
  res.json({
    success: true,
    message: "Category updated successfully",
    data: updatedCategory,
  });
});

export const deleteCategory = asyncErrorHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) return next(new CustomError("Category not found", 404));

  // Check if category has products
  if (category.productCount > 0)
    return next(
      new CustomError("Cannot delete category with existing products"),
      400
    );

  // Check if category has children
  if (category.children.length > 0)
    return next(
      new CustomError("Cannot delete category with subcategories", 400)
    );

  // Remove from parent's children array
  if (category.parent) {
    await Category.findByIdAndUpdate(category.parent, {
      $pull: { children: category._id },
    });
  }

  await Category.findByIdAndDelete(req.params.id);
  res.json({
    success: true,
    message: "Category deleted successfully",
  });
});

// get category tree (hierarchical structure)

export const getCategoryTree = asyncErrorHandler(async (req, res, next) => {
  const categories = await Category.find({ isActive: true })
    .populate("children", "name slug productCount image")
    .sort({ level: 1, sortOrder: 1, name: 1 });
  const tree = categories.filter((cat) => !cat.parent);

  const buildTree = (parentCategories) => {
    return parentCategories.map((parent) => ({
      ...parent.toObject(),
      children: categories.filter(
        (cat) => cat.parent && cat.parent.toString() === parent._id.toString()
      ),
    }));
  };
  const categoryTree = buildTree(tree);
  res.json({
    success: true,
    data: categoryTree,
  });
});

// Get featured categories
export const getFeaturedCategories = asyncErrorHandler(
  async (req, res, next) => {
    const categories = await Category.find({
      isFeatured: true,
      isActive: true,
    })
      .select("name slug description image productCount")
      .sort({ sortOrder: 1, name: 1 })
      .limit(8);

    res.json({
      success: true,
      data: categories,
    });
  }
);

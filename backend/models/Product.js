import mongoose from "mongoose";

import slugify from "slugify";
import Discount from "./Discount.js";
import { json } from "express";

const variantSchema = new mongoose.Schema({
  size: String,
  color: String,
  material: String,
  price: Number,
  stock: { type: Number, default: 0 },
  sku: String,
});

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: 1,
      maxlength: [200, "Product name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      trim: true,
    },
    shortDescription: {
      type: String,
      maxlength: [500, "Short description cannot exceed 500 characters"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
    comparePrice: {
      type: Number,
      min: [0, "Compare price cannot be negative"],
    },
    cost: {
      type: Number,
      min: [0, "Cost cannot be negative"],
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
    barcode: String,
    trackQuantity: {
      type: Boolean,
      default: true,
    },
    quantity: {
      type: Number,
      required: function () {
        return this.trackQuantity;
      },
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 0,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    brand: {
      type: String,
      trim: true,
    },
    tags: [String],
    images: [
      {
        public_id: String,
        url: {
          type: String,
          required: true,
        },
        alt: String,
        isMain: {
          type: Boolean,
          default: false,
        },
      },
    ],
    variants: [variantSchema],
    specifications: [
      {
        name: String,
        value: String,
      },
    ],
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      weight: Number,
      unit: {
        type: String,
        enum: ["cm", "inch", "kg", "lb"],
        default: "cm",
      },
    },
    seo: {
      metaTitle: String,
      metaDescription: String,
      slug: {
        type: String,
        unique: true,
        lowercase: true,
      },
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isDigital: {
      type: Boolean,
      default: false,
    },
    downloadLink: String,
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//NOTE -  VIRTUALS
//NOTE - calculate discound percentage
productSchema.virtual("discoundPercentage").get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    const discount =
      ((this.comparePrice - this.price) / this.comparePrice) * 100;
    return parseFloat(discount.toFixed(1));
  }
  return 0;
});

// check if product is in stock
productSchema.virtual("inStock").get(function () {
  if (!this.trackQuantity) return true;
  return this.quantity;
});

// check if product is low stock
productSchema.virtual("isLowStock").get(function () {
  if (!this.trackQuantity) return false;
  return this.quantity <= this.lowStockThreshold;
});

// get main image
productSchema.virtual("mainImage").get(function () {
  return this.images.find((img) => img.isMain) || this.images[0];
});

/////////////////////////////////////////////////// END VIRTUALS //////////////////////////////////////////////////

//NOTE - INSTANCE METHOD
// generate unique slug

productSchema.methods.generateSlug = async function () {
  const baseSlug = slugify(this.name, {
    lower: true,
    strict: true,
    remove: /[*+~.()'"!:@]/g,
  });
  let slug = baseSlug;
  let counter = 1;
  while (
    await this.constructor.findOne({ "seo.slug": slug, _id: { $ne: this._id } })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};

// generate sku
productSchema.methods.generateSKU = async function () {
  const category = await mongoose.model("Category").findById(this.category);
  const namePrefix = this.name
    .split(" ")
    .slice(0, 2)
    .map((word) => word.substring(0, 3).toUpperCase());
  const categoryPrefix = category.name.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);

  return `${categoryPrefix}-${namePrefix}-${timestamp}`;
};

// Update category count when product is saved/deleted
productSchema.methods.updateCategoryCount = async function (increment = true) {
  const Category = mongoose.model("Category");
  await Category.findByIdAndUpdate(this.category, {
    $inc: { productCount: increment ? 1 : -1 },
  });
};

// STATIC METHODS

//pre middleware
productSchema.pre("save", async function (next) {
  this.seo = this.seo || {};

  // Regenerate slug if name is modified
  if (this.isModified("name")) {
    this.seo.slug = await this.generateSlug();
  }

  // Generate SKU if not provided
  if (!this.sku) {
    this.sku = await this.generateSKU();
  }

  // Set SEO metadata
  if (this.isModified("name") || this.isModified("description")) {
    this.seo.metaTitle = this.seo.metaTitle || this.name;
    this.seo.metaDescription =
      this.seo.metaDescription ||
      this.shortDescription ||
      this.description.substring(0, 160);
  }

  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;

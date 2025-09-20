import mongoose from "mongoose";
import CustomError from "../utils/CustomError.js";
import { getCategoryAncestors } from "../utils/categoryUtils.js";

const discountRuleSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      "percentage",
      "fixed_amount",
      "buy_x_get_y",
      "bulk_discount",
      "free_shipping",
      "bundle_discount",
    ],
    required: true,
  },
  value: {
    type: Number,
    required: function () {
      return ["percentage", "fixed_amount"].includes(this.type);
    },
    min: [0, "Discount value cannot be negative"],
  },
  // for buy_x_get_y discount
  buyQuantity: {
    type: Number,
    required: function () {
      return this.type === "buy_x_get_y";
    },
    min: [1, "Buy quantity must be at least 1"],
  },
  getQuantity: {
    type: Number,
    required: function () {
      return this.type === "buy_x_get_y";
    },
    min: [1, "Get quantity must be at least 1"],
  },
  getDiscountPercentage: {
    type: Number,
    default: 100,
    min: [0, "Get discount percentage cannot be negtaive"],
    max: [100, "Get discount percentage cannot exceed 100"],
  },
  // For bulk discounts
  bulkTiers: [
    {
      minQuantity: {
        type: Number,
        required: true,
        min: [1, "Minimun quantity must be atlest 1"],
      },
      discountPercentage: {
        type: Number,
        required: true,
        min: [0, "Discount percentage cannot be negative"],
        max: [100, "Discount percentage cannot exceed 100"],
      },
    },
  ],
  // For bundle discounts
  bundleProducts: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      minQuantity: {
        type: Number,
        default: 1,
        min: [1, "Minimum quantity must be at least 1"],
      },
    },
  ],
  bundleDiscountType: {
    type: String,
    enum: ["percentage", "fixed_amount"],
    required: function () {
      return this.type === "bundle_discount";
    },
  },
  bundleDiscountValue: {
    type: Number,
    required: function () {
      return this.type === "bundle_discount";
    },
    min: [0, "Bundle discount value cannot be negative"],
  },
});

const discountSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Discount name is required"],
      trim: true,
      maxlength: [100, "Discount name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    code: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      maxlength: [20, "Discound code cannot exceed 20 characters"],
    },
    rules: [discountRuleSchema],
    // Applicability
    applicableProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    excludeProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    excludeCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
    // Conditions
    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: [0, "Minimun order amount cannot be negative"],
    },
    maximumOrderAmount: {
      type: Number,
      min: [0, "Maximum order amount cannot be negative"],
    },
    minimumQuantity: {
      type: Number,
      default: 0,
      min: [0, "Minimum quantity cannot be negative"],
    },
    // Customer restrictions
    customerGroups: [
      {
        type: String,
        enum: ["new_customer", "returning_customer", "vip", "wholesale"],
      },
    ],
    firstTimeCustomersOnly: {
      type: Boolean,
      default: false,
    },
    // Usage limits
    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    usageLimitPerCustomer: {
      type: Number,
      default: 1,
      min: [1, "Usage limit per customer must be at least 1"],
    },
    usedBy: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        usedCount: {
          type: Number,
          default: 0,
        },
        lastUsed: Date,
      },
    ],
    // Time restrictions
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    timeRestrictions: {
      daysOfWeek: [
        {
          type: Number,
          min: 0,
          max: 6, // 0 = Sunday, 6 = Saturday
        },
      ],
      startTime: String, // Format: "HH:MM"
      endTime: String, // Format: "HH:MM"
    },
    // Combination rules
    canCombineWithOtherDiscounts: {
      type: Boolean,
      default: false,
    },
    canCombineWithCoupons: {
      type: Boolean,
      default: true,
    },
    priority: {
      type: Number,
      default: 0,
      min: [0, "Priority cannot be negative"],
    },
    // Status and settings
    isActive: {
      type: Boolean,
      default: true,
    },
    isAutomatic: {
      type: Boolean,
      default: true, // Automatically applied vs requires code
    },
    showOnStorefront: {
      type: Boolean,
      default: false,
    },
    // Tracking
    totalSavings: {
      type: Number,
      default: 0,
    },
    conversionRate: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Validate end date is after start date

discountSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate) {
    next(new CustomError("End date must be after start date"));
  }
  console.log("Hello im called here");
  // Validate time restrictions
  if (this.timeRestrictions.startTime && this.timeRestrictions.endTime) {
    const startTime = this.timeRestrictions.startTime;
    const endTime = this.timeRestrictions.endTime;
    if (
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(startTime) ||
      !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(endTime)
    ) {
      next(new Error("Time format must be HH:MM"));
    }
  }
  next();
});
// Check if discount applies to cart items
// discountSchema.methods.appliesTo = function (cartItems) {
//   if (!cartItems || cartItems.length === 0) return false;

//   // If no specific products/categories are specified, applies to all
//   if (
//     this.applicableProducts.length === 0 ||
//     this.applicableCategories.length === 0
//   ) {
//     return true;
//   }
//   // Check if any cart item matches the criteria
//   return cartItems.some((item) => {
//     const productId = item.product._id || item.product;
//     const categoryId = item.product.category;

//     // Check if product is excluded
//     if (
//       this.excludeProducts.some(
//         (excludedId) => excludedId.toString() === productId.toString()
//       )
//     ) {
//       return false;
//     }

//     // Check if category is excluded
//     if (
//       this.excludeCategories.some(
//         (excludedId) => excludedId.toString() === categoryId.toString()
//       )
//     ) {
//       return false;
//     }

//     // Check if product is included
//     if (
//       this.applicableProducts.some(
//         (applicableId) => applicableId.toString() === productId.toString()
//       )
//     ) {
//       return true;
//     }

//     // Check if category is included
//     if (
//       this.applicableCategories.some(
//         (applicableId) => applicableId.toString() === categoryId.toString()
//       )
//     ) {
//       return true;
//     }

//     return false;
//   });
// };
// discountSchema.methods.appliesTo = function (cartItems) {
//   if (!cartItems || cartItems.length === 0) return false;

//   // Case 1: applies to all if both lists are empty
//   const appliesToAll =
//     this.applicableProducts.length === 0 &&
//     this.applicableCategories.length === 0;

//   if (appliesToAll) return true;

//   return cartItems.some((item) => {
//     const productId = item.product._id || item.product;
//     const categoryId = item.product.category?._id || item.product.category;
//     // Exclusions
//     if (
//       this.excludeProducts.some(
//         (excludedId) => excludedId.toString() === productId.toString()
//       )
//     ) {
//       return false;
//     }

//     if (
//       categoryId &&
//       this.excludeCategories.some(
//         (excludedId) => excludedId.toString() === categoryId.toString()
//       )
//     ) {
//       return false;
//     }

//     // Case 2 & 3 & 4: match product OR category
//     const matchesProduct = this.applicableProducts.some(
//       (id) => id.toString() === productId.toString()
//     );

//     const matchesCategory =
//       categoryId &&
//       this.applicableCategories.some(
//         (id) => id.toString() === categoryId.toString()
//       );

//     return matchesProduct || matchesCategory;
//   });
// };
discountSchema.methods.appliesTo = async function (cartItems) {
  if (!cartItems || cartItems.length === 0) return false;

  const appliesToAll =
    this.applicableProducts.length === 0 &&
    this.applicableCategories.length === 0;

  if (appliesToAll) return true;

  for (const item of cartItems) {
    const productId = item.product._id || item.product;
    const categoryId = item.product.category?._id || item.product.category;

    // 🚫 Exclusions
    if (
      this.excludeProducts.some(
        (excludedId) => excludedId.toString() === productId.toString()
      )
    ) {
      continue; // skip this product
    }

    let categoryHierarchy = [];
    if (categoryId) {
      categoryHierarchy = await getCategoryAncestors(categoryId);

      // 🚫 Exclude if any category in hierarchy is excluded
      if (
        this.excludeCategories.some((excludedId) =>
          categoryHierarchy.includes(excludedId.toString())
        )
      ) {
        continue;
      }
    }

    // ✅ Matches
    const matchesProduct = this.applicableProducts.some(
      (id) => id.toString() === productId.toString()
    );

    const matchesCategory =
      categoryHierarchy.length > 0 &&
      this.applicableCategories.some((id) =>
        categoryHierarchy.includes(id.toString())
      );

    if (matchesProduct || matchesCategory) {
      return true;
    }
  }

  return false;
};

// Check if discount is currently valid
discountSchema.methods.isValid = function () {
  const now = new Date();

  // check basic validation
  if (!this.isActive || this.startDate > now || this.endDate < now)
    return false;

  // Check usage limits
  if (this.usageLimit && this.usageCount >= this.usageLimit) return false;

  // Check time restrictions
  if (
    this.timeRestrictions.daysOfWeek &&
    this.timeRestrictions.daysOfWeek.length > 0
  ) {
    const currentDay = now.getDay();
    if (!this.timeRestrictions.daysOfWeek.includes(currentDay)) {
      return false;
    }
  }
  if (this.timeRestrictions.startTime && this.timeRestrictions.endTime) {
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    if (
      currentTime < this.timeRestrictions.startTime ||
      currentTime > this.timeRestrictions.endTime
    ) {
      return false;
    }
  }
  return true;
};

// Check if user can use this discount
discountSchema.methods.canUserUse = function (
  userId,
  isFirstTimeCustomer = false
) {
  if (!this.isValid()) return false;
  // Check customer group restrictions
  if (this.firstTimeCustomersOnly && !isFirstTimeCustomer) {
    return false;
  }
  // Check per-customer usage limit
  const userUsage = this.usedBy.find(
    (usage) => usage.user.toString() === userId.toString()
  );
  if (userUsage && userUsage.usedCount >= this.usageLimitPerCustomer) {
    return false;
  }

  return true;
};
// Buy X Get Y free
discountSchema.methods.calculateBuyXGetYDiscount = function (cartItems, rule) {
  let discount = 0;
  for (const item of cartItems) {
    if (
      this.applicableProducts.length &&
      !this.applicableProducts.includes(item.product._id)
    )
      continue;

    const freeItems =
      Math.floor(item.quantity / (rule.buyQuantity + rule.getQuantity)) *
      rule.getQuantity;
    discount += freeItems * item.product.price;
  }
  return discount;
};

// Bulk discount tiers
discountSchema.methods.calculateBulkDiscount = function (cartItems, rule) {
  let discount = 0;
  for (const item of cartItems) {
    for (const tier of rule.bulkTiers) {
      if (item.quantity >= tier.minQuantity) {
        discount +=
          (item.product.price * item.quantity * tier.discountPercent) / 100;
      }
    }
  }
  return discount;
};

// Bundle discount (all products must be in cart)
discountSchema.methods.calculateBundleDiscount = function (cartItems, rule) {
  const allBundleProductsInCart = rule.bundleProducts.every((bundleId) =>
    cartItems.some(
      (item) => item.product._id.toString() === bundleId.toString()
    )
  );

  if (allBundleProductsInCart) {
    return rule.value || 0; // could be fixed amount or %
  }
  return 0;
};

discountSchema.methods.calculateDiscount = function (cartItems, cartTotal) {
  if (!this.appliesTo(cartItems)) return 0;
  if (!this.isValid()) return 0;
  let totalDiscount = 0;

  for (const rule of this.rules) {
    let ruleDiscount = 0;

    switch (rule.type) {
      case "percentage":
        ruleDiscount = (cartTotal * rule.value) / 100;
        break;

      case "fixed_amount":
        ruleDiscount = rule.value;
        break;

      case "buy_x_get_y":
        ruleDiscount = this.calculateBuyXGetYDiscount(cartItems, rule);
        break;

      case "bulk_discount":
        ruleDiscount = this.calculateBulkDiscount(cartItems, rule);
        break;

      case "free_shipping":
        // shipping system handles free shipping, not cart total
        ruleDiscount = 0;
        break;

      case "bundle_discount":
        ruleDiscount = this.calculateBundleDiscount(cartItems, rule);
        break;
    }

    totalDiscount += ruleDiscount;
  }

  return Math.min(totalDiscount, cartTotal);
};

const Discount = mongoose.model("Discount", discountSchema);

export default Discount;

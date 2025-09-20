import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, "Coupon code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [3, "Coupon code must be at least 3 characters"],
      maxlength: [20, "Coupon code cannot exceed 20 characters"],
    },
    description: {
      type: String,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: [true, "type is required field"],
    },
    value: {
      type: Number,
      required: [true, "Coupon value is required"],
      min: [0, "Coupon value cannot be negative"],
    },
    minimumAmount: {
      type: Number,
      default: 0,
      min: [true, "Minimum amount cannot be negative"],
    },
    maximumAmount: {
      type: Number,
      min: [true, "Maximun amount cannot be negative"],
    },
    usageLimit: {
      type: Number,
      min: [1, "Usage limit must be at least 1"],
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    userLimit: {
      type: Number,
      default: 1,
      min: [1, "User limit must be at least 1"],
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
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    discount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
    },
  },
  { timestamps: true }
);

// VALIDATE => endDate > startDate
couponSchema.pre("save", function (next) {
  if (this.endDate <= this.startDate)
    return next(new CustomError("End date must be after start date", 400));
  next();
});

// CHECK => COUPON => ISVALID OR NOT
couponSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    this.startDate <= now &&
    this.endDate >= now &&
    (!this.usageLimit || this.usageCount < this.usageLimit)
  );
};

// CHECK => USER => CAN USE => COUPON
couponSchema.methods.canUserUse = function (userId) {
  const userUsage = this.usedBy.find(
    (usage) => usage.user.toString() === userId.toString()
  );
  return !userUsage || userUsage.usedCount < this.usageLimit;
};

// CALCULTE => DISCOUNT
couponSchema.methods.calculateDiscount = function (amount) {
  if (amount < this.minimumAmount) return 0;
  let discount = 0;
  if (this.type === "percentage") {
    discount = (amount * this.value) / 100;
    if (this.maximumDiscount && discount > this.maximumDiscount) {
      discount = this.maximumDiscount;
    }
  } else {
    discount = this.value;
  }
  return Math.min(discount, amount);
};

// CHECK => COUPON WORK WITH DISCOUNT VALUE [DICOUNT + COUPON]
couponSchema.methods.isValidWithDiscount = function (cartItems, discountRules) {
  if (discountRules && discountRules.length > 0) {
    const nonCombinableDiscounts = discountRules.filter(
      (rule) => !rule.canCombineWithCoupons
    );
    if (nonCombinableDiscounts.length > 0) {
      return false;
    }
  }
  return this.isValid();
};

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;

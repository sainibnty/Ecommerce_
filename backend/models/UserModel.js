import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const addressSchema = new mongoose.Schema({
  street: { type: String, required: [true, "Street is required field"] },
  city: { type: String, required: [true, "City is required field"] },
  state: { type: String, required: [true, "State is required field"] },
  zipCode: { type: String, required: [true, "ZipCode is required field"] },
  country: { type: String, required: [true, "Country is required field"] },
  isDefault: { type: Boolean, default: false },
});
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      Math: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    phone: {
      type: String,
      match: [/^\+?[\d\s-()]+$/, "Please enter a valid phone number"],
    },
    role: {
      type: String,
      enum: [
        "customer",
        "seller",
        "admin",
        "support",
        "delivery",
        "marketing",
        "finance",
      ],
      default: "customer",
    },
    avatar: {
      type: String,
      default: "/placeholder.svg?height=40&width=40",
    },
    addresses: [addressSchema],
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
    bio: {
      type: String,
      maxlength: [500, "Bio cannot be more than 500 characters"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    permission: {
      type: Object,
      default: function () {
        const rolePermission = {
          admin: {
            level: 7,
            permission: [
              "manage_users",
              "manage_products",
              "manage_orders",
              "manage_discounts",
              "view_reports",
            ],
          },
          seller: {
            level: 5,
            permission: ["manage_products", "view_orders", "update_stock"],
          },
          customer: {
            level: 1,
            permission: ["browse_products", "place_order", "view_orders"],
          },
          support: {
            level: 3,
            permission: ["manage_tickets", "process_refunds"],
          },
          delivery: {
            level: 2,
            permission: ["update_delivery_status"],
          },
          marketing: {
            level: 4,
            permission: ["manage_coupons", "manage_campaigns"],
          },
          finance: {
            level: 6,
            permission: ["view_payments", "process_refunds"],
          },
        };
        return rolePermission[this.role] || rolePermission.customer;
      },
    },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

// store last login
userSchema.methods.recordLogin = async function () {
  this.lastLogin = Date.now();
  return await this.save({ timestamps: false });
};

// Get full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// hashing password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  this.confirmPassword = undefined;
});

// compare password
userSchema.methods.comparePassword = async function (pswd, passDB) {
  return await bcrypt.compare(pswd, passDB);
};

userSchema.pre("save", async function (next) {
  if (this.isModified("role")) {
    const rolePermission = {
      admin: {
        level: 7,
        permission: [
          "manage_users",
          "manage_products",
          "manage_orders",
          "manage_discounts",
          "view_reports",
        ],
      },
      seller: {
        level: 5,
        permission: ["manage_products", "view_orders", "update_stock"],
      },
      customer: {
        level: 1,
        permission: ["browse_products", "place_order", "view_orders"],
      },
      support: {
        level: 3,
        permission: ["manage_tickets", "process_refunds"],
      },
      delivery: {
        level: 2,
        permission: ["update_delivery_status"],
      },
      marketing: {
        level: 4,
        permission: ["manage_coupons", "manage_campaigns"],
      },
      finance: {
        level: 6,
        permission: ["view_payments", "process_refunds"],
      },
    };
    return rolePermission[this.role] || rolePermission.customer;
  }
  next();
});

userSchema.methods.generateAccessToken = async function () {
  return await jwt.sign({ id: this._id }, process.env.SECRET_STR, {
    expiresIn: process.env.LOGIN_EXPIRES,
  });
};

userSchema.methods.generateRefreshToken = async function () {
  return await jwt.sign({ id: this._id }, process.env.REFRESH_STR, {
    expiresIn: process.env.REFRESH_EXPIRE,
  });
};

const User = mongoose.model("User", userSchema);

export default User;

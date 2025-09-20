import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: [true, "Product ID is required field."],
  },
  quantity: {
    type: Number,
    required: [true, "Cart quantity is required field"],
    min: [1, "Quantity must be at least 1"],
  },
  price: {
    type: Number,
    required: [true, "Price is required field."],
  },
  variant: {
    size: String,
    color: String,
    material: String,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required field"],
      unique: true,
    },
    items: [cartItemSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// CALCULATE (TOTALITEMS || TOTALAMOUNT) || LASTMODIFIED
cartSchema.pre("save", function (next) {
  this.totalItems = this.items.reduce(
    (total, item) => total + item.quantity,
    0
  );
  this.totalAmount = this.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  this.lastModified = new Date();
  next();
});

// REMOVE EXPIRED CART ITEMS (OPTIONAL => FOR GUEST CARTS)
cartSchema.index(
  { lastModified: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);
const Cart = mongoose.model("Cart", cartSchema);

export default Cart;

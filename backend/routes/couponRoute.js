import express from "express";
import { protect } from "../controller/authController.js";
import {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  getCouponAnalytics,
  updateCoupon,
} from "../controller/couponXController.js";

const router = express.Router();

// CUSTOMER || ROUTE
router.route("/apply").post(protect, applyCoupon);

// ADMIN || ROUTE
router.route("/").post(protect, createCoupon);
router.route("/:id").patch(protect, updateCoupon).delete(protect, deleteCoupon);
router.route("/:couponId/analytics").get(protect, getCouponAnalytics);

export default router;

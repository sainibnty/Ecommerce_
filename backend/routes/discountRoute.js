import express from "express";
import { protect } from "../controller/authController.js";
import {
  createDiscount,
  deleteDiscount,
  getActiveDiscount,
  updateDiscount,
} from "../controller/discountController.js";

const router = express.Router();

router.route("/").post(protect, createDiscount);
router
  .route("/:id")
  .patch(protect, updateDiscount)
  .delete(protect, deleteDiscount);
router.route("/active").get(getActiveDiscount);
router.route("/validate/:code").post(protect);

export default router;

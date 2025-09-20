import express from "express";
import { validateCategory } from "../middleware/validation.js";
import {
  createCategory,
  getCategories,
  getCategory,
  getCategoryTree,
  getFeaturedCategories,
  updateCategory,
} from "../controller/categoryController.js";
import { protect } from "../controller/authController.js";

const router = express.Router();

router
  .route("/")
  .post(protect, validateCategory, createCategory)
  .get(getCategories);

router.route("/tree").get(getCategoryTree);
router.route("/featured").get(getFeaturedCategories);

router.route("/:id").get(getCategory).patch(updateCategory);

export default router;

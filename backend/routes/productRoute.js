import express from "express";
import { validateProduct } from "../middleware/validation.js";
import {
  createProduct,
  deleteProduct,
  getDealsProducts,
  getFeaturedProducts,
  getProduct,
  getProductAnalytics,
  getProducts,
  updateProduct,
} from "../controller/productController.js";
import { protect } from "../controller/authController.js";

const router = express.Router();
router.route("/getDeal").get(getDealsProducts);

// CREATE || GET , POST  || PRIVATE, PUBLIC
router
  .route("/")
  .post(protect, validateProduct, createProduct)
  .get(getProducts);

// PARAMS || PATCH,DELETE,GET || PRIVATE
router
  .route("/:id")
  .patch(protect, updateProduct)
  .delete(protect, deleteProduct)
  .get(protect, getProduct);

router.route("/featured").get(getFeaturedProducts);
// ADMIN || GET || PRIVATE
router.route("/:productId/analytics").get(getProductAnalytics);
export default router;

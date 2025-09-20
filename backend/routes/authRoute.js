import express from "express";
import {
  addAddress,
  deleteAddress,
  getAddresses,
  login,
  logOut,
  protect,
  refreshToken,
  signup,
  updateAddress,
} from "../controller/authController.js";
const router = express.Router();

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/refresh").get(refreshToken);
router.route("/logout").get(logOut);

// ADDRESS ROUTE || PRIVATE
router.route("/address").post(protect, addAddress).get(protect, getAddresses);
router
  .route("/address/:addressId")
  .patch(protect, updateAddress)
  .delete(protect, deleteAddress);
export default router;

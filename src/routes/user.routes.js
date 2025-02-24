import { Router } from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  getUsersByPagination,
  updateAccountDetails,
  deleteUser,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyAdmin } from "../middlewares/admin.middleware.js";
const router = Router();
router.route("/login").post(loginUser);
//secure routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/register").post(verifyJWT,verifyAdmin,registerUser);
router.route("/user-detail").get(verifyJWT,verifyAdmin,getUsersByPagination);
router.route("/:id").delete(verifyJWT,verifyAdmin,deleteUser);
export default router;
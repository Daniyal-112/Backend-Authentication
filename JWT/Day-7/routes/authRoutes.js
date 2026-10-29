import express from "express";

import validateSignup from "../middlewares/validateSignup.js";
import userSignup from "../controllers/signupController.js";
import validateLogin from "../middlewares/validateLogin.js";
import userLogin from "../controllers/loginController.js";
import verifyToken from "../middlewares/verifyToken.js";
import getProfile from "../controllers/profileController.js";
import {
  logoutAllDevices,
  userLogout,
} from "../controllers/logoutController.js";
import refreshAccessToken from "../controllers/refreshController.js";

const router = express.Router();

router.post("/signup", validateSignup, userSignup);
router.post("/login", validateLogin, userLogin);
router.get("/profile", verifyToken, getProfile);

router.post("/logout", userLogout);
router.post("/logout-all",verifyToken ,logoutAllDevices);

router.post("/refresh", refreshAccessToken);

export default router
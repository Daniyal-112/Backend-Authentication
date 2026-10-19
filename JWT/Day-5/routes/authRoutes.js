import express from "express";
import validateSignup from "../middlewares/validateSignup.js";
import userSignup from "../controllers/signupController.js";
import validateLogin from "../middlewares/validateLogin.js";
import userLogin from "../controllers/loginController.js";
import verifyToken from "../middlewares/verifyToken.js";
import getProfile from "../controllers/profileController.js";
import userLogout from "../controllers/logoutController.js";

const router = express.Router();

router.post("/signup", validateSignup, userSignup);
router.post("/login", validateLogin, userLogin);
router.get("/profile", verifyToken, getProfile);
router.post("/logout", userLogout);

export default router;

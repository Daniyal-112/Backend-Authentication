import express from "express";
import validateSignup from "../middlewares/validateSignup.js";
import userSignup from "../controllers/signupController.js";
import validateLogin from "../middlewares/validateLogin.js";
import userLogin from "../controllers/loginController.js";
import refreshAccessToken from "../controllers/refreshController.js";
import verifyToken from "../middlewares/verifyToken.js";
import userProfile from "../controllers/profileController.js";
import userLogout from "../controllers/logoutController.js";

const router = express.Router();

router.post("/signup", validateSignup, userSignup);
router.post("/login", validateLogin, userLogin);
router.post("/refresh", refreshAccessToken);
router.get("/profile", verifyToken, userProfile);
router.post("/logout", userLogout);

export default router;

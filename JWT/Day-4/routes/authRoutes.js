import express from "express";

import validateSignup from "../middlewares/validateSignup.js";
import validateLogin from "../middlewares/validateLogin.js";
import userSignup from "../controllers/signupController.js";
import userLogin from "../controllers/loginController.js";
import verifyToken from "../middlewares/verifyToken.js";
import userProfile from "../controllers/profileController.js";

const router = express.Router();

router.post("/signup", validateSignup, userSignup);
router.post("/login", validateLogin, userLogin);
router.get("/profile", verifyToken, userProfile);

export default router;
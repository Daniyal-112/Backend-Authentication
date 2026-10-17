import express from "express";

import validateSignup from "../middlewares/validateSIgnup.js";
import validateLogin from "../middlewares/validateLogin.js";
import userSignup from "../controllers/signupController.js";
import userLogin from "../controllers/loginController.js";

const router = express.Router();

router.post("/signup", validateSignup, userSignup);
router.post("/login", validateLogin, userLogin);

export default router;
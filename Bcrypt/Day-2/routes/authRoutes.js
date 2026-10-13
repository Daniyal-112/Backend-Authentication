import express from "express";

import userLogin from "../controllers/loginController.js";
import userSignup from "../controllers/signupController.js";

const router = express.Router();

router.post("/login",userLogin );
router.post("/signup", userSignup);
export default router;

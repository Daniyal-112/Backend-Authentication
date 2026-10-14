import express from "express";
import userLogin from "../controllers/loginController.js";
import userSignup from "../controllers/signupController.js";
import validateSignup from "../middleware/validateSignup.js";
import validateLogin from "../middleware/validateLogin.js";
import checkToken from "../middleware/checkToken.js";
import getAllUSers from "../controllers/usersController.js";


const router = express.Router();

router.post("/signup", validateSignup, userSignup);
router.post("/login", validateLogin, userLogin);
router.get("/users",checkToken,getAllUSers);

export default router;

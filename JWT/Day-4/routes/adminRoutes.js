import express from "express";
import verifyToken from "../middlewares/verifyToken.js";
import getAllUsers from "../controllers/usersController.js";
import authorizedRoles from "../middlewares/authorizeRoles.js";

const router = express.Router();

router.get("/users", verifyToken, authorizedRoles("admin"), getAllUsers);

export default router;
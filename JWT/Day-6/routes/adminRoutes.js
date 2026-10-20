import express from "express";

import verifyToken from "../middlewares/verifyToken.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import getAllUsers from "../controllers/usersController.js";

const router = express.Router();

router.get("/users", verifyToken, authorizeRoles("admin"), getAllUsers);

export default router;
import { Router } from "express";
import authRoutes from "./authRoutes.js";
import allUsersRoutes from "./allUsersRoutes.js";
import chatRoutes from "./chatRoutes.js";
import { savePushToken } from "../controllers/authControllers.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/auth", allUsersRoutes);
router.use("/auth", chatRoutes);
router.post("/save-push-token", savePushToken);

export default router;

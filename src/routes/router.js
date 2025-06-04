import { Router } from "express";
import authRoutes from "./authRoutes.js";
import allUsersRoutes from "./allUsersRoutes.js";
import chatRoutes from "./chatRoutes.js";
import { savePushToken } from "../controllers/authControllers.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/auth", allUsersRoutes);
router.use("/auth", chatRoutes);
router.post("/save-push-token", savePushToken);
router.get("/online-users", verifyJWT, (req, res) => {
  // onlineUsers is the Map with userId keys
  res.json({ onlineUsers: Array.from(onlineUsers.keys()) });
});

export default router;

import { Router } from "express";
import { allUser } from "../controllers/allUsersControllers.js";
import { verifyJWT } from "../middleware/verifyJWT.js";

const router = Router();
router.get("/allUser", verifyJWT, allUser);

export default router;

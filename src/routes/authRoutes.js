import { Router } from "express";
import {
  login,
  setup2FA,
  signup,
  verify2FA,
} from "../controllers/authControllers.js";
import passport from "passport";
import upload from "../middleware/upload.js";

const router = Router();

router.post("/signup", upload.single("profileImage"), signup);
router.post("/login", passport.authenticate("local"), login);
router.get(
  "/2fa/setup",
  (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized user" });
  },
  setup2FA
);
router.post(
  "/2fa/verify",
  (req, res, next) => {
    if (req.isAuthenticated()) return next();
    res.status(401).json({ message: "Unauthorized user" });
  },
  verify2FA
);

export default router;

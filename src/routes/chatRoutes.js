import { Router } from "express";
import Chat from "../models/Chat.js";
import { verifyJWT } from "../middleware/verifyJWT.js";
import {
  addContact,
  deleteChat,
  getContact,
} from "../controllers/chatControllers.js";

const router = Router();
router.post("/", verifyJWT, addContact);
// DELETE /chat/:chatId
router.delete("/chat/:chatId", verifyJWT, deleteChat);

router.get("/:userId", verifyJWT, getContact);

export default router;

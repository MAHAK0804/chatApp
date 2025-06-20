import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Chat", ChatSchema);

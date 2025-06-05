import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, required: true },
  mobileNo: { type: String, required: true },
  profileImage: { type: String, required: true },
  isMfaActive: { type: Boolean, default: false },
  twoFactorSecret: { type: String, default: "" },
  fcmToken: { type: String, default: "" },
});

export default mongoose.model("User", userSchema);

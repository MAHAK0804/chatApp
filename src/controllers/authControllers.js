import User from "../models/userModels.js";
import bcrypt from "bcrypt";
import speakeasy from "speakeasy";
import qrCode from "qrcode";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  try {
    const { email, password, username, mobileNo } = req.body;

    if (!email || !password || !username || !mobileNo || !req.file) {
      return res
        .status(400)
        .json({ message: "All fields including profile image are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      mobileNo,
      profileImage: req.file.location,
    });

    await newUser.save();

    res.status(201).json({
      status: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Signup error", error: error.message });
  }
};

export const login = async (req, res) => {
  console.log("the authenticated user: ", req.user);
  res.status(200).json({
    message: "Login successfully",
    email: req.user.email,
    isMfaActive: req.user.isMfaActive,
  });
};
export const setup2FA = async (req, res) => {
  try {
    console.log("The req user in setup 2fa :- ", req.user);
    const user = req.user;

    if (user.isMfaActive && user.twoFactorSecret) {
      return res.status(400).json({
        message:
          "2FA is already enabled. Reset it before generating a new one.",
      });
    }

    const secret = speakeasy.generateSecret();
    console.log("Generated secret:", secret);

    user.twoFactorSecret = secret.base32;
    await user.save();

    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: `${user.username}`,
      issuer: "https://mahak-portfolio-leu5.vercel.app/",
      encoding: "base32",
    });

    const qrCodeImageUrl = await qrCode.toDataURL(otpauthUrl);

    res.status(200).json({
      secret: secret.base32,
      message: "2FA secret generated",
      qrCode: qrCodeImageUrl,
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    res.status(500).json({
      error: "Error in 2FA authentication setup",
      message: error.message || "Internal server error",
    });
  }
};

export const verify2FA = async (req, res) => {
  const { token } = req.body;
  const user = req.user;
  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
  });

  if (verified) {
    user.isMfaActive = true;
    await user.save();
    const jwtToken = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({
      _id: user._id,
      message: "2Fa successfully",
      token: jwtToken,
      email: user.email,
      username: user.username,
      mobileNo: user.mobileNo,
      profile: user.profileImage,
    });
  } else {
    res.status(400).json({ message: "Invalid 2FA Token" });
  }
};

export const savePushToken = async (req, res) => {
  const { email, token } = req.body;
  console.log("save FCM token->", req.body);

  try {
    const user = await User.findOne({ email });
    console.log("user find to save token ->>", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.fcmToken = token;
    await user.save();
    console.log("Push token saved successfully");

    res.status(200).json({ message: "Push token saved successfully" });
  } catch (err) {
    console.error("Error saving push token:", err);
    res.status(500).json({ message: "Failed to save push token" });
  }
};

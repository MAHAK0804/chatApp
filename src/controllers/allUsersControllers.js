import User from "../models/userModels.js";

export const allUser = async (req, res) => {
  try {
    const allUserRes = await User.find();
    console.log("ALL USER", allUserRes);
    res.status(200).json({
      status: true,
      message: "all users fetched successfully",
      data: allUserRes,
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

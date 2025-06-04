import Chat from "../models/Chat.js";
import Message from "../models/Message.js";

export const addContact = async (req, res) => {
  const { userId1, userId2 } = req.body;

  try {
    let existingChat = await Chat.findOne({
      participants: { $all: [userId1, userId2], $size: 2 },
    }).populate("participants", "username email profileImage mobileNo");

    if (existingChat) {
      return res.status(200).json({ success: true, data: existingChat });
    }

    const newChat = new Chat({
      participants: [userId1, userId2],
    });

    await newChat.save();

    const savedChat = await Chat.findById(newChat._id).populate(
      "participants",
      "username email profileImage mobileNo"
    );

    return res.status(201).json({ success: true, data: savedChat });
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getContact = async (req, res) => {
  const userId = req.params.userId;
  try {
    const chats = await Chat.find({ participants: userId })
      .populate("participants", "username email profileImage mobileNo")
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, data: chats });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Chat.findByIdAndDelete(chatId);
    await Message.deleteMany({ chatId });
    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat:", error);
    res.status(500).json({ message: "Failed to delete chat" });
  }
};

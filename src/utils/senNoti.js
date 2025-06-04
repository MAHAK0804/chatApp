import axios from "axios";

export const sendPushNotification = async (expoPushToken, message) => {
  try {
    const res = await axios.post("https://exp.host/--/api/v2/push/send", {
      to: expoPushToken,
      sound: "default",
      title: message.title,
      body: message.body,
      data: message.data || {},
    });

    console.log("Notification sent:", res.data);
  } catch (err) {
    console.error(
      "Error sending push notification:",
      err.response?.data || err.message
    );
  }
};

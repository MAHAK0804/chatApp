import admin from "../config/firebaseAdmin.js";

export const sendPushNotification = async (fcmToken, message) => {
  const messagePayload = {
    token: fcmToken,
    notification: {
      title: message.title,
      body: message.body,
    },
    data: message.data || {},
  };
  console.log("sendPush noti=>>>>>>>>", messagePayload);

  try {
    const response = await admin.messaging().send(messagePayload);
    console.log("Push notification sent successfully:", response);
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

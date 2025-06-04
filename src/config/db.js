import { connect } from "mongoose";

const dbConnect = async () => {
  try {
    const db = await connect(process.env.MONGO_URL);
    console.log("Database is connected", db.connection.host);
  } catch (error) {
    console.log("Database connection is failed", error);
  }
};

export default dbConnect;

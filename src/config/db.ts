import mongoose from "mongoose";
const mongoDB_URI: string | undefined = process.env.MONGODB_URI;
const connectToDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(
      mongoDB_URI! || "mongodb://localhost:27017/e-com"
    );
    console.log(`connect to db at: ${conn.connection.host}`);
  } catch (error) {
    console.log(`Unable to connect to DB=======> ${(error as Error).message}`);
  }
};
export default connectToDB;

import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connectInstance = await mongoose.connect(`${process.env.DB_URI}/ChattApp`)
        console.log(`Mongoose Connected to ${connectInstance.connection.host}`)


    } catch (error) {
        console.log(error);
        process.exit(1);

    }
}
import mongoose from "mongoose";

export default function connectToDB(url: string) {
  mongoose.connect(url).then((_) => console.log("Connected to DB"));
}

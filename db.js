const mongoose = require("mongoose");
const URI =
  "mongodb+srv://manasJadhav:Mjdata@123@artcircle.mzkgdaw.mongodb.net/art_circle?retryWrites=true&w=majority";
const connectDB = async () => {
  await mongoose.connect(URI, { useNewUrlParser: true });
  console.log("Connected !!!");
};

module.exports = connectDB;

const mongoose = require("mongoose");
mongoose.connect(process.env.URL);
const db = mongoose.connection;
db.on("connected", () => {
  console.log("database connected");
});
db.on("error", () => {
  console.log("error occured");
});
db.on("close", () => {
  console.log("database closed");
});

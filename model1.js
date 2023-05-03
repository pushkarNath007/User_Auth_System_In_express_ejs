const mongoose = require("mongoose");
const sch = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    // default:null,
    // unique:true,
    required: true,
  },
  cpassword: {
    type: String,
    // default:null,
    // unique:true,
    // required:true
  },
  gmail: {
    type: String,
    // default:null,
    unique: true,
    required: true,
  },
  number: {
    type: Number,
    required: true,
  },
});
module.exports = new mongoose.model(process.env.MODEL, sch);

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    length: { min: 2, max: 25 },
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["client", "admin", "staff"], // Chỉ nhận các giá trị này
    default: "client",
    required: true,
  },
});

module.exports = mongoose.model("User", userSchema);

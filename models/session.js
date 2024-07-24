const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
  {
    _id: String,
    session: {
      cart: [
        {
          productId: { type: String },
          qty: { type: Number, required: true },
        },
      ],
      chat: {
        chatId: { type: mongoose.Types.ObjectId, required: true },
        chatList: [
          {
            content: { type: String, required: true },
            type: { type: String, required: true },
          },
        ],
      },
    },
  },
  { collection: "sessions" }
);

// Tạo model Session dựa trên schema
const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;

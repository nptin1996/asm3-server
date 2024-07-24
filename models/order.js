const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "User",
    },
    info: {
      name: String,
      phone: String,
      address: String,
    },
    items: [
      {
        product: {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        qty: {
          type: Number,
          required: true,
          min: 1,
          validate: {
            validator: Number.isInteger,
          },
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
      },
    },
    delivery: {
      type: String,
      default: "Waiting for progressing",
    },
    status: {
      type: String,
      default: "Waiting for pay",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);

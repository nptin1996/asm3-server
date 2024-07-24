const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    shortDesc: { type: String, required: true },
    longDesc: { type: String, required: true },
    images: [{ type: String, required: true }],
    price: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
      },
    },
    count: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
      },
    },
  },
  { timestamps: true }
);

productSchema.statics.getDataForCart = async function (cartList) {
  try {
    const productPromises = cartList.map(async (item) => {
      const p = await this.findById(item.productId);
      return {
        product: p,
        qty: item.qty,
      };
    });
    const productData = await Promise.all(productPromises);
    const items = productData.filter((ele) => ele.product !== null);
    return items;
  } catch (err) {
    throw new Error(err);
  }
};

module.exports = mongoose.model("Product", productSchema);

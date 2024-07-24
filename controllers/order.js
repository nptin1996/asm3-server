const { validationResult } = require("express-validator");
const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const sendMail = require("../util/send-mail");

exports.getOrdersClient = async function (req, res, next) {
  try {
    const orders = await Order.find({ user: req.session.user._id })
      .populate("items.product", "name price images")
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (err) {
    console.log(err);
    next(new Error("Failed to get orders."));
  }
};

exports.getOrdersAdmin = async function (req, res, next) {
  const date = new Date();
  const startDateMonth = new Date(date.getFullYear(), date.getMonth(), 1); // ngày 1 đầu tháng
  const endDateMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1); // ngày 1 tháng sau
  try {
    const orders = await Order.find({
      createdAt: { $gte: startDateMonth, $lte: endDateMonth },
    }).sort({ createdAt: -1 });
    const users = await User.countDocuments({ type: "client" });
    res.status(200).json({ orders, users });
  } catch (err) {
    console.log(err);
    next(new Error("Failed to get orders."));
  }
};

exports.postOrder = async function (req, res, next) {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    const errArr = errs.array();
    return res
      .status(422)
      .json({ message: errArr[0].msg + " " + errArr[0].path });
  }
  const data = req.body;
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.status(422).json({ message: "Giỏ hàng trống.!" });
  }
  try {
    const cartList = await Product.getDataForCart(req.session.cart);
    // check tồn kho;
    const errCartItems = cartList.filter(
      (item) => item.qty > item.product.count
    );

    if (errCartItems.length > 0) {
      return res.status(420).json({
        message: `${errCartItems[0].product.name} không đủ số lượng, gợi ý: ${errCartItems[0].product.count}`,
      });
    }

    // cập nhật count các product đc đặt
    const newCountPromises = cartList.map(async (item) => {
      item.product.count -= item.qty;
      return item.product.save();
    });

    await Promise.all(newCountPromises);
    const total = cartList.reduce(
      (acc, ele) => acc + ele.product.price * ele.qty,
      0
    );

    const order = new Order({
      user: req.session.user,
      info: { name: data.name, phone: data.phone, address: data.address },
      items: cartList,
      total,
    });

    const dataSendMail = {
      ...order.info,
      items: cartList,
      total,
      email: data.email,
    };

    await order.save();
    req.session.cart = [];
    res.status(201).end();
    sendMail(dataSendMail);
  } catch (err) {
    console.log(err);
    next(new Error("Failed to post order!"));
  }
};

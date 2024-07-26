const { validationResult } = require("express-validator");
const Product = require("../models/product");

exports.getCart = async function (req, res, next) {
  const cartList = req.session.cart;
  // nếu k có session.cart thì sẽ trả về [] vì khi client post thì cart mới đc tạo và lưu vào session
  if (!cartList) {
    return res.status(200).json([]);
  }
  try {
    const data = await Product.getDataForCart(cartList);
    res.status(200).json(data);
  } catch (err) {
    console.log(err);
    next(new Error("Failed to get cart"));
  }
};

exports.postCart = async function (req, res, next) {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    const errArr = errs.array();
    return res
      .status(422)
      .json({ message: errArr[0].msg + " " + errArr[0].path });
  }
  const productId = req.body.productId;
  const qty = req.body.qty;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(422).json({ message: "Invalid product" });
    }
    let cartList;
    if (!req.session.cart) {
      cartList = [];
    } else {
      cartList = [...req.session.cart];
    }
    const index = cartList.findIndex((item) => item.productId === productId);
    if (index !== -1) {
      cartList[index].qty = qty;
      res.status(200);
    } else {
      cartList.push({ productId: productId, qty: Number(qty) });
      res.status(201);
    }

    // lưu lại giỏ hàng vào session
    req.session.cart = cartList;
    req.session.save((err) => {
      if (err) throw new Error(err);
      res.end();
    });
  } catch (err) {
    console.log(err);
    next(new Error("Failed to post cart"));
  }
};

exports.deleteCart = async function (req, res, next) {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    const errArr = errs.array();
    return res
      .status(422)
      .json({ message: errArr[0].msg + " " + errArr[0].path });
  }
  const productId = req.body.productId;
  const cart = req.session.cart;

  if (!cart) {
    return res.status(422).end(); // nếu chưa tạo giỏ hàng trong session mà nhận req delete thì trả lỗi input
  }

  try {
    const cartList = [...cart];
    const product = cartList.find((ele) => ele.productId === productId);
    if (!product) return res.status(422).json({ message: "Invalid product." });
    req.session.cart = cartList.filter((ele) => ele.productId !== productId);
    req.session.save((err) => {
      if (err) throw new Error(err);
      res.status(200).end();
    });
  } catch (err) {
    console.log(err);
    next(new Error("Failed to get cart"));
  }
};

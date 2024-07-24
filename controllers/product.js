const { validationResult } = require("express-validator");
const Product = require("../models/product");
const deleteImages = require("../util/delete-image");

exports.getProduct = async (req, res, next) => {
  const errs = validationResult(req);
  if (!errs.isEmpty()) {
    const errArr = errs.array();
    return res
      .status(422)
      .json({ message: errArr[0].msg + " " + errArr[0].path });
  }
  const mode = req.query.mode;
  const productId = req.params.productId;
  try {
    let product;
    if (mode === "admin") {
      if (!req.session.isLogin || !(req.session.user.type !== "client")) {
        return res.status(403).end();
      }
      product = await Product.findById(productId);
    } else {
      product = await Product.findById(productId).select("-count");
    }
    if (!product) return res.status(422).json({ message: "Invalid product." });
    if (mode === "admin") return res.status(200).json(product);
    const related = await Product.find({ category: product.category }).select(
      "-count"
    );
    let cartQty = 1;
    const cart = req.session.cart;
    if (cart) {
      const productInCart = req.session.cart.find(
        (ele) => ele.productId === product._id.toString()
      );
      if (productInCart) cartQty = productInCart.qty;
    }
    res.status(200).json({
      ...product._doc,
      related: related.filter(
        (ele) => ele._id.toString() !== product._id.toString()
      ),
      cartQty: cartQty,
    });
  } catch (err) {
    next(new Error("Get product failed."));
  }
};

exports.getProducts = async (req, res, next) => {
  const mode = req.query.mode;
  try {
    let products;
    if (mode === "admin") {
      if (!req.session.isLogin || !(req.session.user.type !== "client")) {
        return res.status(403).end();
      }
      products = await Product.find({}).sort({ createdAt: -1 });
    } else {
      products = await Product.find({})
        .select("-count")
        .sort({ createdAt: -1 });
    }
    const type = req.query.type;
    res.status(200);
    if (type === "index") {
      return res.json(products.slice(0, 8));
    }
    res.json(products);
  } catch (err) {
    console.log(err.message);
    next(new Error("Get products failed."));
  }
};

exports.postCreateProduct = async (req, res, next) => {
  const imagesFile = req.files;
  if (imagesFile.length === 0) {
    return res.status(422).json({ message: "Images empty!" });
  }
  // Sắp xếp file theo tên gốc (originalname) tăng dần
  const sortedFiles = imagesFile.sort((a, b) => {
    return a.originalname.localeCompare(b.originalname);
  });
  const imagesPath = sortedFiles.map((i) => i.path);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // có lỗi xóa các ảnh đã upload
      await deleteImages(imagesPath);
      const errArr = errors.array();
      return res
        .status(422)
        .json({ message: errArr[0].msg + " " + errArr[0].path });
    }
    const product = new Product({
      name: req.body.name,
      count: req.body.count,
      category: req.body.category.toLowerCase(),
      images: imagesPath,
      price: req.body.price,
      shortDesc: req.body.shortDesc,
      longDesc: req.body.longDesc,
    });
    await product.save();
    res.status(201).send();
  } catch (err) {
    console.log(err.message);
    await deleteImages(imagesPath);
    next(new Error("Create product failed."));
  }
};

exports.putEditProduct = async (req, res, next) => {
  const imagesFile = req.files;
  // Sắp xếp file theo tên gốc (originalname) tăng dần
  const sortedFiles = imagesFile.sort((a, b) => {
    return a.originalname.localeCompare(b.originalname);
  });
  const imagesPath = sortedFiles.map((i) => i.path);
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (imagesPath.length > 0) {
        await deleteImages(imagesPath);
      }

      const errArr = errors.array();
      return res
        .status(422)
        .json({ message: errArr[0].msg + " " + errArr[0].path });
    }
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    if (!product) {
      if (imagesPath.length > 0) await deleteImages(imagesPath);
      return res.status(422).json({ message: "Invalid Product" });
    }
    const data = req.body;
    product.longDesc = data.longDesc;
    product.shortDesc = data.shortDesc;
    product.price = data.price;
    product.count = data.count;
    product.name = data.name;
    product.category = data.category;

    // xóa các hình cũ và lưu link hình mới vào database
    if (imagesPath.length !== 0) {
      await deleteImages(product.images);
      product.images = imagesPath;
    }
    await product.save();
    res.status(200).end();
  } catch (err) {
    console.log(err.message);
    if (imagesPath.length > 0) await deleteImages(imagesPath);
    next(new Error("Edit product failed."));
  }
};

exports.deleteProduct = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: "Invalid product." });
  }
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(422).json({ message: "Invalid product." });
    }
    await deleteImages(product.images);
    await Product.findByIdAndDelete(product._id);
    res.status(200).end();
  } catch (err) {
    console.log(err.message);
    next(new Error("Delete products failed."));
  }
};

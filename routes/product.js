const express = require("express");
const { body, param } = require("express-validator");
const productControllers = require("../controllers/product");
const uploadImage = require("../middlewares/upload-image");
const { checkLogin, checkAdmin } = require("../middlewares/checkAuth");

const router = express.Router();

// get /product
router.get("", productControllers.getProducts);

// get /product/:productId
router.get(
  "/:productId",
  param("productId").isMongoId(),
  productControllers.getProduct
);

// post /product =>create product
router.post(
  "",
  checkLogin,
  checkAdmin,
  uploadImage,
  [
    body("name").trim().isString(),
    body("category").isAlphanumeric(),
    body("shortDesc").trim().isString(),
    body("longDesc").trim().isString(),
    body("price").trim().isNumeric(),
    body("count").trim().isNumeric(),
    body("price").isInt({ min: 1 }),
    body("count").isInt({ min: 0 }),
  ],
  productControllers.postCreateProduct
);

// put /product/:productId  => edit product
router.put(
  "/:productId",
  checkLogin,
  checkAdmin,
  uploadImage,
  [
    param("productId").isMongoId(),
    body("name").trim().isString(),
    body("category").isAlphanumeric(),
    body("shortDesc").trim().isString(),
    body("longDesc").trim().isString(),
    body("price").isInt({ min: 1 }),
    body("count").isInt({ min: 0 }),
  ],
  productControllers.putEditProduct
);

router.delete(
  "/:productId",
  checkLogin,
  checkAdmin,
  param("productId").isMongoId(),
  productControllers.deleteProduct
);

module.exports = router;

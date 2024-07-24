const express = require("express");
const { body } = require("express-validator");
const cartControllers = require("../controllers/cart");

const router = express.Router();

// /cart
router.get("", cartControllers.getCart);
router.post(
  "",
  [body("qty").isInt({ min: 1 }), body("productId").isMongoId()],
  cartControllers.postCart
);
router.delete("", body("productId").isMongoId(), cartControllers.deleteCart);

module.exports = router;

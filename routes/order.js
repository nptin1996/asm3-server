const express = require("express");
const { body } = require("express-validator");
const { checkLogin, checkStaff } = require("../middlewares/checkAuth");
const orderControllers = require("../controllers/order");
const router = express.Router();

// get /order/admin
router.get("/admin", checkLogin, checkStaff, orderControllers.getOrdersAdmin);

// get /order/client
router.get("/client", checkLogin, orderControllers.getOrdersClient);

// post /order/client
router.post(
  "/client",
  checkLogin,
  [
    body("name").trim().isString(),
    body("email").isEmail().normalizeEmail(),
    body("phone").isLength({ min: 10 }),
    body("address").trim().isString(),
  ],
  orderControllers.postOrder
);

module.exports = router;

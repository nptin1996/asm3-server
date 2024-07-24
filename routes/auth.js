const express = require("express");
const { body, query } = require("express-validator");
const authControllers = require("../controllers/auth");

const router = express.Router();

// /auth

router.get(
  "/session",
  query("email").isEmail().normalizeEmail(),
  authControllers.getSessionData
);

router.post(
  "/signup",
  [
    body("name").trim().isString().isLength({ min: 2, max: 25 }),
    body("password").isLength({ min: 6 }),
    body("email").isEmail().normalizeEmail(),
    body("phone").isLength({ min: 10 }),
  ],
  authControllers.postCreateUser
);

router.post(
  "/login",
  [
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 6 }),
  ],
  authControllers.postLogin
);

router.post("/logout", authControllers.postLogout);

module.exports = router;

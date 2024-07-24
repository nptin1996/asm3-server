const express = require("express");
const { body } = require("express-validator");
const chatControllers = require("../controllers/chat");
const { checkLogin, checkStaff } = require("../middlewares/checkAuth");
const mongoose = require("mongoose");
const router = express.Router();

// /chat/client
router.get(
  "/client",
  (req, res, next) => {
    if (!req.session.chat) {
      req.session.chat = {
        chatId: new mongoose.Types.ObjectId(),
        chatList: [],
      };
      req.session.save((err) => {
        if (err) {
          console.error("Error saving session:", err);
          return next(err);
        }
        next();
      });
    }
    next();
  },
  chatControllers.getChatClient
);

router.post(
  "/client",
  body("content").trim().notEmpty(),
  chatControllers.postChatClient
);

router.delete("/client", chatControllers.deleteChatClient);

//  chat/admin
router.get("/admin", checkLogin, checkStaff, chatControllers.getChatsAdmin);
router.post(
  "/admin",
  checkLogin,
  checkStaff,
  [
    body("content").trim().notEmpty(),
    body("chatId").isMongoId(),
    body("type").notEmpty(),
  ],
  chatControllers.postChatAdmin
);

module.exports = router;

const express = require("express");
const { body } = require("express-validator");
const chatControllers = require("../controllers/chat");
const { checkLogin, checkStaff } = require("../middlewares/checkAuth");
const router = express.Router();

// /chat/client
// khởi động
router.get("/client", chatControllers.getChatClient);

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

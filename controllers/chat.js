const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Session = require("../models/session");
const io = require("../socket");

exports.getChatClient = function (req, res, next) {
  // khi client getChat nếu req.session.chat không tồn tại thì tạo chat
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
    });
  }
  console.log(req.session.chat);
  const chat = req.session.chat;
  res.status(200).json(chat);
};

exports.postChatClient = function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: "Chat không thể trống." });
  }

  // khi start front-end client thì client sẽ getChat đăng ký 1 room chat theo session nên req.session.chat luôn tồn tại, nếu k thì lỗi cookie bên client
  const newChat = [...req.session.chat.chatList];
  console.log(newChat);
  const dataChat = { content: req.body.content, type: "client" };
  newChat.push(dataChat);
  req.session.chat.chatList = newChat;
  req.session.save((err) => {
    if (err) {
      res.status(500).json({ message: "Lỗi khi gửi chat." });
    }
    res.status(201).end();
    io.getIO().emit("chats", {
      action: "Client Send Chat",
      chatData: dataChat,
      chatId: req.session.chat.chatId,
    });
  });
};

exports.deleteChatClient = function (req, res, next) {
  console.log(req.session);
  req.session.chat.chatList = [];
  req.session.save((err) => {
    if (err) {
      res.status(500).json({ message: "Lỗi khi xóa chat." });
    }
    res.status(200).end();
    io.getIO().emit("chats", {
      action: "Client Clear Chat",
      chatId: req.session.chat.chatId,
    });
  });
};

exports.getChatsAdmin = async function (req, res, next) {
  try {
    const chatsSession = await Session.find({
      "session.chat.chatList.0": { $exists: true }, // trả về các doc có chatlist[0] tồn tại
    });

    const chatList = chatsSession.map((cSession) => {
      return {
        chatId: cSession.session.chat.chatId.toString(),
        chatList: cSession.session.chat.chatList,
        user: cSession._doc.session.user,
      };
    });
    res.status(200).json(chatList);
  } catch (err) {
    console.log(err);
    next(new Error("Failed to get chats"));
  }
};

exports.postChatAdmin = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ message: "Chat data invalid." });
  }
  try {
    const chatId = req.body.chatId;
    const dataChat = { content: req.body.content, type: req.body.type };
    const chatSession = await Session.findOne({
      "session.chat.chatId": chatId,
    });
    const chatList = [...chatSession.session.chat.chatList, { ...dataChat }];
    chatSession.session.chat.chatList = chatList;
    await chatSession.save();
    res.status(201).end();
    io.getIO().emit(chatId, {
      action: "Admin Send Chat",
      chatData: dataChat,
    });
  } catch (err) {
    console.log(err);
    next(new Error("Failed to post chat by admin."));
  }
};

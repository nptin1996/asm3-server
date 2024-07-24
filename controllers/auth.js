const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

exports.postCreateUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errArr = errors.array();
      return res
        .status(422)
        .json({ message: errArr[0].msg + " " + errArr[0].path });
    }

    const checkEmail = await User.findOne({ email: req.body.email });

    if (checkEmail) {
      return res.status(422).json({ message: "Email has been used." });
    }

    const hashPassword = await bcrypt.hash(req.body.password, 12);
    const user = new User({ ...req.body, password: hashPassword });
    await user.save();
    res.status(201).send(null);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create User." });
  }
};

exports.postLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errArr = errors.array();
    return res
      .status(422)
      .json({ message: errArr[0].msg + " " + errArr[0].path });
  }

  try {
    const checkUser = await User.findOne({ email: req.body.email });
    if (!checkUser) {
      return res.status(422).json({ message: "Email does not exist." });
    }

    const checkPass = await bcrypt.compare(
      req.body.password,
      checkUser.password
    );
    if (!checkPass)
      return res.status(422).json({ message: "Password not valid." });

    const mode = req.query.mode;
    if (mode === "admin") {
      if (!["admin", "staff"].includes(checkUser.type)) {
        return res.status(403).json({ message: "Not accept." });
      }
      req.session.isLogin = true;
      req.session.user = checkUser;
      res.status(200).json({
        name: checkUser.name,
        type: checkUser.type,
        expires: req.session.cookie._expires.getTime(),
      });
    } else {
      req.session.isLogin = true;
      req.session.user = checkUser;
      res.status(200).json({
        name: checkUser.name,
        email: checkUser.email,
        phone: checkUser.phone,
        expires: req.session.cookie._expires.getTime(),
      });
    }
  } catch {
    next(new Error("Failed to Login User."));
  }
};

exports.postLogout = (req, res, next) => {
  req.session.isLogin = false;
  req.session.user = null;
  req.session.save((err) => {
    if (err) {
      return next(new Error("Logout failed."));
    }
    res.status(200).end();
  });
};

// getSessionData cho khởi động front-end, tránh nhầm user giữa 2 front end dùng chung trình duyệt
exports.getSessionData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).end();
  }

  const email = req.query.email;
  if (!email || !req.session.isLogin) {
    return res.status(200).json({ isLogin: false, data: null });
  }

  const user = req.session.user;
  // nếu khác email trong session thì logout session đó để phải login lại ở cả 2 front end
  if (email !== user.email) {
    req.session.isLogin = false;
    req.session.user = null;
    return res.status(200).json({ isLogin: false, data: null });
  }

  res.status(200).json({
    isLogin: true,
    data: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      expires: req.session.cookie._expires.getTime(),
    },
  });
};

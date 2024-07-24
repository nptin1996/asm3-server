exports.checkLogin = (req, res, next) => {
  if (req.session.isLogin) {
    return next();
  }
  res.status(401).end();
};

exports.checkStaff = (req, res, next) => {
  const type = req.session.user.type;
  if (["staff", "admin"].includes(type)) {
    return next();
  }
  res.status(403).end();
};

exports.checkAdmin = (req, res, next) => {
  const type = req.session.user.type;
  if (type === "admin") {
    return next();
  }
  res.status(403).end();
};

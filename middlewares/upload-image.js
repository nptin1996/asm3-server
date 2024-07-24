const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    cb(null, "image" + "-" + Date.now() + "-" + file.originalname);
  },
});

function fileFilter(req, file, cb) {
  // Check if the file is an image
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const upload = multer({ storage: storage, fileFilter: fileFilter }).array(
  "images",
  4
);

const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(422).json({
          message:
            "Too many files uploaded. Exactly 4 image files are required.",
        });
      }
      return res.status(500).json({ message: "Error uploading files" });
    }
    next();
  });
};

module.exports = uploadMiddleware;

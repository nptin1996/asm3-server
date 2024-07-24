const fs = require("fs").promises;
const path = require("path");

module.exports = async function (filePathList) {
  try {
    const promises = filePathList.map((filePath) =>
      fs.unlink(path.join(__dirname, "..", filePath))
    );
    await Promise.all(promises);
  } catch (err) {
    console.error("Lỗi khi xóa images", err.message);
  }
};

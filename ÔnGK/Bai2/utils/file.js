const fs = require("fs");
const path = require("path");

function removeLocalFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) {
    return;
  }

  const filePath = path.join(__dirname, "..", fileUrl);

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

module.exports = {
  removeLocalFile
};

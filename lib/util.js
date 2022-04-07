const crypto = require("crypto");

const util = {
  hash: (s) => {
    return crypto.createHash("md5").update(str).digest("hex");
  },
};

export default util;

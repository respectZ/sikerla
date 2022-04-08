const crypto = require("crypto");

const util = {
  hash: (s) => {
    return crypto.createHash("md5").update(s).digest("hex");
  },
};

export default util;

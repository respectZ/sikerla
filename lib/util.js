const crypto = require("crypto");

const util = {
  hash: (s) => {
    return crypto.createHash("md5").update(s).digest("hex");
  },
  validateEmail: (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  },
  getDate: () => {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, "0");
    var mm = String(today.getMonth() + 1).padStart(2, "0"); //January is 0!
    var yyyy = today.getFullYear();

    today = mm + "/" + dd + "/" + yyyy;
    return today;
  },
  formatDateClient: (date) => {
    var _ = date.split("/");
    var dd = _[1];
    var mm = _[0];
    var yyyy = _[2];
    return `${yyyy}-${mm}-${dd}`;
  },
  formatDateServer: (date) => {},
  isEmptyOrSpaces: (str) => {
    return str === null || str.match(/^ *$/) !== null;
  },
  isNumeric(str) {
    return /^\d+$/.test(str);
  },
};

export default util;

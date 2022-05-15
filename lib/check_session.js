import mysql_con from "./mysl_con";

let checkSession = function (user) {
  return new Promise(function (resolve, reject) {
    if (user) {
      mysql_con.getToken(user.nomor_hp, (err, token) => {
        if (token) {
          //udh ad session lain, cek token
          if (token == user.token) {
            resolve(true);
          } else {
            resolve(false);
          }
        } else {
          //   bug prob, gk ada token
          resolve(false);
        }
      });
    } else {
      resolve(false);
    }
  });
};
export default checkSession;

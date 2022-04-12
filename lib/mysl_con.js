const mysql = require("mysql");
const crypto = require("crypto");

let con = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
  database: "sikerla",
});

const mysql_con = {
  init: () => {
    con.connect((err) => {
      if (err) throw err;
    });
  },
  getUser: (email, password, callback) => {
    con.query(
      `SELECT * FROM user WHERE email = ? AND password = ?`,
      [email, password],
      (err, res) => {
        if (err) throw err;
        if (!res.length) {
          callback(Error("Maaf email dan password anda tidak sesuai."), null);
          return;
        }
        con.query(
          `SELECT * FROM pemilik WHERE id_pemilik = ? UNION SELECT * FROM pekerja WHERE id_pekerja = ?`,
          [res[0]["id_user"], res[0]["id_user"]],
          (_err, _res) => {
            if (_err) throw _err;
            if (!_res.length) {
              callback(
                Error(
                  "Pengguna tidak memiliki role. Silahkan menghubungi pemilik."
                ),
                null
              );
              return;
            }
          }
        );
        con.query(
          `SELECT * FROM pemilik WHERE id_pemilik = ?`,
          [res[0]["id_user"]],
          (_err, _res) => {
            if (_err) throw _err;
            if (_res.length) {
              res[0]["role"] = "Pemilik";
              callback(null, res);
              return;
            }
          }
        );
        con.query(
          `SELECT * FROM pekerja WHERE id_pekerja = ?`,
          [res[0]["id_user"]],
          (_err, _res) => {
            if (_err) throw _err;
            if (_res.length) {
              res[0]["role"] = "Pekerja";
              callback(null, res);
              return;
            }
          }
        );
      }
    );
  },
};

export default mysql_con;

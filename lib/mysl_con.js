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
  getDataAkun: (callback) => {
    con.query(
      "SELECT * FROM user WHERE id_user IN (SELECT id_pemilik FROM pemilik)",
      (err, res) => {
        if (err) throw err;
        res.forEach((element) => {
          element["role"] = "Pemilik";
        });
        con.query(
          "SELECT * FROM user WHERE id_user IN (SELECT id_pekerja FROM pekerja)",
          (_err, _res) => {
            if (_err) throw _err;
            _res.forEach((element) => {
              element["role"] = "Pekerja";
            });
            callback(res.concat(_res));
          }
        );
      }
    );
  },
  updateAkun: (id, data, callback) => {
    if (data.id) delete data.id;
    if (data.role) delete data.role;

    con.query(
      `UPDATE user SET ${Object.keys(data).join(
        " = ?, "
      )} = ? WHERE id_user = ?`,
      Object.keys(data)
        .map((key) => data[key])
        .concat([id]),
      (err, res) => {
        if (err) callback(err, null);
        else callback(null, res);
      }
    );
  },
  getProfilPerusahaan: (callback) => {
    con.query(`SELECT * FROM profil_perusahaan`, (err, res) => {
      if (err) callback(err, null);
      else callback(null, res[0]);
    });
  },
  updateProfilPerusahaan: (nomor_hp, data, callback) => {
    Object.keys(data).forEach((key) => {
      if (
        key != "nomor_hp" &&
        key != "email" &&
        key != "deskripsi" &&
        key != "alamat" &&
        key != "gambar"
      ) {
        delete data[key];
      }
    });
    con.query(
      `UPDATE profil_perusahaan SET ${Object.keys(data).join(
        " = ?, "
      )} = ? WHERE nomor_hp = ?`,
      Object.keys(data)
        .map((key) => data[key])
        .concat(nomor_hp),
      (err, res) => {
        if (err) callback(err, null);
        else callback(null, res);
      }
    );
  },
  getBahanBaku: ({ date = null, callback }) => {
    if (date)
      con.query(
        `SELECT p.id, p.waktu, p.jumlah, p.nama, u.nama as "user" FROM bahan_baku p JOIN user u on p.user = u.id_user WHERE DATE(waktu) = DATE(?)`,
        [date],
        (err, res) => {
          if (err) callback(err, null);
          else callback(null, res);
        }
      );
    else
      con.query(
        `SELECT p.id, p.waktu, p.jumlah, p.nama, u.nama as "user" FROM bahan_baku p JOIN user u on p.user = u.id_user`,
        (err, res) => {
          if (err) callback(err, null);
          else callback(null, res);
        }
      );
  },
  updateBahanBaku: (id, data, callback) => {
    con.query(
      `UPDATE bahan_baku SET ${Object.keys(data).join(
        " = ?, "
      )} = ? WHERE id = ?`,
      Object.keys(data)
        .map((key) => data[key])
        .concat(id),
      (err, res) => {
        if (err) callback(err, null);
        else callback(null, res);
      }
    );
  },
  insertBahanBaku: (data, callback) => {
    con.query(
      `INSERT into bahan_baku(${Object.keys(data).join(",")}) VALUES(${Array(
        Object.keys(data).length
      )
        .fill("?")
        .join(",")})`,
      Object.keys(data).map((key) => data[key]),
      (err, res) => {
        if (err) callback(err, null);
        else callback(null, res);
      }
    );
  },
  deleteBahanBaku: (id, callback) => {
    con.query(`DELETE FROM bahan_baku WHERE id = ?`, [id], (err, res) => {
      if (err) callback(err, null);
      else callback(null, res);
    });
  },
  getProduk: ({ date = null, callback }) => {
    if (date)
      con.query(
        `SELECT p.id, p.waktu, p.jumlah, p.nama, u.nama as "user" FROM produk p JOIN user u on p.user = u.id_user WHERE DATE(waktu) = DATE(?)`,
        [date],
        (err, res) => {
          if (err) callback(err, null);
          else callback(null, res);
        }
      );
    else
      con.query(
        `SELECT p.id, p.waktu, p.jumlah, p.nama, u.nama as "user" FROM produk p JOIN user u on p.user = u.id_user`,
        (err, res) => {
          if (err) callback(err, null);
          else callback(null, res);
        }
      );
  },
  updateProduk: (id, data, callback) => {
    con.query(
      `UPDATE produk SET ${Object.keys(data).join(" = ?, ")} = ? WHERE id = ?`,
      Object.keys(data)
        .map((key) => data[key])
        .concat(id),
      (err, res) => {
        if (err) callback(err, null);
        else callback(null, res);
      }
    );
  },
  insertProduk: (data, callback) => {
    con.query(
      `INSERT into produk(${Object.keys(data).join(",")}) VALUES(${Array(
        Object.keys(data).length
      )
        .fill("?")
        .join(",")})`,
      Object.keys(data).map((key) => data[key]),
      (err, res) => {
        if (err) callback(err, null);
        else callback(null, res);
      }
    );
  },
  deleteProduk: (id, callback) => {
    con.query(`DELETE FROM produk WHERE id = ?`, [id], (err, res) => {
      if (err) callback(err, null);
      else callback(null, res);
    });
  },
};

export default mysql_con;

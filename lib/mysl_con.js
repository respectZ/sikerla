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
  getToken: (nomor_hp, callback) => {
    con.query(
      `SELECT * FROM login WHERE nomor_hp = ?`,
      [nomor_hp],
      (err, res) => {
        if (err) callback(err, null);
        else return callback(null, res.length ? res[0].token : null);
      }
    );
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
        let token = crypto
          .createHash("md5")
          .update(new Date().toISOString())
          .digest("hex")
          .substring(0, 5);
        con.query(
          `SELECT * FROM user u JOIN login l on u.nomor_hp = l.nomor_hp WHERE u.email = ? and u.password = ?`,
          [email, password],
          (_err, _res) => {
            if (!_res.length) {
              con.query(`INSERT INTO login(token, nomor_hp) VALUES(?, ?)`, [
                token,
                res[0].nomor_hp,
              ]);
            } else {
              con.query(
                `DELETE from LOGIN where nomor_hp = ?`,
                [res[0].nomor_hp],
                () => {}
              );
              // callback(
              //   Error(
              //     "Terdapat session lain, silahkan login ulang untuk menghapus session."
              //   ),
              //   null
              // );
            }
          }
        );
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
              res[0]["token"] = token;
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
              res[0]["token"] = token;
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
          delete element["password"];
          element["role"] = "Pemilik";
        });
        con.query(
          "SELECT * FROM user WHERE id_user IN (SELECT id_pekerja FROM pekerja)",
          (_err, _res) => {
            if (_err) throw _err;
            _res.forEach((element) => {
              element["role"] = "Pekerja";
              delete element["password"];
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
  getRiwayatBahanBaku: ({ date = null, callback }) => {
    if (date)
      con.query(
        `SELECT p.id, p.nama_lama, p.nama_baru, p.jumlah_lama, p.jumlah_baru, p.waktu_lama, p.waktu_baru, p.waktu, p.aksi, u.nama as "user" FROM riwayat_bahan_baku p JOIN user u on p.user = u.id_user WHERE DATE(waktu_lama) = DATE(?) OR DATE(waktu_baru) = DATE(?)`,
        [date, date],
        (err, res) => {
          if (err) callback(err, null);
          else callback(null, res);
        }
      );
    else
      con.query(
        `SELECT p.id, p.nama_lama, p.nama_baru, p.jumlah_lama, p.jumlah_baru, p.waktu_lama, p.waktu_baru, p.waktu, p.aksi, u.nama as "user" FROM riwayat_bahan_baku p JOIN user u on p.user = u.id_user`,
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
  getRiwayatProduk: ({ date = null, callback }) => {
    if (date)
      con.query(
        `SELECT p.id, p.nama_lama, p.nama_baru, p.jumlah_lama, p.jumlah_baru, p.waktu_lama, p.waktu_baru, p.waktu, p.aksi, u.nama as "user" FROM riwayat_produk p JOIN user u on p.user = u.id_user WHERE DATE(waktu_lama) = DATE(?) OR DATE(waktu_baru) = DATE(?)`,
        [date, date],
        (err, res) => {
          if (err) callback(err, null);
          else callback(null, res);
        }
      );
    else
      con.query(
        `SELECT p.id, p.nama_lama, p.nama_baru, p.jumlah_lama, p.jumlah_baru, p.waktu_lama, p.waktu_baru, p.waktu, p.aksi, u.nama as "user" FROM riwayat_produk p JOIN user u on p.user = u.id_user`,
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
  getPrediksi: ({ date = null, callback }) => {
    con.query(
      `SELECT * FROM prediksi where tanggal_prediksi = ?`,
      [date],
      (err, res) => {
        if (err) callback(err, null);
        else callback(null, res);
      }
    );
  },
  insertPrediksi: (data, callback) => {
    con.query(
      `INSERT into prediksi(${Object.keys(data).join(",")}) VALUES(${Array(
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
  deletePrediksi: (tanggal_mulai, callback) => {
    con.query(
      `DELETE FROM prediksi WHERE tanggal_mulai = ?`,
      [tanggal_mulai],
      (err, res) => {
        if (err) callback(err, null);
        else callback(null, res);
      }
    );
  },
  getCuaca: ({ date = null, callback }) => {
    con.query(`SELECT * FROM cuaca where tanggal = ?`, [date], (err, res) => {
      if (err) callback(err, null);
      else callback(null, res);
    });
  },
  insertCuaca: (data, callback) => {
    con.query(
      `INSERT into cuaca(${Object.keys(data).join(",")}) VALUES(${Array(
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
  insertPekerja: (data, callback) => {
    con.query(
      `INSERT into USER(${Object.keys(data).join(",")}) VALUES(${Array(
        Object.keys(data).length
      )
        .fill("?")
        .join(",")})`,
      Object.keys(data).map((key) => data[key]),
      (err, res) => {
        if (err) {
          callback(err, null);
        } else {
          con.query(
            `INSERT into PEKERJA(id_pekerja) VALUES(?)`,
            [res.insertId],
            (_err, _res) => {
              if (_err) callback(_err, null);
              else callback(null, _res);
            }
          );
        }
      }
    );
  },
  deletePekerja: (id, callback) => {
    con.query(`DELETE from PEKERJA where id_pekerja = ?`, [id], (err, res) => {
      if (err) {
        callback(err, null);
      } else {
        con.query(`DELETE from USER where id_user = ?`, [id], (_err, _res) => {
          if (_err) callback(_err, null);
          else callback(null, _res);
        });
      }
    });
  },
  deleteSession: (nomor_hp, callback) => {
    con.query(
      `DELETE from LOGIN where nomor_hp = ?`,
      [nomor_hp],
      (err, res) => {
        if (err) callback(err, null);
        else callback(null, res);
      }
    );
  },
};

export default mysql_con;

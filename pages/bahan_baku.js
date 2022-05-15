import Head from "next/head";
import HomePage_Navbar from "../components/homepage/Navbar";
import util from "../lib/util";
import UIkit from "uikit";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { withIronSessionSsr } from "iron-session/next";
import { ironSessionConfig } from "../next.config";
import checkSession from "../lib/check_session";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    let tokenValid = null;
    tokenValid = await checkSession(req.session.user);
    return {
      props: {
        user: req.session.user ?? null,
        WEATHER_API_KEY: process.env.WEATHER_API_KEY,
        tokenValid: tokenValid,
      },
    };
  },
  ironSessionConfig
);

export default function BahanBakuPage({ user, WEATHER_API_KEY, tokenValid }) {
  const router = useRouter();

  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [_date, _setDate] = useState(util.formatDateClient(util.getDate()));
  const [produk, setProduk] = useState([]);
  const [formProduk, setFormProduk] = useState({});
  const [riwayatProduk, setRiwayatProduk] = useState([]);
  const [prediksiKurma, setPrediksiKurma] = useState([]);
  const [prediksiKopi, setPrediksiKopi] = useState([]);

  useEffect(() => {
    if (!user || !user.admin) {
      router.push("/");
    }
    if (tokenValid == false) {
      UIkit.modal
        .alert("Anda akan logout karena terdapat device lain.")
        .then(function () {
          router.push("/api/logout");
        });
    }
    if (_date) {
      let p = fetch("api/bahan_baku?date=" + _date);
      p.then((_) => _.json()).then((d) => {
        setProduk(d.data);
        let weathers = getWeather();
        weathers.then((p) => {
          getPrediksi(d.data, p);
        });
      });
      _setDate("");
    }
  });

  // utils
  function inputNumberOnly(event) {
    event.target.value = event.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*?)\..*/g, "$1");
  }
  function getProduk(date) {
    _setDate(date);
  }

  function getDateTime() {
    let tanggal = document.getElementById("tanggal").value;
    let today = new Date();
    today.setHours(today.getHours() + 7);
    tanggal = tanggal + "T" + today.toISOString().split("T")[1].split(".")[0];
    return tanggal;
  }

  function formatDateToServer(date) {
    return date.replace("T", " ").split(".")[0];
  }

  function formatDateToClient(date) {
    date = new Date(date);
    date.setHours(date.getHours() + 7);
    return date.toISOString().split(".")[0];
  }

  // prediksi
  async function getWeather() {
    let _date = new Date(document.getElementById("tanggal").value)
      .toISOString()
      .split("T")[0];
    const res = await fetch("../api/prediksi/?date=" + _date, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "GET",
    });

    const result = await res.json();
    if (result.data.length) {
      return eval(result.data[0].cuaca);
    } else {
      console.log("creating...");
      //bikin then post
      let weatherUrl = `http://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=1.4352134,99.1803313&days=1&aqi=no&alerts=no&dt=`;
      if (
        new Date(document.getElementById("tanggal").value).getDate() <
        new Date().getDate()
      ) {
        return [];
      } else {
        let weathers = [];
        for (let i = 0; i < 15; i++) {
          let t = new Date();
          t.setDate(t.getDate() + i);
          let r = fetch(weatherUrl + t.toISOString().split("T")[0]);
          r.then((_) => _.json()).then(async (res) => {
            weathers.push(res.forecast.forecastday[0].day.daily_will_it_rain);
            if (weathers.length == 15) {
              const res = await fetch("../api/prediksi/insert", {
                body: JSON.stringify({
                  data: {
                    tanggal: _date,
                    cuaca: JSON.stringify(weathers),
                  },
                }),
                headers: {
                  "Content-Type": "application/json",
                },
                method: "POST",
              });
            }
          });
        }
      }
    }
  }
  function getPrediksi(produk, weathers) {
    let salak = 0;
    let gula = 0;
    let kopi = 0;
    if (produk?.length == 0) return;
    produk?.forEach((element) => {
      if (element.nama.toLowerCase() == "salak") {
        salak += element.jumlah;
      } else if (element.nama.toLowerCase() == "gula") {
        gula += element.jumlah;
      } else if (element.nama.toLowerCase() == "kopi") {
        kopi += element.jumlah;
      }
    });
    // calc salak
    if (salak > 0 && gula > 0) {
      let tempSalak = Math.round(salak / 250);
      let tempGula = Math.round(gula / 6);
      let kualitas;
      if (weathers.length == 0) kualitas = "Tidak tersedia";
      else
        kualitas =
          weathers.filter((x) => x == 1).length >= 10 ? "Cukup" : "Baik";

      // tanggal
      let _date;
      if (weathers.length != 0) {
        _date = new Date(document.getElementById("tanggal").value);
        let _arr = [];
        weathers.map((d) => {
          if (d == 0) _arr.push(30 / 21);
          else _arr.push(1);
        });
        _arr = Math.round(_arr.reduce((a, b) => a + b, 0));
        _date.setDate(_date.getDate() + _arr);
        _date.setDate(_date.getDate() + 6);
        _date = _date.toISOString().split("T")[0];
      } else {
        _date = "Tidak tersedia";
      }
      //kelebihan gula
      if (tempSalak - tempGula < 0) {
        setPrediksiKurma([
          {
            nama: "Kurma Salak",
            jumlah: tempGula,
            kualitas: kualitas,
            tanggal: _date,
            pesan:
              "Kelebihan gula sebanyak " + (gula / 6 - salak / 250) * 6 + " gr",
          },
        ]);
      } // kelebihan salak
      else if (tempGula - tempSalak < 0) {
        setPrediksiKurma([
          {
            nama: "Kurma Salak",
            jumlah: tempGula,
            kualitas: kualitas,
            tanggal: _date,
            pesan:
              "Kelebihan salak sebanyak " +
              (salak / 250 - gula / 6) * 250 +
              " gr",
          },
        ]);
      } else {
        setPrediksiKurma([
          {
            nama: "Kurma Salak",
            jumlah: tempGula,
            kualitas: kualitas,
            tanggal: _date,
            pesan: "-",
          },
        ]);
      }
      // get max
    } else {
      setPrediksiKurma([]);
    }
    // calc kopi
    if (kopi > 0) {
      let kualitas;
      if (weathers.length == 0) kualitas = "Tidak tersedia";
      else
        kualitas =
          weathers.filter((x) => x == 1).length >= 10 ? "Cukup" : "Baik";
      // tanggal
      let _date;
      if (weathers.length != 0) {
        _date = new Date(document.getElementById("tanggal").value);
        let _arr = [];
        weathers.map((d) => {
          if (d == 0) _arr.push(40 / 30);
          else _arr.push(1);
        });
        _arr = Math.round(_arr.reduce((a, b) => a + b, 0));
        _date.setDate(_date.getDate() + _arr);
        _date.setDate(_date.getDate() + 15);
        _date = _date.toISOString().split("T")[0];
      } else {
        _date = "Tidak tersedia";
      }

      setPrediksiKopi([
        {
          nama: "Kopi",
          jumlah: Math.round(kopi / 250),
          kualitas: kualitas,
          tanggal: _date,
          pesan:
            kopi % 250 != 0
              ? "Kelebihan kopi sebanyak " + (kopi % 250) + " gr"
              : "",
        },
      ]);
    } else {
      setPrediksiKopi([]);
    }
  }

  // form handler
  // edit
  function editHandler(event, data) {
    event.preventDefault();
    setIsEditing(true);
    document.getElementById("modal-produk").classList.add("uk-open");
    document
      .getElementById("modal-produk")
      .childNodes[0].classList.add("uk-animation-slide-top");
    document.getElementById("modal-produk").style.display = "block";

    setFormProduk(data);
  }
  function editBatal(event) {
    event.preventDefault();
    setIsEditing(false);
    UIkit.modal(document.getElementById("modal-produk")).hide();
  }
  async function editSimpan(event) {
    event.preventDefault();

    if (
      formProduk.nama == null ||
      formProduk.jumlah == null ||
      util.isEmptyOrSpaces(formProduk.nama) ||
      parseInt(formProduk.jumlah) <= 0
    ) {
      UIkit.notification({
        message: "Data tidak valid",
        pos: "bottom-center",
        status: "danger",
      });
      return;
    }
    let _tempWaktu = new Date(formProduk.waktu);
    _tempWaktu.setHours(_tempWaktu.getHours() + 7);
    const res = await fetch("../api/bahan_baku/update", {
      body: JSON.stringify({
        id: formProduk.id,
        data: {
          nama: formProduk.nama,
          jumlah: formProduk.jumlah,
          waktu: formatDateToServer(_tempWaktu.toISOString()),
          user: user.id,
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const result = await res.json();
    if (result.error) {
      UIkit.notification({
        message: result.message,
        pos: "bottom-center",
        status: "danger",
      });
    } else {
      setIsEditing(false);
      getProduk(document.getElementById("tanggal").value);
      UIkit.modal(document.getElementById("modal-produk")).hide();
      UIkit.notification({
        message: "Data berhasil diubah.",
        pos: "bottom-center",
        status: "success",
      });
    }
  }

  // add
  function addHandler(event) {
    event.preventDefault();
    setIsAdding(true);
    setFormProduk({
      waktu: getDateTime(),
    });
    document.getElementById("modal-produk").classList.add("uk-open");
    document
      .getElementById("modal-produk")
      .childNodes[0].classList.add("uk-animation-slide-top");
    document.getElementById("modal-produk").style.display = "block";
  }
  function addBatal(event) {
    event.preventDefault();
    setIsAdding(false);
    UIkit.modal(document.getElementById("modal-produk")).hide();
  }
  async function addSimpan(event) {
    event.preventDefault();

    if (
      formProduk.nama == null ||
      formProduk.jumlah == null ||
      util.isEmptyOrSpaces(formProduk.nama) ||
      parseInt(formProduk.jumlah) <= 0
    ) {
      UIkit.notification({
        message: "Data tidak valid",
        pos: "bottom-center",
        status: "danger",
      });
      return;
    }

    const res = await fetch("../api/bahan_baku/insert", {
      body: JSON.stringify({
        data: {
          nama: formProduk.nama,
          jumlah: formProduk.jumlah,
          user: user.id,
          waktu: formatDateToServer(formProduk.waktu),
        },
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const result = await res.json();
    if (result.error) {
      UIkit.notification({
        message: result.message,
        pos: "bottom-center",
        status: "danger",
      });
    } else {
      setIsAdding(false);
      getProduk(document.getElementById("tanggal").value);
      UIkit.modal(document.getElementById("modal-produk")).hide();
      UIkit.notification({
        message: "Data berhasil ditambahkan.",
        pos: "bottom-center",
        status: "success",
      });
    }
  }

  // delete
  async function deleteHandler(event, data) {
    UIkit.modal
      .confirm(`Apakah anda ingin menghapus ${data.nama} x ${data.jumlah} ?`)
      .then(
        async function () {
          const res = await fetch("../api/bahan_baku/delete", {
            body: JSON.stringify({
              id: data.id,
            }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          });
          const result = await res.json();
          if (result.error) {
            UIkit.notification({
              message: result.message,
              pos: "bottom-center",
              status: "danger",
            });
          } else {
            setIsAdding(false);
            getProduk(document.getElementById("tanggal").value);
            UIkit.modal(document.getElementById("modal-produk")).hide();
            UIkit.notification({
              message: "Data berhasil dihapus.",
              pos: "bottom-center",
              status: "success",
            });
          }
        },
        function () {}
      );
  }

  // search
  function search(value) {
    let table = document.getElementById("table");
    let tr = table.getElementsByTagName("tr");
    for (let i = 0; i < tr.length; i++) {
      const td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        let d = td.textContent || td.innerText;
        if (d.toLowerCase().indexOf(value.toLowerCase()) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }

  // riwayat
  async function getRiwayat(_date) {
    let p = await fetch("api/bahan_baku/riwayat?date=" + _date);
    const res = await p.json();
    console.log(res);
    res.data?.reverse();
    UIkit.modal(document.getElementById("modal-overflow")).show();
    setRiwayatProduk(res.data);
  }

  return (
    <div>
      <HomePage_Navbar name={user.name} admin={user.admin}></HomePage_Navbar>
      <div className="uk-cover-container uk-margin-large-left uk-margin-large-right uk-margin-large-top">
        <div className="uk-background-secondary uk-light uk-padding uk-panel uk-width-1-2 uk-border-rounded">
          <p className="uk-h2">Data Bahan Baku</p>
        </div>
        <div
          uk-grid="true"
          className="uk-margin-top uk-margin-top uk-grid uk-grid-stack"
        >
          <div className="uk-width-expand">
            <div className="uk-inline uk-width-1-1">
              <span className="uk-form-icon" uk-icon="icon: search"></span>
              <input
                className="uk-input"
                id="search"
                name="search"
                type="text"
                maxLength="50"
                placeholder="Cari..."
                onChange={(e) => search(e.target.value)}
              />
            </div>
          </div>
          <div className="uk-width-auto">
            <button
              className="uk-button uk-button-primary uk-border-rounded"
              type="button"
              onClick={(e) =>
                getRiwayat(document.getElementById("tanggal").value)
              }
            >
              Riwayat
            </button>
          </div>
          <div className="uk-width-1-5">
            <input
              className="uk-input"
              id="tanggal"
              name="tanggal"
              type="date"
              defaultValue={util.formatDateClient(util.getDate())}
              onChange={(e) => getProduk(e.target.value)}
              max={util.formatDateClient(util.getDate())}
            />
          </div>
        </div>
        <div className="uk-background-muted uk-padding uk-panel uk-margin-top uk-border-rounded">
          <table
            className="uk-table uk-table-middle uk-table-divider"
            id="table"
          >
            <thead>
              <tr>
                <th className="uk-width-small">Nama</th>
                <th className="uk-table-shrink">Jumlah</th>
                <th className="uk-table-medium">Waktu Ditambahkan</th>
                <th className="uk-table-expand">Ditambahkan Oleh</th>
                <th className="uk-width-medium"></th>
              </tr>
            </thead>
            <tbody>
              {produk?.map((d) => {
                return (
                  <tr key={d.id}>
                    <td>{d.nama}</td>
                    <td>{d.jumlah + " gr"}</td>
                    <td>{new Date(d.waktu).toTimeString().split(" ")[0]}</td>
                    <td>{d.user}</td>
                    <td>
                      <button
                        className="uk-button uk-button-default uk-margin-small-right uk-icon"
                        type="button"
                        onClick={(e) => editHandler(e, d)}
                      >
                        Edit
                      </button>

                      <button
                        className="uk-button uk-button-danger"
                        type="button"
                        onClick={(e) => deleteHandler(e, d)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="uk-background-muted uk-padding uk-panel uk-margin-top uk-border-rounded">
          <table
            className="uk-table uk-table-middle uk-table-divider"
            id="table"
          >
            <thead>
              <tr>
                <th className="uk-width-small">Nama Produk</th>
                <th className="uk-table-small">Prediksi Jumlah</th>
                <th className="uk-table-small">Prediksi Kualitas</th>
                <th className="uk-table-small">Prediksi Selesai</th>
                <th className="uk-table-expand">Pesan</th>
              </tr>
            </thead>
            <tbody>
              {prediksiKurma?.map((d) => {
                return (
                  <tr key={d.nama}>
                    <td>{d.nama}</td>
                    <td>{d.jumlah + " kotak"}</td>
                    <td>{d.kualitas}</td>
                    <td>{d.tanggal}</td>
                    <td>{d.pesan}</td>
                  </tr>
                );
              })}
              {prediksiKopi?.map((d) => {
                return (
                  <tr key={d.nama}>
                    <td>{d.nama}</td>
                    <td>{d.jumlah + " kotak"}</td>
                    <td>{d.kualitas}</td>
                    <td>{d.tanggal}</td>
                    <td>{d.pesan}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="uk-text-center uk-margin-top">
          <button
            className="uk-button uk-button-primary uk-border-rounded"
            type="button"
            onClick={addHandler}
          >
            Masukkan Data Bahan Baku Baru
          </button>
        </div>
      </div>
      <div id="modal-produk" style={{ display: "none" }} className="uk-modal">
        <div className="uk-modal-dialog uk-modal-body">
          <h2 className="uk-modal-title">
            {isEditing
              ? "Edit Bahan Baku"
              : isAdding
              ? "Tambah Bahan Baku"
              : ""}
          </h2>
          <form className="uk-form-stacked">
            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="nama">
                Nama Bahan Baku
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-input"
                  id="nama"
                  name="nama"
                  type="text"
                  maxLength="20"
                  value={formProduk.nama ?? ""}
                  onChange={(e) =>
                    setFormProduk({ ...formProduk, nama: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="jumlah">
                Jumlah
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-input"
                  id="jumlah"
                  name="jumlah"
                  type="text"
                  onInput={(e) => inputNumberOnly(e)}
                  maxLength="5"
                  value={formProduk.jumlah ?? ""}
                  onChange={(e) =>
                    setFormProduk({ ...formProduk, jumlah: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="waktu">
                Waktu &amp; Tanggal
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-input"
                  id="waktu"
                  name="waktu"
                  type="datetime-local"
                  value={
                    formProduk.waktu ? formatDateToClient(formProduk.waktu) : ""
                  }
                  onChange={(e) =>
                    setFormProduk({
                      ...formProduk,
                      waktu: e.target.value,
                    })
                  }
                  max={formatDateToClient(new Date())}
                />
              </div>
            </div>

            <p className="uk-text-right">
              <button
                className="uk-button uk-button-default"
                type="button"
                onClick={(e) => {
                  isEditing ? editBatal(e) : isAdding ? addBatal(e) : null;
                }}
              >
                Batal
              </button>
              <button
                className="uk-button uk-button-primary"
                type="button"
                onClick={(e) =>
                  isEditing ? editSimpan(e) : isAdding ? addSimpan(e) : null
                }
              >
                Simpan
              </button>
            </p>
          </form>
        </div>
      </div>
      <div id="modal-overflow" style={{ display: "none" }} uk-modal="true">
        <div
          className="uk-modal-dialog uk-modal-body uk-width-1-1"
          uk-overflow-auto="true"
        >
          <h2 className="uk-modal-title">Riwayat Bahan Baku</h2>
          <hr></hr>
          <table
            className="uk-table uk-table-middle uk-table-divider"
            id="table"
          >
            <thead>
              <tr>
                <th className="uk-width-small">Aksi</th>
                <th className="uk-width-small uk-text-danger">Nama</th>
                <th className="uk-width-small uk-text-success">Nama</th>
                <th className="uk-table-shrink uk-text-danger">Jumlah</th>
                <th className="uk-table-shrink uk-text-success">Jumlah</th>
                <th className="uk-table-medium uk-text-danger">Tanggal</th>
                <th className="uk-table-medium uk-text-success">Tanggal</th>
                <th className="uk-table-medium">Waktu</th>
                <th className="uk-table-expand">User</th>
              </tr>
            </thead>
            <tbody>
              {riwayatProduk?.map((d) => {
                return (
                  <tr key={d.id}>
                    <td
                      className={
                        d.aksi.toUpperCase() == "UPDATE"
                          ? "uk-text-primary"
                          : d.aksi.toUpperCase() == "TAMBAH"
                          ? "uk-text-success"
                          : "uk-text-danger"
                      }
                    >
                      {d.aksi.toUpperCase()}
                    </td>
                    <td>{d.nama_lama}</td>
                    <td>{d.nama_baru}</td>
                    <td>{d.jumlah_lama}</td>
                    <td>{d.jumlah_baru}</td>
                    <td>
                      {d.waktu_lama == null
                        ? ""
                        : new Date(d.waktu_lama)
                            .toISOString()
                            .replace("T", " ")
                            .replace(".000Z", "")}
                    </td>
                    <td>
                      {new Date(d.waktu_baru)
                        .toISOString()
                        .replace("T", " ")
                        .replace(".000Z", "")}
                    </td>
                    <td>
                      {new Date(d.waktu)
                        .toISOString()
                        .replace("T", " ")
                        .replace(".000Z", "")}
                    </td>
                    <td>{d.user}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <p className="uk-text-right">
            <button
              className="uk-button uk-button-default uk-modal-close"
              type="button"
            >
              Tutup
            </button>
          </p>
        </div>
      </div>
      <Head>
        <title>UD Salacca</title>
        <meta name="description" content="Website Profil untuk UD Salacca" />
        <link rel="icon" href="/icon.png" />
      </Head>
    </div>
  );
}

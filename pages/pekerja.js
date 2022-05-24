import Head from "next/head";
import HomePage_Navbar from "../components/homepage/Navbar";
import util from "../lib/util";
import UIkit from "uikit";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { withIronSessionSsr } from "iron-session/next";
import { ironSessionConfig } from "../next.config";
import checkSession from "../lib/check_session";
import checkJamKerja from "../lib/check_jam_kerja";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    let tokenValid = null;
    tokenValid = await checkSession(req.session.user);
    return {
      props: {
        user: req.session.user ?? null,
        tokenValid: tokenValid,
        isJamKerja: checkJamKerja(),
      },
    };
  },
  ironSessionConfig
);

export default function BahanBakuPage({ user, tokenValid, isJamKerja }) {
  const router = useRouter();
  const [init, setInit] = useState(false);
  const [dataProfilPekerja, setDataProfilPekerja] = useState([]);
  const [formDataProfilPekerja, setFormDataProfilPekerja] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  // let dataProfilPekerja = [];
  // let formDataProfilPekerja = [];

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
    if (user.admin) {
      setIsAdmin(true);
    }
    if (!isJamKerja) {
      UIkit.modal
        .alert("Mohon maaf sistem hanya dapat diakses pada pukul 09.00 - 17.00")
        .then(function () {
          router.push("/api/logout");
        });
    }
    if (tokenValid == false) {
      UIkit.modal
        .alert("Anda akan logout karena terdapat device lain.")
        .then(function () {
          router.push("/api/logout");
        });
    }
    if (!init) {
      setInit(true);
      c_ProfilPekerja.showDataProfilPekerja();
    }
  });

  const v_ProfilPekerja = {
    setDataProfilPekerja: async () => {
      let pekerja = await c_ProfilPekerja.getDataProfilPekerja();
      setDataProfilPekerja(pekerja.data);
      // dataProfilPekerja = pekerja;
    },
    showDataProfilPekerja: () => {
      if (dataProfilPekerja) {
        dataProfilPekerja.forEach((d) => {
          document.getElementById("datatable").insertAdjacentHTML(
            "beforeend",
            `
                <tr key=${d.id_user}>
                    <td>${d.nama}</td>
                    <td>${d.nomor_hp}</td>
                    <td>${d.email}</td>
                    <td>${d.alamat}</td>
                    <td>
                      <button
                        class="uk-button uk-button-default uk-margin-small-right uk-icon"
                        type="button"
                      >
                        Edit
                      </button>

                      <button
                        class="uk-button uk-button-danger"
                        type="button"
                      >
                        Hapus
                      </button>
                    </td>
                </tr>`
          );
        });
      }
    },
    showFormDataProfilPekerja: () => {},
  };
  const c_ProfilPekerja = {
    // not sequence
    search: (value) => {
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
    },
    // form
    inputNumberOnly: (event) => {
      event.target.value = event.target.value
        .replace(/[^0-9.]/g, "")
        .replace(/(\..*?)\..*/g, "$1");
    },
    // sequence
    getDataProfilPekerja: async () => {
      return await m_users.getDataProfilPekerja();
    },
    setDataProfilPekerja: async () => {
      let pekerja = await c_ProfilPekerja.getDataProfilPekerja();
      setDataProfilPekerja(pekerja.data);
      document.getElementById("datatable").innerHTML = "";
      pekerja.data.forEach((d) => {
        document.getElementById("datatable").insertAdjacentHTML(
          "beforeend",
          `
                <tr key=${d.id_user}>
                    <td>${d.nama}</td>
                    <td>${d.nomor_hp}</td>
                    <td>${d.email}</td>
                    <td>${d.alamat}</td>
                    <td>
                      <button
                        class="uk-button uk-button-default uk-margin-small-right uk-icon"
                        type="button"
                      >
                        Edit
                      </button>

                      <button
                        class="uk-button uk-button-danger"
                        type="button"
                      >
                        Hapus
                      </button>
                    </td>
                </tr>`
        );
      });
    },
    showDataProfilPekerja: async () => {
      let pekerja = await c_ProfilPekerja.getDataProfilPekerja();
      setDataProfilPekerja(pekerja.data);
      // document.getElementById("datatable").innerHTML = "";
      // pekerja.data.forEach((d) => {
      //   document.getElementById("datatable").insertAdjacentHTML(
      //     "beforeend",
      //     `
      //           <tr key=${d.id_user}>
      //               <td>${d.nama}</td>
      //               <td>${d.nomor_hp}</td>
      //               <td>${d.email}</td>
      //               <td>${d.alamat}</td>
      //               <td>
      //                 <button
      //                   class="uk-button uk-button-default uk-margin-small-right uk-icon"
      //                   type="button"
      //                 >
      //                   Edit
      //                 </button>

      //                 <button
      //                   class="uk-button uk-button-danger"
      //                   type="button"
      //                   onclick="(e) => {

      //                   }"
      //                 >
      //                   Hapus
      //                 </button>
      //               </td>
      //           </tr>`
      //   );
      // });
    },
    getFormDataProfilPekerja: async (e, d = null) => {
      e.preventDefault();
      if (d) {
        let pekerja = dataProfilPekerja.filter((element) => {
          return element["id_user"] == d;
        });
        return pekerja[0];
        // formDataProfilPekerja = pekerja;
      }
    },
    setFormDataProfilPekerja: (pekerja) => {
      setFormDataProfilPekerja(pekerja);

      // const formField = ["nama", "nomor_hp", "email", "alamat", "password"];
      // console.log(formDataProfilPekerja);
      // formField.forEach((field) => {
      //   document.getElementById(`${field}`).innerText =
      //     formDataProfilPekerja ? formDataProfilPekerja[field] : "";
      // });

      // c_ProfilPekerja.showDataProfilPekerja();
    },
    showFormDataProfilPekerja: () => {
      document.getElementById("modal-form").classList.add("uk-open");
      document
        .getElementById("modal-form")
        .childNodes[0].classList.add("uk-animation-slide-top");
      document.getElementById("modal-form").style.display = "block";
    },
    DataProfilPekerja: () => {},
    showPopUp: (message) => {
      UIkit.modal.alert(message);
    },
    cekDataNull: (e) => {
      e.preventDefault();
      const formField = ["nama", "nomor_hp", "email", "alamat", "password"];
      formField.forEach((field) => {
        if (
          dataProfilPekerja[field] == "" ||
          dataProfilPekerja[field] == null
        ) {
          if (!(field == "password" && isEditing)) return false;
        }
      });
      return true;
    },
  };
  const m_users = {
    getDataProfilPekerja: async () => {
      let pekerja = await fetch("api/account");
      pekerja = await pekerja.json();
      pekerja.data = pekerja.data.filter((element) => {
        return element["role"] == "Pekerja";
      });
      return pekerja;
    },
    DataProfilPekerja: async () => {
      let url = "../api/account/" + (isEditing ? "update" : "insert");
      const res = await fetch(url, {
        body: JSON.stringify({
          id: formDataProfilPekerja.id_user,
          data: formDataProfilPekerja,
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
        setInit(false);
        UIkit.modal(document.getElementById("modal-form")).hide();
        UIkit.notification({
          message: isEditing
            ? "Data berhasil diubah."
            : "Data profil pekerja berhasil dimasukkan",
          pos: "bottom-center",
          status: "success",
        });
      }
    },
    hapusDataProfil: async (id) => {
      let url = "../api/account/delete";
      const res = await fetch(url, {
        body: JSON.stringify({
          id: id,
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
        setInit(false);
        UIkit.modal(document.getElementById("modal-form")).hide();
        UIkit.notification({
          message: "Data profil pekerja berhasil dihapus",
          pos: "bottom-center",
          status: "success",
        });
      }
    },
  };

  return (
    <div>
      <HomePage_Navbar name={user.name} admin={user.admin}></HomePage_Navbar>
      <div className="uk-cover-container uk-margin-large-left uk-margin-large-right uk-margin-large-top">
        <div className="uk-background-secondary uk-light uk-padding uk-panel uk-width-1-2 uk-border-rounded">
          <p className="uk-h2">Data Akun Pekerja</p>
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
                onChange={(e) => c_ProfilPekerja.search(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="uk-background-muted uk-padding uk-panel uk-margin-top uk-border-rounded">
          <table
            className="uk-table uk-table-middle uk-table-divider"
            id="table"
          >
            <thead>
              <tr>
                <th className="uk-width-medium">Nama</th>
                <th className="uk-table-medium">Nomor HP</th>
                <th className="uk-table-medium">Email</th>
                <th className="uk-table-expand">Alamat</th>
                <th className="uk-width-medium"></th>
              </tr>
            </thead>
            <tbody id="datatable">
              {dataProfilPekerja?.map((d) => {
                return (
                  <tr key={d.id_user}>
                    <td>{d.nama}</td>
                    <td>{d.nomor_hp}</td>
                    <td>{d.email}</td>
                    <td>{d.alamat}</td>
                    <td>
                      {isAdmin ? (
                        <>
                          <button
                            className="uk-button uk-button-default uk-margin-small-right uk-icon"
                            type="button"
                            onClick={async (e) => {
                              setIsEditing(true);
                              let pekerja =
                                await c_ProfilPekerja.getFormDataProfilPekerja(
                                  e,
                                  d.id_user
                                );
                              c_ProfilPekerja.setFormDataProfilPekerja(pekerja);
                              c_ProfilPekerja.showFormDataProfilPekerja();
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="uk-button uk-button-danger"
                            type="button"
                            onClick={async (e) => {
                              let pekerja =
                                await c_ProfilPekerja.getFormDataProfilPekerja(
                                  e,
                                  d.id_user
                                );
                              c_ProfilPekerja.setFormDataProfilPekerja(pekerja);
                              UIkit.modal
                                .confirm(
                                  `Apakah anda ingin menghapus pekerja ${d.nama} ?`
                                )
                                .then(
                                  () => {
                                    m_users.hapusDataProfil(d.id_user);
                                  },
                                  () => {}
                                );
                            }}
                          >
                            Hapus
                          </button>
                        </>
                      ) : (
                        <></>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isAdmin ? (
          <div className="uk-text-center uk-margin-top">
            <button
              className="uk-button uk-button-primary uk-border-rounded"
              type="button"
              onClick={(e) => {
                setIsEditing(false);
                c_ProfilPekerja.getFormDataProfilPekerja(e);
                c_ProfilPekerja.setFormDataProfilPekerja({});
                c_ProfilPekerja.showFormDataProfilPekerja();
              }}
            >
              Masukkan Data Profil Akun Pekerja
            </button>
          </div>
        ) : (
          <></>
        )}
      </div>
      <div id="modal-form" style={{ display: "none" }} className="uk-modal">
        <div className="uk-modal-dialog uk-modal-body">
          <h2 className="uk-modal-title">
            {isEditing ? "Ubah" : "Tambah"} Data Pekerja
          </h2>
          <form className="uk-form-stacked">
            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="nama">
                Nama
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-input"
                  id="nama"
                  name="nama"
                  type="text"
                  maxLength="50"
                  value={formDataProfilPekerja?.nama ?? ""}
                  onChange={(e) =>
                    setFormDataProfilPekerja({
                      ...formDataProfilPekerja,
                      nama: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="nama">
                Nomor HP
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-input"
                  id="nomor_hp"
                  name="nomor_hp"
                  type="text"
                  maxLength="12"
                  value={formDataProfilPekerja?.nomor_hp ?? ""}
                  onChange={(e) => {
                    c_ProfilPekerja.inputNumberOnly(e);
                    setFormDataProfilPekerja({
                      ...formDataProfilPekerja,
                      nomor_hp: e.target.value,
                    });
                  }}
                />
              </div>
            </div>

            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="nama">
                Email
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-input"
                  id="email"
                  name="email"
                  type="text"
                  maxLength="30"
                  value={formDataProfilPekerja?.email ?? ""}
                  onChange={(e) =>
                    setFormDataProfilPekerja({
                      ...formDataProfilPekerja,
                      email: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="nama">
                Alamat
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-input"
                  id="alamat"
                  name="alamat"
                  type="text"
                  maxLength="50"
                  value={formDataProfilPekerja?.alamat ?? ""}
                  onChange={(e) =>
                    setFormDataProfilPekerja({
                      ...formDataProfilPekerja,
                      alamat: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="nama">
                Password
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-input"
                  id="password"
                  name="password"
                  type="password"
                  placeholder={isEditing ? "Biarkan kosong untuk tetap" : ""}
                  maxLength="50"
                  onChange={(e) =>
                    setFormDataProfilPekerja({
                      ...formDataProfilPekerja,
                      password: util.hash(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <p className="uk-text-right">
              <button
                className="uk-button uk-button-default"
                type="button"
                onClick={(e) =>
                  UIkit.modal(document.getElementById("modal-form")).hide()
                }
              >
                Batal
              </button>
              <button
                className="uk-button uk-button-primary"
                type="button"
                onClick={(e) => {
                  let dataValid = c_ProfilPekerja.cekDataNull(e);
                  if (!dataValid) {
                    c_ProfilPekerja.showPopUp(
                      "Data pekerja yang anda masukkan belum lengkap, harap isi kembali"
                    );
                  } else {
                    if (isEditing) {
                      m_users.DataProfilPekerja();
                    } else {
                      m_users.DataProfilPekerja();
                    }
                  }
                }}
              >
                Simpan
              </button>
            </p>
          </form>
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

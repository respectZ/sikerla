import Head from "next/head";
import HomePage_Navbar from "../../../components/homepage/Navbar";
import Navbar from "../../../components/Navbar";
import ImageContainer from "../../../components/ImageContainer";

import util from "../../../lib/util";
import UIkit from "uikit";

import { useState, useEffect } from "react";
import useSWR from "swr";

import { withIronSessionSsr } from "iron-session/next";
import { ironSessionConfig } from "../../../next.config";
import checkSession from "../../../lib/check_session";
import checkJamKerja from "../../../lib/check_jam_kerja";

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

export default function ProfilPerusahaan({ user, tokenValid, isJamKerja }) {
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const [isAuthorized, setAuthorized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [perusahaan, setPerusahaan] = useState({});

  let { data: data } = useSWR("../api/perusahaan", fetcher);

  useEffect(() => {
    if (user) setAuthorized(true);
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

    if (perusahaan == undefined) return;
    if (!Object.keys(perusahaan).length) {
      if (data?.data != undefined) setPerusahaan(data?.data);
    }
  });

  // functions
  function inputNumberOnly(event) {
    event.target.value = event.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*?)\..*/g, "$1");
  }

  function handleEdit(event) {
    event.preventDefault();
    setIsEditing(true);
  }
  function handleBatal(event) {
    event.preventDefault();
    setIsEditing(false);
    setPerusahaan({});
  }
  async function handleSimpan(event) {
    event.preventDefault();
    setIsEditing(false);
    if (
      !util.validateEmail(event.target.email.value) ||
      util.isEmptyOrSpaces(event.target.email.value) ||
      util.isEmptyOrSpaces(event.target.deskripsi.value) ||
      util.isEmptyOrSpaces(event.target.alamat.value) ||
      util.isEmptyOrSpaces(event.target.nomor_hp.value)
    ) {
      UIkit.notification({
        message: "Data anda belum lengkap. Harap isi kembali",
        pos: "bottom-center",
        status: "danger",
      });
      setPerusahaan({});
      return;
    }

    const res = await fetch("../api/perusahaan/update", {
      body: JSON.stringify({
        nomor_hp: perusahaan.nomor_hp,
        data: {
          deskripsi: event.target.deskripsi.value,
          email: event.target.email.value,
          nomor_hp: event.target.nomor_hp.value,
          alamat: event.target.alamat.value,
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
      UIkit.notification({
        message: "Data berhasil diubah.",
        pos: "bottom-center",
        status: "success",
      });
    }
  }

  return (
    <div>
      {isAuthorized ? (
        <HomePage_Navbar name={user.name} admin={user.admin}></HomePage_Navbar>
      ) : (
        <>
          <Navbar></Navbar>
        </>
      )}

      <div
        className="uk-cover-container uk-height-viewport"
        style={{
          background: `url("https://picsum.photos/2160/1440")`,
        }}
      >
        <div className="uk-cover-container uk-margin-large-left uk-margin-large-right uk-margin-large-top">
          <div className="uk-background-secondary uk-light uk-padding uk-panel uk-width-1-2 uk-margin-large-top uk-border-rounded">
            <p className="uk-h2">Profil UD Salacca</p>
          </div>
          <div className="uk-background-muted uk-panel uk-margin-large-top"></div>
          <form className="uk-form-stacked" onSubmit={handleSimpan}>
            <div className="uk-margin uk-background-muted uk-padding uk-border-rounded">
              <h1 className="uk-h1">UD Salacca</h1>
              <div className="uk-margin uk-background-muted">
                <div className="uk-form-controls">
                  <h4
                    className="uk-h4"
                    style={{
                      display: !isEditing ? "block" : "none",
                    }}
                  >
                    {perusahaan?.deskripsi}
                  </h4>
                </div>
              </div>

              <div className="uk-margin uk-background-muted">
                <textarea
                  className="uk-textarea uk-width-1-1"
                  value={perusahaan?.deskripsi ?? ""}
                  id="deskripsi"
                  name="deskripsi"
                  onChange={(e) =>
                    setPerusahaan({ ...perusahaan, deskripsi: e.target.value })
                  }
                  style={{
                    display: isEditing ? "block" : "none",
                  }}
                ></textarea>
              </div>

              <div className="uk-margin uk-background-muted">
                <label className="uk-h4" htmlFor="alamat">
                  Alamat
                </label>
                <div className="uk-form-controls">
                  <input
                    className="uk-input"
                    id="alamat"
                    name="alamat"
                    type="text"
                    disabled={!isEditing}
                    value={perusahaan?.alamat ?? ""}
                    onChange={(e) =>
                      setPerusahaan({
                        ...perusahaan,
                        alamat: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="uk-margin uk-background-muted">
                <label className="uk-h4" htmlFor="nomor_hp">
                  Nomor HP
                </label>
                <div className="uk-form-controls">
                  <input
                    className="uk-input"
                    id="nomor_hp"
                    name="nomor_hp"
                    type="text"
                    onInput={(e) => inputNumberOnly(e)}
                    maxLength={13}
                    disabled={!isEditing}
                    value={perusahaan?.nomor_hp ?? ""}
                    onChange={(e) =>
                      setPerusahaan({
                        ...perusahaan,
                        nomor_hp: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="uk-margin uk-background-muted">
                <label className="uk-h4" htmlFor="email">
                  Email
                </label>
                <div className="uk-form-controls">
                  <input
                    className="uk-input"
                    id="email"
                    name="email"
                    type="text"
                    disabled={!isEditing}
                    value={perusahaan?.email ?? ""}
                    onChange={(e) =>
                      setPerusahaan({
                        ...perusahaan,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              {isAuthorized && !isEditing ? (
                <div className="uk-text-right">
                  <button
                    className="uk-button uk-button-primary uk-border-rounded"
                    onClick={handleEdit}
                  >
                    Edit
                  </button>
                </div>
              ) : (
                <></>
              )}
              {isAuthorized && isEditing ? (
                <div className="uk-text-right">
                  <button className="uk-button uk-button-primary">
                    Simpan
                  </button>
                  <button
                    className="uk-button uk-button-danger"
                    onClick={handleBatal}
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <></>
              )}
            </div>
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

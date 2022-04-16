import Head from "next/head";
import HomePage_Navbar from "../../../components/homepage/Navbar";
import util from "../../../lib/util";
import UIkit from "uikit";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";

import { withIronSessionSsr } from "iron-session/next";
import { ironSessionConfig } from "../../../next.config";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    return {
      props: {
        user: req.session.user ?? null,
      },
    };
  },
  ironSessionConfig
);

export default function ProfilPemilik({ user }) {
  const router = useRouter();
  const fetcher = (url) => fetch(url).then((res) => res.json());
  const [owner, setOwner] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  let { data: data } = useSWR("../api/account", fetcher);
  data = data?.data;
  useEffect(() => {
    if (!user || !user.admin) {
      router.push("/");
    }

    if (!Object.keys(owner).length)
      data?.forEach((element) => {
        if (element.role == "Pemilik") {
          setOwner(element);
          console.log(element);
          return;
        }
      });
  });

  function inputNumberOnly(event) {
    event.target.value = event.target.value
      .replace(/[^0-9.]/g, "")
      .replace(/(\..*?)\..*/g, "$1");
  }

  function editHandler(event) {
    event.preventDefault();
    setIsEditing(true);
  }
  function batal(event) {
    event.preventDefault();
    setIsEditing(false);
    setOwner({});
  }
  async function simpan(event) {
    setIsEditing(false);
    event.preventDefault();

    if (
      !util.validateEmail(event.target.email.value) ||
      util.isEmptyOrSpaces(event.target.nama.value) ||
      util.isEmptyOrSpaces(event.target.email.value) ||
      util.isEmptyOrSpaces(event.target.nomor_hp.value) ||
      util.isEmptyOrSpaces(event.target.alamat.value)
    ) {
      UIkit.notification({
        message: "Data anda belum lengkap. Harap isi kembali",
        pos: "bottom-center",
        status: "danger",
      });
      setOwner({});
      return;
    }
    if (!util.isNumeric(event.target.nomor_hp.value)) {
      UIkit.notification({
        message: "Nomor HP tidak valid.",
        pos: "bottom-center",
        status: "danger",
      });
      setOwner({});
      return;
    }

    const res = await fetch("../api/account/update", {
      body: JSON.stringify({
        id: 1,
        data: {
          nama: event.target.nama.value,
          email: event.target.email.value,
          nomor_hp: event.target.nomor_hp.value,
          alamat: event.target.alamat.value,
          password:
            event.target.password.value != null
              ? util.hash(event.target.password.value)
              : owner.password,
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
      setOwner({});
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
      <HomePage_Navbar name={user.name}></HomePage_Navbar>
      <div className="uk-cover-container uk-margin-large-left uk-margin-large-right uk-margin-large-top">
        <div className="uk-background-secondary uk-light uk-padding uk-panel uk-width-1-2">
          <p className="uk-h2">Profil Pemilik</p>
        </div>
        <div className="uk-background-muted uk-padding uk-panel uk-margin-large-top">
          <form className="uk-form-stacked" onSubmit={simpan}>
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
                  disabled={!isEditing}
                  value={owner?.nama ?? ""}
                  onChange={(e) => setOwner({ ...owner, nama: e.target.value })}
                />
              </div>
            </div>

            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="nomor_hp">
                Nomor HP
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-input"
                  id="nomor_hp"
                  name="nomor_hp"
                  maxLength={13}
                  onInput={(e) => inputNumberOnly(e)}
                  disabled={!isEditing}
                  value={owner?.nomor_hp ?? ""}
                  onChange={(e) =>
                    setOwner({ ...owner, nomor_hp: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="email">
                Email
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-input"
                  id="email"
                  name="email"
                  type="text"
                  disabled={!isEditing}
                  value={owner?.email ?? ""}
                  onChange={(e) =>
                    setOwner({ ...owner, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="password">
                Password
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-input"
                  id="password"
                  name="password"
                  type="password"
                  disabled={!isEditing}
                  placeholder="Biarkan kosong bila tidak mengganti password."
                />
              </div>
            </div>

            <div className="uk-margin">
              <label className="uk-form-label" htmlFor="alamat">
                Alamat
              </label>
              <div className="uk-form-controls">
                <input
                  className="uk-input"
                  id="alamat"
                  name="alamat"
                  type="text"
                  disabled={!isEditing}
                  value={owner?.alamat ?? ""}
                  onChange={(e) =>
                    setOwner({ ...owner, alamat: e.target.value })
                  }
                />
              </div>
            </div>
            {!isEditing ? (
              <div className="uk-text-right">
                <button
                  className="uk-button uk-button-primary"
                  onClick={editHandler}
                >
                  Edit Profil
                </button>
              </div>
            ) : (
              <div className="uk-text-right">
                <button className="uk-button uk-button-danger" onClick={batal}>
                  Batal
                </button>
                <button className="uk-button uk-button-primary">Simpan</button>
              </div>
            )}
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

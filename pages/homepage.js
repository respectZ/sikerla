import Head from "next/head";
import HomePage_Navbar from "../components/homepage/Navbar";
import util from "../lib/util";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { withIronSessionSsr } from "iron-session/next";
import { ironSessionConfig } from "../next.config";

import checkSession from "../lib/check_session";
import checkJamKerja from "../lib/check_jam_kerja";
import UIkit from "uikit";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const res = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=1.4352134,99.1803313&days=1&aqi=no&alerts=no`
    );
    // date
    const weatherData = await res.json();
    let tokenValid = null;
    tokenValid = await checkSession(req.session.user);
    return {
      props: {
        user: req.session.user ?? null,
        weatherData: weatherData,
        tokenValid: tokenValid,
        isJamKerja: checkJamKerja(),
      },
    };
  },
  ironSessionConfig
);

export default function HomePage({
  user,
  weatherData,
  tokenValid,
  isJamKerja,
}) {
  const router = useRouter();
  const [bahanBaku, setBahanBaku] = useState(false);
  let initBahanBaku = false;
  useEffect(() => {
    if (!user) {
      router.push("/");
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
    if (!initBahanBaku) {
      initBahanBaku = true;
      const _date = util.formatDateClient(util.getDate());
      let p = fetch("api/bahan_baku?date=" + _date);
      p.then((_) => _.json()).then((d) => {
        if (d.data.length > 0) setBahanBaku(true);
      });
    }
  });

  return (
    <div>
      <HomePage_Navbar name={user.name} admin={user.admin}></HomePage_Navbar>
      <div className="uk-cover-container uk-margin-large-left uk-margin-large-right uk-margin-large-top">
        <div className="uk-background-secondary uk-light uk-padding uk-panel uk-width-1-2 uk-border-rounded">
          <p className="uk-h2">Selamat datang, {user.name}</p>
          <div>
            <img
              src={weatherData.current.condition.icon}
              width="50"
              height="50"
            />
            <span className="uk-text-mi uk-text-lead">{util.getDate()}</span>
          </div>
        </div>
        <div className="uk-background-muted uk-padding uk-panel uk-margin-large-top uk-border-rounded">
          <p className="uk-h4">Rekap Hari ini</p>
          <ul className="uk-list uk-list-large uk-list-divider">
            {bahanBaku ? (
              <li className="uk-text-middle uk-text-success">
                <span
                  className="uk-icon"
                  uk-icon={`icon: check; ratio: 1`}
                ></span>
                Mengisi bahan baku
              </li>
            ) : (
              <li className="uk-text-middle uk-text-danger">
                <span
                  className="uk-icon"
                  uk-icon={`icon: close; ratio: 1`}
                ></span>
                Mengisi bahan baku
              </li>
            )}
          </ul>
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

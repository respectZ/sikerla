import Head from "next/head";
import HomePage_Navbar from "../components/homepage/Navbar";
import util from "../lib/util";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";

import { withIronSessionSsr } from "iron-session/next";
import { ironSessionConfig } from "../next.config";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const res = await fetch(
      `http://api.weatherapi.com/v1/forecast.json?key=${process.env.WEATHER_API_KEY}&q=1.4352134,99.1803313&days=1&aqi=no&alerts=no`
    );
    const weatherData = await res.json();
    return {
      props: {
        user: req.session.user ?? null,
        weatherData: weatherData,
      },
    };
  },
  ironSessionConfig
);

export default function HomePage({ user, weatherData }) {
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
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
          <ul class="uk-list uk-list-large uk-list-divider">
            <li className="uk-text-middle">
              <span
                className="uk-icon"
                uk-icon={`icon: close; ratio: 1`}
              ></span>
              Isi data bahan baku
            </li>
            <li className="uk-text-middle">
              <span
                className="uk-icon"
                uk-icon={`icon: close; ratio: 1`}
              ></span>
              To do
            </li>
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

import Head from "next/head";
import HomePage_Navbar from "../components/homepage/Navbar";

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Line } from "react-chartjs-2";
import util from "../lib/util";

import { withIronSessionSsr } from "iron-session/next";
import { ironSessionConfig } from "../next.config";

import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function generateChartData(weatherData) {
  return {
    labels: Array.from(
      { length: 24 },
      (_, i) => String(i).padStart(2, "0") + ":00"
    ),
    datasets: [
      {
        label: "Perkiraan Cuaca",
        data: weatherData.forecast.forecastday[0].hour.map(
          (value) => value.chance_of_rain
        ),
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        pointStyle: (_) => {
          let p = new Image(64, 64);
          p.src =
            weatherData.forecast.forecastday[0].hour[_.index].condition.icon;
          return p;
        },
        pointRadius: 24,
      },
    ],
  };
}

function generateChartOption(weatherData) {
  return {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (data) => {
            return `Jam ${data[0].label}`;
          },
          label: (data) => {
            return [
              weatherData.forecast.forecastday[0].hour[data.dataIndex].condition
                .text,
              `Presipitasi: ${
                weatherData.forecast.forecastday[0].hour[data.dataIndex]
                  .chance_of_rain
              }%`,
              weatherData.forecast.forecastday[0].hour[data.dataIndex].temp_c +
                "° C",
              `Kelembaban: ${
                weatherData.forecast.forecastday[0].hour[data.dataIndex]
                  .humidity
              }%`,
              `Berawan: ${
                weatherData.forecast.forecastday[0].hour[data.dataIndex].cloud
              }%`,
            ];
          },
        },
      },
    },
  };
}

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

export default function PerkiraanCuaca({ user, weatherData }) {
  const router = useRouter();
  const chartData = generateChartData(weatherData);
  const chartOption = generateChartOption(weatherData);

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  });

  return (
    <div>
      <HomePage_Navbar name={user.name}></HomePage_Navbar>
      <div className="uk-cover-container uk-margin-large-left uk-margin-large-right uk-margin-large-top">
        <div>
          <h1 className="uk-text-lead">Perkiraan Cuaca di Sigumuru</h1>
          <div>
            <img
              src={weatherData.current.condition.icon}
              width="50"
              height="50"
            />
            <span className="uk-text-middle">{util.getDate()}</span>
          </div>
        </div>
        <div>
          <Line data={chartData} options={chartOption} />
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

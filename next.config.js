/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

const ironSessionConfig = {
  cookieName: "sikerla_cookie",
  password: "Zq4t7w!z%C*F)J@NcRfUjXn2r5u8x/A?",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

module.exports = { nextConfig, ironSessionConfig };

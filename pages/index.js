import Head from "next/head";
import ImageContainer from "../components/ImageContainer";
import Navbar from "../components/Navbar";

import { withIronSessionSsr } from "iron-session/next";
import { ironSessionConfig } from "../next.config";

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

export default function Home({ user }) {
  return (
    <div>
      <Navbar auth={user != null ? true : false}></Navbar>
      <div className="uk-cover-container uk-height-viewport">
        <div className="uk-background-fixed uk-background-center-center uk-background-norepeat uk-panel uk-flex uk-flex-center uk-flex-middle">
          <ImageContainer url="https://picsum.photos/2160/1440">
            <div className="uk-container">
              <div>
                <h1
                  style={{
                    color: "white",
                  }}
                >
                  UD Salacca
                </h1>
              </div>

              <div className="uk-text-center">
                <a href="/profil/perusahaan">
                  <button className="uk-button uk-button-primary">
                    Tentang
                  </button>
                </a>
              </div>
            </div>
          </ImageContainer>
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

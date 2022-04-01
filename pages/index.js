import Head from "next/head";
import ImageContainer from "../components/ImageContainer";

export default function Home() {
  return (
    <div>
      <nav
        className="uk-navbar-container uk-navbar"
        style={{
          position: "fixed",
          zIndex: 5,
          width: 100 + "vw",
        }}
      >
        <div className="uk-navbar-left">
          <ul className="uk-navbar-nav">
            <li className="uk-active">
              <a href="#">
                <span className="uk-icon" uk-icon="icon: home"></span>
              </a>
            </li>
            <li>
              <a href="#">Kontak</a>
            </li>
            <li>
              <a href="#">Pesan</a>
            </li>
          </ul>
        </div>
      </nav>

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
                <button className="uk-button uk-button-primary">Tentang</button>
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

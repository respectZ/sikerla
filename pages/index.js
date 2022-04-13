import Head from "next/head";
import ImageContainer from "../components/ImageContainer";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <div>
      <Navbar></Navbar>
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

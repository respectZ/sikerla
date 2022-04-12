import Head from "next/head";
import ImageContainer from "../components/ImageContainer";
import util from "../lib/util";
import { useState } from "react";

export default function Login() {
  const [errMsg, setErrMsg] = useState("");

  const loginHandler = async (event) => {
    event.preventDefault();
    if (!event.target.email.value) {
      setErrMsg("Email harap diisi dengan lengkap.");
      return;
    }
    if (!event.target.password.value) {
      setErrMsg("Password harap diisi.");
    }
    const res = await fetch("api/login", {
      body: JSON.stringify({
        email: event.target.email.value,
        password: util.hash(event.target.password.value),
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const result = await res.json();
    if (result.error) {
      setErrMsg(result.message);
    } else {
      alert(`Selamat datang ${result.data[0]["nama"]}`);
      //   alert(result.data[0]["nama"]);
    }
  };

  return (
    <div>
      <div className="uk-cover-container uk-height-viewport">
        <div className="uk-background-fixed uk-background-center-center uk-background-norepeat uk-panel uk-flex uk-flex-center uk-flex-middle">
          <ImageContainer url="https://picsum.photos/2160/1440">
            <div className="uk-container">
              <div className="uk-card uk-card-default uk-card-body uk-width-1-1">
                <h3 className="uk-card-title">Login</h3>
                <form onSubmit={loginHandler}>
                  <fieldset className="uk-fieldset">
                    <div className="uk-margin">
                      <div className="uk-inline uk-width-1-1">
                        <a className="uk-form-icon" href="#" uk-icon="user"></a>
                        <input
                          className="uk-input"
                          type="text"
                          placeholder="Email"
                          name="email"
                        />
                      </div>
                    </div>

                    <div className="uk-margin">
                      <div className="uk-inline uk-width-1-1">
                        <a className="uk-form-icon" href="#" uk-icon="lock"></a>
                        <input
                          className="uk-input"
                          type="password"
                          placeholder="Password"
                          name="password"
                        />
                      </div>
                    </div>
                    <div className="uk-margin">
                      <p className="uk-text-danger" id="err-msg">
                        {errMsg}
                      </p>
                    </div>
                    <div>
                      <button className="uk-button uk-button-primary">
                        Login
                      </button>
                    </div>
                  </fieldset>
                </form>
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

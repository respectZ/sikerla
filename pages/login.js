import Head from "next/head";
import ImageContainer from "../components/ImageContainer";
import util from "../lib/util";
import { useState, useEffect } from "react";
import { withIronSessionSsr } from "iron-session/next";
import { ironSessionConfig } from "../next.config";
import { useRouter } from "next/router";
import UIkit from "uikit";
import Navbar from "../components/Navbar";

let authorizedG, setAuthorizedG;

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

const c_login = {
  dataLogin: async (email, password) => {
    function cekDataNull(email, password) {
      if (!util.validateEmail(email)) {
        UIkit.modal.alert("Email harap diisi dengan lengkap.");
        return 0;
      }
      if (!password) {
        UIkit.modal.alert("Password harap diisi.");
        return 0;
      }
      return 1;
    }
    if (!cekDataNull(email, password)) return;
    const res = await fetch("api/login", {
      body: JSON.stringify({
        email: email,
        password: util.hash(password),
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
      setAuthorizedG(true);
    }
  },
  getFormLogin: (user) => {
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    if (user && !authorized) setAuthorized(true);

    useEffect(() => {
      authorizedG = authorized;
      setAuthorizedG = setAuthorized;
      if (authorized) {
        router.push("/homepage");
      }
    });
    return (
      <div>
        <Navbar></Navbar>
        <div className="uk-cover-container uk-height-viewport">
          <div className="uk-background-fixed uk-background-center-center uk-background-norepeat uk-panel uk-flex uk-flex-center uk-flex-middle">
            <ImageContainer url="https://picsum.photos/2160/1440">
              <div className="uk-container">
                <div className="uk-card uk-card-default uk-card-body uk-width-1-1 uk-border-rounded">
                  <h3 className="uk-card-title">Login</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      c_login.dataLogin(
                        e.target.email.value,
                        e.target.password.value
                      );
                    }}
                  >
                    <fieldset className="uk-fieldset">
                      <div className="uk-margin">
                        <div className="uk-inline uk-width-1-1">
                          <a
                            className="uk-form-icon uk-icon"
                            href="#"
                            uk-icon="user"
                          ></a>
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
                          <a
                            className="uk-form-icon uk-icon"
                            href="#"
                            uk-icon="lock"
                          ></a>
                          <input
                            className="uk-input"
                            type="password"
                            placeholder="Password"
                            name="password"
                          />
                        </div>
                      </div>
                      <div className="uk-text-center">
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
  },
};

const v_login = {
  showFormLogin: showFormLogin,
};

function showFormLogin({ user }) {
  return c_login.getFormLogin(user);
}

export default v_login.showFormLogin;

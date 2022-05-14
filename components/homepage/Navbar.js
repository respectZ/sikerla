import NavButton from "./NavButton";
import { useRouter } from "next/router";
import UIkit from "uikit";

export default function HomePage_Navbar(props) {
  const router = useRouter();

  function confirmExit() {
    UIkit.modal.confirm("Apakah anda yakin ?").then(
      function () {
        router.push("/api/logout");
      },
      function () {}
    );
  }
  return (
    <div>
      <nav className="uk-navbar-container uk-navbar uk-navbar-transparent uk-background-muted uk-dark">
        <div className="uk-navbar-left">
          <a
            className="uk-navbar-item uk-logo uk-margin-remove uk-padding-remove-right"
            href="#"
            uk-toggle="target: #offcanvas-overlay"
          >
            <span
              className="uk-margin-small-right uk-icon"
              uk-icon="icon: menu"
            ></span>
          </a>
          <a className="uk-navbar-item uk-logo" href="/homepage">
            <img
              className="uk-border-circle"
              width="40"
              height="40"
              src="/icon.png"
            />
            SIKERLA
          </a>
        </div>
      </nav>

      <div id="offcanvas-overlay" uk-offcanvas="overlay: true">
        <div className="uk-offcanvas-bar">
          <ul className="uk-nav uk-nav-default">
            <li className="uk-active">
              <a href="/homepage">
                <span
                  className="uk-margin-small-right uk-icon"
                  uk-icon="icon: home"
                ></span>
                Beranda
              </a>
            </li>
            <li className="uk-active">
              <a href="/perkiraan_cuaca">
                <span
                  className="uk-margin-small-right uk-icon"
                  uk-icon="icon: cloud-upload"
                ></span>
                Perkiraan Cuaca
              </a>
            </li>
            <li className="uk-nav-header">Manajemen Data</li>
            <li className="uk-parent">
              <ul className="uk-nav-sub">
                <li>
                  <a href="/bahan_baku">
                    <span
                      className="uk-margin-small-right uk-icon"
                      uk-icon="icon: paint-bucket"
                    ></span>
                    Bahan Baku
                  </a>
                </li>
                <li>
                  <a href="/produk">
                    <span
                      className="uk-margin-small-right uk-icon"
                      uk-icon="icon: bag"
                    ></span>
                    Produk
                  </a>
                </li>
              </ul>
            </li>
            <li className="uk-nav-header">Manajemen Profil</li>
            <li>
              <a href="/profil/perusahaan">
                <span
                  className="uk-margin-small-right uk-icon"
                  uk-icon="icon: tag"
                ></span>
                Profil Perusahaan
              </a>
            </li>
            {props.admin ? (
              <li>
                <a href="/profil/pemilik">
                  <span
                    className="uk-margin-small-right uk-icon"
                    uk-icon="icon: user"
                  ></span>
                  Akun Pemlik
                </a>
              </li>
            ) : (
              <></>
            )}
            <li>
              <a href="#">
                <span
                  className="uk-margin-small-right uk-icon"
                  uk-icon="icon: users"
                ></span>
                Akun Pekerja
              </a>
            </li>
            <li className="uk-nav-divider"></li>
            <li>
              <a href="#">
                <span
                  className="uk-margin-small-right uk-icon"
                  uk-icon="icon: user"
                ></span>
                Akun Saya
              </a>
            </li>
            <li>
              <a href="#" onClick={confirmExit}>
                <span
                  className="uk-margin-small-right uk-icon"
                  uk-icon="icon: sign-out"
                ></span>
                Keluar
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Navbar(props) {
  return (
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
  );
}

export default Navbar;

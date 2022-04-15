import NavButton from "./NavButton";

export default function HomePage_Navbar(props) {
  return (
    <div>
      <nav className="uk-navbar-container uk-navbar">
        <div className="uk-navbar-left">
          <ul className="uk-navbar-nav">
            <NavButton src="/icon.png" subtitle="" href="/homepage"></NavButton>
          </ul>
        </div>
        <div className="uk-navbar-right">
          <ul className="uk-navbar-nav">
            <NavButton
              icon="home"
              subtitle="Profil Perusahaan"
              href="/profil/perusahaan"
            ></NavButton>
            <NavButton
              icon="users"
              subtitle="Akun Pekerja"
              href="/perkiraan_cuaca"
            ></NavButton>
            <NavButton
              icon="users"
              subtitle="Akun Pemilik"
              href="/profil/pemilik"
            ></NavButton>
            <NavButton
              icon="cloud-upload"
              subtitle="Perkiraan Cuaca"
              href="/perkiraan_cuaca"
            ></NavButton>
          </ul>
        </div>
      </nav>
    </div>
  );
}

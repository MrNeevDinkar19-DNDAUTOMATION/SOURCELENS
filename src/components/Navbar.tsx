import { Link } from "react-router-dom";

const Navbar = () => {
  const handleLaunch = () => {
    window.location.href =
      "mailto:dnd.automation.sourcelens@gmail.com" +
      "?subject=Contacting" +
      "&body=Hello%20Nani";
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        <div className="logo-mark">SL</div>

        <div className="logo-text">
          <span>SOURCE</span>
          <strong>LENS</strong>
        </div>
      </Link>

      <div className="navbar-links">
        <Link to="/home">HOME</Link>
        <Link to="/about">ABOUT</Link>
        <Link to="/dashboard">DASHBOARD</Link>
        <Link to="/creator">CREATOR</Link>
      </div>

      <button
        className="navbar-button"
        onClick={handleLaunch}
      >
        CONTACT US
        <span>→</span>
      </button>
    </nav>
  );
};

export default Navbar;
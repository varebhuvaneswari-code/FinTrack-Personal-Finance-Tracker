
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  UserRound,
  LogOut,
  Menu,
  Bell
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

function MainLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initial =
    user?.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="app-layout">
      <aside className={`sidebar ${menuOpen ? "show-sidebar" : ""}`}>
        <div className="sidebar-brand">
          <Wallet size={27} />
          <span>FinTrack</span>
        </div>

        <p className="menu-heading">MENU</p>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" onClick={() => setMenuOpen(false)}>
            <LayoutDashboard size={19} />
            Dashboard
          </NavLink>

          <NavLink to="/transactions" onClick={() => setMenuOpen(false)}>
            <ArrowLeftRight size={19} />
            Transactions
          </NavLink>

          <NavLink to="/profile" onClick={() => setMenuOpen(false)}>
            <UserRound size={19} />
            My Profile
          </NavLink>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={19} />
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <Menu />
          </button>

          <div>
            <h3>Personal Finance</h3>
            <p>Manage your money wisely</p>
          </div>

          <div className="topbar-user">
            <Bell size={20} />
            <div className="avatar">{initial}</div>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default MainLayout;

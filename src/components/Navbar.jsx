import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogoIcon } from "./Icons";
import { UserAvatar } from "./UserAvatar";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getSavedColor = () => {
    if (!user?.id) return "cyan";
    try {
      const saved = localStorage.getItem(`profile_customization_${user.id}`);
      return saved ? JSON.parse(saved).avatarColor || "cyan" : "cyan";
    } catch {
      return "cyan";
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo-wrap">
            <LogoIcon size={20} />
          </div>
          <span className="navbar-title">CursosOnline</span>
        </Link>

        <nav className="navbar-links" aria-label="Navegación principal">
          <Link to="/" className="nav-link">Catálogo</Link>

          {isAuthenticated ? (
            <>
              <Link to="/my-courses" className="nav-link">Mis Cursos</Link>
              <Link to="/profile" className="nav-link">Mi Perfil</Link>
              <div className="navbar-user">
                <UserAvatar name={user?.name} size={30} color={getSavedColor()} />
                <span className="user-greeting">
                  <strong>{user?.name || "Alumno"}</strong>
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary btn-sm"
                  aria-label="Cerrar sesión"
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <div className="navbar-auth">
              <Link to="/login" className="btn btn-secondary btn-sm">Iniciar sesión</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Registrarse</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

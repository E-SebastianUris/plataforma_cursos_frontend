import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { UserAvatar } from "./UserAvatar";
import { AcademicCapIcon, CheckCircleIcon } from "./Icons";

export function PublicProfileModal({ user, currentUser, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!user) return null;

  // Intentar obtener personalización guardada si existe
  let customization = {};
  if (user.id) {
    try {
      const saved = localStorage.getItem(`profile_customization_${user.id}`);
      if (saved) customization = JSON.parse(saved);
    } catch {
      // Ignorar error de parsing
    }
  }

  const isSelf = currentUser && currentUser.id === user.id;

  const displayName = user.name || "Usuario de HuskyByte";
  const displayBio =
    customization.bio ||
    user.bio ||
    (user.role === "profesor"
      ? "Docente especializado en ciencias de la computación y desarrollo de software con amplia experiencia en la industria digital."
      : "Estudiante apasionado por la tecnología, formándose en desarrollo web y herramientas modernas en HuskyByte{}.");

  const displayStatus = customization.statusText || user.statusText || null;
  const avatarColor = customization.avatarColor || user.avatarColor || (user.role === "profesor" ? "indigo" : "emerald");
  const avatarImage = customization.avatarImage || user.avatarImage || null;
  const userRole = user.role || (user.name?.toLowerCase().includes("docente") ? "profesor" : "alumno");

  return (
    <div
      className="modal-backdrop public-profile-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-name"
      onClick={onClose}
    >
      <div
        className="public-profile-card card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="public-profile-header-banner">
          <button
            type="button"
            className="modal-close-btn public-profile-close-btn"
            onClick={onClose}
            aria-label="Cerrar perfil público"
          >
            ✕
          </button>
        </div>

        <div className="public-profile-avatar-row">
          <div className="public-profile-avatar-wrap">
            <UserAvatar
              name={displayName}
              imageUrl={avatarImage}
              size={80}
              color={avatarColor}
            />
          </div>
        </div>

        <div className="public-profile-body">
          <div className="public-profile-title-group">
            <h2 id="profile-modal-name" className="public-profile-name">
              {displayName}
            </h2>
            <div className="public-profile-badges">
              <span className={`badge ${userRole === "profesor" ? "badge-primary" : "badge-secondary"}`}>
                {userRole === "profesor" ? "Profesor" : "Estudiante"}
              </span>
              <span className="badge badge-community">
                <CheckCircleIcon size={13} /> Miembro Verificado
              </span>
            </div>
          </div>

          {displayStatus && (
            <div className="public-profile-status-box">
              <span className="status-indicator-dot"></span>
              <p className="public-profile-status-text">"{displayStatus}"</p>
            </div>
          )}

          <div className="public-profile-section">
            <h3 className="public-profile-section-title">Sobre mí</h3>
            <p className="public-profile-bio">{displayBio}</p>
          </div>

          <div className="public-profile-meta-grid">
            <div className="public-profile-meta-item">
              <span className="meta-item-label">Institución</span>
              <span className="meta-item-value">UTN - TUP</span>
            </div>
            <div className="public-profile-meta-item">
              <span className="meta-item-label">Plataforma</span>
              <span className="meta-item-value">HuskyByte{"{}"}</span>
            </div>
          </div>

          <div className="public-profile-footer">
            {isSelf ? (
              <Link
                to="/profile"
                className="btn btn-primary w-full"
                onClick={onClose}
              >
                Editar mi perfil
              </Link>
            ) : (
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={onClose}
              >
                Cerrar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

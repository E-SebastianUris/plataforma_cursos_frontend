import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { UserAvatar } from "../components/UserAvatar";
import { CheckCircleIcon, UserIcon } from "../components/Icons";

export function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "security"

  // Profile data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [statusText, setStatusText] = useState("");
  const [avatarColor, setAvatarColor] = useState("cyan");

  // Security data
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/profile" } } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");

      // Cargar personalización guardada localmente
      const savedCustomization = localStorage.getItem(`profile_customization_${user.id}`);
      if (savedCustomization) {
        try {
          const parsed = JSON.parse(savedCustomization);
          setBio(parsed.bio || "");
          setStatusText(parsed.statusText || "");
          setAvatarColor(parsed.avatarColor || "cyan");
        } catch {
          // Ignorar error al parsear
        }
      }
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage(null);

    if (!name.trim()) {
      setErrors(["El nombre no puede estar vacío"]);
      return;
    }
    if (!email.trim()) {
      setErrors(["El correo no puede estar vacío"]);
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });

      // Guardar personalización extendida
      if (user?.id) {
        const customization = {
          bio: bio.trim(),
          statusText: statusText.trim(),
          avatarColor,
        };
        localStorage.setItem(`profile_customization_${user.id}`, JSON.stringify(customization));
      }

      setSuccessMessage("¡Perfil y personalización actualizados con éxito!");
    } catch (err) {
      if (err.data && err.data.errors) {
        setErrors(err.data.errors);
      } else {
        setErrors([err.message || "Error al actualizar el perfil"]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage(null);

    if (!password) {
      setErrors(["Ingresá una nueva contraseña"]);
      return;
    }
    if (password.length < 6) {
      setErrors(["La contraseña debe tener al menos 6 caracteres"]);
      return;
    }
    if (password !== passwordConfirmation) {
      setErrors(["Las contraseñas no coinciden"]);
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        name: user.name,
        email: user.email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccessMessage("¡Contraseña actualizada correctamente!");
      setPassword("");
      setPasswordConfirmation("");
    } catch (err) {
      if (err.data && err.data.errors) {
        setErrors(err.data.errors);
      } else {
        setErrors([err.message || "Error al cambiar la contraseña"]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <LoadingSpinner message="Cargando perfil..." />;

  const colorOptions = [
    { id: "cyan", label: "Cian Eléctrico", hex: "#38bdf8" },
    { id: "emerald", label: "Esmeralda", hex: "#10b981" },
    { id: "indigo", label: "Índigo", hex: "#6366f1" },
    { id: "purple", label: "Violeta", hex: "#a855f7" },
    { id: "amber", label: "Ámbar", hex: "#f59e0b" },
  ];

  return (
    <main className="container page-content">
      <div className="profile-wrapper">
        {/* Header con tarjeta visual de usuario estilo Platzi / Coder */}
        <header className="profile-banner-card card">
          <div className="profile-banner-main">
            <UserAvatar name={name || user?.name} size={76} color={avatarColor} className="profile-main-avatar" />
            <div className="profile-banner-text">
              <div className="profile-title-row">
                <h1 className="profile-banner-name">{name || user?.name || "Usuario"}</h1>
                <span className="badge badge-primary">{user?.role === "profesor" ? "Profesor" : "Estudiante"}</span>
              </div>
              <p className="profile-banner-email">{email || user?.email}</p>
              {statusText ? (
                <p className="profile-banner-status">
                  <span className="status-indicator-dot"></span>
                  "{statusText}"
                </p>
              ) : (
                <p className="profile-banner-status-placeholder">Sin estado asignado</p>
              )}
            </div>
          </div>
        </header>

        {/* Tabs de navegación de perfil */}
        <div className="profile-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "profile"}
            className={`profile-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => { setActiveTab("profile"); setSuccessMessage(null); setErrors([]); }}
          >
            Personalización de Perfil
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "security"}
            className={`profile-tab-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => { setActiveTab("security"); setSuccessMessage(null); setErrors([]); }}
          >
            Seguridad y Contraseña
          </button>
        </div>

        {successMessage && (
          <div className="alert alert-success" role="alert">
            <CheckCircleIcon size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {errors.length > 0 && (
          <div className="alert alert-error" role="alert">
            <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
              {errors.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Contenido de Tab 1: Personalización */}
        {activeTab === "profile" && (
          <div className="card profile-content-card">
            <h2 className="section-title">Datos Personales y Personalización</h2>
            <p className="section-desc">Personalizá cómo te ven tus compañeros y docentes en la plataforma</p>

            <form onSubmit={handleProfileSubmit} className="profile-form" noValidate>
              <div className="form-group">
                <label>Color del Avatar (PFP):</label>
                <div className="avatar-color-picker">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`color-picker-dot ${avatarColor === opt.id ? "selected" : ""}`}
                      style={{ backgroundColor: opt.hex }}
                      onClick={() => setAvatarColor(opt.id)}
                      title={opt.label}
                      aria-label={`Elegir color ${opt.label}`}
                    />
                  ))}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="prof-name">Nombre completo</label>
                  <input
                    id="prof-name"
                    type="text"
                    className="input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="prof-email">Correo electrónico</label>
                  <input
                    id="prof-email"
                    type="email"
                    className="input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prof-status">Estado / Frase actual</label>
                <input
                  id="prof-status"
                  type="text"
                  className="input"
                  placeholder="Ej: Aprendiendo Fullstack con Rails y React 🚀"
                  value={statusText}
                  onChange={(e) => setStatusText(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="prof-bio">Sobre mí</label>
                <textarea
                  id="prof-bio"
                  className="input textarea"
                  rows="3"
                  placeholder="Contá brevemente tu experiencia, objetivos de aprendizaje o intereses tecnológicos..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Guardando cambios..." : "Guardar personalización"}
              </button>
            </form>
          </div>
        )}

        {/* Contenido de Tab 2: Seguridad */}
        {activeTab === "security" && (
          <div className="card profile-content-card">
            <h2 className="section-title">Actualizar Contraseña</h2>
            <p className="section-desc">Mantené tu cuenta protegida eligiendo una contraseña segura</p>

            <form onSubmit={handleSecuritySubmit} className="profile-form" noValidate>
              <div className="form-group">
                <label htmlFor="prof-new-password">Nueva contraseña</label>
                <input
                  id="prof-new-password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prof-new-password-confirmation">Confirmar nueva contraseña</label>
                <input
                  id="prof-new-password-confirmation"
                  type="password"
                  className="input"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  placeholder="Repetí la nueva contraseña"
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !password}
              >
                {loading ? "Actualizando contraseña..." : "Actualizar contraseña"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { UserAvatar } from "../components/UserAvatar";
import { CheckCircleIcon } from "../components/Icons";

export function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [statusText, setStatusText] = useState("");
  const [avatarColor, setAvatarColor] = useState("cyan");
  const [avatarImage, setAvatarImage] = useState(null);

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

      const saved = localStorage.getItem(`profile_customization_${user.id}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setBio(parsed.bio || "");
          setStatusText(parsed.statusText || "");
          setAvatarColor(parsed.avatarColor || "cyan");
          setAvatarImage(parsed.avatarImage || null);
        } catch {
          // parse error fallback
        }
      }
    }
  }, [user]);

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrors(["La imagen debe pesar menos de 2 MB"]);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarImage(reader.result);
      setSuccessMessage("Imagen cargada. Guardá los cambios para confirmarla.");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAvatarImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSuccessMessage("Foto eliminada. Guardá los cambios para confirmarla.");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage(null);

    if (!name.trim()) return setErrors(["El nombre no puede estar vacío"]);
    if (!email.trim()) return setErrors(["El correo no puede estar vacío"]);

    setLoading(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });

      if (user?.id) {
        localStorage.setItem(
          `profile_customization_${user.id}`,
          JSON.stringify({ bio: bio.trim(), statusText: statusText.trim(), avatarColor, avatarImage })
        );
      }
      setSuccessMessage("¡Perfil y personalización actualizados con éxito!");
    } catch (err) {
      setErrors(err.data?.errors || [err.message || "Error al actualizar"]);
    } finally {
      setLoading(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccessMessage(null);

    if (!password) return setErrors(["Ingresá una contraseña"]);
    if (password.length < 6) return setErrors(["Mínimo 6 caracteres"]);
    if (password !== passwordConfirmation) return setErrors(["Las contraseñas no coinciden"]);

    setLoading(true);
    try {
      await updateProfile({ name: user.name, email: user.email, password, password_confirmation: passwordConfirmation });
      setSuccessMessage("¡Contraseña actualizada!");
      setPassword("");
      setPasswordConfirmation("");
    } catch (err) {
      setErrors(err.data?.errors || [err.message || "Error al cambiar contraseña"]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <LoadingSpinner message="Cargando perfil..." />;

  const colorOptions = [
    { id: "cyan", hex: "#38bdf8" },
    { id: "emerald", hex: "#10b981" },
    { id: "indigo", hex: "#6366f1" },
    { id: "purple", hex: "#a855f7" },
    { id: "amber", hex: "#f59e0b" },
  ];

  return (
    <main className="container page-content">
      <div className="profile-wrapper">
        <header className="profile-banner-card card">
          <div className="profile-banner-main">
            <UserAvatar name={name || user?.name} imageUrl={avatarImage} size={76} color={avatarColor} />
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

        <div className="profile-tabs" role="tablist">
          <button
            type="button"
            className={`profile-tab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => { setActiveTab("profile"); setSuccessMessage(null); setErrors([]); }}
          >
            Personalización de Perfil
          </button>
          <button
            type="button"
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
              {errors.map((msg, idx) => <li key={idx}>{msg}</li>)}
            </ul>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="card profile-content-card">
            <h2 className="section-title">Foto y Datos de Perfil</h2>

            <form onSubmit={handleProfileSubmit} className="profile-form" noValidate>
              <div className="form-group pfp-upload-section">
                <label>Foto de Perfil (PFP):</label>
                <div className="pfp-controls">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileChange}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-secondary btn-sm"
                  >
                    Subir imagen propia
                  </button>
                  {avatarImage && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="btn btn-danger btn-sm"
                    >
                      Eliminar foto
                    </button>
                  )}
                </div>
              </div>

              {!avatarImage && (
                <div className="form-group">
                  <label>Color de fondo del Avatar:</label>
                  <div className="avatar-color-picker">
                    {colorOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`color-picker-dot ${avatarColor === opt.id ? "selected" : ""}`}
                        style={{ backgroundColor: opt.hex }}
                        onClick={() => setAvatarColor(opt.id)}
                        aria-label={`Color ${opt.id}`}
                      />
                    ))}
                  </div>
                </div>
              )}

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
                  placeholder="Contá brevemente tus metas o intereses..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Guardando..." : "Guardar cambios"}
              </button>
            </form>
          </div>
        )}

        {activeTab === "security" && (
          <div className="card profile-content-card">
            <h2 className="section-title">Actualizar Contraseña</h2>
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
                  placeholder="Repetí la contraseña"
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={loading || !password}>
                {loading ? "Actualizando..." : "Actualizar contraseña"}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}

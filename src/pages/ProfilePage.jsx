import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";

export function ProfilePage() {
  const { user, isAuthenticated, loading: authLoading, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
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
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    if (!name.trim()) {
      setErrors(["El nombre no puede estar vacío"]);
      return;
    }
    if (!email.trim()) {
      setErrors(["El correo no puede estar vacío"]);
      return;
    }
    if (password && password.length < 6) {
      setErrors(["La nueva contraseña debe tener al menos 6 caracteres"]);
      return;
    }
    if (password && password !== passwordConfirmation) {
      setErrors(["Las contraseñas no coinciden"]);
      return;
    }

    setLoading(true);
    try {
      const payload = { name: name.trim(), email: email.trim() };
      if (password) {
        payload.password = password;
        payload.password_confirmation = passwordConfirmation;
      }
      await updateProfile(payload);
      setSuccess(true);
      setPassword("");
      setPasswordConfirmation("");
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

  if (authLoading) return <LoadingSpinner message="Cargando perfil..." />;

  return (
    <main className="container page-content">
      <div className="card profile-card">
        <header className="page-header">
          <h1 className="page-title">Mi Perfil</h1>
          <p className="page-subtitle">Actualizá tus datos personales y credenciales de acceso</p>
        </header>

        {success && (
          <div className="alert alert-success" role="alert">
            ✓ Tus datos fueron actualizados correctamente.
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

        <div className="profile-role-badge">
          Rol asignado: <span className="badge badge-primary">{user?.role || "alumno"}</span>
        </div>

        <form onSubmit={handleSubmit} className="profile-form" noValidate>
          <div className="form-group">
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

          <div className="form-group">
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

          <hr style={{ margin: "1.5rem 0", borderColor: "var(--border)" }} />
          <p className="text-muted" style={{ marginBottom: "1rem" }}>
            Dejá los campos de contraseña vacíos si no deseás cambiarla.
          </p>

          <div className="form-group">
            <label htmlFor="prof-password">Nueva contraseña</label>
            <input
              id="prof-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prof-password-confirmation">Confirmar nueva contraseña</label>
            <input
              id="prof-password-confirmation"
              type="password"
              className="input"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Guardando cambios..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </main>
  );
}


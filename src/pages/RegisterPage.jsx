import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);

    const clientErrors = [];
    if (!name.trim()) clientErrors.push("El nombre es obligatorio");
    if (!email.trim()) clientErrors.push("El correo electrónico es obligatorio");
    if (password.length < 6) clientErrors.push("La contraseña debe tener al menos 6 caracteres");
    if (password !== passwordConfirmation) clientErrors.push("Las contraseñas no coinciden");

    if (clientErrors.length > 0) {
      setErrors(clientErrors);
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password, passwordConfirmation);
      navigate("/", { replace: true });
    } catch (err) {
      if (err.data && err.data.errors) {
        setErrors(err.data.errors);
      } else {
        setErrors([err.message || "Error al registrar la cuenta"]);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-container">
      <div className="card auth-card">
        <header className="auth-header">
          <h1 className="auth-title">Crear Cuenta</h1>
          <p className="auth-subtitle">Registrate como alumno para acceder a los cursos</p>
        </header>

        {errors.length > 0 && (
          <div className="alert alert-error" role="alert">
            <ul style={{ margin: 0, paddingLeft: "1.2rem" }}>
              {errors.map((msg, idx) => (
                <li key={idx}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="reg-name">Nombre completo</label>
            <input
              id="reg-name"
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Juan Pérez"
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Correo electrónico</label>
            <input
              id="reg-email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@ejemplo.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Contraseña (mínimo 6 caracteres)</label>
            <input
              id="reg-password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password-confirmation">Confirmar contraseña</label>
            <input
              id="reg-password-confirmation"
              type="password"
              className="input"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            ¿Ya tenés cuenta?{" "}
            <Link to="/login">Iniciar sesión</Link>
          </p>
        </footer>
      </div>
    </main>
  );
}


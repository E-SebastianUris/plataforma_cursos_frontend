import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Completá todos los campos.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container auth-container">
      <div className="card auth-card">
        <header className="auth-header">
          <h1 className="auth-title">Iniciar Sesión</h1>
          <p className="auth-subtitle">Ingresá a tu cuenta de HuskyByte{"{}"}</p>
        </header>

        {error && (
          <div className="alert alert-error" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="juan@test.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Ingresar"}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            ¿No tenés una cuenta?{" "}
            <Link to="/register">Crear una cuenta gratis</Link>
          </p>
          <div className="demo-credentials-box">
            <p><strong>Cuentas de prueba (seeds):</strong></p>
            <p>Alumno: <code>juan@test.com</code> / <code>123456</code></p>
            <p>Alumno: <code>ana@test.com</code> / <code>123456</code></p>
          </div>
        </footer>
      </div>
    </main>
  );
}


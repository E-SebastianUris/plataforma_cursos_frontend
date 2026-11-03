import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { AcademicCapIcon } from "../components/Icons";

export function MyCoursesPage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelingId, setCancelingId] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/my-courses" } } });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      setError(err.message || "Error al cargar tus inscripciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const handleCancelEnrollment = async (orderId, courseTitle) => {
    if (!window.confirm(`¿Estás seguro de que querés cancelar tu inscripción a "${courseTitle}"?`)) {
      return;
    }

    setCancelingId(orderId);
    setFeedbackMessage(null);
    try {
      await api.cancelOrder(orderId);
      setFeedbackMessage({ type: "success", text: `Inscripción a "${courseTitle}" cancelada correctamente.` });
      await loadOrders();
    } catch (err) {
      setFeedbackMessage({ type: "error", text: err.message || "No se pudo cancelar la inscripción." });
    } finally {
      setCancelingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "activa":
        return <span className="badge badge-success">Activa</span>;
      case "pendiente":
        return <span className="badge badge-warning">Pendiente de confirmación</span>;
      case "completada":
        return <span className="badge badge-primary">Completada</span>;
      case "cancelada":
        return <span className="badge badge-muted">Cancelada</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  if (authLoading || loading) {
    return <LoadingSpinner message="Cargando tus cursos..." />;
  }

  return (
    <main className="container page-content">
      <header className="page-header">
        <span className="page-tag">Mi Aprendizaje</span>
        <h1 className="page-title">Mis Cursos</h1>
        <p className="page-subtitle">Gestioná tus inscripciones y accedé al contenido de tus lecciones</p>
      </header>

      {feedbackMessage && (
        <div className={`alert alert-${feedbackMessage.type}`} role="alert">
          {feedbackMessage.text}
        </div>
      )}

      {error && (
        <div className="alert alert-error" role="alert">
          <p>{error}</p>
          <button onClick={loadOrders} className="btn btn-secondary btn-sm" style={{ marginTop: "0.5rem" }}>
            Reintentar
          </button>
        </div>
      )}

      {!error && orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <AcademicCapIcon size={40} />
          </div>
          <h2>Aún no te inscribiste a ningún curso</h2>
          <p>Explorá nuestro catálogo de cursos para comenzar tu formación.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const course = order.course;
            const isCanceled = order.status === "cancelada";

            return (
              <article key={order.id} className="card order-card">
                <div className="order-info">
                  <div className="order-header-line">
                    <h2 className="order-course-title">
                      {course ? (
                        <Link to={`/courses/${course.id}`}>{course.title}</Link>
                      ) : (
                        `Curso #${order.course_id}`
                      )}
                    </h2>
                    {getStatusBadge(order.status)}
                  </div>

                  <p className="order-date">
                    Inscripción #{order.id} · Fecha: {new Date(order.created_at).toLocaleDateString("es-AR")}
                  </p>
                </div>

                <div className="order-actions">
                  {course && (
                    <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">
                      {isCanceled ? "Ver curso" : "Acceder a las lecciones"}
                    </Link>
                  )}

                  {!isCanceled && (
                    <button
                      onClick={() => handleCancelEnrollment(order.id, course?.title || "este curso")}
                      disabled={cancelingId === order.id}
                      className="btn btn-danger btn-sm"
                    >
                      {cancelingId === order.id ? "Cancelando..." : "Cancelar inscripción"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}

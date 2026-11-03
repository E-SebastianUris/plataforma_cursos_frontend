import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { StarRating } from "../components/StarRating";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { BookOpenIcon, InfoIcon, CheckCircleIcon } from "../components/Icons";

export function CourseDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [course, setCourse] = useState(null);
  const [reviewsData, setReviewsData] = useState({ reviews: [], average_rating: null, reviews_count: 0 });
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Enroll state
  const [enrolling, setEnrolling] = useState(false);
  const [enrollSuccess, setEnrollSuccess] = useState(false);
  const [enrollError, setEnrollError] = useState(null);

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchCourseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [courseRes, reviewsRes] = await Promise.all([
        api.getCourse(id),
        api.getReviews(id).catch(() => ({ reviews: [], average_rating: null, reviews_count: 0 })),
      ]);
      setCourse(courseRes);
      setReviewsData(reviewsRes);

      if (isAuthenticated) {
        const orders = await api.getOrders().catch(() => []);
        setUserOrders(orders);
      }
    } catch (err) {
      setError(err.message || "Error al cargar el curso");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id, isAuthenticated]);

  const activeEnrollment = userOrders.find(
    (o) => o.course_id === Number(id) && o.status !== "cancelada"
  );
  const isEnrolled = !!activeEnrollment;
  const isEnrolledActive = activeEnrollment?.status === "activa";

  const hasReviewed = reviewsData.reviews?.some((r) => r.user?.id === user?.id);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setEnrolling(true);
    setEnrollError(null);
    setEnrollSuccess(false);

    try {
      await api.createOrder(Number(id));
      setEnrollSuccess(true);
      await fetchCourseData();
    } catch (err) {
      setEnrollError(err.message || "No se pudo completar la inscripción");
    } finally {
      setEnrolling(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError("El comentario no puede estar vacío");
      return;
    }
    setSubmittingReview(true);
    setReviewError(null);
    try {
      await api.createReview(Number(id), Number(rating), comment.trim());
      setReviewSuccess(true);
      setComment("");
      const updatedReviews = await api.getReviews(id);
      setReviewsData(updatedReviews);
    } catch (err) {
      setReviewError(err.message || "Error al enviar la reseña");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner message="Cargando información del curso..." />;

  if (error) {
    return (
      <main className="container page-content">
        <div className="alert alert-error" role="alert">
          <p>{error}</p>
          <button onClick={fetchCourseData} className="btn btn-secondary btn-sm" style={{ marginTop: "0.5rem" }}>
            Reintentar
          </button>
        </div>
        <Link to="/" className="btn btn-outline" style={{ marginTop: "1rem" }}>
          Volver al catálogo
        </Link>
      </main>
    );
  }

  if (!course) return null;

  const formatPrice = (price) => {
    if (price === 0) return "Gratis";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <main className="container page-content">
      <nav aria-label="Miga de pan" className="breadcrumbs">
        <Link to="/">Catálogo</Link> <span>/</span> <span>{course.title}</span>
      </nav>

      <div className="course-detail-layout">
        {/* Columna Principal */}
        <section className="course-detail-main">
          <header className="course-detail-header">
            {course.category && (
              <span className="badge badge-primary">{course.category.name}</span>
            )}
            <h1 className="course-title">{course.title}</h1>
            <p className="course-description">{course.description}</p>
            <div className="course-meta-bar">
              <StarRating
                rating={reviewsData.average_rating}
                count={reviewsData.reviews_count}
              />
              {course.user && (
                <span className="course-author">Dictado por <strong>{course.user.name}</strong></span>
              )}
            </div>
          </header>

          {/* Temario / Lecciones */}
          <section className="course-lessons-section" aria-labelledby="temario-heading">
            <h2 id="temario-heading" className="section-title">
              Contenido del Curso ({course.lessons?.length || 0} lecciones)
            </h2>

            {!isEnrolledActive && (
              <div className="notice-box">
                <InfoIcon size={18} className="notice-box-icon" />
                <span>El contenido completo de las lecciones está disponible para alumnos inscriptos con estado activo.</span>
              </div>
            )}

            <div className="lessons-list">
              {course.lessons && course.lessons.length > 0 ? (
                course.lessons
                  .sort((a, b) => a.position - b.position)
                  .map((lesson) => (
                    <article key={lesson.id} className="lesson-item">
                      <div className="lesson-header">
                        <span className="lesson-number">#{lesson.position}</span>
                        <h3 className="lesson-title">{lesson.title}</h3>
                        {lesson.content ? (
                          <span className="badge badge-success">Disponible</span>
                        ) : (
                          <span className="badge badge-muted">Bloqueado</span>
                        )}
                      </div>
                      {lesson.content && (
                        <div className="lesson-body">
                          <p>{lesson.content}</p>
                        </div>
                      )}
                    </article>
                  ))
              ) : (
                <p className="text-muted">Este curso aún no tiene lecciones publicadas.</p>
              )}
            </div>
          </section>

          {/* Sección de Reseñas */}
          <section className="course-reviews-section" aria-labelledby="reviews-heading">
            <h2 id="reviews-heading" className="section-title">Reseñas de Alumnos</h2>

            {/* Formulario de reseña (solo inscriptos que no hayan reseñado) */}
            {isEnrolled && !hasReviewed && (
              <form onSubmit={handleReviewSubmit} className="review-form card">
                <h3>Dejá tu opinión sobre este curso</h3>

                {reviewError && (
                  <div className="alert alert-error" role="alert">
                    {reviewError}
                  </div>
                )}
                {reviewSuccess && (
                  <div className="alert alert-success" role="alert">
                    ¡Gracias por tu reseña!
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="rating-select">Puntuación:</label>
                  <select
                    id="rating-select"
                    className="select"
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    disabled={submittingReview}
                  >
                    <option value="5">5 estrellas - Excelente</option>
                    <option value="4">4 estrellas - Muy bueno</option>
                    <option value="3">3 estrellas - Bueno</option>
                    <option value="2">2 estrellas - Regular</option>
                    <option value="1">1 estrella - Malo</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="review-comment">Comentario:</label>
                  <textarea
                    id="review-comment"
                    className="input textarea"
                    rows="3"
                    placeholder="Contá tu experiencia con el curso..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={submittingReview}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submittingReview || !comment.trim()}
                >
                  {submittingReview ? "Publicando..." : "Publicar reseña"}
                </button>
              </form>
            )}

            {isEnrolled && hasReviewed && (
              <div className="notice-box">
                <CheckCircleIcon size={18} className="notice-box-icon" />
                <span>Ya dejaste una reseña para este curso.</span>
              </div>
            )}

            {/* Listado de reseñas */}
            <div className="reviews-list">
              {reviewsData.reviews && reviewsData.reviews.length > 0 ? (
                reviewsData.reviews.map((rev) => (
                  <article key={rev.id} className="review-card">
                    <div className="review-card-header">
                      <strong>{rev.user?.name || "Alumno"}</strong>
                      <StarRating rating={rev.rating} showCount={false} />
                    </div>
                    <p className="review-comment">{rev.comment}</p>
                    <time className="review-date">
                      {new Date(rev.created_at).toLocaleDateString("es-AR")}
                    </time>
                  </article>
                ))
              ) : (
                <p className="text-muted">Aún no hay reseñas para este curso.</p>
              )}
            </div>
          </section>
        </section>

        {/* Sidebar de Compra / Inscripción */}
        <aside className="course-detail-sidebar">
          <div className="card sticky-card">
            {course.cover_image_url ? (
              <img
                src={course.cover_image_url}
                alt={`Portada de ${course.title}`}
                className="course-detail-cover"
              />
            ) : (
              <div className="course-card-placeholder large" aria-hidden="true">
                <BookOpenIcon size={48} />
              </div>
            )}

            <div className="course-price-box">
              <span className="price-label">Precio:</span>
              <span className="price-value">{formatPrice(course.price)}</span>
            </div>

            {enrollSuccess && (
              <div className="alert alert-success" role="alert">
                ¡Inscripción realizada con éxito! Revisá tu email de confirmación.
              </div>
            )}

            {enrollError && (
              <div className="alert alert-error" role="alert">
                {enrollError}
              </div>
            )}

            {isEnrolled ? (
              <div className="enrolled-status-box">
                <span className="badge badge-success">Inscripción registrada</span>
                <p className="status-note">
                  Estado: <strong>{activeEnrollment.status}</strong>
                </p>
                <Link to="/my-courses" className="btn btn-secondary w-full">
                  Ir a Mis Cursos
                </Link>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="btn btn-primary btn-large w-full"
              >
                {enrolling ? "Procesando inscripción..." : "Inscribirme ahora"}
              </button>
            )}

            <ul className="course-benefits-list">
              <li>
                <CheckCircleIcon size={16} /> Acceso a todas las lecciones
              </li>
              <li>
                <CheckCircleIcon size={16} /> Certificado de finalización
              </li>
              <li>
                <CheckCircleIcon size={16} /> Seguimiento y consultas
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}

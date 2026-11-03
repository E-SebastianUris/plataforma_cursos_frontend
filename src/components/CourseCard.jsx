import React from "react";
import { Link } from "react-router-dom";

export function CourseCard({ course }) {
  const formatPrice = (price) => {
    if (price === 0) return "Gratis";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <article className="course-card">
      <div className="course-card-image-wrap">
        {course.cover_image_url ? (
          <img
            src={course.cover_image_url}
            alt={`Portada de ${course.title}`}
            className="course-card-image"
            loading="lazy"
          />
        ) : (
          <div className="course-card-placeholder" aria-hidden="true">
            <span>📖</span>
          </div>
        )}
        {course.category && (
          <span className="course-card-category">{course.category.name}</span>
        )}
      </div>

      <div className="course-card-body">
        <h3 className="course-card-title">
          <Link to={`/courses/${course.id}`}>{course.title}</Link>
        </h3>
        <p className="course-card-desc">{course.description}</p>

        <div className="course-card-footer">
          <div className="course-card-meta">
            {course.user && (
              <span className="course-card-author">Prof. {course.user.name}</span>
            )}
            <span className="course-card-price">{formatPrice(course.price)}</span>
          </div>
          <Link to={`/courses/${course.id}`} className="btn btn-outline btn-sm">
            Ver detalle
          </Link>
        </div>
      </div>
    </article>
  );
}


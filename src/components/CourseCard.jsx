import React from "react";
import { Link } from "react-router-dom";
import { BookOpenIcon } from "./Icons";
import { UserAvatar } from "./UserAvatar";

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
            <BookOpenIcon size={40} />
          </div>
        )}
        <div className="course-card-badges">
          {course.category && (
            <span className="course-card-category">{course.category.name}</span>
          )}
          <span className="course-card-level">Online en vivo</span>
        </div>
      </div>

      <div className="course-card-body">
        <h3 className="course-card-title">
          <Link to={`/courses/${course.id}`}>{course.title}</Link>
        </h3>
        <p className="course-card-desc">{course.description}</p>

        {course.user && (
          <div className="course-card-instructor">
            <UserAvatar name={course.user.name} size={30} color="cyan" />
            <div className="instructor-info">
              <span className="instructor-label">Profesor</span>
              <span className="instructor-name">{course.user.name}</span>
            </div>
          </div>
        )}

        <div className="course-card-footer">
          <div className="course-card-price-wrap">
            <span className="price-tag-label">Inversión</span>
            <span className="course-card-price">{formatPrice(course.price)}</span>
          </div>
          <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">
            Ver programa
          </Link>
        </div>
      </div>
    </article>
  );
}

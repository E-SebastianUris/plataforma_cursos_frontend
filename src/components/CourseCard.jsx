import React, { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpenIcon } from "./Icons";
import { UserAvatar } from "./UserAvatar";
import { PriceDisplay } from "./PriceDisplay";
import { PublicProfileModal } from "./PublicProfileModal";
import { useAuth } from "../context/AuthContext";

export function CourseCard({ course }) {
  const [imgError, setImgError] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const { user: currentUser } = useAuth();

  const showImage = course.cover_image_url && !imgError;

  return (
    <>
      <article className="course-card">
        <div className="course-card-image-wrap">
          {showImage ? (
            <img
              src={course.cover_image_url}
              alt={`Portada de ${course.title}`}
              className="course-card-image"
              loading="lazy"
              onError={() => setImgError(true)}
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
            <div
              className="course-card-instructor clickable-profile-trigger"
              onClick={() => setSelectedProfileUser(course.user)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") setSelectedProfileUser(course.user);
              }}
              title={`Ver perfil docente de ${course.user.name}`}
            >
              <UserAvatar name={course.user.name} size={30} color="cyan" />
              <div className="instructor-info">
                <span className="instructor-label">Profesor (ver perfil)</span>
                <span className="instructor-name">{course.user.name}</span>
              </div>
            </div>
          )}

          <div className="course-card-footer">
            <div className="course-card-price-wrap">
              <span className="price-tag-label">Inversión</span>
              <PriceDisplay amount={course.price} fromCurrency="ARS" size="sm" />
            </div>
            <Link to={`/courses/${course.id}`} className="btn btn-primary btn-sm">
              Ver programa
            </Link>
          </div>
        </div>
      </article>

      {/* Modal de perfil público si se seleccionó al docente */}
      {selectedProfileUser && (
        <PublicProfileModal
          user={selectedProfileUser}
          currentUser={currentUser}
          onClose={() => setSelectedProfileUser(null)}
        />
      )}
    </>
  );
}

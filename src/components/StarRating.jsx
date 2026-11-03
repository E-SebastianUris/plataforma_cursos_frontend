import React from "react";

export function StarRating({ rating = 0, count, showCount = true }) {
  const stars = [1, 2, 3, 4, 5];
  const rounded = Math.round((rating || 0) * 10) / 10;

  return (
    <div className="star-rating" aria-label={`Calificación: ${rating || 0} de 5`}>
      <span className="stars" aria-hidden="true">
        {stars.map((star) => (
          <span
            key={star}
            className={`star ${star <= Math.round(rating || 0) ? "star-filled" : "star-empty"}`}
          >
            ★
          </span>
        ))}
      </span>
      {rating ? (
        <span className="rating-value">{rounded.toFixed(1)}</span>
      ) : (
        <span className="rating-none">Sin calificaciones</span>
      )}
      {showCount && count !== undefined && (
        <span className="rating-count">({count} {count === 1 ? "reseña" : "reseñas"})</span>
      )}
    </div>
  );
}


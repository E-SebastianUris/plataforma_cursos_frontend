import React, { useState } from "react";
import { StarIcon } from "./Icons";

const RATING_LABELS = {
  1: "1 estrella - Puede mejorar",
  2: "2 estrellas - Regular",
  3: "3 estrellas - Bueno",
  4: "4 estrellas - Muy bueno",
  5: "5 estrellas - ¡Excelente contenido!",
};

export function InteractiveStarRating({ value = 5, onChange, disabled = false }) {
  const [hoverValue, setHoverValue] = useState(0);

  const activeRating = hoverValue || value;

  return (
    <div className="interactive-stars-box">
      <div
        className="interactive-stars-row"
        role="radiogroup"
        aria-label="Seleccionar puntuación con estrellas"
        onMouseLeave={() => setHoverValue(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;
          const isHovered = hoverValue > 0 && star <= hoverValue;

          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} de 5 estrellas`}
              className={`star-interactive-btn ${isFilled ? "filled" : ""} ${isHovered ? "hovered" : ""}`}
              onClick={() => !disabled && onChange(star)}
              onMouseEnter={() => !disabled && setHoverValue(star)}
              onFocus={() => !disabled && setHoverValue(star)}
              onBlur={() => setHoverValue(0)}
              disabled={disabled}
            >
              <StarIcon
                size={28}
                filled={isFilled}
                className={`star-icon-animated ${isFilled ? "star-filled" : "star-empty"}`}
              />
            </button>
          );
        })}
      </div>

      <div className="rating-feedback-label" aria-live="polite">
        <span className="rating-feedback-badge">{activeRating} / 5</span>
        <span className="rating-feedback-text">{RATING_LABELS[activeRating] || ""}</span>
      </div>
    </div>
  );
}


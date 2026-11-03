import React from "react";

export function LoadingSpinner({ message = "Cargando..." }) {
  return (
    <div className="spinner-container" role="status" aria-live="polite">
      <div className="spinner"></div>
      <p className="spinner-text">{message}</p>
    </div>
  );
}


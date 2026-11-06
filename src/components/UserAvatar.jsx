import React from "react";

export function getInitials(name) {
  if (!name) return "HB";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function UserAvatar({ name, imageUrl = null, size = 36, color = "cyan", className = "" }) {
  const initials = getInitials(name);

  const colorStyles = {
    cyan: {
      bg: "linear-gradient(135deg, rgba(56, 189, 248, 0.35) 0%, rgba(14, 165, 233, 0.15) 100%)",
      border: "rgba(56, 189, 248, 0.45)",
      text: "#38bdf8",
    },
    emerald: {
      bg: "linear-gradient(135deg, rgba(16, 185, 129, 0.35) 0%, rgba(5, 150, 105, 0.15) 100%)",
      border: "rgba(16, 185, 129, 0.45)",
      text: "#34d399",
    },
    indigo: {
      bg: "linear-gradient(135deg, rgba(99, 102, 241, 0.35) 0%, rgba(79, 70, 229, 0.15) 100%)",
      border: "rgba(99, 102, 241, 0.45)",
      text: "#818cf8",
    },
    purple: {
      bg: "linear-gradient(135deg, rgba(168, 85, 247, 0.35) 0%, rgba(147, 51, 234, 0.15) 100%)",
      border: "rgba(168, 85, 247, 0.45)",
      text: "#c084fc",
    },
    amber: {
      bg: "linear-gradient(135deg, rgba(245, 158, 11, 0.35) 0%, rgba(217, 119, 6, 0.15) 100%)",
      border: "rgba(245, 158, 11, 0.45)",
      text: "#fbbf24",
    },
  };

  const currentTheme = colorStyles[color] || colorStyles.cyan;

  if (imageUrl) {
    return (
      <div
        className={`user-avatar avatar-has-image ${className}`}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          borderColor: currentTheme.border,
        }}
        aria-label={`Avatar de ${name || "Usuario"}`}
      >
        <img
          src={imageUrl}
          alt={name || "Avatar"}
          className="avatar-custom-img"
          onError={(e) => {
            // Fallback si la imagen falla
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`user-avatar ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        fontSize: `${Math.round(size * 0.4)}px`,
        background: currentTheme.bg,
        borderColor: currentTheme.border,
        color: currentTheme.text,
      }}
      aria-label={`Avatar de ${name || "Usuario"}`}
    >
      <span className="avatar-initials">{initials}</span>
    </div>
  );
}

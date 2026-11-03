import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { CourseCard } from "../components/CourseCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SearchIcon, CheckCircleIcon, AcademicCapIcon } from "../components/Icons";

export function CoursesListPage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error al cargar categorías:", err));
  }, []);

  const loadCourses = () => {
    setLoading(true);
    setError(null);
    api.getCourses({
      category_id: selectedCategory || undefined,
      search: appliedSearch || undefined,
    })
      .then((data) => setCourses(data))
      .catch((err) => setError(err.message || "Error al cargar los cursos"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCourses();
  }, [selectedCategory, appliedSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setAppliedSearch(search.trim());
  };

  const handleResetFilters = () => {
    setSearch("");
    setAppliedSearch("");
    setSelectedCategory("");
  };

  return (
    <main className="page-content">
      {/* Hero Section estilo Coderhouse / Platzi */}
      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <div className="hero-pill">
              <span className="hero-pill-dot"></span>
              Plataforma de Educación Tecnológica
            </div>
            <h1 className="hero-title">
              Impulsá tu futuro profesional con <span className="gradient-text">cursos de tecnología</span>
            </h1>
            <p className="hero-subtitle">
              Aprende las habilidades más demandadas de la industria digital. Proyectos reales, docentes expertos y certificación.
            </p>

            <div className="hero-stats">
              <div className="hero-stat-item">
                <CheckCircleIcon size={18} className="hero-stat-icon" />
                <span>Clases prácticas guiadas</span>
              </div>
              <div className="hero-stat-item">
                <AcademicCapIcon size={18} className="hero-stat-icon" />
                <span>Certificación oficial UTN</span>
              </div>
              <div className="hero-stat-item">
                <span className="hero-stat-highlight">100%</span>
                <span>Proyectos de portfolio</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        {/* Category Pills estilo Platzi */}
        <div className="category-pills-bar" role="navigation" aria-label="Filtro por categoría">
          <button
            type="button"
            className={`category-pill ${selectedCategory === "" ? "active" : ""}`}
            onClick={() => setSelectedCategory("")}
          >
            Todos los cursos
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-pill ${selectedCategory === String(cat.id) ? "active" : ""}`}
              onClick={() => setSelectedCategory(String(cat.id))}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Buscador unificado y moderno */}
        <section className="search-section" aria-label="Búsqueda de cursos">
          <form onSubmit={handleSearchSubmit} className="modern-search-bar">
            <div className="search-input-wrap">
              <SearchIcon className="search-input-icon" size={20} />
              <input
                id="search-input"
                type="search"
                className="input search-input-field"
                placeholder="Buscar cursos por título, tecnología o descripción..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); setAppliedSearch(""); }}
                  className="search-clear-btn"
                  aria-label="Limpiar campo de búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary search-submit-btn">
              Buscar cursos
            </button>
          </form>

          {/* Badges de filtros activos */}
          {(selectedCategory || appliedSearch) && (
            <div className="active-filters-row">
              <span className="active-filters-label">Filtros aplicados:</span>
              {selectedCategory && (
                <span className="active-filter-chip">
                  Categoría: {categories.find((c) => String(c.id) === selectedCategory)?.name || selectedCategory}
                  <button type="button" onClick={() => setSelectedCategory("")} aria-label="Quitar filtro de categoría">×</button>
                </span>
              )}
              {appliedSearch && (
                <span className="active-filter-chip">
                  Búsqueda: "{appliedSearch}"
                  <button type="button" onClick={() => { setSearch(""); setAppliedSearch(""); }} aria-label="Quitar búsqueda">×</button>
                </span>
              )}
              <button
                type="button"
                onClick={handleResetFilters}
                className="clear-all-link"
              >
                Limpiar todo
              </button>
            </div>
          )}
        </section>

        {/* Estados: Carga, Error, Sin resultados, Lista */}
        {loading && <LoadingSpinner message="Consultando cursos en la plataforma..." />}

        {error && !loading && (
          <div className="alert alert-error" role="alert">
            <p>{error}</p>
            <button onClick={loadCourses} className="btn btn-secondary btn-sm" style={{ marginTop: "0.5rem" }}>
              Reintentar conexión
            </button>
          </div>
        )}

        {!loading && !error && courses.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon-wrap">
              <SearchIcon size={36} />
            </div>
            <h2>No se encontraron cursos</h2>
            <p>Probá cambiando los términos de búsqueda o seleccionando otra categoría.</p>
            {(selectedCategory || appliedSearch) && (
              <button onClick={handleResetFilters} className="btn btn-primary" style={{ marginTop: "1rem" }}>
                Ver todos los cursos
              </button>
            )}
          </div>
        )}

        {!loading && !error && courses.length > 0 && (
          <>
            <div className="courses-header-meta">
              <span className="courses-count">Mostrando <strong>{courses.length}</strong> {courses.length === 1 ? "curso disponible" : "cursos disponibles"}</span>
            </div>
            <section className="courses-grid" aria-label="Listado de cursos">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

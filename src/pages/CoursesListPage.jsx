import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { CourseCard } from "../components/CourseCard";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { SearchIcon, ChevronDownIcon, CheckCircleIcon, AcademicCapIcon } from "../components/Icons";

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
        <div className="category-pills-bar" role="navigation" aria-label="Filtro rápido por categoría">
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

        {/* Barra de Búsqueda y Filtro */}
        <section className="filters-bar" aria-label="Búsqueda de cursos">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <label htmlFor="search-input" className="sr-only">Buscar cursos</label>
            <div className="search-input-wrap">
              <SearchIcon className="search-input-icon" size={18} />
              <input
                id="search-input"
                type="search"
                className="input search-input-field"
                placeholder="Buscar por título, temática o tecnología..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Buscar
            </button>
          </form>

          <div className="category-filter">
            <label htmlFor="category-select" className="filter-label">Filtrar:</label>
            <div className="select-wrapper">
              <select
                id="category-select"
                className="select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="select-arrow-icon" size={16} />
            </div>
          </div>

          {(selectedCategory || appliedSearch) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="btn btn-secondary btn-sm"
            >
              Limpiar filtros
            </button>
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
              <span className="courses-count">Mostrando <strong>{courses.length}</strong> {courses.length === 1 ? "curso" : "cursos"}</span>
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

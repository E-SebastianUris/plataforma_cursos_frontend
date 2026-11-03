import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { CourseCard } from "../components/CourseCard";
import { LoadingSpinner } from "../components/LoadingSpinner";

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
    <main className="container page-content">
      <header className="page-header">
        <h1 className="page-title">Catálogo de Cursos</h1>
        <p className="page-subtitle">Explorá y aprendé nuevas habilidades con nuestros cursos dictados por profesionales</p>
      </header>

      {/* Filtros y Búsqueda */}
      <section className="filters-bar" aria-label="Filtros de cursos">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <label htmlFor="search-input" className="sr-only">Buscar cursos</label>
          <input
            id="search-input"
            type="search"
            className="input"
            placeholder="Buscar por título o contenido..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            Buscar
          </button>
        </form>

        <div className="category-filter">
          <label htmlFor="category-select" className="filter-label">Categoría:</label>
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
      {loading && <LoadingSpinner message="Buscando cursos disponibles..." />}

      {error && !loading && (
        <div className="alert alert-error" role="alert">
          <p>{error}</p>
          <button onClick={loadCourses} className="btn btn-secondary btn-sm" style={{ marginTop: "0.5rem" }}>
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && courses.length === 0 && (
        <div className="empty-state">
          <span className="empty-icon">🔍</span>
          <h2>No se encontraron cursos</h2>
          <p>Probá cambiando los términos de búsqueda o seleccionando otra categoría.</p>
          {(selectedCategory || appliedSearch) && (
            <button onClick={handleResetFilters} className="btn btn-primary">
              Ver todos los cursos
            </button>
          )}
        </div>
      )}

      {!loading && !error && courses.length > 0 && (
        <section className="courses-grid" aria-label="Listado de cursos">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </section>
      )}
    </main>
  );
}


import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { CourseDetailPage } from "../pages/CourseDetailPage";
import { AuthProvider } from "../context/AuthContext";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: {
    getCourse: vi.fn(),
    getReviews: vi.fn(),
    getOrders: vi.fn(),
    createOrder: vi.fn(),
    createReview: vi.fn(),
    getProfile: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

describe("CourseDetailPage", () => {
  const mockCourse = {
    id: 1,
    title: "Curso de React",
    description: "Aprende React desde cero",
    price: 15000,
    cover_image_url: null,
    category: { id: 1, name: "Programación" },
    user: { id: 2, name: "Carlos Docente" },
    lessons: [
      { id: 10, title: "Introducción a JSX", position: 1, content: null },
    ],
  };

  const mockReviews = {
    average_rating: 4.5,
    reviews_count: 1,
    reviews: [
      {
        id: 1,
        rating: 5,
        comment: "Excelente curso",
        created_at: "2026-11-01T10:00:00Z",
        user: { id: 3, name: "Juan Alumno" },
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renderiza la información del curso, precio y reseñas", async () => {
    api.getCourse.mockResolvedValue(mockCourse);
    api.getReviews.mockResolvedValue(mockReviews);

    render(
      <MemoryRouter initialEntries={["/courses/1"]}>
        <AuthProvider>
          <Routes>
            <Route path="/courses/:id" element={<CourseDetailPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText(/cargando información del curso/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Curso de React" })).toBeInTheDocument();
      expect(screen.getByText("Aprende React desde cero")).toBeInTheDocument();
      expect(screen.getByText("Carlos Docente")).toBeInTheDocument();
      expect(screen.getByText("Introducción a JSX")).toBeInTheDocument();
      expect(screen.getByText("Excelente curso")).toBeInTheDocument();
    });
  });

  it("permite inscribirse exitosamente al curso cuando el usuario está autenticado", async () => {
    localStorage.setItem("auth_token", "test-token");
    api.getProfile.mockResolvedValue({ id: 99, name: "Ana Alumna", role: "alumno" });
    api.getCourse.mockResolvedValue(mockCourse);
    api.getReviews.mockResolvedValue(mockReviews);
    api.getOrders.mockResolvedValue([]);
    api.createOrder.mockResolvedValue({ id: 50, course_id: 1, status: "pendiente" });

    render(
      <MemoryRouter initialEntries={["/courses/1"]}>
        <AuthProvider>
          <Routes>
            <Route path="/courses/:id" element={<CourseDetailPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const enrollButton = await screen.findByRole("button", { name: /inscribirme ahora/i });
    expect(enrollButton).toBeInTheDocument();

    fireEvent.click(enrollButton);

    await waitFor(() => {
      expect(api.createOrder).toHaveBeenCalledWith(1);
      expect(screen.getByText(/¡inscripción realizada con éxito!/i)).toBeInTheDocument();
    });
  });

  it("muestra mensaje de error cuando falla la inscripción", async () => {
    localStorage.setItem("auth_token", "test-token");
    api.getProfile.mockResolvedValue({ id: 99, name: "Ana Alumna", role: "alumno" });
    api.getCourse.mockResolvedValue(mockCourse);
    api.getReviews.mockResolvedValue(mockReviews);
    api.getOrders.mockResolvedValue([]);
    api.createOrder.mockRejectedValue(new Error("Ya estás inscripto en este curso"));

    render(
      <MemoryRouter initialEntries={["/courses/1"]}>
        <AuthProvider>
          <Routes>
            <Route path="/courses/:id" element={<CourseDetailPage />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );

    const enrollButton = await screen.findByRole("button", { name: /inscribirme ahora/i });
    fireEvent.click(enrollButton);

    await waitFor(() => {
      expect(screen.getByText(/ya estás inscripto en este curso/i)).toBeInTheDocument();
    });
  });
});


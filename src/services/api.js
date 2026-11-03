const rawBase = import.meta.env.VITE_API_URL || "http://localhost:3000";
const API_BASE = rawBase.trim().replace(/\/+$/, "");

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("auth_token");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE}${endpoint}`;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err) {
    console.error(`Error al conectar con la API (${url}):`, err);
    const networkError = new Error(
      "No se pudo conectar con el servidor. Si el backend en Render estaba suspendido, puede demorar hasta 50 segundos en despertar. Por favor reintentá en un instante."
    );
    networkError.isNetworkError = true;
    networkError.originalError = err;
    throw networkError;
  }

  if (response.status === 401) {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.dispatchEvent(new Event("auth:unauthorized"));
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(
      (data && (data.error || (data.errors && data.errors.join(", ")))) ||
      `Error ${response.status}: ${response.statusText}`
    );
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  login: (email, password) =>
    apiRequest("/api/v1/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name, email, password, password_confirmation) =>
    apiRequest("/api/v1/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, password_confirmation }),
    }),
  logout: () =>
    apiRequest("/api/v1/logout", {
      method: "DELETE",
    }),

  // Profile
  getProfile: () => apiRequest("/api/v1/profile"),
  updateProfile: (data) =>
    apiRequest("/api/v1/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Categories & Courses
  getCategories: () => apiRequest("/api/v1/categories"),
  getCourses: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category_id) query.append("category_id", params.category_id);
    if (params.search) query.append("search", params.search);
    const qs = query.toString();
    return apiRequest(`/api/v1/courses${qs ? `?${qs}` : ""}`);
  },
  getCourse: (id) => apiRequest(`/api/v1/courses/${id}`),

  // Reviews
  getReviews: (courseId) => apiRequest(`/api/v1/courses/${courseId}/reviews`),
  createReview: (courseId, rating, comment) =>
    apiRequest(`/api/v1/courses/${courseId}/reviews`, {
      method: "POST",
      body: JSON.stringify({ rating, comment }),
    }),

  // Orders / Enrollments
  getOrders: () => apiRequest("/api/v1/orders"),
  createOrder: (courseId) =>
    apiRequest("/api/v1/orders", {
      method: "POST",
      body: JSON.stringify({ course_id: courseId }),
    }),
  cancelOrder: (enrollmentId) =>
    apiRequest(`/api/v1/orders/${enrollmentId}`, {
      method: "DELETE",
    }),
};

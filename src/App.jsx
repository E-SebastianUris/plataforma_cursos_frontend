import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Navbar } from "./components/Navbar";
import { CoursesListPage } from "./pages/CoursesListPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MyCoursesPage } from "./pages/MyCoursesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PlansPage } from "./pages/PlansPage";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="app-layout">
          <Navbar />
          <Routes>
            <Route path="/" element={<CoursesListPage />} />
            <Route path="/courses/:id" element={<CourseDetailPage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/my-courses" element={<MyCoursesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
          <footer className="footer">
            <div className="container footer-content">
              <p>
                © 2026 <strong>HuskyByte<span className="brand-braces">{"{}"}</span></strong> · Plataforma de Aprendizaje · UTN - TUP
              </p>
            </div>
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

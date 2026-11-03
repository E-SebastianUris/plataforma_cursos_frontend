# Plataforma de Cursos — Frontend

Trabajo Práctico N°2 de Programación IV (Integración Back-end + Front-end).
- **Modalidad**: Individual.
- **Framework Frontend**: React 19 + Vite 6 + React Router v7.
- **Lenguaje**: JavaScript (ESM).
- **Estilos**: CSS propio (responsive mobile-first, variables CSS, accesibilidad con foco visible).
- **Backend asociado**: `plataforma_cursos` (Ruby on Rails 8.1 API).

---

## 1. Requisitos

- **Node.js**: v18 o superior (probado con v24.14.1)
- **npm**: v9 o superior (probado con v11.11.0)

---

## 2. Variables de Entorno

Crear un archivo `.env` en la raíz del frontend tomando como base `.env.example`:

```env
VITE_API_URL=http://localhost:3000
```
Para producción, apuntar a la URL de Render del backend (ej. `https://<tu-app>.onrender.com`).

---

## 3. Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```
La aplicación queda disponible en `http://localhost:5173`.

---

## 4. Comandos de Pruebas y Build

```bash
# Ejecutar pruebas unitarias e integración con Vitest + Testing Library
npm test

# Compilar para producción (genera la carpeta dist/)
npm run build

# Previsualizar la versión compilada
npm run preview
```

---

## 5. Funcionalidades Implementadas

1. **Catálogo de Cursos (`/`)**:
   - Listado con tarjetas interactivas, precio formateado en pesos argentinos e imagen de portada o fallback.
   - Búsqueda en tiempo real por título/descripción y selector de categorías.
   - Manejo completo de estados: carga (`LoadingSpinner`), sin resultados con opción de reset, y error con botón de reintento.
2. **Detalle del Curso (`/courses/:id`)**:
   - Información del docente, promedio de calificación con estrellas y temario completo de lecciones.
   - Restricción de acceso: el contenido textual de cada lección solo se desbloquea si el usuario está inscripto con estado activo.
   - Botón de inscripción con estado de proceso (evita envíos duplicados) y alerta de confirmación.
   - Formulario de reseña (puntuación de 1 a 5 y comentario) habilitado exclusivamente para alumnos inscriptos.
3. **Autenticación (`/login` y `/register`)**:
   - Manejo centralizado mediante `AuthContext` y persistencia en `localStorage`.
   - Cierre de sesión automático y redirección al login ante respuestas `401 Unauthorized` de la API.
   - Registro exclusivo con rol alumno forzado.
   - Muestra de credenciales de demo en la pantalla de login.
4. **Mis Cursos (`/my-courses`)**:
   - Listado de inscripciones con insignias de estado (`activa`, `pendiente`, `completada`, `cancelada`).
   - Botón para cancelar inscripción con diálogo de confirmación.
5. **Mi Perfil (`/profile`)**:
   - Consulta de datos actuales y rol.
   - Formulario para actualizar nombre, correo electrónico y opcionalmente la contraseña.

---

## 6. Credenciales de Prueba (Demo)

| Rol | Email | Contraseña |
|---|---|---|
| Alumno 1 | `juan@test.com` | `123456` |
| Alumno 2 | `ana@test.com` | `123456` |


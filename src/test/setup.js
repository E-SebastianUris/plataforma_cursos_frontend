import "@testing-library/jest-dom";

// Polyfill localStorage para entorno de test si no está definido
if (typeof window !== "undefined" && !window.localStorage) {
  let store = {};
  window.localStorage = {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; },
  };
}


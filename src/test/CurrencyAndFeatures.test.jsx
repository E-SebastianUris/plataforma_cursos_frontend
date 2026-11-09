import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { CurrencyProvider, useCurrency } from "../context/CurrencyContext";
import { PriceDisplay } from "../components/PriceDisplay";
import { CurrencySelector } from "../components/CurrencySelector";
import { PublicProfileModal } from "../components/PublicProfileModal";
import { MemoryRouter } from "react-router-dom";

describe("Currency & Pricing & Steam ARS Display", () => {
  it("muestra desglose estilo Steam con precio final e impuestos cuando la moneda es ARS", () => {
    localStorage.setItem("huskybyte_currency", "ARS");

    render(
      <CurrencyProvider>
        <PriceDisplay amount={15000} fromCurrency="ARS" />
      </CurrencyProvider>
    );

    // 15000 + 60% = 24000
    expect(screen.getByText(/sin impuestos/i)).toBeInTheDocument();
    expect(screen.getByText("Final")).toBeInTheDocument();
  });

  it("permite cambiar de moneda mediante CurrencySelector", () => {
    function TestCurrencyDisplay() {
      const { currencyCode } = useCurrency();
      return <div data-testid="active-code">{currencyCode}</div>;
    }

    render(
      <CurrencyProvider>
        <CurrencySelector />
        <TestCurrencyDisplay />
      </CurrencyProvider>
    );

    const selectorBtn = screen.getByTitle(/cambiar moneda y país/i);
    expect(selectorBtn).toBeInTheDocument();

    // Abrir dropdown
    fireEvent.click(selectorBtn);

    // Seleccionar EUR
    const eurOption = screen.getByRole("option", { name: /Euro/i });
    fireEvent.click(eurOption);

    expect(screen.getByTestId("active-code")).toHaveTextContent("EUR");
  });
});

describe("PublicProfileModal", () => {
  it("renderiza el perfil público de solo lectura para otro usuario sin exponer datos sensibles", () => {
    const targetUser = {
      id: 5,
      name: "Estudiante Ejemplo",
      role: "alumno",
      bio: "Soy estudiante entusiasta de frontend",
    };

    const currentUser = { id: 1, name: "Otro Usuario" };
    const handleClose = () => {};

    render(
      <MemoryRouter>
        <PublicProfileModal
          user={targetUser}
          currentUser={currentUser}
          onClose={handleClose}
        />
      </MemoryRouter>
    );

    expect(screen.getByText("Estudiante Ejemplo")).toBeInTheDocument();
    expect(screen.getByText(/Soy estudiante entusiasta de frontend/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cerrar" })).toBeInTheDocument();
    // No debe haber botón de editar para otro usuario
    expect(screen.queryByRole("link", { name: /Editar mi perfil/i })).not.toBeInTheDocument();
  });

  it("muestra opción de editar cuando el usuario visualiza su propio perfil", () => {
    const selfUser = {
      id: 10,
      name: "Juan Autenticado",
      role: "alumno",
      bio: "Mi propia bio",
    };

    render(
      <MemoryRouter>
        <PublicProfileModal
          user={selfUser}
          currentUser={selfUser}
          onClose={() => {}}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: /Editar mi perfil/i })).toBeInTheDocument();
  });
});

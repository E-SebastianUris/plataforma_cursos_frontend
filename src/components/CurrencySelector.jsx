import React, { useState, useRef, useEffect } from "react";
import { useCurrency, CURRENCIES } from "../context/CurrencyContext";
import { ChevronDownIcon } from "./Icons";

// Diccionario de mapeo: código de moneda -> código de país de 2 letras en FlagCDN
export const FLAG_CODES = {
  USD: "us",
  EUR: "eu",
  ARS: "ar",
  CLP: "cl",
  BRL: "br",
  COP: "co",
  UYU: "uy",
};

/**
 * Componente que renderiza una imagen real de bandera desde FlagCDN
 */
export function FlagImage({ code, country = "", width = 20 }) {
  const countryCode = FLAG_CODES[code] || "us";
  const height = Math.round((width * 3) / 4); // proporción estándar 4:3

  return (
    <img
      src={`https://flagcdn.com/w20/${countryCode}.png`}
      srcSet={`https://flagcdn.com/w40/${countryCode}.png 2x`}
      width={width}
      height={height}
      alt={country || code}
      className="currency-flag-img"
      loading="lazy"
    />
  );
}

export function CurrencySelector() {
  const { currencyCode, changeCurrency, currentCurrency } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (code) => {
    changeCurrency(code);
    setIsOpen(false);
  };

  return (
    <div className="currency-selector-container" ref={dropdownRef}>
      <button
        type="button"
        className={`currency-selector-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title="Cambiar moneda y país"
      >
        <FlagImage code={currentCurrency.code} country={currentCurrency.country} width={20} />
        <span className="currency-code-label">{currentCurrency.code}</span>
        <ChevronDownIcon size={14} className={`currency-chevron ${isOpen ? "open" : ""}`} />
      </button>

      {isOpen && (
        <div className="currency-dropdown-menu" role="listbox" aria-label="Seleccionar moneda">
          <div className="currency-dropdown-header">
            <span>Seleccionar País / Moneda</span>
          </div>
          <div className="currency-dropdown-list">
            {Object.values(CURRENCIES).map((curr) => {
              const isSelected = curr.code === currencyCode;
              return (
                <button
                  key={curr.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`currency-option-item ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSelect(curr.code)}
                >
                  <FlagImage code={curr.code} country={curr.country} width={20} />
                  <div className="currency-option-info">
                    <span className="currency-option-name">{curr.name}</span>
                    <span className="currency-option-country">{curr.country}</span>
                  </div>
                  <span className="currency-option-code">{curr.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

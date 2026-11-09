import React from "react";
import { useCurrency } from "../context/CurrencyContext";

/**
 * Componente PriceDisplay que se adapta dinámicamente a la moneda activa.
 * Cumple con el estándar estilo Steam para ARS (precio final destacado + precio sin impuestos secundario).
 * 
 * @param {number} amount Monto original
 * @param {"ARS"|"USD"} fromCurrency Moneda de origen del monto ("ARS" para cursos, "USD" para planes)
 * @param {"sm"|"md"|"lg"} size Tamaño del texto
 * @param {string} className Clases adicionales
 */
export function PriceDisplay({ amount, fromCurrency = "ARS", size = "md", className = "" }) {
  const { getPriceInfo } = useCurrency();
  const priceInfo = getPriceInfo(amount, fromCurrency);

  if (priceInfo.isFree) {
    return (
      <div className={`price-display-wrapper size-${size} ${className}`}>
        <span className="price-free-badge">Gratis</span>
      </div>
    );
  }

  if (priceInfo.isARS) {
    return (
      <div className={`price-display-wrapper price-steam-style size-${size} ${className}`} title="Incluye impuestos digitales nacionales (+60%)">
        <div className="price-final-row">
          <span className="price-final-value">{priceInfo.finalFormatted}</span>
          <span className="price-tax-badge">Final</span>
        </div>
        <div className="price-base-row">
          <span className="price-base-value">{priceInfo.baseFormatted}</span>
          <span className="price-base-label">sin impuestos</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`price-display-wrapper size-${size} ${className}`}>
      <span className="price-standard-value">{priceInfo.formatted}</span>
      <span className="price-currency-code">{priceInfo.currencyCode}</span>
    </div>
  );
}

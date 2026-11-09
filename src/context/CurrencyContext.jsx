import React, { createContext, useContext, useState, useEffect } from "react";

export const CURRENCIES = {
  USD: {
    code: "USD",
    name: "Dólar",
    country: "Estados Unidos",
    flag: "🇺🇸",
    symbol: "US$",
    rateToUSD: 1.0,
    decimals: 2,
    locale: "en-US",
  },
  EUR: {
    code: "EUR",
    name: "Euro",
    country: "Unión Europea",
    flag: "🇪🇺",
    symbol: "€",
    rateToUSD: 0.92,
    decimals: 2,
    locale: "de-DE",
  },
  ARS: {
    code: "ARS",
    name: "Peso Argentino",
    country: "Argentina",
    flag: "🇦🇷",
    symbol: "$",
    rateToUSD: 1180.0, // Tasa de cambio representativa
    taxRate: 0.60,      // 60% de carga impositiva nacional (IVA 21% + Ganancias/Bienes Personales)
    decimals: 0,
    locale: "es-AR",
    isARS: true,
  },
  CLP: {
    code: "CLP",
    name: "Peso Chileno",
    country: "Chile",
    flag: "🇨🇱",
    symbol: "CLP$",
    rateToUSD: 960.0,
    decimals: 0,
    locale: "es-CL",
  },
  BRL: {
    code: "BRL",
    name: "Real Brasileño",
    country: "Brasil",
    flag: "🇧🇷",
    symbol: "R$",
    rateToUSD: 5.75,
    decimals: 2,
    locale: "pt-BR",
  },
  COP: {
    code: "COP",
    name: "Peso Colombiano",
    country: "Colombia",
    flag: "🇨🇴",
    symbol: "COP$",
    rateToUSD: 4350.0,
    decimals: 0,
    locale: "es-CO",
  },
  UYU: {
    code: "UYU",
    name: "Peso Uruguayo",
    country: "Uruguay",
    flag: "🇺🇾",
    symbol: "$U",
    rateToUSD: 42.5,
    decimals: 0,
    locale: "es-UY",
  },
};

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCode] = useState(() => {
    return localStorage.getItem("huskybyte_currency") || "ARS";
  });

  const [rates, setRates] = useState(() => {
    const initial = {};
    Object.keys(CURRENCIES).forEach((k) => {
      initial[k] = CURRENCIES[k].rateToUSD;
    });
    return initial;
  });

  const [lastUpdated, setLastUpdated] = useState(null);

  // Intentar consultar API de tipo de cambio en tiempo real (con timeout suave)
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    fetch("https://open.er-api.com/v6/latest/USD", { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Status " + res.status);
        return res.json();
      })
      .then((data) => {
        if (isMounted && data && data.rates) {
          setRates((prev) => {
            const updated = { ...prev };
            Object.keys(CURRENCIES).forEach((code) => {
              if (data.rates[code]) {
                updated[code] = data.rates[code];
              }
            });
            return updated;
          });
          setLastUpdated(new Date().toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }));
        }
      })
      .catch(() => {
        // Fallback a los tipos de cambio simulados precisos de Google Finance
      })
      .finally(() => {
        clearTimeout(timeoutId);
      });

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const changeCurrency = (code) => {
    if (CURRENCIES[code]) {
      setCurrencyCode(code);
      localStorage.setItem("huskybyte_currency", code);
    }
  };

  const currentCurrency = CURRENCIES[currencyCode] || CURRENCIES.ARS;

  /**
   * Convierte un monto desde su moneda base original a la moneda activa
   * @param {number} amount Monto numérico
   * @param {"ARS"|"USD"} fromCurrency Moneda de origen (los cursos vienen en ARS, los planes en USD)
   */
  const convertAmount = (amount, fromCurrency = "ARS") => {
    if (amount === 0 || amount === null || amount === undefined) return 0;
    const num = Number(amount);
    if (isNaN(num)) return 0;

    // Convertir primero a USD pivote
    const fromRate = rates[fromCurrency] || CURRENCIES[fromCurrency]?.rateToUSD || 1.0;
    const usdValue = fromCurrency === "USD" ? num : num / fromRate;

    // Convertir de USD a la moneda activa
    const toRate = rates[currencyCode] || currentCurrency.rateToUSD || 1.0;
    return usdValue * toRate;
  };

  /**
   * Formatea un número en la moneda seleccionada
   */
  const formatRawNumber = (num, overrideDecimals) => {
    const decimals = overrideDecimals !== undefined ? overrideDecimals : currentCurrency.decimals;
    return new Intl.NumberFormat(currentCurrency.locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  /**
   * Obtiene la información completa de precios (base, impuestos, etc.)
   */
  const getPriceInfo = (amount, fromCurrency = "ARS") => {
    if (amount === 0 || amount === "0") {
      return {
        isFree: true,
        display: "Gratis",
        isARS: false,
      };
    }

    const convertedBase = convertAmount(amount, fromCurrency);

    if (currencyCode === "ARS") {
      const taxRate = CURRENCIES.ARS.taxRate; // 0.60
      const taxAmount = convertedBase * taxRate;
      const finalPrice = convertedBase + taxAmount;

      return {
        isFree: false,
        isARS: true,
        currencyCode: "ARS",
        currencySymbol: "$",
        baseAmount: convertedBase,
        taxAmount,
        taxRatePercent: Math.round(taxRate * 100),
        finalAmount: finalPrice,
        baseFormatted: `$ ${formatRawNumber(convertedBase)}`,
        finalFormatted: `$ ${formatRawNumber(finalPrice)}`,
      };
    }

    return {
      isFree: false,
      isARS: false,
      currencyCode: currentCurrency.code,
      currencySymbol: currentCurrency.symbol,
      amount: convertedBase,
      formatted: `${currentCurrency.symbol} ${formatRawNumber(convertedBase)}`,
    };
  };

  return (
    <CurrencyContext.Provider
      value={{
        currencyCode,
        currentCurrency,
        currencies: CURRENCIES,
        changeCurrency,
        rates,
        lastUpdated,
        convertAmount,
        getPriceInfo,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    const defaultCurr = CURRENCIES.ARS;
    const formatNum = (val) => new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(val);
    return {
      currencyCode: "ARS",
      currentCurrency: defaultCurr,
      currencies: CURRENCIES,
      changeCurrency: () => {},
      rates: { ARS: 1180, USD: 1.0, EUR: 0.92, CLP: 960, BRL: 5.75, COP: 4350, UYU: 42.5 },
      lastUpdated: null,
      convertAmount: (amt) => Number(amt) || 0,
      getPriceInfo: (amount) => {
        const num = Number(amount) || 0;
        if (num === 0) return { isFree: true, display: "Gratis", isARS: false };
        const taxRate = 0.60;
        const finalPrice = num * (1 + taxRate);
        return {
          isFree: false,
          isARS: true,
          currencyCode: "ARS",
          currencySymbol: "$",
          baseAmount: num,
          taxAmount: num * taxRate,
          taxRatePercent: 60,
          finalAmount: finalPrice,
          baseFormatted: `$ ${formatNum(num)}`,
          finalFormatted: `$ ${formatNum(finalPrice)}`,
        };
      },
    };
  }
  return context;
}

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircleIcon, AcademicCapIcon, StarIcon, InfoIcon } from "../components/Icons";
import { useCurrency } from "../context/CurrencyContext";
import { PriceDisplay } from "../components/PriceDisplay";

export function PlansPage() {
  const [billingCycle, setBillingCycle] = useState("monthly"); // "monthly" | "yearly"
  const { getPriceInfo } = useCurrency();

  const isYearly = billingCycle === "yearly";

  // Precios base en USD con reducción del ~17% aplicada
  // Learner: antes $12/mes -> ahora $10/mes. Anual: antes $115/año -> ahora $96/año ($8/mes)
  // Pro: antes $30/mes -> ahora $25/mes. Anual: antes $288/año -> ahora $240/año ($20/mes)
  const learnerAmount = isYearly ? 96 : 10;
  const learnerMonthlyEq = isYearly ? 8 : 10;

  const proAmount = isYearly ? 240 : 25;
  const proMonthlyEq = isYearly ? 20 : 25;

  const learnerEqInfo = getPriceInfo(learnerMonthlyEq, "USD");
  const proEqInfo = getPriceInfo(proMonthlyEq, "USD");

  return (
    <main className="page-content">
      {/* Header */}
      <section className="plans-hero-section">
        <div className="container plans-hero-container">
          <div className="hero-pill">
            <span className="hero-pill-dot"></span>
            Suscripciones HuskyByte
          </div>
          <h1 className="plans-hero-title">
            Invertí en tu futuro con nuestros <span className="gradient-text">planes de suscripción</span>
          </h1>
          <p className="plans-hero-subtitle">
            Accedé a formación continua, mentorías personalizadas y certificaciones para dar el salto profesional en la industria IT.
          </p>

          {/* Toggle Mensual / Anual */}
          <div className="billing-toggle-wrap">
            <div className="billing-toggle-container" role="radiogroup" aria-label="Frecuencia de facturación">
              <button
                type="button"
                role="radio"
                aria-checked={!isYearly}
                className={`billing-toggle-btn ${!isYearly ? "active" : ""}`}
                onClick={() => setBillingCycle("monthly")}
              >
                Facturación Mensual
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={isYearly}
                className={`billing-toggle-btn ${isYearly ? "active" : ""}`}
                onClick={() => setBillingCycle("yearly")}
              >
                Facturación Anual
                <span className="discount-pill">Ahorrá 20%</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Planes */}
      <section className="container plans-grid-section">
        <div className="plans-grid">
          {/* Plan 1: Learner */}
          <article className="plan-card card">
            <div className="plan-card-header">
              <span className="plan-tag">Inicial</span>
              <h2 className="plan-name">Plan Learner</h2>
              <p className="plan-description">
                Ideal para quienes quieren comenzar a formarse y explorar todo el catálogo de tecnologías.
              </p>
            </div>

            <div className="plan-pricing">
              <div className="plan-price-row">
                <PriceDisplay amount={learnerAmount} fromCurrency="USD" size="lg" />
                <span className="period">/{isYearly ? "año" : "mes"}</span>
              </div>
              {isYearly && (
                <p className="price-subnote">
                  Equivale a <strong>{learnerEqInfo.isARS ? learnerEqInfo.finalFormatted : learnerEqInfo.formatted}/mes</strong> (Ahorrás 2 meses)
                </p>
              )}
            </div>

            <Link to="/register" className="btn btn-outline w-full plan-cta-btn">
              Comenzar con Learner
            </Link>

            <div className="plan-features">
              <h3 className="features-title">Qué incluye:</h3>
              <ul className="features-list">
                <li><CheckCircleIcon size={18} /> Acceso ilimitado a todos los cursos</li>
                <li><CheckCircleIcon size={18} /> Proyectos prácticos de portfolio</li>
                <li><CheckCircleIcon size={18} /> Certificados digitales oficiales UTN</li>
                <li><CheckCircleIcon size={18} /> Comunidad activa de estudiantes</li>
                <li><CheckCircleIcon size={18} /> Foros de consulta con docentes</li>
              </ul>
            </div>
          </article>

          {/* Plan 2: Pro (Destacado) */}
          <article className="plan-card card plan-card-featured">
            <div className="featured-ribbon">Recomendado · Más Popular</div>
            <div className="plan-card-header">
              <span className="plan-tag plan-tag-pro">Aceleración</span>
              <h2 className="plan-name">Plan Pro</h2>
              <p className="plan-description">
                Para quienes buscan una inserción laboral rápida con mentorías directas y preparación profesional.
              </p>
            </div>

            <div className="plan-pricing">
              <div className="plan-price-row">
                <PriceDisplay amount={proAmount} fromCurrency="USD" size="lg" />
                <span className="period">/{isYearly ? "año" : "mes"}</span>
              </div>
              {isYearly && (
                <p className="price-subnote">
                  Equivale a <strong>{proEqInfo.isARS ? proEqInfo.finalFormatted : proEqInfo.formatted}/mes</strong> (Ahorrás 2 meses)
                </p>
              )}
            </div>

            <Link to="/register" className="btn btn-primary w-full plan-cta-btn">
              Elegir Plan Pro
            </Link>

            <div className="plan-features">
              <h3 className="features-title">Todo lo de Learner, más:</h3>
              <ul className="features-list">
                <li><StarIcon size={18} filled className="text-primary" /> <strong>1 Mentoría 1 a 1 mensual</strong> con un profesor experto</li>
                <li><CheckCircleIcon size={18} /> <strong>Corrección de código prioritaria</strong> en menos de 24hs</li>
                <li><CheckCircleIcon size={18} /> Acceso anticipado a nuevos bootcamps y lanzamientos</li>
                <li><CheckCircleIcon size={18} /> Repositorio exclusivo con código fuente y soluciones</li>
                <li><CheckCircleIcon size={18} /> Simulacros de entrevistas técnicas y revisión de CV</li>
                <li><CheckCircleIcon size={18} /> Insignia distintiva Pro en tu perfil de alumno</li>
              </ul>
            </div>
          </article>

          {/* Plan 3: Enterprise / Education */}
          <article className="plan-card card plan-card-enterprise">
            <div className="plan-card-header">
              <span className="plan-tag plan-tag-enterprise">Institucional</span>
              <h2 className="plan-name">Enterprise / Education</h2>
              <p className="plan-description">
                Exclusivo para empresas, universidades e instituciones educativas que deseen capacitar a sus equipos.
              </p>
            </div>

            <div className="plan-pricing">
              <div className="price-display price-custom">
                <span className="amount-custom">Personalizado</span>
              </div>
              <p className="price-subnote">Según cantidad de licencias y módulos solicitados</p>
            </div>

            <a
              href="mailto:institucional@huskybyte.com?subject=Consulta%20Plan%20Enterprise/Education"
              className="btn btn-secondary w-full plan-cta-btn"
            >
              Solicitar demo institucional
            </a>

            <div className="plan-features">
              <h3 className="features-title">Beneficios corporativos:</h3>
              <ul className="features-list">
                <li><AcademicCapIcon size={18} /> Válido <strong>únicamente para empresas e instituciones</strong></li>
                <li><CheckCircleIcon size={18} /> Panel de administración y métricas de avance en vivo</li>
                <li><CheckCircleIcon size={18} /> Licencias corporativas masivas y transferibles</li>
                <li><CheckCircleIcon size={18} /> Rutas de aprendizaje personalizadas para tu empresa</li>
                <li><CheckCircleIcon size={18} /> Integración con SSO empresarial (Google, Azure, Okta)</li>
                <li><CheckCircleIcon size={18} /> Account Manager y soporte prioritario 24/7</li>
              </ul>
            </div>
          </article>
        </div>

        {/* Garantía y Confianza */}
        <div className="plans-guarantee-box">
          <InfoIcon size={20} className="guarantee-icon" />
          <p>
            Todos los planes individuales incluyen garantía de satisfacción de 7 días. Podés cancelar en cualquier momento desde tu panel sin penalidades.
          </p>
        </div>
      </section>
    </main>
  );
}

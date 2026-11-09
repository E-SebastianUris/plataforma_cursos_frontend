import React, { useState, useRef, useEffect, useCallback } from "react";

export function ImageCropperModal({ imageSrc, onConfirm, onCancel }) {
  const CROP_SIZE = 300;     // 300x300 px de área de recorte circular
  const OUTPUT_SIZE = 400;   // 400x400 px de resolución final exportada

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);
  const [naturalSize, setNaturalSize] = useState({ width: 0, height: 0 });

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Carga robusta de la imagen (funciona con DataURL, blob o URL externa)
  useEffect(() => {
    if (!imageSrc) return;

    setZoom(1);
    setOffset({ x: 0, y: 0 });

    const img = new Image();
    img.onload = () => {
      setNaturalSize({ width: img.naturalWidth || 300, height: img.naturalHeight || 300 });
      setImgLoaded(true);
    };
    img.onerror = () => {
      setImgLoaded(true); // Permitir desbloqueo aun con fallback
    };
    img.src = imageSrc;

    if (img.complete && img.naturalWidth) {
      setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
      setImgLoaded(true);
    }
  }, [imageSrc]);

  // Dimensiones calculadas para que la imagen cubra completamente el círculo (object-fit: cover)
  const nw = naturalSize.width || 300;
  const nh = naturalSize.height || 300;
  const baseScale = Math.max(CROP_SIZE / nw, CROP_SIZE / nh);
  const baseWidth = nw * baseScale;
  const baseHeight = nh * baseScale;

  const currentWidth = baseWidth * zoom;
  const currentHeight = baseHeight * zoom;

  // Manejo de drag con Mouse
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - offset.x,
      y: e.clientY - offset.y,
    });
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Manejo de drag con Touch (Mobile/Tablet)
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({
        x: touch.clientX - offset.x,
        y: touch.clientY - offset.y,
      });
    }
  };

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Zoom helpers
  const handleZoomChange = (e) => {
    setZoom(parseFloat(e.target.value));
  };

  const handleZoomStep = (delta) => {
    setZoom((prev) => Math.min(3, Math.max(1, parseFloat((prev + delta).toFixed(2)))));
  };

  // Recorte final en Canvas off-screen
  const handleCropComplete = () => {
    const img = imageRef.current;
    if (!img) return;

    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Creamos máscara circular en el canvas
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Proporción de resolución entre el visor y el canvas exportado
    const ratio = OUTPUT_SIZE / CROP_SIZE;

    // Posición en el canvas
    const drawX = ((CROP_SIZE - currentWidth) / 2 + offset.x) * ratio;
    const drawY = ((CROP_SIZE - currentHeight) / 2 + offset.y) * ratio;
    const drawW = currentWidth * ratio;
    const drawH = currentHeight * ratio;

    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    const croppedBase64 = canvas.toDataURL("image/jpeg", 0.92);
    onConfirm(croppedBase64);
  };

  return (
    <div className="modal-backdrop cropper-backdrop" role="dialog" aria-modal="true" aria-labelledby="cropper-title">
      <div className="cropper-modal-card card">
        <div className="cropper-modal-header">
          <h2 id="cropper-title" className="cropper-modal-title">Ajustar Foto de Perfil</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onCancel}
            aria-label="Cerrar modal de recorte"
          >
            ✕
          </button>
        </div>

        <p className="cropper-instructions">
          Arrastrá con el mouse o dedo y ajustá el zoom para centrar tu foto en el círculo:
        </p>

        {/* Viewport de recorte con máscara circular */}
        <div
          ref={containerRef}
          className="cropper-viewport-wrap"
          style={{ width: `${CROP_SIZE}px`, height: `${CROP_SIZE}px` }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Imagen arrastrable y escalable con posicionamiento absoluto preciso */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Vista previa para recortar"
            className="cropper-target-img"
            style={{
              width: `${currentWidth}px`,
              height: `${currentHeight}px`,
              left: `${(CROP_SIZE - currentWidth) / 2 + offset.x}px`,
              top: `${(CROP_SIZE - currentHeight) / 2 + offset.y}px`,
              cursor: isDragging ? "grabbing" : "grab",
              userSelect: "none",
              pointerEvents: "none",
            }}
            draggable={false}
          />

          {/* Máscara circular superpuesta */}
          <div className="cropper-mask-overlay">
            <div className="cropper-circle-hole" style={{ width: `${CROP_SIZE}px`, height: `${CROP_SIZE}px` }}>
              <div className="cropper-circle-border" />
            </div>
          </div>
        </div>

        {/* Controles de Zoom */}
        <div className="cropper-controls-row">
          <span className="cropper-control-label">Zoom:</span>
          <button
            type="button"
            className="btn btn-secondary btn-sm cropper-zoom-btn"
            onClick={() => handleZoomStep(-0.2)}
            disabled={zoom <= 1}
            title="Alejar"
          >
            -
          </button>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={handleZoomChange}
            className="cropper-zoom-slider"
            aria-label="Nivel de zoom"
          />
          <button
            type="button"
            className="btn btn-secondary btn-sm cropper-zoom-btn"
            onClick={() => handleZoomStep(0.2)}
            disabled={zoom >= 3}
            title="Acercar"
          >
            +
          </button>
          <span className="cropper-zoom-value">{Math.round(zoom * 100)}%</span>
        </div>

        {/* Botones de acción: "Aplicar recorte" siempre habilitado y clickeable */}
        <div className="cropper-actions-row">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCropComplete}
          >
            Aplicar recorte
          </button>
        </div>
      </div>
    </div>
  );
}

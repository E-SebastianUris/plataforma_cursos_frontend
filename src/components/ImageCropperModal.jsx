import React, { useState, useRef, useEffect, useCallback } from "react";

export function ImageCropperModal({ imageSrc, onConfirm, onCancel }) {
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const imageRef = useRef(null);
  const containerRef = useRef(null);

  // Dimensiones del visor de recorte
  const CROP_SIZE = 300; // 300x300 px de área de recorte circular

  // Reset offset cuando cambia la imagen
  useEffect(() => {
    setOffset({ x: 0, y: 0 });
    setZoom(1);
    setImgLoaded(false);
  }, [imageSrc]);

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

  // Recorte final en Canvas
  const handleCropComplete = () => {
    const img = imageRef.current;
    if (!img) return;

    const OUTPUT_SIZE = 400; // Resolución final de 400x400 px
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Calcular escala y posición relativa entre el elemento visual y la imagen real
    const rect = img.getBoundingClientRect();
    const scaleRatio = OUTPUT_SIZE / CROP_SIZE;

    // Centro del círculo en el canvas
    ctx.imageSmoothingQuality = "high";

    // Creamos recorte circular en el canvas
    ctx.beginPath();
    ctx.arc(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, OUTPUT_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Dibujamos la imagen posicionada y escalada
    const drawX = (offset.x + (CROP_SIZE - rect.width) / 2) * scaleRatio;
    const drawY = (offset.y + (CROP_SIZE - rect.height) / 2) * scaleRatio;
    const drawW = rect.width * scaleRatio;
    const drawH = rect.height * scaleRatio;

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
          Arrastrá y ajustá el zoom para centrar tu foto dentro del círculo:
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
          {/* Imagen arrastrable y escalable */}
          <img
            ref={imageRef}
            src={imageSrc}
            alt="Vista previa para recortar"
            className="cropper-target-img"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              cursor: isDragging ? "grabbing" : "grab",
            }}
            onLoad={() => setImgLoaded(true)}
            draggable={false}
          />

          {/* Máscara circular translúcida superpuesta */}
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

        {/* Botones de acción */}
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
            disabled={!imgLoaded}
          >
            Aplicar recorte
          </button>
        </div>
      </div>
    </div>
  );
}

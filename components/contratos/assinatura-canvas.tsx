"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface AssinaturaCanvasProps {
  onConfirm: (base64: string) => void;
  disabled?: boolean;
}

function getCoords(
  e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  if ("touches" in e) {
    const touch = e.touches[0] ?? (e as React.TouchEvent).changedTouches[0];
    if (!touch) return { x: 0, y: 0 };
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }
  return {
    x: (e as React.MouseEvent<HTMLCanvasElement>).clientX - rect.left,
    y: (e as React.MouseEvent<HTMLCanvasElement>).clientY - rect.top,
  };
}

export function AssinaturaCanvas({ onConfirm, disabled }: AssinaturaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isEmpty, setIsEmpty] = useState(true);
  const isDrawingRef = useRef(false);
  const isEmptyRef = useRef(true);

  const draw = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas || disabled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.lineTo(x, y);
      ctx.stroke();
      setIsEmpty(false);
    },
    [disabled]
  );

  const startDrawing = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas || disabled) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      isDrawingRef.current = true;
      ctx.beginPath();
      ctx.moveTo(x, y);
    },
    [disabled]
  );

  const endDrawing = useCallback(() => {
    isDrawingRef.current = false;
  }, []);

  useEffect(() => {
    isEmptyRef.current = isEmpty;
  }, [isEmpty]);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prevWidth = canvas.width;
    const prevHeight = canvas.height;
    let previousContent: HTMLCanvasElement | null = null;
    if (prevWidth > 0 && prevHeight > 0 && !isEmptyRef.current) {
      previousContent = document.createElement("canvas");
      previousContent.width = prevWidth;
      previousContent.height = prevHeight;
      const previousCtx = previousContent.getContext("2d");
      if (previousCtx) {
        previousCtx.drawImage(canvas, 0, 0);
      }
    }

    const dpr = window.devicePixelRatio ?? 1;
    const rect = canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, Math.floor(rect.width * dpr));
    const nextHeight = Math.max(1, Math.floor(rect.height * dpr));
    if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (previousContent) {
      ctx.drawImage(previousContent, 0, 0, previousContent.width, previousContent.height, 0, 0, rect.width, rect.height);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("orientationchange", resizeCanvas);
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("orientationchange", resizeCanvas);
    };
  }, [resizeCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCoords(e, canvasRef.current!);
    startDrawing(coords.x, coords.y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const coords = getCoords(e, canvasRef.current!);
    draw(coords.x, coords.y);
  };

  const handleMouseUp = () => endDrawing();
  const handleMouseLeave = () => endDrawing();

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const coords = getCoords(e, canvasRef.current!);
    startDrawing(coords.x, coords.y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawingRef.current) return;
    const coords = getCoords(e, canvasRef.current!);
    draw(coords.x, coords.y);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    endDrawing();
  };

  const handleTouchCancel = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    endDrawing();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio ?? 1;
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
    setIsEmpty(true);
  };

  const confirm = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.replace(/^data:image\/png;base64,/, "");
    onConfirm(base64);
  };

  return (
    <div className="space-y-3">
      <Label>Desenhe sua assinatura abaixo</Label>
      <div className="border border-input rounded-md bg-white overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-[180px] block touch-none cursor-crosshair"
          style={{ width: "100%", height: "180px" }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchCancel}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="min-h-10" onClick={clear} disabled={disabled}>
          Limpar
        </Button>
        <Button
          type="button"
          className="min-h-10"
          onClick={confirm}
          disabled={disabled || isEmpty}
        >
          Confirmar assinatura
        </Button>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useEmpresa } from "@/lib/empresa-context";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const { empresa } = useEmpresa();
  const logoUrl = empresa?.logo_url || "/LogoFabinho.png";
  const alt = empresa?.nome || "Buffet";
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  };
  const pixelSizes = {
    sm: 32,
    md: 48,
    lg: 80,
  };

  return (
    <div className={`${sizes[size]} relative`}>
      <Image
        src={logoUrl}
        alt={alt}
        width={pixelSizes[size]}
        height={pixelSizes[size]}
        className="object-contain"
        priority
        unoptimized={logoUrl.startsWith("http")}
      />
    </div>
  );
}

export function LogoWithText({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const { empresa } = useEmpresa();
  const nomeExibicao = empresa?.nome || "Buffet";
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <div className="flex items-center gap-3">
      <Logo size={size} />
      <div>
        <h2 className={`font-bold text-gray-900 leading-none ${textSizes[size]}`}>
          {nomeExibicao}
        </h2>
        <p className="text-xs text-primary font-medium">Gestão de Festas</p>
      </div>
    </div>
  );
}


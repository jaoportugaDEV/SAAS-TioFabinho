import Image from "next/image";

export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
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
        src="/LogoFabinho.png"
        alt="Tio Fabinho Buffet"
        width={pixelSizes[size]}
        height={pixelSizes[size]}
        className="object-contain"
        priority
      />
    </div>
  );
}

export function LogoWithText({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
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
          Tio Fabinho
        </h2>
        <p className="text-xs text-primary font-medium">Buffet</p>
      </div>
    </div>
  );
}


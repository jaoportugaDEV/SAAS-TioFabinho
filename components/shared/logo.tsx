export function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-8 h-8 text-base",
    md: "w-12 h-12 text-xl",
    lg: "w-20 h-20 text-4xl",
  };

  return (
    <div
      className={`${sizes[size]} bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg`}
    >
      <span className="font-bold text-white">TF</span>
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


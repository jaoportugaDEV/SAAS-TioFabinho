"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { useUser } from "@/hooks/useUser";
import { EmpresaProvider, useEmpresa } from "@/lib/empresa-context";
import { hexToHSL } from "@/lib/utils";
import type { Empresa } from "@/types";

const DEFAULT_PRIMARY_HSL = "0 84% 51%";
const DEFAULT_PRIMARY_FOREGROUND = "0 0% 100%";

function ThemeFromEmpresa({
  children,
  sidebarOpen,
  onMenuClick,
  onCloseSidebar,
  userEmail,
}: {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onMenuClick: () => void;
  onCloseSidebar: () => void;
  userEmail: string | undefined;
}) {
  const { empresa } = useEmpresa();
  const hsl = empresa?.cor_primaria ? hexToHSL(empresa.cor_primaria) : DEFAULT_PRIMARY_HSL;
  const style = {
    ["--primary"]: hsl,
    ["--primary-foreground"]: DEFAULT_PRIMARY_FOREGROUND,
    ["--ring"]: hsl,
  } as React.CSSProperties;

  return (
    <div className="min-h-screen bg-gray-50" style={style}>
      <Sidebar open={sidebarOpen} onClose={onCloseSidebar} />
      <div className="lg:pl-64">
        <Header onMenuClick={onMenuClick} userEmail={userEmail} />
        <main className="p-3 sm:p-4 lg:p-6 max-w-full overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}

export function DashboardShell({
  children,
  initialEmpresa,
  initialEmpresaId,
}: {
  children: React.ReactNode;
  initialEmpresa: Empresa | null;
  initialEmpresaId: string | null;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeDistanceX = touchEndX - touchStartX;
      const swipeDistanceY = Math.abs(touchEndY - touchStartY);
      if (
        touchStartX < 50 &&
        swipeDistanceX > 100 &&
        swipeDistanceY < 100 &&
        !sidebarOpen
      ) {
        setSidebarOpen(true);
      }
    };

    if (window.innerWidth < 1024) {
      document.addEventListener("touchstart", handleTouchStart);
      document.addEventListener("touchend", handleTouchEnd);
    }
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [sidebarOpen]);

  return (
    <EmpresaProvider
      initialEmpresa={initialEmpresa}
      initialEmpresaId={initialEmpresaId}
    >
      <ThemeFromEmpresa
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
        onCloseSidebar={() => setSidebarOpen(false)}
        userEmail={user?.email}
      >
        {children}
      </ThemeFromEmpresa>
    </EmpresaProvider>
  );
}

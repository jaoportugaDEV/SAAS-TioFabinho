"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { useUser } from "@/hooks/useUser";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  // Detectar swipe para abrir sidebar no mobile
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
      
      // Detectar swipe da esquerda para direita
      // Condições:
      // 1. Começar perto da borda esquerda (primeiros 50px)
      // 2. Deslizar pelo menos 100px para direita
      // 3. Movimento vertical menor que 100px (para não confundir com scroll)
      // 4. Sidebar ainda não está aberto
      if (
        touchStartX < 50 && // Começa na borda esquerda
        swipeDistanceX > 100 && // Desliza pelo menos 100px para direita
        swipeDistanceY < 100 && // Pouco movimento vertical
        !sidebarOpen // Sidebar fechado
      ) {
        setSidebarOpen(true);
      }
    };

    // Adicionar listeners apenas em mobile (telas menores que 1024px)
    if (window.innerWidth < 1024) {
      document.addEventListener('touchstart', handleTouchStart);
      document.addEventListener('touchend', handleTouchEnd);
    }

    // Cleanup
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [sidebarOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          userEmail={user?.email}
        />
        
        <main className="p-3 sm:p-4 lg:p-6 max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}


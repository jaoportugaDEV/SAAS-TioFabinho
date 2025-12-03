"use client";

import { Menu, LogOut, User } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";

interface HeaderProps {
  onMenuClick: () => void;
  userEmail?: string;
}

export function Header({ onMenuClick, userEmail }: HeaderProps) {
  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      {/* Logo centralizada - visível apenas em telas maiores */}
      <div className="hidden lg:flex justify-center py-3 border-b border-gray-100">
        <div className="w-12 h-12 relative">
          <Image
            src="/LogoFabinho.png"
            alt="Tio Fabinho Buffet"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
      </div>

      {/* Barra de navegação */}
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {userEmail && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{userEmail}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}


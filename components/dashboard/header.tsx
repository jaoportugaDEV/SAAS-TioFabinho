"use client";

import { Menu, LogOut, User } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/actions/auth";
import { useEmpresa } from "@/lib/empresa-context";

interface HeaderProps {
  onMenuClick: () => void;
  userEmail?: string;
}

export function Header({ onMenuClick, userEmail }: HeaderProps) {
  const { empresa } = useEmpresa();
  const logoUrl = empresa?.logo_url || "/LogoFabinho.png";
  const altLogo = empresa?.nome || "Buffet";

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="hidden lg:flex justify-center py-3 border-b border-gray-100">
        <div className="w-12 h-12 relative">
          <Image
            src={logoUrl}
            alt={altLogo}
            width={48}
            height={48}
            className="object-contain"
            unoptimized={logoUrl.startsWith("http")}
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

          <div className="flex lg:hidden absolute left-1/2 transform -translate-x-1/2">
            <div className="w-10 h-10 relative">
              <Image
                src={logoUrl}
                alt={altLogo}
                width={40}
                height={40}
                className="object-contain"
                unoptimized={logoUrl.startsWith("http")}
              />
            </div>
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


"use client";

import { Menu, LogOut, User } from "lucide-react";
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
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 py-4">
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
          <h1 className="text-xl font-semibold text-gray-900 hidden sm:block">
            Sistema de Gestão de Festas
          </h1>
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
    </header>
  );
}


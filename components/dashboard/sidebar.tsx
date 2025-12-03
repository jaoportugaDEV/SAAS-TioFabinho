"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  PartyPopper,
  DollarSign,
  Wallet,
  FileText,
  Calculator,
  CheckSquare,
  MessageSquare,
  Settings,
  X,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Festas",
    href: "/dashboard/festas",
    icon: PartyPopper,
  },
  {
    title: "Freelancers",
    href: "/dashboard/freelancers",
    icon: Users,
  },
  {
    title: "Calendário",
    href: "/dashboard/calendario",
    icon: Calendar,
  },
  {
    title: "Financeiro",
    href: "/dashboard/financeiro",
    icon: DollarSign,
  },
  {
    title: "Pagamentos",
    href: "/dashboard/pagamentos",
    icon: Wallet,
  },
  {
    title: "Contratos",
    href: "/dashboard/contratos",
    icon: FileText,
  },
  {
    title: "Orçamentos",
    href: "/dashboard/orcamentos",
    icon: Calculator,
  },
  {
    title: "Configurações",
    href: "/dashboard/configuracoes",
    icon: Settings,
  },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image
                src="/LogoFabinho.png"
                alt="Tio Fabinho Buffet"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Tio Fabinho</h2>
              <p className="text-xs text-primary font-medium">Buffet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onClose()}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}


"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEmpresa } from "@/lib/empresa-context";
import {
  LayoutDashboard,
  Calendar,
  Users,
  UserCircle,
  PartyPopper,
  DollarSign,
  Wallet,
  FileText,
  Calculator,
  CheckSquare,
  MessageSquare,
  Settings,
  X,
  BarChart3,
  Building2,
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
    title: "Clientes",
    href: "/dashboard/clientes",
    icon: UserCircle,
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
    title: "Relatórios",
    href: "/dashboard/relatorios",
    icon: BarChart3,
  },
  {
    title: "Por unidade",
    href: "/dashboard/por-unidade",
    icon: Building2,
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
  const { empresa } = useEmpresa();
  const logoUrl = empresa?.logo_url || "/LogoFabinho.png";
  const nomeExibicao = empresa?.nome || "Buffet";

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[85vw] max-w-64 bg-white border-r border-gray-200 transition-transform duration-300 lg:w-64 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative">
              <Image
                src={logoUrl.startsWith("http") ? logoUrl : logoUrl}
                alt={empresa?.nome || "Buffet"}
                width={40}
                height={40}
                className="object-contain"
                unoptimized={logoUrl.startsWith("http")}
              />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 truncate max-w-[140px]" title={nomeExibicao}>{nomeExibicao}</h2>
              <p className="text-xs text-primary font-medium">Gestão de Festas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-gray-100 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="h-[calc(100%-88px)] overflow-y-auto p-4 space-y-1">
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


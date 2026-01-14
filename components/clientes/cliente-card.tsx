"use client";

import Link from "next/link";
import { Cliente, ClienteComEstatisticas } from "@/types";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Eye, Calendar, DollarSign } from "lucide-react";
import { formatPhone, whatsappLink, formatCurrency, formatDate } from "@/lib/utils";

interface ClienteCardProps {
  cliente: ClienteComEstatisticas;
}

export function ClienteCard({ cliente }: ClienteCardProps) {
  // Definir badge baseado no número de festas
  const getBadgeCliente = () => {
    if (cliente.total_festas >= 5) {
      return { label: "VIP ⭐", color: "bg-yellow-500 text-white" };
    }
    if (cliente.total_festas >= 3) {
      return { label: "Fiel 💎", color: "bg-purple-500 text-white" };
    }
    if (cliente.total_festas === 1) {
      return { label: "Novo 🆕", color: "bg-green-500 text-white" };
    }
    return null;
  };

  const badge = getBadgeCliente();

  return (
    <Card className="p-4 sm:p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-3 sm:gap-4 mb-4">
        <Avatar className="w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
          <AvatarFallback className="bg-primary text-white text-base sm:text-lg font-semibold">
            {cliente.nome.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
              {cliente.nome}
            </h3>
            <div className="flex items-center gap-1 flex-shrink-0">
              {badge && (
                <Badge className={`${badge.color} text-xs`}>
                  {badge.label}
                </Badge>
              )}
              <Badge
                variant={cliente.ativo ? "default" : "destructive"}
                className={`text-xs ${cliente.ativo ? "bg-green-600 hover:bg-green-700" : ""}`}
              >
                {cliente.ativo ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs sm:text-sm text-gray-600">
              📞 {formatPhone(cliente.telefone)}
            </p>
            {cliente.email && (
              <p className="text-xs sm:text-sm text-gray-600 truncate">
                ✉️ {cliente.email}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Festas</p>
            <p className="text-sm font-bold text-gray-900">{cliente.total_festas}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-sm font-bold text-gray-900 truncate">
              {formatCurrency(cliente.valor_total_gasto)}
            </p>
          </div>
        </div>
      </div>

      {cliente.ultima_festa_data && (
        <p className="text-xs text-gray-500 mb-4">
          🕒 Última festa: {formatDate(cliente.ultima_festa_data)}
        </p>
      )}

      {/* Botões */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="flex-1 gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
          onClick={() => window.open(whatsappLink(cliente.whatsapp || cliente.telefone), "_blank")}
        >
          <MessageCircle className="w-4 h-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>
        <Link href={`/dashboard/clientes/${cliente.id}`} className="flex-1">
          <Button size="sm" variant="outline" className="w-full gap-2">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Ver Detalhes</span>
            <span className="sm:hidden">Ver</span>
          </Button>
        </Link>
      </div>
    </Card>
  );
}

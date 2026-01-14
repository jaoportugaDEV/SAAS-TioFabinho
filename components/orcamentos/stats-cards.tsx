"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, TrendingUp, Clock, CheckCircle } from "lucide-react";

interface StatsCardsProps {
  totalGeral: number;
  totalPago: number;
  totalPendente: number;
  totalParcial: number;
  quantidadeTotal: number;
}

export function StatsCards({
  totalGeral,
  totalPago,
  totalPendente,
  totalParcial,
  quantidadeTotal,
}: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const stats = [
    {
      title: "Total em Orçamentos",
      value: formatCurrency(totalGeral),
      icon: DollarSign,
      description: `${quantidadeTotal} orçamento${quantidadeTotal !== 1 ? "s" : ""}`,
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200",
    },
    {
      title: "Total Pago",
      value: formatCurrency(totalPago),
      icon: CheckCircle,
      description: "Inclui parcelas pagas",
      bgColor: "bg-green-50",
      iconColor: "text-green-600",
      borderColor: "border-green-200",
    },
    {
      title: "Pagamento Parcial",
      value: formatCurrency(totalParcial),
      icon: TrendingUp,
      description: "Pagamentos em andamento",
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-600",
      borderColor: "border-yellow-200",
    },
    {
      title: "Total Pendente",
      value: formatCurrency(totalPendente),
      icon: Clock,
      description: "Aguardando pagamento",
      bgColor: "bg-red-50",
      iconColor: "text-red-600",
      borderColor: "border-red-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card
            key={index}
            className={`${stat.bgColor} border ${stat.borderColor} hover:shadow-md transition-shadow`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


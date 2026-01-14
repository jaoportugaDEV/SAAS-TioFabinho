import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Flame } from "lucide-react";
import { MesMaiorDemanda } from "@/types";

interface MesDestaqueCardProps {
  mesMaiorDemanda: MesMaiorDemanda | null;
}

export function MesDestaqueCard({ mesMaiorDemanda }: MesDestaqueCardProps) {
  if (!mesMaiorDemanda) {
    return null;
  }

  const { mes_nome, total_festas, percentual_acima_media } = mesMaiorDemanda;
  const isAcimaMedia = percentual_acima_media > 0;

  return (
    <Card className="bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 border-2 border-orange-200">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <CardTitle className="text-base sm:text-lg text-gray-900">
            Mês com Maior Demanda
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mês Destaque */}
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-orange-600 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                {mes_nome}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {total_festas} festa{total_festas !== 1 ? "s" : ""} realizada{total_festas !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Comparação com Média */}
        {isAcimaMedia && (
          <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  {percentual_acima_media}% acima da média mensal
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  Este foi o mês de pico de demanda do ano
                </p>
              </div>
            </div>
          </div>
        )}

        {!isAcimaMedia && (
          <div className="bg-gray-100 rounded-lg p-3">
            <p className="text-sm text-gray-600 text-center">
              Demanda dentro da média mensal
            </p>
          </div>
        )}

        {/* Dica */}
        <div className="border-t border-orange-200 pt-3">
          <p className="text-xs text-gray-600">
            💡 <strong>Dica:</strong> Use esta informação para planejar melhor a disponibilidade de freelancers e recursos nos meses de alta demanda.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

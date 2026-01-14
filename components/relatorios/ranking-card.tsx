import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award } from "lucide-react";

interface RankingCardProps {
  posicao: number;
  nome: string;
  valor: number;
  subtitulo?: string;
  tipo: "cliente" | "freelancer";
}

const getMedalha = (posicao: number) => {
  switch (posicao) {
    case 1:
      return { emoji: "🥇", cor: "from-yellow-100 to-yellow-50 border-yellow-300", icon: Trophy, iconColor: "text-yellow-600" };
    case 2:
      return { emoji: "🥈", cor: "from-gray-200 to-gray-50 border-gray-300", icon: Medal, iconColor: "text-gray-600" };
    case 3:
      return { emoji: "🥉", cor: "from-orange-100 to-orange-50 border-orange-300", icon: Award, iconColor: "text-orange-600" };
    case 4:
      return { emoji: "4º", cor: "from-blue-50 to-white border-blue-200", icon: Award, iconColor: "text-blue-600" };
    case 5:
      return { emoji: "5º", cor: "from-blue-50 to-white border-blue-200", icon: Award, iconColor: "text-blue-600" };
    default:
      return { emoji: `${posicao}º`, cor: "from-gray-50 to-white border-gray-200", icon: Award, iconColor: "text-gray-600" };
  }
};

export function RankingCard({ posicao, nome, valor, subtitulo, tipo }: RankingCardProps) {
  const medalha = getMedalha(posicao);
  const Icon = medalha.icon;

  return (
    <Card className={`bg-gradient-to-br ${medalha.cor} border-2 hover:shadow-lg transition-shadow`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Medalha/Posição */}
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center ${posicao <= 3 ? 'ring-2 ring-offset-2' : ''} ${posicao === 1 ? 'ring-yellow-400' : posicao === 2 ? 'ring-gray-400' : posicao === 3 ? 'ring-orange-400' : ''}`}>
              <span className="text-2xl">{medalha.emoji}</span>
            </div>
          </div>

          {/* Informações */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {nome}
                </p>
                {subtitulo && (
                  <p className="text-xs text-gray-600 mt-0.5 truncate">
                    {subtitulo}
                  </p>
                )}
              </div>
              <Icon className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${medalha.iconColor}`} />
            </div>

            {/* Contador */}
            <div className="mt-2 flex items-baseline gap-1">
              <span className={`text-xl sm:text-2xl font-bold ${medalha.iconColor}`}>
                {valor}
              </span>
              <span className="text-xs sm:text-sm text-gray-600">
                {tipo === "cliente" ? "festa(s)" : "festa(s)"}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

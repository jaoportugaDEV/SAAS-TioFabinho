import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RankingCliente, RankingFreelancer } from "@/types";

interface RankingTableProps {
  dados: RankingCliente[] | RankingFreelancer[];
  tipo: "cliente" | "freelancer";
  titulo: string;
}

const funcaoLabels: Record<string, string> = {
  monitor: "Monitor",
  cozinheira: "Cozinheira",
  fotografo: "Fotógrafo",
  garcom: "Garçom",
  recepcao: "Recepção",
  outros: "Outros",
};

export function RankingTable({ dados, tipo, titulo }: RankingTableProps) {
  if (dados.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">{titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            Nenhum {tipo === "cliente" ? "cliente" : "freelancer"} encontrado neste período
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">{titulo}</CardTitle>
        <p className="text-sm text-gray-500 mt-1">
          Total: {dados.length} {tipo === "cliente" ? "cliente(s)" : "freelancer(s)"}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">
                  #
                </th>
                <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">
                  Nome
                </th>
                {tipo === "freelancer" && (
                  <th className="text-left py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">
                    Função
                  </th>
                )}
                <th className="text-right py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-gray-700">
                  Festas
                </th>
              </tr>
            </thead>
            <tbody>
              {dados.map((item, index) => {
                const isTop3 = index < 3;
                const medalha = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "";
                
                return (
                  <tr
                    key={tipo === "cliente" ? (item as RankingCliente).cliente_id : (item as RankingFreelancer).freelancer_id}
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      isTop3 ? "bg-yellow-50/30" : index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                    }`}
                  >
                    <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full ${
                        isTop3 ? "bg-white shadow-sm font-semibold" : "bg-gray-100 text-gray-600"
                      }`}>
                        {medalha || item.posicao}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm font-medium text-gray-900">
                      {tipo === "cliente"
                        ? (item as RankingCliente).cliente_nome
                        : (item as RankingFreelancer).freelancer_nome}
                    </td>
                    {tipo === "freelancer" && (
                      <td className="py-3 px-3 sm:px-4 text-xs sm:text-sm text-gray-600">
                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-xs">
                          {funcaoLabels[(item as RankingFreelancer).funcao] || "Outros"}
                        </span>
                      </td>
                    )}
                    <td className="py-3 px-3 sm:px-4 text-right text-xs sm:text-sm">
                      <span className={`font-bold ${isTop3 ? "text-primary text-base" : "text-gray-900"}`}>
                        {item.total_festas}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useEmpresa } from "@/lib/empresa-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { getStatsPorUnidade, type StatsPorLocal } from "@/app/actions/por-unidade";

const meses = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function ordenarPorLocais(data: StatsPorLocal[], locaisOrdenados: string[]): StatsPorLocal[] {
  if (!locaisOrdenados?.length) return [...data].sort((a, b) => a.local.localeCompare(b.local));
  const ordem = new Map(locaisOrdenados.map((l, i) => [l, i]));
  return [...data].sort((a, b) => {
    const ia = ordem.has(a.local) ? ordem.get(a.local)! : 999;
    const ib = ordem.has(b.local) ? ordem.get(b.local)! : 999;
    if (ia !== ib) return ia - ib;
    if (a.local === "Outros") return 1;
    if (b.local === "Outros") return -1;
    return a.local.localeCompare(b.local);
  });
}

export default function PorUnidadePage() {
  const { empresa } = useEmpresa();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsPorLocal[]>([]);
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [todoAno, setTodoAno] = useState(false);

  useEffect(() => {
    loadDados();
  }, [mesAtual, anoAtual, todoAno]);

  async function loadDados() {
    setLoading(true);
    try {
      const res = await getStatsPorUnidade(mesAtual, anoAtual, todoAno);
      if (res.success) {
        const locaisOrdenados = Array.isArray(empresa?.locais) ? empresa.locais : [];
        setStats(ordenarPorLocais(res.data, locaisOrdenados));
      } else {
        setStats([]);
      }
    } catch (e) {
      setStats([]);
    } finally {
      setLoading(false);
    }
  }

  const periodoTexto = todoAno
    ? `Ano ${anoAtual}`
    : `${meses[mesAtual - 1]} ${anoAtual}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-gray-600">Carregando performance por unidade...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
            <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary flex-shrink-0" />
            <span>Performance por unidade</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Compare festas, receita e lucro por local no período
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Período: {periodoTexto}</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={todoAno}
              onChange={(e) => setTodoAno(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            Todo o ano
          </label>
          {!todoAno && (
            <select
              value={mesAtual}
              onChange={(e) => setMesAtual(Number(e.target.value))}
              className="flex-1 min-w-[120px] text-xs sm:text-sm px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {meses.map((mes, i) => (
                <option key={i} value={i + 1}>{mes}</option>
              ))}
            </select>
          )}
          <select
            value={anoAtual}
            onChange={(e) => setAnoAtual(Number(e.target.value))}
            className="w-20 sm:w-24 text-xs sm:text-sm px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {[2024, 2025, 2026, 2027].map((ano) => (
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>
      </div>

      {stats.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <p className="font-medium">Nenhuma festa no período</p>
            <p className="text-sm mt-1">
              Use o campo Local ao cadastrar festas e configure os locais em Configurações → Dados da Empresa.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm sm:text-base">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-700">Local</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Festas</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Receita</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Desp. freel.</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Desp. gerais</th>
                  <th className="text-right py-3 px-2 font-semibold text-gray-700">Lucro</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((row) => (
                  <tr key={row.local} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-2 font-medium">{row.local}</td>
                    <td className="text-right py-3 px-2">{row.festas}</td>
                    <td className="text-right py-3 px-2 text-green-600">{formatCurrency(row.receita)}</td>
                    <td className="text-right py-3 px-2 text-orange-600">{formatCurrency(row.despesasFreelancers)}</td>
                    <td className="text-right py-3 px-2 text-orange-600">{formatCurrency(row.despesasGerais)}</td>
                    <td className="text-right py-3 px-2 font-semibold text-primary">{formatCurrency(row.lucro)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stats.map((row) => (
              <Card key={row.local} className="border-primary/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    {row.local}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Festas</span>
                    <span className="font-medium">{row.festas}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <TrendingUp className="w-4 h-4 text-green-600" /> Receita
                    </span>
                    <span className="font-medium text-green-600">{formatCurrency(row.receita)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <TrendingDown className="w-4 h-4 text-orange-600" /> Desp. freel.
                    </span>
                    <span className="font-medium text-orange-600">{formatCurrency(row.despesasFreelancers)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <TrendingDown className="w-4 h-4 text-orange-600" /> Desp. gerais
                    </span>
                    <span className="font-medium text-orange-600">{formatCurrency(row.despesasGerais)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="text-gray-700 font-medium flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-primary" /> Lucro
                    </span>
                    <span className="font-bold text-primary">{formatCurrency(row.lucro)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

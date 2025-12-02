import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator } from "lucide-react";

export default function OrcamentosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calculator className="w-8 h-8 text-primary" />
          Orçamentos
        </h1>
        <p className="text-gray-500 mt-1">
          Gerador de orçamentos com export para PDF
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerador de Orçamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calculator className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Em Desenvolvimento
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              O gerador de orçamentos com cálculos automáticos e exportação
              para PDF estará disponível em breve. Os orçamentos já são
              criados ao cadastrar festas e podem ser visualizados lá.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


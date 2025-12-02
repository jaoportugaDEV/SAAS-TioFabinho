import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function ContratosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          Contratos
        </h1>
        <p className="text-gray-500 mt-1">
          Gerador de contratos com export para PDF
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gerador de Contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Em Desenvolvimento
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              O gerador de contratos personalizados com exportação para PDF
              estará disponível em breve. Você poderá criar templates e
              gerar contratos automaticamente para cada festa.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


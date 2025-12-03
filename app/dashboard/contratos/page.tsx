import { FileText } from "lucide-react";
import { ContratosList } from "@/components/contratos/contratos-list";

export default function ContratosPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <FileText className="w-8 h-8 text-primary" />
          Contratos
        </h1>
        <p className="text-gray-500 mt-1">
          Visualize e gerencie todos os contratos gerados
        </p>
      </div>

      <ContratosList />
    </div>
  );
}


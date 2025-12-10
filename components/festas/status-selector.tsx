"use client";

import { useState } from "react";
import { StatusFesta } from "@/types";
import { Select } from "@/components/ui/select";
import { updateFestaStatus } from "@/app/actions/festas";

interface StatusSelectorProps {
  festaId: string;
  currentStatus: StatusFesta;
}

const statusLabels: Record<string, string> = {
  planejamento: "Planejamento",
  confirmada: "Confirmada",
  acontecendo: "Acontecendo Agora",
  encerrada_pendente: "Encerrada - Pag. Pendente",
  encerrada: "Encerrada",
};

export function StatusSelector({ festaId, currentStatus }: StatusSelectorProps) {
  const [status, setStatus] = useState<StatusFesta>(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: StatusFesta) => {
    // Apenas permitir alteração manual entre planejamento e confirmada
    if (newStatus !== "planejamento" && newStatus !== "confirmada") {
      alert("Este status é gerenciado automaticamente pelo sistema.");
      return;
    }

    setUpdating(true);
    const result = await updateFestaStatus(festaId, newStatus);
    
    if (result.success) {
      setStatus(newStatus);
    } else {
      alert("Erro ao atualizar status. Tente novamente.");
    }
    
    setUpdating(false);
  };

  // Se o status atual não é planejamento ou confirmada, desabilitar o select
  const isAutoStatus = status !== "planejamento" && status !== "confirmada";

  return (
    <div className="space-y-1">
      <Select
        value={status}
        onChange={(e) => handleStatusChange(e.target.value as StatusFesta)}
        disabled={updating || isAutoStatus}
        className="w-48"
      >
        <option value="planejamento">{statusLabels.planejamento}</option>
        <option value="confirmada">{statusLabels.confirmada}</option>
        <option value="acontecendo" disabled>{statusLabels.acontecendo} 🤖</option>
        <option value="encerrada_pendente" disabled>{statusLabels.encerrada_pendente} 🤖</option>
        <option value="encerrada" disabled>{statusLabels.encerrada} 🤖</option>
      </Select>
      {isAutoStatus && (
        <p className="text-xs text-gray-500">
          Status gerenciado automaticamente pelo sistema
        </p>
      )}
    </div>
  );
}


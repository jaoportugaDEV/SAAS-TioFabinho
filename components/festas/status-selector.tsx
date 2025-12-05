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
  encerrada_pendente: "Encerrada - Pag. Pendente",
  encerrada: "Encerrada",
};

export function StatusSelector({ festaId, currentStatus }: StatusSelectorProps) {
  const [status, setStatus] = useState<StatusFesta>(currentStatus);
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: StatusFesta) => {
    setUpdating(true);
    const result = await updateFestaStatus(festaId, newStatus);
    
    if (result.success) {
      setStatus(newStatus);
    } else {
      alert("Erro ao atualizar status. Tente novamente.");
    }
    
    setUpdating(false);
  };

  return (
    <Select
      value={status}
      onChange={(e) => handleStatusChange(e.target.value as StatusFesta)}
      disabled={updating}
      className="w-48"
    >
      <option value="planejamento">{statusLabels.planejamento}</option>
      <option value="confirmada">{statusLabels.confirmada}</option>
      <option value="encerrada_pendente">{statusLabels.encerrada_pendente}</option>
      <option value="encerrada">{statusLabels.encerrada}</option>
    </Select>
  );
}


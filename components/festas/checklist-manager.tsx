"use client";

import { useState } from "react";
import { ChecklistItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import {
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
} from "@/app/actions/festas";

interface ChecklistManagerProps {
  festaId: string;
  items: ChecklistItem[];
}

export function ChecklistManager({ festaId, items: initialItems }: ChecklistManagerProps) {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [novaTarefa, setNovaTarefa] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddItem = async () => {
    if (!novaTarefa.trim()) {
      alert("Digite uma tarefa");
      return;
    }

    setLoading(true);
    const result = await addChecklistItem(festaId, novaTarefa);

    if (result.success) {
      setNovaTarefa("");
      // Recarrega a página para pegar o novo item do banco
      window.location.reload();
    } else {
      alert("Erro ao adicionar item. Tente novamente.");
    }

    setLoading(false);
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    const newStatus = !item.concluido;
    
    // Atualiza localmente para feedback imediato
    setItems(items.map(i => 
      i.id === item.id ? { ...i, concluido: newStatus } : i
    ));

    const result = await updateChecklistItem(item.id, newStatus, festaId);

    if (!result.success) {
      // Reverte se falhar
      setItems(items.map(i => 
        i.id === item.id ? { ...i, concluido: item.concluido } : i
      ));
      alert("Erro ao atualizar item. Tente novamente.");
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) {
      return;
    }

    const result = await deleteChecklistItem(itemId, festaId);

    if (result.success) {
      setItems(items.filter(i => i.id !== itemId));
    } else {
      alert("Erro ao excluir item. Tente novamente.");
    }
  };

  const completedCount = items.filter(i => i.concluido).length;
  const totalCount = items.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>✅ Checklist</span>
          {totalCount > 0 && (
            <span className="text-sm font-normal text-gray-500">
              {completedCount} de {totalCount} concluídas
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Adicionar nova tarefa */}
        <div className="flex gap-2">
          <Input
            placeholder="Nova tarefa..."
            value={novaTarefa}
            onChange={(e) => setNovaTarefa(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
            disabled={loading}
          />
          <Button 
            onClick={handleAddItem} 
            disabled={loading}
            size="icon"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Lista de tarefas */}
        {items.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhum item na checklist. Adicione tarefas acima.
          </p>
        ) : (
          <div className="space-y-2">
            {items
              .sort((a, b) => a.ordem - b.ordem)
              .map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                >
                  <Checkbox
                    checked={item.concluido}
                    onCheckedChange={() => handleToggleItem(item)}
                  />
                  <span
                    className={`flex-1 ${
                      item.concluido
                        ? "line-through text-gray-400"
                        : "text-gray-900"
                    }`}
                  >
                    {item.tarefa}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

interface StepChecklistProps {
  formData: any;
  setFormData: (data: any) => void;
}

const tarefasSugeridas = [
  "Confirmar disponibilidade dos freelancers",
  "Comprar decoração",
  "Encomendar bolo",
  "Preparar lista de convidados",
  "Confirmar local",
  "Organizar materiais",
  "Preparar kit festa",
  "Comprar lembrancinhas",
];

export function StepChecklist({ formData, setFormData }: StepChecklistProps) {
  const [novaTarefa, setNovaTarefa] = useState("");

  const adicionarTarefa = (tarefa: string) => {
    if (!tarefa.trim()) {
      alert("Digite uma tarefa");
      return;
    }

    if (formData.checklist.includes(tarefa)) {
      alert("Esta tarefa já foi adicionada");
      return;
    }

    setFormData({
      ...formData,
      checklist: [...formData.checklist, tarefa],
    });

    setNovaTarefa("");
  };

  const removerTarefa = (index: number) => {
    setFormData({
      ...formData,
      checklist: formData.checklist.filter((_: string, i: number) => i !== index),
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Checklist</h2>
        <p className="text-sm text-gray-600 mt-1">
          Crie uma lista de tarefas para organizar a festa
        </p>
      </div>

      {/* Adicionar Tarefa */}
      <div className="space-y-2">
        <Label htmlFor="tarefa">Nova Tarefa</Label>
        <div className="flex gap-2">
          <Input
            id="tarefa"
            value={novaTarefa}
            onChange={(e) => setNovaTarefa(e.target.value)}
            placeholder="Ex: Confirmar bolo"
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                adicionarTarefa(novaTarefa);
              }
            }}
          />
          <Button
            type="button"
            onClick={() => adicionarTarefa(novaTarefa)}
            disabled={!novaTarefa.trim()}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Tarefas Sugeridas */}
      <div className="space-y-2">
        <Label>Tarefas Sugeridas (clique para adicionar)</Label>
        <div className="flex flex-wrap gap-2">
          {tarefasSugeridas
            .filter((t) => !formData.checklist.includes(t))
            .map((tarefa, index) => (
              <button
                key={index}
                type="button"
                onClick={() => adicionarTarefa(tarefa)}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full transition-colors"
              >
                + {tarefa}
              </button>
            ))}
        </div>
      </div>

      {/* Lista de Tarefas */}
      {formData.checklist.length > 0 && (
        <div className="space-y-2">
          <Label>Tarefas Adicionadas ({formData.checklist.length})</Label>
          <div className="border rounded-lg divide-y">
            {formData.checklist.map((tarefa: string, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <CheckCircle2 className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-900">{tarefa}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removerTarefa(index)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          💡 <strong>Dica:</strong> Você pode adicionar, editar e marcar tarefas como concluídas depois na página de detalhes da festa.
        </p>
      </div>
    </div>
  );
}


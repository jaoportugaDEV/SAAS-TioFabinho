"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteFesta } from "@/app/actions/festas";

interface DeleteFestaDialogProps {
  festaId: string;
  festaTitulo: string;
}

export function DeleteFestaDialog({ festaId, festaTitulo }: DeleteFestaDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteFesta(festaId);
      
      if (result?.success) {
        // Sucesso: redirecionar para lista de festas
        router.push("/dashboard/festas");
      } else {
        // Erro real do banco de dados
        alert("Erro ao excluir festa. Tente novamente.");
        setIsDeleting(false);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Erro ao excluir festa:", error);
      alert("Erro ao excluir festa. Tente novamente.");
      setIsDeleting(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 hover:border-red-400"
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Excluir Festa
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle className="text-xl">Excluir Festa</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <p className="text-gray-700">
                  Tem certeza que deseja excluir permanentemente a festa{" "}
                  <strong className="text-gray-900">{festaTitulo}</strong>?
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 font-medium mb-2">
                    ⚠️ Esta ação não pode ser desfeita!
                  </p>
                  <p className="text-sm text-red-700">
                    Todos os dados relacionados serão excluídos:
                  </p>
                  <ul className="text-sm text-red-700 list-disc list-inside mt-1 space-y-1">
                    <li>Checklist de tarefas</li>
                    <li>Freelancers associados</li>
                    <li>Fotos da galeria</li>
                    <li>Orçamento e pagamentos</li>
                    <li>Contratos</li>
                    <li>Despesas</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isDeleting}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  {isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir Permanentemente
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}


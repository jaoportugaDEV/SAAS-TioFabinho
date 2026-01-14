"use client";

import { useState, useEffect } from "react";
import { Cliente } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, User, Phone } from "lucide-react";
import { searchClientes } from "@/app/actions/clientes";
import { formatPhone } from "@/lib/utils";

interface ClienteSelectorProps {
  onSelect: (cliente: Cliente | null) => void;
  selectedCliente: Cliente | null;
}

export function ClienteSelector({ onSelect, selectedCliente }: ClienteSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [resultados, setResultados] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 2 || searchQuery.length === 0) {
        buscarClientes();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const buscarClientes = async () => {
    setLoading(true);
    const result = await searchClientes(searchQuery);
    if (result.success) {
      setResultados(result.data || []);
      setShowResults(true);
    }
    setLoading(false);
  };

  const handleSelect = (cliente: any) => {
    // Buscar dados completos do cliente selecionado
    onSelect(cliente);
    setShowResults(false);
    setSearchQuery("");
  };

  const handleClear = () => {
    onSelect(null);
    setSearchQuery("");
    setResultados([]);
  };

  if (selectedCliente) {
    return (
      <Card className="p-4 border-2 border-primary">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-600">Cliente Selecionado</Badge>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <p className="font-semibold">{selectedCliente.nome}</p>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">{formatPhone(selectedCliente.telefone)}</p>
              </div>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Os dados deste cliente serão usados para a festa. Clique no X para selecionar outro cliente.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="search-cliente">Buscar Cliente</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            id="search-cliente"
            type="text"
            placeholder="Digite nome ou telefone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Digite pelo menos 2 caracteres para buscar
        </p>
      </div>

      {showResults && (
        <Card className="max-h-60 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Buscando clientes...
            </div>
          ) : resultados.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              {searchQuery.length >= 2 
                ? "Nenhum cliente encontrado"
                : "Digite para buscar clientes cadastrados"}
            </div>
          ) : (
            <div className="divide-y">
              {resultados.map((cliente) => (
                <button
                  key={cliente.id}
                  type="button"
                  onClick={() => handleSelect(cliente)}
                  className="w-full p-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{cliente.nome}</p>
                      <p className="text-sm text-gray-600">{formatPhone(cliente.telefone)}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

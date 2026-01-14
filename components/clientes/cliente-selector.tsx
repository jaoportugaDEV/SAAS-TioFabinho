"use client";

import { useState, useEffect } from "react";
import { Cliente } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, X, User, Phone, Mail, FileText, AlertTriangle } from "lucide-react";
import { searchClientes } from "@/app/actions/clientes";
import { formatPhone } from "@/lib/utils";
import { formatarCpfCnpj, getTipoIdentificador } from "@/lib/validators";

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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <p className="font-semibold">{selectedCliente.nome}</p>
              </div>
              
              {/* Identificadores */}
              {selectedCliente.cpf_cnpj && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <p className="text-sm font-mono text-gray-700">
                    {formatarCpfCnpj(selectedCliente.cpf_cnpj)}
                  </p>
                  <Badge variant="outline" className="text-xs">
                    {getTipoIdentificador(selectedCliente.cpf_cnpj)}
                  </Badge>
                </div>
              )}
              
              {selectedCliente.email && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <p className="text-sm text-gray-700">{selectedCliente.email}</p>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <p className="text-sm text-gray-600">{formatPhone(selectedCliente.telefone)}</p>
              </div>
              
              {!selectedCliente.cpf_cnpj && !selectedCliente.email && (
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-xs">Sem identificadores únicos</p>
                </div>
              )}
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
            placeholder="Digite nome, telefone, email ou CPF/CNPJ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowResults(true)}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Busca por nome, telefone, email ou CPF/CNPJ
        </p>
      </div>

      {showResults && (
        <Card className="max-h-80 overflow-y-auto">
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
              {resultados.map((cliente) => {
                const temCpfCnpj = cliente.cpf_cnpj && cliente.cpf_cnpj.trim();
                const temEmail = cliente.email && cliente.email.trim();
                const semIdentificadores = !temCpfCnpj && !temEmail;
                
                return (
                  <button
                    key={cliente.id}
                    type="button"
                    onClick={() => handleSelect(cliente)}
                    className="w-full p-4 text-left hover:bg-gray-50 transition-colors border-l-4 border-transparent hover:border-primary"
                  >
                    <div className="space-y-2">
                      {/* Nome */}
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <p className="font-semibold text-base">{cliente.nome}</p>
                      </div>
                      
                      {/* Identificadores (PRINCIPAL - para diferenciar clientes com mesmo nome) */}
                      {(temCpfCnpj || temEmail) && (
                        <div className="ml-6 space-y-1">
                          {temCpfCnpj && (
                            <div className="flex items-center gap-2">
                              <FileText className="w-3.5 h-3.5 text-blue-600" />
                              <span className="text-sm font-mono text-gray-700">
                                {formatarCpfCnpj(cliente.cpf_cnpj)}
                              </span>
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                {getTipoIdentificador(cliente.cpf_cnpj)}
                              </Badge>
                            </div>
                          )}
                          
                          {temEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5 text-green-600" />
                              <span className="text-sm text-gray-700">{cliente.email}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Telefone */}
                      <div className="ml-6 flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-sm text-gray-600">{formatPhone(cliente.telefone)}</span>
                      </div>
                      
                      {/* Alerta se não tiver identificadores */}
                      {semIdentificadores && (
                        <div className="ml-6 mt-2">
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Sem identificadores únicos
                          </Badge>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

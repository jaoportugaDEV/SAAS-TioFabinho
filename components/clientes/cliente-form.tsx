"use client";

import { useState, useEffect } from "react";
import { Cliente } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle } from "lucide-react";
import {
  validarIdentificadores,
  validarCpfCnpj,
  validarEmail,
  limparCpfCnpj,
  getTipoIdentificador,
} from "@/lib/validators";

interface ClienteFormProps {
  cliente?: Cliente;
  onSubmit: (data: any) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export function ClienteForm({ cliente, onSubmit, submitLabel = "Salvar Cliente", loading = false }: ClienteFormProps) {
  const [formData, setFormData] = useState({
    nome: cliente?.nome || "",
    email: cliente?.email || "",
    telefone: cliente?.telefone || "",
    whatsapp: cliente?.whatsapp || "",
    cpf_cnpj: cliente?.cpf_cnpj || "",
    endereco: cliente?.endereco || "",
    cidade: cliente?.cidade || "",
    estado: cliente?.estado || "",
    cep: cliente?.cep || "",
    data_nascimento: cliente?.data_nascimento || "",
    observacoes: cliente?.observacoes || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [identificadorValido, setIdentificadorValido] = useState(true);
  const [mensagemIdentificador, setMensagemIdentificador] = useState('');
  const [tipoCpfCnpj, setTipoCpfCnpj] = useState<'CPF' | 'CNPJ' | null>(null);
  const [emailValido, setEmailValido] = useState<boolean | null>(null);

  // Validar identificadores em tempo real
  useEffect(() => {
    const validacao = validarIdentificadores({
      email: formData.email,
      cpf_cnpj: formData.cpf_cnpj,
    });
    
    setIdentificadorValido(validacao.valido);
    setMensagemIdentificador(validacao.erro || '');
    
    // Detectar tipo de CPF/CNPJ
    if (formData.cpf_cnpj && formData.cpf_cnpj.trim()) {
      const limpo = limparCpfCnpj(formData.cpf_cnpj);
      const tipo = getTipoIdentificador(limpo);
      setTipoCpfCnpj(tipo);
    } else {
      setTipoCpfCnpj(null);
    }
    
    // Validar email
    if (formData.email && formData.email.trim()) {
      const validacaoEmail = validarEmail(formData.email);
      setEmailValido(validacaoEmail.valido);
    } else {
      setEmailValido(null);
    }
  }, [formData.email, formData.cpf_cnpj]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório";
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    }
    
    // Validar identificadores
    if (!identificadorValido) {
      newErrors.identificadores = mensagemIdentificador;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    await onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const estados = [
    "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
    "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informações Básicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nome">Nome Completo *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => handleChange("nome", e.target.value)}
              placeholder="Ex: João Silva"
              className={errors.nome ? "border-red-500" : ""}
            />
            {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
          </div>

          <div>
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => handleChange("telefone", e.target.value)}
              placeholder="Ex: (18) 99999-9999"
              className={errors.telefone ? "border-red-500" : ""}
            />
            {errors.telefone && <p className="text-sm text-red-600 mt-1">{errors.telefone}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Identificadores Únicos */}
      <Card className={!identificadorValido ? "border-red-300 border-2" : "border-blue-300 border-2"}>
        <CardHeader className={!identificadorValido ? "bg-red-50" : "bg-blue-50"}>
          <CardTitle className="text-lg flex items-center gap-2">
            {identificadorValido ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600" />
            )}
            Identificadores Únicos
            <span className="text-red-500">*</span>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-1">
            Informe <strong>pelo menos um</strong>: Email OU CPF/CNPJ
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email */}
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              E-mail
              {emailValido === true && (
                <CheckCircle className="w-4 h-4 text-green-600" />
              )}
              {emailValido === false && (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Ex: joao@email.com"
              className={emailValido === false ? "border-red-500" : emailValido === true ? "border-green-500" : ""}
            />
            <p className="text-xs text-gray-500 mt-1">
              Usado para identificar o cliente de forma única
            </p>
          </div>

          {/* CPF/CNPJ */}
          <div>
            <Label htmlFor="cpf_cnpj" className="flex items-center gap-2">
              CPF/CNPJ
              {tipoCpfCnpj && (
                <Badge variant="outline" className="text-xs">
                  {tipoCpfCnpj}
                </Badge>
              )}
            </Label>
            <Input
              id="cpf_cnpj"
              value={formData.cpf_cnpj}
              onChange={(e) => handleChange("cpf_cnpj", e.target.value)}
              placeholder="Digite apenas números (CPF: 11 | CNPJ: 14)"
              maxLength={18}
              className={tipoCpfCnpj ? "border-green-500" : ""}
            />
            <p className="text-xs text-gray-500 mt-1">
              CPF: 11 dígitos | CNPJ: 14 dígitos
            </p>
          </div>

          {/* Mensagem de validação */}
          {!identificadorValido && mensagemIdentificador && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{mensagemIdentificador}</p>
            </div>
          )}
          
          {identificadorValido && (formData.email || formData.cpf_cnpj) && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3 text-sm text-green-700 flex items-start gap-2">
              <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>Identificador válido! Cliente pode ser cadastrado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contato Adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contato Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="whatsapp">WhatsApp (se diferente do telefone)</Label>
            <Input
              id="whatsapp"
              value={formData.whatsapp}
              onChange={(e) => handleChange("whatsapp", e.target.value)}
              placeholder="Ex: (18) 98888-8888"
            />
          </div>

          <div>
            <Label htmlFor="data_nascimento">Data de Nascimento</Label>
            <Input
              id="data_nascimento"
              type="date"
              value={formData.data_nascimento}
              onChange={(e) => handleChange("data_nascimento", e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Endereço</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="endereco">Logradouro</Label>
            <Input
              id="endereco"
              value={formData.endereco}
              onChange={(e) => handleChange("endereco", e.target.value)}
              placeholder="Ex: Rua das Flores, 123"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={formData.cidade}
                onChange={(e) => handleChange("cidade", e.target.value)}
                placeholder="Ex: São Paulo"
              />
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              <select
                id="estado"
                value={formData.estado}
                onChange={(e) => handleChange("estado", e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">Selecione</option>
                {estados.map((estado) => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => handleChange("cep", e.target.value)}
                placeholder="Ex: 12345-678"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="observacoes"
            value={formData.observacoes}
            onChange={(e) => handleChange("observacoes", e.target.value)}
            placeholder="Ex: Preferências, restrições alimentares, histórico..."
            rows={4}
          />
          <p className="text-xs text-gray-500 mt-2">
            Adicione informações importantes sobre o cliente para facilitar o atendimento.
          </p>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? "Salvando..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

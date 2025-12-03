import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface StepClienteProps {
  formData: any;
  setFormData: (data: any) => void;
  errors?: Record<string, string>;
}

export function StepCliente({ formData, setFormData, errors = {} }: StepClienteProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Informações do Cliente</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cliente_nome">Nome Completo do Cliente *</Label>
          <Input
            id="cliente_nome"
            value={formData.cliente_nome}
            onChange={(e) =>
              setFormData({ ...formData, cliente_nome: e.target.value })
            }
            placeholder="Nome completo"
            required
            className={errors.cliente_nome ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.cliente_nome && (
            <p className="text-sm text-red-600 mt-1">{errors.cliente_nome}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cliente_contato">Contato (WhatsApp/Telefone) *</Label>
          <Input
            id="cliente_contato"
            value={formData.cliente_contato}
            onChange={(e) =>
              setFormData({ ...formData, cliente_contato: e.target.value })
            }
            placeholder="(18) 99999-9999"
            required
            className={errors.cliente_contato ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.cliente_contato && (
            <p className="text-sm text-red-600 mt-1">{errors.cliente_contato}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cliente_observacoes">Observações</Label>
          <Textarea
            id="cliente_observacoes"
            value={formData.cliente_observacoes}
            onChange={(e) =>
              setFormData({ ...formData, cliente_observacoes: e.target.value })
            }
            placeholder="Informações adicionais, preferências, restrições alimentares, etc."
            rows={4}
          />
          <p className="text-xs text-gray-500">
            Anote aqui qualquer informação importante sobre o cliente ou suas preferências
          </p>
        </div>
      </div>
    </div>
  );
}


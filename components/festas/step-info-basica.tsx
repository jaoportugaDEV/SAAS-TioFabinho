import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { Checkbox } from "@/components/ui/checkbox";

interface StepInfoBasicaProps {
  formData: any;
  setFormData: (data: any) => void;
  errors?: Record<string, string>;
}

const faixasEtariasOpcoes = [
  { value: "0-5", label: "0-5 anos" },
  { value: "6-12", label: "6-12 anos" },
  { value: "13-17", label: "13-17 anos" },
  { value: "18+", label: "18+" },
];

export function StepInfoBasica({ formData, setFormData, errors = {} }: StepInfoBasicaProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Informações Básicas da Festa</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="titulo">Título da Festa *</Label>
          <Input
            id="titulo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ex: Aniversário de 5 anos do João"
            required
            className={errors.titulo ? "border-red-500 focus-visible:ring-red-500" : ""}
          />
          {errors.titulo && (
            <p className="text-sm text-red-600 mt-1">{errors.titulo}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="data">Data da Festa *</Label>
            <Input
              type="date"
              id="data"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
              className={errors.data ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.data && (
              <p className="text-sm text-red-600 mt-1">{errors.data}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario">Horário</Label>
            <Input
              type="time"
              id="horario"
              value={formData.horario || ""}
              onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
              placeholder="--:--"
            />
            <p className="text-xs text-gray-500">Horário de início</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              id="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
            >
              <option value="planejamento">Planejamento</option>
              <option value="confirmada">Confirmada</option>
              <option value="concluida">Concluída</option>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tema">Tema</Label>
          <Input
            id="tema"
            value={formData.tema}
            onChange={(e) => setFormData({ ...formData, tema: e.target.value })}
            placeholder="Ex: Super-Heróis, Frozen, Patrulha Canina"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="local">Local</Label>
          <Input
            id="local"
            value={formData.local}
            onChange={(e) => setFormData({ ...formData, local: e.target.value })}
            placeholder="Ex: Salão de Festas, Chácara, etc."
          />
        </div>
      </div>

      {/* Seção Colapsável: Informações dos Convidados */}
      <div className="mt-6 border-t pt-6">
        <CollapsibleSection title="Informações dos Convidados (Opcional)" defaultOpen={false}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimativa_convidados">Estimativa de Convidados</Label>
                <Input
                  type="number"
                  id="estimativa_convidados"
                  value={formData.estimativa_convidados || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    estimativa_convidados: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="Ex: 50"
                  min="0"
                />
                <p className="text-xs text-gray-500">Número total estimado de convidados</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantidade_criancas">Quantidade de Crianças</Label>
                <Input
                  type="number"
                  id="quantidade_criancas"
                  value={formData.quantidade_criancas || ""}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    quantidade_criancas: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="Ex: 20"
                  min="0"
                />
                <p className="text-xs text-gray-500">Número de crianças esperadas</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Faixas Etárias</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                {faixasEtariasOpcoes.map((faixa) => (
                  <div key={faixa.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`faixa-${faixa.value}`}
                      checked={(formData.faixas_etarias || []).includes(faixa.value)}
                      onCheckedChange={(checked) => {
                        const currentFaixas = formData.faixas_etarias || [];
                        const newFaixas = checked
                          ? [...currentFaixas, faixa.value]
                          : currentFaixas.filter((f: string) => f !== faixa.value);
                        setFormData({ ...formData, faixas_etarias: newFaixas });
                      }}
                    />
                    <label
                      htmlFor={`faixa-${faixa.value}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {faixa.label}
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">Selecione as faixas etárias presentes</p>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}


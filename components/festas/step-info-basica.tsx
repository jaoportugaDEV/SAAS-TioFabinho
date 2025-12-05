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
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-gray-500">Selecione a data do evento</p>
            {errors.data && (
              <p className="text-sm text-red-600 mt-1">{errors.data}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="horario">Horário</Label>
            <Select
              id="horario"
              value={formData.horario || ""}
              onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
            >
              <option value="">Selecione o horário</option>
              <option value="08:00">08:00</option>
              <option value="08:30">08:30</option>
              <option value="09:00">09:00</option>
              <option value="09:30">09:30</option>
              <option value="10:00">10:00</option>
              <option value="10:30">10:30</option>
              <option value="11:00">11:00</option>
              <option value="11:30">11:30</option>
              <option value="12:00">12:00</option>
              <option value="12:30">12:30</option>
              <option value="13:00">13:00</option>
              <option value="13:30">13:30</option>
              <option value="14:00">14:00</option>
              <option value="14:30">14:30</option>
              <option value="15:00">15:00</option>
              <option value="15:30">15:30</option>
              <option value="16:00">16:00</option>
              <option value="16:30">16:30</option>
              <option value="17:00">17:00</option>
              <option value="17:30">17:30</option>
              <option value="18:00">18:00</option>
              <option value="18:30">18:30</option>
              <option value="19:00">19:00</option>
              <option value="19:30">19:30</option>
              <option value="20:00">20:00</option>
              <option value="20:30">20:30</option>
              <option value="21:00">21:00</option>
              <option value="21:30">21:30</option>
              <option value="22:00">22:00</option>
              <option value="22:30">22:30</option>
              <option value="23:00">23:00</option>
              <option value="23:30">23:30</option>
            </Select>
            <p className="text-xs text-gray-500">Horário de início da festa</p>
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
            </Select>
            <p className="text-xs text-gray-500">Status inicial da festa</p>
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
          <Select
            id="local"
            value={formData.local}
            onChange={(e) => setFormData({ ...formData, local: e.target.value })}
          >
            <option value="">Selecione o local</option>
            <option value="TioFabinho Buffet un.1">TioFabinho Buffet un.1</option>
            <option value="TioFabinho Buffet un.2">TioFabinho Buffet un.2</option>
          </Select>
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


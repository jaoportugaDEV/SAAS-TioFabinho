import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface StepInfoBasicaProps {
  formData: any;
  setFormData: (data: any) => void;
  errors?: Record<string, string>;
}

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
              <option value="em_andamento">Em Andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
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
    </div>
  );
}


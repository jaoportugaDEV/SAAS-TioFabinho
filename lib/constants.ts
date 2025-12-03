import { FuncaoFreelancer } from "@/types";

// Valores padrão por função de freelancer
export const VALORES_PADRAO_POR_FUNCAO: Record<FuncaoFreelancer, number> = {
  monitor: 50.00,
  cozinheira: 80.00,
  recepcao: 50.00,
  garcom: 60.00,
  fotografo: 0.00,
  outros: 0.00,
};

// Labels das funções em português
export const FUNCAO_LABELS: Record<FuncaoFreelancer, string> = {
  monitor: "Monitor",
  cozinheira: "Cozinheira",
  fotografo: "Fotógrafo",
  garcom: "Garçom",
  recepcao: "Recepção",
  outros: "Outros",
};

// Cores das badges por função
export const FUNCAO_COLORS: Record<FuncaoFreelancer, string> = {
  monitor: "bg-blue-100 text-blue-800",
  cozinheira: "bg-purple-100 text-purple-800",
  fotografo: "bg-green-100 text-green-800",
  garcom: "bg-orange-100 text-orange-800",
  recepcao: "bg-pink-100 text-pink-800",
  outros: "bg-gray-100 text-gray-800",
};


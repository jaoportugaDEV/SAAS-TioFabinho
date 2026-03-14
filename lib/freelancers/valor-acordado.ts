export function resolveValorAcordado(
  valorCustomizadoFreelancer?: number | null,
  valorFuncao?: number | null
): number {
  const valorCustomizado = Number(valorCustomizadoFreelancer ?? 0);
  if (Number.isFinite(valorCustomizado) && valorCustomizado > 0) {
    return valorCustomizado;
  }

  const valorBaseFuncao = Number(valorFuncao ?? 0);
  if (Number.isFinite(valorBaseFuncao) && valorBaseFuncao > 0) {
    return valorBaseFuncao;
  }

  return 0;
}

export function hasValorCustomizadoFreelancer(valorCustomizadoFreelancer?: number | null): boolean {
  const valorCustomizado = Number(valorCustomizadoFreelancer ?? 0);
  return Number.isFinite(valorCustomizado) && valorCustomizado > 0;
}

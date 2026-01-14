// Validadores para identificadores únicos de clientes
// Email, CPF e CNPJ

// ============================================
// VALIDAÇÃO DE EMAIL
// ============================================

export function validarEmail(email: string): { valido: boolean; erro?: string } {
  if (!email || !email.trim()) {
    return { valido: false, erro: 'Email é obrigatório' };
  }
  
  const emailTrimmed = email.trim();
  
  // Validação básica: tem @ e tem . após o @
  const temArroba = emailTrimmed.includes('@');
  const partesEmail = emailTrimmed.split('@');
  const temPonto = partesEmail.length === 2 && partesEmail[1].includes('.');
  
  if (!temArroba || !temPonto) {
    return { valido: false, erro: 'Email inválido (ex: usuario@dominio.com)' };
  }
  
  // Verificar se tem texto antes e depois do @
  if (partesEmail[0].length === 0 || partesEmail[1].length === 0) {
    return { valido: false, erro: 'Email inválido' };
  }
  
  return { valido: true };
}

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

// ============================================
// VALIDAÇÃO DE CPF/CNPJ
// ============================================

// Remover caracteres não numéricos
export function limparCpfCnpj(valor: string): string {
  return valor.replace(/\D/g, '');
}

// Validar formato de CPF (11 dígitos)
export function validarCPF(cpf: string): boolean {
  const limpo = limparCpfCnpj(cpf);
  return limpo.length === 11;
}

// Validar formato de CNPJ (14 dígitos)
export function validarCNPJ(cnpj: string): boolean {
  const limpo = limparCpfCnpj(cnpj);
  return limpo.length === 14;
}

// Validar CPF ou CNPJ
export function validarCpfCnpj(valor: string): { 
  valido: boolean; 
  tipo: 'CPF' | 'CNPJ' | null; 
  erro?: string 
} {
  if (!valor || !valor.trim()) {
    return { valido: false, tipo: null };
  }

  const limpo = limparCpfCnpj(valor);
  
  if (!limpo) {
    return { valido: false, tipo: null, erro: 'Campo vazio' };
  }
  
  if (limpo.length === 11) {
    return { valido: true, tipo: 'CPF' };
  }
  
  if (limpo.length === 14) {
    return { valido: true, tipo: 'CNPJ' };
  }
  
  return { 
    valido: false, 
    tipo: null, 
    erro: 'CPF deve ter 11 dígitos ou CNPJ deve ter 14 dígitos' 
  };
}

// Formatar CPF: 123.456.789-00
export function formatarCPF(cpf: string): string {
  const limpo = limparCpfCnpj(cpf);
  if (limpo.length !== 11) return cpf;
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// Formatar CNPJ: 12.345.678/0001-90
export function formatarCNPJ(cnpj: string): string {
  const limpo = limparCpfCnpj(cnpj);
  if (limpo.length !== 14) return cnpj;
  return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

// Formatar automaticamente CPF ou CNPJ
export function formatarCpfCnpj(valor: string): string {
  if (!valor) return '';
  
  const limpo = limparCpfCnpj(valor);
  
  if (limpo.length === 11) {
    return formatarCPF(limpo);
  }
  
  if (limpo.length === 14) {
    return formatarCNPJ(limpo);
  }
  
  return valor; // Retorna original se não for CPF nem CNPJ
}

// ============================================
// VALIDAÇÃO DE IDENTIFICADORES (PELO MENOS UM)
// ============================================

export function validarIdentificadores(data: {
  email?: string | null;
  cpf_cnpj?: string | null;
}): { valido: boolean; erro?: string } {
  const temEmail = data.email && data.email.trim() !== '';
  const temCpfCnpj = data.cpf_cnpj && data.cpf_cnpj.trim() !== '';
  
  // Verificar se tem pelo menos um
  if (!temEmail && !temCpfCnpj) {
    return { 
      valido: false, 
      erro: 'Informe pelo menos um identificador: Email OU CPF/CNPJ' 
    };
  }
  
  // Se forneceu email, validar formato
  if (temEmail) {
    const validacaoEmail = validarEmail(data.email!);
    if (!validacaoEmail.valido) {
      return { valido: false, erro: `Email: ${validacaoEmail.erro}` };
    }
  }
  
  // Se forneceu CPF/CNPJ, validar formato
  if (temCpfCnpj) {
    const validacaoCpf = validarCpfCnpj(data.cpf_cnpj!);
    if (!validacaoCpf.valido) {
      return { valido: false, erro: validacaoCpf.erro || 'CPF/CNPJ inválido' };
    }
  }
  
  return { valido: true };
}

// ============================================
// HELPERS DE EXIBIÇÃO
// ============================================

export function getTipoIdentificador(cpfCnpj: string): 'CPF' | 'CNPJ' | null {
  const limpo = limparCpfCnpj(cpfCnpj);
  if (limpo.length === 11) return 'CPF';
  if (limpo.length === 14) return 'CNPJ';
  return null;
}

export function exibirIdentificadores(cliente: {
  email?: string | null;
  cpf_cnpj?: string | null;
}): string {
  const partes: string[] = [];
  
  if (cliente.cpf_cnpj) {
    const formatado = formatarCpfCnpj(cliente.cpf_cnpj);
    const tipo = getTipoIdentificador(cliente.cpf_cnpj);
    if (tipo) {
      partes.push(`${tipo}: ${formatado}`);
    }
  }
  
  if (cliente.email) {
    partes.push(`Email: ${cliente.email}`);
  }
  
  return partes.length > 0 ? partes.join(' | ') : 'Sem identificadores';
}

-- Garantir que token de assinatura só possa ser criado para contrato da mesma empresa

CREATE OR REPLACE FUNCTION public.contratos_assinatura_tokens_validate_empresa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  contrato_empresa_id uuid;
BEGIN
  SELECT empresa_id INTO contrato_empresa_id
  FROM public.contratos
  WHERE id = NEW.contrato_id;
  IF contrato_empresa_id IS NULL THEN
    RAISE EXCEPTION 'Contrato não encontrado.';
  END IF;
  IF contrato_empresa_id != NEW.empresa_id THEN
    RAISE EXCEPTION 'Contrato não pertence à empresa do token.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contratos_assinatura_tokens_empresa ON public.contratos_assinatura_tokens;
CREATE TRIGGER trg_contratos_assinatura_tokens_empresa
  BEFORE INSERT ON public.contratos_assinatura_tokens
  FOR EACH ROW
  EXECUTE PROCEDURE public.contratos_assinatura_tokens_validate_empresa();

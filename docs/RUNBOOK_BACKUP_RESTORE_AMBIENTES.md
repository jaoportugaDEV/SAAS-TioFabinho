# Runbook: Backup, Restore e Separação de Ambientes

## Ambientes

- **development**: máquina local; usar `.env.local` com projeto Supabase de dev (ou local).
- **staging**: opcional; cópia de produção com dados anônimos ou subset.
- **production**: dados reais; nunca usar dados de produção em desenvolvimento ou testes.

## Regras

1. Nunca apontar aplicação de desenvolvimento para banco ou Storage de produção.
2. Variáveis de ambiente sensíveis (ex.: `SUPABASE_SERVICE_ROLE_KEY`) devem vir apenas de variáveis de ambiente no deploy (Vercel/host), nunca commitadas.
3. Em produção, garantir que `NEXT_PUBLIC_APP_URL` esteja definido (evitar fallback por headers).

## Backup (Supabase)

- **Banco**: no painel Supabase, Project Settings > Database > há backups automáticos (conforme plano). Para backup manual: usar pg_dump ou a funcionalidade de backup do painel.
- **Storage**: não há backup automático por objeto; replicar arquivos críticos (ex.: bucket `contratos_assinados`) para outro storage ou fazer cópias periódicas via script.
- **Migrations**: versionadas em `supabase/migrations/`; aplicar em ordem em cada ambiente.

## Restore

1. Restaurar o banco a partir do backup (Supabase painel ou suporte).
2. Se necessário, reaplicar migrations após o restore (avaliar estado do schema).
3. Validar RLS e políticas de Storage após restore.
4. Testar login e um fluxo crítico (ex.: assinatura por link) antes de considerar concluído.

## Rollback de deploy (Vercel)

- Usar o painel Vercel para fazer rollback para um deployment anterior.
- Se uma migration já tiver sido aplicada em produção, o rollback de código pode exigir uma migration de reversão (down) ou manter compatibilidade retroativa.

## Checklist pré-deploy produção

- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_APP_URL` definido
- [ ] Variáveis sensíveis apenas em env do host (não em código)
- [ ] Migrations aplicadas e testadas em staging
- [ ] Backups do banco conferidos

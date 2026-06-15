-- ============================================================
-- Supabase Storage — bucket korus-assets
-- ============================================================
-- O bucket `korus-assets` já foi criado como PÚBLICO (leitura pública
-- funciona via /storage/v1/object/public/korus-assets/...).
--
-- Este script habilita os UPLOADS feitos pelo frontend (telas de perfil,
-- portfolio e academy), que usam a chave publishable/anon no navegador.
-- Sem estas policies, o upload retorna 403 "new row violates row-level
-- security policy".
--
-- Rode no Supabase Studio > SQL Editor (uma vez).
--
-- ATENÇÃO (segurança): liberar INSERT para `anon` significa que qualquer
-- pessoa de posse da publishable key (que é pública, vai no bundle do
-- navegador) pode subir arquivos neste bucket. As policies abaixo já
-- restringem ao bucket korus-assets e às pastas usadas pelo app. Para um
-- modelo mais seguro, faça o upload via backend (API) com a service_role
-- key — ver nota no fim do arquivo.
-- ============================================================

-- Upload (INSERT) restrito ao bucket e às pastas conhecidas do app.
create policy "korus-assets app insert"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'korus-assets'
    and (
      (storage.foldername(name))[1] in ('avatars', 'portfolio', 'academy', 'logos', 'landing')
    )
  );

-- Update (necessário porque o app envia com x-upsert: true).
create policy "korus-assets app update"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'korus-assets')
  with check (bucket_id = 'korus-assets');

-- Observação: leitura pública já funciona sem policy porque o bucket é público.

-- ------------------------------------------------------------
-- Alternativa mais segura (recomendada para produção):
-- Não liberar INSERT para anon. Em vez disso, criar um endpoint de upload
-- na API que recebe o arquivo (multipart, usuário autenticado por JWT) e
-- repassa ao Supabase usando a SERVICE_ROLE key no servidor. Assim a chave
-- secreta nunca vai pro navegador e só usuários logados sobem imagens.
-- ------------------------------------------------------------

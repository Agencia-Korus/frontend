# Korus Frontend

Frontend da Korus em Next.js App Router, integrado com a API, Auth e Supabase Storage.

## Requisitos

- Node.js 20.9 ou superior para rodar Next 16 localmente.
- pnpm 10.x.
- Supabase Storage para todas as imagens da marca, portfolio, academy e avatares.

## Ambiente

Crie um arquivo `.env` no diretório `frontend` com as mesmas chaves de `.env.example`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://yqnfivwjcnickrcywooc.supabase.co
NEXT_PUBLIC_SUPABASE_BUCKET=korus-assets
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_nR8eLJyH2qMNlXxkjIsrOA_LI2gE0Z6
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_AUTH_BASE_URL=http://localhost:8001
```

As imagens estáticas são lidas do bucket Supabase pelos caminhos definidos em `src/korus/assets.ts`.
Não há fallback para imagens locais no frontend.
Os uploads feitos nas telas de perfil, portfolio e academy salvam em:

- `avatars/`
- `portfolio/`
- `academy/`

Para preparar o bucket remoto:

```bash
supabase login
supabase link --project-ref yqnfivwjcnickrcywooc
supabase db push
```

Sem essa etapa, o frontend continua apontando para o Supabase, mas as imagens
não carregam porque o bucket remoto ainda não existe.

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

Abra `http://localhost:3000`.

## Docker

```bash
docker compose up nextjs-standalone --build
```

O serviço expõe o frontend em `http://localhost:3000`.

## Validação

```bash
pnpm lint
pnpm build
```
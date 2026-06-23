# Testes E2E (Selenium) — Korus

Suíte completa de testes end-to-end executada contra o ambiente real
(`https://app.korus.lcsgborges.cloud`), cobrindo a área pública e as três áreas
logadas: **administrador**, **funcionário** e **cliente**.

## Pré-requisitos
- Python 3.10+
- Um navegador Chromium (Google Chrome, Chromium ou **Brave**). O
  `selenium-manager` baixa o `chromedriver` automaticamente.

## Instalação
```bash
cd tests/e2e
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## Como rodar
```bash
# Toda a suíte (navegador visível)
pytest -v

# Sem janela (CI / servidor sem display)
HEADLESS=1 pytest -v

# Usando o Brave (ou outro Chromium) como navegador
CHROME_BINARY=/opt/brave.com/brave/brave-browser HEADLESS=1 pytest -v

# Um arquivo / um teste
pytest test_admin_journey.py -v
pytest test_cliente_journey.py -k kanban -v
```

## Estrutura
| Arquivo | Cobertura |
|---|---|
| `test_login.py` | Login válido (admin/funcionário/cliente) e inválido |
| `test_public.py` | Landing, Serviços (+filtro), Portfólio, Academy, Cadastro (validações) e fluxo completo de Solicitar Orçamento |
| `test_admin_journey.py` | Dashboard, Usuários, Leads, Projetos, Kanban, Serviços, Portfólio, Academy, Feed, Agenda (evento + reunião), Gamificação, Configurações, Perfil, Logout |
| `test_funcionario_journey.py` | Dashboard, Projetos, Feed, Agenda (evento + reunião), XP, Perfil, Logout |
| `test_cliente_journey.py` | Dashboard, Projetos, Kanban (comentário), Agenda (evento + reunião), Perfil, Logout |
| `helpers.py` | Utilitários (login resiliente, cookies, datas/selects React, setup de dados via API) |
| `conftest.py` | Fixtures (`driver` por classe, `admin_token`, `cliente_project_id`) |
| `PRODUCTION_BUGS.md` | Bugs do app encontrados pela suíte (páginas marcadas `xfail`) |

## Variáveis de ambiente
| Var | Padrão | Descrição |
|---|---|---|
| `KORUS_BASE_URL` | `https://app.korus.lcsgborges.cloud` | URL do frontend |
| `KORUS_AUTH_URL` | `https://auth.korus.lcsgborges.cloud` | URL do serviço de auth |
| `KORUS_API_URL` | `https://api.korus.lcsgborges.cloud/api/v1` | URL da API |
| `KORUS_ADMIN_EMAIL` / `KORUS_ADMIN_SENHA` | `admin@email.com` / `senha-forte-123` | Credenciais do admin |
| `KORUS_FUNC_EMAIL` / `KORUS_FUNC_SENHA` | `functestes@email.com` / `12345678` | Credenciais do funcionário |
| `KORUS_CLIENTE_EMAIL` / `KORUS_CLIENTE_SENHA` | `usuatestes@email.com` / `12345678` | Credenciais do cliente |
| `HEADLESS` | `0` | `1` roda sem janela |
| `CHROME_BINARY` | (auto) | Caminho do binário do navegador (ex.: Brave) |
| `KORUS_SETTLE` | `0.9` | Espera (s) após navegar p/ o React hidratar |
| `KORUS_TIMEOUT` | `20` | Timeout padrão das esperas explícitas (s) |
| `STEP_DELAY` | `0` | Pausa entre passos para assistir em câmera lenta |

> **Segurança:** as credenciais têm padrões apenas de conveniência. Prefira
> passá-las por variáveis de ambiente (`KORUS_ADMIN_SENHA=... pytest`) e use
> contas de teste descartáveis.

## Observações importantes
- **Páginas quebradas em produção** (Perfil de todos os perfis e Dashboard do
  funcionário) estão marcadas como `xfail` — a suíte fica **verde** e os bugs
  ficam documentados em [`PRODUCTION_BUGS.md`](./PRODUCTION_BUGS.md). Quando o app
  for corrigido e redeployado, esses testes viram `XPASS`.
- Os testes **criam dados reais** (usuário, projeto, serviço, lead, comunicado,
  eventos de agenda, etc.) no ambiente apontado. É o comportamento esperado para
  E2E contra um ambiente de homologação.
- Para os testes de projeto/kanban do cliente, um projeto com tarefa é garantido
  via API (fixture `cliente_project_id`), de forma idempotente.
- A integração com Google Calendar é colocada em **desconectada** antes dos
  testes de agenda (quando conectada sem credenciais válidas, a criação de
  eventos fica lenta).

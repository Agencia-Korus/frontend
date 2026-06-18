# Testes E2E (Selenium)

Teste de login executado contra o ambiente real: `https://app.korus.lcsgborges.cloud`.

## Pré-requisitos
- Python 3.10+
- Google Chrome instalado (o `selenium-manager` baixa o chromedriver automaticamente)

## Instalação
```bash
cd tests/e2e
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

## Rodar
```bash
# padrão: abre o navegador visível e roda em câmera lenta (2s por passo)
pytest test_login.py -v -s

# sem janela (CI):
HEADLESS=1 pytest test_login.py -v

# desliga a câmera lenta:
STEP_DELAY=0 pytest test_login.py -v
```

## Variáveis de ambiente (opcionais)
| Var               | Padrão                                | Descrição                                  |
|-------------------|---------------------------------------|--------------------------------------------|
| `KORUS_BASE_URL`  | `https://app.korus.lcsgborges.cloud`  | URL base do frontend                       |
| `KORUS_EMAIL`     | `admin@email.com`                     | E-mail de login                            |
| `KORUS_SENHA`     | `AdminKorus@2026`                     | Senha de login                             |
| `HEADLESS`        | `0`                                   | `1` roda sem janela (headless)             |
| `STEP_DELAY`      | `2`                                   | Segundos de pausa entre passos; `0` desliga (e digita normal) |

> O teste valida o login bem-sucedido pelo redirecionamento de `/login` para `/admin`.

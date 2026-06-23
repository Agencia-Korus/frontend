"""Fixtures compartilhadas dos testes E2E (Selenium) da Korus.

- `driver`        : WebDriver por classe de teste (uma janela por jornada).
- `driver_fn`     : WebDriver por função (para testes isolados/públicos).
- `admin_token`   : token de admin (API) para setup de dados.
- `cliente_project_id` : id de um projeto do cliente de teste (setup via API).

Veja helpers.py para as variáveis de ambiente (URLs, credenciais, HEADLESS,
CHROME_BINARY).
"""

import pytest

import helpers


@pytest.fixture(scope="class")
def driver():
    drv = helpers.make_driver()
    try:
        yield drv
    finally:
        drv.quit()


@pytest.fixture
def driver_fn():
    drv = helpers.make_driver()
    try:
        yield drv
    finally:
        drv.quit()


@pytest.fixture(scope="session")
def admin_token():
    return helpers.api_login(helpers.ADMIN_EMAIL, helpers.ADMIN_SENHA)["access_token"]


@pytest.fixture(scope="session")
def cliente_user_id(admin_token):
    """Descobre o id do cliente de teste a partir do /auth/me dele."""
    tokens = helpers.api_login(helpers.CLIENTE_EMAIL, helpers.CLIENTE_SENHA)
    import json
    import urllib.request

    req = urllib.request.Request(
        f"{helpers.AUTH_URL}/auth/me",
        headers={"Authorization": f"Bearer {tokens['access_token']}"},
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())["id"]


@pytest.fixture(scope="session")
def cliente_project_id(admin_token, cliente_user_id):
    """Garante (via API) um projeto do cliente de teste com uma tarefa."""
    return helpers.ensure_cliente_project(admin_token, cliente_user_id)

"""Utilitários compartilhados pelos testes E2E (Selenium) da Korus.

Roda contra o ambiente real definido por KORUS_BASE_URL / KORUS_AUTH_URL /
KORUS_API_URL. As credenciais e a URL base vêm de variáveis de ambiente (com
padrões para o ambiente de homologação).

Navegador: por padrão usa o Chrome encontrado pelo selenium-manager. Para usar
outro binário Chromium (ex.: Brave), defina CHROME_BINARY=/caminho/do/binario.
Headless: defina HEADLESS=1 para rodar sem janela (obrigatório em CI/servidores
sem display).
"""

from __future__ import annotations

import itertools
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

from selenium import webdriver
from selenium.common.exceptions import (
    ElementClickInterceptedException,
    ElementNotInteractableException,
    StaleElementReferenceException,
    TimeoutException,
    WebDriverException,
)
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

# --------------------------------------------------------------------------- #
# Configuração (env)
# --------------------------------------------------------------------------- #
BASE_URL = os.getenv("KORUS_BASE_URL", "https://app.korus.lcsgborges.cloud").rstrip("/")
AUTH_URL = os.getenv("KORUS_AUTH_URL", "https://auth.korus.lcsgborges.cloud").rstrip("/")
API_URL = os.getenv("KORUS_API_URL", "https://api.korus.lcsgborges.cloud/api/v1").rstrip("/")

# Credenciais (sobrescreva via env; nunca commite senhas reais de produção).
ADMIN_EMAIL = os.getenv("KORUS_ADMIN_EMAIL", "admin@email.com")
ADMIN_SENHA = os.getenv("KORUS_ADMIN_SENHA", "senha-forte-123")
FUNC_EMAIL = os.getenv("KORUS_FUNC_EMAIL", "functestes@email.com")
FUNC_SENHA = os.getenv("KORUS_FUNC_SENHA", "12345678")
CLIENTE_EMAIL = os.getenv("KORUS_CLIENTE_EMAIL", "usuatestes@email.com")
CLIENTE_SENHA = os.getenv("KORUS_CLIENTE_SENHA", "12345678")

DEFAULT_TIMEOUT = float(os.getenv("KORUS_TIMEOUT", "20"))
STEP_DELAY = float(os.getenv("STEP_DELAY", "0"))  # pausa opcional p/ assistir (câmera lenta)
# Pequena espera após navegar para o React hidratar antes de interagir.
# (Com page_load_strategy='eager' o HTML/SSR existe antes dos handlers do React.)
SETTLE = float(os.getenv("KORUS_SETTLE", "0.9"))

UNIQUE = int(time.time())
_counter = itertools.count(1)


def uid() -> str:
    """Sufixo único por chamada (estável dentro de um processo, novo a cada run)."""
    return f"{UNIQUE}{next(_counter):03d}"


# --------------------------------------------------------------------------- #
# WebDriver
# --------------------------------------------------------------------------- #
def make_driver() -> webdriver.Chrome:
    options = Options()
    # 'eager' devolve o controle no DOMContentLoaded; páginas públicas pesadas
    # (landing com imagens/animações) podem nunca disparar o load completo.
    options.page_load_strategy = "eager"

    binary = os.getenv("CHROME_BINARY")
    if binary:
        options.binary_location = binary

    if os.getenv("HEADLESS", "0") == "1":
        options.add_argument("--headless=new")

    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1366,900")

    driver = webdriver.Chrome(options=options)
    driver.set_page_load_timeout(45)
    return driver


def wait(driver, timeout: float = DEFAULT_TIMEOUT) -> WebDriverWait:
    return WebDriverWait(driver, timeout)


# Indicadores de carregamento exibidos pelas páginas enquanto buscam dados
# ('Carregando...', '· carregando...', 'Carregando perfil...'). 'arregando'
# casa tanto 'Carregando' quanto 'carregando'.
_LOADING_XPATH = "//*[contains(text(), 'arregando')]"


def wait_loaded(driver, timeout: float = 12.0) -> None:
    """Espera os dados assíncronos da página carregarem antes de interagir.

    Com page_load_strategy='eager' o HTML/SSR aparece antes dos fetches do
    cliente; interagir nesse intervalo lê listas/tabelas/selects ainda vazios e
    o teste "buga". Aqui aguardamos os indicadores de carregamento sumirem.

    Best-effort e curto: se nenhum indicador existir, retorna na hora; se algum
    travar, não segura o teste além do timeout (a asserção seguinte decide).
    """
    try:
        # Se um indicador estiver presente agora, espera ele desaparecer.
        WebDriverWait(driver, timeout).until_not(
            EC.presence_of_element_located((By.XPATH, _LOADING_XPATH))
        )
    except (TimeoutException, WebDriverException):
        pass


def _pause() -> None:
    if STEP_DELAY:
        time.sleep(STEP_DELAY)


# --------------------------------------------------------------------------- #
# API (login direto + setup de dados)
# --------------------------------------------------------------------------- #
def api_login(email: str, senha: str) -> dict:
    """Autentica direto no serviço de auth e devolve os tokens (dict)."""
    data = urllib.parse.urlencode({"username": email, "password": senha}).encode()
    req = urllib.request.Request(
        f"{AUTH_URL}/auth/login",
        data=data,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())


def _api(method: str, path: str, token: str, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(
        f"{API_URL}{path}",
        data=data,
        method=method,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            raw = resp.read().decode()
            return resp.status, (json.loads(raw) if raw else None)
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode()[:300]


def set_google_calendar_status(admin_token: str, status: str) -> None:
    """Define o status da integração Google Calendar (conectado/desconectado).

    A agenda sincroniza eventos com o Google ao criar; se a integração estiver
    'conectado' sem credenciais válidas no servidor, o POST de evento fica lento.
    Os testes de agenda rodam com ela 'desconectado' para serem rápidos.
    """
    status_code, items = _api("GET", "/integracoes?limit=20", admin_token)
    if isinstance(items, list):
        for item in items:
            if item.get("nome") == "google_calendar":
                _api("PATCH", f"/integracoes/{item['id']}", admin_token, {"status": status})
                return


SHARED_PROJECT_NAME = "E2E Selenium Compartilhado"
SHARED_TASK_TITLE = "Tarefa E2E Selenium"


def ensure_cliente_project(admin_token: str, cliente_id: int) -> int:
    """Garante (idempotente) um projeto do cliente informado, com 1 tarefa.

    Usado para que os testes de projeto/kanban do cliente tenham dado real para
    interagir. Reaproveita o projeto pelo nome se já existir.
    """
    status, projetos = _api("GET", "/projetos?limit=200", admin_token)
    pid = None
    if isinstance(projetos, list):
        for proj in projetos:
            if proj.get("nome") == SHARED_PROJECT_NAME and proj.get("cliente_id") == cliente_id:
                pid = proj["id"]
                break

    if pid is None:
        status, created = _api(
            "POST",
            "/projetos",
            admin_token,
            {
                "nome": SHARED_PROJECT_NAME,
                "descricao": "Projeto criado pela automação de testes E2E.",
                "cliente_id": cliente_id,
                "data_inicio": "2026-01-01",
                "data_fim": "2026-12-31",
                "status": "em_andamento",
                "progresso": 30,
            },
        )
        if not isinstance(created, dict) or "id" not in created:
            raise RuntimeError(f"Falha ao criar projeto compartilhado: {status} {created}")
        pid = created["id"]

    # Garante ao menos uma tarefa para abrir no kanban.
    status, tarefas = _api("GET", f"/tarefas?projeto_id={pid}&limit=50", admin_token)
    tem_tarefa = isinstance(tarefas, list) and any(
        t.get("titulo") == SHARED_TASK_TITLE for t in tarefas
    )
    if not tem_tarefa:
        _api(
            "POST",
            "/tarefas",
            admin_token,
            {
                "projeto_id": pid,
                "responsavel_id": None,
                "titulo": SHARED_TASK_TITLE,
                "descricao": "Tarefa de teste E2E.",
                "categoria": "Design",
                "prazo": None,
                "ordem": 0,
                "status": "a_fazer",
                "complexidade": "media",
                "prioridade": "media",
            },
        )
    return pid


# --------------------------------------------------------------------------- #
# Ações de UI
# --------------------------------------------------------------------------- #
def dismiss_cookies(driver) -> None:
    """Some com o banner de cookies (reativo, sem precisar clicar)."""
    try:
        driver.execute_script(
            "localStorage.setItem('korus-cookie-consent','all');"
            "window.dispatchEvent(new Event('korus-cookie-consent-change'));"
        )
    except WebDriverException:
        pass


def goto(driver, path: str) -> None:
    """Navega para uma rota relativa, dispensa o banner de cookies e aguarda
    um curto settle para o React hidratar antes de qualquer interação.

    Faz um retry em caso de travamento transitório do renderer (driver.get
    estourar o page-load timeout)."""
    url = f"{BASE_URL}{path}"
    for attempt in range(2):
        try:
            driver.get(url)
            break
        except TimeoutException:
            if attempt == 1:
                raise
            try:
                driver.execute_script("window.stop();")
            except WebDriverException:
                pass
    dismiss_cookies(driver)
    if SETTLE:
        time.sleep(SETTLE)
    # Espera os fetches da página (listas/tabelas/selects) concluírem antes de
    # qualquer interação, senão o teste lê dados ainda vazios e "buga".
    wait_loaded(driver)


def select_react(driver, select_element, index: int = 0) -> None:
    """Seleciona uma opção e garante o disparo do evento change (atualiza o
    estado controlado do React mesmo quando a opção já aparece selecionada)."""
    from selenium.webdriver.support.ui import Select

    Select(select_element).select_by_index(index)
    driver.execute_script(
        "arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", select_element
    )
    _pause()


def click(driver, element, settle: float = 0.35, retries: int = 6) -> None:
    """Clica de forma resiliente a modais/animações (framer-motion).

    O elemento pode existir mas ainda estar animando (entrando/saindo) ou
    coberto por um overlay que esmaece — nesse intervalo o clique nativo é
    interceptado ou simplesmente não dispara o handler do React, e o teste
    "trava" esperando algo que nunca abre. Por isso: rola até o centro, dá um
    pequeno settle para a animação assentar e tenta novamente em vez de cair
    direto no clique via JS (que atravessaria o overlay e clicaria cedo demais).
    """
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    _pause()
    last_exc: Exception | None = None
    for attempt in range(retries):
        try:
            element.click()
            _pause()
            return
        except (
            ElementClickInterceptedException,
            ElementNotInteractableException,
            StaleElementReferenceException,
        ) as exc:
            # Overlay animando / elemento ainda não interativo: espera e repete.
            last_exc = exc
            time.sleep(settle)
        except WebDriverException as exc:
            last_exc = exc
            time.sleep(settle)
    # Último recurso: clique via JS (dispara mesmo se algo ainda cobre o alvo).
    try:
        driver.execute_script("arguments[0].click();", element)
        _pause()
    except WebDriverException:
        if last_exc is not None:
            raise last_exc


def _set_react_value(element, text: str) -> None:
    """Define o valor de um input/textarea controlado pelo React de forma
    confiável (usa o setter nativo do protótipo e dispara input/change)."""
    driver = element._parent
    driver.execute_script(
        """
        const el = arguments[0], val = arguments[1];
        const proto = el.tagName === 'TEXTAREA'
          ? window.HTMLTextAreaElement.prototype
          : window.HTMLInputElement.prototype;
        const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
        setter.call(el, val);
        el.dispatchEvent(new Event('input', {bubbles: true}));
        el.dispatchEvent(new Event('change', {bubbles: true}));
        """,
        element,
        text,
    )


def type_text(element, text: str) -> None:
    """Digita em um campo e garante o valor final (corrige inputs React que
    eventualmente perdem caracteres em digitação rápida).

    Se o campo ainda está dentro de um modal animando (não interativo), o
    send_keys falha; nesse caso cai direto no setter via JS para não travar."""
    try:
        element.clear()
        element.send_keys(text)
    except (ElementNotInteractableException, WebDriverException):
        _set_react_value(element, text)
        _pause()
        return
    try:
        if (element.get_attribute("value") or "") != text:
            _set_react_value(element, text)
    except WebDriverException:
        pass
    _pause()


def set_date(driver, element, value: str, retries: int = 5) -> None:
    """Define inputs type=date/time atualizando o estado controlado do React.

    Usa o setter do protótipo (não `element.value = ...`), senão o value-tracker
    do React suprime o onChange e o estado fica vazio.

    O valor é confirmado e reaplicado: dentro de um modal recém-animado o
    primeiro set pode acontecer antes do React terminar de controlar o input
    (ou ser apagado por um re-render), deixando a data vazia e travando o
    submit. Reaplica com um pequeno intervalo até o value "pegar".
    """
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    atual = ""
    for _ in range(retries):
        try:
            # input+change basta para atualizar o estado controlado do React
            # (mesmo caminho do type_text); blur é evitado porque dispara
            # revalidação onBlur em alguns formulários e pode limpar o campo.
            _set_react_value(element, value)
            atual = element.get_attribute("value") or ""
            if atual == value:
                _pause()
                return
        except StaleElementReferenceException:
            atual = "(elemento ficou stale)"
        time.sleep(0.3)
    # Falha clara: senão o teste só estoura 30s depois esperando o submit sumir.
    raise AssertionError(
        f"Data/hora não foi aplicada no input: esperado {value!r}, "
        f"value atual {atual!r}. O campo provavelmente ficou vazio e o "
        f"formulário não vai validar."
    )


def input_by_label(driver, label_text: str, tag: str = "input"):
    return driver.find_element(
        By.XPATH, f"//label[contains(., '{label_text}')]/following-sibling::{tag}"
    )


# --------------------------------------------------------------------------- #
# Login / Logout
# --------------------------------------------------------------------------- #
def ui_login(driver, email: str, senha: str, attempts: int = 4) -> None:
    """Login pela interface, resiliente à corrida de hidratação do React.

    Com page_load_strategy='eager' o formulário existe no HTML (SSR) antes do
    React anexar os handlers; digitar cedo demais deixa o estado vazio
    ('Field required'). Por isso: aguarda um settle, empurra os valores para o
    estado controlado e tenta novamente recarregando a página, se preciso.

    Espera só sair de /login — o dashboard de alguns perfis pode quebrar; isso é
    validado em testes específicos.
    """
    last_msg = "(sem mensagem)"
    for _ in range(attempts):
        goto(driver, "/login")
        w = wait(driver, 30)
        email_el = w.until(
            EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
        )
        dismiss_cookies(driver)
        time.sleep(1.2)  # dá tempo para o React hidratar antes de digitar
        senha_el = driver.find_element(By.CSS_SELECTOR, "input[type='password']")

        email_el.clear()
        email_el.send_keys(email)
        senha_el.clear()
        senha_el.send_keys(senha)
        # Empurra os valores para o estado controlado do React (dispara input/change).
        _set_react_value(email_el, email)
        _set_react_value(senha_el, senha)

        driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        try:
            WebDriverWait(driver, 8).until(lambda d: "/login" not in d.current_url)
            return
        except TimeoutException:
            erros = driver.find_elements(By.CSS_SELECTOR, ".text-\\[\\#EF4444\\]")
            last_msg = erros[0].text if erros else "(sem mensagem de erro visível)"
            # Erro real de credencial: não adianta repetir.
            if any(k in last_msg.lower() for k in ("inválid", "pendente", "incorret", "aprovação")):
                break
            # Caso contrário (ex.: corrida de hidratação) tenta de novo.
    raise AssertionError(
        f"Login não redirecionou (segue em {driver.current_url}). Mensagem: {last_msg}"
    )


def inject_session(driver, tokens: dict) -> None:
    """Injeta tokens no localStorage (login rápido, sem passar pela UI)."""
    goto(driver, "/login")
    driver.execute_script(
        "localStorage.setItem('korus.accessToken', arguments[0]);"
        "localStorage.setItem('korus.refreshToken', arguments[1]);"
        "localStorage.setItem('korus-cookie-consent','all');",
        tokens["access_token"],
        tokens["refresh_token"],
    )


def logout(driver) -> None:
    w = wait(driver, 15)
    btn = w.until(
        EC.element_to_be_clickable(
            (By.XPATH, "//button[.//span[normalize-space()='Sair']]")
        )
    )
    click(driver, btn)
    w.until(lambda d: "/login" in d.current_url)

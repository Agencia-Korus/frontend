"""Teste E2E de login no ambiente real (app.korus.lcsgborges.cloud).

Roda contra o domínio de produção: abre /login, autentica com as credenciais
e verifica o redirecionamento para a área logada (/admin).

Uso:
    pip install -r requirements.txt
    pytest test_login.py -v
    HEADLESS=0 pytest test_login.py -v
"""

import os
import time

from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

BASE_URL = os.getenv("KORUS_BASE_URL", "https://app.korus.lcsgborges.cloud").rstrip("/")
EMAIL = os.getenv("KORUS_EMAIL", "admin@email.com")
SENHA = os.getenv("KORUS_SENHA", "AdminKorus@2026")

STEP_DELAY = float(os.getenv("STEP_DELAY", "2"))


def _pause():
    if STEP_DELAY:
        time.sleep(STEP_DELAY)


def _type_slowly(element, text):
    """Digita caractere a caractere quando em câmera lenta (STEP_DELAY > 0)."""
    if not STEP_DELAY:
        element.send_keys(text)
        return
    for ch in text:
        element.send_keys(ch)
        time.sleep(0.08)


def _dismiss_cookie_banner(driver):
    """Fecha o banner de cookies (se aparecer) para não interceptar cliques."""
    for xpath in (
        "//button[contains(., 'Aceitar todos')]",
        "//button[contains(., 'Apenas essenciais')]",
        "//button[@aria-label='Fechar']",
    ):
        try:
            els = driver.find_elements(By.XPATH, xpath)
            if els:
                els[0].click()
                return
        except WebDriverException:
            pass


def test_login_admin(driver):
    wait = WebDriverWait(driver, 25)

    driver.get(f"{BASE_URL}/login")
    _pause()

    email_input = wait.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
    )
    _dismiss_cookie_banner(driver)
    _pause()

    senha_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")

    email_input.clear()
    _type_slowly(email_input, EMAIL)
    _pause()
    senha_input.clear()
    _type_slowly(senha_input, SENHA)
    _pause()

    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    try:
        wait.until(lambda d: "/login" not in d.current_url)
    except TimeoutException:
        erros = driver.find_elements(By.CSS_SELECTOR, "p[style*='EF4444'], .text-\\[\\#EF4444\\]")
        msg = erros[0].text if erros else "(sem mensagem de erro visível)"
        raise AssertionError(
            f"Login não redirecionou. Continua em {driver.current_url}. Mensagem: {msg}"
        )

    assert "/admin" in driver.current_url, (
        f"Esperava redirect para /admin, mas a URL atual é: {driver.current_url}"
    )

    _pause()
    _pause()

"""Testes E2E de autenticação (login) contra o ambiente real."""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

import helpers


def test_login_admin_redireciona(driver_fn):
    """Login válido de admin redireciona de /login para /admin."""
    driver = driver_fn
    helpers.ui_login(driver, helpers.ADMIN_EMAIL, helpers.ADMIN_SENHA)
    helpers.wait(driver).until(lambda d: "/admin" in d.current_url)
    helpers.wait(driver).until(
        EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Dashboard')]"))
    )
    assert "/admin" in driver.current_url


def test_login_cliente_redireciona(driver_fn):
    """Login válido de cliente redireciona para /cliente."""
    driver = driver_fn
    helpers.ui_login(driver, helpers.CLIENTE_EMAIL, helpers.CLIENTE_SENHA)
    helpers.wait(driver).until(lambda d: "/cliente" in d.current_url)
    assert "/cliente" in driver.current_url


def test_login_funcionario_redireciona(driver_fn):
    """Login válido de funcionário redireciona para /funcionario."""
    driver = driver_fn
    helpers.ui_login(driver, helpers.FUNC_EMAIL, helpers.FUNC_SENHA)
    helpers.wait(driver).until(lambda d: "/funcionario" in d.current_url)
    assert "/funcionario" in driver.current_url


def test_login_invalido_mostra_erro(driver_fn):
    """Credenciais inválidas exibem mensagem de erro e mantêm em /login."""
    driver = driver_fn
    helpers.goto(driver, "/login")
    w = helpers.wait(driver, 30)
    email_el = w.until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='email']"))
    )
    helpers.dismiss_cookies(driver)
    senha_el = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    helpers.type_text(email_el, "naoexiste@email.com")
    helpers.type_text(senha_el, "senha-errada-123")
    driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()

    erro = w.until(
        EC.visibility_of_element_located(
            (By.XPATH, "//p[contains(@class, 'EF4444')]")
        )
    )
    assert erro.text.strip(), "Esperava uma mensagem de erro visível."
    assert "/login" in driver.current_url

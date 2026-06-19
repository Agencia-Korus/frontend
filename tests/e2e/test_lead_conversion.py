"""Teste E2E: Fase 1 - Captação de Lead e Triagem.

Fluxo:
1. Visitante acessa /solicitar/website e preenche formulário.
2. Admin loga no sistema.
3. Admin vai para /admin/leads e converte o lead criado.

Uso:
    pytest test_lead_conversion.py -v -s
    # visual (câmera lenta):
    HEADLESS=0 pytest test_lead_conversion.py -v -s
"""

import os
import time
import pytest
from selenium.common.exceptions import TimeoutException, WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.ui import Select

BASE_URL = os.getenv("KORUS_BASE_URL", "https://app.korus.lcsgborges.cloud").rstrip("/")
EMAIL_ADMIN = os.getenv("KORUS_EMAIL", "admin@email.com")
SENHA_ADMIN = os.getenv("KORUS_SENHA", "AdminKorus@2026")
STEP_DELAY = float(os.getenv("STEP_DELAY", "2"))

def _pause():
    if STEP_DELAY:
        time.sleep(STEP_DELAY)

def _type_slowly(element, text):
    if not STEP_DELAY:
        element.send_keys(text)
        return
    for ch in text:
        element.send_keys(ch)
        time.sleep(0.08)

def _click(driver, element):
    """Realiza um clique robusto, scrollando até o elemento ou usando JS como fallback."""
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    time.sleep(0.5)
    try:
        element.click()
    except WebDriverException:
        driver.execute_script("arguments[0].click();", element)

def _dismiss_cookie_banner(driver):
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

class TestLeadConversionJourney:
    
    # Compartilhamento de estado entre testes da mesma jornada
    lead_email = f"lead.e2e.{int(time.time())}@teste.com"
    lead_name = "Empresa E2E"

    def test_01_visitor_creates_lead(self, driver):
        wait = WebDriverWait(driver, 15)
        
        # 1. Acessa a página de solicitar serviço
        driver.get(f"{BASE_URL}/solicitar/website")
        _pause()
        _dismiss_cookie_banner(driver)

        # Passo 0: Seus Dados
        name_input = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(text(), 'Nome completo')]/following-sibling::input")))
        name_input.clear()
        _type_slowly(name_input, self.lead_name)
        
        email_input = driver.find_element(By.XPATH, "//label[contains(text(), 'E-mail')]/following-sibling::input")
        email_input.clear()
        _type_slowly(email_input, self.lead_email)
        
        phone_input = driver.find_element(By.XPATH, "//label[contains(text(), 'Telefone')]/following-sibling::input")
        phone_input.clear()
        _type_slowly(phone_input, "11999999999")
        
        company_input = driver.find_element(By.XPATH, "//label[contains(text(), 'Nome da empresa')]/following-sibling::input")
        company_input.clear()
        _type_slowly(company_input, "Tech LTDA")
        _pause()

        btn1 = driver.find_element(By.XPATH, "//button[contains(., 'Continuar')]")
        _click(driver, btn1)
        _pause()

        # Passo 1: Sobre o Projeto
        desc_input = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(text(), 'Descrição do projeto')]/following-sibling::textarea")))
        desc_input.clear()
        _type_slowly(desc_input, "Projeto de automação E2E gerado via Selenium.")
        
        budget_select = Select(driver.find_element(By.XPATH, "//label[contains(text(), 'Orçamento estimado')]/following-sibling::select"))
        budget_select.select_by_index(2)
        _pause()

        btn2 = driver.find_element(By.XPATH, "//button[contains(., 'Continuar')]")
        _click(driver, btn2)
        _pause()

        # Passo 2: Confirmação e Termos
        terms_checkbox = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, "input[type='checkbox']")))
        _click(driver, terms_checkbox)
        _pause()

        btn_submit = driver.find_element(By.XPATH, "//button[contains(., 'Enviar Solicitação')]")
        _click(driver, btn_submit)
        
        # Aguarda tela de sucesso
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(text(), 'Solicitação enviada com sucesso!')]")))
        _pause()

    def test_02_admin_converts_lead(self, driver):
        wait = WebDriverWait(driver, 15)
        
        # 1. Login como admin
        driver.get(f"{BASE_URL}/login")
        _pause()
        _dismiss_cookie_banner(driver)
        
        email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        email_input.clear()
        _type_slowly(email_input, EMAIL_ADMIN)
        
        senha_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        senha_input.clear()
        _type_slowly(senha_input, SENHA_ADMIN)
        _pause()

        btn_login = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        _click(driver, btn_login)
        wait.until(lambda d: "/admin" in d.current_url)
        _pause()

        # 2. Navegar para Gestão de Leads
        driver.get(f"{BASE_URL}/admin/leads")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(text(), 'Gestão de Leads')]")))
        _pause()
        
        # 3. Buscar pelo lead criado
        search_input = driver.find_element(By.XPATH, "//input[@placeholder='Buscar leads...']")
        search_input.clear()
        _type_slowly(search_input, self.lead_name)
        _pause()

        # Clica na primeira linha da tabela que contem o email
        lead_row = wait.until(EC.presence_of_element_located((By.XPATH, f"//td[contains(text(), '{self.lead_email}')]")))
        _click(driver, lead_row)
        _pause()

        # 4. No modal, altera o status
        status_select = Select(wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(text(), 'Alterar Status')]/following-sibling::select"))))
        status_select.select_by_value("convertido")
        _pause()

        # Salva
        btn_save = driver.find_element(By.XPATH, "//button[text()='Salvar']")
        _click(driver, btn_save)
        _pause()
        
        # O modal deve fechar
        wait.until_not(EC.visibility_of_element_located((By.XPATH, "//button[text()='Salvar']")))
        _pause()

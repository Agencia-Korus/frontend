import os
import time
import urllib.error
import urllib.request
import json
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.ui import Select

BASE_URL = os.getenv("KORUS_BASE_URL", "https://app.korus.lcsgborges.cloud").rstrip("/")
AUTH_URL = os.getenv("KORUS_AUTH_URL", "https://auth.korus.lcsgborges.cloud")
EMAIL_ADMIN = os.getenv("KORUS_EMAIL", "admin@email.com")
SENHA_ADMIN = os.getenv("KORUS_SENHA", "AdminKorus@2026")
STEP_DELAY = 1.0

def _pause():
    time.sleep(STEP_DELAY)

def _click(driver, element):
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", element)
    time.sleep(0.5)
    try:
        element.click()
    except WebDriverException:
        driver.execute_script("arguments[0].click();", element)
    _pause()

def _type(element, text):
    element.clear()
    for ch in text:
        element.send_keys(ch)
        time.sleep(0.05)
    _pause()

class TestClienteJourney:
    unique_id = int(time.time())
    client_email = f"cliente_{unique_id}@email.com"
    client_name = f"Cliente E2E {unique_id}"

    def test_01_cliente_full_journey(self, driver):
        wait = WebDriverWait(driver, 10)
        
        payload = {
            "nome": self.client_name,
            "email": self.client_email,
            "senha": "Senha@123",
            "role": "cliente",
            "cliente": {
                "razao_social": "Empresa E2E",
                "cnpj_cpf": str(self.unique_id)[:11].zfill(11),
                "segmento": "Tecnologia",
            },
        }
        req = urllib.request.Request(
            f"{AUTH_URL}/auth/register",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )
        try:
            with urllib.request.urlopen(req) as resp:
                pass
        except urllib.error.HTTPError:
            pass

        driver.get(f"{BASE_URL}/login")
        _pause()
        email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        _type(email_input, EMAIL_ADMIN)
        senha_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        _type(senha_input, SENHA_ADMIN)
        btn_login = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        _click(driver, btn_login)
        wait.until(lambda d: "/admin" in d.current_url)
        _pause()

        driver.get(f"{BASE_URL}/admin/usuarios")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gestão de Usuários')]")))
        _pause()
        search_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[placeholder*='Buscar']")))
        _type(search_input, self.client_name)
        try:
            user_row = wait.until(EC.visibility_of_element_located((By.XPATH, f"//td[contains(., '{self.client_name}')]/..")))
            more_btn = user_row.find_element(By.XPATH, ".//button")
            _click(driver, more_btn)
            status_select = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Status')]/following-sibling::select")))
            Select(status_select).select_by_visible_text("Ativo")
            btn_save = driver.find_element(By.XPATH, "//button[contains(., 'Salvar Alterações')]")
            _click(driver, btn_save)
            wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[contains(., 'Salvar Alterações')]")))
        except Exception:
            pass
        _pause()
        
        btn_sair = wait.until(EC.element_to_be_clickable((By.XPATH, "//span[contains(., 'Sair')]/..")))
        _click(driver, btn_sair)
        wait.until(lambda d: "/login" in d.current_url)
        _pause()

        email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        _type(email_input, self.client_email)
        senha_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        _type(senha_input, "Senha@123")
        btn_login = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        _click(driver, btn_login)
        
        wait.until(lambda d: "/cliente" in d.current_url)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Dashboard')] | //h3[contains(., 'Fale com a equipe')]")))
        _pause()

        driver.get(f"{BASE_URL}/cliente/projetos")
        wait.until(lambda d: "/cliente/projetos" in d.current_url)
        try:
            card = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'cursor-pointer') and .//h4]")))
            _click(driver, card)
            wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Detalhes')]")))
            btn_fechar = driver.find_element(By.XPATH, "//button[contains(@class, 'absolute top-4 right-4')]")
            _click(driver, btn_fechar)
        except Exception:
            pass
        _pause()

        driver.get(f"{BASE_URL}/cliente/agenda")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h1[contains(., 'Minha Agenda')] | //h2[contains(., 'Minha Agenda')]")))
        _pause()
        btn_solicitar = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Solicitar reunião')]")))
        _click(driver, btn_solicitar)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Solicitar Reunião')]")))
        dt_req = driver.find_element(By.XPATH, "//label[contains(., 'Data')]/following-sibling::input[@type='date']")
        driver.execute_script("arguments[0].value = '2026-12-31'; arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", dt_req)
        hr_req = driver.find_element(By.XPATH, "//label[contains(., 'Horário')]/following-sibling::input[@type='time']")
        driver.execute_script("arguments[0].value = '14:00'; arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", hr_req)
        assunto = driver.find_element(By.XPATH, "//label[contains(., 'Assunto')]/following-sibling::input")
        _type(assunto, "Reunião de alinhamento com a Agência")
        btn_enviar = driver.find_element(By.XPATH, "//button[contains(., 'Enviar Solicitação')]")
        _click(driver, btn_enviar)
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[contains(., 'Enviar Solicitação')]")))
        _pause()

        driver.get(f"{BASE_URL}/cliente/perfil")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Meu Perfil')]")))
        _pause()
        nome_perfil = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Nome')]/following-sibling::input")))
        _type(nome_perfil, f"{self.client_name} Editado")
        btn_salvar_perfil = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Salvar Alterações')]")))
        _click(driver, btn_salvar_perfil)
        _pause()

        btn_sair = wait.until(EC.element_to_be_clickable((By.XPATH, "//span[contains(., 'Sair')]/..")))
        _click(driver, btn_sair)
        wait.until(lambda d: "/login" in d.current_url)
        _pause()

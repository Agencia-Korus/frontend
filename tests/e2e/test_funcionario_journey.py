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

class TestFuncionarioJourney:
    unique_id = int(time.time())
    func_email = f"func_{unique_id}@email.com"
    func_name = f"Funcionario E2E {unique_id}"

    def test_01_funcionario_full_journey(self, driver):
        wait = WebDriverWait(driver, 10)
        
        payload = {
            "nome": self.func_name,
            "email": self.func_email,
            "senha": "Senha@123",
            "role": "funcionario",
            "funcionario": {
                "cargo": "Desenvolvedor"
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
        _type(search_input, self.func_name)
        try:
            user_row = wait.until(EC.visibility_of_element_located((By.XPATH, f"//td[contains(., '{self.func_name}')]/..")))
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
        _type(email_input, self.func_email)
        senha_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        _type(senha_input, "Senha@123")
        btn_login = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        _click(driver, btn_login)
        
        wait.until(lambda d: "/funcionario" in d.current_url)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Minhas Tarefas')] | //h2[contains(., 'Dashboard')]")))
        _pause()

        driver.get(f"{BASE_URL}/funcionario/projetos")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Meus Projetos')]")))
        try:
            card = wait.until(EC.element_to_be_clickable((By.XPATH, "//div[contains(@class, 'cursor-pointer') and .//h4]")))
            _click(driver, card)
            wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Detalhes da Tarefa') or contains(., 'Detalhes do Projeto')]")))
            btn_fechar = driver.find_element(By.XPATH, "//button[contains(@class, 'absolute top-4 right-4')]")
            _click(driver, btn_fechar)
        except Exception:
            pass
        _pause()

        driver.get(f"{BASE_URL}/funcionario/feed")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Feed de Comunicados')]")))
        try:
            btn_curtir = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Curtir') or contains(., 'Like')]")))
            _click(driver, btn_curtir)
        except Exception:
            pass
        _pause()

        driver.get(f"{BASE_URL}/funcionario/agenda")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h1[contains(., 'Minha Agenda')] | //h2[contains(., 'Minha Agenda')]")))
        _pause()
        btn_add_agenda = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Adicionar à agenda')]")))
        _click(driver, btn_add_agenda)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Adicionar à Agenda')]")))
        titulo_ag = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Título')]/following-sibling::input")))
        _type(titulo_ag, "Evento Selenium Funcionario")
        dt_ag = driver.find_element(By.XPATH, "//label[contains(., 'Data')]/following-sibling::input[@type='date']")
        driver.execute_script("arguments[0].value = '2026-12-31'; arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", dt_ag)
        hr_ag = driver.find_element(By.XPATH, "//label[contains(., 'Horário')]/following-sibling::input[@type='time']")
        driver.execute_script("arguments[0].value = '10:00'; arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", hr_ag)
        btn_add_evento = driver.find_element(By.XPATH, "//button[contains(., 'Adicionar evento')]")
        _click(driver, btn_add_evento)
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[contains(., 'Adicionar evento')]")))
        _pause()

        driver.get(f"{BASE_URL}/funcionario/xp")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Meu XP e Conquistas')]")))
        _pause()

        driver.get(f"{BASE_URL}/funcionario/perfil")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Meu Perfil')]")))
        _pause()
        nome_perfil = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Nome')]/following-sibling::input")))
        _type(nome_perfil, f"{self.func_name} Editado")
        bio = driver.find_element(By.XPATH, "//label[contains(., 'Biografia') or contains(., 'Bio')]/following-sibling::textarea")
        _type(bio, "Desenvolvedor focado em testes automatizados.")
        btn_salvar_perfil = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Salvar Alterações')]")))
        _click(driver, btn_salvar_perfil)
        _pause()

        btn_sair = wait.until(EC.element_to_be_clickable((By.XPATH, "//span[contains(., 'Sair')]/..")))
        _click(driver, btn_sair)
        wait.until(lambda d: "/login" in d.current_url)
        _pause()

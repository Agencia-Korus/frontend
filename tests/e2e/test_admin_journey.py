import os
import time
from selenium.common.exceptions import WebDriverException
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support.ui import Select

BASE_URL = os.getenv("KORUS_BASE_URL", "https://app.korus.lcsgborges.cloud").rstrip("/")
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

class TestAdminJourney:
    unique_id = int(time.time())

    def test_01_admin_full_journey(self, driver):
        wait = WebDriverWait(driver, 10)
        
        driver.get(f"{BASE_URL}/login")
        _pause()
        
        email_input = wait.until(EC.visibility_of_element_located((By.CSS_SELECTOR, "input[type='email']")))
        _type(email_input, EMAIL_ADMIN)
        
        senha_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        _type(senha_input, SENHA_ADMIN)
        
        btn_login = driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
        _click(driver, btn_login)
        
        wait.until(lambda d: "/admin" in d.current_url)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Dashboard')]")))
        _pause()

        driver.get(f"{BASE_URL}/admin/usuarios")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gestão de Usuários')]")))
        btn_novo_user = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Adicionar Novo Usuário')]")))
        _click(driver, btn_novo_user)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Novo Usuário')]")))
        nome_user = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Nome')]/following-sibling::input")))
        _type(nome_user, f"User Teste {self.unique_id}")
        email_user = driver.find_element(By.XPATH, "//label[contains(., 'E-mail')]/following-sibling::input")
        _type(email_user, f"user{self.unique_id}@teste.com")
        senha_temp = driver.find_element(By.XPATH, "//label[contains(., 'Senha temporária')]/following-sibling::input")
        _type(senha_temp, "Senha@123")
        btn_criar_user = driver.find_element(By.XPATH, "//button[contains(., 'Criar Usuário')]")
        _click(driver, btn_criar_user)
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[contains(., 'Criar Usuário')]")))
        _pause()

        driver.get(f"{BASE_URL}/admin/leads")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gestão de Leads')]")))
        try:
            lead_row = wait.until(EC.element_to_be_clickable((By.XPATH, "//tbody/tr[1]")))
            _click(driver, lead_row)
            wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Alterar Status')]")))
            status_lead = driver.find_element(By.XPATH, "//label[contains(., 'Alterar Status')]/following-sibling::select")
            Select(status_lead).select_by_visible_text("Em Contato")
            anotacao = driver.find_element(By.XPATH, "//label[contains(., 'Anotações internas')]/following-sibling::textarea")
            _type(anotacao, "Ligação agendada")
            btn_salvar_lead = driver.find_element(By.XPATH, "//button[contains(., 'Salvar')]")
            _click(driver, btn_salvar_lead)
            wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[contains(., 'Salvar')]")))
        except Exception:
            pass # se nao houver leads
        _pause()

        driver.get(f"{BASE_URL}/admin/projetos")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Todos os Projetos')]")))
        btn_novo_proj = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Novo Projeto')]")))
        _click(driver, btn_novo_proj)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Novo Projeto')]")))
        
        nome_proj = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Nome do projeto')]/following-sibling::input")))
        _type(nome_proj, f"Projeto E2E {self.unique_id}")
        desc_proj = driver.find_element(By.XPATH, "//label[contains(., 'Descrição')]/following-sibling::textarea")
        _type(desc_proj, "Teste de descrição")
        dt_ini_proj = driver.find_element(By.XPATH, "//label[contains(., 'Data início')]/following-sibling::input")
        driver.execute_script("arguments[0].value = '2026-01-01'; arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", dt_ini_proj)
        dt_fim_proj = driver.find_element(By.XPATH, "//label[contains(., 'Data fim')]/following-sibling::input")
        driver.execute_script("arguments[0].value = '2026-12-31'; arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", dt_fim_proj)
        
        btn_salvar_proj = driver.find_element(By.XPATH, "//button[contains(., 'Criar Projeto')]")
        _click(driver, btn_salvar_proj)
        try:
            wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[contains(., 'Criar Projeto')]")))
        except:
            btn_fechar_modal = driver.find_element(By.XPATH, "//button[contains(@class, 'absolute top-4 right-4')]")
            _click(driver, btn_fechar_modal)
        _pause()

        driver.get(f"{BASE_URL}/admin/servicos")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gerenciar Serviços')]")))
        btn_novo_serv = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Novo Serviço')]")))
        _click(driver, btn_novo_serv)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Novo Serviço')]")))
        nome_serv = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Nome')]/following-sibling::input")))
        _type(nome_serv, f"Servico {self.unique_id}")
        desc_serv = driver.find_element(By.XPATH, "//label[contains(., 'Descrição')]/following-sibling::textarea")
        _type(desc_serv, "Descricao teste")
        btn_salvar_serv = driver.find_element(By.XPATH, "//button[contains(., 'Salvar Serviço')]")
        _click(driver, btn_salvar_serv)
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[contains(., 'Salvar Serviço')]")))
        _pause()

        driver.get(f"{BASE_URL}/admin/portfolio")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gerenciar Portfólio')]")))
        btn_novo_port = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Novo Item')]")))
        _click(driver, btn_novo_port)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Novo Case')]")))
        nome_port = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Nome do projeto')]/following-sibling::input")))
        _type(nome_port, f"Case {self.unique_id}")
        btn_salvar_port = driver.find_element(By.XPATH, "//button[contains(., 'Salvar')]")
        _click(driver, btn_salvar_port)
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[contains(., 'Salvar')]")))
        _pause()

        driver.get(f"{BASE_URL}/admin/academy")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gerenciar Academy')]")))
        btn_novo_acad = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Novo Conteúdo')]")))
        _click(driver, btn_novo_acad)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Novo Conteúdo')]")))
        titulo_acad = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Título')]/following-sibling::input")))
        _type(titulo_acad, f"E-book Teste {self.unique_id}")
        desc_acad = driver.find_element(By.XPATH, "//label[contains(., 'Descrição')]/following-sibling::textarea")
        _type(desc_acad, "Desc teste")
        preco_acad = driver.find_element(By.XPATH, "//label[contains(., 'Preço')]/following-sibling::input")
        _type(preco_acad, "100")
        btn_salvar_acad = driver.find_element(By.XPATH, "//button[contains(., 'Salvar')]")
        _click(driver, btn_salvar_acad)
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[contains(., 'Salvar')]")))
        _pause()

        driver.get(f"{BASE_URL}/admin/feed")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Publicar Comunicados')]")))
        btn_novo_com = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Novo Comunicado')]")))
        _click(driver, btn_novo_com)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Novo Comunicado')]")))
        titulo_com = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Título')]/following-sibling::input")))
        _type(titulo_com, f"Comunicado {self.unique_id}")
        btn_publicar_com = driver.find_element(By.XPATH, "//button[contains(., 'Publicar')]")
        _click(driver, btn_publicar_com)
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[contains(., 'Publicar')]")))
        _pause()

        driver.get(f"{BASE_URL}/admin/agenda")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h1[contains(., 'Agenda Geral')] | //h2[contains(., 'Agenda Geral')]")))
        btn_add_agenda = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Adicionar à agenda')]")))
        _click(driver, btn_add_agenda)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Adicionar à Agenda')]")))
        titulo_ag = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Título')]/following-sibling::input")))
        _type(titulo_ag, "Evento E2E")
        dt_ag = driver.find_element(By.XPATH, "//label[contains(., 'Data')]/following-sibling::input[@type='date']")
        driver.execute_script("arguments[0].value = '2026-12-31'; arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", dt_ag)
        hr_ag = driver.find_element(By.XPATH, "//label[contains(., 'Horário')]/following-sibling::input[@type='time']")
        driver.execute_script("arguments[0].value = '10:00'; arguments[0].dispatchEvent(new Event('change', {bubbles: true}));", hr_ag)
        btn_add_evento = driver.find_element(By.XPATH, "//button[contains(., 'Adicionar evento')]")
        _click(driver, btn_add_evento)
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[contains(., 'Adicionar evento')]")))
        _pause()

        driver.get(f"{BASE_URL}/admin/gamificacao")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gamificação')]")))
        btn_nova_regra = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Nova regra')]")))
        _click(driver, btn_nova_regra)
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Nova Regra de XP')]")))
        tarefa_regra = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Tarefa')]/following-sibling::input")))
        _type(tarefa_regra, f"Regra {self.unique_id}")
        btn_salvar_regra = driver.find_element(By.XPATH, "//button[contains(., 'Salvar regra')]")
        _click(driver, btn_salvar_regra)
        wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[contains(., 'Salvar regra')]")))
        _pause()

        driver.get(f"{BASE_URL}/admin/configuracoes")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Configurações')]")))
        nome_agencia = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Nome da agência')]/following-sibling::input")))
        _type(nome_agencia, "Korus E2E")
        btn_salvar_conf = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Salvar Configurações')]")))
        _click(driver, btn_salvar_conf)
        _pause()

        driver.get(f"{BASE_URL}/admin/perfil")
        wait.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Meu Perfil')]")))
        nome_perfil = wait.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Nome')]/following-sibling::input")))
        _type(nome_perfil, "Admin E2E Editado")
        btn_salvar_perfil = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(., 'Salvar Alterações')]")))
        _click(driver, btn_salvar_perfil)
        _pause()

        btn_sair = wait.until(EC.element_to_be_clickable((By.XPATH, "//span[contains(., 'Sair')]/..")))
        _click(driver, btn_sair)
        wait.until(lambda d: "/login" in d.current_url)
        _pause()

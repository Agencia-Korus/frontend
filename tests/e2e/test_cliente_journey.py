"""Jornada E2E completa do CLIENTE.

Login uma vez por classe. Um projeto do cliente (com tarefa) é garantido via API
pela fixture `cliente_project_id`, para exercitar o kanban/comentário.
A página de perfil está quebrada em produção (xfail) — ver PRODUCTION_BUGS.md.
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC

import helpers
from helpers import click, goto, input_by_label, set_date, type_text, wait


@pytest.fixture(scope="class")
def cliente_session(driver, admin_token):
    helpers.set_google_calendar_status(admin_token, "desconectado")
    helpers.ui_login(driver, helpers.CLIENTE_EMAIL, helpers.CLIENTE_SENHA)
    wait(driver, 30).until(lambda d: "/cliente" in d.current_url)


@pytest.mark.usefixtures("cliente_session")
class TestClienteJourney:
    def test_01_dashboard(self, driver):
        goto(driver, "/cliente")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Olá')]")))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Projetos Ativos')]")))

    def test_02_projetos_lista(self, driver, cliente_project_id):
        goto(driver, "/cliente/projetos")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Meus Projetos')]")))
        # O cliente deve enxergar ao menos o projeto compartilhado criado via API
        w.until(EC.visibility_of_element_located((By.XPATH, "//h4")))

    def test_03_projeto_kanban_comentar(self, driver, cliente_project_id):
        goto(driver, f"/cliente/projetos/{cliente_project_id}")
        w = wait(driver)
        # O kanban renderiza com o nome do projeto no topo
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2")))
        # Abre o primeiro cartão de tarefa (cliente pode visualizar e comentar)
        cartao = w.until(EC.element_to_be_clickable(
            (By.XPATH, "(//div[contains(@class, 'shadow-sm')]//p)[1]")))
        click(driver, cartao)
        comentario = w.until(EC.visibility_of_element_located(
            (By.XPATH, "//input[contains(@placeholder, 'Escreva um comentário')]")))
        comentario_txt = "Comentário do cliente via E2E."
        type_text(comentario, comentario_txt)
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Enviar')]"))))
        # Valida pelo comentário na thread (durável), não pelo toast (some em 3s).
        w.until(EC.visibility_of_element_located(
            (By.XPATH, f"//p[normalize-space()='{comentario_txt}']")))

    def test_04_agenda_adicionar_evento(self, driver):
        goto(driver, "/cliente/agenda")
        w = wait(driver)
        w.until(EC.visibility_of_element_located(
            (By.XPATH, "//h2[contains(., 'Minha Agenda')] | //h1[contains(., 'Minha Agenda')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Adicionar à agenda')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Adicionar à Agenda')]")))
        type_text(input_by_label(driver, "Título"), "Evento E2E Cliente")
        set_date(driver, driver.find_element(
            By.XPATH, "//label[contains(., 'Data')]/following-sibling::input[@type='date']"), "2026-12-31")
        set_date(driver, driver.find_element(
            By.XPATH, "//label[contains(., 'Horário')]/following-sibling::input[@type='time']"), "11:00")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Adicionar evento']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Adicionar evento']")))

    def test_05_agenda_solicitar_reuniao(self, driver):
        goto(driver, "/cliente/agenda")
        w = wait(driver)
        w.until(EC.visibility_of_element_located(
            (By.XPATH, "//h2[contains(., 'Minha Agenda')] | //h1[contains(., 'Minha Agenda')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Solicitar reunião')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Solicitar Reunião')]")))
        para = w.until(EC.presence_of_element_located(
            (By.XPATH, "//label[contains(., 'Para')]/following-sibling::select")))
        w.until(lambda d: len(para.find_elements(By.TAG_NAME, "option")) > 1)
        helpers.select_react(driver, para, 1)
        set_date(driver, driver.find_element(
            By.XPATH, "//label[contains(., 'Data')]/following-sibling::input[@type='date']"), "2026-12-31")
        set_date(driver, driver.find_element(
            By.XPATH, "//label[contains(., 'Horário')]/following-sibling::input[@type='time']"), "16:00")
        type_text(input_by_label(driver, "Assunto"), "Reunião de alinhamento com a Agência")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Enviar Solicitação']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Enviar Solicitação']")))

    def test_06_perfil(self, driver):
        goto(driver, "/cliente/perfil")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Meu Perfil')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Salvar Alterações')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//p[contains(., 'Alterações salvas')]")))

    def test_07_logout(self, driver):
        goto(driver, "/cliente")
        wait(driver).until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Olá')]")))
        helpers.logout(driver)
        assert "/login" in driver.current_url

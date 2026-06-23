"""Jornada E2E completa do FUNCIONÁRIO.

Login uma vez por classe. As páginas quebradas em produção (dashboard e perfil)
são marcadas com xfail e documentadas em PRODUCTION_BUGS.md.
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

import helpers
from helpers import click, goto, input_by_label, set_date, type_text, wait


@pytest.fixture(scope="class")
def func_session(driver):
    helpers.ui_login(driver, helpers.FUNC_EMAIL, helpers.FUNC_SENHA)
    wait(driver, 30).until(lambda d: "/funcionario" in d.current_url)


@pytest.mark.usefixtures("func_session")
class TestFuncionarioJourney:
    def test_01_dashboard(self, driver):
        goto(driver, "/funcionario")
        wait(driver).until(EC.visibility_of_element_located(
            (By.XPATH, "//h3[contains(., 'Minhas Tarefas')] | //h2[contains(., 'Olá')]")))

    def test_02_projetos_lista(self, driver):
        goto(driver, "/funcionario/projetos")
        wait(driver).until(EC.visibility_of_element_located(
            (By.XPATH, "//h2[contains(., 'Meus Projetos')]")))

    def test_03_feed_ler_mais(self, driver):
        goto(driver, "/funcionario/feed")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Feed de Comunicados')]")))
        ler_mais = driver.find_elements(By.XPATH, "//button[normalize-space()='Ler mais']")
        if not ler_mais:
            pytest.skip("Nenhum comunicado no feed para abrir.")
        click(driver, ler_mais[0])
        # Abre o modal de detalhe do comunicado
        modal = w.until(EC.visibility_of_element_located(
            (By.XPATH, "//div[contains(@class, 'rounded-2xl')]")))
        click(driver, modal.find_element(By.XPATH, ".//button"))
        w.until(EC.invisibility_of_element_located(
            (By.XPATH, "//div[contains(@class, 'rounded-2xl')]")))

    def test_04_agenda_adicionar_evento(self, driver):
        goto(driver, "/funcionario/agenda")
        w = wait(driver)
        w.until(EC.visibility_of_element_located(
            (By.XPATH, "//h2[contains(., 'Minha Agenda')] | //h1[contains(., 'Minha Agenda')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Adicionar à agenda')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Adicionar à Agenda')]")))
        type_text(input_by_label(driver, "Título"), "Evento E2E Funcionário")
        set_date(driver, driver.find_element(
            By.XPATH, "//label[contains(., 'Data')]/following-sibling::input[@type='date']"), "2026-12-31")
        set_date(driver, driver.find_element(
            By.XPATH, "//label[contains(., 'Horário')]/following-sibling::input[@type='time']"), "09:00")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Adicionar evento']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Adicionar evento']")))

    def test_05_agenda_solicitar_reuniao(self, driver):
        goto(driver, "/funcionario/agenda")
        w = wait(driver)
        w.until(EC.visibility_of_element_located(
            (By.XPATH, "//h2[contains(., 'Minha Agenda')] | //h1[contains(., 'Minha Agenda')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Solicitar reunião')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Solicitar Reunião')]")))
        Select(driver.find_element(
            By.XPATH, "//label[contains(., 'Para')]/following-sibling::select")).select_by_index(1)
        set_date(driver, driver.find_element(
            By.XPATH, "//label[contains(., 'Data')]/following-sibling::input[@type='date']"), "2026-12-30")
        set_date(driver, driver.find_element(
            By.XPATH, "//label[contains(., 'Horário')]/following-sibling::input[@type='time']"), "15:00")
        type_text(input_by_label(driver, "Assunto"), "Reunião E2E Funcionário")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Enviar Solicitação']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Enviar Solicitação']")))

    def test_06_xp(self, driver):
        goto(driver, "/funcionario/xp")
        wait(driver).until(EC.visibility_of_element_located(
            (By.XPATH, "//h2[contains(., 'Meu XP e Conquistas')]")))

    def test_07_perfil(self, driver):
        goto(driver, "/funcionario/perfil")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Meu Perfil')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Salvar Alterações')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//p[contains(., 'Alterações salvas')]")))

    def test_08_logout(self, driver):
        goto(driver, "/funcionario/projetos")
        wait(driver).until(EC.visibility_of_element_located(
            (By.XPATH, "//h2[contains(., 'Meus Projetos')]")))
        helpers.logout(driver)
        assert "/login" in driver.current_url

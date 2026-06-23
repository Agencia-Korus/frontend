"""Testes E2E da área pública (visitante, sem login):
landing, serviços, portfólio, academy, cadastro e o fluxo de solicitar orçamento.
"""

from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

import helpers


class TestAreaPublica:
    def test_01_landing_carrega_e_navega_login(self, driver):
        helpers.goto(driver, "/")
        w = helpers.wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'O que fazemos')]")))
        # Navbar -> Entrar leva ao login
        entrar = w.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Entrar']"))
        )
        helpers.click(driver, entrar)
        w.until(lambda d: "/login" in d.current_url)
        assert "/login" in driver.current_url

    def test_02_servicos_filtra_e_abre_solicitar(self, driver):
        helpers.goto(driver, "/servicos")
        w = helpers.wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Nossos Serviços')]")))
        # Aplica um filtro de categoria
        filtro = w.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Design']"))
        )
        helpers.click(driver, filtro)
        # Volta para "Todos" e abre o fluxo de solicitação de um serviço
        helpers.click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Todos']"))
        solicitar = w.until(
            EC.element_to_be_clickable(
                (By.XPATH, "(//button[contains(., 'Solicitar este Serviço')])[1]")
            )
        )
        helpers.click(driver, solicitar)
        w.until(lambda d: "/solicitar/" in d.current_url)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Seus Dados')]")))

    def test_03_portfolio_carrega_e_filtra(self, driver):
        helpers.goto(driver, "/portfolio")
        w = helpers.wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h1[contains(., 'Portfólio')] | //h2[contains(., 'Portfólio')]")))
        filtro = w.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='Identidade Visual']"))
        )
        helpers.click(driver, filtro)

    def test_04_academy_carrega_e_filtra(self, driver):
        helpers.goto(driver, "/academy")
        w = helpers.wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h1[contains(., 'Academy')] | //h2[contains(., 'Academy')]")))
        filtro = w.until(
            EC.element_to_be_clickable((By.XPATH, "//button[normalize-space()='E-books']"))
        )
        helpers.click(driver, filtro)

    def test_05_cadastro_validacao_senha_e_termos(self, driver):
        """Valida as regras do formulário sem criar usuário (senha != confirmação;
        termos obrigatórios)."""
        helpers.goto(driver, "/cadastro")
        w = helpers.wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Criar Conta')]")))

        helpers.type_text(helpers.input_by_label(driver, "Nome completo"), "Visitante Teste")
        helpers.type_text(helpers.input_by_label(driver, "E-mail"), f"visitante{helpers.UNIQUE}@email.com")
        helpers.type_text(helpers.input_by_label(driver, "Senha"), "Senha@123")
        helpers.type_text(helpers.input_by_label(driver, "Confirmar senha"), "Outra@456")
        helpers.click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Criar Conta']"))
        w.until(EC.visibility_of_element_located((By.XPATH, "//p[contains(., 'senhas precisam ser iguais')]")))

        # Corrige a senha mas não aceita os termos
        helpers.type_text(helpers.input_by_label(driver, "Confirmar senha"), "Senha@123")
        helpers.click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Criar Conta']"))
        w.until(EC.visibility_of_element_located((By.XPATH, "//p[contains(., 'aceitar os termos')]")))

    def test_06_solicitar_orcamento_fluxo_completo(self, driver):
        """Fluxo completo de 3 passos do lead público (cria um lead 'novo')."""
        helpers.goto(driver, "/solicitar/identidade-visual")
        w = helpers.wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Seus Dados')]")))

        # Passo 1 — Seus Dados
        helpers.type_text(helpers.input_by_label(driver, "Nome completo"), f"Lead E2E {helpers.UNIQUE}")
        helpers.type_text(helpers.input_by_label(driver, "E-mail"), f"lead{helpers.UNIQUE}@email.com")
        helpers.type_text(helpers.input_by_label(driver, "Telefone/WhatsApp"), "(61) 99999-0000")
        helpers.type_text(helpers.input_by_label(driver, "Nome da empresa"), "Empresa E2E")
        helpers.click(driver, driver.find_element(By.XPATH, "//button[contains(., 'Continuar')]"))

        # Passo 2 — Sobre o Projeto
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Sobre o Projeto')]")))
        helpers.type_text(
            helpers.input_by_label(driver, "Descrição do projeto", tag="textarea"),
            "Preciso de uma identidade visual completa.",
        )
        Select(helpers.input_by_label(driver, "Orçamento estimado", tag="select")).select_by_visible_text(
            "R$ 2.000 - R$ 5.000"
        )
        helpers.click(driver, driver.find_element(By.XPATH, "//button[contains(., 'Continuar')]"))

        # Passo 3 — Confirmação
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Confirmação')]")))
        termos = driver.find_element(By.XPATH, "//input[@type='checkbox']")
        helpers.click(driver, termos)
        helpers.click(driver, driver.find_element(By.XPATH, "//button[contains(., 'Enviar Solicitação')]"))

        w.until(
            EC.visibility_of_element_located(
                (By.XPATH, "//h2[contains(., 'Solicitação enviada com sucesso')]")
            )
        )

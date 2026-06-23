"""Jornada E2E completa do ADMINISTRADOR.

Cada função do painel admin é um teste independente (navega de forma limpa).
O login é feito uma vez por classe (fixture autouse). As páginas que estão
quebradas em produção são marcadas com xfail e documentadas em PRODUCTION_BUGS.md.
"""

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select

import helpers
from helpers import click, goto, input_by_label, set_date, type_text, wait


@pytest.fixture(scope="class")
def admin_session(driver, admin_token):
    # Garante a agenda rápida (sem sincronização lenta com o Google Calendar).
    helpers.set_google_calendar_status(admin_token, "desconectado")
    helpers.ui_login(driver, helpers.ADMIN_EMAIL, helpers.ADMIN_SENHA)
    wait(driver, 30).until(lambda d: "/admin" in d.current_url)


@pytest.mark.usefixtures("admin_session")
class TestAdminJourney:
    # --------------------------------------------------------------------- #
    def test_01_dashboard(self, driver):
        goto(driver, "/admin")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Dashboard')]")))
        # KPIs e gráficos presentes
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Leads por Semana')]")))

    def test_02_usuarios_criar_e_buscar(self, driver):
        goto(driver, "/admin/usuarios")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gestão de Usuários')]")))

        # Criar novo usuário
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Adicionar Novo Usuário')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Novo Usuário')]")))
        suf = helpers.uid()
        type_text(input_by_label(driver, "Nome"), f"Usuário E2E {suf}")
        type_text(input_by_label(driver, "E-mail"), f"user{suf}@teste.com")
        type_text(input_by_label(driver, "Senha temporária"), "Senha@123")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Criar Usuário']"))
        # Sucesso fecha o modal (após recarregar os dados)
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Criar Usuário']")))

        # Buscar um usuário conhecido (testa o filtro de busca)
        busca = w.until(EC.visibility_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder*='Buscar']")))
        type_text(busca, "Admin")
        w.until(EC.visibility_of_element_located((By.XPATH, "//tbody/tr//td[contains(., 'Admin')]")))

    def test_03_usuarios_abrir_edicao(self, driver):
        """Abre o modal de edição do primeiro usuário (sem alterar dados sensíveis)."""
        goto(driver, "/admin/usuarios")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gestão de Usuários')]")))
        primeira_linha = w.until(EC.visibility_of_element_located((By.XPATH, "//tbody/tr[1]")))
        click(driver, primeira_linha.find_element(By.XPATH, ".//button"))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Editar Usuário')]")))
        # O modal de edição expõe o select de Status
        driver.find_element(By.XPATH, "//label[contains(., 'Status')]/following-sibling::select")
        # Fecha sem salvar (botão X que precede o título do modal)
        click(driver, driver.find_element(
            By.XPATH, "//h3[contains(., 'Editar Usuário')]/preceding-sibling::button[1]"))
        w.until(EC.invisibility_of_element_located((By.XPATH, "//h3[contains(., 'Editar Usuário')]")))

    def test_04_leads_atualizar_status(self, driver):
        goto(driver, "/admin/leads")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gestão de Leads')]")))
        # Aguarda os leads carregarem (a tabela é populada de forma assíncrona).
        try:
            wait(driver, 12).until(
                EC.presence_of_element_located((By.XPATH, "//tbody/tr[1]/td"))
            )
        except Exception:
            pytest.skip("Sem leads cadastrados para testar.")
        click(driver, driver.find_element(By.XPATH, "//tbody/tr[1]"))
        w.until(EC.visibility_of_element_located((By.XPATH, "//label[contains(., 'Alterar Status')]")))
        status = driver.find_element(By.XPATH, "//label[contains(., 'Alterar Status')]/following-sibling::select")
        Select(status).select_by_visible_text("Em Contato")
        nota = driver.find_element(By.XPATH, "//label[contains(., 'Anotações internas')]/following-sibling::textarea")
        type_text(nota, "Contato realizado pela automação E2E.")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Salvar']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Salvar']")))

    def test_05_projetos_criar(self, driver):
        goto(driver, "/admin/projetos")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Todos os Projetos')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Novo Projeto')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Novo Projeto')]")))
        suf = helpers.uid()
        type_text(input_by_label(driver, "Nome do projeto"), f"Projeto E2E {suf}")
        type_text(input_by_label(driver, "Descrição", tag="textarea"), "Projeto criado por teste E2E.")
        # O cliente precisa ser selecionado de fato (o valor exibido não garante
        # que o estado do React foi atualizado — a lista carrega após o init).
        cliente_select = w.until(EC.presence_of_element_located(
            (By.XPATH, "//label[contains(., 'Cliente')]/following-sibling::select")))
        w.until(lambda d: len(cliente_select.find_elements(By.TAG_NAME, "option")) > 0)
        helpers.select_react(driver, cliente_select, 0)
        set_date(driver, input_by_label(driver, "Data início"), "2026-01-01")
        set_date(driver, input_by_label(driver, "Data fim"), "2026-12-31")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Criar Projeto']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Criar Projeto']")))

    def test_06_projeto_kanban_adicionar_card_e_comentar(self, driver):
        goto(driver, "/admin/projetos")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Todos os Projetos')]")))
        # Abre o primeiro projeto
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "(//div[contains(@class,'cursor-pointer')]//h4)[1]"))))
        w.until(lambda d: "/admin/projetos/" in d.current_url)

        # Adiciona um cartão na primeira coluna
        titulo_card = f"Card E2E {helpers.uid()}"
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "(//button[normalize-space()='Adicionar um cartão'])[1]"))))
        textarea = w.until(EC.visibility_of_element_located(
            (By.XPATH, "//textarea[contains(@placeholder, 'título para este cartão')]")))
        type_text(textarea, titulo_card)
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Adicionar cartão']"))
        card = w.until(EC.visibility_of_element_located(
            (By.XPATH, f"//p[normalize-space()='{titulo_card}']")))

        # Abre o cartão e comenta (todas as roles podem comentar)
        click(driver, card)
        comentario = w.until(EC.visibility_of_element_located(
            (By.XPATH, "//input[contains(@placeholder, 'Escreva um comentário')]")))
        type_text(comentario, "Comentário do admin via E2E.")
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Enviar')]"))))
        w.until(EC.visibility_of_element_located(
            (By.XPATH, "//div[contains(., 'Comentário adicionado')]")))

    def test_07_servicos_criar(self, driver):
        goto(driver, "/admin/servicos")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gerenciar Serviços')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Novo Serviço')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Novo Serviço')]")))
        type_text(input_by_label(driver, "Nome"), f"Serviço E2E {helpers.uid()}")
        type_text(input_by_label(driver, "Descrição", tag="textarea"), "Serviço criado por teste E2E.")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Salvar']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Salvar']")))

    def test_08_portfolio_criar(self, driver):
        goto(driver, "/admin/portfolio")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gerenciar Portfólio')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Novo Item')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Novo Item do Portfólio')]")))
        suf = helpers.uid()
        type_text(input_by_label(driver, "Nome do projeto"), f"Case E2E {suf}")
        type_text(input_by_label(driver, "Cliente"), "Cliente E2E")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Salvar']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Salvar']")))

    def test_09_academy_criar(self, driver):
        goto(driver, "/admin/academy")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gerenciar Academy')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Novo Conteúdo')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Novo Conteúdo')]")))
        suf = helpers.uid()
        type_text(input_by_label(driver, "Título"), f"E-book E2E {suf}")
        type_text(input_by_label(driver, "Descrição", tag="textarea"), "Conteúdo criado por teste E2E.")
        type_text(input_by_label(driver, "Preço"), "100")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Salvar']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Salvar']")))

    def test_10_feed_publicar_comunicado(self, driver):
        goto(driver, "/admin/feed")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Publicar Comunicados')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Novo Comunicado')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Novo Comunicado')]")))
        suf = helpers.uid()
        type_text(input_by_label(driver, "Título"), f"Comunicado E2E {suf}")
        # O conteúdo é obrigatório (caso contrário o botão Publicar não envia).
        type_text(input_by_label(driver, "Conteúdo", tag="textarea"), "Mensagem do comunicado de teste E2E.")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Publicar']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Publicar']")))

    def test_11_agenda_adicionar_evento(self, driver):
        goto(driver, "/admin/agenda")
        w = wait(driver)
        w.until(EC.visibility_of_element_located(
            (By.XPATH, "//h2[contains(., 'Agenda Geral')] | //h1[contains(., 'Agenda Geral')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Adicionar à agenda')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Adicionar à Agenda')]")))
        type_text(input_by_label(driver, "Título"), "Evento E2E Admin")
        set_date(driver, driver.find_element(
            By.XPATH, "//label[contains(., 'Data')]/following-sibling::input[@type='date']"), "2026-12-31")
        set_date(driver, driver.find_element(
            By.XPATH, "//label[contains(., 'Horário')]/following-sibling::input[@type='time']"), "10:00")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Adicionar evento']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Adicionar evento']")))

    def test_12_agenda_solicitar_reuniao(self, driver):
        goto(driver, "/admin/agenda")
        w = wait(driver)
        w.until(EC.visibility_of_element_located(
            (By.XPATH, "//h2[contains(., 'Agenda Geral')] | //h1[contains(., 'Agenda Geral')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Solicitar reunião')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Solicitar Reunião')]")))
        para = w.until(EC.presence_of_element_located(
            (By.XPATH, "//label[contains(., 'Para')]/following-sibling::select")))
        w.until(lambda d: len(para.find_elements(By.TAG_NAME, "option")) > 1)
        helpers.select_react(driver, para, 1)  # 1º contato real (índice 0 = "Selecione...")
        set_date(driver, driver.find_element(
            By.XPATH, "//label[contains(., 'Data')]/following-sibling::input[@type='date']"), "2026-12-31")
        set_date(driver, driver.find_element(
            By.XPATH, "//label[contains(., 'Horário')]/following-sibling::input[@type='time']"), "14:00")
        type_text(input_by_label(driver, "Assunto"), "Alinhamento E2E")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Enviar Solicitação']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Enviar Solicitação']")))

    def test_13_gamificacao_criar_regra(self, driver):
        goto(driver, "/admin/gamificacao")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Gamificação')]")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Nova regra')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//h3[contains(., 'Nova Regra de XP')]")))
        type_text(input_by_label(driver, "Tarefa"), f"Regra E2E {helpers.uid()}")
        click(driver, driver.find_element(By.XPATH, "//button[normalize-space()='Salvar regra']"))
        wait(driver, 30).until(EC.invisibility_of_element_located(
            (By.XPATH, "//button[normalize-space()='Salvar regra']")))

    def test_14_configuracoes_salvar_integracao(self, driver):
        goto(driver, "/admin/configuracoes")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Configurações')]")))
        calendar_id = driver.find_element(
            By.XPATH, "//label[contains(., 'ID do calendário')]/following-sibling::input")
        type_text(calendar_id, "primary")
        # Conectar (a integração começa desconectada — ver fixture admin_session)
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space()='Conectar' or normalize-space()='Salvar alterações']"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//p[contains(., 'conectado')]")))
        # Desconectar de novo (cleanup: mantém a agenda rápida nas próximas execuções)
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[normalize-space()='Desconectar']"))))
        w.until(EC.visibility_of_element_located(
            (By.XPATH, "//p[contains(., 'desativada') or contains(., 'Desconect')]")))

    def test_15_perfil(self, driver):
        goto(driver, "/admin/perfil")
        w = wait(driver)
        w.until(EC.visibility_of_element_located((By.XPATH, "//h2[contains(., 'Meu Perfil')]")))
        # Campo de nome carregado e salvar funcional
        w.until(EC.visibility_of_element_located(
            (By.XPATH, "//label[contains(., 'Nome')]/following-sibling::input")))
        click(driver, w.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(., 'Salvar Alterações')]"))))
        w.until(EC.visibility_of_element_located((By.XPATH, "//p[contains(., 'Alterações salvas')]")))

    def test_16_logout(self, driver):
        goto(driver, "/admin/usuarios")
        wait(driver).until(EC.visibility_of_element_located(
            (By.XPATH, "//h2[contains(., 'Gestão de Usuários')]")))
        helpers.logout(driver)
        assert "/login" in driver.current_url

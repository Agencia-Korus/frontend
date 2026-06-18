import os

import pytest
from selenium import webdriver
from selenium.webdriver.chrome.options import Options


@pytest.fixture
def driver():
    """Chrome WebDriver. Visível por padrão; defina HEADLESS=1 para rodar sem janela."""
    options = Options()
    if os.getenv("HEADLESS", "0") == "1":
        options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1366,900")

    # selenium-manager (Selenium >= 4.6) baixa o chromedriver automaticamente.
    drv = webdriver.Chrome(options=options)
    drv.set_page_load_timeout(60)
    try:
        yield drv
    finally:
        drv.quit()

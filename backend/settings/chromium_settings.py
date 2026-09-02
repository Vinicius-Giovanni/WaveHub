from __future__ import annotations

async def chromium_custom(instance):
    """
    Inicializa uma instância do Chromium com contexto persistente e ambente controlado.
    Cria um perfil temporário, remove qualquer execução anterior
    e inicializa o navegador Chromium com configurações voltadas para automação estável

    Args:
        instance: Instância utilizada para inicializar o naveador.

    Returns:
        - browser (BrowserContext): Contexto persistente do Chromium.
    """

    import shutil

    from backend.settings.environment import temp_profile

    # clear temp_rofile
    if temp_profile.exists():
        shutil.rmtree(temp_profile)
    else:
        temp_profile.mkdir(exist_ok=True, parents=True)

    # settings chromium
    browser = await instance.chromium.launch_persistent_context(
        user_data_dir=str(temp_profile),
        headless=False, # interface gráfica desativada
        args=[
            "--disable-popup-blocking",
            "--disable-notifications",
            "--disable-infobars",
            "--disable-blink-features=AutomationControlled",
            "--no-default-browser-check",
            "--no-first-run",
            "--disable-extensions",
            "--disable-dev-shm-usage",
            "--disable-gpu"
        ],
    )

    page = browser.pages[0]
    return browser, page

async def start_browser():
    """
    inicializa e configura a instância do navegador em async

    returns:
        tuple:
            playwright, browser
    """

    from playwright.async_api import async_playwright

    playwright = await async_playwright().start()
    browser, page = await chromium_custom(playwright)
    return playwright, browser, page

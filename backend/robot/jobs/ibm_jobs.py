from __future__ import annotations

from playwright.async_api import async_playwright

import asyncio

from backend.robot.tools.extract_cookies_ibm_login import ExtractCookiesLoginIBM
from backend.settings.chromium_settings import start_browser


class IBM:

    async def extrack_cookies_ibm():
        """
        Faz a chamada da função login, da classe ExtractCookiesLoginIBM.

        Returns
            - cookies retorna os cookies armazenado, para que possam ser utilizados em outras chamadas.
        """

        async with async_playwright() as p:

            playwright, browser, page = await start_browser()

            cookies = await ExtractCookiesLoginIBM.login(
                page=page
            )

            await browser.close()
            await playwright.stop()

            return cookies

# Para rodar de forma sync
"""
if __name__ == "__main__":
    asyncio.run(extrack_cookies_ibm())
"""
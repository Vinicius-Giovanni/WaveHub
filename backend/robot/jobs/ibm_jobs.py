from __future__ import annotations

from playwright.async_api import async_playwright

from pathlib import Path


from backend.robot.tools.status_olpn import StatusOlpnIBM
from backend.robot.tools.extract_cookies_ibm_login import ExtractCookiesLoginIBM
from backend.settings.chromium_settings import start_browser

class IBM:

    async def extrack_cookies_ibm(page) -> list[dict]:
        """
        Faz a chamada da função login, da classe ExtractCookiesLoginIBM.

        Returns
            - cookies retorna os cookies armazenado, para que possam ser utilizados em outras chamadas.
        """

        cookies = await ExtractCookiesLoginIBM.login(
            page=page
        )

        return cookies

    async def call_status_olpn(
            page,
            cookies: list[dict],
            download_dir: Path,
            list_filial: list,
            init_date: str,
            last_date: str
    ) -> None:
        """
        Faz a chamada da função de extração de relatórios 3.11
        """
        await StatusOlpnIBM.extract(
            page=page,
            cookies=cookies,
            download_dir=download_dir,
            list_filial=list_filial,
            init_date=init_date,
            last_date=last_date
        )
    

# Para rodar de forma sync
"""
if __name__ == "__main__":
    asyncio.run(extrack_cookies_ibm())
"""
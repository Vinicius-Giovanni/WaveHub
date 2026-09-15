from __future__ import annotations

from playwright.async_api import async_playwright

from backend.robot.jobs.ibm_jobs import IBM
from backend.settings.chromium_settings import start_browser
from backend.settings.paths import TEMP_WAVEHUB

async def _controller() -> None:

    async with async_playwright():

        playwright, browser, page = await start_browser()

        cookies = await IBM.extrack_cookies_ibm(page=page) # <- Extrair cookies

        olpn_page = await browser.new_page()
        await IBM.call_status_olpn(
            page=olpn_page,
            cookies=cookies,
            download_dir=TEMP_WAVEHUB,
            list_filial=["1200"],
            init_date="08/09/2026",
            last_date="09/09/2026",
        )

        await browser.close()
        await playwright.stop()
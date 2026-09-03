from __future__ import annotations

from pathlib import Path

import os

class StatusOlpnIBM:

    async def extract(
            page,
            cookies: list[dict],
            download_dir: Path,
            list_filial: list,
            init_date: str,
            last_date: str) -> None:
        """
        Realiza a extração do relatório 3.11 - Status Olpn

        Params
            - **page** contexto de RPA
            - **cookies** cookies inseridos no contexto
            - **download_dir** folder que receberá o relatório baixado
            - **init_date** data de início que o relatório deve abordar
            - **last_date** data final que o relatório deve abordar
        """

        await page.context.add_cookies(cookies) # <- Inserindo cookies no contexto da page
        
        for filial in list_filial:

            # Direcionar para IBM, especificamente para a página de download do relatório
            page.goto(os.getenv('LINK_STATUS_OLPN_IBM'))

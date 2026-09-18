from __future__ import annotations

from pathlib import Path

import os

from backend.settings.elements_ibm import ELEMENTS_POSICOES_OCUPADAS_E_VAZIAS, FRAME

class PosicoesIBM:

    async def extract(
            page,
            cookies: list[dict],
            download_dir: Path,
            list_filial: list,
    ) -> None:
        """
        Realiza a extração do relatório 2.04 - Posições ocupadas e vazias

        Params
            - **page** contexto de RPA
            - **cookies** cookies inseridos no contexto
            - **download_dir** folder que receberá o relatório baixado
            - **init_date** data de início que o relatório deve abordar
            - **last_date** data final que o relatório deve abordar
        """

        await page.context.add_cookies(cookies) # <- Inserindo cookies no contexto da page

        for filial in list_filial:

            # Direciona para IBM, especificamente para a página de download do relatório
            await page.goto(os.getenv('LINK_POSICOES_OCUPADAS_VAZIAS_IBM'))

            # entrando no frame
            frame = page.frame_locator(
                FRAME
            )

            # localizando disponibilidade de tabela de filiais
            _filial = frame.locator(ELEMENTS_POSICOES_OCUPADAS_E_VAZIAS['element_filial_id'])

            if _filial:
                await _filial.select_option(filial) # <- definindo filial

            # aguardar download de relatório
            async with page.expect_download() as download_info:
                await frame.locator(ELEMENTS_POSICOES_OCUPADAS_E_VAZIAS['element_confirm']).click()

            download = await download_info.value

            await download.save_as(
                str(download_dir / download.suggested_filename)
            )
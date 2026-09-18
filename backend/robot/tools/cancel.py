from __future__ import annotations

from pathlib import Path

import os

from backend.settings.elements_ibm import ELEMENTS_CANCEL, FRAME

class CancelIBM:

    async def extract(
            page,
            cookies: list[dict],
            download_dir: Path,
            list_filial: list,
            init_date: str,
            last_date: str
    ) -> None:
        """
        Realiza a estração do relatório 6.10 - Cancelados

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
            await page.goto(os.getenv('LINK_CANCEL_IBM'))

            # entrando no frame
            frame = page.frame_locator(
                FRAME
            )

            # Localizando disponibilidade de tabela de filials
            _filial = frame.locator(ELEMENTS_CANCEL['element_filial_id'])

            if _filial:
                await _filial.select_option(filial) # < - definindo filial

            # enviando data de inicio
            await frame.locator(
                ELEMENTS_CANCEL['element_dt_start']
            ).fill(init_date)

            # enviando data final

            await frame.locator(
                ELEMENTS_CANCEL['element_dt_end']
            ).fill(last_date)

            # aguardando download de relatório
            async with page.expect_download() as download_info:
                await frame.locator(ELEMENTS_CANCEL['element_confirm']).click()

            download = await download_info.value

            await download.save_as(
                str(download_dir / download.suggested_filename)
            )

            
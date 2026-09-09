from __future__ import annotations

from pathlib import Path

import os

from backend.settings.elements_ibm import ELEMENTS_OLPN, FRAME

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

        from backend.settings.paths import TEMP_WAVEHUB

        await page.context.add_cookies(cookies) # <- Inserindo cookies no contexto da page
        
        for filial in list_filial:

            # Direcionar para IBM, especificamente para a página de download do relatório
            page.goto(os.getenv('LINK_STATUS_OLPN_IBM'))

            # entrando no frame
            frame = page.locator(
                FRAME
            )

            # Localizando disponibilidade de tabela de filials
            _filial = await frame.locator(ELEMENTS_OLPN['element_filial_id'])

            if _filial:
                await filial.select_option(filial) # <- definindo filial

            # enviando data inicio
            await frame.fill(
                ELEMENTS_OLPN['element_dt_start'],
                init_date
            )

            # enviando data final
            await frame.fill(
                ELEMENTS_OLPN['element_dt_end'],
                last_date
            )

            # localizando template
            await frame.locator(
                ELEMENTS_OLPN['element_listbox']
            ).wait_for(state='visible')

            itens = frame.locator(
                ELEMENTS_OLPN['element_listbox']
            )

            for i in range(await itens.count()):
                item = itens.nth(i)

                template = await item.get_attribute(
                    ELEMENTS_OLPN['element_get_item']
                )

                if template in ELEMENTS_OLPN['list_itens']:

                    is_checked = (
                        await item.get_attribute(
                            ELEMENTS_OLPN['element_get_checked']
                        )
                    ) == "true"

                    if not is_checked:
                        await item.click()

            # Aguardar download de relatório

            async with frame.expect_download() as download_info:
                await frame.locator(ELEMENTS_OLPN['element_confirm']).click()

            download = await download_info.value

            await download.save_as(
                str(TEMP_WAVEHUB / download.suggested_filename)
            )


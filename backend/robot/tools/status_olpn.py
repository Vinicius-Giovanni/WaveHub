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

        await page.context.add_cookies(cookies) # <- Inserindo cookies no contexto da page
        
        for filial in list_filial:

            # Direcionar para IBM, especificamente para a página de download do relatório
            await page.goto(os.getenv('LINK_STATUS_OLPN_IBM'))

            # entrando no frame
            frame = page.frame_locator(
                FRAME
            )

            # Localizando disponibilidade de tabela de filials
            _filial = frame.locator(ELEMENTS_OLPN['element_filial_id'])

            if _filial:
                await _filial.select_option(filial) # <- definindo filial

            # enviando data inicio
            await frame.locator(
                ELEMENTS_OLPN['element_dt_start']
            ).fill(init_date)

            # enviando data final
            await frame.locator(
                ELEMENTS_OLPN['element_dt_end']
            ).fill(last_date)

            # localizando template
            await frame.locator(
                ELEMENTS_OLPN['element_listbox']
            ).wait_for(state='visible')

            lista = frame.locator(
                ELEMENTS_OLPN['element_listbox']
            )

            await lista.wait_for(state='visible')

            itens = frame.locator(
                ELEMENTS_OLPN['elements_listbox']
            )

            print("Quantidade de itens:", await itens.count())

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

            async with page.expect_download() as download_info:
                await frame.locator(ELEMENTS_OLPN['element_confirm']).click()

            download = await download_info.value

            await download.save_as(
                str(download_dir / download.suggested_filename)
            )

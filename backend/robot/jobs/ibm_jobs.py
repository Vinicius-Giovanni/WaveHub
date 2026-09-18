from __future__ import annotations

from pathlib import Path


from backend.robot.tools.status_olpn import StatusOlpnIBM
from backend.robot.tools.extract_cookies_ibm_login import ExtractCookiesLoginIBM
from backend.robot.tools.cancel import CancelIBM
from backend.robot.tools.posicoes_ocupadas_e_vazias import PosicoesIBM

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

    async def call_cancel(
            page,
            cookies: list[dict],
            download_dir: Path,
            list_filial: list,
            init_date: str,
            last_date: str
    ) -> None:
        """
        Faz a chamada da função de extração de relatórios 6.10
        """

        await CancelIBM.extract(
            page=page,
            cookies=cookies,
            download_dir=download_dir,
            list_filial=list_filial,
            init_date=init_date,
            last_date=last_date
        )

    async def call_posicoes(
            page,
            cookies: list[dict],
            download_dir: Path,
            list_filial: list,    
    ) -> None:
        """
        Faz a chamada da função de extração relatório 2.04
        """

        await PosicoesIBM.extract(
            page=page,
            cookies=cookies,
            download_dir=download_dir,
            list_filial=list_filial,
        )
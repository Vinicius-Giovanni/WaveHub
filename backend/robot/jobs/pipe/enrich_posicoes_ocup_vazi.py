from __future__ import annotations

from backend.utils.dataframe_manager import DataframeManager
from backend.settings.paths import POSICOES_OCUP_VAZI_TEMP
from backend.utils.business_rules import BussinesRules

class EnrichPosicoesOcupVazias:

    def call() -> None:

        df = DataframeManager.read_csv(
            file_path=POSICOES_OCUP_VAZI_TEMP,
            delimiter="\t",
            encoding='utf-16'
        )

        df = DataframeManager.rename_columns_posicoes_ocup_vazias(df)

        df = BussinesRules.enrich_posicao_ocup_vazia_columns(df)

        DataframeManager.save_to_csv(
            df=df,
            local_path_to_save=POSICOES_OCUP_VAZI_TEMP,
            sep="\t"
        )

        print(df.info())
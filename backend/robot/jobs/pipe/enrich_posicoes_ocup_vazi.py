from __future__ import annotations

from backend.utils.dataframe_manager import DataframeManager
from backend.settings.paths import POSICOES_OCUP_VAZI_TEMP, ESTOQUE_3D_JSON
from backend.utils.business_rules import BussinesRules
from backend.utils.estoque_3d import prepare_estoque_3d

import json

class EnrichPosicoesOcupVazias:

    def call() -> None:

        df = DataframeManager.read_csv(
            file_path=POSICOES_OCUP_VAZI_TEMP,
            delimiter="\t",
            encoding='utf-16'
        )

        df = DataframeManager.rename_columns_posicoes_ocup_vazias(df)

        df = BussinesRules.enrich_posicao_ocup_vazia_columns(df)

        # Salva CSV
        DataframeManager.save_to_csv(
            df=df,
            local_path_to_save=POSICOES_OCUP_VAZI_TEMP,
            sep="\t"
        )

        # Salva JSON para o 3D
        dados_3d = prepare_estoque_3d(df)

        with open(ESTOQUE_3D_JSON, 'w', encoding='utf-8') as file:
            json.dump(
                dados_3d,
                file,
                ensure_ascii=False,
                indent=2
            )

        print(df.info())
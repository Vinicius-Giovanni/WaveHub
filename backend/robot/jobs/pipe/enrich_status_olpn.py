from __future__ import annotations

from backend.utils.dataframe_manager import DataframeManager
from backend.settings.paths import OLPN_TEMP
from backend.utils.business_rules import classify_setores_status_olpn

class EnrichStatusOlpn:

    def call() -> None:

        df = DataframeManager.read_csv(
            file_path=OLPN_TEMP,
            delimiter="\t",
            encoding="utf-16"
        )

        df = DataframeManager.rename_columns(df)

        df['setores'] = classify_setores_status_olpn(df)

        DataframeManager.save_to_csv(
            df=df,
            local_path_to_save=OLPN_TEMP,
            sep="\t",
        )

        print(df.info())
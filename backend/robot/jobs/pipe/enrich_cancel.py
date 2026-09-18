from __future__ import annotations

from backend.utils.dataframe_manager import DataframeManager
from backend.settings.paths import CANCEL_TEMP
from backend.utils.business_rules import BussinesRules

class EnrichCancel:

    def call() -> None:

        df = DataframeManager.read_csv(
            file_path=CANCEL_TEMP,
            delimiter="\t",
            encoding="utf-16"
        )

        df = DataframeManager.rename_columns_cancel(df)

        df['setores'] = BussinesRules.classify_setores_cancel(df)

        DataframeManager.save_to_csv(
            df=df,
            local_path_to_save=CANCEL_TEMP,
            sep="\t"
        )

        print(df.info())
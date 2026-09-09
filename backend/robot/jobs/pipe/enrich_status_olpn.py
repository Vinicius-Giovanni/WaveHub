from __future__ import annotations

from backend.utils.dataframe_manager import DataframeManager

from backend.settings.paths import OLPN_TEMP

class EnrichStatusOlpn:

    def call() -> None:

        df = DataframeManager.read_csv(
            file_path=OLPN_TEMP,
            delimiter="\t",
            encoding="UTF-16"
        )

        print(df.info())
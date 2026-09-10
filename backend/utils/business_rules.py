from __future__ import annotations

import duckdb
import pandas as pd

from backend.settings.paths import SQL_DIR

def classify_setores_status_olpn(df: pd.DataFrame) -> pd.Series:
    sql_path = SQL_DIR / "classify_setors_status_olpn.sql"

    query= sql_path.read_text(encoding='utf-8')

    with duckdb.connect() as con:
        con.register("df", df)

        result = con.execute(query).fetchdf()

    return result['setor']
from pathlib import Path

import duckdb
import pandas as pd

from backend.settings.paths import SQL_DIR

class DataframeManager:

    def read_csv(
            file_path: Path,
            delimiter: str = ",",
            encoding: str = "utf-16",
    ) -> pd.DataFrame:
        """
        Lê um arquivo CSV utilizando duckDB.

        Args:
            file_path: Caminho do arquivo CSV.
            delimiter: Delimitador das colunas.
            encoding: Codificação do arquivo.

        Returns:
            DataFrame contendo os dados do CSV.

        Raises:
            FileNotFoundError: Se o arquivo não existir.
            ValueError: Se o arquivo não for CSV.
        """
        if not file_path.exists():
            raise FileNotFoundError(
                f'Arquivo não encontrado: {file_path}'
            )

        if file_path.suffix.lower() != ".csv":
            raise ValueError(
                f"O arquivo deve ser CSV: {file_path}"
            )

        query = """
            SELECT *
            FROM read_csv(
                ?,
                delim = ?,
                encoding = ?
                )
            """

        with duckdb.connect() as conn:
            df = conn.execute(
                query,
                [str(file_path), delimiter, encoding]
            ).df()

        return df

    def save_to_csv(df: pd.DataFrame,
                    local_path_to_save: Path,
                    sep: str = ";",
                    encoding: str = "utf-8",
                    ) -> None:
        """
        Salva o df em arquivo csv.

        Args:
            df: pd.DataDrame Dataframe que será salvo.
            local_path_to_save Local que será salvo o arquivo reescrito.
        """

        df.to_csv(
            path_or_buf=local_path_to_save,
            sep=sep,
            encoding=encoding,
            index=False
        )

    def rename_columns(df: pd.DataFrame) -> pd.DataFrame:
        """
        Faz a renomeação da colunas para o padrão snake, para leitura sádia do duckdb.

        Args:
            df: pd.DataFrame Dataframe que será renomeado

        Returns:
            Execução da query sql e retorno do df tratado.
        """
        sql_path = SQL_DIR / "snake_case_status_olpn.sql"

        query = sql_path.read_text(encoding='utf-8')

        with duckdb.connect() as con:
            con.register('df', df)

            return con.execute(query).fetchdf()
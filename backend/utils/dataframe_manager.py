from pathlib import Path

import duckdb
import pandas as pd

class DataframeManager:

    def read_csv(
            file_path: Path,
            delimiter: str = ",",
            encoding: str = "UTF-8",
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
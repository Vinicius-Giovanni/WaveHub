import pandas as pd


def prepare_estoque_3d(df: pd.DataFrame) -> list[dict]:
    """
    Prepara os dados de posições do estoque para consumo da visualização 3D.

    Agrupa os registros por rua, local e nível, consolidando os itens
    existentes em cada posição.

    Args:
        df: DataFrame com os dados das posições do estoque.

    Returns:
        Lista de posições estruturadas para a visualização 3D.
    """

    group_columns = [
        "rua",
        "local_posicao",
        "nivel"
    ]

    posicoes = []

    for (rua, local, nivel), grupo in df.groupby(
        group_columns,
        sort=False
    ):
        itens_df = grupo.loc[
            grupo["item"].notna(),
            ["item", "descricao", "qtd_de_pecas"]
        ]

        itens = [
            {
                "item": str(int(row.item)),
                "descricao": row.descricao,
                "quantidade": int(row.qtd_de_pecas)
            }
            for row in itens_df.itertuples(index=False)
        ]

        status = (
            "ocupada"
            if (grupo["ocupacao"] == "Ocupada").any()
            else "vazia"
        )

        primeira_linha = grupo.iloc[0]

        posicoes.append({
            "id": f"{rua}-{local}-{nivel}",
            "rua": str(rua),
            "local": str(local),
            "nivel": str(nivel),
            "status": status,
            "zona": str(primeira_linha["zona"]),
            "tipo_de_eqp": str(primeira_linha["tipo_de_eqp"]),
            "tipo_do_local": str(primeira_linha["tipo_do_local"]),
            "habilitado": bool(primeira_linha["habilitado"]),
            "itens": itens
        })

    return posicoes
WITH base AS (
    SELECT
        *,
        TRY_CAST(box AS INTEGER) AS box_int
    FROM df
)

SELECT
    CASE
        WHEN tipo_de_pedido = 'S01 - ENTREGA A CLIENTES'
             AND box_int BETWEEN 557 AND 584
            THEN 'Fracionado Pesados'

        WHEN tipo_de_pedido IN (
            'S13 - ABASTECIMENTO DE LOJA BOA',
            'S14 - ABASTECIMENTO DE LOJA QEB',
            'S46 - ABASTECIMENTO RETIRA LOJA',
            'S48 - ABASTECIMENTO CEL RJ',
            'S11 - TRANSF. LOJA VIA DEPOSITO BOA'
        )
        AND box_int BETWEEN 595 AND 638
            THEN 'EAD - Abastecimento de Lojas'

        WHEN tipo_de_pedido IN (
            'S13 - ABASTECIMENTO DE LOJA BOA',
            'S14 - ABASTECIMENTO DE LOJA QEB',
            'S46 - ABASTECIMENTO RETIRA LOJA',
            'S48 - ABASTECIMENTO CEL RJ',
            'S11 - TRANSF. LOJA VIA DEPOSITO BOA'
        )
        AND box_int BETWEEN 277 AND 326
            THEN 'Polo - Abastecimento de Lojas'

        WHEN tipo_de_pedido = 'S01 - ENTREGA A CLIENTES'
             AND box_int BETWEEN 331 AND 412
            THEN 'Ribeirao Preto + Uberlandia'

        WHEN tipo_de_pedido IN (
            'S01 - ENTREGA A CLIENTES',
            'S02 - RETIRA CLIENTE DEPOSITO'
        )
        AND box_int BETWEEN 413 AND 556
            THEN 'Entrega Cliente + Polo-SP'

        WHEN tipo_de_pedido = 'S53 - TRANSFERENCIA ENTRE CDS'
             AND box_int BETWEEN 595 AND 638
            THEN 'EAD - Balanco'

        WHEN tipo_de_pedido IN (
            'S13 - ABASTECIMENTO DE LOJA BOA',
            'S14 - ABASTECIMENTO DE LOJA QEB',
            'S46 - ABASTECIMENTO RETIRA LOJA',
            'S48 - ABASTECIMENTO CEL RJ',
            'S11 - TRANSF. LOJA VIA DEPOSITO BOA'
        )
            THEN 'Abastecimento de Lojas'

        WHEN tipo_de_pedido IN (
            'S01 - ENTREGA A CLIENTES',
            'S02 - RETIRA CLIENTE DEPOSITO'
        )
            THEN 'Ribeirao Preto + Uberlandia'

        WHEN tipo_de_pedido = 'S53 - TRANSFERENCIA ENTRE CDS'
            THEN 'Balanco'

        WHEN tipo_de_pedido IN (
            'S05 - TRANSF EAD PROGRAMADA',
            'S04 - TRANSF EAD AUTOMATICA'
        )
            THEN 'EAD'

        WHEN tipo_de_pedido IN (
            'S39 - EXPEDICAO LEVES',
            'S39M - EXPEDICAO LEVES',
            'S39R - Single line',
            'S39P - EXPEDICAO LEVES',
            'S39I - EXPEDICAO LEVES'
        )
            THEN 'Leves'

        ELSE 'Outras Saidas'
    END AS setor
FROM base;
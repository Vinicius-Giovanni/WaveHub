WITH base AS (
    SELECT
        *,
        TRY_CAST(box AS INTEGER) AS box_int
    FROM df
)

SELECT
    CASE
        WHEN tipo_da_ordem IN (
            'S13 - ABASTECIMENTO DE LOJA BOA',
            'S14 - ABASTECIMENTO DE LOJA QEB',
            'S46 - ABASTECIMENTO RETIRA LOJA',
            'S48 - ABASTECIMENTO CEL RJ',
            'S11 - TRANSF. LOJA VIA DEPOSITO BOA',
            'S12 - TRANSF.LOJA VIA DEPOSITO QEB'
        )
            THEN 'Abastecimento de Lojas'

        WHEN tipo_da_ordem = 'S53 - TRANSFERENCIA ENTRE CDS'
            THEN 'Balanco'

        WHEN tipo_da_ordem IN (
            'S01 - ENTREGA A CLIENTES',
            'S02 - RETIRA CLIENTE DEPOSITO'
        )
            THEN 'Entrega a Cliente'

        WHEN tipo_da_ordem IN (
            'S05 - TRANSF EAD PROGRAMADA',
            'S04 - TRANSF EAD AUTOMATICA'
        )
            THEN 'EAD'

        WHEN tipo_da_ordem IN (
            'S39 - EXPEDICAO LEVES',
            'S39M - EXPEDICAO LEVES',
            'S39R - SINGLE LINE',
            'S39P - EXPEDICAO LEVES',
            'S39I - EXPEDICAO LEVES'
        )
            THEN 'Leves'

        ELSE 'Outras saidas'
    END AS setor

FROM base;
SELECT
    *,
    split_part(local, '-', 1) AS rua,
    split_part(local, '-', 2) AS local_posicao,
    split_part(local, '-', 3) AS nivel
FROM df;
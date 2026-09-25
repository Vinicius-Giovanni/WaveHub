import os
import json

# ── CONFIGURAÇÕES DE ESPAÇAMENTO ──────────────────────────────
PASSO_LOCAL = 4.8      # distância entre locais dentro da mesma fileira (X)
PASSO_NIVEL = 2        # distância entre níveis (Y)
PASSO_FILEIRA = 2      # "espessura" de uma fileira ímpar/par (Z, back-to-back)
LARGURA_CORREDOR = 8   # largura do corredor entre ÍMPAR e PAR da mesma rua (Z)

LARGURA_CUBO = 2.2
ALTURA_CUBO = 6
PROFUNDIDADE_CUBO = 5.1

ARQUIVO_ENTRADA = "ruas_cruas.txt"
ARQUIVO_SAIDA = "saida.json"


# OS ULTIMOS FORAM 40 E 48

def ler_posicoes_cruas(caminho):
    """Lê o arquivo texto (id + tipo separados por espaço/tab) e retorna uma lista de tuplas."""
    with open(caminho, "r", encoding="utf-8") as arquivo:
        linhas = arquivo.readlines()

    registros = []
    for linha in linhas:
        linha = linha.strip()
        if not linha:
            continue

        id_, tipo = linha.split()
        rua_str, local_str, nivel_str = id_.split("-")

        registros.append({
            "id": id_,
            "rua": int(rua_str),
            "local": int(local_str),
            "nivel": int(nivel_str),
            "tipo": tipo
        })

    return registros


def calcular_indice_ruas(registros):
    """Mapeia cada número de rua para seu índice ordenado (0, 1, 2...)."""
    ruas_unicas = sorted({registro["rua"] for registro in registros})
    return {rua: indice for indice, rua in enumerate(ruas_unicas)}


def calcular_coordenadas(registro, indice_rua):
    """
    Calcula X, Y, Z de uma posição, considerando:
    - X: local reindexado dentro da própria fileira (ímpar ou par)
    - Y: nível, sem alteração de regra
    - Z: rua dividida em ÍMPAR/PAR com corredor entre elas,
         e sem espaço extra entre ruas diferentes (back-to-back)
    """
    local = registro["local"]
    nivel = registro["nivel"]
    rua = registro["rua"]

    eh_par = local % 2 == 0
    sub_fileira = 1 if eh_par else 0

    indice_local_na_fileira = (local - 1) // 2
    x = indice_local_na_fileira * PASSO_LOCAL

    y = (nivel - 1) * PASSO_NIVEL

    z = indice_rua[rua] * (PASSO_FILEIRA + LARGURA_CORREDOR) + sub_fileira * LARGURA_CORREDOR

    return x, y, z


def montar_posicoes(registros):
    """Constrói a lista final de posições, já com coordenadas calculadas."""
    indice_rua = calcular_indice_ruas(registros)
    posicoes = []

    for registro in registros:
        x, y, z = calcular_coordenadas(registro, indice_rua)

        posicoes.append({
            "id": registro["id"],
            "rua": registro["rua"],
            "local": registro["local"],
            "nivel": registro["nivel"],
            "x": x,
            "y": y,
            "z": z,
            "largura": LARGURA_CUBO,
            "altura": ALTURA_CUBO,
            "profundidade": PROFUNDIDADE_CUBO,
            "tipo": registro["tipo"]
        })

    return posicoes


def salvar_json(posicoes, caminho):
    """Salva o JSON no formato compacto (uma posição por linha)."""
    corpo = ",\n".join(json.dumps(p, separators=(",", ":")) for p in posicoes)
    conteudo = '{"posicoes":[\n' + corpo + '\n]}'

    with open(caminho, "w", encoding="utf-8") as arquivo:
        arquivo.write(conteudo)


def main():
    caminho_entrada = os.path.join(os.path.dirname(__file__), ARQUIVO_ENTRADA)
    caminho_saida = os.path.join(os.path.dirname(__file__), ARQUIVO_SAIDA)

    registros = ler_posicoes_cruas(caminho_entrada)
    posicoes = montar_posicoes(registros)
    salvar_json(posicoes, caminho_saida)

    print(f"JSON gerado em: {caminho_saida}")
    print(f"Total de posições: {len(posicoes)}")


if __name__ == "__main__":
    main()
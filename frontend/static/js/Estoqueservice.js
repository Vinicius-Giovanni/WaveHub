import { API_LAYOUT_URL, API_ESTOQUE_URL } from "./Config.js";
import { obterLayoutCache, salvarLayoutCache } from "./CacheLayoutDB.js";

async function buscarJSON(url) {
    const resposta = await fetch(url);
    if (!resposta.ok) {
        throw new Error(`Falha ao buscar ${url}: HTTP ${resposta.status}`);
    }
    return resposta.json();
}

async function buscarLayout() {
    const cache = await obterLayoutCache();
    if (cache) return cache;

    const layout = await buscarJSON(API_LAYOUT_URL);
    await salvarLayoutCache(layout);
    return layout;
}

function unirLayoutEEstoque(layout, estoque) {
    if (!layout || !Array.isArray(layout.posicoes)) {
        throw new Error('Formato inválido em /api/layout: esperado { "posicoes":[...] }');
    }

    const mapaEstoque = new Map(estoque.map(item => [item.id, item]));

    return layout.posicoes.map(posicaoLayout => {
        const dadosEstoque = mapaEstoque.get(posicaoLayout.id);
        return {
            ...posicaoLayout,
            ...dadosEstoque,
            status: dadosEstoque?.status ?? "vazia",
            itens: dadosEstoque?.itens ?? []
        };
    });
}

/**
 * Busca o layout (dados mestres) e o estoque (dados transacionais)
 * em paralelo e devolve a lista já unida por "id", pronta pra ser
 * renderizada. Uma posição sem entrada no estoque volta com
 * status "vazia" e itens vazio - ela existe fisicamente mesmo assim.
 */
export async function carregarPosicoes() {
    const [layout, estoque] = await Promise.all([
        buscarLayout(),
        buscarJSON(API_ESTOQUE_URL) // sempre fresco, nunca cacheado
    ]);

    return unirLayoutEEstoque(layout, estoque);
}
import { criarCuboDaPosicao } from "./Cubofactory.js";

/**
 * Adiciona um cubo por posição na cena e devolve a lista de Mesh
 * criados, quem chamar isso pode guardar esssa lista pra usar depois
 * em seleção, busca, etc.
 */

export function renderizarPosicoes(scene, posicoes) {

    const cubos = [];

    posicoes.forEach(posicao => {
        const cubo = criarCuboDaPosicao(posicao);
        scene.add(cubo);
        cubos.push(cubo);
    });

    return cubos;
}
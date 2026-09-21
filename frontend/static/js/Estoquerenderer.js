// Estoquerenderer.js
import { criarInstancedMesh } from "./Cubofactory.js";

export function renderizarPosicoes(scene, posicoes) {
    const porStatus = { ocupada: [], vazia: [] };

    posicoes.forEach(posicao => {
        const grupo = posicao.status === "ocupada" ? "ocupada" : "vazia";
        porStatus[grupo].push(posicao);
    });

    const meshes = [];

    Object.entries(porStatus).forEach(([status, lista]) => {
        if (lista.length === 0) return;
        const instancedMesh = criarInstancedMesh(lista, status);
        scene.add(instancedMesh);
        meshes.push(instancedMesh);
    });

    return meshes;
}
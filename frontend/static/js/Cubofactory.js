import * as THREE from "three";
import { CORES } from "./Config.js"

/**
 * Materiais compartilhados entre todos os cubos do mesmo status
 * (evita criar um material novo por posição - mais leve em escala).
 */

const materiais = {
    ocupada: new THREE.MeshLambertMaterial({ color: CORES.ocupada }),
    vazia: new THREE.MeshLambertMaterial({ 
        color: CORES.vazia,
        transparent: true,
        opacity: 0.7
    })
};

/**
 * Cria o Mesh de uma posição a partir dos dados já unidos
 * (layout + estoque). "y" é tratado como a BASE do item
 * (chão = 0); o cubo é desenhado crescendo a partir dali.
 */

export function criarCuboDaPosicao(posicao) {
    
    const largura = posicao.largura || 1;
    const altura = posicao.altura || 1;
    const profundidade = posicao.profundidade || 1;

    const geometry = new THREE.BoxGeometry(largura, altura, profundidade);
    const material = posicao.status === "ocupada" ? materiais.ocupada : materiais.vazia;

    const cubo = new THREE.Mesh(geometry, material);

    cubo.position.set(
        posicao.x,
        posicao.y + altura / 2,
        posicao.z
    );

    cubo.userData.posicao = posicao;
    //cubo.castShadow = true;

    return cubo;
}
// Cubofactory.js
import * as THREE from "three";
import { CORES } from "./Config.js";

const geometriaBase = new THREE.BoxGeometry(1, 1, 1);

const materiais = {
    ocupada: new THREE.MeshLambertMaterial({
        color: CORES.ocupada,
        transparent: true,
        opacity: 0.9
    }),
    vazia: new THREE.MeshLambertMaterial({
        color: CORES.vazia,
        transparent: true,
        opacity: 0.40
    })
};

function criarMatriz(posicao) {
    const largura = posicao.largura || 1;
    const altura = posicao.altura || 1;
    const profundidade = posicao.profundidade || 1;

    return new THREE.Matrix4().compose(
        new THREE.Vector3(posicao.x, posicao.y + altura / 2, posicao.z),
        new THREE.Quaternion(),
        new THREE.Vector3(largura, altura, profundidade)
    );
}

export function criarInstancedMesh(posicoesDoStatus, status) {
    const material = materiais[status] || materiais.vazia;
    const instancedMesh = new THREE.InstancedMesh(geometriaBase, material, posicoesDoStatus.length);
    instancedMesh.castShadow = true;

    // necessário pra habilitar setColorAt/getColorAt
    instancedMesh.instanceColor = new THREE.InstancedBufferAttribute(
        new Float32Array(posicoesDoStatus.length * 3).fill(1), 3
    );

    const corBase = new THREE.Color(materiais[status].color.getHex());
    const mapaIndices = new Map();

    posicoesDoStatus.forEach((posicao, indice) => {
        instancedMesh.setMatrixAt(indice, criarMatriz(posicao));
        instancedMesh.setColorAt(indice, corBase);
        mapaIndices.set(indice, posicao);
    });

    instancedMesh.instanceMatrix.needsUpdate = true;
    instancedMesh.instanceColor.needsUpdate = true;
    instancedMesh.userData.mapaIndices = mapaIndices;
    instancedMesh.userData.status = status;

    return instancedMesh;
}
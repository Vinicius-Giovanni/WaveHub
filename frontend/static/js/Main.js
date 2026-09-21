import * as THREE from "three";

import { criarCena, criarCamera, criarRenderer, ativarResizeAutomatico } from "./Cena.js";
import { ControlesPrimeiraPessoa } from "./Controlesprimeirapessoa.js";
import { ativarZoomAdaptativo } from "./Zoomadaptativo.js";

import { carregarPosicoes } from "./Estoqueservice.js";
import { renderizarPosicoes } from "./Estoquerenderer.js";

import { ViewHelper } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/helpers/ViewHelper.js";

// INFRAESTRUTURA 3D

const container = document.getElementById("estoque-3d");

const scene = criarCena();
const camera = criarCamera(container);
const renderer = criarRenderer(container);
const viewHelper = new ViewHelper(camera, renderer.domElement);

ativarResizeAutomatico(container, camera, renderer);

// CONTROLES

const controlesFPS = new ControlesPrimeiraPessoa(camera, renderer, container);
ativarZoomAdaptativo(camera, renderer);

// LOOP DE ANIMAÇÃO

const relogio = new THREE.Clock();

function animar() {
    requestAnimationFrame(animar);

    const deltaTime = relogio.getDelta();
    controlesFPS.atualizar(deltaTime);

    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(scene, camera);
    viewHelper.render(renderer);
}

// CARREGAMENTO DOS DADOS

async function iniciar() {
    try {
        const posicoes = await carregarPosicoes();
        renderizarPosicoes(scene, posicoes);
    } catch (erro) {
        console.error("Erro ao carregar estoque:", erro);
    } finally {
        document.getElementById("estoque-loading")?.classList.add("oculto");
    }
}

animar();
iniciar();
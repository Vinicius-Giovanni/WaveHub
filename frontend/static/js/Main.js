import * as THREE from "three";

import { criarCena, criarCamera, criarRenderer, ativarResizeAutomatico } from "./Cena.js";
import { ControlesPrimeiraPessoa } from "./Controlesprimeirapessoa.js";
import { ativarZoomAdaptativo } from "./Zoomadaptativo.js";

import { carregarPosicoes } from "./Estoqueservice.js";
import { renderizarPosicoes } from "./Estoquerenderer.js";
import { limparLayoutCache } from "./CacheLayoutDB.js";

import { ViewHelper } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/helpers/ViewHelper.js";

// INFRAESTRUTURA 3D

const container = document.getElementById("estoque-3d");

const scene = criarCena();
const camera = criarCamera(container);
const renderer = criarRenderer(container);
const viewHelper = new ViewHelper(camera, renderer.domElement);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const AMARELO_SELECAO = new THREE.Color(0xffeb3b);
let selecaoAtual = null; // { instancedMesh, instanceId, corOriginal }

ativarResizeAutomatico(container, camera, renderer);

// SELECIONAR CUBO
function restaurarSelecaoAnterior() {
    if (!selecaoAtual) return;

    const { instancedMesh, instanceId, corOriginal } = selecaoAtual;
    instancedMesh.setColorAt(instanceId, corOriginal);
    instancedMesh.instanceColor.needsUpdate = true;
    selecaoAtual = null;
}

function selecionarCubo(instancedMesh, instanceId) {
    restaurarSelecaoAnterior();

    const corOriginal = new THREE.Color();
    instancedMesh.getColorAt(instanceId, corOriginal);

    instancedMesh.setColorAt(instanceId, AMARELO_SELECAO);
    instancedMesh.instanceColor.needsUpdate = true;

    selecaoAtual = { instancedMesh, instanceId, corOriginal };
}

// CONTROLES

const controlesFPS = new ControlesPrimeiraPessoa(camera, renderer, container);
ativarZoomAdaptativo(camera, renderer);

// ESTADO DOS CUBOS RENDERIZADOS

let cubosAtuais = [];

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

// dentro de iniciar(), antes de renderizarPosicoes
async function iniciar() {
    try {
        const posicoes = await carregarPosicoes();
        console.log("TOTAL:", posicoes.length);
        console.log("PRIMEIRA:", posicoes[0]);
        cubosAtuais = renderizarPosicoes(scene, posicoes);
        atualizarDashboard(posicoes);
    } catch (erro) {
        console.error("Erro ao carregar estoque:", erro);
    } finally {
        document.getElementById("estoque-loading")?.classList.add("oculto");
    }
}
// MOSTRA PAINEL
function mostrarPainel(posicao) {
    document.getElementById("painel-id").textContent = `Posição ${posicao.id}`;
    document.getElementById("painel-status").textContent = posicao.status;
    document.getElementById("painel-zona").textContent = posicao.zona ?? "-";

    const listaItens = document.getElementById("painel-itens");
    listaItens.innerHTML = "";

    if (!posicao.itens || posicao.itens.length === 0) {
        const li = document.createElement("li");
        li.textContent = "Nenhum item";
        li.classList.add("item-vazio");
        listaItens.appendChild(li);
    } else {
        posicao.itens.forEach(item => {
            const li = document.createElement("li");
            li.classList.add("item-linha");

            li.innerHTML = `
                <span class="item-codigo">${item.item}</span>
                <span class="item-descricao">${item.descricao}</span>
                <span class="item-quantidade">Qtd: ${item.quantidade}</span>
            `;

            listaItens.appendChild(li);
        });
    }

    document.getElementById("painel-posicao").classList.remove("oculto");
}

// DASHBOARD
function calcularKPIs(posicoes) {
    const total = posicoes.length;
    const ocupadas = posicoes.filter(p => p.status === "ocupada").length;
    const vazias = total - ocupadas;
    const desabilitadas = posicoes.filter(p => p.habilitado === false).length;
    const percentualOcupacao = total > 0 ? ((ocupadas / total) * 100).toFixed(1) : 0;

    const itensUnicos = new Set();
    posicoes.forEach(p => (p.itens || []).forEach(item => itensUnicos.add(item.item)));

    const zonas = new Map();
    posicoes.forEach(p => {
        const zona = p.zona ?? "Sem zona";
        if (!zonas.has(zona)) zonas.set(zona, { total: 0, ocupadas: 0 });
        const dados = zonas.get(zona);
        dados.total += 1;
        if (p.status === "ocupada") dados.ocupadas += 1;
    });

    return { total, ocupadas, vazias, desabilitadas, percentualOcupacao, itensUnicos: itensUnicos.size, zonas };
}

function atualizarDashboard(posicoes) {
    const kpis = calcularKPIs(posicoes);

    document.getElementById("kpi-total").textContent = kpis.total;
    document.getElementById("kpi-ocupadas").textContent = kpis.ocupadas;
    document.getElementById("kpi-vazias").textContent = kpis.vazias;
    document.getElementById("kpi-ocupacao").textContent = `${kpis.percentualOcupacao}%`;
    document.getElementById("kpi-itens").textContent = kpis.itensUnicos;
    document.getElementById("kpi-zonas").textContent = kpis.zonas.size;
    document.getElementById("kpi-desabilitadas").textContent = kpis.desabilitadas;

    const listaZonas = document.getElementById("kpi-lista-zonas");
    listaZonas.innerHTML = "";

    kpis.zonas.forEach((dados, zona) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${zona}</span><span>${dados.ocupadas}/${dados.total}</span>`;
        listaZonas.appendChild(li);
    });
}

document.getElementById("btn-toggle-dashboard")?.addEventListener("click", () => {
    document.getElementById("dashboard")?.classList.toggle("oculto");
});

// SELECIONAR CUBO PARA INFOS
function aoClicar(evento) {
    if (controlesFPS.isLocked) {
        mouse.x = 0;
        mouse.y = 0;
    } else {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((evento.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((evento.clientY - rect.top) / rect.height) * 2 + 1;
    }

    raycaster.setFromCamera(mouse, camera);
    const intersecoes = raycaster.intersectObjects(cubosAtuais);

    if (intersecoes.length === 0) return;

    const { object: instancedMesh, instanceId } = intersecoes[0];
    const posicao = instancedMesh.userData.mapaIndices.get(instanceId);

    selecionarCubo(instancedMesh, instanceId);
    mostrarPainel(posicao);
}

renderer.domElement.addEventListener("click", aoClicar);

document.getElementById("fechar-painel")?.addEventListener("click", () => {
    document.getElementById("painel-posicao").classList.add("oculto");
});

// BOTÃO DE RECARREGAR LAYOUT

document.getElementById("btn-recarregar-layout")?.addEventListener("click", async () => {
    await limparLayoutCache();

    cubosAtuais.forEach(cubo => scene.remove(cubo));
    cubosAtuais = [];

    document.getElementById("estoque-loading")?.classList.remove("oculto");
    await iniciar();
});

animar();
iniciar();
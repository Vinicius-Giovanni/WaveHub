import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";

const container = document.getElementById("estoque-3d");


// ==============================
// CENA
// ==============================

const scene = new THREE.Scene();

const COR_FUNDO = 0x1E1E1E;
scene.background = new THREE.Color(COR_FUNDO);
scene.fog = new THREE.Fog(COR_FUNDO, 250, 2200);


// ==============================
// CÂMERA
// ==============================

const camera = new THREE.PerspectiveCamera(
    60,
    container.clientWidth / container.clientHeight,
    0.1,
    10000
);

camera.position.set(500, 150, 800);


// ==============================
// RENDERER
// ==============================

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

// Evita renderizar em resolução excessiva em telas de alto DPI (perf)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

container.appendChild(renderer.domElement);


// ==============================
// CONTROLES (estilo FPS / jogo) — inalterado
// ==============================

const controls = new PointerLockControls(camera, renderer.domElement);

const overlay = document.createElement("div");
overlay.textContent = "Clique para olhar em volta (Esc para sair)";
overlay.style.position = "absolute";
overlay.style.top = "0";
overlay.style.left = "0";
overlay.style.width = "100%";
overlay.style.height = "100%";
overlay.style.display = "flex";
overlay.style.alignItems = "center";
overlay.style.justifyContent = "center";
overlay.style.background = "rgba(0,0,0,0.35)";
overlay.style.color = "#fff";
overlay.style.fontFamily = "sans-serif";
overlay.style.fontSize = "18px";
overlay.style.cursor = "pointer";
overlay.style.zIndex = "10";

container.style.position = "relative";
container.appendChild(overlay);

overlay.addEventListener("click", () => {
    controls.lock();
});

controls.addEventListener("lock", () => {
    overlay.style.display = "none";
});

controls.addEventListener("unlock", () => {
    overlay.style.display = "flex";
});


// ==============================
// MOVIMENTAÇÃO (WASD) — inalterado, apenas ganhou uma guarda
// para não mexer na câmera enquanto o usuário digita na busca
// e para pausar durante a navegação automática (voo)
// ==============================

const MOVE_SPEED = 40;

const teclas = {
    frente: false,
    tras: false,
    esquerda: false,
    direita: false,
    subir: false,
    descer: false
};

function digitandoEmCampo() {
    const ativo = document.activeElement;
    return ativo && (ativo.tagName === "INPUT" || ativo.tagName === "TEXTAREA");
}

document.addEventListener("keydown", (event) => {
    if (digitandoEmCampo()) return;

    switch (event.code) {
        case "KeyW": teclas.frente = true; break;
        case "KeyS": teclas.tras = true; break;
        case "KeyA": teclas.esquerda = true; break;
        case "KeyD": teclas.direita = true; break;
        case "Space": teclas.subir = true; break;
        case "ShiftLeft": teclas.descer = true; break;
    }
});

document.addEventListener("keyup", (event) => {
    if (digitandoEmCampo()) return;

    switch (event.code) {
        case "KeyW": teclas.frente = false; break;
        case "KeyS": teclas.tras = false; break;
        case "KeyA": teclas.esquerda = false; break;
        case "KeyD": teclas.direita = false; break;
        case "Space": teclas.subir = false; break;
        case "ShiftLeft": teclas.descer = false; break;
    }
});

function atualizarMovimento(deltaTime) {

    if (!controls.isLocked) return;
    if (voo.ativo) return; // pausa o WASD durante a navegação automática

    const distancia = MOVE_SPEED * deltaTime;

    if (teclas.frente) controls.moveForward(distancia);
    if (teclas.tras) controls.moveForward(-distancia);
    if (teclas.direita) controls.moveRight(distancia);
    if (teclas.esquerda) controls.moveRight(-distancia);

    if (teclas.subir) camera.position.y += distancia;
    if (teclas.descer) camera.position.y -= distancia;

    limitarAlturaCamera();
}

// ==============================
// ILUMINAÇÃO
// Combinação de luz ambiente + hemisférica + direcional para
// dar sombreamento real aos cubos (facilita distinguir volumes
// e profundidade, ao invés do material "chapado" de antes).
// ==============================

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0x8fa8c9, 0x1a1d22, 0.6);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
dirLight.position.set(300, 500, 200);
scene.add(dirLight);

// ==============================
// CHÃO
// Piso visual (com grade sutil para referência de escala) e
// limite de altura mínima da câmera, para o usuário não
// atravessar o chão com WASD, zoom ou navegação.
// ==============================

const ALTURA_PISO = -1.5;
const LIMITE_ALTURA_CAMERA = ALTURA_PISO + 3;

function criarTexturaGrade() {

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#383838";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.12)";
    ctx.lineWidth = 2;

    for (let i = 0; i <= canvas.width; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    const textura = new THREE.CanvasTexture(canvas);
    textura.wrapS = THREE.RepeatWrapping;
    textura.wrapT = THREE.RepeatWrapping;
    textura.repeat.set(120, 120);

    return textura;
}

const pisoGeometry = new THREE.PlaneGeometry(6000, 6000);
const pisoMaterial = new THREE.MeshStandardMaterial({
    color: 0x383838,
    map: criarTexturaGrade(),
    roughness: 1,
    metalness: 0
});

const piso = new THREE.Mesh(pisoGeometry, pisoMaterial);
piso.rotation.x = -Math.PI / 2;
piso.position.y = ALTURA_PISO;
scene.add(piso);

function limitarAlturaCamera() {
    if (camera.position.y < LIMITE_ALTURA_CAMERA) {
        camera.position.y = LIMITE_ALTURA_CAMERA;
    }
}

// ==============================
// ESPAÇAMENTO DA GRADE (movido para o topo do módulo
// para ser reaproveitado pelas referências de rua e pela navegação)
// ==============================

const ESPACO_LOCAL = 2;
const ESPACO_NIVEL = 1.5;
const ESPACO_RUA = 8;
const ALTURA_MAX_NIVEIS = 8;
const FATOR_MARGEM_NIVEL = 0.8;
const ESCALA_MIN_NIVEL = 0.15; 


// ==============================
// ESTADO / ÍNDICES DE DADOS
// Guardam a relação cubo <-> posição para permitir busca,
// seleção, navegação e filtros sem re-processar os 34 mil itens
// ==============================

let indicePosicoes = [];      // array bruto vindo da API
let todosCubos = [];          // todos os Mesh criados
let cubosVisiveis = [];       // subconjunto respeitando os filtros atuais
let mapaPorId = new Map();    // id da posição -> Mesh correspondente
let mapaNiveis = new Map();   // rótulo do nível (ex: "1A") -> índice numérico (eixo Y)
let mapaEscalaRua = new Map(); // rua -> fator de escala vertical do cubo
let mapaIndiceRua = new Map(); // rua -> índice sequencial (separa ruas numéricas e alfanuméricas)
let filtroStatusAtual = "todas";
let filtroRuaAtual = "";
let filtroHabilitadoAtual = "todas";
let filtroZonaAtual = "";
let filtroTipoEqpAtual = "";
let filtroTipoLocalAtual = "";

function ehHabilitado(valor) {
    if (typeof valor === "boolean") return valor;
    if (typeof valor === "number") return valor === 1;
    if (typeof valor === "string") {
        const v = valor.trim().toLowerCase();
        return v === "true" || v === "s" || v === "sim" || v === "1" || v === "habilitado";
    }
    return false;
}


// ==============================
// MAPEAMENTO DE NÍVEIS ALFANUMÉRICOS (normalização por rua)
// Não dá pra usar parseInt puro: "0A", "1A", "1B", "RO" etc.
// Cada rua é normalizada de forma independente para que nenhuma
// rua fique visualmente mais alta que outra: o rank de cada nível
// dentro da própria rua é convertido numa posição Y que nunca
// ultrapassa a altura equivalente a ALTURA_MAX_NIVEIS cubos.
// O rótulo original do nível nunca é alterado — isso afeta
// somente o cálculo da coordenada Y do cubo.
// ==============================

function compararNiveis(a, b) {
    const numA = parseInt(a) || 0;
    const numB = parseInt(b) || 0;

    if (numA !== numB) return numA - numB;

    return a.localeCompare(b);
}

function construirMapaRuas(estoque) {

    const ruasUnicas = [...new Set(estoque.map(p => p.rua))];

    ruasUnicas.sort(compararNiveis);

    const mapa = new Map();

    ruasUnicas.forEach((rua, indice) => {
        mapa.set(rua, indice);
    });

    return mapa;
}

function construirMapaNiveis(estoque) {

    const niveisPorRua = new Map();

    for (const posicao of estoque) {
        if (!niveisPorRua.has(posicao.rua)) {
            niveisPorRua.set(posicao.rua, new Set());
        }
        niveisPorRua.get(posicao.rua).add(posicao.nivel);
    }

    const mapaNiveis = new Map();
    const mapaEscalaRua = new Map();

    const alturaMaximaUnidades = (ALTURA_MAX_NIVEIS - 1) * ESPACO_NIVEL;

    for (const [rua, niveisSet] of niveisPorRua) {

        const niveisOrdenados = [...niveisSet].sort(compararNiveis);
        const totalNiveis = niveisOrdenados.length;

        const espacamentoUsado =
            totalNiveis <= ALTURA_MAX_NIVEIS
                ? ESPACO_NIVEL
                : alturaMaximaUnidades / (totalNiveis - 1);

        // Escala vertical do cubo nesta rua: proporcional ao espaço
        // realmente disponível entre níveis, com margem para sempre
        // sobrar uma fresta entre andares. Nunca > 1 (tamanho padrão)
        // nem < ESCALA_MIN_NIVEL (para continuar visível e clicável).
        const escalaY = Math.min(
            1,
            Math.max(
                ESCALA_MIN_NIVEL,
                (espacamentoUsado / ESPACO_NIVEL) * FATOR_MARGEM_NIVEL
            )
        );

        mapaEscalaRua.set(rua, escalaY);

        niveisOrdenados.forEach((nivel, indice) => {
            mapaNiveis.set(`${rua}|${nivel}`, indice * espacamentoUsado);
        });
    }

    return { mapaNiveis, mapaEscalaRua };
}

// ==============================
// ESTOQUE (modificado: guarda referência posição <-> cubo,
// usa o mapeamento de níveis, e alimenta os índices de busca/filtro)
// ==============================

async function carregarEstoque() {

    try {

        const response = await fetch("/api/estoque");

        if (!response.ok) {
            throw new Error("Erro ao carregar estoque");
        }

        const estoque = await response.json();
        indicePosicoes = estoque;

        const resultado = construirMapaNiveis(estoque);
        mapaNiveis = resultado.mapaNiveis;
        mapaIndiceRua = construirMapaRuas(estoque);
        mapaEscalaRua = resultado.mapaEscalaRua;

        const geometry = new THREE.BoxGeometry(
            1.5,
            1.2,
            1.5
        );

        const materialOcupada = new THREE.MeshStandardMaterial({
            color: 0x2f8fff,
            roughness: 0.4,
            metalness: 0.1
        });

        const materialVazia = new THREE.MeshStandardMaterial({
            color: 0x4a5568,
            roughness: 0.9,
            metalness: 0,
            transparent: true,
            opacity: 0.75
        });

        const ruasEncontradas = new Set();
        const zonasEncontradas = new Set();
        const tiposEqpEncontrados = new Set();
        const tiposLocalEncontrados = new Set();

        for (const posicao of estoque) {

            const material =
                posicao.status === "ocupada"
                    ? materialOcupada
                    : materialVazia;

            const cubo = new THREE.Mesh(
                geometry,
                material
            );

            const escalaY = mapaEscalaRua.get(posicao.rua) ?? 1;
            cubo.scale.y = escalaY;

            const ruaIndice =
                mapaIndiceRua.get(posicao.rua) ?? 0;

            const local =
                parseInt(posicao.local) || 0;

            const y =
                mapaNiveis.get(`${posicao.rua}|${posicao.nivel}`) ?? 0;

            cubo.position.set(
                local * ESPACO_LOCAL,
                y,
                ruaIndice * ESPACO_RUA
            );
            // Referência de ida e volta entre o Mesh e os dados originais
            cubo.userData.posicao = posicao;

            scene.add(cubo);

            todosCubos.push(cubo);
            mapaPorId.set(posicao.id, cubo);
            ruasEncontradas.add(posicao.rua);
            if (posicao.zona) zonasEncontradas.add(posicao.zona);
            if (posicao.tipo_de_eqp) tiposEqpEncontrados.add(posicao.tipo_de_eqp);
            if (posicao.tipo_do_local) tiposLocalEncontrados.add(posicao.tipo_do_local);
        }
   
        preencherSelect(filtroRuaSelect, [...ruasEncontradas]);
        preencherSelect(filtroZonaSelect, [...zonasEncontradas]);
        preencherSelect(filtroTipoEqpSelect, [...tiposEqpEncontrados]);
        preencherSelect(filtroTipoLocalSelect, [...tiposLocalEncontrados]);

        aplicarFiltros(); // já popula cubosVisiveis e calcula o dashboard inicial

        console.log(
            `Posições carregadas: ${estoque.length}`
        );

    } catch (error) {

        console.error(
            "Erro ao carregar estoque:",
            error
        );
    }
}

// ==============================
// DESTAQUE VISUAL
// Um único mesh de contorno reaproveitado (evita clonar
// materiais dos cubos, que são compartilhados entre todos eles)
// ==============================

const destaqueGeometry = new THREE.BoxGeometry(1.5, 1.2, 1.5);
const destaqueMaterial = new THREE.MeshBasicMaterial({
    color: 0xffcc00,
    wireframe: true,
    depthTest: false
});

const cuboDestaque = new THREE.Mesh(destaqueGeometry, destaqueMaterial);
cuboDestaque.scale.setScalar(1.2);
cuboDestaque.visible = false;
scene.add(cuboDestaque);

function posicionarDestaque(cubo) {
    cuboDestaque.position.copy(cubo.position);
    cuboDestaque.scale.copy(cubo.scale).multiplyScalar(1.2);
    cuboDestaque.visible = true;
}

function limparDestaque() {
    cuboDestaque.visible = false;
}


// ==============================
// REFERÊNCIAS DE DOM (painel, busca, filtros, legenda)
// ==============================

const buscaInput = document.getElementById("busca-input");
const buscaResultados = document.getElementById("busca-resultados");

const painelDetalhes = document.getElementById("painel-detalhes");
const painelTitulo = document.getElementById("painel-titulo");
const painelConteudo = document.getElementById("painel-conteudo");
const painelFechar = document.getElementById("painel-fechar");

const filtroRuaSelect = document.getElementById("filtro-rua");
const botoesFiltro = document.querySelectorAll(".filtro-btn");
const filtroHabilitadoSelect = document.getElementById("filtro-habilitado");
const filtroZonaSelect = document.getElementById("filtro-zona");
const filtroTipoEqpSelect = document.getElementById("filtro-tipo-eqp");
const filtroTipoLocalSelect = document.getElementById("filtro-tipo-local");

const dashboardContainer = document.getElementById("dashboard-container");
const dashboardToggle = document.getElementById("dashboard-toggle");

const dashboardCampos = {
    ruas: document.getElementById("db-ruas"),
    total: document.getElementById("db-total"),
    ocupadas: document.getElementById("db-ocupadas"),
    vazias: document.getElementById("db-vazias"),
    itens: document.getElementById("db-itens"),
    zonas: document.getElementById("db-zonas"),
    niveis: document.getElementById("db-niveis"),
    locais: document.getElementById("db-locais"),
    ocupacao: document.getElementById("db-ocupacao"),
    habilitadas: document.getElementById("db-habilitadas"),
    naoHabilitadas: document.getElementById("db-nao-habilitadas")
};

// ==============================
// SELEÇÃO (clique no cubo + resultado de busca)
// ==============================

let cuboSelecionado = null;

function escaparTexto(texto) {
    const div = document.createElement("div");
    div.textContent = texto ?? "";
    return div.innerHTML;
}

function mostrarPainel(posicao) {

    if (!painelDetalhes) return;

    painelTitulo.textContent = posicao.id;

    let html = `
        <p><strong>Rua:</strong> ${escaparTexto(posicao.rua)}</p>
        <p><strong>Local:</strong> ${escaparTexto(posicao.local)}</p>
        <p><strong>Nível:</strong> ${escaparTexto(posicao.nivel)}</p>
        <p><strong>Status:</strong> ${escaparTexto(posicao.status)}</p>
    `;

    const itens = posicao.itens || [];

    if (itens.length > 0) {
        html += `<p><strong>Itens (${itens.length}):</strong></p>`;

        itens.forEach(item => {
            html += `
                <div class="painel-item">
                    <p><strong>Código:</strong> ${escaparTexto(item.item)}</p>
                    <p><strong>Descrição:</strong> ${escaparTexto(item.descricao)}</p>
                    <p><strong>Quantidade:</strong> ${escaparTexto(item.quantidade)}</p>
                </div>
            `;
        });
    } else {
        html += "<p>Nenhum item armazenado.</p>";
    }

    painelConteudo.innerHTML = html;
    painelDetalhes.classList.remove("oculto");
}

function selecionarCubo(cubo) {
    cuboSelecionado = cubo;
    posicionarDestaque(cubo);
    mostrarPainel(cubo.userData.posicao);
}

if (painelFechar) {
    painelFechar.addEventListener("click", () => {
        painelDetalhes.classList.add("oculto");
        limparDestaque();
        cuboSelecionado = null;
    });
}


// ==============================
// CLIQUE NOS CUBOS (raycaster)
// Com o Pointer Lock ativo, o cursor fica oculto, então a mira
// usada é sempre o centro da tela (crosshair). Sem lock, usa a
// posição real do mouse.
// ==============================

const raycaster = new THREE.Raycaster();
raycaster.far = 4000;

renderer.domElement.addEventListener("click", (event) => {

    if (voo.ativo) return;

    let ponteiro;

    if (controls.isLocked) {
        ponteiro = { x: 0, y: 0 };
    } else {
        const rect = renderer.domElement.getBoundingClientRect();
        ponteiro = {
            x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
            y: -((event.clientY - rect.top) / rect.height) * 2 + 1
        };
    }

    raycaster.setFromCamera(ponteiro, camera);

    const intersecoes = raycaster.intersectObjects(cubosVisiveis, false);

    if (intersecoes.length > 0) {
        selecionarCubo(intersecoes[0].object);
    }
});


// ==============================
// BUSCA
// Aceita: ID completo (002-015-03), prefixos (item:, rua:,
// local:, nivel:, id:) ou texto livre.
// ==============================

const LIMITE_RESULTADOS = 50;

function filtrarPorCampo(campo, valor) {

    const valorLower = valor.toLowerCase();

    return indicePosicoes.filter(p => {
        if (campo === "id") return p.id.toLowerCase().includes(valorLower);
        if (campo === "rua") return p.rua.toLowerCase().includes(valorLower);
        if (campo === "local") return p.local.toLowerCase().includes(valorLower);
        if (campo === "nivel") return p.nivel.toLowerCase().includes(valorLower);

        if (campo === "item") {
            return (p.itens || []).some(it =>
                (it.item || "").toLowerCase().includes(valorLower)
            );
        }

        return false;
    }).slice(0, LIMITE_RESULTADOS);
}

function buscarPosicoes(consulta) {

    const termo = consulta.trim().toLowerCase();
    if (!termo) return [];

    const prefixoMatch = termo.match(/^(item|rua|local|nivel|id)\s*:\s*(.+)$/);

    if (prefixoMatch) {
        const [, campo, valor] = prefixoMatch;
        return filtrarPorCampo(campo, valor.trim());
    }

    const porIdExato = indicePosicoes.find(p => p.id.toLowerCase() === termo);
    if (porIdExato) return [porIdExato];

    const resultadosRua = indicePosicoes.filter(posicao =>
        String(posicao.rua ?? "").trim().toLowerCase() === termo
    );

    if (resultadosRua.length > 0) {
        return resultadosRua.slice(0, LIMITE_RESULTADOS);
    }

    const resultados = [];
    const vistos = new Set();

    for (const posicao of indicePosicoes) {

        const bateuPosicao =
            posicao.id.toLowerCase().includes(termo) ||
            posicao.rua.toLowerCase().includes(termo) ||
            posicao.local.toLowerCase().includes(termo) ||
            posicao.nivel.toLowerCase().includes(termo);

        const bateuItem = (posicao.itens || []).some(it =>
            (it.item || "").toLowerCase().includes(termo) ||
            (it.descricao || "").toLowerCase().includes(termo)
        );

        if ((bateuPosicao || bateuItem) && !vistos.has(posicao.id)) {
            vistos.add(posicao.id);
            resultados.push(posicao);
        }

        if (resultados.length >= LIMITE_RESULTADOS) break;
    }

    return resultados;
}

function renderizarResultados(lista) {

    if (!buscaResultados) return;

    buscaResultados.innerHTML = "";
    if (lista.length === 0) return;

    const fragmento = document.createDocumentFragment();

    lista.forEach(posicao => {
        const li = document.createElement("li");
        li.textContent = `${posicao.id} — ${posicao.status}`;

        li.addEventListener("click", () => {
            iniciarNavegacao(posicao);
            buscaResultados.innerHTML = "";
            buscaInput.value = posicao.id;
        });

        fragmento.appendChild(li);
    });

    buscaResultados.appendChild(fragmento);
}

function debounce(fn, atraso = 200) {
    let temporizador;
    return (...args) => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => fn(...args), atraso);
    };
}

if (buscaInput) {
    buscaInput.addEventListener("input", debounce(() => {
        const resultados = buscarPosicoes(buscaInput.value);
        renderizarResultados(resultados);
    }, 200));
}


// ==============================
// FILTROS
// Alteram apenas a visibilidade dos cubos — os dados originais
// (indicePosicoes, todosCubos) permanecem intactos.
// ==============================

function aplicarFiltros() {

    cubosVisiveis = [];

    for (const cubo of todosCubos) {

        const posicao = cubo.userData.posicao;

        const passaStatus =
            filtroStatusAtual === "todas" ||
            posicao.status === filtroStatusAtual;

        const passaRua =
            !filtroRuaAtual || posicao.rua === filtroRuaAtual;

        const passaHabilitado =
            filtroHabilitadoAtual === "todas" ||
            (filtroHabilitadoAtual === "sim" && ehHabilitado(posicao.habilitado)) ||
            (filtroHabilitadoAtual === "nao" && !ehHabilitado(posicao.habilitado));

        const passaZona =
            !filtroZonaAtual || posicao.zona === filtroZonaAtual;

        const passaTipoEqp =
            !filtroTipoEqpAtual || posicao.tipo_de_eqp === filtroTipoEqpAtual;

        const passaTipoLocal =
            !filtroTipoLocalAtual || posicao.tipo_do_local === filtroTipoLocalAtual;

        const visivel =
            passaStatus &&
            passaRua &&
            passaHabilitado &&
            passaZona &&
            passaTipoEqp &&
            passaTipoLocal;

        cubo.visible = visivel;

        if (visivel) cubosVisiveis.push(cubo);
    }

    atualizarDashboard();
}

botoesFiltro.forEach(botao => {
    botao.addEventListener("click", () => {
        botoesFiltro.forEach(b => b.classList.remove("ativo"));
        botao.classList.add("ativo");

        filtroStatusAtual = botao.dataset.filtro;
        aplicarFiltros();
    });
});

function preencherSelect(select, valores, prefixoLabel) {

    if (!select) return;

    const valoresOrdenados = [...new Set(
        valores.filter(v => v !== undefined && v !== null && v !== "")
    )].sort();

    valoresOrdenados.forEach(valor => {
        const option = document.createElement("option");
        option.value = valor;
        option.textContent = prefixoLabel ? `${prefixoLabel} ${valor}` : valor;
        select.appendChild(option);
    });
}

if (filtroRuaSelect) {
    filtroRuaSelect.addEventListener("change", () => {
        filtroRuaAtual = filtroRuaSelect.value;
        aplicarFiltros();
    });
}

if (filtroHabilitadoSelect) {
    filtroHabilitadoSelect.addEventListener("change", () => {
        filtroHabilitadoAtual = filtroHabilitadoSelect.value;
        aplicarFiltros();
    });
}

if (filtroZonaSelect) {
    filtroZonaSelect.addEventListener("change", () => {
        filtroZonaAtual = filtroZonaSelect.value;
        aplicarFiltros();
    });
}

if (filtroTipoEqpSelect) {
    filtroTipoEqpSelect.addEventListener("change", () => {
        filtroTipoEqpAtual = filtroTipoEqpSelect.value;
        aplicarFiltros();
    });
}

if (filtroTipoLocalSelect) {
    filtroTipoLocalSelect.addEventListener("change", () => {
        filtroTipoLocalAtual = filtroTipoLocalSelect.value;
        aplicarFiltros();
    });
}


// ==============================
// NAVEGAÇÃO SUAVE ATÉ UMA POSIÇÃO (voo de câmera)
// Interpola posição e rotação da câmera ao longo do tempo —
// não teleporta. Ao terminar, o PointerLockControls continua
// funcionando normalmente a partir da nova posição/rotação.
// ==============================

const voo = {
    ativo: false,
    duracao: 1.2,
    tempoInicio: 0,
    posOrigem: new THREE.Vector3(),
    posDestino: new THREE.Vector3(),
    quatOrigem: new THREE.Quaternion(),
    quatDestino: new THREE.Quaternion()
};

let tempoDecorrido = 0;

function suavizar(t) {
    return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

function iniciarVoo(posDestino, quatDestino, duracao = 1.2) {
    voo.ativo = true;
    voo.duracao = duracao;
    voo.tempoInicio = tempoDecorrido;
    voo.posOrigem.copy(camera.position);
    voo.posDestino.copy(posDestino);
    voo.quatOrigem.copy(camera.quaternion);
    voo.quatDestino.copy(quatDestino);
}

function atualizarVoo() {

    if (!voo.ativo) return;

    const progresso = (tempoDecorrido - voo.tempoInicio) / voo.duracao;

    if (progresso >= 1) {
        camera.position.copy(voo.posDestino);
        camera.quaternion.copy(voo.quatDestino);
        voo.ativo = false;
        return;
    }

    const t = suavizar(Math.max(progresso, 0));

    camera.position.lerpVectors(voo.posOrigem, voo.posDestino, t);
    camera.quaternion.slerpQuaternions(voo.quatOrigem, voo.quatDestino, t);
}

// Distância/ângulo de aproximação ao enquadrar uma posição encontrada
const OFFSET_NAVEGACAO = new THREE.Vector3(3, 3, 6);

function iniciarNavegacao(posicao) {

    const cubo = mapaPorId.get(posicao.id);
    if (!cubo) return;

    const posDestino = cubo.position.clone().add(OFFSET_NAVEGACAO);

    const cameraTemp = camera.clone();
    cameraTemp.position.copy(posDestino);
    cameraTemp.lookAt(cubo.position);

    iniciarVoo(posDestino, cameraTemp.quaternion.clone());

    selecionarCubo(cubo);
}


// ==============================
// RESIZE — inalterado
// ==============================

window.addEventListener("resize", () => {

    const width = container.clientWidth;
    const height = container.clientHeight;

    camera.aspect = width / height;

    camera.updateProjectionMatrix();

    renderer.setSize(
        width,
        height
    );
});


// ==============================
// ZOOM / AVANÇAR (velocidade adaptativa) — inalterado
// ==============================

const ZOOM_MIN_STEP = 3;
const ZOOM_PERCENT = 0.15;
const MIN_DISTANCE_ORIGEM = 0.3;

renderer.domElement.addEventListener("wheel", (event) => {
    event.preventDefault();

    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);

    const distanciaOrigem = camera.position.length();
    const magnitude = Math.max(distanciaOrigem * ZOOM_PERCENT, ZOOM_MIN_STEP);
    const passo = Math.sign(event.deltaY) * magnitude;

    if (distanciaOrigem - passo < MIN_DISTANCE_ORIGEM && passo > 0) {
        return;
    }

    camera.position.addScaledVector(direction, passo);

    limitarAlturaCamera();

}, { passive: false });


// ==============================
// ANIMAÇÃO (modificado: adiciona atualizarVoo e o acumulador
// de tempo usado pela navegação suave)
// ==============================

const relogio = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const deltaTime = relogio.getDelta();
    tempoDecorrido += deltaTime;

    atualizarVoo();
    atualizarMovimento(deltaTime);

    renderer.render(
        scene,
        camera
    );
}

animate();

// ==============================
// DASHBOARD FLUTUANTE
// Lê exclusivamente cubosVisiveis (já filtrado por aplicarFiltros)
// — nenhuma chamada nova à API, nenhuma fonte de dados extra.
// ==============================

function atualizarDashboard() {

    if (!dashboardCampos.total) return;

    const ruas = new Set();
    const zonas = new Set();
    const niveis = new Set();
    const locais = new Set();
    const ruasHabilitadas = new Set();
    const ruasNaoHabilitadas = new Set();

    let ocupadas = 0;
    let vazias = 0;
    let totalItens = 0;

    for (const cubo of cubosVisiveis) {

        const posicao = cubo.userData.posicao;

        ruas.add(posicao.rua);
        if (posicao.zona) zonas.add(posicao.zona);
        niveis.add(posicao.nivel);
        locais.add(posicao.local);

        if (posicao.status === "ocupada") {
            ocupadas++;
        } else {
            vazias++;
        }

        totalItens += (posicao.itens || []).reduce(
            (total, item) => total + (Number(item.quantidade) || 0),
            0
        );

        if (ehHabilitado(posicao.habilitado)) {
            ruasHabilitadas.add(posicao.rua);
        } else {
            ruasNaoHabilitadas.add(posicao.rua);
        }
    }

    const total = cubosVisiveis.length;
    const percentualOcupacao = total > 0 ? ((ocupadas / total) * 100).toFixed(1) : "0.0";

    dashboardCampos.ruas.textContent = ruas.size;
    dashboardCampos.total.textContent = total;
    dashboardCampos.ocupadas.textContent = ocupadas;
    dashboardCampos.vazias.textContent = vazias;
    dashboardCampos.itens.textContent = totalItens;
    dashboardCampos.zonas.textContent = zonas.size;
    dashboardCampos.niveis.textContent = niveis.size;
    dashboardCampos.locais.textContent = locais.size;
    dashboardCampos.ocupacao.textContent = `${percentualOcupacao}%`;
    dashboardCampos.habilitadas.textContent = ruasHabilitadas.size;
    dashboardCampos.naoHabilitadas.textContent = ruasNaoHabilitadas.size;
}

if (dashboardToggle && dashboardContainer) {
    dashboardToggle.addEventListener("click", () => {
        const fechado = dashboardContainer.classList.toggle("dashboard-fechado");
        dashboardToggle.setAttribute("aria-expanded", String(!fechado));
    });
}

// ==============================
// INICIALIZAÇÃO — inalterado
// ==============================

carregarEstoque();
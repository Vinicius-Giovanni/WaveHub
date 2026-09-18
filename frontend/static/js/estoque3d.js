import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";
import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";

const container = document.getElementById("estoque-3d");


// ==============================
// CENA
// ==============================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0xeeeeee);


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
}


// ==============================
// ILUMINAÇÃO — inalterado
// ==============================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1
);

scene.add(ambientLight);


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

        const resultado = construirMapaNiveis(estoque);
        mapaNiveis = resultado.mapaNiveis;
        mapaIndiceRua = construirMapaRuas(estoque);
        mapaEscalaRua = resultado.mapaEscalaRua;

        const geometry = new THREE.BoxGeometry(
            1.5,
            1.2,
            1.5
        );

        const materialOcupada = new THREE.MeshBasicMaterial({
            color: 0x2196f3
        });

        const materialVazia = new THREE.MeshBasicMaterial({
            color: 0xaaaaaa
        });

        const ruasEncontradas = new Set();

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
        }

        cubosVisiveis = todosCubos.slice();

        criarReferenciasRuas([...ruasEncontradas]);
        preencherFiltroRuas([...ruasEncontradas]);

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
// REFERÊNCIAS VISUAIS DE RUA
// Rótulos discretos (sprites) no início de cada corredor,
// usando a mesma coordenada Z já usada pelos cubos.
// ==============================

function criarRotuloTexto(texto) {

    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(texto, canvas.width / 2, canvas.height / 2);

    const textura = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({
        map: textura,
        depthTest: false
    });

    const sprite = new THREE.Sprite(material);
    sprite.scale.set(6, 1.5, 1);

    return sprite;
}

function criarReferenciasRuas(ruas) {

    ruas.forEach(rua => {
        const ruaIndice = mapaIndiceRua.get(rua) ?? 0;
        const rotulo = criarRotuloTexto(`Rua ${rua}`);

        rotulo.position.set(-4, 1, ruaIndice * ESPACO_RUA);
        scene.add(rotulo);
    });
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

        const visivel = passaStatus && passaRua;

        cubo.visible = visivel;

        if (visivel) cubosVisiveis.push(cubo);
    }
}

botoesFiltro.forEach(botao => {
    botao.addEventListener("click", () => {
        botoesFiltro.forEach(b => b.classList.remove("ativo"));
        botao.classList.add("ativo");

        filtroStatusAtual = botao.dataset.filtro;
        aplicarFiltros();
    });
});

function preencherFiltroRuas(ruas) {

    if (!filtroRuaSelect) return;

    const ruasOrdenadas = ruas.slice().sort();

    ruasOrdenadas.forEach(rua => {
        const option = document.createElement("option");
        option.value = rua;
        option.textContent = `Rua ${rua}`;
        filtroRuaSelect.appendChild(option);
    });
}

if (filtroRuaSelect) {
    filtroRuaSelect.addEventListener("change", () => {
        filtroRuaAtual = filtroRuaSelect.value;
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
// INICIALIZAÇÃO — inalterado
// ==============================

carregarEstoque();
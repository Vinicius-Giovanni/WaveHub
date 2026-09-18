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
    antialias: true
});

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

container.appendChild(renderer.domElement);


// ==============================
// CONTROLES (estilo FPS / jogo)
// ==============================

const controls = new PointerLockControls(camera, renderer.domElement);

// Overlay simples de "clique para entrar" — estilize via CSS se quiser
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
// MOVIMENTAÇÃO (WASD) — anda enquanto olha com o mouse
// ==============================

const MOVE_SPEED = 40; // unidades por segundo — ajuste ao gosto

const teclas = {
    frente: false,
    tras: false,
    esquerda: false,
    direita: false,
    subir: false,
    descer: false
};

document.addEventListener("keydown", (event) => {
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

    const distancia = MOVE_SPEED * deltaTime;

    if (teclas.frente) controls.moveForward(distancia);
    if (teclas.tras) controls.moveForward(-distancia);
    if (teclas.direita) controls.moveRight(distancia);
    if (teclas.esquerda) controls.moveRight(-distancia);

    if (teclas.subir) camera.position.y += distancia;
    if (teclas.descer) camera.position.y -= distancia;
}


// ==============================
// ILUMINAÇÃO
// ==============================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1
);

scene.add(ambientLight);


// ==============================
// ESTOQUE
// ==============================

async function carregarEstoque() {

    try {

        const response = await fetch("/api/estoque");

        if (!response.ok) {
            throw new Error("Erro ao carregar estoque");
        }

        const estoque = await response.json();

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

        const ESPACO_LOCAL = 2;
        const ESPACO_NIVEL = 1.5;
        const ESPACO_RUA = 8;

        for (const posicao of estoque) {

            const material =
                posicao.status === "ocupada"
                    ? materialOcupada
                    : materialVazia;

            const cubo = new THREE.Mesh(
                geometry,
                material
            );

            const rua =
                parseInt(posicao.rua) || 0;

            const local =
                parseInt(posicao.local) || 0;

            const nivel =
                parseInt(posicao.nivel) || 0;

            cubo.position.set(
                local * ESPACO_LOCAL,
                nivel * ESPACO_NIVEL,
                rua * ESPACO_RUA
            );

            scene.add(cubo);
        }

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
// RESIZE
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
// ZOOM / AVANÇAR (velocidade adaptativa)
// ==============================
// Rápido em distâncias grandes (proporcional), mas nunca fica lento perto
// do cubo, pois há um passo mínimo garantido (ZOOM_MIN_STEP).

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

    // Evita que o passo jogue a câmera "para dentro" do cubo além do limite
    if (distanciaOrigem - passo < MIN_DISTANCE_ORIGEM && passo > 0) {
        return;
    }

    camera.position.addScaledVector(direction, passo);

}, { passive: false });


// ==============================
// ANIMAÇÃO
// ==============================

const relogio = new THREE.Clock();

function animate() {

    requestAnimationFrame(animate);

    const deltaTime = relogio.getDelta();

    atualizarMovimento(deltaTime);

    renderer.render(
        scene,
        camera
    );
}

animate();


// ==============================
// INICIALIZAÇÃO
// ==============================

carregarEstoque();
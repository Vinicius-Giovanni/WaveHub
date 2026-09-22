import { PointerLockControls } from "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/controls/PointerLockControls.js";
import { MOVIMENTO } from "./Config.js";

/**
 * Encapsula o PointerLockControls + WASD.
 * Uso:
 *  const controlesFPS = new ControlesPrimeiraPessoa(camera, renderer, container);
 * 
 * // dentro do loop de animação:
 * controlesFPS.atualizar(deltaTime);
 */

export class ControlesPrimeiraPessoa {

    constructor(camera, renderer, container) {
        this.camera = camera;
        this.controls = new PointerLockControls(camera, renderer.domElement);

        this.teclas = {
            frente: false,
            tras: false,
            esquerda: false,
            direita: false,
            subir: false,
            descer: false
        };

        this._criarOverlay(container);
        this._registrarTeclado();
    }

    get isLocked() {
        return this.controls.isLocked;
    }

    atualizar(deltaTime) {

        if (!this.controls.isLocked) return;

        const distancia = MOVIMENTO.velocidade * deltaTime;

        if (this.teclas.frente) this.controls.moveForward(distancia);
        if (this.teclas.tras) this.controls.moveForward(-distancia);
        if (this.teclas.direita) this.controls.moveRight(distancia);
        if (this.teclas.esquerda) this.controls.moveRight(-distancia);

        if (this.teclas.subir) this.camera.position.y += distancia;
        if (this.teclas.descer) this.camera.position.y -= distancia;
    }

    _criarOverlay(container) {

        const overlay = document.createElement("div");
        overlay.textContent = "Clique para olhar em volta (Esc para sair";
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

        container.appendChild(overlay);

        overlay.addEventListener("click", () => {
            const resultado = this.controls.lock();
            if (resultado && typeof resultado.catch === "function") {
                resultado.catch(() => {
                    // Cooldown do navegador após unlock recente. Ignora silenciosamente.
                });
            }
        });

        this.controls.addEventListener("lock", () => {
            overlay.style.display = "none";
        });

        this.controls.addEventListener("unlock", () => {
            overlay.style.display = "flex";
        });
    }

    _digitandoEmCampo() {
        const ativo = document.activeElement;
        return ativo && (ativo.tagName === "INPUT" || ativo.tagName === "TEXTAREA");
    }

    _registrarTeclado() {

        document.addEventListener("keydown", (evento) => {
            if (this._digitandoEmCampo()) return;
            this._definirTecla(evento.code, true);
        });

        document.addEventListener("keyup", (evento) => {
            if (this._digitandoEmCampo()) return;
            this._definirTecla(evento.code, false);
        });
    }

    _definirTecla(codigo, valor) {
        switch (codigo) {
            case "KeyW": this.teclas.frente = valor; break;
            case "KeyS": this.teclas.tras = valor; break;
            case "KeyA": this.teclas.esquerda = valor; break;
            case "KeyD": this.teclas.direita = valor; break;
            case "Space": this.teclas.subir = valor; break;
            case "ShiftLeft": this.teclas.descer = valor; break;
        }
    }
}
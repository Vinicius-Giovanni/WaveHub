import * as THREE from "three";
import { ZOOM } from "./Config.js";

/**
 * Zoom rápido em distâncias grandes (proporcional) com piso mínimo
 * garantido para não ficar lento perto de um cubo.
 */

export function ativarZoomAdaptativo(camera, renderer) {

    const direcao = new THREE.Vector3();

    renderer.domElement.addEventListener("wheel", (evento) => {
        evento.preventDefault();

        camera.getWorldDirection(direcao);

        const distanciaOrigem = camera.position.length();
        const magnitude = Math.max(distanciaOrigem * ZOOM.percentual, ZOOM.passoMinimo);
        const passo = Math.sign(evento.deltaY) * magnitude;

        if (distanciaOrigem - passo < ZOOM.distanciaMinimaOrigem && passo > 0) {
            return;
        }

        camera.position.addScaledVector(direcao, passo);

    }, { passive: false });
}
// ENDPOINTS

export const API_LAYOUT_URL = "/api/layout";
export const API_ESTOQUE_URL = "/api/estoque";

// MOVIMENTAÇÃO (WASD)
export const MOVIMENTO = {
    velocidade: 40 //unidades por segundo
}

// ZOOM (velocidade adaptativa - ver Zoomadaptativo.js

export const ZOOM = {
    passoMinimo: 3,
    percentual: 0.15,
    distanciaMinimaOrigem: 0.3
};

// CORES POR STATUS

export const CORES = {
    ocupada: 0x1565c0,
    vazia: 0xcfd3d6
}
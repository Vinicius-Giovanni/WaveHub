import * as THREE from "three";

export function criarCena() {
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8eaed); // COR BACKGROUND
    //scene.fog = new THREE.Fog(0xe8eaed, 80, 400); // FOG

    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(luzAmbiente);

    const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.8);
    luzDirecional.position.set(0, 0, 20);
    luzDirecional.castShadow = true;
    scene.add(luzDirecional);

    const grid = new THREE.GridHelper(2000, 1000, 0xb0b4b8, 0xd0d3d6);
    grid.material.transparent = true;
    grid.material.opacity = 0.5; // ajuste o valor 0 a 1
    grid.position.set(800, 0, 0, 0);
    scene.add(grid);

    return scene;
}

export function criarCamera(container) {
    
    const camera = new THREE.PerspectiveCamera(
        60,
        container.clientWidth / container.clientHeight,
        0.1,
        10000
    );

    camera.position.set(10, 6, 16);

    return camera;
}

export function criarRenderer(container) {

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // sombra mais suave (opcional)

    container.style.position = "relative";
    container.appendChild(renderer.domElement);

    return renderer;
}

export function ativarResizeAutomatico(container, camera, renderer) {

    window.addEventListener("resize", () => {

        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
    });
}
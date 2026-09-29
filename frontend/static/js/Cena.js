import * as THREE from "three";

export function criarCena() {
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8eaed); // COR BACKGROUND
    //scene.fog = new THREE.Fog(0xe8eaed, 80, 400); // FOG

    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(luzAmbiente);

    const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.8);
    luzDirecional.position.set(2, 8, 2);
    luzDirecional.castShadow = true;
    scene.add(luzDirecional);

    const grid = new THREE.GridHelper(2000, 1000, 0xb0b4b8, 0xd0d3d6);
    grid.material.transparent = true;
    grid.material.opacity = 0.5; // ajuste o valor 0 a 1
    grid.position.set(800, 0, 0);
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

    // LANTERNA FILHA DA CAMERA
    const lanterna = new THREE.SpotLight(0xffffff, 9.0, 500, Math.PI / 6, 0.6, 1);

    lanterna.position.set(0.2, -0.2, -0.1);

    lanterna.castShadow = true;
    lanterna.shadow.mapSize.width = 1024;
    lanterna.shadow.mapSize.height = 1024;
    lanterna.shadow.camera.near = 0.5;
    lanterna.shadow.camera.far = 150;

    // add a lanterna como filha da cam
    camera.add(lanterna);

    // alvo invisivel
    const alvoLanterna = new THREE.Object3D();
    alvoLanterna.position.set(0, 0, -5); // 5 unidade
    camera.add(alvoLanterna);

    lanterna.target = alvoLanterna;

    // ref de cam
    camera.userData.lanterna = lanterna;

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
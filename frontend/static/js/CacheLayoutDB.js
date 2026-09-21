// CacheLayoutDB.js
const DB_NAME = "estoque3d_cache";
const STORE_NAME = "layout";
const VERSAO = 1;

function abrirDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, VERSAO);

        request.onupgradeneeded = () => {
            request.result.createObjectStore(STORE_NAME);
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function obterLayoutCache() {
    const db = await abrirDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get("layout");
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
    });
}

export async function salvarLayoutCache(layout) {
    const db = await abrirDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).put(layout, "layout");
        tx.oncomplete = () => resolve();
    });
}

export async function limparLayoutCache() {
    const db = await abrirDB();
    return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, "readwrite");
        tx.objectStore(STORE_NAME).delete("layout");
        tx.oncomplete = () => resolve();
    });
}
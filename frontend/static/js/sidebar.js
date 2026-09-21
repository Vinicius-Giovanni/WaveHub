const sidebar = document.getElementById("sidebar")
const sidebarToggle = document.getElementById("sidebarToggle")
const sidebarOverlay = document.getElementById("sidebarOverlay")

const icon = sidebarToggle.querySelector(".material-symbols-outlined")

sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("open")
    sidebarOverlay.classList.toggle("active")

    const isOpen = sidebar.classList.contains("open")

    if (isOpen) {
        icon.textContent = "close"
        sidebarToggle.setAttribute("aria-label", "Fechar menu")
    } else {
        icon.textContent = "menu"
        sidebarToggle.setAttribute("aria-label", "Abrir menu");
    }
})

sidebarOverlay.addEventListener("click", () => {
    sidebar.classList.remove("open")
    sidebarOverlay.classList.remove("active")

    icon.textContent = "menu"
    sidebarToggle.setAttribute("aria-label", "Abrir menu")
})
const sidebar = document.getElementById("sidebar")
const sidebarToggle = document.getElementById("sidebarToggle")
const sidebarClose = document.getElementById("sidebarClose")
const sidebarOverlay = document.getElementById("sidebarOverlay")

sidebarToggle.addEventListener("click", () => {
    sidebar.classList.add("open")
    sidebarOverlay.classList.add("active")
})

function closeSidebar() {
    sidebar.classList.remove("open")
    sidebarOverlay.classList.remove("active")
}

sidebarClose.addEventListener("click", () => {
    closeSidebar()
})

sidebarOverlay.addEventListener("click", () => {
    closeSidebar()
})
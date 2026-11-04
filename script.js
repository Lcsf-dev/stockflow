// Navegação entre as páginas

function destacarPaginaAtual() {
    const caminhoPagina = window.location.pathname;
    const ultimaBarra = caminhoPagina.lastIndexOf("/");
    let paginaAtual = caminhoPagina.substring(ultimaBarra + 1);

    if (paginaAtual === "") {
        paginaAtual = "index.html";
    }

    const linksMenu = document.querySelectorAll("#menu-principal .nav-link");

    for (let indice = 0; indice < linksMenu.length; indice++) {
        const linkMenu = linksMenu[indice];

        if (linkMenu.getAttribute("href") === paginaAtual) {
            linkMenu.classList.add("active");
            linkMenu.setAttribute("aria-current", "page");
        } else {
            linkMenu.classList.remove("active");
            linkMenu.removeAttribute("aria-current");
        }
    }

    console.log("Página carregada no StockFlow:", paginaAtual);
}

destacarPaginaAtual();

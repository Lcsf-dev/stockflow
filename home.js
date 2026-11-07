/*
 * STOCKFLOW — CARROSSEL DA PÁGINA INÍCIO
 * O Bootstrap troca as imagens; este arquivo atualiza o contador.
 * A apresentação não precisa carregar nem alterar os dados do estoque.
 */

// 1. Localiza o carrossel pelo id definido no index.html.
const carrosselInicio = document.getElementById("carrossel-recursos");

// 2. Configura a troca manual se o carrossel e o Bootstrap estiverem disponíveis.
if (carrosselInicio && typeof bootstrap !== "undefined") {
    new bootstrap.Carousel(carrosselInicio, { interval: false, ride: false });

    // Conta os slides para mostrar a posição no formato "1 de 3".
    const totalSlides = carrosselInicio.querySelectorAll(".carousel-item").length;

    // 3. Atualiza o contador depois de cada troca de imagem.
    // A posição começa em zero; somamos 1 para mostrar a posição ao usuário.
    carrosselInicio.addEventListener("slid.bs.carousel", function (evento) {
        document.getElementById("status-carrossel").textContent = (evento.to + 1) + " de " + totalSlides;
    });
}

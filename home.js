// A apresentação não precisa carregar nem alterar os dados do estoque.
const carrosselInicio = document.getElementById("carrossel-recursos");

if (carrosselInicio && typeof bootstrap !== "undefined") {
    new bootstrap.Carousel(carrosselInicio, { interval: false, ride: false });
    const totalSlides = carrosselInicio.querySelectorAll(".carousel-item").length;

    carrosselInicio.addEventListener("slid.bs.carousel", function (evento) {
        document.getElementById("status-carrossel").textContent = (evento.to + 1) + " de " + totalSlides;
    });
}

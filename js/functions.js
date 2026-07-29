const indicator = document.querySelector(".nav-indicator");
const selected = document.querySelector(".bottom-bar .selectedBTN");

if (indicator && selected) {
    indicator.style.transform = `translateX(${selected.offsetLeft}px)`;
}
import { seeGame } from "./main.js";

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const container = document.getElementById('cart-container');
    container.innerHTML = '';

    let total = 0;

    if (cart.length === 0) {
        container.innerHTML = `<p class="empty">Seu carrinho está vazio.</p>`;
        return;
    }

    cart.forEach((game, index) => {
        const card = document.createElement('div');
        card.classList.add('cart-card');
        card.onclick = () => seeGame(game.id);

        card.innerHTML = `
            <img src="${game.image}" alt="${game.name}">
            <div class="cart-info">
                <h2>${game.name}</h2>
                <p>${game.description}</p>
                <p class="price">R$ ${game.price.toFixed(2)}</p>
                <button class="remove-btn" data-index="${index}">Remover</button>
            </div>
        `;

        container.appendChild(card);
        total += game.price;
    });

    const summary = document.createElement('div');
    summary.classList.add('summary');

    summary.innerHTML = `
        <h3>Total: R$ ${total.toFixed(2)}</h3>
        <button id="end-btn">Finalizar Pedido</button>
    `;

    container.appendChild(summary);

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation(); // Impede que o clique afete o div pai
            removerItem(parseInt(btn.dataset.index));
        });
    });
    
    document.getElementById("end-btn").onclick = paymentAddress;
    localStorage.setItem("totalCompra", total); // valorTotal = número

}

function paymentAddress() {
    window.location.href = "payment.html";
}

function removerItem(index) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}


window.addEventListener('DOMContentLoaded', loadCart);

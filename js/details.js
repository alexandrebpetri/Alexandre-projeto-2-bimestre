import { loadGamesFromAPI, games } from "../data/data.js";

function loadDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get('id'), 10);

  loadGamesFromAPI().then(() => {
    const game = games.find(j => j.id === id);
    if (game) {
      gamesContainer.innerHTML = `
      <div class="left-side">
        <h1>${game.name}</h1>
        <img src="${game.image}" alt="${game.name}">
      </div>
      <div class="right-side">
        <p class="descricao">Descrição: ${game.description}</p>
        <p class="categoria">Categoria: ${game.category}</p>
        <p id="gamePrice">${game.price === 0 ? 'Grátis' : 'Preço: R$ ' + game.price.toFixed(2)}</p>
        <button id="addCart">Adicionar ao Carrinho</button>
      </div>
    `;    

      const CartButton = document.getElementById('addCart');
      CartButton.addEventListener('click', () => AddToCart(game));
    } else {
      showMessage("Jogo não encontrado!");
    }
  });
}

function AddToCart(game) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  const gameExisting = cart.some(item => item.name === game.name);

  if (gameExisting) {
      showMessage("Este jogo já está no carrinho.");
      return;
  }

  cart.push(game);
  localStorage.setItem('cart', JSON.stringify(cart));

  showMessage("Jogo adicionado ao carrinho!");
}

function showMessage(text) {
    const div = document.createElement("div");
    div.className = "floating-message";
    div.innerText = text;
    document.body.appendChild(div);
  
    setTimeout(() => {
      div.remove();
    }, 2000);
  }

loadDetails();


import { loadGamesFromAPI, games } from "../data/data.js";

function formatCategories(categories) {
  if (!categories || categories.length === 0) return 'Nenhuma';
  // Suporta array de objetos ou strings
  return categories.map(cat => typeof cat === 'string' ? cat : (cat && cat.name ? cat.name : '')).filter(Boolean).join(', ');
}

function formatDeveloper(developer) {
  if (!developer) return 'Desconhecido';
  if (typeof developer === 'string') return developer;
  return developer.name || 'Desconhecido';
}

function formatDate(dateStr) {
  if (!dateStr) return 'Data não informada';
  const d = new Date(dateStr);
  if (isNaN(d)) return 'Data inválida';
  return d.toLocaleDateString('pt-BR');
}

function loadDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = parseInt(urlParams.get('id'), 10);
  const gamesContainer = document.getElementById('gamesContainer');

  loadGamesFromAPI().then(() => {
    const game = games.find(j => j.id === id);
    if (game) {
      gamesContainer.innerHTML = `
        <div class="details-main">
          <div class="details-image">
            <img src="${game.image || 'assets/no-image.png'}" alt="${game.name}">
          </div>
          <div class="details-info">
            <h1>${game.name}</h1>
            <p class="descricao"><b>Descrição:</b> ${game.description || 'Sem descrição.'}</p>
            <p class="categoria"><b>Categorias:</b> ${formatCategories(game.categories || game.category)}</p>
            <p class="developer"><b>Desenvolvedor:</b> ${formatDeveloper(game.developer)}</p>
            <p class="release-date"><b>Lançamento:</b> ${formatDate(game.release_date)}</p>
            <p id="gamePrice"><b>Preço:</b> ${game.price === 0 ? 'Grátis' : 'R$ ' + (game.price ? Number(game.price).toFixed(2) : '0,00')}</p>
            <button id="addCart">Adicionar ao Carrinho</button>
          </div>
        </div>
      `;
      const CartButton = document.getElementById('addCart');
      CartButton.addEventListener('click', () => AddToCart(game));
    } else {
      gamesContainer.innerHTML = '<div class="not-found">Jogo não encontrado!</div>';
    }
  });
}

function AddToCart(game) {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const gameExisting = cart.some(item => item.id === game.id);
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

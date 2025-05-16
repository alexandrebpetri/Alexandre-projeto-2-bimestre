import { loadCSV, games } from '../data/data.js';

function loadGames(list = games) {
  const container = document.getElementById("lista-jogos");
  container.innerHTML = ""; // Limpa a lista antes de renderizar

  for (let i = 0; i < list.length; i++) {
    const game = list[i];
    let priceDisplay = game.price === 0 ? "Grátis" : `R$ ${game.price.toFixed(2)}`;

    const card = document.createElement("div");
    card.className = "game-card";
    card.onclick = () => seeGame(game.id);
    card.innerHTML = `
      <img src="${game.image}" alt="${game.name}" />
      <h2>${game.name}</h2>
      <p>${priceDisplay}</p>
    `;
    container.appendChild(card);
  }
}


function searchGames(text) {
    const term = text.toLowerCase();
    const filtered = games.filter(game => game.name.toLowerCase().includes(term));
    loadGames(filtered);  
}

  export function seeGame(id) {
    window.location.href = `details.html?id=${id}`;
  }
  
  // Deixar visível globalmente:
  window.seeGame = seeGame;
  window.searchGames = searchGames;

  
  // Primeiro carregar o CSV, depois montar a tela
  window.onload = () => {
    loadCSV().then(() => {
      loadGames();
    });
  };
  
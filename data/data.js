import { Game } from './table.js';

export let games = [];

export function loadGamesFromAPI() {
  return fetch('http://localhost:3000/games') // Altere a URL se estiver em produção
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar os jogos da API');
      }
      return response.json();
    })
    .then(data => {
      games = data.map(item => new Game(
        parseInt(item.id),
        item.name,
        item.image,
        item.description,
        parseFloat(item.price),
        item.category
      ));
    })
    .catch(error => {
      console.error('Erro ao carregar os jogos:', error);
    });
}

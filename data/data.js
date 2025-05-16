import { Game } from './table.js';

export let games = [];

export function loadCSV() {
  return fetch('data/games.csv')
    .then(response => {
      if (!response.ok) {
        throw new Error('Erro ao carregar o CSV');
      }
      return response.text();
    })
    .then(csv => {
      const strings = csv.split('\n');
      for (let i = 0; i < strings.length; i++) { 
        const string = strings[i].trim();
        if (string) {
          const data = string.split(';');
          if (data.length >= 6) {
            const game = new Game(
              parseInt(data[0]),
              data[1],
              data[2],
              data[3],
              parseFloat(data[4]),
              data[5]
            );
            games.push(game);
          }
        }
      }
    })
    .catch(error => {
      console.error('Erro ao carregar o CSV:', error);
    });
}
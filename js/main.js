import { loadGamesFromAPI, games } from '../data/data.js';

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

window.seeGame = seeGame;
window.searchGames = searchGames;

// Carrega os jogos da API e monta os cards
window.onload = () => {
  loadGamesFromAPI().then(() => {
    loadGames();
  });
};

// Função para abrir o card ao clicar na foto do usuário
document.getElementById('user').onclick = async function() {
  const overlay = document.getElementById('user-card-overlay');
  overlay.style.display = 'flex';

  // Busca dados do usuário logado
  const res = await fetch('http://localhost:3000/auth/me', { credentials: 'include' });
  if (res.ok) {
    const user = await res.json();
    document.getElementById('user-email').textContent = user.email;
    document.getElementById('user-nick').textContent = user.nickname;
  }
  // Reset campos
  document.getElementById('delete-confirm-fields').style.display = 'none';
  document.getElementById('delete-final-warning').style.display = 'none';
  document.getElementById('user-card-actions').style.display = 'block';
  document.getElementById('delete-password-error').textContent = '';
};

// Fechar o card
document.getElementById('close-user-card').onclick = function() {
  document.getElementById('user-card-overlay').style.display = 'none';
};

// Logout
document.getElementById('logout-btn').onclick = async function() {
  await fetch('http://localhost:3000/auth/logout', { method: 'POST', credentials: 'include' });
  alert('Adeus! E até logo. ;)');
  window.location.href = 'index.html';
};

// Mostrar campos para exclusão de conta
document.getElementById('delete-account-btn').onclick = function() {
  document.getElementById('user-card-actions').style.display = 'none';
  document.getElementById('delete-confirm-fields').style.display = 'block';
  document.getElementById('delete-final-warning').style.display = 'none';
  document.getElementById('delete-password').value = '';
  document.getElementById('delete-password-confirm').value = '';
  document.getElementById('delete-password-error').textContent = '';
};

// Checar senha antes de mostrar aviso final
document.getElementById('delete-check-btn').onclick = async function() {
  const senha = document.getElementById('delete-password').value;
  const senha2 = document.getElementById('delete-password-confirm').value;
  const erro = document.getElementById('delete-password-error');
  erro.textContent = '';

  if (!senha || !senha2) {
    erro.textContent = 'Preencha ambos os campos.';
    return;
  }
  if (senha !== senha2) {
    erro.textContent = 'As senhas não coincidem.';
    return;
  }

  // Verifica senha no backend
  const res = await fetch('http://localhost:3000/auth/check-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ password: senha })
  });
  if (res.ok) {
    document.getElementById('delete-confirm-fields').style.display = 'none';
    document.getElementById('delete-final-warning').style.display = 'block';
  } else {
    erro.textContent = 'Senha incorreta.';
  }
};

// Botão "Sim" para excluir conta
document.getElementById('delete-final-yes').onclick = async function() {
  await fetch('http://localhost:3000/auth/delete-account', {
    method: 'DELETE',
    credentials: 'include'
  });
  alert('Conta excluída com sucesso!');
  window.location.href = 'index.html';
};

// Botão "Não" para cancelar exclusão
document.getElementById('delete-final-no').onclick = function() {
  window.location.href = 'index.html';
};

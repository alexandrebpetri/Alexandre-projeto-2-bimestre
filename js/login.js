document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const user = document.getElementById('user').value.trim();
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');

  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ user, password })
  });
  const data = await res.json();
  if (res.ok) {
    window.location.href = 'index.html';
  } else {
    errorDiv.textContent = data.error || 'Usuário ou senha inválidos.';
  }
});
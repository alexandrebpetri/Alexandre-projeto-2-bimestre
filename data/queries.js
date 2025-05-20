const pool = require('./db');

// Exemplo de consulta
pool.query('SELECT * FROM games', (err, res) => {
  if (err) {
    console.error('Erro na consulta:', err);
  } else {
    console.log('Resultados:', res.rows);
  }
});

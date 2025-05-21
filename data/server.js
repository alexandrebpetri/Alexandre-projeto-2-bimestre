require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
const port = 3000;

const query = `
SELECT g.id as id, 
g.name as name, 
g.image as image, 
g.description as description, 
g.price as price, 
c.name as category
FROM jurassichub.games g
JOIN jurassichub.category c ON g.category_id = c.id
order by g.id;
`;

// Cria pool de conexão com o banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Neon usa SSL
});

// Teste de conexão
app.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.send(`Conectado ao banco! Hora atual: ${result.rows[0].now}`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao conectar ao banco de dados');
  }
});

// Rota para buscar jogos
app.get('/games', async (req, res) => {
  try {
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao buscar jogos');
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});

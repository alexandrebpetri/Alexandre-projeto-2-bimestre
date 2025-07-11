require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

// Configurações de middleware
app.use(cors());
app.use(express.json());

// Configuração do multer para armazenar arquivos em memória
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ==============================================
// Rotas Básicas
// ==============================================

app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Bem-vindo à API do Jurassic Hub',
    endpoints: {
      categories: '/categories',
      developers: '/developers',
      games: '/games',
      images: '/images'
    }
  });
});

// ==============================================
// Rotas para Category
// ==============================================

app.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

    const newCategory = await prisma.category.create({ data: { name } });
    res.status(201).json(newCategory);
  } catch (error) {
    handleError(res, error, 'criar categoria');
  }
});

app.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { id: 'asc' } });
    res.json(categories);
  } catch (error) {
    handleError(res, error, 'buscar categorias');
  }
});

app.get('/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const category = await prisma.category.findUnique({ where: { id } });

    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json(category);
  } catch (error) {
    handleError(res, error, 'buscar categoria');
  }
});

app.put('/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: { name }
    });
    res.json(updatedCategory);
  } catch (error) {
    handleError(res, error, 'atualizar categoria');
  }
});

app.delete('/categories/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const gameCategories = await prisma.game_category.findMany({
      where: { category_id: id }
    });

    if (gameCategories.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar. Existem jogos associados a esta categoria.' 
      });
    }

    await prisma.category.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'deletar categoria');
  }
});

// ==============================================
// Rotas para Developer
// ==============================================

app.post('/developers', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

    const newDeveloper = await prisma.developer.create({ data: { name } });
    res.status(201).json(newDeveloper);
  } catch (error) {
    handleError(res, error, 'criar desenvolvedor');
  }
});

app.get('/developers', async (req, res) => {
  try {
    const developers = await prisma.developer.findMany({ orderBy: { id: 'asc' } });
    res.json(developers);
  } catch (error) {
    handleError(res, error, 'buscar desenvolvedores');
  }
});

app.get('/developers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const developer = await prisma.developer.findUnique({
      where: { id },
      include: { games: true }
    });

    if (!developer) return res.status(404).json({ error: 'Desenvolvedor não encontrado' });
    res.json(developer);
  } catch (error) {
    handleError(res, error, 'buscar desenvolvedor');
  }
});

app.put('/developers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name } = req.body;

    if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });

    const updatedDeveloper = await prisma.developer.update({
      where: { id },
      data: { name }
    });
    res.json(updatedDeveloper);
  } catch (error) {
    handleError(res, error, 'atualizar desenvolvedor');
  }
});

app.delete('/developers/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const games = await prisma.games.findMany({ where: { developer_id: id } });

    if (games.length > 0) {
      return res.status(400).json({ 
        error: 'Não é possível deletar. Existem jogos associados a este desenvolvedor.' 
      });
    }

    await prisma.developer.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'deletar desenvolvedor');
  }
});

// ==============================================
// Rotas para Games
// ==============================================

app.post('/games', async (req, res) => {
  try {
    const { name, description, price, release_date, developer_id, categories } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    const gameData = {
      name,
      description,
      price: price ? parseFloat(price) : null,
      release_date: release_date ? new Date(release_date) : null,
      developer_id: developer_id ? parseInt(developer_id) : null
    };

    const newGame = await prisma.games.create({ data: gameData });

    if (categories && Array.isArray(categories)) {
      await Promise.all(categories.map(async (categoryId) => {
        await prisma.game_category.create({
          data: {
            game_id: newGame.id,
            category_id: parseInt(categoryId)
          }
        });
      }));
    }

    const fullGame = await getFullGameDetails(newGame.id);
    res.status(201).json(fullGame);
  } catch (error) {
    handleError(res, error, 'criar jogo');
  }
});

app.get('/games', async (req, res) => {
  try {
    const games = await prisma.games.findMany({
      orderBy: { id: 'asc' },
      include: {
        developer: true,
        game_category: { include: { category: true } },
        image_games_image_idToimage: true
      }
    });

    const formatted = games.map(formatGameData);
    res.json(formatted);
  } catch (error) {
    handleError(res, error, 'buscar jogos');
  }
});

app.get('/games/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const fullGame = await getFullGameDetails(id);

    if (!fullGame) return res.status(404).json({ error: 'Jogo não encontrado' });
    res.json(fullGame);
  } catch (error) {
    handleError(res, error, 'buscar jogo');
  }
});

app.put('/games/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, release_date, developer_id, categories } = req.body;

    const gameData = {
      name,
      description,
      price: price ? parseFloat(price) : null,
      release_date: release_date ? new Date(release_date) : null,
      developer_id: developer_id ? parseInt(developer_id) : null
    };

    await prisma.games.update({
      where: { id },
      data: gameData
    });

    if (categories && Array.isArray(categories)) {
      await prisma.game_category.deleteMany({ where: { game_id: id } });

      await Promise.all(categories.map(async (categoryId) => {
        await prisma.game_category.create({
          data: {
            game_id: id,
            category_id: parseInt(categoryId)
          }
        });
      }));
    }

    const fullGame = await getFullGameDetails(id);
    res.json(fullGame);
  } catch (error) {
    handleError(res, error, 'atualizar jogo');
  }
});

app.delete('/games/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await prisma.game_category.deleteMany({ where: { game_id: id } });
    await prisma.games.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'deletar jogo');
  }
});

// ==============================================
// Rotas para Game_Category
// ==============================================

app.post('/games/:gameId/categories/:categoryId', async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const categoryId = parseInt(req.params.categoryId);

    const game = await prisma.games.findUnique({ where: { id: gameId } });
    if (!game) return res.status(404).json({ error: 'Jogo não encontrado' });

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });

    const existing = await prisma.game_category.findUnique({
      where: { game_id_category_id: { game_id: gameId, category_id: categoryId } }
    });

    if (existing) {
      return res.status(400).json({ error: 'Esta categoria já está associada ao jogo' });
    }

    const newAssociation = await prisma.game_category.create({
      data: { game_id: gameId, category_id: categoryId }
    });

    res.status(201).json(newAssociation);
  } catch (error) {
    handleError(res, error, 'associar categoria ao jogo');
  }
});

app.delete('/games/:gameId/categories/:categoryId', async (req, res) => {
  try {
    const gameId = parseInt(req.params.gameId);
    const categoryId = parseInt(req.params.categoryId);

    await prisma.game_category.delete({
      where: { game_id_category_id: { game_id: gameId, category_id: categoryId } }
    });

    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'remover categoria do jogo');
  }
});

// ==============================================
// Rotas para Image
// ==============================================

app.get('/images', async (req, res) => {
  try {
    const images = await prisma.image.findMany({
      include: {
        games_image_game_idTogames: { select: { id: true, name: true } }
      }
    });

    const formatted = images.map(img => ({
      id: img.id,
      game_id: img.game_id,
      game_name: img.games_image_game_idTogames?.name || null,
      size_kb: Math.round(img.data.length / 1024)
    }));

    res.json(formatted);
  } catch (error) {
    handleError(res, error, 'buscar imagens');
  }
});

app.post('/upload/:gameId', upload.single('image'), async (req, res) => {
  try {
    const { gameId } = req.params;
    const imageBuffer = req.file?.buffer;

    if (!gameId || isNaN(gameId)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const game = await prisma.games.findUnique({ where: { id: parseInt(gameId) } });
    if (!game) return res.status(404).json({ error: 'Jogo não encontrado' });

    const existingImage = await prisma.image.findFirst({ where: { game_id: game.id } });

    let newImage;
    if (existingImage) {
      newImage = await prisma.image.update({
        where: { id: existingImage.id },
        data: { data: imageBuffer }
      });
    } else {
      newImage = await prisma.image.create({
        data: { data: imageBuffer, game_id: game.id }
      });

      await prisma.games.update({
        where: { id: game.id },
        data: { image_id: newImage.id }
      });
    }

    res.status(200).json({ 
      message: 'Imagem enviada com sucesso', 
      imageId: newImage.id,
      gameId: game.id
    });
  } catch (error) {
    handleError(res, error, 'salvar imagem');
  }
});

app.get('/image/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const image = await prisma.image.findUnique({ where: { id } });

    if (!image || !image.data) {
      return res.status(404).send('Imagem não encontrada');
    }

    res.setHeader('Content-Type', 'image/jpeg');
    res.send(image.data);
  } catch (error) {
    handleError(res, error, 'carregar imagem', false);
  }
});

app.put('/images/:id/reassign', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { game_id } = req.body;

    if (!game_id || isNaN(game_id)) {
      return res.status(400).json({ error: 'ID de jogo inválido' });
    }

    const game = await prisma.games.findUnique({ where: { id: game_id } });
    if (!game) return res.status(404).json({ error: 'Jogo não encontrado' });

    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) return res.status(404).json({ error: 'Imagem não encontrada' });

    if (image.game_id) {
      await prisma.games.updateMany({
        where: { image_id: id },
        data: { image_id: null }
      });
    }

    const updatedImage = await prisma.image.update({
      where: { id },
      data: { game_id }
    });

    await prisma.games.update({
      where: { id: game_id },
      data: { image_id: updatedImage.id }
    });

    res.json({ 
      message: 'Imagem reassociada com sucesso',
      image: updatedImage
    });
  } catch (error) {
    handleError(res, error, 'reassociar imagem');
  }
});

app.delete('/images/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const image = await prisma.image.findUnique({
      where: { id },
      select: { game_id: true }
    });

    if (image?.game_id) {
      await prisma.games.update({
        where: { id: image.game_id },
        data: { image_id: null }
      });
    }

    await prisma.image.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    handleError(res, error, 'excluir imagem');
  }
});

// ==============================================
// Funções auxiliares
// ==============================================

async function getFullGameDetails(gameId) {
  return await prisma.games.findUnique({
    where: { id: gameId },
    include: {
      developer: true,
      game_category: { include: { category: true } },
      image_games_image_idToimage: true
    }
  });
}

function formatGameData(game) {
  return {
    id: game.id,
    name: game.name,
    image: game.image_games_image_idToimage && game.image_games_image_idToimage.data
      ? `data:image/jpeg;base64,${Buffer.from(game.image_games_image_idToimage.data).toString('base64')}`
      : null,
    description: game.description,
    price: game.price,
    release_date: game.release_date,
    developer: game.developer,
    categories: game.game_category.map(gc => gc.category.name)
  };
}

function handleError(res, error, action, jsonResponse = true) {
  console.error(`Erro ao ${action}:`, error);
  const errorMessage = error.message || `Erro ao ${action}`;
  
  if (jsonResponse) {
    res.status(500).json({ error: errorMessage });
  } else {
    res.status(500).send(errorMessage);
  }
}

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
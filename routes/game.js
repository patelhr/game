const express = require('express');
const gameController = require('../controllers/game');
const router = express.Router();

router.get('', gameController.getGames);

router.post( '',
  gameController.createGame
);

router.get('/:gameId', gameController.getGame);

router.put(
  '/:gameId',
  gameController.updateGame
);

router.delete('/:gameId', gameController.deleteGame);

router.post( '/result/:userId',
  gameController.updateGameResult
);

module.exports = router;

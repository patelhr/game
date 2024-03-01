const express = require('express');
const sessionController = require('../controllers/session');
const router = express.Router();

router.post( '/:gameId',
  sessionController.createSession
);

router.get('/:sessionId', sessionController.getSession);

router.put(
  '/:sessionId',
  sessionController.updateSession
);

router.delete('/:sessionId', sessionController.deleteSession);


module.exports = router;

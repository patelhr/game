const fs = require("fs");

const Game = require("../models/game");
const Session = require("../models/session");

/**
 * Create session in game
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.createSession = (req, res, next) => {
  const gameId = req.params.gameId;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const potValue = parseInt(req.body.potValue);
  let game;
  let session;
  Game.findById(gameId)
    .then((res) => {
      if (!res) {
        const error = new Error("Could not find game.");
        error.statusCode = 404;
        throw error;
      }
      game = res;
      const temp = new Session({
        startTime:startTime,
        endTime:endTime,
        potValue:potValue,
        game:res
      });
      return temp.save();
    })
    .then((res)=>{
       session=res;
       game.sessions = [...game.sessions, res]
       return game.save();
    })
    .then(()=>{
        res.status(200).json({ message: "Session created.", session: session });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * Get single session
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.getSession = (req, res, next) => {
  const sessionId = req.params.sessionId;
  Session.findById(sessionId)
    .then((session) => {
      if (!session) {
        const error = new Error("Could not find session.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Session fetched.", session: session });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * Update session
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.updateSession = (req, res, next) => {
  const sessionId = req.params.sessionId;
  const startTime = req.body.startTime;
  const endTime = req.body.endTime;
  const potValue = parseInt(req.body.potValue);
  Session.findById(sessionId)
    .then((res) => {
      if (!res) {
        const error = new Error("Could not find session.");
        error.statusCode = 404;
        throw error;
      }
      res.startTime = startTime;
      res.endTime = endTime;
      res.potValue = potValue;
      return res.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Session updated!", session: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * Delete session
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.deleteSession = (req, res, next) => {
  const sessionId = req.params.sessionId;
  Session.findById(sessionId)
    .then((res) => {
      if (!res) {
        const error = new Error("Could not find session.");
        error.statusCode = 404;
        throw error;
      }
      return Session.findByIdAndRemove(sessionId);
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted session." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

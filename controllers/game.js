const fs = require("fs");

const Game = require("../models/game");
const User = require("../models/user");
const Session = require("../models/session");
const Account = require("../models/account");
const Transaction = require("../models/transaction");

/**
 * Get all games with pagination
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getGames = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 5;
  let totalItems;
  Game.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Game.find()
        .populate("sessions")
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then((games) => {
      res.status(200).json({
        message: "Fetched game successfully.",
        games: games,
        totalItems: totalItems,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * Create game with session
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.createGame = (req, res, next) => {
  const title = req.body.title;
  const reqSession = req.body.session;
  const game = new Game({
    title: title,
  });
  let savedGameId;
  game
    .save()
    .then((result) => {
      savedGameId = result._id;
      let sessions = [];
      for (const session of reqSession) {
        const temp = new Session({
          startTime: session.startTime,
          endTime: session.endTime,
          potValue: session.potValue,
          game: result,
        });
        sessions.push(temp);
      }
      return Session.create(sessions);
    })
    .then((result) => {
      game.sessions = result;
      return game.save();
    })
    .then((x) => {
      res.status(201).json({
        message: "Game created successfully!",
        game: savedGameId,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * Get single game
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.getGame = (req, res, next) => {
  const gameId = req.params.gameId;
  Game.findById(gameId)
    .populate("sessions")
    .then((game) => {
      if (!game) {
        const error = new Error("Could not find game.");
        error.statusCode = 404;
        throw error;
      }
      res.status(200).json({ message: "Game fetched.", game: game });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * Update game
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.updateGame = (req, res, next) => {
  const gameId = req.params.gameId;
  const title = req.body.title;
  Game.findById(gameId)
    .then((game) => {
      if (!game) {
        const error = new Error("Could not find game.");
        error.statusCode = 404;
        throw error;
      }
      game.title = title;
      return game.save();
    })
    .then((result) => {
      res.status(200).json({ message: "Game updated!", game: result });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * Delete game
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.deleteGame = (req, res, next) => {
  const gameId = req.params.gameId;
  Game.findById(gameId)
    .then((game) => {
      if (!game) {
        const error = new Error("Could not find game.");
        error.statusCode = 404;
        throw error;
      }
      game.depopulate("sessions");
      return Game.findByIdAndRemove(gameId);
    })
    .then((result) => {
      res.status(200).json({ message: "Deleted game." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * Update user account according to result
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
exports.updateGameResult = (req, res, next) => {
  const userId = req.params.userId;
  const sessionId = req.body.sessionId;
  const amount = parseInt(req.body.amount);
  let userObj;
  let accountObj;
  let sessionObj;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        const error = new Error("Could not find user.");
        error.statusCode = 404;
        throw error;
      }
      userObj = user;
      return Account.findById(user.account);
    })
    .then((result) => {
      if (!result) {
        const error = new Error("Could not find user account.");
        error.statusCode = 404;
        throw error;
      }
      accountObj = result;
      return Session.findById(sessionId);
    })
    .then(async (result) => {
      if (!result) {
        const error = new Error("Could not find game session.");
        error.statusCode = 404;
        throw error;
      }
      sessionObj = result;
      if (sessionObj.potValue < amount) {
        const error = new Error("Invalid transaction.");
        error.statusCode = 404;
        throw error;
      }
      await updateAmount(accountObj, sessionObj, amount);
      res.status(200).json({ message: "Updated results." });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

/**
 * Update amount with transaction session
 * @param {*} accountObj 
 * @param {*} sessionObj 
 * @param {*} amount 
 */
const updateAmount = async (accountObj, sessionObj, amount) => {
  // Start db session for transaction
  let dbSession = await Account.startSession();
  try {
    // Start transaction 
    dbSession.startTransaction();
    accountObj.totalBalance += parseInt(amount) || 0;
    let transaction = new Transaction({
      amount: amount,
      account: accountObj,
      session: sessionObj,
    });
    // Create transaction for tracking
    transaction.save();
    accountObj.transactions.push(transaction);
    // Update user account balance 
    accountObj.save();
    sessionObj.potValue -= parseInt(amount) || 0;
    sessionObj.transactions.push(transaction);
    // Deduct session pot value 
    sessionObj.save();
    // If all operation succeeded then complete transaction
    await dbSession.commitTransaction();
    console.log("Success.");
  } catch (error) {
    // If any operation failed then rollback transaction.
    await session.abortTransaction();
    throw new Error("Transaction failed.");
  }
  // End db session for transaction
  dbSession.endSession();
};

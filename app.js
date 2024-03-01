const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { url } = require("./config/config.json");

const gameRoutes = require("./routes/game");
const userRoutes = require("./routes/user");
const sessionRoutes = require("./routes/session");

const app = express();

app.use(bodyParser.json()); // application/json

app.use("/game", gameRoutes);
app.use("/user", userRoutes);
app.use("/session", sessionRoutes);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

// Url will got to env variable for simplification I have added here.
mongoose
  .connect(url)
  .then((result) => {
    console.log("Connected to db....");
    app.listen(3000);
  })
  .catch((err) => console.log(err));

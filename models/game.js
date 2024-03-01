const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const gameSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    sessions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Session",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Game", gameSchema);

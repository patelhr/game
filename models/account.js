const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const accountSchema = new Schema(
  {
    totalBalance: {
      type: Number,
      required: true,
    },
    transactions: [
      {
        type: Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);

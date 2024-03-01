const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  account: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
    required: true
  },
  session: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true
  },
},  { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
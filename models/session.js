const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sessionSchema = new Schema({
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  potValue: {
    type: Number,
    required: true
  },
  game: {
    type: Schema.Types.ObjectId,
    ref: 'Game',
    required: true
  },
  transactions: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Transaction'
    }
  ]
},  { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
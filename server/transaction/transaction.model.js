const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    ticker: {type: mongoose.Schema.Types.ObjectId, ref: "Stock"},
    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    howManyStock: Number,
    price: Number,
    total: Number,
    type: {type: String, enum: ["buy", "sell"]},
    date: String,
  },
  {timestamps: true, versionKey: false}
);

module.exports = mongoose.model("Transaction", TransactionSchema);

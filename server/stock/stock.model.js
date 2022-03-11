const mongoose = require("mongoose");

const StockSchema = new mongoose.Schema(
  {
    companyName: String,
    ticker: String,
    price: Number,
    stocks: Number,
    sellStocks: {type: Number, default: 0},
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Stock", StockSchema);

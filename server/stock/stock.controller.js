const res = require("express/lib/response");
const Stock = require("./stock.model");

//store stock detail
exports.store = async (req, res) => {
  try {
    if (
      req.body.companyName &&
      req.body.ticker &&
      req.body.price &&
      req.body.stock
    ) {
      const stock = new Stock();
      stock.companyName = req.body.companyName;
      stock.ticker = req.body.ticker;
      stock.price = req.body.price;
      stock.stocks = req.body.stock;

      await stock.save();

      return res.status(200).json({status: true, message: "Suceess!!", stock});
    } else {
      return res.status(200).json({status: false, message: "Invalid Detail!!"});
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//get stock detail
exports.index = async (req, res) => {
  try {
    const stock = await Stock.aggregate([
      {
        $project: {
          companyName: 1,
          ticker: 1,
          price: 1,
          stocks: 1,
          sellStocks: 1,
          availbleStock: {$subtract: ["$stocks", "$sellStocks"]},
        },
      },
    ]);

    return res.status(200).json({status: true, message: "Success!!", stock});
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error !!",
    });
  }
};

//update stock price in every 5 second
exports.stockPrice = async (req, res) => {
  try {
    const stock = await Stock.find();

    stock.map(async (data) => {
      await Stock.updateOne(
        {_id: data._id},
        {
          $set: {price: Math.floor(Math.random() * (1000 - 100) + 100)},
        }
      );
    });
  } catch (error) {
    console.log(error);
  }
};

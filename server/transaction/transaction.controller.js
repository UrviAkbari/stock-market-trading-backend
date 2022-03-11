const Transaction = require("./transaction.model");
const User = require("../user/user.model");
const Stock = require("../stock/stock.model");

//Buy & sell  Stock history in transaction collection
exports.transaction = async (req, res) => {
  try {
    if (
      req.body.ticker &&
      req.body.user &&
      req.body.price &&
      req.body.stock &&
      req.body.type
    ) {
      debugger;
      const user = await User.findById(req.body.user);
      if (!user) {
        return res
          .status(200)
          .json({status: false, message: "User does not exist!!"});
      }
      const stock = await Stock.findById(req.body.ticker);
      if (!stock) {
        return res
          .status(200)
          .json({status: false, message: "Ticker does not exist!!"});
      }
      let total = req.body.price * req.body.stock;
      if (req.body.type === "buy") {
        if (user.balance < total) {
          return res
            .status(200)
            .json({status: false, message: "Not enough balance!!"});
        }

        if (stock.stocks < req.body.stock) {
          return res
            .status(200)
            .json({status: false, message: "Stocks Are not available!!"});
        }

        user.balance -= total;
        await user.save();

        stock.stocks -= req.body.stock;
        stock.sellStocks += req.body.stock;

        await stock.save();
      }
      let isExist;
      if (req.body.type === "sell") {
        isExist = await Transaction.aggregate([
          {$match: {$and: [{user: user._id}, {ticker: stock._id}]}},
          {
            $group: {
              _id: null,
              buy: {
                $sum: {
                  $cond: [{$eq: ["$type", "buy"]}, "$howManyStock", 0],
                },
              },
              sell: {
                $sum: {
                  $cond: [{$eq: ["$type", "sell"]}, "$howManyStock", 0],
                },
              },
            },
          },
          {
            $project: {
              total: {$subtract: ["$buy", "$sell"]},
            },
          },
        ]);

        const availableStock = isExist[0] ? isExist[0].total : 0;
        if (availableStock < req.body.stock) {
          return res
            .status(200)
            .json({status: false, message: "Not enough stock!!"});
        }

        user.balance += total;
        await user.save();
      }

      const transaction = new Transaction();
      transaction.ticker = req.body.ticker;
      transaction.user = req.body.user;
      transaction.price = req.body.price;
      transaction.howManyStock = req.body.stock;
      transaction.total = total;
      transaction.type = req.body.type;
      transaction.date = new Date().toLocaleString("en-us");

      await transaction.save();

      return res
        .status(200)
        .json({status: true, message: "Success!!", transaction});
    } else {
      return res.status(200).json({
        status: false,
        message: "Invalid Detail!!",
      });
    }
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({status: false, error: error.message || "Internal Server Error!!"});
  }
};

//get user transaction history
exports.getHistory = async (req, res) => {
  try {
    const user = await User.findById(req.query.user);
    if (!user) {
      return res
        .status(200)
        .json({status: false, message: "User does not exist!!"});
    }
    let matchQuery = {};
    if (req.query.type !== "all") {
      matchQuery = {type: req.query.type};
    }
    const transaction = await Transaction.find({
      user: user._id,
      ...matchQuery,
    }).populate("user ticker");

    if (!transaction)
      return res.status(200).json({status: false, message: "not found!!"});

    return res
      .status(200)
      .json({status: true, message: "Success!!", transaction});
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({status: false, error: error.message || "Internal Server Error!!"});
  }
};

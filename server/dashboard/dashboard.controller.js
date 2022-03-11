const User = require("../user/user.model");
const Stock = require("../stock/stock.model");
const io = require("../../index");

exports.dashboard = async (id) => {
  try {
    const user = await User.findById(id);
    if (!user) {
      io.sockets.emit("latestPrice", {
        status: true,
        message: "User does not Exist !!",
      });
    }

    const dashboard = await Stock.aggregate([
      {
        $lookup: {
          from: "transactions",
          localField: "_id",
          foreignField: "ticker",
          pipeline: [
            {
              $match: {
                user: user._id,
              },
            },
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
          ],
          as: "stock",
        },
      },

      {
        $project: {
          companyName: 1,
          ticker: 1,
          price: 1,
          avalilableStocks: "$stocks",
          sellStocks: {$ifNull: ["$sellStocks", 0]},
          stocks: {$add: ["$stocks", {$ifNull: ["$sellStocks", 0]}]},
          userStock: {
            $cond: {
              if: {$gt: [{$size: "$stock.total"}, 0]},
              then: {$first: "$stock.total"},
              else: 0,
            },
          },
          balance: {
            $multiply: [
              {
                $cond: {
                  if: {$gt: [{$size: "$stock.total"}, 0]},
                  then: {$first: "$stock.total"},
                  else: 0,
                },
              },
              "$price",
            ],
          },
        },
      },
    ]);

    io.sockets.emit("latestPrice", {
      status: true,
      message: "Sucess",
      dashboard,
      balance: user.balance,
    });
    // return res.status(200).json({
    //   status: true,
    //   message: "Sucess",
    //   dashboard,
    //   balance: user.balance,
    // });
  } catch (error) {
    console.log(error);
    // return res.status(500).json({
    //   status: false,
    //   error: error.message || "Internal Server Error !!",
    // });
  }
};

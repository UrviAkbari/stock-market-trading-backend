const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const config = require("./config");
const path = require("path");

app.use(cors());
app.use(express.json());

// app.use(express.static(path.join(__dirname, "public")));
app.use("/storage", express.static(path.join(__dirname, "storage")));

//socket io server
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
module.exports = io;

//controller
const {stockPrice} = require("./server/stock/stock.controller");
const {dashboard} = require("./server/dashboard/dashboard.controller");

//stock route
const StockRoute = require("./server/stock/stock.route");
app.use("/stock", StockRoute);

//user route
const UserRoute = require("./server/user/user.route");
app.use("/user", UserRoute);

//transaction route
const TransactionRoute = require("./server/transaction/transaction.route");
app.use("/transaction", TransactionRoute);

//dashboard Route
const DashboardRoute = require("./server/dashboard/dashboard.route");
app.use("/dashboard", DashboardRoute);

//mongodb connection
mongoose.connect(
  `mongodb+srv://${config.DB_USERNAME}:${config.DB_PASSWORD}@cluster0.g6hbh.mongodb.net/${config.DATABASE_NAME}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("MONGO: successfully connected to db");

  setInterval(() => {
    stockPrice();
  }, 5000);
});

//socket io
io.on("connect", async (socket) => {
  let interval;
  socket.on("latestPrice", async (id) => {
    interval = setInterval(async function () {
      await dashboard(id);
    }, 2000);
  });
  socket.on("disconnect", () => {
    clearInterval(interval); // undefined
  });
});

//start the server
server.listen(config.PORT, () => {
  console.log("Magic happens on port " + config.PORT);
});

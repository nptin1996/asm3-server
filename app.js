const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const compression = require("compression");
const helmet = require("helmet");
const path = require("path");

const authRouter = require("./routes/auth");
const productRouter = require("./routes/product");
const cartRouter = require("./routes/cart");
const chatRouter = require("./routes/chat");
const orderRouter = require("./routes/order");
const MongoDBStore = require("connect-mongodb-session")(session);

// require("dotenv").config();
const app = express();
const store = new MongoDBStore({
  uri: process.env.MONGO_URL,
  collection: "sessions",
});

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      process.env.ADMIN_URL || "http://localhost:3001",
    ], // Các domain được phép truy cập
    methods: "GET,PUT,PATCH,POST,DELETE",
    credentials: true, // Cho phép gửi cookie
  })
);

// app.set("trust proxy", 1);

app.use(helmet());

app.use(compression());

app.use(
  session({
    secret: "0190e8c4-12e3-73b4-9d28-22f5ad90e6bb",
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 3 * 24 * 60 * 60 * 1000, //thời gian tồn tại của cookie là 3 ngày
    },
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/auth", authRouter);
app.use("/cart", cartRouter);
app.use("/chat", chatRouter);
app.use("/product", productRouter);
app.use("/order", orderRouter);

app.use((req, res, next) => {
  res.status(404).end();
});

app.use((error, req, res, next) => {
  console.log(error);
  let msg = "Server failed.";
  if (error.message) msg = error.message;
  res.status(500).json({ message: msg });
});

// Kết nối database bằng moongose
async function main() {
  await mongoose.connect(
    `${process.env.MONGO_URL}?retryWrites=true&w=majority&appName=Cluster0`
  );
}

main()
  .then(() => {
    const server = app.listen(process.env.PORT || 5000);
    const io = require("./socket").init(server);
    io.on("connection", () => {
      console.log("Client connect");
    });
  })
  .catch((err) => console.log(err));

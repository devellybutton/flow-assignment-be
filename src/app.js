const express = require("express");
const cors = require("cors");
const path = require("path");
const { swaggerUi, swaggerDocument } = require("./config/swagger");
const extensionRoute = require("./routes/extensionRoute");
const viewRoutes = require("./routes/view.routes");

const app = express();

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:3000",
      "http://3.38.191.18:3000",
      "https://flow-assignment-123.s3.ap-northeast-2.amazonaws.com/index.html",
    ],
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// 템플릿 엔진
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// 스웨거 설정
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/", viewRoutes);
// app.use("/", extensionRoute);

// 예외 처리
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ msg: "서버 오류가 발생했습니다." });
});

module.exports = app;

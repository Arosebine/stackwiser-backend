require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoSanitize = require("express-mongo-sanitize");
const connectDB = require("../src/connection/stackdatabase.connect");
const errorMiddleware = require("../src/middleware/errorhandling.middleware");
const userRoutes = require("../src/modules/user/routes/user.routes");
const postRoutes = require("../src/modules/post/routes/post.routes");
const commentRoutes = require("../src/modules/comment/routes/comment.routes");


const app = express();

connectDB();
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(mongoSanitize());

app.get("/", (req, res) => {
  res.send("Hello, Welcome to Stackwiser World!");
});

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/post", postRoutes);
app.use("/api/v1/comment", commentRoutes);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Stackwiser App is running on port, http://localhost:${port}`);
});

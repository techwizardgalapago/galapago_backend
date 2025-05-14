const express = require("express");
const routerApi = require("./routes/index");
const multer = require("multer");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
// app.use(express.urlencoded({ extended: true })); no se si es necesario

require("./utils/auth");

app.get("/", (req, res) => {
  res.send("galapago Api!");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

routerApi(app);

const express = require("express");
const routerApi = require("./routes/index");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
// app.use(express.urlencoded({ extended: true })); no se si es necesario

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

routerApi(app);

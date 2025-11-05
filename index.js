const express = require("express");
const routerApi = require("./routes/index");
const multer = require("multer");
const cors = require("cors");

const port = process.env.PORT || 8080;
const app = express();

app.use(cors({
  origin: ['http://localhost:8081'],
  methods: ['GET', 'POST', 'PUT', "PATCH", 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', "X-Requested-With"],
  credentials: true
}));
// not sure if needed
app.options('*', cors());

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

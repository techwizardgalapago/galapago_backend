const express = require("express");
const routerApi = require("./routes/index");
const multer = require("multer");
const cors = require("cors");
const {
  logErrors,
  boomErrorHandler,
  errorHandler,
} = require("./middlewares/error.handler");

const port = process.env.PORT || 8080;
const app = express();

app.use(cors({
  // origin: ["http://localhost:3000",'http://localhost:8081', "https://api.galago.ec"],
  origin: "*",
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

routerApi(app);

// Los middlewares de error van despues de las rutas: sin ellos Express
// responde 500 con el stack trace en el cuerpo.
app.use(logErrors);
app.use(boomErrorHandler);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});

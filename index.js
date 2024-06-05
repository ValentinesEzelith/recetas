const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const nunjucks = require("nunjucks");
const recetas = require(__dirname + "/routes/recetas");
const auth = require(__dirname + "/auth/auth");
mongoose.connect("mongodb://127.0.0.1:27017/recetas");

let app = express();

nunjucks.configure("views", {
  autoescape: true,
  express: app,
});

app.set("view engine", "njk");
app.use(session({
  secret: '1234',
  resave: true,
  saveUninitialized: false,
  expires: new Date(Date.now() + (30 * 60 * 1000))
}));

app.use('/public', express.static(__dirname + '/public'));
app.use(express.static(__dirname + "/node_modules/bootstrap/dist"));
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/recetas", recetas);
app.use('/auth', auth);

app.listen(8080);

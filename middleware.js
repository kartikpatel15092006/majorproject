const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");

const cookieParser = require("cookie-parser")
app.use(cookieParser());



module.exports.isloggedin = (req, res, next) => {
  if(req.cookies.token===""){
req.flash("error", "log in first")
    res.redirect("/listings")

  }
  else{
    let data = jwt.verify(req.cookies.token,"shhhhhhhha");
    req.user = data;
    next()
  }
};

module.exports.saveredirecturl = (req, res, next) => {
  if (req.session.originalUrl) {
    res.locals.redirecturl = req.session.originalUrl;
    delete req.session.originalUrl;
  }
  next();
};

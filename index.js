require('dotenv').config();
require("./connect");
const model1 = require("./model1");
const express = require("express");
const parser = require("body-parser");
const path = require("path");
const bcrypt = require("bcryptjs");
const {
  check,
  sanitizeBody,
  matchedData,
  validationResult,
} = require("express-validator");
const jwt = require("jsonwebtoken");
// const { LocalStorage } = require('node-localstorage');
// const { application } = require('express');
const app = express();
if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require("node-localstorage").LocalStorage;
  localStorage = new LocalStorage("./scratch");
}
// const path = require('path');
// const { runInNewContext } = require('vm');
app.use(express.static(path.join(__dirname, "css")));
app.use(parser.urlencoded({ extended: false }));
app.use(parser.json());
app.set("view engine", "ejs");
// app.set('views','')
const authentication = (req, res, next) => {
  const tokendata = localStorage.getItem("mytoken");
  try {
    console.log(typeof tokendata);
    jwt.verify(tokendata, process.env.TOKEN);
    next();
  } catch (err) {
    res.send("<h1>please login first</h1>");
  }
  // next();
};
app.get("/dataupdate", authentication, (req, res, next) => {
  const username = localStorage.getItem("username");
  if (!username) {
    res.render("login", { data: null });
  } else res.render("directory", { username: username });
});
// app.use(authentication);
const checkusername = (req, res, next) => {
  const data = model1.findOne({ username: req.body.username });
  data.exec((err, data) => {
    if (data === null) next();
    else res.render("signup", { username: "username already exists" });
  });
};
const checkgmail = (req, res, next) => {
  const data = model1.findOne({ gmail: req.body.gmail });
  data.exec((err, data) => {
    if (data === null) next();
    else res.render("signup", { username: "gmail already exists" });
  });
};
// const checkvalidation=(req,res,next)=>{
//     const erro = validationResult(req);
//     if (!erro.isEmpty()) {
//         const errors = erro.mapped();
//         console.log(errors);
//         res.render("error");
//     }
//     next();

// }
app.get("/login", (req, res, next) => {
  const getdata = localStorage.getItem(process.env.MYTOKEN);
  const username = localStorage.getItem(process.env.USERNAME);
  if (getdata) {
    // is not equal to null
    res.render("directory", { username: username });
  } else res.render("login", { data: null });
});
app.post("/dataupdate", (req, res, next) => {});
app.post("/login", (req, res, next) => {
  const data = model1.findOne({ gmail: req.body.gmail });
  // console.log("step 1");
  data.exec((err, check) => {
    if (err) throw err;
    if (check != null) {
      // console.log("step 2");
      bcrypt.compare(req.body.password, check.password, (err, result) => {
        if (err) throw err;
        // console.log("step 3");
        if (result) {
          // result return true or false
          const token = jwt.sign({ _id: check._id }, process.env.TOKEN);
          localStorage.setItem(process.env.MYTOKEN, token);
          localStorage.setItem(process.env.USERNAME, check.username);
          // res.render("home", { data: null });
          res.render("directory", { username: check.username });
        } else res.render("login", { data: "incorrect password" });
      });
    } else res.render("login", { data: "incorrect id " });
  });
});
app.get("/signup", (req, res, next) => {
  res.render("signup", { username: null });
});
app.get("/directory", (req, res, next) => {
  const token = localStorage.getItem(process.env.MYTOKEN);
  if (token == null || token == "") res.redirect("/login");
  else res.render("directory", { username: localStorage.getItem(process.env.USERNAME) });
});
app.post(
  "/signup",
  [
    check("username", "please enter the correct username")
      .trim()
      .isLength({ min: 3 }),
    check("password", "password should be strong and have atleast 4 digit")
      .trim()
      .isStrongPassword({
        minLength: 4,
        minLowercase: 1,
        minUppercase: 1,
        minSymbols: 1,
        minNumbers: 1,
      }),
    check("cpassword", "password doesnt match").trim(),
    check("gmail", "gmail already in use").trim().isEmail(),
    check("number", "please enter correct number")
      .trim()
      .isMobilePhone()
      .custom((value, { req }) => {
        if (value.toString().length == 10) return true;
        else return false;
      }),
  ],
  checkusername,
  checkgmail,
  async (req, res, next) => {
    console.log(req.body);
    const erro = validationResult(req);
    if (!erro.isEmpty()) {
      const errors = erro.mapped();
      console.log(errors);
      if (errors.cpassword != "")
        res.render("signup", { username: "confirm password doesnt match" });
      else if (errors.number != "")
        res.render("signup", { username: "mobile number already used" });
      else res.render("error");
    } else {
      // console.log("before matched data");
      // console.log(req.body);
      const data = matchedData(req);
      const username = data.username;
      const password = bcrypt.hashSync(
        data.password,
        data.password.toString().length
      );
      const gmail = data.gmail;
      const number = data.number;
      // console.log("after matched data");
      model1.create(
        {
          username: username,
          password: password,
          gmail: gmail,
          number: number,
        },
        (err, result) => {
          if (err) {
            res.render("signup", {
              username: "data couldnt save please try later",
            });
            throw err;
          } else res.render("login", { data: "Data saved succesfully" });
        }
      );
    }
  }
);

app.get("/logout", (req, res, next) => {
  // console.log(2);
  localStorage.removeItem(process.env.MYTOKEN);
  res.render("login", { data: "logout successfully" });
});

app.listen(9000);

require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

mongoose.connect("mongodb://localhost:27017/freshdev");

const informerSchema = {
  phone: Number,
  pincode: Number,
};

const Informer = mongoose.model("Informer", informerSchema);

const helperSchema = {
  fname: String,
  lname: String,
  pincode: Number,
  licence: String,
  phone: Number,
};

const Helper = mongoose.model("Helper", helperSchema);

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/register", function (req, res) {
  res.sendFile(__dirname + "/views/register.html");
});

app.get("/help", function (req, res) {
  res.sendFile(__dirname + "/views/help.html");
});

app.get("/success", function (req, res) {
  // res.sendFile(__dirname + "/views/directions.html");
  res.render("directions", { contactContent: 7011681275 });
});

app.get("/fail", function (req, res) {
  res.sendFile(__dirname + "/views/decline.html");
});

app.post("/", function (req, res) {
  var Phone = req.body.phoneNo;
  var Pincode = 110091;
  if (Phone) {
    const informer = new Informer({
      phone: Phone,
      pincode: Pincode,
    });
    informer.save(function (err) {
      if (!err) {
        console.log("Informer Registered Succesfully");
      }
    });
  }

  Helper.find({ pincode: Pincode }, function (err, helpers) {
    if (err) {
      console.log(err);
    } else {
      // console.log("First function call : ", helpers);
      helpers.map((helper) => {
        // console.log(helper.phone);
        client.messages
          .create({
            body: "please click the link http://localhost:4000/help and save a life.",
            from: "+15592724044",
            to: "+91" + helper.phone,
          })
          .then((message) => console.log(message.sid));
      });
    }
  });

  res.sendFile(__dirname + "/views/waiting.html");
});

app.post("/register", function (req, res) {
  var Fname = req.body.firstName;
  var Lname = req.body.secondName;
  var Pincode = req.body.postalCode;
  var Licence = req.body.DLNum;
  var Phone = req.body.phno;
  const helper = new Helper({
    fname: Fname,
    lname: Lname,
    pincode: Pincode,
    licence: Licence,
    phone: Phone,
  });
  helper.save(function (err) {
    if (!err) {
      console.log("Helper Registered Succesfully");
    }
  });
  res.sendFile(__dirname + "/views/index.html");
});

app.listen(4000, function () {
  console.log("Running at port 4000");
});

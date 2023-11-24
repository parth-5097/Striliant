var express = require('express');
var passport = require('passport');
const jwt = require('jsonwebtoken');
const puppeteer = require('puppeteer');
var crypto = require('crypto');
var waterfall = require('run-waterfall')
var router = express.Router();
var CronJob = require('cron').CronJob;
const moment = require('moment');
const { check, validationResult } = require('express-validator');
var EmailValidator = require("email-validator");
const conn = require('../db/connections');
const helper = require('../helper/helper');
var JWTSECRET = process.env.ADMINJWTSECRET;
var FRONTEND_URL = process.env.FRONTEND_URL;
var BACKEND_URL = process.env.BACKEND_URL;
var async = require('async');
const _ = require("underscore");
const request = require('request');
const fs = require("fs");
const path = require("path");

router.post('/login', [
  check('username').exists(),
  check('password').exists()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    var { username, password } = req.body
    conn.query('SELECT * FROM `admin` WHERE username = ? and password = ?', [username, crypto.createHash('sha256').update(password, 'utf8').digest('hex')], async(err, resuser) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else if (resuser.length > 0) {
        if (resuser[0]['isActive'] == 2) {
          res.json({status: 201, success: false, message: 'Account is blocked.'});
        } else if (resuser[0]['isActive'] == 0) {
          res.json({status: 201, success: false, message: 'Account is not activated.'});
        } else {
          var jwtdata = {
            adminId: resuser[0].adminId,
            username: resuser[0].username,
            firstname: resuser[0].firstname,
            lastname: resuser[0].lastname,
            email: resuser[0].email
          }
          var token = jwt.sign({ jwtdata, IsAdminLogin: true }, JWTSECRET, { expiresIn: '10d' });
          res.json({status: 200, success: true, message: 'Welcome', data: resuser[0], token: token, IsAdminLogin: true});
        }
      } else {
        res.json({status: 201, success: false, message: 'Invalid credentials.'});
      }
    })
  }
})

router.post('/forgot-password',[
  check('email').exists().isEmail(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    const {email} = req.body;
    var verify_token = Math.floor(1000 + Math.random() * 9000);
    let sql = "UPDATE `admin` SET authToken = ?, updated_at = current_timestamp WHERE email = ?";
    conn.query(sql, [verify_token,email], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.affectedRows === 1) {
          var html = "";
          html += `<h1>Forgot your password For Striliant</h1>`;
          html += `You are now a admin for Striliant <br>`;
          html += `<br> Token is : ${verify_token}`;
          var subject = "Forgot Password Admin"
          var check  = helper.email_helper('',email,subject,html)
          if (check){
            res.json({status: 200, success: true, message: 'Email Send Successfully'});
          }else {
            res.json({status: 400, success: false, message: 'Email not sending'});
          }
        } else {
          res.json({status: 400, success: false, message: 'No data found'});
        }
      }
    });
  }
});

router.post('/verify-otp',[
  check('email').exists().isEmail(),
  check('verify_token').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    const {email,verify_token} = req.body;
    let sql = "SELECT * FROM `admin` WHERE email = ? LIMIT 1";
    conn.query(sql, [email], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0){
          if (results[0].authToken == verify_token){
            res.json({status: 200, success: true, message: 'OTP Verify Successfully'});
          }else {
            res.json({status: 400, success: false, message: 'Please Valid OTP'});
          }
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/reset-password',[
  check('password').exists().isLength({ min: 6 }).withMessage('must be at least 6 chars long'),
  check('confirm_password').exists().isLength({ min: 6 }).withMessage('must be at least 6 chars long'),
  check('email').exists().isEmail(),
  check('verify_token').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    const email = req.body.email;
    const authToken = req.body.verify_token;
    if(password !== confirm_password){
      res.json({status: 400, success: false, message: 'Do not match Password and Confirm Password'});
    }
    let sql = "SELECT * FROM `admin` WHERE email = ? AND authToken = ? LIMIT 1";
    conn.query(sql, [email,authToken], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0){
          let sql1 = "UPDATE `admin` SET password = ?, updated_at = current_timestamp WHERE email = ?";
          conn.query(sql1, [crypto.createHash('sha256').update(password, 'utf8').digest('hex'),email], function (err, results1) {
            if (err) {
              res.json({status: 501, success: false, message: err});
            } else {
              if (results1.affectedRows === 1){
                res.json({status: 200, success: true, message: "Your password has been successfully changed"});
              }else{
                res.json({status: 400, success: false, message: "Your password has been not changed"});
              }
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/get_data',[
  //passport.authenticate('adminLogin', { session: false }),
  check('adminId').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    var adminId = req.body.adminId;
    let sql = "SELECT * FROM `admin` WHERE adminId = ?";
    conn.query(sql, [adminId], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: results[0]});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/getOrder',[
  //passport.authenticate('adminLogin', { session: false }),
  check('order_id').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    var order_id = req.body.order_id;
    let sql = "SELECT * FROM `orders` WHERE order_id = ?";
    conn.query(sql, [order_id], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: results[0]});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/edit-profile',[
  check('adminId').exists(),
  check('firstname').exists(),
  check('lastname').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 401, success: false, message: errors.array()});
  }else {
    let {adminId,firstname,lastname,mobileno,about} = req.body;
    let sql = "SELECT * FROM `admin` WHERE adminId = ?";
    conn.query(sql,[adminId], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0) {
          let sql1 = "UPDATE `admin` SET firstname=?,lastname=?,mobileno=?,about=?, updated_at = current_timestamp WHERE adminId=?";
          conn.query(sql1, [firstname, lastname, mobileno, about, adminId], function (err,results){
            if (err) {
              res.json({status: 501, success: false, message: err});
            } else {
              res.json({status: 200, success: true, message: "Profile Update Successfully", response: results});
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'Admin not Found'});
        }
      }
    });
  }
});

router.post('/profile-picture',[
  check('adminId').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 401, success: false,message: errors.array()});
  }else {
    let {adminId,cropProfile,profile} = req.body;
    let data = {}
    let sql = "SELECT * FROM `admin` WHERE adminId = ?";
    conn.query(sql,[adminId], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0) {
          if(profile != ''){
            var fileName = path.basename(profile).replace(/ /g,"_").replace('C:/fakepath/', '').replace('C:\\fakepath\\', '');
            // var imageBuffer = decodeBase64Image(cropProfile);
            let filename = Math.floor(Math.random() * 100000)+'-'+fileName;
            // let file_url = './upload/admin/'+filename;
            // let file_name = 'upload/admin/'+filename;

            fs.writeFile(path.join('./upload/admin/', filename), cropProfile.replace(/^data:image\/[a-z]+;base64,/, ""), 'base64', function(err) {
              if (err) {
                res.json({status: 400, success: false, message: err});
              }else{
                data.profile = path.join('upload/admin/', filename)
                let sql1 = "UPDATE `admin` SET ?, updated_at = current_timestamp WHERE adminId = ?";
                conn.query(sql1, [data, adminId], function (err,results) {
                  if (err) {
                    res.json({status: 501, success: false, message: err});
                  } else {
                    // pass
                  }
                });
              }
            });
            /*fs.writeFile(file_url, imageBuffer.data, function(err) {
              if (err) {
                res.json({status: 400, success: false, message: err});
              }else{
                data.profile = file_name
              }
            });*/
          }
          if (req.files && Object.keys(req.files).length > 0) {
            /*if(req.files.profile != undefined){
              let profile = req.files.profile;
              profile.name = profile.name.replace(/ /g,"_");
              let filename = Math.floor(Math.random() * 100000)+'-'+profile.name;
              let file_url = './upload/admin/'+filename;
              let file_name = 'upload/admin/'+filename;
              profile.mv(file_url, function (error) {
                if (error) {
                  res.json({status: 400, success: false, message: error});
                }else{
                  data.profile = file_name
                }
              });
            }*/
            if(req.files.banner != undefined) {
              let banner = req.files.banner;
              banner.name = banner.name.replace(/ /g,"_");
              let filename1 = Math.floor(Math.random() * 100000)+'-'+banner.name;
              let file_url1 = './upload/admin/'+filename1;
              let file_name1 = 'upload/admin/'+filename1;
              banner.mv(file_url1, function (error) {
                if (error) {
                  res.json({status: 400, success: false, message: error});
                }else{
                  data.banner = file_name1
                }
              });
            }
            let sql1 = "UPDATE `admin` SET ?, updated_at = current_timestamp WHERE adminId = ?";
            conn.query(sql1, [data, adminId], function (err,results){
              if (err) {
                res.json({status: 501, success: false, message: err});
              } else {
                res.json({status: 200, success: true, message: "Picture Update Successfully", response: results});
              }
            });
          }
          else {
            res.json({status: 200, success: true, message: "Profile Picture Update Successfully"});
          }
        } else {
          res.json({status: 400, success: false, message: 'Admin not Found'});
        }
      }
    });
  }
});

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  var response = {};

  if (matches.length != 3) {
    return new Error('Invalid input string');
  }
  // console.log('matches:::' + JSON.stringify(matches))          //log
  // console.log('dataString:::' + JSON.stringify(dataString))          //log
  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

router.post('/dashboard',[
  check('adminId').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    var adminId = req.body.adminId;
    let sql = `SELECT MAX(created_at) AS lastdatetime FROM diamonds`;
    conn.query(sql, (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0) {
          var lastdatetime = results[0]['lastdatetime']
          let sql1 = `SELECT count(*) AS new_products FROM diamonds WHERE created_at >= ? - INTERVAL 1 week;SELECT count(*) AS enquiry FROM buy_requests;SELECT diamondList FROM watchlist`;
          conn.query(sql1, [lastdatetime], (err, results1) => {
            if (err) {
              res.json({status: 501, success: false, message: err});
            } else {
              if (results1.length > 0) {
                res.json({status: 200, success: true, message: 'Get Data Successfully', data: results1 });
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/financial_data',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 401, success: false,message: errors.array()});
  }else {
    var YahooResponse = []
    var YahooResponseMetal = []
    var hkd_url = "https://query1.finance.yahoo.com/v8/finance/chart/HKD=X";
    request(hkd_url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var responseYahoo = JSON.parse(body)
        var HKDYahoo = responseYahoo.chart.result[0].indicators.quote[0].high
        HKDYahoo = HKDYahoo.reverse()
        var HKDYahooResponse = []
        HKDYahoo.forEach(function (item){
          if(item != null && HKDYahooResponse.length < 2 && !HKDYahooResponse.includes(item)){
            HKDYahooResponse.push(item)
          }
        });
        var HKD_last_second = HKDYahooResponse[1]
        var HKD_last = HKDYahooResponse[0]
        var HKD_change = HKD_last - HKD_last_second
        var HKD_changePercent = ((HKD_last - HKD_last_second)/HKD_last_second)*100
        var HKD_obj = {
          productTitle : 'HKD',
          old_price : HKD_last_second.toFixed(5),
          price : HKD_last.toFixed(5),
          change : HKD_change.toFixed(5),
          changePercent : HKD_changePercent.toFixed(5)
        }
        YahooResponse.push(HKD_obj);
        var cad_url = "https://query1.finance.yahoo.com/v8/finance/chart/CAD=X";
        request(cad_url, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            var CADresponseYahoo = JSON.parse(body)
            var CADYahoo = CADresponseYahoo.chart.result[0].indicators.quote[0].high
            CADYahoo = CADYahoo.reverse()
            var CADYahooResponse = []
            CADYahoo.forEach(function (item){
              if(item != null && CADYahooResponse.length < 2 && !CADYahooResponse.includes(item)){
                CADYahooResponse.push(item)
              }
            });
            var CAD_last_second = CADYahooResponse[1]
            var CAD_last = CADYahooResponse[0]
            var CAD_change = CAD_last - CAD_last_second
            var CAD_changePercent = ((CAD_last - CAD_last_second)/CAD_last_second)*100
            var CAD_obj = {
              productTitle : 'CAD',
              old_price : CAD_last_second.toFixed(5),
              price : CAD_last.toFixed(5),
              change : CAD_change.toFixed(5),
              changePercent : CAD_changePercent.toFixed(5)
            }
            YahooResponse.push(CAD_obj)
            var euro_url = "https://query1.finance.yahoo.com/v8/finance/chart/EUR=X";
            request(euro_url, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                var EUROresponseYahoo = JSON.parse(body)
                var EUROYahoo = EUROresponseYahoo.chart.result[0].indicators.quote[0].high
                EUROYahoo = EUROYahoo.reverse()
                var EUROYahooResponse = []
                EUROYahoo.forEach(function (item){
                  if(item != null && EUROYahooResponse.length < 2 && !EUROYahooResponse.includes(item)){
                    EUROYahooResponse.push(item)
                  }
                });
                var EURO_last_second = EUROYahooResponse[1]
                var EURO_last = EUROYahooResponse[0]
                var EURO_change = EURO_last - EURO_last_second
                var EURO_changePercent = ((EURO_last - EURO_last_second)/EURO_last_second)*100
                var EURO_obj = {
                  productTitle : 'EURO',
                  old_price : EURO_last_second.toFixed(5),
                  price : EURO_last.toFixed(5),
                  change : EURO_change.toFixed(5),
                  changePercent : EURO_changePercent.toFixed(5)
                }
                YahooResponse.push(EURO_obj)
                var gbp_url = "https://query1.finance.yahoo.com/v8/finance/chart/GBP=X";
                request(gbp_url, function (error, response, body) {
                  if (!error && response.statusCode == 200) {
                    var GBPresponseYahoo = JSON.parse(body)
                    var GBPYahoo = GBPresponseYahoo.chart.result[0].indicators.quote[0].high
                    GBPYahoo = GBPYahoo.reverse()
                    var GBPYahooResponse = []
                    GBPYahoo.forEach(function (item){
                      if(item != null && GBPYahooResponse.length < 2 && !GBPYahooResponse.includes(item)){
                        GBPYahooResponse.push(item)
                      }
                    });
                    var GBP_last_second = GBPYahooResponse[1]
                    var GBP_last = GBPYahooResponse[0]
                    var GBP_change = GBP_last - GBP_last_second
                    var GBP_changePercent = ((GBP_last - GBP_last_second)/GBP_last_second)*100
                    var GBP_obj = {
                      productTitle : 'GBP',
                      old_price : GBP_last_second.toFixed(5),
                      price : GBP_last.toFixed(5),
                      change : GBP_change.toFixed(5),
                      changePercent : GBP_changePercent.toFixed(5)
                    }
                    YahooResponse.push(GBP_obj)
                    var usd_url = "https://query1.finance.yahoo.com/v8/finance/chart/INR=X";
                    request(usd_url, function (error, response, body) {
                      if (!error && response.statusCode == 200) {
                        var USDresponseYahoo = JSON.parse(body)
                        var USDYahoo = USDresponseYahoo.chart.result[0].indicators.quote[0].high
                        USDYahoo = USDYahoo.reverse()
                        var USDYahooResponse = []
                        USDYahoo.forEach(function (item){
                          if(item != null && USDYahooResponse.length < 2 && !USDYahooResponse.includes(item)){
                            USDYahooResponse.push(item)
                          }
                        });
                        var USD_last_second = USDYahooResponse[1]
                        var USD_last = USDYahooResponse[0]
                        var USD_change = USD_last - USD_last_second
                        var USD_changePercent = ((USD_last - USD_last_second)/USD_last_second)*100
                        var USD_obj = {
                          productTitle : 'INR',
                          old_price : USD_last_second.toFixed(5),
                          price : USD_last.toFixed(5),
                          change : USD_change.toFixed(5),
                          changePercent : USD_changePercent.toFixed(5)
                        }
                        YahooResponse.push(USD_obj)
                        var CNY_url = "https://query1.finance.yahoo.com/v8/finance/chart/CNY=X";
                        request(CNY_url, function (error, response, body) {
                          if (!error && response.statusCode == 200) {
                            var CNYresponseYahoo = JSON.parse(body)
                            var CNYYahoo = CNYresponseYahoo.chart.result[0].indicators.quote[0].high
                            CNYYahoo = CNYYahoo.reverse()
                            var CNYYahooResponse = []
                            CNYYahoo.forEach(function (item, index){
                              if(item != null && CNYYahooResponse.length < 2){
                                if (!CNYYahooResponse.includes(item) && CNYYahoo.length != index) {
                                  CNYYahooResponse.push(item)
                                } else {
                                  CNYYahooResponse.push(item)
                                }
                              }
                            });
                            var CNY_last_second = CNYYahooResponse[1]
                            var CNY_last = CNYYahooResponse[0]
                            var CNY_change = CNY_last - CNY_last_second
                            var CNY_changePercent = ((CNY_last - CNY_last_second)/CNY_last_second)*100
                            var CNY_obj = {
                              productTitle : 'CNY',
                              old_price : CNY_last_second.toFixed(5),
                              price : CNY_last.toFixed(5),
                              change : CNY_change.toFixed(5),
                              changePercent : CNY_changePercent.toFixed(5)
                            }
                            YahooResponse.push(CNY_obj)
                            var gc_url = "https://query1.finance.yahoo.com/v8/finance/chart/GC=F";
                            request(gc_url, function (error, response, body) {
                              if (!error && response.statusCode == 200) {
                                var GCresponseYahoo = JSON.parse(body)
                                var GCYahoo = GCresponseYahoo.chart.result[0].indicators.quote[0].high
                                GCYahoo = GCYahoo.reverse()
                                var GCYahooResponse = []
                                GCYahoo.forEach(function (item){
                                  if(item != null && GCYahooResponse.length < 2 && !GCYahooResponse.includes(item)){
                                    GCYahooResponse.push(item)
                                  }
                                });
                                var GC_last_second = GCYahooResponse[1]
                                var GC_last = GCYahooResponse[0]
                                var GC_change = GC_last - GC_last_second
                                var GC_changePercent = ((GC_last - GC_last_second)/GC_last_second)*100
                                var GC_obj = {
                                  productTitle : 'Gold',
                                  old_price : GC_last_second.toFixed(5),
                                  price : GC_last.toFixed(5),
                                  change : GC_change.toFixed(5),
                                  changePercent : GC_changePercent.toFixed(5)
                                }
                                YahooResponseMetal.push(GC_obj)
                                var pl_url = "https://query1.finance.yahoo.com/v8/finance/chart/PL=F";
                                request(pl_url, function (error, response, body) {
                                  if (!error && response.statusCode == 200) {
                                    var PLresponseYahoo = JSON.parse(body)
                                    var PLYahoo = PLresponseYahoo.chart.result[0].indicators.quote[0].high
                                    PLYahoo = PLYahoo.reverse()
                                    var PLYahooResponse = []
                                    PLYahoo.forEach(function (item){
                                      if(item != null && PLYahooResponse.length < 2 && !PLYahooResponse.includes(item)){
                                        PLYahooResponse.push(item)
                                      }
                                    });
                                    var PL_last_second = PLYahooResponse[1]
                                    var PL_last = PLYahooResponse[0]
                                    var PL_change = PL_last - PL_last_second
                                    var PL_changePercent = ((PL_last - PL_last_second)/PL_last_second)*100
                                    var PL_obj = {
                                      productTitle : 'Platinum',
                                      old_price : PL_last_second.toFixed(5),
                                      price : PL_last.toFixed(5),
                                      change : PL_change.toFixed(5),
                                      changePercent : PL_changePercent.toFixed(5)
                                    }
                                    YahooResponseMetal.push(PL_obj)
                                    var sl_url = "https://query1.finance.yahoo.com/v8/finance/chart/SI=F";
                                    request(sl_url, function (error, response, body) {
                                      if (!error && response.statusCode == 200) {
                                        var SLresponseYahoo = JSON.parse(body)
                                        var SLYahoo = SLresponseYahoo.chart.result[0].indicators.quote[0].high
                                        SLYahoo = SLYahoo.reverse()
                                        var SLYahooResponse = []
                                        SLYahoo.forEach(function (item){
                                          if(item != null && SLYahooResponse.length < 2 && !SLYahooResponse.includes(item)){
                                            SLYahooResponse.push(item)
                                          }
                                        });
                                        var SL_last_second = SLYahooResponse[1]
                                        var SL_last = SLYahooResponse[0]
                                        var SL_change = SL_last - SL_last_second
                                        var SL_changePercent = ((SL_last - SL_last_second)/SL_last_second)*100
                                        var SL_obj = {
                                          productTitle : 'Silver',
                                          old_price : SL_last_second.toFixed(5),
                                          price : SL_last.toFixed(5),
                                          change : SL_change.toFixed(5),
                                          changePercent : SL_changePercent.toFixed(5)
                                        }
                                        YahooResponseMetal.push(SL_obj)
                                        res.json({status: 200, success: true, message: "Get Data Successfully", Yahoo : YahooResponse, Metal:YahooResponseMetal});
                                      };
                                    });
                                  };
                                });
                              };
                            });
                          };
                        });
                      };
                    });
                  };
                });
              };
            });
          };
        });
      };
    });
  }
});

router.post('/featured_stone',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 401, success: false, message: errors.array()});
  }else {
    let sql = "SELECT * FROM diamonds WHERE featured_stone = ?";
    conn.query(sql, [1], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: "Get Data Successfully", data: results});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/snapshort',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    let sql = `SELECT * FROM orders WHERE status != 3 AND status != 4 AND created_at >= NOW() - INTERVAL 1 MONTH;SELECT * FROM orders WHERE status != 3 AND status != 4 AND created_at >= NOW() - INTERVAL 6 MONTH;SELECT * FROM orders WHERE status != 3 AND status != 4 AND created_at >= NOW() - INTERVAL 1 YEAR;SELECT * FROM orders WHERE status != 3 AND status != 4 AND created_at >= NOW() - INTERVAL 2 YEAR`;
    conn.query(sql, (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0) {
          let tmpRes = results[0]
          let resNew = [];
          let month_1 = 0
          tmpRes.forEach(function (item)
          {
            month_1 += parseFloat(item.total_price)
            item.created_at = moment(item.created_at).format('DD MMM YY');
            resNew.push(item);
          });
          let tmpRes1 = results[1]
          let resNew1 = [];
          let month_6 = 0
          tmpRes1.forEach(function (item)
          {
            month_6 += parseFloat(item.total_price)
            item.created_at = moment(item.created_at).format('DD MMM YY');
            resNew1.push(item);
          });
          let tmpRes2 = results[2]
          let resNew2 = [];
          let year_1 = 0
          tmpRes2.forEach(function (item)
          {
            year_1 += parseFloat(item.total_price)
            item.created_at = moment(item.created_at).format('DD MMM YY');
            resNew2.push(item);
          });
          let tmpRes3 = results[3]
          let resNew3 = [];
          let year_2 = 0
          tmpRes3.forEach(function (item)
          {
            year_2 += parseFloat(item.total_price)
            item.created_at = moment(item.created_at).format('DD MMM YY');
            resNew3.push(item);
          });
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: resNew, month_1: month_1, data1: resNew1, month_6: month_6, data2: resNew2, year_1: year_1, data3: resNew3, year_2: year_2});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});


router.post('/searchBuyRequests',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return;
  } else {
    var { columns, order, start, length } = req.body;
    var objsearch=``;
    var objsearcharr = [];
    objsearcharr=objsearcharr.concat(objsearcharr)
    let sql = `SELECT br.*,us.firstname,us.lastname FROM buy_requests br LEFT JOIN users us ON br.userId = us.userId ${objsearch}ORDER BY ${ columns[order[0].column].data} ${order[0].dir} LIMIT ${start},${length};SELECT count(*) as cnt FROM buy_requests br LEFT JOIN users us ON br.userId = us.userId ${objsearch}`;
    //console.log(sql)
    //console.log(objsearcharr)
    conn.query(sql, objsearcharr, function (error, resdata){
      if(error){
        res.json({status: 501, success: false, message: error});
      }else{
        if(resdata[0].length > 0){
          res.json({status: 200, success: true, message: "Get Requests successfully", response: resdata[0], TotalRecords:resdata[1][0]});
        }else{
          res.json({status: 400, success: false, message: 'No data Found', TotalRecords:0});
        }
      }
    });
  }
});

router.post('/GetBuyRequests',[
  check('buy_requests_id').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var buy_requests_id = req.body.buy_requests_id;
    let sql = "SELECT * FROM buy_requests WHERE buy_requests_id = ?";
    conn.query(sql, [buy_requests_id], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: "Get Data Successfully", data: results[0]});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/buyRequestStance', [
  check('buy_requests_id').exists(),
  check('stance').exists().isInt({ min: 0, max: 4})
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    console.log('this is buy requests stance::: ' + JSON.stringify(req.body));
    let stance = req.body.stance;
    let buy_requests_id = req.body.buy_requests_id;
    let sql = "SELECT * FROM buy_requests WHERE buy_requests_id = ?";
    conn.query(sql, [buy_requests_id], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let sql1 = "UPDATE buy_requests SET stance = ?, updated_at = current_timestamp WHERE buy_requests_id = ?";
          conn.query(sql1, [stance, buy_requests_id], (err, results1) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results1.affectedRows === 1) {
                res.json({status: 200, success: true, message: "Request Stance is updated"});
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
})

router.post('/portfolio',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let sql = `SELECT clarity,(count(diamond_id)/(SELECT count(diamond_id) FROM diamonds)*100) AS percentage,count(diamond_id) AS each_product,(SELECT count(diamond_id) FROM diamonds) as total_product FROM diamonds GROUP BY clarity`;
    conn.query(sql, (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0) {
          let tempRes = results
          let resNew = []
          let resNew1 = []
          let resNew2 = []
          tempRes.forEach(function (item){
            resNew.push(item['clarity'])
            item['percentage'] = item['percentage'].toFixed(2)
            resNew1.push(item['percentage'])
            resNew2.push(item)
          });
          res.json({status: 200, success: true, message: "Get Data Successfully", data: resNew, data1:resNew1, alldata:resNew2});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/change-password',[
  check('old_password').exists().isLength({ min: 6 }).withMessage('must be at least 6 chars long'),
  check('password').exists().isLength({ min: 6 }).withMessage('must be at least 6 chars long'),
  check('confirm_password').exists().isLength({ min: 6 }).withMessage('must be at least 6 chars long'),
  check('adminId').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    const old_password = req.body.old_password;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    const adminId = req.body.adminId;
    if(password !== confirm_password){
      res.json({status: 400, success: false, message: 'Do not match Password and Confirm Password'});
    }
    let sql = "SELECT * FROM `admin` WHERE adminId = ? AND password = ?";
    conn.query(sql, [adminId,crypto.createHash('sha256').update(old_password, 'utf8').digest('hex')], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0){
          let sql1 = "UPDATE `admin` SET password = ?, updated_at = current_timestamp WHERE adminId = ?";
          conn.query(sql1,[crypto.createHash('sha256').update(password, 'utf8').digest('hex'),adminId], (err, results1) => {
            if (err) {
              res.json({status: 501, success: false, message: err});
            } else {
              if (results1.affectedRows === 1){
                res.json({status: 200, success: true, message: "Your password has been successfully changed"});
              }else{
                res.json({status: 400, success: false, message: "Your password has been not changed"});
              }
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'Your Old Password is Wrong! Please Correct Password'});
        }
      }
    });
  }
});

router.post('/searchDiamonds',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var { search_data, diamond_type, userId, columns, order, start, length } = req.body;
    var objsearch=``;
    var objsearcharr = [];
    if(userId != '' && userId != undefined){
      objsearch += objsearcharr.length == 0 ? `WHERE userId = ? `:` AND userId = ? `
      objsearcharr.push(userId);
    }
    if(diamond_type != '' && diamond_type != undefined){
      objsearch += objsearcharr.length == 0 ? `WHERE diamond_type = ? `:` AND diamond_type = ? `
      objsearcharr.push(diamond_type);
    }
    if(search_data['shape_basic']){
      objsearch += objsearcharr.length == 0 ? `WHERE shape = ? `:` AND shape = ? `
      objsearcharr.push(search_data['shape_basic']);
    }else if(search_data['shape_advanced'].length > 0){
      objsearch += objsearcharr.length == 0 ? `WHERE shape IN (?) `:` AND shape IN (?) `
      objsearcharr.push(search_data['shape_advanced'])
    }else if(search_data['size_general_from'] && search_data['size_general_to']){
      objsearch += objsearcharr.length == 0 ? `WHERE size BETWEEN ? AND ? `:` AND size BETWEEN ? AND ? `
      objsearcharr.push(search_data['size_general_from'])
      objsearcharr.push(search_data['size_general_to'])
    }else if(search_data['size_specific'].length > 0){
      var flg = true;
      for(var i=0;i<search_data['size_specific'].length;i++)
      {
        var newvalue = search_data['size_specific'][i].split(" - ")
        if(isNaN(newvalue[0])==false && newvalue[0] && newvalue[1] && isNaN(newvalue[1])==false){
          if(flg==true){
            flg=false
            objsearch+=objsearcharr.length==0?`WHERE ( size BETWEEN ? AND ?`:` AND (size BETWEEN ? AND ?`
          }else{
            objsearch+=` OR size BETWEEN ? AND ? `
          }
          objsearcharr.push(parseFloat(newvalue[0]))
          objsearcharr.push(parseFloat(newvalue[1]))
        }
        if(i==search_data['size_specific'].length-1 &&  flg==false){
          objsearch+=`) `
        }
      }
    }else if(search_data['color_fancy'].length > 0){
      objsearch += objsearcharr.length == 0 ? `WHERE color IN (?) `:` AND color IN (?) `
      objsearcharr.push(search_data['color_fancy'])
    }else if(search_data['color_white_intensity_from'] && search_data['color_white_intensity_to']){
      objsearch += objsearcharr.length == 0 ? `WHERE fancy_color_intensity BETWEEN ? AND ? `:` AND fancy_color_intensity BETWEEN ? AND ? `
      objsearcharr.push(search_data['color_white_intensity_from'])
      objsearcharr.push(search_data['color_white_intensity_to'])
    }else if(search_data['color_white_overtone']){
      objsearch += objsearcharr.length == 0 ? `WHERE fancy_color_overtone = ? `:` AND fancy_color_overtone = ? `
      objsearcharr.push(search_data['color_white_overtone']);
    }else if(search_data['color_white_color']){
      objsearch += objsearcharr.length == 0 ? `WHERE fancy_color_dominant_color = ? `:` AND fancy_color_dominant_color = ? `
      objsearcharr.push(search_data['color_white_color']);
    }else if(search_data['clarity'].length > 0){
      objsearch += objsearcharr.length == 0 ? `WHERE clarity IN (?) `:` AND clarity IN (?) `
      objsearcharr.push(search_data['clarity'])
    }else if(search_data['fluorescence_intensity'].length > 0){
      objsearch += objsearcharr.length == 0 ? `WHERE fluor_intensity IN (?) `:` AND fluor_intensity IN (?) `
      objsearcharr.push(search_data['fluorescence_intensity'])
    }else if(search_data['grading_report'].length > 0){
      objsearch += objsearcharr.length == 0 ? `WHERE lab IN (?) `:` AND lab IN (?) `
      objsearcharr.push(search_data['grading_report'])
    }else if(search_data['location'].length > 0){
      objsearch += objsearcharr.length == 0 ? `WHERE country IN (?) `:` AND country IN (?) `
      objsearcharr.push(search_data['location'])
    }if(search_data['stock_number']){
      objsearch += objsearcharr.length == 0 ? `WHERE stock_number = ? `:` AND stock_number = ? `
      objsearcharr.push(search_data['stock_number']);
    }else if(search_data['per_depth_from'] && search_data['per_depth_to']){
      objsearch += objsearcharr.length == 0 ? `WHERE depth_percent BETWEEN ? AND ? `:` AND depth_percent BETWEEN ? AND ? `
      objsearcharr.push(search_data['per_depth_from'])
      objsearcharr.push(search_data['per_depth_to'])
    }else if(search_data['per_table_from'] && search_data['per_table_to']){
      objsearch += objsearcharr.length == 0 ? `WHERE table_percent BETWEEN ? AND ? `:` AND table_percent BETWEEN ? AND ? `
      objsearcharr.push(search_data['per_table_from'])
      objsearcharr.push(search_data['per_table_to'])
    }else if(search_data['metric_length_from'] && search_data['metric_length_to']){
      objsearch += objsearcharr.length == 0 ? `WHERE meas_length BETWEEN ? AND ? `:` AND meas_length BETWEEN ? AND ? `
      objsearcharr.push(search_data['metric_length_from'])
      objsearcharr.push(search_data['metric_length_to'])
    }else if(search_data['metric_width_from'] && search_data['metric_width_to']){
      objsearch += objsearcharr.length == 0 ? `WHERE meas_width BETWEEN ? AND ? `:` AND meas_width BETWEEN ? AND ? `
      objsearcharr.push(search_data['metric_width_from'])
      objsearcharr.push(search_data['metric_width_to'])
    }else if(search_data['metric_depth_from'] && search_data['metric_depth_to']){
      objsearch += objsearcharr.length == 0 ? `WHERE meas_depth BETWEEN ? AND ? `:` AND meas_depth BETWEEN ? AND ? `
      objsearcharr.push(search_data['metric_depth_from'])
      objsearcharr.push(search_data['metric_depth_to'])
    }else if(search_data['crown_height_from'] && search_data['crown_height_to']){
      objsearch += objsearcharr.length == 0 ? `WHERE crown_height BETWEEN ? AND ? `:` AND crown_height BETWEEN ? AND ? `
      objsearcharr.push(search_data['crown_height_from'])
      objsearcharr.push(search_data['crown_height_to'])
    }else if(search_data['crown_angle_from'] && search_data['crown_angle_to']){
      objsearch += objsearcharr.length == 0 ? `WHERE crown_angle BETWEEN ? AND ? `:` AND crown_angle BETWEEN ? AND ? `
      objsearcharr.push(search_data['crown_angle_from'])
      objsearcharr.push(search_data['crown_angle_to'])
    }else if(search_data['pavilion_depth_from'] && search_data['pavilion_depth_to']){
      objsearch += objsearcharr.length == 0 ? `WHERE pavillion_depth BETWEEN ? AND ? `:` AND pavillion_depth BETWEEN ? AND ? `
      objsearcharr.push(search_data['pavilion_depth_from'])
      objsearcharr.push(search_data['pavilion_depth_to'])
    }else if(search_data['pavilion_angle_from'] && search_data['pavilion_angle_to']){
      objsearch += objsearcharr.length == 0 ? `WHERE pavillion_angle BETWEEN ? AND ? `:` AND pavillion_angle BETWEEN ? AND ? `
      objsearcharr.push(search_data['pavilion_angle_from'])
      objsearcharr.push(search_data['pavilion_angle_to'])
    }else if(search_data['girdle'].length > 0){
      objsearch += objsearcharr.length == 0 ? `WHERE girdle_min IN (?) `:` AND girdle_min IN (?) `
      objsearcharr.push(search_data['girdle'])
    }else if(search_data['culet_size'].length > 0){
      objsearch += objsearcharr.length == 0 ? `WHERE culet_size IN (?) `:` AND culet_size IN (?) `
      objsearcharr.push(search_data['culet_size'])
    }else if(search_data['culet_condition'].length > 0){
      objsearch += objsearcharr.length == 0 ? `WHERE culet_condition IN (?) `:` AND culet_condition IN (?) `
      objsearcharr.push(search_data['culet_condition'])
    }else if(search_data['treatment']){
      if(search_data['treatment'] != 'no-treatment'){
        objsearch += objsearcharr.length == 0 ? `WHERE treatment = ? `:` AND treatment = ? `
        objsearcharr.push(search_data['treatment']);
      }
    }else if(search_data['symbol_checkbox'].length > 0){
      objsearch += objsearcharr.length == 0 ? `WHERE symbols IN (?) `:` AND symbols IN (?) `
      objsearcharr.push(search_data['symbol_checkbox'])
    }else if(search_data['lab_report_number']){
      objsearch += objsearcharr.length == 0 ? `WHERE report_number = ? `:` AND report_number = ? `
      objsearcharr.push(search_data['lab_report_number']);
    }else if(search_data['media'].length>0){
      for(var i=0;i<search_data['media'].length;i++){
        if(search_data['media'][i]=="Photo"){
          objsearch += objsearcharr.length == 0 ? `WHERE diamond_img!='' `:` AND diamond_img !='' `
        }else if(search_data['media'][i]=="Video"){
          objsearch += objsearcharr.length == 0 ? `WHERE video_link!='' `:` AND video_link!='' `
        }else if(search_data['media'][i]=="Lab report"){
          objsearch += objsearcharr.length == 0 ? `WHERE report_file!='' `:` AND report_file!='' `
        }
      }
    }
    objsearcharr=objsearcharr.concat(objsearcharr)
    //console.log(objsearcharr)
    let sql = `SELECT * FROM diamonds ${objsearch}ORDER BY ${ columns[order[0].column].data} ${order[0].dir} limit ${start},${length};SELECT count(*) as cnt FROM diamonds ${objsearch}`;
    // console.log('reqadmin:::' + JSON.stringify(req.body))              //log
    conn.query(sql, objsearcharr, function (error, resdata){
      if(error){
        res.json({status: 501, success: false, message: error});
      }
      else{
        res.json({status: 200, success: true, message: "Get diamond successfully", response: resdata[0], TotalRecords:resdata[1][0]});
      }
    });
  }
});


router.post('/GetOrderDetails',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var { order_id, columns, order, start, length } = req.body;
    var objsearch=``;
    var objsearcharr = [];
    let sql = "SELECT *,CONCAT(REPEAT('0', 7-LENGTH(order_id)), order_id) AS order_number FROM `orders` WHERE order_id = ?";
    conn.query(sql, [order_id], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0) {
          var diamond_id = results[0].item
          if(diamond_id != '' && diamond_id != undefined) {
            objsearcharr = objsearcharr.concat(objsearcharr)
            let sql1 = `SELECT * FROM diamonds WHERE diamond_id IN (${diamond_id}) ${objsearch}ORDER BY ${columns[order[0].column].data} ${order[0].dir} limit ${start},${length};SELECT count(*) as cnt FROM diamonds WHERE diamond_id IN (${diamond_id}) ${objsearch}`;
            console.log(sql1)
            conn.query(sql1, objsearcharr, function (error, resdata) {
              if (error) {
                res.json({status: 501, success: false, message: error});
              } else {
                console.log(resdata[0])
                res.json({
                  status: 200, success: true,
                  message: "Get diamond successfully",
                  response: resdata[0],
                  TotalRecords: resdata[1][0],
                  OrderDetails: results[0]
                });
              }
            });
          }
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/removeAdmin',[
  check('adminId').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var adminId = req.body.adminId;
    let sql = "DELETE FROM `admin` WHERE adminId = ?";
    conn.query(sql, [adminId], function (err, results) {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        res.json({status: 200, success: true, message: "Admin Removed Successfully"});
      }
    });
  }
});

router.post('/addSubAdmin',[
  check('firstname').exists(),
  check('lastname').exists(),
  check('email').exists(),
  check('username').exists()
], (req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    var {adminId,firstname,lastname,email,username,mobileno,about} = req.body
    email = email.toLowerCase()
    firstname = capitalizeFirstLetter(firstname)
    lastname = capitalizeFirstLetter(lastname)
    if (EmailValidator.validate(email)) {
      let data = {
        firstname:firstname,
        lastname:lastname,
        mobileno:mobileno,
        about:about,
        email:email,
        username:username
      }
      if(!adminId) {
        let sql = "SELECT * FROM `admin` WHERE username = ?";
        conn.query(sql, [username], (err, results) => {
          if (err) {
            res.json({status: 501, success: false, message: err});
          } else {
            if (results.length > 0) {
              res.json({status: 400, success: false, message: "Username Already Exits"});
            } else {
              if (req.files && Object.keys(req.files).length > 0) {
                if (req.files.photo_file != undefined) {
                  let photo_file = req.files.photo_file;
                  photo_file.name = photo_file.name.replace(/ /g,"_");
                  let filename = Math.floor(Math.random() * 100000) + '-' + photo_file.name;
                  let file_url = './upload/kyc/' + filename;
                  let file_name = 'upload/kyc/' + filename;
                  photo_file.mv(file_url, function (error) {
                    if (error) {
                      res.json({"status": 400, "message": error});
                    } else {
                      data.profile = file_name
                      data.username = username
                      data.isActive = 2
                      data.type = 2
                      let sql1 = "INSERT INTO `admin` SET ?";
                      conn.query(sql1, data, async (err, results1) => {
                        if (err) {
                          res.json({status: 501, success: false, message: err});
                        } else {
                          if (results1.affectedRows === 1) {
                            var mykey = crypto.createCipher('aes-128-cbc', JWTSECRET);
                            var hash = mykey.update(username, 'utf8', 'hex')
                            hash += mykey.final('hex');
                            var token = hash;
                            var html = "";
                            html += `<h1>Striliant</h1>`;
                            html += `You are now a Admin for Striliant <br>`;
                            html += `<br> Firstname is : ${firstname}`;
                            html += `<br> Lastname is : ${lastname}`;
                            html += `<br> Username is : ${username}`;
                            html += `<br> Mobile No is : ${mobileno}`;
                            html += `<br><a href="` + FRONTEND_URL + `/admin/verify-account/` + token + `">Click to Here Verify Your Account</a>`;
                            var subject = "Verify Admin Account"
                            var check = helper.email_helper('', email, subject, html)
                            if (check) {
                              res.json({status: 200, success: true, message: "Admin Creating Successfully"});
                            } else {
                              res.json({status: 400, success: false, message: 'Admin Creating Successfully but Mail not Received'});
                            }
                          } else {
                            res.json({status: 400, success: false, message: 'Admin Creating Failed'});
                          }
                        }
                      });
                    }
                  });
                }
              }else{
                data.username = username
                data.isActive = 2
                data.type = 2
                let sql1 = "INSERT INTO `admin` SET ?";
                conn.query(sql1, data, async (err, results1) => {
                  if (err) {
                    res.json({status: 501, success: false, message: err});
                  } else {
                    if (results1.affectedRows === 1) {
                      var mykey = crypto.createCipher('aes-128-cbc', JWTSECRET);
                      var hash = mykey.update(username, 'utf8', 'hex')
                      hash += mykey.final('hex');
                      var token = hash;
                      var html = "";
                      html += `<h1>Striliant</h1>`;
                      html += `You are now a Admin for Striliant <br>`;
                      html += `<br> Firstname is : ${firstname}`;
                      html += `<br> Lastname is : ${lastname}`;
                      html += `<br> Username is : ${username}`;
                      html += `<br> Mobile No is : ${mobileno}`;
                      html += `<br><a href="` + FRONTEND_URL + `/admin/verify-account/` + token + `">Click to Here Verify Your Account</a>`;
                      var subject = "Verify Admin Account"
                      var check = helper.email_helper('', email, subject, html)
                      if (check) {
                        res.json({status: 200, success: true, message: "Admin Creating Successfully"});
                      } else {
                        res.json({status: 400, success: false, message: 'Admin Creating Successfully but Mail not Received'});
                      }
                    } else {
                      res.json({status: 400, success: false, message: 'Admin Creating Failed'});
                    }
                  }
                });
              }
            }
          }
        });
      }else{
        let sql = "SELECT * FROM `admin` WHERE username = ? AND adminId != ?";
        conn.query(sql, [username,adminId], (err, results) => {
          if (err) {
            res.json({status: 501, success: false, message: err});
          } else {
            if (results.length > 0) {
              res.json({status: 400, success: false, message: "Username Already Exits"});
            } else {
              if (req.files && Object.keys(req.files).length > 0) {
                if (req.files.photo_file != undefined) {
                  let photo_file = req.files.photo_file;
                  photo_file.name = photo_file.name.replace(/ /g,"_");
                  let filename = Math.floor(Math.random() * 100000) + '-' + photo_file.name;
                  let file_url = './upload/kyc/' + filename;
                  let file_name = 'upload/kyc/' + filename;
                  photo_file.mv(file_url, function (error) {
                    if (error) {
                      res.json({"status": 400, "message": error});
                    } else {
                      data.profile = file_name;
                      let sql1 = "UPDATE `admin` SET ?, updated_at = current_timestamp WHERE adminId = ?";
                      conn.query(sql1, [data, adminId], (err, results) => {
                        if (err) {
                          res.json({status: 501, success: false, message: err});
                        } else {
                          if (results.affectedRows === 1) {
                            res.json({status: 200, success: true, message: "Admin Update Successfully"});
                          } else {
                            res.json({status: 400, success: false, message: 'No data Found'});
                          }
                        }
                      });
                    }
                  });
                }
              }else{
                let sql1 = "UPDATE `admin` SET ?, updated_at = current_timestamp WHERE adminId = ?";
                conn.query(sql1, [data, adminId], (err, results) => {
                  if (err) {
                    res.json({status: 501, success: false, message: err});
                  } else {
                    if (results.affectedRows === 1) {
                      res.json({status: 200, success: true, message: "Admin Update Successfully"});
                    } else {
                      res.json({status: 400, success: false, message: 'No data Found'});
                    }
                  }
                });
              }
            }
          }
        });
      }
    }else{
      res.json({status: 400, success: false, message: 'Invalid Email Address.'});
    }
  }
});

router.post('/verify-account',[
  check('verify_token').exists(),
  check('password').exists().isLength({ min: 6 }).withMessage('must be at least 6 chars long'),
  check('confirm_password').exists().isLength({ min: 6 }).withMessage('must be at least 6 chars long')
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    const verify_token = req.body.verify_token;
    let mykey = crypto.createDecipher('aes-128-cbc',JWTSECRET);
    let hash = mykey.update(verify_token, 'hex', 'utf8')
    hash += mykey.final('utf8');
    var username = hash;
    if(password !== confirm_password){
      res.json({status: 400, success: false, message: 'Do not match Password and Confirm Password'});
    }
    let sql = "SELECT * FROM `admin` WHERE username = ?";
    conn.query(sql, [username], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0){
          if (results[0].isActive == 1){
            res.json({status: 200, success: true, message: "Your Account is Already Verify"});
          }else{
            let sql1 = "UPDATE `admin` SET password = ?, updated_at = current_timestamp WHERE username = ?";
            conn.query(sql1,[crypto.createHash('sha256').update(password, 'utf8').digest('hex'),username], (err, results1) => {
              if (err) {
                res.json({status: 501, success: false, message: err});
              } else {
                if (results1.affectedRows === 1){
                  let sql2 = "UPDATE `admin` SET isActive = ?, updated_at = current_timestamp WHERE username = ?";
                  conn.query(sql2,[1,username], (err, results2) => {
                    if (err) {
                      res.json({status: 501, success: false, message: err});
                    } else {
                      if (results2.affectedRows === 1){
                        res.json({status: 200, success: true, message: "Your Account is Verify"});
                      }else{
                        res.json({status: 400, success: false, message: "Your Account is not Verify"});
                      }
                    }
                  });
                }else{
                  res.json({status: 400, success: false, message: "Your Account is Already set of Password"});
                }
              }
            });
          }
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/GetAdmin',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var { adminId, columns, order, start, length } = req.body;
    var objsearch=``;
    var objsearcharr = [];
    if(adminId != '' && adminId != undefined){
      objsearch += objsearcharr.length == 0 ? `WHERE adminId != ? `:` AND adminId != ? `
      objsearcharr.push(adminId);
    }
    objsearcharr=objsearcharr.concat(objsearcharr)
    //console.log(objsearcharr)
    let sql = `SELECT * FROM Striliant.admin ${objsearch}ORDER BY ${columns[order[0].column].data} ${order[0].dir} LIMIT ${start},${length};SELECT count(*) as cnt FROM Striliant.admin ${objsearch}`;
    //console.log(sql)
    conn.query(sql, objsearcharr, (error, resdata) => {
      if(error){
        res.json({status: 501, success: false, message: error});
      }else{
        res.json({status: 200, success: true, message: "Get admin successfully", response: resdata[0], TotalRecords:resdata[1][0]});
      }
    });
  }
});

router.post('/AdminChangeStatus',[
  check('adminId').exists()
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let isActive = 1;
    let adminId = req.body.adminId;
    let sql = "SELECT * FROM `admin` WHERE adminId = ?";
    conn.query(sql, [adminId], (err, results) => {
      if (err) {
        res.json({status: 501, success: false, message: err});
      } else {
        if (results.length > 0) {
          let responseActive = results[0].isActive;
          if(responseActive === 1){
            isActive = 0;
          }
          let sql1 = "UPDATE `admin` SET isActive = ?, updated_at = current_timestamp WHERE adminId = ?";
          conn.query(sql1, [isActive,adminId], (err, results1) => {
            if (err) {
              res.json({status: 501, success: false, message: err});
            } else {
              if (results1.affectedRows === 1) {
                if(isActive === 1){
                  res.json({status: 200, success: true, message: "Admin is Activated", response: 1});
                }else{
                  res.json({status: 200, success: true, message: "Admin is Deactivated", response: 0});
                }
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/ExportAdmin',(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var adminId = req.body.adminId;
    var objsearch=``;
    var objsearcharr = [];
    if(adminId != '' && adminId != undefined){
      objsearch += objsearcharr.length == 0 ? `WHERE adminId != ? `:` AND adminId != ? `
      objsearcharr.push(adminId);
    }
    objsearcharr=objsearcharr.concat(objsearcharr)
    let sql = `SELECT adminId,firstname,lastname,username,email,mobileno,about,isActive,created_at,profile FROM admin ${objsearch}`;
    conn.query(sql, objsearcharr, (error, resdata) => {
      if(error){
        res.json({status: 501, success: false, message: error});
      }else{
        let tmpRes = resdata;
        let resNew = [];
        tmpRes.forEach(function (item)
        {
          item.profile = (item.profile != null) ? FRONTEND_URL+''+ item.profile: ''
          item.isActive = (item.isActive == 1) ? 'Active' : 'Deactivated'
          item.created_at = moment(item.created_at).format('DD/MM/YYYY');
          resNew.push(item);
        });
        res.json({status: 200, success: true, message: "Export Admin successfully", data: resNew});
      }
    });
  }
});

router.post('/GetUsers',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var { columns, order, start, length } = req.body;
    let sql = `SELECT * FROM users ORDER BY ${columns[order[0].column].data} ${order[0].dir} LIMIT ${start},${length};SELECT count(*) as cnt FROM users`;
    conn.query(sql, (error, resdata) => {
      if(error){
        res.json({status: 501, success: false, message: error});
      }else{
        if(resdata[0].length > 0){
          let sql1 = 'SELECT * FROM `admin`';
          conn.query(sql1, (error, result) => {
            if(error){
              res.json({status: 400, success: false, message: error});
            }else{
              res.json({status: 200, success: true, message: "Get Users successfully", response: resdata[0], TotalRecords:resdata[1][0], AdminData:result});
            }
          });
        }else{
          res.json({status: 400, success: false, message: 'No data found'});
        }
      }
    });
  }
});

router.post('/GetSubscribers',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var { columns, order, start, length } = req.body;
    let sql = `SELECT * FROM subscribers ORDER BY ${columns[order[0].column].data} ${order[0].dir} LIMIT ${start},${length};SELECT count(*) as cnt FROM subscribers`;
    conn.query(sql, (error, resdata) => {
      if(error){
        res.json({status: 400, success: false, message: error});
      }else{
        if(resdata[0].length > 0){
          res.json({status: 200, success: true, message: "Get Users successfully", response: resdata[0], TotalRecords:resdata[1][0]});
        }else{
          res.json({status: 400, success: false, message: 'No data found'});
        }
      }
    });
  }
});

router.post('/GetAbandonedCheckout',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var { columns, order, start, length } = req.body;
    let sql = `SELECT ca.*,us.firstname,us.lastname FROM cart ca LEFT JOIN users us ON ca.userId = us.userId ORDER BY ${columns[order[0].column].data} ${order[0].dir} LIMIT ${start},${length};SELECT count(*) as cnt FROM cart`;
    conn.query(sql, (error, resdata) => {
      if(error){
        res.json({status: 400, success: false, message: error});
      }else{
        if(resdata[0].length > 0){
          let tempRes = resdata[0]
          let resNew = []
          tempRes.forEach(function (item){
            item['totalProducts'] = item['diamondList'].split(',').length
            resNew.push(item)
          });
          res.json({status: 200, success: true, message: "Get Users successfully", response: resNew, TotalRecords:resdata[1][0]});
        }else{
          res.json({status: 400, success: false, message: 'No data found'});
        }
      }
    });
  }
});

router.post('/GetBlog',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var { columns, order, start, length } = req.body;
    let sql = `SELECT * FROM blog ORDER BY ${columns[order[0].column].data} ${order[0].dir} LIMIT ${start},${length};SELECT count(*) as cnt FROM blog`;
    conn.query(sql, (error, resdata) => {
      if(error){
        res.json({status: 400, success: false, message: error});
      }else{
        if(resdata[0].length > 0){
          res.json({status: 200, success: true, message: "Get Blog successfully", response: resdata[0], TotalRecords:resdata[1][0]});
        }else{
          res.json({status: 400, success: false, message: 'No data found'});
        }
      }
    });
  }
});

router.post('/GetTemplates',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var { columns, order, start, length } = req.body;
    let sql = `SELECT * FROM email_templates ORDER BY ${columns[order[0].column].data} ${order[0].dir} LIMIT ${start},${length};SELECT count(*) as cnt FROM email_templates`;
    conn.query(sql, (error, resdata) => {
      if(error){
        res.json({status: 400, success: false, message: error});
      }else{
        if(resdata[0].length > 0){
          res.json({status: 200, success: true, message: "Get Templates successfully", response: resdata[0], TotalRecords:resdata[1][0]});
        }else{
          res.json({status: 400, success: false, message: 'No data found'});
        }
      }
    });
  }
});


router.post('/GetTestimonials',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var { columns, order, start, length } = req.body;
    let sql = `SELECT * FROM testimonials ORDER BY ${columns[order[0].column].data} ${order[0].dir} LIMIT ${start},${length};SELECT count(*) as cnt FROM testimonials`;
    conn.query(sql, (error, resdata) => {
      if(error){
        res.json({status: 400, success: false, message: error});
      }else{
        if(resdata[0].length > 0){
          res.json({status: 200, success: true, message: "Get Testimonials successfully", response: resdata[0], TotalRecords:resdata[1][0]});
        }else{
          res.json({status: 400, success: false, message: 'No data found'});
        }
      }
    });
  }
});

router.post('/GetBrands',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var { columns, order, start, length } = req.body;
    let sql = `SELECT * FROM brands ORDER BY ${columns[order[0].column].data} ${order[0].dir} LIMIT ${start},${length};SELECT count(*) as cnt FROM brands`;
    conn.query(sql, (error, resdata) => {
      if(error){
        res.json({status: 400, success: false, message: error});
      }else{
        if(resdata[0].length > 0){
          res.json({status: 200, success: true, message: "Get Brands successfully", response: resdata[0], TotalRecords:resdata[1][0]});
        }else{
          res.json({status: 400, success: false, message: 'No data found'});
        }
      }
    });
  }
});

router.post('/GetFolders',(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var directoryPath = './upload/diamonds/'
    var Res = getDirectories(directoryPath)
    if(Res.length > 0){
      res.json({status: 200, success: true, message: "Get Folder Name successfully", response: Res});
    }else{
      res.json({status: 400, success: false, message: 'No data found'});
    }
  }
});

router.post('/GetSubFolders',(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var folderName =  req.body.folderName;
    var directoryPath = `./upload/diamonds/${folderName}/`
    var Res = []
    fs.readdir(directoryPath, (err, files) => {
      files.forEach(file => {
        Res.push(file)
      });
      if(Res.length > 0){
        res.json({status: 200, success: true, message: "Get Folder Name successfully", response: Res});
      }else{
        res.json({status: 400, success: false, message: 'No data found'});
      }
    });
  }
});

function getDirectories(path) {
  return fs.readdirSync(path).filter(function (file) {
    return fs.statSync(path+'/'+file).isDirectory();
  });
}

router.post('/removeFiles', function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var folderName = req.body.folderName;
    var fileName = req.body.fileName;
    var directoryPath = `./upload/diamonds/${folderName}/${fileName}`
    fs.unlink(directoryPath, function(err) {
      if (err) {
        res.json({status: 400, success: false, message: 'No data found'});
      } else {
        res.json({status: 200, success: true, message: "Successfully deleted the file"});
      }
    });
  }
});

router.post('/GetMilestones',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var { columns, order, start, length } = req.body;
    let sql = `SELECT * FROM milestones ORDER BY ${columns[order[0].column].data} ${order[0].dir} LIMIT ${start},${length};SELECT count(*) as cnt FROM milestones`;
    conn.query(sql, (error, resdata) => {
      if(error){
        res.json({status: 400, success: false, message: error});
      }else{
        if(resdata[0].length > 0){
          res.json({status: 200, success: true, message: "Get Milestones successfully", response: resdata[0], TotalRecords:resdata[1][0]});
        }else{
          res.json({status: 400, success: false, message: 'No data found'});
        }
      }
    });
  }
});

router.post('/addUser',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let {userId,firstname,lastname,username,email,password,mobile,company_name,designation,business_type,country,state,city,zipcode,address,notes,tags} = req.body;

    let data = {
      userId:userId,
      firstname:capitalizeFirstLetter(firstname),
      lastname:capitalizeFirstLetter(lastname),
      username:username,
      email:email,
      mobile:mobile,
      company_name:company_name,
      designation:designation,
      business_type:business_type,
      zipcode:zipcode,
      address:address,
      country:capitalizeFirstLetter(country),
      state:capitalizeFirstLetter(state),
      city:capitalizeFirstLetter(city),
      notes:notes,
      tags:tags
    }
    if(password){
      data.password = crypto.createHash('sha256').update(password, 'utf8').digest('hex')
    }
    if(userId){
      let sql = "SELECT * FROM `users` WHERE username = ? AND userId != ?";
      conn.query(sql, [username,userId], (err, results) => {
        if (err) {
          res.json({status: 400, success: false, message: err});
        } else {
          if (results.length > 0) {
            res.json({status: 400, success: false, message: 'Username Already Exits'});
          }else{
            let sql = "UPDATE users SET ? WHERE userId = ?";
            conn.query(sql, [data, userId], (err, results) => {
              if (err) {
                res.json({status: 400, success: false, message: err});
              } else {
                if (results.affectedRows === 1) {
                  res.json({status: 200, success: true, message: "Customer Update Successfully", response: results[0]});
                } else {
                  res.json({status: 400, success: false, message: 'No data Found'});
                }
              }
            });
          }
        }
      });
    }else{
      let sql = "SELECT * FROM `users` WHERE username = ?";
      conn.query(sql, [username], (err, results) => {
        if (err) {
          res.json({status: 400, success: false, message: err});
        } else {
          if (results.length > 0) {
            res.json({status: 400, success: false, message: 'Username Already Exits'});
          } else {
            data.email = email;
            data.username = username;
            data.isActive = 1;
            let sql = "INSERT INTO users SET ?";
            conn.query(sql, data, (err, results) => {
              if (err) {
                res.json({status: 400, success: false, message: err});
              } else {
                if (results.affectedRows === 1) {
                  res.json({status: 200, success: true, message: "Customer Created Successfully", response: results[0]});
                } else {
                  res.json({status: 400, success: false, message: 'No data Found'});
                }
              }
            });
          }
        }
      });
    }
  }
});

router.post('/assignManager',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let {userId,adminId} = req.body;
    let sql = "UPDATE users SET adminId = ? WHERE userId = ?";
    conn.query(sql, [adminId, userId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.affectedRows === 1) {
          res.json({status: 200, success: true, message: "Assign sales manager Successfully", response: results[0]});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });

  }
});

router.post('/addBlog',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let {blogId,title,description} = req.body;

    let data = {
      title:title,
      description:description
    }

    if (req.files && Object.keys(req.files).length > 0) {
      if (req.files.blogImg != undefined) {
        let blogImg = req.files.blogImg;
        blogImg.name = blogImg.name.replace(/ /g,"_");
        let filename = Math.floor(Math.random() * 100000) + '-' + blogImg.name;
        let file_url = './upload/blog/' + filename;
        let file_name = 'upload/blog/' + filename;
        blogImg.mv(file_url, function (error) {
          if (error) {
            res.json({status: 400, success: false, message: error});
          } else {
            data.image = file_name;
          }
        });
      }
    }
    let sql = "SELECT * FROM `blog` WHERE blogId = ?";
    conn.query(sql, [blogId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let sql = "UPDATE `blog` SET ? WHERE blogId = ?";
          conn.query(sql, [data, blogId], (err, results) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results.affectedRows === 1) {
                res.json({status: 200, success: true, message: "Blog Update Successfully", response: results[0]});
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        }else{
          data.status = 1;
          let sql = "INSERT INTO blog SET ?";
          conn.query(sql, data, (err, results) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results.affectedRows === 1) {
                res.json({status: 200, success: true, message: "Blog Created Successfully", response: results[0]});
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        }
      }
    });
  }
});


router.post('/addTemplate',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let {templateId,email_name,email_subject,email_content} = req.body;

    let data = {
      email_name:email_name,
      email_subject:email_subject,
      email_content:email_content
    }

    let sql = "SELECT * FROM `email_templates` WHERE templateId = ?";
    conn.query(sql, [templateId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let sql = "UPDATE `email_templates` SET ?, updated_at = current_timestamp WHERE templateId = ?";
          conn.query(sql, [data, templateId], (err, results) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results.affectedRows === 1) {
                res.json({status: 200, success: true, message: "Template Update Successfully", response: results[0]});
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        }else{
          let sql = "INSERT INTO `email_templates` SET ?";
          conn.query(sql, data, (err, results) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results.affectedRows === 1) {
                res.json({status: 200, success: true, message: "Template Created Successfully", response: results[0]});
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        }
      }
    });
  }
});


router.post('/addTestimonials',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let {testimonialsId,name,title,description} = req.body;

    let data = {
      name:name,
      title:title,
      description:description
    }

    if (req.files && Object.keys(req.files).length > 0) {
      if (req.files.TestiImg != undefined) {
        let TestiImg = req.files.TestiImg;
        TestiImg.name = TestiImg.name.replace(/ /g,"_");
        let filename = Math.floor(Math.random() * 100000) + '-' + TestiImg.name;
        let file_url = './upload/testimonials/' + filename;
        let file_name = 'upload/testimonials/' + filename;
        TestiImg.mv(file_url, function (error) {
          if (error) {
            res.json({status: 400, success: false, message: error});
          } else {
            data.profile = file_name;
          }
        });
      }
    }
    let sql = "SELECT * FROM `testimonials` WHERE testimonialsId = ?";
    conn.query(sql, [testimonialsId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let sql = "UPDATE `testimonials` SET ? WHERE testimonialsId = ?";
          conn.query(sql, [data, testimonialsId], (err, results) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results.affectedRows === 1) {
                res.json({status: 200, success: true, message: "Testimonial Update Successfully", response: results[0]});
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        }else{
          data.status = 1;
          let sql = "INSERT INTO `testimonials` SET ?";
          conn.query(sql, data, (err, results) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results.affectedRows === 1) {
                res.json({status: 200, success: true, message: "Testimonial Created Successfully", response: results[0]});
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        }
      }
    });
  }
});

router.post('/addBrands',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let {brandId,title} = req.body;
    let data = {
      title:title
    }
    if (req.files && Object.keys(req.files).length > 0) {
      if (req.files.BrandImg != undefined) {
        let BrandImg = req.files.BrandImg;
        BrandImg.name = BrandImg.name.replace(/ /g,"_");
        let filename = Math.floor(Math.random() * 100000) + '-' + BrandImg.name;
        let file_url = './upload/brands/' + filename;
        let file_name = 'upload/brands/' + filename;
        BrandImg.mv(file_url, function (error) {
          if (error) {
            res.json({status: 400, success: false, message: error});
          } else {
            data.profile = file_name;
          }
        });
      }
    }
    let sql = "SELECT * FROM `brands` WHERE brandId = ?";
    conn.query(sql, [brandId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let sql = "UPDATE `brands` SET ? WHERE brandId = ?";
          conn.query(sql, [data, brandId], (err, results) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results.affectedRows === 1) {
                res.json({status: 200, success: true, message: "Brand Update Successfully", response: results[0]});
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        }else{
          data.status = 1;
          let sql = "INSERT INTO `brands` SET ?";
          conn.query(sql, data, (err, results) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results.affectedRows === 1) {
                res.json({status: 200, success: true, message: "Brand Created Successfully", response: results[0]});
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        }
      }
    });
  }
});

router.post('/addMilestones',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let {milestonesId,title,description} = req.body;

    let data = {
      title:title,
      description:description
    }

    if (req.files && Object.keys(req.files).length > 0) {
      if (req.files.MileImg != undefined) {
        let MileImg = req.files.MileImg;
        MileImg.name = MileImg.name.replace(/ /g,"_");
        let filename = Math.floor(Math.random() * 100000) + '-' + MileImg.name;
        let file_url = './upload/milestones/' + filename;
        let file_name = 'upload/milestones/' + filename;
        MileImg.mv(file_url, function (error) {
          if (error) {
            res.json({status: 400, success: false, message: error});
          } else {
            data.profile = file_name;
          }
        });
      }
    }
    let sql = "SELECT * FROM `milestones` WHERE milestonesId = ?";
    conn.query(sql, [milestonesId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let sql = "UPDATE `milestones` SET ? WHERE milestonesId = ?";
          conn.query(sql, [data, milestonesId], (err, results) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results.affectedRows === 1) {
                res.json({status: 200, success: true, message: "Milestone Update Successfully", response: results[0]});
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        }else{
          data.status = 1;
          let sql = "INSERT INTO `milestones` SET ?";
          conn.query(sql, data, (err, results) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results.affectedRows === 1) {
                res.json({status: 200, success: true, message: "Milestone Created Successfully", response: results[0]});
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        }
      }
    });
  }
});

router.post('/GetCustomer',[
  //passport.authenticate('adminLogin', { session: false }),
  check('userId').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    var userId = req.body.userId;
    let sql = "SELECT * FROM `users` WHERE userId = ?";
    conn.query(sql, [userId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: results[0]});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/GetRecordBlog',[
  check('blogId').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    var blogId = req.body.blogId;
    let sql = "SELECT * FROM `blog` WHERE blogId = ?";
    conn.query(sql, [blogId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: results[0]});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/GetRecordTemplate',[
  check('templateId').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    var templateId = req.body.templateId;
    let sql = "SELECT * FROM `email_templates` WHERE templateId = ?";
    conn.query(sql, [templateId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: results[0]});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/GetRecordTestimonials',[
  check('testimonialsId').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    var testimonialsId = req.body.testimonialsId;
    let sql = "SELECT * FROM `testimonials` WHERE testimonialsId = ?";
    conn.query(sql, [testimonialsId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: results[0]});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/GetRecordSettings',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    let sql = "SELECT * FROM `homepage_settings`";
    conn.query(sql, (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: results});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/GetRecordBrands',[
  check('brandId').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    var brandId = req.body.brandId;
    let sql = "SELECT * FROM `brands` WHERE brandId = ?";
    conn.query(sql, [brandId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: results[0]});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/GetRecordMilestones',[
  check('milestonesId').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    var milestonesId = req.body.milestonesId;
    let sql = "SELECT * FROM `milestones` WHERE milestonesId = ?";
    conn.query(sql, [milestonesId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: results[0]});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/UserChangeStatus',[
  check('userId').exists()
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let isActive = 1;
    let userId = req.body.userId;
    let sql = "SELECT * FROM `users` WHERE userId = ?";
    conn.query(sql, [userId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let responseActive = results[0].isActive;
          if(responseActive === 1){
            isActive = 0;
          }
          let sql1 = "UPDATE `users` SET isActive = ? WHERE userId = ?";
          conn.query(sql1, [isActive,userId], (err, results1) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results1.affectedRows === 1) {
                if(isActive === 1){
                  res.json({status: 200, success: true, message: "Customer is Activated", response: 1});
                }else{
                  res.json({status: 200, success: true, message: "Customer is Deactivated", response: 0});
                }
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/SettingsChangeStatus',[
  check('key').exists()
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let status = 1;
    let key = req.body.key;
    let sql = "SELECT * FROM `homepage_settings` WHERE `key` = ?";
    conn.query(sql, [key], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let responseActive = results[0].status;
          if(responseActive === 1){
            status = 0;
          }
          let sql1 = "UPDATE `homepage_settings` SET status = ? WHERE `key` = ?";
          conn.query(sql1, [status,key], (err, results1) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results1.affectedRows === 1) {
                if(status === 1){
                  res.json({status: 200, success: true, message: "Settings is Activated", response: 1});
                }else{
                  res.json({status: 200, success: true, message: "Settings is Deactivated", response: 0});
                }
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/removeUser',[
  check('userId').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var userId = req.body.userId;
    let sql = "DELETE FROM diamonds_search_saved WHERE userId = ?; DELETE FROM users WHERE userId = ?;";
    conn.query(sql, [userId, userId], function (err, results) {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        res.json({status: 200, success: true, message: "Customer Removed Successfully"});
      }
    });
  }
});

router.post('/removeSubscriber',[
  check('subscriber_id').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var subscriber_id = req.body.subscriber_id;
    let sql = "DELETE FROM `subscribers` WHERE subscriber_id = ?";
    conn.query(sql, [subscriber_id], function (err, results) {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        res.json({status: 200, success: true, message: "Subscriber Removed Successfully"});
      }
    });
  }
});

router.post('/ExportUser',(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    let sql = "SELECT userId,firstname,lastname,username,email,mobile,company_name,designation,business_type,country,state,city,zipcode,address,notes,tags,isActive,created_at FROM users";
    conn.query(sql, (error, resdata) => {
      if(error){
        res.json({status: 400, success: false, message: error});
      }else{
        let tmpRes = resdata;
        let resNew = [];
        tmpRes.forEach(function (item)
        {
          item.notes = (item.notes != null && item.notes != 'null') ? item.notes : ''
          item.tags = (item.tags != null && item.tags != 'null') ? item.tags : ''
          item.isActive = (item.isActive == 1) ? 'Active' : 'Deactivated'
          item.created_at = moment(item.created_at).format('DD/MM/YYYY');
          resNew.push(item);
        });
        res.json({status: 200, success: true, message: "Export Customers successfully", data: resNew});
      }
    });
  }
});

router.post('/uploadDiamonds',[
  check('adminId').exists(),
  check('rap_price').exists(),
  check('vendor_back').exists(),
  check('sale_back').exists(),
  check('shape').exists(),
  check('size').exists(),
  check('color').exists(),
  check('clarity').exists(),
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let {diamond_id,vendor_name,vendor_id,vendor_email,vendor_stock_id,adminId,stock_number,diamond_type,rap_price,vendor_back,sale_back,availability,country,state,city,shape,size,color,clarity,cut,polish,symmetry,fluor_intensity,fluor_color,meas_length,meas_width,meas_depth,depth_percent,table_percent,crown_angle,crown_height,pavillion_angle,pavillion_depth,girdle_condition,girdle_min,girdle_max,girdle_per,culet_condition,culet_size,treatment,laser_inscription,star_length,lab,report_number,report_date,lab_location,report_comment,symbols,fancy_color_intensity,fancy_color_overtone,fancy_color_dominant_color,fancy_color_secondary_color,sarine_loupe,seller_spec,shade,milky,eye_clean,open_inclusions,black_inclusions,white_inclusions,brands,report_upload_link,diamond_upload_link,video_link} = req.body;
    if (report_date!=''){
      report_date = moment(report_date.split("/").reverse().join("-")).format('YYYY-MM-DD');
    }else{
      report_date = null;
    }
    var newsymbols = ''
    if(symbols != ''){
      newsymbols = symbols.toString()
    }
    var new_open_inclusions = ''
    if(open_inclusions != '' && open_inclusions != null){
      new_open_inclusions = open_inclusions
    }
    var new_black_inclusions = ''
    if(black_inclusions != '' && black_inclusions != null){
      new_black_inclusions = black_inclusions
    }
    var new_white_inclusions = ''
    if(white_inclusions != '' && white_inclusions != null){
      new_white_inclusions = white_inclusions
    }
    var new_brands = ''
    if(brands != '' && brands != null){
      new_brands = brands
    }
    var vendor_price_back = 0;
    var vendor_subtotal = 0;
    var sale_price_back = 0;
    var sale_subtotal = 0;

    if(!vendor_back.startsWith('-')){
      vendor_back = '-'+vendor_back
    }
    if(!sale_back.startsWith('-')){
      sale_back = '-'+sale_back
    }
    vendor_price_back = parseFloat(rap_price) + parseFloat(rap_price*(vendor_back/100))
    vendor_subtotal = parseFloat(vendor_price_back)*parseFloat(size)
    sale_price_back = parseFloat(rap_price) + parseFloat(rap_price*(sale_back/100))
    sale_subtotal = parseFloat(sale_price_back)*parseFloat(size)

    let data = {
      vendor_name:vendor_name.toUpperCase(),
      vendor_id:vendor_id.toUpperCase(),
      vendor_email:vendor_email,
      vendor_stock_id:vendor_stock_id,
      adminId:adminId,
      diamond_type:diamond_type,
      stock_number:stock_number.toUpperCase(),
      rap_price:rap_price,
      vendor_back:vendor_back,
      vendor_price_back:vendor_price_back,
      vendor_subtotal:vendor_subtotal,
      sale_back:sale_back,
      sale_price_back:sale_price_back,
      sale_subtotal:sale_subtotal,
      availability:availability,
      country:country.toUpperCase(),
      state:state.toUpperCase(),
      city:city.toUpperCase(),
      shape:shape.toUpperCase(),
      size:size,
      color:color,
      clarity:clarity,
      cut:cut,
      polish:polish,
      symmetry:symmetry,
      fluor_intensity:fluor_intensity,
      fluor_color:fluor_color,
      meas_length:meas_length,
      meas_width:meas_width,
      meas_depth:meas_depth,
      depth_percent:depth_percent,
      table_percent:table_percent,
      crown_angle:crown_angle,
      crown_height:crown_height,
      pavillion_angle:pavillion_angle,
      pavillion_depth:pavillion_depth,
      girdle_condition:girdle_condition,
      girdle_min:girdle_min,
      girdle_max:girdle_max,
      girdle_per:girdle_per,
      culet_condition:culet_condition,
      culet_size:culet_size,
      treatment:treatment,
      laser_inscription:laser_inscription,
      star_length:star_length,
      lab:lab,
      report_number:report_number,
      report_date:report_date,
      lab_location:lab_location,
      report_comment:report_comment,
      symbols:newsymbols,
      fancy_color_intensity:fancy_color_intensity,
      fancy_color_overtone:fancy_color_overtone,
      fancy_color_dominant_color:fancy_color_dominant_color,
      fancy_color_secondary_color:fancy_color_secondary_color,
      sarine_loupe:sarine_loupe,
      seller_spec:seller_spec,
      shade:shade,
      milky:milky,
      eye_clean:eye_clean,
      open_inclusions:new_open_inclusions,
      black_inclusions:new_black_inclusions,
      white_inclusions:new_white_inclusions,
      brands:new_brands
    }
    if(report_upload_link != '' && report_upload_link != null){
      data.report_file = report_upload_link
    }
    if(diamond_upload_link != '' && diamond_upload_link != null){
      data.diamond_img = diamond_upload_link
    }
    if(video_link != '' && video_link != null){
      data.video_link = video_link
    }
    if (req.files && Object.keys(req.files).length > 0) {
      if(req.files.report_file != undefined) {
        let report_file = req.files.report_file;
        report_file.name = report_file.name.replace(/ /g,"_");
        let filename = report_file.name;
        let file_url = './upload/diamonds/'+lab+'/' + filename;
        let file_name = 'upload/diamonds/'+lab+'/' + filename;
        report_file.mv(file_url, function (error) {
          if (error) {
            res.json({status: 400, success: false, message: error});
          } else {
            data.report_file = file_name;
          }
        });
      }
      if(req.files.diamond_img != undefined){
        let diamond_img = req.files.diamond_img;
        diamond_img.name = diamond_img.name.replace(/ /g,"_");
        let filename1 = Math.floor(Math.random() * 100000) + '-' + diamond_img.name;
        let file_url1 = './upload/diamonds/' + filename1;
        let file_name1 = 'upload/diamonds/' + filename1;
        diamond_img.mv(file_url1, function (error) {
          if (error) {
            res.json({status: 400, success: false, message: error});
          } else {
            data.diamond_img = file_name1;
          }
        });
      }
      if(req.files.video_file != undefined){
        let video_file = req.files.video_file;
        video_file.name = video_file.name.replace(/ /g,"_");
        let filename2 = Math.floor(Math.random() * 100000) + '-' + video_file.name;
        let file_url2 = './upload/diamonds/' + filename2;
        let file_name2 = 'upload/diamonds/' + filename2;
        video_file.mv(file_url2, function (error) {
          if (error) {
            res.json({status: 400, success: false, message: error});
          } else {
            data.video_link = file_name2;
          }
        });
      }
    }

    if(diamond_id){
      let sql = "UPDATE diamonds SET ?, updated_at = current_timestamp WHERE diamond_id = ?";
      conn.query(sql, [data,diamond_id], (err, results) => {
        if (err) {
          res.json({status: 400, success: false, message: err});
        } else {
          if (results.affectedRows === 1) {
            res.json({status: 200, success: true, message: "Diamonds Update Successfully", response: results[0]});
          } else {
            res.json({status: 400, success: false, message: 'No data Found'});
          }
        }
      });
    }else{
      data.status = 1;
      let sql = "INSERT INTO diamonds SET ?";
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.json({status: 400, success: false, message: err});
        } else {
          if (results.affectedRows === 1) {
            res.json({status: 200, success: true, message: "Diamonds Upload Successfully", response: results[0]});
          } else {
            res.json({status: 400, success: false, message: 'No data Found'});
          }
        }
      });
    }
  }
});

router.post('/removeDiamond',[
  check('diamond_id').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var diamond_id = req.body.diamond_id;
    let sql = "DELETE FROM diamonds WHERE diamond_id = ?";
    conn.query(sql, [diamond_id], function (err, results) {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        res.json({status: 200, success: true, message: "Diamonds Removed Successfully"});
      }
    });
  }
});

router.post('/removeSelectedDiamond',[
  check('DiamondList').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var DiamondList = req.body.DiamondList;
    var diamond_id = DiamondList.toString()
    let sql = `DELETE FROM diamonds WHERE diamond_id IN (${diamond_id})`;
    conn.query(sql, function (err, results) {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        res.json({status: 200, success: true, message: "Diamonds Removed Successfully"});
      }
    });
  }
});

router.post('/addReports',[
  check('folder').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var folder = req.body.folder;
    var arrafile = []
    //console.log(req.files)
    if (req.files) {
      if (req.files.upload_file.name == undefined) {
        arrafile = req.files.upload_file
      } else {
        arrafile.push(req.files.upload_file)
      }
    }
    var count = 0
    if(arrafile.length > 0){
      arrafile.forEach(function(item){
        item.name = item.name.replace(/ /g,"_");
        var fileName = item.name;
        var filenameq = item;
        var path = './upload/diamonds/'+folder
        if (!fs.existsSync(path)) {
          fs.mkdirSync(path, { recursive: true })
        }
        filenameq.mv(`./upload/diamonds/${folder}/${fileName}`)
        count++;
      });
    }
    if(arrafile.length == count){
      res.json({status: 200, success: true, message: "File upload Successfully"});
    }else{
      res.json({status: 400, success: false, message: "File upload error"});
    }
  }
});

router.post('/GetDiamonds',[
  check('diamond_id').exists(),
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var diamond_id = req.body.diamond_id;
    let sql = "SELECT * FROM diamonds WHERE diamond_id = ?";
    conn.query(sql, [diamond_id], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: "Get Data Successfully", data: results[0]});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/GetCartData',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var {cartId, columns, order, start, length} = req.body;
    var objsearch = ``;
    var objsearcharr = [];
    let sql2 = "SELECT * FROM `cart` WHERE cartId = ?";
    conn.query(sql2, [cartId], (err, results2) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results2.length > 0) {
          var diamondList = results2[0].diamondList
          if(diamondList){
            objsearcharr=objsearcharr.concat(objsearcharr)
            let sql = `SELECT * FROM diamonds WHERE diamond_id IN (${diamondList}) ${objsearch}ORDER BY ${columns[order[0].column].data} ${order[0].dir} limit ${start},${length};SELECT count(*) as cnt FROM diamonds WHERE diamond_id IN (${diamondList}) ${objsearch}`;
            conn.query(sql, objsearcharr, function (error, resdata) {
              if (error) {
                res.json({status: 400, success: false, message: error});
              } else {
                if(resdata[0].length > 0){
                  if(diamondList){
                    diamondList = diamondList.split(',').map(Number)
                  }else{
                    diamondList = []
                  }
                  res.json({
                    status: 200, success: true,
                    message: "Get diamond successfully",
                    DiamondList : diamondList,
                    data: resdata[0],
                    TotalRecords: resdata[1][0]
                  });
                }else{
                  res.json({status: 400, success: false, message: 'No data Found', TotalRecords: 0});
                }
              }
            });
          }else{
            res.json({status: 400, success: false, message: 'No data Found', TotalRecords: 0});
          }
        } else {
          res.json({status: 400, success: false, message: 'No data Found', TotalRecords: 0});
        }
      }
    });
  }
});

router.post('/importDiamonds',[
  check('importData').exists()
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({"status": 422, "message": errors.array()});
  }else {
    const {importData,selectoption,adminId} = req.body;
    var json_data = JSON.parse(importData);
    var InsertArray = [];
    var UpdateArray = [];
    let updatesql = '';
    var TotalRow = json_data.length;
    var i = 1;
    json_data.forEach(function (e,i) {
      Object.keys(e).forEach(function (key) {
        var val = e[key],
            newKey = key.replace(/\s+/g, '_');
        delete json_data[i][key];
        json_data[i][newKey] = val;
      });
    });
    if(json_data.length > 0){
      json_data.forEach(function(item){
        let vendor_name = item.Vendor_Name
        let vendor_id = item.Vendor_ID
        let vendor_email = item.Vendor_Email
        let vendor_stock_id = item.Vendor_Stock_ID
        let diamond_type = item.Type
        let stock_number = item.Stock_Number
        let size = item.Size
        let rap_price = item.Rap_Price
        let vendor_back = item.Vendor_Back
        let vendor_price_back = parseFloat(rap_price) + parseFloat(rap_price*(vendor_back/100))
        let vendor_subtotal = parseFloat(vendor_price_back)*parseFloat(size)
        let sale_back = item.Sale_Back
        let sale_price_back = parseFloat(rap_price) + parseFloat(rap_price*(sale_back/100))
        let sale_subtotal = parseFloat(sale_price_back)*parseFloat(size)
        let availability = item.Availability
        let country = item.Country
        let state = item.State
        let city = item.City
        let shape = item.Shape
        let color = item.Color
        let clarity = item.Clarity
        let cut = item.Cut
        let polish = item.Polish
        let symmetry = item.Symmetry
        let fluor_intensity = item.Fluorescence_Intensity
        let fluor_color = item.Fluorescence_Color
        let meas_length = item.Measurements_Length
        let meas_width = item.Measurements_Width
        let meas_depth = item.Measurements_Depth
        let depth_percent = item.Depth_Percentage
        let table_percent = item.Table_Percentage
        let crown_angle = item.Crown_Angle
        let crown_height = item.Crown_Height
        let pavillion_angle = item.Pavilion_Angle
        let pavillion_depth = item.Pavilion_Depth
        let girdle_condition = item.Girdle_Depth
        let girdle_min = item.Girdle_Min
        let girdle_max = item.Girdle_Max
        let girdle_per = item.Girdle_Percentage
        let culet_condition = item.Culet_Condition
        let culet_size = item.Culet_Size
        let treatment = item.Treatment
        let laser_inscription = item.Laser_Inscription_Angle
        let star_length = item.Star_Length
        let lab = item.Lab
        let report_number = item.Report_Number
        let report_date = item.Report_Date
        let lab_location = item.Lab_Location
        let report_comment = item.Report_Comment
        let symbols = item.Key_to_Symbols
        let fancy_color_intensity = item.Fancy_Color_Intensity
        let fancy_color_overtone = item.Fancy_Color_Overtones
        let fancy_color_dominant_color = item.Fancy_Dominant_Color
        let fancy_color_secondary_color = item.Fancy_Secondary_Color
        let sarine_loupe = item.Sarine_Loupe
        let seller_spec = item.Seller_Spec
        let shade = item.Shade
        let milky = item.Milky
        let eye_clean = item.Eye_Clean
        let open_inclusions = item.Open_Inclusions
        let black_inclusions = item.Black_Inclusions
        let white_inclusions = item.White_Inclusions
        let brands = item.Brands
        let report_file = item.Report_File
        let diamond_img = item.Diamond_Image
        let video_link = item.Video_File

        let data = {
          vendor_name:vendor_name.toUpperCase(),
          vendor_id:vendor_id.toUpperCase(),
          vendor_email:vendor_email,
          vendor_stock_id:vendor_stock_id,
          adminId:adminId,
          diamond_type:(diamond_type != undefined) ? diamond_type : 'Natural',
          stock_number:stock_number.toUpperCase(),
          rap_price:(rap_price != undefined) ? rap_price : null,
          vendor_back:(vendor_back != undefined) ? vendor_back : null,
          vendor_price_back:(vendor_price_back != undefined) ? vendor_price_back : null,
          vendor_subtotal:(vendor_subtotal != undefined) ? vendor_subtotal : null,
          sale_back:(sale_back != undefined) ? sale_back : null,
          sale_price_back:(sale_price_back != undefined) ? sale_price_back : null,
          sale_subtotal:(sale_subtotal != undefined) ? sale_subtotal : null,
          availability:(availability != undefined) ? availability : 'NA',
          country:(country != undefined) ? country.toUpperCase() : null,
          state:(state != undefined) ? state.toUpperCase() : null,
          city:(city != undefined) ? city.toUpperCase() : null,
          shape:(shape != undefined) ? shape.toUpperCase() : null,
          size:(size != undefined) ? size : null,
          color:(color != undefined) ? color : null,
          clarity:(clarity != undefined) ? clarity : null,
          cut:(cut != undefined) ? cut : null,
          polish:(polish != undefined) ? polish : null,
          symmetry:(symmetry != undefined) ? symmetry : null,
          fluor_intensity:(fluor_intensity != undefined) ? fluor_intensity : null,
          fluor_color:(fluor_color != undefined) ? fluor_color : null,
          meas_length:(meas_length != undefined) ? meas_length : null,
          meas_width:(meas_width != undefined) ? meas_width : null,
          meas_depth:(meas_depth != undefined) ? meas_depth : null,
          depth_percent:(depth_percent != undefined) ? depth_percent : null,
          table_percent:(table_percent != undefined) ? table_percent : null,
          crown_angle:(crown_angle != undefined) ? crown_angle : null,
          crown_height:(crown_height != undefined) ? crown_height : null,
          pavillion_angle:(pavillion_angle != undefined) ? pavillion_angle : null,
          pavillion_depth:(pavillion_depth != undefined) ? pavillion_depth : null,
          girdle_condition:(girdle_condition != undefined) ? girdle_condition : null,
          girdle_min:(girdle_min != undefined) ? girdle_min : null,
          girdle_max:(girdle_max != undefined) ? girdle_max : null,
          girdle_per:(girdle_per != undefined) ? girdle_per : null,
          culet_condition:(culet_condition != undefined) ? culet_condition : null,
          culet_size:(culet_size != undefined) ? culet_size : null,
          treatment:(treatment != undefined) ? treatment : null,
          laser_inscription:(laser_inscription != undefined) ? laser_inscription : null,
          star_length:(star_length != undefined) ? star_length : null,
          lab:(lab != undefined) ? lab : null,
          report_number:(report_number != undefined) ? report_number : null,
          lab_location:(lab_location != undefined) ? lab_location : null,
          report_comment:(report_comment != undefined) ? report_comment : null,
          symbols:(symbols != undefined) ? symbols : null,
          fancy_color_intensity:(fancy_color_intensity != undefined) ? fancy_color_intensity : null,
          fancy_color_overtone:(fancy_color_overtone != undefined) ? fancy_color_overtone : null,
          fancy_color_dominant_color:(fancy_color_dominant_color != undefined) ? fancy_color_dominant_color : null,
          fancy_color_secondary_color:(fancy_color_secondary_color != undefined) ? fancy_color_secondary_color : null,
          sarine_loupe:(sarine_loupe != undefined) ? sarine_loupe : null,
          seller_spec:(seller_spec != undefined) ? seller_spec : null,
          shade:(shade != undefined) ? shade : null,
          milky:(milky != undefined) ? milky : null,
          eye_clean:(eye_clean != undefined) ? eye_clean : null,
          open_inclusions:(open_inclusions != undefined) ? open_inclusions : null,
          black_inclusions:(black_inclusions != undefined) ? black_inclusions : null,
          white_inclusions:(white_inclusions != undefined) ? white_inclusions : null,
          brands:(brands != undefined) ? brands : null,
          report_file:(report_file != undefined) ? report_file : null,
          diamond_img:(diamond_img != undefined) ? diamond_img : null,
          video_link:(video_link != undefined) ? video_link : null,
          status:1
        }
        if (report_date != '' && report_date != undefined) {
          report_date = moment(report_date, 'DD/MM/YYYY');
          data.report_date = moment(report_date).format('YYYY-MM-DD')
        } else {
          data.report_date = null;
        }
        if(selectoption == 'replace-all'){
          let sql = "DELETE FROM diamonds";
          conn.query(sql, function (err, results) {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              InsertArray.push(data);
              if(i === TotalRow){
                display()
              }
              i++;
            }
          });
        }else{
          if(stock_number != undefined){
            let sql = "SELECT * FROM diamonds WHERE stock_number = ?";
            conn.query(sql, [stock_number], (err, results) => {
              if (err) {
                res.json({status: 400, success: false, message: err});
              } else {
                if (results.length > 0) {
                  updatesql += `UPDATE diamonds SET ?, updated_at = current_timestamp WHERE stock_number = ${stock_number};`;
                  UpdateArray.push(data);
                  if(i === TotalRow){
                    display()
                  }
                  i++;
                }else{
                  InsertArray.push(data);
                  if(i === TotalRow){
                    display()
                  }
                  i++;
                }
              }
            });
          }else{
            InsertArray.push(data);
            if(i === TotalRow){
              display()
            }
            i++;
          }
        }
      });
    }else{
      res.json({status: 400, success: false, message: 'No data Found'});
    }
    function display()
    {
      var response = 0;
      if(InsertArray.length == 0 || UpdateArray.length == 0){
        response = 1
      }
      if(InsertArray.length == 0 && UpdateArray.length == 0){
        res.json({status: 400, success: false, message: "Please proper field out"});
      }else {
        if (InsertArray.length > 0) {
          var newArr = [];
          InsertArray.forEach(function (item) {
            newArr.push(Object.values(item))
          });
          let sql1 = "INSERT INTO diamonds (" + Object.keys(InsertArray[0]) + ") VALUES ?";
          conn.query(sql1, [newArr], async (err, results1) => {
            response+=1
            if(response == 2) {
              if (err) {
                res.json({status: 400, success: false, message: err});
              } else {
                res.json({status: 200, success: true, message: 'Diamonds Uploads File Successfully'});
              }
            }
          });
        }
        if (UpdateArray.length > 0) {
          conn.query(updatesql, UpdateArray, async (err, results2) => {
            response+=1
            if(response == 2) {
              if (err) {
                res.json({status: 400, success: false, message: err});
              } else {
                res.json({status: 200, success: true, message: 'Diamonds Uploads File Successfully'});
              }
            }
          });
        }
      }
    }
  }
});

router.post('/searchOrders',[
  check('columns').exists(),
  check('start').exists(),
  check('order').exists(),
  check('length').exists()
],(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    var { status, columns, order, start, length } = req.body;
    var objsearch=``;
    var objsearcharr = [];
    if(status != 0 && status != undefined){
      objsearch += objsearcharr.length == 0 ? `WHERE status = ? `:` AND status = ? `
      objsearcharr.push(status)
    }
    objsearcharr=objsearcharr.concat(objsearcharr)
    let sql = `SELECT *,CONCAT(REPEAT('0', 7-LENGTH(order_id)), order_id) AS order_number FROM orders ${objsearch}ORDER BY ${ columns[order[0].column].data} ${order[0].dir} LIMIT ${start},${length};SELECT count(*) as cnt FROM orders ${objsearch}`;
    conn.query(sql, objsearcharr, function (error, resdata){
      if(error){
        res.json({status: 400, success: false, message: error});
      }else{
        if(resdata[0].length > 0){
          res.json({status: 200, success: true, message: "Get Orders successfully", response: resdata[0], TotalRecords:resdata[1][0]});
        }else{
          res.json({status: 400, success: false, message: 'No data Found', TotalRecords:0});
        }
      }
    });
  }
});

router.post('/ExportOrders',(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    let sql = "SELECT CONCAT(REPEAT('0', 7-LENGTH(order_id)), order_id) AS order_number,item,pieces,cts,avg_disc,total_cr,total_price,status,created_at,updated_at FROM orders";
    conn.query(sql, (error, resdata) => {
      if(error){
        res.json({status: 400, success: false, message: error});
      }else{
        if(resdata.length > 0){
          let tmpRes = resdata;
          let resNew = [];
          tmpRes.forEach(function (item)
          {
            item.order_number = '#'+item.order_number
            if(item.status == 1){
              item.status = 'Pending'
            }else if(item.status == 2){
              item.status = 'Completed'
            }else if(item.status == 3){
              item.status = 'Cancel'
            }else if(item.status == 4){
              item.status = 'Deleted'
            }
            //item.created_at = moment(item.created_at).format('DD/MM/YYYY');
            //item.updated_at = moment(item.updated_at).format('DD/MM/YYYY');
            resNew.push(item);
          });
          res.json({status: 200, success: true, message: "Export Diamonds Successfully", data: resNew});
        }else{
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/removeOrder',[
  check('order_id').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    console.log('removeorder:::'+ JSON.stringify(req.body))        //log
    var order_id = req.body.order_id;
    let sql = "DELETE FROM `orders` WHERE order_id = ?";
    conn.query(sql, [order_id], function (err, results) {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        res.json({status: 200, success: true, message: "Order Removed Successfully"});
      }
    });
  }
});
router.post('/multiRemoveOrder',[
  check('OrderList').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var orderlist = req.body.OrderList.toString()
    let sql = `DELETE FROM orders WHERE order_id IN (${orderlist});`
    conn.query(sql, function (err, results) {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        res.json({status: 200, success: true, message: "Order Removed Successfully"});
      }
    });
  }
});

router.post('/ExportDiamonds',(req,res)=>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err
    });
    return;
  } else {
    let sql = "SELECT diamond_id,vendor_name,vendor_id,vendor_email,vendor_stock_id,diamond_type,stock_number,rap_price,vendor_back,vendor_price_back,vendor_subtotal,sale_back,sale_price_back,sale_subtotal,availability,country,state,city,shape,size,color,clarity,cut,polish,symmetry,fluor_intensity,fluor_color,meas_length,meas_width,meas_depth,depth_percent,table_percent,crown_angle,crown_height,pavillion_angle,pavillion_depth,girdle_condition,girdle_min,girdle_max,girdle_per,culet_condition,culet_size,treatment,laser_inscription,star_length,lab,report_number,report_date,lab_location,report_comment,symbols,fancy_color_intensity,fancy_color_overtone,fancy_color_dominant_color,fancy_color_secondary_color,sarine_loupe,seller_spec,shade,milky,eye_clean,open_inclusions,black_inclusions,white_inclusions,brands,report_file,diamond_img,video_link,status,created_at,updated_at FROM diamonds";
    conn.query(sql, (error, resdata) => {
      if(error){
        res.json({status: 400, success: false, message: error});
      }else{
        let tmpRes = resdata;
        let resNew = [];
        tmpRes.forEach(function (item)
        {
          item.availability = (item.availability != null) ? item.availability : ''
          item.country = (item.country != null) ? item.country : ''
          item.state = (item.state != null) ? item.state : ''
          item.city = (item.city != null) ? item.city : ''
          item.size = (item.size != null) ? item.size : ''
          item.color = (item.color != null) ? item.color : ''
          item.clarity = (item.clarity != null) ? item.clarity : ''
          item.cut = (item.cut != null) ? item.cut : ''
          item.polish = (item.polish != null) ? item.polish : ''
          item.symmetry = (item.symmetry != null) ? item.symmetry : ''
          item.fluor_intensity = (item.fluor_intensity != null) ? item.fluor_intensity : ''
          item.fluor_color = (item.fluor_color != null) ? item.fluor_color : ''
          item.meas_length = (item.meas_length != null) ? item.meas_length : ''
          item.meas_width = (item.meas_width != null) ? item.meas_width : ''
          item.meas_depth = (item.meas_depth != null) ? item.meas_depth : ''
          item.depth_percent = (item.depth_percent != null) ? item.depth_percent : ''
          item.table_percent = (item.table_percent != null) ? item.table_percent : ''
          item.crown_angle = (item.crown_angle != null) ? item.crown_angle : ''
          item.crown_height = (item.crown_height != null) ? item.crown_height : ''
          item.pavillion_angle = (item.pavillion_angle != null) ? item.pavillion_angle : ''
          item.pavillion_depth = (item.pavillion_depth != null) ? item.pavillion_depth : ''
          item.girdle_condition = (item.girdle_condition != null) ? item.girdle_condition : ''
          item.girdle_min = (item.girdle_min != null) ? item.girdle_min : ''
          item.girdle_max = (item.girdle_max != null) ? item.girdle_max : ''
          item.girdle_per = (item.girdle_per != null) ? item.girdle_per : ''
          item.culet_condition = (item.culet_condition != null) ? item.culet_condition : ''
          item.culet_size = (item.culet_size != null) ? item.culet_size : ''
          item.treatment = (item.treatment != null) ? item.treatment : ''
          item.laser_inscription = (item.laser_inscription != null) ? item.laser_inscription : ''
          item.star_length = (item.star_length != null) ? item.star_length : ''
          item.lab = (item.lab != null) ? item.lab : ''
          item.report_number = (item.report_number != null && item.report_number != 0) ? item.report_number : ''
          item.report_date = (item.report_date != '0000-00-00' && item.report_date != null) ? moment(item.report_date).format('DD/MM/YYYY') : '';
          item.lab_location = (item.lab_location != null) ? item.lab_location : ''
          item.report_comment = (item.report_comment != null) ? item.report_comment : ''
          item.symbols = (item.symbols != null) ? item.symbols : ''
          item.fancy_color_intensity = (item.fancy_color_intensity != null) ? item.fancy_color_intensity : ''
          item.fancy_color_overtone = (item.fancy_color_overtone != null) ? item.fancy_color_overtone : ''
          item.fancy_color_dominant_color = (item.fancy_color_dominant_color != null) ? item.fancy_color_dominant_color : ''
          item.fancy_color_secondary_color = (item.fancy_color_secondary_color != null) ? item.fancy_color_secondary_color : ''
          item.sarine_loupe = (item.sarine_loupe != null) ? item.sarine_loupe : ''
          item.seller_spec = (item.seller_spec != null) ? item.seller_spec : ''
          item.shade = (item.shade != null) ? item.shade : ''
          item.milky = (item.milky != null) ? item.milky : ''
          item.eye_clean = (item.eye_clean != null) ? item.eye_clean : ''
          item.open_inclusions = (item.open_inclusions != null) ? item.open_inclusions : ''
          item.black_inclusions = (item.black_inclusions != null) ? item.black_inclusions : ''
          item.white_inclusions = (item.white_inclusions != null) ? item.white_inclusions : ''
          item.brands = (item.brands != null) ? item.brands : ''
          item.video_link = (item.video_link != null) ? item.video_link : ''
          item.status = (item.status == 1) ? 'Active' : 'Deactivated'
          item.created_at = moment(item.created_at).format('DD/MM/YYYY');
          item.updated_at = moment(item.updated_at).format('DD/MM/YYYY');
          var pattern = /^((http|https|ftp):\/\/)/;
          if(pattern.test(item.report_file)) {
            item.report_file = (item.report_file != null) ? item.report_file : ''
          }else{
            item.report_file = (item.report_file != null) ? BACKEND_URL +''+ item.report_file : ''
          }
          if(pattern.test(item.diamond_img)) {
            item.diamond_img = (item.diamond_img != null) ? item.diamond_img : ''
          }else{
            item.diamond_img = (item.diamond_img != null) ? BACKEND_URL +''+ item.diamond_img : ''
          }
          resNew.push(item);
        });
        res.json({status: 200, success: true, message: "Export Diamonds Successfully", data: resNew});
      }
    });
  }
});


router.post('/BlogChangeStatus',[
  check('blogId').exists()
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let status = 1;
    let blogId = req.body.blogId;
    let sql = "SELECT * FROM `blog` WHERE blogId = ?";
    conn.query(sql, [blogId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let responseActive = results[0].status;
          if(responseActive === 1){
            status = 0;
          }
          let sql1 = "UPDATE `blog` SET status = ? WHERE blogId = ?";
          conn.query(sql1, [status,blogId], (err, results1) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results1.affectedRows === 1) {
                if(status === 1){
                  res.json({status: 200, success: true, message: "Blog is Activated", response: 1});
                }else{
                  res.json({status: 200, success: true, message: "Blog is Deactivated", response: 0});
                }
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/TestimonialsChangeStatus',[
  check('testimonialsId').exists()
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let status = 1;
    let testimonialsId = req.body.testimonialsId;
    let sql = "SELECT * FROM `testimonials` WHERE testimonialsId = ?";
    conn.query(sql, [testimonialsId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let responseActive = results[0].status;
          if(responseActive === 1){
            status = 0;
          }
          let sql1 = "UPDATE `testimonials` SET status = ? WHERE testimonialsId = ?";
          conn.query(sql1, [status,testimonialsId], (err, results1) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results1.affectedRows === 1) {
                if(status === 1){
                  res.json({status: 200, success: true, message: "Testimonial is Activated", response: 1});
                }else{
                  res.json({status: 200, success: true, message: "Testimonial is Deactivated", response: 0});
                }
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/BrandsChangeStatus',[
  check('brandId').exists()
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let status = 1;
    let brandId = req.body.brandId;
    let sql = "SELECT * FROM `brands` WHERE brandId = ?";
    conn.query(sql, [brandId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let responseActive = results[0].status;
          if(responseActive === 1){
            status = 0;
          }
          let sql1 = "UPDATE `brands` SET status = ? WHERE brandId = ?";
          conn.query(sql1, [status,brandId], (err, results1) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results1.affectedRows === 1) {
                if(status === 1){
                  res.json({status: 200, success: true, message: "Brand is Activated", response: 1});
                }else{
                  res.json({status: 200, success: true, message: "Brand is Deactivated", response: 0});
                }
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/OrderChangeStatus',[
  check('order_id').exists(),
  check('status').exists()
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let status = req.body.status;
    let order_id = req.body.order_id;
    let sql = "SELECT * FROM orders WHERE order_id = ?";
    conn.query(sql, [order_id], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let sql1 = "UPDATE orders SET status = ?, updated_at = current_timestamp WHERE order_id = ?";
          conn.query(sql1, [status,order_id], (err, results1) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results1.affectedRows === 1) {
                res.json({status: 200, success: true, message: "Order status is updated"});
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/MilestonesChangeStatus',[
  check('milestonesId').exists()
],function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    let status = 1;
    let milestonesId = req.body.milestonesId;
    let sql = "SELECT * FROM `milestones` WHERE milestonesId = ?";
    conn.query(sql, [milestonesId], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          let responseActive = results[0].status;
          if(responseActive === 1){
            status = 0;
          }
          let sql1 = "UPDATE `milestones` SET status = ? WHERE milestonesId = ?";
          conn.query(sql1, [status,milestonesId], (err, results1) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results1.affectedRows === 1) {
                if(status === 1){
                  res.json({status: 200, success: true, message: "Milestones is Activated", response: 1});
                }else{
                  res.json({status: 200, success: true, message: "Milestones is Deactivated", response: 0});
                }
              } else {
                res.json({status: 400, success: false, message: 'No data Found'});
              }
            }
          });
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

router.post('/removeBlog',[
  check('blogId').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var blogId = req.body.blogId;
    let sql = "DELETE FROM `blog` WHERE blogId = ?";
    conn.query(sql, [blogId], function (err, results) {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        res.json({status: 200, success: true, message: "Blog Removed Successfully"});
      }
    });
  }
});

router.post('/removeTestimonials',[
  check('testimonialsId').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var testimonialsId = req.body.testimonialsId;
    let sql = "DELETE FROM `testimonials` WHERE testimonialsId = ?";
    conn.query(sql, [testimonialsId], function (err, results) {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        res.json({status: 200, success: true, message: "Testimonials Removed Successfully"});
      }
    });
  }
});

router.post('/removeBrands',[
  check('brandId').exists()
], function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({status: 422, message: errors.array()});
  }else {
    var brandId = req.body.brandId;
    let sql = "DELETE FROM `brands` WHERE brandId = ?";
    conn.query(sql, [brandId], function (err, results) {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        res.json({status: 200, success: true, message: "Brand Removed Successfully"});
      }
    });
  }
});

router.post('/chatList', async (request,response)=>{
  try {
    var hostname = request.headers.host;
    var base_url = 'http://' + hostname;
    var body = request.body;
    var errors = [];
    var user_id = body.user_id;
    if (!user_id) {
      errors.push(["user id is required"]);
    }

    if (errors && errors.length > 0) {
      var message = errors.join(" , ");
      return response.send({
        status: false,
        message: message,
      });
    }
    var sql = `(SELECT message_id,user_id as sender_id, user_id,"" as sender_name,recipient_id,IF(user_id=${user_id},recipient_id,user_id) as display_id,CONCAT("personal_chat_",IF(user_id=${user_id},recipient_id,user_id)) as conversation_id,message_content,message_status,entry_date_time FROM message_master,(SELECT MAX(message_id) as lastid FROM  message_master WHERE ( (message_master.recipient_id = ${user_id} OR message_master.user_id = ${user_id} )) GROUP BY CONCAT(LEAST(message_master.recipient_id,message_master.user_id),'.',GREATEST(message_master.recipient_id, message_master.user_id))) as conversations WHERE message_id = conversations.lastid ) order by message_id DESC`;
    //console.log(sql);
    let query = conn.query(sql, async function (err, results_chat) {
      if (err) {
        return response.send({
          status: false,
          message: "Something went wrong"
        });
      }
      if (results_chat.length > 0) {
        var all_chats = results_chat;
        var all_personal_chat_user_id = all_chats.reduce(function (filtered, option) {
          if (option.display_id > 0) {
            filtered.push(option.display_id);
          }
          return filtered;
        }, []);

        all_personal_chat_user_id = all_personal_chat_user_id.filter(function (el) {
          return el != null;
        });

        var add_new_chat_object = 0;
        if (body.newuser != null && body.newuser != '') {
          add_new_chat_object = 1;
          if (all_personal_chat_user_id.includes(body.newuser)) {
            add_new_chat_object = 0;
          }
        }
        var all_data_object = {
          results_chat: results_chat,
          all_personal_chat_user_id: all_personal_chat_user_id,
          newuser: body.newuser,
          add_new_chat_object: add_new_chat_object
        };
        //console.log(all_data_object);
        async.waterfall([
              function (callback_new) //personal chat users data
              {
                if (all_data_object.all_personal_chat_user_id.length > 0) {
                  //console.log(all_data_object)
                  var all_personal_chat_user_id_str = all_data_object.all_personal_chat_user_id.join();
                  var sql_for_personal_chat_users = 'SELECT um.userId as user_id_o,um.is_online,um.firstname,um.lastname,um.mobile,um.phone,um.company_name,um.designation,um.country';
                  sql_for_personal_chat_users += ',(SELECT count(mm.message_id) from message_master mm where mm.user_id = user_id_o AND recipient_id=' + user_id + ' AND message_status!=3 ) as unread_message';
                  sql_for_personal_chat_users += ' FROM `users` um WHERE um.userId IN (' + all_personal_chat_user_id_str + ') GROUP BY um.userId';
                  conn.query(sql_for_personal_chat_users, async function (err, results_personal_chat_users) {
                    if (err) {
                      return response.send({
                        status: false,
                        message: "Something went wrong"
                      });
                    } else {
                      all_data_object.all_personal_chat_users = results_personal_chat_users;
                      callback_new(null, all_data_object);
                    }
                  });
                } else {
                  callback_new(null, all_data_object);
                }
              },
              function (all_data_object, callback_new)
              {
                var personal_chats = [];
                if (all_data_object.results_chat.length > 0) {
                  var all_chats = all_data_object.results_chat;
                  var all_personal_chat_users = all_data_object.all_personal_chat_users;
                  var all_message_ids = all_chats.map(function (each_chats_new) {
                    return each_chats_new.message_id;
                  });
                  var all_message_ids_str = all_message_ids.join(',');
                  var all_message_attachments_query = `select message_id,GROUP_CONCAT(mam_id,"###",file_name,"###",file_name_o) as attachments from message_attachments_master WHERE message_id IN (${all_message_ids_str}) GROUP BY message_id`;
                  conn.query(all_message_attachments_query, async function (err, all_message_attachments) {
                    if (err) {
                      return response.send({
                        status: false,
                        message: "Something went wrong"
                      });
                    }

                    async.forEach(all_chats, function (element, callback) {
                        var new_obj = {};
                        new_obj.message_id = element.message_id;
                        new_obj.attachments = [];
                        if (all_message_attachments.length > 0) {
                          var each_attachment = all_message_attachments.filter(function (each_attach) {
                            return each_attach.message_id == element.message_id;
                          });
                          var attach = [];
                          if (each_attachment.length > 0) {
                            var all_attachment_string = each_attachment[0].attachments.split(',');
                            all_attachment_string.forEach(function (value, i) {
                              var att_object = value.split('###');
                              attach.push({
                                'attach_id': att_object[0],
                                'file_name': att_object[2],
                                'file_url': base_url + '/upload/message-attachments/' + att_object[1],
                                'type': get_file_type_from_name(path.extname(att_object[2]))
                              });
                            });
                          }
                        }
                        var display_data = all_personal_chat_users.filter(function (each_users) {
                          return each_users.user_id_o == element.display_id;
                        });
                        display_data = display_data[0];
                        new_obj.display_name = display_data.firstname +' '+ display_data.lastname;
                        new_obj.user_data = display_data;
                        new_obj.attachments = attach;
                        var unread_message = new_obj['user_data']['unread_message'];
                        delete (new_obj['user_data']['unread_message']);
                        new_obj.message_content = element.message_content;
                        new_obj.message_status = 0;
                        if (element.user_id == user_id) {
                          new_obj.unread_message = 0;
                          new_obj.message_status = element.message_status;
                        } else {
                          new_obj.unread_message = parseInt(unread_message);
                        }
                        new_obj.last_message_send_by = element.user_id;
                        new_obj.conversation_id = 'personal_chat_' + element.display_id;
                        new_obj.time = moment(element.entry_date_time).format('DD-MM-YYYY');
                        if (moment(element.entry_date_time).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) {
                          new_obj.time = moment(formatDate(element.entry_date_time)).format('HH:mm A');
                        }
                        new_obj.recipient_id = element.display_id;
                        personal_chats.push(new_obj);
                        callback();
                      },
                      function (err) {
                        all_data_object.personal_chats = multiSort(personal_chats,
                            {
                              entry_date_time: 'desc'
                            }
                        );
                        callback_new(null, all_data_object);
                      });
                  });
                } else {
                  callback_new(null, all_data_object);
                }
              },
              function (all_data_object, callback_new) //main function to create response object
              {
                if (all_data_object.add_new_chat_object == 1 && all_data_object.newuser != '') {
                  let a = conn.query('SELECT um.userId as user_id_o,um.is_online,um.firstname,um.lastname,um.mobile,um.phone,um.company_name,um.designation,um.country FROM users um WHERE um.userId="' + all_data_object.newuser + '"', async function (err, new_user_data) {
                    if (err) {
                      return response.send({
                        status: false,
                        message: "Something went wrong"
                      });
                    }
                    if (new_user_data.length > 0) {
                      var user_data_new = new_user_data[0];
                      all_data_object.personal_chats.unshift({
                        'user_data': user_data_new,
                        'message_id': '',
                        'message_content': '',
                        'message_status': '',
                        'unread_message': 0,
                        'last_message_send_by': '',
                        'conversation_id': 'personal_chat_' + all_data_object.newuser,
                        'time': '',
                        'recipient_id': all_data_object.newuser
                      });
                      callback_new(null, all_data_object);
                    } else {
                      callback_new(null, all_data_object);
                    }
                  });
                } else {
                  callback_new(null, all_data_object);
                }
              },
              function (all_data_object, callback_new) //send response
              {
                var personal_chats = all_data_object.personal_chats;
                return response.send({
                  status: true,
                  message: "Chat listed successfully.",
                  chat_data: {'personal_chats': personal_chats, 'unread_count': 0}
                });
              },
            ],
            function (err, caption) {
              return response.send({
                status: false,
                message: "Something went wrong"
              });
            }
        );
      } else {
        return response.send({
          status: true,
          message: "Chat listed successfully.",
          chat_data: {'personal_chats': []}
        });
      }
    });
  } catch (error) {
    return response.send({
      status: false,
      message: "Something went wrong"
    });
  }
});

router.post('/loadConversation', async (request,response)=>{
  var message_load_limit = 5;
  try {
    var body = request.body;
    var hostname = request.headers.host;
    var base_url = 'http://' + hostname;
    var conversation_id = body.conversation_id;
    var page_no = body.page_no;
    var user_id = body.user_id;
    var errors = [];

    if (!conversation_id) {
      errors.push(["conversation id is required"]);
    }

    if (!user_id) {
      errors.push(["user id is required"]);
    }

    if (!page_no) {
      errors.push(["page no is required"]);
    }

    if (errors && errors.length > 0) {
      var message = errors.join(" , ");
      return response.send({
        status: false,
        message: message
      });
    }
    var recipient_id = conversation_id.replace('personal_chat_', '');

    var where = ` WHERE ((mm.user_id="${user_id}" AND mm.recipient_id="${recipient_id}") OR (mm.user_id="${recipient_id}" AND mm.recipient_id="${user_id}"))`;

    let count_query = `SELECT count(mm.message_id) as count FROM message_master mm ${where} `;
    let query_count = conn.query(count_query, async function (err, results_count_users) {
      if (err) {
        return response.send({
          status: false,
          message: "Something went wrong"
        });
      }
      if (results_count_users[0].count > 0) {
        var page_no = body.page_no;
        var final_conversation_data = [];
        var total_message = results_count_users[0].count;
        const page_count = Math.ceil(total_message / message_load_limit);
        var is_load_more = 0;
        if (page_count > page_no) {
          is_load_more = 1;
        }
        var numRows;
        var queryPagination;
        var numPerPage = parseInt(message_load_limit, 10) || 1;
        var page = (page_no == 0) ? 1 : page_no;
        var numPages;
        var skip = (page - 1) * numPerPage;
        var limit_str = 'LIMIT ' + skip + ',' + numPerPage;

        let message_list_query = `SELECT mm.*,GROUP_CONCAT(mam.mam_id,"###",mam.file_name,"###",mam.file_name_o) as attachments FROM message_master mm LEFT JOIN message_attachments_master mam on mam.message_id = mm.message_id ${where} GROUP BY mm.message_id ORDER By mm.entry_date_time DESC ${limit_str}`;
        // console.log(message_list_query);
        let query = conn.query(message_list_query, async function (err, results_message_from_db) {
          if (err) {
            return response.send({
              status: false,
              message: "Something went wrong"
            });
          }

          var results_message = multiSort(results_message_from_db,
              {
                message_id: 'ASC'
              }
          );
          var conversation_id = 'personal_chat_' + recipient_id;
          var mark_as_seen_message_id = [];
          var mark_as_seen_message = [];
          // console.log('here');
          async.forEach(results_message, function (value, callback) {
                value['time'] = moment(formatDate(value.entry_date_time)).format('HH:mm A');
                value['conversation_id'] = conversation_id;
                value['sender_user_id'] = value.user_id;
                delete (value['entry_date_time']);
                delete (value['reply_message_id']);
                delete (value['user_id']);

                var attachments = [];

                if (value.attachments != '' && value.attachments != null) {
                  var all_attachment_string = value.attachments.split(',');
                  all_attachment_string.forEach(function (value, i) {
                    var att_object = value.split('###');
                    attachments.push({
                      'attach_id': att_object[0],
                      'file_name': att_object[2],
                      'file_url': base_url + '/upload/message-attachments/' + att_object[1],
                      'type': get_file_type_from_name(path.extname(att_object[2]))
                    });
                  });
                }
                value['attachments'] = attachments;
                //mark as seen
                if (value.recipient_id == user_id) {
                  mark_as_seen_message_id.push(value.message_id);
                  mark_as_seen_message.push(value);
                }
                delete (value['recipient_id']);
                final_conversation_data.push(value);
                callback();
              },
              function (err) {
                if (mark_as_seen_message_id.length > 0) {
                  var upd_query = `UPDATE message_master SET message_status = 3 WHERE message_id IN (${mark_as_seen_message_id.join()})`;
                  var sql = conn.query(upd_query, async function (err, results_update) {
                    if (err) {
                      return response.send({
                        status: false,
                        message: "Something went wrong"
                      });
                    }
                  });
                }
                return response.send({
                  status: true,
                  message: "Message load Successfully.",
                  data: final_conversation_data,
                  is_load_more: is_load_more
                });
              });
        });
      } else {
        return response.send({
          status: true,
          message: "Message load Successfully.",
          data: [],
          is_load_more: 0
        });
      }
    });
  } catch (error) {
    return response.send({
      status: false,
      message: "Something went wrong"
    });
  }
});

function addDays(date, days) {
  var d = date.getDate();
  date.setDate(date.getDate() + +days);
  return date;
}

function onlyDate(date) {
  if (date == '') {
    var d = new Date()
  } else {
    var d = new Date(date)
  }
  var month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;
  return [year, month, day].join('-');
}

function formatDate(date) {
  var date = date.toLocaleString("en-US", {timeZone: 'America/New_York'});

  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear(),
      hour = '' + d.getHours(),
      minute = '' + d.getMinutes(),
      second = '' + d.getSeconds();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;
  if (hour.length < 2)
    hour = '0' + hour;
  if (minute.length < 2)
    minute = '0' + minute;
  if (second.length < 2)
    second = '0' + second;
  return [year, month, day].join('-') + ' ' + [hour, minute, second].join(':');
}

function get_file_type_from_name(ext) {
  if ([".png", ".jpg", ".jpeg"].includes(ext.toLowerCase())) {
    return 'PHOTO';
  } else if ([".mp4"].includes(ext.toLowerCase())) {
    return 'VIDEO';
  } else {
    return 'DOC';
  }
}

function multiSort(array, sortObject = {}) {
  const sortKeys = Object.keys(sortObject);

  // Return array if no sort object is supplied.
  if (!sortKeys.length) {
    return array;
  }

  // Change the values of the sortObject keys to -1, 0, or 1.
  for (let key in sortObject) {
    sortObject[key] = sortObject[key] === 'desc' || sortObject[key] === -1 ? -1 : (sortObject[key] === 'skip' || sortObject[key] === 0 ? 0 : 1);
  }

  const keySort = (a, b, direction) => {
    direction = direction !== null ? direction : 1;

    if (a === b) { // If the values are the same, do not switch positions.
      return 0;
    }

    // If b > a, multiply by -1 to get the reverse direction.
    return a > b ? direction : -1 * direction;
  };

  return array.sort((a, b) => {
    let sorted = 0;
    let index = 0;

    // Loop until sorted (-1 or 1) or until the sort keys have been processed.
    while (sorted === 0 && index < sortKeys.length) {
      const key = sortKeys[index];

      if (key) {
        const direction = sortObject[key];

        sorted = keySort(a[key], b[key], direction);
        index++;
      }
    }

    return sorted;
  });
}

router.post('/get_data_search',function(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    var search_keyword = req.body.search_keyword;
    let sql = "SELECT * FROM `users` WHERE (`firstname` LIKE concat('%',?,'%') OR `lastname` LIKE concat('%',?,'%') OR `username` LIKE concat('%',?,'%') OR `email` LIKE concat('%',?,'%'))";
    conn.query(sql, [search_keyword,search_keyword,search_keyword,search_keyword], (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: results});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
});

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

router.get('/dev/calculator', function(req, res, next) {
  let pricelist
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://trade.rapnet.com/');
    await page.type('#emailUserName', 'perryimpex');
    await page.type('#password', 'Rasi?207');
    await page.keyboard.press('Enter');
    // Get the "viewport" of the page, as reported by the page.
    await page.waitForTimeout(10000) ;
    const localStorageData = await page.evaluate(() => {
      let json = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        json[key] = localStorage.getItem(key);
      }
      return json;
    });
    var auth = JSON.parse(localStorageData['ls.auth0Data'])
    var priceListToken = auth['value']['accessToken']
    await browser.close();
    var options = {'method': 'GET', 'url': 'https://api.rapnet.com/api/PriceList/', 'headers': {'Authorization': ' Bearer ' + priceListToken}};
    request(options, function (error, response) {
      if (error) throw new Error(error);
      pricelist = JSON.stringify(JSON.parse(response.body))
      console.log('print price-list')
      fs.writeFileSync('upload/pricelist/price-list.json', pricelist);
      res.json(JSON.parse(response.body));
    });
  })();
});

const job = new CronJob('15 12 * * 5', function() {
  let pricelist
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://trade.rapnet.com/');
    await page.type('#emailUserName', 'perryimpex');
    await page.type('#password', 'Rasi?207');
    await page.keyboard.press('Enter');
    // Get the "viewport" of the page, as reported by the page.
    await page.waitForTimeout(10000) ;
    const localStorageData = await page.evaluate(() => {
      let json = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        json[key] = localStorage.getItem(key);
      }
      return json;
    });
    var auth = JSON.parse(localStorageData['ls.auth0Data'])
    var priceListToken = auth['value']['accessToken']
    await browser.close();
    var options = {'method': 'GET', 'url': 'https://api.rapnet.com/api/PriceList/', 'headers': {'Authorization': ' Bearer ' + priceListToken}};
    request(options, function (error, response) {
      if (error) throw new Error(error);
      pricelist = JSON.stringify(JSON.parse(response.body))
      console.log('print price-list')
      fs.writeFileSync('upload/pricelist/price-list.json', pricelist);
    });
  })();
});
job.start();

router.get('/calculator', function(req, res, next) {
  const data = fs.readFileSync('upload/pricelist/price-list.json', {encoding:'utf8', flag:'r'});
  var response = {
    status: 200, success: true,
    message: "Get Diamond Price List Successfully",
    data :  JSON.parse(data)
  }
  res.json(response)
});

router.get('/analytics-sales', (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    let sql = `SELECT UNIX_TIMESTAMP(DATE(updated_at)) as timestamp, SUM(total_price) as value FROM orders GROUP BY DATE(updated_at) ORDER BY updated_at DESC; SELECT SUM(total_price) as total FROM orders;`;
    conn.query(sql, (err, results) => {
      if (err) {
          res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          var data = [];
          var arr = [];
          results[0].forEach(async (item, index) => {
            var sale = [];
            sale.push(item['timestamp'] * 1000);
            sale.push(parseFloat(item['value'].toFixed(2)));
            await arr.push(sale);
          });
          data.push(arr)
          data.push(parseFloat(results[1][0]['total'].toFixed(2)))
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: data});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    });
  }
})

router.post('/storeRates', (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    let sql = `SELECT count(*) as activeProduct FROM diamonds where status = 1; SELECT * FROM cart; select count(diamondList) as dailycart, updated_at from cart group by date(updated_at); SELECT * FROM orders; select count(order_id) as dailyorder, updated_at from orders group by date(updated_at);`;
    conn.query(sql, (err, results) => {
      if (err) {
          res.json({status: 400, success: false, message: err});
      } else {
        if (results.length > 0) {
          // console.log('data::: ' + JSON.stringify(results));                  //log
          if (results['data'][0].length > 0){
            console.log('data::: ' + JSON.stringify(results))
          }
          res.json({status: 200, success: true, message: 'Get Data Successfully', data: results});
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    })
  }
})

router.post('/live-view', (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors.array().map((err) => ({ field: err.param, message: err.msg }));
    res.json({status: 401, success: false, message: err});
    return
  }else {
    let sql = `SELECT sum(total_price) as total_sale FROM orders where status = 2; SELECT count(*) as total_order FROM orders; SELECT count(*) as checking_out FROM orders where status = 1; SELECT count(*) as purchased FROM orders where status = 2; SELECT diamondList FROM cart;`;
    conn.query(sql, (err, results) => {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        var data = [];
        var all_cart = []

        if (results.length > 0) {
          waterfall([
                function (callback) {
                  data.push(JSON.parse(JSON.stringify(results[0])))
                  callback(null, data)
                },
                function (arg1, callback) {
                  arg1.push(results[1])
                  callback(null, data)
                },
                function (arg1, callback) {
                  arg1.push(results[2])
                  callback(null, data)
                },
                function (arg1, callback) {
                  arg1.push(results[3])
                  callback(null, data)
                },
                function (arg1, callback) {
                  results[4].forEach((e, index) => {
                    all_cart = all_cart.concat(e.diamondList.split(/[ ,]+/))
                    if(index + 1   === results[4].length) {
                      arg1.push([{"total_cart":  all_cart.length}])
                    }
                  })
                  callback(null, data)
                }
              ],
              function (err1, res1) {
                if(err1) {
                  res.json({status: 400, success: false, message: 'err1'});
                } else {
                  res.json({status: 200, success: true, message: 'Get Data Successfully', data: res1});
                }
              }
          )
        } else {
          res.json({status: 400, success: false, message: 'No data Found'});
        }
      }
    })
  }
})

module.exports = router;

var express = require("express");
var passport = require("passport");
const jwt = require("jsonwebtoken");
var crypto = require("crypto");
var router = express.Router();
const moment = require("moment");
const { check, validationResult } = require("express-validator");
var EmailValidator = require("email-validator");
const conn = require("../db/connections");
const helper = require("../helper/helper");
var JWTSECRET = process.env.JWTSECRET;
var FRONTEND_URL = process.env.FRONTEND_URL;
var ADMINEMAIL = process.env.ADMINEMAIL;
var BACKEND_URL = process.env.BACKEND_URL;
var async = require("async");
const _ = require("underscore");
const request = require("request");
const paginate = require("jw-paginate");
const fs = require("fs");
const CircularJSON = require("circular-json");
const path = require("path");

router.get("/testMail", (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({ status: 401, success: false, message: err });
    return;
  } else {
    let sql2 = `SELECT * FROM email_templates WHERE templateId = 1;SELECT * FROM email_templates WHERE templateId = 2`;
    conn.query(sql2, (err, results2) => {
      if (err) {
        res.json({ status: 501, success: false, message: err });
      } else {
        // var mykey = crypto.createCipher('aes-128-cbc', JWTSECRET);
        // var hash = mykey.update(email, 'utf8', 'hex')
        // hash += mykey.final('hex');
        // var token = hash;
        // var html = "";
        // html += `<h1>Verify Account For Kukadia</h1>`;
        // html += `You are now a member for Kukadia <br>`;
        // html += `<br><a href="`+FRONTEND_URL+`/verify-account/`+token+`">Verify Account</a>`;
        // var subject = "Verify User Account"
        // var check  = helper.email_helper('',email,subject,html)
        // if (check) {
        //   res.json({status: 200, success: true, message: "Registration Successfully"});
        // }else{
        //   res.json({status: 400, success: false, message: 'Registration Successfully but mail not received'});
        // }
        var subject = results2[0][0]["email_subject"];
        var html = results2[0][0]["email_content"];
        var admin_subject = results2[1][0]["email_subject"];
        var admin_html = results2[1][0]["email_content"];
        var check = helper.email_helper("", "", subject, html);
        var check1 = helper.email_helper(
          "",
          ADMINEMAIL,
          admin_subject,
          admin_html
        );
        if (check && check1) {
          res.json({
            status: 200,
            success: true,
            message: "Registration Successfully",
          });
        } else {
          res.json({
            status: 400,
            success: false,
            message: "Registration Successfully but mail not received",
          });
        }
      }
    });

    // var html = "test";
    // var subject = "Test Mail"
    // var email = "nikunj@rentechdigital.com"
    // var check  = helper.email_helper('',email,subject,html)
    // console.log(check)
    // if (check) {
    //   res.json({status: 200, success: true, message: 'mail success'});
    // }else{
    //   res.json({status: 400, success: false, message: 'mail failed'});
    // }
  }
});

router.post(
  "/sign-up",
  [
    check("firstname").exists(),
    check("lastname").exists(),
    check("email").exists(),
    check("password").exists(),
    check("username").exists(),
    check("any_reference").exists(),
    check("accept_terms").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      var {
        firstname,
        lastname,
        email,
        username,
        birth_date,
        mobile,
        phone,
        anniversary_date,
        any_reference,
        accept_terms,
        accept_newsletter,
        password,
        company_name,
        designation,
        business_type,
        country,
        state,
        city,
        zipcode,
        address,
        fax,
      } = req.body;
      email = email.toLowerCase();
      if (EmailValidator.validate(email)) {
        if (birth_date != "") {
          birth_date = moment(birth_date.split("/").reverse().join("-")).format(
            "YYYY-MM-DD"
          );
        } else {
          birth_date = null;
        }
        if (anniversary_date != "") {
          anniversary_date = moment(
            anniversary_date.split("/").reverse().join("-")
          ).format("YYYY-MM-DD");
        } else {
          anniversary_date = null;
        }
        let data = {
          firstname: capitalizeFirstLetter(firstname),
          lastname: capitalizeFirstLetter(lastname),
          username: username,
          birth_date: birth_date,
          anniversary_date: anniversary_date,
          any_reference: any_reference,
          accept_terms: accept_terms,
          accept_newsletter: accept_newsletter,
          mobile: mobile,
          phone: phone,
          company_name: company_name,
          designation: designation,
          business_type: business_type,
          country: capitalizeFirstLetter(country),
          state: capitalizeFirstLetter(state),
          city: capitalizeFirstLetter(city),
          zipcode: zipcode,
          address: address,
          fax: fax,
          email: email,
          password: crypto
            .createHash("sha256")
            .update(password, "utf8")
            .digest("hex"),
          isActive: 0,
        };
        let sql = "SELECT * FROM users WHERE username = ?";
        conn.query(sql, [username], (err, results) => {
          if (err) {
            res.json({ status: 501, success: false, message: err });
          } else {
            if (results.length > 0) {
              res.json({
                status: 400,
                success: false,
                message: "Username Already Exits",
              });
            } else {
              if (req.files && Object.keys(req.files).length > 0) {
                if (req.files.logo_file != undefined) {
                  let logo_file = req.files.logo_file;
                  logo_file.name = logo_file.name.replace(/ /g, "_");
                  let filename =
                    Math.floor(Math.random() * 100000) + "-" + logo_file.name;
                  let file_url = "./upload/logo/" + filename;
                  let file_name = "upload/logo/" + filename;
                  logo_file.mv(file_url, function (error) {
                    if (error) {
                      res.json({ status: 400, message: error });
                    } else {
                      data.company_logo = file_name;
                    }
                  });
                }
                if (req.files.photo_file != undefined) {
                  let photo_file = req.files.photo_file;
                  photo_file.name = photo_file.name.replace(/ /g, "_");
                  let filename =
                    Math.floor(Math.random() * 100000) + "-" + photo_file.name;
                  let file_url = "./upload/kyc/" + filename;
                  let file_name = "upload/kyc/" + filename;
                  photo_file.mv(file_url, function (error) {
                    if (error) {
                      res.json({ status: 400, message: error });
                    } else {
                      data.photo_proof = file_name;
                    }
                  });
                }
                if (req.files.business_file != undefined) {
                  let business_file = req.files.business_file;
                  business_file.name = business_file.name.replace(/ /g, "_");
                  let filename1 =
                    Math.floor(Math.random() * 100000) +
                    "-" +
                    business_file.name;
                  let file_url1 = "./upload/kyc/" + filename1;
                  let file_name1 = "upload/kyc/" + filename1;
                  business_file.mv(file_url1, function (error) {
                    if (error) {
                      res.json({ status: 400, message: error });
                    } else {
                      data.business_proof = file_name1;
                    }
                  });
                }
              }
              let sql1 = "INSERT INTO users SET ?";
              conn.query(sql1, data, (err, results1) => {
                if (err) {
                  res.json({ status: 501, success: false, message: err });
                } else {
                  if (results1.affectedRows === 1) {
                    // var mykey = crypto.createCipher('aes-128-cbc', JWTSECRET);
                    // var hash = mykey.update(email, 'utf8', 'hex')
                    // hash += mykey.final('hex');
                    // var token = hash;
                    // var html = "";
                    // html += `<h1>Verify Account For Kukadia</h1>`;
                    // html += `You are now a member for Kukadia <br>`;
                    // html += `<br><a href="`+FRONTEND_URL+`/verify-account/`+token+`">Verify Account</a>`;
                    // var subject = "Verify User Account"
                    // var check  = helper.email_helper('',email,subject,html)
                    // if (check) {
                    //   res.json({status: 200, success: true, message: "Registration Successfully"});
                    // }else{
                    //   res.json({status: 400, success: false, message: 'Registration Successfully but mail not received'});
                    // }
                    var user_fullname = `${firstname} ${lastname}`;
                    var user_name = username;
                    var user_email = email;
                    var user_mobile = mobile;
                    var verify_link = `${process.env.FRONTEND_URL}admin/customers`;
                    var user_company = company_name;

                    var reg_subject = `Thank You For Registering Kukadia.co`;
                    var reg_html = `<!DOCTYPE html>
                    <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
                        <head>
                            <title>Kukadia</title>
                            <style>@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');</style>
                        </head>
                    
                        <body style="margin: 0; padding: 0; background: #fff; font-family: 'Roboto', sans-serif;font-weight: 400;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <table width="560px" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                            <tr>
                                                <td style="background: #dbf1dc; height: auto; padding: 0 0;" align="center">
                                                    <p style="color: #033603; font-size: 16px; font-family: 'Roboto', sans-serif;line-height: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.065em;">
                                                        Real is rare. rare Lasts Forever.
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="text-align: center; padding: 25px 0;">
                                                    <img src="${process.env.BACKEND_URL}upload/mail/kukadia-logo.png" alt="kukadia-logo" />
                                                </td>
                                            </tr>
                    
                                            <tr>
                                                <td style="text-align: center; padding: 10px 0;">
                                                    <img src="${process.env.BACKEND_URL}upload/mail/thankyou-image.png" alt="" />
                                                </td>
                                            </tr>
                    
                                            <tr>
                                                <td style="text-align: center; padding: 0; padding-top: 0;">
                                                    <h1 style="letter-spacing: 0.0066em; font-size: 25px; font-weight: 700; text-transform: capitalize; color: #000000;">Thank You For Registration!</h1>
                                                    <span style="display: block; font-size: 16px; letter-spacing: 0.01em; color: #000000;">Dear ${firstname} ${lastname} 👋,</span>
                                                    <p style="letter-spacing: 0.01em; font-size: 16px; line-height: 24px; color: #000000;">
                                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                                        aliquip ex ea commodo consequat.
                                                    </p>
                                                    <span style="display: inline-block; border-bottom: 1px solid #000000; padding: 0 0 5px 0;">
                                                        <a
                                                            href="${process.env.FRONTEND_URL}"
                                                            style="
                                                                display: inline-block;
                                                                background: #033603;
                                                                color: #fff !important;
                                                                font-weight: 400;
                                                                text-transform: uppercase;
                                                                font-size: 16px;
                                                                letter-spacing: 0.0066em;
                                                                border: 0;
                                                                outline: none;
                                                                border-radius: 0;
                                                                -webkit-border-radius: 0;
                                                                -moz-border-radius: 0;
                                                                padding: 12px 25px 13px 25px;
                                                                text-align: center;
                                                                margin-top: 15px;
                                                                text-decoration: none;
                                                                font-family: 'Roboto', sans-serif;
                                                            "
                                                        >
                                                            Go To Home page
                                                        </a>
                                                    </span>
                                                </td>
                                            </tr>
                    
                                            <tr>
                                                <td>
                                                    <div
                                                        class="footer-bg-img"
                                                        style="
                                                            position: relative;
                                                            margin-top: 40px;
                                                            background: url(${process.env.BACKEND_URL}upload/mail/footer_bg_kukadia.png);
                                                            background-repeat: no-repeat;
                                                            background-position: center;
                                                            background-size: cover;
                                                            padding: 20px 0 1px 0;
                                                            vertical-align: middle;
                                                            text-align: center;
                                                            font-family: 'Roboto', sans-serif;
                                                        "
                                                    >
                                                        <div class="footer-content">
                                                            <span style="display: block; text-align: center; margin: 0 0 15px 0;">
                                                                <img src="${process.env.BACKEND_URL}upload/mail/kukadia-ventures.png" alt="striliant-logo" style="border-right: 1px solid #182342; padding: 0 10px; padding-right: 20px;" />
                                                                <img style="margin-left: 20px;" src="${process.env.BACKEND_URL}upload/mail/kukadia-corporation..png" alt="striliant-logo" />
                                                            </span>
                                                            <div class="social-icon">
                                                                <h3 style="text-transform: uppercase; font-weight: 600; font-size: 14px; line-height: 27px; margin: 0; color: #000;">Follow US</h3>
                                                                <ul class="list-unstyled-css" style="list-style: none; padding: 0;">
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                        <a href="https://www.facebook.com/kukadia.co/"><img src="${process.env.BACKEND_URL}upload/mail/facebook.png" /></a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                        <a href="https://www.instagram.com/kukadia.co/"><img src="${process.env.BACKEND_URL}upload/mail/instagram-sketched.png" /></a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                        <a href="#"><img src="${process.env.BACKEND_URL}upload/mail/twitter.png" /></a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                        <a href="#"><img src="${process.env.BACKEND_URL}upload/mail/youtube.png" /></a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                    
                                                            <div class="footer-link-blog">
                                                                <ul style="list-style: none; padding: 0;">
                                                                    <li class="active" style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="#" style="color: #033603; text-decoration: underline; font-family: 'Roboto', sans-serif;">Unsubscribe</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="${process.env.FRONTEND_URL}policy" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Privacy policy</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="${process.env.FRONTEND_URL}terms-and-condition" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Terms of Service</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                        <a href="${process.env.FRONTEND_URL}contact-us" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Visit Us</a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                            <div class="footer-desc">
                                                                <ul style="list-style: none; padding: 0;">
                                                                    <li class="active" style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Surat</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Mumbai</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">New York</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Toronto</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                        <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Montreal</a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                    
                                            <tr>
                                                <td style="background-color: #033603; color: #fff; text-align: center;">
                                                    <h4 style="font-weight: normal; margin: 10px 0; font-size: 14px;">&#169; 2021 Kukadia Ventures Pvt. Ltd. All Rights Reserved.</h4>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </body>
                    </html>
                    `;
                    var reg_check = helper.email_helper(
                      "",
                      user_email,
                      reg_subject,
                      reg_html
                    );

                    var reg_admin_subject = `A New User Has Registered`;
                    var reg_admin_html = `<!DOCTYPE html>
                    <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
                        <head>
                            <title>Kukadia</title>
                            <style>@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');</style>
                        </head>
                    
                        <body style="margin: 0; padding: 0; background: #fff; font-family: 'Roboto', sans-serif;font-weight: 400;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <table width="560px" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                            <tr>
                                                <td style="background: #dbf1dc; height: auto; padding: 0 0;" align="center">
                                                    <p style="color: #033603; font-size: 16px; font-family: 'Roboto', sans-serif;line-height: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.065em;">
                                                        Real is rare. rare Lasts Forever.
                                                    </p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="text-align: center; padding: 25px 0;">
                                                    <img src="${process.env.BACKEND_URL}upload/mail/kukadia-logo.png" alt="kukadia-logo" />
                                                </td>
                                            </tr>
                    
                                            <tr>
                                                <td style="text-align: center; padding: 10px 0;">
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <th
                                                                colspan="2"
                                                                style="
                                                                    background-color: #e8f3e9;
                                                                    text-align: center;
                                                                    letter-spacing: 0.0066em;
                                                                    text-transform: capitalize;
                                                                    color: #000000;
                                                                    font-size: 20px;
                                                                    padding: 15px;
                                                                    font-weight: 700;
                                                                    vertical-align: top;
                                                                "
                                                            >
                                                                New User Register
                                                            </th>
                                                        </tr>
                                                        <tr>
                                                            <th style="color: #033603; font-size: 15px; text-align: left; padding: 18px 10px; vertical-align: top; width: 160px; border-bottom: 1px solid #00000033; font-weight: 700;">Full Name :</th>
                                                            <td style="border-bottom: 1px solid #00000033; padding: 18px 10px; color: #000000; font-weight: 400; font-size: 15px; vertical-align: top; text-align: left; word-break: break-word;">${user_fullname}</td>
                                                        </tr>
                                                        <tr>
                                                            <th style="color: #033603; font-size: 15px; text-align: left; padding: 18px 10px; vertical-align: top; width: 160px; border-bottom: 1px solid #00000033; font-weight: 700;">Email :</th>
                                                            <td style="border-bottom: 1px solid #00000033; padding: 18px 10px; color: #000000; font-weight: 400; font-size: 15px; vertical-align: top; text-align: left; word-break: break-word;">${user_email}</td>
                                                        </tr>
                                                        <tr>
                                                            <th style="color: #033603; font-size: 15px; text-align: left; padding: 18px 10px; vertical-align: top; width: 160px; border-bottom: 1px solid #00000033; font-weight: 700;">Mobile No. :</th>
                                                            <td style="border-bottom: 1px solid #00000033; padding: 18px 10px; color: #000000; font-weight: 400; font-size: 15px; vertical-align: top; text-align: left; word-break: break-word;">${mobile}</td>
                                                        </tr>
                                                        <tr>
                                                            <th style="color: #033603; font-size: 15px; text-align: left; padding: 18px 10px; vertical-align: top; width: 160px; border-bottom: 1px solid #00000033; font-weight: 700;">Company Name :</th>
                                                            <td style="border-bottom: 1px solid #00000033; padding: 18px 10px; color: #000000; font-weight: 400; font-size: 15px; vertical-align: top; text-align: left; word-break: break-word;">${company_name}</td>
                                                        </tr>
                                                        <tr>
                                                            <th style="color: #033603; font-size: 15px; text-align: left; padding: 18px 10px; vertical-align: top; width: 160px; border-bottom: 1px solid #00000033; font-weight: 700;">Address :</th>
                                                            <td style="border-bottom: 1px solid #00000033; padding: 18px 10px; color: #000000; font-weight: 400; font-size: 15px; vertical-align: top; text-align: left; word-break: break-word;">
                                                                ${address}, ${city} ${zipcode}, ${state}, ${country}
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                    
                                            <tr>
                                                <td style="text-align: center; padding: 0; padding-top: 0;">
                                                    <span style="display: inline-block; border-bottom: 1px solid #000000; padding: 0 0 5px 0;">
                                                        <a
                                                            href="${verify_link}"
                                                            style="
                                                                display: block;
                                                                background-color: #033603;
                                                                color: #fff !important;
                                                                font-weight: 400;
                                                                text-transform: uppercase;
                                                                font-size: 16px;
                                                                letter-spacing: 0.0066em;
                                                                border: 0;
                                                                outline: none;
                                                                border-radius: 0;
                                                                -webkit-border-radius: 0;
                                                                -moz-border-radius: 0;
                                                                padding: 12px 25px 13px 25px;
                                                                text-align: center;
                                                                margin-top: 15px;
                                                                text-decoration: none;
                                                                font-family: 'Roboto', sans-serif;
                                                            "
                                                        >
                                                            Verify
                                                        </a>
                                                    </span>
                                                </td>
                                            </tr>
                    
                                            <tr>
                                                <td>
                                                    <div
                                                        class="footer-bg-img"
                                                        style="
                                                            position: relative;
                                                            margin-top: 40px;
                                                            background: url(${process.env.BACKEND_URL}upload/mail/footer_bg_kukadia.png);
                                                            background-repeat: no-repeat;
                                                            background-position: center;
                                                            background-size: cover;
                                                            padding: 20px 0 1px 0;
                                                            vertical-align: middle;
                                                            text-align: center;
                                                            font-family: 'Roboto', sans-serif;
                                                        "
                                                    >
                                                        <div class="footer-content">
                                                            <span style="display: block; text-align: center; margin: 0 0 15px 0;">
                                                                <img src="${process.env.BACKEND_URL}upload/mail/kukadia-ventures.png" alt="striliant-logo" style="border-right: 1px solid #182342; padding: 0 10px; padding-right: 20px;" />
                                                                <img style="margin-left: 20px;" src="${process.env.BACKEND_URL}upload/mail/kukadia-corporation..png" alt="striliant-logo" />
                                                            </span>
                                                            <div class="social-icon">
                                                                <h3 style="text-transform: uppercase; font-weight: 600; font-size: 14px; line-height: 27px; margin: 0; color: #000;">Follow US</h3>
                                                                <ul class="list-unstyled-css" style="list-style: none; padding: 0;">
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                        <a href="https://www.facebook.com/kukadia.co/"><img src="${process.env.BACKEND_URL}upload/mail/facebook.png" /></a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                        <a href="https://www.instagram.com/kukadia.co/"><img src="${process.env.BACKEND_URL}upload/mail/instagram-sketched.png" /></a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                        <a href="#"><img src="${process.env.BACKEND_URL}upload/mail/twitter.png" /></a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                        <a href="#"><img src="${process.env.BACKEND_URL}upload/mail/youtube.png" /></a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                    
                                                            <div class="footer-link-blog">
                                                                <ul style="list-style: none; padding: 0;">
                                                                    <li class="active" style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="#" style="color: #033603; text-decoration: underline; font-family: 'Roboto', sans-serif;">Unsubscribe</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="${process.env.FRONTEND_URL}policy" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Privacy policy</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="${process.env.FRONTEND_URL}terms-and-condition" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Terms of Service</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                        <a href="${process.env.FRONTEND_URL}contact-us" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Visit Us</a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                            <div class="footer-desc">
                                                                <ul style="list-style: none; padding: 0;">
                                                                    <li class="active" style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Surat</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Mumbai</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">New York</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                        <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Toronto</a>
                                                                    </li>
                                                                    <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                        <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Montreal</a>
                                                                    </li>
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                    
                                            <tr>
                                                <td style="background-color: #033603; color: #fff; text-align: center;">
                                                    <h4 style="font-weight: normal; margin: 10px 0; font-size: 14px;">&#169; 2021 Kukadia Ventures Pvt. Ltd. All Rights Reserved.</h4>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </body>
                    </html>
                    `;
                    var reg_admin_check = helper.email_helper(
                      "",
                      ADMINEMAIL,
                      reg_admin_subject,
                      reg_admin_html
                    );
                    if (reg_check && reg_admin_check) {
                      res.json({
                        status: 200,
                        success: true,
                        message: "Registration Successfully",
                      });
                    } else {
                      res.json({
                        status: 400,
                        success: false,
                        message:
                          "Registration Successfully but mail not received",
                      });
                    }
                  } else {
                    res.json({
                      status: 400,
                      success: false,
                      message: "Registration Failed",
                    });
                  }
                }
              });
            }
          }
        });
      } else {
        res.json({
          status: 400,
          success: false,
          message: "Invalid Email Address.",
        });
      }
    }
  }
);

router.post(
  "/verify-account",
  [check("email").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      let isActive = 1;
      let email = req.body.email;
      let mykey = crypto.createDecipher("aes-128-cbc", JWTSECRET);
      let hash = mykey.update(email, "hex", "utf8");
      hash += mykey.final("utf8");
      var dbemail = hash;
      let sql = "SELECT * FROM users WHERE email = ?";
      conn.query(sql, [dbemail], (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.length > 0) {
            let responseActive = results[0].isActive;
            if (responseActive === 1) {
              res.json({
                status: 200,
                success: true,
                message: "Account is Already Activated",
                response: 0,
              });
            } else {
              let sql1 = "UPDATE users SET isActive = ? WHERE email = ?";
              conn.query(sql1, [isActive, dbemail], (err, results1) => {
                if (err) {
                  res.json({ status: 501, success: false, message: err });
                } else {
                  if (results1.affectedRows === 1) {
                    if (isActive === 1) {
                      res.json({
                        status: 200,
                        success: true,
                        message: "Account is Activated",
                        response: 1,
                      });
                    } else {
                      res.json({
                        status: 200,
                        success: true,
                        message: "Account is Deactivated",
                        response: 0,
                      });
                    }
                  } else {
                    res.json({
                      status: 400,
                      success: false,
                      message: "No data Found",
                    });
                  }
                }
              });
            }
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/login",
  [check("username").exists(), check("password").exists()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      var { username, password } = req.body;
      conn.query(
        "SELECT * FROM users WHERE username = ? and password = ?",
        [
          username,
          crypto.createHash("sha256").update(password, "utf8").digest("hex"),
        ],
        async (err, resuser) => {
          if (err) {
            res.json({ status: 501, success: false, message: err });
          } else if (resuser.length > 0) {
            if (resuser[0]["isActive"] == 2) {
              res.json({
                status: 201,
                success: false,
                message: "Account is blocked.",
              });
            } else if (resuser[0]["isActive"] == 0) {
              res.json({
                status: 201,
                success: false,
                message: "Account is not active.",
              });
            } else {
              var jwtdata = {
                userId: resuser[0].userId,
                username: resuser[0].username,
                firstname: resuser[0].firstname,
                lastname: resuser[0].lastname,
                email: resuser[0].email,
              };
              var token = jwt.sign({ jwtdata, IsUserLogin: true }, JWTSECRET, {
                expiresIn: "10d",
              });
              res.json({
                status: 200,
                success: true,
                message: "Welcome",
                data: resuser[0],
                token: token,
                IsUserLogin: true,
              });
            }
          } else {
            res.json({
              status: 201,
              success: false,
              message: "Invalid credentials.",
            });
          }
        }
      );
    }
  }
);

router.post(
  "/login-guest",
  [
    check("username").exists(),
    check("company_name").exists(),
    check("mobile").exists(),
    check("email").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      var { username, company_name, mobile, email } = req.body;
      conn.query(
        "SELECT * FROM users WHERE username = ? and company_name = ? and mobile = ? and email = ?",
        [username, company_name, mobile, email],
        async (err, resuser) => {
          if (err) {
            res.json({ status: 501, success: false, message: err });
          } else if (resuser.length > 0) {
            if (resuser[0]["isActive"] == 2) {
              res.json({
                status: 201,
                success: false,
                message: "Account is blocked.",
              });
            } else if (resuser[0]["isActive"] == 0) {
              res.json({
                status: 201,
                success: false,
                message: "Account is not active.",
              });
            } else {
              var jwtdata = {
                userId: resuser[0].userId,
                username: resuser[0].username,
                firstname: resuser[0].firstname,
                lastname: resuser[0].lastname,
                email: resuser[0].email,
              };
              var token = jwt.sign({ jwtdata, IsUserLogin: true }, JWTSECRET, {
                expiresIn: "10d",
              });
              res.json({
                status: 200,
                success: true,
                message: "Welcome",
                data: resuser[0],
                token: token,
                IsUserLogin: true,
              });
            }
          } else {
            res.json({
              status: 201,
              success: false,
              message: "Invalid details.",
            });
          }
        }
      );
    }
  }
);

router.post(
  "/forgot-password",
  [check("email").exists().isEmail()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      const { email } = req.body;
      var verify_token = Math.floor(1000 + Math.random() * 9000);
      let sql = "UPDATE users SET authToken = ? WHERE email = ?";
      conn.query(sql, [verify_token, email], (err, results) => {
        console.log("results");
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.affectedRows >= 1) {
            var fgt_paa_email = email;
            var fgt_paa_html = `<!DOCTYPE html>
            <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
                <head>
                    <title>Kukadia</title>
                    <style>@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');</style>
                </head>
            
                <body style="margin: 0; padding: 0; background: #fff; font-family: 'Roboto', sans-serif;font-weight: 400;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                            <td>
                                <table width="560px" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                    <tr>
                                        <td style="background: #dbf1dc; height: auto; padding: 0 0;" align="center">
                                            <p style="color: #033603; font-size: 16px; font-family: 'Roboto', sans-serif;line-height: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.065em;">
                                                Real is rare. rare Lasts Forever.
                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="text-align: center; padding: 25px 0;">
                                            <img src="${process.env.BACKEND_URL}upload/mail/kukadia-logo.png" alt="kukadia-logo" />
                                        </td>
                                    </tr>
            
                                    <tr>
                                        <td>
                                            <span style="padding: 0; display: block; margin: 15px; border: 1px solid #dfdfdf;">
                                                <h1 style="text-align: center; color: #fff; margin: 0; font-weight: 600; font-size: 25px; padding: 25px; background-color: #033603;">Verification Code</h1>
                                                <p style="text-align: center; letter-spacing: 0.01em; text-transform: capitalize; color: #000000; line-height: 28px; margin: 0; padding: 15px; font-weight: 500; font-size: 15px;">
                                                    This email address was recently used to start a visitor session. you can use this code to verify that this email belongs to you.
                                                </p>
                                                <p style="text-align: center; letter-spacing: 0.0066em; text-transform: capitalize; color: #000000; margin-bottom: 30px; margin-top: 15px; font-size: 30px; font-weight: 700;">${verify_token}</p>
                                            </span>
                                        </td>
                                    </tr>
            
                                    <tr>
                                        <td>
                                            <div
                                                class="footer-bg-img"
                                                style="
                                                    position: relative;
                                                    margin-top: 40px;
                                                    background: url(${process.env.BACKEND_URL}upload/mail/footer_bg_kukadia.png);
                                                    background-repeat: no-repeat;
                                                    background-position: center;
                                                    background-size: cover;
                                                    padding: 20px 0 1px 0;
                                                    vertical-align: middle;
                                                    text-align: center;
                                                    font-family: 'Roboto', sans-serif;
                                                "
                                            >
                                                <div class="footer-content">
                                                    <span style="display: block; text-align: center; margin: 0 0 15px 0;">
                                                        <img src="${process.env.BACKEND_URL}upload/mail/kukadia-ventures.png" alt="striliant-logo" style="border-right: 1px solid #182342; padding: 0 10px; padding-right: 20px;" />
                                                        <img style="margin-left: 20px;" src="${process.env.BACKEND_URL}upload/mail/kukadia-corporation..png" alt="striliant-logo" />
                                                    </span>
                                                    <div class="social-icon">
                                                        <h3 style="text-transform: uppercase; font-weight: 600; font-size: 14px; line-height: 27px; margin: 0; color: #000;">Follow US</h3>
                                                        <ul class="list-unstyled-css" style="list-style: none; padding: 0;">
                                                            <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                <a href="https://www.facebook.com/kukadia.co/"><img src="${process.env.BACKEND_URL}upload/mail/facebook.png" /></a>
                                                            </li>
                                                            <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                <a href="https://www.instagram.com/kukadia.co/"><img src="${process.env.BACKEND_URL}upload/mail/instagram-sketched.png" /></a>
                                                            </li>
                                                            <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                <a href="#"><img src="${process.env.BACKEND_URL}upload/mail/twitter.png" /></a>
                                                            </li>
                                                            <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                <a href="#"><img src="${process.env.BACKEND_URL}upload/mail/youtube.png" /></a>
                                                            </li>
                                                        </ul>
                                                    </div>
            
                                                    <div class="footer-link-blog">
                                                        <ul style="list-style: none; padding: 0;">
                                                            <li class="active" style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                <a href="#" style="color: #033603; text-decoration: underline; font-family: 'Roboto', sans-serif;">Unsubscribe</a>
                                                            </li>
                                                            <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                <a href="${process.env.FRONTEND_URL}policy" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Privacy policy</a>
                                                            </li>
                                                            <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                <a href="${process.env.FRONTEND_URL}terms-and-condition" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Terms of Service</a>
                                                            </li>
                                                            <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                <a href="${process.env.FRONTEND_URL}contact-us" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Visit Us</a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    <div class="footer-desc">
                                                        <ul style="list-style: none; padding: 0;">
                                                            <li class="active" style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Surat</a>
                                                            </li>
                                                            <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Mumbai</a>
                                                            </li>
                                                            <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">New York</a>
                                                            </li>
                                                            <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Toronto</a>
                                                            </li>
                                                            <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Montreal</a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
            
                                    <tr>
                                        <td style="background-color: #033603; color: #fff; text-align: center;">
                                            <h4 style="font-weight: normal; margin: 10px 0; font-size: 14px;">&#169; 2021 Kukadia Ventures Pvt. Ltd. All Rights Reserved.</h4>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>
            `;
            var fgt_paa_subject = "Forgot Password User";
            var fgt_paa_check = helper.email_helper(
              "",
              fgt_paa_email,
              fgt_paa_subject,
              fgt_paa_html
            );
            if (fgt_paa_check) {
              res.json({
                status: 200,
                success: true,
                message: "Email Send Successfully",
              });
            } else {
              res.json({
                status: 400,
                success: false,
                message: "Email not sending",
              });
            }
          } else {
            res.json({ status: 400, success: false, message: "No data found" });
          }
        }
      });
    }
  }
);

router.post(
  "/verify-otp",
  [check("email").exists().isEmail(), check("verify_token").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      const { email, verify_token } = req.body;
      let sql = "SELECT * FROM users WHERE email = ? LIMIT 1";
      conn.query(sql, [email], (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.length > 0) {
            if (results[0].authToken == verify_token) {
              res.json({
                status: 200,
                success: true,
                message: "OTP Verify Successfully",
              });
            } else {
              res.json({
                status: 400,
                success: false,
                message: "Please Valid OTP",
              });
            }
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/reset-password",
  [
    check("password")
      .exists()
      .isLength({ min: 6 })
      .withMessage("must be at least 6 chars long"),
    check("confirm_password")
      .exists()
      .isLength({ min: 6 })
      .withMessage("must be at least 6 chars long"),
    check("email").exists().isEmail(),
    check("verify_token").exists(),
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      const password = req.body.password;
      const confirm_password = req.body.confirm_password;
      const email = req.body.email;
      const authToken = req.body.verify_token;
      if (password !== confirm_password) {
        res.json({
          status: 400,
          success: false,
          message: "Do not match Password and Confirm Password",
        });
      }
      let sql = "SELECT * FROM users WHERE email = ? AND authToken = ? LIMIT 1";
      conn.query(sql, [email, authToken], (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.length > 0) {
            let sql1 = "UPDATE users SET password = ? WHERE email = ?";
            conn.query(
              sql1,
              [
                crypto
                  .createHash("sha256")
                  .update(password, "utf8")
                  .digest("hex"),
                email,
              ],
              function (err, results1) {
                if (err) {
                  res.json({ status: 501, success: false, message: err });
                } else {
                  if (results1.affectedRows === 1) {
                    res.json({
                      status: 200,
                      success: true,
                      message: "Your password has been successfully changed",
                    });
                  } else {
                    res.json({
                      status: 400,
                      success: false,
                      message: "Your password has been not changed",
                    });
                  }
                }
              }
            );
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/get_data",
  [
    passport.authenticate("userLogin", { session: false }),
    check("userId").exists(),
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      var userId = req.body.userId;
      let sql = "SELECT * FROM users WHERE userId = ?";
      conn.query(sql, [userId], (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.length > 0) {
            res.json({
              status: 200,
              success: true,
              message: "Get Data Successfully",
              data: results[0],
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/dashboard",
  [
    passport.authenticate("userLogin", { session: false }),
    check("userId").exists(),
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      var userId = req.body.userId;
      let sql = `SELECT MAX(created_at) AS lastdatetime FROM diamonds`;
      conn.query(sql, (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.length > 0) {
            var lastdatetime = results[0]["lastdatetime"];
            let sql1 = `SELECT count(*) AS new_products FROM diamonds WHERE created_at >= ? - INTERVAL 1 week;SELECT count(*) AS enquiry FROM buy_requests WHERE userId = ?;SELECT diamondList FROM watchlist WHERE userId = ?;SELECT adminId FROM users WHERE userId = ?`;
            conn.query(
              sql1,
              [lastdatetime, userId, userId, userId],
              (err, results1) => {
                if (err) {
                  res.json({ status: 501, success: false, message: err });
                } else {
                  if (results1.length > 0) {
                    if (results1[3][0].adminId) {
                      let sql2 =
                        "SELECT firstname,lastname,email,mobileno FROM `admin` WHERE adminId = ?";
                      conn.query(
                        sql2,
                        [results1[3][0].adminId],
                        (err, results2) => {
                          if (err) {
                            res.json({
                              status: 501,
                              success: false,
                              message: err,
                            });
                          } else {
                            res.json({
                              status: 200,
                              success: true,
                              message: "Get Data Successfully",
                              data: results1,
                              data1: results2[0],
                            });
                          }
                        }
                      );
                    } else {
                      res.json({
                        status: 200,
                        success: true,
                        message: "Get Data Successfully",
                        data: results1,
                        data1: "",
                      });
                    }
                  } else {
                    res.json({
                      status: 400,
                      success: false,
                      message: "No data Found",
                    });
                  }
                }
              }
            );
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/snapshort",
  [
    passport.authenticate("userLogin", { session: false }),
    check("userId").exists(),
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      var userId = req.body.userId;
      let sql = `SELECT * FROM orders WHERE userId = ? AND status != 3 AND status != 4 AND created_at >= NOW() - INTERVAL 1 MONTH;SELECT * FROM orders WHERE userId = ? AND status != 3 AND status != 4 AND created_at >= NOW() - INTERVAL 6 MONTH;SELECT * FROM orders WHERE userId = ? AND status != 3 AND status != 4 AND created_at >= NOW() - INTERVAL 1 YEAR;SELECT * FROM orders WHERE userId = ? AND status != 3 AND status != 4 AND created_at >= NOW() - INTERVAL 2 YEAR`;
      conn.query(sql, [userId, userId, userId, userId], (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.length > 0) {
            let tmpRes = results[0];
            let resNew = [];
            let month_1 = 0;
            tmpRes.forEach(function (item) {
              month_1 += parseFloat(item.total_price);
              item.created_at = moment(item.created_at).format("DD MMM YY");
              resNew.push(item);
            });
            let tmpRes1 = results[1];
            let resNew1 = [];
            let month_6 = 0;
            tmpRes1.forEach(function (item) {
              month_6 += parseFloat(item.total_price);
              item.created_at = moment(item.created_at).format("DD MMM YY");
              resNew1.push(item);
            });
            let tmpRes2 = results[2];
            let resNew2 = [];
            let year_1 = 0;
            tmpRes2.forEach(function (item) {
              year_1 += parseFloat(item.total_price);
              item.created_at = moment(item.created_at).format("DD MMM YY");
              resNew2.push(item);
            });
            let tmpRes3 = results[3];
            let resNew3 = [];
            let year_2 = 0;
            tmpRes3.forEach(function (item) {
              year_2 += parseFloat(item.total_price);
              item.created_at = moment(item.created_at).format("DD MMM YY");
              resNew3.push(item);
            });
            res.json({
              status: 200,
              success: true,
              message: "Get Data Successfully",
              data: resNew,
              month_1: month_1,
              data1: resNew1,
              month_6: month_6,
              data2: resNew2,
              year_1: year_1,
              data3: resNew3,
              year_2: year_2,
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/get_data_search",
  [passport.authenticate("userLogin", { session: false })],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      var search_keyword = req.body.search_keyword;
      let sql =
        "SELECT * FROM `admin` WHERE (`firstname` LIKE concat('%',?,'%') OR `lastname` LIKE concat('%',?,'%') OR `username` LIKE concat('%',?,'%') OR `email` LIKE concat('%',?,'%'))";
      conn.query(
        sql,
        [search_keyword, search_keyword, search_keyword, search_keyword],
        (err, results) => {
          if (err) {
            res.json({ status: 501, success: false, message: err });
          } else {
            if (results.length > 0) {
              res.json({
                status: 200,
                success: true,
                message: "Get Data Successfully",
                data: results,
              });
            } else {
              res.json({
                status: 400,
                success: false,
                message: "No data Found",
              });
            }
          }
        }
      );
    }
  }
);

router.post(
  "/GetSavedSearched",
  [passport.authenticate("userLogin", { session: false })],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      var userId = req.body.userId;
      var page = req.body.page;
      const pageSize = 5;
      let sql =
        "SELECT * FROM `diamonds_search_saved` WHERE userId = ? ORDER BY `search_saved_id` DESC";
      conn.query(sql, [userId], (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.length > 0) {
            const pager = paginate(results.length, page, pageSize);
            const pageOfItems = results.slice(
              pager.startIndex,
              pager.endIndex + 1
            );
            res.json({
              status: 200,
              success: true,
              message: "Get Data Successfully",
              pager: pager,
              pageOfItems: pageOfItems,
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/searchDiamonds",
  [
    check("columns").exists(),
    check("start").exists(),
    check("order").exists(),
    check("length").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({
        status: 401,
        success: false,
        message: err,
      });
      return;
    } else {
      var objsearch = ``;
      var objsearcharr = [];
      var search_div = 0;
      var { userId, columns, order, start, length, search_saved_id } = req.body;
      var search_data = req.body.search_data;

      objsearch +=
        objsearcharr.length == 0 ? `WHERE status = ? ` : ` AND status = ? `;
      objsearcharr.push(1);
      if (search_data["shape_basic"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0 ? `WHERE shape = ? ` : ` AND shape = ? `;
        objsearcharr.push(search_data["shape_basic"]);
      }
      if (search_data["shape_advanced"].length > 0) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE shape IN (?) `
            : ` AND shape IN (?) `;
        objsearcharr.push(search_data["shape_advanced"]);
      }
      if (
        search_data["size_general_from"].length > 0 &&
        search_data["size_general_to"]
      ) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE size BETWEEN ? AND ? `
            : ` AND size BETWEEN ? AND ? `;
        objsearcharr.push(search_data["size_general_from"]);
        objsearcharr.push(search_data["size_general_to"]);
      }
      if (search_data["size_specific"].length > 0) {
        search_div = 1;
        var flg = true;
        for (var i = 0; i < search_data["size_specific"].length; i++) {
          var newvalue = search_data["size_specific"][i].split(" - ");
          if (
            isNaN(newvalue[0]) == false &&
            newvalue[0] &&
            newvalue[1] &&
            isNaN(newvalue[1]) == false
          ) {
            if (flg == true) {
              flg = false;
              objsearch +=
                objsearcharr.length == 0
                  ? `WHERE ( size BETWEEN ? AND ?`
                  : ` AND (size BETWEEN ? AND ?`;
            } else {
              objsearch += ` OR size BETWEEN ? AND ? `;
            }
            objsearcharr.push(parseFloat(newvalue[0]));
            objsearcharr.push(parseFloat(newvalue[1]));
          }
          if (i == search_data["size_specific"].length - 1 && flg == false) {
            objsearch += `) `;
          }
        }
      }
      if (search_data["finish_specific"].length > 0) {
        search_div = 1;
        if (search_data["finish_specific"].includes("3X")) {
          objsearch +=
            objsearcharr.length == 0
              ? `WHERE cut = 'EX' AND polish = 'EX' AND symmetry = 'EX' `
              : ` AND cut = 'EX' AND polish = 'EX' AND symmetry = 'EX' `;
        } else if (search_data["finish_specific"].includes("EX-")) {
          objsearch +=
            objsearcharr.length == 0
              ? `WHERE cut = 'EX' AND polish = 'VG' AND symmetry = 'EX' `
              : ` AND cut = 'EX' AND polish = 'VG' AND symmetry = 'EX' `;
        } else if (search_data["finish_specific"].includes("VG+")) {
          objsearch +=
            objsearcharr.length == 0
              ? `WHERE cut = 'VG' AND polish = 'VG' AND symmetry = 'EX' `
              : ` AND cut = 'VG' AND polish = 'VG' AND symmetry = 'EX' `;
        } else if (search_data["finish_specific"].includes("VG-")) {
          objsearch +=
            objsearcharr.length == 0
              ? `WHERE cut = 'VG' AND polish = 'VG' AND symmetry = 'VG' `
              : ` AND cut = 'VG' AND polish = 'VG' AND symmetry = 'VG' `;
        }
      }
      if (
        search_data["finish_general_cut_from"] &&
        search_data["finish_general_cut_to"]
      ) {
        search_div = 1;
        cut_arr = ["PO", "FA", "GD", "VG", "EX", "ID"];
        var cutInit = search_data["finish_general_cut_from"];
        var cutLast = search_data["finish_general_cut_to"];

        var cutQueary =
          objsearcharr.length == 0 ? `WHERE cut IN (` : ` AND cut IN (`;
        var cutValue = [];
        for (var i = cutInit; i <= cutLast; i++) {
          cutQueary += cutValue.length == 0 ? `?` : `, ?`;
          objsearcharr.push(cut_arr[i]);
          cutValue.push(cut_arr[i]);
        }
        objsearch += cutQueary;
        objsearch += `)`;
        // search_div = 1
        // objsearch += objsearcharr.length == 0 ? `WHERE cut IN (?,?) `:` AND cut IN (?,?) `
        // objsearcharr.push(search_data['finish_general_cut_from'],search_data['finish_general_cut_to']);
      }
      if (
        search_data["finish_general_polish_from"] &&
        search_data["finish_general_polish_to"]
      ) {
        search_div = 1;
        pol_arr = ["PO", "FA", "GD", "VG", "EX", "ID"];
        var polInit = search_data["finish_general_polish_from"];
        var polLast = search_data["finish_general_polish_to"];

        var polQueary =
          objsearcharr.length == 0 ? `WHERE polish IN (` : ` AND polish IN (`;
        var polValue = [];
        for (var i = polInit; i <= polLast; i++) {
          polQueary += polValue.length == 0 ? `?` : `, ?`;
          objsearcharr.push(pol_arr[i]);
          polValue.push(pol_arr[i]);
        }
        objsearch += polQueary;
        objsearch += `)`;
        // search_div = 1
        // objsearch += objsearcharr.length == 0 ? `WHERE polish IN (?,?) `:` AND polish IN (?,?) `
        // objsearcharr.push(search_data['finish_general_polish_from'],search_data['finish_general_polish_to']);
      }
      if (
        search_data["finish_general_symmetry_from"] &&
        search_data["finish_general_symmetry_to"]
      ) {
        search_div = 1;
        sym_arr = ["PO", "FA", "GD", "VG", "EX", "ID"];
        var symInit = search_data["finish_general_symmetry_from"];
        var symLast = search_data["finish_general_symmetry_to"];

        var symQueary =
          objsearcharr.length == 0
            ? `WHERE symmetry IN (`
            : ` AND symmetry IN (`;
        var symValue = [];
        for (var i = symInit; i <= symLast; i++) {
          symQueary += symValue.length == 0 ? `?` : `, ?`;
          objsearcharr.push(sym_arr[i]);
          symValue.push(sym_arr[i]);
        }
        objsearch += symQueary;
        objsearch += `)`;
        // search_div = 1
        // objsearch += objsearcharr.length == 0 ? `WHERE symmetry IN (?,?) `:` AND symmetry IN (?,?) `
        // objsearcharr.push(search_data['finish_general_symmetry_from'],search_data['finish_general_symmetry_to']);
      }
      if (search_data["color_fancy"].length > 0) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE color IN (?) `
            : ` AND color IN (?) `;
        objsearcharr.push(search_data["color_fancy"]);
      }
      if (
        search_data["color_white_intensity_from"] &&
        search_data["color_white_intensity_to"]
      ) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE fancy_color_intensity BETWEEN ? AND ? `
            : ` AND fancy_color_intensity BETWEEN ? AND ? `;
        objsearcharr.push(search_data["color_white_intensity_from"]);
        objsearcharr.push(search_data["color_white_intensity_to"]);
      }
      if (search_data["color_white_overtone"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE fancy_color_overtone = ? `
            : ` AND fancy_color_overtone = ? `;
        objsearcharr.push(search_data["color_white_overtone"]);
      }
      if (search_data["color_white_color"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE fancy_color_dominant_color = ? `
            : ` AND fancy_color_dominant_color = ? `;
        objsearcharr.push(search_data["color_white_color"]);
      }
      if (search_data["clarity"].length > 0) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE clarity IN (?) `
            : ` AND clarity IN (?) `;
        objsearcharr.push(search_data["clarity"]);
      }
      if (search_data["fluorescence_intensity"].length > 0) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE fluor_intensity IN (?) `
            : ` AND fluor_intensity IN (?) `;
        objsearcharr.push(search_data["fluorescence_intensity"]);
      }
      if (search_data["grading_report"].length > 0) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0 ? `WHERE lab IN (?) ` : ` AND lab IN (?) `;
        objsearcharr.push(search_data["grading_report"]);
      }
      if (search_data["location"].length > 0) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE country IN (?) `
            : ` AND country IN (?) `;
        objsearcharr.push(search_data["location"]);
      }
      if (search_data["stock_number"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE stock_number = ? `
            : ` AND stock_number = ? `;
        objsearcharr.push(search_data["stock_number"]);
      }
      if (search_data["price_ct_from"] && search_data["price_ct_to"]) {
        search_div = 1;
        console.log("$/ct: " + JSON.stringify(search_data)); //log
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE rap_price BETWEEN ? AND ? `
            : ` AND rap_price BETWEEN ? AND ? `;
        objsearcharr.push(search_data["price_ct_from"]);
        objsearcharr.push(search_data["price_ct_to"]);
      }
      if (search_data["price_total_from"] && search_data["price_total_to"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE sale_subtotal BETWEEN ? AND ? `
            : ` AND sale_subtotal BETWEEN ? AND ? `;
        objsearcharr.push(search_data["price_total_from"]);
        objsearcharr.push(search_data["price_total_to"]);
      }
      if (search_data["price_rap_from"] && search_data["price_rap_to"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE sale_back BETWEEN ? AND ? `
            : ` AND sale_back BETWEEN ? AND ? `;
        objsearcharr.push(search_data["price_rap_from"]);
        objsearcharr.push(search_data["price_rap_to"]);
      }
      if (search_data["show_only"].length > 0) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE availability IN (?) `
            : ` AND availability IN (?) `;
        objsearcharr.push(search_data["show_only"]);
      }
      if (search_data["brands"].length > 0) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE brands IN (?) `
            : ` AND brands IN (?) `;
        objsearcharr.push(search_data["brands"]);
      }
      if (search_data["per_depth_from"] && search_data["per_depth_to"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE depth_percent BETWEEN ? AND ? `
            : ` AND depth_percent BETWEEN ? AND ? `;
        objsearcharr.push(search_data["per_depth_from"]);
        objsearcharr.push(search_data["per_depth_to"]);
      }
      if (search_data["per_table_from"] && search_data["per_table_to"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE table_percent BETWEEN ? AND ? `
            : ` AND table_percent BETWEEN ? AND ? `;
        objsearcharr.push(search_data["per_table_from"]);
        objsearcharr.push(search_data["per_table_to"]);
      }
      if (
        search_data["metric_length_from"] &&
        search_data["metric_length_to"]
      ) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE meas_length BETWEEN ? AND ? `
            : ` AND meas_length BETWEEN ? AND ? `;
        objsearcharr.push(search_data["metric_length_from"]);
        objsearcharr.push(search_data["metric_length_to"]);
      }
      if (search_data["metric_width_from"] && search_data["metric_width_to"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE meas_width BETWEEN ? AND ? `
            : ` AND meas_width BETWEEN ? AND ? `;
        objsearcharr.push(search_data["metric_width_from"]);
        objsearcharr.push(search_data["metric_width_to"]);
      }
      if (search_data["metric_depth_from"] && search_data["metric_depth_to"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE meas_depth BETWEEN ? AND ? `
            : ` AND meas_depth BETWEEN ? AND ? `;
        objsearcharr.push(search_data["metric_depth_from"]);
        objsearcharr.push(search_data["metric_depth_to"]);
      }
      if (search_data["crown_height_from"] && search_data["crown_height_to"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE crown_height BETWEEN ? AND ? `
            : ` AND crown_height BETWEEN ? AND ? `;
        objsearcharr.push(search_data["crown_height_from"]);
        objsearcharr.push(search_data["crown_height_to"]);
      }
      if (search_data["crown_angle_from"] && search_data["crown_angle_to"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE crown_angle BETWEEN ? AND ? `
            : ` AND crown_angle BETWEEN ? AND ? `;
        objsearcharr.push(search_data["crown_angle_from"]);
        objsearcharr.push(search_data["crown_angle_to"]);
      }
      if (
        search_data["pavilion_depth_from"] &&
        search_data["pavilion_depth_to"]
      ) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE pavillion_depth BETWEEN ? AND ? `
            : ` AND pavillion_depth BETWEEN ? AND ? `;
        objsearcharr.push(search_data["pavilion_depth_from"]);
        objsearcharr.push(search_data["pavilion_depth_to"]);
      }
      if (
        search_data["pavilion_angle_from"] &&
        search_data["pavilion_angle_to"]
      ) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE pavillion_angle BETWEEN ? AND ? `
            : ` AND pavillion_angle BETWEEN ? AND ? `;
        objsearcharr.push(search_data["pavilion_angle_from"]);
        objsearcharr.push(search_data["pavilion_angle_to"]);
      }
      if (search_data["girdle"].length > 0) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE girdle_min IN (?) `
            : ` AND girdle_min IN (?) `;
        objsearcharr.push(search_data["girdle"]);
      }
      if (search_data["culet_size"].length > 0) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE culet_size IN (?) `
            : ` AND culet_size IN (?) `;
        objsearcharr.push(search_data["culet_size"]);
      }
      if (search_data["culet_condition"].length > 0) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE culet_condition IN (?) `
            : ` AND culet_condition IN (?) `;
        objsearcharr.push(search_data["culet_condition"]);
      }
      if (search_data["treatment"]) {
        if (search_data["treatment"] != "no-treatment") {
          search_div = 1;
          objsearch +=
            objsearcharr.length == 0
              ? `WHERE treatment = ? `
              : ` AND treatment = ? `;
          objsearcharr.push(search_data["treatment"]);
        }
      }
      if (search_data["symbol_checkbox"].length > 0) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE symbols IN (?) `
            : ` AND symbols IN (?) `;
        objsearcharr.push(search_data["symbol_checkbox"]);
      }
      if (search_data["lab_report_number"]) {
        search_div = 1;
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE report_number = ? `
            : ` AND report_number = ? `;
        objsearcharr.push(search_data["lab_report_number"]);
      }
      if (search_data["media"].length > 0) {
        search_div = 1;
        for (var i = 0; i < search_data["media"].length; i++) {
          if (search_data["media"][i] == "Photo") {
            objsearch +=
              objsearcharr.length == 0
                ? `WHERE diamond_img!='' `
                : ` AND diamond_img !='' `;
          }
          if (search_data["media"][i] == "Video") {
            objsearch +=
              objsearcharr.length == 0
                ? `WHERE video_link!='' `
                : ` AND video_link!='' `;
          }
          if (search_data["media"][i] == "Lab report") {
            objsearch +=
              objsearcharr.length == 0
                ? `WHERE report_file!='' `
                : ` AND report_file!='' `;
          }
        }
      }
      objsearcharr = objsearcharr.concat(objsearcharr);
      let sql = `SELECT * FROM diamonds ${objsearch}ORDER BY ${
        columns[order[0].column].data
      } ${
        order[0].dir
      } limit ${start},${length};SELECT count(*) as cnt FROM diamonds ${objsearch}`;
      conn.query(sql, objsearcharr, function (error, resdata) {
        if (error) {
          res.json({ status: 501, success: false, message: error });
        } else {
          if (resdata[0].length > 0) {
            if (search_div == 1) {
              if (search_saved_id) {
                var data1 = { body: JSON.stringify(search_data) };
                let sql =
                  "UPDATE diamonds_search_saved SET ?, updated_at = current_timestamp WHERE search_saved_id = ?";
                conn.query(sql, [data1, search_saved_id], (err, results1) => {
                  if (err) {
                    res.json({ status: 501, success: false, message: err });
                  } else {
                    if (results1.affectedRows === 1) {
                      let sql2 =
                        "SELECT * FROM `diamonds_search_saved` WHERE search_saved_id = ?";
                      conn.query(sql2, [search_saved_id], (err, results2) => {
                        if (err) {
                          res.json({
                            status: 501,
                            success: false,
                            message: err,
                          });
                        } else {
                          if (results2.length > 0) {
                            res.json({
                              status: 200,
                              success: true,
                              message: "Get diamond successfully",
                              response: resdata[0],
                              TotalRecords: resdata[1][0],
                              Search_saved: results2[0],
                            });
                          } else {
                            res.json({
                              status: 400,
                              success: false,
                              message: "No data Found",
                            });
                          }
                        }
                      });
                    } else {
                      res.json({
                        status: 400,
                        success: false,
                        message: "No data Found",
                      });
                    }
                  }
                });
              } else {
                var data1 = {
                  userId: userId,
                  body: JSON.stringify(search_data),
                };
                let sql1 = "INSERT INTO diamonds_search_saved SET ?";
                conn.query(sql1, data1, (err, results1) => {
                  if (err) {
                    res.json({ status: 501, success: false, message: err });
                  } else {
                    if (results1.affectedRows === 1) {
                      var search_id = results1.insertId;
                      let sql2 =
                        "SELECT * FROM `diamonds_search_saved` WHERE search_saved_id = ?";
                      conn.query(sql2, [search_id], (err, results2) => {
                        if (err) {
                          res.json({
                            status: 501,
                            success: false,
                            message: err,
                          });
                        } else {
                          if (results2.length > 0) {
                            res.json({
                              status: 200,
                              success: true,
                              message: "Get diamond successfully",
                              response: resdata[0],
                              TotalRecords: resdata[1][0],
                              Search_saved: results2[0],
                            });
                          } else {
                            res.json({
                              status: 400,
                              success: false,
                              message: "No data Found",
                            });
                          }
                        }
                      });
                    } else {
                      res.json({
                        status: 400,
                        success: false,
                        message: "No data Found",
                        TotalRecords: 0,
                      });
                    }
                  }
                });
              }
            } else {
              res.json({
                status: 200,
                success: true,
                message: "Get diamond successfully",
                response: resdata[0],
                TotalRecords: resdata[1][0],
              });
            }
          } else {
            res.json({
              status: 400,
              success: false,
              message: "No data Found",
              TotalRecords: 0,
            });
          }
        }
      });
    }
  }
);

router.post(
  "/newproduct",
  [
    check("columns").exists(),
    check("start").exists(),
    check("order").exists(),
    check("length").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({
        status: 401,
        success: false,
        message: err,
      });
      return;
    } else {
      var objsearch = ``;
      var objsearcharr = [];
      var search_div = 0;
      var { userId, columns, order, start, length, search_saved_id } = req.body;
      var search_data = req.body.search_data;

      let sqlLast = `SELECT MAX(created_at) AS lastdatetime FROM diamonds`;
      conn.query(sqlLast, (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.length > 0) {
            var lastdatetime = results[0]["lastdatetime"];
            function formatDate(date) {
              var d = new Date(date),
                month = "" + (d.getMonth() + 1),
                day = "" + d.getDate(),
                year = d.getFullYear();

              if (month.length < 2) month = "0" + month;
              if (day.length < 2) day = "0" + day;

              return [year, month, day].join("-");
            }
            var formlastdate = formatDate(lastdatetime).toString();

            let sql = `SELECT * FROM diamonds WHERE created_at >= '${formlastdate}' - interval 1 week AND status = 1 ORDER BY ${
              columns[order[0].column].data
            } ${
              order[0].dir
            } limit ${start},${length};SELECT count(*) as cnt FROM diamonds WHERE created_at >= '${formlastdate}' - interval 1 week AND status = 1`;
            conn.query(sql, objsearcharr, function (error, resdata) {
              if (error) {
                res.json({ status: 501, success: false, message: error });
              } else {
                if (resdata[0].length > 0) {
                  res.json({
                    status: 200,
                    success: true,
                    message: "Get diamond successfully",
                    response: resdata[0],
                    TotalRecords: resdata[1][0],
                  });
                }
              }
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post("/ExportOrders", (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err,
    });
    return;
  } else {
    let userId = req.body.userId;
    let sql =
      "SELECT CONCAT(REPEAT('0', 7-LENGTH(order_id)), order_id) AS order_number,item,pieces,cts,avg_disc,total_cr,total_price,status,created_at,updated_at FROM orders WHERE userId = ?";
    conn.query(sql, [userId], (error, resdata) => {
      if (error) {
        res.json({ status: 501, success: false, message: error });
      } else {
        if (resdata.length > 0) {
          let tmpRes = resdata;
          let resNew = [];
          tmpRes.forEach(function (item) {
            item.order_number = "#" + item.order_number;
            if (item.status == 1) {
              item.status = "Pending";
            } else if (item.status == 2) {
              item.status = "Completed";
            } else if (item.status == 3) {
              item.status = "Cancel";
            } else if (item.status == 4) {
              item.status = "Deleted";
            }
            //item.created_at = moment(item.created_at).format('DD/MM/YYYY');
            //item.updated_at = moment(item.updated_at).format('DD/MM/YYYY');
            resNew.push(item);
          });
          res.json({
            status: 200,
            success: true,
            message: "Export Diamonds Successfully",
            data: resNew,
          });
        } else {
          res.json({ status: 400, success: false, message: "No data Found" });
        }
      }
    });
  }
});

router.post("/ExportWatchList", (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err,
    });
    return;
  } else {
    let DiamondList = req.body.DiamondList;
    let where = "";
    if (DiamondList.length > 0) {
      where += `WHERE diamond_id IN (${DiamondList.toString()})`;
    }
    let sql = `SELECT diamond_id,diamond_type,stock_number,sale_back,sale_price_back,sale_subtotal,availability,country,state,city,shape,size,color,clarity,cut,polish,symmetry,fluor_intensity,fluor_color,meas_length,meas_width,meas_depth,depth_percent,table_percent,crown_angle,crown_height,pavillion_angle,pavillion_depth,girdle_condition,girdle_min,girdle_max,girdle_per,culet_condition,culet_size,treatment,laser_inscription,star_length,lab,report_number,report_date,lab_location,report_comment,symbols,fancy_color_intensity,fancy_color_overtone,fancy_color_dominant_color,fancy_color_secondary_color,sarine_loupe,seller_spec,shade,milky,eye_clean,open_inclusions,black_inclusions,white_inclusions,brands,report_file,diamond_img,video_link,status,created_at,updated_at FROM diamonds ${where}`;
    conn.query(sql, (error, resdata) => {
      if (error) {
        res.json({ status: 501, success: false, message: error });
      } else {
        let tmpRes = resdata;
        let resNew = [];
        tmpRes.forEach(function (item) {
          item.availability =
            item.availability != null ? item.availability : "";
          item.country = item.country != null ? item.country : "";
          item.state = item.state != null ? item.state : "";
          item.city = item.city != null ? item.city : "";
          item.size = item.size != null ? item.size : "";
          item.color = item.color != null ? item.color : "";
          item.clarity = item.clarity != null ? item.clarity : "";
          item.cut = item.cut != null ? item.cut : "";
          item.polish = item.polish != null ? item.polish : "";
          item.symmetry = item.symmetry != null ? item.symmetry : "";
          item.fluor_intensity =
            item.fluor_intensity != null ? item.fluor_intensity : "";
          item.fluor_color = item.fluor_color != null ? item.fluor_color : "";
          item.meas_length = item.meas_length != null ? item.meas_length : "";
          item.meas_width = item.meas_width != null ? item.meas_width : "";
          item.meas_depth = item.meas_depth != null ? item.meas_depth : "";
          item.depth_percent =
            item.depth_percent != null ? item.depth_percent : "";
          item.table_percent =
            item.table_percent != null ? item.table_percent : "";
          item.crown_angle = item.crown_angle != null ? item.crown_angle : "";
          item.crown_height =
            item.crown_height != null ? item.crown_height : "";
          item.pavillion_angle =
            item.pavillion_angle != null ? item.pavillion_angle : "";
          item.pavillion_depth =
            item.pavillion_depth != null ? item.pavillion_depth : "";
          item.girdle_condition =
            item.girdle_condition != null ? item.girdle_condition : "";
          item.girdle_min = item.girdle_min != null ? item.girdle_min : "";
          item.girdle_max = item.girdle_max != null ? item.girdle_max : "";
          item.girdle_per = item.girdle_per != null ? item.girdle_per : "";
          item.culet_condition =
            item.culet_condition != null ? item.culet_condition : "";
          item.culet_size = item.culet_size != null ? item.culet_size : "";
          item.treatment = item.treatment != null ? item.treatment : "";
          item.laser_inscription =
            item.laser_inscription != null ? item.laser_inscription : "";
          item.star_length = item.star_length != null ? item.star_length : "";
          item.lab = item.lab != null ? item.lab : "";
          item.report_number =
            item.report_number != null && item.report_number != 0
              ? item.report_number
              : "";
          item.report_date =
            item.report_date != "0000-00-00" && item.report_date != null
              ? moment(item.report_date).format("DD/MM/YYYY")
              : "";
          item.lab_location =
            item.lab_location != null ? item.lab_location : "";
          item.report_comment =
            item.report_comment != null ? item.report_comment : "";
          item.symbols = item.symbols != null ? item.symbols : "";
          item.fancy_color_intensity =
            item.fancy_color_intensity != null
              ? item.fancy_color_intensity
              : "";
          item.fancy_color_overtone =
            item.fancy_color_overtone != null ? item.fancy_color_overtone : "";
          item.fancy_color_dominant_color =
            item.fancy_color_dominant_color != null
              ? item.fancy_color_dominant_color
              : "";
          item.fancy_color_secondary_color =
            item.fancy_color_secondary_color != null
              ? item.fancy_color_secondary_color
              : "";
          item.sarine_loupe =
            item.sarine_loupe != null ? item.sarine_loupe : "";
          item.seller_spec = item.seller_spec != null ? item.seller_spec : "";
          item.shade = item.shade != null ? item.shade : "";
          item.milky = item.milky != null ? item.milky : "";
          item.eye_clean = item.eye_clean != null ? item.eye_clean : "";
          item.open_inclusions =
            item.open_inclusions != null ? item.open_inclusions : "";
          item.black_inclusions =
            item.black_inclusions != null ? item.black_inclusions : "";
          item.white_inclusions =
            item.white_inclusions != null ? item.white_inclusions : "";
          item.brands = item.brands != null ? item.brands : "";
          item.video_link = item.video_link != null ? item.video_link : "";
          item.status = item.status == 1 ? "Active" : "Deactivated";
          item.created_at = moment(item.created_at).format("DD/MM/YYYY");
          item.updated_at = moment(item.updated_at).format("DD/MM/YYYY");
          var pattern = /^((http|https|ftp):\/\/)/;
          if (pattern.test(item.report_file)) {
            item.report_file = item.report_file != null ? item.report_file : "";
          } else {
            item.report_file =
              item.report_file != null
                ? BACKEND_URL + "" + item.report_file
                : "";
          }
          if (pattern.test(item.diamond_img)) {
            item.diamond_img = item.diamond_img != null ? item.diamond_img : "";
          } else {
            item.diamond_img =
              item.diamond_img != null
                ? BACKEND_URL + "" + item.diamond_img
                : "";
          }
          resNew.push(item);
        });
        res.json({
          status: 200,
          success: true,
          message: "Export Diamonds Successfully",
          data: resNew,
        });
      }
    });
  }
});

router.post(
  "/GetCartData",
  [
    check("columns").exists(),
    check("start").exists(),
    check("order").exists(),
    check("length").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({
        status: 401,
        success: false,
        message: err,
      });
      return;
    } else {
      var { userId, columns, order, start, length } = req.body;
      var objsearch = ``;
      var objsearcharr = [];
      let sql2 = "SELECT * FROM `cart` WHERE userId = ?";
      conn.query(sql2, [userId], (err, results2) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results2.length > 0) {
            var diamondList = results2[0].diamondList;
            if (diamondList) {
              objsearcharr = objsearcharr.concat(objsearcharr);
              let sql = `SELECT * FROM diamonds WHERE diamond_id IN (${diamondList}) ${objsearch}ORDER BY ${
                columns[order[0].column].data
              } ${
                order[0].dir
              } limit ${start},${length};SELECT count(*) as cnt FROM diamonds WHERE diamond_id IN (${diamondList}) ${objsearch}`;
              conn.query(sql, objsearcharr, function (error, resdata) {
                if (error) {
                  res.json({ status: 501, success: false, message: error });
                } else {
                  if (resdata[0].length > 0) {
                    if (diamondList) {
                      diamondList = diamondList.split(",").map(Number);
                    } else {
                      diamondList = [];
                    }
                    res.json({
                      status: 200,
                      success: true,
                      message: "Get diamond successfully",
                      DiamondList: diamondList,
                      data: resdata[0],
                      TotalRecords: resdata[1][0],
                    });
                  } else {
                    res.json({
                      status: 400,
                      success: false,
                      message: "No data Found",
                      TotalRecords: 0,
                    });
                  }
                }
              });
            } else {
              res.json({
                status: 400,
                success: false,
                message: "No data Found",
                TotalRecords: 0,
              });
            }
          } else {
            res.json({
              status: 400,
              success: false,
              message: "No data Found",
              TotalRecords: 0,
            });
          }
        }
      });
    }
  }
);

router.post(
  "/GetOrderDetails",
  [
    check("columns").exists(),
    check("start").exists(),
    check("order").exists(),
    check("length").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({
        status: 401,
        success: false,
        message: err,
      });
      return;
    } else {
      var { order_id, columns, order, start, length } = req.body;
      var objsearch = ``;
      var objsearcharr = [];
      let sql =
        "SELECT *,CONCAT(REPEAT('0', 7-LENGTH(order_id)), order_id) AS order_number FROM `orders` WHERE order_id = ?";
      conn.query(sql, [order_id], (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.length > 0) {
            var diamond_id = results[0].item;
            if (diamond_id != "" && diamond_id != undefined) {
              objsearcharr = objsearcharr.concat(objsearcharr);
              let sql1 = `SELECT * FROM diamonds WHERE diamond_id IN (${diamond_id}) ${objsearch}ORDER BY ${
                columns[order[0].column].data
              } ${
                order[0].dir
              } limit ${start},${length};SELECT count(*) as cnt FROM diamonds WHERE diamond_id IN (${diamond_id}) ${objsearch}`;
              conn.query(sql1, objsearcharr, function (error, resdata) {
                if (error) {
                  res.json({ status: 501, success: false, message: error });
                } else {
                  res.json({
                    status: 200,
                    success: true,
                    message: "Get diamond successfully",
                    response: resdata[0],
                    TotalRecords: resdata[1][0],
                    OrderDetails: results[0],
                  });
                }
              });
            }
          } else {
            res.json({ status: 501, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post("/RemoveCart", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({ status: 401, success: false, message: err });
    return;
  } else {
    var { userId, RemoveList } = req.body;
    let sql = "SELECT * FROM `cart` WHERE userId = ?";
    conn.query(sql, [userId], (err, results) => {
      if (err) {
        res.json({ status: 501, success: false, message: err });
      } else {
        if (results.length > 0) {
          var diamondList = results[0].diamondList;
          if (diamondList) {
            diamondList = diamondList.split(",").map(Number);
          } else {
            diamondList = [];
          }
          var index;
          for (var i = 0; i < RemoveList.length; i++) {
            index = diamondList.indexOf(RemoveList[i]);
            if (index > -1) {
              diamondList.splice(index, 1);
            }
          }
          var data = { diamondList: diamondList.toString() };
          let sql1 =
            "UPDATE `cart` SET ?, updated_at = current_timestamp WHERE `userId` = ?";
          conn.query(sql1, [data, userId], (err, results1) => {
            if (err) {
              res.json({ status: 501, success: false, message: err });
            } else {
              if (results1.affectedRows === 1) {
                res.json({
                  status: 200,
                  success: true,
                  message: "Diamond Remove in cart successfully",
                });
              } else {
                res.json({
                  status: 400,
                  success: false,
                  message: "No data Found",
                });
              }
            }
          });
        } else {
          res.json({ status: 400, success: false, message: "No data Found" });
        }
      }
    });
  }
});

router.post("/GetCartItem", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({ status: 401, success: false, message: err });
    return;
  } else {
    var { userId } = req.body;
    let sql = "SELECT * FROM `cart` WHERE userId = ?";
    conn.query(sql, [userId], (err, results) => {
      if (err) {
        res.json({ status: 501, success: false, message: err });
      } else {
        if (results.length > 0) {
          var diamondList = results[0].diamondList;
          if (diamondList) {
            diamondList = diamondList.split(",").map(Number);
          } else {
            diamondList = [];
          }
          res.json({
            status: 200,
            success: true,
            message: "Get data successfully",
            data: diamondList,
          });
        } else {
          res.json({ status: 400, success: false, message: "No data Found" });
        }
      }
    });
  }
});

router.post("/GetRecordSettings", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({ status: 401, success: false, message: err });
    return;
  } else {
    let sql = "SELECT * FROM `homepage_settings`";
    conn.query(sql, (err, results) => {
      if (err) {
        res.json({ status: 501, success: false, message: err });
      } else {
        if (results.length > 0) {
          res.json({
            status: 200,
            success: true,
            message: "Get Data Successfully",
            data: results,
          });
        } else {
          res.json({ status: 400, success: false, message: "No data Found" });
        }
      }
    });
  }
});

router.post("/GetRecordMilestones", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({ status: 401, success: false, message: err });
    return;
  } else {
    let sql = "SELECT * FROM `milestones` WHERE status = 1";
    conn.query(sql, (err, results) => {
      if (err) {
        res.json({ status: 501, success: false, message: err });
      } else {
        if (results.length > 0) {
          res.json({
            status: 200,
            success: true,
            message: "Get Data Successfully",
            data: results,
          });
        } else {
          res.json({ status: 400, success: false, message: "No data Found" });
        }
      }
    });
  }
});

router.post("/GetRecordTestimonials", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({ status: 401, success: false, message: err });
    return;
  } else {
    let sql = "SELECT * FROM `testimonials` WHERE status = 1";
    conn.query(sql, (err, results) => {
      if (err) {
        res.json({ status: 501, success: false, message: err });
      } else {
        if (results.length > 0) {
          res.json({
            status: 200,
            success: true,
            message: "Get Data Successfully",
            data: results,
          });
        } else {
          res.json({ status: 400, success: false, message: "No data Found" });
        }
      }
    });
  }
});

router.post("/GetRecordBrands", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({ status: 401, success: false, message: err });
    return;
  } else {
    let sql = "SELECT * FROM `brands` WHERE status = 1";
    conn.query(sql, (err, results) => {
      if (err) {
        res.json({ status: 501, success: false, message: err });
      } else {
        if (results.length > 0) {
          res.json({
            status: 200,
            success: true,
            message: "Get Data Successfully",
            data: results,
          });
        } else {
          res.json({ status: 400, success: false, message: "No data Found" });
        }
      }
    });
  }
});

router.post("/subscriberMail", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({ status: 401, success: false, message: err });
    return;
  } else {
    let subscriber_email = req.body.subscriber_email;
    let sql = "SELECT * FROM `subscribers` WHERE subscriber_email = ?";
    conn.query(sql, [subscriber_email], (err, results) => {
      if (err) {
        res.json({ status: 501, success: false, message: err });
      } else {
        if (results.length > 0) {
          res.json({
            status: 200,
            success: true,
            message: "Email is Already Subscribe",
            data: results,
          });
        } else {
          let data = { subscriber_email: subscriber_email };
          let sql1 = "INSERT INTO subscribers SET ?";
          conn.query(sql1, data, (err, results1) => {
            if (err) {
              res.json({ status: 501, success: false, message: err });
            } else {
              if (results1.affectedRows === 1) {
                var newsfeed_email = subscriber_email;
                var newsfeed_subject = `Thank You For Join Kukadia.co Newsfeeds`;
                var newsfeed_html = `<!DOCTYPE html>
                  <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
                      <head>
                          <title>Kukadia</title>
                          <style>@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');</style>
                      </head>
                  
                      <body style="margin: 0; padding: 0; background: #fff; font-family: 'Roboto', sans-serif;font-weight: 400;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                  <td>
                                      <table width="560px" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                          <tr>
                                              <td style="background: #dbf1dc; height: auto; padding: 0 0;" align="center">
                                                  <p style="color: #033603; font-size: 16px; font-family: 'Roboto', sans-serif;line-height: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.065em;">
                                                      Real is rare. rare Lasts Forever.
                                                  </p>
                                              </td>
                                          </tr>
                                          <tr>
                                              <td style="text-align: center; padding: 25px 0;">
                                                  <img src="${process.env.BACKEND_URL}upload/mail/kukadia-logo.png" alt="kukadia-logo" />
                                              </td>
                                          </tr>
                  
                                          <tr>
                                              <td style="text-align: center; padding: 10px 0;">
                                                  <img src="${process.env.BACKEND_URL}upload/mail/email-image.png" alt="" />
                                              </td>
                                          </tr>
                  
                                          <tr>
                                              <td style="text-align: center; padding: 0; padding-top: 0;">
                                                  <h1 style="letter-spacing: 0.0066em; font-size: 25px; font-weight: 700; text-transform: capitalize; color: #000000;">Thank You For <span style="display: block;">Subscribing Newsfeed!</span></h1>
                                                  <span style="display: block; font-size: 16px; letter-spacing: 0.01em; color: #000000;"><b>${subscriber_email}</b></span>
                                                  <p style="letter-spacing: 0.01em; font-size: 16px; line-height: 24px; color: #000000;">
                                                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                                                      aliquip ex ea commodo consequat.
                                                  </p>
                                                  <span style="display: inline-block; border-bottom: 1px solid #000000; padding: 0 0 5px 0;">
                                                      <a
                                                          href="${process.env.FRONTEND_URL}"
                                                          style="
                                                              display: inline-block;
                                                              background: #033603;
                                                              color: #fff !important;
                                                              font-weight: 400;
                                                              text-transform: uppercase;
                                                              font-size: 16px;
                                                              letter-spacing: 0.0066em;
                                                              border: 0;
                                                              outline: none;
                                                              border-radius: 0;
                                                              -webkit-border-radius: 0;
                                                              -moz-border-radius: 0;
                                                              padding: 12px 25px 13px 25px;
                                                              text-align: center;
                                                              margin-top: 15px;
                                                              text-decoration: none;
                                                              font-family: 'Roboto', sans-serif;
                                                          "
                                                      >
                                                          Go To Home page
                                                      </a>
                                                  </span>
                                              </td>
                                          </tr>
                  
                                          <tr>
                                              <td>
                                                  <div
                                                      class="footer-bg-img"
                                                      style="
                                                          position: relative;
                                                          margin-top: 40px;
                                                          background: url(${process.env.BACKEND_URL}upload/mail/footer_bg_kukadia.png);
                                                          background-repeat: no-repeat;
                                                          background-position: center;
                                                          background-size: cover;
                                                          padding: 20px 0 1px 0;
                                                          vertical-align: middle;
                                                          text-align: center;
                                                          font-family: 'Roboto', sans-serif;
                                                      "
                                                  >
                                                      <div class="footer-content">
                                                          <span style="display: block; text-align: center; margin: 0 0 15px 0;">
                                                              <img src="${process.env.BACKEND_URL}upload/mail/kukadia-ventures.png" alt="striliant-logo" style="border-right: 1px solid #182342; padding: 0 10px; padding-right: 20px;" />
                                                              <img style="margin-left: 20px;" src="${process.env.BACKEND_URL}upload/mail/kukadia-corporation..png" alt="striliant-logo" />
                                                          </span>
                                                          <div class="social-icon">
                                                              <h3 style="text-transform: uppercase; font-weight: 600; font-size: 14px; line-height: 27px; margin: 0; color: #000;">Follow US</h3>
                                                              <ul class="list-unstyled-css" style="list-style: none; padding: 0;">
                                                                  <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                      <a href="https://www.facebook.com/kukadia.co/"><img src="${process.env.BACKEND_URL}upload/mail/facebook.png" /></a>
                                                                  </li>
                                                                  <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                      <a href="https://www.instagram.com/kukadia.co/"><img src="${process.env.BACKEND_URL}upload/mail/instagram-sketched.png" /></a>
                                                                  </li>
                                                                  <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                      <a href="#"><img src="${process.env.BACKEND_URL}upload/mail/twitter.png" /></a>
                                                                  </li>
                                                                  <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                      <a href="#"><img src="${process.env.BACKEND_URL}upload/mail/youtube.png" /></a>
                                                                  </li>
                                                              </ul>
                                                          </div>
                  
                                                          <div class="footer-link-blog">
                                                              <ul style="list-style: none; padding: 0;">
                                                                  <li class="active" style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                      <a href="#" style="color: #033603; text-decoration: underline; font-family: 'Roboto', sans-serif;">Unsubscribe</a>
                                                                  </li>
                                                                  <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                      <a href="${process.env.FRONTEND_URL}policy" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Privacy policy</a>
                                                                  </li>
                                                                  <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                      <a href="${process.env.FRONTEND_URL}terms-and-condition" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Terms of Service</a>
                                                                  </li>
                                                                  <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                      <a href="${process.env.FRONTEND_URL}contact-us" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Visit Us</a>
                                                                  </li>
                                                              </ul>
                                                          </div>
                                                          <div class="footer-desc">
                                                              <ul style="list-style: none; padding: 0;">
                                                                  <li class="active" style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                      <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Surat</a>
                                                                  </li>
                                                                  <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                      <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Mumbai</a>
                                                                  </li>
                                                                  <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                      <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">New York</a>
                                                                  </li>
                                                                  <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                      <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Toronto</a>
                                                                  </li>
                                                                  <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                      <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Montreal</a>
                                                                  </li>
                                                              </ul>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </td>
                                          </tr>
                  
                                          <tr>
                                              <td style="background-color: #033603; color: #fff; text-align: center;">
                                                  <h4 style="font-weight: normal; margin: 10px 0; font-size: 14px;">&#169; 2021 Kukadia Ventures Pvt. Ltd. All Rights Reserved.</h4>
                                              </td>
                                          </tr>
                                      </table>
                                  </td>
                              </tr>
                          </table>
                      </body>
                  </html>
                  `;
                var check = helper.email_helper(
                  "",
                  newsfeed_email,
                  newsfeed_subject,
                  newsfeed_html
                );

                // var admin_subject = `New Subscriber Join Kukadia.co Newsfeeds`
                // var admin_html = `<h1>new subscribe register.</h1>`
                // var admin_check  = helper.email_helper('',ADMINEMAIL,admin_subject,admin_html)

                if (check) {
                  res.json({
                    status: 200,
                    success: true,
                    message: "Email is Subscribe",
                  });
                } else {
                  res.json({
                    status: 400,
                    success: false,
                    message:
                      "Email is Subscribe Successfully but mail not received",
                    response: results1[0],
                  });
                }
                //res.json({status: 200, success: true, message: 'Email is Subscribe', response: results1[0]});
              } else {
                res.json({
                  status: 400,
                  success: false,
                  message: "No data Found",
                });
              }
            }
          });
        }
      }
    });
  }
});

router.post(
  "/uploadDiamonds",
  [
    passport.authenticate("userLogin", { session: false }),
    check("userId").exists(),
    check("asking_price").exists(),
    check("asking_price_unit").exists(),
    check("cash_price").exists(),
    check("cash_price_unit").exists(),
    check("shape").exists(),
    check("size").exists(),
    check("color").exists(),
    check("clarity").exists(),
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      let {
        diamond_id,
        userId,
        stock_number,
        asking_price,
        asking_price_unit,
        cash_price,
        cash_price_unit,
        availability,
        country,
        state,
        city,
        shape,
        size,
        color,
        clarity,
        cut,
        polish,
        symmetry,
        fluor_intensity,
        fluor_color,
        meas_length,
        meas_width,
        meas_depth,
        depth_percent,
        table_percent,
        crown_angle,
        crown_height,
        pavillion_angle,
        pavillion_depth,
        girdle_condition,
        girdle_min,
        girdle_max,
        girdle_per,
        culet_condition,
        culet_size,
        treatment,
        laser_inscription,
        star_length,
        lab,
        report_number,
        report_date,
        lab_location,
        report_comment,
        symbols,
        fancy_color_intensity,
        fancy_color_overtone,
        fancy_color_dominant_color,
        fancy_color_secondary_color,
        sarine_loupe,
        seller_spec,
        shade,
        milky,
        eye_clean,
        open_inclusions,
        black_inclusions,
        white_inclusions,
        report_upload_link,
        diamond_upload_link,
      } = req.body;

      if (report_date != "") {
        report_date = moment(report_date.split("/").reverse().join("-")).format(
          "YYYY-MM-DD"
        );
      } else {
        report_date = null;
      }
      var newsymbols = "";
      if (symbols != "") {
        newsymbols = symbols.toString();
      }
      var new_open_inclusions = "";
      if (open_inclusions != "" && open_inclusions != null) {
        new_open_inclusions = open_inclusions;
      }
      var new_black_inclusions = "";
      if (black_inclusions != "" && black_inclusions != null) {
        new_black_inclusions = black_inclusions;
      }
      var new_white_inclusions = "";
      if (white_inclusions != "" && white_inclusions != null) {
        new_white_inclusions = white_inclusions;
      }
      let data = {
        userId: userId,
        stock_number: stock_number,
        asking_price: asking_price,
        asking_price_unit: asking_price_unit,
        cash_price: cash_price,
        cash_price_unit: cash_price_unit,
        availability: availability,
        country: country,
        state: state,
        city: city,
        shape: shape,
        size: size,
        color: color,
        clarity: clarity,
        cut: cut,
        polish: polish,
        symmetry: symmetry,
        fluor_intensity: fluor_intensity,
        fluor_color: fluor_color,
        meas_length: meas_length,
        meas_width: meas_width,
        meas_depth: meas_depth,
        depth_percent: depth_percent,
        table_percent: table_percent,
        crown_angle: crown_angle,
        crown_height: crown_height,
        pavillion_angle: pavillion_angle,
        pavillion_depth: pavillion_depth,
        girdle_condition: girdle_condition,
        girdle_min: girdle_min,
        girdle_max: girdle_max,
        girdle_per: girdle_per,
        culet_condition: culet_condition,
        culet_size: culet_size,
        treatment: treatment,
        laser_inscription: laser_inscription,
        star_length: star_length,
        lab: lab,
        report_number: report_number,
        report_date: report_date,
        lab_location: lab_location,
        report_comment: report_comment,
        symbols: newsymbols,
        fancy_color_intensity: fancy_color_intensity,
        fancy_color_overtone: fancy_color_overtone,
        fancy_color_dominant_color: fancy_color_dominant_color,
        fancy_color_secondary_color: fancy_color_secondary_color,
        sarine_loupe: sarine_loupe,
        seller_spec: seller_spec,
        shade: shade,
        milky: milky,
        eye_clean: eye_clean,
        open_inclusions: new_open_inclusions,
        black_inclusions: new_black_inclusions,
        white_inclusions: new_white_inclusions,
        report_file: report_upload_link,
        diamond_img: diamond_upload_link,
      };
      if (req.files && Object.keys(req.files).length > 0) {
        if (req.files.report_file != undefined) {
          let report_file = req.files.report_file;
          report_file.name = report_file.name.replace(/ /g, "_");
          let filename =
            Math.floor(Math.random() * 100000) + "-" + report_file.name;
          let file_url = "./upload/diamonds/" + filename;
          let file_name = "upload/diamonds/" + filename;
          report_file.mv(file_url, function (error) {
            if (error) {
              res.json({ status: 501, success: false, message: error });
            } else {
              data.report_file = file_name;
            }
          });
        }
        if (req.files.diamond_img != undefined) {
          let diamond_img = req.files.diamond_img;
          diamond_img.name = diamond_img.name.replace(/ /g, "_");
          let filename1 =
            Math.floor(Math.random() * 100000) + "-" + diamond_img.name;
          let file_url1 = "./upload/diamonds/" + filename1;
          let file_name1 = "upload/diamonds/" + filename1;
          diamond_img.mv(file_url1, function (error) {
            if (error) {
              res.json({ status: 501, success: false, message: error });
            } else {
              data.diamond_img = file_name1;
            }
          });
        }
      }

      if (diamond_id) {
        let sql = "UPDATE diamonds SET ? WHERE diamond_id = ?";
        conn.query(sql, [data, diamond_id], (err, results) => {
          if (err) {
            res.json({ status: 501, success: false, message: err });
          } else {
            if (results.affectedRows === 1) {
              res.json({
                status: 200,
                success: true,
                message: "Diamonds Update Successfully",
                response: results[0],
              });
            } else {
              res.json({
                status: 400,
                success: false,
                message: "No data Found",
              });
            }
          }
        });
      } else {
        data.status = 1;
        let sql = "INSERT INTO diamonds SET ?";
        conn.query(sql, data, (err, results) => {
          if (err) {
            res.json({ status: 501, success: false, message: err });
          } else {
            if (results.affectedRows === 1) {
              res.json({
                status: 200,
                success: true,
                message: "Diamonds Upload Successfully",
                response: results[0],
              });
            } else {
              res.json({
                status: 400,
                success: false,
                message: "No data Found",
              });
            }
          }
        });
      }
    }
  }
);

router.post(
  "/AddToCart",
  [passport.authenticate("userLogin", { session: false })],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      let { cartId, userId, diamondList } = req.body;
      let data = {
        userId: userId,
        diamondList: diamondList.toString(),
      };
      let sql = "SELECT * FROM `cart` WHERE `userId` = ?";
      conn.query(sql, [userId], (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          var sqlwatchlist = "SELECT * FROM watchlist WHERE userId = ?;"; //UPDATE watchlist SET diamondList = '188,183,180,181,182,197,204,198,196' WHERE (userId = '12');
          conn.query(sqlwatchlist, [userId], (err, results2) => {
            if (err) {
              res.json({ status: 501, success: false, message: err });
              console.log(
                "rmv watchlist err::::" + CircularJSON.stringify(err)
              );
            } else {
              console.log("");
              if (results.length > 0) {
                let sql1 =
                  "UPDATE `cart` SET ?, updated_at = current_timestamp WHERE `userId` = ?";
                conn.query(sql1, [data, userId], (err, results1) => {
                  if (err) {
                    res.json({ status: 501, success: false, message: err });
                  } else {
                    if (results1.affectedRows === 1) {
                      console.log("321321");
                      res.json({
                        status: 200,
                        success: true,
                        message: "Diamond added in cart successfully",
                        cartId: results[0].cartId,
                      });
                    } else {
                      res.json({
                        status: 400,
                        success: false,
                        message: "No data Found",
                      });
                    }
                  }
                });
              } else {
                let sql2 = "INSERT INTO `cart` SET ?";
                conn.query(sql2, data, (err, results3) => {
                  if (err) {
                    res.json({ status: 501, success: false, message: err });
                  } else {
                    if (results3.affectedRows === 1) {
                      console.log("123123");
                      var cartId = results3.insertId;
                      res.json({
                        status: 200,
                        success: true,
                        message: "Diamond added in cart successfully",
                        cartId: cartId,
                      });
                    } else {
                      res.json({
                        status: 400,
                        success: false,
                        message: "No data Found",
                      });
                    }
                  }
                });
              }
            }
          });
        }
      });
    }
  }
);

router.post("/ExportDiamonds", (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err,
    });
    return;
  } else {
    let DiamondList = req.body.DiamondList;
    let where = "";
    if (DiamondList.length > 0) {
      where += `WHERE diamond_id IN (${DiamondList.toString()})`;
    }
    let sql = `SELECT diamond_id,diamond_type,stock_number,sale_back,sale_price_back,sale_subtotal,availability,country,state,city,shape,size,color,clarity,cut,polish,symmetry,fluor_intensity,fluor_color,meas_length,meas_width,meas_depth,depth_percent,table_percent,crown_angle,crown_height,pavillion_angle,pavillion_depth,girdle_condition,girdle_min,girdle_max,girdle_per,culet_condition,culet_size,treatment,laser_inscription,star_length,lab,report_number,report_date,lab_location,report_comment,symbols,fancy_color_intensity,fancy_color_overtone,fancy_color_dominant_color,fancy_color_secondary_color,sarine_loupe,seller_spec,shade,milky,eye_clean,open_inclusions,black_inclusions,white_inclusions,brands,report_file,diamond_img,video_link,status,created_at,updated_at FROM diamonds ${where}`;
    conn.query(sql, (error, resdata) => {
      if (error) {
        res.json({ status: 501, success: false, message: error });
      } else {
        let tmpRes = resdata;
        let resNew = [];
        tmpRes.forEach(function (item) {
          item.availability =
            item.availability != null ? item.availability : "";
          item.country = item.country != null ? item.country : "";
          item.state = item.state != null ? item.state : "";
          item.city = item.city != null ? item.city : "";
          item.size = item.size != null ? item.size : "";
          item.color = item.color != null ? item.color : "";
          item.clarity = item.clarity != null ? item.clarity : "";
          item.cut = item.cut != null ? item.cut : "";
          item.polish = item.polish != null ? item.polish : "";
          item.symmetry = item.symmetry != null ? item.symmetry : "";
          item.fluor_intensity =
            item.fluor_intensity != null ? item.fluor_intensity : "";
          item.fluor_color = item.fluor_color != null ? item.fluor_color : "";
          item.meas_length = item.meas_length != null ? item.meas_length : "";
          item.meas_width = item.meas_width != null ? item.meas_width : "";
          item.meas_depth = item.meas_depth != null ? item.meas_depth : "";
          item.depth_percent =
            item.depth_percent != null ? item.depth_percent : "";
          item.table_percent =
            item.table_percent != null ? item.table_percent : "";
          item.crown_angle = item.crown_angle != null ? item.crown_angle : "";
          item.crown_height =
            item.crown_height != null ? item.crown_height : "";
          item.pavillion_angle =
            item.pavillion_angle != null ? item.pavillion_angle : "";
          item.pavillion_depth =
            item.pavillion_depth != null ? item.pavillion_depth : "";
          item.girdle_condition =
            item.girdle_condition != null ? item.girdle_condition : "";
          item.girdle_min = item.girdle_min != null ? item.girdle_min : "";
          item.girdle_max = item.girdle_max != null ? item.girdle_max : "";
          item.girdle_per = item.girdle_per != null ? item.girdle_per : "";
          item.culet_condition =
            item.culet_condition != null ? item.culet_condition : "";
          item.culet_size = item.culet_size != null ? item.culet_size : "";
          item.treatment = item.treatment != null ? item.treatment : "";
          item.laser_inscription =
            item.laser_inscription != null ? item.laser_inscription : "";
          item.star_length = item.star_length != null ? item.star_length : "";
          item.lab = item.lab != null ? item.lab : "";
          item.report_number =
            item.report_number != null && item.report_number != 0
              ? item.report_number
              : "";
          item.report_date =
            item.report_date != "0000-00-00" && item.report_date != null
              ? moment(item.report_date).format("DD/MM/YYYY")
              : "";
          item.lab_location =
            item.lab_location != null ? item.lab_location : "";
          item.report_comment =
            item.report_comment != null ? item.report_comment : "";
          item.symbols = item.symbols != null ? item.symbols : "";
          item.fancy_color_intensity =
            item.fancy_color_intensity != null
              ? item.fancy_color_intensity
              : "";
          item.fancy_color_overtone =
            item.fancy_color_overtone != null ? item.fancy_color_overtone : "";
          item.fancy_color_dominant_color =
            item.fancy_color_dominant_color != null
              ? item.fancy_color_dominant_color
              : "";
          item.fancy_color_secondary_color =
            item.fancy_color_secondary_color != null
              ? item.fancy_color_secondary_color
              : "";
          item.sarine_loupe =
            item.sarine_loupe != null ? item.sarine_loupe : "";
          item.seller_spec = item.seller_spec != null ? item.seller_spec : "";
          item.shade = item.shade != null ? item.shade : "";
          item.milky = item.milky != null ? item.milky : "";
          item.eye_clean = item.eye_clean != null ? item.eye_clean : "";
          item.open_inclusions =
            item.open_inclusions != null ? item.open_inclusions : "";
          item.black_inclusions =
            item.black_inclusions != null ? item.black_inclusions : "";
          item.white_inclusions =
            item.white_inclusions != null ? item.white_inclusions : "";
          item.brands = item.brands != null ? item.brands : "";
          item.video_link = item.video_link != null ? item.video_link : "";
          item.status = item.status == 1 ? "Active" : "Deactivated";
          item.created_at = moment(item.created_at).format("DD/MM/YYYY");
          item.updated_at = moment(item.updated_at).format("DD/MM/YYYY");
          var pattern = /^((http|https|ftp):\/\/)/;
          if (pattern.test(item.report_file)) {
            item.report_file = item.report_file != null ? item.report_file : "";
          } else {
            item.report_file =
              item.report_file != null
                ? BACKEND_URL + "" + item.report_file
                : "";
          }
          if (pattern.test(item.diamond_img)) {
            item.diamond_img = item.diamond_img != null ? item.diamond_img : "";
          } else {
            item.diamond_img =
              item.diamond_img != null
                ? BACKEND_URL + "" + item.diamond_img
                : "";
          }
          resNew.push(item);
        });
        res.json({
          status: 200,
          success: true,
          message: "Export Diamonds Successfully",
          data: resNew,
        });
      }
    });
  }
});

router.post(
  "/AddToWatchList",
  [passport.authenticate("userLogin", { session: false })],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      let { watchListId, userId, diamondList } = req.body;
      let data = {
        userId: userId,
        diamondList: diamondList.toString(),
      };
      let sql = "SELECT * FROM `watchlist` WHERE `userId` = ?";
      conn.query(sql, [userId], (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.length > 0) {
            let sql1 =
              "UPDATE `watchlist` SET ?, updated_at = current_timestamp WHERE `userId` = ?";
            conn.query(sql1, [data, userId], (err, results1) => {
              if (err) {
                res.json({ status: 501, success: false, message: err });
              } else {
                if (results1.affectedRows === 1) {
                  res.json({
                    status: 200,
                    success: true,
                    message: "Diamond added in watchlist successfully",
                    wishlistId: results[0].wishlistId,
                  });
                } else {
                  res.json({
                    status: 400,
                    success: false,
                    message: "No data Found",
                  });
                }
              }
            });
          } else {
            let sql2 = "INSERT INTO `watchlist` SET ?";
            conn.query(sql2, data, (err, results2) => {
              if (err) {
                res.json({ status: 501, success: false, message: err });
              } else {
                if (results2.affectedRows === 1) {
                  var wishlistId = results2.insertId;
                  res.json({
                    status: 200,
                    success: true,
                    message: "Diamond added in watchlist successfully",
                    wishlistId: wishlistId,
                  });
                } else {
                  res.json({
                    status: 400,
                    success: false,
                    message: "No data Found",
                  });
                }
              }
            });
          }
        }
      });
    }
  }
);

router.post(
  "/importDiamonds",
  [check("importData").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      const {
        importData,
        selectoption,
        checkreportbymail,
        sendreportbymail,
        userId,
      } = req.body;
      var json_data = JSON.parse(importData);
      var InsertArray = [];
      var UpdateArray = [];
      let updatesql = "";
      var TotalRow = json_data.length;
      var i = 1;
      json_data.forEach(function (e, i) {
        Object.keys(e).forEach(function (key) {
          var val = e[key],
            newKey = key.replace(/\s+/g, "_");
          delete json_data[i][key];
          json_data[i][newKey] = val;
        });
      });
      if (json_data.length > 0) {
        json_data.forEach(function (item) {
          let stock_number = item.Stock_Number;
          let asking_price = item.Asking_Price;
          let asking_price_unit = item.Asking_Price_Unit;
          let cash_price = item.Case_Price;
          let cash_price_unit = item.Case_Price_Unit;
          let availability = item.Availability;
          let country = item.Country;
          let state = item.State;
          let city = item.City;
          let shape = item.Shape;
          let size = item.Size;
          let color = item.Color;
          let clarity = item.Clarity;
          let cut = item.Cut;
          let polish = item.Polish;
          let symmetry = item.Symmetry;
          let fluor_intensity = item.Fluorescence_Intensity;
          let fluor_color = item.Fluorescence_Color;
          let meas_length = item.Measurements_Length;
          let meas_width = item.Measurements_Width;
          let meas_depth = item.Measurements_Depth;
          let depth_percent = item.Depth_Percentage;
          let table_percent = item.Table_Percentage;
          let crown_angle = item.Crown_Angle;
          let crown_height = item.Crown_Height;
          let pavillion_angle = item.Pavilion_Angle;
          let pavillion_depth = item.Pavilion_Depth;
          let girdle_condition = item.Girdle_Depth;
          let girdle_min = item.Girdle_Min;
          let girdle_max = item.Girdle_Max;
          let girdle_per = item.Girdle_Percentage;
          let culet_condition = item.Culet_Condition;
          let culet_size = item.Culet_Size;
          let treatment = item.Treatment;
          let laser_inscription = item.Laser_Inscription_Angle;
          let star_length = item.Star_Length;
          let lab = item.Lab;
          let report_number = item.Report_Number;
          let report_date = item.Report_Date;
          let lab_location = item.Lab_Location;
          let report_comment = item.Report_Comment;
          let symbols = item.Key_to_Symbols;
          let fancy_color_intensity = item.Fancy_Color_Intensity;
          let fancy_color_overtone = item.Fancy_Color_Overtones;
          let fancy_color_dominant_color = item.Fancy_Dominant_Color;
          let fancy_color_secondary_color = item.Fancy_Secondary_Color;
          let sarine_loupe = item.Sarine_Loupe;
          let seller_spec = item.Seller_Spec;
          let shade = item.Shade;
          let milky = item.Milky;
          let eye_clean = item.Eye_Clean;
          let open_inclusions = item.Open_Inclusions;
          let black_inclusions = item.Black_Inclusions;
          let white_inclusions = item.White_Inclusions;
          let report_file = item.Report_File;
          let diamond_img = item.Diamond_Image;

          let data = {
            userId: userId,
            stock_number: stock_number,
            asking_price: asking_price != undefined ? asking_price : null,
            asking_price_unit:
              asking_price_unit != undefined ? asking_price_unit : null,
            cash_price: cash_price != undefined ? cash_price : null,
            cash_price_unit:
              cash_price_unit != undefined ? cash_price_unit : null,
            availability: availability != undefined ? availability : null,
            country: country != undefined ? country : null,
            state: state != undefined ? state : null,
            city: city != undefined ? city : null,
            shape: shape != undefined ? shape : null,
            size: size != undefined ? size : null,
            color: color != undefined ? color : null,
            clarity: clarity != undefined ? clarity : null,
            cut: cut != undefined ? cut : null,
            polish: polish != undefined ? polish : null,
            symmetry: symmetry != undefined ? symmetry : null,
            fluor_intensity:
              fluor_intensity != undefined ? fluor_intensity : null,
            fluor_color: fluor_color != undefined ? fluor_color : null,
            meas_length: meas_length != undefined ? meas_length : null,
            meas_width: meas_width != undefined ? meas_width : null,
            meas_depth: meas_depth != undefined ? meas_depth : null,
            depth_percent: depth_percent != undefined ? depth_percent : null,
            table_percent: table_percent != undefined ? table_percent : null,
            crown_angle: crown_angle != undefined ? crown_angle : null,
            crown_height: crown_height != undefined ? crown_height : null,
            pavillion_angle:
              pavillion_angle != undefined ? pavillion_angle : null,
            pavillion_depth:
              pavillion_depth != undefined ? pavillion_depth : null,
            girdle_condition:
              girdle_condition != undefined ? girdle_condition : null,
            girdle_min: girdle_min != undefined ? girdle_min : null,
            girdle_max: girdle_max != undefined ? girdle_max : null,
            girdle_per: girdle_per != undefined ? girdle_per : null,
            culet_condition:
              culet_condition != undefined ? culet_condition : null,
            culet_size: culet_size != undefined ? culet_size : null,
            treatment: treatment != undefined ? treatment : null,
            laser_inscription:
              laser_inscription != undefined ? laser_inscription : null,
            star_length: star_length != undefined ? star_length : null,
            lab: lab != undefined ? lab : null,
            report_number: report_number != undefined ? report_number : null,
            lab_location: lab_location != undefined ? lab_location : null,
            report_comment: report_comment != undefined ? report_comment : null,
            symbols: symbols != undefined ? symbols : null,
            fancy_color_intensity:
              fancy_color_intensity != undefined ? fancy_color_intensity : null,
            fancy_color_overtone:
              fancy_color_overtone != undefined ? fancy_color_overtone : null,
            fancy_color_dominant_color:
              fancy_color_dominant_color != undefined
                ? fancy_color_dominant_color
                : null,
            fancy_color_secondary_color:
              fancy_color_secondary_color != undefined
                ? fancy_color_secondary_color
                : null,
            sarine_loupe: sarine_loupe != undefined ? sarine_loupe : null,
            seller_spec: seller_spec != undefined ? seller_spec : null,
            shade: shade != undefined ? shade : null,
            milky: milky != undefined ? milky : null,
            eye_clean: eye_clean != undefined ? eye_clean : null,
            open_inclusions:
              open_inclusions != undefined ? open_inclusions : null,
            black_inclusions:
              black_inclusions != undefined ? black_inclusions : null,
            white_inclusions:
              white_inclusions != undefined ? white_inclusions : null,
            report_file: report_file != undefined ? report_file : null,
            diamond_img: diamond_img != undefined ? diamond_img : null,
          };
          if (report_date != "" && report_date != undefined) {
            report_date = moment(report_date, "DD/MM/YYYY");
            data.report_date = moment(report_date).format("YYYY-MM-DD");
          } else {
            data.report_date = null;
          }
          if (selectoption == "replace-all") {
            InsertArray.push(data);
            if (i === TotalRow) {
              display();
            }
            i++;
          } else {
            if (stock_number != undefined) {
              let sql = "SELECT * FROM diamonds WHERE stock_number = ?";
              conn.query(sql, [stock_number], (err, results) => {
                if (err) {
                  res.json({ status: 501, success: false, message: err });
                } else {
                  if (results.length > 0) {
                    updatesql += `UPDATE diamonds SET ? WHERE stock_number = ${stock_number};`;
                    UpdateArray.push(data);
                    if (i === TotalRow) {
                      display();
                    }
                    i++;
                  } else {
                    InsertArray.push(data);
                    if (i === TotalRow) {
                      display();
                    }
                    i++;
                  }
                }
              });
            } else {
              InsertArray.push(data);
              if (i === TotalRow) {
                display();
              }
              i++;
            }
          }
        });
      } else {
        res.json({ status: 400, success: false, message: "No data Found" });
      }
      function display() {
        var response = 0;
        if (InsertArray.length == 0 || UpdateArray.length == 0) {
          response = 1;
        }
        if (InsertArray.length == 0 && UpdateArray.length == 0) {
          res.json({
            status: 400,
            success: false,
            message: "Please proper field out",
          });
        } else {
          if (InsertArray.length > 0) {
            var newArr = [];
            InsertArray.forEach(function (item) {
              newArr.push(Object.values(item));
            });
            let sql1 =
              "INSERT INTO diamonds (" +
              Object.keys(InsertArray[0]) +
              ") VALUES ?";
            conn.query(sql1, [newArr], async (err, results1) => {
              response += 1;
              if (response == 2) {
                if (err) {
                  res.json({ status: 501, success: false, message: err });
                } else {
                  res.json({
                    status: 200,
                    success: true,
                    message: "Diamonds Uploads File Successfully",
                  });
                }
              }
            });
          }
          if (UpdateArray.length > 0) {
            conn.query(updatesql, UpdateArray, async (err, results2) => {
              response += 1;
              if (response == 2) {
                if (err) {
                  res.json({ status: 501, success: false, message: err });
                } else {
                  res.json({
                    status: 200,
                    success: true,
                    message: "Diamonds Uploads File Successfully",
                  });
                }
              }
            });
          }
        }
      }
    }
  }
);

router.post("/featured_stone", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({ status: 422, message: errors.array() });
  } else {
    let sql = "SELECT * FROM diamonds WHERE featured_stone = ?";
    conn.query(sql, [1], (err, results) => {
      if (err) {
        res.json({ status: 501, success: false, message: err });
      } else {
        if (results.length > 0) {
          res.json({
            status: 200,
            success: true,
            message: "Get Data Successfully",
            data: results,
          });
        } else {
          res.json({ status: 400, success: false, message: "No data Found" });
        }
      }
    });
  }
});

router.post("/portfolio", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({ status: 422, message: errors.array() });
  } else {
    let sql = `SELECT clarity,(count(diamond_id)/(SELECT count(diamond_id) FROM diamonds)*100) AS percentage,count(diamond_id) AS each_product,(SELECT count(diamond_id) FROM diamonds) as total_product FROM diamonds GROUP BY clarity`;
    conn.query(sql, (err, results) => {
      if (err) {
        res.json({ status: 501, success: false, message: err });
      } else {
        if (results.length > 0) {
          let tempRes = results;
          let resNew = [];
          let resNew1 = [];
          let resNew2 = [];
          var datapoints = [];
          tempRes.forEach(function (item) {
            resNew.push(item["clarity"]);
            item["percentage"] = item["percentage"].toFixed(2);
            resNew1.push(item["percentage"]);
            resNew2.push(item);
          });

          var ordered_clarity = [
            "FL",
            "IF",
            "VVS1",
            "VVS2",
            "VS1",
            "VS2",
            "SI1",
            "SI2",
            "SI3",
            "I1",
            "I2",
            "I3",
          ];
          for (var i in ordered_clarity) {
            var datapoint = {};
            if (resNew2.includes(ordered_clarity[i])) {
              datapoint.clarity = ordered_clarity[i];
              datapoint.percentage = this.resNew1[
                this.resNew.indexOf(ordered_clarity[i])
              ];
              datapoints.push(datapoint);
            }
          }
          res.json({
            status: 200,
            success: true,
            message: "Get Data Successfully",
            data: resNew,
            data1: resNew1,
            alldata: resNew2,
          });
        } else {
          res.json({ status: 400, success: false, message: "No data Found" });
        }
      }
    });
  }
});

router.post("/financial_data", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({ status: 422, message: errors.array() });
  } else {
    try {
      var YahooResponse = [];
      var YahooResponseMetal = [];
      var hkd_url = "https://query1.finance.yahoo.com/v8/finance/chart/HKD=X";
      request(hkd_url, function (error, response, body) {
        if (!error && response.statusCode == 200) {
          var responseYahoo = JSON.parse(body);
          var HKDYahoo = responseYahoo.chart.result[0].indicators.quote[0].high;
          HKDYahoo = HKDYahoo.reverse();
          var HKDYahooResponse = [];
          HKDYahoo.forEach(function (item) {
            if (
              item != null &&
              HKDYahooResponse.length < 2 &&
              !HKDYahooResponse.includes(item)
            ) {
              HKDYahooResponse.push(item);
            }
          });
          var HKD_last_second = HKDYahooResponse[1];
          var HKD_last = HKDYahooResponse[0];
          var HKD_change = HKD_last - HKD_last_second;
          var HKD_changePercent =
            ((HKD_last - HKD_last_second) / HKD_last_second) * 100;
          var HKD_obj = {
            productTitle: "HKD",
            old_price: HKD_last_second.toFixed(5),
            price: HKD_last.toFixed(5),
            change: HKD_change.toFixed(5),
            changePercent: HKD_changePercent.toFixed(5),
          };
          YahooResponse.push(HKD_obj);
          var cad_url =
            "https://query1.finance.yahoo.com/v8/finance/chart/CAD=X";
          request(cad_url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
              var CADresponseYahoo = JSON.parse(body);
              var CADYahoo =
                CADresponseYahoo.chart.result[0].indicators.quote[0].high;
              CADYahoo = CADYahoo.reverse();
              var CADYahooResponse = [];
              CADYahoo.forEach(function (item) {
                if (
                  item != null &&
                  CADYahooResponse.length < 2 &&
                  !CADYahooResponse.includes(item)
                ) {
                  CADYahooResponse.push(item);
                }
              });
              var CAD_last_second = CADYahooResponse[1];
              var CAD_last = CADYahooResponse[0];
              var CAD_change = CAD_last - CAD_last_second;
              var CAD_changePercent =
                ((CAD_last - CAD_last_second) / CAD_last_second) * 100;
              var CAD_obj = {
                productTitle: "CAD",
                old_price: CAD_last_second.toFixed(5),
                price: CAD_last.toFixed(5),
                change: CAD_change.toFixed(5),
                changePercent: CAD_changePercent.toFixed(5),
              };
              YahooResponse.push(CAD_obj);
              var euro_url =
                "https://query1.finance.yahoo.com/v8/finance/chart/EUR=X";
              request(euro_url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                  var EUROresponseYahoo = JSON.parse(body);
                  var EUROYahoo =
                    EUROresponseYahoo.chart.result[0].indicators.quote[0].high;
                  EUROYahoo = EUROYahoo.reverse();
                  var EUROYahooResponse = [];
                  EUROYahoo.forEach(function (item) {
                    if (
                      item != null &&
                      EUROYahooResponse.length < 2 &&
                      !EUROYahooResponse.includes(item)
                    ) {
                      EUROYahooResponse.push(item);
                    }
                  });
                  var EURO_last_second = EUROYahooResponse[1];
                  var EURO_last = EUROYahooResponse[0];
                  var EURO_change = EURO_last - EURO_last_second;
                  var EURO_changePercent =
                    ((EURO_last - EURO_last_second) / EURO_last_second) * 100;
                  var EURO_obj = {
                    productTitle: "EURO",
                    old_price: EURO_last_second.toFixed(5),
                    price: EURO_last.toFixed(5),
                    change: EURO_change.toFixed(5),
                    changePercent: EURO_changePercent.toFixed(5),
                  };
                  YahooResponse.push(EURO_obj);
                  var gbp_url =
                    "https://query1.finance.yahoo.com/v8/finance/chart/GBP=X";
                  request(gbp_url, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                      var GBPresponseYahoo = JSON.parse(body);
                      var GBPYahoo =
                        GBPresponseYahoo.chart.result[0].indicators.quote[0]
                          .high;
                      GBPYahoo = GBPYahoo.reverse();
                      var GBPYahooResponse = [];
                      GBPYahoo.forEach(function (item) {
                        if (
                          item != null &&
                          GBPYahooResponse.length < 2 &&
                          !GBPYahooResponse.includes(item)
                        ) {
                          GBPYahooResponse.push(item);
                        }
                      });
                      var GBP_last_second = GBPYahooResponse[1];
                      var GBP_last = GBPYahooResponse[0];
                      var GBP_change = GBP_last - GBP_last_second;
                      var GBP_changePercent =
                        ((GBP_last - GBP_last_second) / GBP_last_second) * 100;
                      var GBP_obj = {
                        productTitle: "GBP",
                        old_price: GBP_last_second.toFixed(5),
                        price: GBP_last.toFixed(5),
                        change: GBP_change.toFixed(5),
                        changePercent: GBP_changePercent.toFixed(5),
                      };
                      YahooResponse.push(GBP_obj);
                      var usd_url =
                        "https://query1.finance.yahoo.com/v8/finance/chart/INR=X";
                      request(usd_url, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                          var USDresponseYahoo = JSON.parse(body);
                          var USDYahoo =
                            USDresponseYahoo.chart.result[0].indicators.quote[0]
                              .high;
                          USDYahoo = USDYahoo.reverse();
                          var USDYahooResponse = [];
                          USDYahoo.forEach(function (item) {
                            if (
                              item != null &&
                              USDYahooResponse.length < 2 &&
                              !USDYahooResponse.includes(item)
                            ) {
                              USDYahooResponse.push(item);
                            }
                          });
                          var USD_last_second = USDYahooResponse[1];
                          var USD_last = USDYahooResponse[0];
                          var USD_change = USD_last - USD_last_second;
                          var USD_changePercent =
                            ((USD_last - USD_last_second) / USD_last_second) *
                            100;
                          var USD_obj = {
                            productTitle: "INR",
                            old_price: USD_last_second.toFixed(5),
                            price: USD_last.toFixed(5),
                            change: USD_change.toFixed(5),
                            changePercent: USD_changePercent.toFixed(5),
                          };
                          YahooResponse.push(USD_obj);
                          var CNY_url =
                            "https://query1.finance.yahoo.com/v8/finance/chart/CNY=X";
                          request(CNY_url, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                              var CNYYahooResponse = [];
                              var CNYresponseYahoo = JSON.parse(body);
                              var CNYYahoo =
                                CNYresponseYahoo.chart.result[0].indicators
                                  .quote[0].high;
                              CNYYahoo = CNYYahoo.reverse();
                              CNYYahoo.forEach(function (item, index) {
                                if (
                                  item != null &&
                                  CNYYahooResponse.length < 2
                                ) {
                                  if (
                                    !CNYYahooResponse.includes(item) &&
                                    CNYYahoo.length != index
                                  ) {
                                    CNYYahooResponse.push(item);
                                  } else {
                                    CNYYahooResponse.push(item);
                                  }
                                }
                              });
                              var CNY_last = CNYYahooResponse[0];
                              var CNY_last_second = CNYYahooResponse[1];
                              var CNY_change = CNY_last - CNY_last_second;
                              var CNY_changePercent =
                                ((CNY_last - CNY_last_second) /
                                  CNY_last_second) *
                                100;

                              var CNY_obj = {
                                productTitle: "CNY",
                                old_price: CNY_last_second.toFixed(5),
                                price: CNY_last.toFixed(5),
                                change: CNY_change.toFixed(5),
                                changePercent: CNY_changePercent.toFixed(5),
                              };
                              YahooResponse.push(CNY_obj);
                              var gc_url =
                                "https://query1.finance.yahoo.com/v8/finance/chart/GC=F";
                              request(gc_url, function (error, response, body) {
                                if (!error && response.statusCode == 200) {
                                  var GCresponseYahoo = JSON.parse(body);
                                  var GCYahoo =
                                    GCresponseYahoo.chart.result[0].indicators
                                      .quote[0].high;
                                  GCYahoo = GCYahoo.reverse();
                                  var GCYahooResponse = [];
                                  GCYahoo.forEach(function (item) {
                                    if (
                                      item != null &&
                                      GCYahooResponse.length < 2 &&
                                      !GCYahooResponse.includes(item)
                                    ) {
                                      GCYahooResponse.push(item);
                                    }
                                  });
                                  var GC_last_second = GCYahooResponse[1];
                                  var GC_last = GCYahooResponse[0];
                                  var GC_change = GC_last - GC_last_second;
                                  var GC_changePercent =
                                    ((GC_last - GC_last_second) /
                                      GC_last_second) *
                                    100;
                                  var GC_obj = {
                                    productTitle: "Gold",
                                    old_price: GC_last_second.toFixed(5),
                                    price: GC_last.toFixed(5),
                                    change: GC_change.toFixed(5),
                                    changePercent: GC_changePercent.toFixed(5),
                                  };
                                  YahooResponseMetal.push(GC_obj);
                                  var pl_url =
                                    "https://query1.finance.yahoo.com/v8/finance/chart/PL=F";
                                  request(
                                    pl_url,
                                    function (error, response, body) {
                                      if (
                                        !error &&
                                        response.statusCode == 200
                                      ) {
                                        var PLresponseYahoo = JSON.parse(body);
                                        var PLYahoo =
                                          PLresponseYahoo.chart.result[0]
                                            .indicators.quote[0].high;
                                        PLYahoo = PLYahoo.reverse();
                                        var PLYahooResponse = [];
                                        PLYahoo.forEach(function (item) {
                                          if (
                                            item != null &&
                                            PLYahooResponse.length < 2 &&
                                            !PLYahooResponse.includes(item)
                                          ) {
                                            PLYahooResponse.push(item);
                                          }
                                        });
                                        var PL_last_second = PLYahooResponse[1];
                                        var PL_last = PLYahooResponse[0];
                                        var PL_change =
                                          PL_last - PL_last_second;
                                        var PL_changePercent =
                                          ((PL_last - PL_last_second) /
                                            PL_last_second) *
                                          100;
                                        var PL_obj = {
                                          productTitle: "Platinum",
                                          old_price: PL_last_second.toFixed(5),
                                          price: PL_last.toFixed(5),
                                          change: PL_change.toFixed(5),
                                          changePercent: PL_changePercent.toFixed(
                                            5
                                          ),
                                        };
                                        YahooResponseMetal.push(PL_obj);
                                        var sl_url =
                                          "https://query1.finance.yahoo.com/v8/finance/chart/SI=F";
                                        request(
                                          sl_url,
                                          function (error, response, body) {
                                            if (
                                              !error &&
                                              response.statusCode == 200
                                            ) {
                                              var SLresponseYahoo = JSON.parse(
                                                body
                                              );
                                              var SLYahoo =
                                                SLresponseYahoo.chart.result[0]
                                                  .indicators.quote[0].high;
                                              SLYahoo = SLYahoo.reverse();
                                              var SLYahooResponse = [];
                                              SLYahoo.forEach(function (item) {
                                                if (
                                                  item != null &&
                                                  SLYahooResponse.length < 2 &&
                                                  !SLYahooResponse.includes(
                                                    item
                                                  )
                                                ) {
                                                  SLYahooResponse.push(item);
                                                }
                                              });
                                              var SL_last_second =
                                                SLYahooResponse[1];
                                              var SL_last = SLYahooResponse[0];
                                              var SL_change =
                                                SL_last - SL_last_second;
                                              var SL_changePercent =
                                                ((SL_last - SL_last_second) /
                                                  SL_last_second) *
                                                100;
                                              var SL_obj = {
                                                productTitle: "Silver",
                                                old_price: SL_last_second.toFixed(
                                                  5
                                                ),
                                                price: SL_last.toFixed(5),
                                                change: SL_change.toFixed(5),
                                                changePercent: SL_changePercent.toFixed(
                                                  5
                                                ),
                                              };
                                              YahooResponseMetal.push(SL_obj);
                                              res.json({
                                                status: 200,
                                                success: true,
                                                message:
                                                  "Get Data Successfully",
                                                Yahoo: YahooResponse,
                                                Metal: YahooResponseMetal,
                                              });
                                            }
                                          }
                                        );
                                      }
                                    }
                                  );
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              });
            }
          });
        }
      });
    } catch {
      //pass
    }
  }
});

router.post(
  "/GetDiamonds",
  [check("diamond_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 401, success: false, message: errors.array() });
    } else {
      var diamond_id = req.body.diamond_id;
      let sql = "SELECT * FROM diamonds WHERE diamond_id = ?";
      conn.query(sql, [diamond_id], (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.length > 0) {
            res.json({
              status: 200,
              success: true,
              message: "Get Data Successfully",
              data: results[0],
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/removeDiamond",
  [check("diamond_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      var diamond_id = req.body.diamond_id;
      let sql = "DELETE FROM diamonds WHERE diamond_id = ?";
      conn.query(sql, [diamond_id], function (err, results) {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          res.json({
            status: 200,
            success: true,
            message: "Diamonds Removed Successfully",
          });
        }
      });
    }
  }
);

router.post(
  "/removeOrder",
  [check("order_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      var order_id = req.body.order_id;
      let sql = "DELETE FROM `orders` WHERE order_id = ?";
      conn.query(sql, [order_id], function (err, results) {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          res.json({
            status: 200,
            success: true,
            message: "Order Removed Successfully",
          });
        }
      });
    }
  }
);

router.post(
  "/removeWatchList",
  [check("userId").exists(), check("diamond_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      var { diamond_id, userId } = req.body;
      var sql = `SELECT * FROM watchlist where userId = ${userId};`;
      conn.query(sql, function (err, results) {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          var diamondlist_str =
            "," + results[0]["diamondList"].toString().replace(", ", ",") + ",";
          var rplcd_list = diamondlist_str.replace("," + diamond_id + ",", ",");
          var rplcd_str = rplcd_list.replace(/(^,)|(,$)/g, "").toString();

          var sql1 = `UPDATE watchlist SET diamondList = '${rplcd_str}', updated_at = current_timestamp WHERE userId = ${userId};`;
          conn.query(sql1, function (err, results1) {
            if (err) {
              res.json({ status: 501, success: false, message: err });
            } else {
              res.json({
                status: 200,
                success: true,
                message: "Diamond Deleted Successfully.",
              });
            }
          });
        }
      });

      /*let sql = "DELETE FROM `orders` WHERE order_id = ?";
    conn.query(sql, [order_id], function (err, results) {
      if (err) {
        res.json({status: 400, success: false, message: err});
      } else {
        res.json({status: 200, success: true, message: "Order Removed Successfully"});
      }
    });*/
    }
  }
);

router.post(
  "/removeRequests",
  [check("buy_requests_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      var buy_requests_id = req.body.buy_requests_id;
      let sql = "DELETE FROM buy_requests WHERE buy_requests_id = ?";
      conn.query(sql, [buy_requests_id], function (err, results) {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          res.json({
            status: 200,
            success: true,
            message: "Requests Removed Successfully",
          });
        }
      });
    }
  }
);

router.post(
  "/removeSavedSearch",
  [check("search_saved_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      var search_saved_id = req.body.search_saved_id;
      let sql = "DELETE FROM diamonds_search_saved WHERE search_saved_id = ?";
      conn.query(sql, [search_saved_id], function (err, results) {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          res.json({
            status: 200,
            success: true,
            message: "Saved Searches Removed Successfully",
          });
        }
      });
    }
  }
);

router.post(
  "/ChangeStatus",
  [check("diamond_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      let status = 1;
      let diamond_id = req.body.diamond_id;
      let sql = "SELECT * FROM diamonds WHERE diamond_id = ?";
      conn.query(sql, [diamond_id], (err, results) => {
        if (err) {
          res.json({ status: 400, success: false, message: err });
        } else {
          if (results.length > 0) {
            let responseActive = results[0].status;
            if (responseActive === 1) {
              status = 0;
            }
            let sql1 = "UPDATE diamonds SET status = ? WHERE diamond_id = ?";
            conn.query(sql1, [status, diamond_id], (err, results1) => {
              if (err) {
                res.json({ status: 400, success: false, message: err });
              } else {
                if (results1.affectedRows === 1) {
                  if (status === 1) {
                    res.json({
                      status: 200,
                      success: true,
                      message: "Diamonds is Activated",
                      response: 1,
                    });
                  } else {
                    res.json({
                      status: 200,
                      success: true,
                      message: "Diamonds is Deactivated",
                      response: 0,
                    });
                  }
                } else {
                  res.json({
                    status: 400,
                    success: false,
                    message: "No data Found",
                  });
                }
              }
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/FeaturedStoneChangeStatus",
  [check("diamond_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      let featured_stone = 1;
      let diamond_id = req.body.diamond_id;
      let sql = "SELECT * FROM diamonds WHERE diamond_id = ?";
      conn.query(sql, [diamond_id], (err, results) => {
        if (err) {
          res.json({ status: 400, success: false, message: err });
        } else {
          if (results.length > 0) {
            let responseActive = results[0].featured_stone;
            if (responseActive === 1) {
              featured_stone = 0;
            }
            let sql1 =
              "UPDATE diamonds SET featured_stone = ? WHERE diamond_id = ?";
            conn.query(sql1, [featured_stone, diamond_id], (err, results1) => {
              if (err) {
                res.json({ status: 400, success: false, message: err });
              } else {
                if (results1.affectedRows === 1) {
                  if (featured_stone === 1) {
                    res.json({
                      status: 200,
                      success: true,
                      message: "Diamonds added is featured stone",
                      response: 1,
                    });
                  } else {
                    res.json({
                      status: 200,
                      success: true,
                      message: "Diamonds removed is featured stone",
                      response: 0,
                    });
                  }
                } else {
                  res.json({
                    status: 400,
                    success: false,
                    message: "No data Found",
                  });
                }
              }
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post("/GetSearchJewelry", (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err,
    });
    return;
  } else {
    var { search_data, start, length } = req.body;
    start = 0;
    length = 10;
    var objsearch = ``;
    var objsearcharr = [];
    if (search_data["search_text"]) {
      objsearch +=
        objsearcharr.length == 0
          ? `WHERE jewelry_title = ? `
          : ` AND jewelry_title = ? `;
      objsearcharr.push(search_data["search_text"]);
    } else if (search_data["jewelry_type"].length > 0) {
      objsearch +=
        objsearcharr.length == 0
          ? `WHERE jewelry_type IN (?) `
          : ` AND jewelry_type IN (?) `;
      objsearcharr.push(search_data["jewelry_type"]);
    } else if (search_data["jewelry_collection"].length > 0) {
      objsearch +=
        objsearcharr.length == 0
          ? `WHERE jewelry_collection IN (?) `
          : ` AND jewelry_collection IN (?) `;
      objsearcharr.push(search_data["jewelry_collection"]);
    } else if (search_data["jewelry_material"].length > 0) {
      objsearch +=
        objsearcharr.length == 0
          ? `WHERE jewelry_material IN (?) `
          : ` AND jewelry_material IN (?) `;
      objsearcharr.push(search_data["jewelry_material"]);
    } else if (search_data["jewelry_stone_type"].length > 0) {
      objsearch +=
        objsearcharr.length == 0
          ? `WHERE jewelry_stone_type IN (?) `
          : ` AND jewelry_stone_type IN (?) `;
      objsearcharr.push(search_data["jewelry_stone_type"]);
    } else if (search_data["jewelry_style"].length > 0) {
      objsearch +=
        objsearcharr.length == 0
          ? `WHERE jewelry_style IN (?) `
          : ` AND jewelry_style IN (?) `;
      objsearcharr.push(search_data["jewelry_style"]);
    } else if (search_data["jewelry_brand"].length > 0) {
      objsearch +=
        objsearcharr.length == 0
          ? `WHERE jewelry_brand IN (?) `
          : ` AND jewelry_brand IN (?) `;
      objsearcharr.push(search_data["jewelry_brand"]);
    } else if (search_data["jewelry_location"].length > 0) {
      objsearch +=
        objsearcharr.length == 0
          ? `WHERE jewelry_location IN (?) `
          : ` AND jewelry_location IN (?) `;
      objsearcharr.push(search_data["jewelry_location"]);
    } else if (search_data["jewelry_condition"].length > 0) {
      objsearch +=
        objsearcharr.length == 0
          ? `WHERE jewelry_condition IN (?) `
          : ` AND jewelry_condition IN (?) `;
      objsearcharr.push(search_data["jewelry_condition"]);
    } else if (search_data["jewelry_state"].length > 0) {
      objsearch +=
        objsearcharr.length == 0
          ? `WHERE jewelry_state IN (?) `
          : ` AND jewelry_state IN (?) `;
      objsearcharr.push(search_data["jewelry_state"]);
    }
    objsearcharr = objsearcharr.concat(objsearcharr);
    let sql = `SELECT * FROM jewelry ${objsearch}ORDER BY jewelry_id limit ${start},${length};SELECT count(*) as cnt FROM jewelry ${objsearch}`;
    //console.log(sql)
    conn.query(sql, objsearcharr, function (error, resdata) {
      if (error) {
        res.json({ status: 400, success: false, message: err });
      } else {
        res.json({
          status: 200,
          success: true,
          message: "Get Jewelry successfully",
          response: resdata[0],
          TotalRecords: resdata[1][0],
        });
      }
    });
  }
});

router.post(
  "/searchJewelry",
  [
    check("columns").exists(),
    check("start").exists(),
    check("order").exists(),
    check("length").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({
        status: 401,
        success: false,
        message: err,
      });
      return;
    } else {
      var { search_data, search, columns, order, start, length } = req.body;
      var objsearch = ``;
      var objsearcharr = [];
      let sql = `SELECT * FROM jewelry ${objsearch}ORDER BY ${
        columns[order[0].column].data
      } ${
        order[0].dir
      } limit ${start},${length};SELECT count(*) as cnt FROM jewelry ${objsearch}`;
      //console.log(sql)
      conn.query(sql, objsearcharr, function (error, resdata) {
        if (error) {
          res.json({ status: 400, success: false, message: error });
        } else {
          res.json({
            status: 200,
            success: true,
            message: "Get Jewelry successfully",
            response: resdata[0],
            TotalRecords: resdata[1][0],
          });
        }
      });
    }
  }
);

router.post(
  "/uploadJewelry",
  [passport.authenticate("userLogin", { session: false })],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      let {
        jewelry_id,
        jewelry_video_link,
        jewelry_stock_number,
        jewelry_title,
        jewelry_description,
        jewelry_price,
        jewelry_msrp,
        jewelry_memo,
        jewelry_quantity,
        jewelry_minimum_order,
        jewelry_out_of_stock,
        jewelry_type,
        jewelry_condition,
        jewelry_state,
        jewelry_collection,
        jewelry_style,
        jewelry_material,
        jewelry_material_weight,
        jewelry_material_karat,
        jewelry_stone_type,
        jewelry_brand,
        jewelry_design,
        jewelry_location,
        jewelry_currency,
        jewelry_lab,
        jewelry_certificate,
        jewelry_parent_stock_number,
        jewelry_manufacture_date,
        jewelry_total_length,
        jewelry_total_width_mm,
        jewelry_total_width_gr,
        jewelry_tags,
        jewelry_upload_own_stock,
      } = req.body;

      if (jewelry_manufacture_date != "") {
        jewelry_manufacture_date = moment(
          jewelry_manufacture_date.split("/").reverse().join("-")
        ).format("YYYY-MM-DD");
      } else {
        jewelry_manufacture_date = null;
      }

      let data = {
        jewelry_video_link: jewelry_video_link,
        jewelry_stock_number: jewelry_stock_number,
        jewelry_title: jewelry_title,
        jewelry_description: jewelry_description,
        jewelry_price: jewelry_price,
        jewelry_msrp: jewelry_msrp,
        jewelry_memo: jewelry_memo,
        jewelry_quantity: jewelry_quantity,
        jewelry_minimum_order: jewelry_minimum_order,
        jewelry_out_of_stock: jewelry_out_of_stock,
        jewelry_type: jewelry_type,
        jewelry_condition: jewelry_condition,
        jewelry_state: jewelry_state,
        jewelry_collection: jewelry_collection,
        jewelry_style: jewelry_style,
        jewelry_material: jewelry_material,
        jewelry_material_weight: jewelry_material_weight,
        jewelry_material_karat: jewelry_material_karat,
        jewelry_stone_type: jewelry_stone_type,
        jewelry_brand: jewelry_brand,
        jewelry_design: jewelry_design,
        jewelry_location: jewelry_location,
        jewelry_currency: jewelry_currency,
        jewelry_lab: jewelry_lab,
        jewelry_certificate: jewelry_certificate,
        jewelry_parent_stock_number: jewelry_parent_stock_number,
        jewelry_manufacture_date: jewelry_manufacture_date,
        jewelry_total_length: jewelry_total_length,
        jewelry_total_width_mm: jewelry_total_width_mm,
        jewelry_total_width_gr: jewelry_total_width_gr,
        jewelry_tags: jewelry_tags,
        jewelry_upload_own_stock: jewelry_upload_own_stock,
      };

      var arrafile = [];
      if (req.files && Object.keys(req.files).length > 0) {
        if (req.files.jewelry_images.name == undefined) {
          arrafile = req.files.jewelry_images;
        } else {
          arrafile.push(req.files.jewelry_images);
        }
        let jewelry_images = [];
        if (arrafile.length > 0) {
          var j = 1;
          arrafile.forEach(function (item) {
            var getTime = new Date().getTime();
            item.name = item.name.replace(/ /g, "_");
            var fileName = getTime + "-" + item.name;
            let filenameq = item;
            let file_url = "./upload/jewelry/" + fileName;
            filenameq.mv(file_url, function (error) {
              if (error) {
                res.json({ status: 400, success: false, message: error });
              } else {
                let file_name = "upload/jewelry/" + fileName;
                jewelry_images.push(file_name);
                if (j == arrafile.length) {
                  add();
                }
                j++;
              }
            });
          });
        }
        function add() {
          if (jewelry_id) {
            let sql = "SELECT * FROM jewelry WHERE jewelry_id = ?";
            conn.query(sql, [jewelry_id], (err, results) => {
              if (err) {
                res.json({ status: 400, success: false, message: err });
              } else {
                if (results.length > 0) {
                  let get_jewelry_images = results[0].jewelry_images;
                  if (get_jewelry_images != "") {
                    let array_jewelry_images = get_jewelry_images.split(",");
                    if (array_jewelry_images.length > 0) {
                      let new_img = jewelry_images.concat(array_jewelry_images);
                      if (new_img.length > 1) {
                        data.jewelry_images = new_img.toString();
                      } else if (new_img.length == 1) {
                        data.jewelry_images = new_img;
                      }
                    }
                  } else {
                    if (jewelry_images.length > 1) {
                      data.jewelry_images = jewelry_images.toString();
                    } else if (jewelry_images.length == 1) {
                      data.jewelry_images = jewelry_images;
                    }
                  }
                  let sql = "UPDATE jewelry SET ? WHERE jewelry_id = ?";
                  conn.query(sql, [data, jewelry_id], (err, results) => {
                    if (err) {
                      res.json({ status: 400, success: false, message: err });
                    } else {
                      if (results.affectedRows === 1) {
                        res.json({
                          status: 200,
                          success: true,
                          message: "Jewelry Update Successfully",
                          response: results[0],
                        });
                      } else {
                        res.json({
                          status: 400,
                          success: false,
                          message: "No data Found",
                        });
                      }
                    }
                  });
                }
              }
            });
          } else {
            if (jewelry_images.length > 1) {
              data.jewelry_images = jewelry_images.toString();
            } else {
              data.jewelry_images = jewelry_images;
            }
            data.status = 1;
            let sql = "INSERT INTO jewelry SET ?";
            conn.query(sql, data, (err, results) => {
              if (err) {
                res.json({ status: 400, success: false, message: err });
              } else {
                if (results.affectedRows === 1) {
                  res.json({
                    status: 200,
                    success: true,
                    message: "Jewelry Upload Successfully",
                    response: results[0],
                  });
                } else {
                  res.json({
                    status: 400,
                    success: false,
                    message: "No data Found",
                  });
                }
              }
            });
          }
        }
      } else {
        if (jewelry_id) {
          let sql = "UPDATE jewelry SET ? WHERE jewelry_id = ?";
          conn.query(sql, [data, jewelry_id], (err, results) => {
            if (err) {
              res.json({ status: 400, success: false, message: err });
            } else {
              if (results.affectedRows === 1) {
                res.json({
                  status: 200,
                  success: true,
                  message: "Jewelry Update Successfully",
                  response: results[0],
                });
              } else {
                res.json({
                  status: 400,
                  success: false,
                  message: "No data Found",
                });
              }
            }
          });
        } else {
          data.status = 1;
          let sql = "INSERT INTO jewelry SET ?";
          conn.query(sql, data, (err, results) => {
            if (err) {
              res.json({ status: 400, success: false, message: err });
            } else {
              if (results.affectedRows === 1) {
                res.json({
                  status: 200,
                  success: true,
                  message: "Jewelry Upload Successfully",
                  response: results[0],
                });
              } else {
                res.json({
                  status: 400,
                  success: false,
                  message: "No data Found",
                });
              }
            }
          });
        }
      }
    }
  }
);

router.post(
  "/GetJewelry",
  [check("jewelry_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      var jewelry_id = req.body.jewelry_id;
      let sql = "SELECT * FROM jewelry WHERE jewelry_id = ?";
      conn.query(sql, [jewelry_id], (err, results) => {
        if (err) {
          res.json({ status: 400, success: false, message: err });
        } else {
          if (results.length > 0) {
            res.json({
              status: 200,
              success: true,
              message: "Get Data Successfully",
              data: results[0],
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/removeJewelry",
  [check("jewelry_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      var jewelry_id = req.body.jewelry_id;
      let sql = "DELETE FROM jewelry WHERE jewelry_id = ?";
      conn.query(sql, [jewelry_id], function (err, results) {
        if (err) {
          res.json({ status: 400, success: false, message: err });
        } else {
          res.json({
            status: 200,
            success: true,
            message: "Jewelry Removed Successfully",
          });
        }
      });
    }
  }
);

router.post(
  "/ChangeStatusJewelry",
  [check("jewelry_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      let status = 1;
      let jewelry_id = req.body.jewelry_id;
      let sql = "SELECT * FROM jewelry WHERE jewelry_id = ?";
      conn.query(sql, [jewelry_id], (err, results) => {
        if (err) {
          res.json({ status: 400, success: false, message: err });
        } else {
          if (results.length > 0) {
            let responseActive = results[0].status;
            if (responseActive === 1) {
              status = 0;
            }
            let sql1 = "UPDATE jewelry SET status = ? WHERE jewelry_id = ?";
            conn.query(sql1, [status, jewelry_id], (err, results1) => {
              if (err) {
                res.json({ status: 400, success: false, message: err });
              } else {
                if (results1.affectedRows === 1) {
                  if (status === 1) {
                    res.json({
                      status: 200,
                      success: true,
                      message: "Jewelry is Activated",
                      response: 1,
                    });
                  } else {
                    res.json({
                      status: 200,
                      success: true,
                      message: "Jewelry is Deactivated",
                      response: 0,
                    });
                  }
                } else {
                  res.json({
                    status: 400,
                    success: false,
                    message: "No data Found",
                  });
                }
              }
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/jewelryRemoveImage",
  [check("jewelry_id").exists(), check("url").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      let jewelry_id = req.body.jewelry_id;
      let url = req.body.url;
      let sql = "SELECT * FROM jewelry WHERE jewelry_id = ?";
      conn.query(sql, [jewelry_id], (err, results) => {
        if (err) {
          res.json({ status: 400, success: false, message: err });
        } else {
          if (results.length > 0) {
            let jewelry_images = results[0].jewelry_images;
            let array_jewelry_images = jewelry_images.split(",");
            const index = array_jewelry_images.indexOf(url);
            if (index > -1) {
              array_jewelry_images.splice(index, 1);
            }
            let new_jewelry_images = "";
            if (array_jewelry_images.length > 1) {
              new_jewelry_images = array_jewelry_images.toString();
            } else if (array_jewelry_images.length == 0) {
              new_jewelry_images = "";
            } else {
              new_jewelry_images = array_jewelry_images;
            }
            let sql1 =
              "UPDATE jewelry SET jewelry_images = ? WHERE jewelry_id = ?";
            conn.query(
              sql1,
              [new_jewelry_images, jewelry_id],
              (err, results1) => {
                if (err) {
                  res.json({ status: 400, success: false, message: err });
                } else {
                  if (results1.affectedRows === 1) {
                    res.json({
                      status: 200,
                      success: true,
                      message: "Image Removed Successfully",
                    });
                  } else {
                    res.json({
                      status: 400,
                      success: false,
                      message: "Image Remove failed",
                    });
                  }
                }
              }
            );
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/importJewelry",
  [check("importData").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      const { importData, jewelry_upload_own_stock } = req.body;
      var json_data = JSON.parse(importData);
      var InsertArray = [];
      var UpdateArray = [];
      let updatesql = "";
      var TotalRow = json_data.length;
      var i = 1;
      json_data.forEach(function (e, i) {
        Object.keys(e).forEach(function (key) {
          var val = e[key],
            newKey = key.replace(/\s+/g, "_");
          delete json_data[i][key];
          json_data[i][newKey] = val;
        });
      });
      if (json_data.length > 0) {
        json_data.forEach(function (item) {
          let jewelry_stock_number = item.Stock_Number;
          let jewelry_title = item.Title;
          let jewelry_description = item.Description;
          let jewelry_price = item.Price;
          let jewelry_msrp = item.MSRP;
          let jewelry_memo = item.Available_for_Memo;
          let jewelry_quantity = item.Quantity;
          let jewelry_minimum_order = item.Minimum_Order_of_Items;
          let jewelry_out_of_stock = item.Item_Out_of_Stock;
          let jewelry_type = item.Jewelry_Type;
          let jewelry_condition = item.Jewelry_Condition;
          let jewelry_state = item.Jewelry_State;
          let jewelry_collection = item.Jewelry_Collection;
          let jewelry_style = item.Jewelry_Style;
          let jewelry_material = item.Jewerly_Material;
          let jewelry_material_weight = item.Material_Weight;
          let jewelry_material_karat = item.Material_Carat;
          let jewelry_stone_type = item.Stone_Type;
          let jewelry_brand = item.Jewelry_Brand;
          let jewelry_design = item.Jewelry_Design;
          let jewelry_location = item.Jewelry_Location;
          let jewelry_currency = item.Currency;
          let jewelry_lab = item.Jewelry_Lab;
          let jewelry_certificate = item.Jewelry_Cerificate;
          let jewelry_parent_stock_number = item.Jewelry_Parent_Stock_Number;
          let jewelry_manufacture_date = item.Manufacture_Date;
          let jewelry_total_length = item.Jewelry_Total_Length;
          let jewelry_total_width_mm = item.Jewelry_Total_Width;
          let jewelry_total_width_gr = item.Jewelry_Total_Weight;
          let jewelry_tags = item.Tags;
          let jewelry_images = item.Images;
          let jewelry_video_link = item.Video_Link;

          let data = {
            jewelry_images: jewelry_images != undefined ? jewelry_images : null,
            jewelry_video_link:
              jewelry_video_link != undefined ? jewelry_video_link : null,
            jewelry_stock_number:
              jewelry_stock_number != undefined ? jewelry_stock_number : null,
            jewelry_title: jewelry_title != undefined ? jewelry_title : null,
            jewelry_description:
              jewelry_description != undefined ? jewelry_description : null,
            jewelry_price: jewelry_price != undefined ? jewelry_price : null,
            jewelry_msrp: jewelry_msrp != undefined ? jewelry_msrp : null,
            jewelry_memo: jewelry_memo != undefined ? jewelry_memo : null,
            jewelry_quantity:
              jewelry_quantity != undefined ? jewelry_quantity : null,
            jewelry_minimum_order:
              jewelry_minimum_order != undefined ? jewelry_minimum_order : null,
            jewelry_out_of_stock:
              jewelry_out_of_stock != undefined ? jewelry_out_of_stock : null,
            jewelry_type: jewelry_type != undefined ? jewelry_type : null,
            jewelry_condition:
              jewelry_condition != undefined ? jewelry_condition : null,
            jewelry_state: jewelry_state != undefined ? jewelry_state : null,
            jewelry_collection:
              jewelry_collection != undefined ? jewelry_collection : null,
            jewelry_style: jewelry_style != undefined ? jewelry_style : null,
            jewelry_material:
              jewelry_material != undefined ? jewelry_material : null,
            jewelry_material_weight:
              jewelry_material_weight != undefined
                ? jewelry_material_weight
                : null,
            jewelry_material_karat:
              jewelry_material_karat != undefined
                ? jewelry_material_karat
                : null,
            jewelry_stone_type:
              jewelry_stone_type != undefined ? jewelry_stone_type : null,
            jewelry_brand: jewelry_brand != undefined ? jewelry_brand : null,
            jewelry_design: jewelry_design != undefined ? jewelry_design : null,
            jewelry_location:
              jewelry_location != undefined ? jewelry_location : null,
            jewelry_currency:
              jewelry_currency != undefined ? jewelry_currency : null,
            jewelry_lab: jewelry_lab != undefined ? jewelry_lab : null,
            jewelry_certificate:
              jewelry_certificate != undefined ? jewelry_certificate : null,
            jewelry_parent_stock_number:
              jewelry_parent_stock_number != undefined
                ? jewelry_parent_stock_number
                : null,
            jewelry_total_length:
              jewelry_total_length != undefined ? jewelry_total_length : null,
            jewelry_total_width_mm:
              jewelry_total_width_mm != undefined
                ? jewelry_total_width_mm
                : null,
            jewelry_total_width_gr:
              jewelry_total_width_gr != undefined
                ? jewelry_total_width_gr
                : null,
            jewelry_tags: jewelry_tags != undefined ? jewelry_tags : null,
            jewelry_upload_own_stock:
              jewelry_upload_own_stock != "" && jewelry_upload_own_stock != 0
                ? jewelry_upload_own_stock
                : false,
          };
          if (
            jewelry_manufacture_date != "" &&
            jewelry_manufacture_date != undefined
          ) {
            jewelry_manufacture_date = moment(
              jewelry_manufacture_date,
              "DD/MM/YYYY"
            );
            data.jewelry_manufacture_date = moment(
              jewelry_manufacture_date
            ).format("YYYY-MM-DD");
          } else {
            data.jewelry_manufacture_date = null;
          }
          if (jewelry_stock_number != undefined) {
            let sql = "SELECT * FROM jewelry WHERE jewelry_stock_number = ?";
            conn.query(sql, [jewelry_stock_number], (err, results) => {
              if (err) {
                res.json({ status: 400, success: false, message: err });
              } else {
                if (results.length > 0) {
                  updatesql += `UPDATE jewelry SET ? WHERE jewelry_stock_number = ${jewelry_stock_number};`;
                  UpdateArray.push(data);
                  if (i === TotalRow) {
                    display();
                  }
                  i++;
                } else {
                  data.status = 1;
                  InsertArray.push(data);
                  if (i === TotalRow) {
                    display();
                  }
                  i++;
                }
              }
            });
          } else {
            data.status = 1;
            InsertArray.push(data);
            if (i === TotalRow) {
              display();
            }
            i++;
          }
        });
      } else {
        res.json({ status: 400, success: false, message: "No data Found" });
      }
      function display() {
        var response = 0;
        if (InsertArray.length == 0 || UpdateArray.length == 0) {
          response = 1;
        }
        if (InsertArray.length == 0 && UpdateArray.length == 0) {
          res.json({
            status: 400,
            success: false,
            message: "Please proper field out",
          });
        } else {
          if (InsertArray.length > 0) {
            var newArr = [];
            InsertArray.forEach(function (item) {
              newArr.push(Object.values(item));
            });
            let sql1 =
              "INSERT INTO jewelry (" +
              Object.keys(InsertArray[0]) +
              ") VALUES ?";
            conn.query(sql1, [newArr], async (err, results1) => {
              response += 1;
              if (response == 2) {
                if (err) {
                  res.json({ status: 400, success: false, message: err });
                } else {
                  res.json({
                    status: 200,
                    success: true,
                    message: "Jewelry Uploads File Successfully",
                  });
                }
              }
            });
          }
          if (UpdateArray.length > 0) {
            conn.query(updatesql, UpdateArray, async (err, results2) => {
              response += 1;
              if (response == 2) {
                if (err) {
                  res.json({ status: 400, success: false, message: err });
                } else {
                  res.json({
                    status: 200,
                    success: true,
                    message: "Jewelry Uploads File Successfully",
                  });
                }
              }
            });
          }
        }
      }
    }
  }
);

router.post(
  "/UploadBuyRequests",
  [
    passport.authenticate("userLogin", { session: false }),
    check("userId").exists(),
    check("search_data").exists(),
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      const { userId, search_data, buy_requests_id } = req.body;
      let data = {
        userId: userId,
      };
      if (search_data["shape_advanced"].length > 0) {
        data.shape_advanced = search_data["shape_advanced"].toString();
      }
      if (search_data["size_general_from"]) {
        data.size_general_from = search_data["size_general_from"];
      }
      if (search_data["size_general_to"]) {
        data.size_general_to = search_data["size_general_to"];
      }
      if (search_data["color_white_intensity_from"]) {
        data.color_white_intensity_from =
          search_data["color_white_intensity_from"];
      }
      if (search_data["color_white_intensity_to"]) {
        data.color_white_intensity_to = search_data["color_white_intensity_to"];
      }
      if (search_data["color_white_overtone"]) {
        data.color_white_overtone = search_data["color_white_overtone"];
      }
      if (search_data["color_white_color"]) {
        data.color_white_color = search_data["color_white_color"];
      }
      if (search_data["color_fancy"].length > 0) {
        data.color_fancy = search_data["color_fancy"].toString();
      }
      if (search_data["clarity"].length > 0) {
        data.clarity = search_data["clarity"].toString();
      }
      if (search_data["inclusions_eye_clean"]) {
        data.inclusions_eye_clean = search_data["inclusions_eye_clean"];
      }
      if (search_data["inclusions_milky_from"]) {
        data.inclusions_milky_from = search_data["inclusions_milky_from"];
      }
      if (search_data["inclusions_milky_to"]) {
        data.inclusions_milky_to = search_data["inclusions_milky_to"];
      }
      if (search_data["open_inclusions"].length > 0) {
        data.open_inclusions = search_data["open_inclusions"].toString();
      }
      if (search_data["white_inclusions"].length > 0) {
        data.white_inclusions = search_data["white_inclusions"].toString();
      }
      if (search_data["black_inclusions"].length > 0) {
        data.black_inclusions = search_data["black_inclusions"].toString();
      }
      if (search_data["shades"]) {
        data.shades = search_data["shades"];
      }
      if (search_data["finish_general_cut_from"]) {
        data.finish_general_cut_from = search_data["finish_general_cut_from"];
      }
      if (search_data["finish_general_cut_to"]) {
        data.finish_general_cut_to = search_data["finish_general_cut_to"];
      }
      if (search_data["finish_general_polish_from"]) {
        data.finish_general_polish_from =
          search_data["finish_general_polish_from"];
      }
      if (search_data["finish_general_polish_to"]) {
        data.finish_general_polish_to = search_data["finish_general_polish_to"];
      }
      if (search_data["finish_general_symmetry_from"]) {
        data.finish_general_symmetry_from =
          search_data["finish_general_symmetry_from"];
      }
      if (search_data["finish_general_symmetry_to"]) {
        data.finish_general_symmetry_to =
          search_data["finish_general_symmetry_to"];
      }
      if (search_data["finish_specific"].length > 0) {
        data.finish_specific = search_data["finish_specific"].toString();
      }
      if (search_data["fluorescence_intensity"].length > 0) {
        data.fluorescence_intensity = search_data[
          "fluorescence_intensity"
        ].toString();
      }
      if (search_data["grading_report"].length > 0) {
        data.grading_report = search_data["grading_report"].toString();
      }
      if (search_data["location"]) {
        data.location = search_data["location"];
      }
      if (search_data["specification"].length > 0) {
        data.specification = search_data["specification"].toString();
      }
      if (search_data["price_ct_from"]) {
        data.price_ct_from = search_data["price_ct_from"];
      }
      if (search_data["price_ct_to"]) {
        data.price_ct_to = search_data["price_ct_to"];
      }
      if (search_data["price_total_from"]) {
        data.price_total_from = search_data["price_total_from"];
      }
      if (search_data["price_total_to"]) {
        data.price_total_to = search_data["price_total_to"];
      }
      if (search_data["price_rap_from"]) {
        data.price_rap_from = search_data["price_rap_from"];
      }
      if (search_data["price_rap_to"]) {
        data.price_rap_to = search_data["price_rap_to"];
      }
      if (search_data["show_only"].length > 0) {
        data.show_only = search_data["show_only"].toString();
      }
      if (search_data["per_depth_from"]) {
        data.per_depth_from = search_data["per_depth_from"];
      }
      if (search_data["per_depth_to"]) {
        data.per_depth_to = search_data["per_depth_to"];
      }
      if (search_data["per_table_from"]) {
        data.per_table_from = search_data["per_table_from"];
      }
      if (search_data["per_table_to"]) {
        data.per_table_to = search_data["per_table_to"];
      }
      if (search_data["metric_length_from"]) {
        data.metric_length_from = search_data["metric_length_from"];
      }
      if (search_data["metric_length_to"]) {
        data.metric_length_to = search_data["metric_length_to"];
      }
      if (search_data["metric_width_from"]) {
        data.metric_width_from = search_data["metric_width_from"];
      }
      if (search_data["metric_width_to"]) {
        data.metric_width_to = search_data["metric_width_to"];
      }
      if (search_data["metric_depth_from"]) {
        data.metric_depth_from = search_data["metric_depth_from"];
      }
      if (search_data["metric_depth_to"]) {
        data.metric_depth_to = search_data["metric_depth_to"];
      }
      if (search_data["ratio_from"]) {
        data.ratio_from = search_data["ratio_from"];
      }
      if (search_data["ratio_to"]) {
        data.ratio_to = search_data["ratio_to"];
      }
      if (search_data["preset_ratio"]) {
        data.preset_ratio = search_data["preset_ratio"];
      }
      if (search_data["crown_height_from"]) {
        data.crown_height_from = search_data["crown_height_from"];
      }
      if (search_data["crown_height_to"]) {
        data.crown_height_to = search_data["crown_height_to"];
      }
      if (search_data["crown_angle_from"]) {
        data.crown_angle_from = search_data["crown_angle_from"];
      }
      if (search_data["crown_angle_to"]) {
        data.crown_angle_to = search_data["crown_angle_to"];
      }
      if (search_data["pavilion_depth_from"]) {
        data.pavilion_depth_from = search_data["pavilion_depth_from"];
      }
      if (search_data["pavilion_depth_to"]) {
        data.pavilion_depth_to = search_data["pavilion_depth_to"];
      }
      if (search_data["pavilion_angle_from"]) {
        data.pavilion_angle_from = search_data["pavilion_angle_from"];
      }
      if (search_data["pavilion_angle_to"]) {
        data.pavilion_angle_to = search_data["pavilion_angle_to"];
      }
      if (search_data["girdle"].length > 0) {
        data.girdle = search_data["girdle"].toString();
      }
      if (search_data["culet_size"].length > 0) {
        data.culet_size = search_data["culet_size"].toString();
      }
      if (search_data["culet_condition"].length > 0) {
        data.culet_condition = search_data["culet_condition"].toString();
      }
      if (search_data["treatment"]) {
        data.treatment = search_data["treatment"];
      }
      if (search_data["symbols"]) {
        data.symbols = search_data["symbols"];
      }
      if (search_data["symbol_checkbox"].length > 0) {
        data.symbol_checkbox = search_data["symbol_checkbox"].toString();
      }
      if (search_data["notify_daily"]) {
        data.notify_daily = search_data["notify_daily"];
      }
      if (search_data["notify_immediately"]) {
        data.notify_immediately = search_data["notify_immediately"];
      }
      if (search_data["expiration_date"]) {
        data.expiration_date = moment(
          search_data["expiration_date"].split("/").reverse().join("-")
        ).format("YYYY-MM-DD");
      }
      if (search_data["comment"]) {
        data.comment = search_data["comment"];
      }

      if (buy_requests_id) {
        let sql =
          "UPDATE buy_requests SET ?, updated_at = current_timestamp WHERE buy_requests_id = ?";
        conn.query(sql, [data, buy_requests_id], (err, results) => {
          if (err) {
            res.json({ status: 400, success: false, message: err });
          } else {
            if (results.affectedRows === 1) {
              res.json({
                status: 200,
                success: true,
                message: "Buy Requests Update Successfully",
                response: results[0],
              });
            } else {
              res.json({
                status: 400,
                success: false,
                message: "No data Found",
              });
            }
          }
        });
      } else {
        data.status = 1;
        let sql = "INSERT INTO buy_requests SET ?";
        conn.query(sql, data, (err, results) => {
          if (err) {
            res.json({ status: 400, success: false, message: err });
          } else {
            if (results.affectedRows === 1) {
              res.json({
                status: 200,
                success: true,
                message: "Buy Requests Upload Successfully",
                response: results[0],
              });
            } else {
              res.json({
                status: 400,
                success: false,
                message: "No data Found",
              });
            }
          }
        });
      }
    }
  }
);

router.post(
  "/searchBuyRequests",
  [
    check("columns").exists(),
    check("start").exists(),
    check("order").exists(),
    check("length").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({
        status: 401,
        success: false,
        message: err,
      });
      return;
    } else {
      var {
        search_data,
        userId,
        columns,
        order,
        start,
        length,
        search_data_filter,
      } = req.body;
      //console.log(search_data_filter)
      var objsearch = ``;
      var objsearcharr = [];
      if (userId != "" && userId != undefined) {
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE br.userId = ? `
            : ` AND br.userId = ? `;
        objsearcharr.push(userId);
      }
      if (search_data_filter["shape"] != "") {
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE br.shape_advanced LIKE concat('%',?,'%') `
            : ` AND br.shape_advanced LIKE concat('%',?,'%') `;
        objsearcharr.push(search_data_filter["shape"]);
      }
      if (
        search_data_filter["size_from"] != "" &&
        search_data_filter["size_to"] != ""
      ) {
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE br.size_general_from >= ? AND br.size_general_to <= ? `
            : ` AND br.size_general_from >= ? AND br.size_general_to <= ? `;
        objsearcharr.push(search_data_filter["size_from"]);
        objsearcharr.push(search_data_filter["size_to"]);
      }
      if (search_data_filter["clarity_from"] != "") {
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE br.clarity LIKE concat('%',?,'%') `
            : ` AND br.clarity LIKE concat('%',?,'%') `;
        objsearcharr.push(search_data_filter["clarity_from"]);
      }
      if (search_data_filter["clarity_to"] != "") {
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE br.clarity LIKE concat('%',?,'%') `
            : ` AND br.clarity LIKE concat('%',?,'%') `;
        objsearcharr.push(search_data_filter["clarity_to"]);
      }
      if (
        search_data_filter["cut_from"] != "" &&
        search_data_filter["cut_to"] != ""
      ) {
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE br.finish_general_cut_from = ? AND br.finish_general_cut_to = ? `
            : ` AND br.finish_general_cut_from = ? AND br.finish_general_cut_to = ? `;
        objsearcharr.push(search_data_filter["cut_from"]);
        objsearcharr.push(search_data_filter["cut_to"]);
      }
      if (
        search_data_filter["polish_from"] != "" &&
        search_data_filter["polish_to"] != ""
      ) {
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE br.finish_general_polish_from = ? AND br.finish_general_polish_to = ? `
            : ` AND br.finish_general_polish_from = ? AND br.finish_general_polish_to = ? `;
        objsearcharr.push(search_data_filter["polish_from"]);
        objsearcharr.push(search_data_filter["polish_to"]);
      }
      if (
        search_data_filter["create_date_from"] != "" &&
        search_data_filter["create_date_to"] != ""
      ) {
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE br.created_at BETWEEN ? AND ? `
            : ` AND br.created_at BETWEEN ? AND ? `;
        objsearcharr.push(search_data_filter["create_date_from"]);
        objsearcharr.push(search_data_filter["create_date_to"]);
      }
      if (
        search_data_filter["expire_date_from"] != "" &&
        search_data_filter["expire_date_to"] != ""
      ) {
        objsearch +=
          objsearcharr.length == 0
            ? `WHERE br.expiration_date BETWEEN ? AND ? `
            : ` AND br.expiration_date BETWEEN ? AND ? `;
        objsearcharr.push(search_data_filter["expire_date_from"]);
        objsearcharr.push(search_data_filter["expire_date_to"]);
      }
      objsearcharr = objsearcharr.concat(objsearcharr);
      let sql = `SELECT br.*,us.firstname,us.lastname FROM buy_requests br LEFT JOIN users us ON br.userId = us.userId ${objsearch}ORDER BY ${
        columns[order[0].column].data
      } ${
        order[0].dir
      } LIMIT ${start},${length};SELECT count(*) as cnt FROM buy_requests br LEFT JOIN users us ON br.userId = us.userId ${objsearch}`;
      //console.log(sql)
      //console.log(objsearcharr)
      conn.query(sql, objsearcharr, function (error, resdata) {
        if (error) {
          res.json({ status: 400, success: false, message: error });
        } else {
          if (resdata[0].length > 0) {
            res.json({
              status: 200,
              success: true,
              message: "Get Requests successfully",
              response: resdata[0],
              TotalRecords: resdata[1][0],
            });
          } else {
            res.json({
              status: 400,
              success: false,
              message: "No data Found",
              TotalRecords: 0,
            });
          }
        }
      });
    }
  }
);

router.post(
  "/searchOrders",
  [
    check("columns").exists(),
    check("start").exists(),
    check("order").exists(),
    check("length").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({
        status: 401,
        success: false,
        message: err,
      });
      return;
    } else {
      var { status, userId, columns, order, start, length } = req.body;
      var objsearch = ``;
      var objsearcharr = [];
      if (userId != "" && userId != undefined) {
        objsearch +=
          objsearcharr.length == 0 ? `WHERE userId = ? ` : ` AND userId = ? `;
        objsearcharr.push(userId);
      }
      if (status != 0 && status != undefined) {
        objsearch +=
          objsearcharr.length == 0 ? `WHERE status = ? ` : ` AND status = ? `;
        objsearcharr.push(status);
      }
      objsearcharr = objsearcharr.concat(objsearcharr);
      let sql = `SELECT *,CONCAT(REPEAT('0', 7-LENGTH(order_id)), order_id) AS order_number FROM orders ${objsearch}ORDER BY ${
        columns[order[0].column].data
      } ${
        order[0].dir
      } LIMIT ${start},${length};SELECT count(*) as cnt FROM orders ${objsearch}`;
      conn.query(sql, objsearcharr, function (error, resdata) {
        if (error) {
          res.json({ status: 400, success: false, message: error });
        } else {
          if (resdata[0].length > 0) {
            res.json({
              status: 200,
              success: true,
              message: "Get Orders successfully",
              response: resdata[0],
              TotalRecords: resdata[1][0],
            });
          } else {
            res.json({
              status: 400,
              success: false,
              message: "No data Found",
              TotalRecords: 0,
            });
          }
        }
      });
    }
  }
);

router.post("/watchlist", [check("userId").exists()], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    res.json({
      status: 401,
      success: false,
      message: err,
    });
  } else {
    var { userId } = req.body;

    let sql = "SELECT * FROM `watchlist` WHERE userId = ?";
    conn.query(sql, [userId], (err, results) => {
      if (err) {
        res.json({ status: 400, success: false, message: err });
      } else {
        if (results.length > 0) {
          console.log("watchlist:::: " + CircularJSON.stringify(results));
          res.json({
            status: 200,
            success: true,
            message: "Get diamond successfully",
            WatchList: results[0].diamondList,
          });
        } else {
          res.json({
            status: 400,
            success: false,
            message: "No data Found",
            TotalRecords: 0,
          });
        }
      }
    });
  }
});

router.post(
  "/searchWatchlist",
  [
    check("columns").exists(),
    check("start").exists(),
    check("order").exists(),
    check("length").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({
        status: 401,
        success: false,
        message: err,
      });
    } else {
      var { status, userId, columns, order, start, length } = req.body;
      var objsearch = ``;
      var objsearcharr = [];

      let sql2 = "SELECT * FROM `watchlist` WHERE userId = ?";
      conn.query(sql2, [userId], (err, results2) => {
        if (err) {
          res.json({ status: 400, success: false, message: err });
        } else {
          if (results2.length > 0) {
            var diamondList = results2[0].diamondList;
            if (diamondList) {
              objsearcharr = objsearcharr.concat(objsearcharr);
              let sql = `SELECT sale_subtotal, sale_price_back, sale_back, size, rap_price, lab, stock_number, diamond_id FROM diamonds WHERE diamond_id IN (${diamondList}) ${objsearch}ORDER BY ${
                columns[order[0].column].data
              } ${
                order[0].dir
              } limit ${start},${length};SELECT count(*) as cnt FROM diamonds WHERE diamond_id IN (${diamondList}) ${objsearch}`;
              conn.query(sql, objsearcharr, function (error, resdata) {
                if (error) {
                  res.json({ status: 400, success: false, message: error });
                } else {
                  if (resdata[0].length > 0) {
                    if (diamondList) {
                      diamondList = diamondList.split(",").map(Number);
                    } else {
                      diamondList = [];
                    }
                    res.json({
                      status: 200,
                      success: true,
                      message: "Get diamond successfully",
                      DiamondList: diamondList,
                      data: resdata[0],
                      TotalRecords: resdata[1][0],
                    });
                  } else {
                    res.json({
                      status: 400,
                      success: false,
                      message: "No data Found",
                      TotalRecords: 0,
                    });
                  }
                }
              });
            } else {
              res.json({
                status: 400,
                success: false,
                message: "No data Found",
                TotalRecords: 0,
              });
            }
          } else {
            res.json({
              status: 400,
              success: false,
              message: "No data Found",
              TotalRecords: 0,
            });
          }
        }
      });
    }
  }
);

router.post(
  "/GetBuyRequests",
  [check("buy_requests_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      var buy_requests_id = req.body.buy_requests_id;
      let sql = "SELECT * FROM buy_requests WHERE buy_requests_id = ?";
      conn.query(sql, [buy_requests_id], (err, results) => {
        if (err) {
          res.json({ status: 400, success: false, message: err });
        } else {
          if (results.length > 0) {
            res.json({
              status: 200,
              success: true,
              message: "Get Data Successfully",
              data: results[0],
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post("/GetBlogList", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({ status: 422, message: errors.array() });
  } else {
    let limit = req.body.limit;
    let search = "";
    if (limit) {
      search = "LIMIT " + limit;
    }
    let sql = `SELECT * FROM blog WHERE status = 1 ORDER BY blogId DESC ${search}`;
    conn.query(sql, (err, results) => {
      if (err) {
        res.json({ status: 400, success: false, message: err });
      } else {
        if (results.length > 0) {
          res.json({
            status: 200,
            success: true,
            message: "Get Data Successfully",
            data: results,
          });
        } else {
          res.json({ status: 400, success: false, message: "No data Found" });
        }
      }
    });
  }
});

router.post(
  "/GetRecordBlog",
  [check("blogId").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      var blogId = req.body.blogId;
      let sql = "SELECT * FROM `blog` WHERE blogId = ?";
      conn.query(sql, [blogId], (err, results) => {
        if (err) {
          res.json({ status: 400, success: false, message: err });
        } else {
          if (results.length > 0) {
            res.json({
              status: 200,
              success: true,
              message: "Get Data Successfully",
              data: results[0],
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/ChangeStatusRequests",
  [check("buy_requests_id").exists()],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.json({ status: 422, message: errors.array() });
    } else {
      let status = 1;
      let buy_requests_id = req.body.buy_requests_id;
      let sql = "SELECT * FROM buy_requests WHERE buy_requests_id = ?";
      conn.query(sql, [buy_requests_id], (err, results) => {
        if (err) {
          res.json({ status: 400, success: false, message: err });
        } else {
          if (results.length > 0) {
            let responseActive = results[0].status;
            if (responseActive === 1) {
              status = 0;
            }
            let sql1 =
              "UPDATE buy_requests SET status = ?, updated_at = current_timestamp WHERE buy_requests_id = ?";
            conn.query(sql1, [status, buy_requests_id], (err, results1) => {
              if (err) {
                res.json({ status: 400, success: false, message: err });
              } else {
                if (results1.affectedRows === 1) {
                  if (status === 1) {
                    res.json({
                      status: 200,
                      success: true,
                      message: "Requests is Activated",
                      response: 1,
                    });
                  } else {
                    res.json({
                      status: 200,
                      success: true,
                      message: "Requests is Deactivated",
                      response: 0,
                    });
                  }
                } else {
                  res.json({
                    status: 400,
                    success: false,
                    message: "No data Found",
                  });
                }
              }
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post("/profile-picture", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({ status: 422, message: errors.array() });
  } else {
    let { userId, profile, cropProfile } = req.body;
    let data = {};
    let sql = "SELECT * FROM `users` WHERE userId = ?";
    conn.query(sql, [userId], (err, results) => {
      if (err) {
        res.json({ status: 400, success: false, message: err });
      } else {
        if (results.length > 0) {
          if (profile != "") {
            var fileName = path
              .basename(profile)
              .toString()
              .replace(/ /g, "_")
              .replace("C:/fakepath/", "")
              .replace("C:\\fakepath\\", "");
            // var imageBuffer = decodeBase64Image(cropProfile);
            let filename = Math.floor(Math.random() * 100000) + "-" + fileName;
            // let file_url = './upload/profile/'+filename;
            // let file_name = 'upload/profile/'+filename;
            fs.writeFile(
              path.join("./upload/profile/", filename),
              cropProfile.replace(/^data:image\/[a-z]+;base64,/, ""),
              "base64",
              function (err) {
                if (err) {
                  res.json({ status: 400, success: false, message: err });
                } else {
                  data.company_logo = path.join("upload/profile/", filename);
                  let sql1 = "UPDATE `users` SET ? WHERE userId = ?";
                  conn.query(sql1, [data, userId], function (err, results) {
                    if (err) {
                      res.json({ status: 400, success: false, message: err });
                    } else {
                      res.json({
                        status: 200,
                        success: true,
                        message: "Picture Update Successfully",
                        response: results,
                      });
                    }
                  });
                }
              }
            );
          }
          /*if (req.files && Object.keys(req.files).length > 0) {
            if(req.files.company_logo != undefined){
              let company_logo = req.files.company_logo;
              company_logo.name = company_logo.name.replace(/ /g,"_");
              let filename = Math.floor(Math.random() * 100000)+'-'+company_logo.name;
              let file_url = './upload/profile/'+filename;
              let file_name = 'upload/profile/'+filename;
              company_logo.mv(file_url, function (error) {
                if (error) {
                  res.json({status: 400, success: false, message: error});
                }else{
                  data.company_logo = file_name
                }
              });
            }
          }*/
        } else {
          res.json({ status: 400, success: false, message: "User not Found" });
        }
      }
    });
  }
});

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error("Invalid input string");
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], "base64");

  return response;
}

router.post(
  "/updateProfile",
  [check("firstname").exists(), check("lastname").exists()],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      let {
        userId,
        firstname,
        lastname,
        birth_date,
        mobile,
        phone,
        anniversary_date,
        any_reference,
        company_name,
        designation,
        business_type,
        country,
        state,
        city,
        zipcode,
        address,
        fax,
      } = req.body;
      if (birth_date != "") {
        birth_date = moment(birth_date.split("/").reverse().join("-")).format(
          "YYYY-MM-DD"
        );
      } else {
        birth_date = null;
      }
      if (anniversary_date != "") {
        anniversary_date = moment(
          anniversary_date.split("/").reverse().join("-")
        ).format("YYYY-MM-DD");
      } else {
        anniversary_date = null;
      }
      let data = {
        firstname: firstname,
        lastname: lastname,
        birth_date: birth_date,
        anniversary_date: anniversary_date,
        any_reference: any_reference,
        mobile: mobile,
        phone: phone,
        company_name: company_name,
        designation: designation,
        business_type: business_type,
        country: country,
        state: state,
        city: city,
        zipcode: zipcode,
        address: address,
        fax: fax,
      };
      let sql = "SELECT * FROM users WHERE userId = ?";
      conn.query(sql, [userId], (err, results) => {
        if (err) {
          res.json({ status: 400, success: false, message: err });
        } else {
          if (results.length > 0) {
            if (req.files && Object.keys(req.files).length > 0) {
              if (req.files.company_logo != undefined) {
                let company_logo = req.files.company_logo;
                company_logo.name = company_logo.name.replace(/ /g, "_");
                let filename2 =
                  Math.floor(Math.random() * 100000) + "-" + company_logo.name;
                let file_url2 = "./upload/profile/" + filename2;
                let file_name2 = "upload/profile/" + filename2;
                company_logo.mv(file_url2, function (error) {
                  if (error) {
                    res.json({ status: 400, message: error });
                  } else {
                    data.company_logo = file_name2;
                  }
                });
              }
              if (req.files.photo_file != undefined) {
                let photo_file = req.files.photo_file;
                photo_file.name = photo_file.name.replace(/ /g, "_");
                let filename =
                  Math.floor(Math.random() * 100000) + "-" + photo_file.name;
                let file_url = "./upload/kyc/" + filename;
                let file_name = "upload/kyc/" + filename;
                photo_file.mv(file_url, function (error) {
                  if (error) {
                    res.json({ status: 400, message: error });
                  } else {
                    data.photo_proof = file_name;
                  }
                });
              }
              if (req.files.business_file != undefined) {
                let business_file = req.files.business_file;
                business_file.name = business_file.name.replace(/ /g, "_");
                let filename1 =
                  Math.floor(Math.random() * 100000) + "-" + business_file.name;
                let file_url1 = "./upload/kyc/" + filename1;
                let file_name1 = "upload/kyc/" + filename1;
                business_file.mv(file_url1, function (error) {
                  if (error) {
                    res.json({ status: 400, message: error });
                  } else {
                    data.business_proof = file_name1;
                  }
                });
              }
            }
            let sql = "UPDATE users SET ? WHERE userId = ?";
            conn.query(sql, [data, userId], (err, results) => {
              if (err) {
                res.json({ status: 400, success: false, message: err });
              } else {
                if (results.affectedRows === 1) {
                  res.json({
                    status: 200,
                    success: true,
                    message: "Profile Update Successfully",
                    response: results[0],
                  });
                } else {
                  res.json({
                    status: 400,
                    success: false,
                    message: "No data Found",
                  });
                }
              }
            });
          } else {
            res.json({ status: 400, success: false, message: "No data Found" });
          }
        }
      });
    }
  }
);

router.post(
  "/change-password",
  [
    check("old_password")
      .exists()
      .isLength({ min: 6 })
      .withMessage("must be at least 6 chars long"),
    check("password")
      .exists()
      .isLength({ min: 6 })
      .withMessage("must be at least 6 chars long"),
    check("confirm_password")
      .exists()
      .isLength({ min: 6 })
      .withMessage("must be at least 6 chars long"),
    check("userId").exists(),
  ],
  function (req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      const old_password = req.body.old_password;
      const password = req.body.password;
      const confirm_password = req.body.confirm_password;
      const userId = req.body.userId;
      if (password !== confirm_password) {
        res.json({
          status: 400,
          success: false,
          message: "Do not match Password and Confirm Password",
        });
      }
      let sql = "SELECT * FROM `users` WHERE userId = ? AND password = ?";
      conn.query(
        sql,
        [
          userId,
          crypto
            .createHash("sha256")
            .update(old_password, "utf8")
            .digest("hex"),
        ],
        (err, results) => {
          if (err) {
            res.json({ status: 501, success: false, message: err });
          } else {
            if (results.length > 0) {
              let sql1 = "UPDATE `users` SET password = ? WHERE userId = ?";
              conn.query(
                sql1,
                [
                  crypto
                    .createHash("sha256")
                    .update(password, "utf8")
                    .digest("hex"),
                  userId,
                ],
                (err, results1) => {
                  if (err) {
                    res.json({ status: 501, success: false, message: err });
                  } else {
                    if (results1.affectedRows === 1) {
                      res.json({
                        status: 200,
                        success: true,
                        message: "Your password has been successfully changed",
                      });
                    } else {
                      res.json({
                        status: 400,
                        success: false,
                        message: "Your password has been not changed",
                      });
                    }
                  }
                }
              );
            } else {
              res.json({
                status: 400,
                success: false,
                message: "Your Old Password is Wrong! Please Correct Password",
              });
            }
          }
        }
      );
    }
  }
);

router.post("/getNews", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({ status: 422, message: errors.array() });
  } else {
    let category = req.body.category;
    let search = req.body.search;
    var body_option = {
      category: category,
      pageNumber: 1,
      pageSize: 20,
      search: search,
    };
    var options = {
      method: "POST",
      url: "https://api.rapnet.com/api/Article",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(body_option),
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      var response = JSON.parse(response.body);
      //console.log(response)
      res.json({
        status: 200,
        success: true,
        message: "Get News Successfully",
        news: response,
      });
    });
  }
});

router.post("/GetNewsDetails", function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.json({ status: 422, message: errors.array() });
  } else {
    let articleID = req.body.articleID;
    var options = {
      method: "GET",
      url: `https://api.rapnet.com/api/SingleArticle?id=${articleID}`,
      headers: {
        "content-type": "application/json",
      },
    };
    request(options, function (error, response) {
      if (error) throw new Error(error);
      var response = JSON.parse(response.body);
      //console.log(response)
      res.json({
        status: 200,
        success: true,
        message: "Get News Successfully",
        news: response,
      });
    });
  }
});

router.post(
  "/contact-us",
  [
    check("firstname").exists(),
    check("lastname").exists(),
    check("email").exists(),
    check("comment").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      var { firstname, lastname, email, comment } = req.body;
      email = email.toLowerCase();
      if (EmailValidator.validate(email)) {
        let data = {
          firstname: firstname,
          lastname: lastname,
          comment: comment,
          email: email,
        };
        let sql1 = "INSERT INTO contact_us SET ?";
        conn.query(sql1, data, (err, results1) => {
          if (err) {
            res.json({ status: 400, success: false, message: err });
          } else {
            if (results1.affectedRows === 1) {
              var html = `<!DOCTYPE html>
              <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
                  <head>
                      <title>Kukadia</title>
                      <style>@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');</style>
                  </head>
              
                  <body style="margin: 0; padding: 0; background: #fff; font-family: 'Roboto', sans-serif;font-weight: 400;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                              <td>
                                  <table width="560px" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                      <tr>
                                          <td style="background: #dbf1dc; height: auto; padding: 0 0;" align="center">
                                              <p style="color: #033603; font-size: 16px; font-family: 'Roboto', sans-serif;line-height: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.065em;">
                                                  Real is rare. rare Lasts Forever.
                                              </p>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style="text-align: center; padding: 25px 0;">
                                              <img src="${process.env.BACKEND_URL}upload/mail/kukadia-logo.png" alt="kukadia-logo" />
                                          </td>
                                      </tr>
              
                                      <tr>
                                          <td style="text-align: center; padding: 10px 0;">
                                              <img src="${process.env.BACKEND_URL}upload/mail/thankyou-image.png" alt="" />
                                          </td>
                                      </tr>
              
                                      <tr>
                                          <td style="text-align: center; padding: 0; padding-top: 0;">
                                              <h1 style="letter-spacing: 0.0066em; font-size: 25px; font-weight: 700; text-transform: capitalize; color: #000000;">Thank You For Contact Us!</h1>
                                              <span style="display: block; font-size: 16px; letter-spacing: 0.01em; color: #000000;">Dear ${firstname} ${lastname} 👋,</span>
                                              <p style="letter-spacing: 0.01em; font-size: 16px; line-height: 24px; color: #000000;">
                                                  Thank you very much for filling out our form.Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                              </p>
                                              <span style="display: inline-block; border-bottom: 1px solid #000000; padding: 0 0 5px 0;">
                                                  <a
                                                      href="${process.env.FRONTEND_URL}"
                                                      style="
                                                          display: inline-block;
                                                          background: #033603;
                                                          color: #fff !important;
                                                          font-weight: 400;
                                                          text-transform: uppercase;
                                                          font-size: 16px;
                                                          letter-spacing: 0.0066em;
                                                          border: 0;
                                                          outline: none;
                                                          border-radius: 0;
                                                          -webkit-border-radius: 0;
                                                          -moz-border-radius: 0;
                                                          padding: 12px 25px 13px 25px;
                                                          text-align: center;
                                                          margin-top: 15px;
                                                          text-decoration: none;
                                                          font-family: 'Roboto', sans-serif;
                                                      "
                                                  >
                                                      Go To Home page
                                                  </a>
                                              </span>
                                          </td>
                                      </tr>
              
                                      <tr>
                                          <td>
                                              <div
                                                  class="footer-bg-img"
                                                  style="
                                                      position: relative;
                                                      margin-top: 40px;
                                                      background: url(${process.env.BACKEND_URL}upload/mail/footer_bg_kukadia.png);
                                                      background-repeat: no-repeat;
                                                      background-position: center;
                                                      background-size: cover;
                                                      padding: 20px 0 1px 0;
                                                      vertical-align: middle;
                                                      text-align: center;
                                                      font-family: 'Roboto', sans-serif;
                                                  "
                                              >
                                                  <div class="footer-content">
                                                      <span style="display: block; text-align: center; margin: 0 0 15px 0;">
                                                          <img src="${process.env.BACKEND_URL}upload/mail/kukadia-ventures.png" alt="striliant-logo" style="border-right: 1px solid #182342; padding: 0 10px; padding-right: 20px;" />
                                                          <img style="margin-left: 20px;" src="${process.env.BACKEND_URL}upload/mail/kukadia-corporation..png" alt="striliant-logo" />
                                                      </span>
                                                      <div class="social-icon">
                                                          <h3 style="text-transform: uppercase; font-weight: 600; font-size: 14px; line-height: 27px; margin: 0; color: #000;">Follow US</h3>
                                                          <ul class="list-unstyled-css" style="list-style: none; padding: 0;">
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                  <a href="https://www.facebook.com/kukadia.co/"><img src="${process.env.BACKEND_URL}upload/mail/facebook.png" /></a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                  <a href="https://www.instagram.com/kukadia.co/"><img src="${process.env.BACKEND_URL}upload/mail/instagram-sketched.png" /></a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                  <a href="https://twitter.com/?lang=en"><img src="${process.env.BACKEND_URL}upload/mail/twitter.png" /></a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                  <a href="https://youtube.com/"><img src="${process.env.BACKEND_URL}upload/mail/youtube.png" /></a>
                                                              </li>
                                                          </ul>
                                                      </div>
              
                                                      <div class="footer-link-blog">
                                                          <ul style="list-style: none; padding: 0;">
                                                              <li class="active" style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="#" style="color: #033603; text-decoration: underline; font-family: 'Roboto', sans-serif;">Unsubscribe</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="${process.env.FRONTEND_URL}policy" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Privacy policy</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="${process.env.FRONTEND_URL}terms-and-condition" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Terms of Service</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                  <a href="${process.env.FRONTEND_URL}contact-us" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Visit Us</a>
                                                              </li>
                                                          </ul>
                                                      </div>
                                                      <div class="footer-desc">
                                                          <ul style="list-style: none; padding: 0;">
                                                              <li class="active" style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Surat</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Mumbai</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">New York</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Toronto</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                  <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Montreal</a>
                                                              </li>
                                                          </ul>
                                                      </div>
                                                  </div>
                                              </div>
                                          </td>
                                      </tr>
              
                                      <tr>
                                          <td style="background-color: #033603; color: #fff; text-align: center;">
                                              <h4 style="font-weight: normal; margin: 10px 0; font-size: 14px;">&#169; 2021 Kukadia Ventures Pvt. Ltd. All Rights Reserved.</h4>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </body>
              </html>
              `;
              var subject = `Thank You For Contact Us!`;
              var check = helper.email_helper("", email, subject, html);

              var admin_html = `<!DOCTYPE html>
              <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
                  <head>
                      <title>Kukadia</title>
                      <style>@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap');</style>
                  </head>
              
                  <body style="margin: 0; padding: 0; background: #fff; font-family: 'Roboto', sans-serif;font-weight: 400;">
                      <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                              <td>
                                  <table width="560px" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                      <tr>
                                          <td style="background: #dbf1dc; height: auto; padding: 0 0;" align="center">
                                              <p style="color: #033603; font-size: 16px; font-family: 'Roboto', sans-serif;line-height: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.065em;">
                                                  Real is rare. rare Lasts Forever.
                                              </p>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td style="text-align: center; padding: 25px 0;">
                                              <img src="${process.env.BACKEND_URL}upload/mail/kukadia-logo.png" alt="kukadia-logo" />
                                          </td>
                                      </tr>
              
                                      <tr>
                                          <td style="text-align: center; padding: 10px 0;">
                                              <table width="100%" cellpadding="0" cellspacing="0">
                                                  <tr>
                                                      <th
                                                          colspan="2"
                                                          style="
                                                              background-color: #e8f3e9;
                                                              text-align: center;
                                                              letter-spacing: 0.0066em;
                                                              text-transform: capitalize;
                                                              color: #000000;
                                                              font-size: 20px;
                                                              padding: 15px;
                                                              font-weight: 700;
                                                              vertical-align: top;
                                                          "
                                                      >
                                                          Contact Us User detail
                                                      </th>
                                                  </tr>
                                                  <tr>
                                                      <th style="color: #033603; font-size: 15px; text-align: left; padding: 18px 10px; vertical-align: top; width: 160px; border-bottom: 1px solid #00000033; font-weight: 700;">Full Name :</th>
                                                      <td style="border-bottom: 1px solid #00000033; padding: 18px 10px; color: #000000; font-weight: 400; font-size: 15px; vertical-align: top; text-align: left; word-break: break-word;">${firstname} ${lastname}</td>
                                                  </tr>
                                                  <tr>
                                                      <th style="color: #033603; font-size: 15px; text-align: left; padding: 18px 10px; vertical-align: top; width: 160px; border-bottom: 1px solid #00000033; font-weight: 700;">Email :</th>
                                                      <td style="border-bottom: 1px solid #00000033; padding: 18px 10px; color: #000000; font-weight: 400; font-size: 15px; vertical-align: top; text-align: left; word-break: break-word;">${email}</td>
                                                  </tr>
                                                  <tr>
                                                      <th style="color: #033603; font-size: 15px; text-align: left; padding: 18px 10px; vertical-align: top; width: 160px; border-bottom: 1px solid #00000033; font-weight: 700;">Message :</th>
                                                      <td style="border-bottom: 1px solid #00000033; padding: 18px 10px; color: #000000; font-weight: 400; font-size: 15px; vertical-align: top; text-align: left; word-break: break-word;">${comment}</td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
              
                                      <tr>
                                          <td>
                                              <div
                                                  class="footer-bg-img"
                                                  style="
                                                      position: relative;
                                                      margin-top: 40px;
                                                      background: url(${process.env.BACKEND_URL}upload/mail/footer_bg_kukadia.png);
                                                      background-repeat: no-repeat;
                                                      background-position: center;
                                                      background-size: cover;
                                                      padding: 20px 0 1px 0;
                                                      vertical-align: middle;
                                                      text-align: center;
                                                      font-family: 'Roboto', sans-serif;
                                                  "
                                              >
                                                  <div class="footer-content">
                                                      <span style="display: block; text-align: center; margin: 0 0 15px 0;">
                                                          <img src="${process.env.BACKEND_URL}upload/mail/kukadia-ventures.png" alt="striliant-logo" style="border-right: 1px solid #182342; padding: 0 10px; padding-right: 20px;" />
                                                          <img style="margin-left: 20px;" src="${process.env.BACKEND_URL}upload/mail/kukadia-corporation..png" alt="striliant-logo" />
                                                      </span>
                                                      <div class="social-icon">
                                                          <h3 style="text-transform: uppercase; font-weight: 600; font-size: 14px; line-height: 27px; margin: 0; color: #000;">Follow US</h3>
                                                          <ul class="list-unstyled-css" style="list-style: none; padding: 0;">
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                  <a href="https://www.facebook.com/kukadia.co/"><img src="${process.env.BACKEND_URL}upload/mail/facebook.png" /></a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                  <a href="https://www.instagram.com/kukadia.co/"><img src="${process.env.BACKEND_URL}upload/mail/instagram-sketched.png" /></a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                  <a href="https://twitter.com/?lang=en"><img src="${process.env.BACKEND_URL}upload/mail/twitter.png" /></a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                  <a href="https://youtube.com/"><img src="${process.env.BACKEND_URL}upload/mail/youtube.png" /></a>
                                                              </li>
                                                          </ul>
                                                      </div>
              
                                                      <div class="footer-link-blog">
                                                          <ul style="list-style: none; padding: 0;">
                                                              <li class="active" style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="#" style="color: #033603; text-decoration: underline; font-family: 'Roboto', sans-serif;">Unsubscribe</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="${process.env.FRONTEND_URL}policy" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Privacy policy</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="${process.env.FRONTEND_URL}terms-and-condition" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Terms of Service</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                  <a href="${process.env.FRONTEND_URL}contact-us" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Visit Us</a>
                                                              </li>
                                                          </ul>
                                                      </div>
                                                      <div class="footer-desc">
                                                          <ul style="list-style: none; padding: 0;">
                                                              <li class="active" style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Surat</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Mumbai</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">New York</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                  <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Toronto</a>
                                                              </li>
                                                              <li style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                  <a href="#" style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Montreal</a>
                                                              </li>
                                                          </ul>
                                                      </div>
                                                  </div>
                                              </div>
                                          </td>
                                      </tr>
              
                                      <tr>
                                          <td style="background-color: #033603; color: #fff; text-align: center;">
                                              <h4 style="font-weight: normal; margin: 10px 0; font-size: 14px;">&#169; 2021 Kukadia Ventures Pvt. Ltd. All Rights Reserved.</h4>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </body>
              </html>
            `;
              var admin_subject = `User Contacted On Kukadia.co`;
              var admin_check = helper.email_helper(
                "",
                ADMINEMAIL,
                admin_subject,
                admin_html
              );

              if (check && admin_check) {
                res.json({
                  status: 200,
                  success: true,
                  message: "Thanks for support",
                });
              } else {
                res.json({
                  status: 400,
                  success: false,
                  message: "Thanks for support",
                });
              }
            } else {
              res.json({
                status: 400,
                success: false,
                message: "Contact form is Failed",
              });
            }
          }
        });
      } else {
        res.json({
          status: 400,
          success: false,
          message: "Invalid Email Address.",
        });
      }
    }
  }
);

router.post(
  "/PlaceOrder",
  [
    check("userId").exists(),
    check("diamond_id").exists(),
    check("email").exists(),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      res.json({ status: 401, success: false, message: err });
      return;
    } else {
      console.log("placeorderreq:::" + JSON.stringify(req.body)); //log
      // var {userId,diamond_id,email,pieces,cts,avg_disc,total_cr,total_price} = req.body
      var sale_back = 0;
      var sale_w_back = 0;
      var old_cts = 0;
      var Avg_Disc_temp = 0;
      var sale_subtotal = 0;
      var diamondList = [];
      var { userId, diamond_id, email } = req.body;
      let sql = "SELECT * FROM `cart` WHERE userId = ?";
      conn.query(sql, [userId], (err, results) => {
        if (err) {
          res.json({ status: 501, success: false, message: err });
        } else {
          if (results.length > 0) {
            for (var i of diamond_id) {
              if (results[0]["diamondList"].includes(i)) {
                diamondList.push(i);
              }
            }
            var diamlist = diamondList.join(",");
            let sql1 = `SELECT * FROM diamonds WHERE diamond_id in (${diamlist})`;
            conn.query(sql1, (err1, result1) => {
              if (err1) {
                console.log("err1" + JSON.stringify(err1)); //log
                res.json({ status: 501, success: false, message: err1 });
              } else {
                var searchlistData = JSON.parse(JSON.stringify(result1)); //log
                var Pieces = Object.keys(searchlistData).length;
                for (var i = 0; i < searchlistData.length; i++) {
                  old_cts = old_cts + searchlistData[i].size;
                  sale_back =
                    sale_back + parseFloat(searchlistData[i].sale_back);
                  sale_w_back =
                    sale_w_back + parseFloat(searchlistData[i].sale_price_back);
                  sale_subtotal =
                    sale_subtotal + parseFloat(searchlistData[i].sale_subtotal);
                }
                var Cts = old_cts.toFixed(2);
                Avg_Disc_temp = sale_back / Pieces;
                var Avg_Disc = Avg_Disc_temp.toFixed(2);
                var Total_Cr = sale_subtotal / old_cts;
                var Amount = sale_subtotal;

                var data = {
                  userId: userId,
                  item: diamlist,
                  pieces: Pieces,
                  cts: Cts,
                  avg_disc: Avg_Disc,
                  total_cr: Total_Cr,
                  total_price: Amount,
                  status: 1,
                };
                var sql2 = "INSERT INTO orders SET ?";
                conn.query(sql2, data, (err, results2) => {
                  if (err) {
                    res.json({ status: 400, success: false, message: err });
                  } else {
                    if (results2.affectedRows === 1) {
                      if (results2.affectedRows === 1) {
                        var order_id = results2.insertId;
                        var sql3 =
                          "SELECT *,CONCAT(REPEAT('0', 7-LENGTH(order_id)), order_id) AS order_number FROM orders WHERE order_id = ?";
                        conn.query(sql3, [order_id], (err, results3) => {
                          if (err) {
                            console.log(JSON.stringify(err));
                            res.json({
                              status: 501,
                              success: false,
                              message: err,
                            });
                          } else {
                            if (results3.length > 0) {
                              var diamondlist_str =
                                "," +
                                results[0]["diamondList"]
                                  .toString()
                                  .replace(", ", ",") +
                                ",";
                              for (var r of diamondList) {
                                diamondlist_str = diamondlist_str.replace(
                                  "," + r + ",",
                                  ","
                                );
                              }
                              var rplcd_str = diamondlist_str
                                .replace(/(^,)|(,$)/g, "")
                                .toString();
                              var sql4 = `UPDATE cart SET diamondList = '${rplcd_str}', updated_at = current_timestamp WHERE userId = ${userId};`;
                              conn.query(sql4, function (err, results4) {
                                if (err) {
                                  res.json({
                                    status: 400,
                                    success: false,
                                    message: err,
                                  });
                                } else {
                                  var plc_odr_html = `<!DOCTYPE html>
                                  <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
                                  
                                  <head>
                                      <title>Kukadia</title>
                                      <style>
                                          @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");
                                      </style>
                                  </head>
                                  
                                  <body style="margin: 0; padding: 0; background: #fff; font-family: 'Roboto', sans-serif; font-weight: 400;">
                                      <table width="100%" cellpadding="0" cellspacing="0">
                                          <tr>
                                              <td>
                                                  <table width="560px" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                                      <tr>
                                                          <td style="background: #dbf1dc; height: auto; padding: 0 0;" align="center">
                                                              <p
                                                                 style="color: #033603; font-size: 16px; font-family: 'Roboto', sans-serif; line-height: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.065em;">
                                                                  Real is rare. rare Lasts Forever.</p>
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="text-align: center; padding: 25px 0;">
                                                              <img src="${process.env.BACKEND_URL}upload/mail/kukadia-logo.png" alt="kukadia-logo" />
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td>
                                                              <h1
                                                                 style="font-weight: 600; text-align: center; font-size: 30px; line-height: 50px; letter-spacing: 0.0066em; text-transform: capitalize; color: #033603; margin-top: 0;">
                                                                  Thanks For Your Order</h1>
                                                              <p
                                                                 style="width: 535px; text-align: center; margin: 0 auto; font-weight: 400; color: #000000; font-size: 18px; line-height: 24px; font-family: 'Roboto', sans-serif;">
                                                                  We have received your order request. We know you can't wait to get your hands on it. At
                                                                  Kukadia, our team is working hard while ensuring the highest safety standards in these
                                                                  tough times. We make sure to deliver your product best within the given date. Thanks for
                                                                  your support! </p>
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td style="text-align: center;">
                                                              <span
                                                                 style="display: inline-block; border-bottom: 1px solid #000000; padding: 0 0 5px 0; margin: 30px 0;">
                                                                  <a href="${process.env.FRONTEND_URL}orders" style="
                                                                              background: #033603;
                                                                              color: #fff !important;
                                                                              font-weight: 400;
                                                                              text-transform: uppercase;
                                                                              font-size: 16px;
                                                                              letter-spacing: 0.0066em;
                                                                              padding: 10px 35px 10px 35px;
                                                                              text-align: center;
                                                                              text-decoration: none;
                                                                              display: inline-block;
                                                                              margin: 0 auto;
                                                                          ">
                                                                      <span style="font-family: 'Roboto', sans-serif;">VIEW ORDER <img
                                                                             src="${process.env.BACKEND_URL}upload/mail/back-arrow.png" alt="right-arrow"
                                                                             style="margin-left: 10px; vertical-align: middle;" /></span>
                                                                  </a>
                                                              </span>
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td style="background: #dbf1dc80; border: 1px solid rgba(24, 35, 66, 0.2); padding: 15px;">
                                                              <table width="100%" cellpadding="0" cellspacing="0">
                                                                  <tr>
                                                                      <td
                                                                         style="width: 50%; display: inline-block; border-right: 1px solid rgba(24, 35, 66, 0.3); vertical-align: top;">
                                                                          <p
                                                                             style="letter-spacing: 0.0066em; text-transform: uppercase; color: #033603; margin-top: 0; font-weight: 600;">
                                                                              Summary :</p>
                                                                          <ul style="padding: 0; margin: 0;">
                                                                              <li
                                                                                 style="list-style: none; margin: 5px 0;font-family: 'Roboto', sans-serif;">
                                                                                  Order # : <span
                                                                                     style="font-family: 'Roboto', sans-serif;">12345879</span></li>
                                                                              <li
                                                                                 style="list-style: none; margin: 5px 0;font-family: 'Roboto', sans-serif;">
                                                                                  Order Date : <span style="font-family: 'Roboto', sans-serif;">12 Jan,
                                                                                      2021</span></li>
                                                                              <li
                                                                                 style="list-style: none; margin: 5px 0;font-family: 'Roboto', sans-serif;">
                                                                                  Order Total : <span
                                                                                     style="font-family: 'Roboto', sans-serif;">$2000.00</span></li>
                                                                          </ul>
                                                                      </td>
                                                                      <td
                                                                         style="width: 40%; display: inline-block; padding-left: 40px; vertical-align: top;">
                                                                          <p
                                                                             style="letter-spacing: 0.0066em; text-transform: uppercase; color: #033603; margin-top: 0; font-weight: 600;font-family: 'Roboto', sans-serif;">
                                                                              Shipping Address :</p>
                                                                          <address style="font-style: normal;font-family: 'Roboto', sans-serif;">
                                                                              Silver Suites Office 250 Greenwich Street, New York, NY 10007
                                                                          </address>
                                                                      </td>
                                                                  </tr>
                                                              </table>
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td style="padding: 30px 0;">
                                                              <table width="100%" cellpadding="0" cellspacing="0">
                                                                  <thead>
                                                                      <tr>
                                                                          <th
                                                                             style="background-color: #dbf1dc80; color: #033603; font-weight: 500; font-size: 18px; vertical-align: middle; padding: 12px 15px; text-align: left;font-family: 'Roboto', sans-serif;">
                                                                              Products</th>
                                                                          <th
                                                                             style="background-color: #dbf1dc80; color: #033603; font-weight: 500; font-size: 18px; vertical-align: middle; padding: 12px 15px; text-align: center;font-family: 'Roboto', sans-serif;">
                                                                              Qty.</th>
                                                                          <th
                                                                             style="background-color: #dbf1dc80; color: #033603; font-weight: 500; font-size: 18px; vertical-align: middle; padding: 12px 15px; text-align: center;font-family: 'Roboto', sans-serif;">
                                                                              Subtotal</th>
                                                                      </tr>
                                                                  </thead>
                                                                  <tbody>
                                                                      <tr>
                                                                          <td
                                                                             style="text-align: left; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle; max-width: 280px;">
                                                                              <span style="display: inline-block; vertical-align: middle;">
                                                                                  <img
                                                                                     style="width: 100px; height: 100px; object-fit: contain; object-position: center; margin-right: 15px;"
                                                                                     src="${process.env.BACKEND_URL}upload/mail/images-1.png" alt="" />
                                                                              </span>
                                                                              <p style="display: inline-block; vertical-align: middle;">
                                                                                  <span
                                                                                     style="text-align: left; display: block; font-weight: 500; font-size: 16px;font-family: 'Roboto', sans-serif;">Butterfly
                                                                                      Diamond Ring</span>
                                                                                  <mark
                                                                                     style="padding: 0; background-color: transparent; font-weight: 400; display: block; text-align: left;font-family: 'Roboto', sans-serif;">1/2
                                                                                      Ct., SI Diamond</mark>
                                                                                  <mark
                                                                                     style="padding: 0; background-color: transparent; font-weight: 400; display: block; text-align: left;font-family: 'Roboto', sans-serif;">14K,
                                                                                      White Gold</mark>
                                                                              </p>
                                                                          </td>
                                                                          <td
                                                                             style="text-align: center; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle;font-family: 'Roboto', sans-serif;">
                                                                              1</td>
                                                                          <td
                                                                             style="text-align: center; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle;font-family: 'Roboto', sans-serif;">
                                                                              $500.00</td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td
                                                                             style="text-align: left; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle; max-width: 280px;">
                                                                              <span style="display: inline-block; vertical-align: middle;">
                                                                                  <img
                                                                                     style="width: 100px; height: 100px; object-fit: contain; object-position: center; margin-right: 15px;"
                                                                                     src="${process.env.BACKEND_URL}upload/mail/images-1.png" alt="" />
                                                                              </span>
                                                                              <p style="display: inline-block; vertical-align: middle;">
                                                                                  <span
                                                                                     style="text-align: left; display: block; font-weight: 500; font-size: 16px;font-family: 'Roboto', sans-serif;">Butterfly
                                                                                      Diamond Ring</span>
                                                                                  <mark
                                                                                     style="padding: 0; background-color: transparent; font-weight: 400; display: block; text-align: left;font-family: 'Roboto', sans-serif;">1/2
                                                                                      Ct., SI Diamond</mark>
                                                                                  <mark
                                                                                     style="padding: 0; background-color: transparent; font-weight: 400; display: block; text-align: left;font-family: 'Roboto', sans-serif;">14K,
                                                                                      White Gold</mark>
                                                                              </p>
                                                                          </td>
                                                                          <td
                                                                             style="text-align: center; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle;font-family: 'Roboto', sans-serif;">
                                                                              1</td>
                                                                          <td
                                                                             style="text-align: center; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle;font-family: 'Roboto', sans-serif;">
                                                                              $500.00</td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td
                                                                             style="text-align: left; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle; max-width: 280px;">
                                                                              <span style="display: inline-block; vertical-align: middle;">
                                                                                  <img
                                                                                     style="width: 100px; height: 100px; object-fit: contain; object-position: center; margin-right: 15px;"
                                                                                     src="${process.env.BACKEND_URL}upload/mail/images-1.png" alt="" />
                                                                              </span>
                                                                              <p style="display: inline-block; vertical-align: middle;">
                                                                                  <span
                                                                                     style="text-align: left; display: block; font-weight: 500; font-size: 16px;font-family: 'Roboto', sans-serif;">Butterfly
                                                                                      Diamond Ring</span>
                                                                                  <mark
                                                                                     style="padding: 0; background-color: transparent; font-weight: 400; display: block; text-align: left;font-family: 'Roboto', sans-serif;">1/2
                                                                                      Ct., SI Diamond</mark>
                                                                                  <mark
                                                                                     style="padding: 0; background-color: transparent; font-weight: 400; display: block; text-align: left;font-family: 'Roboto', sans-serif;">14K,
                                                                                      White Gold</mark>
                                                                              </p>
                                                                          </td>
                                                                          <td
                                                                             style="text-align: center; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle;font-family: 'Roboto', sans-serif;">
                                                                              1</td>
                                                                          <td
                                                                             style="text-align: center; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle;font-family: 'Roboto', sans-serif;">
                                                                              $500.00</td>
                                                                      </tr>
                                                                  </tbody>
                                                                  <tfoot>
                                                                      <tr>
                                                                          <td colspan="2"
                                                                             style="text-align: left; padding: 10px 15px; font-weight: 400; font-size: 16px; vertical-align: middle;">
                                                                              Subtotal :
                                                                          </td>
                                                                          <td align="right"
                                                                             style="text-align: right; padding: 10px 15px; font-weight: 400; font-size: 16px; vertical-align: middle;">
                                                                              &#36;2000.00
                                                                          </td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td colspan="2"
                                                                             style="text-align: left; padding: 10px 15px; font-weight: 400; font-size: 16px; vertical-align: middle;">
                                                                              Shipping :
                                                                          </td>
                                                                          <td align="right"
                                                                             style="text-align: right; padding: 10px 15px; font-weight: 400; font-size: 16px; vertical-align: middle;">
                                                                              &#36;20.00
                                                                          </td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td colspan="2"
                                                                             style="text-align: left; padding: 10px 15px; font-weight: 400; font-size: 16px; vertical-align: middle;">
                                                                              Estimated Tax :
                                                                          </td>
                                                                          <td align="right"
                                                                             style="text-align: right; padding: 10px 15px; font-weight: 500; font-size: 16px; vertical-align: middle;">
                                                                              &#36;0.55
                                                                          </td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td colspan="2"
                                                                             style="text-align: left; padding: 10px 15px; font-size: 18px; font-weight: 400; vertical-align: middle; border-bottom: 1px solid rgba(0, 0, 0, 0.2); color: #033603;">
                                                                              <b>Total :</b>
                                                                          </td>
                                                                          <td align="right"
                                                                             style="text-align: right; padding: 10px 15px; font-size: 18px; font-weight: 400; vertical-align: middle; border-bottom: 1px solid rgba(0, 0, 0, 0.2); color: #033603;">
                                                                              <b>&#36;2000.00</b>
                                                                          </td>
                                                                      </tr>
                                                                  </tfoot>
                                                              </table>
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td style="color: #033603; font-size: 18px; font-weight: 500; text-transform: uppercase;">
                                                              Payment Method :
                                                              <p>
                                                                  <img src="${process.env.BACKEND_URL}upload/mail/visa-icon.png" alt="" />
                                                                  <span
                                                                     style="color: #000; margin-left: 10px; font-size: 14px; vertical-align: super; display: inline-block;">****
                                                                      **** ****</span>
                                                              </p>
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td>
                                                              <div class="footer-bg-img" style="
                                                                          position: relative;
                                                                          margin-top: 40px;
                                                                          background: url(${process.env.BACKEND_URL}upload/mail/footer_bg_kukadia.png);
                                                                          background-repeat: no-repeat;
                                                                          background-position: center;
                                                                          background-size: cover;
                                                                          padding: 20px 0 1px 0;
                                                                          vertical-align: middle;
                                                                          text-align: center;
                                                                          font-family: 'Roboto', sans-serif;
                                                                      ">
                                                                  <div class="footer-content">
                                                                      <span style="display: block; text-align: center; margin: 0 0 15px 0;">
                                                                          <img src="${process.env.BACKEND_URL}upload/mail/kukadia-ventures.png"
                                                                             alt="striliant-logo"
                                                                             style="border-right: 1px solid #182342; padding: 0 10px; padding-right: 20px;" />
                                                                          <img style="margin-left: 20px;"
                                                                             src="${process.env.BACKEND_URL}upload/mail/kukadia-corporation..png"
                                                                             alt="striliant-logo" />
                                                                      </span>
                                                                      <div class="social-icon">
                                                                          <h3
                                                                             style="text-transform: uppercase; font-weight: 600; font-size: 14px; line-height: 27px; margin: 0; color: #000;">
                                                                              Follow US</h3>
                                                                          <ul class="list-unstyled-css" style="list-style: none; padding: 0;">
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                                  <a href="https://www.facebook.com/kukadia.co/"><img
                                                                                         src="${process.env.BACKEND_URL}upload/mail/facebook.png" /></a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                                  <a href="https://www.instagram.com/kukadia.co/"><img
                                                                                         src="${process.env.BACKEND_URL}upload/mail/instagram-sketched.png" /></a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                                  <a href="#"><img
                                                                                         src="${process.env.BACKEND_URL}upload/mail/twitter.png" /></a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                                  <a href="#"><img
                                                                                         src="${process.env.BACKEND_URL}upload/mail/youtube.png" /></a>
                                                                              </li>
                                                                          </ul>
                                                                      </div>
                                  
                                                                      <div class="footer-link-blog">
                                                                          <ul style="list-style: none; padding: 0;">
                                                                              <li class="active"
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="#"
                                                                                     style="color: #033603; text-decoration: underline; font-family: 'Roboto', sans-serif;">Unsubscribe</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="${process.env.FRONTEND_URL}policy"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Privacy
                                                                                      policy</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="${process.env.FRONTEND_URL}terms-and-condition"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Terms
                                                                                      of Service</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                                  <a href="${process.env.FRONTEND_URL}contact-us"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Visit
                                                                                      Us</a>
                                                                              </li>
                                                                          </ul>
                                                                      </div>
                                                                      <div class="footer-desc">
                                                                          <ul style="list-style: none; padding: 0;">
                                                                              <li class="active"
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="#"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Surat</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="#"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Mumbai</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="#"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">New
                                                                                      York</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="#"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Toronto</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                                  <a href="#"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Montreal</a>
                                                                              </li>
                                                                          </ul>
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td style="background-color: #033603; color: #fff; text-align: center;">
                                                              <h4 style="font-weight: normal; margin: 10px 0; font-size: 14px;">&#169; 2021 Kukadia
                                                                  Ventures Pvt. Ltd. All Rights Reserved.</h4>
                                                          </td>
                                                      </tr>
                                                  </table>
                                              </td>
                                          </tr>
                                      </table>
                                  </body>
                                  
                                  </html>`;
                                  /*
                                var html = `<h1>Place Order For Kukadia</h1>You are now a order for Diamond <br>Order #: ${results3[0].order_number} <br>Total Price: $${results3[0].total_price} <br>item: ${results3[0].item} <br>`;*/
                                  var subject =
                                    "Thanks For Your Order From Kukadia.co";
                                  var check = helper.email_helper(
                                    "",
                                    email,
                                    subject,
                                    plc_odr_html
                                  );

                                  var admin_html = `<!DOCTYPE html>
                                  <html lang="en" xmlns="http://www.w3.org/1999/xhtml">
                                  
                                  <head>
                                      <title>Kukadia</title>
                                      <style>
                                          @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");
                                      </style>
                                  </head>
                                  
                                  <body style="margin: 0; padding: 0; background: #fff; font-family: 'Roboto', sans-serif; font-weight: 400;">
                                      <table width="100%" cellpadding="0" cellspacing="0">
                                          <tr>
                                              <td>
                                                  <table width="560px" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                                                      <tr>
                                                          <td style="background: #dbf1dc; height: auto; padding: 0 0;" align="center">
                                                              <p
                                                                 style="color: #033603; font-size: 16px; font-family: 'Roboto', sans-serif; line-height: 16px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.065em;">
                                                                  Real is rare. rare Lasts Forever.</p>
                                                          </td>
                                                      </tr>
                                                      <tr>
                                                          <td style="text-align: center; padding: 25px 0;">
                                                              <img src="${process.env.BACKEND_URL}upload/mail/kukadia-logo.png" alt="kukadia-logo" />
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td>
                                                              <h1
                                                                 style="font-weight: 600; text-align: center; font-size: 30px; line-height: 50px; letter-spacing: 0.0066em; text-transform: capitalize; color: #033603; margin-top: 0;">
                                                                  Thanks For Your Order</h1>
                                                              <p
                                                                 style="width: 535px; text-align: center; margin: 0 auto; font-weight: 400; color: #000000; font-size: 18px; line-height: 24px; font-family: 'Roboto', sans-serif;">
                                                                  We have received your order request. We know you can't wait to get your hands on it. At
                                                                  Kukadia, our team is working hard while ensuring the highest safety standards in these
                                                                  tough times. We make sure to deliver your product best within the given date. Thanks for
                                                                  your support! </p>
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td style="text-align: center;">
                                                              <span
                                                                 style="display: inline-block; border-bottom: 1px solid #000000; padding: 0 0 5px 0; margin: 30px 0;">
                                                                  <a href="${process.env.FRONTEND_URL}orders" style="
                                                                              background: #033603;
                                                                              color: #fff !important;
                                                                              font-weight: 400;
                                                                              text-transform: uppercase;
                                                                              font-size: 16px;
                                                                              letter-spacing: 0.0066em;
                                                                              padding: 10px 35px 10px 35px;
                                                                              text-align: center;
                                                                              text-decoration: none;
                                                                              display: inline-block;
                                                                              margin: 0 auto;
                                                                          ">
                                                                      <span style="font-family: 'Roboto', sans-serif;">VIEW ORDER <img
                                                                             src="${process.env.BACKEND_URL}upload/mail/back-arrow.png" alt="right-arrow"
                                                                             style="margin-left: 10px; vertical-align: middle;" /></span>
                                                                  </a>
                                                              </span>
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td style="background: #dbf1dc80; border: 1px solid rgba(24, 35, 66, 0.2); padding: 15px;">
                                                              <table width="100%" cellpadding="0" cellspacing="0">
                                                                  <tr>
                                                                      <td
                                                                         style="width: 50%; display: inline-block; border-right: 1px solid rgba(24, 35, 66, 0.3); vertical-align: top;">
                                                                          <p
                                                                             style="letter-spacing: 0.0066em; text-transform: uppercase; color: #033603; margin-top: 0; font-weight: 600;">
                                                                              Summary :</p>
                                                                          <ul style="padding: 0; margin: 0;">
                                                                              <li
                                                                                 style="list-style: none; margin: 5px 0;font-family: 'Roboto', sans-serif;">
                                                                                  Order # : <span
                                                                                     style="font-family: 'Roboto', sans-serif;">12345879</span></li>
                                                                              <li
                                                                                 style="list-style: none; margin: 5px 0;font-family: 'Roboto', sans-serif;">
                                                                                  Order Date : <span style="font-family: 'Roboto', sans-serif;">12 Jan,
                                                                                      2021</span></li>
                                                                              <li
                                                                                 style="list-style: none; margin: 5px 0;font-family: 'Roboto', sans-serif;">
                                                                                  Order Total : <span
                                                                                     style="font-family: 'Roboto', sans-serif;">$2000.00</span></li>
                                                                          </ul>
                                                                      </td>
                                                                      <td
                                                                         style="width: 40%; display: inline-block; padding-left: 40px; vertical-align: top;">
                                                                          <p
                                                                             style="letter-spacing: 0.0066em; text-transform: uppercase; color: #033603; margin-top: 0; font-weight: 600;font-family: 'Roboto', sans-serif;">
                                                                              Shipping Address :</p>
                                                                          <address style="font-style: normal;font-family: 'Roboto', sans-serif;">
                                                                              Silver Suites Office 250 Greenwich Street, New York, NY 10007
                                                                          </address>
                                                                      </td>
                                                                  </tr>
                                                              </table>
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td style="padding: 30px 0;">
                                                              <table width="100%" cellpadding="0" cellspacing="0">
                                                                  <thead>
                                                                      <tr>
                                                                          <th
                                                                             style="background-color: #dbf1dc80; color: #033603; font-weight: 500; font-size: 18px; vertical-align: middle; padding: 12px 15px; text-align: left;font-family: 'Roboto', sans-serif;">
                                                                              Products</th>
                                                                          <th
                                                                             style="background-color: #dbf1dc80; color: #033603; font-weight: 500; font-size: 18px; vertical-align: middle; padding: 12px 15px; text-align: center;font-family: 'Roboto', sans-serif;">
                                                                              Qty.</th>
                                                                          <th
                                                                             style="background-color: #dbf1dc80; color: #033603; font-weight: 500; font-size: 18px; vertical-align: middle; padding: 12px 15px; text-align: center;font-family: 'Roboto', sans-serif;">
                                                                              Subtotal</th>
                                                                      </tr>
                                                                  </thead>
                                                                  <tbody>
                                                                      <tr>
                                                                          <td
                                                                             style="text-align: left; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle; max-width: 280px;">
                                                                              <span style="display: inline-block; vertical-align: middle;">
                                                                                  <img
                                                                                     style="width: 100px; height: 100px; object-fit: contain; object-position: center; margin-right: 15px;"
                                                                                     src="${process.env.BACKEND_URL}upload/mail/images-1.png" alt="" />
                                                                              </span>
                                                                              <p style="display: inline-block; vertical-align: middle;">
                                                                                  <span
                                                                                     style="text-align: left; display: block; font-weight: 500; font-size: 16px;font-family: 'Roboto', sans-serif;">Butterfly
                                                                                      Diamond Ring</span>
                                                                                  <mark
                                                                                     style="padding: 0; background-color: transparent; font-weight: 400; display: block; text-align: left;font-family: 'Roboto', sans-serif;">1/2
                                                                                      Ct., SI Diamond</mark>
                                                                                  <mark
                                                                                     style="padding: 0; background-color: transparent; font-weight: 400; display: block; text-align: left;font-family: 'Roboto', sans-serif;">14K,
                                                                                      White Gold</mark>
                                                                              </p>
                                                                          </td>
                                                                          <td
                                                                             style="text-align: center; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle;font-family: 'Roboto', sans-serif;">
                                                                              1</td>
                                                                          <td
                                                                             style="text-align: center; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle;font-family: 'Roboto', sans-serif;">
                                                                              $500.00</td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td
                                                                             style="text-align: left; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle; max-width: 280px;">
                                                                              <span style="display: inline-block; vertical-align: middle;">
                                                                                  <img
                                                                                     style="width: 100px; height: 100px; object-fit: contain; object-position: center; margin-right: 15px;"
                                                                                     src="${process.env.BACKEND_URL}upload/mail/images-1.png" alt="" />
                                                                              </span>
                                                                              <p style="display: inline-block; vertical-align: middle;">
                                                                                  <span
                                                                                     style="text-align: left; display: block; font-weight: 500; font-size: 16px;font-family: 'Roboto', sans-serif;">Butterfly
                                                                                      Diamond Ring</span>
                                                                                  <mark
                                                                                     style="padding: 0; background-color: transparent; font-weight: 400; display: block; text-align: left;font-family: 'Roboto', sans-serif;">1/2
                                                                                      Ct., SI Diamond</mark>
                                                                                  <mark
                                                                                     style="padding: 0; background-color: transparent; font-weight: 400; display: block; text-align: left;font-family: 'Roboto', sans-serif;">14K,
                                                                                      White Gold</mark>
                                                                              </p>
                                                                          </td>
                                                                          <td
                                                                             style="text-align: center; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle;font-family: 'Roboto', sans-serif;">
                                                                              1</td>
                                                                          <td
                                                                             style="text-align: center; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle;font-family: 'Roboto', sans-serif;">
                                                                              $500.00</td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td
                                                                             style="text-align: left; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle; max-width: 280px;">
                                                                              <span style="display: inline-block; vertical-align: middle;">
                                                                                  <img
                                                                                     style="width: 100px; height: 100px; object-fit: contain; object-position: center; margin-right: 15px;"
                                                                                     src="${process.env.BACKEND_URL}upload/mail/images-1.png" alt="" />
                                                                              </span>
                                                                              <p style="display: inline-block; vertical-align: middle;">
                                                                                  <span
                                                                                     style="text-align: left; display: block; font-weight: 500; font-size: 16px;font-family: 'Roboto', sans-serif;">Butterfly
                                                                                      Diamond Ring</span>
                                                                                  <mark
                                                                                     style="padding: 0; background-color: transparent; font-weight: 400; display: block; text-align: left;font-family: 'Roboto', sans-serif;">1/2
                                                                                      Ct., SI Diamond</mark>
                                                                                  <mark
                                                                                     style="padding: 0; background-color: transparent; font-weight: 400; display: block; text-align: left;font-family: 'Roboto', sans-serif;">14K,
                                                                                      White Gold</mark>
                                                                              </p>
                                                                          </td>
                                                                          <td
                                                                             style="text-align: center; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle;font-family: 'Roboto', sans-serif;">
                                                                              1</td>
                                                                          <td
                                                                             style="text-align: center; padding: 15px 15px; font-weight: 500; font-size: 14px; border-bottom: 1px solid rgba(0, 0, 0, 0.2); vertical-align: middle;font-family: 'Roboto', sans-serif;">
                                                                              $500.00</td>
                                                                      </tr>
                                                                  </tbody>
                                                                  <tfoot>
                                                                      <tr>
                                                                          <td colspan="2"
                                                                             style="text-align: left; padding: 10px 15px; font-weight: 400; font-size: 16px; vertical-align: middle;">
                                                                              Subtotal :
                                                                          </td>
                                                                          <td align="right"
                                                                             style="text-align: right; padding: 10px 15px; font-weight: 400; font-size: 16px; vertical-align: middle;">
                                                                              &#36;2000.00
                                                                          </td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td colspan="2"
                                                                             style="text-align: left; padding: 10px 15px; font-weight: 400; font-size: 16px; vertical-align: middle;">
                                                                              Shipping :
                                                                          </td>
                                                                          <td align="right"
                                                                             style="text-align: right; padding: 10px 15px; font-weight: 400; font-size: 16px; vertical-align: middle;">
                                                                              &#36;20.00
                                                                          </td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td colspan="2"
                                                                             style="text-align: left; padding: 10px 15px; font-weight: 400; font-size: 16px; vertical-align: middle;">
                                                                              Estimated Tax :
                                                                          </td>
                                                                          <td align="right"
                                                                             style="text-align: right; padding: 10px 15px; font-weight: 500; font-size: 16px; vertical-align: middle;">
                                                                              &#36;0.55
                                                                          </td>
                                                                      </tr>
                                                                      <tr>
                                                                          <td colspan="2"
                                                                             style="text-align: left; padding: 10px 15px; font-size: 18px; font-weight: 400; vertical-align: middle; border-bottom: 1px solid rgba(0, 0, 0, 0.2); color: #033603;">
                                                                              <b>Total :</b>
                                                                          </td>
                                                                          <td align="right"
                                                                             style="text-align: right; padding: 10px 15px; font-size: 18px; font-weight: 400; vertical-align: middle; border-bottom: 1px solid rgba(0, 0, 0, 0.2); color: #033603;">
                                                                              <b>&#36;2000.00</b>
                                                                          </td>
                                                                      </tr>
                                                                  </tfoot>
                                                              </table>
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td style="color: #033603; font-size: 18px; font-weight: 500; text-transform: uppercase;">
                                                              Payment Method :
                                                              <p>
                                                                  <img src="${process.env.BACKEND_URL}upload/mail/visa-icon.png" alt="" />
                                                                  <span
                                                                     style="color: #000; margin-left: 10px; font-size: 14px; vertical-align: super; display: inline-block;">****
                                                                      **** ****</span>
                                                              </p>
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td>
                                                              <div class="footer-bg-img" style="
                                                                          position: relative;
                                                                          margin-top: 40px;
                                                                          background: url(${process.env.BACKEND_URL}upload/mail/footer_bg_kukadia.png);
                                                                          background-repeat: no-repeat;
                                                                          background-position: center;
                                                                          background-size: cover;
                                                                          padding: 20px 0 1px 0;
                                                                          vertical-align: middle;
                                                                          text-align: center;
                                                                          font-family: 'Roboto', sans-serif;
                                                                      ">
                                                                  <div class="footer-content">
                                                                      <span style="display: block; text-align: center; margin: 0 0 15px 0;">
                                                                          <img src="${process.env.BACKEND_URL}upload/mail/kukadia-ventures.png"
                                                                             alt="striliant-logo"
                                                                             style="border-right: 1px solid #182342; padding: 0 10px; padding-right: 20px;" />
                                                                          <img style="margin-left: 20px;"
                                                                             src="${process.env.BACKEND_URL}upload/mail/kukadia-corporation..png"
                                                                             alt="striliant-logo" />
                                                                      </span>
                                                                      <div class="social-icon">
                                                                          <h3
                                                                             style="text-transform: uppercase; font-weight: 600; font-size: 14px; line-height: 27px; margin: 0; color: #000;">
                                                                              Follow US</h3>
                                                                          <ul class="list-unstyled-css" style="list-style: none; padding: 0;">
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                                  <a href="https://www.facebook.com/kukadia.co/"><img
                                                                                         src="${process.env.BACKEND_URL}upload/mail/facebook.png" /></a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                                  <a href="https://www.instagram.com/kukadia.co/"><img
                                                                                         src="${process.env.BACKEND_URL}upload/mail/instagram-sketched.png" /></a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                                  <a href="#"><img
                                                                                         src="${process.env.BACKEND_URL}upload/mail/twitter.png" /></a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; padding: 0 10px;">
                                                                                  <a href="#"><img
                                                                                         src="${process.env.BACKEND_URL}upload/mail/youtube.png" /></a>
                                                                              </li>
                                                                          </ul>
                                                                      </div>
                                  
                                                                      <div class="footer-link-blog">
                                                                          <ul style="list-style: none; padding: 0;">
                                                                              <li class="active"
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="#"
                                                                                     style="color: #033603; text-decoration: underline; font-family: 'Roboto', sans-serif;">Unsubscribe</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="${process.env.FRONTEND_URL}policy"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Privacy
                                                                                      policy</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="${process.env.FRONTEND_URL}terms-and-condition"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Terms
                                                                                      of Service</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                                  <a href="${process.env.FRONTEND_URL}contact-us"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Visit
                                                                                      Us</a>
                                                                              </li>
                                                                          </ul>
                                                                      </div>
                                                                      <div class="footer-desc">
                                                                          <ul style="list-style: none; padding: 0;">
                                                                              <li class="active"
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="#"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Surat</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="#"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Mumbai</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="#"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">New
                                                                                      York</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: 1px solid #000; padding: 0 10px;">
                                                                                  <a href="#"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Toronto</a>
                                                                              </li>
                                                                              <li
                                                                                 style="display: inline-block; vertical-align: -webkit-baseline-middle; border-right: none; padding: 0 10px;">
                                                                                  <a href="#"
                                                                                     style="color: #000; text-decoration: underline; font-family: 'Roboto', sans-serif;">Montreal</a>
                                                                              </li>
                                                                          </ul>
                                                                      </div>
                                                                  </div>
                                                              </div>
                                                          </td>
                                                      </tr>
                                  
                                                      <tr>
                                                          <td style="background-color: #033603; color: #fff; text-align: center;">
                                                              <h4 style="font-weight: normal; margin: 10px 0; font-size: 14px;">&#169; 2021 Kukadia
                                                                  Ventures Pvt. Ltd. All Rights Reserved.</h4>
                                                          </td>
                                                      </tr>
                                                  </table>
                                              </td>
                                          </tr>
                                      </table>
                                  </body>
                                  
                                  </html>`;
                                  var admin_subject = `User Order On Kukadia.co`;
                                  var admin_check = helper.email_helper(
                                    "",
                                    ADMINEMAIL,
                                    admin_subject,
                                    admin_html
                                  );

                                  if (check && admin_check) {
                                    res.json({
                                      status: 200,
                                      success: true,
                                      message: "Order Creating Successfully",
                                    });
                                  } else {
                                    res.json({
                                      status: 400,
                                      success: false,
                                      message:
                                        "Order Creating Successfully, Email Invoice Failed  ",
                                    });
                                  }
                                }
                              });
                            } else {
                              res.json({
                                status: 400,
                                success: false,
                                message: "Order Creating Failed",
                              });
                            }
                          }
                        });
                      }
                    } else {
                      res.json({
                        status: 400,
                        success: false,
                        message: "Order Creating Failed",
                      });
                    }
                  }
                });
              }
            });
          }
          /*let data = {
            userId:userId,
            item:results[0].diamondList,
            pieces:pieces,
            cts:cts,
            avg_disc:avg_disc,
            total_cr:total_cr,
            total_price:total_price,
            status:1,
          }
          let sql1 = "INSERT INTO orders SET ?";
          console.log('plcodrdata:::'+ JSON.stringify(data))       //log
          conn.query(sql1, data, (err, results1) => {
            if (err) {
              res.json({status: 400, success: false, message: err});
            } else {
              if (results1.affectedRows === 1) {
                var order_id = results1.insertId
                let sql3 = "SELECT *,CONCAT(REPEAT('0', 7-LENGTH(order_id)), order_id) AS order_number FROM `orders` WHERE order_id = ?";
                console.log('plcodrorder_id:::'+ JSON.stringify(order_id))        //log
                conn.query(sql3, [order_id], (err, results3) => {
                  if (err) {
                    res.json({status: 501, success: false, message: err});
                  } else {
                    if (results3.length > 0) {
                      let sql2 = "DELETE FROM `cart` WHERE userId = ?";
                      console.log('userid:::' + userId)    //log
                      conn.query(sql2, [userId], function (err, results2) {
                        if (err) {
                          res.json({status: 400, success: false, message: err});
                        } else {
                          var html = "";
                          html += `<h1>Place Order For Kukadia</h1>`;
                          html += `You are now a order for Diamond <br>`;
                          html += `Order #: ${results3[0].order_number} <br>`;
                          html += `Total Price: $${results3[0].total_price} <br>`;
                          html += `item: ${results3[0].item} <br>`;
                          var subject = "Place Order"
                          var check  = helper.email_helper('',email,subject,html)
                          if (check) {
                            res.json({status: 200, success: true, message: 'Order Creating Successfully'});
                          }else{
                            res.json({status: 400, success: false, message: 'Order Creating Successfully'});
                          }
                        }
                      });
                    }
                  }
                });
              } else {
                res.json({status: 400, success: false, message: 'Order Creating Failed'});
              }
            }
          });*/
        }
      });
    }
  }
);

router.post("/chatList", async (request, response) => {
  try {
    var site_url = request.protocol + "://" + request.get("host");
    var hostname = request.headers.host;
    var base_url = "http://" + hostname;
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
          message: "Something went wrong",
        });
      }
      if (results_chat.length > 0) {
        var all_chats = results_chat;
        var all_personal_chat_user_id = all_chats.reduce(function (
          filtered,
          option
        ) {
          if (option.display_id > 0) {
            filtered.push(option.display_id);
          }
          return filtered;
        },
        []);

        all_personal_chat_user_id = all_personal_chat_user_id.filter(function (
          el
        ) {
          return el != null;
        });

        var add_new_chat_object = 0;
        if (body.newuser != null && body.newuser != "") {
          add_new_chat_object = 1;
          if (all_personal_chat_user_id.includes(body.newuser)) {
            add_new_chat_object = 0;
          }
        }
        var all_data_object = {
          results_chat: results_chat,
          all_personal_chat_user_id: all_personal_chat_user_id,
          newuser: body.newuser,
          add_new_chat_object: add_new_chat_object,
        };
        //console.log(all_data_object);
        async.waterfall(
          [
            function (
              callback_new //personal chat users data
            ) {
              if (all_data_object.all_personal_chat_user_id.length > 0) {
                //console.log(all_data_object)
                var all_personal_chat_user_id_str = all_data_object.all_personal_chat_user_id.join();
                var sql_for_personal_chat_users =
                  "SELECT um.adminId as user_id_o,um.is_online,um.firstname,um.lastname,um.type,um.mobileno,um.about";
                sql_for_personal_chat_users +=
                  ",(SELECT count(mm.message_id) from message_master mm where mm.user_id = user_id_o AND recipient_id=" +
                  user_id +
                  " AND message_status!=3 ) as unread_message";
                sql_for_personal_chat_users +=
                  " FROM `admin` um WHERE um.adminId IN (" +
                  all_personal_chat_user_id_str +
                  ") GROUP BY um.adminId";
                conn.query(
                  sql_for_personal_chat_users,
                  async function (err, results_personal_chat_users) {
                    if (err) {
                      return response.send({
                        status: false,
                        message: "Something went wrong",
                      });
                    } else {
                      all_data_object.all_personal_chat_users = results_personal_chat_users;
                      callback_new(null, all_data_object);
                    }
                  }
                );
              } else {
                callback_new(null, all_data_object);
              }
            },
            function (all_data_object, callback_new) {
              var personal_chats = [];
              if (all_data_object.results_chat.length > 0) {
                var all_chats = all_data_object.results_chat;
                var all_personal_chat_users =
                  all_data_object.all_personal_chat_users;
                var all_message_ids = all_chats.map(function (each_chats_new) {
                  return each_chats_new.message_id;
                });
                var all_message_ids_str = all_message_ids.join(",");
                var all_message_attachments_query = `select message_id,GROUP_CONCAT(mam_id,"###",file_name,"###",file_name_o) as attachments from message_attachments_master WHERE message_id IN (${all_message_ids_str}) GROUP BY message_id`;
                conn.query(
                  all_message_attachments_query,
                  async function (err, all_message_attachments) {
                    if (err) {
                      return response.send({
                        status: false,
                        message: "Something went wrong",
                      });
                    }

                    async.forEach(
                      all_chats,
                      function (element, callback) {
                        var new_obj = {};
                        new_obj.message_id = element.message_id;
                        new_obj.attachments = [];
                        if (all_message_attachments.length > 0) {
                          var each_attachment = all_message_attachments.filter(
                            function (each_attach) {
                              return (
                                each_attach.message_id == element.message_id
                              );
                            }
                          );
                          var attach = [];
                          if (each_attachment.length > 0) {
                            var all_attachment_string = each_attachment[0].attachments.split(
                              ","
                            );
                            all_attachment_string.forEach(function (value, i) {
                              var att_object = value.split("###");
                              attach.push({
                                attach_id: att_object[0],
                                file_name: att_object[2],
                                file_url:
                                  base_url +
                                  "/upload/message-attachments/" +
                                  att_object[1],
                                type: get_file_type_from_name(
                                  path.extname(att_object[2])
                                ),
                              });
                            });
                          }
                        }
                        var display_data = all_personal_chat_users.filter(
                          function (each_users) {
                            return each_users.user_id_o == element.display_id;
                          }
                        );
                        display_data = display_data[0];
                        new_obj.display_name =
                          display_data.firstname + " " + display_data.lastname;
                        new_obj.user_data = display_data;
                        new_obj.attachments = attach;
                        var unread_message =
                          new_obj["user_data"]["unread_message"];
                        delete new_obj["user_data"]["unread_message"];
                        new_obj.message_content = element.message_content;
                        new_obj.message_status = 0;
                        if (element.user_id == user_id) {
                          new_obj.unread_message = 0;
                          new_obj.message_status = element.message_status;
                        } else {
                          new_obj.unread_message = parseInt(unread_message);
                        }
                        new_obj.last_message_send_by = element.user_id;
                        new_obj.conversation_id =
                          "personal_chat_" + element.display_id;
                        new_obj.time = moment(element.entry_date_time).format(
                          "DD-MM-YYYY"
                        );
                        if (
                          moment(element.entry_date_time).format(
                            "YYYY-MM-DD"
                          ) == moment().format("YYYY-MM-DD")
                        ) {
                          new_obj.time = moment(
                            formatDate(element.entry_date_time)
                          ).format("HH:mm A");
                        }
                        new_obj.recipient_id = element.display_id;
                        personal_chats.push(new_obj);
                        callback();
                      },
                      function (err) {
                        all_data_object.personal_chats = multiSort(
                          personal_chats,
                          {
                            entry_date_time: "desc",
                          }
                        );
                        callback_new(null, all_data_object);
                      }
                    );
                  }
                );
              } else {
                callback_new(null, all_data_object);
              }
            },
            function (
              all_data_object,
              callback_new //main function to create response object
            ) {
              if (
                all_data_object.add_new_chat_object == 1 &&
                all_data_object.newuser != ""
              ) {
                let a = conn.query(
                  'SELECT um.adminId as user_id_o,um.is_online,um.firstname,um.lastname FROM `admin` um WHERE um.adminId="' +
                    all_data_object.newuser +
                    '"',
                  async function (err, new_user_data) {
                    if (err) {
                      return response.send({
                        status: false,
                        message: "Something went wrong",
                      });
                    }
                    if (new_user_data.length > 0) {
                      var user_data_new = new_user_data[0];
                      all_data_object.personal_chats.unshift({
                        user_data: user_data_new,
                        message_id: "",
                        message_content: "",
                        message_status: "",
                        unread_message: 0,
                        last_message_send_by: "",
                        conversation_id:
                          "personal_chat_" + all_data_object.newuser,
                        time: "",
                        recipient_id: all_data_object.newuser,
                      });
                      callback_new(null, all_data_object);
                    } else {
                      callback_new(null, all_data_object);
                    }
                  }
                );
              } else {
                callback_new(null, all_data_object);
              }
            },
            function (
              all_data_object,
              callback_new //send response
            ) {
              var personal_chats = all_data_object.personal_chats;
              return response.send({
                status: true,
                message: "Chat listed successfully.",
                chat_data: { personal_chats: personal_chats, unread_count: 0 },
              });
            },
          ],
          function (err, caption) {
            return response.send({
              status: false,
              message: "Something went wrong",
            });
          }
        );
      } else {
        return response.send({
          status: true,
          message: "Chat listed successfully.",
          chat_data: { personal_chats: [] },
        });
      }
    });
  } catch (error) {
    return response.send({
      status: false,
      message: "Something went wrong",
    });
  }
});

router.post("/loadConversation", async (request, response) => {
  var message_load_limit = 5;
  try {
    var site_url = request.protocol + "://" + request.get("host");
    var body = request.body;
    var hostname = request.headers.host;
    var base_url = "http://" + hostname;

    var errors = [];

    if (!body.conversation_id) {
      errors.push(["conversation id is required"]);
    }

    if (!body.user_id) {
      errors.push(["user id is required"]);
    }

    if (!body.page_no) {
      errors.push(["page no is required"]);
    }

    if (errors && errors.length > 0) {
      var message = errors.join(" , ");
      return response.send({
        status: false,
        message: message,
      });
    }

    var user_id = body.user_id;
    var login_user_socket = body.user_socket_id;
    var recipient_id = body.conversation_id.replace("personal_chat_", "");

    var where = ` WHERE ((mm.user_id="${user_id}" AND mm.recipient_id="${recipient_id}") OR (mm.user_id="${recipient_id}" AND mm.recipient_id="${user_id}"))`;

    let count_query = `SELECT count(mm.message_id) as count FROM message_master mm ${where} `;
    // console.log(count_query);

    let query_count = conn.query(
      count_query,
      async function (err, results_count_users) {
        if (err) {
          return response.send({
            status: false,
            message: "Something went wrong",
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
          var page = page_no == 0 ? 1 : page_no;
          var numPages;
          var skip = (page - 1) * numPerPage;
          var limit_str = "LIMIT " + skip + "," + numPerPage;

          let message_list_query = `SELECT mm.*,GROUP_CONCAT(mam.mam_id,"###",mam.file_name,"###",mam.file_name_o) as attachments FROM message_master mm LEFT JOIN message_attachments_master mam on mam.message_id = mm.message_id ${where} GROUP BY mm.message_id ORDER By mm.entry_date_time DESC ${limit_str}`;
          // console.log(message_list_query);
          let query = conn.query(
            message_list_query,
            async function (err, results_message_from_db) {
              if (err) {
                return response.send({
                  status: false,
                  message: "Something went wrong",
                });
              }

              var results_message = multiSort(results_message_from_db, {
                message_id: "ASC",
              });
              var conversation_id = "personal_chat_" + recipient_id;
              var mark_as_seen_message_id = [];
              var mark_as_seen_message = [];
              // console.log('here');
              async.forEach(
                results_message,
                function (value, callback) {
                  value["time"] = moment(
                    formatDate(value.entry_date_time)
                  ).format("HH:mm A");
                  value["conversation_id"] = conversation_id;
                  value["sender_user_id"] = value.user_id;
                  delete value["entry_date_time"];
                  delete value["reply_message_id"];
                  delete value["user_id"];

                  var attachments = [];

                  if (value.attachments != "" && value.attachments != null) {
                    var all_attachment_string = value.attachments.split(",");
                    all_attachment_string.forEach(function (value, i) {
                      var att_object = value.split("###");
                      attachments.push({
                        attach_id: att_object[0],
                        file_name: att_object[2],
                        file_url:
                          base_url +
                          "/upload/message-attachments/" +
                          att_object[1],
                        type: get_file_type_from_name(
                          path.extname(att_object[2])
                        ),
                      });
                    });
                  }
                  value["attachments"] = attachments;
                  //mark as seen
                  if (value.recipient_id == user_id) {
                    mark_as_seen_message_id.push(value.message_id);
                    mark_as_seen_message.push(value);
                  }
                  delete value["recipient_id"];
                  final_conversation_data.push(value);
                  callback();
                },
                function (err) {
                  if (mark_as_seen_message_id.length > 0) {
                    var upd_query = `UPDATE message_master SET message_status = 3 WHERE message_id IN (${mark_as_seen_message_id.join()})`;
                    var sql = conn.query(
                      upd_query,
                      async function (err, results_update) {
                        if (err) {
                          return response.send({
                            status: false,
                            message: "Something went wrong",
                          });
                        }
                      }
                    );
                  }
                  return response.send({
                    status: true,
                    message: "Message load Successfully.",
                    data: final_conversation_data,
                    is_load_more: is_load_more,
                  });
                }
              );
            }
          );
        } else {
          return response.send({
            status: true,
            message: "Message load Successfully.",
            data: [],
            is_load_more: 0,
          });
        }
      }
    );
  } catch (error) {
    return response.send({
      status: false,
      message: "Something went wrong",
    });
  }
});

router.post("/country_list", (request, response) => {
  try {
    // var body = request.body;

    var sql1 = "SELECT country_id, country_name FROM country_master;";
    conn.query(sql1, function (error, results) {
      if (error) {
        return response.send({
          status: 400,
          success: false,
          message: "Something went wrong!!",
        });
      } else {
        console.log(JSON.stringify(results));

        if (results && results.length > 0) {
          results.forEach((element) => {
            element.id = element.country_id;
            element.text = element.country_name;
          });

          let final_resp = {
            status: 200,
            success: true,
            data: results,
          };
          return response.send(final_resp);
        } else {
          return response.send({
            status: 400,
            success: false,
            data: [],
            message: "Country not found.",
          });
        }
      }
    });
  } catch (error) {
    return response.send({
      status: 400,
      success: false,
      message: "Something went wrong!",
    });
  }
});

router.post(
  "/state_list",
  [check("country_id").exists()],
  (request, response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      const err = errors
        .array()
        .map((err) => ({ field: err.param, message: err.msg }));
      response.json({ status: 401, success: false, message: err });
      return;
    } else {
      var body = request.body;
      var query =
        'Select state_name,state_id from state_master WHERE country_id="' +
        body.country_id +
        '" order by state_name ASC';

      conn.query(query, async function (error, results) {
        if (error) {
          return response.send({
            status: 400,
            success: false,
            message: "Something went wrong",
          });
        } else {
          if (results && results.length > 0) {
            results.forEach((element) => {
              element.id = element.state_id;
              element.text = element.state_name;
            });

            var final_resp = {
              status: 200,
              success: true,
              data: results,
            };
            return response.send(final_resp);
          } else {
            return response.send({
              status: 400,
              success: false,
              data: [],
              message: "States are not available for selected country.",
            });
          }
        }
      });
    }
  }
);

router.post("/city_list", [check("state_id").exists()], (request, response) => {
  const errors = validationResult(request);
  if (!errors.isEmpty()) {
    const err = errors
      .array()
      .map((err) => ({ field: err.param, message: err.msg }));
    response.json({ status: 401, success: false, message: err });
    return;
  } else {
    var body = request.body;
    var query =
      'SELECT * FROM city_master WHERE  state_id="' +
      body.state_id +
      '" order by population DESC';

    conn.query(query, async function (error, results) {
      if (error) {
        return response.send({
          status: 400,
          success: false,
          message: "Something went wrong",
        });
      } else {
        if (results && results.length > 0) {
          results.forEach((element) => {
            element.id = element.city_id;
            element.text = element.city_name;
          });

          var final_resp = {
            status: 200,
            success: true,
            data: results,
          };
          return response.send(final_resp);
        } else {
          return response.send({
            status: 400,
            success: false,
            data: [],
            message: "Cities are not available for selected state.",
          });
        }
      }
    });
  }
});

function addDays(date, days) {
  var d = date.getDate();
  date.setDate(date.getDate() + +days);
  return date;
}

function onlyDate(date) {
  if (date == "") {
    var d = new Date();
  } else {
    var d = new Date(date);
  }
  var month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  return [year, month, day].join("-");
}

function formatDate(date) {
  var date = date.toLocaleString("en-US", { timeZone: "America/New_York" });

  var d = new Date(date),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear(),
    hour = "" + d.getHours(),
    minute = "" + d.getMinutes(),
    second = "" + d.getSeconds();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  if (hour.length < 2) hour = "0" + hour;
  if (minute.length < 2) minute = "0" + minute;
  if (second.length < 2) second = "0" + second;
  return [year, month, day].join("-") + " " + [hour, minute, second].join(":");
}

function get_file_type_from_name(ext) {
  if ([".png", ".jpg", ".jpeg"].includes(ext.toLowerCase())) {
    return "PHOTO";
  } else if ([".mp4"].includes(ext.toLowerCase())) {
    return "VIDEO";
  } else {
    return "DOC";
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
    sortObject[key] =
      sortObject[key] === "desc" || sortObject[key] === -1
        ? -1
        : sortObject[key] === "skip" || sortObject[key] === 0
        ? 0
        : 1;
  }

  const keySort = (a, b, direction) => {
    direction = direction !== null ? direction : 1;

    if (a === b) {
      // If the values are the same, do not switch positions.
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

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = router;

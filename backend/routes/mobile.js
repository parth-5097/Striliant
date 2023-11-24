var express = require('express');
var passport = require('passport');
const jwt = require('jsonwebtoken');
var crypto = require('crypto');
var router = express.Router();
const moment = require('moment');
const { check, validationResult } = require('express-validator');
var EmailValidator = require("email-validator");
const conn = require('../db/connections');
const helper = require('../helper/helper');
var JWTSECRET = process.env.JWTSECRET;
var FRONTEND_URL = process.env.FRONTEND_URL;
var ADMINEMAIL = process.env.ADMINEMAIL;
var BACKEND_URL = process.env.BACKEND_URL;
var async = require('async');
const _ = require("underscore");
const request = require('request');
const paginate = require('jw-paginate');
const fs = require("fs");
const CircularJSON = require('circular-json');
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
        var pass = crypto.createHash('sha256').update(password, 'utf8').digest('hex')
        console.log(pass)
        var query1 = 'SELECT * FROM `admin` WHERE username = ? and password = ?';
        var query2 = 'SELECT * FROM users WHERE username = ? and password = ?;';

        conn.query(query1 + ';' + query2, [username, pass, username, pass], function (err, result) {
            if (err) {
                res.json({status: 501, success: false, message: err});
            } else {
                if(result[0].length > 0) {
                    var admin_data = result[0][0];
                    if (admin_data['isActive'] == 2) {
                        res.json({status: 201, success: false, message: 'Account is blocked.'});
                    } else if (admin_data['isActive'] == 0) {
                        res.json({status: 201, success: false, message: 'Account is not activated.'});
                    } else {
                        var jwtdata = {
                            adminId: admin_data.adminId,
                            username: admin_data.username,
                            firstname: admin_data.firstname,
                            lastname: admin_data.lastname,
                            email: admin_data.email
                        }
                        var token = jwt.sign({ jwtdata, IsAdminLogin: true }, JWTSECRET, { expiresIn: '10d' });
                        res.json({status: 200, success: true, message: 'Welcome', data: admin_data, token: token, IsAdminLogin: true});
                    }

                }else if(result[1].length > 0) {
                    var user_data = result[1][0];
                    if (user_data['isActive'] == 2) {
                        res.json({status: 201, success: false, message: 'Account is blocked.'});
                    } else if (user_data['isActive'] == 0) {
                        res.json({status: 201, success: false, message: 'Account is not active.'});
                    } else {
                        var jwtdata = {
                            userId: user_data.userId,
                            username: user_data.username,
                            firstname: user_data.firstname,
                            lastname: user_data.lastname,
                            email: user_data.email
                        }
                        var token = jwt.sign({ jwtdata, IsUserLogin: true }, JWTSECRET, { expiresIn: '10d' });
                        res.json({status: 200, success: true, message: 'Welcome', data: user_data, token: token, IsUserLogin: true});
                    }

                } else{
                    res.json({status: 201, success: false, message: 'Invalid credentials.'});
                }
            }
        })
    }
})

router.get('/logout', (req, res) => {
    try {
        return res.send({
            status: 200,
            success: true,
            data: {},
            message: "logged out successfully"
        });
    } catch (error) {
        // console.log(error);
        return res.send({
            status: 400,
            success: false,
            message: "Something went wrong"
        });
    }
});

router.post('/adminSearchDiamonds',[
    check('columns').exists(),
    check('start').exists(),
    check('order').exists(),
    check('length').exists(),
    check('diamond_type').exists()
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
        var { columns, order, start, length, diamond_type } = req.body;
        var objsearch=``;
        var objsearcharr = [];

        if(diamond_type != '' && diamond_type != undefined){
            objsearch += objsearcharr.length == 0 ? `WHERE diamond_type = ? `:` AND diamond_type = ? `
            objsearcharr.push(diamond_type);
        }

        objsearcharr=objsearcharr.concat(objsearcharr)

        let sql = `SELECT * FROM diamonds ${objsearch}ORDER BY ${ columns[order[0].column].data} ${order[0].dir} limit ${start},${length};SELECT count(*) as cnt FROM diamonds ${objsearch}`;

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


module.exports = router;

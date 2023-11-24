require("dotenv").config();
var createError = require("http-errors");
var compression = require("compression");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");
var passport = require("passport");
const moment = require("moment");
var bodyParser = require("body-parser");
var fileUpload = require("express-fileupload");
var indexRouter = require("./routes/index");
require("./routes/passport");
var usersRouter = require("./routes/users");
var adminRouter = require("./routes/admin");
var mobileRouter = require("./routes/mobile");
const conn = require("./db/connections");
let http = require("http");
var app = express();
app.use(compression());
app.use(fileUpload());
app.use(
  cors({
    origin: function (origin, callback) {
      return callback(null, true);
    },
    optionsSuccessStatus: 200,
    credentials: true,
  })
);
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(passport.initialize());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/upload", express.static("upload"));
app.use(cookieParser());

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);
app.use("/mobile", mobileRouter);
let users_socket = [];

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const https = require("https");
const fs = require("fs");

// const options = {
//   cert: fs.readFileSync('/etc/letsencrypt/live/kukadia.co/fullchain.pem'),
//   key: fs.readFileSync('/etc/letsencrypt/live/kukadia.co/privkey.pem')
// };
// var server = https.createServer(options, app).listen(3000);

var server = app.listen(3000, () => {
  console.log(`Server started on port: 3000`);
});

let socketIO = require("socket.io");
const async = require("async");
let io = socketIO(server);

io.on("connection", (socket) => {
  const socketID = socket.id;

  socket.on("connect_user", (data) => {
    console.log("connected");
    users_socket.push({ id: socketID, user_id: data.user_id });
    conn.query(
      'UPDATE users set socket_id = "' +
        socketID +
        '" ,is_online = "1"  WHERE userId = "' +
        data.user_id +
        '" ',
      function (err, rows) {
        let sql = `SELECT IF(user_id=${data.user_id},recipient_id,user_id) as new_id ,CONCAT("personal_chat_",IF(user_id=${data.user_id},recipient_id,user_id)) as conversation_id, IF(user_id=${data.user_id}, (SELECT socket_id FROM users  WHERE userId = new_id),(SELECT socket_id FROM users WHERE userId = new_id)) as sockets FROM message_master, (SELECT MAX(message_id) as lastid FROM message_master WHERE ( (message_master.recipient_id = ${data.user_id} OR message_master.user_id = ${data.user_id} ) ) GROUP BY CONCAT(LEAST(message_master.recipient_id,message_master.user_id),'.',GREATEST(message_master.recipient_id, message_master.user_id))) as conversations WHERE message_id = conversations.lastid`;
        conn.query(sql, function (err, connected_conversation) {
          if (connected_conversation.length > 0) {
            connected_conversation.forEach(function (value, i) {
              io.to(value.sockets).emit("chat_list_listener", {
                event: "update",
                data: {
                  conversation_id: "personal_chat_" + data.user_id,
                  user_data: { is_online: 1 },
                },
              });
            });
          }
        });
      }
    );
  });

  socket.emit("get_socket_id", { socketID: socketID });

  socket.on("new_chat_message", (data) => {
    async.waterfall(
      [
        function (callback) {
          // var user_name = data.user_name;
          var user_from = data.from_user_id;
          var user_to = data.to_user_id;
          var msg = data.message;
          // var reply_message_id = data.reply_message_id;

          if (
            user_from != "" &&
            user_from != null &&
            user_to != "" &&
            user_to != null &&
            user_to != undefined &&
            user_to != 0
          ) {
            var query = "";
            var insert_data = {
              user_id: user_from,
              message_content: msg,
              message_status: 1,
              entry_date_time: new Date(),
            };

            if (
              user_to != undefined &&
              user_to != "" &&
              user_to != 0 &&
              user_to != null
            ) {
              insert_data.recipient_id = user_to;
            }

            let sql_msg_insert = "INSERT INTO message_master SET ?";
            let query_msg_insert = conn.query(
              sql_msg_insert,
              insert_data,
              (err, results_msg_insert) => {
                if (err) {
                  socket.emit("alert_message", {
                    type: 2,
                    message: "Something went wrong .Please try later",
                  });
                }

                if (results_msg_insert.affectedRows === 1) {
                  var msg_id = results_msg_insert.insertId;
                  callback(null, data, msg_id);
                } else {
                  callback(null, data, 0);
                }
              }
            );
          } else {
            // console.log('here new 3');
            callback(null, data, 0);
          }
        },
        function (data, msg_id, callback) {
          data.message_for_noti = data.message;
          if (msg_id != "" && msg_id != null && msg_id != undefined) {
            //console.log(data.filebase64.substring(0,20));
            if (data.filebase64 != "") {
              var user_from = data.from_user_id;
              var insert_batch = [];
              // console.log(data);
              // async.forEach(data.file, function (value, callback)
              // {
              // console.log(value);
              var file_o_name = data.file.fileName;
              // process.exit();
              // console.log()
              var base64Data = data.filebase64.replace(
                /^data:image\/[a-z]+;base64,/,
                ""
              );
              base64Data = base64Data.replace(
                "data:application/pdf;base64",
                ""
              );
              base64Data = base64Data.replace("data:video/mp4;base64", "");
              var rand = moment().format("YYYYMMDDHHmmss");
              var file_name =
                user_from + "_" + rand + path.extname(file_o_name);
              // console.log(path.extname(file_o_name));
              var file_type = get_file_type_from_name(
                path.extname(file_o_name)
              );
              data.message_for_noti = file_type;
              // console.log(data);public\uploads\message_attachments
              fs.writeFile(
                path.join(
                  __dirname,
                  "./upload/message-attachments/" + file_name
                ),
                base64Data,
                "base64",
                function (err) {
                  if (!err) {
                    insert_batch.push([
                      msg_id,
                      file_name,
                      file_o_name,
                      new Date(),
                    ]);
                  }

                  if (insert_batch.length > 0) {
                    var sql =
                      "INSERT INTO message_attachments_master(message_id, file_name,file_name_o,entry_date_time) VALUES ?";
                    var values = insert_batch;
                    conn.query(sql, [values], function (err, result) {
                      callback(null, data, msg_id);
                    });
                  }
                  // callback();
                }
              );

              // }, function(err)
              // {

              // });
            } else {
              callback(null, data, msg_id);
            }
          } else {
            socket.emit("alert_message", {
              type: 2,
              message: "Something went wrong .Please try later",
            });
          }
        },
        function (data, msg_id, callback) {
          // data.message_for_noti = data.message;
          // console.log('herererer');
          var msg_data_query =
            'SELECT IF(mm.recipient_id > 0,ut.socket_id,"") as recipient_socket,mm.message_id,mm.message_content,mm.entry_date_time,GROUP_CONCAT(mam.mam_id,"###",mam.file_name,"###",mam.file_name_o) as attachments,mm.user_id,mm.entry_date_time FROM message_master mm ';
          msg_data_query +=
            " LEFT JOIN users ut on ut.userId = mm.recipient_id";
          msg_data_query +=
            " LEFT JOIN message_attachments_master mam on mam.message_id = mm.message_id";
          msg_data_query += ' WHERE mm.message_id = "' + msg_id + '"';
          msg_data_query += " GROUP BY mm.message_id ";
          let query_msg_data = conn.query(msg_data_query, (err, msg_data) => {
            // console.log(query_msg_data.sql);
            if (err) {
              socket.emit("alert_message", {
                type: 2,
                message: "Something went wrong .Please try later",
              });
            }

            if (msg_data.length > 0) {
              var msg_data = msg_data[0];
              var attachments = [];
              var send_object = {
                message_id: msg_id,
                sender_user_id: msg_data.user_id,
                message_content: msg_data.message_content,
                time: moment(formatDate(msg_data.entry_date_time)).format(
                  "HH:mm A"
                ),
                attachments: attachments,
              };

              if (
                data.to_user_id != undefined &&
                data.to_user_id != "" &&
                data.to_user_id != 0 &&
                data.to_user_id != null
              ) {
                send_object.conversation_id =
                  "personal_chat_" + data.to_user_id;
              }

              if (msg_data.attachments != "" && msg_data.attachments != null) {
                var all_attachment_string = msg_data.attachments.split(",");
                all_attachment_string.forEach(function (value, i) {
                  var att_object = value.split("###");
                  attachments.push({
                    attach_id: att_object[0],
                    file_name: att_object[2],
                    file_url:
                      data.url + "/message-attachments/" + att_object[1],
                    type: data.message_for_noti,
                  });
                });
              }
              send_object.attachments = attachments;
              send_object.message_status = 1;
              send_object.entry_date_time = new Date();
              // console.log('janak here');
              io.to(socket.id).emit("message_listener", {
                event: "add",
                data: send_object,
              });

              io.to(socket.id).emit("chat_list_listener", {
                event: "update",
                data: {
                  message_id: msg_id,
                  message_content: data.message_for_noti,
                  message_status: 1,
                  attachments: attachments,
                  conversation_id: "personal_chat_" + data.to_user_id,
                  time: "just now",
                  last_message_send_by: parseInt(data.from_user_id),
                  unread_message: 0,
                },
              });

              for (let i = 0; i < users_socket.length; i++) {
                if (users_socket[i].user_id == data.to_user_id) {
                  send_object.conversation_id =
                    "personal_chat_" + data.from_user_id;
                  io.to(users_socket[i].id).emit("message_listener", {
                    event: "add",
                    data: send_object,
                  });

                  io.to(users_socket[i].id).emit("chat_list_listener", {
                    event: "update",
                    data: {
                      message_id: msg_id,
                      message_content: data.message_for_noti,
                      message_status: 0,
                      attachments: attachments,
                      conversation_id: "personal_chat_" + data.from_user_id,
                      time: "just now",
                      last_message_send_by: parseInt(data.from_user_id),
                      unread_message: 1,
                    },
                  });
                }
              }
              //console.log(data.message_for_noti);
            }
          });
        },
      ],
      function (err) {
        if (err) throw new Error(err);
      }
    );
  });

  socket.on("disconnect", (data) => {
    if (!socket.id) return;

    io.to(socket.id).emit("disconnect", { message: "user disconnected here" });

    let user = undefined;
    var new_date = new Date();
    // console.log(new_date);
    for (let i = 0; i < users_socket.length; i++) {
      if (users_socket[i].id === socket.id) {
        user = users_socket[i];
        var update_data = {
          is_online: "0",
        };

        var a = conn.query(
          'UPDATE users set ? WHERE userId = "' + user.user_id + '" ',
          [update_data],
          function (err, rows) {
            // console.log(a.sql);
            if (err) throw err;
          }
        );

        let b = conn.query(
          `SELECT IF(user_id=${user.user_id},recipient_id,user_id) as new_id,CONCAT("personal_chat_",IF(user_id=${user.user_id},recipient_id,user_id)) as conversation_id,IF(user_id=${user.user_id},(SELECT socket_id FROM users WHERE userId = new_id),(SELECT socket_id FROM users WHERE userId = new_id)) as sockets FROM message_master,(SELECT MAX(message_id) as lastid FROM message_master WHERE ( (message_master.recipient_id = ${user.user_id} OR message_master.user_id = ${user.user_id} ) ) GROUP BY CONCAT(LEAST(message_master.recipient_id,message_master.user_id),'.',GREATEST(message_master.recipient_id, message_master.user_id))) as conversations WHERE message_id = conversations.lastid `,
          function (err, connected_conversation) {
            // console.log(err);
            if (connected_conversation.length > 0) {
              // console.log(connected_conversation);
              connected_conversation.forEach(function (value, i) {
                io.to(value.sockets).emit("chat_list_listener", {
                  event: "update",
                  data: {
                    conversation_id: "personal_chat_" + user.user_id,
                    user_data: { is_online: 0 },
                  },
                });
              });
            }
          }
        );
        break;
      }
    }
    users_socket = users_socket.filter((x) => x !== user);
    // connnections_socket.splice(connnections_socket.indexOf(socket),1);
    app.set("users_socket", users_socket);
    // updateUsernames();
  });

  socket.on("message_received", (data) => {
    // console.log('here');
    // console.log(data);
    conn.query(
      'UPDATE message_master set message_status = "2" WHERE message_id = "' +
        data.message_id +
        '" ',
      function (err, rows) {
        if (err) throw err;

        var live_users = getLiveuser();

        var sender_data = live_users.filter(function (online_user) {
          return online_user.user_id == data.sender_user_id;
        });

        for (let i = 0; i < live_users.length; i++) {
          if (live_users[i].user_id == 2) {
            io.to(live_users[i].id).emit("alert_message", {
              type: 2,
              message: "sender data here",
              data: sender_data,
            });
          }
        }

        if (
          sender_data != undefined &&
          sender_data != null &&
          sender_data.length > 0
        ) {
          // console.log(sender_data);
          data.message_status = 2;
          io.to(sender_data[0].id).emit("message_listener", {
            event: "update",
            data: {
              message_status: 2,
              message_id: data.message_id,
              conversation_id: "personal_chat_" + data.receiver,
            },
          });

          io.to(sender_data[0].id).emit("chat_list_listener", {
            event: "update",
            data: {
              message_status: 2,
              conversation_id: "personal_chat_" + data.receiver,
            },
          });
        }
      }
    );
  });

  socket.on("message_seen", (data) => {
    conn.query(
      'UPDATE message_master set message_status = "3" WHERE message_id = "' +
        data.message_id +
        '" ',
      function (err, rows) {
        if (err) throw err;
        var live_users = getLiveuser();
        // console.log(live_users);

        var sender_data = live_users.filter(function (online_user) {
          return online_user.user_id == data.sender_user_id;
        });

        for (let i = 0; i < live_users.length; i++) {
          if (live_users[i].user_id == 2) {
            io.to(live_users[i].id).emit("alert_message", {
              type: 2,
              message: "sender data here",
              data: sender_data,
            });
          }
        }

        // console.log(sender_data);
        if (sender_data && sender_data.length > 0) {
          data.message_status = 3;
          io.to(sender_data[0].id).emit("message_listener", {
            event: "update",
            data: {
              message_status: 3,
              message_id: data.message_id,
              conversation_id: "personal_chat_" + data.receiver,
            },
          });

          io.to(sender_data[0].id).emit("chat_list_listener", {
            event: "update",
            data: {
              message_status: 3,
              conversation_id: "personal_chat_" + data.receiver,
            },
          });
        }
      }
    );
  });
});

const getLiveuser = () => {
  return users_socket;
};

function get_file_type_from_name(ext) {
  if ([".png", ".jpg", ".jpeg"].includes(ext.toLowerCase())) {
    return "PHOTO";
  } else if ([".mp4"].includes(ext.toLowerCase())) {
    return "VIDEO";
  } else {
    return "DOC";
  }
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

  // var ampm = hours >= 12 ? 'pm' : 'am';
  // console.log(hour);
  // console.log(hour.length);
  // console.log(minute);
  // console.log(minute.length);
  // console.log(second);
  // console.log(second.length);
  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;
  if (hour.length < 2) hour = "0" + hour;
  if (minute.length < 2) minute = "0" + minute;
  if (second.length < 2) second = "0" + second;
  return [year, month, day].join("-") + " " + [hour, minute, second].join(":");
}

global.backend_url = process.cwd();
module.exports = app;

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database:"example"
});

con.connect(function(err) {
  if (err) throw err;
  con.query("SELECT * FROM slots", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

/*
to create query table:
create table slots(name_cc varchar(30), email_cc varchar(30), subject_cc varchar(30), message_cc varchar(30), class_cc varchar(500), date_cc datetime(6));

*/
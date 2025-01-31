////////Main database////
const mysql = require("mysql");
const dbhost='172.20.10.197';
const db_user='root';
const db_pass='cloud()%&^123';
const database_name='galaxy_main_v5';
const db = mysql.createConnection({
    host: dbhost,
    user: db_user,
    password: db_pass,
    database: database_name
});
db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("MYSQL CONNECTED")
    }
})
module.exports = db;
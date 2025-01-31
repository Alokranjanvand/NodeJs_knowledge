////////Main database////
const mysql = require("mysql");
const dbhost='172.20.10.197';
const db_user='root';
const db_pass='cloud()%&^123';
const database_name='galaxy_client_v5';
const db3 = mysql.createConnection({
    host: dbhost,
    user: db_user,
    password: db_pass,
    database: database_name
});
db3.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Client Db CONNECTED");
    }
})
module.exports = db3;
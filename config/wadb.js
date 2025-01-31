////////Main database////
const mysql = require("mysql");
const wahost='172.20.10.182';
const wa_user='root';
const wa_pass='galaxy@#$987';
const wa_database_name='aino_master_db';
const what_db = mysql.createConnection({
    host: wahost,
    user: wa_user,
    password: wa_pass,
    database: wa_database_name
});
what_db.connect((err) => {
    if (err) {
        console.log(err);
    } else {
        console.log("Whatsapp MYSQL CONNECTED");
    }
})
module.exports = what_db;
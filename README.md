# NodeJs_knowledge

--------Express js module---------------
var express = require('express');
var app = express();

app.get('/', function(req, res){
   res.send("Hello world!");
});

app.listen(3000);
----------node js kill command onlinux server--------
killall node

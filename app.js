var createError = require('http-errors');
var express = require('express');
var path = require('path');
const fs = require('fs');
const https = require('https');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var indexRouter = require('./routes/index');
var agentRouter = require('./routes/agent_login');
var apicallingRouter = require('./routes/api_model.js');
var appRouter = require('./routes/webrtc_call.js');
var crmRouter = require('./routes/crm');
var logRouter = require('./routes/log');
var callbackRouter = require('./routes/callback_call');
var NewLoginRouter = require('./routes/login');
var app = express();

const PORT = 9011;

app.use(session({
  secret : 'AlokRanjan',
  resave : true,
  saveUninitialized : true
}));

// view engine setup this
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const checkSession = (req, res, next) => {
  if (!req.session.user_id) { // Assuming userId is set when the user logs in
    return res.redirect('/');
  }
  next();
};
app.use('/', indexRouter);
app.use('/', appRouter);
app.use('/', crmRouter);
app.use('/', logRouter);
app.use('/', callbackRouter);
app.use('/agent', agentRouter);
app.use('/api_calling', apicallingRouter);
app.use('/', NewLoginRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.send('This page is not found..!');
  //next(createError(404));
});
/*******Error Handling code by Alok Ranjan */
app.use((err, req, res, next) => {
  // Extract line number from stack trace
  const stackLines = err.stack;
  // Format error message
  const errorMessage = `Error message: ${err.message}\n Error occurred at: ${stackLines}\n\n`;
  // Log to console
  console.error(errorMessage);
  // Write to error.log file
  fs.appendFile('error.log', errorMessage, (err) => {
    if (err) {
      console.error('Failed to write to error.log:', err);
    }
  });
  res.status(500).send({status: false, msg: "Server error. Please try again later."});
});

// error handler
/*app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});*/
const options = {
  key: fs.readFileSync('parahittech.key'),
  cert: fs.readFileSync('main.crt')
};
const server = https.createServer(options, app);
server.listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
/*var server = app.listen(9005, function () {
  var host = server.address().address
  var port = server.address().port
  console.log("Example app listening at http://%s:%s", host, port)

});*/


module.exports = app;

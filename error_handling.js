var http = require("http");
var express = require('express');
var app = express();
var mysql = require('mysql');
var bodyParser = require('body-parser');
var fs = require('fs'); // Import the fs module

// Start MySQL connection
var connection = mysql.createConnection({
  host: 'localhost', // MySQL database host name
  user: 'root', // MySQL database user name
  password: '', // MySQL database password
  database: 'nodejs' // MySQL database name
});

connection.connect(function(err) {
  if (err) throw err;
  console.log('You are now connected with MySQL database...');
});
// End MySQL connection

// Start body-parser configuration
app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
  extended: true
}));
// End body-parser configuration

// Create app server
var server = app.listen(3009, "127.0.0.1", function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("Example app listening at http://%s:%s", host, port);
});

// REST API to get all customers
app.get('/customer', function(req, res, next) {
  connection.query('SELECT * FROM customer22', function(error, results, fields) {
    if (error) {
      next(error); // Pass the error to the error-handling middleware
    } else {
      res.json(results);
    }
  });
});

// REST API to get a single customer data
app.get('/customer/:id', function(req, res, next) {
  connection.query('SELECT * FROM customer WHERE Id=?', [req.params.id], function(error, results, fields) {
    if (error) {
      next(error); // Pass the error to the error-handling middleware
    } else {
      res.json(results);
    }
  });
});

// REST API to create a new customer record in MySQL database
app.post('/customer', function(req, res, next) {
  var params = req.body;
  console.log(params);
  connection.query('INSERT INTO customer SET ?', params, function(error, results, fields) {
    if (error) {
      next(error); // Pass the error to the error-handling middleware
    } else {
      res.json(results);
    }
  });
});

// REST API to update record in MySQL database
app.put('/customer', function(req, res, next) {
  connection.query('UPDATE `customer` SET `Name`=?, `Address`=?, `Country`=?, `Phone`=? WHERE `Id`=?', 
  [req.body.Name, req.body.Address, req.body.Country, req.body.Phone, req.body.Id], 
  function(error, results, fields) {
    if (error) {
      next(error); // Pass the error to the error-handling middleware
    } else {
      res.json(results);
    }
  });
});

// REST API to delete record from MySQL database
app.delete('/customer', function(req, res, next) {
  console.log(req.body);
  connection.query('DELETE FROM `customer` WHERE `Id`=?', [req.body.Id], function(error, results, fields) {
    if (error) {
      next(error); // Pass the error to the error-handling middleware
    } else {
      res.send('Record has been deleted!');
    }
  });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  // Extract line number from stack trace
  const stackLines = err.stack.split('\n');
  let lineInfo = '';
  if (stackLines.length > 1) {
    lineInfo = stackLines[1].trim();
  }

  // Format error message
  const errorMessage = `Error message: ${err.message}\nError occurred at: ${lineInfo}\n\n`;

  // Log to console
  console.error(errorMessage);

  // Write to error.log file
  fs.appendFile('error.log', errorMessage, (err) => {
    if (err) {
      console.error('Failed to write to error.log:', err);
    }
  });

  res.status(500).send('Something broke!');
});

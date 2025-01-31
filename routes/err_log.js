var express = require('express');
const moment = require('moment');
var formattedDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
var router = express.Router();
const fs = require('fs');
const path = require('path');
function Err_logToFile(Line_number,route_name) {
    let date = new Date();

    // Get UTC time components
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth(); // Note: months are 0-indexed
    let day = date.getUTCDate();
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let seconds = date.getUTCSeconds();
    let milliseconds = date.getUTCMilliseconds();

    // Adjust for Indian Standard Time (UTC+5:30)
    minutes += 30;
    hours += 5;

    // Handle minute overflow
    if (minutes >= 60) {
        minutes -= 60;
        hours += 1;
    }

    // Handle hour overflow
    if (hours >= 24) {
        hours -= 24;
        day += 1;
    }

    // Handle day overflow (basic handling, doesn't consider month/year boundaries)
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    if (day > daysInMonth) {
        day = 1;
        month += 1;
    }

    // Handle month overflow
    if (month > 11) {
        month = 0;
        year += 1;
    }

    // Format the date and time components
    let formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    let formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} miliseconds= ${String(milliseconds).padStart(3, '0')}`;

   var indian_timezone= `${formattedDate} ${formattedTime}`;
    
	var logFileName = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}.log`;
	const logFilePath = path.join(__dirname, '../err_logs', logFileName);
	var logMessage = `${indian_timezone} - Linenumber: ${Line_number} - Function Name: ${route_name} \n`;
	fs.promises.mkdir(path.join(__dirname, '../err_logs'), { recursive: true })
        .then(() => fs.promises.appendFile(logFilePath, logMessage))
        .catch(err => console.error('Failed to write log:', err));
}

module.exports = Err_logToFile;
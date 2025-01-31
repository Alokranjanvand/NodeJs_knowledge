var express = require('express');
var database = require('../config/db');
var clientdb = require('../config/clientdb');
var asteriskdb = require('../config/astdb');
var errlogRouter = require('./err_log');
const { omni_wp_url, assign_sip_url, CS_API_Port, CS_FREE_PORT, control_server_url } = require('./constant_webrtc');
const os = require('os');
const util = require('util');
var request = require('request');
const moment = require('moment');
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
const { json } = require('body-parser');
const { base64Encode, freeAgent } = require('./webrtc_function');
var formattedDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
var app = express();
var router = express.Router();
/*const networkInterfaces = os.networkInterfaces();
const localInterfaces = Object.values(networkInterfaces).flat().filter(interface => !interface.internal && interface.family === 'IPv4');
const local_ip_addres=localInterfaces[0].address;*/
router.get('/testing', function (req, res, next) {
  //console.log("this is alok ranjan");
  const ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
  let trimmedIpAddress = ipAddress.replace(/^::ffff:/, '');
  res.send('login_agent' + formattedDateTime + 'Ip address= ' + trimmedIpAddress);
});

router.get('/', function (req, res, next) {
  //res.render('login');
  var ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
  var local_ip_addres = ipAddress.replace(/^::ffff:/, '');
  res.render('login_agent', { title: 'Express', session: req.session, ip_address: local_ip_addres });

});
router.get('/new_login', function (req, res, next) {
  //res.render('login');
  res.render('login_agent_new');

});
router.get('/404', function (req, res, next) {
  var ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
  var local_ip_addres = ipAddress.replace(/^::ffff:/, '');
  res.render('404_page', { title: 'Express', session: req.session, ip_address: local_ip_addres });

});
router.get('/mo', function (req, res, next) {
  res.render('mo');
});

router.get('/ephone', function (req, res, next) {
  //res.render('login');
  res.render('ephone');

});

router.get('/phone', function (req, res, next) {
  var ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
  var local_ip_addres = ipAddress.replace(/^::ffff:/, '');
  res.render('new_phone', { title: 'Express', session: req.session, ip_address: local_ip_addres });
});
////////check ip address///////
router.get('/ipaddress', function (req, res, next) {
  const ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
  res.send(ipAddress);
});
router.get('/login', function (req, res, next) {
  //res.render('login');
  var ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
  var local_ip_addres = ipAddress.replace(/^::ffff:/, '');
  //res.render('login_agent', { title: 'Express', session: req.session, ip_address: local_ip_addres });
  res.redirect('/');
});

/** Agent logout module */
router.post('/agent_logout', function (req, res, next) {


  //console.log("Logout data"+JSON.stringify(req.body));
  const { clientID, AS_ID, CampaignName, USER_ID, SIP_ID, Campaign_Type, LoginHourID, ModeDBId, MYIP, ChatLoginID, emailCount, smsCount, idleDuration, wrapupDuration, holdCount, holdDuration, recallCount, recallDuration, breakDuration, moDuration, transferCount, userStatusID, SERVER_IP, ActivityID, getNotificationInMode, leadAssignTime, previousSQL, CS_API_Port, Manual_Caller_ID } = req.body;
  var currentdatetime = formattedDateTime;
  /*
  * deleting the queue for the agent from queue table 
  * for AB, SB and SD type of campaign
  */
  if (Campaign_Type == 'SB' || Campaign_Type == 'SB' || Campaign_Type == 'SB') {
    ///DELETE FROM `queue_table_5` WHERE `name` = '3181_hrdtest_azaj'
    const tabname = "queue_table_" + AS_ID;
    const keyname = clientID + "_" + CampaignName + "_" + USER_ID;
    query_campaign = `DELETE FROM ${tabname} WHERE name = "${keyname}"`;
    //query_campaign = `select *  FROM ${tabname} limit 2`;
    //console.log(query_campaign);

    asteriskdb.query(query_campaign, function (error, data) {
      if (error) {
        errlogRouter(90, 'agent_logout');
        next(error);
        return;
      }
      //console.log(query_campaign);
    });
  }
  /*
  ############### Remove Queue#######
   * function RemoveQueue
   * to remove the agent, extension from the queue, if agent is not in auto mode
   * DELETE FROM `queue_member_table_5` WHERE `interface` = 'SIP/20002'
   */
  if(AS_ID != '' && SIP_ID !='')
  {
      const queue_member_table = "queue_member_table_" + AS_ID;
      const sip_interface = "SIP/" + SIP_ID;
      let query_member_table = `DELETE FROM ${queue_member_table} WHERE interface = "${sip_interface}"`;
      asteriskdb.query(query_member_table, function (error, data) {
      if (error) {
        errlogRouter(108, 'RouteName : Index and method name: agent_logout');
        next(error);
        return;
      }
    });

  }
  
  /*
  end query for member queue table data
  UPDATE `user_status` SET `ringnoanswer_count` = 0 WHERE `client_id` = '3181' AND `id` = '1903113'
  */
  const query_user_status = `UPDATE user_status SET ringnoanswer_count = 0 WHERE client_id = "${clientID}" and id = "${userStatusID}"`;
  database.query(query_user_status, function (error, data) {
    if (error) {
      errlogRouter(121, 'RouteName : Index and method name: agent_logout');
      next(error);
      return;
    }
    // console.log(query_user_status);
  });
  /*
  ###############End Remove Queue#######
 */

  const updatehour_query = 'UPDATE loginhour SET logout_time = NOW() WHERE client_id = ? and id=?';
  const updatehour_values = [clientID, LoginHourID];
  database.query(updatehour_query, updatehour_values, (err, result) => {
    if (err) {
      errlogRouter(149, 'RouteName : Index and method name: agent_logout');
      next(err);
      return;
    }
    // Query was successful, output number of affected rows
    //console.log('Number of rows updated:', result.affectedRows);
  });
  /**
   * 
   *update user mode action
   */
  const updateusermode_query = ' UPDATE user_mode_action SET end_time = NOW(), email_count = ?, sms_count = ? WHERE client_id = ? AND id = ? ';
  const updateusermode_values = [emailCount, smsCount, clientID, ModeDBId];
  database.query(updateusermode_query, updateusermode_values, (err, result) => {
    if (err) {
      errlogRouter(164, 'RouteName : Index and method name: agent_logout');
      next(err);
      return;
    }
    // Query was successful, output number of affected rows
    //console.log('Number of rows updated:', result.affectedRows);
  });


  /*
  * ############End saving the mode for the agent #########
  *
  /*
  * deleting from the table for agent.
  *
  DELETE FROM `user_status`WHERE `name` = 'azaj' AND `ipaddress` = '' AND `client_id` = '3181'
  */

  const deleteuser_status = ' DELETE FROM user_status WHERE name = ? AND ipaddress = ? AND client_id=?';
  const deleteusertatus_values = [USER_ID, MYIP, clientID];
  database.query(deleteuser_status, deleteusertatus_values, (err, result) => {
    if (err) {
      errlogRouter(186, 'RouteName : Index and method name: agent_logout');
      next(err);
      return;
    }
    // Query was successful, output number of affected rows
    //console.log('delete user_status Number of rows updated:', result.affectedRows);
  });
  /*
  * deleting from the user review action if the agent is in activity
  */
  if (ActivityID || ActivityID != '') {
    const deleteuser_review = ' UPDATE user_review_action SET end_time = NOW() WHERE client_id = ? AND id = ?';
    const deleteuser_review_values = [clientID, ActivityID];
    database.query(deleteuser_review, deleteuser_review_values, (err, result) => {
      if (err) {
        errlogRouter(202, 'RouteName : Index and method name: agent_logout');
        next(err);
        return;
      }
      // Query was successful, output number of affected rows
      //console.log('Update user_review_action  Number of rows updated:', result.affectedRows);
    });
  }
  /*
  * delete from the chat login table
  */
  const deletchat_query = ' DELETE FROM chat_login_info WHERE client_id = ? AND id = ?';
  const deletchat_values = [clientID, ChatLoginID];
  database.query(deletchat_query, deletchat_values, (err, result) => {
    if (err) {
      errlogRouter(217, 'RouteName : Index and method name: agent_logout');
      next(err);
      return;
    }
    // Query was successful, output number of affected rows
    //console.log('delete chat_login_info Number of rows updated:', result.affectedRows);
  });
  /*
  * saving the last query for the preview.
  */
  if (leadAssignTime.length > 0 && getNotificationInMode == 'true' && previousSQL.length > 0) {
    const agent_previews_fil_query = ' DELETE FROM agent_preview_filter_sql WHERE client_id = ? AND agent = ?';
    const agent_previews_fil_values = [clientID, USER_ID];
    database.query(agent_previews_fil_query, agent_previews_fil_values, (err, result) => {
      if (err) {
        errlogRouter(233, 'RouteName : Index and method name: agent_logout');
        next(err);
        return;
      }
      // Query was successful, output number of affected rows
      //console.log('delete agent_preview_filter_sql Number of rows updated:', result.affectedRows);
    });
  }

  /*free your ip address*/
  if (SIP_ID.length > 0) {
    const sip_agent_map = ' UPDATE sip_ip_map SET agent_id = "" WHERE sip_id = ? AND agent_id = ? AND client_id= ? AND server_id= ?';
    //console.log(sip_agent_map);
    const sip_agent_values = [SIP_ID, USER_ID, clientID, AS_ID];
    database.query(sip_agent_map, sip_agent_values, (err, result) => {
      if (err) {
        errlogRouter(250, 'RouteName : Index and method name: agent_logout');
        next(err);
        return;
      }
      // Query was successful, output number of affected rows
      //console.log('delete agent_preview_filter_sql Number of rows updated:', result.affectedRows);
    });
  }

  res.send({ status: 1, msg: "ok" });

});

router.post('/sip_assign_data', function (req, res, next) {
  var client_id = req.body.client_id;
  var agent = req.body.agent;
  var extentype = req.body.extentype;
  //console.log(client_id);
  //console.log(agent);
  var options = {
    'method': 'POST',
    'url': assign_sip_url,
    'headers': {
      'Content-Type': 'application/json'
    },
    body: '{"client_id": "' + client_id + '","agent": "' + agent + '","extentype": "' + extentype + '"}'

  };
  //console.log("json push"+JSON.stringify(options));
  request(options, function (error, response) {
    if (error) {
      errlogRouter(281, 'RouteName : Index and method name: sip_assign_data');
      next(error);
      return;
    }
    res.send(response.body);
  });

});

////// Main Dashboard Data///////
router.get('/dashboard_old', function (req, res, next) {
  var ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
  var local_ip_addres = ipAddress.replace(/^::ffff:/, '');
  res.render('dashboard_old', { title: 'Express', session: req.session, ip_address: local_ip_addres });
});
router.get('/dashboard_new', function (req, res, next) {
  var ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
  var local_ip_addres = ipAddress.replace(/^::ffff:/, '');
  res.render('dashboard', { title: 'Express', session: req.session, ip_address: local_ip_addres });
});

router.get('/dashboard', function (req, res, next) {
  var ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
  var local_ip_addres = ipAddress.replace(/^::ffff:/, '');
  //console.log("ipaddress1= " + local_ip_addres);
  //console.log("ipaddress= " + local_ip_addres);
  res.render('dashboard_new', { title: 'Express', session: req.session, ip_address: local_ip_addres });
});

router.get('/agent_data', function (req, res, next) {
  res.render('login_agent', { title: 'Express', session: req.session });
});

//////////Main Page Login Module#####
router.get('/changePassword', function (req, res, next) {
  res.redirect('change_password');
});
router.get('/change_password', function (req, res, next) {
  var ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
  var local_ip_addres = ipAddress.replace(/^::ffff:/, '');
  console.log("this is render to change_passwaord")
  res.render('change_password', { title: 'Express', session: req.session, ip_address: local_ip_addres,msg:req.session.msg });
});

router.post('/change_User_Password', async function (req, res, next) {
  try {
    const { new_password, confirm_password, id } = req.body;

    // Validate input fields
    if (!new_password || !confirm_password) {
      return res.status(400).json({ error: 'New password and confirm password are required' });
    }

    // Decode base64 passwords
    const decodedNewPassword =  base64Encode(new_password);
    const decodedConfirmPassword = base64Encode(confirm_password);

    // Validate password match
    if (decodedNewPassword !== decodedConfirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Ensure session data exists
    const client_id = req.session?.client_id;
    const user_id = req.session?.user_id;
    const SIP_ID = req.session.extension_data;
    const SERVER_IP = req.session.cs_server;
    const CampaignName=null;
    console.log("this is req.session => ",req.session );
    if (!client_id || !user_id) {
      return res.status(401).json({ error: 'Unauthorized request' });
    }
    // Get client IP address
    const ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
    const local_ip_address = ipAddress?.replace(/^::ffff:/, '') || 'Unknown';

    // Current timestamp
    const formattedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // SQL query
    const query = `
      UPDATE user 
      SET password = ?, is_change_password = ?, first_login = ?, login_time = sysdate() 
      WHERE user_id = ? AND client_id = ?
    `;

    // Execute query
    database.query(query, [decodedNewPassword, 1, 1, user_id, client_id], async function (error, result) {
      if (error) {
        console.error('Database query error:', error);
        errlogRouter(121, 'RouteName: change_User_Password, Method: database.query', error.message);
        return res.status(500).json({ error: 'Internal server error' });
      }

      // Log success
      console.log(`User ${user_id} password changed successfully from IP: ${local_ip_address}`);
      //const newurl = `${control_server_url}?api_name=free&input_data=client_id=${client_id}|agent=${user_id}|sip=${SIP_ID}&CS_SOCKET=${SERVER_IP}&CS_PORT=${CS_FREE_PORT}`;
      //const agent_csdata = await agenSendCSData(newurl);
      await freeAgent(id);
      return res.status(200).json({ msg: 'Password successfully changed' });
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Something went wrong, please try again later' });
  }
});

//////////Main Page Login Module#####
router.post('/login_webrtc', function (request, response, next) {
  
  const {
    user_id, username, password, client_id,
    db_user, db_password, db_server, voice_server,
    cs_server, web_server, my_ip, extension_data,
    as_id, user_status_id
  } = request.body;

  if (username && password) {
    // Store session data
    request.session.user_id = user_id;
    request.session.username = username;
    request.session.password = password;
    request.session.client_id = client_id;
    request.session.db_user = db_user;
    request.session.db_password = db_password;
    request.session.db_server = db_server;
    request.session.voice_server = voice_server;
    request.session.cs_server = cs_server;
    request.session.web_server = web_server;
    request.session.my_ip = my_ip;
    request.session.extension_data = extension_data;
    request.session.as_id = as_id;
    request.session.user_status_id = user_status_id;

    const query_Client_status = `SELECT * FROM  vm_client  WHERE client_code  = ?`;
    const query_user_status = `SELECT * FROM user WHERE user_id = ? AND client_id = ?`;

    //console.log('Executing client query with client_id:', client_id);

    // Query to fetch client status
    database.query(query_Client_status, [client_id], function (error, data) {
      if (error) {
        console.error('Database query error:', error);
        errlogRouter(121, 'RouteName: login_webrtc and method: database.query');
        return next(error);
      }

      // Log the result of the client query
      //console.log('Client data fetched:', data);

      if (data.length > 0) {
        const { first_login, expire_days } = data[0];
        //console.log('Client info:', first_login, expire_days);

        // if (first_login == 1) {
          //console.log('First login, checking user status...');
          
          // Query to fetch user status
          database.query(query_user_status, [user_id, client_id], function (error, data2) {
            if (error) {
              console.error('Database query error:', error);
              errlogRouter(121, 'RouteName: login_webrtc and method: database.query');
              return next(error);
            }

            // Log the result of the user status query
            //console.log('User status data fetched:', data2);

            if (data2.length > 0) {
              const { is_change_password, login_time, first_login } = data2[0];
              let checkDateTimeExpire = getDataisExpire(expire_days, login_time);
              request.session.user_status_id = { is_change_password };

              //console.log('User status:', is_change_password, first_login, login_time);
             // console.log('Date expiration check result:', checkDateTimeExpire);

              if (is_change_password === 0 && first_login == 0) {
                //console.log('User needs to change password.');
                request.session.msg='You are logging in for the first time. Please change your password.'
                // return response.render('change_password', { title: 'Express', session: req.session, ip_address: local_ip_addres, msg: 'You are logging in for the first time. Please change your password.' })
                return response.redirect("/change_password");
              } else if (checkDateTimeExpire) {
                //console.log('User needs to change password due to expiration.');
                request.session.msg='needs to change password due to expiration.'
                // return response.render('change_password', { title: 'Express', session: req.session, ip_address: local_ip_addres, msg: 'needs to change password due to expiration.' })
                return response.redirect("/change_password");
              } else {
                //console.log('User is ready for dashboard.');
                return response.redirect("/dashboard");
              }
            } else {
              //console.log('No user found with the provided user_id and client_id.');
              return response.render('login_agent', { title: 'Express', session: request.session, ip_address: request.session.my_ip , msg: 'Invalid credentials or user not found.' })
              // return response.status(401).send('Invalid credentials or user not found.');
            }
          });
        // } else {
        //   console.log('User not first login, redirecting to dashboard.');
        //   return response.redirect("/dashboard");
        // }
      } else {
        //console.log('No client found with the provided client_id.');
        return response.render('login_agent', { title: 'Express', session: request.session, ip_address: request.session.my_ip , msg: 'Invalid credentials or client not found.' })
        //return response.render("/",'Invalid credentials or client not found.');
      }
    });
    
  } else {
    //console.log('Username or password missing.');
    response.status(400).send('Please enter both username and password.');
    return response.render('login_agent', { title: 'Express', session: request.session, ip_address: request.session.my_ip , msg: 'Please enter both username and password.' })

  }
});
function getDataisExpire(expire_days,login_time){
  if (expire_days==0) {
    return false
  }
  const startDate = new Date(login_time); // Your start date
  const today = new Date(); // Current date and time

  // Calculate the difference in milliseconds
  const differenceInMs = today - startDate;

  // Convert the difference to days
  const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

  // Check if the difference is greater than 300 days
  const isGreaterThanExpireDays = differenceInDays > Number(expire_days);

  //console.log(isGreaterThanExpireDays); // true or false
  return isGreaterThanExpireDays;
}
router.get('/campaign_list', function (request, res, next) {
  database.query('SELECT * FROM user_campaign_map WHERE client_id = "3181" and user_id="azaj"', function (error, results, fields) {
    if (error) {
      errlogRouter(361, 'campaign_list');
      next(error);
      return;
    }
    res.send(JSON.stringify(results));
  });


});
router.post('/validateDialTime', function (req, res, next) {
  const { client_id, campaign_name } = req.body;
  const currentDay = new Date().toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
  const validate_query = `
            SELECT start_time 
            FROM campaign 
            WHERE client_id = ? 
              AND NAME = ? 
              AND (
                  (HOUR(start_time) > HOUR(end_time) 
                      AND (
                          (TIME(SYSDATE()) >= TIME(start_time) AND TIME(SYSDATE()) <= TIME('23:59:59')) 
                          OR (TIME(SYSDATE()) >= TIME('00:00:00') AND TIME(SYSDATE()) <= TIME(end_time))
                      )
                  ) 
                  OR (TIME(SYSDATE()) >= start_time AND TIME(SYSDATE()) <= end_time)
              ) 
              AND s_${currentDay} = 1 
            LIMIT 1;
        `;
  //console.log(validate_query);
  const validate_value = [client_id, campaign_name];
  database.query(validate_query, validate_value, (error, result) => {
    if (error) {
      errlogRouter(394, 'validateDialTime');
      next(error);
      return;
    }
    if (Array.isArray(result) && result.length > 0) {
      res.send({ status: true });
    }
    else {
      res.send({ status: false });
    }

  });


});

router.post('/login', function (request, response, next) {

  //console.log("hello login");

  var user_email_address = request.body.user_email_address;

  var user_password = request.body.user_password;

  if (user_email_address && user_password) {
    query = `SELECT * FROM user_login WHERE user_email = "${user_email_address}" and password="${user_password}"`;
    //console.log(query);

    database.query(query, function (error, data) {
      if (error) {
        errlogRouter(427, 'login');
        next(error);
        return;
      }

      if (data.length > 0) {
        for (var count = 0; count < data.length; count++) {
          request.session.firstname = data[count].firstname;
          request.session.lastname = data[count].lastname;
          request.session.user_email = data[count].user_email;
          request.session.user_id = data[count].id;
          response.redirect("/dashboard");
        }
      }
      else {
        response.send('Incorrect Email Address or password');
      }
      response.end();
    });
  }
  else {
    response.send('Please Enter Email Address and Password Details');
    response.end();
  }

});
router.get('/logout', function (req, res, next) {

  req.session.destroy();
  res.redirect("/login");

});
/*start code for jainul code*/
//This function use for get email Body BY Jainul
router.post('/email_body', function (request, res, next) {
  const { id } = request.body;
  const sql = 'SELECT email_subject AS subject, email_content AS mailBody, is_attachment, client_id AS clientID FROM email_template WHERE id = ?'; // Using ? as placeholder
  database.query(sql, [id], function (error, results) {
    if (error) {
      errlogRouter(471, 'email_body');
      next(error);
      return;
    }
    res.send(JSON.stringify(results));
  });


});
//This function use for get SMS Body BY Jainul
router.post('/getsms', function (request, res, next) {
  const { id } = request.body;
  const sql = 'SELECT sms_text AS phoneBody, client_id AS clientID FROM sms_template WHERE id = ?'; // Using ? as placeholder
  database.query(sql, [id], function (error, results) {
    if (error) {
      errlogRouter(486, 'getsms');
      next(error);
      return;
    }
    res.send(JSON.stringify(results));
  });
});
//This Function use for Reassigned data according to searching Developed by Jainul
router.post('/get_assiged_search', (req, res, next) => {
  var campaign = req.body.campaign;
  var MOPanel = req.body.MOPanel;
  var changeLead = req.body.changeLead;
  var agent = req.body.agent;
  var ClientID = req.body.ClientID;
  var column = req.body.column.split(",");
  var condition = req.body.condition.split(",");
  var value = req.body.value.split(",");
  var disposition = req.body.disposition;
  var subdisposition = req.body.subdisposition;
  var orderby = req.body.orderby;
  var orderbyCol = req.body.orderbyCol;
  var dataset_id = req.body.dataset;
  var isDisplayPhone = req.body.isDisplayPhone;
  var preview_file = req.body.preview_file;
  var skill = req.body.skill;
  var search_condition = 'assigned_to="' + agent + '" AND client_id="' + ClientID + '"';
  if (dataset_id > 0) {
    search_condition += ' AND dataset_id="' + dataset_id + '"';
  } else {
    search_condition += ' AND campaign="' + campaign + '"';
    search_condition += ' AND dataset_id="' + dataset_id + '"';
  }
  if (preview_file != 0) {
    search_condition += ' AND leadid="' + preview_file + '"';
  }
  for (var i = 0; i < column.length; i++) {
    if (column[i].length > 0 && condition[i].length > 0) {
      if (condition[i] == '%') {
        search_condition += ' AND ' + column[i] + ' LIKE "' + condition[i] + '' + value[i] + '"';
      } else if (condition[i] == 'like') {
        search_condition += ' AND ' + column[i] + ' LIKE "%' + value[i] + '%"';
      } else {
        if (column[i] == "cdate") {
          var cdate = value[i].split(",");
          if (condition[i] == " = " && cdate.length > 1 && !empty(cdate[1])) {
            const v_date = new Date(value[i]);
            const c_datetime = format(new Date(v_date), 'yyyy-MM-dd HH:mm:ss');
            search_condition += ' AND ' + column[i] + ' ' + condition[i] + ' %' + c_datetime + '%';
          } else {
            search_condition += ' AND ' + column[i] + ' ' + condition[i] + ' "' + value[i] + '"';
          }
        } else {
          search_condition += ' AND ' + column[i] + ' ' + condition[i] + ' "' + value[i] + '"';
        }
      }
    }
  }
  if (disposition.length > 0 && disposition != 0) {
    search_condition += ' AND lower(agent_disp)="' + disposition + '"';
  }
  if (subdisposition.length > 0 && subdisposition != 0) {
    search_condition += ' AND lower(agent_sub_disposition)="' + subdisposition + '"';
  }
  if (skill.length > 0 && skill != 0) {
    search_condition += ' AND skill="' + skill + '"';
  }
  if (orderbyCol.length > 0 && orderbyCol != 0) {
    search_condition += ' order by ' + orderbyCol + ' ' + orderby;
  } else {
    search_condition += ' order by id desc';
  }
  search_condition += ' LIMIT 500';
  ///console.log(search_condition);
  //console.log(orderbyCol);
  const sql = 'select phone,DATE_FORMAT(cdate, "%M %d") AS calldate,rid,id,f1 from crm_data WHERE ' + search_condition;
  clientdb.query(sql, function (error, rows) {
    //console.log(sql);
    if (error) {
      errlogRouter(565, 'get_assiged_search');
      next(error);
      return;
    }
    res.render('assigned_log', { rows: rows });
  });
});
const runQuery = (query) => {
  return new Promise((resolve, reject) => {
      database.query(query, (error, results) => {
          if (error) {
              reject(error);
          } else {
              resolve(results);
          }
      });
  });
};
router.post('/get_review_search', (req, res, next) => {
  var campaign = req.body.campaign;
  var MOPanel = req.body.MOPanel;
  var changeLead = req.body.changeLead;
  var agent = req.body.agent;
  var ClientID = req.body.ClientID;
  var column = req.body.column.split(",");
  var condition = req.body.condition.split(",");
  var value = req.body.value.split(",");
  var disposition = req.body.disposition;
  var subdisposition = req.body.subdisposition;
  var orderby = req.body.orderby;
  var orderbyCol = req.body.orderbyCol;
  var dataset_id = req.body.dataset;
  var isDisplayPhone = req.body.isDisplayPhone;
  var reviewstarttime = req.body.reviewstarttime;
  var reviewtotime = req.body.reviewtotime;
  var dfid = '';
  const crm_fcaption = [];
  const sqlcrm = 'select dfid,fcaption from crm_config  WHERE campaign="' + campaign + '" AND client_id = "' + ClientID + '" order by fid';
  database.query(sqlcrm, function (error, rows) {
    //console.log(sqlcrm);
    if (error) {
      errlogRouter(595, 'get_review_search');
      next(error);
      return;
    }
    if (rows.length > 0) {
      rows.forEach(row => {
        dfid += "f" + row['dfid'] + ",";
        crm_fcaption.push(row['fcaption']);
      });
    }
    dfid = dfid.slice(0, -1);
    var search_condition = 'date(cdate) >="' + reviewstarttime + '" AND date(cdate) <="' + reviewtotime + '" AND client_id="' + ClientID + '"';
    if (dataset_id > 0) {
      search_condition += ' AND dataset_id="' + dataset_id + '"';
    } else {
      search_condition += ' AND campaign="' + campaign + '"';
      search_condition += ' AND dataset_id="' + dataset_id + '"';
    }
    for (var i = 0; i < column.length; i++) {
      if (column[i].length > 0 && condition[i].length > 0) {
        if (condition[i] == '%') {
          search_condition += ' AND ' + column[i] + ' LIKE "' + condition[i] + '' + value[i] + '"';
        } else if (condition[i] == 'like') {
          search_condition += ' AND ' + column[i] + ' LIKE "%' + value[i] + '%"';
        } else {
          if (column[i] == "cdate") {
            var cdate = value[i].split(",");
            if (condition[i] == " = " && cdate.length > 1 && !empty(cdate[1])) {
              const v_date = new Date(value[i]);
              const c_datetime = format(new Date(v_date), 'yyyy-MM-dd HH:mm:ss');
              search_condition += ' AND ' + column[i] + ' ' + condition[i] + ' %' + c_datetime + '%';
            } else {
              search_condition += ' AND ' + column[i] + ' ' + condition[i] + ' "' + value[i] + '"';
            }
          } else {
            search_condition += ' AND ' + column[i] + ' ' + condition[i] + ' "' + value[i] + '"';
          }
        }
      }
    }
    if (disposition.length > 0 && disposition != 0) {
      search_condition += ' AND lower(agent_disp)="' + disposition + '"';
    }
    if (subdisposition.length > 0 && subdisposition != 0) {
      search_condition += ' AND lower(agent_sub_disposition)="' + subdisposition + '"';
    }
    if (!(changeLead == "1" && MOPanel == "1")) {
      search_condition += ' AND agent="' + agent + '"';
    }
    if (orderbyCol.length > 0 && orderbyCol != 0) {
      search_condition += ' order by ' + orderbyCol + ' ' + orderby;
    } else {
      search_condition += ' order by id desc';
    }
    search_condition += ' LIMIT 250';
    ///console.log(search_condition);
    const sql = 'select DATE_FORMAT(cdate, "%d-%b-%Y %H:%i:%s") AS calldate, agent_attempt, leadid, agent, calltype, agent_disp, agent_sub_disposition, phone,' + dfid + ' from crm_data WHERE ' + search_condition;
    clientdb.query(sql, async function (error, row) {
      //console.log(sql);
      if (error) {
        errlogRouter(657, 'get_review_search');
        next(error);
        return;
      }
      //console.log("show all data",row);
      let query_crm_log = `SELECT GROUP_CONCAT(CONCAT('f', fid)) as crm_data,GROUP_CONCAT(fcaption) as crm_field,count(fcaption) as num_rows FROM crm_config WHERE campaign = "${campaign}" AND client_id = "${ClientID}" `;
      let dsresult = await runQuery(query_crm_log);
      let input_data_filed = dsresult[0]['crm_field'];
      let crm_field_data = input_data_filed.split(',');
      res.render('review_log', { rows : row, crm_field : crm_field_data });
    });
  });
});
//This Function use for Reassigned data Developed by Jainul
router.post('/get_assiged', (req, res, next) => {
  var username = req.body.username;
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var start_date = req.body.start_date;
  var end_date = req.body.end_date;
  const sql = 'select c.phone,DATE_FORMAT(c.cdate, "%M %d") AS calldate,c.rid,c.id,c.f1 from galaxy_client_v5.crm_data c left join lead_upload l on l.lead_name=c.leadid and l.client_id=c.client_id WHERE (date(l.upload_time )>="' + start_date + '" AND date(l.upload_time )<="' + end_date + '") AND c.client_id = "' + client_id + '" AND c.campaign = "' + campaign + '" AND c.assigned_to  = "' + username + '" order by l.upload_time desc LIMIT 500';
  database.query(sql, function (error, rows) {
    //console.log(sql);
    if (error) {
      errlogRouter(676, 'get_assiged');
      next(error);
      return;
    }
    res.render('assigned_log', { rows: rows });
  });
});

async function getsysDate() {
  const { format } = require('date-fns');
  const sql = 'select sysdate() as systemdate';
  return new Promise((resolve, reject) => {
    database.query(sql, function (error, rows) {
      if (error) return reject(error);
      rows.forEach(row => {
        const cb_date = format(new Date(row['systemdate']), 'yyyy-MM-dd HH:mm:ss');
        resolve(cb_date);
      });
    });
  });
}

router.post('/power-on', (req, res, next) => {
  const {username, USER_ID, CampaignName, ClientID, activity, LoginHourID, ModeDBId, AS_ID, SIP_ID, User_Status_ID}=req.body
    const query_power = `INSERT INTO user_review_action (login_id, mode_action_id, activity_name, campaign, client_id, user_id, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, SYSDATE(), SYSDATE())`;
    const values_power = [LoginHourID, ModeDBId, activity, CampaignName, ClientID, USER_ID];
    database.query(query_power, values_power, async (error, results) => {
      //console.log("results",results);
      if (error) {
          errlogRouter(676, 'get_assiged');
          next(error);
          return;
      }
      //console.log("results", results);
      var new_db_date = await getsysDate();
      res.send({status:true,ActivityID:results.insertId,ActivityLoginTime:new_db_date});
      });
});
router.post('/power-off', (req, res, next) => {
  const {ActivityID, ClientID}=req.body
  const update_recall = 'UPDATE user_review_action SET end_time = SYSDATE() WHERE id = ? AND client_id = ?';
  database.query(update_recall, [ActivityID, ClientID], function (error, result) {
    if (error) {
      errlogRouter(25, 'Route Name : Callback , Function name: user_review_action_update');
      next(error);  // Passing error to the next middleware
      return;
    }
    res.status(200).send({ success:true,message:'Record updated successfully...!',result:result });
  });
});
//This Function use for Dial Call Log Developed by Jainul
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
/*function getDBTime(){
  const { format } = require('date-fns');
  const sql = 'select sysdate() as systemdate'; 
   database.query(sql, function (error, rows) {
   if (error) throw error;
    rows.forEach(row => {
      const cb_date=format(new Date(row['systemdate']), 'yyyy-MM-dd HH:mm:ss');
      console.log(cb_date);
        
     });
   });
   
}*/



function getYesterday() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date;
}
router.post('/call_log', (req, res, next) => {
  var username = req.body.username;
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var start_date = req.body.start_date;
  var end_date = req.body.end_date;
  var search_type = req.body.search_type;
  var date_time = new Date();
  const formattedDate = formatDate(date_time);
  const yesterday = getYesterday();
  const yesterday_date = formatDate(yesterday);
  var calllogtxt_search = req.body.calllogtxt_search;
  if (calllogtxt_search.length > 0) {
    var sql = 'select d.phone AS phone,DATE_FORMAT(d.start_time, "%d-%m-%Y") AS calldate,DATE_FORMAT(d.start_time, "%a") AS callday,d.rid,c.id,c.f1 from disposition d LEFT JOIN crm_data c on d.did = c.id and d.client_id = c.client_id WHERE (date(d.start_time)>="' + start_date + '" AND date(d.start_time)<="' + end_date + '") AND d.client_id = "' + client_id + '" AND d.campaign = "' + campaign + '" AND d.agent = "' + username + '" AND (d.phone="' + calllogtxt_search + '" OR c.leadid="' + calllogtxt_search + '") order by d.start_time desc LIMIT 500';
  }
  else {
    var sql = 'select d.phone AS phone,DATE_FORMAT(d.start_time, "%d-%m-%Y") AS calldate,DATE_FORMAT(d.start_time, "%a") AS callday,d.rid,c.id,c.f1 from disposition d LEFT JOIN crm_data c on d.did = c.id and d.client_id = c.client_id WHERE (date(d.start_time)>="' + start_date + '" AND date(d.start_time)<="' + end_date + '") AND d.client_id = "' + client_id + '" AND d.campaign = "' + campaign + '" AND d.agent = "' + username + '" order by d.start_time desc LIMIT 500';
  }
  clientdb.query(sql, function (error, rows) {
    if (error) {
      errlogRouter(774, 'call_log');
      next(error);
      return;
    }
    res.render('call_log', { rows: rows, current_date: formattedDate, yesterday_date: yesterday_date, search_type: search_type });
  });
});
//This Function use for Dial Call Log Display onclick menu on Call Developed by Jainul
router.post('/save_schedulecallback', (req, res) => {
  var client_id = req.body.client_id;
  var recall_id = req.body.recall_id;
  var reschedule_callback_date = req.body.schedule_calldate + ":00";
  const callback_date = reschedule_callback_date.replace('T', ' ');
  //console.log(callback_date);
  const update_recall = ' UPDATE recall SET cdate = "' + callback_date + '" WHERE id = "' + recall_id + '" AND client_id="' + client_id + '"';
  //console.log(update_recall);
  clientdb.query(update_recall, function (error, result) {
    if (error) {
      errlogRouter(791, 'call_log_show');
      next(error);
      return;
    }
    res.send({ ok: true });
  });
});
router.post('/call_log_show', (req, res, next) => {
  var username = req.body.username;
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var cdate = req.body.cdate;
  const sql = 'select sec_to_time(cd.billsec) as bill_sec,d.phone AS phone,DATE_FORMAT(d.start_time, "%d %M %Y") AS calldate,TIME_FORMAT(calldate, "%H:%i:%s") AS calltime, d.rid,c.f1,date_format(d.start_time,"%Y%m%d") as sdate,DATE_FORMAT(d.start_time, "%Y-%m-%d %H:%i:%s") AS start_time from disposition d LEFT JOIN crm_data c on d.did = c.id and d.client_id = c.client_id left join cdr_log cd on cd.recordid=d.rid and cd.client_id=d.client_id  WHERE date(d.start_time)="' + cdate + '" AND d.client_id = "' + client_id + '" AND d.campaign = "' + campaign + '" AND d.agent = "' + username + '" order by d.start_time desc';
  clientdb.query(sql, function (error, rows) {
    //console.log(sql);
    if (error) {
      errlogRouter(791, 'call_log_show');
      next(error);
      return;
    }
    res.render('call_log_show', { rows: rows });
  });
});
//This Function use for Dial Call Log Display according to atteraction ID  Developed by Jainul
router.post('/call_log_showinteraction', (req, res, next) => {
  var username = req.body.username;
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var intr = req.body.intr;
  const sql = 'select d.did,sec_to_time(cd.billsec) as bill_sec,DATE_FORMAT(d.start_time, "%Y-%m-%d %H:%i:%s") AS start_time,d.phone AS phone,DATE_FORMAT(d.start_time, "%d %M %Y") AS calldate,TIME_FORMAT(calldate, "%H:%i:%s") AS calltime, d.rid,c.f1 from disposition d LEFT JOIN crm_data c on d.did = c.id and d.client_id = c.client_id left join cdr_log cd on cd.recordid=d.rid and cd.client_id=d.client_id  WHERE d.did="' + intr + '" AND d.client_id = "' + client_id + '" AND d.campaign = "' + campaign + '" AND d.agent = "' + username + '" order by d.start_time desc';
  //console.log(sql);
  clientdb.query(sql, function (error, rows) {
    //console.log(sql);
    if (error) {
      errlogRouter(808, 'call_log_showinteraction');
      next(error);
      return;
    }
    res.render('call_log_show', { rows: rows });
  });
});
//This Function use for Call back Data means Recall table data Developed by Jainul

router.post('/get_callback', (req, res) => {
  var username = req.body.username;
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var CBUPolicy = req.body.CBUPolicy;
  var start_date = req.body.start_date;
  var end_date = req.body.end_date;
  var date_time = new Date();
  const formattedDate = formatDate(date_time);
  const yesterday = getYesterday();
  const yesterday_date = formatDate(yesterday);
  var callbacktxt_search = req.body.callbacktxt_search;
  var search_type = req.body.search_type;
  let where='';
  //console.log("Policy name = "+CBUPolicy);
  if(CBUPolicy==2)
  {
      where=' AND (r.agent = "' + username + '" OR r.agent ="")' ;
  }else
  {
      where=' AND r.agent = "' + username + '"' ;
  }
  if (callbacktxt_search.length > 0) {
    var sql = 'select DATE_FORMAT(r.cdate, "%Y-%m-%d %H:%i") AS callback_datetime,r.id as recall_id,r.campaign,r.phone AS phone,DATE_FORMAT(r.cdate, "%d-%b-%y %h:%i:%s %p") AS calldate,DATE_FORMAT(r.cdate, "%a") AS callday,r.rid,c.id,c.f1 from recall r LEFT JOIN crm_data c on r.rid = c.rid and r.client_id = c.client_id WHERE (date(r.cdate)>="' + start_date + '" AND date(r.cdate)<="' + end_date + '") AND r.client_id = "' + client_id + '" AND r.campaign = "' + campaign + '"  '+where+' AND (r.phone="' + callbacktxt_search + '" OR c.leadid="' + callbacktxt_search + '") order by r.cdate desc LIMIT 500';
  }
  else {
    var sql = 'select DATE_FORMAT(r.cdate, "%Y-%m-%d %H:%i") AS callback_datetime,r.id as recall_id,r.campaign,r.dataid as data_id,r.phone AS phone,DATE_FORMAT(r.cdate, "%d-%b-%y %h:%i:%s %p") AS calldate,DATE_FORMAT(r.cdate, "%a") AS callday,r.rid,c.id,c.f1 from recall r LEFT JOIN crm_data c on r.rid = c.rid and r.client_id = c.client_id WHERE (date(r.cdate)>="' + start_date + '" AND date(r.cdate)<="' + end_date + '") AND r.client_id = "' + client_id + '" AND r.campaign = "' + campaign + '"  '+where+' order by r.cdate desc LIMIT 500';
  }
  //console.log("callback detais= "+sql);
  clientdb.query(sql, function (error, rows) {
    ///console.log(sql);
    if (error) {
      errlogRouter(834, 'get_callback');
      next(error);
      return;
    }
    res.render('callback_log', { rows: rows, current_date: formattedDate, yesterday_date: yesterday_date, search_type: search_type });
  });
});
//This Function Use For email Inbox Display By Jainul
router.post('/email_log_inbox', (req, res, next) => {
  var username = req.body.username;
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var cdate = req.body.cdate;
  var intr = req.body.intr;
  if (intr > 0) {
    var sql = 'SELECT e.from_id,e.mail_subject,e.rid,e.mail_content,DATE_FORMAT(e.reciept_time, "%d %M %Y") AS emaildate,TIME_FORMAT(e.reciept_time, "%H:%i:%s") AS emailtime,e.id FROM email_inbox e left join galaxy_client_v5.disposition d on d.rid=e.rid and d.client_id=e.client_id WHERE e.client_id = "' + client_id + '" AND e.campaign_name = "' + campaign + '" AND e.agent_id = "' + username + '" AND date(e.reciept_time) = "' + cdate + '" AND d.did="' + intr + '" order by e.reciept_time desc LIMIT 250';
  }
  else {
    var sql = 'SELECT e.from_id,e.mail_subject,e.rid,e.mail_content,DATE_FORMAT(e.reciept_time, "%d %M %Y") AS emaildate,TIME_FORMAT(e.reciept_time, "%H:%i:%s") AS emailtime,e.id FROM email_inbox e left join galaxy_client_v5.disposition d on d.rid=e.rid and d.client_id=e.client_id WHERE e.client_id = "' + client_id + '" AND e.campaign_name = "' + campaign + '" AND e.agent_id = "' + username + '" AND date(e.reciept_time) = "' + cdate + '" order by e.reciept_time desc LIMIT 250';
  }
  ///console.log(sql);
  database.query(sql, (err, rows) => {
    if (err) {
      errlogRouter(860, 'email_log_inbox');
      next(err);
      return;
    }
    res.render('email_log_inbox', { rows }); // Pass 'rows' to the template
  });
});
//This Function Use For email Sent Display By Jainul
router.post('/email_log_sent', (req, res, next) => {
  var username = req.body.username;
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var cdate = req.body.cdate;
  var intr = req.body.intr;
  if (intr > 0) {
    var sql = 'SELECT e.recipient_id,e.email_subject,e.rid,e.email_content,DATE_FORMAT(e.sent_date, "%d %M %Y") AS emaildate,TIME_FORMAT(e.sent_date, "%H:%i:%s") AS emailtime,e.id FROM email_sent e left join galaxy_client_v5.disposition d on d.rid=e.rid and d.client_id=e.client_id WHERE e.client_id = "' + client_id + '" AND e.Campaign_Name = "' + campaign + '" AND e.agent_id = "' + username + '" AND date(e.sent_date) = "' + cdate + '" AND d.did="' + intr + '" order by e.sent_date desc LIMIT 250';
  }
  else {
    var sql = 'SELECT e.recipient_id,e.email_subject,e.rid,e.email_content,DATE_FORMAT(e.sent_date, "%d %M %Y") AS emaildate,TIME_FORMAT(e.sent_date, "%H:%i:%s") AS emailtime,e.id FROM email_sent e left join galaxy_client_v5.disposition d on d.rid=e.rid and d.client_id=e.client_id WHERE e.client_id = "' + client_id + '" AND e.Campaign_Name = "' + campaign + '" AND e.agent_id = "' + username + '" AND date(e.sent_date) = "' + cdate + '" order by e.sent_date desc LIMIT 250';
  }
  /// console.log(sql);
  database.query(sql, (err, rows) => {
    if (err) {
      errlogRouter(885, 'email_log_sent');
      next(err);
      return;
    }
    res.render('email_log_sent', { rows }); // Pass 'rows' to the template
  });
});

//This Function use for display record by inbox and send message etc while send SMS and Developed by Jainul
router.post('/sms_log_inbox', (req, res, next) => {
  var username = req.body.username;
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var cdate = req.body.cdate;
  var intr = req.body.intr;
  if (intr > 0) {
    var sql = 'SELECT s.mobile_no,s.rid,s.message,DATE_FORMAT(s.cdate, "%d %M %Y") AS smsdate,TIME_FORMAT(s.cdate, "%H:%i:%s") AS smstime,s.id FROM sms_inbox s left join galaxy_client_v5.disposition d on d.rid=s.rid and d.client_id=s.client_id WHERE s.client_id = "' + client_id + '" AND s.Campaign_Name = "' + campaign + '" AND s.agent = "' + username + '" AND date(s.cdate) = "' + cdate + '" AND d.did="' + intr + '" order by s.cdate desc LIMIT 250';
  }
  else {
    var sql = 'SELECT s.mobile_no,s.rid,s.message,DATE_FORMAT(s.cdate, "%d %M %Y") AS smsdate,TIME_FORMAT(s.cdate, "%H:%i:%s") AS smstime,s.id FROM sms_inbox s left join galaxy_client_v5.disposition d on d.rid=s.rid and d.client_id=s.client_id WHERE s.client_id = "' + client_id + '" AND s.Campaign_Name = "' + campaign + '" AND s.agent = "' + username + '" AND date(s.cdate) = "' + cdate + '" order by s.cdate desc LIMIT 250';
  }
  ///console.log(sql);
  database.query(sql, (err, rows) => {

    if (err) {
      errlogRouter(912, 'sms_log_inbox');
      next(err);
      return;
    }
    res.render('sms_log_inbox', { rows }); // Pass 'rows' to the template
  });
});
router.post('/sms_log_sent', (req, res, next) => {
  var username = req.body.username;
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var cdate = req.body.cdate;
  var intr = req.body.intr;
  if (intr > 0) {
    var sql = 'SELECT s.mobile_no,s.rid,s.message,DATE_FORMAT(s.cdate, "%d %M %Y") AS smsdate,TIME_FORMAT(s.cdate, "%H:%i:%s") AS smstime,s.id FROM sms_sent s left join galaxy_client_v5.disposition d on d.rid=s.rid and d.client_id=s.client_id WHERE s.client_id = "' + client_id + '" AND s.Campaign_Name = "' + campaign + '" AND s.agent = "' + username + '" AND date(s.cdate) = "' + cdate + '" AND d.did="' + intr + '" order by s.cdate desc LIMIT 250';
  }
  else {
    var sql = 'SELECT s.mobile_no,s.rid,s.message,DATE_FORMAT(s.cdate, "%d %M %Y") AS smsdate,TIME_FORMAT(s.cdate, "%H:%i:%s") AS smstime,s.id FROM sms_sent s left join galaxy_client_v5.disposition d on d.rid=s.rid and d.client_id=s.client_id WHERE s.client_id = "' + client_id + '" AND s.Campaign_Name = "' + campaign + '" AND s.agent = "' + username + '" AND date(s.cdate) = "' + cdate + '" order by s.cdate desc LIMIT 250';
  }
  //console.log(sql);
  database.query(sql, (err, rows) => {

    if (err) {
      errlogRouter(937, 'sms_log_sent');
      next(err);
      return;
    }
    res.render('sms_log_sent', { rows }); // Pass 'rows' to the template
  });
});


/// This Function use for Callback Push Data By Jainul 


//This Function Use For email Inbox Display By Jainul
router.post('/templates_load', (req, res, next) => {
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var user_id = req.body.user_id;
  var tag = req.body.tag;
  if (client_id == '') {
    res.send({ status: false, msg: 'Please enter client id..!' });
    return;
  }
  else if (campaign == '') {
    res.send({ status: false, msg: 'Please enter campaign..!' });
    return;
  }
  else if (tag == '') {
    res.send({ status: false, msg: 'Please enter tag email or sms..!' });
    return;
  }
  else if (tag == 'email') {
    database.query('SELECT id, email_type FROM email_template WHERE campaign_name="' + campaign + '" and client_id="' + client_id + '"', (err, rows) => {
      if (err) {
        errlogRouter(973, 'templates_load');
        next(err);
        return;
      }
      res.send({ status: true, data: rows });
    });
  }
  else if (tag == 'sms') {
    const sql_sms = 'SELECT s.id, s.sms_type,s.template_id, a.route_id FROM sms_template s LEFT JOIN agent_disposition_sms_map a ON s.id = a.template_id AND s.client_id = a.client_id WHERE a.campaign="' + campaign + '" and a.client_id="' + client_id + '" and a.disposition_id=""';
    ///console.log(sql);
    database.query(sql_sms, (err, srows) => {
      if (err) {
        errlogRouter(986, 'templates_load');
        next(err);
        return;
      }
      res.send({ status: true, data: srows });
    });
  }
  else if (tag == 'prev') {
    const sql_prev = 'SELECT id,activity_name FROM agent_campaign_activity_map WHERE campaign_id="' + campaign + '" and client_id="' + client_id + '" and user_id="' + user_id + '"';
    //console.log(sql_prev);
    database.query(sql_prev, (err, rows) => {
      if (err) {
        errlogRouter(999, 'templates_load');
        next(err);
        return;
      }
      res.send({ status: true, data: rows });
    });
  }
  else if (tag == 'review') {
    const sql_prev = 'SELECT id,activity_name FROM agent_campaign_activity_map WHERE campaign_id="' + campaign + '" and client_id="' + client_id + '" and user_id="' + user_id + '"';
    //console.log(sql_prev);
    database.query(sql_prev, (err, rows) => {
      if (err) {
        errlogRouter(1012, 'templates_load');
        next(err);
        return;
      }
      res.send({ status: true, data: rows });
    });
  }
  else {
    res.send({ status: false, msg: 'Invalid records..!' });
  }

});

router.post('/crm_load', function (req, res, next) {
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var user_id = req.body.user_id;
  const sql_crm = 'SELECT dfid,fcaption FROM crm_config WHERE campaign="' + campaign + '" and client_id="' + client_id + '" order by fid';
  //console.log(sql_crm);
  database.query(sql_crm, (err, rows) => {
    if (err) {
      errlogRouter(1034, 'crm_load');
      next(err);
      return;
    }
    res.send({ status: true, data: rows });
  });
});
/*** this code by jainu; */
router.post('/decision_parent_name', function (req, res, next) {
  var id = req.body.id;
  const sql_dec = 'SELECT title FROM chat_view where id="' + id + '" LIMIT 1';
  //console.log(sql_dec);
  database.query(sql_dec, (err, rows) => {
    if (err) {
      errlogRouter(1048, 'decision_parent_name');
      next(err);
      return;
    }
    res.send(rows);
  });
});
router.post('/decision_disposition_list', function (req, res, next) {
  var id = req.body.id;
  var campaign = req.body.campaign_name;
  var client_id = req.body.client_id;
  const sql_deci = 'select distinct disposition_id from decision_campaign_disposition_map where node_id="' + id + '" and client_id="' + client_id + '"  and  campaign_id="' + campaign + '"';
  ///console.log(sql_deci);
  database.query(sql_deci, (err, rows) => {
    if (err) {
      errlogRouter(1063, 'decision_disposition_list');
      next(err);
      return;
    }
    res.send({ status: true, data: rows });
  });
});
/** end jai code */
router.post('/lead_file', function (req, res, next) {
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var user_id = req.body.user_id;
  const sql_lead = 'SELECT l.lead_name FROM lead_upload l left join user_mode m on m.mode_index=l.lead_mode and m.client_id=l.client_id WHERE l.campaign="' + campaign + '" and l.client_id="' + client_id + '" and LOWER(m.user_mode)="Preview" order by l.lead_name';
  ///console.log(sql_lead);
  database.query(sql_lead, (err, rows) => {
    if (err) {
      errlogRouter(1079, 'lead_file');
      next(err);
      return;
    }
    res.send({ status: true, data: rows });
  });
});
router.post('/user_skill', function (req, res, next) {
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var user_id = req.body.user_id;
  const sql_lead = 'SELECT skill FROM agent_campaign_skill_map WHERE campaign="' + campaign + '" and client_id="' + client_id + '" and user_id="' + user_id + '" order by skill';
  ///console.log(sql_lead);
  database.query(sql_lead, (err, rows) => {
    if (err) {
      errlogRouter(1094, 'user_skill');
      next(err);
      return;
    }
    res.send({ status: true, data: rows });
  });
});
//This Function Use For Dialing by Jainul
router.post('/progressive_call', (req, res, next) => {
  var username = req.body.username;
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  var Campaign_Type = req.body.Campaign_Type;
  var LastSkillUsed = req.body.LastSkillUsed;
  const sql_progress = 'select l.lead_name as leadname,l.offtime_dialing_priority,l.dialing_queue_store from lead_upload l left join  galaxy_client_v5.customer c on lower(c.campaign)=lower(l.campaign) and lower(c.leadid) = lower(l.lead_name) and c.client_id = l.client_id where lower(l.campaign)="' + campaign + '" and l.client_id="' + client_id + '" and l.is_active=1 and l.is_deleted=0 and l.lead_mode=5 AND c.phone is not null GROUP BY c.leadid ORDER BY l.dialing_queue_store DESC';
  database.query(sql_progress, function (error, results) {
    //console.log(sql);	
    if (error) {
      errlogRouter(1120, 'progressive_call');
      next(error);
      return;
    }
    else if (results.length == 0) {
      res.send({ status: false, msg: 'No data available for progressive dial' });
    } else {
      results.forEach(row => {
        const DQS = (row['dialing_queue_store']) ? 'desc' : 'asc';
        const offlineP = (row['offtime_dialing_priority']) ? 'asc' : 'desc';
        const lead_id = row['leadname'];
        const dialing_mode = '5';
        const st = '1';
        const leadid = row['leadname'];
        //console.log("lead id= " + leadid);
        const order = ' order by date(loadtime) ' + offlineP + ', time(loadtime) ' + DQS;
        //console.log("Order id= " + order);

        var search_condition = 'campaign="' + campaign + '" AND leadid="' + lead_id + '" AND client_id="' + client_id + '" AND dialing_mode="' + dialing_mode + '" AND status="' + st + '"';
        ///console.log(order);
        if (Campaign_Type.toUpperCase() == "AB") {
          search_condition += ' AND (agent="' + username + '" OR agent="")';
        } else if (Campaign_Type.toUpperCase() == "SR") {
          if (LastSkillUsed.length > 0) {
            search_condition += ' AND (agent="' + LastSkillUsed + '" OR agent="")';
          } else {
            search_condition += '';
          }
        }
        const sqlc = 'select phone,leadid,id,dataid from customer WHERE ' + search_condition + ' ' + order + ' LIMIT 1';
        clientdb.query(sqlc, function (error, cresults) {
          //console.log(sqlc);
          if (error) {
            errlogRouter(1148, 'progressive_call');
            next(error);
            return;
          } else if (cresults.length == 0) {
            res.send({ status: false, msg: 'no record', query: sqlc });
          } else {
            cresults.forEach(rowc => {
              const id = rowc['id'];
              let phone = rowc['phone'];
              let leadid = rowc['leadid'];
              let dataid = rowc['dataid'];
              const sqld = 'DELETE from customer WHERE client_id="' + client_id + '" AND id="' + id + '"';
              res.send({ status: true, msg: 'Data available..!', phone: phone, leadid: leadid, dataid: dataid, id: id, query: sqld });
              clientdb.query(sqld, function (error, cresults) {
                if (error) {
                  errlogRouter(1165, 'progressive_call');
                  next(error);
                  return;
                }
                res.send({ status: true, msg: 'Data available..!', phone: phone, leadid: leadid, dataid: dataid, id: id });
              });
            });

          }

        });
      });
    }

  });
});
router.post('/decision_tree_show', (req, res, next) => {
  var client_id = req.body.client_id;
  var campaign = req.body.campaign;
  const sql = 'SELECT webscript FROM campaign WHERE client_id = "' + client_id + '" and name="' + campaign + '" LIMIT 1';
  ///console.log(sql);
  database.query(sql, (err, rows) => {
    if (err) {
      errlogRouter(1188, 'decision_tree_show');
      next(err);
      return;
    }
    res.send({ status: true, data: rows });
  });
});
/*** callback searching */
router.post('/callback_log_details', function (req, res) {
  var ClientID = req.body.ClientID;
  var Log_Data_Field = req.body.Log_Data_Field;
  var id = req.body.id;
  let selectArray = ['r.id', 'r.dataid', 'r.phone', 'DATE_FORMAT(r.cdate, "%d-%b-%y %h:%i:%s %p") AS cdate', 'r.recall_by', 'DATE_FORMAT(r.created_time, "%d-%b-%y %h:%i:%s %p") AS update_time', 'r.disposition', 'r.sub_disposition', 'r.campaign'];
  const array = Object.values(Log_Data_Field);
  if (array.length > 0) {
    array.forEach((c, f) => {
      f = f + 1;
      selectArray.push(`c.f${f}`);
    });
  }

  let sql = `
        SELECT ${selectArray.join(", ")}
        FROM recall r
        LEFT JOIN crm_data c ON r.dataid = c.id AND r.client_id = c.client_id
        WHERE r.client_id = ? AND r.id = ?
        ORDER BY r.parent_priority, r.priority, r.cdate
    `;
  //console.log(sql);
  const search_value = [ClientID, id];
  clientdb.query(sql, search_value, (error, rows) => {
    //console.log(sql);
    if (error) {
      errlogRouter(1227, 'callback_log_details');
      next(error);
      return;
    }
    res.render('callback_logdetails', { ok: true, rows: rows, crm_field: array });
  });
});
router.post('/callback_search_log', function (req, res) {
  var ClientID = req.body.ClientID;
  var Log_Data_Field = req.body.Log_Data_Field;
  var USER_ID = req.body.USER_ID;
  var campaign = req.body.campaign;
  var search_start_date = req.body.search_start_date;
  var search_end_date = req.body.search_end_date;
  let selectArray = ['r.id', 'r.dataid', 'r.phone', 'DATE_FORMAT(r.cdate, "%Y-%m-%d %H:%i") AS callback_datetime', 'DATE_FORMAT(r.cdate, "%d-%b-%y %h:%i:%s %p") AS cdate', 'r.recall_by', 'DATE_FORMAT(r.created_time, "%d-%b-%y %h:%i:%s %p") AS update_time', 'r.disposition', 'r.sub_disposition', 'r.campaign'];
  const array = Object.values(Log_Data_Field);
  if (array.length > 0) {
    array.forEach((c, f) => {
      f = f + 1;
      selectArray.push(`c.f${f}`);
    });
  }

  let sql = `
        SELECT ${selectArray.join(", ")}
        FROM recall r
        LEFT JOIN crm_data c ON r.dataid = c.id AND r.client_id = c.client_id
        WHERE r.client_id = "`+ ClientID + `" AND (r.agent = "` + USER_ID + `" OR r.agent = "") 
		AND r.campaign = "`+ campaign + `" AND (date(r.cdate)>="` + search_start_date + `" AND date(r.cdate)<="` + search_end_date + `")
        ORDER BY r.parent_priority, r.priority, r.cdate
    `;
  clientdb.query(sql, (error, rows) => {
    if (error) {
      errlogRouter(1260, 'callback_search_log');
      next(error);
      return;
    }
    let sqlo = `
        SELECT ${selectArray.join(", ")}
        FROM recall r
        LEFT JOIN crm_data c ON r.dataid = c.id AND r.client_id = c.client_id
        WHERE r.client_id = "`+ ClientID + `" AND (r.agent = "` + USER_ID + `" OR r.agent = "") 
		AND r.campaign != "`+ campaign + `" AND (date(r.cdate)>="` + search_start_date + `" AND date(r.cdate)<="` + search_end_date + `")
        ORDER BY r.parent_priority, r.priority, r.cdate
    `;
    //console.log(sqlo);
    clientdb.query(sqlo, (erroro, rowso) => {
      if (erroro) {
        errlogRouter(1274, 'callback_search_log');
        next(error);
        return;
      }
      res.render('callback_search_log', { ok: true, rows: rows, crm_field: array, rowso: rowso });
    });
  });
});
router.post('/callback_history_log', function (req, res) {
  let { ClientID, campaign_name, id } = req.body
  let query_crm_log = `SELECT GROUP_CONCAT(CONCAT('f', fid)) as crm_data,GROUP_CONCAT(fcaption) as crm_field,count(fcaption) as num_rows FROM crm_config WHERE campaign = "${campaign_name}" AND client_id = "${ClientID}" AND history=1 `;
  //console.log("query_crm_log= " + query_crm_log);
  database.query(query_crm_log, (err, result_data) => {
    if (err) {
      errlogRouter(1263, 'callback_history_log');
      next(err);
      return;
    }
    if (result_data[0]['num_rows'] == 0) {
      res.render('callback_history_log', { ok : false, msg : 'No set history parameter',rows :'',crm_field :'', num_rows : result_data[0]['num_rows'] });
      return;
    } else {
      let input_data_filed = result_data[0]['crm_field'];
      let crm_field_data = input_data_filed.split(',');
      let sql = ` SELECT ${result_data[0]['crm_data']} FROM crm_data_log WHERE client_id = ? AND crm_id = ? ORDER BY id LIMIT 200`;
      const search_value = [ClientID, id];
      clientdb.query(sql, search_value, (error, rows) => {
        //console.log("history= " + sql);
        if (error) {
          errlogRouter(1305, 'callback_history_log');
          next(error);
          return;
        }
        res.render('callback_history_log', { ok : true, rows : rows, crm_field : crm_field_data, num_rows : result_data[0]['num_rows'] });
      });

    }

  });

});
module.exports = router;
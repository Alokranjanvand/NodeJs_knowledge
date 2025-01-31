var express = require('express');
var database = require('../config/db');
var db2 = require('../config/astdb');
var db3 = require('../config/clientdb');
const { omni_wp_url, assign_sip_url, agent_version, CS_API_Port, control_server_url } = require('./constant_webrtc');
var request = require('request');
const status = require('statuses');
let moment = require('moment');
var app = express();
var errlogRouter = require('./err_log');
app.get('/alokapi', function(req, res, next) {
    res.send('This is testing api model');
});
/**
 * Campaign list
 */

const executeQuery = (query) => {
  return new Promise((resolve, reject) => {
      database.query(query, (err, results) => {
          if (err) {
              return reject(err);
          }
          resolve(results);
      });
  });
};
app.post('/campaign_list_old', function(req, res, next) 
{
  const {username, client_id}=req.body;
  //query_campaign = `SELECT campaign_id,priority FROM user_campaign_map WHERE user_id = "${username}" and client_id="${client_id}" group by campaign_id limit 200`;
  query_campaign = `SELECT campaign_type,campaign_id,priority FROM user_campaign_map uc left join campaign c on c.client_id=uc.client_id and uc.campaign_id=c.name
  WHERE uc.user_id = '${username}' and uc.client_id='${client_id}' group by campaign_id limit 200`;
  //console.log(query_campaign);
  database.query(query_campaign, function(error, data){
    if (error){
      errlogRouter(24,'campaign_list_old');
      next(error);
      return; // Exit to prevent further execution
    }
    res.send(data);
  });
});
/*
* function Load_Campaign_List
* to get the list of the campaign with the priority mapped to the agent.
*/
const loadUserMode = async (clientID, userID, campaignName) => {
  const userModeData = {
      UserModeIndexLabel: {},
      UserModeIndexID: [],
      UserModeRecall: []};
      // First Query
      const query1 = `SELECT u.user_mode, m.mode_index, u.is_recall FROM map_user_mode m 
          LEFT JOIN user_mode u 
          ON m.mode_index = u.mode_index AND m.client_id = u.client_id WHERE m.client_id = "${clientID}" AND m.user_id = "${userID}"`;
    //console.log(query1);
      // Second Query
      const query2 = `SELECT m.user_mode, mm.mode_id AS mode_index, m.is_recall FROM user_mode m 
          LEFT JOIN campaign_mode_map mm 
          ON mm.mode_id = m.mode_index AND m.client_id = mm.client_id  WHERE mm.client_id = "${clientID}" AND mm.campaign_id = "${campaignName}"`;

      // Execute both queries and combine results
      // Execute both queries
      const [result1, result2] = await Promise.all([
        executeQuery(query1),
        executeQuery(query2)
    ]);

    // Combine results
    const combinedResults = [...result1, ...result2];

      // Process the combined results
      combinedResults.forEach(row => {
          const userMode = String(row.user_mode);
          if (userMode.length > 0) {
              userModeData.UserModeIndexLabel[row.mode_index] = row.user_mode;
              userModeData.UserModeIndexID.push(row.mode_index);
              userModeData.UserModeRecall.push(row.is_recall);
          }
      });
  return userModeData;
};

app.post('/campaign_list', async function(req, res, next) 
{
  const {username, client_id, CampaignName}=req.body;
  //query_campaign = `SELECT campaign_id,priority FROM user_campaign_map WHERE user_id = "${username}" and client_id="${client_id}" group by campaign_id limit 200`;
  query_campaign = `SELECT campaign_type,campaign_id,priority FROM user_campaign_map uc left join campaign c on c.client_id=uc.client_id and uc.campaign_id=c.name
  WHERE uc.user_id = '${username}' and uc.client_id='${client_id}' group by campaign_id limit 200`;
  //console.log(query_campaign);
  const myArray = [];
  database.query(query_campaign, async function(error, data){
    if (error){
      errlogRouter(41,'campaign_list');
      next(error);
      return; // Exit to prevent further execution
    }

    for(var count = 0; count < data.length; count++)
    {
      newarr=data[count].campaign_id+'~'+data[count].priority;
      myArray.push(newarr);
    }
    if (CampaignName != '') 
    {
        const checkinsertuser =await loadUserMode(client_id, username, CampaignName);
        myArray.push(checkinsertuser);
    }
    //console.log("myArray",myArray+" data",data);
    res.send({ok:true,campaign:data,Queue_Priority:myArray});
  });
});
////check client_id based on client_alias

/** code by jai */
app.post('/getiscallback', function(req, res, next) 
{
  const {disposition, client_id}=req.body;
  query_campaign = 'select is_callback from disposition_master where client_id="'+client_id+'" and name="'+disposition+'" limit 1';
  //console.log(query_campaign);
  database.query(query_campaign, function(error, data){
    if (error){
      errlogRouter(64,'getiscallback');
      next(error);
      return; // Exit to prevent further execution
    }
    res.send({status:true,data});
  });
});
app.post('/getiscallbackd', function(req, res, next) 
{
  const {disposition, client_id, node_id, campaign_name}=req.body;
  query_campaign = 'SELECT d.is_callback FROM decision_campaign_disposition_map m left join disposition_master d on d.name=disposition_id and d.client_id=m.client_id where m.disposition_id="'+disposition+'" and m.campaign_id="'+campaign_name+'" and m.node_id="'+node_id+'" and m.client_id="'+client_id+'" limit 1';
  //console.log(query_campaign);
  database.query(query_campaign, function(error, data){
    if (error){
      errlogRouter(78,'getiscallbackd');
      next(error);
      return; // Exit to prevent further execution
    }
    res.send({status:true,data});
  });
});
app.post('/getissubcallback', function(req, res, next) 
{
  const {disposition,sub_disposition_id, client_id}=req.body;
  query_campaign = 'select is_callback from sub_disposition_master where client_id="'+client_id+'" and disposition_id="'+disposition+'" and name="'+sub_disposition_id+'" limit 1';
  //console.log(query_campaign);
  database.query(query_campaign, function(error, data){
    if (error){
      errlogRouter(92,'getissubcallback');
      next(error);
      return; // Exit to prevent further execution
    }
    res.send({status:true,data});
  });
});
app.post('/getissubcallbackd', function(req, res, next) 
{
  const {disposition,sub_disposition_id, client_id, node_id, campaign_name}=req.body;
  query_campaign = 'SELECT d.is_callback FROM decision_campaign_sub_disposition_map m left join sub_disposition_master d on d.disposition_id=m.disposition_id and d.name=m.sub_disposition_id and d.client_id=m.client_id  where m.disposition_id="'+disposition+'" and m.sub_disposition_id="'+sub_disposition_id+'" and m.campaign_id="'+campaign_name+'" and m.node_id="'+node_id+'" and m.client_id="'+client_id+'" limit 1';
  //console.log(query_campaign);
  database.query(query_campaign, function(error, data){
    if (error){
      errlogRouter(106,'getissubcallbackd');
      next(error);
      return; // Exit to prevent further execution
    }
    res.send({status:true,data});
  });
});
////check client_id based on client_alias
/** code by jai */
app.post('/client_name', function(req, res, next) 
{
  const {username}=req.body;
  //console.log("client_name= "+JSON.stringify(req.body));
  query_data = `SELECT * FROM vm_client WHERE user_email = "${username}" `;
  const check_client_id = ' select client_code,client_name,server_id,client_type,client_alias FROM vm_client WHERE client_alias = ? ';
    const check_client_value = [username];
    database.query(check_client_id, check_client_value, (error, result) => {
    if (error){
      errlogRouter(124,'client_name');
      next(error);
      return; // Exit to prevent further execution
    }
    if (Array.isArray(result) && result.length > 0)
    {
      res.send(JSON.stringify(result));
    }
    else
    {
      res.send({status:false,msg:"Invalid username...!"});
    }
    
    });
});
app.post('/queue_pause', function(req, res, next) 
{
  var {client_id,tag,asid,SIP_ID}=req.body;
  var pause_status=0;
  if(tag=='queue_active')
  {
      pause_status=1;
  }
  var inter='SIP/'+SIP_ID;
  const updatequeue_Query = `UPDATE queue_member_table_${asid} SET paused = ? WHERE interface = ? AND client_id = ?`;
  updatequeue_Query1 = `UPDATE queue_member_table_${asid} SET paused = '${pause_status}' WHERE interface = '${inter}' AND client_id = '${client_id}'`;
  //console.log("queue data1="+updatequeue_Query1);
  const values_queue = [pause_status, `SIP/${SIP_ID}`, client_id];
  // Execute the update query
  db2.query(updatequeue_Query, values_queue, (error, result) => {
    if (error){
      errlogRouter(155,'queue_pause');
      next(error);
      return; // Exit to prevent further execution
    }
    res.send({ status: true, data: 'Queue member updated successfully' });
  });
  
});
/** DIsposition copy list loaded */
function load_disposition(clientID, campaignName, userID, callback) {
  const campaignDisposition = { CRM_Disposition: [], DispositionMapped: 0 };
  const connection = database;  // Ensure using a single connection instance
  
  connection.query(
    `SELECT disposition AS disposition_id, is_fwd AS isFwded 
     FROM agent_campaign_disposition_map 
     WHERE client_id = ? AND UPPER(campaign_id) = ? AND UPPER(user_id) = ?
     ORDER BY disposition`,
    [clientID, campaignName.toUpperCase(), userID.toUpperCase()],
    (err, rows) => {
      if (err) {
        return callback(err);
      }
      
      if (rows.length === 0) {
        connection.query(
          `SELECT DISTINCT disposition_id, '0' AS isFwded 
           FROM campaign_disposition_map 
           WHERE client_id = ? AND UPPER(campaign_id) = ? 
           ORDER BY disposition_id`,
          [clientID, campaignName.toUpperCase()],
          (err, distinctRows) => {
            if (err) {
              return callback(err);
            }

            campaignDisposition.DispositionMapped = 0;

            if (distinctRows.length === 0) {
              return callback(null, campaignDisposition);
            }

            let processedCount = 0;
            distinctRows.forEach((row) => {
              connection.query(
                `SELECT is_callback 
                 FROM disposition_master 
                 WHERE client_id = ? AND LOWER(name) = ?`,
                [clientID, row.disposition_id.toLowerCase()],
                (err, res) => {
                  if (err) {
                    return callback(err);
                  }

                  const isCallback = res.length > 0 ? res[0].is_callback : 0;
                  campaignDisposition.CRM_Disposition.push(`${row.disposition_id}`);
                  processedCount++;
                  if (processedCount === distinctRows.length) {
                    callback(null, campaignDisposition);
                  }
                }
              );
            });
          }
        );
      } else {
        campaignDisposition.DispositionMapped = 1;

        let processedCount = 0;
        rows.forEach((row) => {
          connection.query(
            `SELECT is_callback 
             FROM disposition_master 
             WHERE client_id = ? AND LOWER(name) = ?`,
            [clientID, row.disposition_id.toLowerCase()],
            (err, res) => {
              if (err) {
                return callback(err);
              }

              const isCallback = res.length > 0 ? res[0].is_callback : 0;
              campaignDisposition.CRM_Disposition.push(`${row.disposition_id}`);
              processedCount++;
              if (processedCount === rows.length) {
                callback(null, campaignDisposition);
              }
            }
          );
        });
      }
    }
  );
}

app.post('/disposition_list2', function(req, res, next) {
  const { client_id, campaign_name, user_id } = req.body;
  //console.log("disposition_list= " + JSON.stringify(req.body));

  load_disposition(client_id, campaign_name, user_id, (err, result) => {
    if (err) {
        errlogRouter(255,'Function load_disposition');
        next(err);
        return;
    } else {
      return res.send({ status: true, data: result });
    }
  });
});

/** DIsposition list loaded */
app.post('/disposition_list', function(req, res, next) {
  var { client_id, campaign_name, user_id } = req.body;
  const campaignDisposition = { status: false,CRM_Disposition: [], DispositionMapped: 0 };
  var query_agent_disp = `SELECT disposition AS disposition_id FROM agent_campaign_disposition_map WHERE client_id = ? AND campaign_id = ? AND user_id = ? ORDER BY disposition`;
  var result_agent_disp = [client_id, campaign_name, user_id];
  database.query(query_agent_disp, result_agent_disp, (error, result) => {
    if (error) {
      errlogRouter(272,'disposition_list');
      next(error);
      return;
    }
    if(result.length === 0)
    {
      campaignDisposition.DispositionMapped = 0;
      var query_disp = `SELECT DISTINCT disposition_id FROM campaign_disposition_map WHERE client_id = ? AND campaign_id = ? ORDER BY disposition_id`;
      var result_disp = [client_id, campaign_name];
      database.query(query_disp, result_disp, (dserror, dsresult) => {
        if (dserror) {
          errlogRouter(283,'disposition_list');
          next(dserror);
          return;
        }
        if (Array.isArray(dsresult) && dsresult.length > 0) {
          var count = 0;
          campaignDisposition.status = true;
          while (count < dsresult.length) {
            campaignDisposition.CRM_Disposition.push(dsresult[count].disposition_id);
            count++;
          }
          res.send(campaignDisposition);
        }
        else {
          res.send({status: false, msg: "Invalid disposition...!"});
        }
      });

    }
    else if (Array.isArray(result) && result.length > 0) {
      campaignDisposition.DispositionMapped = 1;
      var count = 0;
      campaignDisposition.status = true;
      while (count < result.length) {
        campaignDisposition.CRM_Disposition.push(result[count].disposition_id);
        count++;
      }
      res.send(campaignDisposition);
    } else {
      res.send({status: false, msg: "Invalid disposition...!"});
    }
  });
});
app.post('/tree_disposition_list', function(req, res, next) {
  var { client_id, campaign_name , node_id} = req.body;
  const campaignDisposition = { status: false,CRM_Disposition: [], DispositionMapped: 0 };
  var query_agent_disp=`select distinct disposition_id from decision_campaign_disposition_map where node_id = ? and client_id = ? and  campaign_id = ?`;
  var result_agent_disp = [node_id, client_id, campaign_name];
  database.query(query_agent_disp, result_agent_disp, (error, result) => {
    if (error) {
      errlogRouter(272,'disposition_list');
      next(error);
      return;
    }
    if (Array.isArray(result) && result.length > 0) {
      campaignDisposition.DispositionMapped = 1;
      var count = 0;
      campaignDisposition.status = true;
      while (count < result.length) {
        campaignDisposition.CRM_Disposition.push(result[count].disposition_id);
        count++;
      }
      res.send(campaignDisposition);
    } else {
      res.send({status: false, msg: "Invalid disposition...!"});
    }
  });
});

/**** Load Subdisposition list */
app.post('/sub_disposition_list', function(req, res, next) {
  var disposition_id = req.body.disposition_id;
  var client_id = req.body.client_id;
  var campaign_name = req.body.campaign_name;
  var sub_dispose_arr = [];
  var query_sub_disp = 'select sub_disposition_id FROM campaign_sub_disposition_map WHERE campaign_id = ? AND client_id = ? AND disposition_id = ?';
  var result_sub_disp = [campaign_name, client_id, disposition_id];

  database.query(query_sub_disp, result_sub_disp, (error, result) => {
    if (error) {
      errlogRouter(328,'sub_disposition_list');
      next(error);
      return;
    }

    if (Array.isArray(result) && result.length > 0) {
      var count = 0;
      while (count < result.length) {
        sub_dispose_arr.push(result[count].sub_disposition_id);
        count++;
      }
      res.send({status: true, data: sub_dispose_arr});
    } else {
      res.send({status: false, msg: "Invalid username...!"});
    }
  });
});

//List of decision Sub disposition Jainul
app.post('/sub_disposition_listd', function(req, res, next) {
  var disposition_id = req.body.disposition_id;
  var client_id = req.body.client_id;
  var campaign_name = req.body.campaign_name;
  var node_id = req.body.node_id;
  var sub_dispose_arr = [];
  var query_sub_disp = 'select sub_disposition_id FROM decision_campaign_sub_disposition_map WHERE campaign_id = ? AND client_id = ? AND disposition_id = ? AND node_id = ?';
  var result_sub_disp = [campaign_name, client_id, disposition_id, node_id];

  database.query(query_sub_disp, result_sub_disp, (error, result) => {
    if (error) {
      errlogRouter(328,'sub_disposition_listd');
      next(error);
      return;
    }

    if (Array.isArray(result) && result.length > 0) {
      var count = 0;
      while (count < result.length) {
        sub_dispose_arr.push(result[count].sub_disposition_id);
        count++;
      }
      res.send({status: true, data: sub_dispose_arr});
    } else {
      res.send({status: false, msg: "Sub Disposition is not available...!"});
    }
  });
});
/*** Get Sub */
function getToUser(toNumber, clientID, callback) {
  let toUser = toNumber;
  //console.log("function getToUser="+toNumber);

  if (toNumber.length < 6) {
      const query = `
          SELECT name 
          FROM user_status 
          WHERE client_id = ? AND sipid = ? 
          LIMIT 1
      `;
      //const query2 = 'SELECT name FROM user_status  WHERE client_id ='+clientID+'  AND sipid ='+toNumber+' LIMIT 1';
      //console.log(query2);
      database.query(query, [clientID, toNumber], (error, results) => {
          if (error) {
              return callback(error);
          }

          if (results.length === 1) {
              toUser = results[0].name;
          }

          callback(null, toUser);
      });
  } else {
      callback(null, toUser);
  }
}
/*** VALIDATE USER LOGIN BY ALOK */
function validateUserLogin(clientID, userStatusID, callback) {
  //var sql = 'SELECT id FROM user_status WHERE client_id = ? AND id = ?';
  var sql_validate_user = `SELECT id FROM user_status WHERE client_id = '${clientID}' AND id = '${userStatusID}'`;
  //console.log("validateUserLogin1= "+sql_validate_user);
  database.query(sql_validate_user, (err, results) => {
    if (err)
    {
      console.log("Error in user_status line number 412");
      callback({status:false,msg_err:err,line_number:465})
      var isValid=true;
    }
    var isValid = results.length > 0;
    //console.log("alok valid= "+isValid);
    //var isValid=1;
    //console.log("Error in user_status line number 419"+isValid);
    callback(isValid);
  });
}

// SaveUserModeLog function by Alok
function saveUserModeLog(clientID, loginHourID, modeDBId, emailCount, smsCount, idleDuration, wrapupDuration, holdCount, holdDuration, recallCount, recallDuration, breakDuration, moDuration, transferCount, userStatusID, callback) {
  
  var updateLoginHour = `UPDATE loginhour SET logout_time = SYSDATE() WHERE client_id = '${clientID}' AND id = '${loginHourID}'`;
  //console.log("saveUserModeLog1= "+updateLoginHour);
  database.query(updateLoginHour, (err, result) => {
  if(err)
    {
      //console.log("error in loginhour line 430");
      return callback({status:false,msg_err:err,line_number:432});
    }
    
    var updateUserModeAction = ` UPDATE user_mode_action SET end_time = SYSDATE(), email_count = '${emailCount}', sms_count = '${smsCount}' WHERE client_id = '${clientID}' AND id = '${modeDBId}'`;
    //console.log("saveUserModeLog1= "+updateUserModeAction);
    database.query(updateUserModeAction, (mode_err, mode_result) => {
      if(mode_err)
        {
          //console.log("error in user_mode_action line 439");
          return callback({status:false,line_number:440});
        }
        callback(null, mode_result);
    });
  });
}

// ImgSaveMoRemarks_Click function
function imgSaveMoRemarksClick(
  txtMoRemarks, MoRemarksID, lineSelected, isLine2Busy, isLineBusy, ClientID, SIP_ID, SERVER_IP, CS_API_Port, 
  loginHourID, modeDBId, emailCount, smsCount, idleDuration, wrapupDuration, holdCount, holdDuration, 
  recallCount, recallDuration, breakDuration, moDuration, transferCount, userStatusID, callback
) {
    const updateMoRemarksQuery = `UPDATE moremarks SET mo_end_time = SYSDATE(), mo_remarks = '${txtMoRemarks}' WHERE id = '${MoRemarksID}'`;
  //console.log("imgSaveMoRemarksClick= " +updateMoRemarksQuery);
  database.query(updateMoRemarksQuery, (err, result) => {
    if(err)
    {
      //console.log("error in imgSaveMoRemarksClick");
      return callback({status:false,msg_err:err,line_number:460});
    }
    saveUserModeLog(ClientID, loginHourID, modeDBId, emailCount, smsCount, idleDuration, wrapupDuration, holdCount, holdDuration, recallCount, recallDuration, breakDuration, moDuration, transferCount, userStatusID, (err, logResult) => {
    if(err)
      {
        //console.log("error in saveUserModeLog");
        return callback({status:false,msg_err:err,line_number:465});
      }
      callback(null, logResult);
    });
    
  });
}

/*** Save MO CALLING Disposition */
app.post('/save-mo-remarks-click', (req, res, next) => {
  var {
    remarksTxt, MoRemarksID, lineSelected, isLine2Busy, isLineBusy, ClientID, SIP_ID, SERVER_IP, CS_API_Port, 
    LoginHourID, ModeDBId, emailCount, smsCount, idleDuration, wrapupDuration, holdCount, holdDuration, 
    recallCount, recallDuration, breakDuration, moDuration, transferCount, User_Status_ID
  } = req.body;
  imgSaveMoRemarksClick(
    remarksTxt, MoRemarksID, lineSelected, isLine2Busy, isLineBusy, ClientID, SIP_ID, SERVER_IP, CS_API_Port, 
    LoginHourID, ModeDBId, emailCount, smsCount, idleDuration, wrapupDuration, holdCount, holdDuration, 
    recallCount, recallDuration, breakDuration, moDuration, transferCount, User_Status_ID,
    (err, result) => {
      if(err)
      {
        errlogRouter(502,'save-mo-remarks-click');
        next(err);
        return;
      }
      var datarecord={"WaitingMoDisposition":false,"MoType":"","MoAgentName":"","MoAgentSip":"","MoCustomerPhone":"","MoStartTime":"","MoRemarksID":0};
     res.send({ok:true,data:datarecord});
    }
  );
});
// Function to save CC details
function saveCCDetail(to_Number, cc_CallType, Call_RID, Main_Call_Number, CC_Type, to_Campaign, tccRID, ClientID, LoginHourID, ModeDBId, USER_ID, CampaignName, DisplayCallerID, cc_defined_CallType = '', callback) {
  cc_defined_CallType = cc_defined_CallType || CC_Type;

  getToUser(to_Number, ClientID, (error, to_user) => {
      if (error) return callback(error, null);

      const insertArray = {
          client_id: ClientID,
          lid: LoginHourID,
          mode_id: ModeDBId,
          from_user: USER_ID,
          to_user: to_user,
          campaign: CampaignName,
          phone: Main_Call_Number,
          call_type: cc_CallType,
          tcc_type: cc_defined_CallType,
          call_rid: Call_RID,
          transfer_type: CC_Type,
          to_campaign: to_Campaign,
          tcc_rid: tccRID,
          callerid: DisplayCallerID,
          cdate: new Date()
      };
      //console.log("Tcc Details= "+JSON.stringify(insertArray));

      const query = 'INSERT INTO tcc_details SET ?';

      database.query(query, insertArray, (error, results) => {
          if (error) return callback(error, null);
          const Save_CC_Detail = results.affectedRows > 0 ? results.insertId : 0;
          return callback(null, Save_CC_Detail);
      });
  });
}
app.post('/save_tcc_details', function(req, res, next) {
  
const {to_Number,cc_CallType,Call_RID,Main_Call_Number,CC_Type,to_Campaign,tccRID,ClientID,LoginHourID,ModeDBId,USER_ID,CampaignName,DisplayCallerID,cc_defined_CallType}=req.body;
  
  saveCCDetail(to_Number, cc_CallType, Call_RID, Main_Call_Number, CC_Type, to_Campaign, tccRID, ClientID, LoginHourID, ModeDBId, USER_ID, CampaignName, DisplayCallerID, cc_defined_CallType, (error, result) => {
    if (error) {
      errlogRouter(551,'save_tcc_details');
      next(error);
      return;
    } else {
      
        //console.log('CC Detail saved with ID:', result);
        res.send({status:true,msg:"save data succesfully...!",tc_id:result});
    }
    // Close the connection when done
});
});

/*
  * function PauseInQueue
  * to restrict the agent, for getting the call in auto mode
  * while he/she is on call, or had not disposed the last call
  * 
  * to allow user to take the call, after he/she has successfully,
  * disposed the call
  */
function pauseInQueue(intState, SIP_ID, asid) {
  // Create the update query
  const updateQuery = `UPDATE queue_member_table_${asid} SET paused = ? WHERE interface = ?`;

  // Values to be inserted into the query
  const values = [intState, `SIP/${SIP_ID}`];

  // Execute the update query
  db2.execute(updateQuery, values, (err, results) => {
    if (err) {
      console.error('Error updating queue member:', err);
      return;
    }
    //console.log('Queue member updated successfully:', results);
  });
}
// Usage example
//pauseInQueue(1, '1234', '456');

///****** Save Disposition */

app.post('/save_disposition_data', function(req, res, next) {
  var {did,lead_id,remarks,disposition,sub_disp,rid,sip_id,client_id,skill,callbackdate}=req.body;
  var newdata = {did:did,skill:skill,lead_id:lead_id,remarks:remarks,disposition:disposition,sub_disp:sub_disp,dispose_status:'3',cb_time:callbackdate};
  //console.log("save dispose data"+JSON.stringify(newdata));
  var query_sub_disp = `UPDATE disposition SET ?, end_time = sysdate() WHERE rid = ? AND sip = ? AND client_id = ?`;
  var result_sub_disp = [newdata, rid, sip_id, client_id];
  db3.query(query_sub_disp, result_sub_disp, (error, result) => {
    if (error) {
      errlogRouter(601,'save_disposition_data');
      next(error);
      return;
    }
    res.send({status:true,msg:'Disposition updated successfully'});
  });
  
  });
/** Insert Mo Calling */
  app.post('/save_mo_call', function(req, res, next) 
  {
    var {USER_ID,MoType,MoAgentName,MoAgentSip,MoCustomerPhone,MoStartTime,ClientID,CampaignName,MoCampaign,Mo_count,calltype,MoRID}=req.body;
    var newmocount=Mo_count+1;
    const insertData = {
      mo_user: USER_ID,
      mo_type: MoType,
      agent: MoAgentName,
      agent_sip: MoAgentSip,
      customer_phone: MoCustomerPhone,
      mo_remarks: "NO REMARKS",
      client_id: ClientID,
      from_user_campaign: CampaignName,
      to_user_campaign: MoCampaign,
      calltype: calltype,
      rid: MoRID
    };
  
    const query = `INSERT INTO moremarks SET ?, mo_start_time = sysdate(),mo_end_time = sysdate()`;
    
    // Insert data into the database
    database.query(query, insertData, (error, results, fields) => {
      if (error) {
          errlogRouter(635,'save_mo_call');
          next(error);
          return;
      }
      DispalyPhoneNumber=MoAgentName+"!TL"+MoType;
      //console.log('Data inserted successfully, ID:', results.insertId);
      res.send({status:true,msg:'Data inserted successfully',MoRemarksID:results.insertId,DisplayCallType:'MO',MoType:MoType,MoAgentName:MoAgentName,MoAgentSip:MoAgentSip,DispalyPhoneNumber:DispalyPhoneNumber,MoCustomerPhone:MoCustomerPhone,MoStartTime:new Date(),IsInAction:true,Mo_count:newmocount,WaitingMoDisposition:true,RecordID:MoRID,CALL_TYPE:calltype});
    });
    
  });
/*this code use for save decision tree developed by jainul*/
app.post('/save_decision_tree', function(req, res, next) 
  {
	//var message=tinymce.get('message').getContent();
  var {client_id,USER_ID,campaign_name,node_id,disposition,sub_disp,callback_date,slot_id,rid,phone,remarks}=req.body;
    const insertData = {
      user: USER_ID,
	  campaign_id: campaign_name,
      node_id: node_id,
      disposition_id: disposition,
      sub_disposition_id: sub_disp,
      callback_time:  callback_date,     
      slot: slot_id,
	  rid: rid,
	  phone: phone,
	  remarks: remarks
    };
	
    const query = `INSERT INTO tree_disposition_form SET ?`;
    //const sql = mysql.format(query, insertData);
     //console.log('SQL Query:', sql);
    // Insert data into the database
    database.query(query, insertData, (error, results, fields) => {
      if (error) {
        errlogRouter(669,'save_decision_tree');
        next(error);
        return;
      }
	  res.json({ message: 'Data inserted successfully, ID: ' + results.insertId });
    });
    
    });
/*this code use for save email developed by jainul*/
app.post('/save_sendemail', function(req, res, next) 
  {
	//var message=tinymce.get('message').getContent();
  var {to,subject,clientIDmail,message,rid,USER_ID,campaign_name}=req.body;
    const insertData = {
      sender_id: USER_ID,
      recipient_id: to,
      client_id: clientIDmail,
      email_subject: subject,
      email_content: message,
      send_time:  new Date(),
      send_status: "1",
      is_new: "1",
      Campaign_Name: campaign_name,
      template_name: 'client_message',
	    rid: rid,
	  agent_id: USER_ID
    };
  
    const query = `INSERT INTO email_outbox SET ?`;
    
    // Insert data into the database
    database.query(query, insertData, (error, results, fields) => {
      if (error) {
          errlogRouter(702,'save_sendemail');
          next(error);
          return;
      }
	  res.json({ message: 'Data inserted successfully, ID: ' + results.insertId });
    });
    
    });
 app.post('/save_sendsms', function(req, res, next) 
  {
    var {to,mailbody,clientID,campaign,agent,route,template_id,config_id,url_to_tiny,rid}=req.body;
    const insertData = {
      mobile_no: to,
      template_id: template_id,
      client_id: clientID,
      message: mailbody,
      cdate: new Date(),
      sms_status:  '1',
      agent: agent,
      Campaign_Name: campaign,
      route_id: route,
      tiny_config_id: config_id,
	  tiny_url_sent: url_to_tiny,
	  rid: rid
    };
  
    const query = `INSERT INTO sms_outbox SET ?`;
    
    // Insert data into the database
    database.query(query, insertData, (error, results, fields) => {
      if (error) {
          errlogRouter(733,'save_sendsms');
          next(error);
          return;
      }
	  res.json({ message: 'Data inserted successfully, ID: ' + results.insertId });
    });
    
    });
    /** End code for jainul */


/*-----code for udit start for assign----*/
app.get('/fetchLanguages', async (req, res, next) => {
  try {
      const { user_id, client_id } = req.query;

      // Log the received query parameters
      //console.log('Received query parameters:', { user_id, client_id });

      // Fetch user language using a Promise
      const result = await new Promise((resolve, reject) => {
          const query = 'SELECT user_language FROM user WHERE user_id = ? AND client_id = ?';
          database.query(query, [user_id, client_id], (err, results) => {
              if (err) {
                errlogRouter(757,'fetchLanguages');
                next(err);
                return;
              }
              resolve(results);
          });
      });

      //console.log('Database query result:', result);

      // Check if result is an array and contains data
      if (!Array.isArray(result) || result.length === 0) {
          //console.log('No user languages found.');
          return res.json([]); // Return an empty array if no user languages found
      }

      const userLanguageRow = result[0];
      //console.log('User language row:', userLanguageRow);

      if (!userLanguageRow || !userLanguageRow.user_language) {
          //console.log('User language is not defined.');
          return res.json([]); // Return an empty array if no user languages found
      }

      const langId = userLanguageRow.user_language;
      const langIds = langId.split(',').map(id => id.trim());
      //console.log('Language IDs:', langIds);

      // Check if langIds is an array and not empty
      if (!Array.isArray(langIds) || langIds.length === 0) {
          //console.log('No valid language IDs found.');
          return res.json([]); // Return an empty array if no valid language IDs found
      }

      // Fetch languages using a Promise
      const languagesRows = await new Promise((resolve, reject) => {
          const query = 'SELECT * FROM tbl_language WHERE id IN (?) AND status = 1 ORDER BY name';
          database.query(query, [langIds], (err, results) => {
              if (err) {
                errlogRouter(796,'fetchLanguages');
                next(err);
                return;
              }
              resolve(results);
          });
      });

      //console.log('Fetched languages:', languagesRows);

      res.json(languagesRows); 
  } catch (error) {
    errlogRouter(808,'fetchLanguages');
    next(error);
    return;
  }
});


app.post('/dropdownDoctor', async (req, res, next) => {
  try {
      const { doctor_language, client_id, agent, tag } = req.body;

      if (tag !== "doctor_list") {
          return res.status(400).send('Invalid tag');
      }

      // Create a query with parameterized inputs
      const query = `
          SELECT id, name, email_id
          FROM user
          WHERE FIND_IN_SET(?, user_language)
            AND user_id != ?
            AND email_id != ''
            AND client_id = ?
          ORDER BY name
      `;

      // Use a Promise to handle the query
      const result = await new Promise((resolve, reject) => {
      database.query(query, [doctor_language, agent, client_id], (err, results) => {
              if (err) {
                errlogRouter(838,'dropdownDoctor');
                next(err);
                return;
              }
              resolve(results);
          });
      });

      // Generate HTML options
      let options = '<option value="">Select Name</option>';
      result.forEach(row => {
          const doc_id = `${row.id}~${row.name}~${row.email_id}`;
          options += `<option value="${doc_id}">${row.name.charAt(0).toUpperCase() + row.name.slice(1)}</option>`;
      });

      res.send(options);
  } catch (error) {
        errlogRouter(855,'dropdownDoctor');
        next(error);
        return;
  }
});

app.post('/dropdownSlot', (req, res, next) => {
  const { call_date, doctor_name, tag } = req.body;

  if (tag !== 'slot_list') {
      return res.status(400).send('Invalid tag');
  }

  if (!call_date) {
      return res.send('<option value="">Select Slot</option>');
  }

  const doctor_id_parts = doctor_name.split('~');
  const doctor_id = doctor_id_parts[0];
  const created_date = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14); // Format: YYYYMMDDHHMMSS
  const formatted_call_date = new Date(call_date).toISOString().slice(0, 10); // Format: YYYY-MM-DD
  const slot_date2 = formatted_call_date.replace(/-/g, ''); // Format: YYYYMMDD

  const query_slot = `
      SELECT * FROM tbl_time_slot
      WHERE slot_date = ? 
        AND id NOT IN (
            SELECT master_slot_id
            FROM tbl_time_slot_book
            WHERE user_id = ? 
              AND slot_date = ?
        )
        AND user_id = ?
      ORDER BY starttime
  `;

  database.query(query_slot, [formatted_call_date, doctor_id, formatted_call_date, doctor_id], (err, results) => {
      if (err) {
        errlogRouter(893,'dropdownSlot');
        next(err);
        return;
      }
      let options = '<option value="">Select Slot</option>';
      results.forEach(row => {
          const start = new Date(`1970-01-01T${row.starttime}`).toISOString().substr(11, 8).replace(/:/g, '');
          const newdate = slot_date2 + start;

          if (newdate > created_date) {
              options += `<option value="${row.starttime} - ${row.endtime} - ${row.id}">
                  ${new Date(`1970-01-01T${row.starttime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                  ${new Date(`1970-01-01T${row.endtime}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </option>`;
          }
      });

      res.send(options);
  });
});

app.post('/send-email', async (req, res, next) => {
  try {
      const { tag, campaign_id, clientID, customer_email, customer_name, doctor_language, doctor_name, slot_id, call_date, agent_id, product_df, link_df } = req.body;

      if (tag !== 'sent_email') {
          return res.status(400).send('Invalid tag');
      }

      // Fetch doctor language name
      const languageRows = await new Promise((resolve, reject) => {
          const query = 'SELECT name FROM tbl_language WHERE id = ?';
          database.query(query, [doctor_language], (err, results) => {
              if (err) {
                errlogRouter(893,'send-email');
                next(err);
                return;
              }
              resolve(results);
          });
      });
      if (languageRows.length === 0) {
          return res.status(400).json({ ok: false, error: 'Invalid doctor language ID' });
      }
      const doctorLanguage = languageRows[0].name;

      // Extract details from doctor_name
      const [doctorId, doctorName, doctorEmail] = doctor_name.split("~");

      // Extract slot details
      const [slotStart, slotEnd, slotId] = slot_id.split("-");

      // Format call_date
      const [day, month, year] = call_date.split("-");
      const formattedDate = `${year}-${month}-${day}`;

      // Fetch email templates
      const clientTemplateRows = await new Promise((resolve, reject) => {
          const query = 'SELECT email_subject, email_content FROM email_template WHERE email_type = "client_message" AND campaign_name = ? AND client_id = ?';
          database.query(query, [campaign_id, clientID], (err, results) => {
              if (err) {
                errlogRouter(954,'send-email');
                next(err);
                return;
              }
              resolve(results);
          });
      });
      if (clientTemplateRows.length === 0) {
          return res.status(400).json({ ok: false, error: 'Client email template not found' });
      }

      const agentTemplateRows = await new Promise((resolve, reject) => {
          const query = 'SELECT email_subject, email_content FROM email_template WHERE email_type = "agent_message" AND campaign_name = ? AND client_id = ?';
          database.query(query, [campaign_id, clientID], (err, results) => {
              if (err) {
                errlogRouter(969,'send-email');
                next(err);
                return;
              }
              resolve(results);
          });
      });
      if (agentTemplateRows.length === 0) {
          return res.status(400).json({ ok: false, error: 'Agent email template not found' });
      }

      const clientSubject = clientTemplateRows[0].email_subject;
      let clientMessage = clientTemplateRows[0].email_content;
      if (!clientMessage) {
          return res.status(400).json({ ok: false, error: 'Client email content is blank' });
      }
      const doctor_data = doctor_name;
      const name_crm_name = doctor_data.split("~");
      clientMessage = clientMessage
          .replace('{Name_crm}', name_crm_name[1])
          .replace('{slot_date}', call_date)
          .replace('{slot_start}', slotStart)
          .replace('{slot_end}', slotEnd)
          .replace('{language}', doctorLanguage)
          .replace('{representative_name}', doctorName)
          .replace('{Product}', product_df)
          .replace('{Meeting_Link}', link_df);

      const agentSubject = agentTemplateRows[0].email_subject;
      let agentMessage = agentTemplateRows[0].email_content;
      if (!agentMessage) {
          return res.status(400).json({ ok: false, error: 'Agent email content is blank' });
      }
      agentMessage = agentMessage
          .replace('{Name_crm}', customer_name)
          .replace('{slot_date}', call_date)
          .replace('{slot_start}', slotStart)
          .replace('{slot_end}', slotEnd)
          .replace('{language}', doctorLanguage)
          .replace('{representative_name}', doctorName)
          .replace('{Product}', product_df)
          .replace('{Meeting_Link}', link_df);

      // Insert into email_outbox
     await new Promise((resolve, reject) => {
  const query = 'INSERT INTO email_outbox (sender_id, recipient_id, client_id, email_subject, email_content, send_time, send_status, is_new, Campaign_Name, template_name) VALUES (?, ?, ?, ?, ?, NOW(), 1, 1, ?, "agent_message")';
  const values = [agent_id, doctorEmail, clientID, agentSubject, agentMessage, campaign_id];
  const formattedQuery = formatQuery(query, values);
  
  //console.log('Formatted query:', formattedQuery);
  
  database.query(query, values, (err, results) => {
      if (err) {
        errlogRouter(1020,'send-email');
        next(err);
        return;
      }
      resolve(results);
  });
});

      await new Promise((resolve, reject) => {
          const query = 'INSERT INTO email_outbox (sender_id, recipient_id, client_id, email_subject, email_content, send_time, send_status, is_new, Campaign_Name, template_name) VALUES (?, ?, ?, ?, ?, NOW(), 1, 1, ?, "client_message")';
          database.query(query, [agent_id, customer_email, clientID, clientSubject, clientMessage, campaign_id], (err, results) => {
              if (err) {
                errlogRouter(1032,'send-email');
                next(err);
                return;
              }
              resolve(results);
          });
      });

      // Insert into tbl_time_slot_book
      await new Promise((resolve, reject) => {
          const query = 'INSERT INTO tbl_time_slot_book (user_id, master_slot_id, slot_date) VALUES (?, ?, ?)';
          database.query(query, [doctorId, slotId, formattedDate], (err, results) => {
              if (err) {
                errlogRouter(1045,'send-email');
                next(err);
                return;
              }
              resolve(results);
          });
      });

      res.json({ ok: true });
  } catch (error) {
      errlogRouter(1055,'send-email');
      console.error('Error occurred:', error);
      res.status(500).json({ ok: false });
      return false;
  }
});

function formatQuery(query, values) {
  let formattedQuery = query;
  values.forEach((value, index) => {
      const placeholder = `?`;
      if (typeof value === 'string') {
          formattedQuery = formattedQuery.replace(placeholder, `'${value.replace(/'/g, "\\'")}'`);
      } else if (typeof value === 'number') {
          formattedQuery = formattedQuery.replace(placeholder, value);
      } else if (value === null) {
          formattedQuery = formattedQuery.replace(placeholder, 'NULL');
      }
  });
  return formattedQuery;
}
/*-----code for udit end for assign ----*/

/*-----code for udit start for call logs ----*/

app.post('/zone-list', async function(req, res, next) {
    let clientID = req.body.clientID; // Example clientID
    let zone = '';

    // Helper function to wrap database queries in Promises
    const queryPromise = (query, params) => {
        return new Promise((resolve, reject) => {
            database.query(query, params, (error, results) => {
              if (error){
                errlogRouter(1089,'zone-list');
                next(error);
                return;
              }
              resolve(results);
            });
        });
    };

    try {
        // Fetch system time zone
        let systemTimeZoneResult = await queryPromise('SELECT @@system_time_zone as tz', []);
       
        if (systemTimeZoneResult.length > 0) {
            zone = systemTimeZoneResult[0].tz;
        } else {
            //console.log('No system time zone found');
        }

        // Fetch zone time
        let db_time = '';
        let zoneTimeResult = await queryPromise(
            'SELECT zone_time_1 FROM zone_time WHERE zone_name = ?', [zone]
        );
        //console.log('Zone Time Result:', zoneTimeResult);

        if (zoneTimeResult.length > 0) {
            db_time = zoneTimeResult[0].zone_time_1;
        } else {
            //console.log('No zone time found for zone:', zone);
        }

        // Adjust db_time sign
        let dbtime = db_time.startsWith('-') ? db_time.replace('-', '+') : `-${db_time}`;
       
        // Fetch zones and calculate adjusted times
        let array = { Zone: [], Zone_Time: [] };
        let zoneResult = await queryPromise(
            'SELECT zone_name, zone_time_1, zone_time_2 FROM zone_time GROUP BY zone_name', []
        );
        if (zoneResult.length > 0) {
            zoneResult.forEach((row, index) => {
                let seconds = (parseFloat(row.zone_time_1) + parseFloat(dbtime)).toFixed(2);
                array.Zone_Time[index] = `${row.zone_name}~${seconds}~${zone}~${row.zone_time_2}`;
                array.Zone[index] = row.zone_name; // Add zone names to the Zone array
            });
        } else {
            //console.log('No zones found');
        }

        res.json({ zone: array.Zone, ok: true, data: array });
    } catch (error) {
      errlogRouter(1141,'zone-list');
      next(error);
      return;
    }
});


const convertTimezone = (source_date_time, timezone_diff) => {
  //console.log("source_date_time= "+source_date_time);
  let date = new Date(source_date_time);
  let time_duration = parseInt(timezone_diff); // Convert hours to seconds
  date.setSeconds(date.getSeconds() + time_duration); // Adjust the seconds
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  // Format the date as yyyy-mm-dd hh:mm:ss
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  //console.log("Formatted Date: " + formattedDate);
  return formattedDate;
};


const convertTimezone1 = (source_date_time, timezone_diff_in_sec) => {
    const date = new Date(source_date_time);
    const adjustedDate = new Date(date.getTime() + timezone_diff_in_sec * 1000);

    // Get the components of the date
    const year = adjustedDate.getFullYear();
    const month = adjustedDate.toLocaleString('en-US', { month: 'short' });
    const day = String(adjustedDate.getDate()).padStart(2, '0');
    const hours = String(adjustedDate.getHours() % 12 || 12).padStart(2, '0');
    const minutes = String(adjustedDate.getMinutes()).padStart(2, '0');
    const seconds = String(adjustedDate.getSeconds()).padStart(2, '0');
    const ampm = adjustedDate.getHours() >= 12 ? 'PM' : 'AM';

    // Format the date
    return `${year}, ${month} ${day} ${hours}:${minutes}:${seconds} ${ampm}`;
};

const queryClientDatabase = (query, params) => {
    return new Promise((resolve, reject) => {
        db3.query(query, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

const queryMainDatabase = (query, params) => {
    return new Promise((resolve, reject) => {
        database.query(query, params, (err, results) => {
            if (err) {
                return reject(err);
            }
            resolve(results);
        });
    });
};

const maskNumber = (strNum) => {
    return 'X'.repeat(strNum.trim().length);
};

const isNumeric = (value) => {
    return /^-?\d+$/.test(value);
};

app.post('/disposition-log-search', async (req, res, next) => {
   
        const {search,USER_ID,isDisplayPhone,ClientID,startdate,enddate,mns,time_formate,disp,sub_disp} = req.body;
        //console.log("dispose=log= "+JSON.stringify(req.body));
        let startDateFormatted;
        let endDateFormatted;
        time_duration=parseInt(time_formate);
        if(time_duration=='-52200' || time_duration=='-55800' || time_duration=='-59400')
          {
              startDateFormatted = moment(startdate).add(+1, 'days').format('YYYY-MM-DD 00:00');
          }else
          {
            startDateFormatted = moment(startdate).format('YYYY-MM-DD 00:00');
          }
        endDateFormatted = convertIndiaTimezone(enddate, time_duration);
        const array = { ok: false, tbody: '', count: '' };
        const dispositions = [];

        let query = `
            SELECT d.phone AS dphone, d.start_time, d.did_number, d.disposition, d.sub_disp, 
                   d.call_type, d.campaign AS dcampaign, d.remarks, c.*
            FROM disposition d
            LEFT JOIN crm_data c ON d.did = c.id AND d.client_id = c.client_id
            WHERE d.agent = ? AND d.client_id = ? 
              AND DATE_FORMAT(d.start_time, '%Y-%m-%d %H:%i:%s') >= ? 
              AND DATE_FORMAT(d.start_time, '%Y-%m-%d %H:%i:%s') <= ?
              AND d.call_type != 'EC'
        `;

        const params = [USER_ID, ClientID, startDateFormatted, endDateFormatted];
        //console.log(" dispose search data= "+JSON.stringify(params));

        if (search.match(/^\d+$/) && search.length === 10) {
            if (mns == 1 && search != '') {
                const res = await queryClientDatabase(`
                    SELECT id 
                    FROM crm_data 
                    WHERE client_id = ? 
                      AND (RIGHT(phone, 10) = ? OR RIGHT(phone1, 10) = ? OR RIGHT(phone2, 10) = ? OR RIGHT(phone3, 10) = ?)
                    ORDER BY id DESC 
                    LIMIT 1
                `, [ClientID, search.substr(-10), search.substr(-10), search.substr(-10), search.substr(-10)]);

                if (res.length > 0 ) {
                    query += ' AND d.did = ?';
                    params.push(res[0].id);
                }
            } else {
                if(search != '')
                {
                  query += ' AND RIGHT(d.phone, 10) = ?';
                  params.push(search.substr(-10));
                } 
            }
        } else {
            if(search != '')
            {
                query += ' AND c.f1 LIKE ?';
                params.push('%' + search + '%');
            }
        }
        if(disp != '')
        {
            query += ' AND d.disposition = ?';
            params.push(disp);
        }
        if(sub_disp != '')
          {
              query += ' AND d.sub_disp = ?';
              params.push(sub_disp);
          }
        query += ' ORDER BY d.campaign ASC, d.start_time DESC LIMIT 200';
         //console.log("Disposition Query= "+query); 
         //console.log("Param Query= "+JSON.stringify(params)); 
        const rows = await queryClientDatabase(query, params);

          if (rows.length > 0) {
            array.ok = true;
            let i = 1;
            let CampaignName = '';
            let maxCrmField = 0;
            let disposition = "<table class='table table-hover'>";
            const crmFieldDfid = [];
            const maskedCheck = {};

            for (const row of rows) {
                for (const key in row) {
                    row[key] = row[key] ? row[key].toString().toUpperCase() : '';
                }

                const phone = isDisplayPhone === "false" ? maskNumber(row.dphone) : row.dphone;

                if (CampaignName !== row.dcampaign) {
                    CampaignName = row.dcampaign;
                    let head = '';
                    crmFieldDfid.length = 0;

                    if (i > 1) {
                        disposition += "</tbody>";
                    }

                    head += "<thead background-color: #ffffffbf;><tr><th>#</th><th nowrap>Campaign</th><th nowrap>Phone</th><th nowrap>Date</th><th nowrap>DID</th><th nowrap>Disposition</th><th nowrap>Sub Disposition</th><th nowrap>Type</th><th nowrap>Start Time</th><th nowrap>Remarks</th>";

                    const crmFields = await queryMainDatabase(`
                        SELECT fcaption, dfid, is_masked 
                        FROM crm_config 
                        WHERE campaign = ? AND client_id = ? 
                        ORDER BY fid
                    `, [CampaignName, ClientID]);

                    if (crmFields.length > maxCrmField) {
                        maxCrmField = crmFields.length;
                    }

                    for (const crmField of crmFields) {
                        head += `<th nowrap>${crmField.fcaption}</th>`;
                        crmFieldDfid.push("f" + crmField.dfid);
                        maskedCheck["f" + crmField.dfid] = crmField.is_masked;
                    }

                    head += "</tr></thead><tbody>";
                    disposition += head;
                    i = 1;
                }

                const start_date_time = convertTimezone(row.start_time, time_formate).split(' ');
                disposition += `
                    <tr id="${row.dphone}" data-select="${i}${row.dphone}" data-crm-dataid="${row.id}" ondblclick="calllog_dialling('${row.dphone}','${row.id}')">
                        <td nowrap>${i}</td>
                        <td nowrap>${row.dcampaign}</td>
                        <td nowrap>${phone}</td>
                        <td nowrap>${start_date_time[0]}</td>
                        <td nowrap>${row.did_number}</td>
                        <td nowrap>${row.disposition}</td>
                        <td nowrap>${row.sub_disp}</td>
                        <td nowrap>${row.call_type}</td>
                        <td nowrap>${start_date_time[1]}</td>
                        <td nowrap>${row.remarks}</td>
                `;

                for (const dfid of crmFieldDfid) {
                    disposition += `<td nowrap>${maskedCheck[dfid] == 1 && isDisplayPhone === "false" ? 'X'.repeat(row[dfid].length) : row[dfid]}</td>`;
                }

                disposition += "</tr>";
                dispositions.push(row.disposition.toUpperCase());
                i++;
            }

            disposition += "</tbody></table>";
            array.tbody = disposition;
        }

        const dispositionCounts = {};
        for (const disposition of dispositions) {
            dispositionCounts[disposition] = (dispositionCounts[disposition] || 0) + 1;
        }

        let count = '';
        let dispose_number=1;
        let total_disposition=0;
        for (const key in dispositionCounts) {
            count += `<tr><td>${dispose_number}</td><td>${key}</td><td>${dispositionCounts[key]}</td></tr>`;
            dispose_number++;
            total_disposition+=dispositionCounts[key];
        }
        count += `<tr><th></th><th>Total</th><th>${total_disposition}</th></tr>`;
        array.count = count;

        res.json(array);

    
});

/**********New tab Call Log*********** */
app.post('/webrtc_calllog', async (req, res, next) => {

  const {search,USER_ID,isDisplayPhone,ClientID,startdate,enddate,mns,time_formate,disp,sub_disp} = req.body;
  //console.log("webrtc_calllog=log= "+JSON.stringify(req.body));
  let startDateFormatted;
  let endDateFormatted;
  time_duration=parseInt(time_formate);
  if(time_duration=='-52200' || time_duration=='-55800' || time_duration=='-59400')
    {
        startDateFormatted = moment(startdate).add(+1, 'days').format('YYYY-MM-DDT00:00');
    }else
    {
        startDateFormatted = moment(startdate).format('YYYY-MM-DD 00:00');
    }
  endDateFormatted = convertIndiaTimezone(enddate, time_duration);
  //console.log("Converted Start Date= "+startDateFormatted+" End Date= "+endDateFormatted);

  const array = { ok: false, tbody: '', count: '' };
  const dispositions = [];

  let query = `
      SELECT d.phone AS dphone, d.start_time, d.did_number, d.disposition, d.sub_disp, 
             d.call_type, d.campaign AS dcampaign, d.remarks, c.*
      FROM disposition d
      LEFT JOIN crm_data c ON d.did = c.id AND d.client_id = c.client_id
      WHERE d.agent = ? AND d.client_id = ? 
        AND DATE_FORMAT(d.start_time, '%Y-%m-%d %H:%i:%s') >= ? 
        AND DATE_FORMAT(d.start_time, '%Y-%m-%d %H:%i:%s') <= ?
        AND d.call_type != 'EC'
  `;

  const params = [USER_ID, ClientID, startDateFormatted, endDateFormatted];
  //console.log(" dispose search data= "+JSON.stringify(params));

  if (search.match(/^\d+$/) && search.length === 10) {
      if (mns == 1 && search != '') {
          const res = await queryClientDatabase(`
              SELECT id 
              FROM crm_data 
              WHERE client_id = ? 
                AND (RIGHT(phone, 10) = ? OR RIGHT(phone1, 10) = ? OR RIGHT(phone2, 10) = ? OR RIGHT(phone3, 10) = ?)
              ORDER BY id DESC 
              LIMIT 1
          `, [ClientID, search.substr(-10), search.substr(-10), search.substr(-10), search.substr(-10)]);

          if (res.length > 0 ) {
              query += ' AND d.did = ?';
              params.push(res[0].id);
          }
      } else {
          if(search != '')
          {
            query += ' AND RIGHT(d.phone, 10) = ?';
            params.push(search.substr(-10));
          } 
      }
  } else {
      if(search != '')
      {
          query += ' AND c.f1 LIKE ?';
          params.push('%' + search + '%');
      }
  }
  if(disp != '')
  {
      query += ' AND d.disposition = ?';
      params.push(disp);
  }
  if(sub_disp != '')
    {
        query += ' AND d.sub_disp = ?';
        params.push(sub_disp);
    }
  query += ' ORDER BY d.campaign ASC, d.start_time DESC LIMIT 200';
//console.log(query);
  const rows = await queryClientDatabase(query, params);

    if (rows.length > 0) {
      array.ok = true;
      let i = 1;
      let CampaignName = '';
      let maxCrmField = 0;
      let disposition = "<table class='table table-hover'>";
      const crmFieldDfid = [];
      const maskedCheck = {};

      for (const row of rows) {
          for (const key in row) {
              row[key] = row[key] ? row[key].toString().toUpperCase() : '';
          }

          const phone = isDisplayPhone === "false" ? maskNumber(row.dphone) : row.dphone;

          if (CampaignName !== row.dcampaign) {
              CampaignName = row.dcampaign;
              let head = '';
              crmFieldDfid.length = 0;

              if (i > 1) {
                  disposition += "</tbody>";
              }

              head += "<thead background-color: #ffffffbf;><tr><th>#</th><th nowrap>Campaign</th><th nowrap>Phone</th><th nowrap>Date</th><th nowrap>DID</th><th nowrap>Disposition</th><th nowrap>Sub Disposition</th><th nowrap>Type</th><th nowrap>Start Time</th><th nowrap>Remarks</th>";

              const crmFields = await queryMainDatabase(`
                  SELECT fcaption, dfid, is_masked 
                  FROM crm_config 
                  WHERE campaign = ? AND client_id = ? 
                  ORDER BY fid
              `, [CampaignName, ClientID]);

              if (crmFields.length > maxCrmField) {
                  maxCrmField = crmFields.length;
              }

              for (const crmField of crmFields) {
                  head += `<th nowrap>${crmField.fcaption}</th>`;
                  crmFieldDfid.push("f" + crmField.dfid);
                  maskedCheck["f" + crmField.dfid] = crmField.is_masked;
              }

              head += "</tr></thead><tbody>";
              disposition += head;
              i = 1;
          }

          const start_date_time = convertTimezone(row.start_time, time_formate).split(' ');
          disposition += `
              <tr id="${row.dphone}" data-select="${i}${row.dphone}" data-crm-dataid="${row.id}" ondblclick="calllog_dialling('${row.dphone}','${row.id}')">
                  <td nowrap>${i}</td>
                  <td nowrap>${row.dcampaign}</td>
                  <td nowrap>${phone}</td>
                  <td nowrap>${start_date_time[0]} ${start_date_time[1]}</td>
                  <td nowrap>${row.did_number}</td>
                  <td nowrap>${row.disposition}</td>
                  <td nowrap>${row.sub_disp}</td>
                  <td nowrap>${row.call_type}</td>
                  <td nowrap>${start_date_time[1]}</td>
                  <td nowrap>${row.remarks}</td>
          `;

          for (const dfid of crmFieldDfid) {
              disposition += `<td nowrap>${maskedCheck[dfid] == 1 && isDisplayPhone === "false" ? 'X'.repeat(row[dfid].length) : row[dfid]}</td>`;
          }

          disposition += "</tr>";
          dispositions.push(row.disposition.toUpperCase());
          i++;
      }

      disposition += "</tbody></table>";
      array.tbody = disposition;
  }

  const dispositionCounts = {};
  for (const disposition of dispositions) {
      dispositionCounts[disposition] = (dispositionCounts[disposition] || 0) + 1;
  }

  let count = '';
  let dispose_number=1;
  let total_disposition=0;
  for (const key in dispositionCounts) {
      count += `<tr><td>${dispose_number}</td><td>${key}</td><td>${dispositionCounts[key]}</td></tr>`;
      dispose_number++;
      total_disposition+=dispositionCounts[key];
  }
  count += `<tr><th></th><th>Total</th><th>${total_disposition}</th></tr>`;
  array.count = count;

  res.json(array);


});


app.post('/crm-log-search', async (req, res, next) => {
    
        const { search, isDisplayPhone, time_formate, ClientID, campaign } = req.body;

        let thead = "<tr><th>#</th><th>Phone</th><th>Name</th><th>Date</th><th>Agent</th><th>Campaign</th></tr>";

        let query = `
            SELECT phone, IF(f1 REGEXP '^[0-9]+$', TRIM(f1), f1) as f1, cdate, agent, campaign, id
            FROM crm_data
            WHERE client_id = ? AND campaign = ?
        `;
        const params = [ClientID,campaign];

        if (isNumeric(search) && search.length === 10) {
            query += " AND RIGHT(phone, 10) = ?";
            params.push(search.substr(-10));
        } else {
            query += " AND f1 LIKE ?";
            params.push('%' + search + '%');
        }

        query += " ORDER BY id DESC LIMIT 500";

        const resData = await queryClientDatabase(query, params);
        const tbody = [];
        let counter = 1;
		
	    if (resData.length > 0) {
			 for (const dir of resData) {
                const phone = isDisplayPhone === "false" ? maskNumber(dir.phone) : dir.phone;
                const formattedDate = dir.cdate ? new Date(dir.cdate).toLocaleString('en-US', { timeZone: 'UTC', hour12: true }) : "";
                tbody.push(`
                    <tr id="${dir.phone}" data-select="${counter}${dir.phone}" data-crm-dataid="${dir.id}" ondblclick="calllog_dialling('${dir.phone}','${dir.id}')">
                        <td>${counter++}</td>
                        <td>${phone}</td>
                        <td>${dir.f1}</td>
                        <td>${formattedDate}</td>
                        <td>${dir.agent}</td>
                        <td>${dir.campaign}</td>
                    </tr>
                `);
            }
			  res.json({ ok: true, tbody: tbody.join(''), thead });
        } else {
            res.json({ ok: false, tbody: '', thead: '' });
        }
    
});
/* directory search code by udit */
app.post('/directory-search', async (req, res, next) => {
    const { search, CampaignName, time_formate, ClientID } = req.body;
    let thead = "<tr><th>#</th><th>Phone</th><th>Name</th><th>Designation</th><th>Tier</th><th>Campaign</th></tr>";
    let query = ` SELECT phone, name, designation, tier, campaign FROM client_directory WHERE client_id = ? `;
    let params = [ClientID];
    if (!isNaN(search) && search.length === 10) {
        query += " AND phone = ?";
        params.push(search);
    } else {
        query += ` AND (name LIKE ? OR designation LIKE ? OR tier LIKE ? )`;
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (CampaignName) {
        query += " AND (campaign = ? OR campaign = '')";
        params.push(CampaignName);
    }

    query += " ORDER BY name DESC LIMIT 200";
	 try {
        const resData = await queryClientDatabase(query, params);
        let tbody = "";
        let counter = 1;

        if (resData.length > 0) {
            resData.forEach(dir => {
                tbody += `
                    <tr id="${dir.phone}" data-select="${counter}${dir.phone}">
                        <td>${counter++}</td>
                        <td>${dir.phone}</td>
                        <td>${dir.name}</td>
                        <td>${dir.designation}</td>
                        <td>${dir.tier}</td>
                        <td>${dir.campaign}</td>
                    </tr>
                `;
            });
            res.json({ ok: true, tbody, thead });
        } else {
            res.json({ ok: false, tbody: '', thead: '' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, error: 'Database query failed' });
    }
});

app.get('/user-session-log-bkup', (req, res, next) => {
    const usr = req.query.user ? req.query.user.toLowerCase() : "";
    const startdate = req.query.startdate ? req.query.startdate : "";
    const enddate = req.query.enddate ? req.query.enddate : "";
    const time_format = req.query.time_formate ? req.query.time_formate.toLowerCase() : "";
    const code = req.query.client_id;

    const login = { [usr]: 0 };
    const login_time = { [usr]: [] };
    const mode = { [usr]: {} };
    const mode_index = [1, 2, 3, 5, 6, 7];

    const queries = [
        `SELECT LOWER(l.agent) AS agent, id, TIME_TO_SEC(TIMEDIFF(logout_time, login_time)) AS login_duration, login_time, logout_time
         FROM loginhour l
         WHERE DATE_FORMAT(login_time, '%Y-%m-%d %H:%i') BETWEEN '${startdate}' AND '${enddate}'
         AND UPPER(l.agent) = '${usr.toUpperCase()}'
         AND l.client_id = '${code}'
         ORDER BY id`,

        `SELECT LOWER(l.agent) AS agent, MIN(l.login_time) AS first_time, DATE_FORMAT(MAX(l.logout_time), '%D %b %Y %r') AS last_time
         FROM loginhour l
         WHERE DATE_FORMAT(login_time, '%Y-%m-%d %H:%i') BETWEEN '${startdate}' AND '${enddate}'
         AND UPPER(l.agent) = '${usr.toUpperCase()}'
         AND l.client_id = '${code}'
         GROUP BY agent ORDER BY id`,

        `SELECT LOWER(l.agent) AS agent, 
                TIME_TO_SEC(TIMEDIFF(u.end_time, u.start_time)) AS mode_duration, 
                u.call_ob AS ob_call, 
                call_ob_duration AS ob_duration, 
                u.call_in AS in_call, 
                call_in_duration AS in_duration, 
                u.call_mc AS mc_call, 
                call_mc_duration AS mc_duration,
                u.call_pg AS pg_call,
                call_pg_duration AS pg_duration,
                u.call_pv AS pv_call,
                call_pv_duration AS pv_duration,
                u.call_rd AS rd_call,
                call_rd_duration AS rd_duration,
                u.call_cl AS cl_call,
                call_cl_duration AS cl_duration,
                idle_duration AS idle_duration, 
                wrapup_duration AS wrapup_duration, 
                u.transfer AS transfer, 
                transfer_duration AS transfer_duration, 
                u.conference AS conference, 
                conference_duration AS conference_duration, 
                u.recall AS recall, 
                recall_duration AS recall_duration, 
                u.hold AS hold, 
                hold_duration AS hold_duration, 
                break_duration AS break_duration
         FROM user_mode_action u, loginhour l
         WHERE l.id = u.login_id 
         AND DATE_FORMAT(login_time, '%Y-%m-%d %H:%i') BETWEEN '${startdate}' AND '${enddate}'
         AND UPPER(l.agent) = '${usr.toUpperCase()}'
         AND l.client_id = '${code}'`,

        `SELECT LOWER(l.agent) AS agent, SUM(TIME_TO_SEC(TIMEDIFF(u.end_time, u.start_time))) AS mobile_duration
         FROM user_mode_action u, loginhour l, user_mode m
         WHERE l.id = u.login_id 
         AND DATE_FORMAT(login_time, '%Y-%m-%d %H') BETWEEN '${startdate}' AND '${enddate}'
         AND UPPER(l.agent) = '${usr.toUpperCase()}'
         AND l.client_id = '${code}' 
         AND u.mode = m.mode_index 
         AND UPPER(m.user_mode) = 'MOBILE' 
         AND l.client_id = m.client_id`,

        `SELECT LOWER(TRIM(l.agent)) AS agent, um.user_mode,
                TIME_TO_SEC(TIMEDIFF(IF(u.free_time = '0000-00-00 00:00:00', u.end_time, IF(u.free_time < u.end_time, u.end_time, u.free_time)), u.start_time)) AS mode_duration
         FROM user_mode_action u, loginhour l, user_mode um
         WHERE l.id = u.login_id 
         AND u.mode = um.mode_index 
         AND u.client_id = um.client_id 
         AND u.mode != ''
         AND DATE_FORMAT(l.login_time, '%Y-%m-%d %H:%i') >= '${startdate}'
         AND IF(l.free_time IS NULL, DATE(l.logout_time), IF(l.free_time < l.logout_time, DATE(l.logout_time), DATE_FORMAT(l.free_time, '%Y-%m-%d %H:%i'))) <= '${enddate}'
         AND l.client_id = '${code}' 
         AND u.mode NOT IN (${mode_index.join(",")})
         AND UPPER(l.agent) IN ('${usr.toUpperCase()}')`
    ];

    //console.log("Queries:", queries);

    const executeQuery = (query) => {
        return new Promise((resolve, reject) => {
            database.query(query, (err, results) => {
                if (err) {
                    return reject(err);
                }
                resolve(results);
            });
        });
    };

    Promise.all(queries.map(executeQuery))
        .then(results => {
            const [loginResults, loginTimeResults, modeResults, mobileResults, breakModeResults] = results;

            loginResults.forEach(row => {
                if (login[row.agent] === undefined) login[row.agent] = 0;
                login[row.agent] += row.login_duration || 0;
            });

            loginTimeResults.forEach(row => {
                login_time[row.agent] = [row.first_time || '', row.last_time || ''];
            });

            modeResults.forEach(row => {
                if (!mode[usr]) mode[usr] = {};
                Object.keys(row).forEach(f => {
                    if (f === 'agent') return;
                    if (!mode[usr][f]) mode[usr][f] = 0;
                    mode[usr][f] += row[f] || 0;
                });
            });

            mobileResults.forEach(row => {
                if (!mode[usr]) mode[usr] = {};
                Object.keys(row).forEach(f => {
                    if (f === 'agent') return;
                    if (!mode[usr][f]) mode[usr][f] = 0;
                    mode[usr][f] += row[f] || 0;
                });
            });

            const break_mode = {};
            let total_break_duration = 0;

            breakModeResults.forEach(row => {
                if (!break_mode[row.user_mode]) break_mode[row.user_mode] = 0;
                break_mode[row.user_mode] += row.mode_duration || 0;
                total_break_duration += row.mode_duration || 0;
            });

            const mk = usr;
            const val = mode[mk] || {};

            let str = `<table border=0 cellspacing='1' cellpadding='2' style='background:silver' width='100%'>
                <tbody>
                <tr bgcolor='white'><td width='50%'>First Login</td><td nowrap>${login_time[mk][0] ? convertTimezone1(login_time[mk][0], time_format) : ''}</td></tr>
                <tr bgcolor='white'><td>Login Duration</td><td>${secToTime(login[mk])}</td></tr>
                <tr bgcolor='white'><td>Mobile Duration</td><td>${secToTime(val['mobile_duration'] || 0)}</td></tr>
                <tr bgcolor='white'><td>Outbound Details</td><td>${val['ob_call'] || 0} - (${secToTime(val['ob_duration'] || 0)})</td></tr>
                <tr bgcolor='white'><td>Inbound Details</td><td>${val['in_call'] || 0} - (${secToTime(val['in_duration'] || 0)})</td></tr>
                <tr bgcolor='white'><td>Manual Details</td><td>${val['mc_call'] || 0} - (${secToTime(val['mc_duration'] || 0)})</td></tr>
                <tr bgcolor='white'><td>Preview Details</td><td>${val['pv_call'] || 0} - (${secToTime(val['pv_duration'] || 0)})</td></tr>
                <tr bgcolor='white'><td>Callback Details</td><td>${val['rd_call'] || 0} - (${secToTime(val['rd_duration'] || 0)})</td></tr>
                <tr bgcolor='white'><td>Client Call Details</td><td>${val['cl_call'] || 0} - (${secToTime(val['cl_duration'] || 0)})</td></tr>
                <tr bgcolor='white'><td>Idle Time</td><td>${secToTime(val['idle_duration'] || 0)}</td></tr>
                <tr bgcolor='white'><td>Wrapup Time</td><td>${secToTime(val['wrapup_duration'] || 0)}</td></tr>
                <tr bgcolor='white'><td>Hold Time</td><td>${secToTime(val['hold_duration'] || 0)}</td></tr>
                <tr bgcolor='white'><td>Recall Time</td><td>${secToTime(val['recall_duration'] || 0)}</td></tr>
                <tr bgcolor='white'><td>Transfer Time</td><td>${secToTime(val['transfer_duration'] || 0)}</td></tr>
                <tr bgcolor='white'><td>Conference Time</td><td>${secToTime(val['conference_duration'] || 0)}</td></tr>
                <tr bgcolor='white'><td>Break Time</td><td>${secToTime(total_break_duration || 0)}</td></tr>`;

            Object.keys(break_mode).forEach(key => {
                str += `<tr bgcolor='#efefef'><td>${key.toUpperCase()}</td><td>${secToTime(break_mode[key])}</td></tr>`;
            });

            const att = (val['ob_call'] || 0) + (val['in_call'] || 0) + (val['mc_call'] || 0) + (val['transfer'] || 0) + (val['pg_call'] || 0) + (val['pv_call'] || 0) + (val['rd_call'] || 0) + (val['cl_call'] || 0) + (val['recall'] || 0);
            const aht = att > 0 ? (val['ob_duration'] + val['in_duration'] + val['mc_duration'] + val['pg_duration'] + val['pv_duration'] + val['rd_duration'] + val['cl_duration'] + val['transfer_duration'] + val['recall_duration']) / att : 0;
            const att_duration = att > 0 ? (val['ob_duration'] + val['in_duration'] + val['mc_duration'] + val['transfer_duration'] + val['pg_duration'] + val['pv_duration'] + val['rd_duration'] + val['cl_duration'] + val['recall_duration'] + val['wrapup_duration']) / att : 0;

            str += `<tr bgcolor='white'><td>AHT</td><td>${secToTime(aht)}</td></tr>`;
            str += `<tr bgcolor='white'><td>ATT</td><td>${secToTime(att_duration)}</td></tr>`;
            str += "</tbody></table>";

            res.send(str);
        })
        .catch(err => {
            console.error("Error executing queries:", err);
            res.status(500).send("An error occurred.");
        });
});


app.get('/user-session-log', (req, res, next) => {
    const usr = req.query.user ? req.query.user.toLowerCase() : "";
    const startdate = req.query.startdate ? req.query.startdate : "";
    const enddate = req.query.enddate ? req.query.enddate : "";
    const time_format = req.query.time_formate ? req.query.time_formate.toLowerCase() : "";
    const code = req.query.client_id;

    const login = { [usr]: 0 };
    const login_time = { [usr]: [] };
    const mode = { [usr]: {} };
    const mode_index = [1, 2, 3, 5, 6, 7];

    const queries = [
        `SELECT LOWER(l.agent) AS agent, id, TIME_TO_SEC(TIMEDIFF(logout_time, login_time)) AS login_duration, login_time, logout_time
         FROM loginhour l
         WHERE DATE_FORMAT(login_time, '%Y-%m-%d %H:%i') BETWEEN '${startdate}' AND '${enddate}'
         AND UPPER(l.agent) = '${usr.toUpperCase()}'
         AND l.client_id = '${code}'
         ORDER BY id`,

        `SELECT LOWER(l.agent) AS agent, MIN(l.login_time) AS first_time, DATE_FORMAT(MAX(l.logout_time), '%D %b %Y %r') AS last_time
         FROM loginhour l
         WHERE DATE_FORMAT(login_time, '%Y-%m-%d %H:%i') BETWEEN '${startdate}' AND '${enddate}'
         AND UPPER(l.agent) = '${usr.toUpperCase()}'
         AND l.client_id = '${code}'
         GROUP BY agent ORDER BY id`,

        `SELECT LOWER(l.agent) AS agent, 
                TIME_TO_SEC(TIMEDIFF(u.end_time, u.start_time)) AS mode_duration, 
                u.call_ob AS ob_call, 
                call_ob_duration AS ob_duration, 
                u.call_in AS in_call, 
                call_in_duration AS in_duration, 
                u.call_mc AS mc_call, 
                call_mc_duration AS mc_duration,
                u.call_pg AS pg_call,
                call_pg_duration AS pg_duration,
                u.call_pv AS pv_call,
                call_pv_duration AS pv_duration,
                u.call_rd AS rd_call,
                call_rd_duration AS rd_duration,
                u.call_cl AS cl_call,
                call_cl_duration AS cl_duration,
                idle_duration AS idle_duration, 
                wrapup_duration AS wrapup_duration, 
                u.transfer AS transfer, 
                transfer_duration AS transfer_duration, 
                u.conference AS conference, 
                conference_duration AS conference_duration, 
                u.recall AS recall, 
                recall_duration AS recall_duration, 
                u.hold AS hold, 
                hold_duration AS hold_duration, 
                break_duration AS break_duration
         FROM user_mode_action u, loginhour l
         WHERE l.id = u.login_id 
         AND DATE_FORMAT(login_time, '%Y-%m-%d %H:%i') BETWEEN '${startdate}' AND '${enddate}'
         AND UPPER(l.agent) = '${usr.toUpperCase()}'
         AND l.client_id = '${code}'`,

        `SELECT LOWER(l.agent) AS agent, SUM(TIME_TO_SEC(TIMEDIFF(u.end_time, u.start_time))) AS mobile_duration
         FROM user_mode_action u, loginhour l, user_mode m
         WHERE l.id = u.login_id 
         AND DATE_FORMAT(login_time, '%Y-%m-%d %H') BETWEEN '${startdate}' AND '${enddate}'
         AND UPPER(l.agent) = '${usr.toUpperCase()}'
         AND l.client_id = '${code}' 
         AND u.mode = m.mode_index 
         AND UPPER(m.user_mode) = 'MOBILE' 
         AND l.client_id = m.client_id`,

        `SELECT LOWER(TRIM(l.agent)) AS agent, um.user_mode,
                TIME_TO_SEC(TIMEDIFF(IF(u.free_time = '0000-00-00 00:00:00', u.end_time, IF(u.free_time < u.end_time, u.end_time, u.free_time)), u.start_time)) AS mode_duration
         FROM user_mode_action u, loginhour l, user_mode um
         WHERE l.id = u.login_id 
         AND u.mode = um.mode_index 
         AND u.client_id = um.client_id 
         AND u.mode != ''
         AND DATE_FORMAT(l.login_time, '%Y-%m-%d %H:%i') >= '${startdate}'
         AND IF(l.free_time IS NULL, DATE(l.logout_time), IF(l.free_time < l.logout_time, DATE(l.logout_time), DATE_FORMAT(l.free_time, '%Y-%m-%d %H:%i'))) <= '${enddate}'
         AND l.client_id = '${code}' 
         AND u.mode NOT IN (${mode_index.join(",")})
         AND UPPER(l.agent) IN ('${usr.toUpperCase()}')`
    ];

    //console.log("Queries:", queries);

    const executeQuery = (query) => {
        return new Promise((resolve, reject) => {
            database.query(query, (err, results) => {
                if (err) {
                  errlogRouter(1738,'user-session-log');
                  next(err);
                  return;
                }
                resolve(results);
            });
        });
    };

    Promise.all(queries.map(executeQuery))
        .then(results => {
            const [loginResults, loginTimeResults, modeResults, mobileResults, breakModeResults] = results;

            loginResults.forEach(row => {
                if (login[row.agent] === undefined) login[row.agent] = 0;
                login[row.agent] += row.login_duration || 0;
            });

            loginTimeResults.forEach(row => {
                login_time[row.agent] = [row.first_time || '', row.last_time || ''];
            });

            modeResults.forEach(row => {
                if (!mode[usr]) mode[usr] = {};
                Object.keys(row).forEach(f => {
                    if (f === 'agent') return;
                    if (!mode[usr][f]) mode[usr][f] = 0;
                    mode[usr][f] += row[f] || 0;
                });
            });

            mobileResults.forEach(row => {
                if (!mode[usr]) mode[usr] = {};
                Object.keys(row).forEach(f => {
                    if (f === 'agent') return;
                    if (!mode[usr][f]) mode[usr][f] = 0;
                    mode[usr][f] += row[f] || 0;
                });
            });

            const break_mode = {};
            let total_break_duration = 0;

            breakModeResults.forEach(row => {
                if (!break_mode[row.user_mode]) break_mode[row.user_mode] = 0;
                break_mode[row.user_mode] += row.mode_duration || 0;
                total_break_duration += row.mode_duration || 0;
            });

            const mk = usr;
            const val = mode[mk] || {};

            let str = `<table border='0' cellspacing='1' cellpadding='2' style='background:silver' width='100%'>
				<tbody>
					<tr bgcolor='white'>
						<td width='50%'>First Login</td>
						<td nowrap>${login_time[mk][0] ? convertTimezone1(login_time[mk][0], time_format) : ''}</td>
					</tr>
					<tr bgcolor='white'>
						<td>Login Duration</td>
						<td>${secToTime(login[mk])}</td>
					</tr>
					<tr bgcolor='white'>
						<td>Mobile Duration</td>
						<td>${secToTime(val['mobile_duration'] || 0)}</td>
					</tr>
					<tr bgcolor='white'>
						<td>Outbound Details</td>
						<td>${val['ob_call'] || 0} - (${secToTime(val['ob_duration'] || 0)})</td>
					</tr>
					<tr bgcolor='white'>
						<td>Inbound Details</td>
						<td>${val['in_call'] || 0} - (${secToTime(val['in_duration'] || 0)})</td>
					</tr>
					<tr bgcolor='white'>
						<td>Manual Details</td>
						<td>${val['mc_call'] || 0} - (${secToTime(val['mc_duration'] || 0)})</td>
					</tr>
					<tr bgcolor='white'>
						<td>Progressive Details</td>
						<td>${val['pg_call'] || 0} - (${secToTime(val['pg_duration'] || 0)})</td>
					</tr>
					<tr bgcolor='white'>
						<td>Preview Details</td>
						<td>${val['pv_call'] || 0} - (${secToTime(val['pv_duration'] || 0)})</td>
					</tr>
					<tr bgcolor='white'>
						<td>Redial Details</td>
						<td>${val['rd_call'] || 0} - (${secToTime(val['rd_duration'] || 0)})</td>
					</tr>
					<tr bgcolor='white'>
						<td>C2C Details</td>
						<td>${val['cl_call'] || 0} - (${secToTime(val['cl_duration'] || 0)})</td>
					</tr>
					<tr bgcolor='white'>
						<td>Recall Details</td>
						<td>${val['recall'] || 0} - (${secToTime(val['recall_duration'] || 0)})</td>
					</tr>`;
					
			str += `<tr bgcolor='white'><td>Transfer Details</td><td>${val['transfer'] || 0} - (${secToTime(val['transfer_duration'] || 0)})</td></tr>
           <tr bgcolor='white'><td>Conference Details</td><td>${val['conference'] || 0} - (${secToTime(val['conference_duration'] || 0)})</td></tr>`;

			const a_dur = (val['ob_duration'] || 0) + (val['mc_duration'] || 0) + (val['pg_duration'] || 0) + (val['pv_duration'] || 0) + (val['rd_duration'] || 0) + (val['cl_duration'] || 0) + (val['recall_duration'] || 0);
			str += `<tr bgcolor='white'><td>Total (OB, MC, RC, PG, PV, CL, RD) Duration</td><td>${secToTime(a_dur)}</td></tr>`;	
			
			const cal = (val['ob_call'] || 0) + (val['in_call'] || 0) + (val['mc_call'] || 0) + (val['pg_call'] || 0) + (val['pv_call'] || 0) + (val['rd_call'] || 0) + (val['cl_call'] || 0) + (val['recall'] || 0) + (val['transfer'] || 0) + (val['conference'] || 0);
			const dur = (val['ob_duration'] || 0) + (val['in_duration'] || 0) + (val['mc_duration'] || 0) + (val['pg_duration'] || 0) + (val['pv_duration'] || 0) + (val['rd_duration'] || 0) + (val['cl_duration'] || 0) + (val['transfer_duration'] || 0) + (val['recall_duration'] || 0) + (val['conference_duration'] || 0);
			str += `<tr bgcolor='#f2d7d5'><td>Total Talk Time</td><td>${cal} - (${secToTime(dur)})</td></tr>`;

			const totalDuration = (val['ob_duration'] || 0) + (val['in_duration'] || 0) + (val['mc_duration'] || 0) + (val['pg_duration'] || 0) + (val['pv_duration'] || 0) + (val['rd_duration'] || 0) + (val['cl_duration'] || 0) + (val['transfer_duration'] || 0) + (val['recall_duration'] || 0) + (val['wrapup_duration'] || 0) + (total_break_duration || 0);
			const tmp = (val['mode_duration'] || 0) - totalDuration;

			str += `<tr bgcolor='white'><td>Total Duration</td><td>${secToTime(totalDuration)}</td></tr>`;
			str += `<tr bgcolor='white'><td>Idle Duration</td><td>${secToTime(tmp)}</td></tr>`;
			str += `<tr bgcolor='white'><td>Wrap Up Duration</td><td>${secToTime(val['wrapup_duration'] || 0)}</td></tr>`;
			// str += `<tr bgcolor='white'><td>Total Recall Count</td><td>${val['recall'] || 0}</td></tr>`;
			str += `<tr bgcolor='white'><td>Total Hold Count</td><td>${val['hold'] || 0}</td></tr>`;
			str += `<tr bgcolor='white'><td>Total Break Duration</td><td>${secToTime(total_break_duration || 0)}</td></tr>`;

			Object.keys(break_mode).forEach(key => {
				str += `<tr bgcolor='#efefef'><td>${key.toUpperCase()}</td><td>${secToTime(break_mode[key] || 0)}</td></tr>`;
			});

			// Calculate ATT (Total Calls)
			const att = (val['ob_call'] || 0) + (val['in_call'] || 0) + (val['mc_call'] || 0) + (val['transfer'] || 0) + (val['pg_call'] || 0) + (val['pv_call'] || 0) + (val['rd_call'] || 0) + (val['cl_call'] || 0) + (val['recall'] || 0);

			// Calculate AHT (Average Handling Time)
			const aht = att > 0 ? (val['ob_duration'] || 0) + (val['in_duration'] || 0) + (val['mc_duration'] || 0) + (val['pg_duration'] || 0) + (val['pv_duration'] || 0) + (val['rd_duration'] || 0) + (val['cl_duration'] || 0) + (val['transfer_duration'] || 0) + (val['recall_duration'] || 0) / att : 0;

			// Calculate ATT (Average Talk Time)
			const attDuration = att > 0 ? (val['ob_duration'] || 0) + (val['in_duration'] || 0) + (val['mc_duration'] || 0) + (val['transfer_duration'] || 0) + (val['pg_duration'] || 0) + (val['pv_duration'] || 0) + (val['rd_duration'] || 0) + (val['cl_duration'] || 0) + (val['recall_duration'] || 0) + (val['wrapup_duration'] || 0) / att : 0;

			str += `<tr bgcolor='white'><td>AHT</td><td>${secToTime(aht)}</td></tr>`;
			str += `<tr bgcolor='white'><td>ATT</td><td>${secToTime(attDuration)}</td></tr>`;

			str += "</tbody></table>";

            res.send(str);
        })
        .catch(err => {
            console.error("Error executing queries:", err);
            res.status(500).send("An error occurred.");
        });
});



function secToTime(seconds) {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
}
/*-----code for udit end for call logs ----*/

////******code by Alok zonechange list */
app.post('/zone_wise_datetime', async (req, res, next) => 
{
    const {time_formate} = req.body;
    let source_date_time=moment().format('YYYY-MM-DDTHH:mm');
    let date = new Date(source_date_time);
    let time_duration = parseInt(time_formate); // Convert hours to seconds
    //console.log("time_duration= "+time_duration);
    date.setSeconds(date.getSeconds() + time_duration); // Adjust the seconds
    endDateFormatted=moment(date).format('YYYY-MM-DD HH:mm:ss');
    if(time_duration=='-52200' || time_duration=='-55800' || time_duration=='-59400')
    {
        startDateFormatted = moment().add(-1, 'days').format('YYYY-MM-DD 00:00:00');
    }else
    {
        startDateFormatted=moment().format('YYYY-MM-DD 00:00:00');
    }
    
    let converted_startdate = startDateFormatted.replace(" ", "T").slice(0, 16);
    let converted_enddate = moment(date).format('YYYY-MM-DDTHH:mm');
    res.send({"start_date":startDateFormatted,"end_date":endDateFormatted,"converted_startdate":converted_startdate,"converted_enddate":converted_enddate});
    
});

app.post('/agent_user_id', function(req, res, next) 
{
  const {user_id,client_id}=req.body;
  //console.log("client_name= "+JSON.stringify(req.body));
  const check_client_id = ' select id FROM user WHERE user_id = ?  and client_id= ?';
    const check_client_value = [user_id,client_id];
    database.query(check_client_id, check_client_value, (error, result) => {
    if (error){
      errlogRouter(124,'agent_user_id');
      next(error);
      return; // Exit to prevent further execution
    }
    if (Array.isArray(result) && result.length > 0)
    {
      res.send({status:true,id:result[0].id} );
    }
    else
    {
      res.send({status:false,msg:"Invalid username...!"});
    }
    
    });
});

const convertIndiaTimezone = (source_date_time, timezone_diff) => {
  let date = new Date(source_date_time);
  let time_duration = parseInt(timezone_diff); // Convert hours to seconds
  date.setSeconds(date.getSeconds() - time_duration); // Adjust the seconds
  const formattedDate = moment(date).format('YYYY-MM-DD HH:mm');
  return formattedDate;
};
/*********************Code by Nitish Singh**************************** */
app.post('/agent_user_id', function(req, res, next) 
{
  const {user_id,client_id}=req.body;
  console.log("client_name= "+JSON.stringify(req.body));
  const check_client_id = ' select id FROM user WHERE user_id = ?  and client_id= ?';
    const check_client_value = [user_id,client_id];
    database.query(check_client_id, check_client_value, (error, result) => {
    if (error){
      errlogRouter(124,'agent_user_id');
      next(error);
      return; // Exit to prevent further execution
    }
    if (Array.isArray(result) && result.length > 0)
    {
      console.log("userID=>",result[0].id);
      res.send({status:true,id:result[0].id} );
    }
    else
    {
      res.send({status:false,msg:"Invalid username...!"});
    }
    
    });
});
/***********Get Mo Mode***************** */
app.get('/sip_assign_data', function (req, res, next) {
  var client_id = req.body.client_id;
  var agent = req.body.agent;
  var extentype = req.body.extentype;
  //console.log(client_id);
  //console.log(agent);
  let newurl="https://devwebrtc.parahittech.com/webrtc_api/control_server_api.php?api_name=sipassign&input_data=client_id=3181|agent=alok|extentype=webrtcagent&CS_SOCKET=172.20.10.198&CS_PORT=18777";
  var options = {
    'method': 'GET',
    'url': newurl,
  };
  request(options, function (error, response) {
    if (error) {
      errlogRouter(281, 'RouteName : Index and method name: sip_assign_data');
      next(error);
      return;
    }
    res.send(response.body);
  });

});

/**************Campaignlive status By Alok************* */
app.post('/getLiveStatusCampaign', function(req, res, next) 
{
  
  const {campaign, SERVER_IP, CS_API_Port, SIP_ID, ClientID, isDisplayPhone, USER_ID}=req.body; 
  let newurl=control_server_url+"?api_name=campaignstatus&input_data=campaign="+campaign+"|exten="+SIP_ID+"|agent="+USER_ID+"|client_id="+ClientID+"+isDisplayPhone="+isDisplayPhone+"&CS_SOCKET="+SERVER_IP+"&CS_PORT="+CS_API_Port;
  const array = {};
  var options = {
    'method': 'GET',
    'url': newurl,
  };
  request(options, function (error, response) {
    if (error) {
      errlogRouter(281, 'RouteName : Index and method name: sip_assign_data');
      next(error);
      return;
    }
    let new_data =response.body;
    data = new_data.replace("CAMPAIGN_STATUS|", "");
    if (data.length > 0) {
      array['ok'] = true;
      array['MoCampaign'] = campaign;
      data = data.trim().split("~");
      array['str'] = "";

      let counter = 1;
      let flag = 0;

      data.forEach(d => {
          const s = d.split('|');

          if (s[1] != SIP_ID) {
              if(s[1] !=undefined)
              {
                  array['str'] += `<tr id='${s[1]}-${s[5]}-${s[0]}-${s[6]}' custom-attr='${s[1]}'><td>${counter++}</td>`;

                  for (let i = 0; i < s.length; i++) {
                    if (i !== 2) {
                        array['str'] += `<td>${(i === 6 && isDisplayPhone === "false") ? maskNumber(s[i]) : s[i]}</td>`;
                    }
                  }

                  array['str'] += `</tr>`;
                  flag = 1;

              }
              
          }
      });

      if (flag === 0) {
          array['str'] = `<tr id='' custom-attr=''><td colspan='10'>No Agent Available right now.</td></tr>`;
      }
  } else {
      array['str'] = `<tr id='' custom-attr=''><td colspan='10'>No Agent Available right now.</td></tr>`;
  }
    res.send(array);
  });
  
});

app.post('/remove-agent', function(req, res, next) 
{
  
  const {ClientID, SIP_ID, CampaignName, USER_ID, SERVER_IP, CS_API_Port}=req.body; 
  let newurl=control_server_url+"?api_name=agentremove&input_data=client_id="+ClientID+"|exten="+SIP_ID+"|campaign="+CampaignName+"|agent="+USER_ID+"&CS_SOCKET="+SERVER_IP+"&CS_PORT="+CS_API_Port;
  console.log("Api Url= "+newurl);
  const array = {};
  var options = {
    'method': 'GET',
    'url': newurl,
  };
  request(options, function (error, response) {
    if (error) {
      errlogRouter(2333, 'RouteName : api_model and method name: remove-agent');
      next(error);
      return;
    }
    let new_data =response.body;
    res.send(new_data);
  });
  
});


module.exports = app;
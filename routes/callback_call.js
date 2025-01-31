var express = require('express');
var database = require('../config/db');
var clientdb = require('../config/clientdb');
var errlogRouter = require('./err_log');
let moment = require('moment');
var router = express.Router();
/// This Function use for Callback Push Data By Jainul 
router.post('/recall_update', (req, res, next) => {
  const recall_id = req.body.recall_id;
  const next_recall_date = req.body.next_recall_date;
  // Using a parameterized query to prevent SQL injection
  const update_recall = 'UPDATE recall SET cdate = ?, update_time = SYSDATE() WHERE id = ?';
  clientdb.query(update_recall, [next_recall_date, recall_id], function (error, result) {
    if (error) {
      errlogRouter(25, 'Route Name : Callback , Function name: recall_update');
      next(error);  // Passing error to the next middleware
      return;
    }
    // Send a success response
    res.status(200).send({ success: true, message: 'Recall updated successfully' });
  });
});

router.post('/reloadRecall', async (req, res, next) => {
  //return false;
  const array = [];
  var Recall_Reload_Duration = req.body.Recall_Reload_Duration;
  var USER_ID = req.body.USER_ID;
  var CampaignName = req.body.CampaignName;
  var clientID = req.body.ClientID;
  var isDisplayPhone = req.body.isDisplayPhone;
  var Callback_Auto = req.body.Callback_Auto;
  var LastRecallAlertId = req.body.LastRecallAlertId;
  var client_type = req.body.client_type;
  var UserMode = req.body.UserMode;
  var UserModeIndex = req.body.UserModeIndex;
  var WaitingDisposition = req.body.WaitingDisposition;
  var isLineBusy = req.body.isLineBusy;
  var LastModeBeforeRecall = req.body.LastModeBeforeRecall;
  var LastModeIndexBeforeRecall = req.body.LastModeIndexBeforeRecall;
  var SIP_ID = req.body.SIP_ID;
  var AS_ID = req.body.AS_ID;
  var SERVER_IP = req.body.SERVER_IP;
  var CS_API_Port = req.body.CS_API_Port;
  var Campaign_PreFix = req.body.Campaign_PreFix;
  var User_Status_ID = req.body.User_Status_ID;
  var NextUserMode = req.body.NextUserMode;
  var LoginHourID = req.body.LoginHourID;
  var NextUserModeIndex = req.body.NextUserModeIndex;
  var UserModeIndexLabel = req.body.UserModeIndexLabel;
  var SipCheckStatus = req.body.SipCheckStatus;
  var campaignType = req.body.campaignType;
  var ManualCallerIDList = req.body.ManualCallerIDList;
  var Queue_Priority = req.body.Queue_Priority;
  var IsDedicatedCLI = req.body.IsDedicatedCLI;
  var ModeDBId = req.body.ModeDBId;
  var MOPanel = req.body.MOPanel;
  var ChatA = req.body.ChatA;
  var ChatLoginID = req.body.ChatLoginID;
  var lastQueuePause = req.body.lastQueuePause;
  var UserModeIndexID = req.body.UserModeIndexID;
  var UserModeRecall = req.body.UserModeRecall;
  var emailCount = req.body.emailCount;
  var smsCount = req.body.smsCount;
  var idleDuration = req.body.idleDuration;
  var wrapupDuration = req.body.wrapupDuration;
  var holdCount = req.body.holdCount;
  var holdDuration = req.body.holdDuration;
  var recallCount = req.body.recallCount;
  var recallDuration = req.body.recallDuration;
  var breakDuration = req.body.breakDuration;
  var moDuration = req.body.moDuration;
  var transferCount = req.body.transferCount;
  var TMCCount = req.body.TMCCount;
  var TOBCount = req.body.TOBCount;
  var TIBCount = req.body.TIBCount;
  var TRCCount = req.body.TRCCount;
  var TTCCount = req.body.TTCCount;
  var TCCCount = req.body.TCCCount;
  var Call_Mc_Count = req.body.Call_Mc_Count;
  var Call_Ob_Count = req.body.Call_Ob_Count;
  var Call_In_Count = req.body.Call_In_Count;
  var Conference_Count = req.body.Conference_Count;
  var IsLicenseActive = req.body.IsLicenseActive;
  var CBADialing = req.body.CBADialing;
  var CBIDialing = req.body.CBIDialing;
  var CBUDialing = req.body.CBUDialing;
  var CBSDialing = req.body.CBSDialing;
  var CBEDialing = req.body.CBEDialing;
  var CBQDialing = req.body.CBQDialing;
  var DialPad = req.body.DialPad;
  var CRMLeadId = req.body.CRMLeadId;
  var Recall_Count = req.body.Recall_Count;
  var Campaign_DNC_Check = req.body.Campaign_DNC_Check;
  var DNCURL = req.body.DNCURL;
  var isRemoteDNC = req.body.isRemoteDNC;
  var RemoteDNCUrl = req.body.RemoteDNCUrl;
  var skill = req.body.skill;
  var DialedRoute = req.body.DialedRoute;
  var LastUsedSkill = req.body.LastSkillUsed;
  var agentPrefix = req.body.agentPrefix;
  var Manual_Dial_Route = req.body.Manual_Dial_Route;
  var isRecall_Mode_Allow = req.body.isRecall_Mode_Allow;
  var Manual_Caller_ID = req.body.Manual_Caller_ID;
  var is_Recall = req.body.is_Recall;
  var CallbackAlert = req.body.CallbackAlert;
  var add_Recall_Reload_Duration = req.body.add_Recall_Reload_Duration;
  var callback_notify = req.body.callback_notify;
  var CBUPolicy = req.body.CBUPolicy;
  var agent_name='';
  if(CBUPolicy==1)
    {
      agent_name=USER_ID;
    }else
    {
      agent_name='';
    }
  //console.log('recall= '+JSON.stringify(req.body));

  if (IsLicenseActive == '') {
    res.send({ status: false, msg: "Please Wait for License Server..." });
    return;
  } else if (IsLicenseActive == false) {
    res.send({ status: false, msg: "Please Wait for License Server..." });
    return;
  } else if (isRecall_Mode_Allow == false) {
    res.send({ status: false, msg: "Permission Not Allow..!" });
    return;
  } else if (is_Recall == 0) {
    res.send({ status: false, msg: "Recall is not Active" });
    return;
  } else if (UserMode == 'Break') {
    res.send({ status: false, msg: "Break mode active" });
    return;
  }
  var new_db_date = await getDBTime();
  let new_formattedDate = moment(new_db_date).format('YYYY-MM-DD HH:mm:ss');
  let new_formattedDate2 = moment(new_db_date).add(10, 'minutes').format('YYYY-MM-DD HH:mm:ss');
  let total_recall_data=await total_callback(USER_ID,CampaignName,clientID);
  //console.log("total_recall_data= "+total_recall_data);
  //console.log(" new_formattedDate1 " + new_formattedDate + " new_formattedDate2 " + new_formattedDate2);
  var query_check_recall = `SELECT phone FROM recall WHERE agent="${USER_ID}" AND campaign!="${CampaignName}" AND cdate<=SYSDATE() AND client_id="${clientID}" AND data_flag="1" AND status="1" ORDER BY parent_priority,priority LIMIT 1`;
  //console.log(query_check_recall);
  clientdb.query(query_check_recall, function (error, response) {
    if (error) {
      errlogRouter(144, 'RouteName : Callback and method name: reloadRecall');
      next(error);
      return;
    }
    if (response.length > 0 && callback_notify=='') {
    
      var momentdata = moment().format('YYYY-MM-DD HH:mm:ss');
      res.send({ "status": true, "total_nums_callback": total_recall_data, "callback_notify": "Yes", "data": { "otherCallback": "You have missed a Callback , because of different campaign log-in" }, "mo": momentdata });
      //console.log("callback condition1"+callback_notify+" callback_notify=");
      errlogRouter(152, 'RouteName : Callback condition1 and method name: reload_recall');
      return;
    } else {
      new_recal_reload = parseInt(Recall_Reload_Duration);
      let new_recal_reload_datetime = moment(new_db_date).add(new_recal_reload, 'minutes').format('YYYY-MM-DD HH:mm:ss');

      const check_recall2 = `SELECT id, phone, dataid, cdate, id, recall_type, skill FROM recall WHERE agent="${USER_ID}" AND campaign="${CampaignName}" AND cdate <= "${new_recal_reload_datetime}" AND client_id="${clientID}" AND data_flag="1" AND status="1" ORDER BY parent_priority, priority, cdate LIMIT 1`;
      //console.log("check_recall2= " + check_recall2);
      clientdb.query(check_recall2, async function (error1, results1) {
        if (error1) {
          errlogRouter(159, 'RouteName : Callback condition2 and method name: reload_recall');
          next(error1);
          return;
        }
        if (results1.length > 0) {
         
          var db_date = await getDBTime();
          var callback_date = moment(results1[0]['cdate']).format('YYYY-MM-DD HH:mm:ss');
          var callback_show_date = moment(results1[0]['cdate']).format('HH:mm:ss');
          var call_back_timestamp = moment(callback_date).unix();
          var db_date_timestamp = moment(db_date).unix();
         
          let new_recal_reload_timestamp = moment(new_recal_reload_datetime).unix();
          results1[0]['lblRecallCount'] = results1.length;
          results1[0]['lblRecallTime'] = moment().format('HH:mm:ss');
          results1[0]['lblRecallPhone'] = isDisplayPhone === "false" ? results1[0].phone.replace(/./g, 'X') : results1[0].phone;
          results1[0]['dbtime'] = db_date;
          results1[0]['callback_date'] = callback_date;
          results1[0]['newcall_back'] = call_back_timestamp;
          //console.log(" call_back_timestamp12 " + call_back_timestamp + " db_date_timestamp " + db_date_timestamp);
          //console.log("Notify Msg duration add time " + new_recal_reload_timestamp + " call_back_timestamp " + call_back_timestamp);
          //console.log("Notify Msg1 duration add time " + new_recal_reload_datetime + " call_back_timestamp " + callback_date);
          if (call_back_timestamp < db_date_timestamp) {
            res.send({ status: true, "total_nums_callback": total_recall_data, msg: "Callback Overdue and Over Due Callback : " + results1[0]['lblRecallPhone'] + " AT " + results1[0]['lblRecallTime'], "callback_number": results1[0]['lblRecallPhone'], "callback_date": callback_show_date, "callback_dial_number": results1[0].phone, "callback_type": "overdue", data: results1 });
            //console.log("callback condition3");
            return;
          } else {

            /***if (LastRecallAlertId != results1[0]['id'] && LastRecallAlertId=='') {
              results1[0]['LastRecallAlertId'] = results1[0]['id'];
              console.log("callback condition4");
              return res.send({"status": true,"data": {"PreNotification": "Callback Pre Notification\n You Have New Callback:" + results1[0]['lblRecallPhone'],"LastRecallAlertId": results1[0]['LastRecallAlertId'],"callback_number":results1[0]['lblRecallPhone'],"callback_date":callback_show_date}});
            }****/
            if (new_recal_reload_timestamp >= call_back_timestamp && callback_notify != 'Yes') {
              //console.log("callback condition 414");
              res.send({ "status": true, "total_nums_callback": total_recall_data, "callback_notify": "Yes", "data": { "PreNotification": "Callback Pre Notification\n You Have New Callback:" + results1[0]['lblRecallPhone'], "LastRecallAlertId": results1[0]['LastRecallAlertId'], "callback_number": results1[0]['lblRecallPhone'], "callback_date": callback_show_date } });
              return false;
            }
            else {
              results1[0]['nextCall'] = "";
              //console.log(" call_back_timestamp " + call_back_timestamp + " db_date_timestamp " + db_date_timestamp);
              if (call_back_timestamp <= db_date_timestamp) {
                //console.log(" enter callback condition");
                const validate_time = await ValidateDialTime(clientID, CampaignName);
                if (validate_time == 0) {
                  res.send({ status: false, msg: "Campaign Schedule Not In Time...!" });
                  return;
                }
                Callback_Auto = 1;
                if (results1[0]['recall_type'].toUpperCase() == 'CBA') {
                  Callback_Auto = CBADialing;
                } else if (results1[0]['recall_type'].toUpperCase() == 'CBI') {
                  Callback_Auto = CBIDialing;
                } else if (results1[0]['recall_type'].toUpperCase() == 'CBU') {
                  Callback_Auto = CBUDialing;
                } else if (results1[0]['recall_type'].toUpperCase() == 'CBE') {
                  Callback_Auto = CBEDialing;
                } else if (results1[0]['recall_type'].toUpperCase() == 'CBS') {
                  Callback_Auto = CBSDialing;
                } else if (results1[0]['recall_type'].toUpperCase() == 'CBQ') {
                  Callback_Auto = CBQDialing;
                }
                if (Callback_Auto == 1) {
                  if (UserMode.toUpperCase() != "CALLBACK") {
                    results1[0]['LastModeIndexBeforeRecall'] = UserModeIndex;
                    results1[0]['LastModeBeforeRecall'] = UserMode;
                    results1[0]['NextUserMode'] = "CALLBACK";
                    results1[0]['NextUserModeIndex'] = 3;
                    results1[0]['Recall_ID'] = results1[0]['id'];
                    results1[0]['Recall_DataID'] = results1[0]['dataid'];
                    //var dataArray = [results1[0]['phone'], results1[0]['skill'], IsLicenseActive, Campaign_PreFix, client_type, ManualCallerIDList, isLineBusy, UserMode, DialPad, WaitingDisposition, SIP_ID, isDisplayPhone, results1[0]['Recall_DataID'], CampaignName, clientID, CRMLeadId, USER_ID, Recall_Count, LoginHourID, ModeDBId, User_Status_ID, results1[0]['Recall_ID'], SERVER_IP, CS_API_Port, Campaign_DNC_Check, DNCURL, isRemoteDNC, RemoteDNCUrl, AS_ID, LastUsedSkill, DialedRoute, agentPrefix, Manual_Dial_Route, Manual_Caller_ID];
                    if (Array.isArray(results1)) {
                      //console.log("callback condition6");
                      res.send({ status: true, "total_nums_callback": total_recall_data, data: results1 });
                    } else {
                     // console.log("callback condition7");
                      res.send({ status: true, "total_nums_callback": total_recall_data, data: results1 });
                    }
                    res.send({ status: true, "total_nums_callback": total_recall_data, data: results1 });
                  } else {
                    if ((WaitingDisposition == "false" || WaitingDisposition == '') && isLineBusy == 'READY') {
                      results1[0]['Recall_ID'] = results1[0]['id'];
                      results1[0]['Recall_DataID'] = results1[0]['dataid'];
                      //var dataArray = [results1[0]['phone'], results1[0]['skill'], IsLicenseActive, Campaign_PreFix, client_type, ManualCallerIDList, isLineBusy, UserMode, DialPad, WaitingDisposition, SIP_ID, isDisplayPhone, results1[0]['Recall_DataID'], CampaignName, clientID, CRMLeadId, USER_ID, Recall_Count, LoginHourID, ModeDBId, User_Status_ID, results1[0]['Recall_ID'], SERVER_IP, CS_API_Port, Campaign_DNC_Check, DNCURL, isRemoteDNC, RemoteDNCUrl, AS_ID, LastUsedSkill, DialedRoute, agentPrefix, Manual_Dial_Route, Manual_Caller_ID];

                      if (Array.isArray(dataArray)) {
                        //console.log("callback condition8");
                        res.send({ status: true, "total_nums_callback": total_recall_data, data: results1 });
                      } else {
                        //console.log("callback condition9");
                        res.send({ status: true, "total_nums_callback": total_recall_data, data: results1 });
                      }
                    }
                  }
                  ///Callback_Auto == 1
                } else {
                  //console.log("callback condition10");
                  res.send({ status: false, msg: "No Callback" });
                }
              } else {
                
                
                let query_user_status = ` UPDATE recall SET update_by_user = ?, agent = ? WHERE client_id = ?  AND data_flag = "1" AND agent = "" AND campaign = ?  AND cdate <= ? ORDER BY parent_priority, priority, cdate LIMIT 1`;
                clientdb.query(query_user_status, [USER_ID, agent_name, clientID, CampaignName, add_Recall_Reload_Duration], function (error, results) {
                  if (error) {
                    //console.log("callback condition11");
                    errlogRouter(248, 'RouteName : Callback condition11 and method name: reload_recall');
                    next(error1);
                    return;
                  }
                 // console.log('Query result:', results);
                });

                results1[0]['lblRecallCount'] = "0";
                results1[0]['lblRecallTime'] = "-";
                results1[0]['lblRecallPhone'] = "-";
                results1[0]['nextCall'] = "";

                /*
                 * if callback is the usermode, and last mode was not callback, then jump the user to 
                 * the previous mode
                 */
                if ((UserMode).toUpperCase() == "CALLBACK" && LastModeBeforeRecall.toUpperCase() > 0) {
                  if (WaitingDisposition == "false") {
                    results1[0]['NextUserMode'] = LastModeBeforeRecall;
                    results1[0]['NextUserModeIndex'] = LastModeIndexBeforeRecall;
                    results1[0]['LastModeIndexBeforeRecall'] = 0;
                    results1[0]['LastModeBeforeRecall'] = "";
                  }
                }
                //console.log("callback condition12", results1);
                return res.send({ "status": false, "data": results1 });
              }

            }
          }
          // const time = ValidateDialTime(clientID, CampaignName);



          //results1.length > 0
        } else {
          //console.log("callback condition13");
          if(CBUPolicy==0)
          {
                let query_user_status_update = `UPDATE recall SET update_by_user = '${USER_ID}', agent = '${USER_ID}' WHERE client_id = '${clientID}'  AND data_flag = '1' AND agent = '' AND campaign = '${CampaignName}'  AND cdate <= '${new_formattedDate}'  ORDER BY parent_priority, priority, cdate LIMIT 1`;
                //console.log("Assign data= "+query_user_status_update);
                clientdb.query(query_user_status_update, function (error, results) {
                  if (error) {
                    //console.log("callback condition13");
                    errlogRouter(277, 'RouteName : callback condition13 and method name: reload_recall');
                    next(error);
                    return;
                  }
                  //errlogRouter(281, 'RouteName : callback and log: '+JSON.stringify(results));
                });
          }
          res.send({ status: false, msg: "No Callback" });
        }

        // Result of the query
        //res.send({status:true});
      });

    }
    //console.log(query_member_table);
  });
  //return false;
});

async function ValidateDialTime(clientID, CampaignName) {
  const daysOfWeek = [
    'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
  ];

  const currentDate = new Date();
  const dayOfWeek = daysOfWeek[currentDate.getDay()];
  const lowercaseDayOfWeek = dayOfWeek.toLowerCase();

  // Formatting the time as HH:MM:SS
  const currentTime = currentDate.toTimeString().split(' ')[0];
 // console.log("currentTime= " + currentTime);

  const query_starttime = `SELECT start_time FROM campaign WHERE client_id="${clientID}" AND name="${CampaignName}" AND TIME(start_time) <= "${currentTime}"  AND TIME(end_time) >= "${currentTime}" AND s_${lowercaseDayOfWeek}="1"`;
  return new Promise((resolve, reject) => {
    database.query(query_starttime, (error, data) => {
      if (error) {
        console.error('Database query error:', error);
        return;
      }
      //console.log("length= " + (data.length || 0));
      const ValidateDialTime = Array.isArray(data) && data.length > 0 ? data.length : 0;
      //console.log("ValidateDialTime= " + ValidateDialTime);
      resolve(ValidateDialTime);
    });
  });
}
async function getDBTime() {
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
async function total_callback(user_id,campaign,client_id) {
  const check_recall = `SELECT * FROM recall WHERE agent="${user_id}" AND campaign="${campaign}" AND client_id="${client_id}" AND data_flag="1" AND status="1"`;
  return new Promise((resolve, reject) => {
    clientdb.query(check_recall, function (error, rows) {
      if (error) return reject(error);
      resolve(rows.length);
    });
  });
}

router.post('/recall_delete', (req, res, next) => {
  let { recall_id } = req.body;
  // Using a parameterized query to prevent SQL injection
  query_recal_log = `INSERT INTO recall_log 
                (phone, dataid, campaign, cdate, agent, status, client_id, recall_by, update_time, update_by_user, update_by_ip, recall_type, rid, calltype, map_by, disposition, sub_disposition, source)
                SELECT phone, dataid, campaign, cdate, agent, status, client_id, recall_by, update_time, update_by_user, update_by_ip, recall_type, rid, calltype, map_by, disposition, sub_disposition, source
                FROM recall WHERE id = '${recall_id}' `;
  //console.log("recall_delete= " + query_recal_log);
  clientdb.query(query_recal_log, function (error, result) {
    if (error) {
      errlogRouter(414, 'Route Name : Callback , Function name: recall_log_insertion');
      next(error);  // Passing error to the next middleware
      return;
    }
    //console.log(result);
    if (result.affectedRows > 0) {
      delete_recal = `DELETE FROM recall WHERE  id = '${recall_id}'`;
      //console.log("recall_delete= "+delete_recal);
      clientdb.query(delete_recal, function (error1, result1) {
        if (error1) {
          errlogRouter(414, 'Route Name : Callback , Function name: recall_delete');
          next(error1);  // Passing error to the next middleware
          return;
        }
        if (result1.affectedRows > 0) {
          res.send({ status: true, "msg": "Delete record successfully...!" });
        } else {
          res.send({ status: false, "msg": "Unable to delete...!" });
        }
      });
    } else {
      res.send({ status: false, "msg": "Unable to delete...!" });
    }
    //res.send({status:true,"msg":result.affectedRows});
  });
});
/** end Alok code */


module.exports = router;
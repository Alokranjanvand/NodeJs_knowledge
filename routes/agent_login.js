var express = require('express');
var db1 = require('../config/db');
var db2 = require('../config/astdb');
var db3 = require('../config/clientdb');
const { omni_wp_url, assign_sip_url, agent_version } = require('./constant_webrtc');
var router = express.Router();
let moment = require('moment');

// Helper function to execute a database query
const executeQuery = (query) => {
    return new Promise((resolve, reject) => {
        db1.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};
const executeQuery2 = (query) => {
    return new Promise((resolve, reject) => {
        db2.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};
const executeQuery3 = (query) => {
    return new Promise((resolve, reject) => {
        db3.query(query, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

const current_datetime = () => {
    return new Promise((resolve, reject) => {
        db3.query("select sysdate() as currect_datetime;", (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(moment(results[0]['currect_datetime']).format('YYYY-MM-DD HH:mm:ss'));
            }
        });
    });
};
const SaveUserModeLog = async (ClientID, User_Status_ID, LoginHourID, ModeDBId, emailCount, smsCount) => {
    try {
        // Query to check user status
        const queryDisp = `SELECT id FROM user_status WHERE client_id = "${ClientID}" AND id = "${User_Status_ID}"`;
        const dsresult = await executeQuery(queryDisp);
        const ValidateUserLogin = dsresult.length > 0;  // Simplified ternary

        /**** login hour query */
        const query_loginhour = `UPDATE loginhour SET logout_time = SYSDATE() WHERE client_id = "${ClientID}" AND id = "${LoginHourID}"`;
        const result_login_query = await executeQuery(query_loginhour);

        /**** login Mode query */
        const query_usermode = `UPDATE user_mode_action SET email_count=${emailCount}, sms_count=${smsCount}, end_time = SYSDATE() WHERE client_id = "${ClientID}" AND id = "${ModeDBId}"`;
        const result_usermode = await executeQuery(query_usermode);

        return { ValidateUserLogin};
    } catch (error) {
        console.error("Error saving user mode log:", error);
        throw error;  // Re-throw error for further handling if necessary
    }
};

function getModeSeconds(date,currDate) {
    const currentDate = new Date(currDate).getTime(); // Current time in milliseconds

    if (date) {
        const dateTimestamp = new Date(date).getTime(); // Convert input date to a timestamp in milliseconds
        const dateDiff = currentDate - dateTimestamp;

        // Return the difference in seconds (since timestamps are in milliseconds)
        return Math.floor(dateDiff / 1000);
    } else {
        return 0;
    }
}

router.post('/save_mode', async (req, res, next) => {
    const {tag,agentPrefix,DialedRoute,CBADialing,CBIDialing,CBUDialing,CBSDialing, 
        CBEDialing,CBQDialing,LastUserMode,UserModeIndexLabel,modeLoginAtFullDate,UserMode,
        LoginHourID,ModeDBId,emailCount,smsCount,idleDuration,wrapupDuration,holdCount,holdDuration,recallCount,recallDuration,
        breakDuration,moDuration,transferCount,SipCheckStatus,campaignType,ManualCallerIDList,Queue_Priority,IsDedicatedCLI,
        MOPanel,ChatA,ChatLoginID,lastQueuePause,UserModeIndexID,UserModeRecall,TMCCount,TOBCount,TIBCount,TRCCount,TTCCount,TCCCount,
        Call_Mc_Count,Call_Ob_Count,Call_In_Count,Recall_Count,Conference_Count,is_Recall,Recall_Reload_Duration,userID,
        CampaignName,ClientID,isDisplayPhone,Callback_Auto,LastRecallAlertId,client_type,WaitingDisposition,isLineBusy,
        LastModeBeforeRecall,LastModeIndexBeforeRecall,SIP_ID,AS_ID,SERVER_IP,CS_API_Port,Campaign_PreFix,User_Status_ID,
        NextUserMode,NextUserModeIndex,CRMLeadId,DialPad,IsLicenseActive,Campaign_DNC_Check,DNCURL,isRemoteDNC,RemoteDNCUrl,
        skill,Manual_Dial_Route,Manual_Caller_ID,usermode} = req.body;

        let data={};
        let data_arr='';

    let result_saveuserlog = await SaveUserModeLog(ClientID, User_Status_ID, LoginHourID, ModeDBId, emailCount, smsCount);
    data_arr=result_saveuserlog;
    let  currentdatetime = await current_datetime();
    data_arr['ModeDuration']=getModeSeconds(modeLoginAtFullDate,currentdatetime);
    data_arr['currentdatetime'] = moment(currentdatetime).format('HH:mm:ss');
    data_arr['modeLoginAtFullDate']=moment(currentdatetime).format('YYYY-MM-DD HH:mm:ss');
    data_arr['LastModeIndexBeforeRecall']=0;
    data_arr['LastModeBeforeRecall']='';
    data_arr['LastAgentStateTime']=moment(currentdatetime).format('YYYY-MM-DD HH:mm:ss');
    if (UserMode !== "" && LastUserMode !== '') {
        if(WaitingDisposition==true)
        {
            data_arr['NextUserMode'] = UserMode;
            data_arr['NextUserModeIndex'] = Object.keys(UserModeIndexLabel).find(key => UserModeIndexLabel[key] === UserMode);
            
        }
        if(UserMode == "Auto")
        {
            /****** delete in queue_member_table_ */
            const queue_member_table = "queue_member_table_" + AS_ID;
            const sip_interface = "SIP/" + SIP_ID;
            let  query_member_table = `DELETE FROM ${queue_member_table} WHERE interface = "${sip_interface}"`;
            result_queue = await executeQuery2(query_member_table);
            /**********Update user status********** */
            const query_update_userstatus = `UPDATE user_status SET ringnoanswer_count = 0 WHERE client_id = ${ClientID}  AND id = ${User_Status_ID}`;
            result_userstatus = await executeQuery(query_update_userstatus);
        }
            data_arr['UserMode'] = UserMode;
            data_arr['UserModeIndexLabel'] = UserModeIndexLabel;
            data_arr['CampaignName'] = CampaignName;
            data_arr['SipCheckStatus'] = SipCheckStatus;
            data_arr['AS_ID'] = AS_ID;
            data_arr['SIP_ID'] = SIP_ID;
            data_arr['ClientID'] = ClientID;
            data_arr['User_Status_ID'] = User_Status_ID;
            data_arr['campaignType'] = campaignType;
            data_arr['userID'] = userID;
            data_arr['ManualCallerIDList'] = ManualCallerIDList;
            data_arr['Queue_Priority'] = Queue_Priority;
            data_arr['IsDedicatedCLI'] = IsDedicatedCLI;
            data_arr['loginHourID'] = LoginHourID;
            data_arr['modeDBId'] = ModeDBId;
            data_arr['MOPanel'] = MOPanel;
            data_arr['ChatA'] = ChatA;
            data_arr['ChatLoginID'] = ChatLoginID;
            data_arr['lastQueuePause'] = lastQueuePause;
            data_arr['UserModeIndexID'] = UserModeIndexID;
            data_arr['UserModeRecall'] = UserModeRecall;
            data_arr['TMCCount'] = TMCCount;
            data_arr['TOBCount'] = TOBCount;
            data_arr['TIBCount'] = TIBCount;
            data_arr['TRCCount'] = TRCCount;
            data_arr['TTCCount'] = TTCCount;
            data_arr['TCCCount'] = TCCCount;
            data_arr['Call_Mc_Count'] = Call_Mc_Count;
            data_arr['Call_Ob_Count'] = Call_Ob_Count;
            data_arr['Call_In_Count'] = Call_In_Count;
            data_arr['recallCount'] = recallCount;
            data_arr['transferCount'] = transferCount;
            data_arr['Conference_Count'] = Conference_Count;
            data_arr['skill'] = skill;
            data_arr['UserModeIndex'] = Object.keys(UserModeIndexLabel).find(key => UserModeIndexLabel[key] === UserMode);

            /************new data insert user_mode_action *****/
            const query_usermode1= `INSERT INTO user_mode_action (client_id, login_id, mode, campaign, start_time, end_time)
        VALUES ("${ClientID}", "${LoginHourID}", "${data_arr['UserModeIndex']}", "${CampaignName}", SYSDATE(), SYSDATE())`;
        result_usermode1 = await executeQuery(query_usermode1);
        data_arr['ModeDBId']=result_usermode1.insertId;

        /*********UPDATE USER STATUS */
        const query_newupdate_userstatus = `UPDATE user_status SET user_mode_id = "${data_arr['ModeDBId']}",user_mode = "${data_arr['UserModeIndex']}" WHERE  id = ${User_Status_ID}`;
        result_newuserstatus = await executeQuery(query_newupdate_userstatus);
        /***********end update */

        data_arr['DispalyPhoneNumber'] = "";
        data_arr['MaskedPhoneNumber'] = "";
        data_arr['DisplayCallerID'] = "";
        data_arr['DisplayDIDName'] = "";
        data_arr['DisplayCallType'] = "";
        data_arr['IVRInput'] = "";


    }else if (UserMode !== "" && LastUserMode == '') {
        data_arr['LastAgentStateTime']=moment(currentdatetime).format('YYYY-MM-DD HH:mm:ss');
        let result_saveuserlog1 = await SaveUserModeLog(ClientID, User_Status_ID, LoginHourID, ModeDBId, emailCount, smsCount);
        data_arr=result_saveuserlog1;
        data_arr['UserMode'] = UserMode;
            data_arr['UserModeIndexLabel'] = UserModeIndexLabel;
            data_arr['CampaignName'] = CampaignName;
            data_arr['SipCheckStatus'] = SipCheckStatus;
            data_arr['AS_ID'] = AS_ID;
            data_arr['SIP_ID'] = SIP_ID;
            data_arr['ClientID'] = ClientID;
            data_arr['User_Status_ID'] = User_Status_ID;
            data_arr['campaignType'] = campaignType;
            data_arr['userID'] = userID;
            data_arr['ManualCallerIDList'] = ManualCallerIDList;
            data_arr['Queue_Priority'] = Queue_Priority;
            data_arr['IsDedicatedCLI'] = IsDedicatedCLI;
            data_arr['loginHourID'] = LoginHourID;
            data_arr['modeDBId'] = ModeDBId;
            data_arr['MOPanel'] = MOPanel;
            data_arr['ChatA'] = ChatA;
            data_arr['ChatLoginID'] = ChatLoginID;
            data_arr['lastQueuePause'] = lastQueuePause;
            data_arr['UserModeIndexID'] = UserModeIndexID;
            data_arr['UserModeRecall'] = UserModeRecall;
            data_arr['TMCCount'] = TMCCount;
            data_arr['TOBCount'] = TOBCount;
            data_arr['TIBCount'] = TIBCount;
            data_arr['TRCCount'] = TRCCount;
            data_arr['TTCCount'] = TTCCount;
            data_arr['TCCCount'] = TCCCount;
            data_arr['Call_Mc_Count'] = Call_Mc_Count;
            data_arr['Call_Ob_Count'] = Call_Ob_Count;
            data_arr['Call_In_Count'] = Call_In_Count;
            data_arr['recallCount'] = recallCount;
            data_arr['transferCount'] = transferCount;
            data_arr['Conference_Count'] = Conference_Count;
            data_arr['skill'] = skill;
            data_arr['UserModeIndex'] = Object.keys(UserModeIndexLabel).find(key => UserModeIndexLabel[key] === UserMode);
            const query_userlogin1= `INSERT INTO loginhour (agent, campaign, client_id, agent_version, login_time, logout_time)
        VALUES ("${userID}", "${CampaignName}", "${ClientID}", "${agent_version}", SYSDATE(), SYSDATE())`;
        result_userlogin1 = await executeQuery(query_userlogin1);
        if(result_userlogin1.insertId > 0)
        {
            data_arr['LoginHourID']=result_userlogin1.insertId;
             /*********UPDATE USER mode STATUS */
            const query_usermode1= `INSERT INTO user_mode_action (client_id, login_id, mode, campaign, start_time, end_time)
             VALUES ("${ClientID}", "${data_arr['LoginHourID']}", "${data_arr['UserModeIndex']}", "${CampaignName}", SYSDATE(), SYSDATE())`;
            result_usermode1 = await executeQuery(query_usermode1);
            data_arr['ModeDBId']=result_usermode1.insertId;

            /*********UPDATE USER STATUS */
            const query_newupdate_userstatus1 = `UPDATE user_status SET user_mode_id = "${data_arr['ModeDBId']}",user_mode = "${data_arr['UserModeIndex']}" WHERE  id = ${User_Status_ID}`;
            result_newuserstatus1 = await executeQuery(query_newupdate_userstatus1);
            /***********end update */
            data_arr['DispalyPhoneNumber']='';
            data_arr['MaskedPhoneNumber']='';
            data_arr['DisplayCallerID']='';
            data_arr['DisplayDIDName']='';
            data_arr['DisplayCallType']='';
            data_arr['IVRInput']='';
        }
        

    }
    else
    {

    }
    res.send({data:data_arr});
});

router.get('/current_dbdatetime', async (req, res, next) => {
    
    dsresult = await current_datetime();
    console.log(JSON.stringify(dsresult));
    res.send({ok:true,msg:dsresult});
});



module.exports = router;

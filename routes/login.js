var express = require('express');
var db1 = require('../config/db');
var db2 = require('../config/astdb');
var db3 = require('../config/clientdb');
const { format } = require('date-fns');
var errlogRouter = require('./err_log');
const { omni_wp_url, assign_sip_url, agent_version, CS_API_Port, control_server_url, CS_FREE_PORT, CS_LOGOUT_PORT} = require('./constant_webrtc');
const web_function = require('./webrtc_function');
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
router.get('/current_dbdatetime', async (req, res, next) => {
    dsresult = await web_function.current_datetime();
    //console.log(JSON.stringify(dsresult));
    res.send({ok:true,msg:dsresult});
});
/******************Login webrtc-agent******************** */
router.post('/webrtc-login', async (req, res) => {

    const {username,password,client_id,myip,extension,db_user,db_pass,db_server,web_server,cs_server,voice_server} = req.body;
    server_arr = await web_function.validateWebSip(extension,client_id);
    let newpass = web_function.base64Encode(password);
    let user_details='';
    let response='';
    let arrdata='';
    if(server_arr.ok != false)
    {
        exp_arr = await web_function.getExpireCheck(client_id,username);
        //console.log("No= "+exp_arr);
        if(exp_arr==false){
            response = {ok: false,msg: "invalid",data: {},};
        }
        const user_data_query = `SELECT id, user_id, name, flag, agent_mobile, first_login, email_id FROM user WHERE user_id = "${username}" AND client_id = "${client_id}" AND (password = "${newpass}" OR password = "${password}")`;
        user_data_result = await executeQuery(user_data_query);
        if(user_data_result.length > 0)
        {
            let agent=user_data_result[0];
            if(agent.flag == 1)
            {
                /** if status of agent is 1, that is agent is active*/
                /** function for getting the agent already loggedin in the application*/
                lic_arr = await web_function.getLicenseCheck(client_id,username);
                if(lic_arr != false)
                {
                    valid_user = await web_function.validateUserSession(username, client_id, myip, extension);
                    //console.log("validateUserSession1= ",valid_user);
                    if(valid_user.ok == true)
                    {
                        const updatesipipQuery = `UPDATE sip_ip_map SET agent_last_logged = "${username}" WHERE client_id = "${client_id}" AND sip_id = "${extension}"`;
                        const result_sip_ip = await executeQuery(updatesipipQuery);
                        const user_vm_query = `SELECT first_login FROM vm_client WHERE client_code = "${client_id}"`;
                        const agent_vmresult = await executeQuery(user_vm_query);
                        const role_auth = await web_function.setUserRoll(username, client_id);
                        const DNC = await web_function.loadDNCURL(client_id);
                        let new_db_date = await web_function.current_datetime();
                        let client = await web_function.checkClient_id(client_id);
                        //console.log("client_det= ",client);
                        Logintime=new Date().toLocaleTimeString('en-US', { hour12: false });
                        let defaultcampaign_type=await web_function.getDefaultCampaignAndMode(username, client_id);
    
                        arrdata={
                            first_login : agent.first_login,
                            first_login_clientvm : agent_vmresult[0].first_login,
                            User_Status_ID : valid_user.id,
                            USER_NAME : agent.name,
                            USER_EMAILID : agent.email_id,
                            AgentMobile : agent.agent_mobile,
                            isAgentLoginedIn : true,
                            AS_ID : server_arr.AS_ID,
                            SERVER_IP : server_arr.SERVER_IP,
                            VOICE_IP : server_arr.VOICE_IP,
                            SipCheck : server_arr.SipCheck,
                            ManualInAuto : role_auth.ManualInAuto,
                            AutoAnswer : role_auth.AutoAnswer,
                            DialPad : role_auth.DialPad,
                            InternalTransfer : role_auth.InternalTransfer,
                            ExternalTransfer : role_auth.ExternalTransfer,
                            InternalConference : role_auth.InternalConference,
                            ExternalConference : role_auth.ExternalConference,
                            HangupCall : role_auth.HangupCall,
                            Mute : role_auth.Mute,
                            Hold : role_auth.Hold,
                            Barge : role_auth.Barge,
                            Coach : role_auth.Coach,
                            Info : role_auth.Info,
                            SMS : role_auth.SMS,
                            Whatsapp : role_auth.Whatsapp,
                            ChatA : role_auth.ChatA,
                            ChatU : role_auth.ChatU,
                            MOPanel : role_auth.MOPanel,
                            LeadPanel : role_auth.LeadPanel,
                            Email : role_auth.Email,
                            CallLogPermission : role_auth.CallLogPermission,
                            UserSessionLog : role_auth.UserSessionLog,
                            isDisplayPhone : role_auth.isDisplayPhone,
                            Callback_Auto : role_auth.Callback_Auto,
                            CallForward : role_auth.CallForward,
                            UserDisableDisposition : role_auth.UserDisableDisposition,
                            DNCURL : DNC.DNCURL,
                            isRemoteDNC : DNC.isRemoteDNC,
                            RemoteDNCUrl : DNC.RemoteDNCUrl,
                            CS_API_Port : CS_API_Port,
                            LoginAtFullDate : new_db_date,
                            WaitingDisposition : false,
                            WaitingMoDisposition : false,
                            LoginAt : Logintime,
                            client_type : client.client_type,
                            multiple_number_search : client.multiple_number_search,
                            manualRouteSelect : client.manual_route,
                            previewHold : client.preview_hold,
                            changeLead : client.can_change_lead,
                            multipleCRMDataID : client.show_multiple_crmdataid,
                            tinyUrlSms : client.tiny_url_sms,
                            defaultCampaign : defaultcampaign_type.campaign,
                            defaultMode : defaultcampaign_type.user_mode,
                            CampaignManager : role_auth.CampaignManager,
                            MobileAgent : role_auth.MobileAgent,
                            Download : role_auth.Download,
                            Listen : role_auth.Listen,
                            AgentFree : role_auth.AgentFree,
                            AutoProgressive : role_auth.AutoProgressive,
                            feedback : role_auth.feedback,
                            AssignedPermission : client.assigned_permission,
                            DecisionTreePermission : client.decision_tree_permission,
                            TicketPermission : client.ticket_permission,
                            SmsPermission : client.sms_permission,
                            EmailPermission : client.email_permission,
                            HistoryPermission : client.history_permission,
                            FeedbackPermission : client.feedback_permission,
                            WhatsappInPermission : client.whatsapp_in_permission,
                            WhatsappOutPermission : client.whatsapp_out_permission,
                            ChatPermission : client.chat_permission
                        };
                        response = {ok: true,msg: "Success",data: arrdata};
                    }else
                    {
                        response = {ok: false,msg: "already login",data: {id:valid_user.id}};
                    }
                }else
                {
                    response = {ok: false,msg: "license",data: {}};
                }
            }
            else
            {
                response = {ok: false,msg: "inactive",data: {}};
            }
        }else
        {
            response = {ok: false,msg: "invalid",data: {}};
        }
    }
    else
    {
        response = {ok:false,msg:server_arr.msg,data:{}};
    }
    /*
    * returning the array containing the process success or failure
    * with properties of the agent
    */
    const getUserLoginTimeQuery = `SELECT login_time FROM user WHERE client_id = "${client_id}" AND user_id = "${username}"`;
    const userLoginResult = await executeQuery(getUserLoginTimeQuery);
    if (userLoginResult.length > 0) {
        const row = userLoginResult[0];
        if (row.login_time === '0000-00-00 00:00:00' || row.login_time === '') {
            const updateLoginTimeQuery = `UPDATE user SET login_time = SYSDATE() WHERE client_id = "${client_id}" AND user_id = "${username}"`;
            await executeQuery(updateLoginTimeQuery);
        }
    }
    //const mergedResponse = { ...server_arr, ...response};
    //console.log("login modeul",response);
    res.send(response);
});

const AgentRemove = async (ClientID, SIP_ID, CampaignName, USER_ID, SERVER_IP, CS_API_Port) => {
    
    let newurl=control_server_url+"?api_name=agentremove&input_data=client_id="+ClientID+"|exten="+SIP_ID+"|campaign="+CampaignName+"|agent="+USER_ID+"&CS_SOCKET="+SERVER_IP+"&CS_PORT="+CS_API_Port;
    //console.log("Api Url= "+newurl);
    let new_data ='';
    var options = {'method': 'GET','url': newurl};
    request(options, function (error, response) {
        if (error) {
        errlogRouter(2333, 'RouteName : api_model and method name: remove-agent');
        next(error);
        return;
        }
        new_data =response.body;
        return new_data;
    });
};

router.post('/newremove-campaign', async (req, res) => {
    const {ClientID, SIP_ID, CampaignName, USER_ID, SERVER_IP, CS_API_Port}=req.body; 
    const role_auth = await web_function.AgentRemove(ClientID, SIP_ID, CampaignName, USER_ID, SERVER_IP, CS_API_Port);
    //console.log(role_auth);
    res.send('sum'+JSON.stringify(role_auth));
});

router.post('/save-campaign', async (req, res) => {
    const {WaitingMoDisposition, WaitingDisposition, AS_ID, SIP_ID, ClientID, User_Status_ID, USER_ID, CampaignName, Campaign_Type, previousCampaignName, SERVER_IP, CS_API_Port, previousSQL, leadAssignTime, getNotificationInMode}=req.body; 
    
    if (leadAssignTime > 0 && getNotificationInMode == "true" && previousSQL.length > 0) {
        const deleteQuery = `DELETE FROM agent_preview_filter_sql WHERE agent = "${USER_ID}" AND client_id = "${ClientID}"`;
        await executeQuery(deleteQuery);
        const insertQuery = ` INSERT INTO agent_preview_filter_sql (agent, campaign, client_id, sql) VALUES ("${USER_ID}", "${previousCampaignName}", "${ClientID}", "${previousSQL}")`;
        await executeQuery(insertQuery);
    }
    
    const role_auth = await web_function.AgentRemove(ClientID, SIP_ID, CampaignName, USER_ID, SERVER_IP, CS_API_Port);
    const remove_queue = await web_function.removeQueue(AS_ID, SIP_ID, ClientID, User_Status_ID);
    let array = {UserMode: "",UserModeIndex: 0,ReadyToManualDial: false,LastModeIndexBeforeRecall: 0,LastModeBeforeRecall: "",};
    const manualIDData = await web_function.loadManualID(ClientID, USER_ID, CampaignName);
    array = { ...array, ...manualIDData };
    // Fetch and merge the results of LoadDNCURL
    const dncURLData = await web_function.loadDNCURL(ClientID);
    array = { ...array, ...dncURLData };
    userMode='auto';
    const load_campaign_details = await web_function.loadCampaignDetail(ClientID, USER_ID, CampaignName, AS_ID, Campaign_Type, previousCampaignName, User_Status_ID, userMode);
    array = { ...array, ...load_campaign_details};
    let campaign_permission = await web_function.checkCampaignAuth(ClientID,CampaignName);
    let  campaign_authdata={
        Cam_CrmPermission : campaign_permission.crm_permission,
        Cam_AssignedPermission : campaign_permission.assigned_permission,
        Cam_DecisionTreePermission : campaign_permission.decision_tree_permission,
        Cam_TicketPermission : campaign_permission.ticket_permission,
        Cam_SmsPermission : campaign_permission.sms_permission,
        Cam_EmailPermission : campaign_permission.email_permission,
        Cam_HistoryPermission : campaign_permission.history_permission,
        Cam_FeedbackPermission : campaign_permission.feedback_permission,
        Cam_WhatsappInPermission : campaign_permission.whatsapp_in_permission,
        Cam_WhatsappOutPermission : campaign_permission.whatsapp_out_permission,
        Cam_ChatPermission : campaign_permission.chat_permission};

    array = { ...array, ...campaign_authdata };


    res.send({ok:true,data:array,msg:""});
});

/****************Save User Mode***************** */
router.post('/save-mode', async (req, res) => {
    let {usermode, LastUserMode, UserModeIndexLabel, modeLoginAtFullDate, UserMode, loginHourID, ModeDBId, 
        emailCount, smsCount, idleDuration, wrapupDuration, holdCount, holdDuration, recallCount, recallDuration, 
        breakDuration, moDuration, transferCount, SipCheckStatus, campaignType, ManualCallerIDList, Queue_Priority, 
        IsDedicatedCLI, MOPanel, ChatA, ChatLoginID, lastQueuePause, UserModeIndexID, UserModeRecall, TMCCount, TOBCount, 
        TIBCount, TRCCount, TTCCount, TCCCount, Call_Mc_Count, Call_Ob_Count, Call_In_Count, Recall_Count, Conference_Count,
        is_Recall, Recall_Reload_Duration, userID, CampaignName, ClientID, isDisplayPhone, Callback_Auto, LastRecallAlertId, 
        client_type, WaitingDisposition, isLineBusy, LastModeBeforeRecall, LastModeIndexBeforeRecall, SIP_ID, AS_ID, SERVER_IP, CS_API_Port,
        Campaign_PreFix, User_Status_ID, NextUserMode, NextUserModeIndex, IsLicenseActive, DialPad, CRMLeadId, Campaign_DNC_Check, DNCURL, 
        isRemoteDNC, RemoteDNCUrl,
        CBADialing, CBIDialing, CBUDialing, CBSDialing, CBEDialing, CBQDialing, skill, DialedRoute, agentPrefix, Manual_Dial_Route, Manual_Caller_ID}=req.body; 
        //console.log("Data Save= "+JSON.stringify(req.body));
        let array = {};
        if (usermode && LastUserMode)
        {
            if (WaitingDisposition == "true" || WaitingDisposition == true) {
                array.NextUserMode = usermode;
                array.NextUserModeIndex = Object.keys(UserModeIndexLabel).find(key => UserModeIndexLabel[key] === usermode);
            }
            array.ModeDuration = await web_function.getModeSeconds(modeLoginAtFullDate);
            array.modeLoginAt = moment().format('HH : mm : ss');
            array.modeLoginAtFullDate = moment().format('YYYY-MM-DD HH:mm:ss');
            array.LastModeIndexBeforeRecall = 0;
            array.LastModeBeforeRecall = "";
            array.LastAgentStateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            if (UserMode == "Auto") {
                const removeQueueResult = await web_function.removeQueue(AS_ID, SIP_ID, ClientID, User_Status_ID);
                //if (!removeQueueResult) return {};
            }
            await web_function.SaveUserModeLog(ClientID, User_Status_ID, loginHourID, ModeDBId, emailCount, smsCount);
            
            let setusermodedata = await web_function.setUserMode(usermode, UserModeIndexLabel, CampaignName, SipCheckStatus, AS_ID,
                SIP_ID, ClientID, User_Status_ID, campaignType, userID, ManualCallerIDList,
                Queue_Priority, IsDedicatedCLI, loginHourID, ModeDBId, MOPanel, ChatA,
                ChatLoginID, lastQueuePause, UserModeIndexID, UserModeRecall, TMCCount, TOBCount,
                TIBCount, TRCCount, TTCCount, TCCCount, Call_Mc_Count, Call_Ob_Count,
                Call_In_Count, recallCount, transferCount, Conference_Count, skill);
            array.UserMode = usermode;
            array = { ...array, ...setusermodedata};
            array.UserModeIndex = Object.keys(UserModeIndexLabel).find(key => UserModeIndexLabel[key] === array.UserMode);

            const insertQuery_usermode = `INSERT INTO user_mode_action (client_id, login_id, mode, campaign, start_time, end_time) 
            VALUES ("${ClientID}", "${loginHourID}", "${array.UserModeIndex}", "${CampaignName}", SYSDATE(), SYSDATE())`;
            //console.log("step1u= "+insertQuery_usermode);
            const result_insertusermode = await executeQuery(insertQuery_usermode);
            array.ModeDBId = result_insertusermode.insertId;
            const updateQuery = `UPDATE user_status SET user_mode_id = "${array.ModeDBId}", user_mode = "${array.UserModeIndex}"  WHERE id = "${User_Status_ID}"`;
            await executeQuery(updateQuery);
            array.DispalyPhoneNumber = "";
            array.MaskedPhoneNumber = "";
            array.DisplayCallerID = "";
            array.DisplayDIDName = "";
            array.DisplayCallType = "";
            array.IVRInput = "";
            if (array.UserMode.toLowerCase() == "auto") 
            {
                const addqueuearray=await web_function.addQueue(AS_ID, SIP_ID, ClientID, User_Status_ID, CampaignName, campaignType, userID, ManualCallerIDList, Queue_Priority, IsDedicatedCLI, lastQueuePause, usermode, skill);
                array = { ...array, ...addqueuearray};
            }
        } 
        else if (usermode && !LastUserMode) 
        {
            array.LastAgentStateTime = moment().format('YYYY-MM-DD HH:mm:ss');
            await web_function.SaveUserModeLog(ClientID, User_Status_ID, loginHourID, ModeDBId, emailCount, smsCount);

            let setusermodedata = await web_function.setUserMode(usermode, UserModeIndexLabel, CampaignName, SipCheckStatus, AS_ID,
            SIP_ID, ClientID, User_Status_ID, campaignType, userID, ManualCallerIDList,Queue_Priority, IsDedicatedCLI, loginHourID, ModeDBId, MOPanel, ChatA,
            ChatLoginID, lastQueuePause, UserModeIndexID, UserModeRecall, TMCCount, TOBCount,TIBCount, TRCCount, TTCCount, TCCCount, Call_Mc_Count, Call_Ob_Count,
            Call_In_Count, recallCount, transferCount, Conference_Count, skill);
    
            array.UserMode = usermode;
            array = { ...array, ...setusermodedata};
           /////// Insert data in login hours                
            const insertloginmode = `INSERT INTO loginhour (agent, campaign, client_id, agent_version, login_time, logout_time) 
            VALUES ("${userID}", "${CampaignName}", "${ClientID}", "${agent_version}", SYSDATE(), SYSDATE())`;

            const result_loginhour = await executeQuery(insertloginmode);
            if (result_loginhour.insertId > 0) 
            {
                
                array.UserModeIndex = Object.keys(UserModeIndexLabel).find(key => UserModeIndexLabel[key] === array.UserMode);
                array.LoginHourID = result_loginhour.insertId;
                let new_login_id=result_loginhour.insertId;
                const insertQuery_usermode = `INSERT INTO user_mode_action (client_id, login_id, mode, campaign, start_time, end_time) 
                VALUES ("${ClientID}", "${new_login_id}", "${array.UserModeIndex}", "${CampaignName}", SYSDATE(), SYSDATE())`;

                //console.log(" step2u= "+insertQuery_usermode);

                const result_insertusermode = await executeQuery(insertQuery_usermode);
                array.ModeDBId = result_insertusermode.insertId;
                const query_update_userstatus = `UPDATE user_status SET user_mode_id = "${array.ModeDBId}", user_mode = "${array.UserModeIndex}" WHERE  id = "${User_Status_ID}"`;
                result_userstatus = await executeQuery(query_update_userstatus);
                array.DispalyPhoneNumber = "";
                array.MaskedPhoneNumber = "";
                array.DisplayCallerID = "";
                array.DisplayDIDName = "";
                array.DisplayCallType = "";
                array.IVRInput = "";
    
                if (array.UserMode.toLowerCase() == "auto") {
                    //console.log("testauto");
                    const addqueuearray=await web_function.addQueue(AS_ID, SIP_ID, ClientID, User_Status_ID, CampaignName, campaignType, userID, ManualCallerIDList, Queue_Priority, IsDedicatedCLI, lastQueuePause, usermode, skill);
                    //console.log("add qq",addqueuearray);
                    array = { ...array, ...addqueuearray};
        
                }
                
                } else {
                    array={};
                }
            } else {
                array={};
            }
    
        
    
    res.send({ok:true,data:array,msg:""});
});


router.post('/set-campaign', async (req, res) => {
    let {USER_ID,CampaignName,ClientID,AS_ID,User_Status_ID,MOPanel,UserMode,SIP_ID,ChatA,
         isDisplayPhone,Callback_Auto,LastRecallAlertId,client_type,WaitingDisposition,isLineBusy,LastModeBeforeRecall,LastModeIndexBeforeRecall,SERVER_IP,
        CS_API_Port,Campaign_PreFix,NextUserMode,NextUserModeIndex,UserModeIndexLabel,SipCheckStatus,campaignType,ManualCallerIDList,Queue_Priority,
        IsDedicatedCLI,lastQueuePause,UserModeIndexID,UserModeRecall,emailCount,smsCount,idleDuration,wrapupDuration,holdCount,holdDuration,
        recallCount,recallDuration,breakDuration,moDuration,transferCount,TMCCount,TOBCount,TIBCount,TRCCount,TTCCount,TCCCount,Call_Mc_Count, 
        Call_Ob_Count,Call_In_Count,Conference_Count,IsLicenseActive,DialPad,CRMLeadId,Recall_Count,Campaign_DNC_Check,DNCURL,
        isRemoteDNC,RemoteDNCUrl,CBADialing,CBIDialing,CBUDialing,CBSDialing,CBEDialing,CBQDialing,skill,isRecall_Mode_Allow, 
        DialedRoute,agentPrefix,Manual_Dial_Route,Manual_Caller_ID}=req.body; 
    try 
    {
        let response = {};
        let UserModeIndex=0;
        UserModeIndex = Object.keys(UserModeIndexLabel).find(key => UserModeIndexLabel[key] == UserMode);
        //console.log(UserModeIndex);
        response.UserModeIndex = UserModeIndex;
        const loginHourQuery = `INSERT INTO loginhour (agent, campaign, agent_version, client_id, login_time, logout_time) VALUES ("${USER_ID}", "${CampaignName}", "${agent_version}", "${ClientID}", SYSDATE(), SYSDATE())`;
        const loginHourResult = await executeQuery(loginHourQuery);
        if (loginHourResult.affectedRows > 0) {
            const loginHourID = loginHourResult.insertId;
            response.LoginHourID = loginHourID;
            let new_login_id=loginHourResult.insertId;
            // Insert into `user_mode_action` table
            const userModeActionQuery = `INSERT INTO user_mode_action (login_id, mode, campaign, client_id, start_time, end_time)
                VALUES ("${new_login_id}", "${UserModeIndex}", "${CampaignName}", "${ClientID}", SYSDATE(), SYSDATE())`;
            const userModeActionResult = await executeQuery(userModeActionQuery);
            const modeDBId = userModeActionResult.insertId;
            response.ModeDBId = modeDBId;

            // Update `user_status` table
            const userStatusUpdateQuery = `UPDATE user_status SET login_id = "${new_login_id}", user_mode_id = "${modeDBId}", user_mode = "${UserModeIndex}", server_id = "${AS_ID}" WHERE id = "${User_Status_ID}"`;
            await executeQuery(userStatusUpdateQuery);

            // Handle chat login
            response.ChatLoginID = await web_function.chatLoginStatus(ChatA, MOPanel, CampaignName, new_login_id, ClientID, USER_ID);

            // Pause in queue if mode is "auto"
            if (UserMode.toLowerCase() == "auto") {
                const addqueuearray=await web_function.addQueue(AS_ID, SIP_ID, ClientID, User_Status_ID, CampaignName, campaignType, USER_ID, ManualCallerIDList, Queue_Priority, IsDedicatedCLI, lastQueuePause, UserMode, skill);
                response = { ...response, ...addqueuearray};
            }
            

            // Perform agent login
            let newurl=control_server_url+"?api_name=agentlogin&input_data=client_id="+ClientID+"|exten="+SIP_ID+"|campaign="+CampaignName+"|agent="+USER_ID+"&CS_SOCKET="+SERVER_IP+"&CS_PORT="+CS_API_Port;
            let agent_csdata=await web_function.agenSendCSData(newurl);
            //console.log(agent_csdata);
            // user status
            let setusermodedata = await web_function.setUserMode(UserMode, UserModeIndexLabel, CampaignName, SipCheckStatus, AS_ID,
                SIP_ID, ClientID, User_Status_ID, campaignType, USER_ID, ManualCallerIDList,
                Queue_Priority, IsDedicatedCLI, new_login_id, modeDBId, MOPanel, ChatA,
                response.ChatLoginID, lastQueuePause, UserModeIndexID, UserModeRecall, TMCCount, TOBCount,
                TIBCount, TRCCount, TTCCount, TCCCount, Call_Mc_Count, Call_Ob_Count,
                Call_In_Count, recallCount, transferCount, Conference_Count, skill);
                response.UserMode = UserMode;
                response = { ...response, ...setusermodedata};
                response.modeLoginAt = moment().format('HH : mm : ss');
                response.modeLoginAtFullDate = moment().format('YYYY-MM-DD HH:mm:ss');
                response.CurrentAgentStateTime = 0;
                response.ModeDuration = await web_function.getModeSeconds(response.modeLoginAtFullDate);
        }
        let campaign_permission = await web_function.checkCampaignAuth(ClientID,CampaignName);
        let  campaign_authdata={
            Cam_CrmPermission : campaign_permission.crm_permission,
            Cam_AssignedPermission : campaign_permission.assigned_permission,
            Cam_DecisionTreePermission : campaign_permission.decision_tree_permission,
            Cam_TicketPermission : campaign_permission.ticket_permission,
            Cam_SmsPermission : campaign_permission.sms_permission,
            Cam_EmailPermission : campaign_permission.email_permission,
            Cam_HistoryPermission : campaign_permission.history_permission,
            Cam_FeedbackPermission : campaign_permission.feedback_permission,
            Cam_WhatsappInPermission : campaign_permission.whatsapp_in_permission,
            Cam_WhatsappOutPermission : campaign_permission.whatsapp_out_permission,
            Cam_ChatPermission : campaign_permission.chat_permission};
        response = { ...response, ...campaign_authdata};
        res.send({ok:true,data:response});
    }catch (error) {
        res.send({ok:false,data:"response"});
    }
        
});

router.post('/get-usermode', async (req, res) => {
    const {ClientID, USER_ID, CampaignName, AS_ID, Campaign_Type, PreviousCampaignName, User_Status_ID}=req.body; 
        try {
        let response = {};
        let manual_id = await web_function.loadManualID(ClientID, USER_ID, CampaignName);
        response = { ...response, ...manual_id};
        let load_camp_details = await web_function.loadCampaignDetail(ClientID, USER_ID, CampaignName, AS_ID, Campaign_Type, PreviousCampaignName, User_Status_ID);

        response = { ...response, ...load_camp_details};
        res.send({ok:true,data:response,msg:""});
        }catch (error) {
            res.send({ok:false,data:"response",msg:""});
        }
});
/*
* function getAssignedLead
* getting the new lead assigned to the agent.
*/

router.post('/get-notification', async (req, res) => {
    const {campaign, agent, ClientID}=req.body; 
    try {
        let result = { newleadassigned: '' };

        // Query to fetch the leadid
        const leadQuery = `SELECT leadid FROM agent_notify_lead WHERE campaign = "${campaign}" AND agent = "${agent}" AND client_id = "${ClientID}" ORDER BY id DESC LIMIT 1`;
        const leadResult = await executeQuery(leadQuery);
        if (leadResult.length > 0) {
            const leadid = leadResult[0].leadid;
            result.newleadassigned = leadid;

            // Query to delete the lead after it's been assigned
            const deleteQuery = `DELETE FROM agent_notify_lead WHERE campaign = "${campaign}" AND agent = "${agent}" AND client_id = "${ClientID}"`;
            await executeQuery(deleteQuery);

            // Store the previous SQL query
            result.previousSQL = `SELECT * FROM galaxy_client_v5.crm_data WHERE client_id = '${ClientID}' AND campaign = '${campaign}' AND leadid = '${leadid}' AND assigned_to = '${agent}'`;
        }

        res.send(result);
    } catch (error) {
        console.error(error);
        res.send({ newleadassigned: '', previousSQL: '' });
    }
});
/*************Reload Configuration file***************** */
router.post('/reload-conf', async (req, res) => {
    const {ClientID,USER_ID,CampaignName,AS_ID,Campaign_Type,PreviousCampaignName,User_Status_ID,LoginHourID,UserMode,SIP_ID,lastQueuePause}=req.body; 
    try {
            let array = {};
            // Load Campaign List
            const campaignList = await web_function.load_Campaign_List(ClientID, USER_ID, CampaignName);
            //console.log("campaignList= ",campaignList);
            array = { ...array, ...campaignList };

            // Set User Role
            const userRole = await web_function.setUserRoll(USER_ID, ClientID);
            array = { ...array, ...userRole };

            // Load Manual ID
            const manualID = await web_function.loadManualID(ClientID, USER_ID, CampaignName);
            array = { ...array, ...manualID };
            // Load Campaign Details
            const campaignDetail = await web_function.loadCampaignDetail(ClientID,USER_ID,CampaignName,AS_ID,Campaign_Type,PreviousCampaignName,User_Status_ID,UserMode,AS_ID,SIP_ID,array['ManualCallerIDList'],array['Queue_Priority'],array['IsDedicatedCLI'],lastQueuePause);
            array = { ...array, ...campaignDetail };

            // Load DNC URL
            const dncURL = await web_function.loadDNCURL(ClientID);
            array = { ...array, ...dncURL };

            /********Client Permission**** */
            let client_auth = await web_function.checkClient_id(ClientID);
            let  client_authdata={
            client_type : client_auth.client_type,
            multiple_number_search : client_auth.multiple_number_search,
            manualRouteSelect : client_auth.manual_route,
            previewHold : client_auth.preview_hold,
            changeLead : client_auth.can_change_lead,
            multipleCRMDataID : client_auth.show_multiple_crmdataid,
            tinyUrlSms : client_auth.tiny_url_sms,
            AssignedPermission : client_auth.assigned_permission,
            DecisionTreePermission : client_auth.decision_tree_permission,
            TicketPermission : client_auth.ticket_permission,
            SmsPermission : client_auth.sms_permission,
            EmailPermission : client_auth.email_permission,
            HistoryPermission : client_auth.history_permission,
            FeedbackPermission : client_auth.feedback_permission,
            WhatsappInPermission : client_auth.whatsapp_in_permission,
            WhatsappOutPermission : client_auth.whatsapp_out_permission,
            ChatPermission : client_auth.chat_permission
            };
            array = { ...array, ...client_authdata };
            let campaign_permission = await web_function.checkCampaignAuth(ClientID,CampaignName);
            let  campaign_authdata={
                Cam_CrmPermission : campaign_permission.crm_permission,
                Cam_AssignedPermission : campaign_permission.assigned_permission,
                Cam_DecisionTreePermission : campaign_permission.decision_tree_permission,
                Cam_TicketPermission : campaign_permission.ticket_permission,
                Cam_SmsPermission : campaign_permission.sms_permission,
                Cam_EmailPermission : campaign_permission.email_permission,
                Cam_HistoryPermission : campaign_permission.history_permission,
                Cam_FeedbackPermission : campaign_permission.feedback_permission,
                Cam_WhatsappInPermission : campaign_permission.whatsapp_in_permission,
                Cam_WhatsappOutPermission : campaign_permission.whatsapp_out_permission,
                Cam_ChatPermission : campaign_permission.chat_permission
                };

            array = { ...array, ...campaign_authdata };
            

            // Chat Login Status
            const chatLoginID = await web_function.chatLoginStatus(array['ChatA'],array['MOPanel'],CampaignName,LoginHourID,ClientID,USER_ID);
            array['ChatLoginID'] = chatLoginID;
            res.send({ok:true,data:array});

    } catch (error) {
        console.error(error);
        res.send({ok:false,data:""});
    }
});
/*************Transfer call list************* */
router.post('/transfer-list', async (req, res) => {
    const {ClientID,USER_ID,CampaignName,SERVER_IP}=req.body; 
    try {
        var CS_API_Port=18000;
        const new_timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
        let newurl=control_server_url+"?api_name=agentfreelist&input_data=client_id="+ClientID+"|campaign="+CampaignName+"|TIMESTAMP="+new_timestamp+"|agent="+USER_ID+"&CS_SOCKET="+SERVER_IP+"&CS_PORT="+CS_API_Port;
        //console.log(newurl);
        // SendToCS function to make the network request
        const result = await web_function.agenSendCSData(newurl);

        // Process the result
        const processedString = result.replace(/FREEUSER\|/g, "").replace(/~/g, "-");
        let extension = [];
        if (processedString.trim().length > 0) {
            extension = processedString.split("|");
        }
        
        // Generate the dropdown options
        let options = '<option value="">Select</option>';
        if (Array.isArray(extension)) {
            extension.forEach((ext) => {
                const result = ext.split("-");
                //console.log(result[0].toLowerCase()+" other"+USER_ID.toLowerCase());
                if(result[0].toLowerCase() != USER_ID.toLowerCase())
                {
                    options += `<option value="${ext}">${ext}</option>`;
                }
                
            });
        }
        // Return JSON response
        res.send({ok: true,list: options});

    } catch (error) {
        console.error(error);
        res.send({ok:false,data:""});
    }
});

/*************Queue Transfer call list************* */
router.post('/transferqueue-list', async (req, res) => {
    const {campaign,ClientID,CampaignName,DisplayDIDName}=req.body; 
    try {

        const result = {Trans_Queue_Priority:[]};
        // SQL query to fetch data
        const query = `SELECT to_queue, queue_priority FROM campaign_queue_map WHERE client_id = "${ClientID}" AND from_campaign = "${CampaignName}" AND from_queue = "${DisplayDIDName}" AND to_campaign = "${campaign}" LIMIT 200`;
        // Execute query with parameterized values to prevent SQL injection
        //console.log(query);
        const rows = await executeQuery(query);
        let options = '<option value="">Select</option>';
        if (rows.length > 0) {
            rows.forEach((row, index) => {
                //result.agent.push(row.to_queue);
                result.Trans_Queue_Priority[index] = `${row.to_queue}~${row.queue_priority}`;
                options += `<option value="${row.to_queue}">${row.to_queue}</option>`;
            });
        }
        const response = {ok: true,data: result,list: options};
        res.send(response);
    } catch (error) {
        console.error(error);
        res.send({ok:false,data:""});
    }
});

/*************Skill Transfer call list************* */
router.post('/transferskill-list', async (req, res) => {
    const { campaign, ClientID } = req.body;
    try {
        // Query to fetch skills
        const skillQuery = `SELECT skill FROM campaign_skill_map WHERE client_id = "${ClientID}" AND campaign = "${campaign}" LIMIT 200`;
        const skillResult = await executeQuery(skillQuery);

        // Prepare the result object
        const result = { agent: [] };

        // Populate the agent array with skills if rows are found
        if (skillResult.length > 0) {
            result.agent = skillResult.map(row => row.skill);
        }

        // Generate the dropdown options
        let str = "<option value=''>Select</option>";
        if (Array.isArray(result.agent) && result.agent.length > 0) {
            result.agent.forEach(agent => {
                str += `<option value='${agent}'>${agent}</option>`;
            });
        }
        const response = {ok:true,data:skillResult,list:str};
        res.send(response);
    } catch (error) {
        console.error('Error in transferskill-list:', error);
        res.status(500).send({ ok: false, data: "", list: "" });
    }
});

/****************Call Forwarding*************** */
router.post('/agent-campaign-call-forward', async (req, res) => {
    const { action, CampaignName, USER_ID, ClientID, AgentMobile } = req.body;
    var local_ip_addres = req.ip.replace(/^::ffff:/, '');
    let result='';
    try {
        if (action == 'add') {
            // Insert action
            const insertQuery = `INSERT INTO agent_campaign_call_forward 
                (user_id, campaign_id, mobile_no, client_id, update_by_ip, update_by_user) VALUES ("${USER_ID}", "${CampaignName}", "${AgentMobile}", "${ClientID}", "${local_ip_addres}", "${USER_ID}")`;
                result = await executeQuery(insertQuery);
        } else if (action == 'delete') {
            // Delete action
            let deleteQuery = `DELETE FROM agent_campaign_call_forward WHERE user_id = "${USER_ID}" AND client_id = "${ClientID}"`;

            if (CampaignName) {
                deleteQuery += ` AND campaign_id = "${CampaignName}"`;
            }

            result = await executeQuery(deleteQuery);
        }
        const array = {ok:result.affectedRows > 0};
        res.json(array);
    } catch (error) {
        console.error('Error processing agent-campaign-call-forward:', error);
        res.status(500).json({ ok: false });
    }
});
/******************** Review Crm ***************** */
router.post('/review-crm', async (req, res) => {
    const { USER_ID, CampaignName, LoginHourID, ModeDBId, SIP_ID, ClientID, ActivityID, Activity, LastUsedSkill, UserMode, CRMDataID } = req.body;
    try {
        const crmDataQuery = `SELECT leadid, phone FROM crm_data WHERE id = ${CRMDataID}`;
        const crmDataResult = await executeQuery3(crmDataQuery);
        //console.log(crmDataResult);
        if (crmDataResult.length > 0) {
            const row = crmDataResult[0];
            const CRMLeadId = row.leadid;
            const phone = row.phone;
            const WaitingDisposition = true;
            const RecordID = `${new Date().toISOString().slice(2, 10).replace(/-/g, '')}${Date.now()}${SIP_ID}`;

            // Insert data into disposition table
            const insertQuery = `INSERT INTO disposition (agent, campaign, did, phone, rid, lead_id, login_id, mode_action_id, sip, client_id, dispose_status, user_review_id, activity, call_type, originate_source, start_time, end_time, hangup_time)
                VALUES ('${USER_ID}', '${CampaignName}', ${CRMDataID}, '${phone}', '${RecordID}', '${CRMLeadId}', '${LoginHourID}', '${ModeDBId}', '${SIP_ID}', ${ClientID}, '4', ${ActivityID}, '${Activity}', '', 'W', NOW(), NOW(), NOW())`;
            const result_dispose=await executeQuery3(insertQuery);
            const DispositionID = result_dispose.insertId;
            // Log the CRM data
            let insertlogcrm = await web_function.CRMDataLogEntry(CRMDataID);
            //console.log("insertlogcrm",insertlogcrm);

            res.json({ok: true,data: {CRMLeadId,WaitingDisposition,DispositionID,RecordID}});
        } else {
           
            res.json({ok: false,msg: 'No data found for the given CRMDataID'});
        }
    } catch (error) {
        console.error('Error processing agent-campaign-call-forward:', error);
        res.status(500).json({ ok: false });
    }
});
/**************Remove Agent from CS************** */
router.post('/remove-agent', async (req, res) => {
    const { client_id, exten, campaign, agent, SERVER_IP, CS_API_Port } = req.body;

    try {
        // Validate required fields
        if (!client_id || !exten || !campaign || !agent || !SERVER_IP || !CS_API_Port) {
            const missingFields = [];
            if (!client_id) missingFields.push("Client ID");
            if (!exten) missingFields.push("Extension");
            if (!campaign) missingFields.push("Campaign");
            if (!agent) missingFields.push("Agent");
            if (!SERVER_IP) missingFields.push("Server IP");
            if (!CS_API_Port) missingFields.push("CS API Port");

            return res.status(400).json({
                ok: false,
                msg: `${missingFields.join(", ")} can not be blank`
            });
        }

        // Construct the URL
        const newurl = `${control_server_url}?api_name=agentremove&input_data=client_id=${client_id}|agent=${agent}|exten=${exten}|campaign=${campaign}&CS_SOCKET=${SERVER_IP}&CS_PORT=${CS_API_Port}`;
        //console.log("Generated URL:", newurl);

        // Send data to CS API
        const agent_csdata = await web_function.agenSendCSData(newurl);

        // Respond with success
        res.json({ ok: true, data: agent_csdata });

    } catch (error) {
        console.error('Error in /remove-agent route:', error);
        res.status(500).json({
            ok: false,
            msg: 'Internal server error. Please try again later.'
        });
    }
});

router.post('/assign-siplist', async (req, res) => {
    const {client_id, agent, SERVER_IP, CS_API_Port } = req.body;

    try {
        // Validate required fields
        if (!client_id || !agent || !SERVER_IP || !CS_API_Port) {
            const missingFields = [];
            if (!client_id) missingFields.push("Client ID");
            if (!agent) missingFields.push("Agent");
            if (!SERVER_IP) missingFields.push("Server IP");
            if (!CS_API_Port) missingFields.push("CS API Port");
            return res.status(400).json({
                ok: false,
                msg: `${missingFields.join(", ")} can not be blank`
            });
        }

        // Construct the URL
        const newurl = `${control_server_url}?api_name=sipassign&input_data=client_id=${client_id}|agent=${agent}|extentype=webrtcagent&CS_SOCKET=${SERVER_IP}&CS_PORT=${CS_API_Port}`;
        //console.log("Generated URL:", newurl);

        // Send data to CS API
        const agent_csdata = await web_function.agenSendCSData(newurl);
        let extension = [];
        if (agent_csdata.trim().length > 0) {
            extension = agent_csdata.split("|");
        }

        // Respond with success
        res.json({ status : true, assign_sip: extension[1] });

    } catch (error) {
        console.error('Error in /remove-agent route:', error);
        res.status(500).json({status : false,msg: 'Internal server error. Please try again later.'});
    }
});

/*
* function freeAgent
* to be called while agent request for destroying his/her current session,
* and want to login again, due to some technical or other issues
* @return json_string
*/
router.post('/free-agent', async (req, res) => {
    const {id} = req.body;
    try { 
        if (!id) return res.json({ ok: false, msg: 'Invalid ID' });
        // Fetch agent details
        const userstatus=`SELECT name, sipid, client_id FROM user_status WHERE id = '${id}'`;
        const userstatus_result = await executeQuery(userstatus);
        if (userstatus_result.length === 0) 
        {
            return res.json({ ok: false, msg: 'User not found' });
        }
        const { name: agent, sipid: sip, client_id: cid } = userstatus_result[0];
        // Check agent role
        const userroles=`SELECT id FROM user_role WHERE id = '${agent}' AND client_id = '${cid}' AND agent_free = 0`;
        const userrole_result = await executeQuery(userroles);
        if (userrole_result.length > 0) {
            const userstatus_update=`UPDATE user_status SET user_free = 1 WHERE id = '${id}'`;
            await executeQuery(userstatus_update);
            return res.json({ ok: false, msg: 'You have no permission, Please Contact Administrator!...' });
        }
        // Get server IP
        const userip=`SELECT ip_address FROM ip_config WHERE id = 2`;
        const userip_result = await executeQuery(userip);
        if (userip_result.length === 0){
            return res.json({ ok: false, msg: 'Server IP not found' });
        }
        const SERVER_IP = userip_result[0].ip_address;
        const newurl = `${control_server_url}?api_name=free&input_data=client_id=${cid}|agent=${agent}|sip=${sip}&CS_SOCKET=${SERVER_IP}&CS_PORT=${CS_FREE_PORT}`;
        //console.log("Generated URL:", newurl);
        const agent_csdata = await web_function.agenSendCSData(newurl);
        //console.log(agent_csdata);
        const result = agent_csdata.split('|');
        if (result[0].trim() != '1')
        {
            return res.json({ ok: false, msg: 'Unable to remove agent on cs server' });
        }
        // Delete user status
        const delete_userstatus=`DELETE FROM user_status WHERE id = '${id}'`;
        const deleteuser_status_result = await executeQuery(delete_userstatus);
        if (deleteuser_status_result.affectedRows === 0) 
        {
            return res.json({ ok: false, msg: 'Unable to delete user status..!' });
        }
        // Get last login campaign
        const query_loginhours=`SELECT id, campaign FROM loginhour WHERE agent = '${agent}' AND client_id = '${cid}' ORDER BY id DESC LIMIT 1`;
        const loginhour_result = await executeQuery(query_loginhours);
        if (loginhour_result.length > 0) {
            const { id: login_id, campaign: camp } = loginhour_result[0];
            const update_query_loginhours=`UPDATE loginhour SET free_time = SYSDATE() WHERE id = '${login_id}' AND client_id = '${cid}'`;
            await executeQuery(update_query_loginhours);
            const update_query_usermode=`UPDATE user_mode_action SET free_time = SYSDATE() WHERE login_id = '${login_id}' AND client_id = '${cid}' ORDER BY id DESC LIMIT 1`;
            await executeQuery(update_query_usermode);
            if (camp) 
            {
                const logouturl = `${control_server_url}?api_name=&input_data=ACTION=LOGOUT|client_id=${cid}|agent=${agent}|campaign=${camp}&CS_SOCKET=${SERVER_IP}&CS_PORT=${CS_LOGOUT_PORT}`;
                const logout_csdata = await web_function.agenSendCSData(logouturl);
                console.log(logout_csdata);
            }
        }
    
        res.json({ ok: true, msg: 'Success' });

    } catch (error) {
        console.error('Error in /remove-agent route:', error);
        res.status(500).json({status : false,msg: 'Internal server error. Please try again later. from free-agent'});
    }
});
/*
* function Dynamic database Api
* to be called while agent request for destroying his/her current session,
* and want to login again, due to some technical or other issues
* @return json_string
*/
router.post('/database-api', async (req, res) => {
    const {client_id} = req.body;
    try { 
        if (!client_id) return res.json({ ok: false, msg: 'Invalid client_id' });
        // Fetch agent details
        const query=`SELECT db_server, voice_server, cs_server, web_server, dbuser_name, db_password FROM domain_client.client_server_map WHERE client_id = '${client_id}' LIMIT 1`;
        const userstatus_result = await executeQuery(query);
        let result=userstatus_result[0];
        if (userstatus_result.length === 0) 
        {
            return res.json({ ok: false, msg: 'No data found...!' });
        }else
        {
            //console.log(`True~${result.db_server}~${result.voice_server}~${result.cs_server}~${result.web_server}~${result.dbuser_name}~${result.db_password}`);
            return res.send(`True~${result.db_server}~${result.voice_server}~${result.cs_server}~${result.web_server}~${result.dbuser_name}~${result.db_password}`);
        }
    } catch (error) {
        console.error('Error in /database-api', error);
        res.status(500).json({status : false,msg: 'Internal server error. Please try again later. from database-api'});
    }
});
/*
* function Progressive Call Api
* @return json_string
*/
router.post('/progressive-call', async (req, res) => {
    const { client_id, agent, exten, campaign, campaign_type, userskill, server, SERVER_IP, CS_API_Port } = req.body;

    if (!client_id) return res.json({ status: false, msg: "Client Id cannot be blank" });
    if (!agent) return res.json({ status: false, msg: "Agent cannot be blank" });
    if (!exten) return res.json({ status: false, msg: "Extension cannot be blank" });
    if (!campaign) return res.json({ status: false, msg: "Campaign cannot be blank" });
    if (!campaign_type) return res.json({ status: false, msg: "Campaign Type cannot be blank" });
    if (!server) return res.json({ status: false, msg: "Server id cannot be blank" });
    if (!SERVER_IP) return res.json({ status: false, msg: "CS Server Ip cannot be blank" });
    if (!CS_API_Port) return res.json({ status: false, msg: "CS API Port cannot be blank" });
    try { 
        const progressive_url = `${control_server_url}?api_name=progressive2&input_data=client_id=${client_id}|agent=${agent}|exten=${exten}|campaign=${campaign}|campaign_type=${campaign_type}|userskill=${userskill}|server=${server}&CS_SOCKET=${SERVER_IP}&CS_PORT=${CS_API_Port}`;
        const result_progressive = await web_function.agenSendCSData(progressive_url);
        const arr = result_progressive.split("|");

        if (arr.length > 2) {
            res.json({ status: true, phone: arr[0], lead_id: arr[1], progressive_id: arr[2], progressive_dataid: arr[3] });
        } else {
            res.json({ status: false, msg: arr[0], name: arr[1] });
        }
    } catch (error) {
        console.error('Error in /database-api', error);
        res.status(500).json({status : false,msg: 'Internal server error. Please try again later. from database-api'});
    }
});



module.exports = router;

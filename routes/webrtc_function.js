var express = require('express');
var db1 = require('../config/db');
var db2 = require('../config/astdb');
var db3 = require('../config/clientdb');
const { format } = require('date-fns');
var errlogRouter = require('./err_log');
const { omni_wp_url, assign_sip_url, agent_version, CS_API_Port, control_server_url, CS_FREE_PORT, CS_LOGOUT_PORT } = require('./constant_webrtc');
var router = express.Router();
let moment = require('moment');
const request = require('request'); 

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
function greetUser(name) {
    return `Hello, ${name}! Welcome to our application.`;
}
function addNumbers(a, b) {
    return a + b;
}

/***********Check Client_id************ */
const checkClient_id = async (clientID) => {
    try {
        // Query to check user status
        const client_query = `SELECT client_type, multiple_number_search, manual_route, can_change_lead, preview_hold, show_multiple_crmdataid, tiny_url_sms, crm_permission,
        assigned_permission, decision_tree_permission, ticket_permission, sms_permission, email_permission, history_permission, feedback_permission, whatsapp_in_permission, whatsapp_out_permission,chat_permission
         FROM vm_client WHERE client_code = "${clientID}" AND flag = 1`;
        const client_result = await executeQuery(client_query);
        if (client_result.length > 0) {
            return client_result[0];
        } else {
            return false;
        }
    } catch (error) {
        return false;
    }
};
/***********Check Server_ip************ */
const loadServerIP = async (serverId) => {
    try {
        // Query to fetch server details
        const query = `SELECT id, ip_address, server_type FROM ip_config`;
        const result = await executeQuery(query);

        if (result.length > 0) {
            const array = {};

            result.forEach((ip) => {
                const serverType = ip.server_type;
                if (serverType === "CS") {
                    array['SERVER_IP'] = ip.ip_address;
                }
                if (parseInt(ip.id, 10) === serverId) {
                    array['VOICE_IP'] = ip.ip_address;
                }
            });

            return array;
        }

        return {}; // Return an empty object if no rows are found
    } catch (error) {
        console.error('Error loading server IP:', error);
        return {}; // Return an empty object in case of error
    }
};
 /****************Validate websip***************** */
const validateWebSip = async (extension, client_id) => {
    let response = {ok: false,msg: "invalid",data: {}};
    let result_client = await checkClient_id(client_id);
    //console.log("checkClient_id= ",result_client.client_type);
    let type='';
    let sip_result='';
    let sip_result_agent='';
    let AS_ID='';
    let server_ip='';
    if(result_client != false)
    {
        type=result_client.client_type;
        const sip_query = `SELECT sip_id FROM sip_ip_map WHERE client_id = "${client_id}" AND sip_id = "${extension}" AND sip_status = 1`;
        sip_result = await executeQuery(sip_query);
        if (sip_result.length > 0) {
             AS_ID = (type === "PRI") ? 4 : 5;
            const sip_tblagent='sipagent_'+AS_ID;
            const sipagent_query = `SELECT id FROM `+sip_tblagent+` WHERE name = "${extension}" AND client_id = "${client_id}" AND context = 'webrtcagent'`;
            sip_result_agent = await executeQuery2(sipagent_query);
            if (sip_result_agent.length > 0) {
                server_ip = await loadServerIP(AS_ID);
                response = {ok:true,AS_ID:AS_ID,SERVER_IP:server_ip.SERVER_IP,VOICE_IP:server_ip.VOICE_IP,SipCheck:true};
                //response2 = {alok:true};
                //const mergedResponse = { ...response, ...response2 };
                //console.log("ssss",mergedResponse);
            }else
            {
                response = {ok: false,msg:"webrtcagent",data: {}};
            }

        }else
        {
            response = {ok: false,msg:"sipnotfound",data: {}};
        }
    }
    else
    {
        response = {ok: false,msg:"clientid",data: {}};
    }

        return response;
};

/*********check expire******** */
const getExpireCheck = async (clientId, agent) => {
    // Step 1: Fetch `expire_days` for the client
    const clientQuery = `SELECT expire_days FROM vm_client WHERE client_code = "${clientId}"`;
    const clientResult = await executeQuery(clientQuery);
    //console.log("clientResult= ",clientResult);
    let expireDays = 0;
    if (clientResult.length > 0) {
        expireDays = clientResult[0].expire_days || 0;
    }

    // Step 2: Fetch `login_time` for the agent
    const userQuery = `SELECT login_time FROM user WHERE client_id = "${clientId}" AND user_id = "${agent}"`;
    const userResult = await executeQuery(userQuery);
    //console.log("userResult= ",userResult);
    if (userResult.length > 0) {
        const loginTime = userResult[0].login_time;
        if (loginTime && loginTime !== "0000-00-00 00:00:00") {
            const currentDate = new Date();
            const loginDate = new Date(loginTime);
            const diffInMs = currentDate - loginDate;
            const days = Math.floor(diffInMs / (1000 * 60 * 60 * 24)); // Convert milliseconds to days

            if (days > expireDays && expireDays !== 0) {
                return false; // Expired
            } else {
                return true; // Not expired
            }
        } else {
            return true; // No valid login time, consider valid
        }
    } else {
        return true; // Agent not found, consider valid
    }

};
const base64Encode = (data) => {
    return Buffer.from(data).toString('base64');
};
/*
* function getLicenseCheck
* to get the number of license available
* Also check the number of users logged in 
*/
const getLicenseCheck = async (clientId, agent) => {
    // Step 1: Fetch `NUMBER_OF_LICENSE` for the client
    const licenseQuery = `SELECT param_value FROM license WHERE client_id = "${clientId}" AND param_name = "NUMBER_OF_LICENSE"`;
    //console.log(licenseQuery);
    const licenseResult = await executeQuery(licenseQuery);
    if (licenseResult.length === 0) {
        return false; // License not found
    }
    const licenseValue = licenseResult[0].param_value;
    // Step 2: Count the number of logged-in agents for the client
    const agentStatusQuery = `SELECT count(*) AS cnt FROM user_status WHERE client_id = "${clientId}"`;
    const agentStatusResult = await executeQuery(agentStatusQuery);
    //console.log(agentStatusQuery);
    const loggedInAgents = agentStatusResult[0].cnt;
    // Step 3: Check if the number of logged-in agents is less than the license limit
    if (licenseValue > loggedInAgents) {
        return true; // License is available
    } else {
        // Step 4: Insert record into `agent_license_reason` table if license limit is exceeded
        const reason = {agentid: agent,client_id: clientId,reason: 'License Limit Exceeded.'};
        const insertQuery = ` INSERT INTO agent_license_reason (agentid, client_id, reason) VALUES ("${reason.agentid}", "${reason.client_id}", "${reason.reason}")`;
        await executeQuery(insertQuery);
        //console.log(insertQuery);
        return false; // License limit exceeded
    }
};
///////************code working*************** */
const validateUserSession = async (txtUser, clientId, myIp, sipId) => {
    let response = { ok: false, id: 0 };
    let insert_id=0;
    // Step 1: Check if the user or SIP ID already exists in the `user_status` table
    const checkUserQuery = `SELECT id FROM user_status WHERE (name = "${txtUser}" OR sipid = "${sipId}") AND client_id = "${clientId}"`;
    const checkUserResult = await executeQuery(checkUserQuery);
    if (checkUserResult.length > 0) 
    {
        const existingId = checkUserResult[0].id;
        response = { ok: false, id: existingId};
    }
    else 
    {
        // Step 2: Get client information from `vm_client` table
        let result_client = await checkClient_id(clientId);
        clientType=result_client.client_type;
        const asId = clientType === "PRI" ? 4 : 5;
        // Step 3: Insert new user session data into `user_status` table
        const userInsertQuery = `INSERT INTO user_status (name, sipid, ipaddress, user_mode, client_id, server_id, agent_version, user_type)
        VALUES ("${txtUser}", "${sipId}", "${myIp}", "0", "${clientId}", "${asId}", "${agent_version}", "W")`;
        const checkinsertuser =await executeQuery(userInsertQuery);
        response = { ok: true, id: checkinsertuser.insertId};
    }
    return response;
};
/*
* function SetUserRoll
* to get the user role permission
*/
const setUserRoll = async (strUserID, clientId) => {
    // Default permissions
    let array = {
        isDisplayPhone: true,
        CallLogPermission: false,
        UserSessionLog: false,
        ManualInAuto: false,
        isLine2Busy: ""
    };
    // Fetch user role from the `user_role` table
    const userRoleQuery = `SELECT * FROM user_role WHERE client_id = "${clientId}" AND id = "${strUserID}"`;
    const userRoleResult = await executeQuery(userRoleQuery);
    if (userRoleResult.length > 0) {
        const row = userRoleResult[0];
        // Map permissions from the database
        array = {
            ...array,
            AutoAnswer : row.auto_answer,
            DialPad : row.dial,
            InternalTransfer : row.internal_transfer,
            ExternalTransfer : row.external_transfer,
            InternalConference : row.internal_conference,
            ExternalConference : row.external_conference,
            HangupCall : row.hangup,
            Mute : row.mute,
            Hold : row.call_hold,
            Barge : row.barge,
            Coach : row.call_coach,
            Info : row.call_info,
            SMS : row.sms,
            Whatsapp : row.whatsapp,
            ChatA : row.chat_admin,
            ChatU : row.chat_user,
            MOPanel : row.mo_panel,
            LeadPanel : row.lead,
            Email : row.email,
            Callback_Auto : row.callback_auto,
            ActivityID : 0,
            Activity : 0,
            ActivityName : "",
            CallForward : row.call_forward,
            UserDisableDisposition : row.disable_disposition,
            feedback : row.feedback,
            CampaignManager : row.campaign_manager,
            MobileAgent : row.mobile_agent,
            Download : row.download,
            Listen : row.listen,
            AgentFree : row.agent_free,
            AutoProgressive : row.auto_progressive
            
        };

        // Update permissions based on conditions
        if (row.call_log == 1) array.CallLogPermission = true;
        if (row.user_log == 1) array.UserSessionLog = true;
        if (row.number_mask == 1) array.isDisplayPhone = false;
        if (row.auto_in_manual == 1) array.ManualInAuto = true;
    } else {
        // Defaults for no matching user role
        array = {
            ...array,
            ManualInAuto : false,
            AutoAnswer : 0,
            DialPad : 0,
            InternalTransfer : 0,
            ExternalTransfer : 0,
            InternalConference : 0,
            ExternalConference : 0,
            HangupCall : 0,
            Mute : 0,
            Hold : 0,
            Barge : 0,
            Coach : 0,
            Info : 0,
            SMS : 0,
            ChatA : 0,
            ChatU : 0,
            MOPanel : 0,
            LeadPanel : 0,
            Email : 0,
            CallLogPermission : 0,
            UserSessionLog : 0,
            Callback_Auto : 0,
            ActivityID : 0,
            Activity : 0,
            ActivityName : "",
            CallForward : 0,
            UserDisableDisposition : 0,
            feedback : 0,
            isLine2Busy : "",
            CampaignManager : 0,
            MobileAgent : 0,
            Download : 0,
            Listen : 0,
            AgentFree : 0,
            AutoProgressive : 0
        };
    }
    // Update `user_status` table
    const updateUserStatusQuery = `UPDATE user_status SET is_tl = 1 WHERE client_id = "${clientId}" AND name = "${strUserID}"`;
    await executeQuery(updateUserStatusQuery);
    return array; // Return the permissions array
};
 /*
* function LoadDNCURL
* to load the DNC URL for the client id
*/
const loadDNCURL = async (clientId) => {
    const dncQuery = `SELECT dncurl, remote_check, remote_check_url FROM dncurl WHERE client_id = "${clientId}" AND status = '1' AND url_type = 'dnc'`;
    const dncResult = await executeQuery(dncQuery, [clientId]);
    let array = {};
    if (dncResult.length > 0) {
        const row = dncResult[0];
        array = {
            DNCURL: row.dncurl || "",
            isRemoteDNC: row.remote_check || 0,
            RemoteDNCUrl: row.remote_check_url || ""
        };
    } else {
        array = {
            DNCURL: "",
            isRemoteDNC: 0,
            RemoteDNCUrl: ""
        };
    }
    return array;    
};



  const getDBTime = () => {
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
 /*
* function getDefaultCampaignAndMode
* to get the default campaign and mode for the agent
*/
  const getDefaultCampaignAndMode = async (userId, clientId) => {
    const query = `
        SELECT 
            d.campaign, 
            u.user_mode
        FROM 
            default_user_campaign_mode d
        LEFT JOIN 
            user_mode u 
        ON 
            d.mode = u.mode_index AND d.client_id = u.client_id
        WHERE 
            d.user_id = "${userId}" AND d.client_id = "${clientId}"`;
    const result = await executeQuery(query);
    if (result.length > 0) {
        return result[0]; // Return the first row of the result
    }
    return {campaign:"",user_mode:""}; // Return null if no rows are found
};
/******************Agent Remove***************** */

const AgentRemove = async (ClientID, SIP_ID, CampaignName, USER_ID, SERVER_IP, CS_API_Port) => {
    const newurl = `${control_server_url}?api_name=agentremove&input_data=client_id=${ClientID}|exten=${SIP_ID}|campaign=${CampaignName}|agent=${USER_ID}&CS_SOCKET=${SERVER_IP}&CS_PORT=${CS_API_Port}`;
    console.log("AgentRemove URL: " + newurl);
    return new Promise((resolve, reject) => {
        const options = { method: 'GET', url: newurl };
        
        request(options, (error, response) => {
            if (error) {
                console.error('Error occurred:', error);
                errlogRouter(2333, 'RouteName: api_model and method name: remove-agent');
                reject(error); // Reject the promise with the error
            } else {
                //console.log('Response received:', response.body);
                resolve(response.body); // Resolve the promise with the response body
            }
        });
    });
    
};

/*
* function RemoveQueue
* to remove the agent, extension from the queue, if agent is not in auto mode
*/
const removeQueue = async (AS_ID, SIP_ID, ClientID, User_Status_ID) => {
    try 
    {
       let  deleteResult='';
        if(AS_ID != '' && SIP_ID !='')
        {
            const queue_member_table = "queue_member_table_" + AS_ID;
            const sip_interface = "SIP/" + SIP_ID;
            let  deleteQuery = `DELETE FROM ${queue_member_table} WHERE interface = "${sip_interface}"`;
            result_queue = await executeQuery2(deleteQuery);
            if (!deleteResult.affectedRows) {
                return false;
            }
            /**********Update user status********** */
            const query_update_userstatus = `UPDATE user_status SET ringnoanswer_count = 0 WHERE client_id = ${ClientID}  AND id = ${User_Status_ID}`;
            updateResult = await executeQuery(query_update_userstatus);
            return updateResult.affectedRows > 0;
        }else
        {
            return false;
        }
    }catch (error) {
        console.error("Error in removeQueue:", error);
        return false;
    }
    
};
 /*
* function getDIDName
* getting the queuename for the DID
*/
const getDIDName = async (strDIDNum, clientID, campaignName) => {
    try {
        // Query to fetch the queue name for the given DID, client ID, and campaign name
        const query = `SELECT queue_name FROM campaign_queue WHERE client_id = "${clientID}" AND campaign_name = "${campaignName}" AND queue_did = "${strDIDNum}" LIMIT 1`;
        const result = await executeQuery(query);

        // Check if a result was found
        if (result.length > 0) {
            return result[0].queue_name;
        } else {
            // Return the DID number if no queue name is found
            return strDIDNum;
        }
    } catch (error) {
        console.error("Error in getDIDName:", error);
        // Handle error gracefully, return the DID number as fallback
        return strDIDNum;
    }
};

const getDidNameForAllDID = async (array, clientID, campaignName) => {
    try {
        const didList = [];

        for (const campaignDID of array) {
            // Fetch the name for each DID using the getDIDName function
            const name = await getDIDName(campaignDID, clientID, campaignName);
            
            // Append the name to the DID if it differs; otherwise, just the DID
            const formattedDID = name === campaignDID ? campaignDID : `${campaignDID}-${name}`;
            didList.push(formattedDID);
        }

        return didList;
    } catch (error) {
        console.error("Error in getDidNameForAllDID:", error);
        return [];
    }
};


const loadManualID = async (clientID, userID, campaignName) => {
    try {
        let result = {ManualCallerIDList: [],IsDedicatedCLI: false,Campaign_Group: "",all_campaign_group: {}};

        // Query to fetch data for the specific agent
        const queryForAgent = `SELECT did, channel_group, pri FROM campaign_channel_map 
            WHERE client_id = "${clientID}" AND agent = "${userID}" AND campaign_name = "${campaignName}" AND dial_mode = '2' ORDER BY v_priority`;
        const agentResult = await executeQuery(queryForAgent);
        if (agentResult.length > 0) {
            result.IsDedicatedCLI = true;

            for (const row of agentResult) {
                const strCli = row.did.split("|").filter(Boolean);

                for (let i = 0; i < strCli.length; i++) {
                    if (strCli[i]) {
                        if (row.pri) {
                            result.ManualCallerIDList[i] = strCli[i];
                            group = `i${row.pri}`;
                        } else {
                            group = row.channel_group;
                        }
                    }

                    const dids = await getDidNameForAllDID(strCli, clientID, campaignName);
                    result.all_campaign_group[group] = dids;
                }
            }
        } else {
            // Query to fetch data when no specific agent is assigned
            const queryForAll = `SELECT did, channel_group, pri FROM campaign_channel_map 
            WHERE client_id = "${clientID}" AND agent = '' AND campaign_name = "${campaignName}" AND dial_mode = '2' ORDER BY v_priority`;
            const generalResult = await executeQuery(queryForAll);
            if (generalResult.length > 0) {
                for (const row of generalResult) {
                    const group = row.pri ? `i${row.pri}` : row.channel_group;
                    const dids = await getDidNameForAllDID(row.did.split("|").filter(Boolean), clientID, campaignName);
                    result.all_campaign_group[group] = dids;
                }
            }
        }

        return result;
    } catch (error) {
        console.error("Error in loadManualID:", error);
        return {
            ManualCallerIDList: [],
            IsDedicatedCLI: false,
            Campaign_Group: "",
            all_campaign_group: {}
        };
    }
};
/*
* function Load_Campaign_Disp
* to get the disposition for the campaign and agent
* if disposition mapped to agent, then fetch them otherwise
* fetch the disposition mapped with campaign
*/

const loadCampaignDisp = async (clientID, CampaignName, USER_ID) => {
    let campaignDisposition = { Sub_Disposition: [], CRM_Disposition: [], DispositionMapped: 0 };
    try {
        // Query for agent_campaign_disposition_map
        const dispositionQuery = `SELECT disposition AS disposition_id, is_fwd AS isFwded 
            FROM agent_campaign_disposition_map WHERE client_id = "${clientID}" AND UPPER(campaign_id) = UPPER("${CampaignName}") 
            AND UPPER(user_id) = UPPER("${USER_ID}") ORDER BY disposition `;
        let rs = await executeQuery(dispositionQuery);

        if (rs.length === 0) {
            // Query for campaign_disposition_map if no results found
            const defaultDispositionQuery = `SELECT disposition_id, '0' AS isFwded FROM campaign_disposition_map 
                WHERE client_id = "${clientID}" AND UPPER(campaign_id) = UPPER("${CampaignName}") ORDER BY disposition_id`;
            rs = await executeQuery(defaultDispositionQuery);
            campaignDisposition.DispositionMapped = 0;
        } else {
            campaignDisposition.DispositionMapped = 1;
        }

        if (rs.length > 0) {
            for (let row of rs) {
                // Query for disposition_master
                const callbackQuery = `SELECT is_callback FROM disposition_master WHERE client_id = "${clientID}" AND LOWER(name) = LOWER("${row.disposition_id}")`;
                const callbackRes = await executeQuery(callbackQuery);
                const isCallback = callbackRes.length > 0 ? callbackRes[0].is_callback : 0;

                // Push formatted string to CRM_Disposition
                campaignDisposition.CRM_Disposition.push(`${row.disposition_id}~${row.isFwded}~${isCallback}`);
            }
        }

        return campaignDisposition;

    } catch (error) {
        console.error('Error in Load_Campaign_Disp:', error);
        return campaignDisposition;  // Returning the default value in case of error
    }
};

/*
* function Load_Campaign_Sub_Disp
* to load the sub disposition mapped to the campaign
*/
const loadCampaignSubDisp = async (clientID, CampaignName) => {
    let campaignDisposition = { 'Sub_Disposition': {} };

    try {
        // Query to get sub dispositions
        const subDispositionQuery = `SELECT disposition_id, sub_disposition_id FROM campaign_sub_disposition_map WHERE client_id = "${clientID}" 
            AND UPPER(campaign_id) = "${CampaignName.toUpperCase()}" ORDER BY sub_disposition_id LIMIT 1500`;
        const subDispositionResult = await executeQuery(subDispositionQuery);
        if (subDispositionResult.length > 0) {
            subDispositionResult.forEach(row => {
                const dispositionId = row.disposition_id.toLowerCase();
                if (!campaignDisposition['Sub_Disposition'][dispositionId]) {
                    campaignDisposition['Sub_Disposition'][dispositionId] = [];
                }
                campaignDisposition['Sub_Disposition'][dispositionId].push(row.sub_disposition_id);
            });
        }

        return campaignDisposition;
    } catch (error) {
        console.error('Error loading campaign sub dispositions:', error);
        return campaignDisposition;
    }
};
/*
* function LoadUserMode
* to get the list of mode mapped to the campaign selected by the agent
*/
const loadUserMode = async (clientID, userID, CampaignName) => {
    let array = { 
        'UserModeIndexLabel': {}, 
        'UserModeIndexID': [], 
        'UserModeRecall': [] 
    };

    try {
        // Query for the first part of the union
        const query1 = `SELECT u.user_mode, m.mode_index, u.is_recall FROM map_user_mode m
        LEFT JOIN user_mode u ON m.mode_index = u.mode_index AND m.client_id = u.client_id WHERE m.client_id = "${clientID}" AND m.user_id = "${userID}" `;
        
        // Query for the second part of the union
        const query2 = `SELECT m.user_mode, mm.mode_id, m.is_recall
            FROM user_mode m LEFT JOIN campaign_mode_map mm ON mm.mode_id = m.mode_index AND m.client_id = mm.client_id
            WHERE mm.client_id = "${clientID}" AND mm.campaign_id = "${CampaignName}"`;
        
        // Execute both queries
        const res1 = await executeQuery(query1);
        const res2 = await executeQuery(query2);

        // Merge the results
        const results = [...res1, ...res2];
        // Processing results
        results.forEach(row => {
            let userMode = `${row.user_mode}`;
            if (userMode.length > 0) {
                array['UserModeIndexLabel'][row.mode_id] = row.user_mode;
                array['UserModeIndexID'].push(row.mode_id);
                array['UserModeRecall'].push(row.is_recall);
            }
        });
        return array;
    } catch (error) {
        console.error('Error loading user mode:', error);
        return array;
    }
};
/*
* function UpdateUserCampaign
* to update the campaign in the user session table, so that CS can use it
*/
const updateUserCampaign = async (ClientID, User_Status_ID, CampaignName) => {
    try {
        const updateQuery = `UPDATE user_status SET campaign = "${CampaignName}" WHERE client_id = "${ClientID}" AND id = "${User_Status_ID}"`;
        const result = await executeQuery(updateQuery);
        if (result.affectedRows > 0) {
            return true; // Update successful
        } else {
            return false; // No row updated
        }
    } catch (error) {
        console.error('Error updating user campaign:', error);
        return false;
    }
};
/*
* function LoadCampaignEventAPI
* getting the api to be hit on event of the campaign
*/
const loadCampaignEventAPI = async (clientID, CampaignName) => {
    try {
        const campaignEventApiMap = { campaignEventApi: [] };
        const testArray = {};
        // SQL query to fetch campaign event data
        const query = `SELECT event, url, static_field, request_method FROM callroute_api 
        WHERE client_id = "${clientID}" AND UPPER(campaign_id) = "${CampaignName.toUpperCase()}"`;
        const res = await executeQuery(query);
        if (res.length > 0) {
            res.forEach(row => {
                testArray[row.event.toUpperCase()] = {
                    url: row.url,
                    fields: row.static_field,
                    method: row.request_method
                };
            });
        }

        // Assign the processed data to the campaignEventApiMap
        campaignEventApiMap.campaignEventApi = JSON.stringify(testArray);
        return campaignEventApiMap;
    } catch (error) {
        console.error('Error loading campaign event API:', error);
        return { campaignEventApi: [] }; // Return an empty array in case of error
    }
};


 /*
* function PauseInQueue
* to restrict the agent, for getting the call in auto mode
* while he/she is on call, or had not disposed the last call
* 
* to allow user to take the call, after he/she has successfully,
* disposed the call
*/
const pauseInQueue = async (intState, SIP_ID, asid) => {
    //console.log("pauseInQueue");
    try {
        if(SIP_ID != '' && asid != '')
        {
            const updateQuery = `UPDATE queue_member_table_${asid} SET paused = ${intState} WHERE interface = "SIP/${SIP_ID}" `;
            const result = await executeQuery2(updateQuery);
            return result; // Return the result (can be modified based on the actual DB response)
        }else
        {
            return false;
        }
        
    } catch (error) {
        console.error('Error pausing in queue:', error);
        return false; // Return false in case of an error
    }
};
/*
* function EnableQueuePause
* to update the agent status in the asterisk table for 
* agent to get call in the auto mode
*/
const enableQueuePause = async (intState, lastQueuePause, UserMode, ClientID, User_Status_ID, CampaignName, USER_ID, SIP_ID, asid) => {
    const result = {};
    //console.log("enableQueuePause");
    // Check if the state has changed
    if (intState == lastQueuePause) {
        return result; // No change, return empty result
    }
    result.lastQueuePause = intState;

    // If the state is 1 (pause) and UserMode is "Auto"
    if (intState == 1 && UserMode.toLowerCase() == 'auto') {
        // Pause the queue
        await pauseInQueue(0, SIP_ID, asid);

        // Update user status with ringnoanswer_count = 0
        const updateUserStatusQuery = `UPDATE user_status SET ringnoanswer_count = 0 WHERE client_id = "${ClientID}" AND id = "${User_Status_ID}"`;
        await executeQuery(updateUserStatusQuery);

        // Delete records from agent_ringnoanswer
        const deleteAgentRingQuery = `DELETE FROM agent_ringnoanswer  WHERE client_id = "${ClientID}" AND agent = "${USER_ID}" AND campaign = "${CampaignName}"`;
        await executeQuery(deleteAgentRingQuery);
    }

    return result; // Return the result
};
const getQueuePriority = (Queue_Priority, CampaignName) => {
    let getQueuePriority = 0;
    if(Queue_Priority.length>0)
    {
        for (const value of Queue_Priority) {
            const s = value.split("~");
            if (s[0].toUpperCase() === CampaignName.toUpperCase()) {
                getQueuePriority = s[1].trim();
            }
        }
    }
    
    return getQueuePriority;
};

/*
* function AddQueue
* to add the agent in the queue
*/
const addQueue = async (AS_ID, SIP_ID, ClientID, User_Status_ID, CampaignName, campaignType, userID, ManualCallerIDList, Queue_Priority, IsDedicatedCLI, lastQueuePause, UserMode, skill = '') => {
    // Remove the existing queue first
    const removeQueueResult = await removeQueue(AS_ID, SIP_ID, ClientID, User_Status_ID);
    
    
    // Handle different campaign types
    if (campaignType === "SB" || campaignType === "SD") {
        await executeQuery2(`REPLACE INTO queue_member_table_${AS_ID} (membername, queue_name, interface, penalty, paused, client_id) 
            VALUES ('${userID}', '${ClientID}_${CampaignName}_${userID}', 'SIP/${SIP_ID}', '', 0, '${ClientID}')`);
    } else if (campaignType === "SR") {
        if (Array.isArray(skill) && skill.length > 0) {
            for (const [key, skl] of Object.entries(skill)) {
                await executeQuery2(`REPLACE INTO queue_member_table_${AS_ID} (membername, queue_name, interface, penalty, paused, client_id) 
                    VALUES ('${userID}', '${ClientID}_${CampaignName}_${key}', 'SIP/${SIP_ID}', '${skl}', 0, '${ClientID}')
                `);
            }
        } else {
            await executeQuery2(`REPLACE INTO queue_member_table_${AS_ID} (membername, queue_name, interface, penalty, paused, client_id) 
                VALUES ('${userID}', '${ClientID}_${CampaignName}', 'SIP/${SIP_ID}', '${getQueuePriority(Queue_Priority, CampaignName)}', 0, '${ClientID}')
            `);
        }
    } else if (campaignType === "AB") {
        await executeQuery2(`REPLACE INTO queue_member_table_${AS_ID} (membername, queue_name, interface, penalty, paused, client_id) 
            VALUES ('${userID}', '${ClientID}_${CampaignName}', 'SIP/${SIP_ID}', '${getQueuePriority(Queue_Priority, CampaignName)}', 0, '${ClientID}')
        `);
        await executeQuery2(`REPLACE INTO queue_member_table_${AS_ID} (membername, queue_name, interface, penalty, paused, client_id) 
            VALUES ('${userID}', '${ClientID}_${CampaignName}_${userID}', 'SIP/${SIP_ID}', '', 0, '${ClientID}')
        `);
    } else {
        if (IsDedicatedCLI === "false") {
            await executeQuery2(`REPLACE INTO queue_member_table_${AS_ID} (membername, queue_name, interface, penalty, paused, client_id) 
                VALUES ('${userID}', '${ClientID}_${CampaignName}', 'SIP/${SIP_ID}', '${getQueuePriority(Queue_Priority, CampaignName)}', 0, '${ClientID}')
            `);
        } else {
            await executeQuery2(`REPLACE INTO queue_member_table_${AS_ID} (membername, queue_name, interface, penalty, paused, client_id) 
                VALUES ('${userID}', '${ClientID}_${CampaignName}', 'SIP/${SIP_ID}', '1${ManualCallerIDList[0].slice(-4)}', 0, '${ClientID}')
            `);
        }
    }

    // Enable the queue pause based on conditions
    const newresult= await enableQueuePause(1, lastQueuePause, UserMode, ClientID, User_Status_ID, CampaignName, userID, SIP_ID, AS_ID);
    return newresult;
};

/*
* function LoadCallBackPolicy
* to load the callback policies for the client and the campaign
*/
const loadCallBackPolicy = async (clientID, CampaignName) => {
    try {
        const array = {CBUPolicy: 1,CBUDialing: 1,CBUPriority: 100,CBIDialing: 0,CBADialing: 0,CBEDialing: 0,CBSDialing: 0,CBQDialing: 0};

        const query_policy = `SELECT callback_type, assign_policy, dialing_preference, priority FROM callback_policy WHERE client_id = "${clientID}" AND campaign = "${CampaignName}"`;
        const result_policy = await executeQuery(query_policy);

        if (result_policy.length > 0) {
            result_policy.forEach(row => {
                const strCallBackType = row.callback_type.toUpperCase();
                switch (strCallBackType) {
                    case "CBA":
                        array.CBADialing = row.dialing_preference;
                        break;
                    case "CBI":
                        array.CBIDialing = row.dialing_preference;
                        break;
                    case "CBU":
                        array.CBUPolicy = row.assign_policy;
                        array.CBUDialing = row.dialing_preference;
                        array.CBUPriority = row.priority;
                        break;
                    case "CBE":
                        array.CBEDialing = row.dialing_preference;
                        break;
                    case "CBS":
                        array.CBSDialing = row.dialing_preference;
                        break;
                    case "CBQ":
                        array.CBQDialing = row.dialing_preference;
                        break;
                }
            });
        }

        return array;
    } catch (error) {
        console.error("Error in loadCallBackPolicy:", error);
        return array;
    }
};

    /*
     * function getActivity
     * getting the mapped activities with the agent
     */
const getActivity = async (clientID, userID, campaignName) => {
    try {
        const query = `
            SELECT activity_master.id, agent_campaign_activity_map.activity_name
            FROM agent_campaign_activity_map
            LEFT JOIN activity_master 
                ON activity_master.activity_name = agent_campaign_activity_map.activity_name 
                AND activity_master.client_id = agent_campaign_activity_map.client_id
            WHERE agent_campaign_activity_map.client_id = "${clientID}"
                AND agent_campaign_activity_map.campaign_id = "${campaignName}"
                AND agent_campaign_activity_map.user_id = "${userID}"
        `;
        //console.log(query);
        const result = await executeQuery(query);
        if (result.length > 0) {
            return result;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error executing query:", error);
        return false;
    }
};
/*
* function getAgentPrefix
* get the agent prefix for the campaign and voip.
*/
const getAgentPrefix = async (CampaignName, agent, client_id) => {
    try {
        // Query to fetch voip and prefix based on the provided parameters
        const query = `SELECT voip, prefix FROM agent_campaign_voip_perfix_map WHERE campaign = "${CampaignName}" AND agent = "${agent}" AND client_id = "${client_id}"`;
        const results = await executeQuery(query);
        // Prepare the resulting array
        const resultArray = {};
        if (results.length > 0) {
            results.forEach(row => {
                resultArray[row.voip] = row.prefix;
            });
        }
        return resultArray;
    } catch (error) {
        console.error('Error fetching agent prefix:', error);
        return {};
    }
};

/**********Getmode in second****** */

const getModeSeconds = async (date) => {
    const currDate = await current_datetime();
    if (date) {
        const dateInSeconds = Math.floor(new Date(date).getTime() / 1000); // Convert date to seconds
        const currDate_insecond = Math.floor(new Date(currDate).getTime() / 1000); // Convert date to seconds
        const dateDiff = currDate_insecond - dateInSeconds;
        return dateDiff;
    } else {
        return 0;
    }
}




/*
* function LoadCampaignDetail
* to load the properties of the campaign
*/
const loadCampaignDetail = async (clientID, userID, campaignName, asid, campaignType, previousCampaignName, User_Status_ID, userMode = '', AS_ID = '', SIP_ID = '', manualCallerIDList = '', queuePriority = '', isDedicatedCLI = '', lastQueuePause = 0) => {
    try {
        //console.log("loadCampaignDetail");
        // Initialize the array (object in JavaScript)
        let campaignDetails = {
            Campaign_Script: "",Campaign_PreFix: "",Campaign_Verifier: "",Campaign_Type: "",Campaign_Crm_Status: 1,Campaign_Dialing_Mode: "",Campaign_Crm_Mode: 0,BlankWebCrm: "",
            WebScript: "",alternateCRM1: "",alternateCRM2: "",AutoDisposeTime: 0,Max_Call_Campaign: 0,isCliFree: 0,pulseRate1: 0,pulseRate2: 0,
            pulse: 0,circle: 0,redial: 0,skill: [],dataset: 0,leadAssignTime: 0,CampaignDisableDisposition: 0,
        };

        // If the campaign type requires deletion, handle it
        if ((campaignType == "SB" || campaignType == "SD" || campaignType == 'AB') && asid !== '' && clientID !== '' && previousCampaignName !== '' && userID !== '') {
            const deleteQuery = `DELETE FROM queue_table_${asid} WHERE name = "${clientID}_${previousCampaignName}_${userID}"`;
            await executeQuery2(deleteQuery); // Replace with your database delete function
        }

        // Fetch campaign details
        const campaignQuery = `
            SELECT script, prefix, campaign_type, group_type, crm_status, dialing_mode, webcrm, dnc_check, auto_dispose_duration,
                webscript, webscript_parameter, hotdial1, hotdial2, hotdial3, hotdial4, hotdial5, recall_reload_duration, recall,
                usersession_url, max_call, is_agent_mobile, alternatepath1, alternatepath2, confcli, circle_permission, dataset,
                new_assign_notify, disable_disposition, call_time_difference
            FROM campaign WHERE client_id = "${clientID}" AND name = "${campaignName}" LIMIT 1`;
        const campaignResult = await executeQuery(campaignQuery);

        if (campaignResult.length > 0) {
            const row = campaignResult[0];

            // Set campaign details based on the query result
            campaignDetails.Campaign_Script = row.script || "";
            campaignDetails.Campaign_PreFix = row.prefix || "";
            campaignDetails.Campaign_Type = row.campaign_type || "";
            campaignDetails.leadAssignTime = row.new_assign_notify || 0;

            // If the campaign type is "SB", "SD", or "AB", update queue_table
            if (campaignDetails.Campaign_Type == "SB" || campaignDetails.Campaign_Type == "SD" || campaignDetails.Campaign_Type == "AB") {
                if(campaignDetails.Campaign_Type === "AB")
                {
                    var campaign_as_type='ASSIGNCAMPAIGN';
                    var agent_map_camp='agentmapcallback';
                    var wrandom='wrandom';
                }else{
                    var campaign_as_type='musiconhold';
                    var agent_map_camp='context';
                    var wrandom='strategy';
                }
                const queueQuery = `
                    SELECT CONCAT(name, '_', '${userID}'),'${campaign_as_type}', announce, '${agent_map_camp}', timeout, 
                        monitor_join, monitor_format, queue_youarenext, queue_thereare, 
                        queue_callswaiting, queue_holdtime, queue_minutes, queue_seconds, 
                        queue_lessthan, queue_thankyou, queue_reporthold, announce_frequency, 
                        announce_round_seconds, announce_holdtime, retry, wrapuptime, maxlen, 
                        servicelevel, '${wrandom}', joinempty, leavewhenempty, eventmemberstatus, eventwhencalled, reportholdtime, 
                        memberdelay, Weight, timeoutrestart, periodic_announce, periodic_announce_frequency, 
                        ringinuse, setinterfacevar, update_by_user, update_by_ip, client_id
                    FROM queue_table_${asid}
                    WHERE name = '${clientID}_${campaignName}'`;
                    //console.log(queueQuery);
                const queueResult = await executeQuery2(queueQuery);
                //Update or replace data in queue_table
                const insertQueueQuery = `REPLACE INTO queue_table_${asid} ${queueQuery}`;
                console.log(insertQueueQuery);
                await executeQuery2(insertQueueQuery); // Replace with your database query function
            }

            // Merge additional campaign details
            campaignDetails.dataset = row.dataset;
            campaignDetails.Campaign_Group = row.group_type;
            campaignDetails.Campaign_Crm_Status = row.crm_status;
            campaignDetails.Campaign_Dialing_Mode = row.dialing_mode;
            campaignDetails.Campaign_Crm_Mode = row.webcrm;
            campaignDetails.Campaign_DNC_Check = row.dnc_check;
            campaignDetails.AutoDisposeTime = row.auto_dispose_duration;
            campaignDetails.Recall_Reload_Duration = row.recall_reload_duration;
            campaignDetails.WebScript = row.webscript;
            campaignDetails.WebScriptparameter = row.webscript_parameter;
            campaignDetails.UsersessionUrl = row.usersession_url;
            campaignDetails.is_Recall = row.recall;
            campaignDetails.alternateCRM1 = row.alternatepath1;
            campaignDetails.alternateCRM2 = row.alternatepath2;
            campaignDetails.isCliFree = row.confcli;
            campaignDetails.circle = row.circle_permission;
            campaignDetails.CampaignDisableDisposition = row.disable_disposition;
            campaignDetails.Max_Call_Campaign = row.max_call;
            campaignDetails.call_time_difference = row.call_time_difference;
            campaignDetails.BlankWebCrm = row.webscript ? row.webscript.replace("index", "blank") : "";

            // HotDial array
            campaignDetails.HotDial = [
                row.hotdial1, row.hotdial2, row.hotdial3, row.hotdial4, row.hotdial5
            ];

            // Mobile agent check
            if (row.is_agent_mobile === 1) {
                campaignDetails.isMobileAgent = true;
            }else
            {
                campaignDetails.isMobileAgent = false;
            }
            const disposition = await loadCampaignDisp(clientID, campaignName, userID);
            campaignDetails = { ...campaignDetails, ...disposition };
            const subdisposition = await loadCampaignSubDisp(clientID, campaignName);
            campaignDetails = { ...campaignDetails, ...subdisposition };

            const Usermodedata = await loadUserMode(clientID, userID, campaignName);
            console.log("Usermodedata= ",Usermodedata);
            campaignDetails = { ...campaignDetails, ...Usermodedata};
            const updatecampaign= await updateUserCampaign(clientID, User_Status_ID, campaignName);
            //load campaignevent Api
            const loadcampaign_api = await loadCampaignEventAPI(clientID, campaignName);
            campaignDetails = { ...campaignDetails, ...loadcampaign_api};
            campaignDetails.Allow_DID_Map_URL = [];
            //console.log("campaignDetails.Campaign_Crm_Mode= "+campaignDetails.Campaign_Crm_Mode+" le= "+campaignDetails.WebScript.length);
            if (campaignDetails.Campaign_Crm_Mode == '1' && campaignDetails.WebScript.length > 0) 
            {
                const query_campaign_calltype = `SELECT did, calltype FROM campaign_did_calltype_url_map WHERE client_id = "${clientID}" AND campaign = "${campaignName}"`;
                //console.log(query_campaign_calltype);
                const new_res = await executeQuery(query_campaign_calltype);
                if (new_res.length > 0) {
                    new_res.forEach(row => {
                        campaignDetails.Allow_DID_Map_URL.push(`${row.did}|${row.calltype}`);
                    });
                }
            }
            if (campaignType == "SR") {
                if (userMode.toUpperCase() == "AUTO") {
                    await removeQueue(asid, SIP_ID, clientID, User_Status_ID);
                }
                const agent_campaign_skill_query = `SELECT skill, priority FROM agent_campaign_skill_map
                WHERE client_id = "${clientID}" AND user_id = "${userID}" AND campaign = "${campaignName}" ORDER BY priority, skill`;
                const result_agent_campaign_skill = await executeQuery(agent_campaign_skill_query);
                //console.log(result_agent_campaign_skill);
                skills = {};
                result_agent_campaign_skill.forEach(value => {
                    skills[value.skill] = value.priority;
                });
                new_data={skill:skills};
                campaignDetails = {...campaignDetails, ...new_data };
            }
            const query_campaign = `SELECT agent FROM campaign_agent_redial_map WHERE client_id = "${clientID}" AND campaign = "${campaignName}" AND agent = "${userID}"`;
            const res_campaign = await executeQuery(query_campaign);
            if (res_campaign.length > 0) {
                campaignDetails.redial = 1;
            }
            /****************New code********* */
            let query_crm_config = `SELECT cc.dfid, cc.fcaption, cc.history, cc.data_log, cc.is_masked 
                     FROM crm_config cc 
                     JOIN agent_crm_field_map acfm ON cc.client_id = acfm.client_id 
                     AND cc.dfid = acfm.dfid AND cc.campaign = acfm.campaign_id 
                     WHERE cc.client_id = "${clientID}" AND cc.campaign = "${campaignName}" AND acfm.user_id = "${userID}" ORDER BY cc.fid`;
            let rsManualID = await executeQuery(query_crm_config);

        if (rsManualID.length === 0) {
            // Fallback query
            let query_crm_conf2 = `SELECT dfid, fcaption, history, data_log, is_masked FROM crm_config 
            WHERE client_id = "${clientID}" AND campaign = "${campaignName}" ORDER BY fid`;
            rsManualID = await executeQuery(query_crm_conf2);
        }
        campaignDetails.Ismasked = 0;
        const Log_Data_Field_arr = {};
        if (rsManualID.length > 0) {
            rsManualID.forEach(row => {
                Log_Data_Field_arr[row.dfid] = [row.fcaption, row.history, row.data_log, row.is_masked];
                campaignDetails.Ismasked = `${row.is_masked}`;
            });
        }
        new_data_log={Log_Data_Field:Log_Data_Field_arr};
        campaignDetails = {...campaignDetails, ...new_data_log };

        const loadrecall_policy = await loadCallBackPolicy(clientID, campaignName);
        campaignDetails = { ...campaignDetails, ...loadrecall_policy};
        campaignDetails.lineHangedup = 1;
        const mappedActivity = await getActivity(clientID, userID, campaignName);
        if (mappedActivity != false) {
            campaignDetails.activityMapped = mappedActivity;
            campaignDetails.activityMappedCheck = 1;
        } else {
            campaignDetails.activityMappedCheck = 0;
        }
        /************New change************ */
        
        // Check if call forwarding is allowed
        const callForwardQuery = `SELECT id FROM agent_campaign_call_forward WHERE user_id = "${userID}" AND campaign_id = "${campaignName}" AND client_id = "${clientID}"`;
        const callForwardResult = await executeQuery(callForwardQuery);
        campaignDetails.callFwdAllowed = callForwardResult.length > 0 ? 1 : 0;

        // Fetch disposition fields
        campaignDetails.dispositionField = [];
        const dispositionQuery = `SELECT dfid FROM crm_config WHERE client_id = "${clientID}" AND campaign = "${campaignName}" AND isDisposition = "1" ORDER BY fid`;
        const dispositionResult = await executeQuery(dispositionQuery);
        if (dispositionResult.length > 0) {
            dispositionResult.forEach(row => campaignDetails.dispositionField.push(row.dfid));
        }

        // Fetch agent prefix
        const agentPrefix = await getAgentPrefix(campaignName, userID, clientID);
        campaignDetails.agentPrefix = Object.keys(agentPrefix).length > 0 ? agentPrefix : false;

        // Fetch previous SQL if leadAssignTime > 0
        let previousSQL = "";
        if (campaignDetails.leadAssignTime > 0) {
            const previousSQLQuery = `SELECT * FROM agent_preview_filter_sql WHERE agent = "${userID}" AND campaign = "${campaignName}" AND client_id = "${clientID}"`;
            const previousSQLResult = await executeQuery(previousSQLQuery);
            if (previousSQLResult.length > 0) {
                previousSQL = previousSQLResult[0].sql.replace(/`/g, "'");
            }
        }
        campaignDetails.previousSQL = previousSQL;
            return campaignDetails;
        } else {
            return {}; // Return an empty object if no campaign data is found
        }
    } catch (error) {
        console.error("Error in loadCampaignDetail:", error);
        return {}; // Return empty object on error
    }
};

/*
* function SaveUserModeLog
* to save the user session log
*/
const SaveUserModeLog = async (ClientID, User_Status_ID, LoginHourID, ModeDBId, emailCount, smsCount) => {
    try {
        // Query to check user status
        const queryDisp = `SELECT id FROM user_status WHERE client_id = "${ClientID}" AND id = "${User_Status_ID}"`;
        const dsresult = await executeQuery(queryDisp);
        let ValidateUserLogin = dsresult.length > 0;  // Simplified ternary
        if(dsresult.length>0)
        {
            ValidateUserLogin=true;

        }else
        {
            ValidateUserLogin=false;
        }
        

        /**** login hour query */
        const query_loginhour = `UPDATE loginhour SET logout_time = SYSDATE() WHERE client_id = "${ClientID}" AND id = "${LoginHourID}"`;
        const result_login_query = await executeQuery(query_loginhour);

        /**** login Mode query */
        const query_usermode = `UPDATE user_mode_action SET email_count=${emailCount}, sms_count=${smsCount}, end_time = SYSDATE() WHERE client_id = "${ClientID}" AND id = "${ModeDBId}"`;
        const result_usermode = await executeQuery(query_usermode);

        /******Insert Log******* */
        const insertQuery = `INSERT INTO user_mode_action_log (mode_id, source, start_time, end_time, created_date) 
        VALUES (${ModeDBId}, 'Agent_SaveUserModeLog', SYSDATE(), SYSDATE(), SYSDATE())`;
        const result = await executeQuery(insertQuery);
        return { ValidateUserLogin};
    } catch (error) {
        console.error("Error saving user mode log:", error);
        return {};
    }
};

const resetCounter = async (TMCCount, TOBCount, TIBCount, TRCCount, TTCCount, TCCCount,Call_Mc_Count, Call_Ob_Count, Call_In_Count, Recall_Count,Transfer_Count, Conference_Count) => {
    const result = {
        TMCCount: 0,TOBCount:0,TIBCount:0,TRCCount:0,TTCCount:0,TCCCount:0,EMAIL_COUNT:0,
        SMS_COUNT:0,Call_Ob_Count:0,Call_Ob_Duration:0,Call_In_Count:0,Call_In_Duration:0,
        Call_Mc_Count:0,Call_Mc_Duration:0,Idle_Duration:0,Wrapup_Duration:0,
        Hold_Count:0,Hold_Duration:0,Transfer_Count:0,Transfer_Duration:0,Conference_Count:0,
        Conference_Duration:0,Recall_Count:0,Recall_Duration:0,Break_Duration:0,Mo_count:0,Mo_Duration:0
    };
    
    try {
      // Ensure input values are defaulted to 0 if empty
      TMCCount = TMCCount || 0;
      TOBCount = TOBCount || 0;
      TIBCount = TIBCount || 0;
      TRCCount = TRCCount || 0;
      TTCCount = TTCCount || 0;
      TCCCount = TCCCount || 0;
  
      // Initialize the result array with calculated values
      const result = {
        TMCCount: TMCCount + Call_Mc_Count,
        TOBCount: TOBCount + Call_Ob_Count,
        TIBCount: TIBCount + Call_In_Count,
        TRCCount: TRCCount + Recall_Count,
        TTCCount: TTCCount + Transfer_Count,
        TCCCount: TCCCount + Conference_Count,
        EMAIL_COUNT: 0,
        SMS_COUNT: 0,
        Call_Ob_Count: 0,
        Call_Ob_Duration: 0,
        Call_In_Count: 0,
        Call_In_Duration: 0,
        Call_Mc_Count: 0,
        Call_Mc_Duration: 0,
        Idle_Duration: 0,
        Wrapup_Duration: 0,
        Hold_Count: 0,
        Hold_Duration: 0,
        Transfer_Count: 0,
        Transfer_Duration: 0,
        Conference_Count: 0,
        Conference_Duration: 0,
        Recall_Count: 0,
        Recall_Duration: 0,
        Break_Duration: 0,
        Mo_count: 0,
        Mo_Duration: 0
      };
  
      return result;
    } catch (error) {
      console.error("Error in resetCounter:", error);
      return result;
    }
  };


/*
* function ChatLoginStatus
* to get status and chat table id for the agent
*/
  const chatLoginStatus = async (ChatA, MOPanel, CampaignName, LoginHourID, ClientID, USER_ID, ChatLoginID = 0) => {
    try {
        if (ChatA == 1 || MOPanel == 1) {
            if (ChatLoginID) {
                const updateQuery = `UPDATE chat_login_info SET campaign = "${CampaignName}", role = "${MOPanel}", login_id = "${LoginHourID}" WHERE client_id = "${ClientID}" AND user_id = "${USER_ID}"`;
                await executeQuery(updateQuery);
            } else {
                // Check if a record exists
                const selectQuery = `SELECT id FROM chat_login_info WHERE client_id = "${ClientID}" AND user_id = "${USER_ID}"`;
                const existingRecord = await executeQuery(selectQuery);

                if (existingRecord.length > 0) {
                    // Delete existing record
                    const deleteQuery = `DELETE FROM chat_login_info WHERE client_id = "${ClientID}" AND user_id = "${USER_ID}"`;
                    await executeQuery(deleteQuery);
                }

                // Insert new record
                const insertQuery = `
                    INSERT INTO chat_login_info (campaign, user_id, role, login_id, client_id) 
                    VALUES ("${CampaignName}", "${USER_ID}", "${MOPanel}", "${LoginHourID}", "${ClientID}")`;
                const insertResult = await executeQuery(insertQuery);
                ChatLoginID = insertResult.insertId; // Retrieve the last inserted ID
            }
        } else {
            ChatLoginID = '';
            // Delete any existing records if ChatA and MOPanel are not 1
            const deleteQuery = `DELETE FROM chat_login_info WHERE client_id = "${ClientID}" AND user_id = "${USER_ID}"`;
            await executeQuery(deleteQuery);
        }

        return ChatLoginID;
    } catch (error) {
        console.error("Error in chatLoginStatus:", error);
        return ChatLoginID;
    }
};

/*
* function UpdateUserMode
* to update the information of the agent in the table user_status
* so that can be used for the CS.
*/
  const updateUserMode = async (intModeId, ClientID, User_Status_ID, LoginHourID, ModeDBId, CampaignName, ChatLoginID, UserModeIndex, USER_ID, MOPanel, ChatA) => {
    try {
      // Initialize the return object
      const result = { ModeDuration:0,ChatLoginID:ChatLoginID };
      // Update `user_status` table with the `rstatus`
      const updateStatusQuery1 = `UPDATE user_status SET rstatus = "${intModeId}" WHERE client_id = "${ClientID}" AND id = "${User_Status_ID}"`;
      await executeQuery(updateStatusQuery1);
  
      // If LoginHourID is valid, update more fields in `user_status`

      if (LoginHourID !== 0 && LoginHourID !== '') {
        const updateStatusQuery2 = `UPDATE user_status SET login_id = "${LoginHourID}", user_mode_id = "${ModeDBId}", user_mode = "${UserModeIndex}" 
        WHERE client_id = "${ClientID}" AND id = "${User_Status_ID}"`;
        await executeQuery(updateStatusQuery2);
        // Update ChatLoginID using ChatLoginStatus logic
        result.ChatLoginID = await chatLoginStatus(ChatA, MOPanel, CampaignName, LoginHourID, ClientID, USER_ID, ChatLoginID);
      }
  
      return result;
    } catch (error) {
      console.error("Error in updateUserMode:", error);
      throw error;
    }
  };
  
/*
* function getNotification
* Validate the user to get the notification for new lead assign.
*/
const getNotificationInMode = async (campaign, agent, mode, client_id) => {
    let result_value=0;
    try {
        // Query to check if a notification exists in the specified mode
        const query = `SELECT id FROM campaign_agent_mode_notify WHERE campaign = "${campaign}" AND agent = "${agent}" AND mode = "${mode}" AND client_id = "${client_id}"`;

        const result = await executeQuery(query);

        // Check if any rows were returned
        return result.length > 0;
    } catch (error) {
        console.error("Error in getNotificationInMode:", error);
        return result_value;
    }
};

/*
* function EnableisRecall
* to check the whether the recall permission is allowed in the usermode or not
*/
const enableIsRecall = async (userModeIndexID, userModeIndex, userModeRecall) => {
    try {
        let isRecallModeAllow = false;

        for (let i = 0; i < userModeIndexID.length; i++) {
            if (userModeIndexID[i] == userModeIndex) {
                if (userModeRecall[i] == 1) {
                    isRecallModeAllow = true;
                    break;
                }
            }
        }
        return isRecallModeAllow;
    } catch (error) {
        console.error("Error in enableIsRecall:", error);
        return false;
    }
};

/*
* function SetUserMode
* to set the user mode for the agent, and 
* accordingly add in queue for auto mode,
* delete from queue for manual mode,
* check for manual calling allowed in mode
*/
const setUserMode = async ( modeIndex, UserModeIndexLabel, CampaignName, SipCheckStatus, AS_ID, SIP_ID, ClientID, 
    User_Status_ID, campaignType, userID, ManualCallerIDList, Queue_Priority, 
    IsDedicatedCLI, LoginHourID, ModeDBId, MOPanel, ChatA, ChatLoginID, 
    lastQueuePause, UserModeIndexID, UserModeRecall, TMCCount, TOBCount, TIBCount, 
    TRCCount, TTCCount, TCCCount, Call_Mc_Count, Call_Ob_Count, Call_In_Count, 
    Recall_Count, Transfer_Count, Conference_Count, skill ) => {
    try {
      let array = {};
      //console.log("UserModeIndexLabel"+UserModeIndexLabel+" modeIndex "+modeIndex);
      //array.UserModeIndex = Object.keys(UserModeIndexLabel).find(key => UserModeIndexLabel[key].toLowerCase() === modeIndex.toLowerCase());
      array.UserModeIndex = Object.keys(UserModeIndexLabel).find(key => UserModeIndexLabel[key] == modeIndex);
      //console.log(" array.UserModeIndex "+array.UserModeIndex);
      // Merge reset counters logic
      const agent_reset_counter = await resetCounter(TMCCount, TOBCount, TIBCount, TRCCount, TTCCount, TCCCount, Call_Mc_Count, Call_Ob_Count, Call_In_Count, Recall_Count, Transfer_Count, Conference_Count);
      array = { ...array, ...agent_reset_counter };
      if (modeIndex == "Manual") {
        array.ReadyToManualDial = true;
      } else {
        array.ReadyToManualDial = false;
      }
      const returnUpdate = await updateUserMode(SipCheckStatus, ClientID, User_Status_ID, LoginHourID, ModeDBId, CampaignName, ChatLoginID, array.UserModeIndex, userID, MOPanel, ChatA);
      array = { ...array, ...returnUpdate };
  
      // Get notification in mode
      array.getNotificationInMode = await getNotificationInMode(CampaignName, userID, array.UserModeIndex, ClientID);
      array.isRecall_Mode_Allow = await enableIsRecall(UserModeIndexID, array.UserModeIndex, UserModeRecall);
      //console.log("isRecall_Mode_Allow= "+array.isRecall_Mode_Allow+ " UserModeIndexID= "+UserModeIndexID+ " array.UserModeIndex= "+array.UserModeIndex+" UserModeRecall= "+UserModeRecall);
  
      return array;
    } catch (error) {
      console.error("Error in setUserMode:", error);
      return {};
    }
  };
  const agentLogin = async (clientID, SIP_ID, CampaignName, userID, SERVER_IP, CS_API_Port) => {
    // Add your agent login logic
    let newurl=control_server_url+"?api_name=agentlogin&input_data=client_id="+clientID+"|exten="+SIP_ID+"|campaign="+CampaignName+"|agent="+userID+"&CS_SOCKET="+SERVER_IP+"&CS_PORT="+CS_API_Port;
  //console.log("Api Url= "+newurl);
  const array = {};
  var options = {'method': 'GET','url': newurl};
  return new Promise((resolve, reject) => {
    const options = { method: 'GET', url: newurl };
    request(options, (error, response) => {
        if (error) {
            errlogRouter(2333, 'RouteName : webrtcfunction and method name: agentlogin');
            return reject(error); // Reject the promise on error
        }
        resolve(response.body); // Resolve the promise with the response body
    });
});
};
const agenSendCSData = async (newurl) => {
    // Add your agent login logic
    console.log(newurl);
  return new Promise((resolve, reject) => {
    const options = { method: 'GET', url: newurl };
    request(options, (error, response) => {
        if (error) {
            errlogRouter(2333, 'RouteName : webrtcfunction and method name: agentlogin');
            return reject(error); // Reject the promise on error
        }
        resolve(response.body); // Resolve the promise with the response body
    });
});
};


/*
* function Load_Campaign_List
* to get the list of the campaign with the priority mapped to the agent.
*/

const load_Campaign_List = async (ClientID, USER_ID, CampaignName = '') => {
    let array = { campaign: [], Queue_Priority: [] };
    try {
            let j = 0;
            // Query to fetch campaigns and their priorities
            const query_campaign = `SELECT campaign_id, priority FROM user_campaign_map WHERE client_id = "${ClientID}" AND user_id = "${USER_ID}" GROUP BY campaign_id LIMIT 200`;
            
            const result = await executeQuery(query_campaign);
            if (result.length > 0) 
            {
                result.forEach((row) => {
                array.campaign.push(row.campaign_id);
                array.Queue_Priority[j] = `${row.campaign_id}~${row.priority}`;
                j += 1;
                });
        
                if (CampaignName.length > 0) {
                // Load user mode data if CampaignName is provided
                const userModeData = await loadUserMode(ClientID, USER_ID, CampaignName);
                array = { ...array, ...userModeData };
                }
            }
  
      return array;
    } catch (error) {
      console.error('Error in Load_Campaign_List:', error);
      return array;
    }
  };

/*
* function CRMDataLogEntry
* to be used for entering the data for crm in the log table
*/
  const CRMDataLogEntry = async (CRMDataID) => {
    try {
        // Query to fetch data from crm_data
        const crmDataQuery = `
            SELECT * FROM crm_data WHERE id = '${CRMDataID}' AND (dialer_attempt > 0 OR agent_attempt > 0)`;
        
        const crmDataResult = await executeQuery3(crmDataQuery);

        if (crmDataResult.length > 0) {
            const crmData = crmDataResult[0];
           let cdatedate= moment(crmData.cdate).format('YYYY-MM-DD HH:mm:ss')

            // Insert into crm_data_log
            const insertQuery = `
                INSERT INTO crm_data_log (crm_id, campaign, agent, cdate, leadid, dialer_attempt, dialer_disp, agent_attempt, agent_disp, agent_sub_disposition, 
                rid, phone, phone1, phone2, phone3, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15, f16, f17, f18, f19, f20, f21, f22, f23, f24, f25, f26, f27, f28, f29, f30, f31, f32, f33, f34, f35, f36, 
                f37, f38, f39, f40, f41, f42, f43, f44, f45, f46, f47, f48, f49, f50, client_id, assigned_to, calltype, dataset_id, skill, source)
                VALUES ('${CRMDataID}', '${crmData.campaign}', '${crmData.agent}', '${cdatedate}', 
                        '${crmData.leadid}', '${crmData.dialer_attempt}', '${crmData.dialer_disp}', '${crmData.agent_attempt}', '${crmData.agent_disp}', '${crmData.agent_sub_disposition}', 
                        '${crmData.rid}', '${crmData.phone}', '${crmData.phone1}', '${crmData.phone2}', '${crmData.phone3}', '${crmData.f1}', '${crmData.f2}', '${crmData.f3}', '${crmData.f4}', 
                        '${crmData.f5}', '${crmData.f6}', '${crmData.f7}', '${crmData.f8}', '${crmData.f9}', '${crmData.f10}', '${crmData.f11}', '${crmData.f12}', '${crmData.f13}', '${crmData.f14}', 
                        '${crmData.f15}', '${crmData.f16}', '${crmData.f17}', '${crmData.f18}', '${crmData.f19}', '${crmData.f20}', '${crmData.f21}', '${crmData.f22}', '${crmData.f23}', '${crmData.f24}', 
                        '${crmData.f25}', '${crmData.f26}', '${crmData.f27}', '${crmData.f28}', '${crmData.f29}', '${crmData.f30}', '${crmData.f31}', '${crmData.f32}', '${crmData.f33}', '${crmData.f34}', 
                        '${crmData.f35}', '${crmData.f36}', '${crmData.f37}', '${crmData.f38}', '${crmData.f39}', '${crmData.f40}', '${crmData.f41}', '${crmData.f42}', '${crmData.f43}', '${crmData.f44}', '${crmData.f45}', '${crmData.f46}', '${crmData.f47}', '${crmData.f48}', '${crmData.f49}', 
                        '${crmData.f50}', '${crmData.client_id}', '${crmData.assigned_to}', '${crmData.calltype}', '${crmData.dataset_id}', '${crmData.skill}', '${crmData.source}')`;
            //console.log("query data= "+insertQuery);
            await executeQuery3(insertQuery);
            return true;
        } else {
            return false;  // No data found for the given CRMDataID
        }
    } catch (error) {
        console.error('Error in CRMDataLogEntry:', error);
        return false;
    }
};

/*******Campaign wise permission******** */
const checkCampaignAuth = async (clientID,Campaign) => {
    let data_record={crm_permission:0,assigned_permission:0,decision_tree_permission:0,ticket_permission:0,sms_permission:0,email_permission:0,history_permission:0,feedback_permission:0,whatsapp_in_permission:0,whatsapp_out_permission:0,chat_permission:0};
    try {
        // Query to check user status
        const campaign_query = `SELECT * FROM dt_permission WHERE client_id = "${clientID}" AND campaign = "${Campaign}"`;
        const campaign_result = await executeQuery(campaign_query);
        if (campaign_result.length > 0) {

            //console.log(campaign_result[0]);
            return campaign_result[0];
        } else {
            return data_record;
        }
    } catch (error) {
        return data_record;
    }
};
const freeAgent = async (id) => {
    try { 
        if (!id) return res.json({ ok: false, msg: 'Invalid ID' });
        // Fetch agent details
        const userstatus=`SELECT name, sipid, client_id FROM user_status WHERE id = '${id}'`;
        const userstatus_result = await executeQuery(userstatus);
        if (userstatus_result.length === 0) 
        {
            //return false;
        }
        const { name: agent, sipid: sip, client_id: cid } = userstatus_result[0];
        // Check agent role
        const userroles=`SELECT id FROM user_role WHERE id = '${agent}' AND client_id = '${cid}' AND agent_free = 0`;
        const userrole_result = await executeQuery(userroles);
        if (userrole_result.length > 0) {
            const userstatus_update=`UPDATE user_status SET user_free = 1 WHERE id = '${id}'`;
            await executeQuery(userstatus_update);
            //return false;
        }
        // Get server IP
        const userip=`SELECT ip_address FROM ip_config WHERE id = 2`;
        const userip_result = await executeQuery(userip);
        if (userip_result.length === 0){
            //return false;
        }
        const SERVER_IP = userip_result[0].ip_address;
        const newurl = `${control_server_url}?api_name=free&input_data=client_id=${cid}|agent=${agent}|sip=${sip}&CS_SOCKET=${SERVER_IP}&CS_PORT=${CS_FREE_PORT}`;
        //console.log("Generated URL:", newurl);
        const agent_csdata = await agenSendCSData(newurl);
        console.log(agent_csdata);
        const result = agent_csdata.split('|');
        if (result[0].trim() != '1')
        {
            //return false;
        }
        // Delete user status
        const delete_userstatus=`DELETE FROM user_status WHERE id = '${id}'`;
        const deleteuser_status_result = await executeQuery(delete_userstatus);
        if (deleteuser_status_result.affectedRows === 0) 
        {
            //return false;
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
                const logout_csdata = await agenSendCSData(logouturl);
                console.log(logout_csdata);
            }
        }
    

    } catch (error) {
        console.error('Error in /remove-agent route:', error);
    }
};

module.exports = {greetUser,addNumbers,current_datetime,checkClient_id,
    loadServerIP,validateWebSip,getExpireCheck,base64Encode,getLicenseCheck,
    validateUserSession,setUserRoll,loadDNCURL,getDefaultCampaignAndMode,getDBTime,
    executeQuery,executeQuery2,executeQuery3,AgentRemove,removeQueue,loadManualID,getDIDName,getDidNameForAllDID,
    loadCampaignDetail,loadCampaignDisp,loadCampaignSubDisp,loadUserMode,updateUserCampaign,loadCampaignEventAPI,
    pauseInQueue,enableQueuePause,addQueue,loadCallBackPolicy,getActivity,getAgentPrefix,getModeSeconds,
    SaveUserModeLog,resetCounter,chatLoginStatus,updateUserMode,setUserMode,getNotificationInMode,enableIsRecall,
    agentLogin,agenSendCSData,load_Campaign_List,CRMDataLogEntry,checkCampaignAuth,freeAgent};

var express = require('express');
const http = require('http');
const xss = require('xss');
var database = require('../config/db');
var db3 = require('../config/clientdb');
var wa_db = require('../config/wadb');
var router = express.Router();
var request = require('request');
var errlogRouter = require('./err_log');
let moment = require('moment');
const {omni_wp_url,assign_sip_url,agent_version,decision_tree_baseurl} = require('./constant_webrtc');

const { permission } = require('process');
const { json } = require('body-parser');

router.post('/webrtcloginProcess', async (req, res, next) => {
    const { username, password, client_id, myip, extension, db_user, db_pass, db_server, web_server, cs_server, voice_server } = req.body;

    // Setting session data
    req.session.db_user = db_user;
    req.session.db_pass = db_pass;
    req.session.db_server = db_server;

    try {
        // Calling the login model function for checking the login process
        const loginResult = await loginwebrtcQuery(username, password, client_id, myip, extension, db_user, db_pass, db_server, web_server, cs_server, voice_server);
        res.json(loginResult);
    } catch (error) {
        errlogRouter(23, 'webrtcloginProcess');
        next(error);
        return;
    }
});
const loginwebrtcQuery = async (username, password, client_id, myip, extension, db_user, db_pass, db_server, web_server, cs_server, voice_server) => {
    // Implement your login logic here
    // For example, querying the database to validate the user credentials

    // This is just a dummy response
    if (username === 'validUser' && password === 'validPassword') {
        return { success: true, message: 'Login successful' };
    } else {
        return { success: false, message: 'Invalid credentials' };
    }
};
async function checkClientID(clientID) {
    // Clean the input to prevent XSS attacks
    const cleanedClientID = xss(clientID);

    try {
        const [rows] = await database.execute(`
            SELECT client_type, multiple_number_search, manual_route, can_change_lead, preview_hold, show_multiple_crmdataid, tiny_url_sms
            FROM vm_client
            WHERE client_code = ? AND flag = 1
        `, [cleanedClientID]);

        if (rows.length > 0) {
            return rows[0];
        } else {
            return false;
        }
    } catch (err) {
        errlogRouter(56, 'function checkClientID');
        throw err;
    }
}
router.post('/checkclient', async (req, res, next) => {

    checkClientID('3181')
        .then(result => res.send(result)
        ).catch(err => console.error(err));
    //res.send('hello');
});
// Example usage:

/** validate-campaign-mode */

router.post('/validate-campaign-mode', (req, res, next) => {
    const { campaign, agent, client_id, mode, mo_panel } = req.body;
    const query1 = `
      SELECT campaign_id
      FROM user_campaign_map
      WHERE campaign_id = ? AND user_id = ? AND client_id = ?
  `;

    database.query(query1, [campaign, agent, client_id], (err, result1) => {
        if (err) {
            errlogRouter(81, 'validate-campaign-mode');
            next(err);
            return;
        }

        const query2 = `
          SELECT u.user_mode, m.mode_index, u.is_recall
          FROM map_user_mode m
          LEFT JOIN user_mode u ON m.mode_index = u.mode_index AND m.client_id = u.client_id
          WHERE m.client_id = ? AND m.user_id = ? AND u.user_mode = ?
          UNION
          SELECT m.user_mode, mm.mode_id, m.is_recall
          FROM user_mode m
          LEFT JOIN campaign_mode_map mm ON mm.mode_id = m.mode_index AND m.client_id = mm.client_id
          WHERE mm.client_id = ? AND mm.campaign_id = ? AND m.user_mode = ?
      `;

        database.query(query2, [client_id, agent, mode, client_id, campaign, mode], (err, result2) => {
            if (err) {
                errlogRouter(100, 'validate-campaign-mode');
                next(err);
                return;
            }
            if (result1.length > 0 && result2.length > 0) {
                res.json({ ok: true });
            } else {
                res.json({
                    msg: `Change Campaign ${campaign.toUpperCase()} & mode ${mode.toUpperCase()} as Admin Requested, but Campaign ${campaign.toUpperCase()} and mode ${mode.toUpperCase()} not mapped.`
                });
            }
            if (mode.toLowerCase() === "mo" && mo_panel === "0") {
                response.ok = false;
                response.msg = `Change Campaign ${campaign.toUpperCase()} & mode ${mode.toUpperCase()} as Admin Requested, but Permission Denied.`;
            }
        });
    });
});
router.post('/updateMORecords', (req, res, next) => {
    const { txtMoRemarks, MoRemarksID } = req.body;

    if (!txtMoRemarks || !MoRemarksID) {
        return res.status(400).json({ error: 'txtMoRemarks and MoRemarksID are required' });
    }

    // Define the SQL query for updating the database
    const updateQuery = `
      UPDATE moremarks 
      SET mo_remarks = ?, mo_end_time = NOW() 
      WHERE id = ?
  `;

    // Execute the update query
    connection.query(updateQuery, [txtMoRemarks, MoRemarksID], (err) => {
        if (err) {
            errlogRouter(135, 'updateMORecords');
            next(err);
            return;
        }


        // Define the response object
        const responseObject = {
            WaitingMoDisposition: false,
            MoType: "",
            MoAgentName: "",
            MoAgentSip: "",
            MoCustomerPhone: "",
            MoStartTime: "",
            MoRemarksID: 0
        };

        // Send the response
        res.json(responseObject);
    });
});
/**Insert disposition */
router.post('/insert_disposition', (req, res, next) => {
    var { agent, campaign, did, rid, call_type, phone, lead_id, login_id, sip, did_number, mode_action_id, client_id } = req.body;
    var dispose_status = '3';
    var originate_source = 'A';
    if (call_type == 'IB') {
        dispose_status = '4';
    }
    var query_disposition = `
      INSERT INTO disposition 
      (agent, campaign, did, rid, call_type, phone, lead_id, login_id, sip, did_number, mode_action_id, client_id, dispose_status, originate_source, start_time, end_time, hangup_time)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, SYSDATE(), SYSDATE(), SYSDATE())
  `;
    var values_disposion = [
        agent, campaign, did, rid, call_type, phone, lead_id, login_id, sip, did_number, mode_action_id, client_id, dispose_status, originate_source
    ];
    db3.query(query_disposition, values_disposion, (error, result) => {
        if (error) {
            errlogRouter(175, 'insert_disposition');
            next(error);
            return;
        }
        res.send({ status: true, msg: 'Disposition Insertion successfully' });
    });

});
/** develope by Alok */
router.post('/get_dataid', async (req, res, next) => {
    const { campaign, phone, code } = req.body;

    dataid = 0;
    display_name = '';
    let query = `
        SELECT id,f1 FROM crm_data WHERE  campaign='${campaign}' AND dataset_id='0' AND client_id='${code}' AND phone LIKE '%${phone}%' ORDER BY id DESC LIMIT 1`;
    db3.query(query, (err, results) => {
        if (err) {
            errlogRouter(199, 'get_dataid');
            next(err);
            return;
        }
        else if (results.length > 0) {
            dataid = results[0].id;
            display_name = results[0].f1;
            res.send({ status: true, data_id: dataid, display_name: display_name });
        }
        else if (results.length == 0) {

            res.send({ status: true, data_id: dataid, display_name: display_name });
        }
        else {
            res.send({ status: true, data_id: dataid, display_name: display_name });
        }

    });
});
router.post('/insert_recall', async (req, res, next) => {
    const { parent_priority, recall_by, phone, dataid, campaign, cdate, agent, client_id, update_by_ip, recall_type, rid, calltype, disposition, sub_disposition, skill, type } = req.body;
    const status = 1;
    const data_flag = 1;
    const priority = 1;
    recall_datetime = moment(cdate).format('YYYY-MM-DD HH:mm:ss');

    // Check if the record already exists
    query_campaign = `SELECT max_callback_days FROM campaign WHERE client_id = "${client_id}" AND name = "${campaign}"`;
    result_campaign = await executeQuery(query_campaign);
    query_crm = `SELECT callback_count FROM crm_data WHERE id="${dataid}"`;
    //console.log(query_crm);
    result_crm = await execute_clientQuery(query_crm);
    let Max_CallBack_Count = 0;
    let CRM_CallBack_Count = 0;
    if(result_crm.length > 0)
    {
        CRM_CallBack_Count = result_crm[0].callback_count; 
    }
    if(result_campaign.length > 0)
    {
        Max_CallBack_Count = result_campaign[0].max_callback_days;
    }
    //console.log("Max_CallBack_Count= "+Max_CallBack_Count+" CRM_CallBack_Count= "+CRM_CallBack_Count);

    query_callback_policy = `SELECT * FROM callback_policy WHERE campaign="${campaign}" AND client_id="${client_id}" and callback_type='cbu'`;
    database.query(query_callback_policy, (recall_err, recallResult) => {
        if (recall_err) {
            errlogRouter(227, 'Check Policy');
            next(recall_err);
            return;
        }
        if (recallResult.length > 0 && recallResult[0].lead_storage == 1) {
            let CBUPolicyCampaignTransfer = recallResult[0].callbacktocampaign;
            let strdata = '';
            let query_tag = '';

            if (Max_CallBack_Count > 0 && Max_CallBack_Count > CRM_CallBack_Count) {

                query_tag = 'LEADMOVE';
                if (CBUPolicyCampaignTransfer == '') {
                    strdata = `campaign:${campaign}|phone:${phone}|priority:1|check_pre_dialing:0|skill:${skill}|disposition:${disposition}|loadtime:${recall_datetime}|dataid:${dataid}|callbacktype:${recall_type}`;
                } else {
                    strdata = `campaign:${CBUPolicyCampaignTransfer}|phone:${phone}|priority:1|check_pre_dialing:0|skill:${skill}|disposition:${disposition}|loadtime:${recall_datetime}|dataid:${dataid}|callbacktype:${recall_type}`;
                }


            } else {
                query_tag = 'CALLBACK';
                if (CBUPolicyCampaignTransfer == '') {
                    strdata = `campaign:${campaign}|phone:${phone}|priority:1|check_pre_dialing:0|skill:${skill}|disposition:${disposition}|loadtime:${recall_datetime}|callbacktype:${recall_type}`;
                } else {
                    strdata = `campaign:${CBUPolicyCampaignTransfer}|phone:${phone}|priority:1|check_pre_dialing:0|skill:${skill}|disposition:${disposition}|loadtime:${recall_datetime}|callbacktype:${recall_type}`;

                }

            }

            //console.log("strdata= " + strdata);
            const insert_exeQuery = `INSERT INTO execute_query (message, client_id, query_tag) VALUES (?, ?, ?)`;
            const insert_exeValues = [strdata, client_id, query_tag];
            database.query(insert_exeQuery, insert_exeValues, (insert_exeError, insert_exeResult) => {
                if (insert_exeError) {
                    errlogRouter(257, 'insert_execute_query');
                    next(insert_exeError);
                    return;
                }
                res.send({ status: true, msg: 'Recall inserted successfully', data: insert_exeResult });
            });

        } else {

            const checkQuery = `SELECT * FROM recall WHERE phone="${phone}" AND agent="${agent}" AND campaign="${campaign}" AND cdate <= "${cdate}" AND client_id="${client_id}" AND data_flag="1" AND status="1" ORDER BY parent_priority, priority, cdate LIMIT 1`;
            db3.query(checkQuery, (checkError, checkResult) => {
                if (checkError) {
                    errlogRouter(236, 'insert_recall');
                    next(checkError);
                    return;
                }
                if (checkResult.length > 0 && type != 'add') {
                    // Update the existing record if it already exists
                    const updateQuery = `UPDATE recall SET cdate="${cdate}",agent="${agent}",status="${status}",recall_by="${recall_by}",update_time=SYSDATE(),update_by_user="${recall_by}",update_by_ip="${update_by_ip}",calltype="${calltype}",data_flag="${data_flag}",source="${recall_by}",priority="${priority}",parent_priority="${parent_priority}",disposition="${disposition}",sub_disposition="${sub_disposition}",skill="${skill}"
                    WHERE agent = "${agent}"  AND campaign = "${campaign}" AND client_id = "${client_id}" AND cdate <= "${cdate}" AND data_flag = "1" AND status = "1"`;
                    //console.log("updateQuery");  
                    db3.query(updateQuery, (updateError, updateResult) => {
                        if (updateError) {
                            errlogRouter(237, 'update_recall');
                            next(updateError);
                            return;
                        }
                        res.send({ status: true, msg: 'Recall updated successfully' });
                    });
                } else {
                    // Insert the new record if it doesn't exist
                    const insertQuery = `INSERT INTO recall 
                      (phone, dataid, campaign, cdate, agent, status, client_id, recall_by, update_time, update_by_user, update_by_ip, recall_type, rid, calltype, data_flag, created_time, source, priority, parent_priority, disposition, sub_disposition, skill)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, SYSDATE(), ?, ?, ?, ?, ?, ?, SYSDATE(), ?, ?, ?, ?, ?, ?)`;

                    const insertValues = [phone, dataid, campaign, recall_datetime, agent, status, client_id, recall_by, recall_by, update_by_ip, recall_type, rid, calltype, data_flag, recall_by, priority, parent_priority, disposition, sub_disposition, skill];

                    db3.query(insertQuery, insertValues, (insertError, insertResult) => {
                        if (insertError) {
                            errlogRouter(257, 'insert_recall');
                            next(insertError);
                            return;
                        }
                        res.send({ status: true, msg: 'Recall inserted successfully' });
                    });
                }
            });

        }
    });


});
router.post('/get_autodispose_timer', async (req, res, next) => {
    const { campaign, code } = req.body;
    let query_camp = `
        SELECT id,auto_dispose_duration FROM campaign WHERE  name='${campaign}' AND client_id='${code}' limit 1`;
    database.query(query_camp, (err, results) => {
        if (err) {
            errlogRouter(273, 'get_autodispose_timer');
            next(err);
            return;
        }
        else if (results.length > 0) {
            auto_dispose_duration = results[0].auto_dispose_duration;
            res.send({ status: true, auto_dispose: auto_dispose_duration });
        }
        else if (results.length == 0) {

            res.send({ status: true, auto_dispose: 0 });
        }
        else {
            res.send({ status: true, auto_dispose: 0 });
        }

    });
});

router.post('/availability_recall', (req, res, next) => {
    let { callback_id, phone, dataid, campaign, cdate, agent, client_id, update_by_ip, recall_type, rid, calltype, disposition, sub_disposition, skill } = req.body;
    let where = '';
    if (callback_id != '') {
        where = `AND id!='${callback_id}' `;
    }
    const sql = `SELECT phone FROM recall where campaign='${campaign}' AND client_id='${client_id}' AND phone='${phone}' AND dataid='${dataid}' AND agent='${agent}'  ` + where + `  LIMIT 1`; // Replace 'users' with your table name
    //console.log("recall check= "+sql);
    db3.query(sql, (err, rows) => {
        if (err) {
            errlogRouter(299, 'availability_recall');
            next(err);
            return;
        }
        if (rows.length > 0) {
            return res.send({ "ok": true, "data": { "callback": "Callback is Already set, Are You sure want to Continue? " } });
        } else {
            res.send({ "ok": false, "data": "Invalid data" })
        }
    });
});


/*** code by alok */
router.post('/update_hold_counter', async (req, res, next) => {
    let { ModeDBId, record_id, hold_date_time, hold_count } = req.body;
    if (hold_count == 0) {
        hold_date_time = 0;
        res.status(200).send({ status: false, msg: "No Update" });
        return;
    }
    if (hold_date_time == null) {
        hold_date_time = 0;
    } else {
        hold_date_time = parseInt(hold_date_time, 10); // Ensure hold_date_time is an integer
    }
    //console.log("update_hold_counter backu= "+JSON.stringify(req.body));
    const query1 = ` UPDATE user_mode_action SET hold = "${hold_count}",hold_duration = hold_duration + "${hold_date_time}" WHERE id = "${ModeDBId}"`;

    const query2 = ` UPDATE disposition SET hold_count = "${hold_count}",hold_time = hold_time + "${hold_date_time}" WHERE rid = "${record_id}"`;
    //console.log("update_hold_counter= " + query1);

    errlogRouter('hold counter', query1);
    errlogRouter('disposition hold counter', query2);

    //const alok1 = database.format(query2, req.body);
    //console.log(query2);

    try {
        await database.query(query1);
        //console.log('user_mode_action updated');

        await db3.query(query2);
        //console.log('disposition updated');
        res.status(200).send({ status: true, msg: "record updated successfully" });
    } catch (error) {
        console.error('Error updating database:', error);
        errlogRouter(317, 'update_hold_counter');
        res.status(200).send({ status: false, msg: "unable to update...!" });
    }
});
router.post('/user_permission', async (req, res, next) => {
    let { user_id, client_id } = req.body;
    const query_role = `SELECT * FROM user_role where id="${user_id}" and client_id="${client_id}"`;

    database.query(query_role, function (error, results, fields) {
        if (error) {
            errlogRouter(348, 'user_permission');
            next(error);
            return;
        } else {
            if (results.length > 0) {
                res.send({ status: true, data: results });
            } else {
                res.send({ status: false, data: "" });
            }

        }

    });
});
router.post('/auto_dispose', (req, res, next) => {
    // Destructure the incoming request body
    let { autoDispCounter, autoDispTimeDiff } = req.body;

    // Convert autoDispCounter and autoDispTimeDiff to numbers
    autoDispCounter = Number(autoDispCounter);
    autoDispTimeDiff = Number(autoDispTimeDiff);

    // Increment the auto dispose counter
    autoDispCounter += 1;

    // Calculate the time difference
    autoDispTimeDiff -= 1;

    // Check if the countdown is over
    if (autoDispTimeDiff <= 0) {
        res.send({
            status: true,
            AutoDispCounter: 0,
            AutoDispTimeDiff: 0,
            WaitingDisposition: false,
            DispalyPhoneNumber: "",
            MaskedPhoneNumber: "",
            DisplayCallerID: "",
            DisplayDIDName: "",
            EditPhoneNo: "",
            LastAgentState: "HANGUP",
            loggedIn: 1,

        });
    } else {
        res.send({
            status: false,
            AutoDispCounter: autoDispCounter,
            AutoDispTimeDiff: autoDispTimeDiff
        });
    }
});

router.post('/update_tcc_details', async (req, res, next) => {
    var to_user = '';
    let where = '';
    var { r_lid, r_mode_id, call_rid, to_campaign, to_user } = req.body;
    to_user = req.body.to_user;
    if (to_user != '' && to_user != 'undefined' && r_lid != null && to_user != undefined) {
        where = `to_user="${to_user}",`;
    }
    let update_tcc_record = `UPDATE tcc_details SET ` + where + ` r_lid = "${r_lid}",r_mode_id="${r_mode_id}",to_campaign="${to_campaign}"  WHERE tcc_rid = "${call_rid}"`;
    //console.log("tcc update " + update_tcc_record);
    database.query(update_tcc_record, function (error, results, fields) {
        if (error) {
            errlogRouter(409, 'update_tcc_details');
            next(error);
            return;
        } else {
            res.send({ status: true, data: "Record update succesfully...!" });
        }

    });
});
/***Skill Listing**/
router.post('/skill_list', (req, res, next) => {
    var { client_id, campaign_name } = req.body;
    var query_skill = `select skill from campaign_skill_map where client_id='${client_id}' and campaign='${campaign_name}' limit 200`;
    database.query(query_skill, (err, rows) => {
        if (err) {
            errlogRouter(426, 'skill_list');
            next(err);
            return;
        }
        if (rows.length > 0) {
            res.send({ status: true, data: rows });
        } else {
            res.send({ status: false, data: "No Record found...!" });
        }
    });
});
router.post('/queue_list', (req, res, next) => {
    var { client_id, from_campaign, from_queue, to_campaign } = req.body;
    var query_queue = `select to_queue,queue_priority from campaign_queue_map where client_id='${client_id}' and from_campaign='${from_campaign}' and from_queue='${from_queue}' and to_campaign='${to_campaign}' limit 200`;
    database.query(query_queue, (err, rows) => {
        if (err) {
            errlogRouter(444, 'queue_list');
            next(err);
            return;
        }
        if (rows.length > 0) {
            res.send({ status: true, data: rows });
        } else {
            res.send({ status: false, data: "No Record found...!" });
        }
    });
});

/*******################# Whatsapp part  ######################*******/
router.post('/whatsapp', function (req, res, next) {
    let { phone_number } = req.body;
    res.render('whatsapp', { phone_number: phone_number });
});
router.post('/wa_sidebar', (req, res, next) => {
    const { business_number, phone_number, search_string } = req.body;
    var where_string = '';
    if (search_string != '') {
        where_string = `(cust_phone LIKE  "%${search_string}%" OR cust_name LIKE "%${search_string}%" ) and `;
    }
    if (phone_number != '') {
        where_string = ` cust_phone="${phone_number}"  and `;
    }

    const query_wa = `SELECT SUM(IF(chat_status = 1,1,0)) AS readmsg,cust_phone,cust_name FROM aino_webhook_notify where ` + where_string + `  business_number = "${business_number}" and body != '' group by cust_phone order by MAX(cust_datetime) DESC `;
    //console.log(query_wa);
    wa_db.query(query_wa, (err, result1) => {
        if (err) {
            errlogRouter(480, 'wa_sidebar');
            next(err);
            return;
        }
        const query_msgcount = `SELECT cust_phone,SUM(IF(chat_status = 1, 1, 0)) AS readmsg,SUM(IF(chat_status = 0, 1, 0)) AS unreadmsg,MAX(cust_datetime) AS last_datetime,
    TIMESTAMPDIFF(HOUR, MAX(cust_datetime), NOW()) AS hours_difference FROM aino_webhook_notify WHERE business_number = "${business_number}" AND body != '' GROUP BY cust_phone`;
        wa_db.query(query_msgcount, (error, results) => {
            if (error) {
                errlogRouter(487, 'wa_sidebar');
                next(error);
                return;
            }
            const msg_count = {};
            let hour_count = 0;
            results.forEach(row => {
                msg_count[row.cust_phone] = row.unreadmsg;
                hour_count = row.hours_difference;
            });
            res.render('wa_sidebar', { data: result1, msg_count: msg_count, hour_count: hour_count });
        });

    });
});
router.post('/wa_loadchat', (req, res, next) => {
    const { business_number, phone_number, msg_status } = req.body;
    const query_wachat = ` SELECT cust_name, cust_phone, date, body, status, business_number, response_dt, content FROM ( SELECT n.cust_name,n.cust_phone,n.date,n.body,n.status,n.business_number,n.date as response_dt,'' AS content FROM aino_webhook_notify n WHERE n.business_number="${business_number}" AND n.cust_phone="${phone_number}" AND n.body != '' UNION ALL SELECT '' AS cust_name,nim.cust_phone,nim.created_dt AS date,'' AS body,'' AS status,nim.business_number,nim.created_dt as response_dt,nim.content FROM aino_webhook_notify_individual_msg nim WHERE nim.business_number="${business_number}"  AND nim.cust_phone="${phone_number}" ) AS subquery ORDER BY date ASC `;
    //console.log(query_wachat);
    wa_db.query(query_wachat, (err, result_chat) => {
        if (err) {
            errlogRouter(505, 'wa_loadchat' + query_wachat);
            next(err);
            return;
        }
        if (msg_status == 'read') {
            const update_wachat = ` UPDATE aino_webhook_notify SET chat_status = '1' where business_number='${business_number}' and cust_phone='${phone_number}'  and body != '' order by id ASC `;
            wa_db.query(update_wachat, (error, update_chat) => {
                if (error) {
                    errlogRouter(514, 'wa_loadchat');
                    next(error);
                    return;
                } else {
                    //errlogRouter(519,'aino_webhook_notify record updated...!');
                }
            });
        }
        const query_msgcount = `SELECT cust_phone,SUM(IF(chat_status = 1, 1, 0)) AS readmsg,SUM(IF(chat_status = 0, 1, 0)) AS unreadmsg,IFNULL(MAX(cust_datetime), '0') AS last_datetime,
    IFNULL(TIMESTAMPDIFF(HOUR, MAX(cust_datetime), NOW()), 0) AS hours_difference FROM aino_webhook_notify WHERE business_number = "${business_number}" AND body != '' and  cust_phone='${phone_number}'`;
        //console.log(query_msgcount);  
        wa_db.query(query_msgcount, (error, results) => {
            if (error) {
                errlogRouter(487, 'wa_sidebar');
                next(error);
                return;
            }
            var msg_count = 0;
            var hour_count = 0;
            results.forEach(row => {
                msg_count = row.unreadmsg;
                if (row.last_datetime == 0 && row.hours_difference == 0) {
                    hour_count = 0;
                } else if (row.last_datetime != 0 && row.hours_difference == 0) {
                    hour_count = 1;
                } else {
                    hour_count = row.hours_difference;
                }

            });
           // console.log("hour_count1" + hour_count);
            res.render('wa_chat', { data: result_chat, msg_count: msg_count, hour_count: hour_count });
        });
    });
});



/*** code developed by Alok */
router.post('/wa_number', async (req, res, next) => {
    const { client_id, campaign_name } = req.body;
    const query_wanumber = ` SELECT whatsapp_number FROM agent_campaign_whatsapp_map where client_id='${client_id}' and campaign='${campaign_name}' limit 1`;
    database.query(query_wanumber, async (err, result_number) => {
        if (err) {
            errlogRouter(532, 'wa_loadchat');
            next(err);
            return;
        }
        if (result_number.length > 0) {
            res.send({ status: true, whatsapp_business_number: result_number[0].whatsapp_number });
            return false;
        } else {
            res.send({ status: false, msg: "No record found...!" });
            return false;
        }
    });
});

router.post('/send_whatsapp', (req, res, next) => {
    const { phone_number, send_msg, business_number } = req.body;
    query_apitoken = `SELECT pr.api_key,pr.allow_chat FROM aino_meta_payload py left join aino_meta_project pr on pr.project_id=py.request_id WHERE py.response LIKE '%${business_number}%' AND py.type = 'live_waba' ORDER BY py.payload_id DESC LIMIT 1 `;
    wa_db.query(query_apitoken, (err, result_number) => {
        if (err) {
            errlogRouter(552, 'send_whatsapp');
            next(err);
            return;
        }
        if (result_number.length > 0) {

            var api_auth_key = result_number[0].api_key;
            var wh_allow_chat = result_number[0].allow_chat;
            if (wh_allow_chat == 0) {
                res.send({ status: false, msg: "I'm sorry, but I don't have the authority to grant that permission.", permission: "No" });
                return false;
            }
            var api_url = omni_wp_url;
            //console.log("omni url= "+omni_wp_url);
            var json_data = { "to": phone_number, "type": "text", "recipient_type": "individual", "text": { "body": send_msg } };
            var options = { 'method': 'POST', 'url': api_url, 'headers': { 'auth-key': api_auth_key, 'Content-Type': 'application/json' }, body: JSON.stringify(json_data) };
            request(options, function (error, response) {
                if (error) {
                    errlogRouter(564, 'send_omni_whatsapp');
                    next(error);
                    return;
                }
                api_res = JSON.parse(response.body);
                if (api_res.status == 'success') {
                    errlogRouter('whatsapp_api_res', JSON.parse(JSON.stringify(response.body)));
                    res.send({ status: true, msg: "Message sent successfully", "api_res": JSON.parse(response.body) });
                    return;
                } else {
                    errlogRouter('whatsapp_api_res', JSON.parse(JSON.stringify(response.body)));
                    res.send({ status: false, msg: "Message failed to send.", "api_res": JSON.parse(response.body) });
                    return;
                }

            });
        } else {
            res.send({ status: false, msg: "Message failed to send." });
            return false;
        }
    });
});
/**** ROUTE PERMISSION */
router.post('/route_permission', (req, res, next) => {
    const { client_id } = req.body;
    query_route = `SELECT manual_route,decision_tree_permission,ticket_permission from vm_client WHERE client_code='${client_id}' LIMIT 1`;
    database.query(query_route, (err, result_number) => {
        if (err) {
            errlogRouter(552, 'route_permission');
            next(err);
            return;
        }
        if (result_number.length > 0) {
            res.send({ status: true, msg: "permitted", "route_permission": result_number[0].manual_route,"decision_tree_permission": result_number[0].decision_tree_permission,"ticket_permission": result_number[0].ticket_permission });
            return false;
        } else {
            res.send({ status: false, msg: "Message failed to send.", "route_permission": result_number[0].manual_route });
            return false;
        }
    });
});
/**** Alok Tab*** */
const executeQuery = (query) => {
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
const execute_clientQuery = (query) => {
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
//**** Show All Call Log */
router.post('/all_call_log', async (req, res, next) => {
    var username = req.body.username;
    var client_id = req.body.client_id;
    var campaign = req.body.campaign;
    var intr = req.body.intr;
    let page = parseInt(req.body.page_no) || 1;
    let limit = parseInt(req.body.limit) || 10;
    let offset = (page - 1) * limit;
   // console.log(" jsondata= " + JSON.stringify(req.body));
    const query_alllog = `SELECT e.rid,'-' AS mobile_no,e.recipient_id as email, DATE_FORMAT(e.sent_date, "%d-%b-%Y") AS calldate,
TIME_FORMAT(e.sent_date, "%H:%i:%s") AS call_time,'Sent' AS type,'Email' AS call_type,e.email_content as msg,'-' AS bill_sec,'-' AS start_time
FROM email_sent e 
left join galaxy_client_v5.disposition d on d.rid=e.rid and d.client_id=e.client_id 
WHERE e.client_id = "${client_id}" AND e.Campaign_Name = "${campaign}" AND e.agent_id = "${username}"  AND d.did="${intr}" 
UNION ALL
SELECT s.rid, s.mobile_no, '-' AS email,DATE_FORMAT(s.cdate, "%d-%b-%Y") AS calldate,TIME_FORMAT(s.cdate, "%H:%i:%s") AS call_time,'Sent' AS type,'SMS' AS call_type,s.message as msg,'-' AS bill_sec,'-' AS start_time FROM sms_sent s 
left join galaxy_client_v5.disposition d on d.rid=s.rid and d.client_id=s.client_id
 WHERE s.client_id = "${client_id}" AND s.Campaign_Name = "${campaign}" AND s.agent = "${username}" 
 AND d.did="${intr}"
UNION ALL
select d.rid,d.phone AS mobile_no, '-' AS email,DATE_FORMAT(d.start_time, "%d-%b-%Y") AS calldate,TIME_FORMAT(calldate, "%H:%i:%s") AS call_time,'-' AS type,'Call' AS call_type,'-' AS msg,sec_to_time(cd.billsec) as bill_sec,DATE_FORMAT(d.start_time, "%Y-%m-%d %H:%i:%s") AS start_time from galaxy_client_v5.disposition d 
LEFT JOIN galaxy_client_v5.crm_data c on d.did = c.id and d.client_id = c.client_id 
left join galaxy_client_v5.cdr_log cd on cd.recordid=d.rid and cd.client_id=d.client_id  
WHERE d.did="${intr}" AND d.client_id = "${client_id}" AND d.campaign = "${campaign}" AND d.agent = "${username}"  ORDER BY rid DESC LIMIT ${limit} OFFSET ${offset}`;
    const queryDisp = `SELECT e.rid,'-' AS mobile_no,e.recipient_id as email, DATE_FORMAT(e.sent_date, "%d-%b-%Y") AS calldate,
TIME_FORMAT(e.sent_date, "%H:%i:%s") AS call_time,'Sent' AS type,'Email' AS call_type,e.email_content as msg,'-' AS bill_sec,'-' AS start_time
FROM email_sent e 
left join galaxy_client_v5.disposition d on d.rid=e.rid and d.client_id=e.client_id 
WHERE e.client_id = "${client_id}" AND e.Campaign_Name = "${campaign}" AND e.agent_id = "${username}"  AND d.did="${intr}" 
UNION ALL
SELECT s.rid, s.mobile_no, '-' AS email,DATE_FORMAT(s.cdate, "%d-%b-%Y") AS calldate,TIME_FORMAT(s.cdate, "%H:%i:%s") AS call_time,'Sent' AS type,'SMS' AS call_type,s.message as msg,'-' AS bill_sec,'-' AS start_time FROM sms_sent s 
left join galaxy_client_v5.disposition d on d.rid=s.rid and d.client_id=s.client_id
 WHERE s.client_id = "${client_id}" AND s.Campaign_Name = "${campaign}" AND s.agent = "${username}" 
 AND d.did="${intr}"
UNION ALL
select d.rid,d.phone AS mobile_no, '-' AS email,DATE_FORMAT(d.start_time, "%d-%b-%Y") AS calldate,TIME_FORMAT(calldate, "%H:%i:%s") AS call_time,'-' AS type,'Call' AS call_type,'-' AS msg,sec_to_time(cd.billsec) as bill_sec,DATE_FORMAT(d.start_time, "%Y-%m-%d %H:%i:%s") AS start_time from galaxy_client_v5.disposition d 
LEFT JOIN galaxy_client_v5.crm_data c on d.did = c.id and d.client_id = c.client_id 
left join galaxy_client_v5.cdr_log cd on cd.recordid=d.rid and cd.client_id=d.client_id  
WHERE d.did="${intr}" AND d.client_id = "${client_id}" AND d.campaign = "${campaign}" AND d.agent = "${username}"`;
    dsresult = await executeQuery(queryDisp);
    //console.log(query_alllog);
    database.query(query_alllog, function (error, rows) {
        if (error) {
            errlogRouter(808, 'all_call_log');
            next(error);
            return;
        }
        res.render('call_all_log', { rows: rows, num_rows: dsresult.length, page: page, limit: limit });
    });
});

router.post('/campaign_transfer_permission', async (req, res, next) => {
    const { client_id, from_campaign, to_campaign } = req.body;
    const query_campaign_transfer = `SELECT * FROM c2c_transfer WHERE from_campaign = "${from_campaign}" AND to_campaign = "${to_campaign}" AND client_id = "${client_id}" AND (from_skill IS NULL AND to_skill IS NULL OR from_skill='' AND to_skill='') `;
    database.query(query_campaign_transfer, function (error, results) {
        if (error) {
            errlogRouter(808, 'all_call_log');
            next(error);
            return;
        }
        if (results.length > 0) {
            res.send({ status: true, campaign_transfer_permission: 1, msg: "Access allowed...!" });
        } else {
            res.send({ status: false, campaign_transfer_permission: 0, msg: "Access not allowed...!" });
        }
    });
});
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
router.get('/current_dbdatetime', async (req, res, next) => {
    dsresult = await current_datetime();
    res.send({ ok: true, msg: dsresult });
});

/*****CAllback Policy list And Permissions ******/
router.post('/callback_policy', async (req, res, next) => {
    const { client_id, campaign_name } = req.body;
    const policy = {
        CBUPolicy: 1,
        CBUDialing: 1,
        CBUPriority: 100,
        CBIDialing: 0,
        CBADialing: 0,
        CBEDialing: 0,
        CBSDialing: 0,
        CBQDialing: 0
    };
    const query_policy = `SELECT callback_type, assign_policy, dialing_preference, priority FROM callback_policy WHERE client_id = "${client_id}"  AND campaign = "${campaign_name}" `;
    database.query(query_policy, function (error, results) {
        if (error) {
            errlogRouter(741, 'callback_policy');
            next(error);
            return;
        }
        if (results.length > 0) {
            results.forEach((row) => {
                const callbackType = row.callback_type.toUpperCase();
                switch (callbackType) {
                    case 'CBA':
                        policy.CBADialing = row.dialing_preference;
                        break;
                    case 'CBI':
                        policy.CBIDialing = row.dialing_preference;
                        break;
                    case 'CBU':
                        policy.CBUPolicy = row.assign_policy;
                        policy.CBUDialing = row.dialing_preference;
                        policy.CBUPriority = row.priority;
                        break;
                    case 'CBE':
                        policy.CBEDialing = row.dialing_preference;
                        break;
                    case 'CBS':
                        policy.CBSDialing = row.dialing_preference;
                        break;
                    case 'CBQ':
                        policy.CBQDialing = row.dialing_preference;
                        break;
                }
            });

            res.send({ status: true, policy_list: policy, msg: "policy list" });
        } else {
            res.send({ status: false, policy_list: policy, msg: "no policy" });
        }
    });
});

/*****CAllback Policy list And Permissions ******/
router.post('/disposition_sms_map', async (req, res, next) => {
    const { client_id, campaign_name, disposition, skill } = req.body;
    const query_map_sms = `SELECT m.template_id,s.id,m.skill AS skill, m.disposition_id AS disposition_id, m.route_id AS route_id, 
        s.sms_text AS sms_text, s.url AS url, s.tiny_config_id AS tiny_config_id FROM agent_disposition_sms_map m 
        LEFT JOIN sms_template s ON m.template_id = s.id 
        WHERE m.client_id = "${client_id}" AND m.disposition_id = "${disposition}" AND m.skill = "${skill}" AND m.campaign = "${campaign_name}"`;
    database.query(query_map_sms, function (error, results) {
        if (error) {
            errlogRouter(795, 'disposition_sms_map');
            next(error);
            return;
        }
        if (results.length > 0) {
            res.send({ status: true, data_list: results, msg: "Data is available." });
        } else {
            res.send({ status: false, data_list: '', msg: "No data available." });
        }
    });
});
/****************Update transfer call count********************* */
router.post('/count_transfercall', (req, res, next) => {
    var { ModeDBId, transfer_count } = req.body;
    const update_usermode = `UPDATE user_mode_action SET transfer = "${transfer_count}" WHERE id = "${ModeDBId}"`;
    //console.log(update_usermode);
    database.query(update_usermode, (error, result) => {
        if (error) {
            errlogRouter(898, 'Update transfer count');
            next(error);
            return;
        }
        res.send({ status: true, msg: 'Update Record successfully...!' });
    });

});
router.post('/count_confcall', (req, res, next) => {
    var { ModeDBId, Conference_Count } = req.body;
    const update_usermode = `UPDATE user_mode_action SET conference = "${Conference_Count}" WHERE id = "${ModeDBId}"`;
   // console.log(update_usermode);
    database.query(update_usermode, (error, result) => {
        if (error) {
            errlogRouter(912, 'Update conference count');
            next(error);
            return;
        }
        res.send({ status: true, msg: 'Update Record successfully...!' });
    });

});
router.post('/webrtc_saveuser_modeLog', async (req, res, next) => {
    var { ClientID, LoginHourID, ModeDBId, emailCount, smsCount } = req.body;
    /**** login hour query */
    const query_loginhour = `UPDATE loginhour SET logout_time = SYSDATE() WHERE client_id = "${ClientID}" AND id = "${LoginHourID}"`;
    result_loginhour = await executeQuery(query_loginhour);
    /**** login Mode query */
    const query_usermode = `UPDATE user_mode_action SET email_count=${emailCount}, sms_count=${smsCount}, end_time = SYSDATE() WHERE client_id = "${ClientID}" AND id = "${ModeDBId}"`;
    const result_usermode = await executeQuery(query_usermode);

    const query_usermode1 = `INSERT INTO user_mode_action_log (mode_id, start_time, end_time, created_date)
    VALUES ("${ModeDBId}",  SYSDATE(), SYSDATE(), SYSDATE())`;
    const result_usermode_log = await executeQuery(query_usermode1);
    database.query(query_loginhour, (error, result) => {
        if (error) {
            errlogRouter(175, 'insert_disposition');
            next(error);
            return;
        }
        if (result_loginhour && result_usermode) {
            res.send({ ok: true, msg: 'Update Record successfully...!', result_usermode_log: result_usermode_log });

        } else {
            res.send({ ok: false, msg: 'Unable to update..!' });
        }

    });

});
const indian_timezonetime = (date_time,other_timezone) => {
    let india_timezone_value='+05:30';
    let india_timezone = moment(date_time).utcOffset(india_timezone_value);
    let other_time_zone = india_timezone.clone().utcOffset(other_timezone);
    return other_time_zone;
  };
  /*************Update review**************** */
  router.post('/update_review_duration', async (req, res, next) => {
    let { ModeDBId, review_date_time, review_count } = req.body;
    if (review_count == 0) {
        review_date_time = 0;
        res.status(200).send({ status: false, msg: "No Update" });
        return;
    }
    if (review_date_time == null) {
        review_date_time = 0;
    } else {
        review_date_time = parseInt(review_date_time, 10); // Ensure hold_date_time is an integer
    }
    //console.log("update_hold_counter backu= "+JSON.stringify(req.body));
    const query1 = ` UPDATE user_mode_action SET review_count = "${review_count}",review_duration = review_duration + "${review_date_time}" WHERE id = "${ModeDBId}"`;
    errlogRouter('review counter', query1);

    try {
        await database.query(query1);
        //console.log('user_mode_action updated');
        res.status(200).send({ status: true, msg: "record updated successfully" });
    } catch (error) {
        console.error('Error updating database:', error);
        errlogRouter(317, 'update_hold_counter');
        res.status(200).send({ status: false, msg: "unable to update...!" });
    }
});
/*****************whatupa out load templates******************** */
router.post('/whats_load_templates', async (req, res, next) => {
    let { client_id, campaign_name } = req.body;
    const query_whatp = `SELECT t.id,w.skill,t.template_id,w.route_id,t.whatsapp_name FROM agent_disposition_whatsapp_map w INNER JOIN whatsapp_template t ON w.client_id = t.client_id AND w.template_id = t.id WHERE w.disposition_id = '' AND LOWER(w.campaign) = "${campaign_name}" AND w.client_id = "${client_id}"`;
        database.query(query_whatp, (error, result) => {
            if (error) {
                errlogRouter(175, 'insert_disposition');
                next(error);
                return;
            }
            if (result.length > 0) 
            {
                res.send({ status: true, msg:"Record successfully...!",data: result});
            }else
            {
                res.send({ status: false, msg: "No record founds"});
            }
    
        });
});

/************************Select templates load****************************/
router.post('/selectWptemplate', async (req, res) => {
    const { id, client_id } = req.body;
    let array = {};
    try {
        // Fetch data from 'whatsapp_template'
        const queryTemplate = `
            SELECT id,whatsapp_text AS wBody,whatsapp_header AS wHeader,whatsapp_uploadtype AS wutype,whatsapp_uploadfile AS wUfile,whatsapp_language AS wLang,client_id 
            FROM whatsapp_template WHERE id = "${id}" AND client_id = "${client_id}"`;
                database.query(queryTemplate, async (error, result) => {
                    if (error) {
                        errlogRouter(175, 'selectWptemplate');
                        next(error);
                        return;
                    }
                    if (result.length > 0) 
                    {
                        //res.send({ status: true, msg:"Record successfully...!",data: result});
                        const row = result[0];
                        let lang = '';
                        for (const [key, value] of Object.entries(row)) {
                            if (key === 'wLang' && value !=null) {
                                const languageCodes = value.split(',');
                                const queryLanguages = `SELECT language_code,language_name FROM master_language WHERE flag = '1'`;
                                languageRows = await executeQuery(queryLanguages);
                                if (languageRows.length > 0) {
                                    languageRows.forEach(langRow => {
                                        if (languageCodes.includes(langRow.language_code)) {
                                            lang += `${langRow.language_name},`;
                                        }
                                    });
                                }
                                // Remove trailing comma and add to the array
                                if (lang) {
                                    lang = lang.slice(0, -1);
                                    array[key] = lang;
                                }
                            } else if (key === 'wUfile') {
                                array[key] = value;
                                array['whatsapp_f'] = value;
                            } else {
                                // Default processing
                                array[key] = value ? value.toString().replace(/<[^>]*>/g, '') : ''; // Strip HTML tags
                            }
                        }
                        res.send({ status: true, msg:"Record successfully...!",data: array});

                    }else
                    {
                        res.send({ status: false, msg: "No record founds"});
                    }
            
                });
    } catch (error) {
        console.error('Database Error:', error.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
/*********************Whatsapp outbox*************************************** */
router.post('/whatsapp_send_msg', async (req, res, next) => {
    let {ClientID,to,mailbody,WHATSAPP_COUNT,campaign,route_id,template_id,skill,rid,agent} = req.body;
    if(WHATSAPP_COUNT=='')
    {
        WHATSAPP_COUNT=0;
    }
    // Process WhatsApp Text
    const pattern = /{([^}]*)}/g;
    let phone=to;
    let matches;
    let payload = {mobile: to,tid: template_id};
    let msg = mailbody;
    let whatsappText = mailbody;
    let i = 1;
    while ((matches = pattern.exec(whatsappText)) !== null) 
    {
        const key = matches[1];
        const varName = `var${i}`;
        let replacement;
        switch (key) {
            case 'PHONE':
                replacement = phone;
                break;
            case 'DATETIME':
                replacement = moment().format('YYYY-MM-DD HH:mm:ss');
                break;
            case 'DATE':
                replacement = moment().format('YYYY-MM-DD');
                break;
            case 'TIME':
                replacement = moment().format('HH:mm:ss');
                break;
            case 'CAMPAIGN':
                replacement = campaign;
                break;
            case 'CLIENTID':
                replacement = ClientID;
                break;
            case 'UNIQUEID':
            case 'CALLERID':
                replacement = rid;
                break;
            default:
                replacement = key;
        }
        payload[varName] = replacement;
        msg = msg.replace(`{${key}}`, " "+replacement);
        i++;
    }
// Get Dataset
    database.query('SELECT dataset FROM campaign WHERE name = ? AND client_id = ?',[campaign, ClientID],(err, result) => {
    if (err) {
        errlogRouter(1109, 'whatsapp_send_msg');
        next(err);
        return;
    }
    const dataset = result.length > 0 ? result[0].dataset : 0;
    // Get CRM Config Fields
    database.query('SELECT dfid, fcaption FROM crm_config WHERE campaign = ? AND client_id = ? ORDER BY fid',[campaign, ClientID],(err1, result) => {
    if (err1) {
        errlogRouter(1117, 'whatsapp_send_msg');
        next(err1);
        return;
    }
    const fields = {};
    result.forEach(row => { fields[row.fcaption.toUpperCase()] = `f${row.dfid}`;});
    const fieldNames = Object.keys(fields).map(key => `${fields[key]} AS '${key}'`).join(',');
    let query =`SELECT ${fieldNames}, agent_disp ` + `FROM galaxy_client_v5.crm_data WHERE campaign = ? AND phone = ? AND client_id = ? ORDER BY id DESC`;
    const params = [campaign, phone, ClientID];
    if (dataset > 0) {
        query =`SELECT ${fieldNames}, agent_disp ` + `FROM galaxy_client_v5.crm_data WHERE phone = ? AND client_id = ? AND dataset_id = ? ORDER BY id DESC`;
        params.push(dataset);
    }
    database.query(query, params, (err2, result) => {
    if (err2) {
        errlogRouter(1117, 'whatsapp_send_msg');
        next(err2);
        return;
    }
    if (result.length > 0) {
        const row = result[0];
        Object.keys(row).forEach(rk => {
            Object.keys(payload).forEach(pk => {
                if (payload[pk] === 'DISPOSITION') {
                    payload[pk] = row.agent_disp;
                    msg = msg.replace(pk, row.agent_disp);
                }
                if (rk.toUpperCase() === payload[pk].toUpperCase()) {
                    payload[pk] = row[rk];
                    msg = msg.replace(rk.toUpperCase(), row[rk]);
                }
            });
        });
    }
    // Insert WhatsApp Outbox
    const insertData = {mobile_no: phone,template_id,client_id: ClientID,message: msg,whatsapp_status: 0,Campaign_Name: campaign,route_id,skill,agent,rid};
    database.query('INSERT INTO whatsapp_outbox SET cdate=SYSDATE(), ?', insertData, (err3, result) => {
    if (err3) {
        errlogRouter(1117, 'whatsapp_send_msg');
        next(err3);
        return;
    }
    if(result.affectedRows > 0)
    {
        let new_WHATSAPP_COUNT=parseInt(WHATSAPP_COUNT);
        count_wpdata=parseInt(new_WHATSAPP_COUNT+1);
        res.send({status: true, msg: "Data insert successfully...!",whatsapp_count:count_wpdata});
    }else
    {
        res.send({status: false, msg: "Unable to inserted data...!"});
    }
    });
    });
    }
    );
    }
);
});
/*************ticket_tool url*********************** */
router.post('/ticket_panel', (req, res, next) => {
    var client_id = req.body.client_id;
    var campaign = req.body.campaign;
    const sql = 'SELECT ticket_base_url FROM ticket_config';
    ///console.log(sql);
    database.query(sql, (err, rows) => {
      if (err) {
        errlogRouter(1188, 'ticket_panel');
        next(err);
        return;
      }
      res.send({ status: true, data: rows });
    });
  });
  router.post('/decision_tree', async function (req, res, next) {
    const main_parent_id = req.body.main_parent_id;
    var sql = `SELECT * FROM chat_view WHERE main_parent_id IN (${main_parent_id})  ORDER BY order_by ASC`;
    database.query(sql, (err, result) => {
      if (err) {
        errlogRouter(487, 'treeview');
        next(err);
        return;
      }
      // Create a menu structure
      const menus = {items: {},parents: {},};
  
      // Build the array lists with data from the SQL result
      result.forEach((item) => {
        menus.items[item.id] = item;
        if (!menus.parents[item.parent_id]) {
          menus.parents[item.parent_id] = [];
        }
        menus.parents[item.parent_id].push(item.id);
      });
    const treeViewHtml = createTreeView(0, menus);
    res.render('decision_tree', {treeViewHtml,menus});
    });
});
router.post('/search_decision_tree', async function (req, res, next) {
    const main_parent_id = req.body.main_parent_id;
    const search = req.body.search;
    if (!search || search.trim() === '')
        {
            var sql = `SELECT * FROM chat_view WHERE main_parent_id IN (${main_parent_id})  ORDER BY order_by ASC`;
            
        }else{
            var sql = `SELECT * FROM chat_view WHERE main_parent_id IN (${main_parent_id}) AND title LIKE '%${search}%'  limit 1`;
        }
    //console.log("sql"+sql);
    database.query(sql, (err, result) => {
      if (err) {
        errlogRouter(487, 'treeview');
        next(err);
        return;
      }
      // Create a menu structure
      const menus = {items: {},parents: {},};
  
      // Build the array lists with data from the SQL result
      result.forEach((item) => {
        menus.items[item.id] = item;
        if (!menus.parents[item.parent_id]) {
          menus.parents[item.parent_id] = [];
        }
        menus.parents[item.parent_id].push(item.id);
      });
    const treeViewHtml = createTreeView(0, menus);
    res.render('search_tree_view', {treeViewHtml,menus});
    });
});

router.get('/treeview', (req, res) => {
    const main_parent_id = req.query.parent_id;
    const search = req.query.search; // Get parent_id from query parameter
    if (!search || search.trim() === '')
    {
        var sql = `SELECT * FROM chat_view WHERE main_parent_id IN (${main_parent_id})  ORDER BY order_by ASC`;
        
    }else{
  
        var sql = `SELECT * FROM chat_view WHERE main_parent_id IN (${main_parent_id}) AND title LIKE '%${search}%'  limit 1`;
    }
    //console.log("sql"+sql);
    database.query(sql, (err, result) => {
      if (err) {
        errlogRouter(487, 'treeview');
        next(err);
        return;
      }
      // Create a menu structure
      const menus = {
        items: {},
        parents: {},
      };
  
      // Build the array lists with data from the SQL result
      result.forEach((item) => {
        menus.items[item.id] = item;
        if (!menus.parents[item.parent_id]) {
          menus.parents[item.parent_id] = [];
        }
        menus.parents[item.parent_id].push(item.id);
      });
  
      // Generate the tree view HTML
      
      const treeViewHtml = createTreeView(0, menus);

    // Render the treeview.ejs page with treeViewHtml as data
    res.render('tree_view', {treeViewHtml,menus});
    });
  });

  router.post("/load_decision_gallery", async (req, res) => {
    let {rid,campaign,phone,user,call_type,client_id,id} = req.body;
    
    const base_url = "/uploads/"; // Path for file uploads
    let video_arr = [], image_arr = [], docs_arr = [], hyperlink_arr = [], text_arr = [];
    const sql = `SELECT * FROM tree_gallery WHERE tree_id = ?`;
    database.query(sql, [id], async (err, results) => {
        if (err) {
            errlogRouter(227, 'load decision gallery');
            next(err);
            return;
        }

        if (results.length > 0) {
            results.forEach(row => {
                if (row.media_type === "video" && row.extension === "mp4") {
                    video_arr.push({
                        video_path: base_url + row.file_name,
                        title: row.title,
                        id: row.id
                    });
                } else if (row.media_type === "image" && row.extension !== "mp4") {
                    image_arr.push({
                        image_path: base_url + row.file_name,
                        title: row.title,
                        id: row.id
                    });
                } else if (row.media_type === "docs") {
                    docs_arr.push({
                        doc_path: base_url + row.file_name,
                        title: row.title,
                        id: row.id
                    });
                } else if (row.media_type === "hyperlink") {
                    hyperlink_arr.push({
                        hyperlink_path: row.hyperlink,
                        title: row.title,
                        id: row.id
                    });
                } else if (row.media_type === "text") {
                    text_arr.push({
                        long_text: row.long_text,
                        title: row.title,
                        id: row.id
                    });
                }
            });
        }
        /*****************Add log for tree on click tours****************** */
        if(rid!='')
        {
            query_tree_log = `SELECT * FROM agent_tree_travel_details WHERE phone = "${phone}"  AND rid != "${rid}"`;
            result_tree = await executeQuery(query_tree_log);
            if(result_tree.length > 0)
            {
                let query_tree_details_log= `INSERT INTO agent_tree_travel_details_log (id, rid, campaign, phone, user, call_type, client_id, node_id, created_dt)
                SELECT id, rid, campaign, phone, user, call_type, client_id, node_id, created_dt
                FROM agent_tree_travel_details WHERE phone = "${phone}"`;
                let result_tree_details_log = await executeQuery(query_tree_details_log);
                if(result_tree_details_log.affectedRows > 0)
                {
                    let delete_tree_details_log= `DELETE FROM agent_tree_travel_details WHERE phone = "${phone}"`;
                    let result_tree_delete = await executeQuery(delete_tree_details_log);
                    //console.log(" delete_tree_details_log= ",result_tree_delete);
                }

                }else
                {
                    let query_tree_details= `INSERT INTO agent_tree_travel_details (rid, campaign, phone, user, call_type, client_id, node_id)
                    VALUES ("${rid}", "${campaign}", "${phone}", "${user}", "${call_type}", "${client_id}", "${id}")`;
                    let result_tree_details = await executeQuery(query_tree_details);
            }

        }
        
        // Render data to an EJS template
        res.render("tree_galary", {image_arr,video_arr,docs_arr,hyperlink_arr,text_arr,decision_tree_baseurl});
    });
});
  
  // Recursive function to create tree view
  function createTreeView(parent, menu) {
    let html = '';
    if (menu.parents[parent]) {
      html += "<ol class='tree'>";
      menu.parents[parent].forEach((itemId) => {
        html += "<li>";
        html += `<label for='item_${itemId}' class='bg_${itemId} tbgcls'><span style="display:none" class="content-div abga float-left" id='divi_${itemId}'>&nbsp;</span> ${menu.items[itemId].title}</label>`;
        html += `<input type='checkbox' name='item_${itemId}' onclick='gallery_view("${itemId}","${menu.items[itemId].main_parent_id}")' />`;
  
        if (menu.parents[itemId]) {
          html += createTreeView(itemId, menu); // Recursively generate child items
        }
  
        html += "</li>";
      });
      html += "</ol>";
    }
    return html;
  }

  
/**Insert tree disposition */
router.post('/insert_tree_disposition', (req, res, next) => {
    var { agent, campaign, node_id, disposition_id, sub_disposition_id, remarks, callback, callback_time, rid, phone, client_id } = req.body;
    var query_disposition = `
      INSERT INTO tree_disposition_form 
      (client_id, user, campaign_id, node_id, disposition_id, sub_disposition_id, remarks, callback, callback_time, rid, phone, created_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, SYSDATE())
  `;
    var values_disposion = [client_id, agent, campaign, node_id, disposition_id, sub_disposition_id, remarks, callback, callback_time, rid, phone];
    database.query(query_disposition, values_disposion, (error, result) => {
        if (error) {
            errlogRouter(175, 'insert_disposition');
            next(error);
            return;
        }
        res.send({ status: true, msg: 'Tree disposition insertion successfully' });
    });

});
/*************Page_reload_log**************** */

router.post("/page_reload_log", async (req, res) => {
    let {rid,client_id,as_id,campaign_name,user_id,sip_id,campaign_type,LoginHourID,ModeDBId,ip,user_status_id,server_ip,activity_id,caller_id} = req.body;
    let disposition_id='';
    if(rid!='')
        {
            query_tree_log = `SELECT * FROM disposition WHERE rid = "${rid}"`;
            result_tree = await execute_clientQuery(query_tree_log);
            if(result_tree.length > 0)
            {
                disposition_id=result_tree[0].id;
            }

        }
        let query_log_details= `INSERT INTO client_page_reload_log (client_id, as_id, campaign_name, user_id, sip_id, campaign_type, LoginHourID, ModeDBId, ip, user_status_id, server_ip, activity_id, caller_id, disposition_id, rid, created_date)
        VALUES ("${client_id}", "${as_id}", "${campaign_name}", "${user_id}", "${sip_id}", "${campaign_type}", "${LoginHourID}", "${ModeDBId}", "${ip}", "${user_status_id}", "${server_ip}", "${activity_id}", "${caller_id}", "${disposition_id}", "${rid}", sysdate())`;
        let result_tree_details = await execute_clientQuery(query_log_details);
        //console.log(result_tree_details);
        //console.log(result_tree_details.insertId);
        res.send({"status":true,"last_id":result_tree_details.insertId});
});

module.exports = router;
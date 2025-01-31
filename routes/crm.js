var express = require('express');
var database = require('../config/db');
var client_database = require('../config/clientdb');
var asteriskdb = require('../config/astdb');
const os = require('os');
var request = require('request');
const https = require('https');
const moment = require('moment');
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('./scratch');
const { json } = require('body-parser');
const { register } = require('module');
const util = require('util');
const { promisify } = require('util');
var formattedDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
var router = express.Router();

/*add crm route by udit - 27 june 2024*/
const queryAsync = promisify(database.query).bind(database);
const clientQueryAsync = promisify(client_database.query).bind(client_database);

router.get('/crm', async function (req, res, next) {
    try {
        //console.log("Crm insert= " + JSON.stringify(req.query));
        let { campaign, agent, code, priview_id } = req.query;
        let dataid = req.query.dataid;
        let leadid = req.query.leadid;
        let rid = req.query.rid;
        let phone = req.query.phone;
        let dataset_id = req.query.DATASETID;
        let mns = (req.query.MNS && req.query.MNS.toLowerCase() === 'true') ? 1 : 0;
        let source = '';
        let data = '';
        let NoMask = req.query.NoMask;
        let redial = req.query.REDIAL;
        let calltype = req.query.CALL_TYPE;
        let campaign_type = req.query.CAMPAIGN_TYPE;
        let exten = req.query.SIP_ID;
        let tfn = req.query.did;
        let didname = req.query.didname;
        let circlep = req.query.CIRCLE_PERMISSION;
        let skill = req.query.SKILL;
        code = code ? code : req.query.CLIENT_ID;
        let tag = req.query.tag;
        didname = didname ? didname : tfn;
        let dataToSend = {};
        NoMask = NoMask ? 'true' : 'false';
        let startingFourDigit = phone ? phone.slice(-10).substring(0, 4) : '';

        // Execute circle query
        const circleQuery = 'SELECT circle FROM base_circle_operator WHERE starting_four_digit = ?';
        const circleRows = await new Promise((resolve, reject) => {
            database.query(circleQuery, [startingFourDigit], (err, circleRows) => {
                if (err) {
                    console.error('Error executing circle query:', err);
                    reject(err);
                }
                resolve(circleRows);
            });
        });

        let circle = '';
        if (circleRows.length > 0) {
            circle = circleRows[0].circle;
        }

        // Check for recall parameter or fetch from campaign table
        let recall = 0;
        if (req.query.recall) {
            recall = req.query.recall;
        } else {
            const recallRows = await new Promise((resolve, reject) => {
                const recallQuery = 'SELECT recall FROM campaign WHERE name = ? AND client_id = ?';
                database.query(recallQuery, [campaign, code], (err, recallRows) => {
                    if (err) {
                        console.error('Error executing recall query:', err);
                        reject(err);
                    }
                    resolve(recallRows);
                });
            });

            if (recallRows.length > 0) {
                recall = recallRows[0].recall;
            }
        }

        //console.log('Circle:', circle);
        //console.log('Recall:', recall);
        // Handle dataid retrieval or insertion
        if (dataid && dataid != "" && dataid != 0) {
            const query = `SELECT * FROM crm_data WHERE id = ${database.escape(dataid)} AND client_id = ${database.escape(code)} ORDER BY id DESC LIMIT 1`;
            const result = await new Promise((resolve, reject) => {
                client_database.query(query, (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });

            if (result.length > 0) {
                const row = result[0];
                dataid = row.id;
                leadid = row.leadid;
                source = row.source;
                delete row.leadid;
                delete row.id;
                delete row.source;
                data = row;
            } else {
                return res.status(404).send('No data found11');
            }
        } else {
            if (!leadid) {
                leadid = `${campaign.toUpperCase()}_MANUAL`;
            }
            if (!priview_id && (!campaign || !agent || !leadid || !rid || !phone || !code)) {
                return res.status(404).send('No data founddd');
            }

            let where = '';
            let query = `SELECT * FROM crm_data WHERE ${dataset_id ? `dataset_id = ${database.escape(dataset_id)}` : `campaign = ${database.escape(campaign)} AND dataset_id = '0'`} AND client_id = ${database.escape(code)} `;

            if (mns != 0) {
                if (code == "7560") {
                    query += `AND (phone LIKE '%${phone.slice(-10)}%' OR f8 LIKE '%${phone.slice(-10)}%' OR f9 LIKE '%${phone.slice(-10)}%')`;
                } else {
                    query += `AND (phone LIKE '%${phone.slice(-10)}%' OR f1 LIKE '%${phone.slice(-10)}%' OR f2 LIKE '%${phone.slice(-10)}%' OR f3 LIKE '%${phone.slice(-10)}%')`;
                }
            } else {
                if (phone) {
                    query += `AND phone LIKE '%${phone.slice(-10)}%'`;
                } else {
                    query += `AND phone LIKE '%%'`;
                }
            }

            query += `${where} ORDER BY id DESC LIMIT 1`;

            const results = await new Promise((resolve, reject) => {
                client_database.query(query, (err, results) => {
                    if (err) reject(err);
                    resolve(results);
                });
            });

            if (results.length > 0) {
                const row = results[0];
                dataid = row.id;
                leadid = row.leadid;
                source = row.source;
                delete row.leadid;
                delete row.id;
                delete row.source;
                data = row;
            } else {
                if (!priview_id) {
                    const insertQuery = `INSERT INTO crm_data (campaign, agent, leadid, dialer_attempt, agent_attempt, rid, phone, cdate, client_id) VALUES (?, ?, ?, 0, 0, ?, ?, SYSDATE(), ?)`;
                    const result = await new Promise((resolve, reject) => {
                        client_database.query(insertQuery, [campaign, agent, leadid, rid, phone, code], (err, result) => {
                            if (err) reject(err);
                            resolve(result);
                        });
                    });

                    dataid = result.insertId;
                    data = '';
                } else {
                    return res.status(404).json({ data: 'No data founds' });
                }
            }
        }

        // Insert and update log data

        if (dataid && typeof data === 'object') {
            if (data.agent_attempt > 0 || data.dialer_attempt > 0) {
                // Create a new object to store the formatted data
                const formattedData = {};

                // Iterate over each property in the data object
                for (const key in data) {
                    if (data.hasOwnProperty(key)) {
                        const value = data[key];

                        if (typeof value === 'string') {
                            // Replace single quotes with an empty string and wrap in single quotes
                            formattedData[key] = `'${value.replace(/'/g, '')}'`;
                        } else if (value === null) {
                            // Handle NULL values
                            formattedData[key] = "''";
                        } else if (value === undefined) {
                            // Handle undefined values
                            formattedData[key] = "''";
                        } else if (typeof value === 'object') {
                            // Handle objects by converting them to an empty string if they should be blank
                            formattedData[key] = (key === 'dialer_disp') ? "''" : 'NULL';
                        } else {
                            // For non-string, non-object values, just ensure they are correctly formatted
                            formattedData[key] = `${value}`;
                        }
                    }
                }


                // Construct the SQL INSERT query
                const insertQuery = `INSERT INTO crm_data_log(crm_id, campaign, agent, cdate, leadid, dialer_attempt, dialer_disp, agent_attempt, agent_disp, agent_sub_disposition, rid, phone, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15, f16, f17, f18, f19, f20, f21, f22, f23, f24, f25, f26, f27, f28, f29, f30, f31, f32, f33, f34, f35, f36, f37, f38, f39, f40, f41, f42, f43, f44, f45, f46, f47, f48, f49, f50, client_id, assigned_to, calltype, source) VALUES (${client_database.escape(dataid)}, ${formattedData.campaign}, ${formattedData.agent}, ${client_database.escape(data.cdate)}, ${client_database.escape(leadid)}, ${formattedData.dialer_attempt}, ${formattedData.dialer_disp}, ${formattedData.agent_attempt}, ${formattedData.agent_disp}, ${formattedData.agent_sub_disposition}, ${formattedData.rid}, ${formattedData.phone}, ${formattedData.f1}, ${formattedData.f2}, ${formattedData.f3}, ${formattedData.f4}, ${formattedData.f5}, ${formattedData.f6}, ${formattedData.f7}, ${formattedData.f8}, ${formattedData.f9}, ${formattedData.f10}, ${formattedData.f11}, ${formattedData.f12}, ${formattedData.f13}, ${formattedData.f14}, ${formattedData.f15}, ${formattedData.f16}, ${formattedData.f17}, ${formattedData.f18}, ${formattedData.f19}, ${formattedData.f20}, ${formattedData.f21}, ${formattedData.f22}, ${formattedData.f23}, ${formattedData.f24}, ${formattedData.f25}, ${formattedData.f26}, ${formattedData.f27}, ${formattedData.f28}, ${formattedData.f29}, ${formattedData.f30}, ${formattedData.f31}, ${formattedData.f32}, ${formattedData.f33}, ${formattedData.f34}, ${formattedData.f35}, ${formattedData.f36}, ${formattedData.f37}, ${formattedData.f38}, ${formattedData.f39}, ${formattedData.f40}, ${formattedData.f41}, ${formattedData.f42}, ${formattedData.f43}, ${formattedData.f44}, ${formattedData.f45}, ${formattedData.f46}, ${formattedData.f47}, ${formattedData.f48}, ${formattedData.f49}, ${formattedData.f50}, ${formattedData.client_id}, ${formattedData.assigned_to}, ${formattedData.calltype}, ${client_database.escape(source)});`;
                //console.log(insertQuery); // Print the constructed query for debugging

                // Execute the SQL query
                await new Promise((resolve, reject) => {
                    client_database.query(insertQuery, (err, result) => {
                        if (err) reject(err);
                        resolve(result);
                    });
                });
            }
        }
        // Update rid in crm_data table
        const updateQuery = `UPDATE crm_data SET rid = ${database.escape(rid)} WHERE id = ${database.escape(dataid)} AND client_id = ${database.escape(code)}`;
        await new Promise((resolve, reject) => {
            client_database.query(updateQuery, (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        // Fetch mandatory fields
        let mandatory_fields = '';
        const query1 = `SELECT GROUP_CONCAT(cc.dfid) FROM crm_config cc JOIN agent_crm_field_map acfm ON cc.campaign = acfm.campaign_id AND cc.client_id = acfm.client_id AND cc.dfid = acfm.dfid WHERE cc.campaign = ? AND cc.client_id = ? AND cc.req = '1' AND acfm.user_id = ? ORDER BY cc.fid`;

        const result1 = await new Promise((resolve, reject) => {
            database.query(query1, [campaign, code, agent], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        if (result1.length > 0 && result1[0]['GROUP_CONCAT(cc.dfid)']) {
            mandatory_fields = result1[0]['GROUP_CONCAT(cc.dfid)'];
        } else {
            const query2 = `SELECT GROUP_CONCAT(dfid) FROM crm_config WHERE campaign = ? AND req = '1' AND client_id = ? ORDER BY fid`;

            const result2 = await new Promise((resolve, reject) => {
                database.query(query2, [campaign, code], (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });

            if (result2.length > 0 && result2[0]['GROUP_CONCAT(dfid)']) {
                mandatory_fields = result2[0]['GROUP_CONCAT(dfid)'];
            }
        }

        // Fetch autodispose duration
        let autodispose = '';
        const query3 = `SELECT auto_dispose_duration FROM campaign WHERE name = ? AND client_id = ?`;

        const result3 = await new Promise((resolve, reject) => {
            database.query(query3, [campaign, code], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        if (result3.length > 0) {
            autodispose = result3[0].auto_dispose_duration;
        }

        // Fetch crm_config data
        let query = `SELECT cc.* FROM crm_config cc JOIN agent_crm_field_map acfm ON cc.campaign = acfm.campaign_id AND cc.client_id = acfm.client_id AND cc.dfid = acfm.dfid WHERE cc.campaign = ? AND cc.client_id = ? AND acfm.user_id = ? ORDER BY cc.fid`;
        const result4 = await new Promise((resolve, reject) => {
            database.query(query, [campaign, code, agent], (err, result) => {
                if (err) reject(err);
                resolve(result);
            });
        });

        if (result4.length === 0) {
            query = `SELECT * FROM crm_config WHERE campaign = ? AND client_id = ? ORDER BY fid`;
            const result5 = await new Promise((resolve, reject) => {
                database.query(query, [campaign, code], (err, result) => {
                    if (err) reject(err);
                    resolve(result);
                });
            });

            if (result5.length > 0) {
                dataToSend = {
                    result: result5,
                    agent: agent,
                    code: code,
                    campaign: campaign,
                    NoMask: NoMask,
                    data: data,
                    dataid: dataid,
                    leadid: leadid,
                    rid: rid,
                    phone: phone,
                    dataset_id: dataset_id,
                    mns: mns,
                    source: source,
                    redial: redial,
                    calltype: calltype,
                    campaign_type: campaign_type,
                    exten: exten,
                    tfn: tfn,
                    didname: didname,
                    circlep: circlep,
                    skill: skill,
                    mandatory_fields: mandatory_fields,
                    autodispose: autodispose
                };
                return res.render('crm', { dataToSend: dataToSend });
            }
        } else {
            dataToSend = {
                result: result4,
                agent: agent,
                code: code,
                campaign: campaign,
                NoMask: NoMask.toLowerCase(),
                data: data,
                dataid: dataid,
                leadid: leadid,
                rid: rid,
                phone: phone,
                dataset_id: dataset_id,
                mns: mns,
                source: source,
                redial: redial,
                calltype: calltype,
                exten: exten,
                tfn: tfn,
                didname: didname,
                circlep: circlep,
                skill: skill,
                mandatory_fields: mandatory_fields,
                autodispose: autodispose
            };
            return res.render('crm', { dataToSend: dataToSend });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).send('Internal Server Error');
    }
});


/*router.get('/crm', function(req, res, next) {
    let {campaign, agent, code,priview_id} = req.query;
    let dataid = req.query.dataid;
    let leadid = req.query.leadid;
    let rid = req.query.rid;
    let phone = req.query.phone;
    let dataset_id = req.query.DATASETID;
    let mns = (req.query.MNS && req.query.MNS.toLowerCase() === 'true') ? 1 : 0;
    let source = '';
    let data = '';
    let NoMask = req.query.NoMask;
    let redial = req.query.REDIAL;
    let calltype =  req.query.CALL_TYPE;
    let campaign_type =  req.query.CAMPAIGN_TYPE;
    let exten =  req.query.SIP_ID;
    let tfn =  req.query.did;
    let didname =  req.query.didname;
    let circlep =  req.query.CIRCLE_PERMISSION;
    let skill =  req.query.SKILL;
    code = code ? code : req.query.CLIENT_ID;
    let tag = req.query.tag;
    didname = didname ? didname : tfn;
    var dataToSend = {};
    NoMask = NoMask ? 'true' : 'false';
    //let data = req.query.data;
    let  startingFourDigit = phone ? phone.slice(-10).substring(0, 4) : '';
    const circleQuery = 'SELECT circle FROM base_circle_operator WHERE starting_four_digit = ?';
    database.query(circleQuery, [startingFourDigit], (err, circleRows) => {
        if (err) {
            console.error('Error executing circle query:', err);
        	
        }

        let circle = '';
        if (circleRows.length > 0) {
            circle = circleRows[0].circle;
        }

        // Check for recall parameter
        let recall = 0;
        if (req.query.recall) {
            recall = req.query.recall;
        	
        } else {
            // Fetch recall from campaign table
            const recallQuery = 'SELECT recall FROM campaign WHERE name = ? AND client_id = ?';
        	
            database.query(recallQuery, [campaign, code], (err, recallRows) => {
                if (err) {
                    console.error('Error executing recall query:', err);
                    connection.end();
                    return;
                }

                if (recallRows.length > 0) {
                    recall = recallRows[0].recall;
                }

                console.log('Circle:', circle);
                console.log('Recall:', recall);
            });
        }
    });
	
	
    if (dataid) {
          let query = `SELECT * FROM crm_data WHERE id=${escape(dataid)} AND client_id=${escape(code)} ORDER BY id DESC LIMIT 1`;
        client_database.query(query, (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
                const row = results[0];
                 dataid = row.id;
                 leadid = row.leadid;
                 source = row.source;
                delete row.leadid;
                delete row.id;
                delete row.source;
                 data = row;
            } else {
                  res.status(404).send('No data found1');
            }
        });
    } else {
        if (!leadid) {
            leadid = `${campaign.toUpperCase()}_MANUAL`;
        }
        if (!priview_id) {
        	
            if (!campaign || !agent || !leadid || !rid || !phone || !code) {
                res.status(404).send('No data founds.');
            }
        }
    	
        let where = '';

        let query = `
            SELECT * FROM crm_data
            WHERE ${dataset_id ? `dataset_id='${dataset_id}'` : `campaign='${campaign}' AND dataset_id='0'`}
            AND client_id='${code}' AND `;
        if (mns != 0) {
            if (code == "7560") {
                query += `(phone LIKE '%${phone.slice(-10)}%' OR f8 LIKE '%${phone.slice(-10)}%' OR f9 LIKE '%${phone.slice(-10)}%') `;
            } else {
                query += `(phone LIKE '%${phone.slice(-10)}%' OR f1 LIKE '%${phone.slice(-10)}%' OR f2 LIKE '%${phone.slice(-10)}%' OR f3 LIKE '%${phone.slice(-10)}%') `;
            }
        } else {
            if(phone) {
                query += `phone LIKE '%${phone.slice(-10)}%' `;
            }else{
                query += `phone LIKE '%%' `;
            }
        	
        }
	
        query += `${where} ORDER BY id DESC LIMIT 1`;
    	
        client_database.query(query, (err, results) => {
        if (err) throw err;
    	
        if (results.length > 0) {
            console.log('edde');
             row = results[0];
             console.log(row);
             dataid = row.id;
             leadid = row.leadid;
             source = row.source;
            delete row.leadid;
            delete row.id;
            delete row.source;
            data = row;
            
            
        }else{
            if (!priview_id) {
                query = `
                    INSERT INTO crm_data (campaign, agent, leadid, dialer_attempt, agent_attempt, rid, phone, cdate, client_id)
                    VALUES (?, ?, ?, 0, 0, ?, ?, SYSDATE(), ?)`;

                client_database.query(query, [campaign, agent, leadid, rid, phone, code], (err, result) => {
                    if (err) throw err;
                    
                     dataid = result.insertId;
                     data = '';
                });
            } else {
                res.json({ data: 'No data found111' });
            }
        }
        	
        });
    	
    }
	
    console.log('udit');
    console.log(dataid);
    if (dataid && Array.isArray(data)) {
        if (data.agent_attempt > 0 || data.dialer_attempt > 0) {
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    data[key] = data[key].replace(/'/g, "");
                    data[key] = client_database.escape(data[key]);
                }
            }

            const insertQuery = `INSERT INTO crm_data_log(
                crm_id, campaign, agent, cdate, leadid, dialer_attempt, dialer_disp, agent_attempt, agent_disp, 
                agent_sub_disposition, rid, phone, f1, f2, f3, f4, f5, f6, f7, f8, f9, f10, f11, f12, f13, f14, f15, f16, f17, f18, f19, 
                f20, f21, f22, f23, f24, f25, f26, f27, f28, f29, f30, f31, f32, f33, f34, f35, f36, f37, f38, f39, f40, f41, f42, f43, 
                f44, f45, f46, f47, f48, f49, f50, client_id, assigned_to, calltype, source
            ) VALUES (
                ${client_database.escape(dataid)}, ${data.campaign}, ${data.agent}, ${data.cdate}, ${leadid}, ${data.dialer_attempt}, 
                ${data.dialer_disp}, ${data.agent_attempt}, ${data.agent_disp}, ${data.agent_sub_disposition}, ${data.rid}, 
                ${data.phone}, ${data.f1}, ${data.f2}, ${data.f3}, ${data.f4}, ${data.f5}, ${data.f6}, ${data.f7}, ${data.f8}, 
                ${data.f9}, ${data.f10}, ${data.f11}, ${data.f12}, ${data.f13}, ${data.f14}, ${data.f15}, ${data.f16}, ${data.f17}, 
                ${data.f18}, ${data.f19}, ${data.f20}, ${data.f21}, ${data.f22}, ${data.f23}, ${data.f24}, ${data.f25}, ${data.f26}, 
                ${data.f27}, ${data.f28}, ${data.f29}, ${data.f30}, ${data.f31}, ${data.f32}, ${data.f33}, ${data.f34}, ${data.f35}, 
                ${data.f36}, ${data.f37}, ${data.f38}, ${data.f39}, ${data.f40}, ${data.f41}, ${data.f42}, ${data.f43}, ${data.f44}, 
                ${data.f45}, ${data.f46}, ${data.f47}, ${data.f48}, ${data.f49}, ${data.f50}, ${data.client_id}, ${data.assigned_to}, 
                ${data.calltype}, ${source}
            );`;
            console.log(insertQuery);
            client_database.query(insertQuery, (err, result) => {
                if (err) {
                    console.error('Error executing insert query:', err);
                    return;
                }
            });
        }
    }

    const updateQuery = `UPDATE crm_data 
                         SET rid = ${database.escape(rid)} 
                         WHERE id = ${database.escape(dataid)} AND client_id = ${database.escape(code)}`;

    client_database.query(updateQuery, (err, result) => {
        if (err) {
            console.error('Error executing update query:', err);
             return;
        }
    });
    let mandatory_fields = "";

    const query1 = `SELECT GROUP_CONCAT(cc.dfid) FROM crm_config cc 
                    JOIN agent_crm_field_map acfm 
                    ON cc.campaign = acfm.campaign_id 
                    AND cc.client_id = acfm.client_id 
                    AND cc.dfid = acfm.dfid 
                    WHERE cc.campaign = ? 
                    AND cc.client_id = ? 
                    AND cc.req = '1' 
                    AND acfm.user_id = ? 
                    ORDER BY cc.fid`;

    database.query(query1, [campaign, code, agent], (err, result) => {
        if (err) {
            console.error('Error executing query1:', err);
            res.status(500).send('Database query error');
            return;
        }

        if (result.length > 0 && result[0]['GROUP_CONCAT(cc.dfid)']) {
            mandatory_fields = result[0]['GROUP_CONCAT(cc.dfid)'];
        } else {
            const query2 = `SELECT GROUP_CONCAT(dfid) FROM crm_config 
                            WHERE campaign = ? 
                            AND req = '1' 
                            AND client_id = ? 
                            ORDER BY fid`;

            database.query(query2, [campaign, code], (err, result) => {
                if (err) {
                    console.error('Error executing query2:', err);
                    return;
                }

                if (result.length > 0 && result[0]['GROUP_CONCAT(dfid)']) {
                    mandatory_fields = result[0]['GROUP_CONCAT(dfid)'];
                }
            });
        }
    });
	
	
        let autodispose = '';
    let query3 = "SELECT auto_dispose_duration FROM campaign WHERE name = ? AND client_id = ?";
     database.query(query3, [campaign, code], (err, result) => {
        if (err) {
            console.error('Error executing query3:', err);
            return;
        }

        if (result.length > 0) {
            autodispose = result[0].auto_dispose_duration;
        }
    });
	

    let query = `SELECT cc.* 
             FROM crm_config cc 
             JOIN agent_crm_field_map acfm 
             ON cc.campaign = acfm.campaign_id 
             AND cc.client_id = acfm.client_id 
             AND cc.dfid = acfm.dfid 
             WHERE cc.campaign = ? 
             AND cc.client_id = ? 
             AND acfm.user_id = ? 
             ORDER BY cc.fid`;
    database.query(query, [campaign, code, agent], (err, result) => {
        if (err) throw err;
    	
        if (result.length === 0) {
            query = `SELECT * 
                     FROM crm_config 
                     WHERE campaign = ? 
                     AND client_id = ? 
                     ORDER BY fid`;
            database.query(query, [campaign, code], (err, result) => {
                if (err) throw err;
	
                if (result.length > 0) {
                       dataToSend = {
                        result: result,           // Sending main query results
                        agent: agent,
                        code: code,
                        campaign: campaign,
                        NoMask: NoMask,
                        data: data,
                        dataid : dataid,
                        leadid : leadid,
                        rid : rid,
                        phone : phone,
                        dataset_id : dataset_id,
                        mns : mns,
                        source : source,
                        redial : redial,
                        calltype : calltype,
                        campaign_type : campaign_type,
                        exten : exten,
                        tfn : tfn,
                        didname : didname,
                        circlep : circlep,
                        skill : skill,
                        mandatory_fields : mandatory_fields,
                        autodispose : autodispose
                    	
                	
                        // Sending data object or string
                    };
                    res.render('crm', {dataToSend:dataToSend});
                }
            	
            	
            	
            });
        }else{
               dataToSend = {
                        result: result,           // Sending main query results
                        agent: agent,
                        code: code,
                        campaign: campaign,
                        NoMask: NoMask.toLowerCase(),
                        data: data,
                        dataid : dataid,
                        leadid : leadid,
                        rid : rid,
                        phone : phone,
                        dataset_id : dataset_id,
                        mns : mns,
                        source : source,
                        redial : redial,
                        calltype : calltype,
                        exten : exten,
                        tfn : tfn,
                        didname : didname,
                        circlep : circlep,
                        skill : skill,
                        mandatory_fields : mandatory_fields,
                        autodispose : autodispose
                        };
                res.render('crm', {dataToSend:dataToSend});
        }
    });
	
  
});
*/
router.post('/crm_update', (req, res) => {
    const { tag, data } = req.body;
    //console.log("crm data inserty"+JSON.stringify(req.body));

    if (tag === 'update') {
        const output = {};
        data.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));
            const decodedValue = decodeURIComponent(value.replace(/\+/g, ' '));

            if (decodedKey.endsWith('[]')) {
                const baseKey = decodedKey.slice(0, -2);
                if (!output[baseKey]) {
                    output[baseKey] = [];
                }
                output[baseKey].push(decodedValue);
            } else {
                output[decodedKey] = decodedValue;
            }
        });

        //console.log('aaa= '+JSON.stringify(output));


        /*data.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            output[key] = decodeURIComponent(value.replace(/\+/g, ' '));
        });*/
        //console.log(output);
        const code = output.code;
        if (output.dataid !== '0') {
            const customFields = [];
            for (const k in output) {
                if (k == 'f6' || k == 'f7' || k == 'f8') { // Check if the id is f11
                    let values = output[k];

                    if (values.trim() !== '') { // Check if the value is not blank
                        // Ensure the first letter is uppercase
                        let updatedValue = values.charAt(0).toUpperCase() + values.slice(1);
                        output[k] = updatedValue; // Update the value in the output object

                        // Add the field id to customFields array
                        customFields.push(k);
                    }
                } else {

                    if (/^f(\d)+$/.test(k)) {
                        customFields.push(k);
                    }
                }
            }

            if (!output.sub_disposition) {
                output.sub_disposition = '';
            }

            output.disposition = output.agent_disp ? output.agent_disp.toUpperCase() : '';
            output.sub_disposition = output.agent_sub_disposition ? output.agent_sub_disposition.toUpperCase() : '';

            const dispositionQuery = `SELECT dfid FROM crm_config WHERE isDisposition=1 AND client_id='${code}' AND campaign='${output.campaign}'`;

            database.query(dispositionQuery, (err, dispositions) => {
                if (err) {
                    console.error('Database query error:', err);
                    res.status(500).send('Database query error');
                    return;
                }
                /************Start Campaign wise data push***************** */
                let dispositionStr = '&dispdata=';
                if (dispositions.length > 0) {
                    dispositions.forEach((row, index) => {
                        dispositionStr += encodeURIComponent(output['f' + row.dfid]) + "~";
                    });
                } else {
                    dispositionStr += '~~~';
                }
                const query_campaign_push = `SELECT * FROM campaign_url_map WHERE campaign_name = '${output.campaign}' and client_id='${code}'`;

                database.query(query_campaign_push, (err1, result1) => {
                    if (err1) {
                        console.error('Database query error:', err1);
                        res.status(500).send('Database query error');
                        return;
                    }
                    if (result1.length > 0) {

                        let mainArray1 = [];
                        var disp_url = result1[0]['disp_url'];
                        var url_data = result1[0]['url_data'];
                        var cam_request_method = result1[0]['url_method'];

                        let [newbaseurl, newurlParams] = disp_url.split('?');
                        //console.log("newbaseurl= " + newbaseurl + "newurlParams= " + newurlParams);
                        if (newurlParams) {
                            newurlParams.split('&').forEach(param => {
                                if (param === 'phone=') {
                                    mainArray1.push(`${param}${encodeURIComponent(output.phone)}`);
                                } else {
                                    const fieldQuery1 = `SELECT dfid FROM crm_config WHERE campaign='${output.campaign}' AND client_id='${code}' AND fcaption='${param.replace('=', '').replace('_', ' ')}'`;
                                    database.query(fieldQuery1, (err, fieldResult1) => {
                                        if (err) {
                                            console.error('Database query error:', err);
                                            res.status(500).send('Database query error');
                                            return;
                                        }
                                        if (fieldResult1.length > 0) {
                                            mainArray1.push(`${param}${encodeURIComponent(output['f' + fieldResult1[0].dfid])}`);
                                        }
                                    });
                                }
                            });
                        }

                        const finalUrl = mainArray1.length > 0 ? `${newbaseurl}?${mainArray1.join('&')}` : newbaseurl;
                        const query_cam_url_response = `INSERT INTO url_response (agent, url_data, url_time, campaign, lead_id, client_id, rid, mapped_fields, phone, request_method, disposition) 
                        VALUES ('${output.agent}', '${finalUrl}', NOW(), '${output.campaign}', '${output.leadid}', '${code}', '${output.rid}', '${url_data}', '${output.phone}', '${cam_request_method}', '${output.agent_disp}')`;
                        //console.log("Campaign push url= " + query_cam_url_response);
                        database.query(query_cam_url_response, err => {
                            if (err) {
                                console.error('Database query error:', err);
                                res.status(500).send('Database query error');
                                return;
                            }
                        });
                    } else {
                        /**********Start Disposition Wise data push********* */
                        
                        const dispositionUrlQuery = `SELECT disposition_url, disposition_fields, request_method FROM campaign_disposition_map WHERE client_id='${code}' AND campaign_id='${output.campaign}' AND disposition_url IS NOT NULL AND disposition_url != '' AND disposition_id='${output.disposition.replace('_', ' ')}'`;
                        //console.log("External url call= " + dispositionUrlQuery);
                        database.query(dispositionUrlQuery, (err, result) => {
                            if (err) {
                                console.error('Database query error:', err);
                                res.status(500).send('Database query error');
                                return;
                            }
                            //console.log("Hello disposition url "+result.length);

                            if (result.length > 0) {
                                //console.log("Hello result "+result[0]);
                                const { disposition_url: url, disposition_fields: fields, request_method: request_method } = result[0];
                                let mainArray = [];

                                let [baseurl, urlParams] = url.split('?');
                                //console.log("baseurl= " + baseurl + "urlParams= " + urlParams);
                                if (urlParams) {
                                    urlParams.split('&').forEach(param => {
                                        if (param === 'phone=') {
                                            mainArray.push(`${param}${encodeURIComponent(output.phone)}`);
                                        } else {
                                            const fieldQuery = `SELECT dfid FROM crm_config WHERE campaign='${output.campaign}' AND client_id='${code}' AND fcaption='${param.replace('=', '').replace('_', ' ')}'`;
                                            database.query(fieldQuery, (err, fieldResult) => {
                                                if (err) {
                                                    console.error('Database query error:', err);
                                                    res.status(500).send('Database query error');
                                                    return;
                                                }
                                                if (fieldResult.length > 0) {
                                                    mainArray.push(`${param}${encodeURIComponent(output['f' + fieldResult[0].dfid])}`);
                                                }
                                            });
                                        }
                                    });
                                }

                                const finalUrl = mainArray.length > 0 ? `${baseurl}?${mainArray.join('&')}` : baseurl;
                                //console.log("finalUrl= " + finalUrl);
                                const insertUrlResponseQuery = `INSERT INTO url_response (agent, url_data, url_time, campaign, lead_id, client_id, rid, mapped_fields, phone, request_method, disposition) VALUES ('${output.agent}', '${finalUrl}', NOW(), '${output.campaign}', '${output.leadid}', '${code}', '${output.rid}', '${fields}', '${output.phone}', '${request_method}', '${output.agent_disp}')`;
                                //console.log(insertUrlResponseQuery);
                                database.query(insertUrlResponseQuery, err => {
                                    if (err) {
                                        console.error('Database query error:', err);
                                        res.status(500).send('Database query error');
                                        return;
                                    }
                                });
                            }
                        });
                        /**********End Disposition Wise data push********* */

                    }
                });

                const dncCheckQuery = `SELECT dnc_check FROM campaign WHERE name='${output.campaign}' AND client_id='${code}'`;
                database.query(dncCheckQuery, (err, result) => {
                    if (err) {
                        console.error('Database query error:', err);
                        res.status(500).send('Database query error');
                        return;
                    }

                    if (result[0].dnc_check === '1' && (output.disposition === 'DNC' || output.sub_disposition === 'DNC')) {
                        const dncUrlQuery = `SELECT dncurl, remote_check, remote_check_url FROM dncurl WHERE client_id='${code}' AND url_type='dnc'`;
                        database.query(dncUrlQuery, (err, result) => {
                            if (err) {
                                console.error('Database query error:', err);
                                res.status(500).send('Database query error');
                                return;
                            }

                            if (result.length > 0) {
                                const { dncurl, remote_check, remote_check_url } = result[0];
                                const dncUrl = `${dncurl}?addphone=${encodeURIComponent(output.phone)}&timestamp=${encodeURIComponent(new Date().toLocaleString())}&client_id=${encodeURIComponent(code)}&remotecheck=${encodeURIComponent(remote_check)}&remotecheck_url=${encodeURIComponent(remote_check_url)}`;

                                const request = require('request');
                                request(dncUrl, (error, response, body) => {
                                    if (error) {
                                        console.error('Error making DNC request:', error);
                                        res.status(500).send('Error making DNC request');
                                        return;
                                    }
                                    //console.log('DNC request successful');
                                });
                            }
                        });
                    }

                    let str = '';
                    if (output.campaign_type.toUpperCase() === 'AB' && (output.calltype.toUpperCase() === 'IB' || output.calltype.toUpperCase() === 'OB')) {
                        str = `, assigned_to = '${output.agent}'`;
                    }

                    const agentDispositionQuery = `SELECT disposition, is_fwd FROM agent_campaign_disposition_map WHERE client_id='${code}' AND user_id='${output.agent}' AND campaign_id='${output.campaign}'`;
                    database.query(agentDispositionQuery, (err, result) => {
                        if (err) {
                            console.error('Database query error:', err);
                            return;
                        }

                        result.forEach(row => {
                            if (row.disposition.toLowerCase() === output.disposition.replace('_', ' ').toLowerCase()) {
                                str = row.is_fwd === 1 ? ', assigned_to = ""' : `, assigned_to = '${output.agent}'`;
                            }
                        });

                        const dialQuery = `SELECT dfid FROM crm_config WHERE dial=1 AND campaign='${output.campaign}' AND client_id='${code}' LIMIT 3`;
                        database.query(dialQuery, (err, result) => {
                            if (err) {
                                console.error('Database query error:', err);
                                return;
                            }

                            result.forEach((row, index) => {

                                //str += `, phone${index + 1}='${output['f' + row.dfid]}'`;
                                str += `, phone${index + 1}='${output['f' + row.dfid] !== undefined ? output['f' + row.dfid] : ''}'`;

                                //console.log("updatecrmphone= "+str);
                            });

                            output.sub_disposition = output.sub_disposition || 'NO SUBDISPOSITION';

                            const customFieldsQuery = customFields.map(field => {
                                let value = output[field];
                                if (Array.isArray(value)) {
                                    value = value.join(',');
                                }
                                return `${field}='${value}'`;
                            }).join(', ');
                            //console.log(output);
                           // console.log(output.attempt);
                            if (output.attempt && output.attempt == 0) {
                                var updateQuery = `UPDATE crm_data SET cdate = NOW(), agent_disp='${output.agent_disp}',agent_sub_disposition='${output.agent_sub_disposition}',agent='${output.agent}',rid='${output.rid}', calltype='${output.calltype}' ${str}, ${customFieldsQuery} WHERE id='${output.dataid}' AND client_id='${code}'`;

                            } else {

                                var updateQuery = `UPDATE crm_data SET cdate = NOW(), agent_disp='${output.agent_disp}',agent_sub_disposition='${output.agent_sub_disposition}',agent='${output.agent}', agent_attempt=agent_attempt+1, rid='${output.rid}', calltype='${output.calltype}' ${str}, ${customFieldsQuery} WHERE id='${output.dataid}' AND client_id='${code}'`;

                            }
                            //console.log("crm data updateQuery= " + updateQuery);



                            client_database.query(updateQuery, (err, result) => {
                                if (err) {
                                    console.error('Database query error:', err);
                                    return;
                                }

                                if (result.affectedRows > 0) {
                                    res.send(`true||${dispositionStr}`);
                                } else {
                                    res.send("Error: Can't Update the CRM.");
                                }
                            });
                        });
                    });
                });
            });
        } else {
            res.send('Error: Dataid not found');
        }
    }
});


function getChildren(parent, code, campaign, agent, callback) {
    const query1 = `
        SELECT cc.* 
        FROM crm_config cc 
        JOIN agent_crm_field_map acfm 
        ON cc.campaign = acfm.campaign_id 
        AND cc.client_id = acfm.client_id 
        AND cc.dfid = acfm.dfid 
        WHERE cc.campaign = ? 
        AND cc.client_id = ? 
        AND cc.parentElement = ? 
        AND acfm.user_id = ? 
        ORDER BY cc.fid`;

    database.query(query1, [campaign, code, parent, agent], (err, result1) => {
        if (err) {
            return callback(err);
        }

        if (result1.length === 0) {
            const query2 = `
                SELECT * 
                FROM crm_config 
                WHERE parentElement = ? 
                AND campaign = ? 
                AND client_id = ?`;

            database.query(query2, [parent, campaign, code], (err, result2) => {
                if (err) {
                    return callback(err);
                }

                processResults(result2, code, campaign, agent, callback);
            });
        } else {
            processResults(result1, code, campaign, agent, callback);
        }
    });
}

function processResults(results, code, campaign, agent, callback) {
    let children = [];

    if (results.length > 0) {
        let processedCount = 0;

        results.forEach((row, index) => {
            children.push(row.dfid);

            getChildren(row.fcaption, code, campaign, agent, (err, childResults) => {
                if (err) {
                    return callback(err);
                }

                children = children.concat(childResults.split(","));
                processedCount++;

                if (processedCount === results.length) {
                    callback(null, children.join(","));
                }
            });
        });
    } else {
        callback(null, "");
    }
}


router.get('/api/get-children', (req, res) => {
    const { parent, code, campaign, agent } = req.query;

    getChildren(parent, code, campaign, agent, (err, children) => {
        if (err) {
            return res.status(500).send('Error retrieving children');
        }

        res.json({ children: children.split(",") });
    });
});

router.get('/api/get-parent-dfid', (req, res) => {
    const { parent, code, campaign, agent } = req.query;

    // SQL query to fetch parent DFID
    const sql = `
        SELECT cc.dfid
        FROM crm_config cc
        JOIN agent_crm_field_map acfm ON cc.campaign = acfm.campaign_id
            AND cc.client_id = acfm.client_id AND cc.dfid = acfm.dfid
        WHERE cc.campaign = ? AND cc.client_id = ? AND cc.fcaption = ?
            AND acfm.user_id = ?
        ORDER BY cc.fid
    `;

    database.query(sql, [campaign, code, parent, agent], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            return;
        }

        if (results.length === 0) {
            // If no results found, fetch DFID from crm_config directly
            const sqlFallback = `
                SELECT dfid
                FROM crm_config
                WHERE fcaption = ? AND client_id = ? AND campaign = ?
            `;

            database.query(sqlFallback, [parent, code, campaign], (err, resultsFallback) => {
                if (err) {
                    console.error('Error executing fallback query:', err);
                    return;
                }

                if (resultsFallback.length === 0) {
                    //res.status(404).json({ error: 'Parent DFID not found' });
                } else {
                    const parentDfid = resultsFallback[0].dfid;
                    res.json({ parentDfid });
                }
            });
        } else {
            const parentDfid = results[0].dfid;
            res.json({ parentDfid });
        }
    });
});
/*end crm route by udit- 27 june- 2024*/


router.get('/update-disposition-url-action', async (req, res) => {
    const intData = parseInt(req.query.intData); // Assuming intData is an integer in the query parameters
    let strDisposition = req.query.strDisposition;

    let phone = req.query.phone;
    let CRMLeadId = req.query.leadid;
    let campaign = req.query.campaign;
    let dataid = req.query.dataid;
    let code = req.query.code;
    let user_id = req.query.user_id;
    let RecordID = req.query.rid;

    var data_serilize = "f1=Udit11&f2=RY987654&f3=9897654312&f4=udit%40ggmail.in&f5=Delhi%20%2C%20kHANPUR%2C%20iNDIA-%20789653&f6=Kalka%20Ji&f7=Delhi&f8=Male&f9=23&dataid=98&campaign=demoptl&phone=8130939878&leadid=DEMOPTL_MANUAL&rid=fef&agent=udit&processType=&code=3181&redial=&calltype=&campaign_type=&sip_id=&priview_id=&auto_att=0&f10=Test%201&f11=we3&f12=galaxy123&f13=test2&f14=2024-07-24T15%3A49&f15%5B%5D=Yes&f16=&f18=&f19=&f20=&f21=pakistan&f22=lahore&f23=2024-07-24T12%3A45&f24=ind&f25=ind2";
    const output = {};

    try {
        // Validate input
        if (!phone || phone.length <= 5) {
            res.status(400).json({ message: 'Invalid phone number' });
            return;
        }

        // Initial variable declarations
        let strParam;
        let strFieldList;
        let strFName;
        let StrFinalUrl;
        /*code check for crm_mode as well as crm_status start*/
        const sql = `
      SELECT crm_status, webcrm, webscript_parameter
      FROM campaign
      WHERE name = ? AND client_id = ?`;

        database.query(sql, [campaign, code], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ message: 'Database query error' });
                return;
            }
            if (result.length === 0) {
                res.status(404).json({ message: 'Campaign not found' });
                return;
            }

            const { crm_status, webcrm, webscript_parameter } = result[0];

            if (crm_status === 1 || webcrm === 1) {
                res.status(200).json({ message: 'CRM status or WebCRM is active' });
                return;
            }
        });
        /*code check for crm_mode as well as crm_status end*/

        /*code for get url from campaign_map start*/
        const sql1 = `
      SELECT disp_url, 	url_method,	url_headerdata, url_data, custom_fields
      FROM campaign_url_map
      WHERE campaign_name = ? AND client_id = ?`;


        database.query(sql1, [campaign, code], async (err, result1) => {

            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ message: 'Database query error' });
                return;
            }
            var Campaign_DISP_URL = result1[0].disp_url || '';
            var Campaign_DISP_URL_Method = result1[0].url_method || '';
            var Campaign_DISP_HeaderData = result1[0].url_headerdata || '';
            var Campaign_DISP_URLDATA = result1[0].url_data || '';
            var Campaign_Custom_Fields = result1[0].custom_fields || '';

            if (Campaign_DISP_URL.length > 5) {
                strParam = Campaign_DISP_URL.split("?");
                if (strParam.length === 2) {
                    strFinalUrl = strParam[0] + "?";
                    const strMasterFields = strParam[1].split("&");
                    let promises = strMasterFields.map(async (field) => {
                        const strFieldList = field.split("=");
                        let strFName = strFieldList[0];
                        strFinalUrl += strFieldList[1].length < 1 ? strFieldList[0] + "=" : strFieldList[1] + "=";
                        if (strFName === 'phone') {
                            strFinalUrl += phone + "&";
                        } else {
                            const adfid = await getCRMData(campaign, code, strFName);
                            if (adfid) {
                                const fieldId = 'f' + adfid;

                                let output = {};
                                data_serilize.split('&').forEach(pair => {
                                    const [key, value] = pair.split('=');
                                    const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));
                                    const decodedValue = decodeURIComponent(value.replace(/\+/g, ' '));

                                    if (decodedKey.endsWith('[]')) {
                                        const baseKey = decodedKey.slice(0, -2);
                                        if (!output[baseKey]) {
                                            output[baseKey] = [];
                                        }
                                        output[baseKey].push(decodedValue);
                                    } else {
                                        output[decodedKey] = decodedValue;
                                    }
                                });

                                strFinalUrl += encodeURIComponent(output[fieldId]) + "&";
                            }
                        }

                    });

                    await Promise.all(promises);
                } else {
                    strFinalUrl = Campaign_DISP_URL;
                }
                if (!CRMLeadId) CRMLeadId = `${campaign}_MANUAL`;

                var URL_STATUS = 0;

                // Construct the SQL query
                const insertQuery = `
			  INSERT INTO url_response (
				agent, url_data, url_time, campaign, lead_id, phone, client_id, 
				mapped_fields, rid, request_method, headerfield, disposition, 
				url_status, custom_fields
			  ) 
			  VALUES (?, ?, sysdate(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
			`;

                // Define the values to insert
                const values = [
                    user_id, strFinalUrl, campaign, CRMLeadId, phone,
                    code, Campaign_DISP_URLDATA, RecordID, Campaign_DISP_URL_Method,
                    Campaign_DISP_HeaderData, strDisposition, URL_STATUS, Campaign_Custom_Fields
                ];

                // Execute the query
                database.query(insertQuery, values, (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        // Handle the error as needed
                    } else {
                        //console.log('Insert successful:', results);
                        // Handle the results as needed
                    }
                });
            } else {
                async function main() {
                    try {
                        const results = await getfinal_result(code, user_id, campaign);
                        for (let i = 0; i < results.length; i++) {
                            if (results[i].disposition_id.toLowerCase() === strDisposition.toLowerCase()) {
                                var Campaign_DISP_URL = results[i].disposition_url || '';
                                var Campaign_DISP_URL_Method = results[i].request_method || '';
                                var Campaign_DISP_HeaderData = results[i].headerfield || '';
                                var Campaign_DISP_URLDATA = results[i].disposition_fields || '';
                                var Campaign_Custom_Fields = results[i].custom_fields || '';

                                strParam = Campaign_DISP_URL.split("?");
                                if (strParam.length === 2) {
                                    strFinalUrl = strParam[0] + "?";
                                    const strMasterFields = strParam[1].split("&");
                                    let promises = strMasterFields.map(async (field) => {
                                        const strFieldList = field.split("=");
                                        let strFName = strFieldList[0];
                                        strFinalUrl += strFieldList[1].length < 1 ? strFieldList[0] + "=" : strFieldList[1] + "=";
                                        if (strFName === 'phone') {
                                            strFinalUrl += phone + "&";
                                        } else {
                                            const adfid = await getCRMData(campaign, code, strFName);
                                            if (adfid) {
                                                const fieldId = 'f' + adfid;

                                                let output = {};
                                                data_serilize.split('&').forEach(pair => {
                                                    const [key, value] = pair.split('=');
                                                    const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));
                                                    const decodedValue = decodeURIComponent(value.replace(/\+/g, ' '));

                                                    if (decodedKey.endsWith('[]')) {
                                                        const baseKey = decodedKey.slice(0, -2);
                                                        if (!output[baseKey]) {
                                                            output[baseKey] = [];
                                                        }
                                                        output[baseKey].push(decodedValue);
                                                    } else {
                                                        output[decodedKey] = decodedValue;
                                                    }
                                                });

                                                strFinalUrl += encodeURIComponent(output[fieldId]) + "&";
                                            }
                                        }

                                    });

                                    await Promise.all(promises);
                                } else {
                                    strFinalUrl = Campaign_DISP_URL;
                                }
                                if (!CRMLeadId) CRMLeadId = `${campaign}_MANUAL`;

                                var URL_STATUS = 0;

                                // Construct the SQL query
                                const insertQuery = `
							  INSERT INTO url_response (
								agent, url_data, url_time, campaign, lead_id, phone, client_id, 
								mapped_fields, rid, request_method, headerfield, disposition, 
								url_status, custom_fields
							  ) 
							  VALUES (?, ?, sysdate(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
							`;

                                // Define the values to insert
                                const values = [
                                    user_id, strFinalUrl, campaign, CRMLeadId, phone,
                                    code, Campaign_DISP_URLDATA, RecordID, Campaign_DISP_URL_Method,
                                    Campaign_DISP_HeaderData, strDisposition, URL_STATUS, Campaign_Custom_Fields
                                ];

                                // Execute the query
                                database.query(insertQuery, values, (err, results) => {
                                    if (err) {
                                        console.error('Error executing query:', err);
                                        // Handle the error as needed
                                    } else {
                                        //console.log('Insert successful:', results);
                                        // Handle the results as needed
                                    }
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Error in main function:', error);
                    }
                }

                main();

            }

        });

        /*code for get url from campaign_map end*/



        res.status(200).json({ message: 'Success' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Example usage in an Express route handler
async function getCRMData(campaignName, code, arr) {
    try {
        // Prepare the SQL query
        const sql = `
      SELECT dfid
      FROM crm_config
      WHERE campaign = ? 
        AND client_id = ?
        AND LOWER(fcaption) = LOWER(?)
    `;

        const query = util.promisify(database.query).bind(database);

        // Execute the query with sanitized inputs
        const [rows, fields] = await query(sql, [campaignName, code, arr]);
        return rows.dfid;

    } catch (error) {
        console.error('Error fetching dfid:', error);
        throw error; // Handle or throw the error as per your application's error handling strategy
    }
}

async function getfinal_result(code, user_id, campaign) {

    const query = util.promisify(database.query).bind(database);
    var fresults;
    var sqlQuery = `
			  SELECT 
				acd.disposition, 
				acd.is_fwd,
				cdm.disposition_url, 
				cdm.disposition_fields,
				cdm.disposition_id,		
				m.is_callback, 
				m.is_whatsapp, 
				cdm.request_method, 
				cdm.headerfield, 
				cdm.custom_fields, 
				m.is_dnd 
			  FROM 
				agent_campaign_disposition_map acd 
			  LEFT JOIN 
				campaign_disposition_map cdm 
				ON acd.client_id = cdm.client_id 
				AND acd.disposition = cdm.disposition_id 
				AND acd.campaign_id = cdm.campaign_id 
			  LEFT JOIN 
				disposition_master m 
				ON cdm.disposition_id = m.name 
				AND cdm.client_id = m.client_id 
			  WHERE 
				acd.client_id = ? 
				AND acd.user_id = ? 
				AND acd.campaign_id = ? 
			  LIMIT 500
			`;
    const results1 = await query(sqlQuery, [code, user_id, campaign]);

    if (results1.length > 0) {
        fresults = results1;
    } else {
        var sqlQuery = `
								  SELECT 
									cd.disposition_id, 
									cd.disposition_url, 
									cd.disposition_fields, 
									m.is_callback, 
									m.is_whatsapp, 
									cd.request_method, 
									cd.headerfield, 
									cd.custom_fields, 
									m.is_dnd 
								  FROM 
									campaign_disposition_map cd 
								  LEFT JOIN 
									disposition_master m 
									ON cd.disposition_id = m.name 
									AND cd.client_id = m.client_id 
								  WHERE 
									cd.client_id = ? 
									AND cd.campaign_id = ? 
								  GROUP BY 
									cd.disposition_id
								`;

        // Execute the query
        const results2 = await query(sqlQuery, [code, campaign]);

        fresults = results2;

    }
    return fresults;

}

router.get('/update-disposition-url', async (req, res) => {
    const intData = parseInt(req.query.intData); // Assuming intData is an integer in the query parameters
    let strDispostion = req.query.strDispostion.toUpperCase();
    let phone = req.query.phone;
    let campaign = req.query.campaign;
    let dataid = req.query.dataid;
    let code = req.query.code;

    try {
        const result = await database.query(
            'SELECT disposition_url, disposition_fields, request_method, headerfield ' +
            'FROM campaign_disposition_map ' +
            'WHERE client_id = ? AND UPPER(campaign_id) = ?  AND UPPER(disposition_id) = ?',
            [
                escape(code),
                escape(campaign.toUpperCase()),
                escape(strDispostion.replace("_", "").toUpperCase())
            ]
        );

        const rows = result[0]; // Assuming the result is an array with the first element containing the rows

        if (rows && rows.length > 0) {
            const row = rows[0];
            const { disposition_url: url, disposition_fields: field, request_method: method, headerfield } = row;
            const mainArray = [];

            let [baseurl, urlArray] = url.split("?");
            urlArray = urlArray && urlArray.length ? urlArray : "";

            if (urlArray.length > 0) {
                const params = urlArray.split("&");

                for (const arr of params) {
                    if (arr === "phone=") {
                        mainArray.push(arr + encodeURIComponent(output.phone));
                    } else {
                        const [resc] = await database.query(
                            'SELECT dfid ' +
                            'FROM crm_config ' +
                            'WHERE campaign = ? AND client_id = ? AND LOWER(fcaption) = ?',
                            [
                                escape(campaign),
                                escape(code),
                                escape(arr.replace("=", "").replace("_", " ").toLowerCase())
                            ]
                        );

                        if (resc && resc.length > 0) {
                            const resw = resc[0];
                            mainArray.push(arr + encodeURIComponent(output[`f${resw.dfid}`]));
                        } else {
                            mainArray.push(arr);
                        }
                    }
                }
            }

            let finalUrl = baseurl;
            if (mainArray.length > 0) {
                finalUrl += "?" + mainArray.join("&");
            }

            var CRMLeadId = '';
            if (!CRMLeadId) CRMLeadId = `${campaign}_MANUAL`;

            const insertArray = {
                agent: output.agent,
                url_data: finalUrl,
                request_method: method,
                campaign: campaign,
                lead_id: CRMLeadId,
                client_id: code,
                phone: output.phone,
                rid: output.rid,
                headerfield,
                mapped_fields: field
            };

            //console.log(insertArray);

            await database.query(
                'INSERT INTO url_response ' +
                '(agent, url_data, request_method, campaign, lead_id, client_id, phone, rid, headerfield, mapped_fields, url_time) ' +
                'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_ADD(SYSDATE(), INTERVAL 1 MINUTE))',
                [
                    insertArray.agent, insertArray.url_data, insertArray.request_method, insertArray.campaign,
                    insertArray.lead_id, insertArray.client_id, insertArray.phone, insertArray.rid,
                    insertArray.headerfield, insertArray.mapped_fields
                ]
            );

            res.status(200).send('Success');
        } else {
            res.status(200).send('No data found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


module.exports = router;
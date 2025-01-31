/*** new code for Alok */
function agent_blindtransfer() {
    let lineNum = getLocalVariable('Webrtc_dialline');
    let NumberToDial = getLocalVariable('NumberToDial');
    let dialpad_transfer = $("#dialpad_transfer").val();
    let dialpad_number = dialpad_transfer.split('-');
    let dial_number = dialpad_number[1];
    if (!(getLocalVariable('isLineBusy') == 'ONCALL' || getLocalVariable('isLineBusy') == 'HOLD' || getLocalVariable('isLineBusy') == 'MUTE')) {
        alertify.error("No Active Calls");
        logEntry("No Active Calls for agent blind transfer");
        return false;
    }
    else if (NumberToDial != '') {
        BlindTransfer(lineNum, dial_number);
    } else {
        alertify.error("First, we will connect the call and then transfer it.");
    }

}
async function agent_attendedtransfer() {
    try {
        let lineNum = getLocalVariable('Webrtc_dialline');
        let NumberToDial = getLocalVariable('NumberToDial');
        let dialpad_transfer = $("#dialpad_transfer").val();
        let dialpad_number = dialpad_transfer.split('-');
        let dial_number = dialpad_number[1];
        if (!(getLocalVariable('isLineBusy') == 'ONCALL' || getLocalVariable('isLineBusy') == 'HOLD' || getLocalVariable('isLineBusy') == 'MUTE')) {
            alertify.error("No Active Calls for agent attended transfer");
            logEntry("No Active Calls");
            return false;
        }
        else if (NumberToDial !== '') {
            await AttendedTransfer(lineNum, dial_number);
            $('#agent_attendedtransfer').css("display", "none");
            $('#agent_completeattended_transfer').css("display", "block");
        } else {
            alertify.error("First, we will connect the call and then transfer it.");
        }
    } catch (error) {
        console.error("Error during attended transfer:", error);
        alertify.error("There was an error during the transfer. Please try again.");
    }
}

function load_agent() {
    let data_record={CampaignName:getLocalVariable('CampaignName'),USER_ID:getLocalVariable('USER_ID'),SERVER_IP:getLocalVariable('SERVER_IP'),ClientID:getLocalVariable('ClientID')};
    $.ajax({
        url: '/transfer-list',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data_record),
        success: function(result) {
          if (result.ok == true) {
            $("#dialpad_transfer").html(result.list);
          } else {
            alertify.error("No record");
          }
        },
        error: function(error) {
            alertify.error("No record");
        }
        });
}

function skillqueuelist() {
    var count = 0;
    if (websocketConnected == 1 && getLocalVariable('crm_skill_queue') != 'undefined') {
        var crm_skill_queue = getLocalVariable('crm_skill_queue');
        jsonString = crm_skill_queue.replace(/'/g, '"');
        var label = JSON.parse(jsonString);
        for (var l in label) {
            count = label[l]++;
        }
        console.log("crm_skill_queue count" + count);
        $('#crm_skill_queue').html(count);
    } else {
        $('#crm_skill_queue').html(count);
    }
}
function skill_transfer_call() {
    let lineNum = getLocalVariable('Webrtc_dialline');
    let NumberToDial = getLocalVariable('NumberToDial');
    let skil_trasfer_list = $("#skil_trasfer_list").val();
    let dialpad_campaign = $("#dialpad_campaign").val();
    if (!(getLocalVariable('isLineBusy') == 'ONCALL' || getLocalVariable('isLineBusy') == 'HOLD' || getLocalVariable('isLineBusy') == 'MUTE')) {
        alertify.error("No Active Calls");
        logEntry("No Active Calls for skill transfer call");
        return false;
    }
    else if (skil_trasfer_list == '' && skil_trasfer_list.length === 0) {
        alertify.error("Please select skill");
        return false;
    }
    else if (dialpad_campaign == '' && dialpad_campaign.length === 0) {
        alertify.error("Please select campaign");
        return false;
    }
    //alert("skill_transfer_call= lineNum= "+lineNum+" NumberToDial= "+NumberToDial+" skil_trasfer_list= "+skil_trasfer_list+" dialpad_campaign= "+dialpad_campaign);
   else if (NumberToDial != '') {
        alertify.confirm("Want to Transfer in Skill " + skil_trasfer_list, function (e) {
            if (e) {
                skillTransfer(lineNum, NumberToDial, dialpad_campaign, skil_trasfer_list);
            }
        });

    } else {
        alertify.error("First, we will connect the call and then transfer it.");
    }

}

function queue_transfer_call() {
    let lineNum = getLocalVariable('Webrtc_dialline');
    let NumberToDial = getLocalVariable('NumberToDial');
    let queue_arr = $("#queue_trasfer_list").val();
    let queue_new = queue_arr.split('~');
    let queue_name = queue_new[0];
    let queue_priority = queue_new[1];
    let dialpad_campaign = $("#dialpad_campaign").val();
    if (!(getLocalVariable('isLineBusy') == 'ONCALL' || getLocalVariable('isLineBusy') == 'HOLD' || getLocalVariable('isLineBusy') == 'MUTE')) {
        alertify.error("No Active Calls");
        logEntry("No Active Calls for Queue Transfer");
        return false;
    }
    else if (queue_arr == '' && queue_arr.length === 0) {
        alertify.error("Please select queue");
        return false;
    }
    else if (NumberToDial != '') {
        alertify.confirm("Want to Transfer in Queue " + queue_name, function (e) {
            if (e) {
                QueueTransfer(lineNum, NumberToDial, dialpad_campaign, queue_priority, queue_name);
            }
        });

    } else {
        alertify.error("First, we will connect the call and then transfer it.");
    }

}
function redial_disposition_save() {
    var Campaign_name = window.localStorage.getItem('CampaignName');
    var sip_id = window.localStorage.getItem('SIP_ID');
    var client_id = window.localStorage.getItem('ClientID');
    var lead_id = Campaign_name.toUpperCase() + "_MANUAL";
    var rid = getLocalVariable('RecordID');
    var did = window.localStorage.getItem('CRMDataID');
    var skill = getLocalVariable('crm_skill');
    var disp = 'REDIAL';
    var sub_disp = '';
    var remarks = $('#remarks').val();
    var jsonsave = { did: did, lead_id: lead_id, remarks: remarks, disposition: disp, sub_disp: sub_disp, rid: rid, sip_id: sip_id, client_id: client_id, skill: skill };
    console.log("autosave dispose= " + JSON.stringify(jsonsave));
    $.ajax({
        url: "/api_calling/save_disposition_data",
        method: "POST",
        data: jsonsave,
        dataType: "JSON",
        success: function (dispose_result) {
            if (dispose_result.status == true) {
                console.log("Redial insert");
            }
        }
    });

}

/**** callback  */

//Callback Popup Start
function Callback_sch(id,scheduledate='') {
    $("#recall_id").val(id);
    $("#schedule_calldate").val(scheduledate);
    $('#callbackschModalSch').css('display', 'flex');
}
function Callback_d(id) {
    $("#callback_recall_id").val(id);
    var logField = JSON.parse(getLocalVariable('Log_Data_Field'));
    $.ajax({
        url: 'callback_log_details',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id: id,
            Log_Data_Field: logField,
            ClientID: getLocalVariable('ClientID')
        }),
        success: function (result) {
            $("#callback_logid").html(result);
        },
        error: function () {
            alertify.error("An error occurred while processing your request.");
        }
    });
    $('#callbackdModalD').css('display', 'flex');
}
function Callback_s(id) {

    $('#callbacksModalS').css('display', 'flex');
}
function Callback_h(id) {
    var logField = JSON.parse(getLocalVariable('Log_Data_Field'));
    $.ajax({
        url: 'callback_history_log',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id: id,
            Log_Data_Field: logField,
            ClientID: getLocalVariable('ClientID'),
            campaign_name: getLocalVariable('CampaignName')
        }),
        success: function (result) {
            $("#callback_historylog").html(result);
        },
        error: function () {
            alertify.error("An error occurred while processing your request.");
        }
    });
    $('#callbackhModalH').css('display', 'flex');
}
/*** whatapp load */
function showWhatapp(phone_number = '') {

    $('#myTab a[href="#profile"]').tab('show');
    $('#interaction_myTab a[href="#whatsapp_tab"]').tab('show');
    var Whatsapp = getLocalVariable('Whatsapp');
    var new_phone_number = $("#whatsp_number").val();
    if(phone_number=='' && new_phone_number!='')
    {
         phone_number=new_phone_number;
    }
    else if(phone_number=='' && new_phone_number=='')
    {
        phone_number=getLocalVariable('NumberToDial');
        $("#whatsp_number").val(phone_number);
    }
    var remove_element = document.getElementById("Whatsap-tab");
    remove_element.classList.remove("green_mode");
    var whatsapp_business_number = getLocalVariable('whatsapp_business_number');
        whatsapp_business_number = whatsapp_business_number.slice(-10);
        phone_number = phone_number.slice(-10);
    if (Whatsapp != '1') {
        alertify.error("Access denied...!");
        return false;
    }
    else if (whatsapp_business_number == '') {
        alertify.error("This campaign does not have an assigned WhatsApp Business number");
        return false;
    } else {
       // var json_data = { phone_number: phone_number };
        $("#whatsp_number").val(phone_number);
        if (phone_number === '') {
            alertify.error("Phone Number can not be blank");
            return false;
        }
        const base_wp_url=what_chat_url+"/"+whatsapp_business_number+"/"+phone_number;
        console.log(" wp frame= "+base_wp_url);
        const iframe = document.getElementById("dynamicwpiframe");
        iframe.src = base_wp_url; // Replace with your URL
        iframe.style.display = "block"; // Make iframe visible
        
       /* $.ajax({
            url: "/whatsapp", type: 'POST', data: json_data, success: function (result) {
                //alert(result);
                $("#show_what_data").html(result);
                load_wh_fetchData();
            }
        });*/
    }

}
function load_wh_fetchData() {
    const businessNumber = getLocalVariable('whatsapp_business_number');
    const custNumber = $('#cust_number').val();
    const msgStatus = 'read';
    const $currentContent = $("#chat_res");
    const $currentLen = $currentContent.children().length;

    if (custNumber !== '') {
        $.ajax({
            type: 'POST',
            url: 'wa_loadchat',
            data: {
                phone_number: custNumber,
                business_number: businessNumber,
                msg_status: msgStatus
            },
            success: function (response, textStatus, xhr) {
                if (xhr.status === 200) {
                    // Only execute if the response status code is 200

                    // Replace the content only if it's different
                    const newContentLen = $(response).children().length;
                    if ($currentLen !== newContentLen) {
                        $("#chat_res").html(response);

                        // Trigger the input event to handle the value of #allow_chat
                        $('#allow_chat').trigger('input');

                        // Scroll to the bottom of the conversation container
                        $(".conversation-container").animate({
                            scrollTop: $(".conversation-container").prop('scrollHeight')
                        }, "fast");

                        // Call a function after success or set a timeout
                        onSuccess(); // Call your function here
                    }
                }
            },
            error: function (xhr, status, error) {
                console.error("Error loading chat data:", status, error);
            }
        });
    }

    // Initial trigger to set the state based on #allow_chat value
    $('#allow_chat').trigger('input');
}

async function what_business_number() {
    try {
        var campaign_name = window.localStorage.getItem('CampaignName');
        var client_id = window.localStorage.getItem('ClientID');
        var json_data = { client_id: client_id, campaign_name: campaign_name };

        let dispose_result = await $.ajax({
            url: "/wa_number",
            method: "POST",
            data: json_data,
            dataType: "JSON"
        });
        if (dispose_result.status == true) {
            localStorage.setItem("whatsapp_business_number", dispose_result.whatsapp_business_number);
        } else {
            localStorage.setItem("whatsapp_business_number", "");
        }
    } catch (error) {
        localStorage.setItem("whatsapp_business_number", "");
    }
}
function route_credentials() {
    var client_id = window.localStorage.getItem('ClientID');
    var jsonsave = { client_id: client_id };
    logEntry("Call Route credentials");
    $.ajax({
        url: "/route_permission",
        method: "POST",
        data: jsonsave,
        dataType: "JSON",
        success: function (route_result) {
            localStorage.setItem("route_permission", route_result.route_permission);
            localStorage.setItem("decision_tree_permission", route_result.decision_tree_permission);
            localStorage.setItem("ticket_permission", route_result.ticket_permission);
            if (route_result.status == true) {
                if (route_result.route_permission == 1) {
                    $("#route_btn").show();
                } else {
                    $("#route_btn").hide();
                }
                if (route_result.decision_tree_permission == 1) {
                    $("#decision_auth").show();
                } else {
                    $("#decision_auth").hide();
                }
                if (route_result.ticket_permission == 1) {
                    $("#tickets_auth").show();
                } else {
                    $("#tickets_auth").hide();
                }
            } else {
                $("#route_btn").hide();
            }
        }
    });
}

function all_calllog(dataid='') {
    $('#myTab a[href="#profile"]').tab('show');
    $('#interaction_myTab a[href="#summary"]').tab('show');
    var intr;
    var username = getLocalVariable('USER_ID');
    var client_id = getLocalVariable('ClientID');
    var campaign = getLocalVariable('CampaignName');
    var CRMDataID = getLocalVariable('CRMDataID');
    if(dataid != '' && CRMDataID != '')
    {
        $('#all_summary_data_id').val(dataid);
    }
    else if(dataid == '' && CRMDataID != '')
    {
        $('#all_summary_data_id').val(CRMDataID);
    }

    intr = (dataid != '') ? dataid : $('#all_summary_data_id').val();
    
    if(intr==''){
        alertify.error("data id blank...!");
        $("#show_all_summary").html('');
        return false;
    }
    $.ajax({
        method: 'POST',
        url: '/all_call_log',
        data: { username:username,client_id:client_id,campaign:campaign,intr:intr },
        success: function (response) {
            //alert(response);
            $("#show_all_summary").html(response);
        }
    });
    
}
/******skill listing******* */
function campaign_skill_list(client_id,to_campaign)
{
    var data_record = { client_id: client_id, campaign_name: to_campaign };
    $.post("/skill_list", data_record, function (result) {
      var jsonData = result.data;
      var str='';
      str += '<option value="">Select skill</option>';
      if(result.status=='true' || result.status==true)
      {
        $.each(jsonData, function (key, value) {
          str +=
            "<option value='" + value.skill + "'>" + value.skill + "</option>";
        });
      }
      $("#skil_trasfer_list").html(str);
      
    });
}
/*********** show reschedule call */

function show_reschedule(recall_id,dataid,callback_datetime)
{
    $("#reschedule_recall_id").val(recall_id);
    $("#re_schedule_calldate").val(callback_datetime);
    $("#reschedule_data_id").val(dataid);
}
async function save_reschedule_data()
{
    
    var client_id = getLocalVariable('ClientID');
    var recall_id = $('#reschedule_recall_id').val();
    var schedule_calldate = $('#re_schedule_calldate').val();
    let response = await fetch('/current_dbdatetime', {method: 'GET'});
    let cam_result = await response.json();
    var datetime1 = new Date(cam_result.msg);
    var datetime2 = new Date(schedule_calldate);
    if(schedule_calldate=='' || recall_id=='')
    {
        $("#err_re_schedule_calldate").css("display", "block");
        document.getElementById("re_schedule_calldate").style.border="1px solid red";
        document.getElementById("err_re_schedule_calldate").innerHTML = 'Please select re-schedule data...! ';
        //alertify.error("Please select re-schedule data...!");
        return false;
    }
    if (datetime1 > datetime2) {
        $("#err_re_schedule_calldate").css("display", "block");
        alertify.error('Callback Time is greater than Current Time and more than 2 minutes...!');
        document.getElementById("err_re_schedule_calldate").innerHTML = 'Callback Time is greater than Current Time and more than 2 minutes...! ';
        return false;
    } 
    $.ajax({
        url: "/save_schedulecallback",
        method: "POST",
        data: { recall_id: recall_id, client_id: client_id, schedule_calldate: schedule_calldate },
        dataType: "JSON",
        success: function (result) {
        if (result.ok == true) {
            $("#err_re_schedule_calldate").css("display", "none");
            document.getElementById("re_schedule_calldate").style.border="1px solid green";
            $("#re_schedule_calldate").val('');
            $("#bg_success").css("display", "block");
            $('#bg_success').html("Callback Re-Schedule Successfully !...");
            $("#bg_success").show("slow").delay(2000).hide("slow");
            $('#callback_count').html("");
            $('#next_callback').html("");
            $('#callback_phone').html("");
            setLocalVariable("callback_notify", "");
            alertify.success("Callback Re-Schedule Successfully !...");
            $("#Search_callback").click();  // This will trigger the click event
            return false;
        }
        }
    });
}
function show_recall_history() {
    var recall_id = $('#reschedule_data_id').val();
    var logField = JSON.parse(getLocalVariable('Log_Data_Field'));
    if(recall_id=='')
    {
        alertify.error("Please select callback data...!");
        return false;
    }
    $.ajax({
        url: 'callback_history_log',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            id: recall_id,
            Log_Data_Field: logField,
            ClientID: getLocalVariable('ClientID'),
            campaign_name: getLocalVariable('CampaignName')
        }),
        success: function (result) {
            $("#newrecall_history").html(result);
        },
        error: function () {
            alertify.error("An error occurred while processing your request.");
        }
    });
}
async function current_dbdate() {
    
    let current_datetime= await current_dbdate2();
    alert(current_datetime);
}

async function current_dbdate2() {
    
    let response = await fetch('/agent/test', {method: 'GET'});
    let cam_result = await response.json();
    return cam_result.msg;
    
}
/******Disposition Sms map data****************/
function disposition_map_smssend(disposition)
{
    logEntry("Call  disposition_map_smssend "+disposition);
    let campaign = getLocalVariable('CampaignName');
    let client_id = getLocalVariable('ClientID');
    let skill = getLocalVariable('crm_skill');
    let phone = getLocalVariable('NumberToDial');
    let agent = getLocalVariable('USER_ID');
    let json_data={ client_id: client_id, campaign_name: campaign, disposition: disposition, skill: skill };
    //alert(JSON.stringify(json_data));
    $.ajax({
        method: 'POST',
        url: '/disposition_sms_map',
        dataType: "JSON",
        data: json_data,
        success: function (response) {
            if(response.status==true)
            {
    
                let route = response.data_list[0].route_id;
                let template_id = response.data_list[0].template_id;
                let config_id = response.data_list[0].tiny_config_id;
                let url_to_tiny = response.data_list[0].url;
                let rid = getLocalVariable('RecordID');
                if (phone.length < 10) {
                    alertify.error('Please Enter 10 digits Phone No.');
                    return false;
                }
                $.ajax({
                    method: 'POST',
                    url: '/api_calling/save_sendsms',
                    dataType: "JSON",
                    data: { to: phone, mailbody: response.data_list[0].sms_text, clientID: client_id, campaign: campaign, agent: agent, 
                        route: route, template_id: template_id, config_id: config_id, url_to_tiny: url_to_tiny, rid: rid },
                    success: function (response1) {
                        alertify.success('SMS Send successfully!');
                    }
                });
                logEntry("Send sms by disposition_map_smssend= "+phone);
            }else
            {
                logEntry("No sms send "+phone);
            }
        }
    });

}
/***********transfer call count ****************** */
function update_transfer_data(transfer_count='') {
    let ModeDBId = getLocalVariable('ModeDBId');
    if(getLocalVariable('ModeDBId') == 'TQ' || getLocalVariable('ModeDBId') == 'CC')
    {
        return false;
    }
    if(transfer_count=='')
    {
        transfer_count = getLocalVariable('Transfer_Count');
    }
    $.ajax({
        url: 'count_transfercall',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ModeDBId:ModeDBId,transfer_count:transfer_count}),
        success: function (result) {
            alertify.success("Data update successfully...!");
            logEntry("Transfer call data updated");
        },
        error: function () {
            alertify.error("An error occurred while processing your request.");
            logEntry("Transfer call data not updated");
        }
    });
}

function update_confdata(Conference_Count='') {
    let ModeDBId = getLocalVariable('ModeDBId');
    if(getLocalVariable('ModeDBId') == 'TQ' || getLocalVariable('ModeDBId') == 'CC')
    {
        return false;
    }
    if(Conference_Count=='')
    {
        Conference_Count = getLocalVariable('Conference_Count');
    }
    $.ajax({
        url: 'count_confcall',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ModeDBId:ModeDBId,Conference_Count:Conference_Count}),
        success: function (result) {
            alertify.success("Data update successfully...!");
            logEntry("Conference Count data updated");
        },
        error: function () {
            alertify.error("An error occurred while processing your request.");
            logEntry("Conference Count not updated");
        }
    });
}
function calllog_report()
{
    $("#log_reports").show();
    $("#dashboard_view").hide();
    $("#review_reports").hide();
}
function show_dashboard_view()
{
    $("#dashboard_view").show();
    $("#log_reports").hide();
    $("#review_reports").hide();
}
/************Call Log Dialling************ */
function calllog_dialling(phone,data_id)
{
    if(phone != '' && data_id !='')
    {
        $("#dialText").val(phone);
        $("#dashboard_view").show();
        $("#log_reports").hide();
        logEntry("calllog_dialling= " + phone+ " AND data id "+data_id);
        DialByLine("audio","",phone,"","","MC",data_id);
    }
    
}

function toaster()
{
    toastr.options = {
        "closeButton": true,
        "progressBar": true,
        "positionClass": "toast-bottom-left",
        "preventDuplicates": true,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",  // The notification will auto-hide after 5000 milliseconds
        "extendedTimeOut": "1000",  // The notification will stay for an extra 1000 milliseconds on hover
    };

    toastr["info"]("Callback for other campaign");
}
/***Zone wise datechange by Alok*** */
function zonewise_datechange()
{
    let startdate = $('#start-date-disposition-search').val();
    let enddate = $('#end-date-disposition-search').val();
    let time_formate = $('#time_formate').val();
    $.ajax({
        url: "/api_calling/zone_wise_datetime",
        method: "POST",
        data: JSON.stringify({startdate:startdate,enddate:enddate,time_formate:time_formate}),
        dataType: "JSON",
        contentType: "application/json",
        success: function (result) {
          $('#start-date-disposition-search').val(result.converted_startdate);
          $('#end-date-disposition-search').val(result.converted_enddate);
        },
      });
}

function asterisk_url() {
    var view_asterisk_url = "https://"+astcontrolserver_url+":"+astsocketport+"/ws";
    console.log("Please Open view_asterisk_url" + view_asterisk_url);
    window.open(view_asterisk_url, "", "width=500,height=700");
}

function open_script22222() {
    alert("hello");
    var client_id = getLocalVariable('ClientID');
    var username = getLocalVariable('USER_ID');
    var NumberToDial = getLocalVariable('NumberToDial');
    var campaign = getLocalVariable('CampaignName');
    var RecordID = getLocalVariable('RecordID');
    var email = '';
    $('#dialer_script').show(1000);
    $('#dialer_script').prop('src','https://www.google.com');
    var view_asterisk_url = "https://"+astcontrolserver_url+":"+astsocketport+"/ws";
    console.log("Please Open view_asterisk_url" + view_asterisk_url);
    window.open(view_asterisk_url, "", "width=500,height=700");
}

function wpload_template()
{
    var client_id = getLocalVariable('ClientID');
    var campaign_name = getLocalVariable('CampaignName');
    var NumberToDial = getLocalVariable('NumberToDial');
    $('#wphoneTo').val(NumberToDial);
    
    $.ajax({
        url: "/whats_load_templates",
        method: "POST",
        data: JSON.stringify({
            campaign_name: campaign_name,
          client_id: client_id
        }),
        dataType: "JSON",
        contentType: "application/json",
        success: function (data) {
          $("#whatsapp_template").attr("disabled", false);
          $("#whatsapp_template")
            .empty()
            .append(
              '<option selected="selected" value="">Select Templates</option>'
            );
          if (data.status == true) {
            $.each(data.data, function (key, value) {
              $("#whatsapp_template").append(
                "<option value='"+value.id+"~"+value.route_id+"~"+value.template_id+"~"+value.skill+"'>" + value.whatsapp_name + "</option>"
              );
            });
          }
        },
      });
}

function wptemplate_view()
{
    var client_id = getLocalVariable('ClientID');
    var response = $('#whatsapp_template').val();
    /*****reset field***** */
    $('#wLang').val('');
    $('#wHeader').val('');
    $('#wutype').val('');
    $('#wBody').val('');
    $('#wUfile').html('');
    
    val = response.split("~");
    id=val[0];
    if (val.length == 0) {
        $('#wroute_id').val('');
        return;
    }
    $.ajax({
        url: "/selectWptemplate",
        method: "POST",
        data: JSON.stringify({id:id,client_id:client_id}),
        dataType: "JSON",
        contentType: "application/json",
        success: function (results) {
            new_result=results.data;
            $('#wroute_id').val(val[1]);
            $('#wBody').val(new_result.wBody);
            $('#wLang').val(new_result.wLang);
            $('#wHeader').val(new_result.wHeader);
            $('#wutype').val(new_result.wutype);
            $('#whatsapp_f').val(new_result.whatsapp_f);
            $('#wUfile').html(new_result.wUfile);
           $('#wtemplate_id').val(val[2]);
           $('#w_skill').val(val[3]);
           $('#clientIDwhatsapp').val(getLocalVariable('ClientID'));
           $('#wphoneTo').val(getLocalVariable('NumberToDial'));
        },
      });
}

function wptemplate_send()
{
    var whatsapp_template = $('#whatsapp_template').val();
    var client_id = getLocalVariable('ClientID');
    var WHATSAPP_COUNT = getLocalVariable('WHATSAPP_COUNT');
    var campaignName = getLocalVariable('CampaignName');
    var to = $('#wphoneTo').val();
    var wBody = $('#wBody').val();
    var route_id = $('#wroute_id').val();
    var template_id = $('#wtemplate_id').val();
    var skill = $('#w_skill').val();
    var rid = getLocalVariable('RecordID');
    var USER_ID = getLocalVariable('USER_ID');
    if(whatsapp_template==''){
        $("#err_whatsapp_template").show();
        $("#err_whatsapp_template").html("Please select templates");
        $("#whatsapp_template").css("border", "1px solid red");
        return false;
    }else
    {
        $("#err_whatsapp_template").hide();
        $("#whatsapp_template").css("border", "1px solid green");
    }
    if(to==''){
        $("#err_wphoneTo").show();
        $("#err_wphoneTo").html("Please enter mobile number");
        $("#wphoneTo").css("border", "1px solid red");
        return false;
    }else
    {
        $("#err_wphoneTo").hide();
        $("#wphoneTo").css("border", "1px solid green");
    }
    $.ajax({
        url: "/whatsapp_send_msg",
        method: "POST",
        data: JSON.stringify({ClientID:client_id,to:to,mailbody:wBody,WHATSAPP_COUNT:WHATSAPP_COUNT,campaign:campaignName,route_id:route_id,template_id:template_id,skill:skill,rid:rid,agent:USER_ID}),
        dataType: "JSON",
        contentType: "application/json",
        success: function (results) {
            if (results.status == true) {

                setLocalVariable("WHATSAPP_COUNT",results.whatsapp_count);
                alertify.success("Send message successfully");
                $('#whatsapp_template').val('');
                $('#wLang').val('');
                $('#wHeader').val('');
                $('#wutype').val('');
                $('#wBody').val('');
                $('#wUfile').html('');

            } else {
                alertify.error("Unable to send. Please try again later.");
            }
        },
      });
}
/**** Tree Disposition save Data*** */
function insert_tree_disposition() {
    let callback = 0;
    let callback_time ='';
    if ($("#callbackdate").val().length > 0) {
         dateString = $("#callbackdate").val();
         callback_time1 = dateString.replace("T", " ");
         callback_time = callback_time1+":00";
         callback = 1;
    }
    let client_id = getLocalVariable('ClientID');
    let agent = getLocalVariable('USER_ID');
    let campaign = getLocalVariable('CampaignName');
    let node_id = $('#tree_node_id').val();
    let rid = getLocalVariable('RecordID');
    let disposition_id =  $('#disposition').val();
    let sub_disposition_id =  $('#sub_disposition').val();
    let remarks =  $('#remarks').val();
    let phone = getLocalVariable('NumberToDial');
    let jsonsave = {client_id:client_id,agent:agent,campaign:campaign,node_id:node_id,rid:rid,disposition_id:disposition_id,sub_disposition_id:sub_disposition_id,remarks:remarks,callback:callback,callback_time:callback_time,phone:phone };
    logEntry("Call insert_tree_dispositions");
    $.ajax({
        url: "/insert_tree_disposition",
        method: "POST",
        data: jsonsave,
        dataType: "JSON",
        success: function (route_result) {
            if (route_result.status == true) {
                alertify.success("Disposition Save successfully");
            } else {
                alertify.error("Unable to save. Please try again later.");
            }
        }
    });
}
function reset_field(param='')
{
    if(param !='No')
    {
        dispose_show();
    }
    
    $('#whatsapp_template').val('');
    $('#dynamicwpiframe').hide();
    $("#whatsp_number").val('');
    $('#wLang').val('');
    $('#wHeader').val('');
    $('#wutype').val('');
    $('#wphoneTo').val('');
    $('#wBody').val('');
    $('#wUfile').html('');
    $('#div_tickets').html('');
    $('#show_decision_tree').html('');
    $('.audio-container').hide();
    setLocalVariable("callback_notify", '');
    $('#newchatview').hide();
    
}
function mini_dialpad(call_type='')
{
   /* if(call_type=='incoming_call')
    {
        $('#answer_call').show();
        $("#answer_call").css("display", "block"); 
    }
    $('.audio-container').show();
    */

}
function new_call_status(i)
{
 
    var call_status=getLocalVariable('isLineBusy');
    if(i==1)
    {
        lineNumber=window.localStorage.getItem('Webrtc_dialline');
        AnswerAudioCall(lineNumber);
        $("#answer_call").css("display", "none"); 
        alert("hello="+lineNumber);
    }
    else if(call_status=='DIALING' || call_status=='READY')
    {
        cancelSession('cs_call');
        $('.audio-container').hide();
        
    }else
    {
        lineNumber=window.localStorage.getItem('Webrtc_dialline');
        RejectCall(lineNumber);
        $('.audio-container').hide();
    }
    
}
/**************Page reload call************** */
function page_refresh_log()
{
    var client_id = getLocalVariable('ClientID');
    var AS_ID = getLocalVariable('AS_ID');
    var CampaignName = getLocalVariable('CampaignName');
    var USER_ID = getLocalVariable('USER_ID');
    var SIP_ID = getLocalVariable('SIP_ID');
    var Campaign_Type = getLocalVariable('Campaign_Type');
    var LoginHourID = getLocalVariable('LoginHourID');
    var ModeDBId = getLocalVariable('ModeDBId');
    var MYIP = getLocalVariable('MYIP');
    var userStatusID = getLocalVariable('User_Status_ID');
    var SERVER_IP = getLocalVariable('SERVER_IP');
    var ActivityID = getLocalVariable('CRMDataID');
    var Manual_Caller_ID = getLocalVariable('DisplayCallerID');
    var rid = getLocalVariable('RecordID');
    let jsonsave = {rid:rid,client_id:client_id,as_id:AS_ID,campaign_name:CampaignName,user_id:USER_ID,sip_id:SIP_ID,campaign_type:Campaign_Type,LoginHourID:LoginHourID,ModeDBId:ModeDBId,ip:MYIP,user_status_id:userStatusID,server_ip:SERVER_IP,activity_id:ActivityID,caller_id:Manual_Caller_ID };
    //console.log("Alert= "+JSON.stringify(jsonsave));
    
    $.ajax({
        url: "/page_reload_log",
        method: "POST",
        data: jsonsave,
        dataType: "JSON",
        success: function (route_result) {
            if (route_result.status == true) {
                alertify.success("Reload log Save successfully");
                return false;
            } else {
                alertify.error("Unable to save. Please try again later.");
                return false;
            }
        }
    });
}

/***************Custom chat developed  by nitish singh******************* */


async function showChatwebRtc(phone_number = '') {
    let chatPermission = getLocalVariable("ChatA")
    if(chatPermission=='1'){
        $("#newchatview").show();
        $('#myTab a[href="#profile"]').tab('show');
        $('#interaction_myTab a[href="#Chat-tab"]').tab('show');
        alertify.success("Chat loading...!");
        // Track API call count
        let apiCallCount = 0;
        apiCallCount++;
        console.log("API Call Count:", apiCallCount);

        const user_id = getLocalVariable('USER_ID');
        const login_id = getLocalVariable('LoginHourID');
        const user_mode_id = getLocalVariable('LoginHourID');
        const username = getLocalVariable('USER_NAME');
        const mobile = getLocalVariable('whatsapp_business_number');
        //alert(mobile);

        // Check if user information is available
        if (!user_id || !username) {
            //alertify.error(`User information not fetched. user_id: ${user_id}, username: ${username}, mobile: ${mobile}`);
            return false;
        }
        //alertify.error(`User information not fetched. user_id: ${user_id}, username: ${username}, mobile: ${mobile}`);
        const getUser_id = await getUser_idfromDb(); // Await the async call
        //alertify.error(`User ID  fetched. ${getUser_id}`);

        if (!getUser_id) {
            alertify.error(`User ID not fetched. Error in getUser_idfromDb: ${getUser_id}`);
            return false;
        } else {
            const json_data = {
                user_id: getUser_id,
                name: username,
                mobile: mobile,
                login_id: login_id,
                user_mode_id: user_mode_id
            };

            try {
                $.ajax({
                    url: chatpanel_url+'server/refreshTokenWebrtc',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(json_data),
                    success: function (data) {
                        if (!data.token) {
                            alertify.error("Token not received in the response.");
                            return;
                        }
                        console.log('Response:', data);
                        loginToChatApp(data.token.access_token); // Use the token in the next step
                    },
                    error: function (xhr, status, error) {
                        alertify.error("Failed to fetch token after 2 attem", error);
                        if (apiCallCount < 2) { // Retry once if there was an error
                            console.log('Retrying API call...');
                            // showChatwebRtc(phone_number); // Retry logic
                        } else {
                            alertify.error("Failed to fetch token after 2 attempts.");
                        }
                    }
                });
            } catch (error) {
                console.error('Unexpected Error:', error);
            }
            
        }
    }
    else{
        const chatApp = document.getElementById('chatApp');
        chatApp.style.display = 'block';
        chatApp.style.visibility = 'hidden'
        console.log('this block screen');
        $("#newchatview").hide();
        $("#chatApp").html('');
        return ;
    }
}

async function getUser_idfromDb() {
    const user_id = getLocalVariable('USER_ID');
    const clientId = getLocalVariable('ClientID');

    const apiBody = {
        "user_id": user_id,
        "client_id": clientId
    };
    return new Promise((resolve, reject) => {
        $.ajax({
            url: 'api_calling/agent_user_id',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(apiBody),
            success: function (data) {
                resolve(data.id); // Resolve with the id directly
            },
            error: function () {
                resolve(null); // Resolve as null on error
            }
        });
    });
}

function loginToChatApp(token) {
    const loginId = getLocalVariable('LoginHourID');
    const campaignName = getLocalVariable('CampaignName');
    const clientId = getLocalVariable('ClientID');
    const chatApp = document.getElementById('chatApp');
    // Creating the URL with query parameters
    const chatAppUrl = chatpanel_url+`api/getIntoChatApp?loginId=${loginId}&campaignName=${campaignName}&clientId=${clientId}&token=${token}`;
    //alert(chatAppUrl);

    // Avoid redundant API calls
    if (!chatApp.src || chatApp.src !== chatAppUrl) {
        chatApp.src = chatAppUrl; // Set the iframe source only once
        console.log('Chat app iframe source set:', chatAppUrl);
        chatApp.style.visibility = 'visible';  
    }

    // Toggle chat app visibility

    // Sending the token in the request headers
    
}
function reset_auth()
{
    let whatsapp_auth = getLocalVariable('Whatsapp');
    let chatadmin = getLocalVariable('ChatA');
    let Email = getLocalVariable('Email');
    let SMS = getLocalVariable('SMS');
    let AssignedPermission = getLocalVariable('AssignedPermission');
    let DecisionTreePermission = getLocalVariable('DecisionTreePermission');
    let TicketPermission = getLocalVariable('TicketPermission');
    let SmsPermission = getLocalVariable('SmsPermission');
    let EmailPermission = getLocalVariable('EmailPermission');
    let HistoryPermission = getLocalVariable('HistoryPermission');
    let FeedbackPermission = getLocalVariable('FeedbackPermission');
    let WhatsappInPermission = getLocalVariable('WhatsappInPermission');
    let WhatsappOutPermission = getLocalVariable('WhatsappOutPermission');
    let chat_permission = getLocalVariable('chat_permission');
    let feedback = getLocalVariable('feedback');
    
    /**********Campaign vise */
    let Cam_CrmPermission = getLocalVariable('Cam_CrmPermission');
    let Cam_AssignedPermission = getLocalVariable('Cam_AssignedPermission');
    let Cam_DecisionTreePermission = getLocalVariable('Cam_DecisionTreePermission');
    let Cam_TicketPermission = getLocalVariable('Cam_TicketPermission');
    let Cam_SmsPermission = getLocalVariable('Cam_SmsPermission');
    let Cam_EmailPermission = getLocalVariable('Cam_EmailPermission');
    let Cam_HistoryPermission = getLocalVariable('Cam_HistoryPermission');
    let Cam_FeedbackPermission = getLocalVariable('Cam_FeedbackPermission');
    let Cam_WhatsappInPermission = getLocalVariable('Cam_WhatsappInPermission');
    let Cam_WhatsappOutPermission = getLocalVariable('Cam_WhatsappOutPermission');
    let Cam_ChatPermission = getLocalVariable('Cam_ChatPermission');
    let MOPanel = getLocalVariable('MOPanel');

    if(Cam_AssignedPermission==1 && AssignedPermission==1)
    {
        $('#assignli-tab').show();
        $('#Assigned').css('visibility', 'visible'); 
    }else
    {
        $('#assignli-tab').hide();
        $('#Assigned').css('visibility', 'hidden');
    } 
    if(Cam_FeedbackPermission==1 && FeedbackPermission==1 && feedback==1)
    {
        $('.feedbacktransfer').show();
    }else
    {
        $('.feedbacktransfer').hide();
    }    
    if(MOPanel==1)
    {
        $('#MO-tab').show();
        $('#MO_mode').css('visibility', 'visible');
        
    }else
    {
        $('#MO-tab').hide();
        $('#MO_mode').css('visibility', 'hidden');
    }
    if(whatsapp_auth==1 && WhatsappInPermission==1 && Cam_WhatsappInPermission==1)
    {
        $('.whatsapp_auth').css('visibility', 'visible');
        $('#Whatsap-tab').show();
        $('#whatsapp_tab').css('visibility', 'visible');
        
    }else
    {
        $('.whatsapp_auth').css('visibility', 'hidden');
        $('#Whatsap-tab').hide();
        $('#whatsapp_tab').css('visibility', 'hidden');
    }
    if(whatsapp_auth==1 && WhatsappOutPermission==1 && Cam_WhatsappOutPermission==1)
    {
        $('#whatsapp_tab_out').css('visibility', 'visible');
        $('#whatsapp-navout').show();
        
    }else
    {
        $('#whatsapp_tab_out').css('visibility', 'hidden');
        $('#whatsapp-navout').hide();
    }
    /*********Decision tree permission********* */
    if(DecisionTreePermission==1 && Cam_DecisionTreePermission==1)
    {
        $('#decision_auth').show();
        $('#Decision').css('visibility', 'visible');
    }else
    {
        $('#decision_auth').hide();
        $('#Decision').css('visibility', 'hidden');
    }
    if(TicketPermission==1 && Cam_TicketPermission==1)
    {
        $('#tickets_auth').show();
        $('#tickets').css('visibility', 'visible');
        
    }else
    {
        $('#tickets_auth').hide();
        $('#tickets').css('visibility', 'hidden');
    }
    if(chatadmin==1 && chat_permission==1 && Cam_ChatPermission==1)
    {
        $('#chat_auth').show();
        $('#Chat').css('visibility', 'visible');
        
    }else
    {
        $('#chat_auth').hide();
        $('#Chat').css('visibility', 'hidden');
        $("#Chat-tab").removeClass("active");
    }
    if(Email==1 && EmailPermission==1 && Cam_EmailPermission==1)
    {
        $('#Email-tab').show();
        $('#Email').css('visibility', 'visible');
    }else
    {
        $('#Email-tab').hide();
        $('#Email').css('visibility', 'hidden');
    }
    if(SMS==1 && SmsPermission==1 && Cam_SmsPermission==1)
    {
        $('#SMS-tab').show();
        $('#SMS').css('visibility', 'visible');
    }else
    {
        $('#SMS-tab').hide();
        $('#SMS').css('visibility', 'hidden');
    }
    if(Cam_HistoryPermission==1 && HistoryPermission==1)
    {

        $('#summary-tab').show();
        $('#tabphone-tab').show();
        $('#tabphone').css('visibility', 'visible');
        $('#summary').css('visibility', 'visible');
    }else
    {
        $('#summary-tab').hide();
        $('#tabphone-tab').hide();
        $('#tabphone').css('visibility', 'hidden');
        $('#summary').css('visibility', 'hidden');
    }
    
    
}
/***********Progressive calling auto*************** */
function checkProgressiveCall()
{
    console.log("progressive dialing...!= "+CurrentDateTime());
    console.log("Auto Progerresive dial call_time_difference= "+getLocalVariable('call_time_difference')+" AutoProgressive= " +getLocalVariable('AutoProgressive')+" progressive_dial_status= "+getLocalVariable('progressive_dial_status'));
    var UserMode = getLocalVariable('UserMode');
    if (UserMode.toUpperCase() != "PROGRESSIVE" || getLocalVariable('WaitingDisposition') != 'false' || getLocalVariable('DialPad')== 0 || getLocalVariable('progressive_dial_status')==0 || getLocalVariable('SipCheckStatus') != 'OK' || getLocalVariable('AutoProgressive') == 0) {
        console.log("Progressive dial step1");
        return false;
    }
    if (getLocalVariable('CampaignName') == '' || getLocalVariable('UserMode') == '') {
        console.log("Progressive dial step1");
        return false;
    }
    /*************Progressive Dialling********** */
    var client_id = getLocalVariable('ClientID');
    var agent = getLocalVariable('USER_ID');
    var exten = getLocalVariable('SIP_ID');
    var campaign = getLocalVariable('CampaignName');
    var campaign_type = getLocalVariable('Campaign_Type');
    var webrtc_skill = window.localStorage.getItem('skill');
    var webArray = Object.keys(JSON.parse(webrtc_skill));
    var userskill = webArray[0];
    var server = getLocalVariable('AS_ID');
    var SERVER_IP = getLocalVariable('SERVER_IP');
    var CS_API_Port = getLocalVariable('CS_API_Port');
    
    let jsonsave={
        client_id:client_id,
        agent:agent,
        exten:exten,
        campaign:campaign,
        campaign_type:campaign_type,
        userskill:userskill,
        server:server,
        SERVER_IP:SERVER_IP,
        CS_API_Port:CS_API_Port
    };
    $.ajax({
        url: '/progressive-call',type:'POST',contentType: 'application/json',
        data:JSON.stringify(jsonsave),
        success: function (result_new) {
        if (result_new.status == 'true' || result_new.status == true) {
            alertify.success("Progressive dialing Active " + result_new.phone);
            DialByLine('audio', '', result_new.phone, '', '', 'PG');
            logEntry('Progressive dialling ' + result_new.phone+ ' dial time'+CurrentDateTime());
        } else {
            alertify.error(obj.msg);
            //setLocalVariable("progressive_dial_status", 0);
        }
        }});
}
/**********************remove-agent  * */

function freeagent()
{
    alert("free agent");
    var data_record = {client_id:JSON.parse(getLocalVariable("ClientID")),exten:getLocalVariable("SIP_ID"),campaign:getLocalVariable("CampaignName"),agent:getLocalVariable("USER_ID"),SERVER_IP:getLocalVariable("SERVER_IP"),CS_API_Port:getLocalVariable("CS_API_Port")};
    $.ajax({
        url: '/remove-agent',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data_record),
        success: function(result) {
            alert(result);
          if (result.ok == true) {
            
          } else {
            alert(result.msg);
          }
        },
        error: function(error) {
            alertify.error("Failed to send log: ",error);
        }
        });
}

/************Call Forwarding*********** */
function getCallForward_on(tag='') {
    if (getLocalVariable('CallForward') == "1" && getLocalVariable('AgentMobile').length > 4 && (getLocalVariable('Campaign_Type').toUpperCase() == 'SB' || getLocalVariable('Campaign_Type').toUpperCase() == 'SD' || getLocalVariable('Campaign_Type').toUpperCase() == 'AB')) {
        if(tag=='add')
        {
            alertify.confirm("Want to forward the call on your mobile number?", function (ev) {
                if (ev) {
                    var data_record={action:'add',CampaignName: getLocalVariable('CampaignName'),USER_ID: getLocalVariable('USER_ID'),AgentMobile:getLocalVariable('AgentMobile'),ClientID:getLocalVariable('ClientID')};
                    $.ajax({
                        url: '/agent-campaign-call-forward',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(data_record),
                        success: function(result) {
                            if (result.ok == true) {
                                $('#forwarding_result').html("<span style='color:red'>Call forwarding enabled on " + getLocalVariable('AgentMobile') + ".</span>");
                                $('#forwarding_off').show();
                                $('#call-fwd').hide();
                                
                            }
                        },
                        error: function(error) {
                            alertify.error("No record"); 
                            $('#forwarding_off').show();
                            $('#call-fwd').hide();
                        }
                    });
                }
            });
        }
        if(tag=='remove')
        {
            alertify.confirm("Want to delete all the call forwarding?", function (ev) {
                if (ev) {
                    var data_record={action:'delete',CampaignName: getLocalVariable('CampaignName'),USER_ID: getLocalVariable('USER_ID'),AgentMobile:getLocalVariable('AgentMobile'),ClientID:getLocalVariable('ClientID')};
                    $.ajax({
                        url: '/agent-campaign-call-forward',
                        type: 'POST',
                        contentType: 'application/json',
                        data: JSON.stringify(data_record),
                        success: function(result) {
                            if (result.ok == true) {
                                $('#forwarding_result').html("<span style='color:green'>Call forwarding disabled on " + getLocalVariable('AgentMobile') + ".</span>");
                                $('#call-fwd').show();
                                $('#forwarding_off').hide();
                            }
                        },
                        error: function(error) {
                            alertify.error("No record"); 
                            $('#call-fwd').show();
                            $('#forwarding_off').hide();
                        }
                    });
                } 
            });
        }


    }
}



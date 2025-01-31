/*
ajax calling function
*/
if (!Modernizr.localstorage) {
    logout();
}

if (getLocalVariable('USER_ID') == '') {
    logout();
    //window.location.href = '/login';
}

function requeststhroughAjax(data, callback, timeout = 10000, url = '') {
    if (url.length == 0) {
        url = ajaxURL;
    }
    //console.log("ajaxURL= " + ajaxURL);

    if (!(data.tag == 'validate-campaign-mode' || data.tag == 'reloadRecall' || data.tag == "delete-misscall" || data.tag == 'transfer-list' || data.tag == 'save-live-data' || data.tag == 'auto-dispose' || data.tag == 'chatCount' || data.action == 'getUsers' || data.action == 'getChats' || data.tag == "campaign-mo" || data.tag == 'validate-user-status' || data.tag == 'get-notification')) {
        $('#preloader').show();
        ///checkAutoCallbacks();
    }
    //console.log("ajax url data by "+url);
    data['Manual_Caller_ID'] = getLocalVariable('Manual_Caller_ID');
    $.ajax({
        url: url,
        data: data,
        type: 'POST',
        dataType: 'json',
        async: false,
        cache: false,
        timeout: timeout,
        success: function (result) {
            if (result.loggedIn == 0 && url == ajaxURL) {
                alertify.error("Logging Off as another session active.");
                setTimeout(function () {
                    logout();
                }, 2000);
            }
            if (callback && typeof (callback) == "function") {
                callback(result);
                //$('#preloader').hide();
            }
        }
    });
}
/*
     * When the campaign and usermode selected for the first time
     */
/*
 * Auto Login to the Campaign & Mode
 */
function saveAgentStatus() {

    
    if(getLocalVariable("WaitingDisposition")=='false' && getLocalVariable("isLineBusy")=='READY' && getLocalVariable("UserMode")=='Callback' && getLocalVariable("pre_callback_dialling")==1 && getLocalVariable("dial_type")=='auto_callback')
    {
        console.log("saveAgentStatus false return");
        return false;
    }
    if (getLocalVariable('CampaignName') != '' && getLocalVariable('UserMode') != '') {
        logEntry("saveAgentStatus");
        let jsonsave={
            ClientID: getLocalVariable('ClientID'),
            LoginHourID: getLocalVariable('LoginHourID'),
            ModeDBId: getLocalVariable('ModeDBId'),
            emailCount: getLocalVariable('EMAIL_COUNT'),
            smsCount: getLocalVariable('SMS_COUNT'),
            idleDuration: getLocalVariable('Idle_Duration'),
            wrapupDuration: getLocalVariable('Wrapup_Duration'),
            holdCount: getLocalVariable('Hold_Count'),
            holdDuration: getLocalVariable('Hold_Duration'),
            recallCount: getLocalVariable('Recall_Count'),
            recallDuration: getLocalVariable('Recall_Duration'),
            breakDuration: getLocalVariable('Break_Duration'),
            moDuration: getLocalVariable('Mo_Duration'),
            transferCount: getLocalVariable('Transfer_Count'),
            DialedRoute: getLocalVariable('DialedRoute'),
            User_Status_ID: getLocalVariable('User_Status_ID'),
        };
        $.ajax({
            url: "/webrtc_saveuser_modeLog",
            method: "POST",
            data: jsonsave,
            dataType: "JSON",
            success: function (dispose_result) {
                
            }
        }, 60000);
    }
    setTimeout("saveAgentStatus()", 300000);
}
function sleep(ms) {
    const start = Date.now();
    let now = start;
    while (now - start < ms) {
        now = Date.now();
    }
}
function AutoDispose() {
    console.log("AutoDispose call");
    setTimeout("AutoDispose()", 1000);


    if (getLocalVariable('NumberToDial') != '') {
        var phone_number=getLocalVariable('NumberToDial');
        $("#whatsp_number").val(phone_number);
    }
    
    //setTimeout("checkwrtcCallbacks()", 1000);
    if (getLocalVariable('UserMode') != 'Callback') {
        setLocalVariable("set_callback_mode", "");
    }
    if (getLocalVariable('UserDisableDisposition') == '1' || getLocalVariable('UserDisableDisposition') == 1) {
        $('#dispose_call').hide();
    }else
    {
        $('#dispose_call').show();
    }
    if (parseInt(getLocalVariable('AutoDisposeTime')) <= 0) {
        return;
    }
    if (getLocalVariable('reviewMode') == "1") {
        return;
    }
    if (getLocalVariable('performRedialAction') == "true") {
        setLocalVariable('AutoDispCounter', 0);
        $('#auto-dispose-div').html('');
        $('#auto-dispose-div').hide();
        return;
    }
    //    if (getLocalVariable('lineHangedup') == "1" && (getLocalVariable('isLine2Busy')).length == 0 && getLocalVariable('WaitingDisposition') == "true" && getLocalVariable('isLineBusy') == "HANGUP" && (getLocalVariable('LastAgentState') == 'HANGUP' || getLocalVariable('LastAgentState') == 'ONCALL' || getLocalVariable('LastAgentState') == 'HOLD' || getLocalVariable('LastAgentState') == 'MUTE')) {
    if (getLocalVariable('lineHangedup') == "1" && getLocalVariable('WaitingDisposition') == "true" && getLocalVariable('isLineBusy') == "HANGUP" && (getLocalVariable('LastAgentState') == 'HANGUP' || getLocalVariable('LastAgentState') == 'ONCALL' || getLocalVariable('LastAgentState') == 'HOLD' || getLocalVariable('LastAgentState') == 'MUTE')) {




        $('#crm-form :input:disabled').each(function () {
            $(this).data('disabled', true); // Store the disabled state
            $(this).prop('disabled', false);
        });

        // Serialize the form
        var data = $('#crm-form').serialize();
        $('#crm-form :input').each(function () {
            if ($(this).data('disabled')) {
                $(this).prop('disabled', true);
                $(this).removeData('disabled'); // Clean up the data attribute
            }
        });
        /// var lead = $('#leadid').val();

        var autoDispCounter = localStorage.getItem("AutoDispCounter");
        var autoDispTimeDiff = localStorage.getItem("AutoDispTimeDiff");
        console.log("autoDispCounter= " + autoDispCounter + " autoDispTimeDiff= " + autoDispTimeDiff);
        var jsondata = { autoDispCounter: autoDispCounter, autoDispTimeDiff: autoDispTimeDiff };
        console.log("json data autodispose= " + JSON.stringify(jsondata));
        $.ajax({
            url: "/auto_dispose",
            method: "POST",
            data: { autoDispCounter: autoDispCounter, autoDispTimeDiff: autoDispTimeDiff },
            dataType: "JSON",
            success: function (result) {
                if (Object.keys(result).length > 0) {
                    console.log("msg data insert= " + JSON.stringify(result));
                    /*
                    {"AutoDispCounter":0,"AutoDispTimeDiff":0,"WaitingDisposition":false,"DispalyPhoneNumber":"","MaskedPhoneNumber":"","DisplayCallerID":"","DisplayDIDName":"","Hold_Count":0,"Hold_Duration":0,"EditPhoneNo":"","LastAgentState":"HANGUP","loggedIn":1}*/
                    updateLocalVariables(result);
                }
                //alert(result.status);
                if (result.status == true) {
                    /*code by alok*/
                    /**Start set update_hold */
                    var is_callback = 0;
                    if(getLocalVariable('CALL_TYPE') != 'TC' && getLocalVariable('CALL_TYPE') != 'QT')
                    {
                        update_hold();
                    }
                    updateCrm(data, 1, is_callback);
                    /** end set dataid */
                    var Campaign_name = window.localStorage.getItem('CampaignName');
                    var sip_id = window.localStorage.getItem('SIP_ID');
                    var client_id = window.localStorage.getItem('ClientID');
                    var lead_id = Campaign_name.toUpperCase() + "_MANUAL";
                    var rid = getLocalVariable('RecordID');
                    var did = window.localStorage.getItem('CRMDataID');
                    var skill = getLocalVariable('crm_skill');
                    var disposition = $('#disposition').val();
                    var sub_disp1 = $('#sub_disposition').val();
                    var disp = 'AUTO DISPOSE';
                    var sub_disp = 'AUTO DISPOSE';
                    var remarks = '';
                    var remarks1 = $('#remarks').val();
                    if (disposition != '') {
                        var disp = $('#disposition').val();
                    }
                    if (sub_disp1 != '') {
                        var sub_disp = $('#sub_disposition').val();
                    }
                    if (remarks1 != '') {
                        var remarks = $('#remarks').val();
                    }
                    var callbackdate = $("#callbackdate").val();
                    var jsonsave = { did: did, lead_id: lead_id, remarks: remarks, disposition: disp, sub_disp: sub_disp, rid: rid, sip_id: sip_id, client_id: client_id, skill: skill,callbackdate:callbackdate};
                    console.log("autosave dispose= " + JSON.stringify(jsonsave));
                    $.ajax({
                        url: "/api_calling/save_disposition_data",
                        method: "POST",
                        data: jsonsave,
                        dataType: "JSON",
                        success: function (dispose_result) {
                            //alert(dispose_result);
                            if (dispose_result.status == true) {
                                call_type = getLocalVariable('CALL_TYPE');
                                LastUserMode = getLocalVariable('LastUserMode');
                                setLocalVariable('WaitingDisposition', 'false');
                                if (call_type == 'RC') {
                                    last_callback_id = getLocalVariable("last_callback_id");
                                    $.ajax({
                                        url: "/recall_delete",
                                        method: "POST",
                                        data: {recall_id: last_callback_id},
                                        dataType: "JSON",
                                        success: function (result) {
                                            if (result.status == true) {
                                                //alert("delete callback");
                                                logEntry("delete callback ");
                                            }
                                            else {
                                                //alert("Unable to delete callback");
                                                logEntry("Unable to delete callback");
                                            }
                                        }
                                    });
                                    setLocalVariable("callback_notify", "");
                                }
                                if(getLocalVariable('isLineBusy')=='DIALING')
                                {
                                    cancelSession('cs_call');
                                }
                                get_CallLog('0');
                                get_callback('0');
                                $('#crm_skill').html("");
                                $('#crm_phone_number').html("");
                                $('#crm_did_number').html("");
                                $('#crm_did_name').html("");
                                $('#crm_rid').html("");
                                $('#crm_skill').html("");
                                $('#top-crm-continer2').css("display", "block");
                                if (getLocalVariable('UserMode') == 'Progressive') {
                                    $('#top-crm-continer3').css("display", "flex");
                                }
                                $('#top-crm-continer').css("display", "none");
                                $('#top-crm-continer').html("");
                                $('.header_part').css("display", "none");
                                $('#webrtc_crm_data').html("");
                                $('#show_dial_phone').html("");
                                $('#callback_count').html("");
                                $('#next_callback').html("");
                                $('#callback_phone').html("");
                                $('#show_call_type').html("");
                                $("#remarks").val("");
                                $("#disposition").val("");
                                $("#sub_disposition").val("");
                                $("#callbackdate").val("");
                                $("#callbackdate").css("display", "none");
                                $('#agent_attendedtransfer').css("display", "block");
                                $('#show_disposition_section').css("display", "flex");
                                $('#agent_completeattended_transfer').css("display", "none");
                                setLocalVariable('isLineBusy', 'READY');
                                setLocalVariable('CALL_TYPE', '');
                                reset_field('No');

                                /**end code alok */
                                var is_callback = 0;
                                var callback = {};
                                var disposition = JSON.parse(getLocalVariable('CRM_Disposition'));
                                setLocalVariable('NumberToDial', '');
                                setLocalVariable('NumberToDial2', '');
                                setLocalVariable('RecordID', '');
                                setLocalVariable('CRMDataID', '');
                                setLocalVariable('crm_data_id', '');
                                setLocalVariable('Hold_Duration', 0);
                                setLocalVariable('Hold_Counter', 0);
                                setLocalVariable('Hold_Count', 0);
                                /** End Call */
                                endSession('cs_call');
                                /** End Call */
                                $('#dialpad_queuetransfer').html("<option>-SELECT-</option>");
                                setLocalVariable('AutoDispTimeDiff', 0);
                                setLocalVariable('lineSelected', 1);
                                setLocalVariable('manualdial_callback', '');
                                $('#auto-dispose-div').html('');
                                $('#auto-dispose-div').hide();
                                /*** remove queue */
                                queueAdd('queue_inactive');
                                /*************Progressive dialling****************** */
                                if(getLocalVariable('UserMode').toUpperCase() == "PROGRESSIVE" && getLocalVariable('AutoProgressive') == 1)
                                {
                                    let CalldifferenceTime=parseInt(getLocalVariable('call_time_difference'))*1000;
                                    if(CalldifferenceTime==0)
                                    {
                                        CalldifferenceTime='1000';
                                    }
                                    setTimeout("checkProgressiveCall()", CalldifferenceTime);
                                }
                                /*****************End Progressive Dialling */
                            }
                        }
                    });
                }

            }
        });
    } else {
        $('.line-status').html(getLocalVariable('isLineBusy'));
        if (getLocalVariable('hadConference') == '1') {
            $('.line-status').html(('Conference').toUpperCase());
        }
        $('#auto-dispose-div').html('');
        $('#auto-dispose-div').hide();
        setLocalVariable('AutoDispTimeDiff', parseInt(getLocalVariable('AutoDisposeTime')));
    }
}
/* timer function
function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    var hDisplay = h > 9 ? h : '0' + h;
    var mDisplay = m > 9 ? m : '0' + m;
    var sDisplay = s > 9 ? s : '0' + s;
    return hDisplay + " : " + mDisplay + " : " + sDisplay;
}*/


function agentStatusFromCS() {
    setTimeout("agentStatusFromCS()", 2000);

    if (getLocalVariable('USER_ID') == '') {
        logout();
        //window.location.href = '/login';
    }
    if (getLocalVariable('NumberToDial')!='') {
        $('#wphoneTo').val(getLocalVariable('NumberToDial'));
    }
    if (getLocalVariable('WaitingDisposition') == 'false') {
        $('#show_greendata').css("display", "none");
        $('#show_dial_phone').html("");
        $('#show_did').html("");
        $('#show_queue').html("");
        $('#webrtct_did_name').html("");
        $('#show_call_type').html("");
        $('#show_disposition_section').css("display", "flex");
        setLocalVariable('Hold_Counter', 0);
    }
    else {
        /** audio pause */
        pouse_play();
        var phone = getLocalVariable('NumberToDial');
        var data_id = getLocalVariable('CRMDataID');
        var name = getLocalVariable('display_name');
        var green_data_id = $("#green_data_id").val();
        if (data_id != green_data_id) {
            $("#green_data_id").val(data_id);
            show_greendata(data_id, name, phone);
            $('#show_greendata').css("display", "contents");
            $('#myTab a[href="#home"]').tab('show');
        }
    }
    if (websocketConnected == 1) {
        if (getLocalVariable('CampaignName') != '' && getLocalVariable('UserMode') != '') {
            var queuewait = (getLocalVariable('queuewait').length == 0) ? 0 : getLocalVariable('queuewait');
            var mytotalwait = (getLocalVariable('mytotalwait') == 0) ? 0 : getLocalVariable('mytotalwait');
            setLocalVariable('QueueLog', queuewait + "~" + mytotalwait);
            if (getLocalVariable('isLineBusy').toLowerCase() == 'hangup' && (getLocalVariable('WaitingDisposition') == "false" && getLocalVariable('WaitingMoDisposition') == "false")) {
                setLocalVariable('isLineBusy', ('ready').toUpperCase());
                setLocalVariable('DispalyPhoneNumber', '');
            }
            if (getLocalVariable('isLineBusy').toLowerCase() == 'ready' && (getLocalVariable('WaitingDisposition') == "true" || getLocalVariable('WaitingMoDisposition') == "true") && (getLocalVariable('LastAgentState').toLowerCase() == 'hangup' || getLocalVariable('LastAgentState').toLowerCase() == '')) {
                setLocalVariable('isLineBusy', ('hangup').toUpperCase());
                //setLocalVariable('isLineBusy', ('ready').toUpperCase());
            }
            if (getLocalVariable('isLineBusy').toLowerCase() != 'hangup' && getLocalVariable('isLineBusy').toLowerCase() != 'ready') {
                setLocalVariable('performRedialAction', "false");
            }

            if ((getLocalVariable('LastAgentState') != getLocalVariable('isLineBusy')) || getLocalVariable('isLineBusy') == "") {
                setLocalVariable('LastAgentState', ((getLocalVariable('isLineBusy') == "") ? 'LOGIN' : getLocalVariable('isLineBusy')));
                setLocalVariable('LastAgentStateTime', getLocalVariable('timestamp'));
            }
            if (getLocalVariable('reviewMode') == '1') {
                setLocalVariable('isLineBusy', getLocalVariable('ActivityName').toUpperCase());
            }
            var WrapupDuration = 0;
            if (getLocalVariable('isLineBusy') == 'HANGUP' && getLocalVariable('LastAgentState') == 'HANGUP' && getLocalVariable('WaitingDisposition') == "true") {
                var min = getLocalVariable('timestamp').split(" ");
                var newsplit = min[0].split('-');
                var date1 = newsplit[1] + "/" + newsplit[2] + "/" + newsplit[0] + " " + min[1];
                var min = (getLocalVariable('reviewMode') == '1') ? getLocalVariable('ActivityLoginTime').split(' ') : getLocalVariable('LastAgentStateTime').split(" ");
                var lastsplit = min[0].split('-');
                var date2 = lastsplit[1] + "/" + lastsplit[2] + "/" + lastsplit[0] + " " + min[1];
                var WrapupDuration = (new Date(date1) - new Date(date2)) / 1000;
                setLocalVariable('WrapupDuration', WrapupDuration);
            }
            var Wrapup_Duration = isNaN(parseInt(getLocalVariable('Wrapup_Duration'))) ? 0 : parseInt(getLocalVariable('Wrapup_Duration'));
            if ((getLocalVariable('LastAgentState') != getLocalVariable('isLineBusy'))) {
                if ($.inArray(getLocalVariable('isLineBusy'), ['ONCALL', 'HANGUP']) > -1)
                    processEventCampaign(getLocalVariable('isLineBusy').toLowerCase());
                setLocalVariable('LastAgentState', getLocalVariable('isLineBusy'));
                setLocalVariable('Wrapup_Duration', parseInt(Wrapup_Duration) + parseInt(getLocalVariable('WrapupDuration')));
                setLocalVariable('LastAgentStateTime', getLocalVariable('timestamp'));
                setLocalVariable('WrapupDuration', 0);
            } else {
                var CurrentAgentStateTime = (new Date(Date.parse(getLocalVariable('timestamp'))) - new Date(Date.parse(getLocalVariable('LastAgentStateTime')))) / 1000;
                if (getLocalVariable('reviewMode') == '1') {
                    CurrentAgentStateTime = (new Date(Date.parse(getLocalVariable('timestamp'))) - new Date(Date.parse(getLocalVariable('ActivityLoginTime')))) / 1000;
                }
                setLocalVariable('CurrentAgentStateTime', CurrentAgentStateTime);
                var min = getLocalVariable('timestamp').split(" ");
                var newsplit = min[0].split('-');
                var date1 = newsplit[1] + "/" + newsplit[2] + "/" + newsplit[0] + " " + min[1];
                var min = (getLocalVariable('reviewMode') == '1') ? getLocalVariable('ActivityLoginTime').split(' ') : getLocalVariable('LastAgentStateTime').split(" ");
                var lastsplit = min[0].split('-');
                var date2 = lastsplit[1] + "/" + lastsplit[2] + "/" + lastsplit[0] + " " + min[1];
                var CurrentAgentStateTime = (new Date(date1) - new Date(date2)) / 1000;
                setLocalVariable('CurrentAgentStateTime', CurrentAgentStateTime);
            }

            var LastAgentState = getLocalVariable('LastAgentState');
            if (getLocalVariable('reviewMode') == '1') {
                LastAgentState = getLocalVariable('ActivityName').toUpperCase();
            }
            if (getLocalVariable('hadConference') == '1') {
                LastAgentState = ('Conference').toUpperCase();
            }

            var skillstr = '';
            if (getLocalVariable('skill') != '' && Object.keys(JSON.parse(getLocalVariable('skill'))).length != 0 && getLocalVariable('Campaign_Type').toUpperCase() == "SR") {
                var skill = JSON.parse(getLocalVariable('skill'));
                for (var oi in skill) {
                    skillstr += oi;
                    //                if (getLocalVariable('WaitingDisposition') == "true" && oi.toLowerCase() == getLocalVariable('LastSkillUsed').toLowerCase()) {
                    if (oi.toLowerCase() == getLocalVariable('LastSkillUsed').toLowerCase()) {
                        skillstr += '-Y';
                    } else {
                        skillstr += '-N';
                    }
                    skillstr += "-" + skill[oi];
                    skillstr += "~";
                }
                setLocalVariable('skillstr', skillstr);
            }

            console.log('LastAgentState: ', getLocalVariable('LastAgentState'));
            console.log('LastAgentStateTime: ', getLocalVariable('LastAgentStateTime'));
            console.log('timestamp: ', getLocalVariable('timestamp'));
            var line2 = getLocalVariable('isLine2Busy');
            //var phone2 = line2.length == 0 ? "" : getLocalVariable('NumberToDial2');
            //var phone1 = getLocalVariable('DispalyPhoneNumber');
            var phone1 = getLocalVariable('NumberToDial');
            var phone2 = getLocalVariable('NumberToDial2');
            if (getLocalVariable('MuteCall') == 1 && getLocalVariable('isLineBusy') == 'ONCALL' && getLocalVariable('isHold') != 1) {
                LastAgentState = 'MUTE';
            }
            else if (getLocalVariable('isHold') == 1 && (getLocalVariable('isLineBusy') == 'ONCALL' || getLocalVariable('isLineBusy') == 'HOLD')) {
                LastAgentState = 'HOLD';
            }

            setLocalVariable('recent_call_status', LastAgentState);
            var sendlist = {
                type: 'agentstatus',
                status: LastAgentState,
                line2: line2,
                phone2: phone2,
                phone: phone1,
                client_id: getLocalVariable('ClientID'),
                exten: getLocalVariable('SIP_ID'),
                campaign: getLocalVariable('CampaignName'),
                agent: getLocalVariable('USER_ID'),
                mode: getLocalVariable('UserModeIndex'),
                did_number: getLocalVariable('DisplayCallerID'),
                recall: getLocalVariable('Recall_Count'),
                transfer: getLocalVariable('Transfer_Count'),
                conference: getLocalVariable('Conference_Count'),
                login_id: getLocalVariable('LoginHourID'),
                action_id: getLocalVariable('ModeDBId'),
                manual: getLocalVariable('Call_Mc_Count'),
                outbound: getLocalVariable('Call_Ob_Count'),
                inbound: getLocalVariable('Call_In_Count'),
                modeduration: getLocalVariable('CurrentAgentStateTime'),
                skill: skillstr
            };
            if (websocketConnected == 1) {
                console.log("send data in socket" + JSON.stringify(sendlist));
                websocket.send(JSON.stringify(sendlist));
            }

            var line1 = getLocalVariable('isLineBusy');
            var line2 = getLocalVariable('isLine2Busy');
            if (line1.toUpperCase() != ('READY').toUpperCase() && line1.toUpperCase() != ('HANGUP').toUpperCase()) {
                // var src = $('#Line1').attr('src');
                //src = src.replace('_green_', '_red_');
                var element = document.getElementById("cs_status");
                if (getLocalVariable('lineSelected') == "1") {
                    //src = src.replace("_light", "_dark");
                    element.classList.remove("red");
                    element.classList.add("green");
                } else {
                    element.classList.remove("red");
                    element.classList.add("green");
                }
                //$('#Line1').attr("src", src);
            } else {
                //var src = $('#Line1').attr('src');
                //src = src.replace('_red_', '_green_');
                var element = document.getElementById("cs_status");
                element.classList.remove("red");
                element.classList.add("green");
                if (getLocalVariable('lineSelected') == "1") {
                    //src = src.replace("_light", "_dark");
                } else {
                    //src = src.replace("_dark", "_light");
                }
                //$('#Line1').attr("src", src);
            }
            if (line2.length > 0) {
                //var src = $('#Line2').attr('src');
                //src = src.replace('_green_', '_red_');
                if (getLocalVariable('lineSelected') == "2") {
                    // src = src.replace("_light", "_dark");
                } else {
                    // src = src.replace("_dark", "_light");
                }
                //$('#Line2').attr("src", src);
            } else {
                //var src = $('#Line2').attr('src');
                //src = src.replace('_red_', '_green_');
                if (getLocalVariable('lineSelected') == "2") {
                    // src = src.replace("_light", "_dark");
                } else {
                    //src = src.replace("_dark", "_light");
                }
                //$('#Line2').attr("src", src);
            }

            var NextCsAction = getLocalVariable('NextCSAction');
            console.log("action cs lenth= " + NextCsAction);
            if (getLocalVariable('WaitingDisposition') == "false" && getLocalVariable('WaitingMoDisposition') == "false" && NextCsAction.length != 0) {
                var action = NextCsAction.split("!");
                setLocalVariable('NextCSAction', '');
                //alert("action "+action[0]);
                //  NextCsAction = '';
                switch ((action[0]).toLowerCase()) {
                    case 'logout':
                        alertify.error("Logging off as Admin requested!!!");
                        setTimeout(function () {
                            logout();
                        }, 2000);
                        break;
                    case 'mode':
                        alertify.error("Mode switch to " + ((action[1]).toUpperCase()) + " as Admin requested!!!");
                        var mode = (action[1]).toLowerCase().replace(/\b[a-z]/g, function (letter) {
                            return letter.toUpperCase();
                        });
                        if ($("#dial_mode option[value='" + mode + "']").length > 0) {
                            $("#dial_mode").val(mode);
                        } else {
                            mode = mode.toLowerCase();
                            if ($("#dial_mode option[value='" + mode + "']").length > 0) {
                                $("#dial_mode").val(mode);
                            } else {
                                mode = mode.toUpperCase();
                                $("#dial_mode").val(mode);
                            }
                        }
                        dialpad_setdialmode();
                        break;
                    case 'dial':
                        console.log("Cs Action Dial= " + JSON.stringify(action));
                        alertify.success("Dialing " + action[2] + " as Admin requested!!!");
                        $("#dialText").val(action[2]);
                        //setLocalVariable('ManualCallerID', action[3]);
                        logEntry("CS Action Attended Dial number " + action[2]);
                        DialByLine("audio", "", action[2], "", "", "MC");
                        break;
                    case 'redial':
                        //alertify.success("Call redial...");
                        alertify.success("Redialing " + action[1] + " as Admin requested!!!");
                        DialByLine("audio","",action[1],"","","RD",getLocalVariable('CRMDataID'));
                        logEntry("CS Action Redial number " + action[1]);
                        break;
                    case 'changecampaign':
                        var mode = (action[2]).split("~");
                        var mode_name = mode[1];
                        $.ajax({
                            url: "/validate-campaign-mode",
                            method: "POST",
                            data: { campaign: action[1], mode: mode_name, agent: getLocalVariable('USER_ID'), client_id: getLocalVariable('ClientID'), mo_panel: getLocalVariable('MOPanel') },
                            dataType: "JSON",
                            success: function (result) {
                                if (result.ok == true) {
                                    alertify.error("Changing Campaign to " + (action[1]).toUpperCase() + " and mode to " + (mode_name).toUpperCase() + " as Admin requested!!!");
                                    $('#dialpad_campaign').val(action[1].toLowerCase());
                                    if (typeof ($('#dialpad_campaign').val()) == "undefined" || $('#dialpad_campaign').val() == "null" || $('#dialpad_campaign').val() == null) {
                                        alertify.error('Campaign Not mapped to agent');
                                        $('#dialpad_campaign').val(getLocalVariable('CampaignName'));
                                    } else {
                                        dialpad_setcampaign();
                                        var mode = (mode_name).toLowerCase().replace(/\b[a-z]/g, function (letter) {
                                            return letter.toUpperCase();
                                        });
                                        $('#dial_mode option').filter(function () {
                                            return ($(this).val().toLowerCase() == mode.toLowerCase());
                                        }).prop('selected', true);
                                        setTimeout(dialpad_setdialmode(), 2000);
                                    }
                                } else {
                                    alertify.error(result.msg);
                                }

                            }
                        });

                        break;
                    default:
                        setLocalVariable('NextCSAction', '');
                        break;
                }
            }

            if (getLocalVariable('WaitingDisposition') == "true" && getLocalVariable('WaitingMoDisposition') == "false" && NextCsAction.length != 0) {
                var action = NextCsAction.split("!");
                console.log("Api Action= " + action);
                setLocalVariable('NextCSAction', '');
                NextCsAction = '';
                switch ((action[0]).toLowerCase()) {
                    case 'dispose':
                        alertify.success("Disposing the Call as Admin Requested!!!");
                        if (getLocalVariable('isLineBusy').toLowerCase() != "hangup") {
                            if (getLocalVariable('isLine2Busy').length > 0) {
                                setLocalVariable('lineSelected', 2);
                                endSession('cs_call');
                            }
                            setLocalVariable('lineSelected', 1);
                            endSession('cs_call');
                        }
                        if(getLocalVariable('isLineBusy')=='DIALING')
                        {
                            cancelSession('cs_call');
                        }
                        var disp = decodeURI(action[1]);
                        var subDisp = decodeURI(action[2]);
                        console.log(subDisp);
                        var crmid = action[3];
                        var data = $('#crm-form').serialize();
                        //alert("All dispose");
                        $('#top-crm-continer').css("display", "none");
                        $('.header_part').css("display", "none");
                        logEntry("CS Action Disposition Call");
                        is_callback=0;
                        updateCrm(data, 0, is_callback);
                        /**Dispose call */
                        dispositiondata(disp,subDisp);
                        
                        
                        
                    case 'hangup':
                        alertify.success("Hangup requested by Admin!!!");
                        var line = isNaN(parseInt(action[1])) ? 0 : parseInt(action[1]);
                        var lineSelected = line + 1;
                        setLocalVariable('lineSelected', lineSelected);
                        endSession('cs_call');
                        logEntry("CS Action Hangup Call");
                        //Call_Hangup();
                        break;
                    case 'mute':
                        alertify.success("Mute requested by Admin!!!");
                        setLocalVariable('isMute', 0);
                        MuteSession('cs_call');
                        logEntry("CS Action Mute Call");
                        break;
                    case 'unmute':
                        alertify.success("Unmute requested by Admin!!!");
                        setLocalVariable('isMute', 1);
                        UnmuteSession('cs_call');
                        logEntry("CS Action Unmute Call");
                        break;
                    case 'hold':
                        alertify.success("Hold requested by Admin!!!");
                        setLocalVariable('isHold', 0);
                        holdSession('cs_call');
                        logEntry("CS Action Hold Call");
                        break;
                    case 'unhold':
                        alertify.success("Unhold requested by Admin!!!");
                        setLocalVariable('isHold', 1);
                        unholdSession('cs_call');
                        logEntry("CS Action Unhold Call");
                        break;
                    case 'transfer':
                        alertify.success("Transferring call to " + action[1] + "!!!");
                        $("#dialText").val(action[1]);
                        var lineNum = getLocalVariable('Webrtc_dialline');
                        /** Call Transfer  developed by** */
                        BlindTransfer(lineNum, action[1]);
                        logEntry("CS Action Blind Transfer Call");
                        break;
                    case 'atdtransfer':
                        var NumberToDial2 = getLocalVariable('NumberToDial2');
                        if (NumberToDial2 == null || NumberToDial2 == '') {
                            alertify.error("Please connect two call for Attendent transfer");
                            logEntry("CS Action Attended Transferring Call");
                            return false;
                        } else {
                            alertify.success("Complete Attended Transferring Call to " + NumberToDial2 + "!!!");
                            var lineNum = getLocalVariable('Webrtc_dialline');
                            $("#line-" + lineNum + "-btn-complete-attended-transfer").trigger("click");
                            logEntry("CS Action Complete Attended Transferring Call to " + NumberToDial2 + "!!!");
                        }
                        break;
                    case 'callback':
                        alertify.success("Callback has been assigned by Admin");
                        var dataid = (typeof (action[4]) != "undefined" && !(isNaN(parseInt(action[4])))) ? action[4] : $('#crm-form #dataid').val();
                        recallActionByCS(action[1], action[2], action[3], dataid);
                        logEntry("CS Action Callback has been assigned by Admin");
                        //console.log("callback action 1= "+action[1]+" action 2= "+action[2]+" action 3= "+action[3]+" dataid= "+dataid+" action 4= "+action[4]+" action 5 "+action[5]+" action 6 "+action[6]+" action 7 "+action[7]);
                        break;
                    case 'redial':
                        alertify.success("Call redial...");
                       // alert("Redial number"+action[1]+"type"+action[0]);
                        DialByLine("audio","",action[1],"","","RD",getLocalVariable('CRMDataID'));
                        logEntry("CS Action Redial number " + action[1]);
                        break;
                    case 'dial':
                        if (getLocalVariable('isLine2Busy').length > 0) {
                            alertify.error("Can't dial another call");
                            break;
                        }
                        alertify.error("Dialing " + action[2] + " as Admin requested!!!");
                        $("#dialText").val(action[2]);

                        // setLocalVariable('ManualCallerID', action[3]);
                        logEntry("CS Action Attended Dial number " + action[2]);
                        DialByLine("audio", "", action[2]);
                        break;
                    default:
                        setLocalVariable('NextCSAction', '');
                        break;
                }
            }
            console.log("action cs lenth1= " + NextCsAction.length);
            if (getLocalVariable('UserMode').toUpperCase() == 'MO' && getLocalVariable('WaitingMoDisposition') == "false" && getLocalVariable('WaitingDisposition') == "false" && NextCsAction.length != 0) {
                var action = NextCsAction.split("!");
                if (getLocalVariable('active_panel') != 'showMoPanel' && ((action[0]).toLowerCase() == 'info' || (action[0]).toLowerCase() == 'coach' || (action[0]).toLowerCase() == 'barge')) {
                    alertify.error(action[0].toUpperCase() + " Request is there. Please go to MO tab.");
                } else {
                    setLocalVariable('NextCSAction', '');
                    NextCsAction = '';
                    getAgents();
                    switch ((action[0]).toLowerCase()) {
                        case 'barge':
                            var extension = (action[1]);
                            alertify.success("Barging Extension " + extension + "!!!");
                            mo_type_calling('BARGE', extension);
                            //getAgents(extension, 'barge');
                            logEntry("CS Action Barge Call");
                            break;
                        case 'coach':
                            var extension = (action[1]);
                            alertify.success("Coaching Extension " + extension + "!!!");
                            //getAgents(extension, 'coach');
                            mo_type_calling('COACH', extension);
                            logEntry("CS Action Coach Call");
                            break;
                        case 'info':
                            var extension = (action[1]);
                            alertify.success("Information sharing with Extension " + extension + "!!!");
                            //getAgents(extension, 'info');
                            mo_type_calling('INFO', extension);
                            logEntry("CS Action Info Call");
                            break;
                        default:
                            setLocalVariable('NextCSAction', '');
                            break;
                    }
                }
            }
            if ($('.circle-button.cs').hasClass('yellow')) {
                $('.circle-button.cs').removeClass('yellow');
            }
            if ($('.circle-button.cs').hasClass('red')) {
                $('.circle-button.cs').removeClass('red');
            }
            $('.circle-button.cs').addClass('green');
            if (getLocalVariable('isLineBusy') == 'HUNGUP' || getLocalVariable('isLineBusy') == "HANGUP") {
                setLocalVariable('isLineBusy', "HANGUP");
                $("#dialText").val('');
            }
            $('.line-status').html(getLocalVariable('isLineBusy'));
            if (getLocalVariable('hadConference') == '1') {
                $('.line-status').html(('Conference').toUpperCase());
            }
            //sidePanelValues();
            if (getLocalVariable('SipCheckStatus') == 'OK') {
                if ($('.circle-button.sip').hasClass('red')) {
                    $('.circle-button.sip').removeClass('red');
                }
                if ($('.circle-button.sip').hasClass('yellow')) {
                    $('.circle-button.sip').removeClass('yellow');
                }
                $('.circle-button.sip').addClass('green');
            } else {
                if ($('.circle-button.sip').hasClass('green')) {
                    $('.circle-button.sip').removeClass('green');
                }
                if ($('.circle-button.sip').hasClass('yellow')) {
                    $('.circle-button.sip').removeClass('yellow');
                }
                $('.circle-button.sip').addClass('red');
                //                blankStatus("SIP is not registered.");
            }
        }
    } else {
        if ($('.circle-button.cs').hasClass('yellow')) {
            $('.circle-button.cs').removeClass('yellow');
        }
        if ($('.circle-button.cs').hasClass('green')) {
            $('.circle-button.cs').removeClass('green');
        }
        $('.circle-button.cs').addClass('red');
        //        blankStatus("Control server not responding.");
    }
}

async function dialpad_setdialmode(dial_mode = '') {

    

    if (popUpOpened == 1) {
        return;
    }
    if (websocketConnected == 0) {
        return;
    }

    if (getLocalVariable('CampaignName') == '') {
        return;
    }

    if (getLocalVariable('WaitingDisposition') == "true") {
        blankStatus("Please Dispose the last call first...!");
        return false;
    }

    if (getLocalVariable('WaitingMoDisposition') == "true") {
        blankStatus("Please Save Remarks From Mo Panel...!");
        return false;
    }

    if (getLocalVariable('reviewMode') == "1") {
        alertify.error("Please exit the Review Mode.");
        return;
    }
    if (dial_mode == '') {
        user_set_mode = $("#dial_mode").val();
    } else {
        user_set_mode = dial_mode;
        $("#dial_mode").val(dial_mode);
    }
    var UserMode = getLocalVariable('UserMode');
    //alert("UserMode= "+user_set_mode);

    if (UserMode == user_set_mode) {
        alertify.error("Same Mode not Allowed!...");
        return false;
    }
    if (UserMode == 'Mo') {
        setLocalVariable('MOPanel', 1);
    }

    if (user_set_mode == 'Mo' && getLocalVariable('MOPanel') == 0) {
        alertify.error("Access Deny");
        return false;
    }

    if (user_set_mode.toUpperCase() == 'CALLBACK' && getLocalVariable('is_Recall') == 0) {
        alertify.error("Callback Mode Not Allowed In This Campaign...!");
        $("#dial_mode").val(UserMode);
        return false;
    }
    setLocalVariable('LastUserMode', UserMode);
    /** save caller id code Alok */
    get_permission();
    what_business_number();
    /** show skill list */
    skillqueue();
    /** load call log*/
    get_CallLog('0');
    $("#tbl_assigned").html('');
    $("#moinfo").html('');

    /** Show Route */
    routelist_data();
    $('#route_list_details').html('');
    /** End load call log*/

    //alert("UserMode2= "+user_set_mode+" LastUserMode= "+getLocalVariable('LastUserMode')+" UserMode=");
    var jsondata={
        agentPrefix: JSON.parse(getLocalVariable('agentPrefix')),
        DialedRoute: getLocalVariable('DialedRoute'),
        CBADialing: getLocalVariable('CBADialing'),
        CBIDialing: getLocalVariable('CBIDialing'),
        CBUDialing: getLocalVariable('CBUDialing'),
        CBSDialing: getLocalVariable('CBSDialing'),
        CBEDialing: getLocalVariable('CBEDialing'),
        CBQDialing: getLocalVariable('CBQDialing'),
        LastUserMode: getLocalVariable('LastUserMode'),
        UserModeIndexLabel: JSON.parse(getLocalVariable('UserModeIndexLabel')),
        modeLoginAtFullDate: getLocalVariable('modeLoginAtFullDate'),
        UserMode: user_set_mode,
        loginHourID: getLocalVariable('LoginHourID'),
        ModeDBId: getLocalVariable('ModeDBId'),
        emailCount: getLocalVariable('EMAIL_COUNT'),
        smsCount: getLocalVariable('SMS_COUNT'),
        idleDuration: getLocalVariable('Idle_Duration'),
        wrapupDuration: getLocalVariable('Wrapup_Duration'),
        holdCount: getLocalVariable('Hold_Count'),
        holdDuration: getLocalVariable('Hold_Duration'),
        recallCount: getLocalVariable('Recall_Count'),
        recallDuration: getLocalVariable('Recall_Duration'),
        breakDuration: getLocalVariable('Break_Duration'),
        moDuration: getLocalVariable('Mo_Duration'),
        transferCount: getLocalVariable('Transfer_Count'),
        SipCheckStatus: getLocalVariable('SipCheckStatus'),
        campaignType: getLocalVariable('Campaign_Type'),
        ManualCallerIDList: getLocalVariable('ManualCallerIDList'),
        Queue_Priority: JSON.parse(getLocalVariable('Queue_Priority')),
        IsDedicatedCLI: getLocalVariable('IsDedicatedCLI'),
        MOPanel: getLocalVariable('MOPanel'),
        ChatA: getLocalVariable('ChatA'),
        ChatLoginID: getLocalVariable('ChatLoginID'),
        lastQueuePause: getLocalVariable('lastQueuePause'),
        UserModeIndexID: JSON.parse(getLocalVariable('UserModeIndexID')),
        UserModeRecall: JSON.parse(getLocalVariable('UserModeRecall')),
        TMCCount: getLocalVariable('TMCCount'),
        TOBCount: getLocalVariable('TOBCount'),
        TIBCount: getLocalVariable('TIBCount'),
        TRCCount: getLocalVariable('TRCCount'),
        TTCCount: getLocalVariable('TTCCount'),
        TCCCount: getLocalVariable('TCCCount'),
        Call_Mc_Count: getLocalVariable('Call_Mc_Count'),
        Call_Ob_Count: getLocalVariable('Call_Ob_Count'),
        Call_In_Count: getLocalVariable('Call_In_Count'),
        Recall_Count: getLocalVariable('Recall_Count'),
        Conference_Count: getLocalVariable('Conference_Count'),
        is_Recall: getLocalVariable('is_Recall'),
        Recall_Reload_Duration: getLocalVariable('Recall_Reload_Duration'),
        userID: getLocalVariable('USER_ID'),
        CampaignName: getLocalVariable('CampaignName'),
        ClientID: getLocalVariable('ClientID'),
        isDisplayPhone: getLocalVariable('isDisplayPhone'),
        Callback_Auto: getLocalVariable('Callback_Auto'),
        LastRecallAlertId: getLocalVariable('LastRecallAlertId'),
        client_type: getLocalVariable('client_type'),
        WaitingDisposition: getLocalVariable('WaitingDisposition'),
        isLineBusy: getLocalVariable('isLineBusy'),
        LastModeBeforeRecall: getLocalVariable('LastModeBeforeRecall'),
        LastModeIndexBeforeRecall: getLocalVariable('LastModeIndexBeforeRecall'),
        SIP_ID: getLocalVariable('SIP_ID'),
        AS_ID: getLocalVariable('AS_ID'),
        SERVER_IP: getLocalVariable('SERVER_IP'),
        CS_API_Port: getLocalVariable('CS_API_Port'),
        Campaign_PreFix: getLocalVariable('Campaign_PreFix'),
        User_Status_ID: getLocalVariable('User_Status_ID'),
        NextUserMode: getLocalVariable('NextUserMode'),
        NextUserModeIndex: getLocalVariable('NextUserModeIndex'),
        CRMLeadId: getLocalVariable('CRMLeadId'),
        DialPad: getLocalVariable('DialPad'),
        IsLicenseActive: getLocalVariable('IsLicenseActive'),
        Campaign_DNC_Check: getLocalVariable('Campaign_DNC_Check'),
        DNCURL: getLocalVariable('DNCURL'),
        isRemoteDNC: getLocalVariable('isRemoteDNC'),
        RemoteDNCUrl: getLocalVariable('RemoteDNCUrl'),
        skill: JSON.parse(getLocalVariable('skill')),
        Manual_Dial_Route: getLocalVariable('Manual_Dial_Route'),
        Manual_Caller_ID: getLocalVariable('Manual_Caller_ID'),
        usermode: user_set_mode
    };
    logEntry("dialpad mode= "+JSON.stringify(jsondata));
    $.ajax({
        url: '/save-mode',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(jsondata),
        success: function(result) {
          
            if (result.ok == true) {
        
                if (Object.keys(result.data).length > 0) {
    
                    updateLocalVariables(result.data);
                }
                alertify.success("Mode Changed to " + getLocalVariable('UserMode'));
                if(getLocalVariable('UserMode')=='CALLBACK')
                {
                   $("#dial_mode").val('Callback');
                }else
                {
                    $("#dial_mode").val(getLocalVariable('UserMode'));
                }
                
               reset_field('No');
                /* show progressive div*/
                if (getLocalVariable('UserMode') == 'Progressive') {
                    $('#top-crm-continer3').css("display", "flex");
                } else {
                    $('#top-crm-continer3').css("display", "none");
                }
                dispose_show();
                /*** hive progressive div */
                $('#crm_div').hide();
    
                
                    /*********Set log entry**** */
                    let currentTime = new Date();
                    currentdb_datetime().then(function (data) {
                    console.log(data.msg); // Handle the returned data
                    logEntry("UserMode set log "+data.msg);
                    logEntry("UserMode set log localmachine= "+currentTime);
                    setLocalVariable("Review_Count", 0);
                    setLocalVariable("Review_Duration", 0);
                    setLocalVariable("Review_Counter", 0);
                    
                });
                    /*********End Set log entry**** */
            }
        },
        error: function(error) {
            alertify.error("Failed to send log: ",error);
        }
        });
        reset_auth();
        getManualCallerID();
        setLocalVariable("Campaign_Group", getLocalVariable('ManualCallerID2'));
        setLocalVariable("ManualCallerIDList", getLocalVariable('ManualCallerIDList2'));
        save_callerid();

}

async function callback_dialpad_setdialmode(dial_mode = '',set_callback = '') {



    //alert(dial_mode);
    //alert(set_callback);
    //console.log("callback_dialpad dialmode= "+dial_mode+ " set_callback= "+set_callback);
    
    if (popUpOpened == 1) {
        return;
    }
    if (websocketConnected == 0) {
        return;
    }

    if (getLocalVariable('CampaignName') == '') {
        return;
    }

    if (getLocalVariable('WaitingDisposition') == "true") {
        blankStatus("Please Dispose the last call first...!");
        return false;
    }

    if (getLocalVariable('WaitingMoDisposition') == "true") {
        blankStatus("Please Save Remarks From Mo Panel...!");
        return false;
    }

    if (getLocalVariable('reviewMode') == "1") {
        alertify.error("Please exit the Review Mode.");
        return;
    }
    if (dial_mode == '') {
        user_set_mode = $("#dial_mode").val();
    } else {
        user_set_mode = dial_mode;
        $("#dial_mode").val(dial_mode);
    }
    var UserMode = getLocalVariable('UserMode');
    if (UserMode == user_set_mode) {
        alertify.error("Same Mode not Allowed!...");
        return false;
    }
    if (UserMode == 'Mo') {
        setLocalVariable('MOPanel', 1);
    }

    if (user_set_mode == 'Mo' && getLocalVariable('MOPanel') == 0) {
        alertify.error("Access Deny");
        return false;
    }

    if (user_set_mode.toUpperCase() == 'CALLBACK' && getLocalVariable('is_Recall') == 0) {
        alertify.error("Callback Mode Not Allowed In This Campaign...!");
        $("#dial_mode").val(UserMode);
        return false;
    }
    setLocalVariable('LastUserMode', UserMode);
    /** save caller id code Alok */
    get_permission();
    what_business_number();
    /** show skill list */
    skillqueue();
    /** load call log*/
    get_CallLog('0');
    $("#tbl_assigned").html('');
    $("#moinfo").html('');

    /** Show Route */
    routelist_data();
    $('#route_list_details').html('');
    /** End load call log*/
    let inputdata={
        agentPrefix:JSON.parse(getLocalVariable('agentPrefix')),
        DialedRoute:getLocalVariable('DialedRoute'),
        CBADialing:getLocalVariable('CBADialing'),
        CBIDialing:getLocalVariable('CBIDialing'),
        CBUDialing:getLocalVariable('CBUDialing'),
        CBSDialing:getLocalVariable('CBSDialing'),
        CBEDialing:getLocalVariable('CBEDialing'),
        CBQDialing:getLocalVariable('CBQDialing'),
        LastUserMode: getLocalVariable('LastUserMode'),
        UserModeIndexLabel:JSON.parse(getLocalVariable('UserModeIndexLabel')),
        modeLoginAtFullDate:getLocalVariable('modeLoginAtFullDate'),
        UserMode:user_set_mode,
        loginHourID:getLocalVariable('LoginHourID'),
        ModeDBId:getLocalVariable('ModeDBId'),
        emailCount:getLocalVariable('EMAIL_COUNT'),
        smsCount:getLocalVariable('SMS_COUNT'),
        idleDuration:getLocalVariable('Idle_Duration'),
        wrapupDuration:getLocalVariable('Wrapup_Duration'),
        holdCount:getLocalVariable('Hold_Count'),
        holdDuration:getLocalVariable('Hold_Duration'),
        recallCount:getLocalVariable('Recall_Count'),
        recallDuration:getLocalVariable('Recall_Duration'),
        breakDuration:getLocalVariable('Break_Duration'),
        moDuration:getLocalVariable('Mo_Duration'),
        transferCount:getLocalVariable('Transfer_Count'),
        SipCheckStatus:getLocalVariable('SipCheckStatus'),
        campaignType:getLocalVariable('Campaign_Type'),
        ManualCallerIDList:getLocalVariable('ManualCallerIDList'),
        Queue_Priority:JSON.parse(getLocalVariable('Queue_Priority')),
        IsDedicatedCLI:getLocalVariable('IsDedicatedCLI'),
        MOPanel:getLocalVariable('MOPanel'),
        ChatA:getLocalVariable('ChatA'),
        ChatLoginID:getLocalVariable('ChatLoginID'),
        lastQueuePause:getLocalVariable('lastQueuePause'),
        UserModeIndexID:JSON.parse(getLocalVariable('UserModeIndexID')),
        UserModeRecall:JSON.parse(getLocalVariable('UserModeRecall')),
        TMCCount:getLocalVariable('TMCCount'),
        TOBCount:getLocalVariable('TOBCount'),
        TIBCount:getLocalVariable('TIBCount'),
        TRCCount:getLocalVariable('TRCCount'),
        TTCCount:getLocalVariable('TTCCount'),
        TCCCount:getLocalVariable('TCCCount'),
        Call_Mc_Count:getLocalVariable('Call_Mc_Count'),
        Call_Ob_Count:getLocalVariable('Call_Ob_Count'),
        Call_In_Count:getLocalVariable('Call_In_Count'),
        Recall_Count:getLocalVariable('Recall_Count'),
        Conference_Count:getLocalVariable('Conference_Count'),
        is_Recall:getLocalVariable('is_Recall'),
        Recall_Reload_Duration:getLocalVariable('Recall_Reload_Duration'),
        userID:getLocalVariable('USER_ID'),
        CampaignName:getLocalVariable('CampaignName'),
        ClientID:getLocalVariable('ClientID'),
        isDisplayPhone:getLocalVariable('isDisplayPhone'),
        Callback_Auto:getLocalVariable('Callback_Auto'),
        LastRecallAlertId:getLocalVariable('LastRecallAlertId'),
        client_type:getLocalVariable('client_type'),
        WaitingDisposition:getLocalVariable('WaitingDisposition'),
        isLineBusy:getLocalVariable('isLineBusy'),
        LastModeBeforeRecall:getLocalVariable('LastModeBeforeRecall'),
        LastModeIndexBeforeRecall:getLocalVariable('LastModeIndexBeforeRecall'),
        SIP_ID:getLocalVariable('SIP_ID'),
        AS_ID:getLocalVariable('AS_ID'),
        SERVER_IP:getLocalVariable('SERVER_IP'),
        CS_API_Port:getLocalVariable('CS_API_Port'),
        Campaign_PreFix:getLocalVariable('Campaign_PreFix'),
        User_Status_ID:getLocalVariable('User_Status_ID'),
        NextUserMode:getLocalVariable('NextUserMode'),
        NextUserModeIndex:getLocalVariable('NextUserModeIndex'),
        CRMLeadId:getLocalVariable('CRMLeadId'),
        DialPad:getLocalVariable('DialPad'),
        IsLicenseActive:getLocalVariable('IsLicenseActive'),
        Campaign_DNC_Check:getLocalVariable('Campaign_DNC_Check'),
        DNCURL:getLocalVariable('DNCURL'),
        isRemoteDNC:getLocalVariable('isRemoteDNC'),
        RemoteDNCUrl:getLocalVariable('RemoteDNCUrl'),
        skill:JSON.parse(getLocalVariable('skill')),
        Manual_Dial_Route:getLocalVariable('Manual_Dial_Route'),
        Manual_Caller_ID:getLocalVariable('Manual_Caller_ID'),
        usermode: user_set_mode
    };
    //console.log("input callback= "+JSON.stringify(inputdata));
    logEntry("Usermode callback= "+JSON.stringify(inputdata));
    $.ajax({
        url: '/save-mode',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(inputdata),
        success: function(result) {
          
            if (result.ok == true) {
                if (Object.keys(result.data).length > 0) {
                    updateLocalVariables(result.data);
                }
                alertify.success("Mode Changed to " + getLocalVariable('UserMode'));
                $("#dial_mode").val(user_set_mode);
                reset_field('No');
                /* show progressive div*/
                if (getLocalVariable('UserMode') == 'Progressive') {
                    $('#top-crm-continer3').css("display", "flex");
                } else {
                    $('#top-crm-continer3').css("display", "none");
                }
                dispose_show();
                /*** hive progressive div */
                $('#crm_div').hide();
                if(set_callback=='set_callback_mode')
                {
                    setLocalVariable("set_callback_mode", "Yes");
                }
                /*********Set log entry**** */
                let currentTime = new Date();
                currentdb_datetime().then(function (data) {
                console.log(data.msg); // Handle the returned data
                logEntry("UserMode set log "+data.msg);
                logEntry("UserMode set log localmachine= "+currentTime);
                });
                /*********End Set log entry**** */
            }
        },
        error: function(error) {
            alertify.error("Failed to send log: ",error);
        }
        });
        getManualCallerID();
        setLocalVariable("Campaign_Group", getLocalVariable('ManualCallerID2'));
        setLocalVariable("ManualCallerIDList", getLocalVariable('ManualCallerIDList2'));
        save_callerid();
   
}

function getAgents(extension = '', action = '') {
    if (getLocalVariable('active_panel') == 'showMoPanel') {
        setTimeout("getAgents()", 3000);
        var campaign = $('select#mo-campaign').val();
        var SIP_ID = getLocalVariable('SIP_ID');
        var SERVER_IP =getLocalVariable('SERVER_IP');
        var CS_API_Port= getLocalVariable('CS_API_Port');
        var USER_ID= getLocalVariable('USER_ID');
        var isDisplayPhone= getLocalVariable('isDisplayPhone');
        var  ClientID= getLocalVariable('ClientID');
        if (!(typeof (campaign) == "undefined" || campaign == '')) {
        inputdata={SIP_ID:SIP_ID,SERVER_IP:SERVER_IP,CS_API_Port:CS_API_Port,USER_ID:USER_ID,isDisplayPhone:isDisplayPhone,ClientID:ClientID,campaign:campaign};
        $.ajax({
            url:"/api_calling/getLiveStatusCampaign",
            method:"POST",
            data:inputdata,
            dataType:"JSON",
            success:function(result)
            { 
                if (result.ok == true) {
                    if (result.hasOwnProperty('MoCampaign')) {
                        setLocalVariable('MoCampaign', result.MoCampaign);
                    }
                    $('#mo-table tbody').html(result.str);
                    if (extension.length > 0) {
                        $('#mo-table tbody tr').each(function (e) {
                            if ($(this).attr("custom-attr") == extension) {
                                $('#selectedID').val($(this).attr('id'));
                            }
                        });
                        $('#' + action).trigger("click");
                    }
                    var selectedID = $('#selectedID').val();
                    if (selectedID.length > 0) {
                        $('#' + selectedID).addClass("mo-table-active");
                    }
                }  
            }
        })
        /*requeststhroughAjax({
            tag: 'campaign-mo',
            SIP_ID: getLocalVariable('SIP_ID'),
            SERVER_IP: getLocalVariable('SERVER_IP'),
            CS_API_Port: getLocalVariable('CS_API_Port'),
            USER_ID: getLocalVariable('USER_ID'),
            isDisplayPhone: getLocalVariable('isDisplayPhone'),
            ClientID: getLocalVariable('ClientID'),
            campaign: campaign
        }, function (result) {
            if (result.ok == true) {
                if (result.hasOwnProperty('MoCampaign')) {
                    setLocalVariable('MoCampaign', result.MoCampaign);
                }
                $('#mo-table tbody').html(result.str);
                if (extension.length > 0) {
                    $('#mo-table tbody tr').each(function (e) {
                        if ($(this).attr("custom-attr") == extension) {
                            $('#selectedID').val($(this).attr('id'));
                        }
                    });
                    $('#' + action).trigger("click");
                }
                var selectedID = $('#selectedID').val();
                if (selectedID.length > 0) {
                    $('#' + selectedID).addClass("mo-table-active");
                }
            }
        });*/

        }
        
    }
}


function getNotificationForNewLead() {
    setTimeout(getNotificationForNewLead, parseInt(getLocalVariable('leadAssignTime')) * 60 * 1000);
    if (getLocalVariable('getNotificationInMode') == "true" && parseInt(getLocalVariable('leadAssignTime')) > 0) {

        let jsondata= {campaign:getLocalVariable('CampaignName'),agent:getLocalVariable('USER_ID'),ClientID:getLocalVariable('ClientID')};

        $.ajax({
            url: '/get-notification',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(jsondata),
            success: function(result) {
                if (result.hasOwnProperty('previousSQL')) {
                    cupdateLocalVariables({ previousSQL: result.previousSQL });
                }
                if (result.hasOwnProperty('newleadassigned')) {
                    if (result.newleadassigned.length > 0) {
                        toastr.options = {
                            "closeButton": false,
                            "debug": false,
                            "newestOnTop": false,
                            "progressBar": true,
                            "positionClass": "toast-bottom-right",
                            "preventDuplicates": true,
                            "onclick": null,
                            "showDuration": "300",
                            "hideDuration": "1000",
                            "timeOut": "5000",
                            "extendedTimeOut": "1000",
                            "showEasing": "swing",
                            "hideEasing": "linear",
                            "showMethod": "fadeIn",
                            "hideMethod": "fadeOut"
                        };
                        toastr["warning"]("New data assigned for lead " + result.newleadassigned, "New Lead Assigned");
                    }
                }
            },
            error: function(error) {
                alertify.error("Failed to send log: ",error);
            }
        });
        
    }
}

function getManualCallerID() {
    if (typeof (getLocalVariable('all_campaign_group')) != "undefined") {
        var groups = JSON.parse(getLocalVariable('all_campaign_group'));
        console.log(JSON.stringify(groups));
        var group = Object.keys(groups);
        setLocalVariable('Campaign_Group', group[0]);
        setLocalVariable('ManualCallerID2', group[0]);
        var callerID = groups[group[0]];
        setLocalVariable('ManualCallerIDList', callerID);
        setLocalVariable('ManualCallerIDList2', callerID);
        setLocalVariable('ManualCallerID', callerID);
        if (getLocalVariable('manualRouteSelect') == "1") {
            $('#route-name').html('');
            var html = "<option value=''></option>";
            for (var i in group) {
                html += "<option value='" + group[i] + "'>" + group[i] + "</option>";
            }
            $('#route-name').html(html);
        }
        $('#route-select-img').attr('title', "Route: " + getLocalVariable('Campaign_Group') + "\nDID: " + getLocalVariable('ManualCallerID'));
    }
}
function formatDateTime() {
    // Extracting date components
    var date = new Date();
    var day = date.getDate().toString().padStart(2, '0');
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var year = date.getFullYear().toString().substring(2);

    // Extracting time components
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    var seconds = date.getSeconds().toString().padStart(2, '0');

    // Constructing the formatted date and time string
    var formattedDateTime = day + '-' + month + '-' + year + ' ' + hours + ':' + minutes + ':' + seconds;

    return formattedDateTime;
}
function dialpadtimer(dateStr) {
    var date = new Date(dateStr);
    var hours = date.getHours().toString().padStart(2, '0');
    var minutes = date.getMinutes().toString().padStart(2, '0');
    var seconds = date.getSeconds().toString().padStart(2, '0');
    var timeStr = `${hours} : ${minutes} : ${seconds}`;
    return timeStr;
}
function secondsToHms(seconds) {
    seconds = Number(seconds);
    var h = Math.floor(seconds / 3600);
    var m = Math.floor(seconds % 3600 / 60);
    var s = Math.floor(seconds % 3600 % 60);

    // Add leading zeros to single digit hours, minutes, or seconds
    var hDisplay = h < 10 ? "0" + h : h;
    var mDisplay = m < 10 ? "0" + m : m;
    var sDisplay = s < 10 ? "0" + s : s;
    return hDisplay + " : " + mDisplay + " : " + sDisplay;
}
////call timer data
showtimer();
function showtimer() {
    //console.log("call showtimer function");
    setTimeout("showtimer()", 1000);
    $('#logintimer').html(dialpadtimer(getLocalVariable('LoginAtFullDate')));
    $('#loginmode').html(dialpadtimer(getLocalVariable('modeLoginAtFullDate')));
    //console.log("current timer "+getLocalVariable('CurrentAgentStateTime'));
    let currentAgentStateTime = getLocalVariable('CurrentAgentStateTime');
    if (isNaN(currentAgentStateTime) || currentAgentStateTime === '' || currentAgentStateTime < 0) {
        setLocalVariable('CurrentAgentStateTime', 0);
        currentAgentStateTime = 0;
        //console.log("current timer1 " + secondsToHms(currentAgentStateTime));
    }
    $('#login_duration').html(secondsToHms(currentAgentStateTime));
    $('#show_user').html(getLocalVariable('USER_NAME'));
    $('#show_extn').html(getLocalVariable('SIP_ID'));
    $('#show_camp').html(getLocalVariable('CampaignName'));
    $('#show_mode').html(getLocalVariable('UserMode'));
    $('#calling_state').html(getLocalVariable('recent_call_status'));
    if (getLocalVariable('isLineBusy') == 'READY') {
        $('#calling_status').html('<span style="color:green">' + getLocalVariable('isLineBusy') + '</span>');
    } else {
        $('#calling_status').html('<span style="color:red">' + getLocalVariable('isLineBusy') + '</span>');
    }


    if (getLocalVariable('WaitingDisposition') == 'true') {
        if (getLocalVariable('isDisplayPhone') == 'false' || getLocalVariable('isDisplayPhone') == false) {
            $('#show_dial_phone').html('XXXXXXXXXX');
            console.log("Mask number");
        } else {
            $('#show_dial_phone').html(getLocalVariable('NumberToDial'));
            console.log("No Mask number");
        }
        if (getLocalVariable('queue_did_name') == '') {
            $('#show_queue').html(getLocalVariable('ManualCallerID'));
            $('#webrtct_did_name').html(getLocalVariable('ManualCallerID'));
        } else {
            $('#show_queue').html(getLocalVariable('queue_did_name'));
            if(getLocalVariable('CALL_TYPE') != 'TQ')
            {
                $('#webrtct_did_name').html(getLocalVariable('queue_did_name'));
            }
        }
        $('#show_did').html(getLocalVariable('ManualCallerID'));
        $('#show_call_type').html(getLocalVariable('CALL_TYPE'));

    }



    $('#show_ipaddress').html(getLocalVariable('MYIP'));
    $('#manual_calling').html(getLocalVariable('Call_Mc_Count'));
    $('#outbound_calling').html(getLocalVariable('Call_Ob_Count'));
    $('#inbound_calling').html(getLocalVariable('Call_In_Count'));
    $('#callback_calling').html(getLocalVariable('Recall_Count'));
    $('#transfer_calling').html(getLocalVariable('Transfer_Count'));
    $('#conference_calling').html(getLocalVariable('Conference_Count'));
    if (getLocalVariable('isLineBusy') != 'READY' && getLocalVariable('isLineBusy') == 'HANGUP' && getLocalVariable('WaitingDisposition') == "true") {
        if (getLocalVariable('AutoDispTimeDiff') == 0) {
            $('#Autodispose_timer').html("");
        } else {
            $('#Autodispose_timer').html("<b style='background:green; color:#fff; padding:10px;'>AUTO Dispose in " + getLocalVariable('AutoDispTimeDiff') + " s </b>");
        }

    }
    else if (getLocalVariable('AutoDispTimeDiff') == 0) {
        $('#Autodispose_timer').html("");
    }
    else {
        $('#Autodispose_timer').html("");

    }
}

function showMoPanel() {
    if (popUpOpened == 1) {
        return;
    }
    if (getLocalVariable('CampaignName') == '' || getLocalVariable('UserMode') == '') {
        return;
    }
    if (getLocalVariable('MOPanel') != 1) {
        alertify.error("Access Denied");
        return false;
    }
    if (getLocalVariable('UserMode') != 'Mo') {
        alertify.error("Please select the 'Mo' Mode");
        return false;
    }
    setLocalVariable('active_panel', 'showMoPanel');
    // alert(webURL);
    $("#moinfo").html("loading...!");

    $.ajax({
        url: "/mo", success: function (result) {
            //alert(result);
            $("#moinfo").html(result);
            getCampaigns();
        }
    });

}


function getCampaigns() {
    //alert("getCampaigns");
    let json_input={
        username:getLocalVariable('USER_ID'),
        client_id:getLocalVariable('ClientID'),
        CampaignName:getLocalVariable('CampaignName')
    };
    $.ajax({
        url:"/api_calling/campaign_list",
        method:"POST",
        data:json_input,
        dataType:"JSON",
        success:function(result)
        {
            if (result.length == 0) {
                return;
            }
            if (result.ok == true) {
                if (Object.keys(result).length > 0) {
                    updateLocalVariables(result);
                }
                var campaign = result.campaign;
                var str = "<option value=''>Select Campaign</option>";
                var str1 = "<option value=''>Select Campaign</option>";
                for (var s in campaign) {
                    str += "<option value='" + campaign[s].campaign_id + "'>" + campaign[s].campaign_id + "</option>";
                    str1 += "<option value='" + campaign[s].campaign_id + "~"+campaign[s].campaign_type+"'>" + campaign[s].campaign_id + "</option>";
                }
                $('#campaign').html(str1);
                //alert("hello"+str1);
                if (getLocalVariable('active_panel') == 'showMoPanel') {
                    $('#mo-campaign').html(str);
                }
                if (getLocalVariable('active_panel') == 'showChat') {
                    $('#cmp').html(str);
                    $('#cmp').val(getLocalVariable('CampaignName'));
                }
                $('#dialpad_campaign').html(str);
                if (getLocalVariable('CampaignName') != '') {
                    $('#dialpad_campaign').val(getLocalVariable('CampaignName'));
                    if (getLocalVariable('active_panel') == 'showMoPanel') {
                        $('#mo-campaign').val(getLocalVariable('CampaignName'));
                    }
                }
            }
        }
    })
}


/** Logout function */
async function logout(tag = '') {
    // End the session
    endSession('cs_call');
    // Get all the necessary variables
    let clientID = getLocalVariable('ClientID');
    let AS_ID = getLocalVariable('AS_ID');
    let CampaignName = getLocalVariable('CampaignName');
    let USER_ID = getLocalVariable('USER_ID');
    let SIP_ID = getLocalVariable('SIP_ID');
    let Campaign_Type = getLocalVariable('Campaign_Type');
    let LoginHourID = getLocalVariable('LoginHourID');
    let ModeDBId = getLocalVariable('ModeDBId');
    let MYIP = getLocalVariable('MYIP');
    let ChatLoginID = getLocalVariable('ChatLoginID');
    let emailCount = getLocalVariable('emailCount');
    let smsCount = getLocalVariable('smsCount');
    let idleDuration = getLocalVariable('idleDuration');
    let wrapupDuration = getLocalVariable('wrapupDuration');
    let holdCount = getLocalVariable('holdCount');
    let holdDuration = getLocalVariable('holdDuration');
    let recallCount = getLocalVariable('recallCount');
    let recallDuration = getLocalVariable('recallDuration');
    let breakDuration = getLocalVariable('breakDuration');
    let moDuration = getLocalVariable('moDuration');
    let transferCount = getLocalVariable('transferCount');
    let userStatusID = getLocalVariable('userStatusID');
    let SERVER_IP = getLocalVariable('SERVER_IP');
    let ActivityID = getLocalVariable('ActivityID');
    let getNotificationInMode = getLocalVariable('getNotificationInMode');
    let leadAssignTime = getLocalVariable('leadAssignTime');
    let previousSQL = getLocalVariable('previousSQL');
    let CS_API_Port = getLocalVariable('CS_API_Port');
    let Manual_Caller_ID = getLocalVariable('Manual_Caller_ID');

    const jsonData = {
        clientID, AS_ID, CampaignName, USER_ID, SIP_ID, Campaign_Type, LoginHourID, ModeDBId,
        MYIP, ChatLoginID, emailCount, smsCount, idleDuration, wrapupDuration, holdCount,
        holdDuration, recallCount, recallDuration, breakDuration, moDuration, transferCount,
        userStatusID, SERVER_IP, ActivityID, getNotificationInMode, leadAssignTime, previousSQL,
        CS_API_Port, Manual_Caller_ID
    };

   

    var json_inout = {client_id: clientID,exten: SIP_ID,campaign: CampaignName,agent: USER_ID,SERVER_IP: SERVER_IP,CS_API_Port: CS_API_Port};

    try {
        // Perform the AJAX request
        
        $.ajax({url:"/remove-agent",method:"POST",data:json_inout,dataType:"JSON",success:function(result){ console.log(result); }});

        // Perform the fetch request after successful AJAX
        const response = await fetch('/agent_logout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        if (data.status === 1) {
            if (tag === 'reload') {
                page_refresh_log();
                localStorage.clear();
            }
            location.replace("/logout");
        }
    } catch (error) {
        alertify.error(error);
    }
}





function dialpad_setcampaign() {
    get_CallLog('0');
    $("#tbl_assigned").html('');
    if (popUpOpened == 1) {
        return false;
    }

    if (getLocalVariable('CampaignName') == '') {
        return false;
    }

    if (getLocalVariable('WaitingDisposition') == "true" || getLocalVariable('WaitingMoDisposition') == "true") {
        alertify.error("Please Dispose the last call first...!");
        return false;
    }

    if (getLocalVariable('reviewMode') == "1") {
        alertify.error("Please exit the Review Mode.");
        return;
    }

    if (getLocalVariable('CampaignName') == $("#dialpad_campaign").val()) {
        alertify.error("Same Campaign not Allowed!...");
        return false;
    }

    if (($.trim($("#dialpad_campaign").val()).length == 0)) {
        alertify.error("Please Select Campaign!...");
        $('#dialpad_campaign').focus();
        return false;
    }
    /** Show Route */
    routelist_data();
    /** show skill list */
    skillqueue();
    $('#route_list_details').html('');
    let inputdata={ClientID: getLocalVariable('ClientID'),SIP_ID: getLocalVariable('SIP_ID'),CampaignName: getLocalVariable('CampaignName'),
        USER_ID: getLocalVariable('USER_ID'),SERVER_IP: getLocalVariable('SERVER_IP'),CS_API_Port: getLocalVariable('CS_API_Port')};
    //Removing Agent form the queue.
    //alert("hello");
    $.ajax({
        url:"/api_calling/remove-agent",
        method:"POST",
        data:inputdata,
        dataType:"JSON",
        success:function(result)
        { 
            //alert("result");
        }
    })
   
    setLocalVariable('PreviousCampaignName', getLocalVariable('CampaignName'));
    setLocalVariable('CampaignName', $("#dialpad_campaign").val());
    var input_array={
        WaitingMoDisposition:getLocalVariable('WaitingMoDisposition'),
        WaitingDisposition:getLocalVariable('WaitingDisposition'),
        AS_ID:getLocalVariable('AS_ID'),
        SIP_ID:getLocalVariable('SIP_ID'),
        ClientID:getLocalVariable('ClientID'),
        User_Status_ID:getLocalVariable('User_Status_ID'),
        USER_ID:getLocalVariable('USER_ID'),
        CampaignName:getLocalVariable('CampaignName'),
        Campaign_Type:getLocalVariable('Campaign_Type'),
        SERVER_IP:getLocalVariable('SERVER_IP'),
        CS_API_Port:getLocalVariable('CS_API_Port'),
        previousSQL:getLocalVariable('previousSQL'),
        getNotificationInMode:getLocalVariable('getNotificationInMode'),
        leadAssignTime:getLocalVariable('leadAssignTime'),
        PreviousCampaignName: getLocalVariable('PreviousCampaignName')
    };

    $.ajax({
        url: '/save-campaign',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(input_array),
        success: function(result) {

            $('#crm_div').hide();
        if (result.ok == true) {
            showChatwebRtc();
            if (Object.keys(result.data).length > 0) {
                updateLocalVariables(result.data);
            }
            /** save caller id code by alok */
            save_callerid();
            if (getLocalVariable('UserMode') == 'Progressive') {
                $('#top-crm-continer3').css("display", "flex");
            } else {
                $('#top-crm-continer3').css("display", "none");
            }
            /** end code */
            setLocalVariable('DialedRoute', '');
            alertify.success("Campaign Changed to " + getLocalVariable('CampaignName').toUpperCase());
            if (getLocalVariable('Campaign_Type') == 'AB' || getLocalVariable('Campaign_Type') == 'SB' || getLocalVariable('Campaign_Type') == 'SD' || getLocalVariable('Campaign_Type') == 'SR') {
                $('#my-queue').show();
            } else {
                $('#my-queue').hide();
            }
            let ClientID=getLocalVariable('ClientID');
            let  USER_ID= getLocalVariable('USER_ID');
            let CampaignName= getLocalVariable('CampaignName');
            let AS_ID= getLocalVariable('AS_ID');
            let Campaign_Type= getLocalVariable('Campaign_Type');
            let PreviousCampaignName= getLocalVariable('PreviousCampaignName');
            let User_Status_ID= getLocalVariable('User_Status_ID');
            let data_record = {ClientID:ClientID,USER_ID:USER_ID,CampaignName:CampaignName,AS_ID:AS_ID,Campaign_Type:Campaign_Type,PreviousCampaignName:PreviousCampaignName,User_Status_ID:User_Status_ID};
            $.ajax({
                url: '/get-usermode',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(data_record),
                success: function(resultmode) {
                if (resultmode.ok == true) {
                    if (Object.keys(resultmode.data).length > 0) {
                        updateLocalVariables(resultmode.data);
                    }
                    var str = "<option value=''>Select UserMode</option>";
                    var label = JSON.parse(getLocalVariable('UserModeIndexLabel'));
                    for (var l in label) {
                        str += "<option value='" + label[l] + "'>" + label[l] + "</option>";
                    }
                    $('#dial_mode').html(str);
                }
                 
                },
                error: function(error) {
                    alertify.error("Failed to send log: ",error);
                }
                });
            getCallForward();
            $('#manual-did').html('');
            setLocalVariable('Manual_Caller_ID', '');
            setLocalVariable('Manual_Dial_Route', '');
            getManualCallerID();
            $('.fa-eye-slash').trigger('click');
            getSkillDivDisplay();
            reset_field('No');
        }
          
        },
        error: function(error) {
            alertify.error("Failed to send log: ",error);
        }
        });
    //console.log("input array= "+JSON.stringify(input_array));
    
}

function success_alertify_toast(msg) {
    Command: toastr["success"](msg)
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
}
function error_alertify_toast(msg) {

    Command: toastr["error"](msg)
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
}
function warn_alertify(msg) {
    Command: toastr["warning"](msg)
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "5000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    }
}
function dispose_show() {
    var user_id = localStorage.getItem("USER_ID");
    var client_id = localStorage.getItem("ClientID");
    var campaign_name = localStorage.getItem("CampaignName");
    $("#tree_node_id").val(0);
    $("#disposition").html("<option value=''> Select Disposition</option>");
    $("#disposition-disposition-search").html("<option value=''> Select Disposition</option>");

    $.ajax({
        url: "/api_calling/disposition_list",
        method: "POST",
        data: { user_id: user_id, client_id: client_id, campaign_name: campaign_name },
        dataType: "JSON",
        success: function (data) {
            console.log(JSON.stringify(data));
            disposition_data = data.CRM_Disposition;
            console.log("disposition length= " + disposition_data);
            $("#disposition").attr('disabled', false);
            $("#disposition-disposition-search").attr('disabled', false);
            var str = "";
            $.each(disposition_data, function (key, value) {
                str += "<option value='" + value + "'>" + value + "</option>";
            });
            $("#disposition").append(str);
            $("#disposition-disposition-search").append(str);
        }
    })
}
function tree_dispose_show() {
    var client_id = localStorage.getItem("ClientID");
    var tree_node_id = $("#main_tree_node_id").val();
    console.log("Call tree_dispose_show AND Node id"+tree_node_id);
    var campaign_name = localStorage.getItem("CampaignName");
    $("#disposition").html("<option value=''> Select Disposition</option>");
    $.ajax({
        url: "/api_calling/tree_disposition_list",
        method: "POST",
        data: {node_id:tree_node_id,client_id:client_id,campaign_name:campaign_name},
        dataType: "JSON",
        success: function (data) {
            console.log(JSON.stringify(data));
            disposition_data = data.CRM_Disposition;
            $("#disposition").attr('disabled', false);
            var str = "";
            $.each(disposition_data, function (key, value) {
                str += "<option value='" + value + "'>" + value + "</option>";
            });
            $("#disposition").append(str);
        }
    })
}
/*** code by Jainul*** */
function preview_dispose_show() {
    var user_id = localStorage.getItem("USER_ID");
    var client_id = localStorage.getItem("ClientID");
    var campaign_name = localStorage.getItem("CampaignName");
    $.ajax({
        url: "/api_calling/disposition_list",
        method: "POST",
        data: { user_id: user_id, client_id: client_id, campaign_name: campaign_name },
        dataType: "JSON",
        success: function (data) {
            console.log(JSON.stringify(data));
            disposition_data = data.CRM_Disposition;
            $("#preview-disposition").html('<option value="">Select Disposition </option>');
            $.each(disposition_data, function (key, value) {
                $("#preview-disposition").append('<option value="' + value + '">' + value + '</option>');
            });
            $("#review-disposition").html('<option value="">Select Disposition</option>');
            $.each(disposition_data, function (key, value) {
                $("#review-disposition").append('<option value="' + value + '">' + value + '</option>');
            });
        }
    })
}
function preview_skill_show() {
    var jsonData = { client_id: getLocalVariable('ClientID'), campaign: getLocalVariable('CampaignName'), user_id: getLocalVariable('USER_ID') };
    fetch('/user_skill', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonData) }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        if (data.status == 1) {
            var jsonData = data.data;
            var str = "<option value='0'>Select Skill</option>";
            $.each(jsonData, function (key, value) {
                str += "<option value='" + value['skill'] + "'>" + value['skill'] + "</option>";
            });
            $('#preview-skill').html(str);
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}
function preview_file_show() {
    var jsonData = { client_id: getLocalVariable('ClientID'), campaign: getLocalVariable('CampaignName'), user_id: getLocalVariable('USER_ID') };
    fetch('/lead_file', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonData) }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        if (data.status == 1) {
            var jsonData = data.data;
            var str = "<option value='0'>Select File</option>";
            $.each(jsonData, function (key, value) {
                str += "<option value='" + value['lead_name'] + "'>" + value['lead_name'] + "</option>";
            });
            $('#preview_file').html(str);
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}
/*** End code by Jainul*** */
/*** Display caller log */


function dispositiondata(disp='',sub_disposition='') {
    queueAdd('queue_inactive');
    endSession('cs_call');
    if(getLocalVariable('isLineBusy')=='DIALING')
    {
        cancelSession('cs_call');
    }
    var sendlist = {
        type: 'agentstatus',
        status: 'READY',
        line2: getLocalVariable('isLine2Busy'),
        phone2: getLocalVariable('NumberToDial2'),
        phone: getLocalVariable('NumberToDial'),
        client_id: getLocalVariable('ClientID'),
        exten: getLocalVariable('SIP_ID'),
        campaign: getLocalVariable('CampaignName'),
        agent: getLocalVariable('USER_ID'),
        mode: getLocalVariable('UserModeIndex'),
        did_number: getLocalVariable('ManualCallerIDList'),
        recall: getLocalVariable('Recall_Count'),
        transfer: getLocalVariable('Transfer_Count'),
        conference: getLocalVariable('Conference_Count'),
        login_id: getLocalVariable('LoginHourID'),
        action_id: getLocalVariable('ModeDBId'),
        manual: getLocalVariable('Call_Mc_Count'),
        outbound: getLocalVariable('Call_Ob_Count'),
        inbound: getLocalVariable('Call_In_Count'),
        modeduration: getLocalVariable('CurrentAgentStateTime'),
        skill: getLocalVariable('crm_skill')
    }
    if (websocketConnected == 1) {

        console.log("DisposeAll= " + JSON.stringify(sendlist));
        websocket.send(JSON.stringify(sendlist));

        var Campaign_name = window.localStorage.getItem('CampaignName');
        var sip_id = window.localStorage.getItem('SIP_ID');
        var client_id = window.localStorage.getItem('ClientID');
        var lead_id = Campaign_name.toUpperCase() + "_MANUAL";
        var disposition = (disp === '') ? $('#disposition').val() : disp;
        var sub_disp = (sub_disposition === '') ? $('#sub_disposition').val() : sub_disposition;
        var remarks = $('#remarks').val();
        var rid = getLocalVariable('RecordID');
        var skill = getLocalVariable('crm_skill');
        var did = window.localStorage.getItem('CRMDataID');

        var jsonData = { did: did, lead_id: lead_id, remarks: remarks, disposition: disposition, sub_disp: sub_disp, rid: rid, sip_id: sip_id, client_id: client_id, skill: skill };
        console.log("dispose data for disposition" + JSON.stringify(jsonData));
        fetch('/api_calling/save_disposition_data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonData) }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(data => {
            if (data.status == 1) {
                
                setLocalVariable('AutoDisposeTime', 0);
                setLocalVariable('AutoDispCounter', 0);
                setLocalVariable('AutoDispTimeDiff', 0);
                setLocalVariable('lineSelected', 1);
                setLocalVariable('WaitingDisposition', 'false');
                setLocalVariable('isLineBusy', 'READY');
                setLocalVariable('DisplayCallerID', '');
                setLocalVariable('NumberToDial', '');
                setLocalVariable('NumberToDial2', '');
                setLocalVariable('isLine2Busy', '');
                console.log("Save Disposition");
                //alertify.success("Save Disposition");
                $('#show_disposition_section').css("display", "none");
                if (getLocalVariable('UserMode') == 'Progressive') {
                    $('#top-crm-continer3').css("display", "flex");
                }
                $('#top-crm-continer').css("display", "none");
                $('#top-crm-continer').html("");
                $('#show_greendata').css("display", "none");
                $('#top-crm-continer2').css("display", "block");
                $('#webrtc_crm_data').html("");
                $('header_part').html("");
                $('.header_part').css("display", "none");
                reset_field('No');
                

            }
        }).catch(error => {
            console.error('Error:', error);
        });
    }
}
/* crm function dev by Alok*/
///webrtc_crm('24102414141117820004','8285248951','MC');
function webrtc_crm(record_id, phone_number = '', calltype = '') {
    var campaign = localStorage.getItem("CampaignName");
    var code = localStorage.getItem("ClientID");
    var CLIENT_ID = localStorage.getItem("ClientID");
    var agent = localStorage.getItem("USER_ID");
    var rid = record_id;
    var Campaign_Type = localStorage.getItem("Campaign_Type");
    var Campaign_Type = localStorage.getItem("Campaign_Type");
    var sip_id = localStorage.getItem("SIP_ID");
    var CRMDataID = localStorage.getItem("CRMDataID");
    if (phone_number != '') {
        var phone = phone_number;
    } else {
        var phone = localStorage.getItem("NumberToDial");
    }

    var SKILL = localStorage.getItem("crm_skill");
    var did = localStorage.getItem("ManualCallerID");
    var priview_id = 0;
    var auto_att = 0;
    /*auto dispose timer reset by alok*/
    $.ajax({
        url: "/get_autodispose_timer",
        method: "POST",
        data: { campaign: campaign, code: code },
        dataType: "JSON",
        success: function (response) {
            setLocalVariable('AutoDispTimeDiff', response.auto_dispose);
            setLocalVariable('AutoDisposeTime', response.auto_dispose);
            $('.header_part').css("display", "block");
        }
    });
    /**end auto dispose */
    var dararecord = { campaign: campaign, code: code, agent: agent, rid: rid, agent: agent, processType: '1', code: code, redial: '0', calltype: calltype, phone: phone, SIP_ID: sip_id, CAMPAIGN_TYPE: Campaign_Type, did: did, SKILL: SKILL, CLIENT_ID: CLIENT_ID, dataid: CRMDataID };
    console.log("crmsend= " + JSON.stringify(dararecord));
    $.ajax({
        url: "/crm",
        method: "GET",
        data: dararecord,
        success: function (res) {
            $('#webrtc_crm_data').html(res);
            var tableBody = document.getElementById('top-crm-continer');
            tableBody.innerHTML = '';
            var result = JSON.parse(localStorage.getItem('crm-data'));
            var data = JSON.parse(localStorage.getItem('crm-data-value'));
            var NoMask = JSON.parse(localStorage.getItem('crm-nomask'));
            var full_html = '';
            if (result && Array.isArray(result)) {
                result.forEach(element => {
                    var rhtml = generateTopHTML(element, data, agent, code, campaign, NoMask);
                    full_html += rhtml;
                    if (element.ftype === "number") {

                        call_dfid = element.dfid;
                        try {
                            var inputField = document.getElementById('f' + call_dfid);
                            tableBody.addEventListener('keydown', function (event) {
                                if (event.target.matches('input[type="text"][id="f' + call_dfid + '"]')) {
                                    var inputField = event.target;
                                    if ([46, 8, 9, 27, 13, 110].includes(event.keyCode) ||
                                        (event.keyCode === 65 && (event.ctrlKey === true || event.metaKey === true)) ||
                                        (event.keyCode >= 35 && event.keyCode <= 40)) {
                                        return;
                                    }
                                    if ((event.shiftKey || (event.keyCode < 48 || event.keyCode > 57)) &&
                                        (event.keyCode < 96 || event.keyCode > 105)) {
                                        event.preventDefault();
                                    }
                                }
                            });

                        } catch (error) {
                            console.error("Error parsing JSON:", error);
                        }
                    }

                    if (element.ftype === "alphanumeric") {

                        call_dfid = element.dfid;
                        var ser_detail = element.ftypedesc;
                        var detail = unserializeTopPHP(ser_detail);
                        try {
                            $("#f" + call_dfid).keypress(function (e) {
                                if (e.shiftKey || e.ctrlKey || e.altKey) {
                                    e.preventDefault();
                                }
                                var code = e.keyCode || e.which;
                                var definedPattern = detail.alphanumeric_option;
                                var value = $(this).val();
                                if (code == 13 || code == 8 || code == 46 || (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
                                    if (definedPattern.charAt(value.length) == "X" && !(/[a-z]/i).test(String.fromCharCode(code))) {
                                        $("#f" + element.dfid).css({ "border": "1px #F00 solid !important" });
                                        return false;
                                    }
                                    if (definedPattern.charAt(value.length) == "N" && !(/[0-9]/).test(String.fromCharCode(code))) {
                                        $("#f" + element.dfid).css({ "border": "1px #F00 solid !important" });
                                        return false;
                                    }
                                } else
                                    return false;
                            });

                        } catch (error) {
                            console.error("Error parsing JSON:", error);
                        }
                    }

                });
            }
            tableBody.innerHTML = full_html;

        }
    });

}
/* create function for jainul*/
function emailSEND() {
    $.ajax({
        url: "/email_send", success: function (result) {
            $("#main_email").html(result);
        }
    });
}
/// This Function use for diaplay Email inbox and Send Email By Jainul
function emailLog(intr) {
    $('#myTab a[href="#profile"]').tab('show');
    $('#interaction_myTab a[href="#Email"]').tab('show');
    var username = getLocalVariable('USER_ID');
    var client_id = getLocalVariable('ClientID');
    var campaign = getLocalVariable('CampaignName');
    var data_id=getLocalVariable('data_id');
    var DateHelper = {
        addDays: function (aDate, numberOfDays) {
            aDate.setDate(aDate.getDate() + numberOfDays); // Add numberOfDays
            return aDate;                                  // Return the date
        },
        format: function format(date) {
            return [
                date.getFullYear(),
                ("0" + (date.getMonth() + 1)).slice(-2),
                ("0" + date.getDate()).slice(-2)
            ].join('-');
        }
    }
   /* if (intr == 0) {
        if ($('#dataid').val() != 'undefined') {
            var intr = $('#dataid').val();
        }
    }*/
    if(intr != 0)
    {
        $("#all_summary_data_id").val(intr);
    }
    if(data_id!='' && data_id!='undefined')
    {
        intr = data_id;
    }
    if (intr == 0 && data_id=='') {
        
        intr = $('#all_summary_data_id').val();
    }
    var cdate = DateHelper.format(DateHelper.addDays(new Date(), 0));
    $.ajax({
        url: "/email_log_inbox",
        method: 'POST',
        data: { username: username, client_id: client_id, campaign: campaign, cdate: cdate, intr: intr },
        success: function (result) {
            $("#tbl_emailloginbox").html(result);
        }
    });
    $.ajax({
        url: "/email_log_sent",
        method: 'POST',
        data: { username: username, client_id: client_id, campaign: campaign, cdate: cdate, intr: intr },
        success: function (result) {
            $("#tbl_emaillogsent").html(result);
        }
    });
}

function get_emailbody(th) {
    $('#subject').val('');
    $(".Editor-editor").html('');
    if (th != '') {
        $.ajax({
            url: "/email_body",
            method: "POST",
            data: { id: th },
            dataType: "JSON",
            success: function (response) {
                var res = JSON.stringify(response);
                var result = JSON.parse(res);

                $('#subject').val(result[0].subject);
                $(".Editor-editor").html(result[0].mailBody);
            }
        });
    } else {

    }
}
function get_smsbody(th) {
    $('#phoneBody').val('');
    var val = th.split("~");
    if (th != '') {
        $.ajax({
            url: "/getsms",
            method: "POST",
            dataType: "JSON",
            data: { id: val[0] },
            success: function (response) {
                var res = JSON.stringify(response);
                var result = JSON.parse(res);
                $('#phoneBody').val(result[0].phoneBody);
                $('#clientIDsms').val(result[0].clientID);
                $('#route_id').val(val[1]);
                $('#template_id').val(val[2]);
                $('#config_id').val(result[0].config_id);
                $('#url_to_tiny').val(result[0].url_to_tiny);
            }
        });
    } else {

    }
}
function send_email() {
    var USER_ID = localStorage.getItem("USER_ID");
    var campaign_name = localStorage.getItem("CampaignName");
    var email_template = $("#email_template").val();
    var rid = localStorage.getItem("RecordID");
    WaitingDisposition = getLocalVariable('WaitingDisposition');
    Email = getLocalVariable('Email');
    if (Email != '1') {
        alertify.error("Access denied...!");
        return false;
    }
    if (rid == null || rid == '') {
        alertify.error('Interaction ID is not available.');
        return false;
    }
    if (WaitingDisposition == "false" || WaitingDisposition == false) {
        alertify.error('No Active Call or No Hangup Call');
        return false;
    }
    if (email_template.length == 0) {
        //showAlert('error', 'Please Select Email Template.');
        alertify.error('Please Select Email Template.');
        $("#email_template").focus();
        return false;
    }
    var to = $("#to").val();
    if (to.length == 0) {
        //showAlert('error', 'Please Enter Valid Email ID.');
        alertify.error('Please Enter Valid Email ID.');
        $("#to").focus();
        return false;
    }
    var emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (emailPattern.test(to)) {
    }
    else {
        //showAlert('error', 'Email ID is not Valid.');
        alertify.error('Email ID is not Valid.');
        $("#to").focus();
        return false;
    }
    var clientIDmail = localStorage.getItem("ClientID");
    var subject = $("#subject").val();
    if (subject.length == 0) {
        //showAlert('error', 'Please Enter Subject.');
        alertify.error('Please Enter Subject.');
        $("#subject").focus();
        return false;
    }
    var message = $(".Editor-editor").html();
    if (message.length == 0) {
        //showAlert('error', 'Please Enter Email Body.');
        alertify.error('Please Enter Email Body.');
        $(".Editor-editor").focus();
        return false;
    }
    // alert(JSON.stringify({to:to, USER_ID:USER_ID,campaign_name:campaign_name,message:message, clientIDmail:clientIDmail, subject:subject,rid:rid}));
    $.ajax({
        method: 'POST',
        url: '/api_calling/save_sendemail',
        dataType: "JSON",
        data: { to: to, USER_ID: USER_ID, campaign_name: campaign_name, message: message, clientIDmail: clientIDmail, subject: subject, rid: rid },
        success: function (response) {
            var res = JSON.stringify(response);
            var result = JSON.parse(res);
            if (result.message) {
                $('#alert_email').text(result.message).css('color', 'green');
            } else {
                $('#alert_email').text(result.error).css('color', 'red');
            }
            //showAlert('success', 'Email Send successfully!');
            alertify.success('Email Send successfully!');
            $('#emailForm')[0].reset(); // Reset the form
            $(".Editor-editor").html('');
            $('#customModalOverlay').css('display', 'none');
        }
    });
}
///This Function Use for display inbox and sent messages By Jainul
function smsLog(intr) {
    $('#myTab a[href="#profile"]').tab('show');
    $('#interaction_myTab a[href="#SMS"]').tab('show');
    var username = getLocalVariable('USER_ID');
    var client_id = getLocalVariable('ClientID');
    var campaign = getLocalVariable('CampaignName');
    var data_id=getLocalVariable('data_id');
    /*if (intr == 0) {
        if ($('#dataid').val() != 'undefined') {
            var intr = $('#dataid').val();
        }
    }*/
    if(intr != 0)
    {
        $("#all_summary_data_id").val(intr);
    }
    if(data_id!='' && data_id!='undefined')
    {
        intr = data_id;
    }
    if (intr == 0 && data_id=='') {
        
        intr = $('#all_summary_data_id').val();
    }
    $("#all_summary_data_id").val(intr);
    var DateHelper = {
        addDays: function (aDate, numberOfDays) {
            aDate.setDate(aDate.getDate() + numberOfDays); // Add numberOfDays
            return aDate;                                  // Return the date
        },
        format: function format(date) {
            return [
                date.getFullYear(),
                ("0" + (date.getMonth() + 1)).slice(-2),
                ("0" + date.getDate()).slice(-2)
            ].join('-');
        }
    }
    var cdate = DateHelper.format(DateHelper.addDays(new Date(), 0));
    $.ajax({
        url: "/sms_log_inbox",
        method: 'POST',
        data: { username: username, client_id: client_id, campaign: campaign, cdate: cdate, intr: intr },
        success: function (result) {
            $("#tbl_smsloginbox").html(result);
        }
    });
    $.ajax({
        url: "/sms_log_sent",
        method: 'POST',
        data: { username: username, client_id: client_id, campaign: campaign, cdate: cdate, intr: intr },
        success: function (result) {
            $("#tbl_smslogsent").html(result);
        }
    });
}
function smsSEND() {
    $.ajax({
        url: "/sms_send", success: function (result) {
            $("#main_email").html(result);
        }
    });
}
/// This Function Use for Send SMS By Jainul
function send_sms() {
    var to = $("#phoneTo").val();
    var mailbody = $("#phoneBody").val();
    var agent = getLocalVariable('USER_ID');
    var campaign = getLocalVariable('CampaignName');
    var clientID = getLocalVariable('ClientID');
    var route = $("#route_id").val();
    var template_id = $("#template_id").val();
    var config_id = $("#config_id").val();
    var url_to_tiny = $("#url_to_tiny").val();
    var rid = getLocalVariable('RecordID');
    let SMS = getLocalVariable('SMS');
    if (SMS != '1') {
        alertify.error("Access denied...!");
        return false;
    }
    if (rid.length == 0) {
        alertify.error('Now Interaction not found.');
        return false;
    }
    if (template_id.length == 0) {
        $("#template_id").focus();
        alertify.error('Please Select Template.');
        return false;
    }
    if (to.length < 10) {
        $("#phoneTo").focus();
        alertify.error('Please Enter 10 digits Phone No.');
        return false;
    }
    var integerPattern = /^-?\d+$/;
    if (integerPattern.test(to)) {
    }
    else {
        $("#phoneTo").focus();
        alertify.error('Phone No. must be numeric.');
        return false;
    }
    if (mailbody.length == 0) {
        $("#phoneBody").focus();
        alertify.error('Please Enter Message.');
        return false;
    }
    $.ajax({
        method: 'POST',
        url: '/api_calling/save_sendsms',
        dataType: "JSON",
        data: { to: to, mailbody: mailbody, clientID: clientID, campaign: campaign, agent: agent, route: route, template_id: template_id, config_id: config_id, url_to_tiny: url_to_tiny, rid: rid },
        success: function (response) {
            var res = JSON.stringify(response);
            var result = JSON.parse(res);
            if (result.message) {
                $('#alert_email').text(result.message).css('color', 'green');
            } else {
                $('#alert_email').text(result.error).css('color', 'red');
            }
            alertify.success('SMS Send successfully!');
            $('#smsForm')[0].reset(); // Reset the form
            $("#phoneTo").val('');
            $("#phoneBody").val('');
            $("#route_id").val('');
            $("#template_id").val('');
            $("#config_id").val('');
            $("#url_to_tiny").val('');
            smsLog('0');
            $('#customModalOverlaysms').css('display', 'none');
        }
    });
}
/// This Function Use for Assigend Data Show at Dashboard By Jainul
function get_assiged(d) {
    if (getLocalVariable('UserMode').toLowerCase() != 'preview') {
        alertify.error('Assigned Use for Preview Mode Only!');
        return false;
    }
    $("#div_calllogsearch").hide();
    $("#div_callbacksearch").hide();
    $("#div_assignsearch").show();
    var username = getLocalVariable('USER_ID');
    var client_id = getLocalVariable('ClientID');
    var campaign = getLocalVariable('CampaignName');
    var DateHelper = {
        addDays: function (aDate, numberOfDays) {
            aDate.setDate(aDate.getDate() + numberOfDays); // Add numberOfDays
            return aDate;                                  // Return the date
        },
        format: function format(date) {
            return [
                date.getFullYear(),
                ("0" + (date.getMonth() + 1)).slice(-2),
                ("0" + date.getDate()).slice(-2)
            ].join('-');
        }
    }
    var end_date = DateHelper.format(DateHelper.addDays(new Date(), 0));
    var start_date = DateHelper.format(DateHelper.addDays(new Date(), -d));
    console.log("get_assiged start_date= " + start_date + "end_date= " + end_date);
    $.ajax({
        method: 'POST',
        url: '/get_assiged',
        data: { username: username, client_id: client_id, campaign: campaign, start_date: start_date, end_date: end_date },
        success: function (response) {
            $("#tbl_assigned").html(response);
        }
    });
}
/// This Function Use for Call Log Data Show On Click Call Menu at Dashboard By Jainul
function CallLog_show(intr) {
    $('#myTab a[href="#profile"]').tab('show');
    $('#interaction_myTab a[href="#tabphone"]').tab('show');
    var username = getLocalVariable('USER_ID');
    var client_id = getLocalVariable('ClientID');
    var campaign = getLocalVariable('CampaignName');
    var data_id=getLocalVariable('data_id');
    if(intr != 0)
    {
        $("#all_summary_data_id").val(intr);
    }
    if(data_id!='')
    {
        intr = data_id;
    }
    if (intr == 0 && data_id=='') {
       
        intr = $('#all_summary_data_id').val();
    }
    var DateHelper = {
        addDays: function (aDate, numberOfDays) {
            aDate.setDate(aDate.getDate() + numberOfDays); // Add numberOfDays
            return aDate;                                  // Return the date
        },
        format: function format(date) {
            return [
                date.getFullYear(),
                ("0" + (date.getMonth() + 1)).slice(-2),
                ("0" + date.getDate()).slice(-2)
            ].join('-');
        }
    }
    var cdate = DateHelper.format(DateHelper.addDays(new Date(), 0));
    if (intr > 0) {
        $.ajax({
            method: 'POST',
            url: '/call_log_showinteraction',
            data: { username: username, client_id: client_id, campaign: campaign, intr: intr },
            success: function (response) {
                $("#tbl_calllog_show").html(response);
            }
        });
    }
    else {
        $.ajax({
            method: 'POST',
            url: '/call_log_show',
            data: { username: username, client_id: client_id, campaign: campaign, cdate: cdate },
            success: function (response) {
                $("#tbl_calllog_show").html(response);
            }
        });
    }
}
/// This Function Use for Callback means Recall Data Show at Dashboard By Jainul
function get_callback(d) {
    $("#div_calllogsearch").hide();
    $("#div_callbacksearch").show();
    $("#div_assignsearch").hide();
    $('#calllogtxt_opt').val(d);
    var username = getLocalVariable('USER_ID');
    var client_id = getLocalVariable('ClientID');
    var campaign = getLocalVariable('CampaignName');
    var CBUPolicy = getLocalVariable('CBUPolicy');
    //alert("policy name"+CBUPolicy);
    var callbacktxt_search = $('#callbacktxt_search').val();
    var DateHelper = {
        addDays: function (aDate, numberOfDays) {
            aDate.setDate(aDate.getDate() + numberOfDays); // Add numberOfDays
            return aDate;                                  // Return the date
        },
        format: function format(date) {
            return [
                date.getFullYear(),
                ("0" + (date.getMonth() + 1)).slice(-2),
                ("0" + date.getDate()).slice(-2)
            ].join('-');
        }
    }
    var end_date = DateHelper.format(DateHelper.addDays(new Date(), 0));
    var start_date = DateHelper.format(DateHelper.addDays(new Date(), -d));
    $.ajax({
        method: 'POST',
        url: '/get_callback',
        data: { username : username, client_id : client_id, campaign : campaign, start_date : start_date, end_date : end_date, callbacktxt_search : callbacktxt_search, CBUPolicy : CBUPolicy },
        success: function (response) {
            $("#tbl_callback").html(response);
        }
    });
}
get_CallLog(0);
function get_CallLog(d) {
    if (getLocalVariable('WaitingDisposition') == 'true') {
        return false;
    }
    $('#show_greendata').css("display", "none");
    if (d == 0) {
        var element1 = document.getElementById("today_log");
        element1.classList.add("show");
        var element2 = document.getElementById("week_log");
        element2.classList.remove("show");
        var element3 = document.getElementById("month_log");
        element3.classList.remove("show");
    } else if (d == 7) {
        var element1 = document.getElementById("today_log");
        element1.classList.remove("show");
        var element2 = document.getElementById("week_log");
        element2.classList.add("show");
        var element3 = document.getElementById("month_log");
        element3.classList.remove("show");
    }
    else {
        var element1 = document.getElementById("today_log");
        element1.classList.remove("show");
        var element2 = document.getElementById("week_log");
        element2.classList.remove("show");
        var element3 = document.getElementById("month_log");
        element3.classList.add("show");
    }
    $("#div_calllogsearch").show();
    $("#div_callbacksearch").hide();
    $("#div_assignsearch").hide();
    $('#calllogtxt_opt').val(d);
    var username = getLocalVariable('USER_ID');
    var client_id = getLocalVariable('ClientID');
    var campaign = getLocalVariable('CampaignName');
    var calllogtxt_search = $('#calllogtxt_search').val();
    var DateHelper = {
        addDays: function (aDate, numberOfDays) {
            aDate.setDate(aDate.getDate() + numberOfDays); // Add numberOfDays
            return aDate;                                  // Return the date
        },
        format: function format(date) {
            return [
                date.getFullYear(),
                ("0" + (date.getMonth() + 1)).slice(-2),
                ("0" + date.getDate()).slice(-2)
            ].join('-');
        }
    }
    var end_date = DateHelper.format(DateHelper.addDays(new Date(), 0));
    var start_date = DateHelper.format(DateHelper.addDays(new Date(), -d));
    $.ajax({
        method: 'POST',
        url: '/call_log',
        data: { username: username, client_id: client_id, campaign: campaign, start_date: start_date, end_date: end_date, search_type: d, calllogtxt_search: calllogtxt_search },
        success: function (response) {
            $("#tbl_calllog").html(response);
            var dataid = $("#dataid").val();
            var phone = $("#phone").val();
            var name = $("#f1").val();


            if (dataid != '' && phone != '' && name != '') {
                show_greendata(dataid, name, phone);

            } else {
                display_name = getLocalVariable('display_name');
                display_phone = getLocalVariable('NumberToDial');
                crm_data_id = getLocalVariable('CRMDataID');
                show_greendata(crm_data_id, display_name, display_phone);
            }

        }
    });
}
function progressive_call() {
    var username = getLocalVariable('USER_ID');
    var client_id = getLocalVariable('ClientID');
    var campaign = getLocalVariable('CampaignName');
    ///var Campaign_Type=getLocalVariable('Campaign_Type');
    var Campaign_Type = 'SR';
    //var LastSkillUsed=getLocalVariable('LastSkillUsed');
    var LastSkillUsed = 'US';
    var record_data = { username: username, client_id: client_id, campaign: campaign, Campaign_Type: Campaign_Type, LastSkillUsed: LastSkillUsed };
    console.log("pro datatype" + JSON.stringify(record_data));
    $.ajax({
        method: 'POST',
        url: '/progressive_call',
        data: { username: username, client_id: client_id, campaign: campaign, Campaign_Type: Campaign_Type, LastSkillUsed: LastSkillUsed },
        success: function (response) {
            if (response.status == true) {
                DialByLine('audio', '', response.phone);
            } else {
                alertify.error("Progessive mode not active");
            }
            console.log("progressive dial" + response.status);
        }
    });
}

/*End Jainul sir*/
/** Update crm functiion  by Alok */
function updateCrm(data) {
    //alert("Crm Update");
    if (getLocalVariable('Campaign_Crm_Mode') == '1' && getLocalVariable('Campaign_Crm_Status') == '1') {
        return false;
    }
    if (getLocalVariable('Campaign_Crm_Mode') == '1' && getLocalVariable('Campaign_Crm_Status') == '0') {
        return false;
    }
    $('#updateBtn').attr("disabled", "disabled");
    data += '&' + $.param({ agent_disp: $('#disposition').val() });
    data += '&' + $.param({ agent_sub_disposition: $('#sub_disposition').val() });
    $.post('/crm_update', { tag: 'update', data: data }, function (result) {
        result = result.split("||");
        //alert(result);
        //                $('#testDiv').html(result);
        if (result[0] === "true" || result[0] === 'added-true') {
            var alertMsg = '';
            if (result[0] === 'added-true') {
                alertMsg = "Number added to dnc.";
            }
            alertify.success('Data saved successfully!' + alertMsg);
            //                    clearForm();
            //                    disposeCall(data);
            var action = "";
            if ($('#callbackdate').val().length > 0) {
                action = "CALLBACK";
            } else {
                action = "DISPOSE";
            }
            var disposition = $('#disposition').val().replace(/\_/g, " ");
            var sub_disposition = $('#sub_disposition').val().replace(/\_/g, " ");
            if (sub_disposition == '0') {
                sub_disposition = "";
            }
            var dataid = $('#dataid').val();
            var callback_time = $('#callbackdate').val();
            var dt = new Date(callback_time);
            var y = dt.getFullYear();
            var m = dt.getMonth() + 1;
            var d = dt.getDate();
            var h = dt.getHours();
            var i = dt.getMinutes();
            var _dt = y + "-" + (m < 10 ? "0" + m : m) + "-" + (d < 10 ? "0" + d : d) + " " + (h < 10 ? "0" + h : h) + ":" + (i < 10 ? "0" + i : i) + ":00";

            var remarks = $('#remarks').val();
            /// clearForm();
            /* window.location.href = encodeURI("blank.php?action=" + action + "&disposition=" + disposition.toUpperCase() + "&sub_disposition=" + sub_disposition.toUpperCase() + "&dataid=" + dataid + "&callback_time=" + _dt + "&remarks=" + remarks + result[1]);
//                    window.location.href = "blank1.php";*/
        } else {

            //alert(result);
            $('#updateBtn').removeAttr("disabled");
        }
    });
}
/**** Insert Dispostion data by Alok */
function insert_disposition(rid = '', call_type = '', phone = '', did_number = '') {
    var jsonnew_data = { phone: phone, campaign: getLocalVariable('CampaignName'), code: getLocalVariable('ClientID') };
    fetch('/get_dataid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonnew_data) }).then(response => {
        if (!response.ok) {
            alertify.error('Network response was not ok for disposition insertion');
        }
        return response.json();
    }).then(data => {
        if (data.status == true) {
            dataid = data.data_id;
            var jsonData = { agent: getLocalVariable('USER_ID'), campaign: getLocalVariable('CampaignName'), did: dataid, rid: rid, call_type: call_type, phone: phone, lead_id: getLocalVariable('CampaignName') + '_MANUAL', login_id: getLocalVariable('LoginHourID'), sip: getLocalVariable('SIP_ID'), did_number: did_number, mode_action_id: getLocalVariable('ModeDBId'), client_id: getLocalVariable('ClientID') };
            fetch('/insert_disposition', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonData) }).then(response => {
                if (!response.ok) {
                    alertify.error('Network response was not ok for disposition insertion2');
                }
                return response.json();
            }).then(data => {
                if (data.status == 1) {
                    //alertify.success("Insert incoming Save Disposition");
                }
            }).catch(error => {
                console.error('Error:', error);
                alertify.error("Insert Save Disposition", error);
            });

        }
    }).catch(error => {
        alertify.error("Insert Save Disposition2", error);
    });
}
function queueAdd(tag = '') {
    var jsonData = { client_id: getLocalVariable('ClientID'), tag: tag, asid: getLocalVariable('AS_ID'), SIP_ID: getLocalVariable('SIP_ID') };
    console.log("quequ data= " + JSON.stringify(jsonData));
    fetch('/api_calling/queue_pause', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonData) }).then(response => {
        if (!response.ok) {
            //throw new Error('Network response was not ok');
            console.error('Error:Network response was not ok');
        }
        return response.json();
    }).then(data => {
        if (data.status == 1) {
            console.log("Insert Queue data");
            //alertify.success("Save Disposition");
        }
    }).catch(error => {
        console.error('Error:', error);
    });
}

function getTemplates(tag = '') {
    $("#to").val($("#f4").val());
    var jsonData = { client_id: getLocalVariable('ClientID'), tag: tag, campaign: getLocalVariable('CampaignName'), user_id: getLocalVariable('USER_ID') };
    console.log("quequ data= " + JSON.stringify(jsonData));
    fetch('/templates_load', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonData) }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    }).then(data => {
        if (data.status == 1) {
            if (tag == 'email') {
                var jsonData = data.data;
                var str = "<option value=''>Select Templates</option>";
                $.each(jsonData, function (key, value) {
                    str += "<option value='" + value['id'] + "'>" + value['email_type'] + "</option>";
                });
                $('#email_template').html(str);
            }
            else if (tag == 'sms') {
                var jsonsmsData = data.data;
                var strsms = "<option value=''>Select Templates</option>";
                $.each(jsonsmsData, function (key, value) {
                    strsms += "<option value='" + value['id'] + "~" + value['route_id'] + "~" + value['template_id'] + "'>" + value['sms_type'] + "</option>";
                });
                $('#sms_template').html(strsms);
                $('#phoneTo').val(getLocalVariable('NumberToDial'));
            }
            else if (tag == 'review') {
                preview_dispose_show();
                var jsonData = { client_id: getLocalVariable('ClientID'), campaign: getLocalVariable('CampaignName'), user_id: getLocalVariable('USER_ID') };
                console.log("quequ data= " + JSON.stringify(jsonData));
                fetch('/crm_load', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonData) }).then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                }).then(data => {
                    if (data.status == 1) {
                        var jsonData = data.data;
                        var str = "<option value='0'>Select Search </option>";
                        str += "<option value='agent_attempt'>Agent Attempt</option>";
                        str += "<option value='cdate'>Calldate</option>";
                        str += "<option value='phone'>Phone</option>";
                        str += "<option value='calltype'>Call Type</option>";
                        str += "<option value='leadid'>Lead ID</option>";
                        var ostr = "<option value='0'>Order By</option>";
                        ostr += "<option value='agent_attempt'>Agent Attempt</option>";
                        ostr += "<option value='cdate'>Calldate</option>";
                        ostr += "<option value='phone'>Phone</option>";
                        ostr += "<option value='calltype'>Call Type</option>";
                        ostr += "<option value='leadid'>Lead ID</option>";
                        $.each(jsonData, function (key, value) {
                            str += "<option value='f" + value['dfid'] + "'>" + value['fcaption'].toUpperCase() + "</option>";
                            ostr += "<option value='f" + value['dfid'] + "'>" + value['fcaption'].toUpperCase() + "</option>";
                        });
                        $('#rcolumn').html(str);
                        $('#rcolumn1').html(str);
                        $('#rorderbyColumn').html(ostr);
                    }
                }).catch(error => {
                    console.error('Error:', error);
                });
                var jsonprevData = data.data;
                var strprev = "<option value=''>Select Activity</option>";
                $.each(jsonprevData, function (key, value) {
                    strprev += "<option value='" + value['id'] + "'>" + value['activity_name'] + "</option>";
                });
                $('#activity').html(strprev);
            }
            else if (tag == 'prev') {

                preview_dispose_show();
                preview_file_show();
                preview_skill_show();
                var allowedMode = ["auto", "manual", "progressive", "preview", "callback"];
                if ($.inArray(getLocalVariable('UserMode').toLowerCase(), allowedMode) == -1) {
                    alertify.error('Review Not allowed in the current mode.');
                    return;
                }
                var jsonData = { client_id: getLocalVariable('ClientID'), campaign: getLocalVariable('CampaignName'), user_id: getLocalVariable('USER_ID') };
                console.log("quequ data= " + JSON.stringify(jsonData));
                fetch('/crm_load', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(jsonData) }).then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                }).then(data => {
                    if (data.status == 1) {
                        var jsonData = data.data;
                        var str = "<option value='0'>Select</option>";
                        str += "<option value='agent_attempt'>Agent Attempt</option>";
                        str += "<option value='cdate'>Calldate</option>";
                        str += "<option value='phone'>Phone</option>";
                        str += "<option value='calltype'>Call Type</option>";
                        str += "<option value='leadid'>Lead ID</option>";
                        var ostr = "<option value='0'>Order By</option>";
                        ostr += "<option value='agent_attempt'>Agent Attempt</option>";
                        ostr += "<option value='cdate'>Calldate</option>";
                        ostr += "<option value='phone'>Phone</option>";
                        ostr += "<option value='calltype'>Call Type</option>";
                        ostr += "<option value='leadid'>Lead ID</option>";
                        $.each(jsonData, function (key, value) {
                            str += "<option value='f" + value['dfid'] + "'>" + value['fcaption'].toUpperCase() + "</option>";
                            ostr += "<option value='f" + value['dfid'] + "'>" + value['fcaption'].toUpperCase() + "</option>";
                        });
                        $('#column').html(str);
                        $('#orderbyColumn').html(ostr);
                    }
                }).catch(error => {
                    console.error('Error:', error);
                });
                /*var jsonprevData = data.data;
                var strprev = "<option value=''>Select Activity</option>";
                $.each(jsonprevData, function(key, value) 
                {
                    strprev += "<option value='" + value['id']+"'>" + value['activity_name'] + "</option>";
                });
                $('#activity').html(strprev);*/
            }

        }
    }).catch(error => {
        console.error('Error:', error);
    });
}

function show_greendata(data_id = '', name = '', phone = '') {
    console.log("show_greendata dataid= " + data_id + " Name= " + name + " phone= " + phone);
    if (getLocalVariable('WaitingDisposition') == 'false') {
        $('#show_greendata').css("display", "none");
    } else {
        $('#show_greendata').css("display", "contents");
    }
    if (name == '') {
        name = getLocalVariable('display_name');
    }
    if (phone == '') {
        phone = getLocalVariable('NumberToDial');
    }
    var strdata = `<td>
   <p class="logname" style="color: #00d7a1;">`+ name + ` <i
    class="fas fa-circle text-c-green f-10 m-r-15"
    style="font-size:7px;"></i>
    </p>
    <p class="logno" ondblclick='DialByLine("audio","","`+ phone + `","","","","` + data_id + `")'>` + phone + `</p>
    </td>
    <td style="text-align: right;">
    <p class="logname-date">Today</p>
    
    <div class="btn-group">
    <p class="logdotes" data-toggle="dropdown"
    aria-haspopup="true" aria-expanded="false"
    style="cursor: pointer;">
    <i class="fa fa-ellipsis-h"></i>
	<div class="dropdown-menu"
    style="position: absolute;transform: translate3d(-56px, 18px, 0px);top: -18px;left: 0px;will-change: transform;">
    <a class="dropdown-item" href="#!" onclick="showWhatapp('`+ phone + `')">WhatsApp</a>
	<a class="dropdown-item" href="#!" onclick="CallLog_show('`+ data_id + `')">Call</a>
	<a class="dropdown-item" href="#!" onclick="smsLog('`+ data_id + `')">SMS </a>
	<a class="dropdown-item" href="#!"  onclick="emailLog('`+ data_id + `')">email </a>
    <a class="dropdown-item" href="#!"  onclick="all_calllog('`+ data_id + `')">All Details  </a>
	</div>
	</p>
			
	</div>
	</td>`;
    $('#show_greendata').html(strdata);
}
/****END  Insert Dispostion data by Alok */
/** developed by Jainul */
function Progressive_Call() {
    var username = getLocalVariable('USER_ID');
    var client_id = getLocalVariable('ClientID');
    var campaign = getLocalVariable('CampaignName');
    ///var Campaign_Type=getLocalVariable('Campaign_Type');
    var Campaign_Type = 'SR';
    //var LastSkillUsed=getLocalVariable('LastSkillUsed');
    var LastSkillUsed = 'english';
    $.ajax({
        method: 'POST',
        url: '/progressive_call',
        data: { username: username, client_id: client_id, campaign: campaign, Campaign_Type: Campaign_Type, LastSkillUsed: LastSkillUsed },
        success: function (response) {
            $("#tbl_calllog").html(response);
        }
    });
}
/* Developed by Alok*/
function skillqueue() {
    var count = 0;
    if (websocketConnected == 1 && getLocalVariable('crm_skill_queue') != 'undefined') {
        var crm_skill_queue = getLocalVariable('crm_skill_queue');
        var show_skill = JSON.parse(getLocalVariable('skill'));
        if (!show_skill || show_skill.length === 0) {

            $('#skill_btn').hide();
        } else {
            $('#skill_btn').show();
        }
        jsonString = crm_skill_queue.replace(/'/g, '"');
        var label = JSON.parse(jsonString);
        var values = JSON.parse(jsonString);
        var skil_str = "";
        const skill_count = {};
        for (var l in label) {
            count = label[l]++;
            console.log("skill list " + l + " sds= ");
        }
        Object.entries(values).forEach(([key, value]) => {
            skill_key = key.toLowerCase();
            skill_count[skill_key] = value;
        });
        let sortedskill = Object.entries(show_skill).sort((a, b) => a[1] - b[1]);
        sortedskill.forEach(entry => {

            skil_str += "<tr><td style='width:50%'>" + entry[0] + "</td><td>" + skill_count[entry[0].toLowerCase()] + "</td></tr>";
        });
        $('#skill_list_details').html(skil_str);
        $('#crm_skill_queue').html(count);
    } else {
        $('#crm_skill_queue').html(count);
    }
}
//sipreg();
function sipreg() {
    var campaign = getLocalVariable('CampaignName');
    var code = getLocalVariable('ClientID');
    $.ajax({
        url: "/get_autodispose_timer",
        method: "POST",
        data: { campaign: campaign, code: code },
        dataType: "JSON",
        success: function (response) {
            alert(JSON.stringify(response));
            alert(response.auto_dispose);
        }
    });
}
/** This code developed by jainul */
function open_script_show() {
    let page_url = getLocalVariable('Campaign_Script');
    const iframe = document.getElementById("dynamicIframe");
      iframe.src = page_url; // Replace with your URL
      iframe.style.display = "block"; // Make iframe visible

}
function open_decision() {
    var client_id = getLocalVariable('ClientID');
    var username = getLocalVariable('USER_ID');
    var NumberToDial = getLocalVariable('NumberToDial');
    var campaign = getLocalVariable('CampaignName');
    var RecordID = getLocalVariable('RecordID');
    var CALL_TYPE = getLocalVariable('CALL_TYPE');
    
    if (RecordID == '') {
        alertify.error('Interaction ID is blank!...');
        return false;
    }
    $.ajax({
        method: 'POST',
        url: '/decision_tree_show',
        data: { campaign: campaign, client_id: client_id },
        success: function (response) {
            var dt_path = JSON.stringify(response);
            var result = JSON.parse(dt_path);
            if (result.status == true) {
                var url_p = result.data[0].webscript;
                //var d_p = url_p + '&campaign=' + campaign + '&phone=' + NumberToDial + '&agent=' + username + '&CLIENT_ID=' + client_id + '&rid=' + RecordID + '&CALL_TYPE=' + CALL_TYPE;
                const myArray = url_p.split("?");
                //alert(url_p);
                //alert(myArray[1]);
                let parent_id=myArray[1].split("=");;
                let tree_parent_id=parent_id[1];
                //alert(tree_parent_id);
                $.ajax({
                    method: 'POST',
                    url: '/decision_tree',
                    data: {main_parent_id:tree_parent_id},
                    success: function (response) {
                        $('#decison_tree_parent_id').val(tree_parent_id);
                        $('#show_decision_tree').html(response);
                    }
                });
            }
        }
    });
   

}
function open_tickets() {
    var NumberToDial = getLocalVariable('NumberToDial');
    var client_id = getLocalVariable('ClientID');
    var email = $("#f4").val();
    //var base_url_data=main_base_url+'/dialer/index.php?phone='+NumberToDial+'&email='+email;
    var base_url_data2=main_base_url+'/dialer/index.php?client_id='+client_id+'&phone='+NumberToDial+'&email='+email;
    var base_url_data='';
    $.ajax({
        method: 'POST',
        url: '/ticket_panel',
        success: function (response) {
            if (response.status == true) {
                var new_ticket_base_url = response.data[0].ticket_base_url;
                base_url_data=new_ticket_base_url+'?client_id='+client_id+'&phone='+NumberToDial;
                $('#div_tickets').prop('src',base_url_data);
            }else
            {
                $('#div_tickets').prop('src',base_url_data2);  
            }
        }
    });
}


/*** This code Developed by Alok Ranjan */
function routelist_data() {
    var all_campaign_group = getLocalVariable('all_campaign_group');
    var jsonData = JSON.parse(all_campaign_group);
    var str = "<option value=''>Select Route</option>";
    $.each(jsonData, function (key, value) {
        str += "<option value='" + value + "'>" + key + "</option>";
    });
    $('#route_list').html(str);
}

function routelist_details() {
    var group_route_list = $('#route_list').val();
    var numberStr = group_route_list.split(',');
    var str = "";
    for (let i = 0; i < numberStr.length; i++) {
        str += "<tr onclick=save_routelist('" + numberStr[i] + "')><td>" + numberStr[i] + "</td></tr>";
    }
    $('#route_list_details').html(str);
}
function save_routelist(str) {
    var new_caller_data = str.split('-');
    if (new_caller_data.length == 2) {
        set_new_callerid = new_caller_data[0];
        queue_did_name = new_caller_data[1];
        setLocalVariable('ManualCallerID', set_new_callerid);
        setLocalVariable('queue_did_name', queue_did_name);
    } else {
        setLocalVariable('ManualCallerID', str);
        setLocalVariable('queue_did_name', '');
    }
    $("#infor_section").hide();
    $("#route_section").hide();
    $("#calling_pad").show();
}
function save_callerid() {
    var ManualCallerIDList = getLocalVariable('ManualCallerIDList');
    var setcallerid = ManualCallerIDList.split(',');
    let new_caller_data = setcallerid[0].split('-');
    if (new_caller_data.length == 2) {
        set_new_callerid = new_caller_data[0];
        queue_did_name = new_caller_data[1];
        console.log("caller_id1=" + set_new_callerid);
        setLocalVariable('ManualCallerID', set_new_callerid);
        setLocalVariable('queue_did_name', queue_did_name);
    } else {
        var set_new_callerid = setcallerid[0];
        console.log("caller_id2=" + set_new_callerid);
        setLocalVariable('ManualCallerID', set_new_callerid);
        setLocalVariable('queue_did_name', '');
    }
}
async function get_dataid(phone = '') {
    try {
        const jsonnew_data = {
            phone: phone,
            campaign: getLocalVariable('CampaignName'),
            code: getLocalVariable('ClientID')
        };

        const response = await fetch('/get_dataid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonnew_data)
        });

        if (!response.ok) {
            alertify.error('Network response was not ok for disposition insertion');
            //throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setLocalVariable('crm_data_id', data.data_id);
        setLocalVariable('CRMDataID', data.data_id);
        setLocalVariable('display_name', data.display_name);

    } catch (error) {
        setLocalVariable('crm_data_id', 0);
        setLocalVariable('CRMDataID', 0);
        setLocalVariable('display_name', data.display_name);
    }
}



/** end alok code */
//***  code by Udit */
//call logEntry('Saved successfully.');
function logEntry(logMessage='') {
    let username = localStorage.getItem("USER_ID");
    let client_id = localStorage.getItem("ClientID");
    let user_mode_id = localStorage.getItem("ModeDBId");
    let login_id = localStorage.getItem("LoginHourID");
    $.ajax({
        url: '/log',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ message:logMessage, username:username, client_id:client_id, user_mode_id:user_mode_id, login_id:login_id }),
        success: function (response) {
            console.log('Log sent:'+response);
        },
        error: function (error) {
            console.error('Failed to send log:', error);
        }
    });

}
function progressive_call_api() {
    if (getLocalVariable('UserMode') != 'Progressive') {
        alertify.error("Please select progressive mode");
        return false;
    }
    if (getLocalVariable('AutoProgressive') == 1) 
    {
        setLocalVariable("progressive_dial_status", 1);
    }else
    {
        setLocalVariable("progressive_dial_status", 0);
    }
    
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
/*** Code by Alok Ranjan*/

function recall_insertion(cdate, disposition = '', sub_disposition = '', type = '') {
    //alert(type);
    var phone = localStorage.getItem("NumberToDial");
    var dataid = localStorage.getItem("crm_data_id");
    var campaign = localStorage.getItem("CampaignName");
    var agent_name = "";
    var client_id = localStorage.getItem("ClientID");
    var update_by_ip = localStorage.getItem("MYIP");
    var recall_type = 'cbu';
    var rid = localStorage.getItem("RecordID");
    var calltype = localStorage.getItem("CALL_TYPE");
    var CBUPolicy = localStorage.getItem("CBUPolicy");
    var parent_priority = localStorage.getItem("CBUPriority");
    var recall_by = localStorage.getItem("USER_ID");

    if(CBUPolicy==1)
    {
        agent_name = localStorage.getItem("USER_ID");
    }else
    {
        agent_name = "";
    }
    if (disposition == '') {
        disposition = $("#disposition").val();
    }
    if (sub_disposition == '') {
        sub_disposition = $("#sub_disposition").val();
    }

    var skill = localStorage.getItem("crm_skill");
    $.ajax({
        url: "/insert_recall",
        method: "POST",
        data: { phone:phone, dataid:dataid, campaign:campaign, cdate:cdate, agent:agent_name, client_id:client_id, update_by_ip:update_by_ip, recall_type:recall_type, rid:rid, calltype:calltype, disposition:disposition, sub_disposition:sub_disposition, skill:skill, type:type, recall_by:recall_by, parent_priority:parent_priority},
        dataType: "JSON",
        success: function (data) {
            console.log(JSON.stringify(data));
            let disposition_data = data.CRM_Disposition;
            console.log("disposition length= " + disposition_data);
            $("#disposition").attr('disabled', false);
            $.each(disposition_data, function (key, value) {
                $("#disposition").append("<option value='" + value + "'>" + value + "</option>");

            });
        }
    })
}
function pouse_play() {
    const audio = document.getElementById('myAudio');
    audio.pause();
}
function socket_url() {
    var view_call_detail_url = cs_status_url;
    console.log("Please Open this url" + view_call_detail_url);
    window.open(view_call_detail_url, "", "width=500,height=700");
}
///Callback Function Apply by Jainul

async function checkwrtcCallbacks() {
    console.log("Call callback");
    setTimeout("checkwrtcCallbacks()", 30000);

    const policyValue = getLocalVariable('CBUPolicy');
    const policyText = policyValue === 0 ? "Policy: Manual" :
                   policyValue === 1 ? "Policy: Automatic" :
                   policyValue === 2 ? "Policy: View" :
                   "Policy: Unknown"; // Handle unexpected values
    console.log("Policy Name= "+policyText);
    if (websocketConnected == 0) {
        console.log("Callback cond1");
        return false;
    }
    if (getLocalVariable('WaitingDisposition') == "true") {
        console.log("Callback cond2");
        return false;
    }
    /*if (getLocalVariable('CBUDialing') != 1) {
        console.log("CBUDialing disabled");
        return false;
    }*/
    if (getLocalVariable('is_Recall') == 0) {
        console.log("Callback cond3");
        return false;
    }
    if (getLocalVariable('isRecall_Mode_Allow') == "false") {
        console.log("Callback cond4");
        return false;
    }
    if (getLocalVariable('UserMode') == "Break") {
        console.log("Callback cond5");
        return false;
    }
    if (getLocalVariable('CALL_TYPE') == "RC") {
        console.log("Callback cond6");
        return false;
    }
    if (getLocalVariable('UserMode') == '' || getLocalVariable('CampaignName') == '') {
        console.log("Callback cond7");
        return false;
    }
    if (popUpOpened == 1) {
        console.log("Callback cond8");
        return false;
    }
    if (getLocalVariable('reviewMode') == "1") {
        console.log("Callback cond9");
        return false;
    }
    var duration = getLocalVariable('Recall_Reload_Duration');
    function addMinutes(date, minutes) {
        return new Date(date.getTime() + minutes * 60000);
    }
    function formatDate(date) {
        const year = date.getFullYear();
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const hours = ('0' + date.getHours()).slice(-2);
        const minutes = ('0' + date.getMinutes()).slice(-2);
        const seconds = ('0' + date.getSeconds()).slice(-2);
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    console.log("Recall_Reload_Duration= " + getLocalVariable('Recall_Reload_Duration'));
    const currentDate = new Date();
    const newDate = addMinutes(currentDate, getLocalVariable('Recall_Reload_Duration'));

    console.log("Recall_Reload_Duration currentDate= " + currentDate);
    console.log("Recall_Reload_Duration newDate= " + newDate);
    const add_recall_date = formatDate(newDate);
    console.log("Recall_Reload_Duration add_recall_date= " + add_recall_date);
    var CallbackAlert = getLocalVariable('CallbackAlert');
    var add_Recall_Reload_Duration = add_recall_date;
    $.ajax({
        method: 'POST',
        url: '/reloadRecall',
        data: {
            Recall_Reload_Duration: getLocalVariable('Recall_Reload_Duration'),
            add_Recall_Reload_Duration: add_Recall_Reload_Duration,
            USER_ID: getLocalVariable('USER_ID'),
            CampaignName: getLocalVariable('CampaignName'),
            ClientID: getLocalVariable('ClientID'),
            isDisplayPhone: getLocalVariable('isDisplayPhone'),
            Callback_Auto: getLocalVariable('Callback_Auto'),
            LastRecallAlertId: getLocalVariable('LastRecallAlertId'),
            client_type: getLocalVariable('client_type'),
            UserMode: getLocalVariable('UserMode'),
            UserModeIndex: getLocalVariable('UserModeIndex'),
            WaitingDisposition: getLocalVariable('WaitingDisposition'),
            isLineBusy: getLocalVariable('isLineBusy'),
            LastModeBeforeRecall: getLocalVariable('LastModeBeforeRecall'),
            LastModeIndexBeforeRecall: getLocalVariable('LastModeIndexBeforeRecall'),
            SIP_ID: getLocalVariable('SIP_ID'),
            AS_ID: getLocalVariable('AS_ID'),
            SERVER_IP: getLocalVariable('SERVER_IP'),
            CS_API_Port: getLocalVariable('CS_API_Port'),
            Campaign_PreFix: getLocalVariable('Campaign_PreFix'),
            User_Status_ID: getLocalVariable('User_Status_ID'),
            NextUserMode: getLocalVariable('NextUserMode'),
            LoginHourID: getLocalVariable('LoginHourID'),
            NextUserModeIndex: getLocalVariable('NextUserModeIndex'),
            UserModeIndexLabel: JSON.parse(getLocalVariable('UserModeIndexLabel')),
            SipCheckStatus: getLocalVariable('SipCheckStatus'),
            campaignType: getLocalVariable('Campaign_Type'),
            ManualCallerIDList: getLocalVariable('ManualCallerIDList'),
            Queue_Priority: JSON.parse(getLocalVariable('Queue_Priority')),
            IsDedicatedCLI: getLocalVariable('IsDedicatedCLI'),
            ModeDBId: getLocalVariable('ModeDBId'),
            MOPanel: getLocalVariable('MOPanel'),
            ChatA: getLocalVariable('ChatA'),
            ChatLoginID: getLocalVariable('ChatLoginID'),
            lastQueuePause: getLocalVariable('lastQueuePause'),
            UserModeIndexID: JSON.parse(getLocalVariable('UserModeIndexID')),
            UserModeRecall: JSON.parse(getLocalVariable('UserModeRecall')),
            emailCount: getLocalVariable('EMAIL_COUNT'),
            smsCount: getLocalVariable('SMS_COUNT'),
            idleDuration: getLocalVariable('Idle_Duration'),
            wrapupDuration: getLocalVariable('Wrapup_Duration'),
            holdCount: getLocalVariable('Hold_Count'),
            holdDuration: getLocalVariable('Hold_Duration'),
            recallCount: getLocalVariable('Recall_Count'),
            recallDuration: getLocalVariable('Recall_Duration'),
            breakDuration: getLocalVariable('Break_Duration'),
            moDuration: getLocalVariable('Mo_Duration'),
            transferCount: getLocalVariable('Transfer_Count'),
            TMCCount: getLocalVariable('TMCCount'),
            TOBCount: getLocalVariable('TOBCount'),
            TIBCount: getLocalVariable('TIBCount'),
            TRCCount: getLocalVariable('TRCCount'),
            TTCCount: getLocalVariable('TTCCount'),
            TCCCount: getLocalVariable('TCCCount'),
            Call_Mc_Count: getLocalVariable('Call_Mc_Count'),
            Call_Ob_Count: getLocalVariable('Call_Ob_Count'),
            Call_In_Count: getLocalVariable('Call_In_Count'),
            Conference_Count: getLocalVariable('Conference_Count'),
            IsLicenseActive: getLocalVariable('IsLicenseActive'),
            DialPad: getLocalVariable('DialPad'),
            CRMLeadId: getLocalVariable('CRMLeadId'),
            Recall_Count: getLocalVariable('Recall_Count'),
            Campaign_DNC_Check: getLocalVariable('Campaign_DNC_Check'),
            DNCURL: getLocalVariable('DNCURL'),
            isRemoteDNC: getLocalVariable('isRemoteDNC'),
            RemoteDNCUrl: getLocalVariable('RemoteDNCUrl'),
            CBADialing: getLocalVariable('CBADialing'),
            CBIDialing: getLocalVariable('CBIDialing'),
            CBUDialing: getLocalVariable('CBUDialing'),
            CBSDialing: getLocalVariable('CBSDialing'),
            CBEDialing: getLocalVariable('CBEDialing'),
            CBQDialing: getLocalVariable('CBQDialing'),
            DialedRoute: getLocalVariable('DialedRoute'),
            CBUPolicy: getLocalVariable('CBUPolicy'),
            agentPrefix: JSON.parse(getLocalVariable('agentPrefix')),
            isRecall_Mode_Allow: getLocalVariable('isRecall_Mode_Allow'),
            skill: JSON.parse(getLocalVariable('skill')),
            Manual_Dial_Route: getLocalVariable('Manual_Dial_Route'),
            Manual_Caller_ID: getLocalVariable('Manual_Caller_ID'),
            CallbackAlert: CallbackAlert,
            callback_notify:getLocalVariable('callback_notify')
        },
        success: async function (result) {
            console.log("False " + JSON.stringify(result));
            console.log("Callback Status= " + result.status);
            if (result.status == true && getLocalVariable('CBUDialing') == 1) {

                if(result.callback_notify == "Yes")
                {
                    setLocalVariable("callback_notify", "Yes");
                }
                console.log("callback json= " + JSON.stringify(result));
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
                if (typeof result.data.otherCallback !== 'undefined') {
                    var otherCallback = getLocalVariable('otherCallback');
                    if (otherCallback.length == 0 && postCallbackAlertShow == 0 && result.data.otherCallback.length > 0) {
                        toastr["info"]("Callback for other campaign");
                        setLocalVariable("CallbackAlert", "1");
                        cupdateLocalVariables(result.data);
                    }
                }
                $("#callback_count").html(result.total_nums_callback);
                $("#callback_phone").html(result.callback_number);
                $("#next_callback").html(result.callback_date);
                if (typeof result.data.PreNotification !== 'undefined') {
                    if (result.data.PreNotification.length > 0) {
                        toastr["info"](result.data.PreNotification);
                        setLocalVariable("LastRecallAlertId", result.data.LastRecallAlertId);
                        var Recall_Count = getLocalVariable('Recall_Count');
                        //alert(Recall_Count);
                        if (Recall_Count == 'undefined' || Recall_Count == 0) {
                            var Recall_Count = 1;
                        }
                        $("#callback_count").html(result.total_nums_callback);
                        $("#callback_phone").html(result.data.callback_number);
                        $("#next_callback").html(result.data.callback_date);
                    }
                }
                if (result.callback_type == 'overdue') {
                    var Recall_Count = getLocalVariable('Recall_Count');
                    if (Recall_Count == 'undefined' || Recall_Count == 0) {
                        var Recall_Count = 1;
                    }
                    $("#callback_count").html(result.total_nums_callback);
                    $("#callback_phone").html(result.callback_number);
                    $("#next_callback").html(result.callback_date);
                }
                console.log("result.data " + JSON.stringify(result.data));
                cupdateLocalVariables(result.data);
                var nextCall = getLocalVariable('nextCall');
                if (result.data.length > 0) {
                    toastr["info"](result.msg, "Next Callback");
                    setLocalVariable('nextCall', '');
                    let text = 'Incoming Call from ' + result.data[0]['phone'];
                    if(getLocalVariable("UserMode").toUpperCase()!='CALLBACK')
                    {
                        await callback_dialpad_setdialmode('Callback','set_callback_mode');
                    }
                    sleep(5000);
                    setLocalVariable("last_callback_id", result.data[0]['id']);
                    if(getLocalVariable("UserMode").toUpperCase()=='CALLBACK')
                    {
                        DialByLineRecall("audio", "", result.data[0]['phone'], "", "", "RC", result.data[0]['dataid'],'','auto_callback');
                        return false;
                    }
                    
                    
                }
            }
            else {
                if(getLocalVariable("WaitingDisposition")=='false' && getLocalVariable("isLineBusy")=='READY' && getLocalVariable("UserMode").toUpperCase()=='CALLBACK' && getLocalVariable("pre_callback_dialling")==1 && getLocalVariable("dial_type")=='auto_callback')
                {
                    sleep(6000);
                    if(getLocalVariable("LastUserMode").toUpperCase()=='' && getLocalVariable("LastModeBeforeRecall").toUpperCase()!='CALLBACK')
                    {
                        await callback_dialpad_setdialmode(getLocalVariable("LastModeBeforeRecall","set_nocallback_mode"));
                    }
                    if(getLocalVariable("LastModeBeforeRecall").toUpperCase()=='' && getLocalVariable("LastUserMode").toUpperCase()!='CALLBACK')
                    {
                        await callback_dialpad_setdialmode(getLocalVariable("LastUserMode","set_nocallback_mode"));
                    }
                    sleep(6000);
                    localStorage.setItem("pre_callback_dialling",0);
                    localStorage.setItem("dial_type",'');
                }
                
            }
        }
    });

}
function cupdateLocalVariables(data) {
    for (var i in data) {
        if (typeof (data[i]) == "object") {
            setLocalVariable(i, JSON.stringify(data[i]));
        } else {
            setLocalVariable(i, data[i]);
        }
    }
}

///End Callback By Jainul

/***code by udit */
async function fetchLanguage() {
    try {
        const user_id = localStorage.getItem("USER_ID");
        const client_id = localStorage.getItem("ClientID");

        // Clear existing options
        $("#doctor_language").html("<option value=''>Select Language</option>");

        // Make the AJAX request
        const response = await $.ajax({
            url: "/api_calling/fetchLanguages",
            method: "GET",
            data: { user_id: user_id, client_id: client_id },
            dataType: "JSON"
        });

        console.log('Fetched Languages:', response); // For debugging

        if (Array.isArray(response) && response.length > 0) {
            response.forEach(function (language) {
                // Create new option element and append it to the dropdown
                $("#doctor_language").append(
                    `<option value="${language.id}">${language.name}</option>`
                );
            });
        } else {
            console.log('No languages fountd');
        }
    } catch (error) {
        console.error('Failed to fetch languages:', error);
    }
}

$('#doctor_language').change(async function () {
    const doctor_language = $('#doctor_language').val();
    const agent = localStorage.getItem("USER_ID");
    const client_id = localStorage.getItem("ClientID");
    const tag = "doctor_list";

    try {
        const response = await fetch('/api_calling/dropdownDoctor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ doctor_language, client_id, agent, tag })
        });

        const res = await response.text();
        $('#doctor_name').empty();
        $('#doctor_name').append(res);
    } catch (error) {
        console.error('Error occurred:', error);
    }
});

$('#doctor_name').change(async function () {
    const call_date = $('#call_date').val();
    const doctor_name = $('#doctor_name').val();
    const client_id = localStorage.getItem("ClientID");
    const tag = "slot_list";

    try {
        const response = await fetch('/api_calling/dropdownSlot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ call_date, doctor_name, tag, client_id })
        });

        const res = await response.text();
        $('#slot_id').html(res);
    } catch (error) {
        console.error('Error occurred:', error);
    }
});


$('#call_date').change(async function () {
    const call_date = $('#call_date').val();
    const doctor_name = $('#doctor_name').val();
    const client_id = localStorage.getItem("ClientID");
    const tag = "slot_list";

    try {
        const response = await fetch('/api_calling/dropdownSlot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ call_date, doctor_name, tag, client_id })
        });

        const res = await response.text();
        $('#slot_id').html(res);
    } catch (error) {
        console.error('Error occurred:', error);
    }
});

$('#email_sent').button({ icons: {}, text: true }).click(function () {
    var campaign_id = localStorage.getItem("CampaignName");
    var clientID = localStorage.getItem("ClientID");
    var doctor_language = $('#doctor_language').val();
    var customer_email = $('#f4').val() || '';
    var product_df = '';
    var link_df = '';
    if (customer_email.length === 0) {
        alertify.error("Customer Email ID not available!...");
        return false;
    }

    if ($('#product_df').val() != "") {
        product_df = $('#' + $('#product_df').val()).val();
    }
    if ($('#link_df').val() != "") {
        link_df = $('#' + $('#link_df').val()).val();
    }



    var filter = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!filter.test(customer_email)) {
        alertify.error("Customer Email ID is not valid!...");
        return false;
    }

    if ($('#doctor_language').val().length === 0) {
        alertify.error("Please Select Language!...");
        document.getElementById("doctor_language").style.border = "1px solid red";
        document.getElementById("doctor_language").focus();
        return false;
    }

    document.getElementById("doctor_language").style.border = "";

    if ($('#doctor_name').val().length === 0) {
        alertify.error("Please Select Name!...");
        document.getElementById("doctor_name").style.border = "1px solid red";
        document.getElementById("doctor_name").focus();
        return false;
    }

    document.getElementById("doctor_name").style.border = "";

    if ($('#slot_id').val().length === 0) {
        alertify.error("Please Select Slot!...");
        document.getElementById("slot_id").style.border = "1px solid red";
        document.getElementById("slot_id").focus();
        return false;
    }

    document.getElementById("slot_id").style.border = "";

    var doctor_name = $('#doctor_name').val();
    var slot_id = $('#slot_id').val();
    var call_date = $('#call_date').val();

    $.post('/api_calling/send-email', {
        tag: 'sent_email',
        campaign_id: campaign_id,
        clientID: clientID,
        customer_email: customer_email,
        doctor_language: doctor_language,
        doctor_name: doctor_name,
        slot_id: slot_id,
        call_date: call_date,
        agent_id: localStorage.getItem("USER_ID"),
        customer_name: $("#f1").val(),
        product_df: product_df,
        link_df: link_df
    }, function (result) {
        if (result.ok === true) {
            $('#doctor_language').val('');
            $('#doctor_name').val('');
            $('#slot_id').val('');
            $('#call_date').val('');
            alertify.success("Email Sent!...");
            // $('#email_sent').attr("disabled", "disabled");
        } else {
            alertify.error(result.error || "Error in sending email!...");
        }
    }).fail(function (jqXHR) {
        var errorMsg = jqXHR.responseJSON && jqXHR.responseJSON.error ? jqXHR.responseJSON.error : "Error in sending email!...";
        alertify.error(errorMsg);
    });

    return false;
});

function CurrentDateTime() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(now.getDate()).padStart(2, '0');

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
function getTimeDifferenceInSeconds(date1, date2) {
    // Convert both dates to milliseconds
    let date1_ms = date1.getTime();
    let date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    let difference_ms = date2_ms - date1_ms;

    // Convert back to seconds and return
    return Math.floor(difference_ms / 1000);
}
async function update_hold() {

    try {
        let hold_count_data = getLocalVariable('Hold_Count');
        var call_hold_counter = parseInt(window.localStorage.getItem('Hold_Counter'));
        var jsonnew_data = {
            "ModeDBId": getLocalVariable('ModeDBId'),
            "record_id": getLocalVariable('RecordID'),
            "hold_date_time": call_hold_counter,
            "hold_count": hold_count_data
        };
        /** Enter log for Dilar */
        console.log("update_hold " + JSON.stringify(jsonnew_data));
        logEntry("Hold total counter= "+ JSON.stringify(jsonnew_data));
        /** end log */
        const response = await fetch('/update_hold_counter', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonnew_data)
        });

        if (!response.ok) {
            alertify.error('Network response was not ok for disposition insertion');
            //throw new Error('Network response was not ok');
        }

        const data = await response.json();
    } catch (error) {
        alertify.error("hold no update");
    }
}

/*** end code udit */
/*code for log start by udit*/
document.addEventListener('DOMContentLoaded', function () {
    var startDateInput = document.getElementById('start-date-disposition-search');
    var endDateInput = document.getElementById('end-date-disposition-search');

    function updateEndDateMin() {
        // Set the min attribute of end date input to the value of the start date input
        endDateInput.min = startDateInput.value;

        if (endDateInput.value < endDateInput.min) {
            endDateInput.value = endDateInput.min;
        }
    }

    // Update end date min value when start date changes
    startDateInput.addEventListener('change', updateEndDateMin);


});
var zstr = '<option value="">Select Zone</option>';
$.ajax({
    url: '/api_calling/zone-list',
    type: 'POST',
    data: {
        clientID: getLocalVariable('ClientID')
    },
    dataType: 'json',
    success: function (result) {
        console.log('AJAX Response:', result);
        if (result.ok === true) {
            var res = result.data;
            // Ensure res is an array and process each item
            res.Zone_Time.forEach(function (item) {
                var zone = item.split("~");
                var selected = '';
                if (zone[0] === zone[2]) {
                    selected = 'selected';
                }
                zstr += "<option value='" + zone[1] + "' " + selected + ">" + zone[0] + "(" + zone[3] + ")" + "</option>";
            });
            $('#time_formate').html(zstr);
        } else {
            console.log('Error: ', result);
        }
    },
    error: function (xhr, status, error) {
        console.error('Error fetching zone list:', error);
    }
});

var num = /^[0-9]+$/;
var strp = /^[a-z0-9\s\.\#\_\<\>]+$/i;
$('.disposition-search-icon').click(function () {
    var txt = $('#searchtxt').val();
    if (txt.length == 0) {
        alertify.error("Please type number / name to search.");
        return;
    }
    if (!strp.test(txt) && !num.test(txt)) {
        alertify.error("Please enter alphabets or numbers to search.");
        return;
    }
    if ($('#time_formate').val().length === 0) {
        alertify.error("Please Select Zone!...");
        return;
    }
    let data_record={
        tag: 'disposition-log-search',
        search: txt,
        disp: $('#disposition-disposition-search').val(),
        sub_disp: $('#sub-disposition-disposition-search').val(),
        startdate: $('#start-date-disposition-search').val(),
        enddate: $('#end-date-disposition-search').val(),
        USER_ID: getLocalVariable('USER_ID'),
        isDisplayPhone: getLocalVariable('isDisplayPhone'),
        mns: getLocalVariable('multiple_number_search'),
        time_formate: $('#time_formate').val(),ClientID: getLocalVariable('ClientID')};

    $.ajax({
        url: '/api_calling/disposition-log-search',
        type: 'POST',
        data: data_record,
        success: function (result) {
            if (result.ok == true) {
                $('.detailed-crm-log').hide();
                $('#disposition-data').show();
                /*$('#iframe').prop("src", "");
                $('#iframe').hide();*/
                $('.detailed-crm-log .table-heading p').html("Searched Disposition Logs");
                $('.detailed-crm-log .table-heading p').css("width", "100%");
                $('#disposition-data .data').html(result.tbody);
                $('#summary-disposition tbody').html(result.count);
                
                searchTableColumn('#disposition-data .data table tbody');
            } else {
                alertify.error("No records available.");
                /*destroyDataTable('detailed-disposition');
                $('#iframe').prop("src", "");
                $('#iframe').hide();*/
                $('.detailed-crm-log .table-heading p').html("Searched Disposition Logs");
                $('.detailed-crm-log').hide();
                $('#disposition-data .data').html('');
                $('#disposition-data').show();
            }
        },
        error: function (xhr, status, error) {
            alertify.error("An error occurred: " + error);
        }
    });
});


/***********webrtc call log********** */

$('.webrtc_calllog-search-icon').click(function () {
    var txt = $('#searchtxt').val();
    let CallLogPermission = getLocalVariable('CallLogPermission');
    console.log("CallLogPermission= "+CallLogPermission);
    if (CallLogPermission!='true') {
        alertify.error("Access denied...!");
        return false;
    }
    /*if (txt.length == 0) {
        alertify.error("Please type number / name to search.");
        return;
    }
    if (!strp.test(txt) && !num.test(txt)) {
        alertify.error("Please enter alphabets or numbers to search.");
        return;
    }*/
    if ($('#time_formate').val().length === 0) {
        alertify.error("Please Select Zone!...");
        return;
    }
    let data_record={
        search: txt,
        disp: $('#disposition-disposition-search').val(),
        sub_disp: $('#sub-disposition-disposition-search').val(),
        startdate: $('#start-date-disposition-search').val(),
        enddate: $('#end-date-disposition-search').val(),
        USER_ID: getLocalVariable('USER_ID'),
        isDisplayPhone: getLocalVariable('isDisplayPhone'),
        mns: getLocalVariable('multiple_number_search'),
        time_formate: $('#time_formate').val(),ClientID: getLocalVariable('ClientID')};

    $.ajax({
        url: '/api_calling/webrtc_calllog',
        type: 'POST',
        data: data_record,
        success: function (result) {
            if (result.ok == true) {
                $('.detailed-crm-log').hide();
                $('#disposition-data').show();
                /*$('#iframe').prop("src", "");
                $('#iframe').hide();*/
                $('.detailed-crm-log .table-heading p').html("Searched Disposition Logs");
                $('.detailed-crm-log .table-heading p').css("width", "100%");
                $('#disposition-data .data').html(result.tbody);
                $('#summary-disposition tbody').html(result.count);
                searchTableColumn('#disposition-data .data table tbody');
            } else {
                alertify.error("No records available.");
                /*destroyDataTable('detailed-disposition');
                $('#iframe').prop("src", "");
                $('#iframe').hide();*/
                $('.detailed-crm-log .table-heading p').html("Searched Disposition Logs");
                $('.detailed-crm-log').hide();
                $('#disposition-data .data').html('');
                $('#disposition-data').show();
            }
        },
        error: function (xhr, status, error) {
            alertify.error("An error occurred: " + error);
        }
    });
});

/******end Call log******* */

/*** code by alok */
async function get_permission() {
    const client_id = getLocalVariable('ClientID');
    const user_id = getLocalVariable('USER_ID');

    try {
        const response = await fetch('/user_permission', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_id, client_id })
        });

        if (!response.ok) {
            // throw new Error('Network response was not ok');
            console.log('Network response was not ok');
            setLocalVariable('feedback_permission', 0);
            setLocalVariable('listen_permission', 0);
            setLocalVariable('download_permission', 0);
        }

        const result = await response.json();
        // Handle the result here
        console.log("feedback_data= " + JSON.stringify(result));
        if (result.status == true) {
            setLocalVariable('feedback_permission', result.data[0].feedback);
            setLocalVariable('listen_permission', result.data[0].listen);
            setLocalVariable('download_permission', result.data[0].download);
        } else {
            setLocalVariable('feedback_permission', 0);
            setLocalVariable('listen_permission', 0);
            setLocalVariable('download_permission', 0);
        }


    } catch (error) {
        console.log('Network response was not ok');
        setLocalVariable('feedback_permission', 0);
        setLocalVariable('listen_permission', 0);
        setLocalVariable('download_permission', 0);
    }
}

function openPath(url) {
    var $a = $('<a>', {
        href: url,
        target: '_blank',
        style: 'display: none;' // Hide the anchor element
    }).appendTo('body');

    // Trigger a click on the anchor element
    $a[0].click();

    // Optionally remove the anchor after the click
    $a.remove();

}
function openExternalCRM(labels, token = '', timestamp = '', ph = '') {
    $("#div_localcrm").show();
    $("#div_varc").show();
    $("#div_internalc").show();
    var urlmappedtodid = JSON.parse(getLocalVariable('Allow_DID_Map_URL'));
    var calltype = getLocalVariable('CALL_TYPE') != 'IB' ? 'OB' : 'IB';
    if (getLocalVariable('Campaign_Crm_Mode') == '1' && getLocalVariable('Campaign_Crm_Status') == '1' && getLocalVariable('WebScript').length > 0) {
        $("#div_localcrm").hide();
        var path = getLocalVariable('WebScript');
        var WebScriptparameter = getLocalVariable('WebScriptparameter');
        path += (path.indexOf("?") > -1) ? "" : "?";
        path += (path.slice(-1) == '&') ? "" : "&";
        path += "phone=" + getLocalVariable('DispalyPhoneNumber') + "&agent=" + getLocalVariable('USER_ID') + "&campaign=" + getLocalVariable('CampaignName') + "&"
            + "did=" + getLocalVariable('DisplayCallerID') + "&dataid=" + getLocalVariable('CRMDataID') + "&TIMESTAMP=" + getLocalVariable('') + "&"
            + "rid=" + getLocalVariable('RecordID') + "&CALL_TYPE=" + getLocalVariable('CALL_TYPE') + "&CLIENT_ID=" + getLocalVariable('ClientID') + "&"
            + "SKILL=" + getLocalVariable('LastSkillUsed') + "&didname=" + getLocalVariable('DisplayDIDName') + "&REDIAL=" + getLocalVariable('redial') + "&"
            + "SIP_ID=" + getLocalVariable('SIP_ID') + "&CIRCLE_PERMISSION=" + getLocalVariable('circle') + "&DATASETID=" + getLocalVariable('dataset') + "&"
            + "MNS=" + getLocalVariable('multiple_number_search') + "&CAMPAIGN_TYPE=" + getLocalVariable('Campaign_Type');
        $("#div_varc").hide();
        $("#div_internalc").hide();
        openPath(path);
        //window.open(path, "_blank");
        $('.header_part').css("display", "block");
        $('#top-crm-continer').css("display", "none");
        $('#show_disposition_section').css("display", "none");
        /** Call external crm log*/
        logEntry("Call External crm");
    }
    if (getLocalVariable('Campaign_Crm_Mode') == '1' && getLocalVariable('Campaign_Crm_Status') == '0' && getLocalVariable('WebScript').length > 0) {
        $("#div_localcrm").hide();
        var path = getLocalVariable('WebScript');
        var WebScriptparameter = getLocalVariable('WebScriptparameter');
        path += (path.indexOf("?") > -1) ? "" : "?";
        path += (path.slice(-1) == '&') ? "" : "&";
        path += "phone=" + getLocalVariable('DispalyPhoneNumber') + "&agent=" + getLocalVariable('USER_ID') + "&campaign=" + getLocalVariable('CampaignName') + "&"
            + "did=" + getLocalVariable('DisplayCallerID') + "&dataid=" + getLocalVariable('CRMDataID') + "&TIMESTAMP=" + getLocalVariable('') + "&"
            + "rid=" + getLocalVariable('RecordID') + "&CALL_TYPE=" + getLocalVariable('CALL_TYPE') + "&CLIENT_ID=" + getLocalVariable('ClientID') + "&"
            + "SKILL=" + getLocalVariable('LastSkillUsed') + "&didname=" + getLocalVariable('DisplayDIDName') + "&REDIAL=" + getLocalVariable('redial') + "&"
            + "SIP_ID=" + getLocalVariable('SIP_ID') + "&CIRCLE_PERMISSION=" + getLocalVariable('circle') + "&DATASETID=" + getLocalVariable('dataset') + "&"
            + "MNS=" + getLocalVariable('multiple_number_search') + "&CAMPAIGN_TYPE=" + getLocalVariable('Campaign_Type');
        $("#div_varc").hide();
        $("#div_internalc").hide();
        //$('#alternate-crm-internal').attr('src', path);
        var new_html = '<iframe id="alternate-crm-internal" style="height:400px;width:1050px" title="external_crm" src="' + path + '"></iframe>';
        $('#webrtc_crm_data').html(new_html);
        $('.header_part').css("display", "block");
        $('#top-crm-continer').css("display", "none");
        $('#show_disposition_section').css("display", "none");

        /** Call external crm log*/
        logEntry("Call External crm with webcrm");
    }
    var alternateCRM1 = getLocalVariable('alternateCRM1');
    if (getLocalVariable('ClientID') == "8363") {
        if (getLocalVariable('CALL_TYPE') == "IB") {
            alternateCRM1 = 'http://matrix.droom.in/admin/damp/index?phone=' + ph + '&email=&leid=&follow_up_scheule_time=&condition=&inbound=&when_to_buy=&assistance_lead=&dlid=&lead_classification=&big_asset_listing_id=&coupon_code=&first_name=&purpose=&startDate=2014-04-01&endDate=' + timestamp + '&dto=Life%20Time';
        } else {
            alternateCRM1 = 'http://matrix.droom.in/admin/damp/customer-history/' + token;
        }
    }
    if (alternateCRM1 != null && alternateCRM1 != 'null' && typeof (alternateCRM1) != "undefined" && alternateCRM1.length != 0) {
        if (alternateCRM1.indexOf("?") > -1) {
            var queryString = alternateCRM1.split('?');
            if (queryString[1].indexOf("&") > -1) {
                var querys = queryString[1].split('&');
                var path = queryString[0] + "?";
                for (var i in querys) {
                    var str = querys[i].split("=");
                    var value = str[1];
                    if (str[0].toLowerCase() == 'phone' || str[0].toLowerCase() == 'mobile' || str[0].toLowerCase() == 'mobilenumber' || str[0].toLowerCase() == 'contactnumber' || str[0].toLowerCase() == 'mobile_phone' || str[0].toLowerCase() == 'contact_number') {
                        value = $('#phone').val();
                    } else {
                        if (labels.hasOwnProperty(str[0].toLowerCase())) {
                            value = $('#f' + labels[str[0].toLowerCase()]).val();
                        }
                    }
                    path += str[0] + "=" + value + "&";
                }
                openPath(path);
                // window.open(path, "_blank");
            } else {
                var str = queryString[1].split("=");
                var value = str[1];
                if (str[0].toLowerCase() == 'phone') {
                    value = $('#phone').val();
                } else {
                    if (labels.hasOwnProperty(str[0].toLowerCase())) {
                        value = $('#f' + labels[str[0].toLowerCase()]).val();
                    }
                }
                path = queryString[0] + "?" + str[0] + "=" + value;
                openPath(path);
            }
        } else {

            // window.open(alternateCRM1, "_blank");
        }
    }
    var alternateCRM2 = getLocalVariable('alternateCRM2');
    if ((alternateCRM2) != null && (alternateCRM2) != 'null' && typeof (alternateCRM2) != "undefined" && alternateCRM2.length != 0) {
        if (alternateCRM2.indexOf("~") > -1) {
            var crmpaths = alternateCRM2.split('~');
            for (var c in crmpaths) {
                if (crmpaths[c].indexOf("?") > -1) {
                    var queryString = crmpaths[c].split('?');
                    if (queryString[1].indexOf("&") > -1) {
                        var querys = queryString[1].split('&');
                        var path = queryString[0] + "?";
                        for (var i in querys) {
                            var str = querys[i].split("=");
                            var value = str[1];
                            if (str[0].toLowerCase() == 'phone' || str[0].toLowerCase() == 'mobile' || str[0].toLowerCase() == 'mobilenumber' || str[0].toLowerCase() == 'contactnumber' || str[0].toLowerCase() == 'mobile_phone' || str[0].toLowerCase() == 'contact_number') {
                                value = $('#phone').val();
                            } else {
                                if (labels.hasOwnProperty(str[0].toLowerCase())) {
                                    value = $('#f' + labels[str[0].toLowerCase()]).val();
                                }
                            }
                            path += str[0] + "=" + value + "&";
                        }
                        openPath(path);
                        // window.open(path, "_blank");
                    } else {
                        var str = queryString[1].split("=");
                        var value = str[1];
                        if (str[0].toLowerCase() == 'phone' || str[0].toLowerCase() == 'mobile' || str[0].toLowerCase() == 'mobilenumber' || str[0].toLowerCase() == 'contactnumber' || str[0].toLowerCase() == 'mobile_phone' || str[0].toLowerCase() == 'contact_number') {
                            value = $('#phone').val();
                        } else {
                            if (labels.hasOwnProperty(str[0].toLowerCase())) {
                                value = $('#f' + labels[str[0].toLowerCase()]).val();
                            }
                        }
                        path = queryString[0] + "?" + str[0] + "=" + value;
                        //    window.open(path, "_blank");
                    }
                } else {
                    openPath(crmpaths[c]);
                    //  window.open(crmpaths[c], "_blank");
                }
            }
        } else {
            if (alternateCRM2.indexOf("?") > -1) {
                var queryString = alternateCRM2.split('?');
                if (queryString[1].indexOf("&") > -1) {
                    var querys = queryString[1].split('&');
                    var path = queryString[0] + "?";
                    for (var i in querys) {
                        var str = querys[i].split("=");
                        var value = str[1];
                        if (str[0].toLowerCase() == 'phone' || str[0].toLowerCase() == 'mobile' || str[0].toLowerCase() == 'mobilenumber' || str[0].toLowerCase() == 'contactnumber' || str[0].toLowerCase() == 'mobile_phone' || str[0].toLowerCase() == 'contact_number') {
                            value = $('#phone').val();
                        } else {
                            if (labels.hasOwnProperty(str[0].toLowerCase())) {
                                value = $('#f' + labels[str[0].toLowerCase()]).val();
                            }
                        }
                        path += str[0] + "=" + value + "&";
                    }
                    openPath(path);
                    //  window.open(path, "_blank");
                } else {
                    var str = queryString[1].split("=");
                    var value = str[1];
                    if (str[0].toLowerCase() == 'phone' || str[0].toLowerCase() == 'mobile' || str[0].toLowerCase() == 'mobilenumber' || str[0].toLowerCase() == 'contactnumber' || str[0].toLowerCase() == 'mobile_phone' || str[0].toLowerCase() == 'contact_number') {
                        value = $('#phone').val();
                    } else {
                        if (labels.hasOwnProperty(str[0].toLowerCase())) {
                            value = $('#f' + labels[str[0].toLowerCase()]).val();
                        }
                    }
                    path = queryString[0] + "?" + str[0] + "=" + value;
                    openPath(path);
                    //   window.open(path, "_blank");
                }
            } else {
                openPath(path);
                //  window.open(alternateCRM2, "_blank");
            }
        }
    }
}





$('.crm-search-icon').click(function () {
    var txt = $('#searchtxt').val();
    if (txt.length == 0) {
        alertify.error("Please type number / name to search.");
        return;
    }
    if (!strp.test(txt) && !num.test(txt)) {
        alertify.error("Please enter alphabets or numbers to search.");
        return;
    }
    if ($('#time_formate').val().length === 0) {
        alertify.error("Please Select Zone!...");
        return;
    }

    $.ajax({
        url: '/api_calling/crm-log-search/',
        type: 'POST',
        data: {
            search: txt,
            isDisplayPhone: getLocalVariable('isDisplayPhone'),
            time_formate: $('#time_formate').val(),
            ClientID: getLocalVariable('ClientID'),
            campaign: getLocalVariable('CampaignName')
        },
        success: function (result) {
            if (result.ok) {
                $('.detailed-crm-log').show();
                $('#disposition-data').hide();
                /*$('#iframe').prop("src", "");
                $('#iframe').hide();*/
                $('#disposition-data').hide();
                $('#detailed-disposition').show();
                $('.detailed-crm-log .table-heading p').html("Searched CRM Logs");
                $('#detailed-disposition thead').html(result.thead);
                $('#detailed-disposition tfoot').html(result.thead);
                $('#detailed-disposition tbody').html(result.tbody);
                $('table#detailed-disposition tfoot th').each(function () {
                    var title = $(this).text();
                    if (title != '#') {
                        $(this).html('<input type="text" class="bottomserach form-control" placeholder="Search ' + title + '" />');
                    } else {
                        $(this).html('');
                    }
                });
                reinitializeDataTable('detailed-disposition', result.tbody);
                $('#summary-disposition tbody').html('');
                $('#detailed-disposition tbody tr').off('dblclick').on('dblclick', function () {
                    var phone = $(this).prop('id');
                    var id = $(this).attr('data-crm-dataid');
                    setLocalVariable('CRMDataID', id);
                    //todial(phone);
                    //$("#dial_phone").val('');
                }).off('click').on('click', function () {
                    $('#detailed-disposition tbody tr').removeClass("detailed-callback-active");
                    var id = $(this).prop('id');
                    var selectID = $(this).attr('data-select');
                    $('#phone-number-to-copy').val(id);
                    $('#detailed-disposition tbody tr[data-select="' + selectID + '"]').addClass("detailed-callback-active");
                    var phoneToCopy = document.getElementById("phone-number-to-copy");
                    phoneToCopy.select();
                    document.execCommand("copy");
                });
            } else {
                alertify.error("No records available.");
                // destroyDataTable('detailed-disposition');
                /*$('#iframe').prop("src", "");
                $('#iframe').hide();*/
                $('.detailed-crm-log').show();
                $('#disposition-data').hide();
                $('.detailed-crm-log .table-heading p').html("Searched CRM Logs");
                $('#detailed-disposition thead').html('');
                $('#detailed-disposition tfoot').html('');
                $('#detailed-disposition tbody').html('');
                $('#summary-disposition tbody').html('');
            }
        },
        error: function () {
            alertify.error("An error occurred while processing your request.");
        }
    });
});

function reinitializeDataTable(tableId, tbodyHtml) {
    $('#' + tableId + ' tbody').html(tbodyHtml);

    // Add event listeners to each search input
    $('#' + tableId + ' tfoot input').on('keyup change', function () {
        filterTable(tableId);
    });
}

$('.directory-search-icon').click(function () {
    var txt = $('#searchtxt').val();
    if (txt.length == 0) {
        alertify.error("Please type number / name / designation / tier to search.");
        return;
    }
    if (!strp.test(txt) && !num.test(txt)) {
        alertify.error("Please enter alphabets or numbers to search.");
        return;
    }
    if ($('#time_formate').val().length === 0) {
        alertify.error("Please Select Zone!...");
        return;
    }

    $.ajax({
        url: '/api_calling/directory-search/',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            search: txt,
            CampaignName: getLocalVariable('CampaignName'),
            time_formate: $('#time_formate').val(),
            ClientID: getLocalVariable('ClientID')
        }),
        success: function (result) {
            if (result.ok) {
                $('.detailed-crm-log').show();
                $('#disposition-data').hide();
                $('#iframe').prop("src", "");
                $('#iframe').hide();
                $('#disposition-data').hide();
                $('#detailed-disposition').show();
                $('.detailed-crm-log .table-heading p').html("Searched Directory List");
                $('#detailed-disposition thead').html(result.thead);
                $('#detailed-disposition tfoot').html(result.thead);
                $('table#detailed-disposition tfoot th').each(function () {
                    var title = $(this).text();
                    if (title != '#') {
                        $(this).html('<input type="text" class="form-control bottomserach" placeholder="Search ' + title + '" />');
                    } else {
                        $(this).html('');
                    }
                });
                $('#summary-disposition tbody').html('');
                $('#detailed-disposition tbody').html(result.tbody);
                reinitializeDataTable('detailed-disposition', result.tbody);
                $('#detailed-disposition tbody tr').off('dblclick').on('dblclick', function () {
                    var phone = $(this).prop('id');
                    //todial(phone);
                    $("#dial_phone").val('');
                }).off('click').on('click', function () {
                    $('#detailed-disposition tbody tr').removeClass("detailed-callback-active");
                    var id = $(this).prop('id');
                    var selectID = $(this).attr('data-select');
                    $('#phone-number-to-copy').val(id);
                    $('#detailed-disposition tbody tr[data-select="' + selectID + '"]').addClass("detailed-callback-active");
                    var phoneToCopy = document.getElementById("phone-number-to-copy");
                    phoneToCopy.select();
                    document.execCommand("copy");
                });
            } else {
                alertify.error("No records available.");
                /*$('#iframe').prop("src", "");
                $('#iframe').hide();*/
                $('.detailed-crm-log').show();
                $('#disposition-data').hide();
                $('.detailed-crm-log .table-heading p').html("Searched Directory List");
                $('#detailed-disposition thead').html('');
                $('#detailed-disposition tfoot').html('');
                $('#detailed-disposition tbody').html('');
                $('#summary-disposition tbody').html('');
            }
        },
        error: function () {
            alertify.error("An error occurred while processing your request.");
        }
    });
});


$('.save-icon').click(function () {
    if (getLocalVariable('UserSessionLog') === "false") {
        alertify.error("Permission Deny...!");
        return;
    }

    // Check if time format is selected
    if ($('#time_formate').val().length === 0) {
        alertify.error("Please Select Zone!...");
        return;
    }

    // Get current timestamp
    var now = new Date();
    var year = now.getFullYear().toString();
    var month = (now.getMonth() + 1).toString().padStart(2, '0');
    var day = now.getDate().toString().padStart(2, '0');
    var hour = now.getHours().toString().padStart(2, '0');
    var minute = now.getMinutes().toString().padStart(2, '0');
    var second = now.getSeconds().toString().padStart(2, '0');
    var timestamp = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    // Get start and end date from DOM
    var start_date_iso = $('#start-date-disposition-search').val(); // e.g., "2024-08-01T12:00"
    var end_date_iso = $('#end-date-disposition-search').val(); // e.g., "2024-08-01T12:00"

    // Convert the input dates to a standard Date object
    var startdate = new Date(start_date_iso.replace('T', ' '));
    var enddate = new Date(end_date_iso.replace('T', ' '));

    // Check if dates are valid
    if (isNaN(startdate.getTime()) || isNaN(enddate.getTime())) {
        alertify.error("Invalid date format. Please check the dates.");
        return;
    }

    // Calculate difference in minutes
    var diff = enddate - startdate;
    var diffMinutes = diff / (1000 * 60); // Convert milliseconds to minutes
    if (diffMinutes > 1440) { // 1440 minutes = 24 hours
        alertify.error("View Not Allowed more than 24 hours!...");
        return false;
    }

    // Adjust date formatting based on the selected time format
    var time_formate = $('#time_formate').val();
    if (time_formate.startsWith('-')) {
        time_formate = time_formate.replace('-', '');
        startdate = formatDateForRequest(startdate, time_formate);
        enddate = formatDateForRequest(enddate, time_formate);
    } else {
        startdate = formatDateForRequest(startdate, time_formate);
        enddate = formatDateForRequest(enddate, time_formate);
    }

    // Prepare data for the AJAX request
    var data = {
        user: getLocalVariable('USER_ID'),
        campaign: getLocalVariable('CampaignName'),
        startdate: startdate,
        enddate: enddate,
        time_formate: time_formate,
        timestamp: timestamp,
        client_id: getLocalVariable('ClientID')
    };

    // Perform AJAX request
    $.ajax({
        url: '/api_calling/user-session-log/',
        method: 'GET',
        data: data,
        success: function (response) {
            $('.detailed-crm-log').show();
            $('#disposition-data').hide();
            $('#detailed-disposition').hide();
            $('.detailed-crm-log table').show();
            $('.detailed-crm-log .table-heading p').html("User Session Log");
            $('.detailed-crm-log thead').html('');
            $('.detailed-crm-log tfoot').html('');
            $('.detailed-crm-log tbody').html('');
            $('.detailed-crm-log table tbody').html(response); // Assuming you have a container to place the response
        },
        error: function (xhr, status, error) {
            alertify.error("Error fetching data: " + error);
        }
    });
});

// Function to format Date object into required format
function formatDateForRequest(date, time_formate) {
    var year = date.getFullYear().toString();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');
    var hour = date.getHours().toString().padStart(2, '0');
    var minute = date.getMinutes().toString().padStart(2, '0');
    var second = date.getSeconds().toString().padStart(2, '0');

    // Adjust formatting according to `time_formate`
    var formattedDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

    // Return the formatted date based on the time_formate
    if (time_formate.startsWith('-')) {
        return formattedDate.replace('-', '');
    } else {
        return formattedDate;
    }
}

function filterTable(tableId) {
    var table = $('#' + tableId);
    var rows = table.find('tbody tr');

    rows.each(function () {
        var row = $(this);
        var showRow = true;

        row.find('td').each(function (i) {
            var column = table.find('tfoot th').eq(i).find('input');
            var columnValue = column.val() ? column.val().toLowerCase() : '';

            var cellText = $(this).text() ? $(this).text().toLowerCase() : '';

            // Check if column value and cell text are defined before comparing
            if (columnValue && cellText.indexOf(columnValue) === -1) {
                showRow = false;
            }
        });

        if (showRow) {
            row.show();
        } else {
            row.hide();
        }
    });
}

function searchTableColumn(table) {
    $("input#search-txt").keyup(function () {
        var search = this.value;
        /* Filter on the column (the index) of this element */
        $(table + ' tr').each(function () {
            if ($(this).find('td').text().toLowerCase().indexOf(search.toLowerCase()) > -1) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });
}

function searchDataTable(table) {
    var asInitVals = new Array();
    $("tfoot input").keyup(function () {
        /* Filter on the column (the index) of this element */
        table.fnFilter(this.value, $("tfoot input").index(this) + 1);
    });
    /*
     * Support functions to provide a little bit of 'user friendlyness' to the textboxes in
     * the footer
     */
    $("tfoot input").each(function (i) {
        asInitVals[i] = this.value;
    });

    $("tfoot input").focus(function () {
        if (this.className == "search_init") {
            this.className = "";
            this.value = "";
        }
    });

    $("tfoot input").blur(function (i) {
        if (this.value == "") {
            this.className = "search_init";
            this.value = asInitVals[$("tfoot input").index(this)];
        }
    });
}

function getDateTime(dateTime, timeFormat) {
    // Adjusts dateTime by adding the specified number of hours (timeFormat)
    const date = new Date(dateTime);
    date.setHours(date.getHours() + parseInt(timeFormat));
    return formatDateTime(date);
}

function getDateTimeo(dateTime, timeFormat) {
    // Adjusts dateTime by subtracting the specified number of hours (timeFormat)
    const date = new Date(dateTime);
    date.setHours(date.getHours() - parseInt(timeFormat));
    return formatDateTime(date);
}
/* code end by udit for call log*/

/***code by alok */
async function recallActionByCS(disposition, subDisposition, callbacktime, dataid) {
    // Check if the review mode is active
    if (getLocalVariable('reviewMode') == "1") {
        alertify.error("Please exit the Review Mode.");
        return false;
    }
    let is_callback = 0;

    // Serialize form data from the element with id 'crm-form'
    var data = $('#crm-form').serialize();

    // Call updateCrm function
    updateCrm(data, 0, is_callback);

    // Call dispositiondata function
    
    if(getLocalVariable('isLineBusy')=='DIALING')
    {
        cancelSession('cs_call');
    }
    dispositiondata(disposition,subDisposition);

    // Await the recall_insertion function
    await recall_insertion(callbacktime, disposition, subDisposition, dataid);
}
function manual_callback_dial(phone,campaign_name,data_id='',recall_id='')
{
    if (websocketConnected == 0) {
        alertify.error("Control server connection failed.");
        return;
    }
    if (getLocalVariable('WaitingDisposition') == "true") {
        alertify.error("Terminate the call first, then proceed to dial.");
        return;
    }
    if (getLocalVariable('is_Recall') == 0) {
        alertify.error("Permission Denied.");
        return;
    }
    if (getLocalVariable('isRecall_Mode_Allow') == "false") {
        alertify.error("Permission Denied.");
        return;
    }
    if (getLocalVariable('UserMode') == "Break") {
        alertify.error("Permission Denied.");
        return;
    }
    if (getLocalVariable('UserMode') != "Callback") {
        alertify.error("Please Change Mode To Callback...!");
        return;
    }
    if (getLocalVariable('UserMode') == '' || getLocalVariable('CampaignName') == '') {
        alertify.error("Please set mode and campaign name...!");
        return;
    }
    if (getLocalVariable('UserMode') == '' || getLocalVariable('CampaignName') == '') {
        alertify.error("Please set mode and campaign name...!");
        return;
    }
    if(getLocalVariable('CampaignName')!=campaign_name)
    {
        alertify.error("Campaign Mismatch");
        return;
    }
    if(getLocalVariable('CampaignName')==campaign_name)
    {
        setLocalVariable("manualdial_callback", 1);
        DialByLineRecall("audio","",phone,"","","RC",data_id,recall_id);
    }

}
function currentdb_datetime() {
    return $.ajax({
        url: "/agent/current_dbdatetime",
        method: "GET",
        success: function (result) {
            return result; // Return the result from the success callback
        },
        error: function (error) {
            console.error("Error:", error);
        }
    });
}

async function review_duration()
{
    let webrtc_review_time = getLocalVariable('webrtc_review_time');
    let reviewdatetime = new Date(webrtc_review_time);
    let currentDate = new Date();
    console.log("webrtc_review_time= "+webrtc_review_time);
    logEntry("webrtc_review_time "+webrtc_review_time);
    logEntry("review from time= "+reviewdatetime+" hold To time= "+currentDate);
    let differenceInSeconds = getTimeDifferenceInSeconds(reviewdatetime, currentDate);
    console.log("review_date_time differenceInSeconds= "+differenceInSeconds);
    var call_review_count=parseInt(window.localStorage.getItem('Review_Counter'));
    var call_review_counter=(call_review_count+differenceInSeconds);
    console.log("hold_date_time call_hold_counter= "+call_review_counter);
    localStorage.setItem("Review_Counter", call_review_counter);
    let Review_Count = getLocalVariable('Review_Count');
        var call_review_counter = parseInt(window.localStorage.getItem('Review_Counter'));
        var jsonnew_data = {
            "ModeDBId": getLocalVariable('ModeDBId'),
            "review_date_time": call_review_counter,
            "review_count": Review_Count
        };
        /** Enter log for Dilar */
        console.log("update_hold " + JSON.stringify(jsonnew_data));
        logEntry("review total counter= "+ JSON.stringify(jsonnew_data));
        /** end log */
        const response = await fetch('/update_review_duration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonnew_data)
        });

        if (!response.ok) {
            alertify.error('Network response was not ok for disposition insertion');
            //throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log("json data",data);
}

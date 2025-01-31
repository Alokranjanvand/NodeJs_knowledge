/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
function webSocketConnection() {
    websocket = new WebSocket(wsUri);
    websocket.onopen = function (ev) { // connection is open
        if (getLocalVariable('USER_ID') != '' && getLocalVariable('SIP_ID') != '') {
			
            var sendlist = {name: getLocalVariable('USER_ID'), exten: getLocalVariable('SIP_ID'), message: 'Hello'};
            websocket.send(JSON.stringify(sendlist));
			var element = document.getElementById("cs_status");
			element.classList.remove("red");
			element.classList.add("green");
            $("#show_thumb").css("display", "none");
        } else {
            alertify.error("Unable to Connect to Web Socket. Please relogin.");
        }
    };
    websocket.onerror = function (ev) {
        websocketConnected = 0;
        setLocalVariable('isLineBusy', '');
        setLocalVariable('SipCheckStatus', '');
        console.log("socket exicuting error");
        $("#show_thumb").css("display", "block");
        //var view_call_detail_url = "https://172.20.10.198:18888/cs";
        //console.log("Please Open this url"+view_call_detail_url) ;
        //window.open(view_call_detail_url, "", "width=500,height=700");
    };
    websocket.onclose = function (ev) {
        websocketConnected = 0;
        setLocalVariable('isLineBusy', '');
        setLocalVariable('SipCheckStatus', '');
        websocket.close();
        if (getLocalVariable('USER_ID') != '' && getLocalVariable('SIP_ID') != '') {
            setTimeout(webSocketConnection, 5000);
        }
    };
    websocket.onmessage = function (ev) {
        console.log(" Socket Receive data= "+ev.data);
        setLocalVariable('license_check', timestamp);
        $("#show_thumb").css("display", "none");
        var result = JSON.parse(ev.data);
        var type = result.type;
        var message = result.message;
        var line1 = result.line1;
        console.log("line1 data= "+line1);
        if(message=='WELCOME')
        {
            setLocalVariable('isLineBusy', ('ready').toUpperCase());
        }
        var timestamp = result.timestamp;
        var license = result.license;
        var queuewait = result.queuewait;
        var mywait = result.mywait;
        $('#crm_queue').html(queuewait);
        setLocalVariable('crm_skill_queue', mywait);
        /** show header skill data */
        skillqueue();
        /** end show header skill data by alok */
        console.log("license data= "+license);
        console.log("socket Case "+type);
        console.log("socket message= "+message);
        setLocalVariable('license_check', license);
        setLocalVariable('timestamp', timestamp);
        switch (type) {
            case 'usermsg':
                websocketConnected = 1;
                if (message.toUpperCase() == ('Welcome').toUpperCase()) {
                    console.log("Connected with Control Server");
                }
                break;
            case 'state':
                var linestate = 'ready';
                switch (message.toUpperCase()) {
                    case 'RING':
                        console.log("Call ringing....!");
                        linestate = 'DIALING';
                        break;
                    case 'UP':
                        linestate = 'oncall';
                        break;
                    case 'HUNGUP':
                    case 'HANGUP':
                        crmOpen = 0;
						toastr.clear();
						myStop();
                        if(getLocalVariable('isHold') == 1)
                            holdUnhold();
                        linestate = 'hangup';
                        break;
                }
                if (getLocalVariable('LastAgentState') == "") {
                    setLocalVariable('LastAgentState', 'LOGIN');
                }
                if (linestate == 'hangup' && getLocalVariable('isLine2Busy').length > 0) {
                    setLocalVariable('isLine2Busy', '');
                    linestate = "oncall";
                    setLocalVariable('lineSelected', 1);
                    setLocalVariable('hadConference', 0);
                    if (result.line == '1') {
                        linestate = "hangup";
                        alertify.error("Line 1 disconnected, therefore, hanging up the call.");
                        Call_Hangup();
                    }
                }
                if (linestate == "ringing" || linestate == "oncall") {
                    $('#crm-form .fa-mobile-phone').css("color", "#0F0");
                }
                if (linestate == "ringing") {
                    $('#myModal').modal('hide');
                    $('#dialog-callback-table').modal('hide');
                }
                setLocalVariable('CurrentAgentState', linestate.toUpperCase());
                setLocalVariable('isLineBusy', linestate.toUpperCase());
                getQueueList();
                break;
            case 'status':
                //alert("status");
                var license = result.license;
                setLocalVariable('IsLicenseActive', license);
                setLocalVariable('SipCheckStatus', message);
                console.log("okkk= "+message);
                if (message == 'OK' && getLocalVariable('isLineBusy') == '') {
                    setLocalVariable('isLineBusy', ('ready').toUpperCase());
                }
                var queuewait = 0;
                if (typeof (result.queuewait) != "undefined" && result.queuewait != '') {
                    queuewait = isNaN(parseInt(result.queuewait)) ? 0 : result.queuewait;
                }
                setLocalVariable('queuewait', queuewait);
                var mytotalwait = 0;
                if (typeof (result.mywait) != "undefined" && result.mywait != '') {
                    console.log("result.mywait= "+result.mywait);
                    var mywait = JSON.parse(result.mywait.replace(/\'/g, "\""));
                    if (mywait.length != 0) {
                        if (getLocalVariable('skill') != '' && Object.keys(JSON.parse(getLocalVariable('skill'))).length != 0 && getLocalVariable('Campaign_Type').toUpperCase() == "SR") {
                            var skill = JSON.parse(getLocalVariable('skill'));
                            for (var i in mywait) {
                                if ($.inArray(i.toUpperCase(), Object.keys(skill)) !== -1) {
                                    if (!isNaN(parseInt(mywait[i])) && parseInt(mywait[i]) > 0) {
                                        $('#skill-listitem-' + i.toLowerCase()).html(i.toUpperCase() + " (" + mywait[i] + ")");
                                        $('#skill-listitem-' + i.toLowerCase()).removeClass('btn-default');
                                        $('#skill-listitem-' + i.toLowerCase()).addClass('btn-warning');
                                    } else {
                                        $('#skill-listitem-' + i.toLowerCase()).html(i.toUpperCase());
                                        $('#skill-listitem-' + i.toLowerCase()).removeClass('btn-warning');
                                        $('#skill-listitem-' + i.toLowerCase()).addClass('btn-default');
                                    }
                                    mytotalwait += isNaN(parseInt(mywait[i])) ? 0 : parseInt(mywait[i]);
                                }
                            }
                        } else {
                            mytotalwait = mywait[getLocalVariable('USER_ID')];
                        }
                    }
                }
                setLocalVariable('mytotalwait', mytotalwait);
                //if (getLocalVariable('WaitingDisposition') == "true" && getLocalVariable('isLineBusy').toLowerCase() != 'hangup' && getLocalVariable('isLineBusy').toLowerCase() != 'ready') {
                    

                   
                    if (result.hasOwnProperty('line1')) {
                        var line1 = result.line1;
                        if (line1.toUpperCase() == 'UP') {
                            setLocalVariable('line1Connected', true);
                            if (getLocalVariable('WaitingDisposition') == "true") {
                                setLocalVariable('isLineBusy', ('oncall').toUpperCase());
                            }
                        }
                    }

                    if (result.hasOwnProperty('line2')) {
                        var line2 = result.line2;
	                     if (line2.toUpperCase() == 'UP') {
						    setLocalVariable('line2Connected', true);
                            setLocalVariable('isLine2Busy', 'ONCALL');
                        }
                    }
                //}
				
                break;
            case 'dialstatus':
                console.log("dialstatus= "+message);
                if (message.toUpperCase() != "DIALING") {
                    if (message.toUpperCase() == "TIMEOUT") {
                        blankStatus('Request Timeout.');
                    } else {
                        //blankStatus('Error In Dialing');
                        setLocalVariable("CALL_TYPE", "");
                        setLocalVariable("WaitingDisposition", "false");
                        /*if (result.line == '0') {
                            var data = $('#crm-form').serialize();
                            var disp = $('#crm-form #disposition').val();
                            var is_callback = 0;
                            var callback = {};
                            var dispositions = JSON.parse(getLocalVariable('CRM_Disposition'));
                            dispositions.map(function (ele) {
                                var el = ele.split("~");
                                callback[el[0].toLowerCase().replace(" ", "_")] = el[2];
                            });
                            if (callback.hasOwnProperty(disp.toLowerCase().replace(" ", "_"))) {
                                is_callback = callback[disp.toLowerCase().replace(" ", "_")];
                            }
                            updateCrm(data, 2, is_callback);
                            setLocalVariable('AutoDispTimeDiff', 0);
                        }*/
                    }
                }
                break;
            case 'callerdata':
                var callerdatastring = message;
                if (typeof (result.skill) != "undefined") {
                    setLocalVariable('LastSkillUsed', result.skill);
                } else {
                    setLocalVariable('LastSkillUsed', "");
                }
                var callerstate = result.callerstate;
                if (callerstate.toLowerCase() == "ringing" && getLocalVariable('UserMode').toUpperCase() != 'MO' && getLocalVariable('WaitingDisposition') == "false") {
					
                    var msg = callerdatastring.split("-");
                    var str = msg[0];
                    var phone = '';
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
                    if (str.length > 0) {
                        if (getLocalVariable('isDisplayPhone') == "false") {
                            for (var i = 0; i < str.length; i++) {
                                phone += 'X';
                            }
                        } else {
                            phone = str;
                        }
                        toastr["info"]("Incoming Call from " + phone, "Incoming Alert");
                    }
                } 
                callerdatastring = '';
                break;
            case 'mute':
                var mute = message;
                if (mute == 1) {
                    setLocalVariable('isLineBusy', ('mute').toUpperCase());
                }
                break;
            case 'hold':
                var hold = message;
                if (hold == 1) {
                    setLocalVariable('isLineBusy', ('hold').toUpperCase());
                }
                break;
            case 'line1':
                var line1 = message;
                if (line1.toUpperCase() == 'UP') {
                    setLocalVariable('line1Connected', true);
                }
                break;
            case 'line2':
                var line2 = message;
                if (line2.toUpperCase() == 'UP') {
                    setLocalVariable('line2Connected', true);
                    setLocalVariable('isLine2Busy', 'ONCALL');
                }
                break;
            case 'queuewait':
                var queuewait = isNaN(parseInt(message)) ? 0 : message;
                setLocalVariable('queuewait', queuewait);
                break;
            case 'mywait':
                var mytotalwait = 0;
                var mywait = JSON.parse(message.replace(/\'/g, "\""));
                if (getLocalVariable('skill') != '' && Object.keys(JSON.parse(getLocalVariable('skill'))).length != 0 && getLocalVariable('Campaign_Type').toUpperCase() == "SR") {
                    var skill = JSON.parse(getLocalVariable('skill'));
                    for (var i in mywait) {
                        if (i == getLocalVariable('USER_ID')) {
                            mytotalwait = mywait[i];
                        } else if ($.inArray(i.toUpperCase(), Object.keys(skill)) !== -1) {
                            if (!isNaN(parseInt(mywait[i])) && parseInt(mywait[i]) > 0) {
                                $('#skill-listitem-' + i.toLowerCase()).html(i.toUpperCase() + " (" + mywait[i] + ")");
                                $('#skill-listitem-' + i.toLowerCase()).removeClass('btn-default');
                                $('#skill-listitem-' + i.toLowerCase()).addClass('btn-warning');
                            } else {
                                $('#skill-listitem-' + i.toLowerCase()).html(i.toUpperCase());
                                $('#skill-listitem-' + i.toLowerCase()).removeClass('btn-warning');
                                $('#skill-listitem-' + i.toLowerCase()).addClass('btn-default');
                            }
                            mytotalwait += isNaN(parseInt(mywait[i])) ? 0 : parseInt(mywait[i]);
                        }
                    }
                } else {
                    mytotalwait = mywait[getLocalVariable('USER_ID')];
                }
                setLocalVariable('mytotalwait', mytotalwait);
                break;
            case 'action':
                setLocalVariable('NextCSAction', message);
                break;
        }
    };
}

webSocketConnection();
let myInterval;
function myStop() {
  clearInterval(myInterval);
}
 
function get_starttimer(totalSeconds)
{
                       
    toastr.options = {
    "closeButton": true,
    "tapToDismiss": false, 
    "debug": false,
    "newestOnTop": false,
    "progressBar": true,
    "positionClass": "toast-bottom-left",
    "preventDuplicates": true,
        "showDuration": "0",
    "hideDuration": "0",
    "timeOut": "0",
    "extendedTimeOut": "0",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
        "tapToDismiss": false,
    "hideMethod": "fadeOut"
    };
        myInterval=setInterval(setTime, 1000);
        $("#seconds").html('');
        $("#minutes").html('');
        $("#hours").html('');
    var html='';
    function setTime() {
        ++totalSeconds;
        $("#seconds").html(pad(totalSeconds % 60));
        $("#minutes").html(pad(parseInt(totalSeconds / 60)));
        $("#hours").html(pad(parseInt(totalSeconds / 3660)));
    }

    function pad(val) {
        var valString = val + "";
        if (valString.length < 2) {
        return "0" + valString;
        } else {
        return valString;
        }
    }
    html='<table width="50%" align="center" border="0" cellpadding="0" cellspacing="0"><tr style="padding:0px;"><td style="padding: 0px;text-align: center;"><label id="hours" class="labelhours">00</label></td><td style="padding: 0px;text-align: center;"><label style="font-size:12px">:</font></td><td style="padding: 0px;text-align: center;">';
    html +='<label id="minutes" class="labelminutes">00</label></td><td style="padding: 0px;text-align: center;"><label style="font-size:12px">:</font></td><td style="padding: 0px;text-align: center;"><label  class="labelseconds" id="seconds">00</label></td></tr></table>';
    toastr["info"](html);
}
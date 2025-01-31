var postCallbackAlertShow = 0;
var crmOpen = 0;
var popUpOpened = 0;
var websocket = "";
var websocketConnected = 0;
var isDispositionCrmfield = [];
setLocalVariable('AutoDispCounter', 0);
setLocalVariable('performRedialAction', "false");

function getLocalVariable(variable) {
    var value = window.localStorage.getItem(variable);
    if (value != null && value != 'null') {
        return value;
    } else {
        return '';
    }
}

function setLocalVariable(variable, value) {
    window.localStorage.setItem(variable, value);
}

function removeLocalVariable(variable) {
    window.localStorage.removeItem(variable);
}

function updateLocalVariables(data) {
    for (var i in data) {
        if (typeof (data[i]) == "object") {
            setLocalVariable(i, JSON.stringify(data[i]));
        } else {
            setLocalVariable(i, data[i]);
        }
    }
}

function blankStatus(str) {
    $('.li-status').html(str);
    alert(str);
    setTimeout(function () {
        $('.li-status').html('');
    }, 3000);
}

function openExternalCRM(labels, token = '', timestamp = '', ph = '') {
    var urlmappedtodid = JSON.parse(getLocalVariable('Allow_DID_Map_URL'));
    var calltype = getLocalVariable('CALL_TYPE') != 'IB' ? 'OB' : 'IB';
    if (getLocalVariable('Campaign_Crm_Mode') == '1' && getLocalVariable('WebScript').length > 0 && urlmappedtodid.length != 0 && $.inArray(getLocalVariable('DisplayCallerID') + "|" + calltype, urlmappedtodid) > -1) {
        var path = getLocalVariable('WebScript');
        path += (path.indexOf("?") > -1) ? "" : "?";
        path += (path.slice(-1) == '&') ? "" : "&";
        path += "phone=" + getLocalVariable('DispalyPhoneNumber') + "&agent=" + getLocalVariable('USER_ID') + "&campaign=" + getLocalVariable('CampaignName') + "&"
                + "did=" + getLocalVariable('DisplayCallerID') + "&dataid=" + getLocalVariable('CRMDataID') + "&TIMESTAMP=" + getLocalVariable('') + "&"
                + "rid=" + getLocalVariable('RecordID') + "&CALL_TYPE=" + getLocalVariable('CALL_TYPE') + "&CLIENT_ID=" + getLocalVariable('ClientID') + "&"
                + "SKILL=" + getLocalVariable('LastSkillUsed') + "&didname=" + getLocalVariable('DisplayDIDName') + "&REDIAL=" + getLocalVariable('redial') + "&"
                + "SIP_ID=" + getLocalVariable('SIP_ID') + "&CIRCLE_PERMISSION=" + getLocalVariable('circle') + "&DATASETID=" + getLocalVariable('dataset') + "&"
                + "MNS=" + getLocalVariable('multiple_number_search') + "&CAMPAIGN_TYPE=" + getLocalVariable('Campaign_Type');
        window.open(path, "_blank");
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
                window.open(path, "_blank");
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
                window.open(path, "_blank");
            }
        } else {
            window.open(alternateCRM1, "_blank");
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
                        window.open(path, "_blank");
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
                        window.open(path, "_blank");
                    }
                } else {
                    window.open(crmpaths[c], "_blank");
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
                    window.open(path, "_blank");
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
                    window.open(path, "_blank");
                }
            } else {
                window.open(alternateCRM2, "_blank");
            }
        }
}
}



function getMappedSkills() {
    $('#skills-div').html('');
    if (getLocalVariable('skill') != '' && Object.keys(JSON.parse(getLocalVariable('skill'))).length != 0 && getLocalVariable('Campaign_Type').toUpperCase() == "SR") {
        var html = '';
        var skill = JSON.parse(getLocalVariable('skill'));
        for (var i in skill) {
            html += "<div class='skill-listitem-div'><div title='Priority: " + skill[i] + "' id='skill-listitem-" + i.toLowerCase() + "' class='btn btn-default skill-listitem'>" + i + "</div></div>";
        }
        $('#skills-div').html(html);
    }
}

function getQueueList() {
    if (getLocalVariable('isLineBusy') == "ONCALL") {
        var campaign = $('#dialpad_campaign').val();
        let data_record={campaign:campaign,ClientID:getLocalVariable('ClientID'),CampaignName:getLocalVariable('CampaignName'),DisplayDIDName:getLocalVariable('DisplayDIDName')};
        let data_record2={campaign:campaign,ClientID:getLocalVariable('ClientID')};
        $.ajax({
            url: '/transferqueue-list',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data_record),
            success: function(result) {
                if (result.ok == true) {
                    $("#dialpad_queuetransfer").html(result.list);
                    if (Object.keys(result.data).length > 0) {
                        updateLocalVariables(result.data);
                    }
                }
            },
            error: function(error) {alertify.error("No record");}
            });
        $.ajax({
            url: '/transferskill-list',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(data_record2),
            success: function(result) {
                if (result.ok == true) {
                    $("#dialpad_skilltransfer").html(result.list);
                    if (Object.keys(result.data).length > 0) {
                        updateLocalVariables(result.data);
                    }
                }
            },
            error: function(error) {alertify.error("No record");}
            });
    }
}


function isJson(item) {
    item = (typeof item !== "string") ? JSON.stringify(item) : item;
    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }
    if (typeof item === "object" && item !== null) {
        return true;
    }
    return false;
}


function getSkillDivDisplay() {
    if (getLocalVariable('Campaign_Type').toUpperCase() == "SR") {
        $('#div-toggle-two').show();
        $('#div-toggle-one').removeClass("col-md-12").addClass("col-md-6");
        $('#div-toggle-two').addClass("col-md-6");
    } else {
        $('#div-toggle-two').hide();
        $('#div-toggle-one').addClass("col-md-12").removeClass("col-md-6");
        $('#div-toggle-two').removeClass("col-md-6");
    }
}

/*function processEventCampaign(evt) {
	var campaignEventApi = JSON.parse(getLocalVariable('campaignEventApi'));
	if(campaignEventApi.hasOwnProperty(evt.toUpperCase()))
		requeststhroughAjax({
			tag: 'event-api-hit',
            campaign: getLocalVariable('CampaignName'),
            clientid: getLocalVariable('ClientID'),
            agent: getLocalVariable('USER_ID'),
            leadid: getLocalVariable('CRMLeadId'),
            phone: getLocalVariable('DispalyPhoneNumber'),
            rid: getLocalVariable('RecordID'),
            campaignEventApi: JSON.stringify(campaignEventApi[evt.toUpperCase()])
		}, function(result){});
}*/
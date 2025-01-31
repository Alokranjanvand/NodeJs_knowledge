/*
* Copyright (C) 2012-2018 Doubango Telecom <http://www.doubango.org>
* License: BSD
* This file is part of Open Source sipML5 solution <http://www.sipml5.org>
*/

function tsk_utils_init_webrtc() {
    // WebRtc plugins
    WebRtc4all_Init();
}

function tsk_utils_have_websocket() {
    try {
        return !!window.WebSocket;
    }
    catch (e) {
        return false;
    }
}

function tsk_utils_have_webrtc() {
    return (WebRtc4all_GetType() != WebRtcType_e.NONE);
}

function tsk_utils_have_webrtc4all() {
    return (tsk_utils_have_webrtc4npapi() || tsk_utils_have_webrtc4ie());
}

function tsk_utils_have_webrtc4npapi() {
    return (WebRtc4all_GetType() == WebRtcType_e.NPAPI);
}

function tsk_utils_have_webrtc4ie() {
    return (WebRtc4all_GetType() == WebRtcType_e.IE);
}

function tsk_utils_have_webrtc4native() {
    return (WebRtc4all_GetType() == WebRtcType_e.NATIVE);
}

function tsk_utils_have_webrtc4ericsson() {
    return (WebRtc4all_GetType() == WebRtcType_e.ERICSSON);
}

function tsk_utils_webrtc4all_get_version() {
    return WebRtc4all_GetVersion();
}

function tsk_utils_have_stream() {
    try {
        return (tsk_utils_have_webrtc4all() || !!navigator.getUserMedia);
    }
    catch (e) { }
    return false;
}

var __s_navigator_friendly_name = undefined;
function tsk_utils_get_navigator_friendly_name(){
    if(!__s_navigator_friendly_name){
        __s_navigator_friendly_name = 'unknown';
        if (navigator.userAgent || navigator.appName) {
            var ao_friendly_names = [
                {s_id: 'chrome', s_name: 'chrome'},
                {s_id: 'firefox', s_name: 'firefox'},
                {s_id: 'safari', s_name: 'safari'},
                {s_id: 'opera', s_name: 'opera'},
                {s_id: 'microsoft internet explorer', s_name: 'ie'},
                {s_id: 'netscape', s_name: 'netscape'}
            ];
            var s_userAgent = navigator.userAgent ? navigator.userAgent.toLowerCase() : 'null';
            var s_appName = navigator.appName ? navigator.appName.toLowerCase() : 'null';
            for (var i_index = 0; i_index < ao_friendly_names.length; ++i_index) {
                if (s_userAgent.indexOf(ao_friendly_names[i_index].s_id) != -1 || s_appName.indexOf(ao_friendly_names[i_index].s_id) != -1) {
                    __s_navigator_friendly_name = ao_friendly_names[i_index].s_name;
                    break;
                }
            }
        }
    }
    return __s_navigator_friendly_name;
}

var __s_system_friendly_name = undefined;
function tsk_utils_get_system_friendly_name(){
    if(!__s_system_friendly_name){
        __s_system_friendly_name = 'unknown';
        if (navigator.appVersion) {
            var ao_friendly_names = [
                {s_id: 'mac', s_name: 'mac'},
                {s_id: 'powerpc', s_name: 'powerpc'},
                {s_id: 'win', s_name: 'windows'},
                {s_id: 'sunos', s_name: 'sunos'},
                {s_id: 'linux', s_name: 'linux'}
            ];
            var s_appVersion = navigator.appVersion.toLowerCase();
            for (var i_index = 0; i_index < ao_friendly_names.length; ++i_index) {
                if (s_appVersion.indexOf(ao_friendly_names[i_index].s_id) != -1) {
                    __s_system_friendly_name = ao_friendly_names[i_index].s_name;
                    break;
                }
            }
        }
    }
    return __s_system_friendly_name;
}


var __i_debug_level = 4; // INFO:4, WARN:3, ERROR:2, FATAL:1

function tsk_utils_log_set_level(i_level) {
    __i_debug_level = i_level;
}
function extractHeadersFromSIPLog(log) 
{
    // Regular expression to match each header line
    var headerRegex = /^(\w+):\s*(.*)$/gm;

    var headers = {};
    var match;
    // Loop through each match of the regex in the log
    while ((match = headerRegex.exec(log)) !== null) {
        // Extract the header name and value
        var headerName = match[1];
        var headerValue = match[2];
        // Store the header in the headers object
        //console.log("Webrtc header name= "+headerName+ " header value= "+headerValue);
        headers[headerName] = headerValue;
        /*if(headerName=='SEND' && headerValue=='SIP/2.0 200 OK')
        {
            console.log("Alok header name= "+headerName+ "Alok  header value= "+headerValue);
            console.log("Alok header name= "+headerName+ "Alok  header value= "+headerValue);
            
        }*/
    }

    return headers;
}

function tsk_utils_log_info(s_msg) {
    if (__i_debug_level >= 4) {
        window.console && window.console.info && window.console.info(s_msg);
        //console.log("unique data= ",s_msg);
        var headers = extractHeadersFromSIPLog(s_msg);
        //console.log("new get header data= "+JSON.stringify(headers));
        //console.log("new get header data2= ",headers);
    }
}

function tsk_utils_log_warn(s_msg) {
    if (__i_debug_level >= 3) {
        window.console && window.console.warn && window.console.warn(s_msg);
    }
}

function tsk_utils_log_error(s_msg) {
    if (__i_debug_level >= 2) {
        //window.console && window.console.error && window.console.error(s_msg);
    }
}

function tsk_utils_log_fatal(s_msg) {
    if(__i_debug_level >= 1) {
       tsk_utils_log_error(s_msg);
    }
}
$(document).ready(function () {

  /** Load disposition **/
  if (getLocalVariable("CampaignName") != '' && getLocalVariable("ClientID") != '' && getLocalVariable("USER_ID") != '') {
    dispose_show();
  }

  $("#callbackdate").hide();
  $("#callbackLabel").hide();
  ///////////set campaign data///////
  $("#set-campaign").click(function () {
    setTimeout("checkwrtcCallbacks()", 10000);
    fetchLanguage();
    get_permission();
    localStorage.setItem("Hold_Counter", 0);
    var dnc_status = getLocalVariable("DNCURL");
    var campaign_list = $("#campaign").val();
    if (dnc_status == "") {
      alertify.error("DNC URL is not available for the Client!...");
    }
    if ($.trim($("#campaign").val()).length == 0) {
      alertify.error("Please Select Campaign!...");
      $("#campaign").focus();
      document.getElementById("campaign").style.border = "1px solid red";
      return false;
    }
    if ($.trim($("#user-mode").val()).length == 0) {
      alertify.error("Please Select User Mode!...");
      document.getElementById("user-mode").style.border = "1px solid red";
      $("#user-mode").focus();
      return false;
    }
    if ($("#user-mode").val().toUpperCase() == "CALLBACK") {
      if (getLocalVariable("is_Recall") == 0) {
        alertify.error("Callback Mode Not Allowed In This Campaign...!");
        return;
      }
    }
    if ($("#user-mode").val() == "Mo" && getLocalVariable("MOPanel") == 0) {
      alertify.error("Access Denied");
      return;
    }
    /**** skill list */
    client_id=getLocalVariable("ClientID");
    campaign_skill_list(client_id,campaign_list);
    /***end skill list ** */
    usermodevalue = $("#user-mode").val();
    setLocalVariable("UserMode", $("#user-mode").val());
    $("#dial_mode").val(usermodevalue);
    /*** call what_business_number*/
    what_business_number();
    /**** end ** */
    var data_record = {
      tag: "set-campaign",
      agentPrefix:JSON.parse(getLocalVariable("agentPrefix")),
      DialedRoute:getLocalVariable("DialedRoute"),
      CBADialing:getLocalVariable("CBADialing"),
      CBIDialing:getLocalVariable("CBIDialing"),
      CBUDialing:getLocalVariable("CBUDialing"),
      CBSDialing:getLocalVariable("CBSDialing"),
      CBEDialing:getLocalVariable("CBEDialing"),
      CBQDialing:getLocalVariable("CBQDialing"),
      modeIndex:getLocalVariable("UserMode"),
      UserModeIndexLabel:JSON.parse(getLocalVariable("UserModeIndexLabel")),
      UserMode:getLocalVariable("UserMode"),
      CampaignName:getLocalVariable("CampaignName"),
      SipCheckStatus:getLocalVariable("SipCheckStatus"),
      AS_ID:getLocalVariable("AS_ID"),
      SIP_ID:getLocalVariable("SIP_ID"),
      ClientID:getLocalVariable("ClientID"),
      User_Status_ID:getLocalVariable("User_Status_ID"),
      Campaign_Type:getLocalVariable("Campaign_Type"),
      USER_ID:getLocalVariable("USER_ID"),
      ManualCallerIDList:getLocalVariable("ManualCallerIDList"),
      Queue_Priority:JSON.parse(getLocalVariable("Queue_Priority")),
      IsDedicatedCLI:getLocalVariable("IsDedicatedCLI"),
      MOPanel:getLocalVariable("MOPanel"),
      ChatA:getLocalVariable("ChatA"),
      lastQueuePause:getLocalVariable("lastQueuePause"),
      UserModeIndexID:JSON.parse(getLocalVariable("UserModeIndexID")),
      UserModeRecall:JSON.parse(getLocalVariable("UserModeRecall")),
      TMCCount:getLocalVariable("TMCCount"),
      TOBCount:getLocalVariable("TOBCount"),
      TIBCount:getLocalVariable("TIBCount"),
      TRCCount:getLocalVariable("TRCCount"),
      TTCCount:getLocalVariable("TTCCount"),
      TCCCount:getLocalVariable("TCCCount"),
      Call_Mc_Count:getLocalVariable("Call_Mc_Count"),
      Call_Ob_Count:getLocalVariable("Call_Ob_Count"),
      Call_In_Count:getLocalVariable("Call_In_Count"),
      Conference_Count:getLocalVariable("Conference_Count"),
      Recall_Reload_Duration:getLocalVariable("Recall_Reload_Duration"),
      isDisplayPhone:getLocalVariable("isDisplayPhone"),
      Callback_Auto:getLocalVariable("Callback_Auto"),
      LastRecallAlertId:getLocalVariable("LastRecallAlertId"),
      client_type:getLocalVariable("client_type"),
      WaitingDisposition:getLocalVariable("WaitingDisposition"),
      isLineBusy:getLocalVariable("isLineBusy"),
      LastModeBeforeRecall:getLocalVariable("LastModeBeforeRecall"),
      LastModeIndexBeforeRecall:getLocalVariable("LastModeIndexBeforeRecall"),
      SERVER_IP:getLocalVariable("SERVER_IP"),
      CS_API_Port:getLocalVariable("CS_API_Port"),
      Campaign_PreFix:getLocalVariable("Campaign_PreFix"),
      NextUserMode:getLocalVariable("NextUserMode"),
      NextUserModeIndex:getLocalVariable("NextUserModeIndex"),
      emailCount:getLocalVariable("EMAIL_COUNT"),
      smsCount:getLocalVariable("SMS_COUNT"),
      idleDuration:getLocalVariable("Idle_Duration"),
      wrapupDuration:getLocalVariable("Wrapup_Duration"),
      holdCount:getLocalVariable("Hold_Count"),
      holdDuration:getLocalVariable("Hold_Duration"),
      recallCount:getLocalVariable("Recall_Count"),
      recallDuration:getLocalVariable("Recall_Duration"),
      breakDuration:getLocalVariable("Break_Duration"),
      moDuration:getLocalVariable("Mo_Duration"),
      transferCount:getLocalVariable("Transfer_Count"),
      IsLicenseActive:getLocalVariable("IsLicenseActive"),
      DialPad:getLocalVariable("DialPad"),
      CRMLeadId:getLocalVariable("CRMLeadId"),
      Recall_Count:getLocalVariable("Recall_Count"),
      Campaign_DNC_Check:getLocalVariable("Campaign_DNC_Check"),
      DNCURL:getLocalVariable("DNCURL"),
      isRemoteDNC:getLocalVariable("isRemoteDNC"),
      RemoteDNCUrl:getLocalVariable("RemoteDNCUrl"),
      skill:JSON.parse(getLocalVariable("skill")),
      Manual_Dial_Route:getLocalVariable("Manual_Dial_Route"),
      Manual_Caller_ID:getLocalVariable("Manual_Caller_ID"),
      is_Recall:getLocalVariable("is_Recall"),
    };
    dispose_show();
    //console.log("set-campaign raw data= " + JSON.stringify(data_record));

    $.ajax({
      url: '/set-campaign',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data_record),
      success: function(result) {
        if (result.ok == true) {
          /** */
          document.getElementById("modalOverlay").style.display = "none";
          if (Object.keys(result.data).length > 0) {
            updateLocalVariables(result.data);
          }
          var ManualCallerIDList = getLocalVariable("ManualCallerIDList");
          var setcallerid = ManualCallerIDList.split(",");
          let new_caller_data = setcallerid[0].split("-");
          if (new_caller_data.length == 2) {
            set_new_callerid = new_caller_data[0];
            queue_did_name = new_caller_data[1];
            console.log("caller_id1=" + set_new_callerid);
            setLocalVariable("ManualCallerID", set_new_callerid);
            setLocalVariable("queue_did_name", queue_did_name);
          } else {
            var set_new_callerid = setcallerid[0];
            console.log("caller_id2=" + set_new_callerid);
            setLocalVariable("ManualCallerID", set_new_callerid);
            setLocalVariable("queue_did_name", "");
          }
  
          agentStatusFromCS();
          //setTimeout("checkAutoCallbacks()", 10000);
          saveAgentStatus();
          AutoDispose();
          ///webrtct registered///
          //sipRegister();
          CreateUserAgent();
          route_credentials();
          /*****reset permission decision tree chat whatsapp**** */
          reset_auth();
          /** show skill list */
          skillqueue();
          if (
            getLocalVariable("Campaign_Type") == "AB" ||
            getLocalVariable("Campaign_Type") == "SB" ||
            getLocalVariable("Campaign_Type") == "SD" ||
            getLocalVariable("Campaign_Type") == "SR"
          ) {
            $("#my-queue").show();
          } else {
            $("#my-queue").hide();
          }
          $(".number-screen .circle-number").each(function () {
            var title = $(this).attr("title");
            var HotDial = JSON.parse(getLocalVariable("HotDial"));
            if ($.isArray()) {
              if (
                title == 1 ||
                title == 2 ||
                title == 3 ||
                title == 4 ||
                title == 5
              ) {
                s = title - 1;
                if (
                  typeof HotDial[s] != "undefined" &&
                  HotDial[s] != null &&
                  HotDial[s].length != 0
                ) {
                  $(this).attr("title", HotDial[s]);
                } else {
                  $(this).attr("title", $(this).html());
                }
              } else {
                $(this).attr("title", $(this).html());
              }
            } else {
              $(this).attr("title", $(this).html());
            }
          });
          var crmfields = JSON.parse(getLocalVariable("dispositionField"));
          console.log(crmfields);
          for (var i in crmfields) {
            isDispositionCrmfield.push(i);
          }
          //processEventCampaign("login");
        } else {
          alert(result.msg);
        }
        alertify.success("Mode change Succesfully... ");
      },
      error: function(error) {
          alertify.error("Failed to send log: ",error);
      }
      });
    
    /** load call log data */
    get_CallLog("0");
    /** Show Route */
    routelist_data();
    //*****review list****///
    getTemplates("review");
    setLocalVariable("Review_Count", 0);
    setLocalVariable("Review_Duration", 0);
    setLocalVariable("Review_Counter", 0);
    if (getLocalVariable("UserMode") == "Progressive") {
      $("#top-crm-continer3").css("display", "flex");
    } else {
      $("#top-crm-continer3").css("display", "none");
    }
  });
  //////////////////change user status dat/////////
  $("#campaign").change(function () {
    //var selectedValue = $(this).val();
    
    var USER_ID = localStorage.getItem("USER_ID");
    var ClientID = localStorage.getItem("ClientID");
    campwithcamtype = $("#campaign").val();
    //alert(campwithcamtype);
    const campaign_multilist = campwithcamtype.split("~");
    CampaignName = campaign_multilist[0];
    $("#dialpad_campaign").val(CampaignName);
    AS_ID = localStorage.getItem("AS_ID");
    Campaign_Type = campaign_multilist[1];
    PreviousCampaignName = "";
    SIP_ID = localStorage.getItem("SIP_ID");
    SERVER_IP = localStorage.getItem("SERVER_IP");
    CS_API_Port = localStorage.getItem("CS_API_Port");
    User_Status_ID = localStorage.getItem("User_Status_ID");
    Manual_Caller_ID = "";
    let data_record = {ClientID:ClientID,USER_ID:USER_ID,CampaignName:CampaignName,AS_ID:AS_ID,Campaign_Type:Campaign_Type,PreviousCampaignName:PreviousCampaignName,User_Status_ID:User_Status_ID};
    //console.log("json data= "+JSON.stringify(data_record));
    $.ajax({
      url: '/get-usermode',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data_record),
      success: function(arr) {
        console.log("set= ",arr);
      setLocalVariable("CampaignName", CampaignName);
      if (arr.ok == true) {
        if (Object.keys(arr.data).length > 0) {
          updateLocalVariables(arr.data);
        }
        getManualCallerID();
      }
        ////////manual
      var jsonData = arr.data.UserModeIndexLabel;
      console.log("new json data "+JSON.stringify(arr.data.UserModeIndexLabel));
      var select = $(
        '<select class="form-control" name="user-mode" id="user-mode"></select>'
      ).attr("name", "user-mode");
      var select2 = $(
        '<select class="form-control" style="border-color: #0D63B0; background-color: #fff;" id="dial_mode"></select>'
      ).attr("name", "dial_mode");
      $.each(jsonData, function (key, value) {
        select.append($("<option></option>").attr("value", value).text(value));
        select2.append($("<option></option>").attr("value", value).text(value));
      });
      $("#res_user_mode").html(select);
      $("#show_user_mode").html(select2);
      },
      error: function(error) {
          alertify.error("Failed to send log: ",error);
      }
      });

  
  });
  
  $("#skill_btn").click(function () {
    $("#infor_section").hide();
    $("#route_section").hide();
    $("#skill_section").show();
    $("#calling_pad").hide();
  });
  $("#route_btn").click(function () {
    $("#infor_section").hide();
    $("#route_section").show();
    $("#skill_section").hide();
    $("#calling_pad").hide();
  });
  $("#infor_btn").click(function () {
    $("#infor_section").show();
    $("#calling_pad").hide();
    $("#infor_btn").hide();
    $("#dials_btn").show();
    $("#skill_section").hide();
    $("#route_section").hide();
  });
  $("#dials_btn").click(function () {
    $("#infor_section").hide();
    $("#calling_pad").show();
    $("#dials_btn").hide();
    $("#infor_btn").show();
    $("#route_section").hide();
    $("#skill_section").hide();
  });
  $("#netline2").click(function () {
    $(".line2_callgroup").show();
    $(".line1_callgroup").hide();
    $("#netline1").removeClass("btn-success");
    $("#netline1").addClass("btn-light");
    $("#netline2").addClass("btn-success");
    $("#netline2").removeClass("btn-light");
  });
  $("#netline1").click(function () {
    $(".line2_callgroup").hide();
    $(".line1_callgroup").show();
    $("#netline1").addClass("btn-success");
    $("#netline1").removeClass("btn-light");
    $("#netline2").removeClass("btn-success");
    $("#netline2").addClass("btn-light");
  });
  $("#disposition").change(function () {
    var disposition_id = $(this).val();
    var node_id = $("#tree_node_id").val();
    var client_id = localStorage.getItem("ClientID");
    var campaign_name = localStorage.getItem("CampaignName");
    var recall = getLocalVariable("is_Recall");
    if (node_id > 0) {
      /** code by jainul */
      $.ajax({
        url: "/api_calling/getiscallbackd",
        method: "POST",
        data: JSON.stringify({
          disposition: disposition_id,
          client_id: client_id,
          node_id: node_id,
          campaign_name: campaign_name,
        }),
        dataType: "JSON",
        contentType: "application/json",
        success: function (result) {
          if (result.data[0].is_callback == 1) {
            if (recall == 1) {
              $("#temp_disp").val("1");
              $("#callbackdate").show();
              $("#callbackLabel").show();
            } else {
              $("#temp_disp").val("0");
              alertify.error("Callback is not allowed for this campaign");
            }
          } else {
            $("#temp_disp").val("0");
            $("#callbackdate").val("");
            $("#callbackdate").hide();
            $("#callbackLabel").hide();
          }
        },
      });
      /** end code by jainul */
      $.ajax({
        url: "/api_calling/sub_disposition_listd",
        method: "POST",
        data: JSON.stringify({
          disposition_id: disposition_id,
          client_id: client_id,
          campaign_name: campaign_name,
          node_id: node_id,
        }),
        dataType: "JSON",
        contentType: "application/json",
        success: function (data) {
          $("#sub_disposition").attr("disabled", false);
          $("#sub_disposition")
            .empty()
            .append(
              '<option selected="selected" value="">Select Sub Disposition</option>'
            );
          if (data.status == true) {
            $.each(data.data, function (key, value) {
              $("#sub_disposition").append(
                "<option value='" + value + "'>" + value + "</option>"
              );
            });
          }
        },
      });
    } else {
      /** code by jainul */
      $.ajax({
        url: "/api_calling/getiscallback",
        method: "POST",
        data: JSON.stringify({
          disposition: disposition_id,
          client_id: client_id,
        }),
        dataType: "JSON",
        contentType: "application/json",
        success: function (result) {
          if (result.data[0].is_callback == 1) {
            if (recall == 1) {
              $("#temp_disp").val("1");
              $("#callbackdate").show();
              $("#callbackLabel").show();
            } else {
              $("#temp_disp").val("0");
              alertify.error("Callback is not allowed for this campaign");
            }
          } else {
            $("#temp_disp").val("0");
            $("#callbackdate").val("");
            $("#callbackdate").hide();
            $("#callbackLabel").hide();
          }
        },
      });
      /** end code by jainul */
      $.ajax({
        url: "/api_calling/sub_disposition_list",
        method: "POST",
        data: JSON.stringify({
          disposition_id: disposition_id,
          client_id: client_id,
          campaign_name: campaign_name,
        }),
        dataType: "JSON",
        contentType: "application/json",
        success: function (data) {
          $("#sub_disposition").attr("disabled", false);
          $("#sub_disposition")
            .empty()
            .append(
              '<option selected="selected" value="">Select Sub Disposition</option>'
            );
          if (data.status == true) {
            $.each(data.data, function (key, value) {
              $("#sub_disposition").append(
                "<option value='" + value + "'>" + value + "</option>"
              );
            });
          }
        },
      });
    }
  });
  $("#sub_disposition").change(function () {
    var disposition = $("#disposition").val();
    var node_id = $("#node_id").val();
    var sub_disposition_id = $(this).val();
    var client_id = localStorage.getItem("ClientID");
    var campaign_name = localStorage.getItem("CampaignName");
    var recall = getLocalVariable("is_Recall");
    if (node_id > 0) {
      $.ajax({
        url: "/api_calling/getissubcallbackd",
        method: "POST",
        data: JSON.stringify({
          disposition: disposition,
          sub_disposition_id: sub_disposition_id,
          client_id: client_id,
          node_id: node_id,
          campaign_name: campaign_name,
        }),
        dataType: "JSON",
        contentType: "application/json",
        success: function (result) {
          if (result.data[0].is_callback == 1) {
            if (recall == 1) {
              $("#temp_disp").val("1");
              $("#callbackdate").show();
              $("#callbackLabel").show();
            } else {
              $("#temp_disp").val("0");
              alertify.error("Callback is not allowed for this campaign");
            }
          } else {
            $("#temp_disp").val("0");
            $("#callbackdate").val("");
            $("#callbackdate").hide();
            $("#callbackLabel").hide();
          }
        },
      });
    } else {
      $.ajax({
        url: "/api_calling/getissubcallback",
        method: "POST",
        data: JSON.stringify({
          disposition: disposition,
          sub_disposition_id: sub_disposition_id,
          client_id: client_id,
        }),
        dataType: "JSON",
        contentType: "application/json",
        success: function (result) {
          if (result.data[0].is_callback == 1) {
            if (recall == 1) {
              $("#temp_disp").val("1");
              $("#callbackdate").show();
              $("#callbackLabel").show();
            } else {
              $("#temp_disp").val("0");
              alertify.error("Callback is not allowed for this campaign");
            }
          } else {
            $("#temp_disp").val("0");
            $("#callbackdate").val("");
            $("#callbackdate").hide();
            $("#callbackLabel").hide();
          }
        },
      });
    }
  });
  /** code by jainul**/
  /*code by udit start search*/
  $("#disposition-disposition-search").change(function () {
    var disposition_id = $(this).val();
    var node_id = $("#node_id").val();
    var client_id = localStorage.getItem("ClientID");
    var campaign_name = localStorage.getItem("CampaignName");
    var recall = getLocalVariable("is_Recall");

    $.ajax({
      url: "/api_calling/sub_disposition_list",
      method: "POST",
      data: JSON.stringify({
        disposition_id: disposition_id,
        client_id: client_id,
        campaign_name: campaign_name,
      }),
      dataType: "JSON",
      contentType: "application/json",
      success: function (data) {
        $("#sub-disposition-disposition-search").attr("disabled", false);
        $("#sub-disposition-disposition-search")
          .empty()
          .append(
            '<option selected="selected" value="">Select Sub Disposition</option>'
          );
        if (data.status == true) {
          $.each(data.data, function (key, value) {
            $("#sub-disposition-disposition-search").append(
              "<option value='" + value + "'>" + value + "</option>"
            );
          });
        }
      },
    });
  });

  /*code by udit end search*/
  $("#preview-disposition").change(function () {
    var disposition_id = $(this).val();
    var client_id = localStorage.getItem("ClientID");
    var campaign_name = localStorage.getItem("CampaignName");

    $.ajax({
      url: "/api_calling/sub_disposition_list",
      method: "POST",
      data: JSON.stringify({
        disposition_id: disposition_id,
        client_id: client_id,
        campaign_name: campaign_name,
      }),
      dataType: "JSON",
      contentType: "application/json",
      success: function (data) {
        $("#preview-subdisposition").attr("disabled", false);
        $("#preview-subdisposition")
          .empty()
          .append(
            '<option selected="selected" value="">Select Sub Disposition</option>'
          );
        if (data.status == true) {
          $.each(data.data, function (key, value) {
            $("#preview-subdisposition").append(
              '<option value="' + value + '">' + value + "</option>"
            );
          });
        }
      },
    });
  });
  $("#review-disposition").change(function () {
    var disposition_id = $(this).val();
    var client_id = localStorage.getItem("ClientID");
    var campaign_name = localStorage.getItem("CampaignName");

    $.ajax({
      url: "/api_calling/sub_disposition_list",
      method: "POST",
      data: JSON.stringify({
        disposition_id: disposition_id,
        client_id: client_id,
        campaign_name: campaign_name,
      }),
      dataType: "JSON",
      contentType: "application/json",
      success: function (data) {
        $("#review-subdisposition").attr("disabled", false);
        $("#review-subdisposition")
          .empty()
          .append(
            '<option selected="selected" value="">Select Sub Disposition</option>'
          );
        if (data.status == true) {
          $.each(data.data, function (key, value) {
            $("#review-subdisposition").append(
              '<option value="' + value + '">' + value + "</option>"
            );
          });
        }
      },
    });
  });
  

  /*
   * Reload Configuration Working
   */
  $("#btn_reload").click(function () {
    if (popUpOpened == 1) {
      return;
    }
    if (getLocalVariable("reviewMode") == "1") {
      alertify.error("Please exit Review mode.");
      return;
    }
    if (
      getLocalVariable("CampaignName") == "" ||
      getLocalVariable("UserMode") == ""
    ) {
      return;
    }
    if (
      getLocalVariable("WaitingDisposition") == "true" ||
      getLocalVariable("WaitingMoDisposition") == "true"
    ) {
      alertify.error("Please Dispose last call first...!");
      return false;
    }
    alertify.confirm(
      "Are you surely want to reload configuration?",
      function (e) {
        if (e) {
          let jsondata= {
            ClientID:getLocalVariable("ClientID"),
            USER_ID:getLocalVariable("USER_ID"),
            CampaignName: getLocalVariable("CampaignName"),
            AS_ID: getLocalVariable("AS_ID"),
            Campaign_Type: getLocalVariable("Campaign_Type"),
            PreviousCampaignName: getLocalVariable("PreviousCampaignName"),
            User_Status_ID: getLocalVariable("User_Status_ID"),
            LoginHourID: getLocalVariable("LoginHourID"),
            lastQueuePause: getLocalVariable("lastQueuePause"),
            SIP_ID: getLocalVariable("SIP_ID"),
            UserMode: getLocalVariable("UserMode")
          };

        $.ajax({
            url: '/reload-conf',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(jsondata),
            success: function(result) {
              if (result.ok == true) {
                if (Object.keys(result.data).length > 0) {
                  updateLocalVariables(result.data);
                }
                
                getManualCallerID();
                /** save caller id code Alok */
                get_permission();
                what_business_number();
                save_callerid();
                route_credentials();
                /*****reset permission decision tree chat whatsapp**** */
                reset_auth();
                /** show skill list */
                skillqueue();
                dispose_show();
                $("#route_list_details").html("");
                /** load call log*/
                $("#crm_div").hide();
                $("#main_cont").hide();
                /** Show Route */
                routelist_data();
                showChatwebRtc();
                /*** End routes list */
                $(".number-screen .circle-number").each(function () {
                  var title = $(this).attr("title");
                  var HotDial = JSON.parse(getLocalVariable("HotDial"));
                  if ($.isArray(HotDial)) {
                    if (
                      title == 1 ||
                      title == 2 ||
                      title == 3 ||
                      title == 4 ||
                      title == 5
                    ) {
                      s = title - 1;
                      if (
                        typeof HotDial[s] != "undefined" &&
                        HotDial[s] != null &&
                        HotDial[s].length != 0
                      ) {
                        $(this).attr("title", HotDial[s]);
                      } else {
                        $(this).attr("title", $(this).html());
                      }
                    } else {
                      $(this).attr("title", $(this).html());
                    }
                  } else {
                    $(this).attr("title", $(this).html());
                  }
                });
                getCampaigns();
                var UserModeIndexLabel = JSON.parse(
                  getLocalVariable("UserModeIndexLabel")
                );
                var s = '<option value="">Select UserMode</option>';
                for (var i in UserModeIndexLabel) {
                  if (UserModeIndexLabel.hasOwnProperty(i)) {
                    s +=
                      "<option value='" +
                      UserModeIndexLabel[i] +
                      "' " +
                      (getLocalVariable("UserMode") == UserModeIndexLabel[i]
                        ? "selected='selected'"
                        : "") +
                      ">" +
                      UserModeIndexLabel[i] +
                      "</option>";
                  }
                }
                $("#dial_mode").html(s);
                getMappedSkills();
                getCallForward();
                var crmfields = JSON.parse(
                  getLocalVariable("dispositionField")
                );
                for (var i in crmfields) {
                  isDispositionCrmfield.push(i);
                }
                $("#manual-did").html("");
                $(".fa-eye-slash").trigger("click");
                alertify.success(
                  "Campaign Configuration & Permission Reloaded...!"
                );
              } else {
                alertify.error("Unable to reload the configuration...!");
              }
            },
            error: function(error) {
                alertify.error("Failed to send log: ",error);
            }
        });
          
        }
      }
    );
  });
  /*
   * Call Conference Working
   */
  /*
   * Call Conference Working
   */

  /** Call dispose */
  $('#Save_callbackschedule').click(async function () {
    var client_id = localStorage.getItem("ClientID");
    var recall_id = $('#recall_id').val();
    var schedule_calldate = $('#schedule_calldate').val();
    let response = await fetch('/current_dbdatetime', {method: 'GET'});
    let cam_result = await response.json();
    var datetime1 = new Date(cam_result.msg);
    var datetime2 = new Date(schedule_calldate);
    if(schedule_calldate=='' || recall_id=='')
      {
          $("#err_schedule_calldate").css("display", "block");
          document.getElementById("schedule_calldate").style.border="1px solid red";
          document.getElementById("err_schedule_calldate").innerHTML = 'Please select re-schedule data...! ';
          //alertify.error("Please select re-schedule data...!");
          return false;
      }
      if (datetime1 > datetime2) {
        alertify.error('Callback Time is greater than Current Time and more than 2 minutes...!');
        return false;
      } 
    $.ajax({
      url: "/save_schedulecallback",
      method: "POST",
      data: { recall_id: recall_id, client_id: client_id, schedule_calldate: schedule_calldate },
      dataType: "JSON",
      success: function (result) {
        if (result.ok == true) {
          alertify.success("Callback Schedule Successfully !...");
          document.getElementById("schedule_calldate").style.border="1px solid #ccc";
          $("#err_schedule_calldate").css("display", "none");
          /****Reset Callback value****/
          $('#callback_count').html("");
          $('#next_callback').html("");
          $('#callback_phone').html("");
          setLocalVariable("callback_notify", "");

          callbackschModalSch.style.display = 'none';
          return false;
        }
      }
    });
  });
  $("#dispose_tree").click(function () {
    alert("hello");
    var tree_node_id = $("#tree_node_id").val();
    alert("hello= "+tree_node_id);
  });
  $("#dispose_call").click(async function () {
    /*var agent = $("#agent").val();
    var dataid = $("#dataid").val();
    var campaign = $("#campaign").val();
    var phone = $("#phone").val();
    var rid = $("#rid").val();
    var calltype = $("#calltype").val();
    var tree_decision_id_node = $("#tree_decision_id_node").val();
    alert("agent= "+agent+" dataid= "+dataid+" campaign= "+campaign+" phone= "+phone+" rid= "+rid+calltype+" tree_decision_id_node= "+tree_decision_id_node);*/
    var UserDisableDisposition = getLocalVariable('UserDisableDisposition');
    if(UserDisableDisposition != '0' || UserDisableDisposition != 0) {
      alertify.error("Access denied...!");
      return false;
    }

    
    var call_type = getLocalVariable("CALL_TYPE");
    var isLineBusy = getLocalVariable("isLineBusy");
    var WaitingDisposition = getLocalVariable("WaitingDisposition");
    var disposition = $("#disposition").val();
    var sub_disp = $("#sub_disposition").val();
    var remarks = $("#remarks").val();
    var cdate = $("#callbackdate").val();
    var HangupCall = getLocalVariable("HangupCall");
    /*****  Call back set then alert****/
    if ($("#callbackdate").val().length > 0) 
    {
      var schedule_calldate = new Date($("#callbackdate").val());
      let response = await fetch('/current_dbdatetime', {method: 'GET'});
      let cam_result = await response.json();
      var datetime1 = new Date(cam_result.msg);
      var datetime2 = new Date(schedule_calldate);
      if (datetime1 > datetime2) {
        alertify.error('Callback Time is greater than Current Time and more than 2 minutes...!');
        return false;
      } 
    }
    var crm_dispose_ok = true;
    if (isLineBusy == "READY" && WaitingDisposition != "true") {
      alertify.error("Disposition Already Save ");
      return false;
    }
    if (HangupCall != "1" && isLineBusy == "ONCALL") {
      alertify.error(
        "Agent hang-up not allowed. Please wait for the call to disconnect. "
      );
      return false;
    }
    if ($("#temp_disp").val() > 0 && $("#callbackdate").val().length == 0) {
      alertify.error("Please Select Callback Date !...");
      return false;
    }
    if (remarks == "") {
      $("#err_remarks").show();
      document.getElementById("err_remarks").innerHTML = "Please enter remarks";
      document.getElementById("remarks").style.border = "1px solid red";
      document.getElementById("remarks").focus();
      crm_dispose_ok = false;
      return false;
    } else {
      document.getElementById("remarks").style.border = "1px solid  green";
      $("#err_remarks").hide();
    }
    if (disposition == "") {
      $("#err_disposition").show();
      document.getElementById("err_disposition").innerHTML =
        "Please select disposition ";
      document.getElementById("disposition").style.border = "1px solid red";
      document.getElementById("disposition").focus();
      crm_dispose_ok = false;
      return false;
    } else {
      document.getElementById("disposition").style.border = "1px solid  green";
      $("#err_disposition").hide();
    }
    if (
      $("#sub_disposition").children("option").length > 1 &&
      ($("#sub_disposition").val() === "0" || $("#sub_disposition").val() == "")
    ) {
      $("#err_sub_disposition").show();
      document.getElementById("err_sub_disposition").innerHTML =
        "Please select Sub disposition ";
      document.getElementById("sub_disposition").style.border = "1px solid red";
      document.getElementById("sub_disposition").focus();
      crm_dispose_ok = false;
      return false;
    } else {
      document.getElementById("sub_disposition").style.border =
        "1px solid  green";
      $("#err_sub_disposition").hide();
    }

    /** code by jainul */
    
    var tree_node_id = $("#tree_node_id").val();
    if (tree_node_id > 0) 
    {
      insert_tree_disposition();
    }
    $("#crm-form :input:disabled").each(function () {
      $(this).data("disabled", true); // Store the disabled state
      $(this).prop("disabled", false);
    });

    // Serialize the form
    let data = $("#crm-form").serialize();
    $("#crm-form :input").each(function () {
      if ($(this).data("disabled")) {
        $(this).prop("disabled", true);
        $(this).removeData("disabled"); // Clean up the data attribute
      }
    });

    /*----code update by udit for handle validation and attempt 17 july start------- */
    //updateCrm(data);

    // Convert the serialized string into an object
    let dataObj1 = {};
    data.split("&").forEach((pair) => {
      let [key, value] = pair.split("=");
      key = decodeURIComponent(key.replace(/\+/g, " "));
      value = decodeURIComponent(value.replace(/\+/g, " "));

      if (key.endsWith("[]")) {
        key = key.slice(0, -2);
        if (!dataObj1[key]) {
          dataObj1[key] = [];
        }
        dataObj1[key].push(value);
      } else {
        dataObj1[key] = value;
      }
    });

    // Function to format date-time without "T"
    function formatDateTime(dateTime) {
      return dateTime.replace("T", " ");
    }

    // Modify date-time fields if necessary and convert arrays to comma-separated strings
    for (let key in dataObj1) {
      if (typeof dataObj1[key] === "string" && dataObj1[key].includes("T")) {
        dataObj1[key] = formatDateTime(dataObj1[key]);
      }

      if (Array.isArray(dataObj1[key])) {
        dataObj1[key] = dataObj1[key].join(",");
      }
      if (dataObj1[key] === undefined) {
        dataObj1[key] = "";
      }
    }

    // Reserialize the modified data object to a URL-encoded string
    let serializedData1 = $.param(dataObj1);
    console.log(" upsdare crm"+JSON.stringify(serializedData1));
    data = serializedData1;

    //alert("data serilize= "+JSON.stringify(data));
    //                console.log(mandatory);
    if (mandatory.length > 0) {
      for (x in mandatory) {
        if (mandatory[x] != "") {
          if (
            typeof $("#f" + mandatory[x]).val() != "undefined" &&
            $("#f" + mandatory[x]).attr("type") == "text" &&
            $("#f" + mandatory[x]).val().length == 0
          ) {
            alertify.error("Star(*) fields are mandatory");
            return false;
          } else if (
            typeof $("#f" + mandatory[x]).val() != "undefined" &&
            $("#f" + mandatory[x]).attr("type") == "radio" &&
            $("#f" + mandatory[x]).is(":checked") == false
          ) {
            alertify.error("Star(*) fields are mandatory");
            return false;
          } else {
            if ($("#f" + mandatory[x]).val() == "") {
              alertify.error("Star(*) fields are mandatory");
              return false;
            }
          }
        }
      }
    }
    var phoneno = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

    if ($("#disposition").val() === "0") {
      alertify.error("Please select disposition");
      crm_dispose_ok = false;
      return false;
    }
    if (
      $("#sub_disposition").children("option").length > 1 &&
      $("#sub_disposition").val() === "0"
    ) {
      alertify.error("Please select sub-disposition");
      crm_dispose_ok = false;
      return false;
    }
    var disposition = $("#disposition").val();
    var tempdisp = $("#temp_disp").val();
    var callbackdate = $("#callbackdate").val();
    if (tempdisp == 1) {
      if ($("#callbackdate").val().length === 0) {
        alertify.error("Please select the date for recalling");
        crm_dispose_ok = false;
        return false;
      }
    }
    updateCrm(data);
    

    /*******start end callback ****/

    if ($("#callbackdate").val().length > 0) {
      action = "CALLBACK";
      /*** Add recall */
      var phone = localStorage.getItem("NumberToDial");
      var dataid = localStorage.getItem("crm_data_id");
      var campaign = localStorage.getItem("CampaignName");
      var agent = localStorage.getItem("USER_ID");
      var client_id = localStorage.getItem("ClientID");
      var update_by_ip = localStorage.getItem("MYIP");
      var recall_type = "cbu";
      var rid = localStorage.getItem("RecordID");
      var calltype = localStorage.getItem("CALL_TYPE");
      var disposition = $("#disposition").val();
      var sub_disposition = $("#sub_disposition").val();
      var skill = localStorage.getItem("crm_skill");
      let last_callback_id='';
      if (calltype == 'RC') {
        last_callback_id = getLocalVariable("last_callback_id");
      }


      $.ajax({
        url: "/availability_recall",
        method: "POST",
        data: {
          callback_id: last_callback_id,
          phone: phone,
          dataid: dataid,
          campaign: campaign,
          cdate: cdate,
          agent: agent,
          client_id: client_id,
          update_by_ip: update_by_ip,
          recall_type: recall_type,
          rid: rid,
          calltype: calltype,
          disposition: disposition,
          sub_disposition: sub_disposition,
          skill: skill,
        },
        dataType: "JSON",
        success: function (result) {
          //alert(JSON.stringify(result));
          if (result.ok == true) {
            let text =
              "Callback is Already set, Are You sure want to Continue? ";
            if (confirm(text) == true) {
              recall_insertion(cdate,'','','add');
            } else {
              //recall_insertion(cdate);
              //alert("hello1");
            }
          } else {
            recall_insertion(cdate,'','','add');
          }
        },
      });
    } else {
      action = "DISPOSE";
    }
    if(getLocalVariable('CALL_TYPE') != 'TC' && getLocalVariable('CALL_TYPE') != 'QT')
      {
        update_hold();
      }
    /***********End Call Back******** */

    /*----code updsate by iudit for handle validation and attempt 17 july end------ */
    var sendlist = {
      type: "agentstatus",
      status: "READY",
      line2: getLocalVariable("isLine2Busy"),
      phone2: getLocalVariable("NumberToDial2"),
      phone: getLocalVariable("NumberToDial"),
      client_id: getLocalVariable("ClientID"),
      exten: getLocalVariable("SIP_ID"),
      campaign: getLocalVariable("CampaignName"),
      agent: getLocalVariable("USER_ID"),
      mode: getLocalVariable("UserModeIndex"),
      did_number: getLocalVariable("ManualCallerIDList"),
      recall: getLocalVariable("Recall_Count"),
      transfer: getLocalVariable("Transfer_Count"),
      conference: getLocalVariable("Conference_Count"),
      login_id: getLocalVariable("LoginHourID"),
      action_id: getLocalVariable("ModeDBId"),
      manual: getLocalVariable("Call_Mc_Count"),
      outbound: getLocalVariable("Call_Ob_Count"),
      inbound: getLocalVariable("Call_In_Count"),
      modeduration: getLocalVariable("CurrentAgentStateTime"),
      skill: getLocalVariable("crm_skill"),
    };
    if (websocketConnected == 1 && crm_dispose_ok == true) {
      $(".header_part").css("display", "none");
      console.log("Dispose= " + JSON.stringify(sendlist));

      if (getLocalVariable('reviewMode') != 1 || getLocalVariable('reviewMode') != "1") {
        console.log("websocket push request");
        websocket.send(JSON.stringify(sendlist));
      }
      

      if (getLocalVariable("UserMode") == "Progressive") {
        $("#top-crm-continer3").css("display", "flex");
      }
      $("#top-crm-continer").css("display", "none");
      $("#top-crm-continer").html("");
      $("#show_greendata").css("display", "none");
      //$('#webrtc_crm_data').html("Disposition save..");
      $("#webrtc_crm_data").html("");

      var Campaign_name = window.localStorage.getItem("CampaignName");
      var sip_id = window.localStorage.getItem("SIP_ID");
      var client_id = window.localStorage.getItem("ClientID");
      var lead_id = Campaign_name.toUpperCase() + "_MANUAL";

      var rid = window.localStorage.getItem("RecordID");
      var skill = window.localStorage.getItem("crm_skill");
      var did = window.localStorage.getItem("CRMDataID");

      var jsonData = {
        did: did,
        lead_id: lead_id,
        remarks: remarks,
        disposition: disposition,
        sub_disp: sub_disp,
        rid: rid,
        sip_id: sip_id,
        client_id: client_id,
        skill: skill,
        callbackdate:callbackdate
      };
      console.log("dispose data for disposition" + JSON.stringify(jsonData));

      /*******Start send disposition sms send ****** */
      disposition_map_smssend(disposition);
      /*******end send disposition sms send ****** */
      fetch("/api_calling/save_disposition_data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          return response.json();
        })
        .then((data) => {
          if (data.status == 1) {
            console.log("Save Disposition");

            setLocalVariable("WaitingDisposition", "false");
            call_type = getLocalVariable("CALL_TYPE");
            LastUserMode = getLocalVariable("LastUserMode");
            if (call_type == "RC") {
              client_id = getLocalVariable("ClientID");
              user_id = getLocalVariable("USER_ID");
              phone = getLocalVariable("NumberToDial");
              CampaignName = getLocalVariable("CampaignName");
              last_callback_id = getLocalVariable("last_callback_id");
              
              $.ajax({
                url: "/recall_delete",
                method: "POST",
                data: {recall_id: last_callback_id},
                dataType: "JSON",
                success: function (result) {
                  if (result.status == true) {
                    //alert("delete callback");
                    logEntry("delete callback for  " + phone);
                  } else {
                    //alert("Unable to delete callback");
                    logEntry("Unable to delete callback  " + phone);
                  }
                },
              });
              if (getLocalVariable('manualdial_callback') != 1)
              {
                setLocalVariable("callback_notify", "");
              }
              
            }
            if(getLocalVariable('isLineBusy')=='DIALING')
            {
              cancelSession('cs_call');
            }

             /****** hold counter update *****/
             endSession("cs_call");
             queueAdd("queue_inactive");

            setLocalVariable("AutoDisposeTime", 0);
            setLocalVariable("manualdial_callback", "");
            setLocalVariable("AutoDispCounter", 0);
            setLocalVariable("AutoDispTimeDiff", 0);
            setLocalVariable("lineSelected", 1);
            setLocalVariable("isLineBusy", "READY");
            setLocalVariable("DisplayCallerID", "");
            setLocalVariable("NumberToDial", "");
            setLocalVariable("NumberToDial2", "");
            setLocalVariable("RecordID", "");
            setLocalVariable("CRMDataID", "");
            setLocalVariable("crm_data_id", "");
            setLocalVariable("isLine2Busy", "");
            setLocalVariable("CALL_TYPE", "");
            $("#crm_skill").html("");
            $("#crm_phone_number").html("");
            $("#crm_did_number").html("");
            $("#crm_did_name").html("");
            $("#crm_rid").html("");
            $("#crm_skill").html("");
            $("#show_dial_phone").html("");
            $("#show_call_type").html("");
            $("#callback_count").html("");
            $("#next_callback").html("");
            $("#callback_phone").html("");
            $("#top-crm-continer2").css("display", "block");
            alertify.success("Save Disposition");
            $("#remarks").val("");
            $("#disposition").val("");
            $("#sub_disposition").val("");
            $("#callbackdate").val("");
            
            $("#agent_attendedtransfer").css("display", "block");
            $("#callbackdate").css("display", "none");
            $("#agent_completeattended_transfer").css("display", "none");
            $("#show_disposition_section").css("display", "flex");
            get_CallLog("0");
            get_callback('0');
            reset_field();
            if (getLocalVariable('reviewMode') == 1 || getLocalVariable('reviewMode') == "1") {
              review_duration();
            }
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
            
            
            
            
    
      /****** end hold counter *****/
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  });
  /* modal code for alok*/
  $("#logOpenModalBtn").click(function () {
    $("#logModallog").css("display", "flex");
  });
  $("#customOpenModalBtn").click(function () {
    $("#customModalOverlay").css("display", "flex");
    /** load email templates */
    getTemplates("email");
  });
  $("#customCloseModalBtn").click(function () {
    $("#customModalOverlay").css("display", "none");
  });
  $("#customOpenModalBtnsms").click(function () {
    $("#customModalOverlaysms").css("display", "flex");
    /** load SMS templates */
    getTemplates("sms");
  });
  $("#previewOpenModalBtn").click(function () {
    $("#previewModalPreview").css("display", "flex");
    /** load SMS templates */
    getTemplates("prev");
  });
  $("#reviewOpenModalBtn").click(function () {
    /** load SMS templates */
    $("#review_reports").show();
    $("#dashboard_view").hide();
    $("#log_reports").hide();
  });
  $("#customCloseModalBtnsms").click(function () {
    $("#customModalOverlaysms").css("display", "none");
  });
  $("#txtEditor").Editor();
  $("#emailcontent").Editor();
  /**** code by Alok ** */
  $("#dialpad_campaign").change(function () {
    var client_id = localStorage.getItem("ClientID");
    var from_campaign = localStorage.getItem("CampaignName");
    var call_status = getLocalVariable("isLineBusy");
    var from_queue = getLocalVariable("queue_did_name");
    var to_campaign = $("#dialpad_campaign").val();
    var data_record_new = {
      client_id: client_id,
      from_campaign: from_campaign,
      from_queue: from_queue,
      to_campaign: to_campaign,
    };
    ///*** campaign skill list */
    campaign_skill_list(client_id,to_campaign);
    //if (call_status == "ONCALL") {
      $.post("/queue_list", data_record_new, function (result_queue) {
        var json_queue = result_queue.data;
        var str_queue = '<option value="">Select Queue</option>';
        $.each(json_queue, function (key1, value1) {
          str_queue +=
            "<option value='" +
            value1.to_queue +
            "~" +
            value1.queue_priority +
            "'>" +
            value1.to_queue +
            "</option>";
        });
        $("#queue_trasfer_list").html(str_queue);
      });
    //}
  });
  $("#Search_callback").click(function () {
    var logField = JSON.parse(getLocalVariable("Log_Data_Field"));
    var search_start_date = $("#search_start_date").val();
    var search_end_date = $("#search_end_date").val();
    $("#search_history").css("display", "block");
    $.ajax({
      url: "callback_search_log",
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify({
        USER_ID: getLocalVariable("USER_ID"),
        search_start_date: search_start_date,
        search_end_date: search_end_date,
        Log_Data_Field: logField,
        campaign: getLocalVariable("CampaignName"),
        ClientID: getLocalVariable("ClientID"),
      }),
      success: function (result) {
        $("#callback_searchlog").html(result);
      },
      error: function () {
        alertify.error("An error occurred while processing your request.");
      },
    });
  });
  $("#callbacksCloseModalBtn").click(function () {
    $("#callback_searchlog").html('');
    $('#search_history').css('display', 'none');
  });
  $("#callbacktxt_search").dblclick(function(){
    $('#callbacksModalS').css('display', 'flex');
  });

  $("#btnUnRegister").click(function(event) {
    var WaitingDisposition = window.localStorage.getItem('WaitingDisposition');
    if(WaitingDisposition == "true"){
        console.warn("Please Dispose the last call first...!");
        // The best we can do is throw up a system alert question.
        event.preventDefault();
        alertify.error("Please Dispose the last call first...!");
    }
});


  

  function loadLog(page,username,client_id,campaign,dataid){
		var datarecord={page_no:page,username:username,client_id:client_id,campaign:campaign,intr:dataid};
		$.ajax({
        method: 'POST',
        url: '/all_call_log',
        data: datarecord,
        success: function (response) {
            //alert(response);
            $("#show_all_summary").html(response);
        }
    	});
	  }
	  $(document).on("click", ".delivery_page li a", function(e){
		e.preventDefault();
		var pageId = $(this).attr("id");
    var dataid = $('#all_summary_data_id').val();
		var username = getLocalVariable('USER_ID');
		var client_id = getLocalVariable('ClientID');
		var campaign = getLocalVariable('CampaignName');
		loadLog(pageId,username,client_id,campaign,dataid);
	  });
    $(document).on("click", ".add-recall", function(e){
      e.preventDefault();
      $(".add-recall").removeClass("highlight");
      $(this).addClass("highlight");
      $(this).hide("blind", { direction: "vertical" }, 500).show("blind", { direction: "vertical" }, 500);
      });




}); ///end document ready function

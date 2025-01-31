const ReLoadRecall = async () => {
  if (Campaign_Type === "AB" && MOPanel === 1) return;
  if (!isRecall_Mode_Allow) return;
  if (!isRecallModePermission) return;
  if (Activity_Mode_id > 0) return;
  if (isPopUpOpen) return;
  if (UserMode.toLowerCase() === "break") return;

  // ============added to aboard callback if call waiting============================
  if (TotalCallWaiting > 0) {
    if (UserMode.toUpperCase() === "CALLBACK" && !WaitingDisposition && LastModeBeforeRecall.length > 0) {
      NextUserMode = LastModeBeforeRecall;
      NextUserModeIndex = LastModeIndexBeforeRecall;
      await Agent.SaveNextUserMode();
      LastModeIndexBeforeRecall = 0;
      LastModeBeforeRecall = "";
    }
    return;
  }
  // ===============================================================================

  if (CALL_TYPE === "RC") return;

  let tempDate = new Date();
  tempDate.setMinutes(tempDate.getMinutes() + Recall_Reload_Duration);
  tempDate = tempDate.toISOString().replace('T', ' ').slice(0, 19);

  let rsRecall;
  const query1 = `SELECT phone FROM ${GalaxyClientDB}.recall 
                  WHERE client_id='${ClientID}' AND data_flag=1 AND agent='${USER_ID}' 
                  AND campaign<>'${CampaignName}' AND recall_type<>'wta' 
                  AND cdate <= '${GetDBTime}' LIMIT 1`;

  rsRecall = await SelectQuery(query1);

  if (rsRecall.length > 0) {
    TrayBalloonRecall(Agent.pbTray, "OTHER CAMPAIGN Callback", "You have missed a Callback , because of different campaign log-in", 3, 0);
  }

  if (isSlotAvailable(CampaignName)) {
    const query2 = `SELECT phone, dataid, cdate, id, recall_type, skill 
                    FROM ${GalaxyClientDB}.recall 
                    WHERE data_flag=1 AND agent='${USER_ID}' AND campaign='${CampaignName}' 
                    AND recall_type<>'wta' AND cdate <= '${tempDate}' 
                    AND client_id='${ClientID}' AND csm_id='${CurrentSlotID}' 
                    ORDER BY parent_priority, priority, cdate ASC`;

    rsRecall = await SelectQuery(query2);
  } else {
    const query3 = `SELECT phone, dataid, cdate, id, recall_type, skill 
                    FROM ${GalaxyClientDB}.recall 
                    WHERE data_flag=1 AND agent='${USER_ID}' AND campaign='${CampaignName}' 
                    AND recall_type<>'wta' AND cdate <= '${tempDate}' 
                    AND client_id='${ClientID}' 
                    ORDER BY parent_priority, priority, cdate ASC`;

    rsRecall = await SelectQuery(query3);
  }

  CallBackNotification = "";

  if (rsRecall.length > 0) {
    const recall = rsRecall[0];
    Agent.lblRecallCount = rsRecall.length;
    Agent.lblRecallTime = recall.cdate.toISOString().slice(11, 19);
    Agent.lblRecallTimeToolTip = recall.cdate.toISOString().replace('T', ' ').slice(0, 19);

    if (!isDisplayPhone) {
      Agent.lblRecallPhone = maskNumber(recall.phone);
    } else {
      Agent.lblRecallPhone = recall.phone;
    }

    if (recall.cdate < GetDBTime) {
      CallBackNotification = `Over Due Callback : ${Agent.lblRecallPhone} AT ${recall.cdate.toISOString().replace('T', ' ').slice(0, 19)}`;
      TrayBalloonRecall(Agent.pbTray, "Callback Overdue", `Over Due Callback : ${Agent.lblRecallPhone} AT ${recall.cdate.toISOString().replace('T', ' ').slice(0, 19)}`, 3, recall.id);
    } else {
      CallBackNotification = `You Have New Callback : ${Agent.lblRecallPhone} AT ${recall.cdate.toISOString().slice(11, 19)}`;
      if (LastRecallAlertId !== recall.id) {
        TrayBalloonRecall(Agent.pbTray, "Callback Pre Notification", `You Have New Callback : ${Agent.lblRecallPhone}`, 2, recall.id);
        LastRecallAlertId = recall.id;
      }
    }
    showMdiMsg(LastAlertMsg);

    if (recall.cdate <= ServerTimeStamp) {
      if (!ValidateDialTime) {
        showMdiMsg("Campaign Schedule Not In Time...!");
        return;
      }
      if (Max_Call_Campaign < 1) {
        showMdiMsg("No Channel Found...!");
        return;
      }
      CallBack_Auto = 1;

      const strCBType = recall.recall_type.toUpperCase();
      switch (strCBType) {
        case "CBU":
          CallBack_Auto = CBUDialing;
          break;
        case "CBI":
          CallBack_Auto = CBIDialing;
          break;
        case "CBS":
          CallBack_Auto = CBSDialing;
          break;
        case "CBQ":
          CallBack_Auto = CBQDialing;
          break;
        case "CBA":
          CallBack_Auto = CBADialing;
          break;
        case "CBE":
          CallBack_Auto = CBEDialing;
          break;
      }

      if (CallBack_Auto === 1) {
        if (UserMode.toUpperCase() !== "CALLBACK") {
          LastModeIndexBeforeRecall = UserModeIndex;
          LastModeBeforeRecall = UserMode;
          NextUserMode = "CALLBACK";
          NextUserModeIndex = 3;

          if (!WaitingDisposition) {
            await Agent.SaveNextUserMode();
            Recall_ID = recall.id;
            Recall_DataID = recall.dataid;
            await Agent.DialRecall(recall.phone.replace(/-/g, ""), recall.skill);
          }
        } else {
          if (!WaitingDisposition && !Agent.GDN.isLineBusy(0)) {
            Recall_ID = recall.id;
            Recall_DataID = recall.dataid;
            await Agent.DialRecall(recall.phone.replace(/-/g, ""), recall.skill);
          }
        }
      }
    }
  } else {
    showMdiMsg(LastAlertMsg);

    await InsertQuery("START TRANSACTION");
    await InsertQuery("BEGIN");

    if (Campaign_Type === "SR") {
      let strSkill = "";
      for (let i = 0; i < 24; i++) {
        if (UserSkill[i].length > 0 && UserSkill[i].includes("~")) {
          const s = UserSkill[i].split("~");
          strSkill += `'${s[0]}',`;
        }
      }
      if (strSkill.length > 0) {
        strSkill = strSkill.slice(0, -1);
      }
    }

    const intcsm = CurrentSlotID;

    if (strSkill.length > 0) {
      await InsertQuery(`UPDATE ${GalaxyClientDB}.recall SET update_by_user='${USER_ID}', update_by_ip='${MYIP}', agent='${USER_ID}', calltype='${CALL_TYPE}' 
                         WHERE client_id='${ClientID}' AND data_flag=1 AND agent='' AND campaign='${CampaignName}' 
                         AND cdate <= '${tempDate}' AND csm_id='${intcsm}' AND skill IN (${strSkill}) AND skill<>'' 
                         ORDER BY parent_priority, priority, cdate ASC LIMIT 1`);
    } else {
      await InsertQuery(`UPDATE ${GalaxyClientDB}.recall SET update_by_user='${USER_ID}', update_by_ip='${MYIP}', agent='${USER_ID}', calltype='${CALL_TYPE}' 
                         WHERE client_id='${ClientID}' AND data_flag=1 AND agent='' AND campaign='${CampaignName}' 
                         AND cdate <= '${tempDate}' AND csm_id='${intcsm}' 
                         ORDER BY parent_priority, priority, cdate ASC LIMIT 1`);
    }

    await InsertQuery("COMMIT");

    Agent.lblRecallCount = "0";
    Agent.lblRecallTime = "-";
    Agent.lblRecallPhone = "-";

    if (UserMode.toUpperCase() === "CALLBACK" && LastModeBeforeRecall.length > 0) {
      if (!WaitingDisposition) {
        NextUserMode = LastModeBeforeRecall;
        NextUserModeIndex = LastModeIndexBeforeRecall;
        await Agent.SaveNextUserMode();
        LastModeIndexBeforeRecall = 0;
        LastModeBeforeRecall = "";
      }
    }
  }
};

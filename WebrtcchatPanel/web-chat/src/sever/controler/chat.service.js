const { raw } = require("mysql")
const Group = require("../moddle/group");
const User = require("../moddle/User");
const Message = require("../moddle/Message");
const GroupMembers = require("../moddle/group.member");
const { BaseHttpResponse, ERROR_CODE } = require("../utills/error");
const { emitToUser } = require("../socket/socket.io");
const { EVENT_NAME } = require("../socket/socket.event");
const Webrtc_Message = require("../moddle/campaign/message");
const { Op } = require('sequelize');
const { rows } = require("mssql");
const Campaign = require("../moddle/campaign/campaign");
const CampaignMember = require("../moddle/campaign/campaign.member");
const Webrtc_user = require("../moddle/campaign/user");
const  app  = require("../../../app");
const { isUserOnline } = require("../utills/socket.user");

exports.fetchGroupById = async (groupId) => {
    const group = await Group.findOne({
        where: { groupId: groupId },
        raw: true
    })
    return group;
}
exports.createGroup = async (groupId, groupName) => {
    const group = await Group.create({
        groupId: groupId,
        name: groupName
    })
    return group;
}
exports.createGroupMember = async (groupId, member) => {
    member['firstName']=member.name;
    User.findOrCreate({
        where: { id: member.user_id },
        defaults: member,
    })
    const group = await GroupMembers.create({
        groupId:groupId,
        memberId: member.user_id
    })
    return group;
}
exports.getGroupMember = async (groupId) => {
    const group = await GroupMembers.findAll({
        where:{groupId:groupId},
        raw:true,
    })
    return group;
}
exports.getUserByUserId = async (user_id) => {
    const group = await User.findOne({
        where:{user_id:user_id},
        raw:true,
    })
    return group;
}
exports.createUser = async (data) => {
    const group = await User.create(data)
    return group;
}


exports.getMsg = async (senderId, receiverId, campaignId, pageNumber = 1, pageSize = 10, isGroupMsg) => {
    const offset = (pageNumber - 1) * pageSize; // Calculate offset
    console.log("pageNumber", pageNumber, "pageSize", pageSize);

    const messageConditions = isGroupMsg
        ? { campaignId } // Filter by campaignId for group messages
        : {
              [Op.or]: [
                  { senderId, receiverId },
                  { senderId: receiverId, receiverId: senderId },
              ],
              campaignId,
          };

    // Fetch messages
    const { count: totalMessages, rows: messages } = await Webrtc_Message.findAndCountAll({
        where: messageConditions,
        order: [['id', 'DESC']], // Order by latest messages
        limit: pageSize, // Number of messages per page
        offset, // Starting point for the current page
    });

    // Sort messages in ascending order (optional)
    messages.sort((m1, m2) => m1.id - m2.id);

    // Update isMsgReceived for matching messages
    const updatedMessages = [];
    for (const message of messages) {
        if (message.receiverId === senderId) {
            message.isMsgReceived = true;
            await Webrtc_Message.update(
                { isMsgReceived: true },
                { where: { id: message.id } } // Update by message ID
            );
            updatedMessages.push({ ...message.dataValues, isMsgReceived: true });
        } else {
            updatedMessages.push(message.dataValues);
        }
    }

    // Return total messages and updated messages
    return { totalMessages, messages: updatedMessages };
};


exports.sendMessage=async(socket, body)=>{
    let bodyJson={
        senderId: socket.data.id,
        receiverId: Number(body.receiverId),
        campaignId:  Number(body.campaignId),
        campaignName:  body.campaignName,
        timestamp: body.timestamp,
        isGroupMsg: body.type==='group',
        msgText: body.msgText,
        localMessageId: body.localMessageId
    }
    // console.log("enter data in msg",body);
    const messages = await Webrtc_Message.create(bodyJson);
    if (!messages) {
        return BaseHttpResponse([],null, ERROR_CODE.OK)
    }
    // console.log("this is message array",messages);
    const userData = await Webrtc_user.findOne({    
        where: { id: bodyJson.receiverId},
        raw: true,
    });
    console.log("recieved Msg from ",bodyJson.receiverId,'to',socket.data.id)
    if (userData.currentloginCampaignId==bodyJson.campaignId) {
        emitToUser(socket.server, bodyJson.receiverId, 'receiveMsg', messages);     
    }
    
    return BaseHttpResponse(messages.dataValues,null, ERROR_CODE.OK)
    
}
    exports.sendNotification = async (socket, body) => {
        try {
            console.log("thi sis the notification body",body,typeof(body.campaignId));
            // Fetch campaign members except the sender and check if users are online
            let camMemberlist = await CampaignMember.findAll({
                where: { campaignId: body.campaignId },
                raw: true,
            });
            // console.log("isUserOnline",isUserOnline);
            camMemberlist = await Promise.all(
                camMemberlist
                    .filter(e => e.memberId != socket.data.id && isUserOnline(Number(e.memberId))) // Exclude sender and check online status
                    .map(async e => {
                        try {
                            // Fetch user data if online
                            const userData = await Webrtc_user.findOne({    
                                where: { id: e.memberId ,currentloginCampaignId: body.campaignId},
                                raw: true,
                            });
            
                            if (!userData) {
                                console.warn(`User data not found for memberId ${e.memberId}`);
                                return null; // Skip if user data not found
                            }
                            // Count unseen messages for each member
                            const { count } = await Webrtc_Message.findAndCountAll({
                                where: {
                                    senderId: e.memberId,
                                    receiverId: socket.data.id, 
                                    campaignId: e.campaignId,
                                    isMsgReceived: false,
                                },
                                raw: true,
                            });
                            
                            return { ...userData, unSeenMsg: count }; // Add unseen messages to user data
                        } catch (error) {
                            console.error(`Error processing memberId ${e.memberId}:`, error);
                            return null; // Handle errors gracefully
                        }
                    })
            );
            
            // Filter out null values
            camMemberlist = camMemberlist.filter(Boolean);
            

            // Sorting members - sender's message first if needed
            camMemberlist.sort((a, b) => a.id === body.senderId ? -1 : 1);

            console.log("Message notification camMemberlist:", camMemberlist);

            // Emit the message to the receiver
            // emitToUser(socket.server, body.receiverId, 'receiveMsg', camMemberlist);

            return BaseHttpResponse(camMemberlist, null, ERROR_CODE.OK);
        } catch (error) {
            console.error("Error in sendNotification:", error);
            return BaseHttpResponse(null, { message: error.message }, ERROR_CODE.FAILED);
        }
    };
    exports.newUserConnected = async (socket, body) => {
        try {
            // Fetch campaign members except the sender and check if users are online
            let camMemberlist = await CampaignMember.findAll({
                where: { campaignId: body.id },
                raw: true,
            });
            // console.log("ewUser connected member list: ", camMemberlist);
            camMemberlist = await Promise.all(
                camMemberlist
                    .filter(e =>e.memberId != socket.data.id && isUserOnline(Number(e.memberId))) // Exclude the sender and check online status
                    .map(async e => {
                        try {
                            // Fetch user data
                            const userData = await Webrtc_user.findOne({ where: { id: e.memberId,currentloginCampaignId:body.id }, raw: true });
                            return { ...userData }; // Add unseen messages to user data
                        } catch (error) {
                            console.error(`Error processing memberId ${e.memberId}:`, error);
                            return null; // Handle errors gracefully
                        }
                    })
            );

       

            camMemberlist = camMemberlist.filter(data => data !== null && Object.keys(data).length > 0);
            console.log("Message notification camMemberlist:", camMemberlist);
            // Emit the message to the receiver
            if (camMemberlist.length>0) {
                for(let a of camMemberlist){
                    emitToUser(socket.server, a.id, 'newMemberOnline', camMemberlist);
                }
            }
                return BaseHttpResponse(camMemberlist, null, ERROR_CODE.OK);
            

        } catch (error) {
            console.error("Error in sendNotification:", error);
            return BaseHttpResponse(null, { message: error.message }, ERROR_CODE.FAILED);
        }
    };

    exports.msgReceived = async (socket,body)=>{
        try {
            let getMsg= await Webrtc_Message.findByPk(body.id);
            getMsg.isMsgReceived=true;
            getMsg.save();
            return getMsg;
            
        } catch (error) {
            return BaseHttpResponse(null,`error while updating isMsgReceived error id:${error}`)
        }

    }



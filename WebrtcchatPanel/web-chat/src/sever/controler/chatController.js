// import { User } from "database/entity/user";

const { generateToken, generateTokenWebRtc } = require('../middleware/authmiddleware');
const User = require('../moddle/User');
const Campaign = require('../moddle/campaign/campaign');
const CampaignMember = require('../moddle/campaign/campaign.member');
const Webrtc_Message = require('../moddle/campaign/message');
const Webrtc_user = require('../moddle/campaign/user');
const Group = require('../moddle/group');
const GroupMembers = require('../moddle/group.member');
const { emitInSocketRoom, emitToUser } = require('../socket/socket.io');
const { BaseHttpResponse, ERROR_CODE, failedResponse } = require('../utills/error');
const { isUserOnline } = require('../utills/socket.user');
const { loginToChatAppValidater, getMsgValidator, sendMessageValidator, sendNotification, newUserConnected } = require('../utills/valifdation');
const ChatService = require('./chat.service');
// import { Request, Response } from 'express';
// import {
//     checkMsgIsReceived,
//     createGroupValidator,
//     deleteGroupValidator,
//     getMsgValidator,
//     getPersonalMsgsValidator,
//     sendGroupMessageValidator,
//     sendPersonalMessageValidator,
//     updateUserData,
//     userAddInGroup,
// } from "./chat.validator";
// import { BaseHttpResponse, ERROR_CODE } from "utils/error";

const chatService = ChatService;

exports.ping = async (socket, data, cb) => {
    console.log("thisis data",data);
    // const receiverId=Number(data.receiverId)
    // Emit the 'ping' event to the user associated with the socket
    // emitToUser(socket.server, receiverId, 'receiveMessage', data.message);
    cb ({ time: Date.now() })
};

exports.getUser = async (req, res) => {
  
    let userData= await User.findByPk(req.params.id)
    const token = await generateToken(userData.dataValues);
    let receverdata= await User.findByPk(req.query.receiverId)
    res.render('index',{token:token.access_token,userData:userData,receverdata:receverdata.dataValues});
};
exports.loginToChatApp = async (req, res) => {
    try {
        // Validate input
        req.body=DemoData;
        let body = req.body;
        const { error } = loginToChatAppValidater.validate(req.body);
        if (error) {
            return res.status(ERROR_CODE.FAILED).json(
                failedResponse(error.message, ERROR_CODE.FAILED)
            );
        }

        const { ContectUserList = [], GroupList = [] } = req.body;

        // Fetch or create the user
        const userData = await User.findOrCreate({
            where: { id: req.user.user_id },
            defaults: req.user,
        }).then(([user]) => user);

        // Process contact users
        if (ContectUserList.length > 0) {
            const contactPromises = ContectUserList.map(async (user) => {
                const existingUser = await chatService.getUserByUserId(user.user_id);
                if (!existingUser) return chatService.createUser(user);
            });
            await Promise.all(contactPromises);
        }

        // Process groups and members
        if (GroupList.length > 0) {
            const groupPromises = GroupList.map(async (group) => {
                const groupId = group.groupId;
                const groupName = group.groupName;

                // Fetch existing group and members
                const [groupData, groupMembers] = await Promise.all([
                    chatService.fetchGroupById(groupId),
                    chatService.getGroupMember(groupId),
                ]);

                // Create group if it doesn't exist
                if (!groupData) {
                    await chatService.createGroup(groupId, groupName);
                }

                // Prepare a Set of existing members in this group
                const existingMemberIds = new Set(
                    groupMembers.map((member) => Number(member.memberId))
                );

                // Filter new members to avoid duplicates
                const newMembers = group.memberList.filter(
                    (member) => !existingMemberIds.has(member.user_id)
                );

                if (newMembers.length > 0) {
                    const memberPromises = newMembers.map((member) =>
                        chatService.createGroupMember(groupId, member)
                    );
                    await Promise.all(memberPromises);
                }
            });

            await Promise.all(groupPromises);
        }

        // Render response
        return res.render('index', {
            token: body.token,
            userData: userData,
            ContectUserList: body.ContectUserList,
            GroupList: body?.GroupList,
        });
    } catch (error) {
        console.error('Error in loginToChatApp:', error);
        return res.status(ERROR_CODE.EXCEPTION).json(
            failedResponse('An error occurred', ERROR_CODE.EXCEPTION)
        );
    }
};
exports.generateToken = async (req, res) => {
    try {
        // Validate input
        console.log("enter in generate token");
        let body = req.body;
        let token=await generateToken(body)
        // Render response
        return res.status(ERROR_CODE.OK).json({token: token});
    } catch (error) {
        console.error('Error in loginToChatApp:', error);
        return res.status(ERROR_CODE.EXCEPTION).json(
            failedResponse('An error occurred', ERROR_CODE.EXCEPTION)
        );
    }
};
exports.loadChatHistory = async (socket, body, cb) => {
        const validate = getMsgValidator.validate(body || {});
        if (validate.error) {
            console.log("error in loadChatHIstory event ",validate.error.message);
            return cb(BaseHttpResponse(null,validate.error.message, ERROR_CODE.FAILED));
        }
        const user = socket.data;
        const pageNumber = validate.value.page ? Number(validate.value.page) : null;
        const pageSize = validate.value.pageSize ? Number(validate.value.pageSize) : null;
        const isGroupMsg=validate.value.type=='group';
        const receiverId= validate.value.receiverId;
        const campaignId= validate.value.campaignId;
        const resp = await chatService.getMsg(user.id,receiverId, campaignId,pageNumber, pageSize,isGroupMsg);
        cb(BaseHttpResponse(resp,null, ERROR_CODE.OK));
    };

exports.sendMessage = async (socket, body, cb) => {
    const validate = sendMessageValidator.validate(body);
    if (validate.error) {
        return cb(BaseHttpResponse(null,validate.error.message, ERROR_CODE.FAILED));
    }
    const resp = await chatService.sendMessage(socket, validate.value);
    cb(resp);
};
//<---------------------- webrtc -------------------------------------------------->
exports.generateTokenwebrtc = async (req, res) => {
    try {
        // Validate input
        console.log("Headers:", req.headers);
        console.log("Body:", req.body); // Log body here
        console.log("Method:", req.method);
        let body = req.body;
        console.log("thi sis body",body);
        let token=await generateTokenWebRtc(body)
        // Render response
        return res.status(ERROR_CODE.OK).json({token: token});
    } catch (error) {
        console.error('Error in loginToChatApp:', error);
        return res.status(ERROR_CODE.EXCEPTION).json(
            failedResponse('An error occurred', ERROR_CODE.EXCEPTION)
        );
    }
};
exports.getIntoChatApp = async (req, res) => {
    try {
        // Validate required parameters
        console.log("login to chat app");
        const { loginId, campaignName, clientId } = req.query;
        const user = req.user;
        if (!loginId || !user || !campaignName || !clientId) {
            return res.status(ERROR_CODE.FAILED).json(
                BaseHttpResponse(
                    null,
                    `Missing required parameters: loginId=${loginId}, user=${user?.name}, campaignName=${campaignName}, clientId=${clientId}`
                )
            );
        }

        // Create campaign and user asynchronously
        const campaignData = await Campaign.findOrCreate({
            where: { name: campaignName ,clientId:Number(clientId)},
            defaults: {
                name: campaignName,
                clientId: Number(clientId),
                created_by: user.user_id,
            },
            raw: true,
        }).then(([data]) => data);

        // Fetch user data
        const userData1 = await Webrtc_user.findOrCreate({
            where: { user_id: user.user_id },
            defaults: { ...user },
            raw: true,
        }).then(([data]) => data);
        
        if (userData1.currentloginCampaignId != campaignData.id) {
            await Webrtc_user.update(
                { currentloginCampaignId: campaignData.id },
                { where: { user_id: user.user_id } }
            ); // Save the updated value to the database
        }
        // Register campaign member
        const [registerInCamMember] = await CampaignMember.findOrCreate({
            where: { memberId: userData1.id , campaignId:campaignData.id},
            defaults: {
                campaignId: campaignData.id,
                memberId: userData1.id,
            },
            raw: true,
        });

        // Fetch campaign member data
        const CampaignMemberList = await CampaignMember.findAll({
            where: { campaignId: campaignData.id },
            raw: true,
        });
        console.log("contact list", CampaignMemberList);

        // Using async/await with Promise.all and flatMap to handle async data
        const memberData = CampaignMemberList.length > 0
            ? await Promise.all(CampaignMemberList
                .filter(e => e.memberId != userData1.id &&  isUserOnline(Number(e.memberId))) // Exclude the current user
                .map(async e => {
                    try {
                        const userData = await Webrtc_user.findOne({ where: { id: e.memberId,currentloginCampaignId:campaignData.id }, raw: true });
                        if(!userData){
                            return null
                        }
                        const {count,rows} = await Webrtc_Message.findAndCountAll({where:{senderId:userData.id,receiverId: userData1.id , campaignId: e.campaignId ,isMsgReceived:false},raw : true})
                        return {...userData, unSeenMsg:count}; // Return user data or undefined if not found
                    } catch (error) {
                        console.error(`Error fetching user with memberId ${e.memberId}:`, error);
                        return null; // Handle error and return null
                    }
                }))
                .then(results => results.filter(Boolean)) // Filter out any undefined results
            : []; // Return empty array if no members exist
        
        console.log(" getinto chat memberData:", memberData);
        console.log("getinto chat campaignData:", campaignData);
        console.log("getinto chat userData:", userData1);
        

        // Final validation
        if (!CampaignMemberList || !registerInCamMember || !campaignData || !userData1) {
            return res
                .status(ERROR_CODE.FAILED)
                .json(BaseHttpResponse(null, "Error creating entry in DB"));
        }

        // Render the view
        return res.render('wecrtc.chat.ejs', {
            token: req.query.token || null,
            userData:userData1,
            campaignData:campaignData,
            ContectUserList: memberData,
            GroupList: [], // Placeholder if groups are to be fetched
        });
    } catch (error) {
        console.error("Error in getIntoChatApp:", error);
        return res
            .status(ERROR_CODE.SERVER_ERROR)
            .json(BaseHttpResponse(null, "Internal server error"));
    }
};



exports.sendNotification = async (socket, body, cb) => {
    const validate = sendNotification.validate(body.msg);
    if (validate.error) {
        console.error("Validation Error Details:", validate.error.details);
        console.log("Received Body:", body);
        return cb(BaseHttpResponse(null, { message: validate.error.message, body: body }, ERROR_CODE.FAILED));
    }
    const resp = await chatService.sendNotification(socket, validate.value);
    cb(resp);
};
exports.newUserConnected = async (socket, body, cb) => {
    body.campaignData.isDeleted=body.campaignData.isDeleted?0:1
    const validate = newUserConnected.validate(body.campaignData);
    if (validate.error) {
        console.error("Validation Error Details:", validate.error.details);
        console.log("Received Body:", body);
        return cb(BaseHttpResponse(null, { message: validate.error.message, body: body }, ERROR_CODE.FAILED));
    }
    const resp = await chatService.newUserConnected(socket, validate.value);
    cb(resp);
};


exports.fetchOnlineUser = async (socket, body,cb) => {
    try {
        // Validate required parameters
        const user = socket.data.dataValues;
        if (!user || !body.campaignData ) {
            return cb(
                BaseHttpResponse(
                    null,
                    `Missing required parameters:  user=${user?.name}, campaignName=${body.campaignName}`,
                    ERROR_CODE.FAILED

                )
            );
        }

        // Fetch campaign member data
        const CampaignMemberList = await CampaignMember.findAll({
            where: { campaignId: body.campaignData.id },
            raw: true,
        });
        console.log("contact list", CampaignMemberList);

        // Using async/await with Promise.all and flatMap to handle async data
        let memberData = [];

if (CampaignMemberList.length > 0) {
    try {
        const filteredMembers = CampaignMemberList.filter(
            e => e.memberId != user.id && isUserOnline(Number(e.memberId))
        );

        memberData = await Promise.all(
            filteredMembers.map(async e => {
                try {
                    const userData = await Webrtc_user.findOne({
                        where: { id: e.memberId, currentloginCampaignId:body.campaignData.id },
                        raw: true,
                    });

                    const { count } = await Webrtc_Message.findAndCountAll({
                        where: {
                            senderId: e.id,
                            receiverId: user.id,
                            campaignId: e.campaignId,
                            isMsgReceived: false,
                        },
                        raw: true,
                    });

                    return userData ? { ...userData, unSeenMsg: count } : null;
                } catch (error) {
                    console.error(`Error fetching data for memberId ${e.memberId}:`, error);
                    return null;
                }
            })
        );

        // Filter out any null values in the final result
        // memberData = memberData.filter(Boolean);
    } catch (error) {
        console.error("Error processing CampaignMemberList:", error);
    }
} else {
    memberData = [];
}

        
        console.log("memberData:", memberData);
        console.log("campaignData:", body.campaignData);
        console.log("userData:", user);
        if (!CampaignMemberList || !body.campaignData ) {
            return cb(BaseHttpResponse(null, "Error creating entry in DB", ERROR_CODE.FAILED));
        }

        // Render the view
        cb( BaseHttpResponse(memberData, null, ERROR_CODE.OK))
    } catch (error) {
        console.error("Error in getIntoChatApp:", error);
        cb(BaseHttpResponse(null, error, ERROR_CODE.FAILED));
    }
};

exports.msgReceived=async (socket, body,cb)=>{
    if (!body.data) {
        cb(BaseHttpResponse(null, "in msgReceived event msg body not recived", ERROR_CODE.FAILED));
    }
    let resp=await chatService.msgReceived(socket,body.data)
    cb(BaseHttpResponse(resp, null, ERROR_CODE.OK));
}

exports.getMsg = async (req,res) => {
    console.log("Msg recevide from db",req.body);
    // if (validate.error) {
    //     console.error("Validation Error Details:", validate.error.details);
    //     console.log("Received Body:", body);
    //     return cb(BaseHttpResponse(null, { message: validate.error.message, body: body }, ERROR_CODE.FAILED));
    // }
    // const resp = await chatService.sendNotification(socket, validate.value);
    // cb(resp);
    return res.status(200).json(req.body);
};
// exports.sendPersonalMsg = async (socket, body, cb) => {
//     // const validate = sendPersonalMessageValidator.validate(body);
//     // if (validate.error) {
//     //     return cb(BaseHttpResponse.failed(validate.error.message, ERROR_CODE.FAILED));
//     // }
//     const resp = await chatService.sendPersonalMessage(socket, validate.value);
//     cb(resp);
// };

// export const sendGroupMessage = async (socket, body, cb) => {
//     const validate = sendGroupMessageValidator.validate(body);
//     if (validate.error) {
//         return cb(BaseHttpResponse.failed(validate.error.message, ERROR_CODE.FAILED));
//     }
//     const resp = await chatService.sendGroupMessage(socket, validate.value);
//     cb(resp);
// };

// export const checkMsgIsReceivedHandler = async (socket, body, cb) => {
//     const validate = checkMsgIsReceived.validate(body);
//     if (validate.error) {
//         return cb(BaseHttpResponse.failed(validate.error.message, ERROR_CODE.FAILED));
//     }
//     const msgId = validate.value.msgId;
//     const resp = await chatService.checkMsgIsReceived(socket, msgId);
//     cb(resp);
// };

// export const getMsgs = async (socket, body, cb) => {
//     const validate = getMsgValidator.validate(body || {});
//     if (validate.error) {
//         return cb(BaseHttpResponse.failed(validate.error.message, ERROR_CODE.FAILED));
//     }
//     const user = socket.data;
//     const pageNumber = validate.value.pageNumber ? Number(validate.value.pageNumber) : null;
//     const pageSize = validate.value.pageSize ? Number(validate.value.pageSize) : null;
//     const msgId = validate.value.messageId;
//     const resp = await chatService.getMsgs(user.userId, pageNumber, pageSize, msgId);
//     cb(resp);
// };

// exports.getPersonalMsgs = async (socket, body, cb) => {
//     const validate = getPersonalMsgsValidator.validate(body || {});
//     if (validate.error) {
//         return cb(BaseHttpResponse.failed(validate.error.message, ERROR_CODE.FAILED));
//     }
//     const user = socket.data;
//     const pageNumber = validate.value.pageNumber ? Number(validate.value.pageNumber) : null;
//     const pageSize = validate.value.pageSize ? Number(validate.value.pageSize) : null;
//     const msgId = validate.value.messageId;
//     const receiverId = validate.value.receiverId;
//     const resp = await chatService.getPersonalMsgs(user.userId, pageNumber, pageSize, receiverId, msgId);
//     cb(resp);
// };

// export const uploadAttachment = async (req, res) => {
//     const resp = await chatService.uploadImage(req.file);
//     res.json(resp);
// };

// export const createGroup = async (req, res) => {
//     const validate = createGroupValidator.validate(req.body);
//     if (validate.error) {
//         return res.json(BaseHttpResponse.failed(validate.error.message, ERROR_CODE.FAILED));
//     }
//     const resp = await chatService.createGroup(validate.value);
//     return res.json(resp);
// };

// export const deleteGroup = async (req, res) => {
//     const validate = deleteGroupValidator.validate(req.body);
//     if (validate.error) {
//         return res.json(BaseHttpResponse.failed(validate.error.message, ERROR_CODE.FAILED));
//     }
//     const resp = await chatService.deleteGroup(validate.value);
//     return res.json(resp);
// };

// export const userAddInGroupHandler = async (req, res) => {
//     const validate = userAddInGroup.validate(req.body);
//     if (validate.error) {
//         return res.json(BaseHttpResponse.failed(validate.error.message, ERROR_CODE.FAILED));
//     }
//     const resp = await chatService.userAddInGroup(validate.value);
//     return res.json(resp);
// };

// export const userDeleteInGroupHandler = async (req, res) => {
//     const validate = userAddInGroup.validate(req.body);
//     if (validate.error) {
//         return res.json(BaseHttpResponse.failed(validate.error.message, ERROR_CODE.FAILED));
//     }
//     const resp = await chatService.userDeleteInGroup(validate.value);
//     return res.json(resp);
// };

// export const updateUserDataHandler = async (req, res) => {
//     const validate = updateUserData.validate(req.body);
//     if (validate.error) {
//         return res.json(BaseHttpResponse.failed(validate.error.message, ERROR_CODE.FAILED));
//     }
//     const userId = validate.value.userId;
//     const resp = await chatService.updateUserData(userId);
//     return res.json(resp);
// };

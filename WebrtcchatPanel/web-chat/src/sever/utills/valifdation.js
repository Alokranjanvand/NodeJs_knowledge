const Joi = require('joi');

exports.loginToChatAppValidater = Joi.object({
    token: Joi.string().required().messages({
      'string.base': `"Token" should be a type of string`,
      'any.required': `"Token" is required`
    }),
  
    GroupRoomId: Joi.object({
      GroupChat: Joi.string().required().messages({
        'string.base': `"GroupChat" should be a type of string`,
        'any.required': `"GroupChat" is required`,
      }),
      OneToOneChat: Joi.string().required().messages({
        'string.base': `"OneToOneChat" should be a type of string`,
        'any.required': `"OneToOneChat" is required`,
      }),
    }).required().messages({
      'object.base': `"GroupRoomId" should be an object`,
      'any.required': `"GroupRoomId" is required`,
    }),
  
    ContectUserList: Joi.array()
      .items(
        Joi.object({
          user_id: Joi.number().integer().required().messages({
            'number.base': `"user_id" should be a number`,
            'any.required': `"user_id" is required`,
          }),
          name: Joi.string().required().messages({
            'string.base': `"name" should be a type of string`,
            'any.required': `"name" is required`,
          }),
          mobile: Joi.string()
            .pattern(/^\d{10}$/)
            .required()
            .messages({
              'string.base': `"mobile" should be a type of string`,
              'string.pattern.base': `"mobile" must be a valid 10-digit number`,
              'any.required': `"mobile" is required`,
            }),
        })
      )
      .required()
      .messages({
        'array.base': `"ContectUserList" should be an array`,
        'any.required': `"ContectUserList" is required`,
      }),
  
    GroupList: Joi.array()
      .items(
        Joi.object({
          groupId: Joi.number().integer().required().messages({
            'number.base': `"groupId" should be a number`,
            'any.required': `"groupId" is required`,
          }),
          groupName: Joi.string().required().messages({
            'string.base': `"groupName" should be a type of string`,
            'any.required': `"groupName" is required`,
          }),
          memberList: Joi.array()
            .items(
              Joi.object({
                user_id: Joi.number().integer().required().messages({
                  'number.base': `"user_id" should be a number`,
                  'any.required': `"user_id" is required`,
                }),
                name: Joi.string().required().messages({
                  'string.base': `"name" should be a type of string`,
                  'any.required': `"name" is required`,
                }),
                mobile: Joi.string()
                  .pattern(/^\d{10}$/)
                  .required()
                  .messages({
                    'string.base': `"mobile" should be a type of string`,
                    'string.pattern.base': `"mobile" must be a valid 10-digit number`,
                    'any.required': `"mobile" is required`,
                  }),
              })
            )
            .required()
            .messages({
              'array.base': `"memberList" should be an array`,
              'any.required': `"memberList" is required`,
            }),
        })
      )
      .required()
      .messages({
        'array.base': `"GroupList" should be an array`,
        'any.required': `"GroupList" is required`,
      }),
  });
  
  exports.getMsgValidator = Joi.object({
    receiverId: Joi.number().required(),
    campaignId:Joi.number().required(),
    type: Joi.string().required(),
    page: Joi.number().optional(),
    pageSize: Joi.number().optional(),
    messageId: Joi.string().optional()
});

exports.sendMessageValidator = Joi.object({
  receiverId: Joi.string().required(),
  receiverName: Joi.string().optional(),
  campaignId: Joi.string().optional(),
  campaignName: Joi.string().optional(),
  type: Joi.string().required(),
  msgText: Joi.string().required(),
  localMessageId:Joi.string().required(),
  timestamp:  Joi.string().required()
});
exports.sendNotification = Joi.object({
  id: Joi.number().required(), 
  senderId: Joi.number().required(), 
  receiverId: Joi.number().required(), 
  campaignId: Joi.number().optional(), 
  campaignName: Joi.string().optional(), 
  timestamp: Joi.string().required(), 
  isGroupMsg: Joi.boolean().required(),
  msgText: Joi.string().required(),
  localMessageId: Joi.string().required() ,
  isMsgReceived: Joi.boolean().required(), 
});

exports.newUserConnected = Joi.object({
  id: Joi.number().required(),
  clientId: Joi.number().required(), // Add clientId validation
  createdOn: Joi.string().required(),
  created_by: Joi.number().optional(),
  isDeleted: Joi.number().optional(),
  name: Joi.string().optional(),
  // Add any other fields relevant to your use case
});
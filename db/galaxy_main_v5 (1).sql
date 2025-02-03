-- Adminer 4.2.4 MySQL dump

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

DROP TABLE IF EXISTS `activity_master`;
CREATE TABLE `activity_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `activity_name` varchar(50) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_campaign_activity_map`;
CREATE TABLE `agent_campaign_activity_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `activity_name` varchar(50) NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(50) NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_campaign_call_forward`;
CREATE TABLE `agent_campaign_call_forward` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `campaign_id` varchar(20) NOT NULL,
  `mobile_no` varchar(15) NOT NULL,
  `client_id` int(5) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id_campaign_id_client_id` (`user_id`,`campaign_id`,`client_id`),
  KEY `user_id` (`user_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_campaign_disposition_map`;
CREATE TABLE `agent_campaign_disposition_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(50) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `disposition` varchar(255) NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `client_id` int(11) NOT NULL,
  `is_fwd` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0: Processing 1: Forwarding',
  `isFwded` tinyint(1) NOT NULL COMMENT '0: Processing 1: Forwarding',
  PRIMARY KEY (`id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_campaign_skill_map`;
CREATE TABLE `agent_campaign_skill_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `campaign` varchar(50) NOT NULL,
  `skill` varchar(50) NOT NULL,
  `priority` int(3) NOT NULL DEFAULT '100',
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_campaign_voip_perfix_map`;
CREATE TABLE `agent_campaign_voip_perfix_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(50) NOT NULL,
  `agent` varchar(50) NOT NULL,
  `voip` varchar(20) NOT NULL,
  `prefix` int(11) NOT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `campaign_agent_voip_client_id` (`campaign`,`agent`,`voip`,`client_id`),
  KEY `campaign` (`campaign`),
  KEY `voip` (`voip`),
  KEY `agent` (`agent`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_campaign_whatsapp_map`;
CREATE TABLE `agent_campaign_whatsapp_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(50) NOT NULL,
  `agent` varchar(50) NOT NULL,
  `whatsapp_number` varchar(20) NOT NULL,
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `campaign` (`campaign`),
  KEY `agent` (`agent`),
  KEY `whatsapp_number` (`whatsapp_number`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_crm_field_map`;
CREATE TABLE `agent_crm_field_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(50) NOT NULL,
  `dfid` int(11) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  `client_id` int(5) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_deviceid_simid_map`;
CREATE TABLE `agent_deviceid_simid_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deviceid` varchar(25) NOT NULL,
  `simid` varchar(25) NOT NULL,
  `client_id` int(5) NOT NULL,
  `update_by_user` varchar(25) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL DEFAULT '000.000.000.000',
  `update_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `deviceid` (`deviceid`),
  KEY `simid` (`simid`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_disposition_sms_map`;
CREATE TABLE `agent_disposition_sms_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(30) NOT NULL,
  `disposition_id` varchar(50) NOT NULL,
  `skill` varchar(50) NOT NULL,
  `template_id` int(4) NOT NULL,
  `route_id` int(4) NOT NULL,
  `client_id` int(4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  KEY `disposition_id` (`disposition_id`),
  KEY `template_id` (`template_id`),
  KEY `route_id` (`route_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_disposition_whatsapp_map`;
CREATE TABLE `agent_disposition_whatsapp_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(30) NOT NULL,
  `disposition_id` varchar(50) NOT NULL,
  `skill` varchar(50) NOT NULL,
  `template_id` int(4) NOT NULL,
  `route_id` int(4) NOT NULL,
  `rwta` int(4) NOT NULL DEFAULT '0',
  `client_id` int(4) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  KEY `disposition_id` (`disposition_id`),
  KEY `template_id` (`template_id`),
  KEY `route_id` (`route_id`),
  KEY `client_id` (`client_id`),
  KEY `skill` (`skill`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_license_reason`;
CREATE TABLE `agent_license_reason` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agentid` varchar(30) NOT NULL,
  `attempttime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `reason` varchar(255) NOT NULL,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `agentid` (`agentid`),
  KEY `client_id` (`client_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_notify_lead`;
CREATE TABLE `agent_notify_lead` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent` varchar(50) NOT NULL,
  `campaign` varchar(50) NOT NULL,
  `leadid` varchar(50) NOT NULL,
  `client_id` int(5) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agent_campaign_leadid_client_id` (`agent`,`campaign`,`leadid`,`client_id`),
  KEY `agent` (`agent`),
  KEY `campaign` (`campaign`),
  KEY `leadid` (`leadid`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_preview_filter_sql`;
CREATE TABLE `agent_preview_filter_sql` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent` varchar(50) NOT NULL,
  `campaign` varchar(50) NOT NULL,
  `sql` text NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `agent_campaign_client_id` (`agent`,`campaign`,`client_id`),
  KEY `agent` (`agent`),
  KEY `campaign` (`campaign`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_queue_remove_add`;
CREATE TABLE `agent_queue_remove_add` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(25) NOT NULL,
  `agent` varchar(25) NOT NULL,
  `login_id` int(11) NOT NULL,
  `action_id` int(11) NOT NULL,
  `remove_time` datetime NOT NULL,
  `add_time` datetime NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  KEY `agent` (`agent`),
  KEY `login_id` (`login_id`),
  KEY `action_id` (`action_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_rejected_call_info`;
CREATE TABLE `agent_rejected_call_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent` varchar(50) NOT NULL,
  `campaign` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `rejected_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `recordid` varchar(35) NOT NULL,
  `login_id` int(11) NOT NULL,
  `mode_action_id` int(11) NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_ringnoanswer`;
CREATE TABLE `agent_ringnoanswer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(25) NOT NULL,
  `agent` varchar(25) NOT NULL,
  `callid` varchar(25) NOT NULL,
  `update_time` datetime NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  KEY `agnet` (`agent`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_tree_travel_details`;
CREATE TABLE `agent_tree_travel_details` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `rid` varchar(50) NOT NULL,
  `campaign` varchar(50) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `user` varchar(50) NOT NULL,
  `call_type` varchar(50) NOT NULL,
  `client_id` int(11) NOT NULL,
  `node_id` int(11) NOT NULL,
  `created_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `rid` (`rid`),
  KEY `client_id` (`client_id`),
  KEY `node_id` (`node_id`),
  KEY `created_dt` (`created_dt`),
  KEY `phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `agent_ver`;
CREATE TABLE `agent_ver` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent_ver` varchar(15) NOT NULL,
  `exe_path` varchar(150) NOT NULL,
  `update_date` datetime NOT NULL,
  `update_by` varchar(25) NOT NULL,
  `ivr_path` varchar(150) NOT NULL,
  `client_id` int(5) NOT NULL,
  `agent_exepath` varchar(150) NOT NULL,
  `setup_path` varchar(150) NOT NULL,
  `update_by_ip` varchar(20) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DELIMITER ;;

CREATE TRIGGER `agent_ver_bu` BEFORE UPDATE ON `agent_ver` FOR EACH ROW
BEGIN
CALL log_table_client('update',NEW.update_by,NEW.update_by_ip,'agent_ver','agent_ver',OLD.client_id,OLD.agent_ver,NEW.agent_ver,NEW.client_id);
CALL log_table_client('update',NEW.update_by,NEW.update_by_ip,'agent_ver','exe_path',OLD.client_id,OLD.exe_path,NEW.exe_path,NEW.client_id);
CALL log_table_client('update',NEW.update_by,NEW.update_by_ip,'agent_ver','ivr_path',OLD.client_id,OLD.ivr_path,NEW.ivr_path,NEW.client_id);
CALL log_table_client('update',NEW.update_by,NEW.update_by_ip,'agent_ver','agent_exepath',OLD.client_id,OLD.agent_exepath,NEW.agent_exepath,NEW.client_id);
CALL log_table_client('update',NEW.update_by,NEW.update_by_ip,'agent_ver','setup_path',OLD.client_id,OLD.setup_path,NEW.setup_path,NEW.client_id);
CALL log_table_client('update',NEW.update_by,NEW.update_by_ip,'agent_ver','update_date',OLD.client_id,OLD.update_date,NEW.update_date,NEW.client_id);

END;;

DELIMITER ;

DROP TABLE IF EXISTS `allowed_ips`;
CREATE TABLE `allowed_ips` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `ips` varchar(18) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(18) NOT NULL,
  `updated_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `ips` (`ips`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `als_api_data`;
CREATE TABLE `als_api_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cid` varchar(35) DEFAULT NULL,
  `call_id` varchar(25) DEFAULT NULL,
  `call_duration` varchar(5) DEFAULT '0',
  `rec_link` varchar(250) DEFAULT NULL,
  `call_status` varchar(25) DEFAULT NULL,
  `api1` tinyint(1) DEFAULT '0',
  `api2` tinyint(1) DEFAULT '0',
  `api3` tinyint(1) DEFAULT '0',
  `api1_status` varchar(50) DEFAULT NULL,
  `api2_status` varchar(50) DEFAULT NULL,
  `api3_status` varchar(50) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cid` (`cid`),
  KEY `call_id` (`call_id`),
  KEY `call_status` (`call_status`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `api_campaign_source`;
CREATE TABLE `api_campaign_source` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(50) NOT NULL,
  `source` varchar(50) NOT NULL,
  `client_id` int(4) NOT NULL,
  `priority` int(11) NOT NULL DEFAULT '100',
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `createdon` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `campaign_source_client_id` (`campaign`,`source`,`client_id`),
  KEY `campaign` (`campaign`),
  KEY `source` (`source`),
  KEY `client_id` (`client_id`),
  KEY `priority` (`priority`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `api_crm_field_map`;
CREATE TABLE `api_crm_field_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fcaption` varchar(50) NOT NULL,
  `campaign` varchar(50) NOT NULL,
  `required` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1: required, 0: not required',
  `keyword_name` varchar(50) NOT NULL,
  `overwrite` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1: Overwrite, 0: Don''t Overwrite',
  `client_id` int(4) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fcaption` (`fcaption`),
  KEY `campaign` (`campaign`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `asterisk_feedback_response`;
CREATE TABLE `asterisk_feedback_response` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `ivrinput` varchar(20) NOT NULL,
  `rid` varchar(45) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `rid` (`rid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `attachment_file`;
CREATE TABLE `attachment_file` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` int(5) DEFAULT NULL,
  `file_path` varchar(100) DEFAULT '/var/www/html/attachment/',
  `file_name` varchar(125) DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `template_id` (`template_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `attachment_file_tmp`;
CREATE TABLE `attachment_file_tmp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `agent` varchar(50) NOT NULL,
  `campaign` varchar(30) NOT NULL,
  `name` varchar(255) NOT NULL,
  `attachmentpath` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `bada_reg_check`;
CREATE TABLE `bada_reg_check` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mobile` varchar(50) NOT NULL,
  `flag` int(2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `base_circle_operator`;
CREATE TABLE `base_circle_operator` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `starting_four_digit` int(4) NOT NULL,
  `operator` varchar(50) NOT NULL,
  `circle` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `starting_four_digit` (`starting_four_digit`),
  KEY `operator` (`operator`),
  KEY `circle` (`circle`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `base_rate`;
CREATE TABLE `base_rate` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `prefix` varchar(20) NOT NULL,
  `country` varchar(50) NOT NULL,
  `operator` varchar(30) NOT NULL,
  `rate` varchar(20) NOT NULL DEFAULT '0.0',
  `cust_rate` varchar(20) NOT NULL DEFAULT '0.0',
  `pulse` int(5) NOT NULL DEFAULT '60',
  `voip` varchar(20) NOT NULL,
  `client_id` int(5) NOT NULL,
  `insert_date` datetime NOT NULL,
  `edit_date` datetime NOT NULL,
  `disable_date` datetime NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `prefix` (`prefix`),
  KEY `country` (`country`),
  KEY `operator` (`operator`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `billing_info`;
CREATE TABLE `billing_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_code` int(5) NOT NULL,
  `country` varchar(45) DEFAULT NULL,
  `pulse` varchar(25) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `client_code` (`client_code`),
  KEY `country` (`country`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `blacklist`;
CREATE TABLE `blacklist` (
  `id` double NOT NULL AUTO_INCREMENT,
  `phone` varchar(15) NOT NULL,
  `approved` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone_client_id` (`phone`,`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `blacklist_series`;
CREATE TABLE `blacklist_series` (
  `id` double NOT NULL AUTO_INCREMENT,
  `phone` varchar(3) NOT NULL,
  `approved` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) NOT NULL DEFAULT 'nouser',
  `update_by_ip` varchar(25) NOT NULL DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `phone_client_id` (`phone`,`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `c2c_transfer`;
CREATE TABLE `c2c_transfer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_campaign` varchar(45) DEFAULT NULL,
  `from_skill` varchar(45) DEFAULT NULL,
  `to_campaign` varchar(45) DEFAULT NULL,
  `to_skill` varchar(45) DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `from_campaign` (`from_campaign`),
  KEY `to_campaign` (`to_campaign`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `callback_api_details_iccs`;
CREATE TABLE `callback_api_details_iccs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent_name` varchar(15) NOT NULL,
  `disposition` varchar(35) NOT NULL,
  `call_start_time` datetime NOT NULL,
  `call_helpdesk_start_time` datetime NOT NULL,
  `call_customer_start_time` datetime NOT NULL,
  `agent_exit_time` datetime NOT NULL,
  `uid` int(10) NOT NULL,
  `url_status` tinyint(1) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `callback_policy`;
CREATE TABLE `callback_policy` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(50) NOT NULL,
  `callback_type` varchar(3) NOT NULL,
  `assign_policy` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1: Auto, 0: Manual, 2: View',
  `transfer_campaign` varchar(30) NOT NULL,
  `dialing_preference` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1: Auto, 0: Double Click',
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(20) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `priority` int(3) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  `lead_storage` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0: Callback, 1: Lead',
  `dialing_algo` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0: FIFO, 1: LIFO',
  `priority_ontime` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0: Ontime, 1: Offtime',
  `dialing_mode` tinyint(1) NOT NULL DEFAULT '3' COMMENT '1: Auto, 3: Callback, 5: Progressive, 7: Preview',
  `leadname_gen_algo` varchar(10) NOT NULL DEFAULT 'weekly' COMMENT 'Monthly, Weekly, Daily',
  `retry_type` int(2) NOT NULL DEFAULT '1' COMMENT '1=Manual Retry,2=Auto Retry',
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `retry_days` int(2) DEFAULT '0',
  `retry_attempt_type` int(2) DEFAULT '0',
  `max_attempt_per_day` int(2) DEFAULT '0',
  `max_attempt` int(2) DEFAULT '0',
  `retrytocampaign` varchar(50) NOT NULL DEFAULT '',
  `noofcallbacks` int(11) DEFAULT '0',
  `callbacktocampaign` varchar(50) NOT NULL DEFAULT '',
  `active_status` tinyint(1) NOT NULL DEFAULT '1' COMMENT '0=deactive,1=active',
  `sms_template_id` int(4) NOT NULL DEFAULT '0',
  `sms_route_id` int(4) NOT NULL DEFAULT '0',
  `whatsapp_template_id` int(4) NOT NULL DEFAULT '0',
  `whatsapp_route_id` int(4) NOT NULL DEFAULT '0',
  `next_smssent_in_minutes` int(5) NOT NULL,
  `next_whatsappsent_in_minutes` int(5) NOT NULL,
  `duplicate_campaign` varchar(15) NOT NULL,
  `connected_dial` tinyint(1) NOT NULL,
  `not_dial` tinyint(1) NOT NULL,
  `next_dial` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  KEY `callback_type` (`callback_type`),
  KEY `sms_template_id` (`sms_template_id`),
  KEY `sms_route_id` (`sms_route_id`),
  KEY `whatsapp_template_id` (`whatsapp_template_id`),
  KEY `whatsapp_route_id` (`whatsapp_route_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `callback_policy_dialing_pattern`;
CREATE TABLE `callback_policy_dialing_pattern` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(30) NOT NULL,
  `dialing_mode` int(3) NOT NULL DEFAULT '1',
  `crm_field_id` int(3) NOT NULL DEFAULT '0',
  `crm_field_condition` char(10) NOT NULL DEFAULT '=',
  `crm_field_value` varchar(500) NOT NULL,
  `update_by_user` varchar(30) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `client_id` int(5) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  KEY `dialing_mode` (`dialing_mode`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `callback_policy_retry`;
CREATE TABLE `callback_policy_retry` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(25) NOT NULL,
  `policy_type` varchar(3) NOT NULL,
  `config_id` int(7) DEFAULT NULL,
  `disposition_type` varchar(15) DEFAULT 'dialer,agent',
  `disposition` varchar(40) DEFAULT NULL,
  `sub_disposition` varchar(40) DEFAULT NULL,
  `disposition_attempt` int(3) DEFAULT NULL,
  `next_reload_minute` int(5) DEFAULT '0',
  `flag` tinyint(1) DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `d_t_c_ds_dpt_cid` (`disposition_type`,`campaign_id`,`disposition`,`sub_disposition`,`policy_type`,`client_id`),
  KEY `client_id` (`client_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `disposition` (`disposition`),
  KEY `policy_type` (`policy_type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `callerid`;
CREATE TABLE `callerid` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `callerid` varchar(45) NOT NULL DEFAULT '',
  `campaign` varchar(75) NOT NULL DEFAULT '',
  `manualcid` tinyint(1) NOT NULL DEFAULT '0',
  `autocid` tinyint(1) NOT NULL DEFAULT '0',
  `agent` varchar(25) NOT NULL,
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`,`campaign`),
  KEY `autocid` (`autocid`),
  KEY `manualcid` (`manualcid`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `callroute_api`;
CREATE TABLE `callroute_api` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(45) NOT NULL,
  `event` varchar(45) NOT NULL,
  `url` varchar(255) NOT NULL,
  `static_field` text NOT NULL,
  `original_url` varchar(255) NOT NULL,
  `request_method` varchar(15) NOT NULL,
  `update_by_user` varchar(25) NOT NULL,
  `update_by_ip` varchar(25) NOT NULL,
  `client_id` int(5) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `call_dump_api_hit`;
CREATE TABLE `call_dump_api_hit` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `call_noanswer_duration`;
CREATE TABLE `call_noanswer_duration` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uniqueid` varchar(25) NOT NULL,
  `duration` int(3) NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `uniqueid` (`uniqueid`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign`;
CREATE TABLE `campaign` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `unique_id` int(3) NOT NULL,
  `name` varchar(25) NOT NULL DEFAULT '',
  `description` varchar(100) NOT NULL,
  `script` varchar(255) NOT NULL,
  `prefix` varchar(15) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `campaign_type` varchar(20) NOT NULL,
  `channel_type` varchar(10) NOT NULL,
  `group_type` varchar(20) NOT NULL,
  `call_time_difference` int(11) NOT NULL DEFAULT '20',
  `call_ratio` double(2,1) NOT NULL DEFAULT '1.0',
  `call_ratio_point` int(11) NOT NULL DEFAULT '0',
  `call_orginate_time` int(11) NOT NULL DEFAULT '40',
  `crm_status` tinyint(1) NOT NULL DEFAULT '0',
  `dialing_mode` varchar(5) NOT NULL DEFAULT 'W',
  `max_call` int(10) unsigned NOT NULL DEFAULT '0',
  `webcrm` tinyint(1) unsigned NOT NULL DEFAULT '0',
  `dnc_check` tinyint(1) NOT NULL DEFAULT '0',
  `zone_dialing` tinyint(1) NOT NULL DEFAULT '0',
  `auto_dispose_duration` int(3) NOT NULL DEFAULT '0',
  `special_combo` tinyint(1) NOT NULL DEFAULT '0',
  `webscript` varchar(225) NOT NULL,
  `hotdial1` varchar(15) DEFAULT NULL,
  `hotdial2` varchar(15) DEFAULT NULL,
  `hotdial3` varchar(15) DEFAULT NULL,
  `hotdial4` varchar(15) DEFAULT NULL,
  `hotdial5` varchar(15) DEFAULT NULL,
  `start_time` time DEFAULT '08:00:00',
  `end_time` time DEFAULT '18:59:59',
  `recall_reload_duration` int(11) DEFAULT '10',
  `s_monday` tinyint(1) DEFAULT '0',
  `s_tuesday` tinyint(1) DEFAULT '0',
  `s_wednesday` tinyint(1) DEFAULT '0',
  `s_thursday` tinyint(1) DEFAULT '0',
  `s_friday` tinyint(1) DEFAULT '0',
  `s_saturday` tinyint(1) DEFAULT '0',
  `s_sunday` tinyint(1) DEFAULT '0',
  `is_changed` tinyint(1) DEFAULT '0',
  `recall` tinyint(1) NOT NULL DEFAULT '0',
  `masking` tinyint(1) NOT NULL DEFAULT '0',
  `server_id` int(5) NOT NULL,
  `usersession_url` varchar(255) DEFAULT NULL,
  `is_agent_mobile` tinyint(1) NOT NULL DEFAULT '0',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `auto_logout` int(5) NOT NULL DEFAULT '0',
  `ringnoanswer_pause` int(5) NOT NULL DEFAULT '5',
  `alternatepath1` varchar(255) DEFAULT NULL,
  `alternatepath2` text,
  `confcli` tinyint(1) NOT NULL DEFAULT '0',
  `circle_permission` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1: Allowed 0: Not Allowed',
  `campaigntimeout` int(11) NOT NULL DEFAULT '45',
  `amdsetting` varchar(50) NOT NULL DEFAULT '2500,1500,800,5000,100,50,5,256,5000' COMMENT 'Low: 2500,1500,800,5000,100,50,5,256,5000 Medium: 2500,1500,800,5000,100,50,3,256,5000 High: 2500,1500,800,5000,100,50,2,256,5000',
  `amdnotsure` enum('HUMAN','MACHINE') NOT NULL DEFAULT 'HUMAN',
  `dataset` int(2) NOT NULL DEFAULT '0',
  `pre_check_api` varchar(255) NOT NULL COMMENT 'API for precheck number dial ',
  `new_assign_notify` int(2) NOT NULL DEFAULT '0',
  `queue_announce` int(1) DEFAULT '0' COMMENT '0: Disabled 1: Enabled',
  `agent_hold_announce` int(1) DEFAULT '0' COMMENT '0: Disabled 1: Enabled',
  `history_days` int(2) DEFAULT '0',
  `ticket_raise_url` varchar(255) DEFAULT NULL,
  `webscript_parameter` text,
  `back_starttime` time DEFAULT '00:00:00',
  `back_endtime` time DEFAULT '00:00:00',
  `max_callback_days` int(2) DEFAULT '0' COMMENT '0: Disabled, >0: no of days',
  `is_default_map` tinyint(1) NOT NULL DEFAULT '0',
  `web_ip` varchar(15) DEFAULT NULL,
  `disable_disposition` tinyint(1) DEFAULT '0' COMMENT '0: False, 1: True',
  `expire_time` varchar(12) DEFAULT '0',
  `max_preview_days` int(2) DEFAULT '0',
  `tree_id` int(11) DEFAULT '0',
  PRIMARY KEY (`name`,`client_id`),
  UNIQUE KEY `id` (`id`),
  KEY `unique_id` (`unique_id`),
  KEY `client_id` (`client_id`),
  KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `campaign_agent_mode_notify`;
CREATE TABLE `campaign_agent_mode_notify` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(50) NOT NULL,
  `agent` varchar(50) NOT NULL,
  `mode` int(2) NOT NULL,
  `client_id` int(5) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `campaign_agent_mode_client_id` (`campaign`,`agent`,`mode`,`client_id`),
  KEY `campaign` (`campaign`),
  KEY `agent` (`agent`),
  KEY `mode` (`mode`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign_agent_redial_map`;
CREATE TABLE `campaign_agent_redial_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(50) NOT NULL,
  `agent` varchar(50) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `client_id` int(5) NOT NULL,
  `update_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign_channel_map`;
CREATE TABLE `campaign_channel_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(25) DEFAULT NULL,
  `channel_group` varchar(25) DEFAULT NULL,
  `dial_mode` varchar(3) DEFAULT NULL,
  `pri` varchar(5) DEFAULT NULL,
  `channel` int(11) DEFAULT NULL,
  `did` varchar(255) DEFAULT NULL COMMENT 'The field contains the dids concat by ''|'' sign.',
  `v_priority` int(3) DEFAULT '0',
  `use_percent` int(3) DEFAULT '0',
  `update_by_user` varchar(50) DEFAULT NULL,
  `update_by_ip` varchar(15) DEFAULT NULL,
  `client_id` int(4) DEFAULT NULL,
  `agent` varchar(50) NOT NULL DEFAULT '',
  `v_prefix` varchar(15) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `campaign_name` (`campaign_name`),
  KEY `mode` (`dial_mode`),
  KEY `pri` (`pri`),
  KEY `client_id` (`client_id`),
  KEY `agent` (`agent`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign_country_map`;
CREATE TABLE `campaign_country_map` (
  `campaign_id` varchar(45) NOT NULL DEFAULT '0',
  `country_id` varchar(45) NOT NULL DEFAULT '0',
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  UNIQUE KEY `campaign_id_country_id_client_id` (`campaign_id`,`country_id`,`client_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `campaign_dialing_route`;
CREATE TABLE `campaign_dialing_route` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(30) DEFAULT NULL,
  `pri_route` varchar(5) DEFAULT NULL,
  `voip_route` varchar(30) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  `update_by_ip` varchar(20) NOT NULL DEFAULT '0.0.0.0',
  `update_by_user` varchar(50) NOT NULL DEFAULT 'nouser',
  PRIMARY KEY (`id`),
  KEY `campaign_name` (`campaign_name`),
  KEY `pri_route` (`pri_route`),
  KEY `voip_route` (`voip_route`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `campaign_did_calltype_url_map`;
CREATE TABLE `campaign_did_calltype_url_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(50) NOT NULL,
  `did` varchar(15) NOT NULL,
  `calltype` char(2) NOT NULL,
  `url` text NOT NULL,
  `original_url` text NOT NULL,
  `static_field` text NOT NULL,
  `client_id` int(5) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL DEFAULT '000.000.000.000',
  `update_by_user` varchar(50) NOT NULL,
  `update_by_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `did` (`did`),
  KEY `calltype` (`calltype`),
  KEY `campaign` (`campaign`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign_did_distribution_log`;
CREATE TABLE `campaign_did_distribution_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `did` varchar(35) NOT NULL,
  `campaign` varchar(35) NOT NULL,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign_did_priority_map`;
CREATE TABLE `campaign_did_priority_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(50) NOT NULL,
  `did` varchar(20) NOT NULL,
  `priority` int(11) NOT NULL,
  `type` enum('cbq','cbi','cbv') NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign_did_ratio`;
CREATE TABLE `campaign_did_ratio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(25) NOT NULL,
  `did_number` varchar(15) NOT NULL,
  `call_ratio` int(5) NOT NULL DEFAULT '1',
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `client_id` int(4) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign_disposition_map`;
CREATE TABLE `campaign_disposition_map` (
  `campaign_id` varchar(45) NOT NULL DEFAULT '',
  `disposition_id` varchar(45) NOT NULL DEFAULT '',
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  `disposition_url` varchar(255) DEFAULT NULL,
  `disposition_fields` varchar(500) DEFAULT NULL,
  `sms_template_id` int(4) DEFAULT '0',
  `route_id` int(4) DEFAULT '0',
  `request_method` varchar(10) DEFAULT 'GET',
  `url` varchar(255) DEFAULT NULL,
  `headerfield` varchar(555) DEFAULT NULL,
  `whatsapp_template_id` int(2) DEFAULT '0',
  `whatsapp_route_id` int(2) DEFAULT '0',
  `custom_fields` varchar(500) DEFAULT NULL,
  UNIQUE KEY `campaign_id_disposition_id_client_id` (`campaign_id`,`disposition_id`,`client_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `campaign_disposition_ticket_map`;
CREATE TABLE `campaign_disposition_ticket_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(50) NOT NULL,
  `disposition` varchar(100) NOT NULL,
  `crm_fields` varchar(255) NOT NULL,
  `mandatory` varchar(75) NOT NULL,
  `aliastext` varchar(255) NOT NULL,
  `client_id` int(4) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `disposition` (`disposition`),
  KEY `client_id` (`client_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign_file`;
CREATE TABLE `campaign_file` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(55) DEFAULT NULL,
  `caption` varchar(25) DEFAULT NULL,
  `category_name` varchar(45) DEFAULT NULL,
  `original_filename` varchar(255) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `client_id` int(5) DEFAULT NULL,
  `update_by_ip` varchar(20) NOT NULL DEFAULT '0.0.0.0',
  `update_by_user` varchar(50) NOT NULL DEFAULT 'nouser',
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  KEY `category_name` (`category_name`),
  KEY `original_filename` (`original_filename`),
  KEY `file_name` (`file_name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `campaign_mode_map`;
CREATE TABLE `campaign_mode_map` (
  `campaign_id` varchar(25) NOT NULL DEFAULT '',
  `mode_id` varchar(10) NOT NULL DEFAULT '',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  UNIQUE KEY `campaign_id_mode_id_client_id` (`campaign_id`,`mode_id`,`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `campaign_queue`;
CREATE TABLE `campaign_queue` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(45) DEFAULT NULL,
  `queue_name` varchar(45) DEFAULT NULL,
  `queue_did` varchar(15) DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `campaign_name` (`campaign_name`),
  KEY `queue_did` (`queue_did`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign_queue_map`;
CREATE TABLE `campaign_queue_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_campaign` varchar(45) CHARACTER SET latin1 DEFAULT NULL,
  `from_queue` varchar(45) CHARACTER SET latin1 DEFAULT NULL,
  `to_campaign` varchar(45) CHARACTER SET latin1 DEFAULT NULL,
  `to_queue` varchar(45) CHARACTER SET latin1 DEFAULT NULL,
  `queue_priority` tinyint(1) DEFAULT '0' COMMENT '0=Normal 1 = high',
  `update_by_user` varchar(25) CHARACTER SET latin1 DEFAULT NULL COMMENT 'nouser',
  `update_by_ip` varchar(25) CHARACTER SET latin1 DEFAULT NULL COMMENT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `from_queue` (`from_queue`),
  KEY `to_queue` (`to_queue`),
  KEY `queue_priority` (`queue_priority`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;


DROP TABLE IF EXISTS `campaign_skill_map`;
CREATE TABLE `campaign_skill_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(50) NOT NULL,
  `skill` varchar(25) NOT NULL,
  `pacing` double(3,1) NOT NULL DEFAULT '1.0',
  `call_ratio` int(11) NOT NULL DEFAULT '1',
  `client_id` int(5) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `campaign_skill_client_id` (`campaign`,`skill`,`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign_slot_map`;
CREATE TABLE `campaign_slot_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(50) NOT NULL,
  `starttime` time NOT NULL DEFAULT '00:00:00',
  `endtime` time NOT NULL DEFAULT '23:59:00',
  `cnt` int(4) NOT NULL DEFAULT '0',
  `client_id` int(4) NOT NULL,
  `createdby` varchar(50) NOT NULL,
  `createdon` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedby` varchar(50) NOT NULL DEFAULT 'NA',
  `modifiedon` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `updatebyip` varchar(15) NOT NULL DEFAULT '000.000.000.000',
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  KEY `client_id` (`client_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign_sub_disposition_map`;
CREATE TABLE `campaign_sub_disposition_map` (
  `campaign_id` varchar(45) NOT NULL DEFAULT '',
  `disposition_id` varchar(45) NOT NULL DEFAULT '',
  `sub_disposition_id` varchar(75) NOT NULL DEFAULT '',
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  UNIQUE KEY `campaign_id_disposition_id_sub_disposition_id_client_id` (`campaign_id`,`disposition_id`,`sub_disposition_id`,`client_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `campaign_url_map`;
CREATE TABLE `campaign_url_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(55) DEFAULT NULL,
  `disp_url` text,
  `url_method` varchar(15) DEFAULT NULL,
  `url_headerdata` varchar(255) DEFAULT NULL,
  `url_data` text,
  `custom_fields` varchar(500) DEFAULT NULL,
  `client_id` int(4) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `campaign_name_client_id` (`campaign_name`,`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `campaign_voip`;
CREATE TABLE `campaign_voip` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(45) NOT NULL,
  `voip_id` int(11) NOT NULL,
  `forward_type` tinyint(1) NOT NULL DEFAULT '0',
  `client_id` varchar(15) NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `category_file`;
CREATE TABLE `category_file` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(45) DEFAULT NULL,
  `category_name` varchar(45) DEFAULT NULL,
  `original_file` varchar(125) DEFAULT NULL,
  `caption_name` varchar(55) DEFAULT NULL,
  `file_name` varchar(125) DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `client_id` int(5) DEFAULT NULL,
  `update_by_ip` varchar(20) NOT NULL DEFAULT '0.0.0.0',
  `update_by_user` varchar(50) NOT NULL DEFAULT 'nouser',
  PRIMARY KEY (`id`),
  KEY `campaign_name` (`campaign_name`),
  KEY `category_name` (`category_name`),
  KEY `original_file` (`original_file`),
  KEY `file_name` (`file_name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `ccd_ivr_input_params`;
CREATE TABLE `ccd_ivr_input_params` (
  `ivr_input` int(5) NOT NULL,
  `nature_of_issue` int(3) NOT NULL,
  `docket_category` int(4) NOT NULL,
  `docket_sub_category` int(5) NOT NULL,
  UNIQUE KEY `ivr_input` (`ivr_input`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `ccd_uniqueid_docknumber`;
CREATE TABLE `ccd_uniqueid_docknumber` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uniqueid` varchar(25) NOT NULL,
  `docknumber` varchar(255) NOT NULL,
  `createdon` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedby` varchar(25) NOT NULL,
  `updatedbyip` varchar(15) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniqueid` (`uniqueid`),
  KEY `docknumber` (`docknumber`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `cdr_config`;
CREATE TABLE `cdr_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `param_name` varchar(100) NOT NULL DEFAULT '',
  `param_value` varchar(100) NOT NULL DEFAULT '',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`,`param_name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `channel_desc`;
CREATE TABLE `channel_desc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(5) DEFAULT NULL,
  `campaign_id` int(5) DEFAULT NULL,
  `group_name` varchar(5) DEFAULT NULL,
  `total_channel` int(5) DEFAULT NULL,
  `total_used` int(5) DEFAULT NULL,
  `server_id` int(5) DEFAULT NULL,
  `dialing_buffer` int(5) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `channel_detail`;
CREATE TABLE `channel_detail` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `bandwidth` int(11) unsigned NOT NULL DEFAULT '0',
  `codec` varchar(45) NOT NULL DEFAULT '',
  `max_channel` int(11) unsigned NOT NULL DEFAULT '0',
  `client_id` int(5) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `channel_mapping`;
CREATE TABLE `channel_mapping` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `server_id` int(4) DEFAULT NULL,
  `group_name` varchar(5) DEFAULT NULL,
  `channel_no` int(5) DEFAULT NULL,
  `pri_number` int(5) DEFAULT NULL,
  `channel_status` tinyint(1) DEFAULT '0',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `server_id` (`server_id`),
  KEY `group_name` (`group_name`),
  KEY `channel_status` (`channel_status`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `chat`;
CREATE TABLE `chat` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `from_agent_name` varchar(255) NOT NULL DEFAULT '',
  `to_agent_name` varchar(255) NOT NULL DEFAULT '',
  `message` text NOT NULL,
  `sent_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `recd` int(10) unsigned NOT NULL DEFAULT '0',
  `client_id` int(5) unsigned NOT NULL,
  `from_login_id` int(10) unsigned NOT NULL,
  `group_name` varchar(50) NOT NULL,
  `recd_on` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `from` (`from_agent_name`),
  KEY `to` (`to_agent_name`),
  KEY `recd` (`recd`),
  KEY `from_login_id` (`from_login_id`),
  KEY `group_name` (`group_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `chat_groups`;
CREATE TABLE `chat_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_name` varchar(50) NOT NULL,
  `agent` varchar(20) NOT NULL,
  `added_by` varchar(20) NOT NULL,
  `added_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gravatar` varchar(50) NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `group_name_agent_client_id` (`group_name`,`agent`,`client_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `chat_group_label`;
CREATE TABLE `chat_group_label` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `group_name` varchar(50) NOT NULL,
  `created_by` varchar(50) NOT NULL,
  `created_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `chat_login_info`;
CREATE TABLE `chat_login_info` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(25) NOT NULL,
  `campaign` varchar(25) NOT NULL,
  `role` tinyint(1) NOT NULL,
  `login_id` varchar(25) DEFAULT NULL,
  `activate_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `deactivate_time` datetime DEFAULT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `user_id` (`user_id`),
  KEY `campaign` (`campaign`),
  KEY `role` (`role`),
  KEY `login_id` (`login_id`),
  KEY `flag` (`flag`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `chat_message_log`;
CREATE TABLE `chat_message_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_agent_name` varchar(25) NOT NULL,
  `to_agent_name` varchar(25) NOT NULL,
  `campaign` varchar(25) NOT NULL,
  `chat_login_id` varchar(25) DEFAULT NULL,
  `message` text NOT NULL,
  `sent_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(5) NOT NULL,
  `recd` tinyint(1) NOT NULL DEFAULT '0',
  `from_login_id` int(11) NOT NULL,
  `to_login_id` int(11) NOT NULL,
  `recd_on` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `from_agent_name` (`from_agent_name`),
  KEY `to_agent_name` (`to_agent_name`),
  KEY `campaign` (`campaign`),
  KEY `form_login_id` (`from_login_id`),
  KEY `to_login_id` (`to_login_id`),
  KEY `recd` (`recd`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `chat_view`;
CREATE TABLE `chat_view` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cid` text NOT NULL,
  `main_parent_id` int(11) NOT NULL,
  `title` text NOT NULL,
  `parent_id` int(11) NOT NULL,
  `bk_color` varchar(50) NOT NULL,
  `text_color` varchar(50) NOT NULL,
  `client_id` int(5) NOT NULL,
  `order_by` int(11) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `city_language`;
CREATE TABLE `city_language` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `city` varchar(45) NOT NULL,
  `key_press` tinyint(4) NOT NULL,
  `language` varchar(25) NOT NULL,
  `client_id` int(5) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `key_press` (`key_press`),
  KEY `language` (`language`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `city_skill_map`;
CREATE TABLE `city_skill_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `skillname` varchar(50) NOT NULL,
  `cityname` varchar(50) NOT NULL,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `click_to_dial`;
CREATE TABLE `click_to_dial` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent` varchar(30) DEFAULT NULL,
  `sip` int(5) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `campaign` varchar(30) DEFAULT NULL,
  `module` varchar(30) DEFAULT NULL,
  `module_id` varchar(30) DEFAULT NULL,
  `resp_id` int(11) DEFAULT NULL,
  `is_dialed` tinyint(1) NOT NULL DEFAULT '0',
  `dialed_time` datetime DEFAULT NULL,
  `disposition` varchar(30) DEFAULT NULL,
  `duration` int(5) NOT NULL DEFAULT '0',
  `update_time` datetime DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sip` (`sip`,`phone`,`resp_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `client_group_map`;
CREATE TABLE `client_group_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(5) NOT NULL,
  `group_id` varchar(3) NOT NULL,
  `server_id` int(5) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `group_id` (`group_id`),
  KEY `server_id` (`server_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `client_menu`;
CREATE TABLE `client_menu` (
  `client_code` varchar(45) NOT NULL DEFAULT '0',
  `menu_id` varchar(45) NOT NULL DEFAULT '0',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `client_server_map`;
CREATE TABLE `client_server_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(5) NOT NULL,
  `voice_server` varchar(55) NOT NULL,
  `cs_server` varchar(55) NOT NULL,
  `web_server` varchar(55) NOT NULL,
  `voice_server2` varchar(55) NOT NULL,
  `cs_server2` varchar(55) NOT NULL,
  `web_server2` varchar(55) NOT NULL,
  `status` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `codec`;
CREATE TABLE `codec` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `all_p` tinyint(1) NOT NULL DEFAULT '0',
  `g729` tinyint(1) NOT NULL DEFAULT '0',
  `gsm` tinyint(1) NOT NULL DEFAULT '0',
  `alaw` tinyint(1) NOT NULL DEFAULT '0',
  `ulaw` tinyint(1) NOT NULL DEFAULT '0',
  `ilbc` tinyint(1) NOT NULL DEFAULT '0',
  `client_id` int(7) NOT NULL DEFAULT '0',
  `update_by_ip` varchar(20) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `configuration`;
CREATE TABLE `configuration` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `param_name` varchar(100) NOT NULL DEFAULT '',
  `param_value` varchar(100) DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`,`param_name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `country`;
CREATE TABLE `country` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL DEFAULT '',
  `countryid` varchar(10) NOT NULL DEFAULT '',
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `crmhitlog`;
CREATE TABLE `crmhitlog` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent` varchar(45) DEFAULT NULL,
  `htime` datetime DEFAULT NULL,
  `hiturl` text,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `crm_api_response_log`;
CREATE TABLE `crm_api_response_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `source_ip` varchar(15) NOT NULL DEFAULT '000.000.000.000' COMMENT 'Source IP from where the API hitted',
  `api_url` varchar(255) NOT NULL COMMENT 'api url which has been hitted',
  `params` text NOT NULL,
  `tokenid` varchar(50) NOT NULL COMMENT 'tokenid',
  `client_id` int(5) NOT NULL COMMENT 'clientid',
  `insert_time` datetime NOT NULL,
  `datain` mediumtext NOT NULL COMMENT 'json data which has been hitted with api',
  `dataout` mediumtext NOT NULL COMMENT 'response json which has been sent in response',
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tokenid` (`tokenid`),
  KEY `creation_date` (`creation_date`),
  KEY `source_ip` (`source_ip`),
  KEY `client_id` (`client_id`),
  KEY `api_url` (`api_url`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `crm_config`;
CREATE TABLE `crm_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(75) DEFAULT NULL,
  `fid` int(10) unsigned NOT NULL DEFAULT '0',
  `fcaption` varchar(75) NOT NULL,
  `req` tinyint(4) NOT NULL DEFAULT '0',
  `mlen` int(10) unsigned NOT NULL DEFAULT '0',
  `ltype` tinyint(4) NOT NULL DEFAULT '0',
  `search` tinyint(1) NOT NULL DEFAULT '0',
  `dial` tinyint(1) NOT NULL DEFAULT '0',
  `sms` tinyint(1) NOT NULL DEFAULT '0',
  `mail` tinyint(1) NOT NULL DEFAULT '0',
  `history` tinyint(1) NOT NULL DEFAULT '0',
  `data_log` tinyint(1) NOT NULL DEFAULT '0',
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  `ftypedesc` text NOT NULL,
  `ftype` varchar(20) NOT NULL,
  `parentElement` varchar(75) NOT NULL,
  `isPhone` tinyint(1) NOT NULL DEFAULT '0',
  `isDisposition` tinyint(1) NOT NULL DEFAULT '0',
  `dataset_id` int(2) NOT NULL DEFAULT '0',
  `dfid` int(2) NOT NULL,
  `is_masked` tinyint(1) NOT NULL DEFAULT '0',
  `is_show` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  KEY `fid` (`fid`),
  KEY `client_id` (`client_id`),
  KEY `fcaption` (`fcaption`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `crm_data_check`;
CREATE TABLE `crm_data_check` (
  `id` double NOT NULL AUTO_INCREMENT,
  `campaign` varchar(55) DEFAULT NULL,
  `leadid` varchar(75) DEFAULT NULL,
  `phone` varchar(25) NOT NULL,
  `phone1` varchar(25) NOT NULL,
  `phone2` varchar(25) NOT NULL,
  `phone3` varchar(25) NOT NULL,
  `dialer_disp` varchar(40) NOT NULL,
  `f1` varchar(255) DEFAULT NULL,
  `f2` varchar(255) DEFAULT NULL,
  `f3` varchar(255) DEFAULT NULL,
  `f4` varchar(255) DEFAULT NULL,
  `f5` varchar(255) DEFAULT NULL,
  `f6` varchar(255) DEFAULT NULL,
  `f7` varchar(255) DEFAULT NULL,
  `f8` varchar(255) DEFAULT NULL,
  `f9` varchar(255) DEFAULT NULL,
  `f10` varchar(255) DEFAULT NULL,
  `f11` varchar(255) DEFAULT NULL,
  `f12` varchar(255) DEFAULT NULL,
  `f13` varchar(255) DEFAULT NULL,
  `f14` varchar(255) DEFAULT NULL,
  `f15` varchar(255) DEFAULT NULL,
  `f16` varchar(255) DEFAULT NULL,
  `f17` varchar(255) DEFAULT NULL,
  `f18` varchar(255) DEFAULT NULL,
  `f19` varchar(255) DEFAULT NULL,
  `f20` varchar(255) DEFAULT NULL,
  `f21` varchar(255) DEFAULT NULL,
  `f22` varchar(255) DEFAULT NULL,
  `f23` varchar(255) DEFAULT NULL,
  `f24` varchar(255) DEFAULT NULL,
  `f25` varchar(255) DEFAULT NULL,
  `f26` varchar(255) DEFAULT NULL,
  `f27` varchar(255) DEFAULT NULL,
  `f28` varchar(255) DEFAULT NULL,
  `f29` varchar(255) DEFAULT NULL,
  `f30` varchar(255) DEFAULT NULL,
  `f31` varchar(255) DEFAULT NULL,
  `f32` varchar(255) DEFAULT NULL,
  `f33` varchar(255) DEFAULT NULL,
  `f34` varchar(255) DEFAULT NULL,
  `f38` varchar(255) DEFAULT NULL,
  `f35` varchar(255) DEFAULT NULL,
  `f36` varchar(255) DEFAULT NULL,
  `f39` varchar(255) DEFAULT NULL,
  `f37` varchar(255) DEFAULT NULL,
  `f40` varchar(255) DEFAULT NULL,
  `f41` varchar(255) DEFAULT NULL,
  `f42` varchar(255) DEFAULT NULL,
  `f43` varchar(255) DEFAULT NULL,
  `f44` varchar(255) DEFAULT NULL,
  `f45` varchar(255) DEFAULT NULL,
  `f46` varchar(255) DEFAULT NULL,
  `f47` varchar(255) DEFAULT NULL,
  `f48` varchar(255) DEFAULT NULL,
  `f49` varchar(255) DEFAULT NULL,
  `f50` varchar(255) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  `assigned_to` varchar(25) DEFAULT NULL,
  `dataset_id` int(4) DEFAULT '0',
  `update_dupliicate` tinyint(1) DEFAULT '0',
  `update_by_user` varchar(25) NOT NULL,
  `cdate` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `cmr_data_phone` (`phone`),
  KEY `cmr_data_campaign` (`campaign`),
  KEY `leadid` (`leadid`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `csaction`;
CREATE TABLE `csaction` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent` varchar(45) DEFAULT NULL,
  `campaign` varchar(45) DEFAULT NULL,
  `client_id` varchar(10) DEFAULT NULL,
  `cs_action` varchar(255) DEFAULT NULL,
  `action_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `daily_dialer_report`;
CREATE TABLE `daily_dialer_report` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `total_data_received` int(11) NOT NULL DEFAULT '0',
  `total_dnd` int(11) NOT NULL DEFAULT '0',
  `total_dialer` int(11) NOT NULL DEFAULT '0',
  `total_connected` int(11) NOT NULL DEFAULT '0',
  `total_not_connected` int(11) NOT NULL DEFAULT '0',
  `dialer_disposition_count` text,
  `total_agent` int(11) NOT NULL DEFAULT '0',
  `total_aht` int(11) NOT NULL DEFAULT '0',
  `total_att` int(11) NOT NULL DEFAULT '0',
  `createddt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `date` (`date`),
  KEY `total_data_received` (`total_data_received`),
  KEY `total_dnd` (`total_dnd`),
  KEY `total_connected` (`total_connected`),
  KEY `total_not_connected` (`total_not_connected`),
  KEY `total_agent` (`total_agent`),
  KEY `total_aht` (`total_aht`),
  KEY `total_att` (`total_att`),
  KEY `createddt` (`createddt`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `database_configure`;
CREATE TABLE `database_configure` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `db_host` varchar(125) NOT NULL,
  `db_user` varchar(25) NOT NULL,
  `db_pass` varchar(25) NOT NULL,
  `db_date` varchar(8) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) NOT NULL,
  `update_by_ip` varchar(25) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dataset`;
CREATE TABLE `dataset` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dataset_name` varchar(50) NOT NULL,
  `client_id` int(5) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `decision_campaign_disposition_map`;
CREATE TABLE `decision_campaign_disposition_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(50) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `node_id` int(11) NOT NULL,
  `disposition_id` varchar(40) NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `client_id` int(11) NOT NULL,
  `is_fwd` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0: Processing 1: Forwarding',
  `isFwded` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0: Processing 1: Forwarding',
  PRIMARY KEY (`id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`parent_id`),
  KEY `client_id` (`client_id`),
  KEY `disposition_id` (`disposition_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `decision_campaign_sub_disposition_map`;
CREATE TABLE `decision_campaign_sub_disposition_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(50) NOT NULL,
  `parent_id` int(11) NOT NULL,
  `node_id` int(11) NOT NULL,
  `disposition_id` varchar(40) NOT NULL,
  `sub_disposition_id` varchar(40) NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `client_id` int(11) NOT NULL,
  `is_fwd` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0: Processing 1: Forwarding',
  `isFwded` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0: Processing 1: Forwarding',
  PRIMARY KEY (`id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`parent_id`),
  KEY `client_id` (`client_id`),
  KEY `disposition_id` (`disposition_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `default_user_campaign_mode`;
CREATE TABLE `default_user_campaign_mode` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(20) NOT NULL,
  `campaign` varchar(20) NOT NULL,
  `mode` int(11) NOT NULL,
  `client_id` int(5) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_datetime` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `add_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `deviceid_simid_request`;
CREATE TABLE `deviceid_simid_request` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `deviceid` varchar(25) NOT NULL,
  `simid` varchar(25) NOT NULL,
  `createdon` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `deviceid` (`deviceid`),
  UNIQUE KEY `simid` (`simid`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dialed_number`;
CREATE TABLE `dialed_number` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `custid` varchar(15) NOT NULL,
  `dataid` varchar(15) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `leadid` varchar(25) NOT NULL,
  `campaign` varchar(25) NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `dataid` (`dataid`),
  KEY `phone` (`phone`),
  KEY `campaign` (`campaign`),
  KEY `custid` (`custid`),
  KEY `client_id` (`client_id`),
  KEY `leadid` (`leadid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dialer_disposition`;
CREATE TABLE `dialer_disposition` (
  `disposition_id` varchar(40) NOT NULL DEFAULT '',
  `is_reload` tinyint(1) NOT NULL DEFAULT '1',
  `route_id` int(4) DEFAULT '0',
  `client_id` int(5) NOT NULL,
  `sms_template_id` int(4) DEFAULT '0',
  UNIQUE KEY `disposition_id` (`disposition_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `dialer_disposition_api_map`;
CREATE TABLE `dialer_disposition_api_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(30) NOT NULL,
  `disposition` varchar(40) NOT NULL,
  `api` varchar(500) NOT NULL,
  `method` varchar(200) NOT NULL DEFAULT 'GET',
  `update_by_ip` varchar(15) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `disposition_client_id_campaign` (`disposition`,`client_id`,`campaign`),
  KEY `event` (`disposition`),
  KEY `client_id` (`client_id`),
  KEY `campaign` (`campaign`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dialer_disposition_sms_cap`;
CREATE TABLE `dialer_disposition_sms_cap` (
  `id` bigint(15) NOT NULL AUTO_INCREMENT,
  `client_id` int(5) NOT NULL,
  `campaign` varchar(30) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `ctime` datetime NOT NULL,
  `next_sent_time` datetime NOT NULL,
  `next_sent_in_minute` int(2) NOT NULL DEFAULT '0',
  `next_day` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `phone` (`phone`),
  KEY `campaign` (`campaign`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dialer_disposition_sms_map`;
CREATE TABLE `dialer_disposition_sms_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(30) NOT NULL,
  `disposition_id` varchar(50) NOT NULL,
  `skill` varchar(50) NOT NULL,
  `template_id` int(4) NOT NULL,
  `route_id` int(4) NOT NULL,
  `client_id` int(4) NOT NULL,
  `next_sent_in_minute` int(1) NOT NULL DEFAULT '0',
  `next_day` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  KEY `disposition_id` (`disposition_id`),
  KEY `template_id` (`template_id`),
  KEY `route_id` (`route_id`),
  KEY `client_id` (`client_id`),
  KEY `skill` (`skill`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dialer_disposition_whatsapp_cap`;
CREATE TABLE `dialer_disposition_whatsapp_cap` (
  `id` bigint(15) NOT NULL AUTO_INCREMENT,
  `client_id` int(5) NOT NULL,
  `campaign` varchar(30) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `ctime` datetime NOT NULL,
  `next_sent_time` datetime NOT NULL,
  `next_sent_in_minute` int(2) NOT NULL DEFAULT '0',
  `next_day` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `phone` (`phone`),
  KEY `campaign` (`campaign`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dialer_disposition_whatsapp_map`;
CREATE TABLE `dialer_disposition_whatsapp_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(30) NOT NULL,
  `disposition_id` varchar(50) NOT NULL,
  `skill` varchar(50) NOT NULL,
  `template_id` int(4) NOT NULL,
  `route_id` int(4) NOT NULL,
  `client_id` int(4) NOT NULL,
  `next_sent_in_minute` int(1) NOT NULL DEFAULT '0',
  `next_day` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  KEY `disposition_id` (`disposition_id`),
  KEY `template_id` (`template_id`),
  KEY `route_id` (`route_id`),
  KEY `client_id` (`client_id`),
  KEY `skill` (`skill`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `did_details`;
CREATE TABLE `did_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `server_id` int(3) DEFAULT NULL,
  `pri_port` int(3) DEFAULT NULL,
  `pri_type` varchar(15) DEFAULT NULL,
  `provider_name` varchar(25) DEFAULT NULL,
  `pri_alias` varchar(25) DEFAULT NULL,
  `channel_no` int(3) DEFAULT NULL,
  `master_did` varchar(15) DEFAULT NULL,
  `did_range_start` varchar(15) DEFAULT NULL,
  `did_range_end` varchar(15) DEFAULT NULL,
  `span_status` varchar(25) DEFAULT NULL,
  `pri_status` tinyint(1) DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `server_id` (`server_id`),
  KEY `pri_port` (`pri_port`),
  KEY `provider_name` (`provider_name`),
  KEY `pri_alias` (`pri_alias`),
  KEY `master_did` (`master_did`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `did_event_api`;
CREATE TABLE `did_event_api` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `didid` varchar(15) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `event` varchar(15) NOT NULL,
  `abandon_time` datetime NOT NULL,
  `resend_duration` int(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `didid` (`didid`),
  KEY `phone` (`phone`),
  KEY `event` (`event`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `did_event_api_map`;
CREATE TABLE `did_event_api_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `did` varchar(20) NOT NULL,
  `event` varchar(30) NOT NULL,
  `type` varchar(20) NOT NULL,
  `resend_duration` int(11) NOT NULL DEFAULT '0',
  `api` varchar(200) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `did_type_event_client_id` (`did`,`type`,`event`,`client_id`),
  KEY `did` (`did`),
  KEY `event` (`event`),
  KEY `type` (`type`),
  KEY `api` (`api`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `did_event_sms`;
CREATE TABLE `did_event_sms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `didid` varchar(15) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `event` varchar(15) NOT NULL,
  `abandon_time` datetime NOT NULL,
  `resend_duration` int(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `didid` (`didid`),
  KEY `phone` (`phone`),
  KEY `event` (`event`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `did_event_sms_map`;
CREATE TABLE `did_event_sms_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `did` varchar(20) NOT NULL,
  `event` varchar(30) NOT NULL,
  `type` varchar(20) NOT NULL,
  `resend_duration` int(11) NOT NULL DEFAULT '0',
  `template_id` int(11) NOT NULL DEFAULT '0',
  `tl_template_id` int(3) NOT NULL DEFAULT '0',
  `route_id` int(11) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `did_type_event_client_id` (`did`,`type`,`event`,`client_id`),
  KEY `did` (`did`),
  KEY `event` (`event`),
  KEY `type` (`type`),
  KEY `template_id` (`template_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `did_event_whatsapp`;
CREATE TABLE `did_event_whatsapp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `didid` varchar(15) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `event` varchar(15) NOT NULL,
  `abandon_time` datetime NOT NULL,
  `resend_duration` int(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `didid` (`didid`),
  KEY `phone` (`phone`),
  KEY `event` (`event`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `did_event_whatsapp_map`;
CREATE TABLE `did_event_whatsapp_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `did` varchar(20) NOT NULL,
  `event` varchar(30) NOT NULL,
  `type` varchar(20) NOT NULL,
  `resend_duration` int(11) NOT NULL DEFAULT '0',
  `template_id` int(11) NOT NULL DEFAULT '0',
  `tl_template_id` int(3) NOT NULL DEFAULT '0',
  `route_id` int(11) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `did_type_event_client_id` (`did`,`type`,`event`,`client_id`),
  KEY `did` (`did`),
  KEY `event` (`event`),
  KEY `type` (`type`),
  KEY `template_id` (`template_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `did_forwrding`;
CREATE TABLE `did_forwrding` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `did_number` varchar(15) NOT NULL,
  `did_number_digits` varchar(15) NOT NULL,
  `campaign_name` varchar(25) NOT NULL,
  `queue_maxtime` varchar(5) NOT NULL,
  `queue_forwardtype` varchar(25) NOT NULL,
  `queue_forward` varchar(25) NOT NULL,
  `forward_maxtime` varchar(25) NOT NULL,
  `forward_category` varchar(45) NOT NULL,
  `group_name` varchar(45) NOT NULL,
  `days_from` varchar(45) NOT NULL,
  `days_to` varchar(45) NOT NULL,
  `time_from` time NOT NULL,
  `time_to` time NOT NULL,
  `forward_type_on` varchar(45) NOT NULL,
  `forward_name_on` varchar(45) NOT NULL,
  `voice_forward_on` varchar(45) NOT NULL,
  `forward_type_off` varchar(45) NOT NULL,
  `forward_name_off` varchar(45) NOT NULL,
  `offqueue_maxtime` varchar(5) NOT NULL,
  `offqueue_forwardtype` varchar(45) NOT NULL,
  `offqueue_forward` varchar(45) NOT NULL,
  `offforward_maxtime` varchar(5) NOT NULL,
  `voice_forward_off` varchar(45) NOT NULL,
  `ontime_auto` varchar(25) NOT NULL,
  `offtime_auto` varchar(25) NOT NULL,
  `forward_ontime_cmp` varchar(25) NOT NULL,
  `forward_offtime_cmp` varchar(25) NOT NULL,
  `ontime_skill` varchar(25) DEFAULT NULL,
  `ontime_skills` varchar(25) CHARACTER SET latin1 COLLATE latin1_spanish_ci DEFAULT NULL,
  `offtime_skill` varchar(25) CHARACTER SET latin1 COLLATE latin1_spanish_ci DEFAULT NULL,
  `offtime_skills` varchar(25) DEFAULT NULL,
  `ontime_ivrprompt` varchar(25) DEFAULT NULL,
  `offtime_ivrprompt` varchar(25) CHARACTER SET latin1 COLLATE latin1_spanish_ci DEFAULT NULL,
  `did_id` int(5) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `did_number` (`did_number`),
  KEY `did_number_digits` (`did_number_digits`),
  KEY `campaign_id` (`campaign_name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `disposition_master`;
CREATE TABLE `disposition_master` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(75) NOT NULL DEFAULT '',
  `descr` varchar(255) DEFAULT NULL,
  `dtype` varchar(45) DEFAULT NULL,
  `unique_code` char(2) DEFAULT NULL,
  `is_callback` tinyint(1) DEFAULT '0',
  `is_dnd` tinyint(1) DEFAULT '0',
  `is_whatsapp` tinyint(1) DEFAULT '0',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`,`name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `disposition_ticket_history`;
CREATE TABLE `disposition_ticket_history` (
  `id` int(11) NOT NULL,
  `agent` varchar(50) NOT NULL,
  `campaign_id` varchar(50) NOT NULL,
  `disposition` varchar(50) NOT NULL,
  `phone` bigint(15) NOT NULL,
  `jsondetail` text NOT NULL,
  `response` text NOT NULL,
  `ticketno` varchar(25) NOT NULL,
  `unid` int(11) NOT NULL COMMENT 'captain unquie id.',
  `createdon` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `modifiedon` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `disposition_ticket_log`;
CREATE TABLE `disposition_ticket_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent` varchar(50) NOT NULL,
  `campaign_id` varchar(50) NOT NULL,
  `disposition` varchar(50) NOT NULL,
  `phone` bigint(15) NOT NULL,
  `jsondetail` text NOT NULL,
  `response` text NOT NULL,
  `ticketno` varchar(25) NOT NULL,
  `unid` int(11) NOT NULL COMMENT 'captain unquie id.',
  `createdon` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `modifiedon` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dncurl`;
CREATE TABLE `dncurl` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `dncurl` varchar(255) NOT NULL,
  `remote_check` tinyint(1) NOT NULL DEFAULT '0',
  `remote_check_url` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  `url_type` enum('blacklist','dnc','license') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_id_url_type` (`client_id`,`url_type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dnis`;
CREATE TABLE `dnis` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `did_no` int(12) NOT NULL,
  `didname` varchar(25) NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `did_no` (`did_no`),
  KEY `didname` (`didname`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `donation_type`;
CREATE TABLE `donation_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `donation_type` varchar(45) NOT NULL,
  `flag` tinyint(4) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dtmf_value`;
CREATE TABLE `dtmf_value` (
  `name` varchar(20) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dtv_data`;
CREATE TABLE `dtv_data` (
  `id` double NOT NULL AUTO_INCREMENT,
  `campaign` varchar(55) DEFAULT NULL,
  `agent` varchar(55) DEFAULT NULL,
  `cdate` datetime DEFAULT NULL,
  `leadid` varchar(75) DEFAULT NULL,
  `attempt` int(11) NOT NULL DEFAULT '0',
  `disp` varchar(75) DEFAULT NULL,
  `phone` varchar(25) NOT NULL,
  `f1` varchar(25) DEFAULT NULL,
  `f2` varchar(25) DEFAULT NULL,
  `f3` varchar(25) DEFAULT NULL,
  `f4` varchar(11) DEFAULT NULL,
  `f5` varchar(4) DEFAULT NULL,
  `f6` varchar(8) DEFAULT NULL,
  `f7` varchar(255) DEFAULT NULL,
  `f8` varchar(255) DEFAULT NULL,
  `f9` varchar(255) DEFAULT NULL,
  `f10` varchar(255) DEFAULT NULL,
  `f11` varchar(255) DEFAULT NULL,
  `f12` varchar(255) DEFAULT NULL,
  `f13` varchar(255) DEFAULT NULL,
  `f14` varchar(12) DEFAULT NULL,
  `f15` varchar(12) DEFAULT NULL,
  `f16` varchar(10) DEFAULT NULL,
  `f17` varchar(255) DEFAULT NULL,
  `f18` varchar(255) DEFAULT NULL,
  `f19` varchar(255) DEFAULT NULL,
  `f20` varchar(255) DEFAULT NULL,
  `f21` varchar(255) DEFAULT NULL,
  `f22` varchar(255) DEFAULT NULL,
  `f23` varchar(255) DEFAULT NULL,
  `f24` varchar(255) DEFAULT NULL,
  `f25` varchar(255) DEFAULT NULL,
  `f26` varchar(255) DEFAULT NULL,
  `f27` varchar(255) DEFAULT NULL,
  `f28` varchar(255) DEFAULT NULL,
  `f29` varchar(255) DEFAULT NULL,
  `f30` varchar(255) DEFAULT NULL,
  `f31` varchar(255) DEFAULT NULL,
  `f32` varchar(255) DEFAULT NULL,
  `f33` varchar(255) DEFAULT NULL,
  `f34` varchar(255) DEFAULT NULL,
  `f35` varchar(255) DEFAULT NULL,
  `subdisp` varchar(75) DEFAULT NULL,
  `dtv_rpc` varchar(75) DEFAULT NULL,
  `dtv_closed` varchar(75) DEFAULT NULL,
  `dialerdisp` varchar(75) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cmr_data_phone` (`phone`),
  KEY `cmr_data_campaign` (`campaign`),
  KEY `cmr_data_agent` (`agent`),
  KEY `cmr_data_disp` (`disp`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `dtv_logdata`;
CREATE TABLE `dtv_logdata` (
  `id` double NOT NULL AUTO_INCREMENT,
  `campaign` varchar(55) DEFAULT NULL,
  `agent` varchar(55) DEFAULT NULL,
  `cdate` datetime DEFAULT NULL,
  `leadid` varchar(75) DEFAULT NULL,
  `attempt` int(11) NOT NULL DEFAULT '0',
  `disp` varchar(75) DEFAULT NULL,
  `phone` varchar(25) NOT NULL,
  `f1` varchar(25) DEFAULT NULL,
  `f2` varchar(25) DEFAULT NULL,
  `f3` varchar(25) DEFAULT NULL,
  `f4` varchar(11) DEFAULT NULL,
  `f5` varchar(4) DEFAULT NULL,
  `f6` varchar(8) DEFAULT NULL,
  `f7` varchar(255) DEFAULT NULL,
  `f8` varchar(255) DEFAULT NULL,
  `f9` varchar(255) DEFAULT NULL,
  `f10` varchar(255) DEFAULT NULL,
  `f11` varchar(255) DEFAULT NULL,
  `f12` varchar(255) DEFAULT NULL,
  `f13` varchar(255) DEFAULT NULL,
  `f14` varchar(12) DEFAULT NULL,
  `f15` varchar(12) DEFAULT NULL,
  `f16` varchar(10) DEFAULT NULL,
  `f17` varchar(255) DEFAULT NULL,
  `f18` varchar(255) DEFAULT NULL,
  `f19` varchar(255) DEFAULT NULL,
  `f20` varchar(255) DEFAULT NULL,
  `f21` varchar(255) DEFAULT NULL,
  `f22` varchar(255) DEFAULT NULL,
  `f23` varchar(255) DEFAULT NULL,
  `f24` varchar(255) DEFAULT NULL,
  `f25` varchar(255) DEFAULT NULL,
  `f26` varchar(255) DEFAULT NULL,
  `f27` varchar(255) DEFAULT NULL,
  `f28` varchar(255) DEFAULT NULL,
  `f29` varchar(255) DEFAULT NULL,
  `f30` varchar(255) DEFAULT NULL,
  `f31` varchar(255) DEFAULT NULL,
  `f32` varchar(255) DEFAULT NULL,
  `f33` varchar(255) DEFAULT NULL,
  `f34` varchar(255) DEFAULT NULL,
  `f35` varchar(255) DEFAULT NULL,
  `subdisp` varchar(75) DEFAULT NULL,
  `dialerdisp` varchar(75) DEFAULT NULL,
  `dataid` int(11) DEFAULT '0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `cmr_data_phone` (`phone`),
  KEY `cmr_data_campaign` (`campaign`),
  KEY `cmr_data_agent` (`agent`),
  KEY `cmr_data_disp` (`disp`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `dt_permission`;
CREATE TABLE `dt_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(5) NOT NULL,
  `campaign` varchar(45) DEFAULT NULL,
  `crm_permission` tinyint(1) NOT NULL DEFAULT '1',
  `assigned_permission` tinyint(1) NOT NULL DEFAULT '0',
  `decision_tree_permission` tinyint(1) NOT NULL DEFAULT '0',
  `ticket_permission` tinyint(1) NOT NULL DEFAULT '0',
  `sms_permission` tinyint(1) NOT NULL DEFAULT '0',
  `email_permission` tinyint(1) NOT NULL DEFAULT '0',
  `history_permission` tinyint(1) NOT NULL DEFAULT '0',
  `feedback_permission` tinyint(1) NOT NULL DEFAULT '0',
  `whatsapp_in_permission` tinyint(1) NOT NULL DEFAULT '0',
  `whatsapp_out_permission` tinyint(1) NOT NULL DEFAULT '0',
  `chat_permission` tinyint(1) NOT NULL,
  `update_by_user` varchar(25) NOT NULL DEFAULT 'nouser',
  `update_by_ip` varchar(25) NOT NULL DEFAULT '0.0.0.0',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `campaign` (`campaign`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `dynamic_variables`;
CREATE TABLE `dynamic_variables` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `variable_name` varchar(25) DEFAULT NULL,
  `variable_caption` varchar(25) DEFAULT NULL,
  `field_name` varchar(25) DEFAULT NULL,
  `table_name` varchar(25) DEFAULT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `email_config`;
CREATE TABLE `email_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) DEFAULT NULL,
  `smtp_host` varchar(45) DEFAULT NULL,
  `smtp_user` varchar(45) DEFAULT NULL,
  `smtp_password` varchar(45) DEFAULT NULL,
  `smtp_subject` varchar(125) DEFAULT NULL,
  `client_id` int(8) DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `Campaign_Name` varchar(40) DEFAULT NULL,
  `Alert_Type` varchar(40) DEFAULT NULL,
  `Port` int(5) DEFAULT '25',
  `IS_SSL` tinyint(1) DEFAULT '0',
  `IS_TLS` tinyint(1) DEFAULT '0',
  `IS_Authenticated` tinyint(1) DEFAULT '0',
  `mail_to` varchar(255) DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `Campaign_Name` (`Campaign_Name`),
  KEY `Alert_Type` (`Alert_Type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `email_filteration`;
CREATE TABLE `email_filteration` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email_smtpid` int(11) NOT NULL,
  `smtpfilter_parent` varchar(45) NOT NULL,
  `smtpfilter_child` varchar(45) NOT NULL,
  `crmfield_id` varchar(5) NOT NULL,
  `client_id` int(11) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `email_inbox`;
CREATE TABLE `email_inbox` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `from_id` varchar(100) DEFAULT NULL,
  `sender_id` varchar(100) DEFAULT NULL,
  `client_id` int(8) DEFAULT NULL,
  `mail_subject` varchar(200) DEFAULT NULL,
  `mail_content` text,
  `message_id` varchar(200) DEFAULT NULL,
  `reciept_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_new` tinyint(1) DEFAULT '1',
  `flag` tinyint(1) DEFAULT '1',
  `is_attachment` tinyint(1) DEFAULT '1',
  `campaign_name` varchar(40) DEFAULT NULL,
  `agent_disposition` varchar(250) DEFAULT NULL,
  `sub_disposition` varchar(250) DEFAULT NULL,
  `agent_id` varchar(45) DEFAULT NULL,
  `rid` varchar(25) DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  UNIQUE KEY `id` (`id`),
  KEY `from_id` (`from_id`),
  KEY `sender_id` (`sender_id`),
  KEY `client_id` (`client_id`),
  KEY `mail_subject` (`mail_subject`),
  KEY `Campaign_Name` (`campaign_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `email_inbox_log`;
CREATE TABLE `email_inbox_log` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `from_id` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `sender_id` varchar(100) COLLATE latin1_general_ci DEFAULT NULL,
  `mail_subject` varchar(200) COLLATE latin1_general_ci DEFAULT NULL,
  `mail_content` text COLLATE latin1_general_ci,
  `message_id` varchar(200) COLLATE latin1_general_ci DEFAULT NULL,
  `processed_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `sub_disposition` varchar(45) COLLATE latin1_general_ci DEFAULT NULL,
  `agent_id` varchar(20) COLLATE latin1_general_ci DEFAULT NULL,
  `agent_disposition` varchar(45) COLLATE latin1_general_ci DEFAULT NULL,
  `rid` varchar(25) COLLATE latin1_general_ci DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `client_id` int(5) DEFAULT NULL,
  UNIQUE KEY `id` (`id`),
  KEY `from_id` (`from_id`),
  KEY `sender_id` (`sender_id`),
  KEY `agent_id` (`agent_id`),
  KEY `sub_disposition` (`sub_disposition`),
  KEY `agent_disposition` (`agent_disposition`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;


DROP TABLE IF EXISTS `email_outbox`;
CREATE TABLE `email_outbox` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `sender_id` varchar(100) DEFAULT NULL,
  `recipient_id` varchar(100) DEFAULT NULL,
  `client_id` int(8) DEFAULT NULL,
  `email_subject` varchar(200) DEFAULT NULL,
  `email_content` text,
  `send_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `send_status` tinyint(1) DEFAULT '1',
  `is_new` tinyint(1) DEFAULT '1',
  `is_attachment` tinyint(1) DEFAULT '0',
  `template_name` varchar(75) DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `Campaign_Name` varchar(40) DEFAULT NULL,
  `attachment_file` text,
  `rid` varchar(25) DEFAULT NULL,
  `agent_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `recipient_id` (`recipient_id`),
  KEY `client_id` (`client_id`),
  KEY `Campaign_Name` (`Campaign_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `email_read_error`;
CREATE TABLE `email_read_error` (
  `id` double NOT NULL AUTO_INCREMENT,
  `from_id` varchar(200) DEFAULT NULL,
  `sender_name` varchar(80) DEFAULT NULL,
  `reply_to` varchar(200) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` longtext,
  `maildate` varchar(100) DEFAULT NULL,
  `message_id` varchar(200) DEFAULT NULL,
  `unreadmessagecount` int(5) DEFAULT NULL,
  `mailstatus` tinyint(5) DEFAULT '1',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `from_id` (`from_id`),
  KEY `sender_name` (`sender_name`),
  KEY `reply_to` (`reply_to`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `email_sent`;
CREATE TABLE `email_sent` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` varchar(10) DEFAULT NULL,
  `sender_id` varchar(500) DEFAULT NULL,
  `recipient_id` varchar(500) DEFAULT NULL,
  `sent_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `email_subject` varchar(500) DEFAULT NULL,
  `email_content` text,
  `is_new` tinyint(1) DEFAULT '1',
  `is_attachment` tinyint(1) DEFAULT '1',
  `template_name` varchar(255) DEFAULT NULL,
  `Campaign_Name` varchar(40) DEFAULT NULL,
  `mail_status` varchar(500) DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `attachment_file` text,
  `rid` varchar(25) DEFAULT NULL,
  `agent_id` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `sender_id` (`sender_id`),
  KEY `recipient_id` (`recipient_id`),
  KEY `Campaign_Name` (`Campaign_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `email_setting`;
CREATE TABLE `email_setting` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) NOT NULL,
  `action` varchar(55) NOT NULL,
  `mailto` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `mailbody` text NOT NULL,
  `createdon` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatebyip` varchar(15) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `email_smtp`;
CREATE TABLE `email_smtp` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `smtp_host` varchar(75) DEFAULT NULL,
  `smtp_user` varchar(75) DEFAULT NULL,
  `smtp_password` varchar(75) DEFAULT NULL,
  `smtp_subject` varchar(255) DEFAULT NULL,
  `port` int(3) DEFAULT '995',
  `is_ssl` tinyint(1) DEFAULT '0',
  `is_tls` tinyint(1) DEFAULT '0',
  `is_auth` tinyint(1) DEFAULT '0',
  `is_debug` tinyint(1) DEFAULT '0',
  `smtp_auto` tinyint(1) DEFAULT '0',
  `campaign` varchar(25) DEFAULT NULL,
  `protocol` varchar(20) DEFAULT 'pop3',
  `flag` tinyint(1) DEFAULT '0',
  `priority` int(3) DEFAULT '100',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `smtp_host` (`smtp_host`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `email_template`;
CREATE TABLE `email_template` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email_subject` varchar(145) DEFAULT NULL,
  `email_content` text,
  `client_id` int(8) DEFAULT NULL,
  `email_type` varchar(75) DEFAULT NULL,
  `alert_type` varchar(100) DEFAULT NULL,
  `campaign_name` varchar(45) DEFAULT NULL,
  `is_attachment` tinyint(1) DEFAULT '0',
  `user_id` varchar(25) DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `email_subject` (`email_subject`),
  KEY `email_type` (`email_type`),
  KEY `client_id` (`client_id`),
  KEY `alert_type` (`alert_type`),
  KEY `user_id` (`user_id`),
  KEY `campaign_name` (`campaign_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `execute_query`;
CREATE TABLE `execute_query` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `message` text COLLATE latin1_general_ci,
  `is_error` tinyint(1) DEFAULT '0',
  `error_message` text COLLATE latin1_general_ci,
  `client_id` int(5) DEFAULT '0',
  `uniqueid` varchar(25) COLLATE latin1_general_ci DEFAULT NULL,
  `query_tag` varchar(25) COLLATE latin1_general_ci DEFAULT NULL,
  `update_time` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `uniqueid` (`uniqueid`),
  KEY `query_tag` (`query_tag`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;


DROP TABLE IF EXISTS `faq_category`;
CREATE TABLE `faq_category` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_name` varchar(25) NOT NULL,
  `parent_cat` int(5) NOT NULL DEFAULT '0',
  `flag` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1: Active, 0: Inactive',
  `createdon` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedby` varchar(25) NOT NULL,
  `updatedbyip` varchar(15) NOT NULL DEFAULT '000.000.000.000',
  `lastupdatedon` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  UNIQUE KEY `category_name` (`category_name`),
  KEY `parent_cat` (`parent_cat`),
  KEY `flag` (`flag`),
  KEY `createdon` (`createdon`),
  KEY `lastupdatedon` (`lastupdatedon`),
  KEY `updatedby` (`updatedby`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `faq_list`;
CREATE TABLE `faq_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` int(11) NOT NULL,
  `child_category` int(11) NOT NULL,
  `question` text NOT NULL,
  `answer` text NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1' COMMENT '1: Active, 0: Inactive',
  `createdon` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedbyip` varchar(15) NOT NULL DEFAULT '000.000.000.000',
  `updatedby` varchar(25) NOT NULL,
  `lastupdatedon` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`id`),
  KEY `category` (`category`),
  KEY `updatedby` (`updatedby`),
  KEY `createdon` (`createdon`),
  KEY `lastupdatedon` (`lastupdatedon`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `forwarding_details`;
CREATE TABLE `forwarding_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `from_no` varchar(15) NOT NULL,
  `to_no` varchar(15) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `added_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `from_no` (`from_no`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `fos`;
CREATE TABLE `fos` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `mobile` varchar(15) DEFAULT NULL,
  `name` varchar(30) DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mobile` (`mobile`),
  KEY `name` (`name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `fos_detail`;
CREATE TABLE `fos_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `fos_mobile` varchar(12) NOT NULL,
  `fos_name` varchar(25) NOT NULL,
  `pincode` varchar(6) NOT NULL,
  `fos_area` varchar(45) NOT NULL,
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fos_mobile` (`fos_mobile`),
  KEY `fos_name` (`fos_name`),
  KEY `pincode` (`pincode`),
  KEY `fos_area` (`fos_area`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


SET NAMES utf8mb4;

DROP TABLE IF EXISTS `frequent_asks`;
CREATE TABLE `frequent_asks` (
  `id` int(30) NOT NULL AUTO_INCREMENT,
  `question_id` int(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `gdma_log_table`;
CREATE TABLE `gdma_log_table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action` varchar(75) NOT NULL,
  `update_by_user` varchar(30) NOT NULL,
  `update_by_ip` varchar(30) NOT NULL,
  `update_time` datetime NOT NULL,
  `response` text NOT NULL,
  `others` text NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `group_desc`;
CREATE TABLE `group_desc` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `server_id` int(5) DEFAULT NULL,
  `group_name` varchar(15) DEFAULT NULL,
  `group_type` varchar(25) DEFAULT NULL,
  `group_subtype` varchar(25) DEFAULT NULL,
  `group_subcontext` varchar(25) DEFAULT NULL,
  `campaign_id` int(5) DEFAULT NULL,
  `pbx_port` varchar(45) DEFAULT NULL,
  `user_id` int(5) DEFAULT NULL,
  `dialing_buffer` int(10) DEFAULT '0',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `server_id` (`server_id`),
  KEY `group_name` (`group_name`),
  KEY `campaign_id` (`campaign_id`),
  KEY `user_id` (`user_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `gvr_service`;
CREATE TABLE `gvr_service` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_name` varchar(25) DEFAULT NULL,
  `service_type` varchar(25) DEFAULT NULL,
  `service_count` int(5) DEFAULT '0',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `hangup_by`;
CREATE TABLE `hangup_by` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `hangup_by` varchar(15) NOT NULL,
  `record_id` varchar(35) NOT NULL,
  `update_time` datetime NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `record_id` (`record_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `holiday_default`;
CREATE TABLE `holiday_default` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `default_voice` varchar(45) NOT NULL,
  `default_duration` varchar(25) NOT NULL,
  `default_date` datetime NOT NULL,
  `client_id` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `holiday_ivr`;
CREATE TABLE `holiday_ivr` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `holiday_date` date NOT NULL,
  `holiday_name` varchar(45) NOT NULL,
  `upload_date` datetime NOT NULL,
  `update_date` datetime NOT NULL,
  `voice_file` varchar(45) NOT NULL,
  `file_duration` varchar(15) NOT NULL,
  `update_by_user` varchar(45) NOT NULL,
  `update_by_ip` varchar(75) NOT NULL,
  `default_voice` varchar(45) NOT NULL,
  `default_duration` varchar(15) NOT NULL,
  `default_date` datetime NOT NULL,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `hot_lead`;
CREATE TABLE `hot_lead` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `crmdata_id` int(10) NOT NULL,
  `phone_no` varchar(12) NOT NULL,
  `campaign` varchar(25) NOT NULL,
  `lead_id` varchar(25) NOT NULL,
  `agent_name` varchar(25) NOT NULL,
  `cdate` datetime NOT NULL,
  `verifier_name` varchar(25) NOT NULL,
  `verified_date` datetime NOT NULL,
  `fos` varchar(12) NOT NULL,
  `assign_date` datetime NOT NULL,
  `schedule_date` datetime NOT NULL,
  `pickup_date` datetime NOT NULL,
  `lead_status` varchar(25) NOT NULL,
  `disposition` varchar(25) NOT NULL,
  `sub_disposition` varchar(25) NOT NULL,
  `ivrresponse_time` datetime NOT NULL,
  `ivr_response` varchar(3) NOT NULL,
  `ivr_amount` varchar(10) NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `crmdata_id` (`crmdata_id`),
  KEY `phone_no` (`phone_no`),
  KEY `campaign` (`campaign`),
  KEY `lead_id` (`lead_id`),
  KEY `agent_name` (`agent_name`),
  KEY `verifier_name` (`verifier_name`),
  KEY `lead_status` (`lead_status`),
  KEY `disposition` (`disposition`),
  KEY `sub_disposition` (`sub_disposition`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `iccs_api_data`;
CREATE TABLE `iccs_api_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(25) NOT NULL,
  `service_provider` varchar(25) NOT NULL,
  `customer_name` varchar(30) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `crn_cin` varchar(20) NOT NULL,
  `location` varchar(50) NOT NULL,
  `last_call_details` varchar(150) NOT NULL,
  `issue` text NOT NULL,
  `helpdesk_number` varchar(15) NOT NULL,
  `uid_api` int(10) NOT NULL,
  `request_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_sent_dialing` tinyint(1) NOT NULL DEFAULT '0',
  `status` tinyint(4) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `ip_config`;
CREATE TABLE `ip_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(25) NOT NULL,
  `ip_address` varchar(25) NOT NULL,
  `server_port` varchar(10) NOT NULL,
  `ssh_port` varchar(10) NOT NULL,
  `s_password` varchar(75) NOT NULL,
  `pri_port` varchar(3) NOT NULL,
  `server_alias` varchar(55) NOT NULL COMMENT 'Server Display Name',
  `server_ip` varchar(25) NOT NULL,
  `service_name` varchar(25) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `server_type` char(2) DEFAULT NULL COMMENT '''DB'': Database Server, ''AV'': Asterisk VOIP Server, ''AP'': Asterisk PRI Server, ''CS'': Control Server, ''WB'': Web Server',
  PRIMARY KEY (`id`),
  KEY `client_id` (`server_type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `ivr_level`;
CREATE TABLE `ivr_level` (
  `id` double NOT NULL AUTO_INCREMENT,
  `level_id` varchar(75) DEFAULT NULL,
  `level_value` tinyint(1) DEFAULT '1',
  `did_id` varchar(75) DEFAULT NULL,
  `ivr_name` varchar(75) DEFAULT NULL,
  `voice_file` varchar(75) DEFAULT NULL,
  `key_value` varchar(75) NOT NULL DEFAULT '',
  `forward_to` varchar(45) DEFAULT '0',
  `sms_id` int(3) DEFAULT NULL,
  `prompt_id` int(3) DEFAULT NULL,
  `back_option` varchar(6) DEFAULT NULL,
  `campaign` varchar(45) DEFAULT NULL,
  `forward_type` varchar(25) DEFAULT NULL,
  `forward_number` varchar(125) DEFAULT NULL,
  `forward_campaign` varchar(45) DEFAULT NULL,
  `queue_maxtime` int(3) DEFAULT NULL,
  `forwardqueue_maxtime` int(3) DEFAULT NULL,
  `response_timeout` int(2) DEFAULT NULL,
  `digits_timeout` int(2) DEFAULT NULL,
  `voip_forward` varchar(45) DEFAULT NULL,
  `rec_sec` int(5) DEFAULT NULL,
  `invalid_voiceid` int(5) DEFAULT NULL,
  `invalid_reapeat` tinyint(4) DEFAULT NULL,
  `invalid_forwardtype` varchar(25) CHARACTER SET latin1 COLLATE latin1_spanish_ci DEFAULT NULL,
  `invalid_forwardname` varchar(25) CHARACTER SET latin1 COLLATE latin1_spanish_ci DEFAULT NULL,
  `invalid_forwardmaxtime` int(3) DEFAULT NULL,
  `timeout_voiceid` int(5) DEFAULT NULL,
  `timeout_reapeat` tinyint(4) DEFAULT NULL,
  `timeout_forwardtype` varchar(25) DEFAULT NULL,
  `timeout_forwardname` varchar(25) DEFAULT NULL,
  `timeout_forwardmaxtime` int(3) DEFAULT NULL,
  `campaign_fskill` varchar(25) DEFAULT NULL,
  `campaign_sskill` varchar(25) CHARACTER SET latin1 COLLATE latin1_spanish_ci DEFAULT NULL,
  `invalid_skill` varchar(25) CHARACTER SET latin1 COLLATE latin1_spanish_ci DEFAULT NULL,
  `timeout_skill` varchar(25) DEFAULT NULL,
  `invalid_vmt` int(3) DEFAULT NULL,
  `timeout_vmt` int(3) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `update_by_ip` varchar(20) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `level_id` (`level_id`),
  KEY `did_id` (`did_id`),
  KEY `sms_id` (`sms_id`),
  KEY `prompt_id` (`prompt_id`),
  KEY `level_value` (`level_value`),
  KEY `campaign` (`campaign`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `java_cron`;
CREATE TABLE `java_cron` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cron_name` varchar(30) NOT NULL,
  `cron_minute` varchar(20) NOT NULL DEFAULT '*',
  `cron_hour` varchar(20) NOT NULL DEFAULT '*',
  `cron_day` varchar(20) NOT NULL DEFAULT '*',
  `cron_month` varchar(20) NOT NULL DEFAULT '*',
  `cron_week` varchar(20) NOT NULL DEFAULT '*',
  `cron_url` varchar(500) NOT NULL,
  `is_url` tinyint(1) NOT NULL DEFAULT '1',
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `lead`;
CREATE TABLE `lead` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `phone` varchar(45) NOT NULL DEFAULT '',
  `name` varchar(45) NOT NULL DEFAULT '',
  `address` varchar(255) DEFAULT NULL,
  `general` varchar(255) DEFAULT NULL,
  `campaign` varchar(45) NOT NULL DEFAULT '',
  `country` varchar(45) NOT NULL DEFAULT '',
  `loadtime` datetime NOT NULL,
  `filepath` varchar(255) NOT NULL DEFAULT '',
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `attempt` tinyint(1) NOT NULL DEFAULT '0',
  `is_dialing` tinyint(1) DEFAULT '0',
  `cdr_uniqueid` varchar(25) DEFAULT NULL,
  `uniqueid` varchar(25) DEFAULT NULL,
  `is_duplicate` tinyint(1) DEFAULT '0',
  `client_id` int(5) DEFAULT NULL,
  `response` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `uniqueid` (`uniqueid`),
  KEY `cdr_uniqueid` (`cdr_uniqueid`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `lead_dataset`;
CREATE TABLE `lead_dataset` (
  `id` int(7) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(50) DEFAULT NULL,
  `extension` varchar(5) DEFAULT NULL,
  `campaign` varchar(30) DEFAULT NULL,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `lead_name` varchar(30) DEFAULT NULL,
  `lead_rows` int(7) DEFAULT '0',
  `lead_mode` int(2) NOT NULL DEFAULT '0',
  `is_imported` tinyint(1) NOT NULL DEFAULT '0',
  `total_lines` int(11) NOT NULL DEFAULT '0',
  `in_process` tinyint(1) NOT NULL DEFAULT '0',
  `retry_type` tinyint(1) NOT NULL DEFAULT '1',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `delete_time` datetime NOT NULL,
  `upload_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `zone_mode` int(3) NOT NULL DEFAULT '1',
  `zone_field` varchar(100) NOT NULL,
  `update_by_user` varchar(25) NOT NULL,
  `update_by_ip` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_id_lead_name` (`client_id`,`lead_name`),
  KEY `lead_mode` (`lead_mode`),
  KEY `campaign` (`campaign`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `lead_source_sms_cap`;
CREATE TABLE `lead_source_sms_cap` (
  `id` bigint(15) NOT NULL AUTO_INCREMENT,
  `source` char(20) NOT NULL,
  `client_id` int(4) NOT NULL DEFAULT '0',
  `phone` varchar(15) NOT NULL,
  `campaign` varchar(25) NOT NULL,
  `next_sent_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `source` (`source`),
  KEY `client_id` (`client_id`),
  KEY `phone` (`phone`),
  KEY `campaign` (`campaign`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `lead_source_whatsapp_cap`;
CREATE TABLE `lead_source_whatsapp_cap` (
  `id` bigint(15) NOT NULL AUTO_INCREMENT,
  `source` char(20) NOT NULL,
  `client_id` int(4) NOT NULL DEFAULT '0',
  `phone` varchar(15) NOT NULL,
  `campaign` varchar(25) NOT NULL,
  `next_sent_time` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `source` (`source`),
  KEY `client_id` (`client_id`),
  KEY `phone` (`phone`),
  KEY `campaign` (`campaign`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `lead_upload`;
CREATE TABLE `lead_upload` (
  `id` int(7) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(50) DEFAULT NULL,
  `extension` varchar(5) DEFAULT NULL,
  `campaign` varchar(30) DEFAULT NULL,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `lead_name` varchar(30) DEFAULT NULL,
  `lead_rows` int(7) DEFAULT '0',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `reload_attempt` int(3) DEFAULT '0',
  `lead_mode` int(2) NOT NULL DEFAULT '0',
  `is_imported` tinyint(1) NOT NULL DEFAULT '0',
  `total_lines` int(11) NOT NULL DEFAULT '0',
  `in_process` tinyint(1) NOT NULL DEFAULT '0',
  `retry_type` tinyint(1) NOT NULL DEFAULT '1',
  `retry_attempt_type` int(2) NOT NULL DEFAULT '0',
  `retry_time` datetime NOT NULL,
  `zone_mode` int(3) NOT NULL DEFAULT '1' COMMENT '1=Plain Dialing, 2=Defined In Upload Time, 3=Pattern Matching',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `delete_time` datetime NOT NULL,
  `upload_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `zone_field` varchar(100) NOT NULL,
  `max_attempt_per_day` int(3) NOT NULL DEFAULT '0',
  `max_attempt` int(3) NOT NULL DEFAULT '10',
  `is_send_dialing` tinyint(1) NOT NULL DEFAULT '0',
  `check_dnd` tinyint(1) NOT NULL DEFAULT '0',
  `is_dnd_checked` tinyint(1) NOT NULL DEFAULT '0',
  `offtime_dialing_priority` int(1) NOT NULL DEFAULT '1' COMMENT '1 = offtime priority high',
  `dialing_queue_store` int(1) NOT NULL DEFAULT '0',
  `update_by_user` varchar(25) NOT NULL,
  `update_by_ip` varchar(25) NOT NULL,
  `is_dialing` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `lead_name` (`lead_name`),
  KEY `lead_mode` (`lead_mode`),
  KEY `campaign` (`campaign`),
  KEY `client_id` (`client_id`),
  KEY `is_active` (`is_active`),
  KEY `is_deleted` (`is_deleted`),
  KEY `check_dnd` (`check_dnd`),
  KEY `is_dnd_checked` (`is_dnd_checked`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `lead_upload_log`;
CREATE TABLE `lead_upload_log` (
  `id` int(7) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(50) DEFAULT NULL,
  `extension` varchar(5) DEFAULT NULL,
  `campaign` varchar(30) DEFAULT NULL,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `lead_name` varchar(30) DEFAULT NULL,
  `lead_rows` int(7) DEFAULT '0',
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `reload_attempt` int(3) DEFAULT '0',
  `lead_mode` int(2) NOT NULL DEFAULT '0',
  `is_imported` tinyint(1) NOT NULL DEFAULT '0',
  `total_lines` int(11) NOT NULL DEFAULT '0',
  `in_process` tinyint(1) NOT NULL DEFAULT '0',
  `retry_type` tinyint(1) NOT NULL DEFAULT '1',
  `retry_time` datetime NOT NULL,
  `zone_mode` int(3) NOT NULL DEFAULT '1' COMMENT '1=Plain Dialing, 2=Defined In Upload Time, 3=Pattern Matching',
  `is_active` tinyint(1) NOT NULL DEFAULT '0',
  `is_deleted` tinyint(1) NOT NULL DEFAULT '0',
  `delete_time` datetime NOT NULL,
  `upload_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `zone_field` varchar(100) NOT NULL,
  `max_attempt_per_day` int(3) NOT NULL DEFAULT '0',
  `max_attempt` int(3) NOT NULL DEFAULT '10',
  `is_send_dialing` tinyint(1) NOT NULL DEFAULT '0',
  `update_time` datetime NOT NULL,
  `update_rows` int(7) NOT NULL DEFAULT '0',
  `update_disposition` varchar(255) NOT NULL,
  `check_duplicate` tinyint(1) NOT NULL DEFAULT '0',
  `check_active` tinyint(1) NOT NULL DEFAULT '0',
  `reload_mode` int(3) NOT NULL,
  `update_by_user` varchar(25) NOT NULL,
  `update_by_ip` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `lead_mode` (`lead_mode`),
  KEY `campaign` (`campaign`),
  KEY `lead_name` (`lead_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `license`;
CREATE TABLE `license` (
  `param_name` varchar(25) COLLATE latin1_general_ci NOT NULL,
  `param_value` varchar(25) COLLATE latin1_general_ci NOT NULL,
  `param_value_previous` varchar(25) COLLATE latin1_general_ci NOT NULL DEFAULT '',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `param_name_client_id` (`param_name`,`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_general_ci;


DROP TABLE IF EXISTS `loginhour`;
CREATE TABLE `loginhour` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent` varchar(45) DEFAULT '0',
  `campaign` varchar(45) DEFAULT '0',
  `login_time` datetime DEFAULT '0000-00-00 00:00:00',
  `logout_time` datetime DEFAULT '0000-00-00 00:00:00',
  `free_time` datetime DEFAULT NULL,
  `ip_address` varchar(20) DEFAULT NULL,
  `mac_address` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  `agent_version` char(10) NOT NULL,
  KEY `agent` (`agent`),
  KEY `campaign` (`campaign`),
  KEY `loginid` (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED
/*!50100 PARTITION BY LIST (client_id)
(PARTITION c0 VALUES IN (0) ENGINE = InnoDB,
 PARTITION c9218 VALUES IN (9218) ENGINE = InnoDB,
 PARTITION c9010 VALUES IN (9010) ENGINE = InnoDB,
 PARTITION c2170 VALUES IN (2170) ENGINE = InnoDB,
 PARTITION c2281 VALUES IN (2281) ENGINE = InnoDB,
 PARTITION c2043 VALUES IN (2043) ENGINE = InnoDB,
 PARTITION c2438 VALUES IN (2438) ENGINE = InnoDB,
 PARTITION c1977 VALUES IN (1977) ENGINE = InnoDB,
 PARTITION c1713 VALUES IN (1713) ENGINE = InnoDB,
 PARTITION c2949 VALUES IN (2949) ENGINE = InnoDB,
 PARTITION c3181 VALUES IN (3181) ENGINE = InnoDB,
 PARTITION c3636 VALUES IN (3636) ENGINE = InnoDB,
 PARTITION c2687 VALUES IN (2687) ENGINE = InnoDB,
 PARTITION c9460 VALUES IN (9460) ENGINE = InnoDB,
 PARTITION c9084 VALUES IN (9084) ENGINE = InnoDB,
 PARTITION c8535 VALUES IN (8535) ENGINE = InnoDB,
 PARTITION c8060 VALUES IN (8060) ENGINE = InnoDB,
 PARTITION c8525 VALUES IN (8525) ENGINE = InnoDB,
 PARTITION c8050 VALUES IN (8050) ENGINE = InnoDB,
 PARTITION c7560 VALUES IN (7560) ENGINE = InnoDB,
 PARTITION c5913 VALUES IN (5913) ENGINE = InnoDB,
 PARTITION c9997 VALUES IN (9997) ENGINE = InnoDB,
 PARTITION c9004 VALUES IN (9004) ENGINE = InnoDB,
 PARTITION c3000 VALUES IN (3000) ENGINE = InnoDB,
 PARTITION c4666 VALUES IN (4666) ENGINE = InnoDB,
 PARTITION c5568 VALUES IN (5568) ENGINE = InnoDB,
 PARTITION c5409 VALUES IN (5409) ENGINE = InnoDB,
 PARTITION c4984 VALUES IN (4984) ENGINE = InnoDB,
 PARTITION c4492 VALUES IN (4492) ENGINE = InnoDB,
 PARTITION c7910 VALUES IN (7910) ENGINE = InnoDB,
 PARTITION c6158 VALUES IN (6158) ENGINE = InnoDB,
 PARTITION c4595 VALUES IN (4595) ENGINE = InnoDB,
 PARTITION c8363 VALUES IN (8363) ENGINE = InnoDB,
 PARTITION c8133 VALUES IN (8133) ENGINE = InnoDB,
 PARTITION c8014 VALUES IN (8014) ENGINE = InnoDB,
 PARTITION c2919 VALUES IN (2919) ENGINE = InnoDB,
 PARTITION c9624 VALUES IN (9624) ENGINE = InnoDB,
 PARTITION c8295 VALUES IN (8295) ENGINE = InnoDB,
 PARTITION c9813 VALUES IN (9813) ENGINE = InnoDB,
 PARTITION c7323 VALUES IN (7323) ENGINE = InnoDB,
 PARTITION c4235 VALUES IN (4235) ENGINE = InnoDB,
 PARTITION c5957 VALUES IN (5957) ENGINE = InnoDB,
 PARTITION c6292 VALUES IN (6292) ENGINE = InnoDB,
 PARTITION c3738 VALUES IN (3738) ENGINE = InnoDB,
 PARTITION c8782 VALUES IN (8782) ENGINE = InnoDB,
 PARTITION c6226 VALUES IN (6226) ENGINE = InnoDB,
 PARTITION c3873 VALUES IN (3873) ENGINE = InnoDB,
 PARTITION c9996 VALUES IN (9996) ENGINE = InnoDB,
 PARTITION c7337 VALUES IN (7337) ENGINE = InnoDB,
 PARTITION c8319 VALUES IN (8319) ENGINE = InnoDB,
 PARTITION c9414 VALUES IN (9414) ENGINE = InnoDB,
 PARTITION c1311 VALUES IN (1311) ENGINE = InnoDB,
 PARTITION c4648 VALUES IN (4648) ENGINE = InnoDB,
 PARTITION c4004 VALUES IN (4004) ENGINE = InnoDB,
 PARTITION c7687 VALUES IN (7687) ENGINE = InnoDB,
 PARTITION c1213 VALUES IN (1213) ENGINE = InnoDB,
 PARTITION c9945 VALUES IN (9945) ENGINE = InnoDB,
 PARTITION c7961 VALUES IN (7961) ENGINE = InnoDB,
 PARTITION c1431 VALUES IN (1431) ENGINE = InnoDB,
 PARTITION c5454 VALUES IN (5454) ENGINE = InnoDB,
 PARTITION c5999 VALUES IN (5999) ENGINE = InnoDB,
 PARTITION c8747 VALUES IN (8747) ENGINE = InnoDB,
 PARTITION c9670 VALUES IN (9670) ENGINE = InnoDB,
 PARTITION c6068 VALUES IN (6068) ENGINE = InnoDB,
 PARTITION c4870 VALUES IN (4870) ENGINE = InnoDB,
 PARTITION c2665 VALUES IN (2665) ENGINE = InnoDB,
 PARTITION c6086 VALUES IN (6086) ENGINE = InnoDB,
 PARTITION c1546 VALUES IN (1546) ENGINE = InnoDB,
 PARTITION c3322 VALUES IN (3322) ENGINE = InnoDB,
 PARTITION c8098 VALUES IN (8098) ENGINE = InnoDB,
 PARTITION c4778 VALUES IN (4778) ENGINE = InnoDB,
 PARTITION c8532 VALUES IN (8532) ENGINE = InnoDB,
 PARTITION c9506 VALUES IN (9506) ENGINE = InnoDB,
 PARTITION c9817 VALUES IN (9817) ENGINE = InnoDB,
 PARTITION c3936 VALUES IN (3936) ENGINE = InnoDB,
 PARTITION c8226 VALUES IN (8226) ENGINE = InnoDB,
 PARTITION c8489 VALUES IN (8489) ENGINE = InnoDB,
 PARTITION c2194 VALUES IN (2194) ENGINE = InnoDB,
 PARTITION c7656 VALUES IN (7656) ENGINE = InnoDB,
 PARTITION c6228 VALUES IN (6228) ENGINE = InnoDB,
 PARTITION c6050 VALUES IN (6050) ENGINE = InnoDB) */;


DROP TABLE IF EXISTS `log_table`;
CREATE TABLE `log_table` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action` varchar(20) NOT NULL,
  `update_by_user` varchar(30) NOT NULL,
  `update_by_ip` varchar(30) NOT NULL,
  `update_time` datetime NOT NULL,
  `table_name` varchar(30) NOT NULL,
  `field_name` varchar(30) NOT NULL,
  `update_for` varchar(30) NOT NULL,
  `old_data` text NOT NULL,
  `new_data` text NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `table_name` (`table_name`),
  KEY `agent_name` (`update_by_user`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `map_campaign_did`;
CREATE TABLE `map_campaign_did` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `did_id` int(5) NOT NULL,
  `campaign_name` varchar(25) NOT NULL,
  `did_number` varchar(15) NOT NULL,
  `did_number_digits` varchar(15) NOT NULL,
  `group_name` varchar(15) NOT NULL,
  `server_id` int(2) NOT NULL,
  `pri_number` int(5) NOT NULL,
  `music_on_hold` varchar(45) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `map_extension_agent`;
CREATE TABLE `map_extension_agent` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `exten` int(11) NOT NULL,
  `agent` varchar(35) NOT NULL,
  `client_id` int(5) NOT NULL,
  `update_by_user` varchar(35) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL DEFAULT '000.000.000.000',
  `update_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `map_user_mode`;
CREATE TABLE `map_user_mode` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(24) NOT NULL,
  `mode_index` int(11) NOT NULL,
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `master_city`;
CREATE TABLE `master_city` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `city` varchar(45) NOT NULL,
  `file_name` varchar(45) NOT NULL,
  `client_id` int(5) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `file_name` (`file_name`),
  KEY `city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `master_dialingratio`;
CREATE TABLE `master_dialingratio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(45) NOT NULL,
  `priority` tinyint(1) NOT NULL DEFAULT '1',
  `dialing_ratio` int(3) NOT NULL,
  `client_id` int(5) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `master_language`;
CREATE TABLE `master_language` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `language_code` varchar(5) NOT NULL,
  `language_name` varchar(45) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `master_live_color`;
CREATE TABLE `master_live_color` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `agent_status` varchar(20) DEFAULT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `min_0_color` varchar(10) DEFAULT NULL,
  `min_1_color` varchar(10) DEFAULT NULL,
  `min_2_color` varchar(10) DEFAULT NULL,
  `min_3_color` varchar(10) DEFAULT NULL,
  `min_4_color` varchar(10) DEFAULT NULL,
  `min_5_color` varchar(10) DEFAULT NULL,
  `min_6_color` varchar(10) DEFAULT NULL,
  `min_7_color` varchar(10) DEFAULT NULL,
  `min_8_color` varchar(10) DEFAULT NULL,
  `min_9_color` varchar(10) DEFAULT NULL,
  `min_10_color` varchar(10) DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `agent_status` (`agent_status`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `master_operator`;
CREATE TABLE `master_operator` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voip` varchar(45) NOT NULL,
  `prefix` varchar(20) NOT NULL,
  `country` varchar(45) NOT NULL,
  `operator` varchar(45) NOT NULL,
  `pulse` varchar(10) NOT NULL,
  `rate` float(7,2) NOT NULL DEFAULT '0.00',
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `disable_date` datetime NOT NULL,
  `edit_date` datetime NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `prefix` (`prefix`),
  KEY `voip` (`voip`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `master_server`;
CREATE TABLE `master_server` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT 'Server ID',
  `server_name` varchar(25) DEFAULT NULL COMMENT 'Server Name',
  `server_alias` varchar(55) DEFAULT NULL COMMENT 'Server Display Name',
  `server_ip` varchar(17) DEFAULT NULL COMMENT 'Server IP',
  `server_status` tinyint(1) DEFAULT '1' COMMENT '1= Active 0= Inactive',
  `is_connected` tinyint(1) DEFAULT '0' COMMENT '1= Active 0= Inactive',
  `is_dial_local` tinyint(1) DEFAULT '0' COMMENT '1= Active 0= Inactive',
  `is_asterisk` tinyint(1) DEFAULT '1',
  `cs_alert` varchar(255) DEFAULT NULL,
  `cs_alert_time` varchar(255) DEFAULT NULL,
  `dialing_buffer` int(11) DEFAULT '0',
  `pri_port` int(3) DEFAULT NULL,
  `s_password` varchar(75) DEFAULT NULL,
  `server_port` varchar(25) DEFAULT NULL,
  `server_id` int(2) DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `server_ip` (`server_ip`),
  KEY `server_name` (`server_name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL DEFAULT '',
  `file_path` varchar(100) DEFAULT NULL,
  `menu_id` int(5) NOT NULL DEFAULT '0',
  `position` int(2) NOT NULL DEFAULT '0',
  `class_name` varchar(45) NOT NULL,
  `client_id` int(5) NOT NULL,
  `is_default` enum('1','0') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `misscall_info`;
CREATE TABLE `misscall_info` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phone` varchar(20) NOT NULL,
  `campaign` varchar(50) NOT NULL,
  `dataid` int(11) NOT NULL,
  `misscall_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `phone` (`phone`),
  KEY `campaign` (`campaign`),
  KEY `dataid` (`dataid`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `moremarks`;
CREATE TABLE `moremarks` (
  `id` double NOT NULL AUTO_INCREMENT,
  `mo_user` varchar(45) DEFAULT NULL,
  `mo_type` varchar(7) DEFAULT NULL,
  `agent` varchar(45) DEFAULT NULL,
  `agent_sip` varchar(5) DEFAULT NULL,
  `customer_phone` varchar(15) DEFAULT NULL,
  `mo_start_time` datetime DEFAULT NULL,
  `mo_remarks` text,
  `client_id` int(5) DEFAULT NULL,
  `mo_end_time` timestamp NULL DEFAULT NULL,
  `from_user_campaign` varchar(100) DEFAULT NULL COMMENT 'TL Campaign Name',
  `to_user_campaign` varchar(100) DEFAULT NULL COMMENT 'Agent Campaign Name',
  `calltype` varchar(2) DEFAULT NULL,
  `rid` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `musiconhold_agent_skill`;
CREATE TABLE `musiconhold_agent_skill` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(128) NOT NULL,
  `musiconhold` varchar(128) NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_by_user` varchar(25) NOT NULL,
  `update_by_ip` varchar(25) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`),
  KEY `musiconhold` (`musiconhold`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `music_hold_agent`;
CREATE TABLE `music_hold_agent` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(45) NOT NULL,
  `file_name` varchar(75) NOT NULL,
  `client_id` int(5) NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_by_user` varchar(25) NOT NULL,
  `update_by_ip` varchar(25) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `notifications`;
CREATE TABLE `notifications` (
  `notificationid` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('0','1','2') NOT NULL DEFAULT '2' COMMENT '0 - critical 1 - alert 2 - info',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `foruser` varchar(50) NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `send` enum('1','0') NOT NULL DEFAULT '0',
  `read` enum('1','0') NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL DEFAULT '0',
  PRIMARY KEY (`notificationid`),
  KEY `client_id` (`client_id`),
  KEY `foruser` (`foruser`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `permission_configuration`;
CREATE TABLE `permission_configuration` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `userid` varchar(30) NOT NULL,
  `main` varchar(30) NOT NULL,
  `pkey` varchar(50) NOT NULL,
  `pvalue` enum('on','off') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `clinent_id` (`client_id`),
  KEY `key` (`pkey`),
  KEY `main` (`main`),
  KEY `userid` (`userid`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `post_call`;
CREATE TABLE `post_call` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `did_number` varchar(15) NOT NULL,
  `cli_number` varchar(15) NOT NULL,
  `customer_number` varchar(15) NOT NULL,
  `unique_id` varchar(15) NOT NULL,
  `vmn` varchar(15) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `post_call_log`;
CREATE TABLE `post_call_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `did_number` varchar(15) NOT NULL,
  `cli_number` varchar(15) NOT NULL,
  `customer_number` varchar(15) NOT NULL,
  `unique_id` varchar(15) NOT NULL,
  `vmn` varchar(15) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `post_tbl_data` datetime NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `prefix_config`;
CREATE TABLE `prefix_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voip_id` int(11) DEFAULT NULL,
  `voip_alias` varchar(15) DEFAULT NULL,
  `prefix` varchar(25) DEFAULT NULL,
  `callerid` varchar(15) DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `pri_status`;
CREATE TABLE `pri_status` (
  `id` int(11) NOT NULL DEFAULT '0',
  `status` varchar(45) NOT NULL DEFAULT '',
  `pdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(5) NOT NULL,
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `PTL_Customer`;
CREATE TABLE `PTL_Customer` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mobile` varchar(50) NOT NULL,
  `flag` int(2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
  `id` int(30) NOT NULL AUTO_INCREMENT,
  `question` text,
  `response_id` int(30) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `queue_hangupby_log`;
CREATE TABLE `queue_hangupby_log` (
  `callid` varchar(30) NOT NULL,
  `agent` varchar(25) NOT NULL,
  `hangup_by` varchar(20) NOT NULL,
  `client_id` int(5) NOT NULL,
  KEY `callid` (`callid`),
  KEY `hangup_by` (`hangup_by`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `recall`;
CREATE TABLE `recall` (
  `id` double NOT NULL AUTO_INCREMENT,
  `phone` varchar(45) DEFAULT NULL,
  `dataid` varchar(20) DEFAULT '0',
  `campaign` varchar(45) DEFAULT NULL,
  `cdate` datetime DEFAULT NULL,
  `agent` varchar(45) DEFAULT NULL,
  `status` varchar(1) NOT NULL DEFAULT '1',
  `client_id` int(5) NOT NULL DEFAULT '0',
  `recall_by` varchar(25) DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `recall_type` varchar(25) DEFAULT 'cba',
  `rid` varchar(50) DEFAULT NULL,
  `calltype` varchar(3) DEFAULT NULL,
  `map_by` varchar(50) DEFAULT NULL,
  `data_flag` tinyint(1) DEFAULT '0',
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `phone` (`phone`),
  KEY `dataid` (`dataid`),
  KEY `campaign` (`campaign`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `recall_log`;
CREATE TABLE `recall_log` (
  `id` double NOT NULL AUTO_INCREMENT,
  `phone` varchar(45) DEFAULT NULL,
  `dataid` varchar(20) DEFAULT NULL,
  `campaign` varchar(45) DEFAULT NULL,
  `cdate` datetime DEFAULT NULL,
  `agent` varchar(45) DEFAULT NULL,
  `status` varchar(1) NOT NULL DEFAULT '1',
  `client_id` int(5) NOT NULL DEFAULT '0',
  `recall_by` varchar(25) DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  `update_by_user` varchar(25) NOT NULL,
  `update_by_ip` varchar(25) NOT NULL,
  `recall_type` varchar(25) DEFAULT 'cba',
  `rid` varchar(50) DEFAULT NULL,
  `calltype` varchar(3) DEFAULT NULL,
  `map_by` varchar(50) DEFAULT NULL,
  `disposition` varchar(50) DEFAULT NULL,
  `sub_disposition` varchar(50) DEFAULT NULL,
  `created_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status_flag` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0: Dialed, 1: Processed',
  KEY `phone` (`phone`),
  KEY `dataid` (`dataid`),
  KEY `campaign` (`campaign`),
  KEY `client_id` (`client_id`),
  KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `recharge`;
CREATE TABLE `recharge` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(3) DEFAULT '0',
  `amount` double(7,2) DEFAULT NULL,
  `previous_amount` double(7,2) DEFAULT NULL,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `recording_download_log`;
CREATE TABLE `recording_download_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(30) NOT NULL,
  `agent` varchar(30) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `rid` varchar(50) NOT NULL,
  `action_by` varchar(30) NOT NULL,
  `action_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `action` enum('Download','Listen') NOT NULL,
  `update_by_user` varchar(30) NOT NULL,
  `update_by_ip` varchar(20) NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `campaign` (`campaign`),
  KEY `agent` (`agent`),
  KEY `phone` (`phone`),
  KEY `rid` (`rid`),
  KEY `client_id` (`client_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `record_comment`;
CREATE TABLE `record_comment` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `record_id` varchar(25) NOT NULL,
  `comment` text NOT NULL,
  `user_id` varchar(45) NOT NULL,
  `client_id` varchar(25) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `record_id_client_id` (`record_id`,`client_id`),
  KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `record_path`;
CREATE TABLE `record_path` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `path` varchar(255) DEFAULT NULL,
  `client_id` varchar(5) DEFAULT NULL,
  `status` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `reg_check`;
CREATE TABLE `reg_check` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mobile` varchar(15) NOT NULL,
  `subscription_date` date NOT NULL,
  `flag` int(2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `reload_lead_agent_disposition`;
CREATE TABLE `reload_lead_agent_disposition` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(25) DEFAULT NULL,
  `lead_id` varchar(25) DEFAULT NULL,
  `config_id` int(7) DEFAULT NULL,
  `disposition` varchar(100) DEFAULT NULL,
  `sub_disposition` varchar(100) DEFAULT NULL,
  `sub_disposition_attempt` int(3) DEFAULT NULL,
  `next_reload_minute` int(5) DEFAULT '0',
  `flag` tinyint(1) DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sub_disposition_disposition_lead_id_campaign_id` (`sub_disposition`,`disposition`,`lead_id`,`campaign_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `reload_lead_dialer_disposition`;
CREATE TABLE `reload_lead_dialer_disposition` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_id` varchar(25) NOT NULL,
  `lead_id` varchar(25) DEFAULT NULL,
  `config_id` int(7) DEFAULT NULL,
  `disposition` varchar(40) DEFAULT NULL,
  `dialer_disposition_attempt` int(3) DEFAULT NULL,
  `next_reload_minute` int(5) DEFAULT '0',
  `flag` tinyint(1) DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `cdate` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `disposition_lead_id_campaign_id` (`disposition`,`lead_id`,`campaign_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `report_log`;
CREATE TABLE `report_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent` varchar(25) NOT NULL,
  `client_id` int(5) NOT NULL,
  `cdate` datetime NOT NULL,
  `request_report` varchar(25) NOT NULL,
  `response_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `type` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `agent` (`agent`),
  KEY `client_id` (`client_id`),
  KEY `cdate` (`cdate`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `responses`;
CREATE TABLE `responses` (
  `id` int(30) NOT NULL AUTO_INCREMENT,
  `response_message` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `scheduler_report`;
CREATE TABLE `scheduler_report` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schedule_type` tinyint(1) NOT NULL DEFAULT '0' COMMENT '0=none,1=daily,2=weekly',
  `schedule_day` varchar(25) NOT NULL,
  `schedule_time` time NOT NULL,
  `template_name` varchar(25) NOT NULL,
  `sender_emailid` varchar(225) NOT NULL,
  `template_query` text NOT NULL,
  `report_type` varchar(25) NOT NULL,
  `attachment_too` tinyint(1) NOT NULL DEFAULT '1',
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) NOT NULL,
  `update_by_ip` varchar(25) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `schedule_log`;
CREATE TABLE `schedule_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(50) NOT NULL,
  `campaign` varchar(50) NOT NULL,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `s_monday` tinyint(1) DEFAULT '0',
  `s_tuesday` tinyint(1) DEFAULT '0',
  `s_wednesday` tinyint(1) DEFAULT '0',
  `s_thursday` tinyint(1) DEFAULT '0',
  `s_friday` tinyint(1) DEFAULT '0',
  `s_saturday` tinyint(1) DEFAULT '0',
  `s_sunday` tinyint(1) DEFAULT '0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `sip_ip_map`;
CREATE TABLE `sip_ip_map` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sip_id` int(11) DEFAULT NULL,
  `sip_ip` varchar(16) DEFAULT NULL,
  `mac` varchar(100) NOT NULL,
  `agent_id` varchar(25) NOT NULL,
  `sip_status` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  `extension_type` enum('pri','voip') DEFAULT NULL,
  `server_id` int(11) DEFAULT NULL,
  `agent_last_logged` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sip_id` (`sip_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `sip_request`;
CREATE TABLE `sip_request` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(45) DEFAULT NULL,
  `sys_ip` varchar(20) DEFAULT NULL,
  `sys_mac` varchar(20) DEFAULT NULL,
  `req_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  `req_type` varchar(1) DEFAULT 'A',
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `skill_master`;
CREATE TABLE `skill_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `skill_name` varchar(25) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `update_by_ip` varchar(15) NOT NULL,
  `update_datetime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `skill_name_client_id` (`skill_name`,`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `sms_config`;
CREATE TABLE `sms_config` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `route_name` varchar(35) NOT NULL,
  `api` varchar(255) DEFAULT NULL,
  `param_1` varchar(20) DEFAULT NULL,
  `param_2` varchar(20) DEFAULT NULL,
  `param_3` varchar(20) DEFAULT NULL,
  `param_4` varchar(20) DEFAULT NULL,
  `param_5` varchar(20) DEFAULT NULL,
  `param_6` varchar(20) DEFAULT NULL,
  `param_7` varchar(20) DEFAULT NULL,
  `param_8` varchar(20) DEFAULT NULL,
  `param_9` varchar(20) DEFAULT NULL,
  `param_10` varchar(20) DEFAULT NULL,
  `value_1` varchar(50) DEFAULT NULL,
  `value_2` varchar(50) DEFAULT NULL,
  `value_3` varchar(20) DEFAULT NULL,
  `value_4` varchar(20) DEFAULT NULL,
  `value_5` varchar(20) DEFAULT NULL,
  `value_6` varchar(20) DEFAULT NULL,
  `value_7` varchar(20) DEFAULT NULL,
  `value_8` varchar(20) DEFAULT NULL,
  `value_9` varchar(20) DEFAULT NULL,
  `value_10` varchar(20) DEFAULT NULL,
  `prefix` varchar(25) DEFAULT NULL,
  `request_method` varchar(25) DEFAULT NULL,
  `headers` varchar(125) DEFAULT NULL,
  `content_type` varchar(125) DEFAULT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `sms_inbox`;
CREATE TABLE `sms_inbox` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mobile_no` varchar(15) DEFAULT NULL,
  `template_id` varchar(25) DEFAULT NULL,
  `message` text,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(8) DEFAULT NULL,
  `sms_status` tinyint(1) DEFAULT '1',
  `agent` varchar(75) DEFAULT NULL,
  `Campaign_Name` varchar(40) DEFAULT NULL,
  `rid` varchar(25) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mobile_no` (`mobile_no`),
  KEY `client_id` (`client_id`),
  KEY `agent` (`agent`),
  KEY `Campaign_Name` (`Campaign_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `sms_outbox`;
CREATE TABLE `sms_outbox` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mobile_no` varchar(15) DEFAULT NULL,
  `template_id` varchar(25) DEFAULT NULL,
  `message` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `sms_status` tinyint(1) DEFAULT NULL,
  `agent` varchar(75) DEFAULT NULL,
  `Campaign_Name` varchar(40) DEFAULT NULL,
  `route_id` int(4) DEFAULT NULL,
  `tiny_config_id` int(11) NOT NULL DEFAULT '0',
  `tiny_url_sent` varchar(255) DEFAULT NULL,
  `tiny_id` int(11) NOT NULL DEFAULT '0',
  `rid` varchar(25) DEFAULT NULL,
  `skill` varchar(25) DEFAULT NULL,
  `sms_status_id` int(3) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `mobile_no` (`mobile_no`),
  KEY `client_id` (`client_id`),
  KEY `agent` (`agent`),
  KEY `Campaign_Name` (`Campaign_Name`),
  KEY `skill` (`skill`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `sms_sent`;
CREATE TABLE `sms_sent` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mobile_no` varchar(75) DEFAULT NULL,
  `template_id` varchar(25) DEFAULT NULL,
  `message` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(7) DEFAULT '0',
  `sms_status` text,
  `ref_id` varchar(30) DEFAULT NULL,
  `final_status` text,
  `agent` varchar(75) DEFAULT NULL,
  `Campaign_Name` varchar(40) DEFAULT NULL,
  `route_id` int(4) DEFAULT NULL,
  `tiny_config_id` int(11) NOT NULL DEFAULT '0',
  `tiny_url_sent` varchar(255) DEFAULT NULL,
  `tiny_id` int(11) NOT NULL DEFAULT '0',
  `rid` varchar(25) DEFAULT NULL,
  `skill` varchar(25) DEFAULT NULL,
  `sms_status_id` int(3) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `mobile_no` (`mobile_no`),
  KEY `client_id` (`client_id`),
  KEY `Campaign_Name` (`Campaign_Name`),
  KEY `skill` (`skill`),
  KEY `sms_status_id` (`sms_status_id`),
  KEY `ref_id` (`ref_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `sms_sent_status`;
CREATE TABLE `sms_sent_status` (
  `id` bigint(15) NOT NULL AUTO_INCREMENT,
  `sent_id` bigint(15) NOT NULL DEFAULT '0',
  `check_api` varchar(500) NOT NULL,
  `refId` varchar(50) NOT NULL DEFAULT '',
  `check_status` tinyint(1) NOT NULL DEFAULT '1',
  `current_attempt` int(3) NOT NULL DEFAULT '0',
  `max_attempt` int(3) NOT NULL DEFAULT '1',
  `attempt_time` datetime NOT NULL,
  `attempt_status` varchar(500) NOT NULL,
  `client_id` int(3) NOT NULL DEFAULT '0',
  `route_id` int(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `sent_id` (`sent_id`),
  KEY `refId` (`refId`),
  KEY `client_id` (`client_id`),
  KEY `check_status` (`check_status`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `sms_status_api`;
CREATE TABLE `sms_status_api` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `sms_config_id` int(5) NOT NULL DEFAULT '0',
  `sms_status_api` varchar(500) NOT NULL DEFAULT '',
  `param_1` varchar(50) NOT NULL DEFAULT '',
  `param_2` varchar(50) NOT NULL DEFAULT '',
  `param_3` varchar(50) NOT NULL DEFAULT '',
  `param_4` varchar(50) NOT NULL DEFAULT '',
  `param_5` varchar(50) NOT NULL DEFAULT '',
  `value_1` varchar(50) NOT NULL DEFAULT '',
  `value_2` varchar(50) NOT NULL DEFAULT '',
  `value_3` varchar(50) NOT NULL DEFAULT '',
  `value_4` varchar(50) NOT NULL DEFAULT '',
  `value_5` varchar(50) NOT NULL DEFAULT '',
  `attempt_1` int(3) NOT NULL DEFAULT '30' COMMENT 'minutes',
  `attempt_2` int(3) NOT NULL DEFAULT '0' COMMENT 'minutes',
  `attempt_3` int(3) NOT NULL DEFAULT '0' COMMENT 'minutes',
  `attempt_4` int(3) NOT NULL DEFAULT '0' COMMENT 'minutes',
  `attempt_5` int(3) NOT NULL DEFAULT '0' COMMENT 'minutes',
  `client_id` int(3) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `sms_config_id` (`sms_config_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `sms_template`;
CREATE TABLE `sms_template` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` varchar(25) NOT NULL,
  `sms_text` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `client_id` int(8) DEFAULT NULL,
  `sms_type` varchar(75) DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `Campaign_Name` varchar(40) DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `type` enum('standard','tiny') NOT NULL DEFAULT 'standard',
  `url` varchar(255) DEFAULT NULL,
  `tiny_config_id` int(11) NOT NULL DEFAULT '0',
  `cdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `sms_type` (`sms_type`),
  KEY `Campaign_Name` (`Campaign_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `strategy`;
CREATE TABLE `strategy` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `name` (`name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `sub_disposition_master`;
CREATE TABLE `sub_disposition_master` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `disposition_id` varchar(100) NOT NULL,
  `name` varchar(75) NOT NULL DEFAULT '',
  `desc` varchar(255) DEFAULT NULL,
  `is_callback` tinyint(1) DEFAULT '0',
  `is_dnd` tinyint(1) DEFAULT '0',
  `dtype` varchar(45) DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`,`disposition_id`,`name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `summary_agent_abandon`;
CREATE TABLE `summary_agent_abandon` (
  `campaign` varchar(25) NOT NULL,
  `event` varchar(25) NOT NULL,
  `agent` varchar(25) NOT NULL,
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(3) NOT NULL DEFAULT '0',
  `update_day` int(3) NOT NULL DEFAULT '0',
  `update_week` int(3) NOT NULL DEFAULT '0',
  `update_hour` int(3) NOT NULL DEFAULT '0',
  `abandon_count` int(5) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `campaign_event_agent_summary` (`campaign`,`event`,`agent`,`update_year`,`update_month`,`update_day`,`update_week`,`update_hour`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_cdr`;
CREATE TABLE `summary_cdr` (
  `campaign` varchar(25) NOT NULL,
  `lead` varchar(25) NOT NULL,
  `call_type` varchar(2) NOT NULL,
  `disposition` varchar(40) NOT NULL,
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(2) NOT NULL DEFAULT '0',
  `update_day` int(2) NOT NULL DEFAULT '0',
  `update_week` int(2) NOT NULL DEFAULT '0',
  `update_hour` int(2) NOT NULL DEFAULT '0',
  `update_count` int(5) NOT NULL DEFAULT '0',
  `duration_sum` int(5) NOT NULL DEFAULT '0',
  `billsec_sum` int(5) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `summary_cdr` (`campaign`,`lead`,`call_type`,`disposition`,`update_year`,`update_month`,`update_day`,`update_week`,`update_hour`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_cdr_dashboard`;
CREATE TABLE `summary_cdr_dashboard` (
  `campaign` varchar(25) NOT NULL,
  `lead` varchar(25) NOT NULL,
  `call_type` varchar(2) NOT NULL,
  `skill` varchar(2) NOT NULL,
  `disposition` varchar(40) NOT NULL,
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(2) NOT NULL DEFAULT '0',
  `update_day` int(2) NOT NULL DEFAULT '0',
  `update_week` int(2) NOT NULL DEFAULT '0',
  `update_hour` int(2) NOT NULL DEFAULT '0',
  `update_count` int(5) NOT NULL DEFAULT '0',
  `duration_sum` int(5) NOT NULL DEFAULT '0',
  `billsec_sum` int(5) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `summary_cdr_dashboard` (`client_id`,`campaign`,`lead`,`call_type`,`skill`,`disposition`,`update_year`,`update_month`,`update_day`,`update_week`,`update_hour`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_channel_utilization`;
CREATE TABLE `summary_channel_utilization` (
  `campaign` varchar(25) NOT NULL,
  `call_type` varchar(2) NOT NULL,
  `dialrout` varchar(25) NOT NULL,
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(2) NOT NULL DEFAULT '0',
  `update_day` int(2) NOT NULL DEFAULT '0',
  `update_week` int(2) NOT NULL DEFAULT '0',
  `update_hour` int(2) NOT NULL DEFAULT '0',
  `update_minute` int(2) NOT NULL,
  `update_count` int(5) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `summary_channel` (`client_id`,`campaign`,`call_type`,`dialrout`,`update_year`,`update_month`,`update_day`,`update_week`,`update_hour`,`update_minute`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_channel_utilization_day`;
CREATE TABLE `summary_channel_utilization_day` (
  `campaign` varchar(25) NOT NULL,
  `call_type` varchar(2) NOT NULL,
  `dialrout` varchar(25) NOT NULL,
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(2) NOT NULL DEFAULT '0',
  `update_day` int(2) NOT NULL DEFAULT '0',
  `update_count` int(5) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `summary_channel_day` (`client_id`,`campaign`,`call_type`,`dialrout`,`update_year`,`update_month`,`update_day`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_channel_utilization_hour`;
CREATE TABLE `summary_channel_utilization_hour` (
  `campaign` varchar(25) NOT NULL,
  `call_type` varchar(2) NOT NULL,
  `dialrout` varchar(25) NOT NULL,
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(2) NOT NULL DEFAULT '0',
  `update_day` int(2) NOT NULL DEFAULT '0',
  `update_week` int(2) NOT NULL DEFAULT '0',
  `update_hour` int(2) NOT NULL DEFAULT '0',
  `update_count` int(5) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `summary_channel_hour` (`client_id`,`campaign`,`call_type`,`dialrout`,`update_year`,`update_month`,`update_day`,`update_week`,`update_hour`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_channel_utilization_month`;
CREATE TABLE `summary_channel_utilization_month` (
  `campaign` varchar(25) NOT NULL,
  `call_type` varchar(2) NOT NULL,
  `dialrout` varchar(25) NOT NULL,
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(2) NOT NULL DEFAULT '0',
  `update_count` int(5) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `summary_channel_month` (`client_id`,`campaign`,`call_type`,`dialrout`,`update_year`,`update_month`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_channel_utilization_mslot`;
CREATE TABLE `summary_channel_utilization_mslot` (
  `campaign` varchar(25) NOT NULL,
  `call_type` varchar(2) NOT NULL,
  `dialrout` varchar(25) NOT NULL,
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(2) NOT NULL DEFAULT '0',
  `update_day` int(2) NOT NULL DEFAULT '0',
  `update_week` int(2) NOT NULL DEFAULT '0',
  `update_hour` int(2) NOT NULL DEFAULT '0',
  `update_minute` int(2) NOT NULL,
  `update_count` int(5) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `summary_channel_mslot` (`client_id`,`campaign`,`call_type`,`dialrout`,`update_year`,`update_month`,`update_day`,`update_week`,`update_hour`,`update_minute`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_channel_utilization_week`;
CREATE TABLE `summary_channel_utilization_week` (
  `campaign` varchar(25) NOT NULL,
  `call_type` varchar(2) NOT NULL,
  `dialrout` varchar(25) NOT NULL,
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(2) NOT NULL DEFAULT '0',
  `update_day` int(2) NOT NULL DEFAULT '0',
  `update_week` int(2) NOT NULL DEFAULT '0',
  `update_count` int(5) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `summary_channel_week` (`client_id`,`campaign`,`call_type`,`dialrout`,`update_year`,`update_month`,`update_day`,`update_week`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_queue`;
CREATE TABLE `summary_queue` (
  `campaign` varchar(25) NOT NULL,
  `event` varchar(25) NOT NULL,
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(3) NOT NULL DEFAULT '0',
  `update_day` int(3) NOT NULL DEFAULT '0',
  `update_week` int(3) NOT NULL DEFAULT '0',
  `update_hour` int(3) NOT NULL DEFAULT '0',
  `update_count` int(5) NOT NULL DEFAULT '0',
  `waittime_sum` int(5) NOT NULL DEFAULT '0',
  `talktime_sum` int(5) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `summary_queue` (`campaign`,`event`,`update_year`,`update_month`,`update_day`,`update_week`,`update_hour`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_queue_dashboard`;
CREATE TABLE `summary_queue_dashboard` (
  `campaign` varchar(25) NOT NULL,
  `event` varchar(25) NOT NULL,
  `skill` varchar(25) NOT NULL,
  `call_type` varchar(2) NOT NULL,
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(3) NOT NULL DEFAULT '0',
  `update_day` int(3) NOT NULL DEFAULT '0',
  `update_week` int(3) NOT NULL DEFAULT '0',
  `update_hour` int(3) NOT NULL DEFAULT '0',
  `update_count` int(5) NOT NULL DEFAULT '0',
  `waittime_sum` int(5) NOT NULL DEFAULT '0',
  `talktime_sum` int(5) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `client_queue_dashboard` (`client_id`,`campaign`,`event`,`skill`,`call_type`,`update_year`,`update_month`,`update_day`,`update_week`,`update_hour`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_queue_skill`;
CREATE TABLE `summary_queue_skill` (
  `campaign` varchar(25) NOT NULL,
  `event` varchar(25) NOT NULL,
  `skill` varchar(25) NOT NULL,
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(3) NOT NULL DEFAULT '0',
  `update_day` int(3) NOT NULL DEFAULT '0',
  `update_week` int(3) NOT NULL DEFAULT '0',
  `update_hour` int(3) NOT NULL DEFAULT '0',
  `update_count` int(5) NOT NULL DEFAULT '0',
  `waittime_sum` int(5) NOT NULL DEFAULT '0',
  `talktime_sum` int(5) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `summary_queue_skill` (`client_id`,`campaign`,`event`,`skill`,`update_year`,`update_month`,`update_day`,`update_week`,`update_hour`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_user_session`;
CREATE TABLE `summary_user_session` (
  `campaign` varchar(25) NOT NULL,
  `lead` varchar(25) NOT NULL,
  `agent` varchar(25) NOT NULL,
  `mode` int(3) NOT NULL DEFAULT '0',
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(3) NOT NULL DEFAULT '0',
  `update_day` int(3) NOT NULL DEFAULT '0',
  `update_week` int(3) NOT NULL DEFAULT '0',
  `update_hour` int(3) NOT NULL DEFAULT '0',
  `update_count` int(3) NOT NULL DEFAULT '0',
  `update_aht` int(3) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `summary_disposition` (`campaign`,`lead`,`agent`,`mode`,`update_year`,`update_month`,`update_day`,`update_week`,`update_hour`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `summary_user_session_extra`;
CREATE TABLE `summary_user_session_extra` (
  `campaign` varchar(25) NOT NULL,
  `agent` varchar(25) NOT NULL,
  `mode` int(3) NOT NULL DEFAULT '0',
  `update_year` int(3) NOT NULL DEFAULT '0',
  `update_month` int(3) NOT NULL DEFAULT '0',
  `update_day` int(3) NOT NULL DEFAULT '0',
  `update_week` int(3) NOT NULL DEFAULT '0',
  `update_duration` int(3) NOT NULL DEFAULT '0',
  `update_idle` int(3) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `summary_disposition_extra` (`campaign`,`agent`,`mode`,`update_year`,`update_month`,`update_day`,`update_week`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `system_info`;
CREATE TABLE `system_info` (
  `id` int(30) NOT NULL AUTO_INCREMENT,
  `meta_field` text NOT NULL,
  `meta_value` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `tbl_language`;
CREATE TABLE `tbl_language` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `tbl_master_time_slot`;
CREATE TABLE `tbl_master_time_slot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `daywise` varchar(50) NOT NULL,
  `starttime` time NOT NULL,
  `endtime` time NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `tbl_time_slot`;
CREATE TABLE `tbl_time_slot` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `master_slot_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `slot_date` date NOT NULL,
  `starttime` time NOT NULL,
  `endtime` time NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '1',
  `book_status` tinyint(4) NOT NULL DEFAULT '0',
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `tbl_time_slot_book`;
CREATE TABLE `tbl_time_slot_book` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `master_slot_id` int(11) NOT NULL,
  `slot_date` date NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `tcc_details`;
CREATE TABLE `tcc_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `lid` int(11) DEFAULT NULL,
  `mode_id` int(11) DEFAULT NULL,
  `r_lid` int(11) DEFAULT NULL,
  `r_mode_id` int(11) DEFAULT NULL,
  `from_user` varchar(25) DEFAULT NULL,
  `to_user` varchar(25) DEFAULT NULL,
  `campaign` varchar(25) DEFAULT NULL,
  `to_campaign` varchar(25) DEFAULT NULL,
  `cdate` datetime DEFAULT NULL,
  `call_type` varchar(2) DEFAULT NULL,
  `call_rid` varchar(25) DEFAULT NULL,
  `tcc_rid` varchar(25) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `transfer_type` varchar(10) DEFAULT NULL,
  `tcc_type` varchar(2) DEFAULT NULL,
  `callerid` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `lid` (`lid`),
  KEY `mode_id` (`mode_id`),
  KEY `from_user` (`from_user`),
  KEY `to_user` (`to_user`),
  KEY `campaign` (`campaign`),
  KEY `call_rid` (`call_rid`),
  KEY `tcc_rid` (`tcc_rid`),
  KEY `client_id` (`client_id`),
  KEY `idx_call_type` (`call_type`),
  KEY `tcc_type` (`tcc_type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `temp_report`;
CREATE TABLE `temp_report` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agent` varchar(25) NOT NULL,
  `client_id` int(5) NOT NULL,
  `request_report` varchar(45) NOT NULL,
  `type` varchar(10) NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `agent` (`agent`),
  KEY `client_id` (`client_id`),
  KEY `request_report` (`request_report`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `ticket_config`;
CREATE TABLE `ticket_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ticket_base_url` text NOT NULL,
  `new_ticket_base_url` text NOT NULL,
  `ticket_db_ip` varchar(100) NOT NULL,
  `ticket_db_user` varchar(100) NOT NULL,
  `ticket_db_password` varchar(100) NOT NULL,
  `ticket_db_name` varchar(100) NOT NULL,
  `created_date` datetime NOT NULL,
  `status` tinyint(4) NOT NULL DEFAULT '0',
  `client_id` int(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `tinyurl_config`;
CREATE TABLE `tinyurl_config` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `route_name` varchar(35) NOT NULL,
  `api` varchar(255) DEFAULT NULL,
  `param_1` varchar(20) DEFAULT NULL,
  `param_2` varchar(20) DEFAULT NULL,
  `param_3` varchar(20) DEFAULT NULL,
  `param_4` varchar(20) DEFAULT NULL,
  `param_5` varchar(20) DEFAULT NULL,
  `param_6` varchar(20) DEFAULT NULL,
  `param_7` varchar(20) DEFAULT NULL,
  `param_8` varchar(20) DEFAULT NULL,
  `param_9` varchar(20) DEFAULT NULL,
  `param_10` varchar(20) DEFAULT NULL,
  `value_1` varchar(100) DEFAULT NULL,
  `value_2` varchar(20) DEFAULT NULL,
  `value_3` varchar(20) DEFAULT NULL,
  `value_4` varchar(20) DEFAULT NULL,
  `value_5` varchar(20) DEFAULT NULL,
  `value_6` varchar(20) DEFAULT NULL,
  `value_7` varchar(20) DEFAULT NULL,
  `value_8` varchar(20) DEFAULT NULL,
  `value_9` varchar(20) DEFAULT NULL,
  `value_10` varchar(20) DEFAULT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `tiny_response`;
CREATE TABLE `tiny_response` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `phone` varchar(15) NOT NULL,
  `rid` varchar(50) NOT NULL,
  `url` varchar(255) NOT NULL,
  `request_sent_on` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `tinyurl` varchar(255) NOT NULL,
  `respond_on` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `tiny_response` varchar(500) NOT NULL,
  `read` tinyint(1) NOT NULL DEFAULT '0',
  `read_time` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `read_api_hit` int(11) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `rid` (`rid`),
  KEY `client_id` (`client_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `tmp_fwcumnum`;
CREATE TABLE `tmp_fwcumnum` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `uniqueid` varchar(25) NOT NULL,
  `fromphone` varchar(15) NOT NULL,
  `tophone` varchar(15) NOT NULL,
  `campaign` varchar(25) NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tophone_campaign_client_id` (`tophone`,`campaign`,`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `tmp_queue_dashboard`;
CREATE TABLE `tmp_queue_dashboard` (
  `callid` varchar(30) NOT NULL,
  `calltype` varchar(2) NOT NULL,
  `campaign` varchar(30) NOT NULL,
  `client_id` int(5) NOT NULL,
  UNIQUE KEY `callid_client_id_campaign` (`callid`,`client_id`,`campaign`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `tree_disposition_form`;
CREATE TABLE `tree_disposition_form` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(5) NOT NULL,
  `campaign_id` varchar(255) NOT NULL,
  `node_id` int(11) NOT NULL,
  `user` varchar(100) NOT NULL,
  `disposition_id` varchar(255) NOT NULL,
  `sub_disposition_id` varchar(255) NOT NULL,
  `callback` varchar(100) NOT NULL,
  `slot` varchar(100) NOT NULL,
  `callback_time` varchar(100) NOT NULL,
  `rid` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `remarks` text NOT NULL,
  `input_data` text NOT NULL,
  `api_url` text NOT NULL,
  `api_responce` text NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `node_id` (`node_id`),
  KEY `campaign_id` (`campaign_id`),
  KEY `rid` (`rid`),
  KEY `disposition_id` (`disposition_id`),
  KEY `sub_disposition_id` (`sub_disposition_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `tree_gallery`;
CREATE TABLE `tree_gallery` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tree_id` int(11) NOT NULL,
  `media_type` varchar(50) NOT NULL,
  `hyperlink` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `long_text` text NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `extension` varchar(50) NOT NULL,
  `short_id` int(11) NOT NULL,
  `created_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tree_id` (`tree_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `type_event_master`;
CREATE TABLE `type_event_master` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(30) NOT NULL,
  `event` varchar(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `unanswered`;
CREATE TABLE `unanswered` (
  `id` int(30) NOT NULL AUTO_INCREMENT,
  `question` text,
  `no_asks` int(30) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(45) NOT NULL DEFAULT '',
  `name` varchar(45) NOT NULL DEFAULT '',
  `password` varchar(45) NOT NULL DEFAULT '',
  `auth_pin` varchar(15) DEFAULT NULL,
  `user_type` varchar(45) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `a_priority` int(4) DEFAULT '1',
  `next_dial_attempt` datetime DEFAULT NULL,
  `next_dial_in` int(3) NOT NULL DEFAULT '1',
  `last_login` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `flag` tinyint(1) DEFAULT '1',
  `agent_mobile` varchar(15) DEFAULT NULL,
  `is_mobile_app_user` tinyint(1) DEFAULT '0',
  `is_change_password` tinyint(1) DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  `imei_number` varchar(20) DEFAULT NULL,
  `first_login` tinyint(1) DEFAULT '0' COMMENT '0: Default(Not Logged In) 1: Logged In',
  `email_id` varchar(50) DEFAULT NULL,
  `disable_button` tinyint(1) DEFAULT '0',
  `time_enable` int(11) DEFAULT NULL,
  `label` text,
  `login_time` datetime DEFAULT NULL,
  `user_language` varchar(125) DEFAULT NULL,
  PRIMARY KEY (`id`,`user_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `userupload_log`;
CREATE TABLE `userupload_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `file_name` varchar(45) CHARACTER SET latin1 NOT NULL,
  `inserted_row` int(11) NOT NULL,
  `failed_row` int(11) NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_by_user` varchar(45) CHARACTER SET latin1 NOT NULL,
  `update_by_ip` varchar(75) CHARACTER SET latin1 NOT NULL,
  `client_id` varchar(25) CHARACTER SET latin1 NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_spanish_ci;


DROP TABLE IF EXISTS `user_call_control`;
CREATE TABLE `user_call_control` (
  `id` varchar(45) NOT NULL DEFAULT '0',
  `call_after_dispose` tinyint(1) NOT NULL DEFAULT '0',
  `auto_answer` tinyint(1) NOT NULL DEFAULT '1',
  `auto_dispose` tinyint(1) NOT NULL DEFAULT '0',
  `auto_dispose_time` int(3) NOT NULL DEFAULT '5',
  `client_id` int(7) NOT NULL DEFAULT '0',
  KEY `id` (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `user_campaign_map`;
CREATE TABLE `user_campaign_map` (
  `user_id` varchar(45) NOT NULL DEFAULT '0',
  `campaign_id` varchar(45) NOT NULL DEFAULT '0',
  `priority` int(3) NOT NULL DEFAULT '3',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  `skills` varchar(50) DEFAULT NULL,
  UNIQUE KEY `campaign_id_client_id_user_id` (`campaign_id`,`client_id`,`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `user_deleted`;
CREATE TABLE `user_deleted` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(45) NOT NULL DEFAULT '',
  `name` varchar(45) NOT NULL DEFAULT '',
  `password` varchar(45) NOT NULL DEFAULT '',
  `auth_pin` varchar(15) DEFAULT NULL,
  `user_type` varchar(45) DEFAULT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `a_priority` int(4) DEFAULT '1',
  `next_dial_attempt` datetime DEFAULT NULL,
  `next_dial_in` int(3) NOT NULL DEFAULT '1',
  `last_login` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `flag` tinyint(1) DEFAULT '1',
  `agent_mobile` varchar(15) DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  `imei_number` varchar(20) DEFAULT NULL,
  KEY `id` (`id`,`user_id`),
  KEY `client_id` (`client_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `user_menu`;
CREATE TABLE `user_menu` (
  `user_id` varchar(45) NOT NULL DEFAULT '0',
  `menu_id` varchar(45) NOT NULL DEFAULT '0',
  `properties` text NOT NULL,
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  UNIQUE KEY `client_id_user_id_menu_id` (`client_id`,`user_id`,`menu_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `user_mode`;
CREATE TABLE `user_mode` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_mode` varchar(20) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `mode_index` tinyint(1) DEFAULT NULL,
  `mode_color` varchar(15) DEFAULT '#FF0000',
  `is_recall` tinyint(1) NOT NULL DEFAULT '0',
  `update_by_user` varchar(25) DEFAULT 'nouser',
  `update_by_ip` varchar(25) DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_mode` (`user_mode`),
  KEY `mode_index` (`mode_index`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `user_mode_action`;
CREATE TABLE `user_mode_action` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login_id` int(11) DEFAULT NULL,
  `mode` char(2) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `call_ob` int(5) DEFAULT '0',
  `call_ob_duration` int(5) DEFAULT '0',
  `call_in` int(5) DEFAULT '0',
  `call_in_duration` int(5) DEFAULT '0',
  `call_mc` int(5) DEFAULT '0',
  `call_mc_duration` int(5) DEFAULT '0',
  `idle_duration` int(5) DEFAULT '0',
  `wrapup_duration` int(5) DEFAULT '0',
  `hold` int(5) DEFAULT '0',
  `hold_duration` int(5) DEFAULT '0',
  `transfer` int(5) DEFAULT '0',
  `transfer_duration` int(5) DEFAULT '0',
  `conference` int(5) DEFAULT '0',
  `conference_duration` int(5) DEFAULT '0',
  `recall` int(5) DEFAULT '0',
  `recall_duration` int(5) DEFAULT '0',
  `break_duration` int(5) DEFAULT '0',
  `mo_count` int(5) DEFAULT '0',
  `mo_duration` int(5) DEFAULT '0',
  `sms_count` int(4) DEFAULT '0',
  `email_count` int(4) DEFAULT '0',
  `call_pg` int(4) DEFAULT '0',
  `call_pg_duration` int(4) DEFAULT '0',
  `call_pv` int(4) DEFAULT '0',
  `call_pv_duration` int(4) DEFAULT '0',
  `call_rd` int(4) DEFAULT '0',
  `call_rd_duration` int(4) DEFAULT '0',
  `call_cl` int(4) DEFAULT '0',
  `call_cl_duration` int(4) DEFAULT '0',
  `campaign` varchar(45) DEFAULT NULL,
  `trunk` int(4) DEFAULT NULL,
  `login_status` tinyint(1) DEFAULT '0',
  `free_time` datetime DEFAULT '0000-00-00 00:00:00',
  `client_id` int(5) DEFAULT NULL,
  `review_count` int(4) DEFAULT '0',
  `review_duration` int(4) DEFAULT '0',
  `tag` varchar(100) DEFAULT NULL,
  KEY `login_id` (`login_id`),
  KEY `mode` (`mode`),
  KEY `campaign` (`campaign`),
  KEY `trunk` (`trunk`),
  KEY `modeid` (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC
/*!50100 PARTITION BY LIST (client_id)
(PARTITION c0 VALUES IN (0) ENGINE = InnoDB,
 PARTITION c9218 VALUES IN (9218) ENGINE = InnoDB,
 PARTITION c9010 VALUES IN (9010) ENGINE = InnoDB,
 PARTITION c2170 VALUES IN (2170) ENGINE = InnoDB,
 PARTITION c2281 VALUES IN (2281) ENGINE = InnoDB,
 PARTITION c2043 VALUES IN (2043) ENGINE = InnoDB,
 PARTITION c2438 VALUES IN (2438) ENGINE = InnoDB,
 PARTITION c1977 VALUES IN (1977) ENGINE = InnoDB,
 PARTITION c1713 VALUES IN (1713) ENGINE = InnoDB,
 PARTITION c2949 VALUES IN (2949) ENGINE = InnoDB,
 PARTITION c3181 VALUES IN (3181) ENGINE = InnoDB,
 PARTITION c3636 VALUES IN (3636) ENGINE = InnoDB,
 PARTITION c2687 VALUES IN (2687) ENGINE = InnoDB,
 PARTITION c9460 VALUES IN (9460) ENGINE = InnoDB,
 PARTITION c9084 VALUES IN (9084) ENGINE = InnoDB,
 PARTITION c8535 VALUES IN (8535) ENGINE = InnoDB,
 PARTITION c8060 VALUES IN (8060) ENGINE = InnoDB,
 PARTITION c8525 VALUES IN (8525) ENGINE = InnoDB,
 PARTITION c8050 VALUES IN (8050) ENGINE = InnoDB,
 PARTITION c7560 VALUES IN (7560) ENGINE = InnoDB,
 PARTITION c5913 VALUES IN (5913) ENGINE = InnoDB,
 PARTITION c9997 VALUES IN (9997) ENGINE = InnoDB,
 PARTITION c9004 VALUES IN (9004) ENGINE = InnoDB,
 PARTITION c3000 VALUES IN (3000) ENGINE = InnoDB,
 PARTITION c4666 VALUES IN (4666) ENGINE = InnoDB,
 PARTITION c5568 VALUES IN (5568) ENGINE = InnoDB,
 PARTITION c5409 VALUES IN (5409) ENGINE = InnoDB,
 PARTITION c4984 VALUES IN (4984) ENGINE = InnoDB,
 PARTITION c4492 VALUES IN (4492) ENGINE = InnoDB,
 PARTITION c7910 VALUES IN (7910) ENGINE = InnoDB,
 PARTITION c6158 VALUES IN (6158) ENGINE = InnoDB,
 PARTITION c4595 VALUES IN (4595) ENGINE = InnoDB,
 PARTITION c8363 VALUES IN (8363) ENGINE = InnoDB,
 PARTITION c8133 VALUES IN (8133) ENGINE = InnoDB,
 PARTITION c8014 VALUES IN (8014) ENGINE = InnoDB,
 PARTITION c2919 VALUES IN (2919) ENGINE = InnoDB,
 PARTITION c9624 VALUES IN (9624) ENGINE = InnoDB,
 PARTITION c8295 VALUES IN (8295) ENGINE = InnoDB,
 PARTITION c9813 VALUES IN (9813) ENGINE = InnoDB,
 PARTITION c7323 VALUES IN (7323) ENGINE = InnoDB,
 PARTITION c4235 VALUES IN (4235) ENGINE = InnoDB,
 PARTITION c5957 VALUES IN (5957) ENGINE = InnoDB,
 PARTITION c6292 VALUES IN (6292) ENGINE = InnoDB,
 PARTITION c3738 VALUES IN (3738) ENGINE = InnoDB,
 PARTITION c8782 VALUES IN (8782) ENGINE = InnoDB,
 PARTITION c6226 VALUES IN (6226) ENGINE = InnoDB,
 PARTITION c3873 VALUES IN (3873) ENGINE = InnoDB,
 PARTITION c9996 VALUES IN (9996) ENGINE = InnoDB,
 PARTITION c7337 VALUES IN (7337) ENGINE = InnoDB,
 PARTITION c8319 VALUES IN (8319) ENGINE = InnoDB,
 PARTITION c9414 VALUES IN (9414) ENGINE = InnoDB,
 PARTITION c1311 VALUES IN (1311) ENGINE = InnoDB,
 PARTITION c4648 VALUES IN (4648) ENGINE = InnoDB,
 PARTITION c4004 VALUES IN (4004) ENGINE = InnoDB,
 PARTITION c7687 VALUES IN (7687) ENGINE = InnoDB,
 PARTITION c1213 VALUES IN (1213) ENGINE = InnoDB,
 PARTITION c9945 VALUES IN (9945) ENGINE = InnoDB,
 PARTITION c7961 VALUES IN (7961) ENGINE = InnoDB,
 PARTITION c1431 VALUES IN (1431) ENGINE = InnoDB,
 PARTITION c5454 VALUES IN (5454) ENGINE = InnoDB,
 PARTITION c5999 VALUES IN (5999) ENGINE = InnoDB,
 PARTITION c8747 VALUES IN (8747) ENGINE = InnoDB,
 PARTITION c9670 VALUES IN (9670) ENGINE = InnoDB,
 PARTITION c6068 VALUES IN (6068) ENGINE = InnoDB,
 PARTITION c4870 VALUES IN (4870) ENGINE = InnoDB,
 PARTITION c2665 VALUES IN (2665) ENGINE = InnoDB,
 PARTITION c6086 VALUES IN (6086) ENGINE = InnoDB,
 PARTITION c1546 VALUES IN (1546) ENGINE = InnoDB,
 PARTITION c3322 VALUES IN (3322) ENGINE = InnoDB,
 PARTITION c8098 VALUES IN (8098) ENGINE = InnoDB,
 PARTITION c4778 VALUES IN (4778) ENGINE = InnoDB,
 PARTITION c8532 VALUES IN (8532) ENGINE = InnoDB,
 PARTITION c9506 VALUES IN (9506) ENGINE = InnoDB,
 PARTITION c9817 VALUES IN (9817) ENGINE = InnoDB,
 PARTITION c3936 VALUES IN (3936) ENGINE = InnoDB,
 PARTITION c8226 VALUES IN (8226) ENGINE = InnoDB,
 PARTITION c8489 VALUES IN (8489) ENGINE = InnoDB,
 PARTITION c2194 VALUES IN (2194) ENGINE = InnoDB,
 PARTITION c7656 VALUES IN (7656) ENGINE = InnoDB,
 PARTITION c6228 VALUES IN (6228) ENGINE = InnoDB,
 PARTITION c6050 VALUES IN (6050) ENGINE = InnoDB) */;


DELIMITER ;;

CREATE TRIGGER `after_insert_user_mode_action` AFTER INSERT ON `user_mode_action` FOR EACH ROW
BEGIN
  INSERT INTO `user_mode_action_trig` (
    `action`, `action_time`, `original_id`, `login_id`, `mode`, `start_time`, `end_time`, `call_ob`, `call_ob_duration`,
    `call_in`, `call_in_duration`, `call_mc`, `call_mc_duration`, `idle_duration`, `wrapup_duration`,
    `hold`, `hold_duration`, `transfer`, `transfer_duration`, `conference`, `conference_duration`, 
    `recall`, `recall_duration`, `break_duration`, `mo_count`, `mo_duration`, `sms_count`, `email_count`,
    `call_pg`, `call_pg_duration`, `call_pv`, `call_pv_duration`, `call_rd`, `call_rd_duration`,
    `call_cl`, `call_cl_duration`, `campaign`, `trunk`, `login_status`, `free_time`, `client_id`, `review_count`, `review_duration`
  ) 
  VALUES (
    'INSERT', NOW(), NEW.id, NEW.login_id, NEW.mode, NEW.start_time, NEW.end_time, NEW.call_ob, NEW.call_ob_duration,
    NEW.call_in, NEW.call_in_duration, NEW.call_mc, NEW.call_mc_duration, NEW.idle_duration, NEW.wrapup_duration,
    NEW.hold, NEW.hold_duration, NEW.transfer, NEW.transfer_duration, NEW.conference, NEW.conference_duration,
    NEW.recall, NEW.recall_duration, NEW.break_duration, NEW.mo_count, NEW.mo_duration, NEW.sms_count, NEW.email_count,
    NEW.call_pg, NEW.call_pg_duration, NEW.call_pv, NEW.call_pv_duration, NEW.call_rd, NEW.call_rd_duration,
    NEW.call_cl, NEW.call_cl_duration, NEW.campaign, NEW.trunk, NEW.login_status, NEW.free_time, NEW.client_id, 
    NEW.review_count, NEW.review_duration
  );
END;;

CREATE TRIGGER `after_update_user_mode_action` AFTER UPDATE ON `user_mode_action` FOR EACH ROW
BEGIN
  INSERT INTO `user_mode_action_trig` (
    `action`, `action_time`, `original_id`, `login_id`, `mode`, `start_time`, `end_time`, `call_ob`, `call_ob_duration`,
    `call_in`, `call_in_duration`, `call_mc`, `call_mc_duration`, `idle_duration`, `wrapup_duration`,
    `hold`, `hold_duration`, `transfer`, `transfer_duration`, `conference`, `conference_duration`, 
    `recall`, `recall_duration`, `break_duration`, `mo_count`, `mo_duration`, `sms_count`, `email_count`,
    `call_pg`, `call_pg_duration`, `call_pv`, `call_pv_duration`, `call_rd`, `call_rd_duration`,
    `call_cl`, `call_cl_duration`, `campaign`, `trunk`, `login_status`, `free_time`, `client_id`, `review_count`, `review_duration`
  ) 
  VALUES (
    'UPDATE', NOW(), OLD.id, OLD.login_id, OLD.mode, OLD.start_time, OLD.end_time, OLD.call_ob, OLD.call_ob_duration,
    OLD.call_in, OLD.call_in_duration, OLD.call_mc, OLD.call_mc_duration, OLD.idle_duration, OLD.wrapup_duration,
    OLD.hold, OLD.hold_duration, OLD.transfer, OLD.transfer_duration, OLD.conference, OLD.conference_duration,
    OLD.recall, OLD.recall_duration, OLD.break_duration, OLD.mo_count, OLD.mo_duration, OLD.sms_count, OLD.email_count,
    OLD.call_pg, OLD.call_pg_duration, OLD.call_pv, OLD.call_pv_duration, OLD.call_rd, OLD.call_rd_duration,
    OLD.call_cl, OLD.call_cl_duration, OLD.campaign, OLD.trunk, OLD.login_status, OLD.free_time, OLD.client_id, 
    OLD.review_count, OLD.review_duration
  );
END;;

CREATE TRIGGER `after_delete_user_mode_action` AFTER DELETE ON `user_mode_action` FOR EACH ROW
BEGIN
  INSERT INTO `user_mode_action_trig` (
    `action`, `action_time`, `original_id`, `login_id`, `mode`, `start_time`, `end_time`, `call_ob`, `call_ob_duration`,
    `call_in`, `call_in_duration`, `call_mc`, `call_mc_duration`, `idle_duration`, `wrapup_duration`,
    `hold`, `hold_duration`, `transfer`, `transfer_duration`, `conference`, `conference_duration`, 
    `recall`, `recall_duration`, `break_duration`, `mo_count`, `mo_duration`, `sms_count`, `email_count`,
    `call_pg`, `call_pg_duration`, `call_pv`, `call_pv_duration`, `call_rd`, `call_rd_duration`,
    `call_cl`, `call_cl_duration`, `campaign`, `trunk`, `login_status`, `free_time`, `client_id`, `review_count`, `review_duration`
  ) 
  VALUES (
    'DELETE', NOW(), OLD.id, OLD.login_id, OLD.mode, OLD.start_time, OLD.end_time, OLD.call_ob, OLD.call_ob_duration,
    OLD.call_in, OLD.call_in_duration, OLD.call_mc, OLD.call_mc_duration, OLD.idle_duration, OLD.wrapup_duration,
    OLD.hold, OLD.hold_duration, OLD.transfer, OLD.transfer_duration, OLD.conference, OLD.conference_duration,
    OLD.recall, OLD.recall_duration, OLD.break_duration, OLD.mo_count, OLD.mo_duration, OLD.sms_count, OLD.email_count,
    OLD.call_pg, OLD.call_pg_duration, OLD.call_pv, OLD.call_pv_duration, OLD.call_rd, OLD.call_rd_duration,
    OLD.call_cl, OLD.call_cl_duration, OLD.campaign, OLD.trunk, OLD.login_status, OLD.free_time, OLD.client_id, 
    OLD.review_count, OLD.review_duration
  );
END;;

DELIMITER ;

DROP TABLE IF EXISTS `user_mode_action_day`;
CREATE TABLE `user_mode_action_day` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_id` int(11) DEFAULT '0',
  `login_id` int(11) DEFAULT '0',
  `mode` char(2) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `call_ob` int(5) DEFAULT '0',
  `call_ob_duration` int(5) DEFAULT '0',
  `call_in` int(5) DEFAULT '0',
  `call_in_duration` int(5) DEFAULT '0',
  `call_mc` int(5) DEFAULT '0',
  `call_mc_duration` int(5) DEFAULT '0',
  `idle_duration` int(5) DEFAULT '0',
  `wrapup_duration` int(5) DEFAULT '0',
  `hold` int(5) DEFAULT '0',
  `hold_duration` int(5) DEFAULT '0',
  `transfer` int(5) DEFAULT '0',
  `transfer_duration` int(5) DEFAULT '0',
  `conference` int(5) DEFAULT '0',
  `conference_duration` int(5) DEFAULT '0',
  `recall` int(5) DEFAULT '0',
  `recall_duration` int(5) DEFAULT '0',
  `break_duration` int(5) DEFAULT '0',
  `mo_count` int(5) DEFAULT '0',
  `mo_duration` int(5) DEFAULT '0',
  `sms_count` int(4) DEFAULT '0',
  `email_count` int(4) DEFAULT '0',
  `call_pg` int(4) DEFAULT '0',
  `call_pg_duration` int(4) DEFAULT '0',
  `call_pv` int(4) DEFAULT '0',
  `call_pv_duration` int(4) DEFAULT '0',
  `call_rd` int(4) DEFAULT '0',
  `call_rd_duration` int(4) DEFAULT '0',
  `call_cl` int(4) DEFAULT '0',
  `call_cl_duration` int(4) DEFAULT '0',
  `review_count` int(4) DEFAULT '0',
  `review_duration` int(4) DEFAULT '0',
  `campaign` varchar(45) DEFAULT NULL,
  `trunk` int(4) DEFAULT NULL,
  `login_status` tinyint(1) DEFAULT '0',
  `free_time` datetime DEFAULT '0000-00-00 00:00:00',
  `client_id` int(5) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  KEY `login_id` (`login_id`),
  KEY `mode` (`mode`),
  KEY `campaign` (`campaign`),
  KEY `trunk` (`trunk`),
  KEY `modeid` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `user_mode_action_log`;
CREATE TABLE `user_mode_action_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mode_id` int(11) NOT NULL,
  `source` varchar(100) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `created_date` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `user_mode_action_trig`;
CREATE TABLE `user_mode_action_trig` (
  `log_id` int(11) NOT NULL AUTO_INCREMENT,
  `action` varchar(10) NOT NULL,
  `action_time` datetime NOT NULL,
  `original_id` int(11) DEFAULT NULL,
  `login_id` int(11) DEFAULT NULL,
  `mode` char(2) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `call_ob` int(5) DEFAULT '0',
  `call_ob_duration` int(5) DEFAULT '0',
  `call_in` int(5) DEFAULT '0',
  `call_in_duration` int(5) DEFAULT '0',
  `call_mc` int(5) DEFAULT '0',
  `call_mc_duration` int(5) DEFAULT '0',
  `idle_duration` int(5) DEFAULT '0',
  `wrapup_duration` int(5) DEFAULT '0',
  `hold` int(5) DEFAULT '0',
  `hold_duration` int(5) DEFAULT '0',
  `transfer` int(5) DEFAULT '0',
  `transfer_duration` int(5) DEFAULT '0',
  `conference` int(5) DEFAULT '0',
  `conference_duration` int(5) DEFAULT '0',
  `recall` int(5) DEFAULT '0',
  `recall_duration` int(5) DEFAULT '0',
  `break_duration` int(5) DEFAULT '0',
  `mo_count` int(5) DEFAULT '0',
  `mo_duration` int(5) DEFAULT '0',
  `sms_count` int(4) DEFAULT '0',
  `email_count` int(4) DEFAULT '0',
  `call_pg` int(4) DEFAULT '0',
  `call_pg_duration` int(4) DEFAULT '0',
  `call_pv` int(4) DEFAULT '0',
  `call_pv_duration` int(4) DEFAULT '0',
  `call_rd` int(4) DEFAULT '0',
  `call_rd_duration` int(4) DEFAULT '0',
  `call_cl` int(4) DEFAULT '0',
  `call_cl_duration` int(4) DEFAULT '0',
  `campaign` varchar(45) DEFAULT NULL,
  `trunk` int(4) DEFAULT NULL,
  `login_status` tinyint(1) DEFAULT '0',
  `free_time` datetime DEFAULT '0000-00-00 00:00:00',
  `client_id` int(5) DEFAULT NULL,
  `review_count` int(4) DEFAULT '0',
  `review_duration` int(4) DEFAULT '0',
  `updateby_mode` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`log_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `user_review_action`;
CREATE TABLE `user_review_action` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `login_id` int(11) NOT NULL,
  `mode_action_id` int(11) NOT NULL,
  `activity_name` varchar(50) NOT NULL,
  `campaign` varchar(50) NOT NULL,
  `start_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `end_time` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `phone` varchar(15) NOT NULL,
  `client_id` int(5) NOT NULL,
  `user_id` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `login_id` (`login_id`),
  KEY `mode_action_id` (`mode_action_id`),
  KEY `activity_name` (`activity_name`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `user_role`;
CREATE TABLE `user_role` (
  `id` varchar(45) NOT NULL DEFAULT '0',
  `auto_answer` tinyint(1) NOT NULL DEFAULT '1',
  `dial` tinyint(1) NOT NULL DEFAULT '1',
  `internal_transfer` tinyint(1) NOT NULL DEFAULT '1',
  `external_transfer` tinyint(1) NOT NULL DEFAULT '1',
  `internal_conference` tinyint(1) NOT NULL DEFAULT '1',
  `external_conference` tinyint(1) NOT NULL DEFAULT '1',
  `hangup` tinyint(1) NOT NULL DEFAULT '1',
  `mute` tinyint(1) NOT NULL DEFAULT '1',
  `call_hold` tinyint(1) NOT NULL DEFAULT '1',
  `barge` tinyint(1) NOT NULL DEFAULT '0',
  `call_coach` tinyint(1) NOT NULL DEFAULT '0',
  `call_info` tinyint(1) NOT NULL DEFAULT '0',
  `sms` tinyint(1) NOT NULL DEFAULT '0',
  `whatsapp` tinyint(1) NOT NULL DEFAULT '0',
  `chat_admin` tinyint(1) NOT NULL DEFAULT '0',
  `chat_user` tinyint(1) NOT NULL DEFAULT '0',
  `mo_panel` tinyint(1) NOT NULL DEFAULT '0',
  `campaign_manager` tinyint(1) NOT NULL,
  `lead` tinyint(1) NOT NULL DEFAULT '0',
  `email` tinyint(1) NOT NULL DEFAULT '0',
  `number_mask` tinyint(1) NOT NULL DEFAULT '0',
  `call_log` tinyint(1) NOT NULL DEFAULT '1',
  `user_log` tinyint(1) NOT NULL DEFAULT '1',
  `auto_in_manual` tinyint(1) NOT NULL DEFAULT '0',
  `mobile_agent` tinyint(1) NOT NULL DEFAULT '0',
  `callback_auto` tinyint(1) NOT NULL DEFAULT '1',
  `download` tinyint(1) NOT NULL DEFAULT '1',
  `listen` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  `call_forward` tinyint(1) DEFAULT '0',
  `feedback` tinyint(1) DEFAULT '0',
  `disable_disposition` tinyint(1) DEFAULT '0' COMMENT '0: False, 1: True',
  `auto_phone_copy` tinyint(1) DEFAULT '0',
  `agent_free` tinyint(1) DEFAULT '1',
  `number_mask_gdn` tinyint(1) DEFAULT '0',
  `auto_progressive` tinyint(1) DEFAULT '0',
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `user_status`;
CREATE TABLE `user_status` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(25) DEFAULT NULL,
  `sipid` varchar(15) DEFAULT NULL,
  `campaign` varchar(25) DEFAULT NULL,
  `ipaddress` varchar(20) DEFAULT NULL,
  `rstatus` varchar(25) DEFAULT '',
  `cstatus` varchar(25) DEFAULT '',
  `phone` varchar(15) DEFAULT '',
  `mc_call` int(3) DEFAULT '0',
  `ob_call` int(3) DEFAULT '0',
  `ib_call` int(3) DEFAULT '0',
  `wstatus` varchar(25) DEFAULT '',
  `lasttime` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `user_mode` int(3) DEFAULT '0',
  `login_id` int(11) DEFAULT '0',
  `user_mode_id` int(11) DEFAULT '0',
  `data_id` int(11) DEFAULT '0',
  `disposition_id` int(11) DEFAULT '0',
  `action` varchar(15) DEFAULT '0',
  `ringnoanswer_count` int(2) DEFAULT '0',
  `client_id` int(5) DEFAULT '0',
  `server_id` int(5) DEFAULT '0',
  `user_type` char(1) DEFAULT 'A' COMMENT 'A for Agent, W for Web, F for FXS',
  `is_tl` tinyint(1) DEFAULT '0',
  `user_free` tinyint(1) DEFAULT '0',
  `didtfn` varchar(20) DEFAULT '',
  `callstarttime` datetime DEFAULT NULL,
  `agent_version` varchar(10) NOT NULL,
  `on_mobile` tinyint(1) NOT NULL DEFAULT '0' COMMENT '1: On Mobile, 0: Not on Mobile',
  PRIMARY KEY (`id`),
  KEY `name` (`name`),
  KEY `sipid` (`sipid`),
  KEY `campaign` (`campaign`),
  KEY `login_id` (`login_id`),
  KEY `user_mode_id` (`user_mode_id`),
  KEY `phone` (`phone`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `user_sub_menu`;
CREATE TABLE `user_sub_menu` (
  `user_id` varchar(45) NOT NULL DEFAULT '0',
  `main_menu_id` varchar(45) NOT NULL DEFAULT '0',
  `sub_menu_id` varchar(45) NOT NULL DEFAULT '0',
  `client_id` int(5) NOT NULL,
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `user_type`;
CREATE TABLE `user_type` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(45) NOT NULL DEFAULT '',
  `type_order` int(10) unsigned NOT NULL DEFAULT '0',
  `type_level` int(10) unsigned NOT NULL DEFAULT '0',
  `client_id` int(5) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `view_cdr_details`;
CREATE TABLE `view_cdr_details` (
  `calldate` datetime DEFAULT NULL,
  `campaign` varchar(80) DEFAULT NULL,
  `leadid` varchar(80) DEFAULT NULL,
  `phone` varchar(80) DEFAULT NULL,
  `dataid` varbinary(80) DEFAULT NULL,
  `dstchannel` varchar(80) DEFAULT NULL,
  `channel` varchar(80) DEFAULT NULL,
  `lastapp` varchar(80) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `billsec` int(11) DEFAULT NULL,
  `disposition` varchar(45) DEFAULT NULL,
  `calltype` varchar(2) DEFAULT NULL,
  `recordid` varchar(25) DEFAULT NULL,
  `callid` varchar(80) DEFAULT NULL,
  `ivrinput` varchar(25) DEFAULT NULL,
  `userfield` varchar(255) DEFAULT NULL,
  `response_code` varchar(5) DEFAULT NULL,
  `hangup_status` varchar(50) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `view_dashboard_disposition`;
CREATE TABLE `view_dashboard_disposition` (
  `calldate` date DEFAULT NULL,
  `campaign` varchar(80) DEFAULT NULL,
  `disposition` varchar(45) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `view_queue_details`;
CREATE TABLE `view_queue_details` (
  `time` char(26) DEFAULT NULL,
  `queuename` char(50) DEFAULT NULL,
  `event` char(20) DEFAULT NULL,
  `phone` char(50) DEFAULT NULL,
  `arg1` char(50) DEFAULT NULL,
  `arg2` char(50) DEFAULT NULL,
  `arg3` char(50) DEFAULT NULL,
  `callid` char(50) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `view_queue_details_new`;
CREATE TABLE `view_queue_details_new` (
  `time` char(26) DEFAULT NULL,
  `queuename` char(50) DEFAULT NULL,
  `event` char(20) DEFAULT NULL,
  `agent` varchar(50) DEFAULT NULL,
  `callid` char(50) DEFAULT NULL,
  `phone` char(50) DEFAULT NULL,
  `arg1` char(50) DEFAULT NULL,
  `arg2` char(50) DEFAULT NULL,
  `arg3` char(50) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `view_unique_phone`;
CREATE TABLE `view_unique_phone` (
  `phone` varchar(80) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `vip_contact`;
CREATE TABLE `vip_contact` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eng_name` varchar(45) NOT NULL,
  `contact_number` varchar(15) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `vip_Essentials`;
CREATE TABLE `vip_Essentials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eng_name` varchar(45) NOT NULL DEFAULT '',
  `contact_number` varchar(15) NOT NULL DEFAULT '',
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `vision_refrence`;
CREATE TABLE `vision_refrence` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(25) NOT NULL,
  `refernce1` varchar(175) NOT NULL,
  `refrence2` varchar(175) NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `campaign_name` (`campaign_name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `vm_client`;
CREATE TABLE `vm_client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_code` int(5) NOT NULL,
  `client_name` varchar(25) DEFAULT NULL,
  `client_phone` varchar(15) DEFAULT NULL,
  `client_email` varchar(35) DEFAULT NULL,
  `api_token` varchar(50) DEFAULT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `creation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_type` varchar(10) NOT NULL,
  `client_operation` varchar(10) NOT NULL,
  `dnc` tinyint(1) NOT NULL COMMENT '1: Allowed 0: Not allowed',
  `server_id` int(3) NOT NULL DEFAULT '0',
  `client_alias` varchar(255) NOT NULL,
  `is_billing` tinyint(1) NOT NULL COMMENT '1',
  `pulse_rate` varchar(25) NOT NULL,
  `update_by_ip` varchar(20) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `circle_permission` enum('1','0') NOT NULL DEFAULT '0' COMMENT '1: Allowed 0: Not Allowed',
  `multiple_number_search` enum('1','0') NOT NULL DEFAULT '0' COMMENT '1: Allowed 0: Not Allowed',
  `preview_hold` enum('1','0') NOT NULL DEFAULT '0' COMMENT '1: Allowed 0: Not Allowed',
  `manual_route` enum('1','0') NOT NULL DEFAULT '0' COMMENT '1: Allowed 0: Not Allowed',
  `can_change_lead` enum('1','0') NOT NULL DEFAULT '0' COMMENT '1: Allowed 0: Not Allowed',
  `show_multiple_crmdataid` enum('1','0') NOT NULL DEFAULT '0' COMMENT '1: Allowed 0: Not Allowed',
  `tiny_url_sms` enum('1','0') NOT NULL DEFAULT '0' COMMENT '1: Allowed 0: Not Allowed',
  `disable_button` tinyint(1) NOT NULL DEFAULT '0',
  `time_enable` int(11) NOT NULL DEFAULT '0',
  `expire_days` int(11) NOT NULL DEFAULT '0',
  `first_login` tinyint(1) NOT NULL DEFAULT '0',
  `blacklist_check` tinyint(1) NOT NULL DEFAULT '1',
  `blacklist_check_digit` int(2) NOT NULL DEFAULT '0',
  `license_check` tinyint(1) NOT NULL DEFAULT '1',
  `credit_amount` int(11) NOT NULL DEFAULT '0',
  `crm_permission` tinyint(1) NOT NULL DEFAULT '0',
  `assigned_permission` tinyint(1) NOT NULL DEFAULT '0',
  `decision_tree_permission` tinyint(1) NOT NULL DEFAULT '0',
  `ticket_permission` tinyint(1) NOT NULL DEFAULT '0',
  `sms_permission` tinyint(1) NOT NULL DEFAULT '0',
  `email_permission` tinyint(1) NOT NULL DEFAULT '0',
  `history_permission` tinyint(1) NOT NULL DEFAULT '0',
  `feedback_permission` tinyint(1) NOT NULL DEFAULT '0',
  `whatsapp_in_permission` tinyint(1) NOT NULL DEFAULT '0',
  `whatsapp_out_permission` tinyint(1) NOT NULL DEFAULT '0',
  `chat_permission` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_code` (`client_code`),
  KEY `client_name` (`client_name`),
  KEY `api_token` (`api_token`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `vm_config`;
CREATE TABLE `vm_config` (
  `id` int(7) NOT NULL AUTO_INCREMENT,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `max_campaign` int(5) NOT NULL DEFAULT '5',
  `max_pasing` int(2) NOT NULL DEFAULT '4',
  `max_channel` int(3) NOT NULL DEFAULT '0',
  `max_lead` int(3) NOT NULL DEFAULT '5000',
  `max_lead_size` int(5) NOT NULL DEFAULT '10000000',
  `max_row_lead` int(5) NOT NULL DEFAULT '50000',
  `max_crm_field` int(3) NOT NULL DEFAULT '30',
  `max_lead_dial_per_campaign` int(5) NOT NULL DEFAULT '5' COMMENT 'Max dialing lead each campaign',
  `check_dnc` tinyint(1) NOT NULL DEFAULT '0',
  `client_type` enum('pri','voip') NOT NULL,
  `update_by_ip` varchar(20) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  `exten_extend` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `client_type` (`client_type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `vm_license`;
CREATE TABLE `vm_license` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(7) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `license` int(5) NOT NULL DEFAULT '0',
  `license_type` enum('VOIP','PRI') NOT NULL,
  `update_by_ip` varchar(20) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `vm_menu`;
CREATE TABLE `vm_menu` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL DEFAULT '',
  `file_path` varchar(100) DEFAULT NULL,
  `menu_id` int(5) NOT NULL DEFAULT '0',
  `position` int(2) NOT NULL DEFAULT '0',
  `class_name` varchar(45) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `vm_user`;
CREATE TABLE `vm_user` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `user_id` varchar(145) DEFAULT NULL,
  `password` varchar(145) DEFAULT NULL,
  `user_name` varchar(175) DEFAULT NULL,
  `user_type` tinyint(1) DEFAULT '1',
  `email_id` varchar(215) DEFAULT NULL,
  `mobile_no` varchar(15) DEFAULT NULL,
  `user_status` tinyint(1) DEFAULT '1',
  `creation_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `flag` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `vm_user_menu`;
CREATE TABLE `vm_user_menu` (
  `user_id` varchar(45) NOT NULL DEFAULT '0',
  `menu_id` varchar(45) NOT NULL DEFAULT '0',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `voice_file`;
CREATE TABLE `voice_file` (
  `id` int(45) NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(25) DEFAULT NULL,
  `file_name` varchar(45) DEFAULT NULL,
  `file_duration` time DEFAULT NULL,
  `file_desc` varchar(125) DEFAULT NULL,
  `agent` varchar(45) DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `voice_file_api`;
CREATE TABLE `voice_file_api` (
  `id` int(45) NOT NULL AUTO_INCREMENT,
  `campaign_name` varchar(25) DEFAULT NULL,
  `file_name` varchar(45) DEFAULT NULL,
  `file_duration` time DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `update_by_user` varchar(25) NOT NULL DEFAULT 'nouser',
  `update_by_ip` varchar(25) NOT NULL DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `voice_mail`;
CREATE TABLE `voice_mail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `campaign` varchar(45) NOT NULL,
  `welcome_file` varchar(125) NOT NULL,
  `thanks_file` varchar(125) NOT NULL,
  `client_id` int(5) NOT NULL,
  `voice_mail` tinyint(1) NOT NULL DEFAULT '0',
  `voice_key` varchar(2) NOT NULL,
  `update_by_user` varchar(25) NOT NULL,
  `update_by_ip` varchar(25) NOT NULL,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `voip_client_map`;
CREATE TABLE `voip_client_map` (
  `id` int(7) NOT NULL AUTO_INCREMENT,
  `voip_id` int(7) NOT NULL,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `max_channel` int(5) NOT NULL DEFAULT '0',
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `update_by_ip` varchar(20) NOT NULL,
  `update_by_user` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `voip_id` (`voip_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `voip_config`;
CREATE TABLE `voip_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voipip` varchar(20) DEFAULT NULL,
  `voipalias` varchar(30) DEFAULT NULL,
  `pulse_rate` varchar(30) DEFAULT '1/1',
  `cps` varchar(10) DEFAULT '5/1',
  `max_channel` int(5) DEFAULT '0',
  `outbound` tinyint(1) NOT NULL DEFAULT '0',
  `inbound` tinyint(1) NOT NULL DEFAULT '0',
  `text` text,
  `update_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `voip_flag` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) NOT NULL,
  `update_by_ip` varchar(25) NOT NULL,
  `client_id` int(5) NOT NULL,
  `is_changed` tinyint(1) DEFAULT NULL,
  `registeration` tinyint(1) NOT NULL,
  `registeration_text` text NOT NULL,
  `sip_header` varchar(500) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `voipip` (`voipip`),
  KEY `voipalias` (`voipalias`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `voip_detail`;
CREATE TABLE `voip_detail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `voip_provider_id` int(5) NOT NULL,
  `master_did` varchar(15) NOT NULL,
  `did_number_digits` varchar(15) NOT NULL,
  `campaign_name` varchar(45) NOT NULL,
  `queue_maxtime` varchar(5) NOT NULL,
  `queue_forwardtype` varchar(25) NOT NULL,
  `queue_forward` varchar(45) NOT NULL,
  `forward_maxtime` varchar(5) NOT NULL,
  `forward_category` varchar(45) NOT NULL,
  `days_from` varchar(45) NOT NULL,
  `days_to` varchar(45) NOT NULL,
  `time_from` varchar(45) NOT NULL,
  `time_to` varchar(45) NOT NULL,
  `forward_type_on` varchar(45) NOT NULL,
  `forward_name_on` varchar(45) NOT NULL,
  `voice_forward_on` varchar(45) NOT NULL,
  `forward_type_off` varchar(45) NOT NULL,
  `forward_name_off` varchar(45) NOT NULL,
  `offqueue_maxtime` varchar(5) NOT NULL,
  `offqueue_forwardtype` varchar(45) NOT NULL,
  `offqueue_forward` varchar(45) NOT NULL,
  `offforward_maxtime` varchar(5) NOT NULL,
  `voice_forward_off` varchar(45) NOT NULL,
  `ontime_auto` varchar(25) NOT NULL,
  `offtime_auto` varchar(45) NOT NULL,
  `group_type` varchar(45) NOT NULL,
  `forward_ontime_cmp` varchar(45) NOT NULL,
  `forward_offtime_cmp` varchar(45) NOT NULL,
  `ontime_skill` varchar(25) DEFAULT NULL,
  `ontime_skills` varchar(25) CHARACTER SET latin1 COLLATE latin1_spanish_ci DEFAULT NULL,
  `offtime_skill` varchar(25) CHARACTER SET latin1 COLLATE latin1_spanish_ci DEFAULT NULL,
  `offtime_skills` varchar(25) DEFAULT NULL,
  `ontime_ivrprompt` varchar(25) DEFAULT NULL,
  `offtime_ivrprompt` varchar(25) CHARACTER SET latin1 COLLATE latin1_spanish_ci DEFAULT NULL,
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  `cbi_priority` int(3) DEFAULT '100',
  `cbq_priority` int(3) DEFAULT '100',
  `music_on_hold` varchar(45) DEFAULT '0',
  `inbound_default` tinyint(1) DEFAULT '0',
  `outbond_default` tinyint(1) DEFAULT '0',
  `voip_type` tinyint(1) DEFAULT '1' COMMENT '1=voip,2=did',
  `sch_type` tinyint(1) DEFAULT '0' COMMENT '1',
  `agent_call_limit` int(2) DEFAULT '0',
  `caller_id` varchar(15) DEFAULT NULL,
  `sip_header` varchar(25) DEFAULT NULL,
  `ontime_voicemail_maxtime` varchar(5) DEFAULT NULL,
  `offtime_voicemail_maxtime` varchar(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `campaign_name` (`campaign_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `voip_tariff`;
CREATE TABLE `voip_tariff` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `voip_name` varchar(25) NOT NULL,
  `tariff_name` varchar(25) NOT NULL,
  `tariff_pulse` int(3) NOT NULL DEFAULT '30' COMMENT 'value in second',
  `tariff_pulse_rate` int(3) NOT NULL DEFAULT '30' COMMENT 'value in paisa',
  `country_code` int(3) NOT NULL DEFAULT '91',
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `tariff_name` (`tariff_name`),
  KEY `voip_name` (`voip_name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `whatsapp_config`;
CREATE TABLE `whatsapp_config` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `route_name` varchar(35) NOT NULL,
  `api` varchar(255) DEFAULT NULL,
  `param_1` varchar(20) DEFAULT NULL,
  `param_2` varchar(20) DEFAULT NULL,
  `param_3` varchar(20) DEFAULT NULL,
  `param_4` varchar(20) DEFAULT NULL,
  `param_5` varchar(20) DEFAULT NULL,
  `param_6` varchar(20) DEFAULT NULL,
  `param_7` varchar(20) DEFAULT NULL,
  `param_8` varchar(20) DEFAULT NULL,
  `param_9` varchar(20) DEFAULT NULL,
  `param_10` varchar(20) DEFAULT NULL,
  `value_1` varchar(255) DEFAULT NULL,
  `value_2` varchar(20) DEFAULT NULL,
  `value_3` varchar(20) DEFAULT NULL,
  `value_4` varchar(20) DEFAULT NULL,
  `value_5` varchar(20) DEFAULT NULL,
  `value_6` varchar(20) DEFAULT NULL,
  `value_7` varchar(20) DEFAULT NULL,
  `value_8` varchar(20) DEFAULT NULL,
  `value_9` varchar(20) DEFAULT NULL,
  `value_10` varchar(20) DEFAULT NULL,
  `prefix` varchar(25) DEFAULT NULL,
  `request_method` varchar(25) DEFAULT NULL,
  `headers` varchar(125) DEFAULT NULL,
  `content_type` varchar(125) DEFAULT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) NOT NULL DEFAULT 'nouser',
  `update_by_ip` varchar(25) NOT NULL DEFAULT '0.0.0.0',
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `whatsapp_counter`;
CREATE TABLE `whatsapp_counter` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `whatsapp_no` varchar(15) NOT NULL,
  `whatsapp_count` int(11) NOT NULL,
  `cdate` datetime NOT NULL,
  `flag` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `whatsapp_no` (`whatsapp_no`),
  KEY `cdate` (`cdate`),
  KEY `flag` (`flag`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `whatsapp_outbox`;
CREATE TABLE `whatsapp_outbox` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mobile_no` varchar(15) DEFAULT NULL,
  `template_id` varchar(25) DEFAULT NULL,
  `message` text CHARACTER SET utf8 COLLATE utf8_swedish_ci,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `whatsapp_status` tinyint(1) DEFAULT '0',
  `agent` varchar(75) DEFAULT NULL,
  `Campaign_Name` varchar(40) DEFAULT NULL,
  `route_id` int(4) DEFAULT NULL,
  `rid` varchar(25) DEFAULT NULL,
  `skill` varchar(25) DEFAULT NULL,
  `disposition` varchar(35) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mobile_no` (`mobile_no`),
  KEY `client_id` (`client_id`),
  KEY `agent` (`agent`),
  KEY `Campaign_Name` (`Campaign_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `whatsapp_outbox1`;
CREATE TABLE `whatsapp_outbox1` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mobile_no` varchar(15) DEFAULT NULL,
  `template_id` varchar(25) DEFAULT NULL,
  `message` text CHARACTER SET utf8 COLLATE utf8_swedish_ci,
  `cdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `client_id` int(5) NOT NULL DEFAULT '0',
  `whatsapp_status` tinyint(1) DEFAULT '0',
  `agent` varchar(75) DEFAULT NULL,
  `Campaign_Name` varchar(40) DEFAULT NULL,
  `route_id` int(4) DEFAULT NULL,
  `rid` varchar(25) DEFAULT NULL,
  `skill` varchar(25) DEFAULT NULL,
  `disposition` varchar(35) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mobile_no` (`mobile_no`),
  KEY `client_id` (`client_id`),
  KEY `agent` (`agent`),
  KEY `Campaign_Name` (`Campaign_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `whatsapp_template`;
CREATE TABLE `whatsapp_template` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `template_id` varchar(25) NOT NULL,
  `whatsapp_text` text CHARACTER SET utf8 COLLATE utf8_unicode_ci,
  `whatsapp_header` varchar(45) DEFAULT NULL,
  `whatsapp_uploadtype` varchar(45) DEFAULT NULL,
  `whatsapp_uploadfile` varchar(125) DEFAULT NULL,
  `whats_language` text,
  `whatsapp_language` text,
  `client_id` int(8) DEFAULT NULL,
  `whatsapp_name` varchar(75) DEFAULT NULL,
  `flag` tinyint(1) DEFAULT '1',
  `Campaign_Name` varchar(40) DEFAULT NULL,
  `update_by_user` varchar(25) NOT NULL DEFAULT 'nouser',
  `update_by_ip` varchar(25) NOT NULL DEFAULT '0.0.0.0',
  `cdate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `sms_type` (`whatsapp_name`),
  KEY `Campaign_Name` (`Campaign_Name`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 CHECKSUM=1 DELAY_KEY_WRITE=1 ROW_FORMAT=DYNAMIC;


DROP TABLE IF EXISTS `zone`;
CREATE TABLE `zone` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(45) NOT NULL DEFAULT '',
  `dialing_mode` int(3) NOT NULL DEFAULT '3',
  `country` varchar(45) NOT NULL DEFAULT '',
  `start_time` time NOT NULL DEFAULT '00:00:00',
  `end_time` time NOT NULL DEFAULT '00:00:00',
  `dialing_identification` varchar(15) NOT NULL,
  `time_zone` int(5) NOT NULL DEFAULT '1',
  `status` tinyint(1) NOT NULL DEFAULT '0',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name_country_dialing_mode_client_id` (`name`,`country`,`dialing_mode`,`client_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `zone_mode`;
CREATE TABLE `zone_mode` (
  `id` int(3) NOT NULL AUTO_INCREMENT,
  `mode_name` varchar(25) NOT NULL,
  `flag` tinyint(1) NOT NULL,
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


DROP TABLE IF EXISTS `zone_state`;
CREATE TABLE `zone_state` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `statecode` varchar(25) NOT NULL,
  `statename` varchar(25) NOT NULL,
  `statefullname` varchar(100) NOT NULL,
  `countryname` varchar(25) NOT NULL,
  `zonename` varchar(25) NOT NULL,
  `zone_id` int(7) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `update_by_user` varchar(25) DEFAULT NULL,
  `update_by_ip` varchar(25) DEFAULT NULL,
  `client_id` int(5) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `statecode_zone_id` (`statecode`,`zone_id`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 ROW_FORMAT=FIXED;


DROP TABLE IF EXISTS `zone_time`;
CREATE TABLE `zone_time` (
  `id` int(5) NOT NULL AUTO_INCREMENT,
  `zone_name` varchar(50) NOT NULL,
  `zone_time_1` varchar(10) NOT NULL,
  `zone_time_2` varchar(10) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '1',
  `client_id` int(5) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `zone_name` (`zone_name`),
  KEY `client_id` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


-- 2025-02-03 06:48:05

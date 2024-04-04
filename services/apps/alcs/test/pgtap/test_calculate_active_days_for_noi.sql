BEGIN;
-- prepare pgtap
SELECT * from plan(15);

-- prepare data
-- temp clear existing data
DELETE FROM alcs.holiday_entity;

-- create holidays
prepare insert_2022_holidays AS
INSERT INTO alcs."holiday_entity" ("uuid", "name", "day") VALUES
    ('3fe6132e-ef24-4132-bacf-2a22bdf1a3d1', 'Holiday 1', TO_TIMESTAMP('2023-01-01', 'YYYY-MM-DD')),
    ('d93e9d9c-c1f6-4f1d-bcce-781d4d5ecd99', 'Holiday 2', TO_TIMESTAMP('2023-02-02', 'YYYY-MM-DD')),
    ('75579109-7394-4561-8e3a-8acd8472f45e', 'Holiday 3', TO_TIMESTAMP('2023-03-03', 'YYYY-MM-DD')),
	('75579109-7394-4561-8e3a-8acd8472f42e', 'Holiday 4', TO_TIMESTAMP('2023-10-10', 'YYYY-MM-DD'));
SELECT lives_ok('insert_2022_holidays', 'should insert holiday_entity');

-- create user
prepare insert_users_in_test_calculate_active AS 
INSERT INTO alcs."user" (uuid,audit_created_by,audit_updated_by,email,"name",display_name,identity_provider,preferred_username,given_name,family_name,idir_user_guid,idir_user_name,audit_deleted_date_at,audit_created_at,audit_updated_at) VALUES
	 ('11111111-1111-1111-1111-111111111111','setAuditCreatedBy here',NULL,'some.test.user@bit3.ca','Test User','Test, User LWRS:EX','idir','11111111111111111@idir','User','Test','11111111111111111','UTEST',NULL,'2022-07-26 14:30:04.189077-07','2022-07-26 14:30:04.189077-07');
SELECT lives_ok('insert_users_in_test_calculate_active', 'should insert user');

-- create noi type
prepare insert_noi_type_in_test_calculate_active AS 
INSERT INTO alcs.notice_of_intent_type (audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,code,description,"label",short_label,background_color,text_color) VALUES
	 (NULL,'2023-01-01 16:20:41.717',NULL,'alcs-api',NULL,'UNITTEST','UNITTEST','UNITTEST','ROSO','#b2ff59','#000');
SELECT lives_ok('insert_noi_type_in_test_calculate_active', 'should insert noi_type');


-- create a region
prepare insert_application_region_in_test_calculate_active AS
    INSERT INTO alcs.application_region (audit_created_by,audit_updated_by,code,description,"label",audit_deleted_date_at,audit_created_at,audit_updated_at) VALUES
        ('migration_seed',NULL,'TEST','NOI test st','Incoming / Prelim Review',NULL,'2023-01-01 14:30:38.573',NULL);
SELECT lives_ok('insert_application_region_in_test_calculate_active', 'should insert application_region');

prepare insert_local_government_in_test_calculate_active as 
	INSERT INTO alcs.local_government (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"name",preferred_region_code) VALUES
		('11111111-1111-1111-1111-111111111111',NULL,'2023-01-01 16:28:39.371', NULL,'unit_test',NULL,'Village of Mock','TEST');
SELECT lives_ok('insert_local_government_in_test_calculate_active', 'should insert local_government');

-- create noi status
prepare insert_card_status_in_test_calculate_active AS 
INSERT INTO alcs.card_status (audit_created_by,audit_updated_by,code,description,"label",audit_deleted_date_at,audit_created_at,audit_updated_at) VALUES
	 ('migration_seed',NULL,'TEST','NOI test st','Incoming / Prelim Review',NULL,'2023-01-01 14:30:38.573',NULL);
SELECT lives_ok('insert_card_status_in_test_calculate_active', 'should insert card_status');

-- create board
prepare insert_board_in_test_calculate_active AS
INSERT INTO alcs.board (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,code,title,show_on_schedule) VALUES
	 ('11111111-1111-1111-1111-111111111111',NULL,'2023-01-01 13:49:58.829', NULL,'unit_test',NULL,'mock','Mock Panel',false);
SELECT lives_ok('insert_board_in_test_calculate_active', 'should insert board');	 

-- create card type
prepare insert_card_type_in_test_calculate_active AS
INSERT INTO alcs.card_type (audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
	 (NULL,'2022-09-22 06:52:12.366',NULL,'migration_seed',NULL,'Mock','MOCK','Mock card type');
SELECT lives_ok('insert_card_type_in_test_calculate_active', 'should insert card_type');	 

-- create cards
prepare insert_cards_in_test_calculate_active AS
INSERT INTO alcs.card (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,high_priority,status_code,board_uuid,assignee_uuid,created_at,type_code) VALUES
	 ('11111111-1111-1111-1111-111111111111',NULL,'2023-01-01 14:39:17.968667-07', NULL,'unit_test',NULL,false,'TEST','11111111-1111-1111-1111-111111111111',NULL,'2023-01-01 14:39:17.968667-07','MOCK'),
	 ('22222222-2222-2222-2222-222222222222',NULL,'2023-01-01 14:39:17.968667-07', NULL,'unit_test',NULL,false,'TEST','11111111-1111-1111-1111-111111111111',NULL,'2023-01-01 14:39:17.968667-07','MOCK'),
	 ('33333333-3333-3333-3333-333333333333',NULL,'2023-01-01 14:39:17.968667-07', NULL,'unit_test',NULL,false,'TEST','11111111-1111-1111-1111-111111111111',NULL,'2023-01-01 14:39:17.968667-07','MOCK'),
	 ('44444444-4444-4444-4444-444444444444',NULL,'2023-01-01 14:39:17.968667-07', NULL,'unit_test',NULL,false,'TEST','11111111-1111-1111-1111-111111111111',NULL,'2023-01-01 14:39:17.968667-07','MOCK');
SELECT lives_ok('insert_cards_in_test_calculate_active', 'should insert card');	 	 

-- create nois
prepare insert_noi_in_test_calculate_active AS 
INSERT INTO alcs.notice_of_intent (uuid,audit_created_by,audit_updated_by,file_number,region_code,audit_deleted_date_at,audit_created_at,audit_updated_at,created_at,applicant,type_code,date_submitted_to_alc,date_acknowledged_complete,decision_date, card_uuid, local_government_uuid, date_received_all_items) VALUES
	 ('11111111-1111-1111-1111-111111111111','unit_test','unit_test','11111111-1111-1111-1111-111111111111','TEST',NULL,'2023-01-01 14:33:12.925','2023-01-01 17:37:06.292','2023-01-01 13:06:09.393','unit test 1','UNITTEST', '2023-01-01 13:06:09.393',NULL,NULL, '11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111', NULL),
	 ('22222222-2222-2222-2222-222222222222','unit_test','unit_test','22222222-2222-2222-2222-222222222222','TEST',NULL,'2023-01-01 14:33:12.925','2023-01-01 17:37:06.292','2023-01-01 13:06:09.393','unit test 1','UNITTEST', '2023-01-01 13:06:09.393','2023-01-01 13:06:09.393',NULL, NULL,'11111111-1111-1111-1111-111111111111','2023-01-01 13:06:09.393'),
	 ('33333333-3333-3333-3333-333333333333','unit_test','unit_test','33333333-3333-3333-3333-333333333333','TEST',NULL,'2023-01-01 14:33:12.925','2023-01-01 17:37:06.292','2023-01-01 13:06:09.393','unit test 2','UNITTEST', '2023-01-01 13:06:09.393','2023-01-01 13:06:09.393','2023-01-07 13:06:09.393','33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111','2023-01-02 13:06:09.393'),
	 ('44444444-4444-4444-4444-444444444444','unit_test','unit_test','44444444-4444-4444-4444-444444444444','TEST',NULL,'2023-01-01 14:33:12.925','2023-01-01 17:37:06.292','2023-01-01 13:06:09.393','unit test 3','UNITTEST', '2023-01-01 13:06:09.393','2023-01-01 13:06:09.393','2023-01-11 13:06:09.393','44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111','2023-01-11 13:06:09.393');
SELECT lives_ok('insert_noi_in_test_calculate_active', 'should insert noi');


-- create notice_of_intent_meeting_type records
prepare insert_notice_of_intent_meeting_type AS 
INSERT INTO alcs.notice_of_intent_meeting_type (audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
	 (NULL,'2023-06-12 16:10:29.820',NULL,'migration_seed',NULL,'UNIT TEST TYPE','IRTEST','UNIT TEST TYPE');
SELECT lives_ok('insert_notice_of_intent_meeting_type', 'should insert noi meeting type');


prepare insert_notice_of_intent_meeting AS 
INSERT INTO alcs.notice_of_intent_meeting (audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"uuid",description,start_date,end_date,type_code,notice_of_intent_uuid) VALUES
	 (NULL,'2023-01-01 17:23:28.033','2023-01-01 17:23:28.033','alcs-api',NULL,'11111111-1111-1111-1111-111111111111',NULL,'2023-01-01 17:23:28.033','2023-01-01 17:23:28.033','IRTEST','11111111-1111-1111-1111-111111111111'),
	 (NULL,'2023-01-02 17:23:28.033','2023-01-07 17:23:28.033','alcs-api',NULL,'33333333-3333-3333-3333-333333333333',NULL,'2023-01-02 00:00:00.000 -0700','2023-01-03 00:00:00.000 -0700','IRTEST','33333333-3333-3333-3333-333333333333');
SELECT lives_ok('insert_notice_of_intent_meeting', 'should insert notice_of_intent_meeting');
-- test cases

-- no dates set yet
SELECT override.freeze_time('2022-08-02 00:00:00.000 -0700');
PREPARE actual_result_no_dates AS SELECT * FROM alcs.calculate_noi_active_days('{11111111-1111-1111-1111-111111111111}'::uuid[]);
PREPARE expected_result_no_dates AS VALUES ('11111111-1111-1111-1111-111111111111'::uuid, NULL::integer, NULL::integer);
SELECT results_eq('actual_result_no_dates', 'expected_result_no_dates', 'Should be 0 active days and 0 paused days');

-- should return active days
SELECT override.freeze_time('2023-01-01 00:00:00.000 -0700');
PREPARE actual_result_4_active_days AS SELECT * from alcs.calculate_noi_active_days('{33333333-3333-3333-3333-333333333333}'::uuid[]);
PREPARE expected_result_4_active_days AS VALUES ('33333333-3333-3333-3333-333333333333'::uuid,4,NULL::integer);
SELECT results_eq('actual_result_4_active_days', 'expected_result_4_active_days', 'Should be active days');

-- should return 0 active days
SELECT override.freeze_time('2023-01-01 00:00:00.000 -0700');
PREPARE actual_result_0_active_days AS SELECT * from alcs.calculate_noi_active_days('{44444444-4444-4444-4444-444444444444}'::uuid[]);
PREPARE expected_result_0_active_days AS VALUES ('44444444-4444-4444-4444-444444444444'::uuid,0,NULL::integer);
SELECT results_eq('actual_result_0_active_days', 'expected_result_0_active_days', 'Should be active days');


-- properly finish test
SELECT * FROM finish();

-- rollback all changes
ROLLBACK;
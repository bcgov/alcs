BEGIN;
-- prepare pgtap
SELECT * from plan(18);

-- prepare data

-- temp clear existing data
DELETE FROM holiday_entity;

-- create holidays
prepare insert_2022_holidays AS
INSERT INTO "public"."holiday_entity" ("uuid", "name", "day") VALUES
    ('3fe6132e-ef24-4132-bacf-2a22bdf1a3d1', 'Holiday 1', TO_TIMESTAMP('2022-07-25', 'YYYY-MM-DD')),
    ('d93e9d9c-c1f6-4f1d-bcce-781d4d5ecd99', 'Holiday 2', TO_TIMESTAMP('2022-08-01', 'YYYY-MM-DD')),
    ('75579109-7394-4561-8e3a-8acd8472f45e', 'Holiday 3', TO_TIMESTAMP('2022-08-30', 'YYYY-MM-DD'));
SELECT lives_ok('insert_2022_holidays', 'should insert holiday_entity');

-- create user
prepare insert_users_in_test_calculate_paused AS 
INSERT INTO public."user" (uuid,audit_created_by,audit_updated_by,email,"name",display_name,identity_provider,preferred_username,given_name,family_name,idir_user_guid,idir_user_name,audit_deleted_date_at,audit_created_at,audit_updated_at) VALUES
	 ('11111111-1111-1111-1111-111111111111','setAuditCreatedBy here',NULL,'some.test.user@bit3.ca','Test User','Test, User LWRS:EX','idir','11111111111111111@idir','User','Test','11111111111111111','UTEST',NULL,'2022-07-26 14:30:04.189077-07','2022-07-26 14:30:04.189077-07');
SELECT lives_ok('insert_users_in_test_calculate_paused', 'should insert user');

-- create application type
prepare insert_application_type_in_test_calculate_paused AS 
INSERT INTO public.application_type (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,code,description,"label",short_label,background_color,text_color) VALUES
	 ('11111111-1111-1111-1111-111111111111',NULL,'2022-08-02 16:20:41.717',NULL,'alcs-api',NULL,'UNITTEST','UNITTEST','UNITTEST','Fill','#b2ff59','#000');
SELECT lives_ok('insert_application_type_in_test_calculate_paused', 'should insert application_type');

-- create a region
prepare insert_application_region_in_test_calculate_paused AS
    INSERT INTO public.application_region (uuid,audit_created_by,audit_updated_by,code,description,"label",audit_deleted_date_at,audit_created_at,audit_updated_at) VALUES
        ('11111111-1111-1111-1111-111111111111','migration_seed',NULL,'TEST','Application test st','Incoming / Prelim Review',NULL,'2022-07-25 14:30:38.573',NULL);
SELECT lives_ok('insert_application_region_in_test_calculate_paused', 'should insert application_region');

prepare insert_application_local_government_in_test_calculate_paused as 
	INSERT INTO public.application_local_government (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"name",preferred_region_uuid) VALUES
		('11111111-1111-1111-1111-111111111111',NULL,'2022-09-29 16:28:39.371', NULL,'unit_test',NULL,'Village of Mock','11111111-1111-1111-1111-111111111111');
SELECT lives_ok('insert_application_local_government_in_test_calculate_paused', 'should insert application_local_government');

-- create application status
prepare insert_card_status_in_test_calculate_paused AS 
INSERT INTO public.card_status (uuid,audit_created_by,audit_updated_by,code,description,"label",audit_deleted_date_at,audit_created_at,audit_updated_at) VALUES
	 ('11111111-1111-1111-1111-111111111111','migration_seed',NULL,'TEST','Application test st','Incoming / Prelim Review',NULL,'2022-07-25 14:30:38.573',NULL);
SELECT lives_ok('insert_card_status_in_test_calculate_paused', 'should insert card_status');

-- create board
prepare insert_board_in_test_calculate_paused AS
INSERT INTO public.board (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,code,title,decision_maker) VALUES
	 ('11111111-1111-1111-1111-111111111111',NULL,'2022-08-24 13:49:58.829', NULL,'unit_test',NULL,'mock','Mock Panel','Mock Panel');
SELECT lives_ok('insert_board_in_test_calculate_paused', 'should insert board');	 

-- create card type
prepare insert_card_type_in_test_calculate_paused AS
INSERT INTO public.card_type (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,"label",code,description) VALUES
	 ('11111111-1111-1111-1111-111111111111',NULL,'2022-09-22 06:52:12.366',NULL,'migration_seed',NULL,'Mock','MOCK','Mock card type');
SELECT lives_ok('insert_card_type_in_test_calculate_paused', 'should insert card_type');	 

-- create cards
prepare insert_cards_in_test_calculate_paused AS
INSERT INTO public.card (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,high_priority,status_uuid,board_uuid,assignee_uuid,created_at,type_uuid) VALUES
	 ('11111111-1111-1111-1111-111111111111',NULL,'2022-10-03 14:39:17.968667-07', NULL,'unit_test',NULL,false,'11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111',NULL,'2022-10-03 14:39:17.968667-07','11111111-1111-1111-1111-111111111111'),
	 ('22222222-2222-2222-2222-222222222222',NULL,'2022-10-03 14:39:17.968667-07', NULL,'unit_test',NULL,false,'11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111',NULL,'2022-10-03 14:39:17.968667-07','11111111-1111-1111-1111-111111111111'),
	 ('33333333-3333-3333-3333-333333333333',NULL,'2022-10-03 14:39:17.968667-07', NULL,'unit_test',NULL,false,'11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111',NULL,'2022-10-03 14:39:17.968667-07','11111111-1111-1111-1111-111111111111'),
	 ('44444444-4444-4444-4444-444444444444',NULL,'2022-10-03 14:39:17.968667-07', NULL,'unit_test',NULL,false,'11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111',NULL,'2022-10-03 14:39:17.968667-07','11111111-1111-1111-1111-111111111111'),
	 ('55555555-5555-5555-5555-555555555555',NULL,'2022-10-03 14:39:17.968667-07', NULL,'unit_test',NULL,false,'11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111',NULL,'2022-10-03 14:39:17.968667-07','11111111-1111-1111-1111-111111111111');
SELECT lives_ok('insert_cards_in_test_calculate_paused', 'should insert card');	 	 

-- create application
prepare insert_application_in_test_calculate_paused AS 
INSERT INTO public.application (uuid,audit_created_by,audit_updated_by,file_number,region_uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,created_at,applicant,type_uuid,date_received,date_acknowledged_complete,decision_date, card_uuid, local_government_uuid) VALUES
	 ('11111111-1111-1111-1111-111111111111','unit_test','unit_test','11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111',NULL,'2022-07-26 14:33:12.925','2022-07-26 17:37:06.292','2022-07-26 13:06:09.393','unit test 1','11111111-1111-1111-1111-111111111111', '2022-07-26 13:06:09.393',NULL,NULL, '11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111'),
	 ('22222222-2222-2222-2222-222222222222','unit_test','unit_test','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',NULL,'2022-07-26 14:33:12.925','2022-07-26 17:37:06.292','2022-07-26 13:06:09.393','unit test 1','11111111-1111-1111-1111-111111111111', '2022-07-26 13:06:09.393','2022-07-26 13:06:09.393',NULL,'22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111'),
	 ('33333333-3333-3333-3333-333333333333','unit_test','unit_test','33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111',NULL,'2022-07-26 14:33:12.925','2022-07-26 17:37:06.292','2022-07-26 13:06:09.393','unit test 2','11111111-1111-1111-1111-111111111111', '2022-07-26 13:06:09.393','2022-07-26 13:06:09.393',NULL,'33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111'),
	 ('44444444-4444-4444-4444-444444444444','unit_test','unit_test','44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111',NULL,'2022-07-26 14:33:12.925','2022-07-26 17:37:06.292','2022-07-26 13:06:09.393','unit test 3','11111111-1111-1111-1111-111111111111', '2022-07-26 13:06:09.393','2022-07-26 13:06:09.393',NULL,'44444444-4444-4444-4444-444444444444','11111111-1111-1111-1111-111111111111'),
	 ('55555555-5555-5555-5555-555555555555','unit_test','unit_test','55555555-5555-5555-5555-555555555555','11111111-1111-1111-1111-111111111111',NULL,'2022-07-26 14:33:12.925','2022-07-26 17:37:06.292','2022-07-26 13:06:09.393','unit test 3','11111111-1111-1111-1111-111111111111', '2022-07-26 13:06:09.393','2022-07-26 13:06:09.393','2022-08-12 13:06:09.393','55555555-5555-5555-5555-555555555555','11111111-1111-1111-1111-111111111111');
SELECT lives_ok('insert_application_in_test_calculate_paused', 'should insert application');

-- create application paused
prepare insert_application_paused_in_test_calculate_paused AS 
INSERT INTO public.application_paused (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by,start_date,end_date,application_uuid) VALUES
	 ('44444444-4444-4444-4444-444444444444',NULL,'2022-07-26 17:23:28.033','2022-07-28 17:23:33.131','pgtap','pgtap','2022-07-29','2022-08-03','44444444-4444-4444-4444-444444444444'),
	 ('33333333-3333-3333-3333-333333333333',NULL,'2022-07-26 17:23:28.033','2022-07-28 17:23:33.131','pgtap','pgtap','2022-07-27','2022-07-27','33333333-3333-3333-3333-333333333333');
SELECT lives_ok('insert_application_paused_in_test_calculate_paused', 'should insert application_paused');

-- test cases

-- no dates set yet
SELECT override.freeze_time('2022-08-02');
PREPARE actual_result_no_dates AS SELECT * from calculate_active_days('{11111111-1111-1111-1111-111111111111}'::uuid[]);
PREPARE expected_result_no_dates AS VALUES ('11111111-1111-1111-1111-111111111111'::uuid,0,0);
SELECT results_eq('actual_result_no_dates', 'expected_result_no_dates', 'Should be 0 active days and 0 paused days');

-- 1 business week with 1 holiday
SELECT override.freeze_time('2022-08-02');
PREPARE actual_result_1_week_with_holiday_no_pause AS SELECT * from calculate_active_days('{22222222-2222-2222-2222-222222222222}'::uuid[]);
PREPARE expected_result_1_week_with_holiday_no_pause AS VALUES ('22222222-2222-2222-2222-222222222222'::uuid,4,0);
SELECT results_eq('actual_result_1_week_with_holiday_no_pause', 'expected_result_1_week_with_holiday_no_pause', 'Should be 4 active days');

-- 1 business week with 1 holiday and 1 pause
SELECT override.freeze_time('2022-08-02');
PREPARE actual_result_1_week_with_holiday_with_pause AS SELECT * from calculate_active_days('{33333333-3333-3333-3333-333333333333}'::uuid[]);
PREPARE expected_result_1_week_with_holiday_with_pause AS VALUES ('33333333-3333-3333-3333-333333333333'::uuid,3,1);
SELECT results_eq('actual_result_1_week_with_holiday_with_pause', 'expected_result_1_week_with_holiday_with_pause', 'Should be 3 active days with 1 pause day');

-- 1 business week with 1 holiday and 2 overlapping pauses

-- add overlapping second pause
prepare insert_application_paused_2 AS
INSERT INTO public.application_paused (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by, "start_date",end_date,application_uuid) VALUES
	 ('22222222-2222-2222-2222-222222222223',NULL,'2022-07-26 17:23:28.033','2022-07-28 17:23:33.131','pgtap','pgtap','2022-07-27','2022-07-27','33333333-3333-3333-3333-333333333333');
SELECT lives_ok('insert_application_paused_2', 'should insert application_paused_2');

PREPARE actual_result_1_week_with_holiday_with_overlap_pause AS SELECT * from calculate_active_days('{33333333-3333-3333-3333-333333333333}'::uuid[]);
PREPARE expected_result_1_week_with_holiday_with_overlap_pause AS VALUES ('33333333-3333-3333-3333-333333333333'::uuid,3,1);
SELECT results_eq('actual_result_1_week_with_holiday_with_overlap_pause', 'expected_result_1_week_with_holiday_with_overlap_pause', 'Should be 3 active days with 1 pause day');

-- should not count pause days that are over a holiday (paused Mon - Sunday, but Fri is holiday = 3 paused)
SELECT override.freeze_time('2022-09-06');
PREPARE actual_result_paused_and_active_holiday AS SELECT * from calculate_active_days('{44444444-4444-4444-4444-444444444444}'::uuid[]);
PREPARE expected_result_paused_and_active_holiday AS VALUES ('44444444-4444-4444-4444-444444444444'::uuid,25,3);
SELECT results_eq('actual_result_paused_and_active_holiday','expected_result_paused_and_active_holiday', 'Should have 25 active days and 3 paused');


-- application with decision date set
PREPARE actual_result_with_decision_date AS SELECT * from calculate_active_days('{55555555-5555-5555-5555-555555555555}'::uuid[]);
PREPARE expected_result_with_decision_date AS VALUES ('55555555-5555-5555-5555-555555555555'::uuid,12,0);
SELECT results_eq('actual_result_with_decision_date', 'expected_result_with_decision_date', 'Should be 12 active days');

-- properly finish test
SELECT * FROM finish();

-- rollback all changes
ROLLBACK;
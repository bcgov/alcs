BEGIN;
-- prepare pgtap
SELECT * from plan(11);

-- prepare data

-- temp clear existing data
DELETE FROM holiday_entity;

-- create holidays
prepare insert_2022_holidays AS
INSERT INTO "public"."holiday_entity" ("uuid", "name", "day") VALUES
    ('3fe6132e-ef24-4132-bacf-2a22bdf1a3d1', 'Holiday 1', '2022-07-25'),
    ('d93e9d9c-c1f6-4f1d-bcce-781d4d5ecd99', 'Holiday 2', '2022-08-01'),
    ('75579109-7394-4561-8e3a-8acd8472f45e', 'Holiday 3', '2022-08-30');
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

-- create application status
prepare insert_application_status_in_test_calculate_paused AS 
INSERT INTO public.application_status (uuid,audit_created_by,audit_updated_by,code,description,"label",audit_deleted_date_at,audit_created_at,audit_updated_at) VALUES
	 ('11111111-1111-1111-1111-111111111111','migration_seed',NULL,'TEST','Application test st','Incoming / Prelim Review',NULL,'2022-07-25 14:30:38.573',NULL);
SELECT lives_ok('insert_application_status_in_test_calculate_paused', 'should insert application_status');

-- create application
prepare insert_application_in_test_calculate_paused AS 
INSERT INTO public.application (uuid,audit_created_by,audit_updated_by,file_number,status_uuid,assignee_uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,created_at,paused,applicant,type_uuid,date_received) VALUES
	 ('11111111-1111-1111-1111-111111111111','unit_test','unit_test','11111111-1111-1111-1111-111111111111','11111111-1111-1111-1111-111111111111',NULL,NULL,'2022-07-26 14:33:12.925','2022-07-26 17:37:06.292','2022-07-26 13:06:09.393',false,'unit test 1','11111111-1111-1111-1111-111111111111', NOW()),
	 ('22222222-2222-2222-2222-222222222222','unit_test','unit_test','22222222-2222-2222-2222-222222222222','11111111-1111-1111-1111-111111111111',NULL,NULL,'2022-07-26 14:33:12.925','2022-07-26 17:37:06.292','2022-07-26 13:06:09.393',false,'unit test 2','11111111-1111-1111-1111-111111111111', NOW()),
	 ('33333333-3333-3333-3333-333333333333','unit_test','unit_test','33333333-3333-3333-3333-333333333333','11111111-1111-1111-1111-111111111111',NULL,NULL,'2022-07-26 14:33:12.925','2022-07-26 17:37:06.292','2022-07-26 13:06:09.393',false,'unit test 3','11111111-1111-1111-1111-111111111111', NOW());
SELECT lives_ok('insert_application_in_test_calculate_paused', 'should insert application');

-- create application paused
prepare insert_application_paused_in_test_calculate_paused AS 
INSERT INTO public.application_paused (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by, "start_date",end_date,application_uuid) VALUES
	 ('33333333-3333-3333-3333-333333333333',NULL,'2022-07-26 17:23:28.033','2022-07-28 17:23:33.131','pgtap','pgtap','2022-07-29','2022-08-03','33333333-3333-3333-3333-333333333333'),
	 ('22222222-2222-2222-2222-222222222222',NULL,'2022-07-26 17:23:28.033','2022-07-28 17:23:33.131','pgtap','pgtap','2022-07-27','2022-07-27','22222222-2222-2222-2222-222222222222');
SELECT lives_ok('insert_application_paused_in_test_calculate_paused', 'should insert application_paused');

-- create empty table for return type matching
CREATE TABLE Empty_Table (
	application_uuid UUID,
	"days" INTEGER
);

-- test cases

-- 1 business week with 1 holiday
SELECT override.freeze_time('2022-08-02');
PREPARE actual_result_1_week_with_holiday_no_pause AS SELECT * from calculate_active_days('{11111111-1111-1111-1111-111111111111}'::uuid[]);
PREPARE expected_result_1_week_with_holiday_no_pause AS VALUES ('11111111-1111-1111-1111-111111111111'::uuid,5,0);
SELECT results_eq('actual_result_1_week_with_holiday_no_pause', 'expected_result_1_week_with_holiday_no_pause', 'Should be 5 active days');

-- 1 business week with 1 holiday and 1 pause
SELECT override.freeze_time('2022-08-02');
PREPARE actual_result_1_week_with_holiday_with_pause AS SELECT * from calculate_active_days('{22222222-2222-2222-2222-222222222222}'::uuid[]);
PREPARE expected_result_1_week_with_holiday_with_pause AS VALUES ('22222222-2222-2222-2222-222222222222'::uuid,4,1);
SELECT results_eq('actual_result_1_week_with_holiday_with_pause', 'expected_result_1_week_with_holiday_with_pause', 'Should be 4 active days with 1 pause day');

-- 1 business week with 1 holiday and 2 overlapping pauses

-- add second pause
prepare insert_application_paused_2 AS
INSERT INTO public.application_paused (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by, "start_date",end_date,application_uuid) VALUES
	 ('22222222-2222-2222-2222-222222222223',NULL,'2022-07-26 17:23:28.033','2022-07-28 17:23:33.131','pgtap','pgtap','2022-07-27','2022-07-27','22222222-2222-2222-2222-222222222222');
SELECT lives_ok('insert_application_paused_2', 'should insert application_paused_2');

PREPARE actual_result_1_week_with_holiday_with_overlap_pause AS SELECT * from calculate_active_days('{22222222-2222-2222-2222-222222222222}'::uuid[]);
PREPARE expected_result_1_week_with_holiday_with_overlap_pause AS VALUES ('22222222-2222-2222-2222-222222222222'::uuid,4,1);
SELECT results_eq('actual_result_1_week_with_holiday_with_overlap_pause', 'expected_result_1_week_with_holiday_with_overlap_pause', 'Should be 4 active days with 1 pause day');

-- should not count pause days that are over a holiday (paused Mon - Sunday, but Fri is holiday = 3 paused)
SELECT override.freeze_time('2022-09-06');
PREPARE actual_result_paused_and_active_holiday AS SELECT * from calculate_active_days('{33333333-3333-3333-3333-333333333333}'::uuid[]);
PREPARE expected_result_paused_and_active_holiday AS VALUES ('33333333-3333-3333-3333-333333333333'::uuid,26,3);
SELECT results_eq('actual_result_paused_and_active_holiday','expected_result_paused_and_active_holiday', 'Should have 26 active days and 3 paused');

-- properly finish test
SELECT * FROM finish();

-- roallback allchanges
ROLLBACK;
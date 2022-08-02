BEGIN;
-- prepare pgtap
SELECT * from plan(8);

-- prepare data

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
INSERT INTO public.application (uuid,audit_created_by,audit_updated_by,file_number,title,status_uuid,assignee_uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,created_at,paused,applicant,type_uuid) VALUES
	 ('11111111-1111-1111-1111-111111111111','unit_test','unit_test','11111111-1111-1111-1111-111111111111','file_num_title_1','11111111-1111-1111-1111-111111111111',NULL,NULL,'2022-07-26 14:33:12.925','2022-07-28 17:37:06.292','2022-07-28 13:06:09.393',false,'unit test 1','11111111-1111-1111-1111-111111111111'),
	 ('22222222-2222-2222-2222-222222222222','unit_test','unit_test','22222222-2222-2222-2222-222222222222','file_num_title_1','11111111-1111-1111-1111-111111111111',NULL,NULL,'2022-07-26 14:33:12.925','2022-07-28 17:37:06.292','2022-07-28 13:06:09.393',false,'unit test 2','11111111-1111-1111-1111-111111111111'),
	 ('33333333-3333-3333-3333-333333333333','unit_test','unit_test','33333333-3333-3333-3333-333333333333','file_num_title_1','11111111-1111-1111-1111-111111111111',NULL,NULL,'2022-07-26 14:33:12.925','2022-07-28 17:37:06.292','2022-07-28 13:06:09.393',false,'unit test 3','11111111-1111-1111-1111-111111111111');
SELECT lives_ok('insert_application_in_test_calculate_paused', 'should insert application');

-- create application paused
prepare insert_application_paused_in_test_calculate_paused AS 
INSERT INTO public.application_paused (uuid,audit_deleted_date_at,audit_created_at,audit_updated_at,audit_created_by,audit_updated_by, "start_date",end_date,application_uuid) VALUES
	 ('11111111-1111-1111-1111-111111111111',NULL,'2022-07-26 17:23:28.033','2022-07-28 17:23:33.131','pgtap','pgtap','2022-07-27','2022-07-29','11111111-1111-1111-1111-111111111111'),
	 ('22222222-2222-2222-2222-222222222222',NULL,'2022-07-26 17:23:28.033','2022-07-28 17:23:33.131','pgtap','pgtap','2022-07-27','2022-07-27','22222222-2222-2222-2222-222222222222');
SELECT lives_ok('insert_application_paused_in_test_calculate_paused', 'should insert application_paused');

-- create empty table for return type matching
CREATE TABLE Empty_Table (
	application_uuid UUID,
	"days" INTEGER
);

-- execute and prepare values for assertion
PREPARE actual_result_2_days AS SELECT * from calculate_paused_time('{11111111-1111-1111-1111-111111111111}'::uuid[]);
PREPARE expected_result_2_days AS VALUES ('11111111-1111-1111-1111-111111111111'::uuid,2);
PREPARE actual_result_1_day AS SELECT * from calculate_paused_time('{22222222-2222-2222-2222-222222222222}'::uuid[]);
PREPARE expected_result_1_day AS VALUES ('22222222-2222-2222-2222-222222222222'::uuid,1);
PREPARE actual_result_empty_records AS SELECT * from calculate_paused_time('{33333333-3333-3333-3333-333333333333}'::uuid[]);
PREPARE expected_result_empty_records AS SELECT * from Empty_Table;

-- assert
SELECT results_eq('actual_result_2_days', 'expected_result_2_days', 'The paused days should be 2');
SELECT results_eq('actual_result_1_day', 'expected_result_1_day', 'The paused days should be 1 if the application paused and activated durng the same day');
SELECT results_eq('actual_result_empty_records','expected_result_empty_records', 'The paused days should be NULL if there are no records in paused');

-- properly finish test
SELECT * FROM finish();

-- roallback allchanges
ROLLBACK;

BEGIN;
-- preapre pgtap 
SELECT * from plan(8);

SELECT has_table('application_status');
SELECT has_table('application_type');
SELECT has_table('application_history');
SELECT has_table('application_paused');
SELECT has_table('application');
SELECT has_table('user');
SELECT has_table('holiday_entity');
SELECT has_table('health_check');

SELECT * FROM finish();

ROLLBACK;
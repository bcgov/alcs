
BEGIN;
-- prepare pgtap
SELECT * from plan(11);

SELECT has_table('card_status');
SELECT has_table('card');
SELECT has_table('card_type');
SELECT has_table('board');
SELECT has_table('application_type');
SELECT has_table('card_history');
SELECT has_table('application_paused');
SELECT has_table('application');
SELECT has_table('user');
SELECT has_table('holiday_entity');
SELECT has_table('health_check');

SELECT * FROM finish();

ROLLBACK;
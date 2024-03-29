BEGIN;
-- prepare pgtap
SELECT * from plan(3);

-- test cases
SELECT is(alcs.get_weekday_count(TO_TIMESTAMP('2022-08-15','YYYY-MM-DD'), TO_TIMESTAMP('2022-08-15','YYYY-MM-DD')), 1, 'Should be 1 days for the same day');
SELECT is(alcs.get_weekday_count(TO_TIMESTAMP('2022-08-15','YYYY-MM-DD'), TO_TIMESTAMP('2022-08-19','YYYY-MM-DD')), 5, 'Should be 5 days for a business week');
SELECT is(alcs.get_weekday_count(TO_TIMESTAMP('2022-08-15','YYYY-MM-DD'), TO_TIMESTAMP('2022-08-22','YYYY-MM-DD')), 6, 'Should be 6 days for a Monday -> Monday');

-- properly finish test
SELECT * FROM finish();

-- roallback allchanges
ROLLBACK;
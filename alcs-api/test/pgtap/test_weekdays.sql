BEGIN;
-- prepare pgtap
SELECT * from plan(3);

-- test cases
SELECT is(get_weekday_count('2022-08-15', '2022-08-15'), 1, 'Should be 1 days for the same day');
SELECT is(get_weekday_count('2022-08-15', '2022-08-19'), 5, 'Should be 5 days for a business week');
SELECT is(get_weekday_count('2022-08-15', '2022-08-22'), 6, 'Should be 6 days for a Monday -> Monday');

-- properly finish test
SELECT * FROM finish();

-- roallback allchanges
ROLLBACK;
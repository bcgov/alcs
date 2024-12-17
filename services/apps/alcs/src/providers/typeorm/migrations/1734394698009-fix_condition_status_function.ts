import { MigrationInterface, QueryRunner } from "typeorm";

export class FixConditionStatusFunction1734394698009 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION alcs.get_current_status_for_application_condition(
                application_condition_uuid uuid,
                OUT status character varying)
                RETURNS character varying
                LANGUAGE 'plpgsql'
                COST 100
                VOLATILE PARALLEL UNSAFE
            AS $BODY$
                            DECLARE
                                dates_cursor CURSOR FOR
                                    SELECT
                                        t.single_date_label, d.uuid, d.date, d.comment, d.completed_date
                                    FROM alcs.application_decision_condition_date d
                                    INNER JOIN alcs.application_decision_condition c ON c.uuid = d.condition_uuid
                                    INNER JOIN alcs.application_decision_condition_type t ON t.code = c.type_code
                                    WHERE
                                        d.condition_uuid = application_condition_uuid;
                                utc_timestamp_today timestamptz;
                                is_ongoing boolean;
                                is_completed boolean;
                                is_pastdue boolean;
                                is_pending boolean;
                                is_expired boolean;
                                date_record RECORD;
                            BEGIN
                                utc_timestamp_today = timezone('utc', (now()));
                                status = 'ONGOING';
                                is_ongoing = true;
                                is_completed = false;
                                is_pastdue = false;
                                is_pending = false;
                                is_expired = false;

                                OPEN dates_cursor;

                                LOOP
                                    FETCH NEXT FROM dates_cursor INTO date_record;
                                    IF NOT FOUND THEN
                                        is_pending = true;
                                        EXIT;
                                    END IF;
                                    is_ongoing = false;
                                    IF (date_record.completed_date IS NOT NULL) THEN 
                                        is_completed =  true;
                                    ELSE
                                        is_completed =  false;
                                        -- check if it's pending
                                        IF (date_record.date >= utc_timestamp_today OR date_record.date IS NULL) THEN
                                            is_pending = true;
                                        END IF;
                                        -- check if it's past due
                                        IF (date_record.date <= utc_timestamp_today AND date_record.single_date_label = 'Due Date') THEN
                                            is_pastdue = true;
                                        END IF;
                                        -- check if it's expired
                                        IF (date_record.date <= utc_timestamp_today AND date_record.single_date_label = 'End Date') THEN
                                            is_expired = true;
                                        END IF;
                                    END IF;
                                END LOOP;
                                CLOSE dates_cursor;
                                IF (is_completed) THEN
                                    status = 'COMPLETED';
                                END IF;
                                IF (is_pending) THEN
                                    status = 'PENDING';
                                END IF;
                                IF (is_expired) THEN
                                    status = 'EXPIRED';
                                END IF;
                                IF (is_pastdue) THEN
                                    status = 'PASTDUE';
                                END IF;
                            END;
                        
            $BODY$;

            ALTER FUNCTION alcs.get_current_status_for_application_condition(uuid)
                OWNER TO postgres;
            `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION alcs.get_current_status_for_noi_condition(
                noi_condition_uuid uuid,
                OUT status character varying)
                RETURNS character varying
                LANGUAGE 'plpgsql'
                COST 100
                VOLATILE PARALLEL UNSAFE
            AS $BODY$
                            DECLARE
                                dates_cursor CURSOR FOR
                                    SELECT
                                        t.single_date_label, d.uuid, d.date, d.comment, d.completed_date
                                    FROM alcs.notice_of_intent_decision_condition_date d
                                    INNER JOIN alcs.notice_of_intent_decision_condition c ON c.uuid = d.condition_uuid
                                    INNER JOIN alcs.notice_of_intent_decision_condition_type t ON t.code = c.type_code
                                    WHERE
                                        d.condition_uuid = noi_condition_uuid;
                                utc_timestamp_today timestamptz;
                                is_ongoing boolean;
                                is_completed boolean;
                                is_pastdue boolean;
                                is_pending boolean;
                                is_expired boolean;
                                date_record RECORD;
                            BEGIN
                                utc_timestamp_today = timezone('utc', (now()));
                                status = 'ONGOING';
                                is_ongoing = true;
                                is_completed = false;
                                is_pastdue = false;
                                is_pending = false;
                                is_expired = false;

                                OPEN dates_cursor;

                                LOOP
                                    FETCH NEXT FROM dates_cursor INTO date_record;
                                    IF NOT FOUND THEN
                                        is_pending = true;
                                        EXIT;
                                    END IF;
                                    is_ongoing = false;
                                    IF (date_record.completed_date IS NOT NULL) THEN 
                                        is_completed =  true;
                                    ELSE
                                        is_completed =  false;
                                        -- check if it's pending
                                        IF (date_record.date >= utc_timestamp_today OR date_record.date IS NULL) THEN
                                            is_pending = true;
                                        END IF;
                                        -- check if it's past due
                                        IF (date_record.date <= utc_timestamp_today AND date_record.single_date_label = 'Due Date') THEN
                                            is_pastdue = true;
                                        END IF;
                                        -- check if it's expired
                                        IF (date_record.date <= utc_timestamp_today AND date_record.single_date_label = 'End Date') THEN
                                            is_expired = true;
                                        END IF;
                                    END IF;
                                END LOOP;
                                CLOSE dates_cursor;
                                IF (is_completed) THEN
                                    status = 'COMPLETED';
                                END IF;
                                IF (is_pending) THEN
                                    status = 'PENDING';
                                END IF;
                                IF (is_expired) THEN
                                    status = 'EXPIRED';
                                END IF;
                                IF (is_pastdue) THEN
                                    status = 'PASTDUE';
                                END IF;
                            END;
                        
            $BODY$;

            ALTER FUNCTION alcs.get_current_status_for_noi_condition(uuid)
                OWNER TO postgres;
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION alcs.get_current_status_for_application_condition(
                    application_condition_uuid uuid,
                    OUT status VARCHAR(20)
                )
                RETURNS VARCHAR(20)
                LANGUAGE 'plpgsql'
                COST 100
                VOLATILE PARALLEL UNSAFE
            AS $BODY$
                DECLARE
                    dates_cursor CURSOR FOR
                        SELECT
                            t.single_date_label, d.uuid, d.date, d.comment, d.completed_date
                        FROM alcs.application_decision_condition_date d
                        INNER JOIN alcs.application_decision_condition c ON c.uuid = d.condition_uuid
                        INNER JOIN alcs.application_decision_condition_type t ON t.code = c.type_code
                        WHERE
                            d.condition_uuid = application_condition_uuid;
                    utc_timestamp_today timestamptz;
                    is_ongoing boolean;
                    is_completed boolean;
                    is_pastdue boolean;
                    is_pending boolean;
                    is_expired boolean;
                    date_record RECORD;
                BEGIN
                    utc_timestamp_today = timezone('utc', (now()));
                    status = 'ONGOING';
                    is_ongoing = true;
                    is_completed = false;
                    is_pastdue = false;
                    is_pending = false;
                    is_expired = false;

                    OPEN dates_cursor;

                    LOOP
                        FETCH NEXT FROM dates_cursor INTO date_record;
                        EXIT WHEN NOT FOUND;
                        is_ongoing = false;
                        IF (date_record.completed_date IS NOT NULL) THEN 
                            is_completed =  true;
                        ELSE
                            is_completed =  false;
                            -- check if it's past due
                            IF (date_record.date <= utc_timestamp_today AND date_record.single_date_label = 'Due Date') THEN
                                is_pastdue = true;
                            END IF;
                            -- check if it's pending
                            IF (date_record.date >= utc_timestamp_today) THEN
                                is_pending = true;
                            END IF;
                            -- check if it's expired
                            IF (date_record.date <= utc_timestamp_today AND date_record.single_date_label = 'End Date') THEN
                                is_expired = true;
                            END IF;
                        END IF;
                    END LOOP;
                    CLOSE dates_cursor;
                    IF (is_completed) THEN
                        status = 'COMPLETED';
                    ELSEIF (is_pending) THEN
                        status = 'PENDING';
                    ELSEIF (is_expired) THEN
                        status = 'EXPIRED';
                    ELSEIF (is_pastdue) THEN
                        status = 'PASTDUE';
                    END IF;
                END;
            $BODY$;

            ALTER FUNCTION alcs.get_current_status_for_application_condition(uuid)
                OWNER TO postgres;
            `);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION alcs.get_current_status_for_noi_condition(
                    noi_condition_uuid uuid,
                    OUT status VARCHAR(20)
                )
                RETURNS VARCHAR(20)
                LANGUAGE 'plpgsql'
                COST 100
                VOLATILE PARALLEL UNSAFE
            AS $BODY$
                DECLARE
                    dates_cursor CURSOR FOR
                        SELECT
                            t.single_date_label, d.uuid, d.date, d.comment, d.completed_date
                        FROM alcs.notice_of_intent_decision_condition_date d
                        INNER JOIN alcs.notice_of_intent_decision_condition c ON c.uuid = d.condition_uuid
                        INNER JOIN alcs.notice_of_intent_decision_condition_type t ON t.code = c.type_code
                        WHERE
                            d.condition_uuid = noi_condition_uuid;
                    utc_timestamp_today timestamptz;
                    is_ongoing boolean;
                    is_completed boolean;
                    is_pastdue boolean;
                    is_pending boolean;
                    is_expired boolean;
                    date_record RECORD;
                BEGIN
                    utc_timestamp_today = timezone('utc', (now()));
                    status = 'ONGOING';
                    is_ongoing = true;
                    is_completed = false;
                    is_pastdue = false;
                    is_pending = false;
                    is_expired = false;

                    OPEN dates_cursor;

                    LOOP
                        FETCH NEXT FROM dates_cursor INTO date_record;
                        EXIT WHEN NOT FOUND;
                        is_ongoing = false;
                        IF (date_record.completed_date IS NOT NULL) THEN 
                            is_completed =  true;
                        ELSE
                            is_completed =  false;
                            -- check if it's past due
                            IF (date_record.date <= utc_timestamp_today AND date_record.single_date_label = 'Due Date') THEN
                                is_pastdue = true;
                            END IF;
                            -- check if it's pending
                            IF (date_record.date >= utc_timestamp_today) THEN
                                is_pending = true;
                            END IF;
                            -- check if it's expired
                            IF (date_record.date <= utc_timestamp_today AND date_record.single_date_label = 'End Date') THEN
                                is_expired = true;
                            END IF;
                        END IF;
                    END LOOP;
                    CLOSE dates_cursor;
                    IF (is_completed) THEN
                        status = 'COMPLETED';
                    ELSEIF (is_pending) THEN
                        status = 'PENDING';
                    ELSEIF (is_expired) THEN
                        status = 'EXPIRED';
                    ELSEIF (is_pastdue) THEN
                        status = 'PASTDUE';
                    END IF;
                END;
            $BODY$;

            ALTER FUNCTION alcs.get_current_status_for_noi_condition(uuid)
                OWNER TO postgres;
            `);
    }

}

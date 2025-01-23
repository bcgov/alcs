import { MigrationInterface, QueryRunner } from "typeorm";

export class AddingDateToNoiConditions1737585042507 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            WITH conditions AS
            (
                SELECT c.uuid, c.type_code, t.date_type, COUNT(d.uuid) AS dates_count
                FROM alcs.notice_of_intent_decision_condition c 
                INNER JOIN alcs.notice_of_intent_decision_condition_type t ON t.code = c.type_code
                LEFT OUTER JOIN alcs.notice_of_intent_decision_condition_date d ON d.condition_uuid = c.uuid
                WHERE 
                date_type = 'Single'
                GROUP BY c.uuid, c.type_code, t.date_type
                HAVING COUNT(d.uuid) = 0
            )
            INSERT INTO alcs.notice_of_intent_decision_condition_date 
            (
                audit_created_at,
                audit_updated_at,
                audit_created_by,
                date,
                comment,
                condition_uuid,
                completed_date
            )
            SELECT 
                now(),
                now(),
                'migration_seed',
                null,
                null,
                conditions.uuid,
                null
            FROM conditions;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // N/A
    }

}

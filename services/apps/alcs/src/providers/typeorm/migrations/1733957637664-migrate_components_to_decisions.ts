import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrateComponentsToDecisions1733957637664 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM alcs.migrations
            WHERE name = 'MigrateComponentsToDecisions1732917418215';`);
        await queryRunner.query(`
            WITH selected_components AS
            (
                SELECT
                uuid AS component_uuid,
                NOW() AS audit_created_at,
                NOW() AS audit_updated_at,
                'migration_seed' AS audit_created_by,
                'migration_seed' AS audit_updated_by, 
                'Migrated from component' AS description,
                'UEND' AS type_code,
                application_decision_uuid AS decision_uuid,
                CASE
                    WHEN expiry_date IS NOT NULL THEN expiry_date
                    WHEN end_date IS NOT NULL AND end_date2 IS NULL AND expiry_date IS NULL THEN end_date
                    WHEN end_date IS NULL AND end_date2 IS NOT NULL AND expiry_date IS NULL THEN end_date2
                    WHEN end_date IS NOT NULL AND end_date2 IS NOT NULL AND expiry_date IS NULL THEN
                    CASE
                        WHEN end_date >= end_date2 THEN end_date
                        ELSE end_date2
                    END
                END AS single_date
                FROM alcs.application_decision_component
                WHERE (end_date IS NOT NULL OR end_date2 IS NOT NULL OR expiry_date IS NOT NULL) AND audit_deleted_date_at IS NULL
            ),
            new_conditions AS (
                INSERT INTO alcs.application_decision_condition ("audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "description", "type_code", "decision_uuid")
                SELECT 
                "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "description", "type_code", "decision_uuid"
                FROM selected_components
                RETURNING uuid
            ),
            selected_components_rows AS (
                SELECT component_uuid, single_date, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn FROM selected_components
            ),
            new_conditions_rows AS (
                SELECT uuid AS condition_uuid, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn FROM new_conditions
            ),
			new_dates AS (				
				INSERT INTO alcs.application_decision_condition_date ("audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "condition_uuid", "date")
	            SELECT now(), now(), 'migration_seed', 'migration_seed', q2.condition_uuid, q1.single_date
	            FROM selected_components_rows q1
	            FULL OUTER JOIN new_conditions_rows q2
	            ON q1.rn = q2.rn
            )
            INSERT INTO alcs.application_decision_condition_component (application_decision_component_uuid, application_decision_condition_uuid)
            SELECT q1.component_uuid, q2.condition_uuid
            FROM selected_components_rows q1
            FULL OUTER JOIN new_conditions_rows q2
            ON q1.rn = q2.rn;
            `);
        await queryRunner.query(`
            WITH selected_components AS
            (
                SELECT
                uuid AS component_uuid,
                NOW() AS audit_created_at,
                NOW() AS audit_updated_at,
                'migration_seed' AS audit_created_by,
                'migration_seed' AS audit_updated_by, 
                'Migrated from component' AS description,
                'UEND' AS type_code,
                notice_of_intent_decision_uuid AS decision_uuid,
                CASE
                    WHEN expiry_date IS NOT NULL THEN expiry_date
                    WHEN end_date IS NOT NULL AND end_date2 IS NULL AND expiry_date IS NULL THEN end_date
                    WHEN end_date IS NULL AND end_date2 IS NOT NULL AND expiry_date IS NULL THEN end_date2
                    WHEN end_date IS NOT NULL AND end_date2 IS NOT NULL AND expiry_date IS NULL THEN
                    CASE
                        WHEN end_date >= end_date2 THEN end_date
                        ELSE end_date2
                    END
                END AS single_date
                FROM alcs.notice_of_intent_decision_component
                WHERE (end_date IS NOT NULL OR end_date2 IS NOT NULL OR expiry_date IS NOT NULL) AND audit_deleted_date_at IS NULL
            ),
            new_conditions AS (
                INSERT INTO alcs.notice_of_intent_decision_condition ("audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "description", "type_code", "decision_uuid")
                SELECT 
                "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "description", "type_code", "decision_uuid"
                FROM selected_components
                RETURNING uuid
            ),
            selected_components_rows AS (
                SELECT component_uuid, single_date, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn FROM selected_components
            ),
            new_conditions_rows AS (
                SELECT uuid AS condition_uuid, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS rn FROM new_conditions
            ),
			new_dates AS (				
				INSERT INTO alcs.notice_of_intent_decision_condition_date ("audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "condition_uuid", "date")
	            SELECT now(), now(), 'migration_seed', 'migration_seed', q2.condition_uuid, q1.single_date
	            FROM selected_components_rows q1
	            FULL OUTER JOIN new_conditions_rows q2
	            ON q1.rn = q2.rn
            )
            INSERT INTO alcs.notice_of_intent_decision_condition_component (notice_of_intent_decision_component_uuid, notice_of_intent_decision_condition_uuid)
            SELECT q1.component_uuid, q2.condition_uuid
            FROM selected_components_rows q1
            FULL OUTER JOIN new_conditions_rows q2
            ON q1.rn = q2.rn;
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // N/A
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class EndDateConditionTypes1733872207951 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
                INSERT INTO alcs.application_decision_condition_type (
                    "audit_created_at",
                    "audit_updated_at",
                    "audit_created_by",
                    "audit_updated_by",
                    "label",
                    "code",
                    "description",
                    "is_component_to_condition_checked",
                    "is_description_checked",
                    "is_administrative_fee_amount_checked",
                    "is_administrative_fee_amount_required",
                    "administrative_fee_amount",
                    "single_date_label",
                    "is_security_amount_checked",
                    "is_security_amount_required",
                    "is_active",
                    "is_date_checked",
                    "is_date_required",
                    "date_type"
                ) VALUES (
                    now(),
                    now(),
                    'migration_seed',
                    'migration_seed',
                    'Use End Date',
                    'UEND',
                    'The final date that the use is approved to. After this date, the approval expires.',
                    true,
                    true,
                    false,
                    null,
                    null,
                    'End Date',
                    false,
                    null,
                    true,
                    true,
                    false,
                    'Single'
                )
                ON CONFLICT (code) DO UPDATE 
                SET
                    "audit_created_at" = now(),
                    "audit_updated_at" = now(),
                    "audit_created_by" = 'migration_seed',
                    "audit_updated_by" = 'migration_seed',
                    "label" = 'Use End Date',
                    "description" = 'The final date that the use is approved to. After this date, the approval expires.',
                    "is_component_to_condition_checked" = true,
                    "is_description_checked" = true,
                    "is_administrative_fee_amount_checked" = false,
                    "is_administrative_fee_amount_required" = null,
                    "administrative_fee_amount" = null,
                    "single_date_label" = 'End Date',
                    "is_security_amount_checked" = false,
                    "is_security_amount_required" = null,
                    "is_active" = true,
                    "is_date_checked" = true,
                    "is_date_required" = false,
                    "date_type" = 'Single';
            `);
            await queryRunner.query(`
                INSERT INTO alcs.notice_of_intent_decision_condition_type (
                    "audit_created_at",
                    "audit_updated_at",
                    "audit_created_by",
                    "audit_updated_by",
                    "label",
                    "code",
                    "description",
                    "is_component_to_condition_checked",
                    "is_description_checked",
                    "is_administrative_fee_amount_checked",
                    "is_administrative_fee_amount_required",
                    "administrative_fee_amount",
                    "single_date_label",
                    "is_security_amount_checked",
                    "is_security_amount_required",
                    "is_active",
                    "is_date_checked",
                    "is_date_required",
                    "date_type"
                ) VALUES (
                    now(),
                    now(),
                    'migration_seed',
                    'migration_seed',
                    'Use End Date',
                    'UEND',
                    'The final date that the use is approved to. After this date, the approval expires.',
                    true,
                    true,
                    false,
                    null,
                    null,
                    'End Date',
                    false,
                    null,
                    true,
                    true,
                    false,
                    'Single'
                )
                ON CONFLICT (code) DO UPDATE 
                SET
                    "audit_created_at" = now(),
                    "audit_updated_at" = now(),
                    "audit_created_by" = 'migration_seed',
                    "audit_updated_by" = 'migration_seed',
                    "label" = 'Use End Date',
                    "description" = 'The final date that the use is approved to. After this date, the approval expires.',
                    "is_component_to_condition_checked" = true,
                    "is_description_checked" = true,
                    "is_administrative_fee_amount_checked" = false,
                    "is_administrative_fee_amount_required" = null,
                    "administrative_fee_amount" = null,
                    "single_date_label" = 'End Date',
                    "is_security_amount_checked" = false,
                    "is_security_amount_required" = null,
                    "is_active" = true,
                    "is_date_checked" = true,
                    "is_date_required" = false,
                    "date_type" = 'Single';
            `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // N/A
    }

}

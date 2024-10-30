import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedTagCategories1730244813395 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            INSERT INTO "alcs"."tag_category" ("audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "name") VALUES
            (NULL, NOW(), NULL, 'migration_seed', NULL, 'Residential'),
            (NULL, NOW(), NULL, 'migration_seed', NULL, 'Transportation'),
            (NULL, NOW(), NULL, 'migration_seed', NULL, 'Meat'),
            (NULL, NOW(), NULL, 'migration_seed', NULL, 'Energy Production'),
            (NULL, NOW(), NULL, 'migration_seed', NULL, 'Berries'),
            (NULL, NOW(), NULL, 'migration_seed', NULL, 'Alcohol'),
            (NULL, NOW(), NULL, 'migration_seed', NULL, 'Utilities');
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // N/A
    }

}

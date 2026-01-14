import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNrisInspectionId1763371960031 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "alcs"."compliance_and_enforcement_chronology_entry" ADD "nris_inspection_id" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class fixDuplicateBoardStatus1662659560119
  implements MigrationInterface
{
  name = 'fixDuplicateBoardStatus1662659560119';

  public async up(queryRunner: QueryRunner): Promise<void> {
    //Delete existing to clear duplicates
    await queryRunner.query(
      `DELETE FROM "board_status" WHERE board_uuid = 'd8c18278-cb41-474e-a180-534a101243ab'`,
    );

    //Re-insert a single set
    await queryRunner.query(`
      INSERT INTO "public"."board_status"
      ("uuid", "audit_deleted_date_at", "audit_created_at", "audit_updated_at", "audit_created_by", "audit_updated_by", "order", "board_uuid", "status_uuid") VALUES
       --- Executive Committee
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 0, 'd8c18278-cb41-474e-a180-534a101243ab', 'e6ddd1af-1cb9-4e45-962a-92e8d532b149'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 1, 'd8c18278-cb41-474e-a180-534a101243ab', 'fac4b88a-9c1a-41f4-885c-408ba6c095ec'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 2, 'd8c18278-cb41-474e-a180-534a101243ab', 'b9fc6416-95c3-40f9-9d32-5e7e3d1231b9'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 3, 'd8c18278-cb41-474e-a180-534a101243ab', 'aa5bb0f3-8e50-479c-8c99-105a6d3e2565'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 4, 'd8c18278-cb41-474e-a180-534a101243ab', '42384f47-d6d1-4b5e-ad9c-a66fc754dd52'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 5, 'd8c18278-cb41-474e-a180-534a101243ab', '64944bb8-f2f2-4709-9062-214f5c4d3187'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 6, 'd8c18278-cb41-474e-a180-534a101243ab', '5f233a50-97ec-44d3-af56-309f0cdeb29d'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 7, 'd8c18278-cb41-474e-a180-534a101243ab', 'f784320d-57bb-4021-bdca-203923c34dbe'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 8, 'd8c18278-cb41-474e-a180-534a101243ab', '1c70dd1f-4373-4999-818e-bffcaaa7f30b'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 9, 'd8c18278-cb41-474e-a180-534a101243ab', 'ddc41949-f3b7-40b0-88d3-d9f649836cd5'),
      (DEFAULT, DEFAULT, DEFAULT, DEFAULT, 'alcs-api', DEFAULT, 10, 'd8c18278-cb41-474e-a180-534a101243ab', 'b11c03b2-826a-4fbe-a469-f9c5768cf2c8');
    `);

    //Add constraint to prevent this in the future
    await queryRunner.query(
      `ALTER TABLE "board_status" ADD CONSTRAINT "UQ_3b9caa6927f2f478fa0778fd6d8" UNIQUE ("board_uuid", "status_uuid")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "board_status" DROP CONSTRAINT "UQ_3b9caa6927f2f478fa0778fd6d8"`,
    );
  }
}

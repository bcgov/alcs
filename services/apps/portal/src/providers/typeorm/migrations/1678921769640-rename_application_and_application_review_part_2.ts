import { MigrationInterface, QueryRunner } from 'typeorm';

export class renameApplicationAndApplicationReviewPart21678921769640
  implements MigrationInterface
{
  name = 'renameApplicationAndApplicationReviewPart21678921769640';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal" DROP CONSTRAINT "FK_0c826eba913d2983a4ef7a0af79"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal" DROP CONSTRAINT "FK_aa854b54da2bcb599ba88473c53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal_review" DROP CONSTRAINT "FK_325a8bf11bfc0f46f45069c3d1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_owner" DROP CONSTRAINT "FK_8104e51d0d9d1e920cd0f6df17c"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application_owner"."application_file_number" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_owner" ADD CONSTRAINT "FK_8104e51d0d9d1e920cd0f6df17c" FOREIGN KEY ("application_file_number") REFERENCES "portal"."application_proposal"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal" ADD CONSTRAINT "FK_85bf6ab2b82ea4a9193183d7b81" FOREIGN KEY ("created_by_uuid") REFERENCES "portal"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal" ADD CONSTRAINT "FK_51932ec80542280d17270d91a3a" FOREIGN KEY ("status_code") REFERENCES "portal"."application_status"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal_review" ADD CONSTRAINT "FK_90f819c3318121a8046b61006cf" FOREIGN KEY ("application_file_number") REFERENCES "portal"."application_proposal"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal_review" DROP CONSTRAINT "FK_90f819c3318121a8046b61006cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal" DROP CONSTRAINT "FK_51932ec80542280d17270d91a3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal" DROP CONSTRAINT "FK_85bf6ab2b82ea4a9193183d7b81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_owner" DROP CONSTRAINT "FK_8104e51d0d9d1e920cd0f6df17c"`,
    );
    await queryRunner.query(
      `COMMENT ON COLUMN "portal"."application_owner"."application_file_number" IS 'File Number generated by ALCS system'`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_owner" ADD CONSTRAINT "FK_8104e51d0d9d1e920cd0f6df17c" FOREIGN KEY ("application_file_number") REFERENCES "portal"."application_proposal"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal_review" ADD CONSTRAINT "FK_325a8bf11bfc0f46f45069c3d1e" FOREIGN KEY ("application_file_number") REFERENCES "portal"."application_proposal"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal" ADD CONSTRAINT "FK_aa854b54da2bcb599ba88473c53" FOREIGN KEY ("created_by_uuid") REFERENCES "portal"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_proposal" ADD CONSTRAINT "FK_0c826eba913d2983a4ef7a0af79" FOREIGN KEY ("status_code") REFERENCES "portal"."application_status"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}

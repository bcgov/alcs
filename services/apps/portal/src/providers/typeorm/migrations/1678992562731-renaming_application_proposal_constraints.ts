import { MigrationInterface, QueryRunner } from 'typeorm';

export class renamingApplicationProposalConstraints1678992562731
  implements MigrationInterface
{
  name = 'renamingApplicationProposalConstraints1678992562731';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_submission" DROP CONSTRAINT "FK_51932ec80542280d17270d91a3a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_submission" DROP CONSTRAINT "FK_85bf6ab2b82ea4a9193183d7b81"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_submission_review" DROP CONSTRAINT "FK_90f819c3318121a8046b61006cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_submission" ADD CONSTRAINT "FK_bf4913015d41f8bb129407e493e" FOREIGN KEY ("created_by_uuid") REFERENCES "portal"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_submission" ADD CONSTRAINT "FK_d2fb7c905282b86706cad8ef0ab" FOREIGN KEY ("status_code") REFERENCES "portal"."application_status"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_submission_review" ADD CONSTRAINT "FK_e7960826434a224230f23680d7a" FOREIGN KEY ("application_file_number") REFERENCES "portal"."application_submission"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "portal"."application_submission_review" DROP CONSTRAINT "FK_e7960826434a224230f23680d7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_submission" DROP CONSTRAINT "FK_d2fb7c905282b86706cad8ef0ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_submission" DROP CONSTRAINT "FK_bf4913015d41f8bb129407e493e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_submission_review" ADD CONSTRAINT "FK_90f819c3318121a8046b61006cf" FOREIGN KEY ("application_file_number") REFERENCES "portal"."application_submission"("file_number") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_submission" ADD CONSTRAINT "FK_85bf6ab2b82ea4a9193183d7b81" FOREIGN KEY ("created_by_uuid") REFERENCES "portal"."user"("uuid") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "portal"."application_submission" ADD CONSTRAINT "FK_51932ec80542280d17270d91a3a" FOREIGN KEY ("status_code") REFERENCES "portal"."application_status"("code") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}

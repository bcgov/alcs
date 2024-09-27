import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeAppTypeHtml1727461542081 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "alcs"."application_type" SET 
      "html_description"=CONCAT(html_description, '<p>If you need help selecting an application type, please <a target="_blank" href="https://www.alc.gov.bc.ca/contact/#lup">Contact Us</a>.</p>') 
       WHERE "html_description" is not null`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // N/A
  }
}

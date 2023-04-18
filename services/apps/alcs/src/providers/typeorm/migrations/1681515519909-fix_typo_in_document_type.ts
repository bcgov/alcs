import { MigrationInterface, QueryRunner } from 'typeorm';

export class oatsDocumentsImportPreparation1681515519909
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // fix code value in ALCS
    await queryRunner.query(`
        update "alcs"."application_document_code"
        set code = 'ACKL',
            oats_code = 'ACK'
        where code = 'ACK';
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // no
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class DistrictOfBarriere1712686499450 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // trim leading and trailing spaces in local government name
    await queryRunner.query(
      `
        UPDATE alcs.local_government 
        SET "name" = TRIM("name");
       `,
    );

    await queryRunner.query(
      `
        UPDATE
            alcs.application_submission
        SET
            local_government_uuid = (
            SELECT
                uuid
            FROM
                alcs.local_government lg
            WHERE
                lg."name" = 'District of Barriere'
            LIMIT 1)
        WHERE
            alcs.application_submission.file_number IN (
                '52375',
                '53090',
                '53091',
                '55749');
        `,
    );

    await queryRunner.query(
      `
          UPDATE
              alcs.application
          SET
              local_government_uuid = (
              SELECT
                  uuid
              FROM
                  alcs.local_government lg
              WHERE
                  lg."name" = 'District of Barriere'
              LIMIT 1)
          WHERE
              alcs.application.file_number IN (
                '52375',
                '53090',
                '53091',
                '55749');
          `,
    );
  }

  public async down(): Promise<void> {
    // no
  }
}

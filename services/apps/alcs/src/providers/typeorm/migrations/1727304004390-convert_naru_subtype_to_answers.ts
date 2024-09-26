import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertNaruSubtypeToAnswers1727304004390
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      update  alcs.application_submission as2
      set
          naru_will_have_additional_residence = case
              when as2.naru_subtype_code = 'ARFU' then true
          end,
          naru_will_be_over_five_hundred_m2 = case
              when as2.naru_subtype_code = 'PRIN' then true
          end
      where   as2.naru_subtype_code is not null
      and     as2.naru_subtype_code <> 'TOUR';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

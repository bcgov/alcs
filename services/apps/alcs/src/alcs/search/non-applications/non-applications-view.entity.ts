import {
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  ViewColumn,
  ViewEntity,
} from 'typeorm';
import { LocalGovernment } from '../../local-government/local-government.entity';

@ViewEntity({
  expression: `
        SELECT
        non_applications."uuid"
        ,non_applications."file_number"
        ,non_applications."applicant" 
        ,non_applications."type"
        ,non_applications."class"
        ,non_applications."local_government_uuid" as "local_government_uuid"
        ,non_applications."card_uuid"
        ,non_applications."board_code"
        FROM
        (
        SELECT
            cov.uuid AS "uuid",
            cov.file_number AS "file_number",
            "applicant",
            NULL AS "type",
            'COV' AS "class",
            cov.local_government_uuid AS "local_government_uuid",
            card.uuid AS "card_uuid",
            board.code AS "board_code"
        FROM
            alcs.covenant cov
        LEFT JOIN alcs.card card ON
            cov.card_uuid = card.uuid AND card.audit_deleted_date_at IS NULL
        LEFT JOIN alcs.board board ON
            board.uuid = card.board_uuid AND board.audit_deleted_date_at IS NULL
        WHERE cov.audit_deleted_date_at IS NULL
        UNION
        SELECT
            planning_review.uuid AS "uuid",
            planning_review.file_number AS "file_number",
            NULL AS "applicant",
            "type",
            'PLN' AS "class",
            planning_review.local_government_uuid AS "local_government_uuid",
            card.uuid AS "card_uuid",
            board.code AS "board_code"
        FROM
            alcs.planning_review planning_review 
        LEFT JOIN alcs.card card ON
            planning_review.card_uuid = card.uuid AND card.audit_deleted_date_at IS NULL
        LEFT JOIN alcs.board board ON
            board.uuid = card.board_uuid AND board.audit_deleted_date_at IS NULL
        WHERE planning_review.audit_deleted_date_at IS NULL
        ) AS non_applications
`,
})
export class NonApplicationSearchView {
  @ViewColumn()
  @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  applicant: string | null;

  @ViewColumn()
  type: string | null;

  @ViewColumn()
  localGovernmentUuid: string | null;

  @ViewColumn()
  class: 'COV' | 'PLN';

  @ViewColumn()
  cardUuid: string | null;

  @ViewColumn()
  boardCode: string | null;

  @ManyToOne(() => LocalGovernment, {
    nullable: true,
  })
  @JoinColumn({ name: 'local_government_uuid' })
  localGovernment: LocalGovernment | null;
}

import { DataSource, PrimaryColumn, ViewColumn, ViewEntity } from 'typeorm';
import { LocalGovernment } from '../../local-government/local-government.entity';
import { PlanningReferral } from '../../planning-review/planning-referral/planning-referral.entity';
import { PlanningReviewType } from '../../planning-review/planning-review-type.entity';
import { PlanningReview } from '../../planning-review/planning-review.entity';

@ViewEntity({
  expression: (datasource: DataSource) =>
    datasource
      .createQueryBuilder()
      .select('planning_review.uuid', 'uuid')
      .addSelect('planning_review.file_number', 'file_number')
      .addSelect('planning_review.open', 'open')
      .addSelect('planning_review.document_name', 'document_name')
      .addSelect('planning_referral.submission_date', 'date_submitted_to_alc')
      .addSelect(
        'planning_review.local_government_uuid',
        'local_government_uuid',
      )
      .addSelect('localGovernment.name', 'local_government_name')
      .addSelect('planning_review.type_code', 'planning_review_type_code')
      .addSelect('planning_review.region_code', 'region_code')
      .from(PlanningReview, 'planning_review')
      .innerJoinAndSelect(
        PlanningReviewType,
        'planningReviewType',
        'planning_review.type_code = planningReviewType.code',
      )
      .leftJoin(
        LocalGovernment,
        'localGovernment',
        'planning_review.local_government_uuid = localGovernment.uuid',
      )
      .leftJoinAndMapOne(
        'planning_review.planning_referral',
        (qb) => {
          return qb
            .subQuery()
            .select('planning_referral.uuid', 'planning_referral_uuid')
            .addSelect('planning_referral.submission_date', 'submission_date')
            .addSelect(
              'planning_referral.planning_review_uuid',
              'planning_review_uuid',
            )
            .from(PlanningReferral, 'planning_referral')
            .innerJoin(
              (qb) => {
                return qb
                  .subQuery()
                  .select('child.planning_review_uuid', 'planning_review_uuid')
                  .addSelect('MIN(child.audit_created_at)', 'audit_created_at')
                  .from(PlanningReferral, 'child')
                  .groupBy('child.planning_review_uuid');
              },
              'child',
              'planning_referral.audit_created_at = child.audit_created_at AND planning_referral.planning_review_uuid = child.planning_review_uuid',
            );
        },
        'planning_referral',
        'planning_review.uuid = planning_referral.planning_review_uuid',
      ),
})
export class PlanningReviewSearchView {
  @ViewColumn()
  @PrimaryColumn()
  uuid: string;

  @ViewColumn()
  regionCode?: string;

  @ViewColumn()
  open: boolean;

  @ViewColumn()
  fileNumber: string;

  @ViewColumn()
  documentName: string;

  @ViewColumn()
  localGovernmentUuid?: string;

  @ViewColumn()
  localGovernmentName?: string;

  @ViewColumn()
  dateSubmittedToAlc: number;

  @ViewColumn()
  planningReviewType_code: string;

  @ViewColumn({ name: 'planningReviewType_short_label' })
  planningReviewType_short_label: string;

  @ViewColumn({ name: 'planningReviewType_background_color' })
  planningReviewType_background_color: string;

  @ViewColumn({ name: 'planningReviewType_text_color' })
  planningReviewType_text_color: string;

  @ViewColumn({ name: 'planningReviewType_label' })
  planningReviewType_label: string;
}

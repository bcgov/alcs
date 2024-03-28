import { Entity } from 'typeorm';
import { BaseCodeEntity } from '../../../common/entities/base.code.entity';

@Entity({
  comment: 'Meetings Types for Planning Review Meetings',
})
export class PlanningReviewMeetingType extends BaseCodeEntity {
  constructor(data?: Partial<PlanningReviewMeetingType>) {
    super();
    if (data) {
      Object.assign(this, data);
    }
  }
}

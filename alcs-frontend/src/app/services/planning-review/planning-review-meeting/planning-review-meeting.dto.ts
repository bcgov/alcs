import { BaseCodeDto } from '../../../shared/dto/base.dto';

export interface PlanningReviewMeetingTypeDto extends BaseCodeDto {}

export interface PlanningReviewMeetingDto {
  uuid: string;
  type: PlanningReviewMeetingTypeDto;
  date: number;
  planningReviewUuid: string;
}

export interface UpdatePlanningReviewMeetingDto {
  typeCode: string;
  date: number;
}

export interface CreatePlanningReviewMeetingDto extends UpdatePlanningReviewMeetingDto {
  planningReviewUuid: string;
}

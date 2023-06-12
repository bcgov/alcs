import { ApplicationModificationDto } from '../application/application-modification/application-modification.dto';
import { ApplicationReconsiderationDto } from '../application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../application/application.dto';
import { CovenantDto } from '../covenant/covenant.dto';
import { NoticeOfIntentModificationDto } from '../notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentDto } from '../notice-of-intent/notice-of-intent.dto';
import { PlanningReviewDto } from '../planning-review/planning-review.dto';

export interface BoardDto {
  code: string;
  title: string;
  decisionMaker: string;
  statuses: BoardStatusDto[];
  allowedCardTypes: string[];
}

export interface BoardStatusDto {
  order: number;
  label: string;
  statusCode: string;
}

export interface CardsDto {
  applications: ApplicationDto[];
  reconsiderations: ApplicationReconsiderationDto[];
  planningReviews: PlanningReviewDto[];
  modifications: ApplicationModificationDto[];
  covenants: CovenantDto[];
  noticeOfIntents: NoticeOfIntentDto[];
  noiModifications: NoticeOfIntentModificationDto[];
}

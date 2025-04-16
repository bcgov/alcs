import { CardType } from '../../shared/card/card.component';
import { ApplicationModificationDto } from '../application/application-modification/application-modification.dto';
import { ApplicationReconsiderationDto } from '../application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../application/application.dto';
import { ApplicationDecisionConditionCardBoardDto } from '../application/decision/application-decision-v2/application-decision-v2.dto';
import { InquiryDto } from '../inquiry/inquiry.dto';
import { NoticeOfIntentDecisionConditionCardBoardDto } from '../notice-of-intent/decision-v2/notice-of-intent-decision.dto';
import { NoticeOfIntentModificationDto } from '../notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentDto } from '../notice-of-intent/notice-of-intent.dto';
import { NotificationDto } from '../notification/notification.dto';
import { PlanningReferralDto } from '../planning-review/planning-review.dto';

export interface MinimalBoardDto {
  code: string;
  title: string;
  showOnSchedule: boolean;
  hasAssigneeFilter: boolean;
  allowedCardTypes: CardType[];
}

export interface BoardDto extends MinimalBoardDto {
  statuses: BoardStatusDto[];
  createCardTypes: CardType[];
}

export interface BoardStatusDto {
  order: number;
  label: string;
  statusCode: string;
}

export interface CardsDto {
  board: BoardDto;
  applications: ApplicationDto[];
  reconsiderations: ApplicationReconsiderationDto[];
  planningReferrals: PlanningReferralDto[];
  modifications: ApplicationModificationDto[];
  noticeOfIntents: NoticeOfIntentDto[];
  noiModifications: NoticeOfIntentModificationDto[];
  notifications: NotificationDto[];
  inquiries: InquiryDto[];
  applicationDecisionConditions: ApplicationDecisionConditionCardBoardDto[];
  noticeOfIntentDecisionConditions: NoticeOfIntentDecisionConditionCardBoardDto[];
}

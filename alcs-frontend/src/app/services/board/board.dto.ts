import { CardType } from '../../shared/card/card.component';
import { ApplicationModificationDto } from '../application/application-modification/application-modification.dto';
import { ApplicationReconsiderationDto } from '../application/application-reconsideration/application-reconsideration.dto';
import { ApplicationDto } from '../application/application.dto';
import { CovenantDto } from '../covenant/covenant.dto';
import { NoticeOfIntentModificationDto } from '../notice-of-intent/notice-of-intent-modification/notice-of-intent-modification.dto';
import { NoticeOfIntentDto } from '../notice-of-intent/notice-of-intent.dto';
import { PlanningReviewDto } from '../planning-review/planning-review.dto';

export interface MinimalBoardDto {
  code: string;
  title: string;
  showOnSchedule: boolean;
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
  planningReviews: PlanningReviewDto[];
  modifications: ApplicationModificationDto[];
  covenants: CovenantDto[];
  noticeOfIntents: NoticeOfIntentDto[];
  noiModifications: NoticeOfIntentModificationDto[];
}
